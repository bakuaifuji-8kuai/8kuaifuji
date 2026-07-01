import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Snowflake, History } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { useStore } from '@/store/useStore';
import * as XLSX from 'xlsx';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface ExhibitionSummary {
  exhibitionName: string;
  implementUnit: string;
  outboundCount: number;
  outboundQuantity: number;
  returnCount: number;
  returnQuantity: number;
  productCount: number;
  outboundOrders: any[];
  returnOrders: any[];
  isFrozen: boolean;
}

const IMPLEMENT_UNITS = ['会展服务部', '工程技术部', '市场部', '综合管理部'];

const helpContent = {
  title: '展会物资领用报表 - 功能操作说明',
  description: '按展会+实施单位维度统计展会物资领用数据；支持导出报表和展会冻结管理',
  sections: [
    {
      heading: '数据筛选',
      items: [
        '可按展会筛选特定展会的领用数据',
        '可按日期范围筛选出库单日期内的数据',
      ]
    },
    {
      heading: '报表数据说明',
      items: [
        '以展会名称+实施单位为维度汇总统计物资领用情况',
        '领用总数量：展会出库单出库数量汇总（已确认出库）',
        '归还总数量：退库单归还数量汇总（已确认入库）',
        '差异 = 领用总数量 - 归还总数量（即在用数）',
        '已冻结展会在展会名称旁显示"已冻结"标签',
      ]
    },
    {
      heading: '冻结功能说明',
      items: [
        '点击"冻结展会物料领用"按钮可批量冻结展会',
        '冻结操作会限制展会关联的业务操作',
        '已冻结展会的出库单无法编辑、删除或确认出库',
        '已冻结展会的出库单无法发起归还入库',
        '已冻结展会的归还入库单无法提交或确认入库',
        '点击列表中的"冻结"按钮可单独冻结某个展会',
        '点击"解冻展会"按钮可解冻已冻结的展会',
        '点击"操作日志"按钮可查看所有冻结/解冻操作记录',
      ]
    },
    {
      heading: '其他操作',
      items: [
        '点击"查看详情"按钮跳转到详情页查看展会关联订单明细',
        '点击"导出Excel"按钮导出当前筛选结果',
      ]
    }
  ]
};
export default function ExhibitionRequisitionReport() {
  const navigate = useNavigate();
  const { outboundOrders, returnOrders, products, workOrderConfigs, frozenExhibitions, freezeLogs, freezeExhibitions, unfreezeExhibitions, currentUser } = useStore();
  const [filterExhibition, setFilterExhibition] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    exhibition: '',
    startDate: '',
    endDate: '',
  });
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [unfreezeModalOpen, setUnfreezeModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedExhibitionNames, setSelectedExhibitionNames] = useState<string[]>([]);
  const [freezeRemark, setFreezeRemark] = useState('');
  const [unfreezeRemark, setUnfreezeRemark] = useState('');
  const [freezeSearchKeyword, setFreezeSearchKeyword] = useState('');
  const [unfreezeSearchKeyword, setUnfreezeSearchKeyword] = useState('');

  const reportData = useMemo(() => {
    const exhibitionOutboundOrders = outboundOrders.filter(
      o => o.type === 'exhibition' && o.status === 'confirmed'
    );

    const confirmedReturnOrders = returnOrders.filter(
      r => r.type === 'return' && r.status === 'confirmed'
    );

    const summaryMap = new Map<string, ExhibitionSummary>();

    const getKey = (exhibitionName: string, implementUnit: string) => `${exhibitionName}__${implementUnit}`;

    exhibitionOutboundOrders.forEach(order => {
      const orderDate = order.createTime?.slice(0, 10) || '';

      if (appliedFilter.startDate && orderDate < appliedFilter.startDate) return;
      if (appliedFilter.endDate && orderDate > appliedFilter.endDate) return;

      const implementUnit = (order as any).implementUnit || '';
      
      let exhibitionName = '';
      const firstDetail = order.details[0];
      if (firstDetail && (firstDetail as any).workOrderId) {
        const config = workOrderConfigs.find(c => c.workOrderId === (firstDetail as any).workOrderId);
        exhibitionName = config?.exhibitionName || '';
      }

      if (!exhibitionName) return;

      const totalQty = order.details.reduce((a: number, b: any) => a + (b.quantity || 0), 0);
      const key = getKey(exhibitionName, implementUnit);
      const existing = summaryMap.get(key);
      
      if (existing) {
        existing.outboundCount += 1;
        existing.outboundQuantity += totalQty;
        existing.outboundOrders.push(order);
      } else {
        summaryMap.set(key, {
          exhibitionName,
          implementUnit,
          outboundCount: 1,
          outboundQuantity: totalQty,
          returnCount: 0,
          returnQuantity: 0,
          productCount: 0,
          outboundOrders: [order],
          returnOrders: [],
          isFrozen: false,
        });
      }
    });

    confirmedReturnOrders.forEach(returnOrder => {
      const sourceOrder = exhibitionOutboundOrders.find(o => o.id === returnOrder.sourceOrderId);
      if (!sourceOrder) return;

      const returnDate = returnOrder.createTime?.slice(0, 10) || '';
      if (appliedFilter.startDate && returnDate < appliedFilter.startDate) return;
      if (appliedFilter.endDate && returnDate > appliedFilter.endDate) return;

      const implementUnit = (sourceOrder as any).implementUnit || '';
      
      let exhibitionName = '';
      const firstDetail = sourceOrder.details[0];
      if (firstDetail && (firstDetail as any).workOrderId) {
        const config = workOrderConfigs.find(c => c.workOrderId === (firstDetail as any).workOrderId);
        exhibitionName = config?.exhibitionName || '';
      }

      if (!exhibitionName) return;

      const totalQty = returnOrder.details.reduce((a: number, b: any) => a + (b.quantity || 0), 0);
      const key = getKey(exhibitionName, implementUnit);
      const existing = summaryMap.get(key);
      
      if (existing) {
        existing.returnCount += 1;
        existing.returnQuantity += totalQty;
        existing.returnOrders.push(returnOrder);
      } else {
        summaryMap.set(key, {
          exhibitionName,
          implementUnit,
          outboundCount: 0,
          outboundQuantity: 0,
          returnCount: 1,
          returnQuantity: totalQty,
          productCount: 0,
          outboundOrders: [],
          returnOrders: [returnOrder],
          isFrozen: false,
        });
      }
    });

    summaryMap.forEach(summary => {
      const productSet = new Set<string>();
      summary.outboundOrders.forEach(order => {
        order.details.forEach((d: any) => {
          if (d.productId) productSet.add(d.productId);
        });
      });
      summary.returnOrders.forEach(order => {
        order.details.forEach((d: any) => {
          if (d.productId) productSet.add(d.productId);
        });
      });
      summary.productCount = productSet.size;
      summary.isFrozen = frozenExhibitions.some(f => f.exhibitionName === summary.exhibitionName);
    });

    let result = Array.from(summaryMap.values());

    if (appliedFilter.exhibition) {
      result = result.filter(item => item.exhibitionName === appliedFilter.exhibition);
    }

    return result;
  }, [outboundOrders, returnOrders, appliedFilter, workOrderConfigs, frozenExhibitions]);
  
  const totalGroups = reportData.length;
  const totalOutbound = reportData.reduce((sum, d) => sum + d.outboundQuantity, 0);
  const totalReturn = reportData.reduce((sum, d) => sum + d.returnQuantity, 0);
  const totalDiff = totalOutbound - totalReturn;

  const columns: ColumnDef<ExhibitionSummary, unknown>[] = [
    {
      accessorKey: 'exhibitionName',
      header: '展会名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TextButton
            onClick={() => {
              const params = new URLSearchParams();
              params.set('exhibition', row.original.exhibitionName);
              params.set('implementUnit', row.original.implementUnit);
              navigate(`/report/exhibition-requisition-detail?${params.toString()}`);
            }}
            className="!p-0 !h-auto"
          >
            {row.original.exhibitionName || '-'}
          </TextButton>
          {row.original.isFrozen && (
            <Badge variant="warning" className="text-xs">
              已冻结
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'implementUnit',
      header: '实施单位',
      cell: ({ row }) => row.original.implementUnit || '-',
    },
    {
      accessorKey: 'outboundCount',
      header: '领用单数',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.outboundCount}</span>
      ),
    },
    {
      accessorKey: 'outboundQuantity',
      header: '领用总数量',
      cell: ({ row }) => (
        <span className="text-blue-600 font-medium">{row.original.outboundQuantity}</span>
      ),
    },
    {
      accessorKey: 'returnCount',
      header: '归还单数',
      cell: ({ row }) => row.original.returnCount,
    },
    {
      accessorKey: 'returnQuantity',
      header: '归还总数量',
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">{row.original.returnQuantity}</span>
      ),
    },
    {
      accessorKey: 'productCount',
      header: '物料种类',
      cell: ({ row }) => row.original.productCount,
    },
    {
      id: 'diff',
      header: '在用数',
      cell: ({ row }) => {
        const diff = row.original.outboundQuantity - row.original.returnQuantity;
        return (
          <span className={diff > 0 ? 'text-orange-600' : diff < 0 ? 'text-red-600' : 'text-slate-500'}>
            {diff > 0 ? '+' : ''}{diff}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TextButton
            onClick={() => {
              const params = new URLSearchParams();
              params.set('exhibition', row.original.exhibitionName);
              params.set('implementUnit', row.original.implementUnit);
              navigate(`/report/exhibition-requisition-detail?${params.toString()}`);
            }}
          >
            查看详情
          </TextButton>
          {row.original.isFrozen ? (
            <TextButton
              type="warning"
              onClick={() => {
                setSelectedExhibitionNames([row.original.exhibitionName]);
                setUnfreezeRemark('');
                setUnfreezeModalOpen(true);
              }}
            >
              解冻
            </TextButton>
          ) : (
            <TextButton
              onClick={() => {
                setSelectedExhibitionNames([row.original.exhibitionName]);
                setFreezeRemark('');
                setFreezeModalOpen(true);
              }}
            >
              冻结
            </TextButton>
          )}
        </div>
      ),
    },
  ];
  
  const exhibitionOptions = useMemo(() => {
    const set = new Set<string>();
    outboundOrders
      .filter(o => o.type === 'exhibition' && o.status === 'confirmed')
      .forEach(order => {
        const firstDetail = order.details[0];
        if (firstDetail && (firstDetail as any).workOrderId) {
          const config = workOrderConfigs.find(c => c.workOrderId === (firstDetail as any).workOrderId);
          if (config?.exhibitionName) {
            set.add(config.exhibitionName);
          }
        }
      });
    return Array.from(set).map(name => ({ value: name, label: name }));
  }, [outboundOrders, workOrderConfigs]);

  const handleExport = () => {
    if (reportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const exportData = reportData.map(item => ({
      '展会名称': item.exhibitionName || '-',
      '实施单位': item.implementUnit || '-',
      '领用单数': item.outboundCount,
      '领用总数量': item.outboundQuantity,
      '归还单数': item.returnCount,
      '归还总数量': item.returnQuantity,
      '物料种类': item.productCount,
      '在用数': item.outboundQuantity - item.returnQuantity,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '展会物资领用报表');
    XLSX.writeFile(wb, `展会物资领用报表_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const allExhibitions = useMemo(() => {
    const map = new Map<string, { exhibitionName: string; isFrozen: boolean }>();
    reportData.forEach(item => {
      if (item.exhibitionName && !map.has(item.exhibitionName)) {
        map.set(item.exhibitionName, {
          exhibitionName: item.exhibitionName,
          isFrozen: item.isFrozen,
        });
      }
    });
    return Array.from(map.values());
  }, [reportData]);

  const unfreezableExhibitions = useMemo(() => {
    return allExhibitions.filter(e => e.isFrozen);
  }, [allExhibitions]);

  const freezableExhibitions = useMemo(() => {
    return allExhibitions.filter(e => !e.isFrozen);
  }, [allExhibitions]);

  const filteredFreezeExhibitions = useMemo(() => {
    if (!freezeSearchKeyword) return freezableExhibitions;
    const keyword = freezeSearchKeyword.toLowerCase();
    return freezableExhibitions.filter(e =>
      e.exhibitionName.toLowerCase().includes(keyword)
    );
  }, [freezableExhibitions, freezeSearchKeyword]);

  const filteredUnfreezeExhibitions = useMemo(() => {
    if (!unfreezeSearchKeyword) return unfreezableExhibitions;
    const keyword = unfreezeSearchKeyword.toLowerCase();
    return unfreezableExhibitions.filter(e =>
      e.exhibitionName.toLowerCase().includes(keyword)
    );
  }, [unfreezableExhibitions, unfreezeSearchKeyword]);

  const handleOpenFreezeModal = () => {
    setSelectedExhibitionNames([]);
    setFreezeRemark('');
    setFreezeSearchKeyword('');
    setFreezeModalOpen(true);
  };

  const handleOpenUnfreezeModal = () => {
    setSelectedExhibitionNames([]);
    setUnfreezeRemark('');
    setUnfreezeSearchKeyword('');
    setUnfreezeModalOpen(true);
  };

  const handleConfirmFreeze = () => {
    if (selectedExhibitionNames.length === 0) {
      alert('请选择要冻结的展会');
      return;
    }
    freezeExhibitions(selectedExhibitionNames, currentUser.name, freezeRemark || undefined);
    setFreezeModalOpen(false);
    setSelectedExhibitionNames([]);
  };

  const handleConfirmUnfreeze = () => {
    if (selectedExhibitionNames.length === 0) {
      alert('请选择要解冻的展会');
      return;
    }
    unfreezeExhibitions(selectedExhibitionNames, currentUser.name, unfreezeRemark || undefined);
    setUnfreezeModalOpen(false);
    setSelectedExhibitionNames([]);
  };

  const toggleExhibitionSelection = (exhibitionName: string) => {
    setSelectedExhibitionNames(prev =>
      prev.includes(exhibitionName)
        ? prev.filter(n => n !== exhibitionName)
        : [...prev, exhibitionName]
    );
  };

  const toggleSelectAll = (exhibitions: { exhibitionName: string }[]) => {
    if (selectedExhibitionNames.length === exhibitions.length) {
      setSelectedExhibitionNames([]);
    } else {
      setSelectedExhibitionNames(exhibitions.map(e => e.exhibitionName));
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">展会物资领用报表</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <div className="flex items-center gap-2">
          <PrimaryButton onClick={handleOpenFreezeModal}>
            <Snowflake size={16} />
            冻结展会物料领用
          </PrimaryButton>
          <DefaultButton onClick={handleOpenUnfreezeModal}>
            解冻展会
          </DefaultButton>
          <DefaultButton onClick={() => setLogModalOpen(true)}>
            <History size={16} />
            操作日志
          </DefaultButton>
          <DefaultButton onClick={handleExport}>
            <Download size={16} />
            导出
          </DefaultButton>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setAppliedFilter({
            exhibition: filterExhibition,
            startDate: filterStartDate,
            endDate: filterEndDate,
          })
        }
        onReset={() => {
          setFilterExhibition('');
          setFilterStartDate('');
          setFilterEndDate('');
          setAppliedFilter({
            exhibition: '',
            startDate: '',
            endDate: '',
          });
        }}
      >
        <SearchField
          label="展会"
          type="select"
          options={exhibitionOptions}
          value={filterExhibition}
          onChange={setFilterExhibition}
          placeholder="全部展会"
        />
        <SearchField
          label="开始日期"
          type="date"
          value={filterStartDate}
          onChange={setFilterStartDate}
        />
        <SearchField
          label="结束日期"
          type="date"
          value={filterEndDate}
          onChange={setFilterEndDate}
        />
      </SearchBar>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">汇总组数</p>
          <p className="text-2xl font-bold text-slate-900">{totalGroups}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">领用总数量</p>
          <p className="text-2xl font-bold text-blue-600">{totalOutbound}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">归还总数量</p>
          <p className="text-2xl font-bold text-green-600">{totalReturn}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">在用数</p>
          <p className="text-2xl font-bold text-orange-600">{totalDiff}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={reportData} columns={columns} pageSize={15} />
      </div>
      <Modal
        open={freezeModalOpen}
        onClose={() => setFreezeModalOpen(false)}
        title="冻结展会物料领用"
        size="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择要冻结的展会（可多选）
            </label>
            <input
              type="text"
              placeholder="搜索展会名称"
              value={freezeSearchKeyword}
              onChange={(e) => setFreezeSearchKeyword(e.target.value)}
              className="w-full mb-3 h-9 px-3 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 rounded-lg focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-200 transition-all duration-200 bg-white"
            />
            <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
              <div className="sticky top-0 bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filteredFreezeExhibitions.length > 0 && selectedExhibitionNames.length === filteredFreezeExhibitions.length}
                  onChange={() => toggleSelectAll(filteredFreezeExhibitions)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-600">
                  全选（{selectedExhibitionNames.length}/{filteredFreezeExhibitions.length}）
                </span>
              </div>
              {filteredFreezeExhibitions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  暂无可冻结的展会
                </div>
              ) : (
                filteredFreezeExhibitions.map(exhibition => (
                  <div
                    key={exhibition.exhibitionName}
                    className="px-3 py-2 border-b border-slate-100 last:border-b-0 flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleExhibitionSelection(exhibition.exhibitionName)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedExhibitionNames.includes(exhibition.exhibitionName)}
                      onChange={() => toggleExhibitionSelection(exhibition.exhibitionName)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{exhibition.exhibitionName}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              冻结原因（选填）
            </label>
            <textarea
              value={freezeRemark}
              onChange={(e) => setFreezeRemark(e.target.value)}
              placeholder="请输入冻结原因..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <DefaultButton onClick={() => setFreezeModalOpen(false)}>
              取消
            </DefaultButton>
            <PrimaryButton onClick={handleConfirmFreeze}>
              确定冻结
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={unfreezeModalOpen}
        onClose={() => setUnfreezeModalOpen(false)}
        title="解冻展会"
        size="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择要解冻的展会（可多选）
            </label>
            <input
              type="text"
              placeholder="搜索展会名称"
              value={unfreezeSearchKeyword}
              onChange={(e) => setUnfreezeSearchKeyword(e.target.value)}
              className="w-full mb-3 h-9 px-3 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 rounded-lg focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-200 transition-all duration-200 bg-white"
            />
            <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
              <div className="sticky top-0 bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filteredUnfreezeExhibitions.length > 0 && selectedExhibitionNames.length === filteredUnfreezeExhibitions.length}
                  onChange={() => toggleSelectAll(filteredUnfreezeExhibitions)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-600">
                  全选（{selectedExhibitionNames.length}/{filteredUnfreezeExhibitions.length}）
                </span>
              </div>
              {filteredUnfreezeExhibitions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  暂无已冻结的展会
                </div>
              ) : (
                filteredUnfreezeExhibitions.map(exhibition => (
                  <div
                    key={exhibition.exhibitionName}
                    className="px-3 py-2 border-b border-slate-100 last:border-b-0 flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleExhibitionSelection(exhibition.exhibitionName)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedExhibitionNames.includes(exhibition.exhibitionName)}
                      onChange={() => toggleExhibitionSelection(exhibition.exhibitionName)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{exhibition.exhibitionName}</div>
                    </div>
                    <Badge variant="warning" className="text-xs">已冻结</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              解冻原因（选填）
            </label>
            <textarea
              value={unfreezeRemark}
              onChange={(e) => setUnfreezeRemark(e.target.value)}
              placeholder="请输入解冻原因..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <DefaultButton onClick={() => setUnfreezeModalOpen(false)}>
              取消
            </DefaultButton>
            <PrimaryButton onClick={handleConfirmUnfreeze}>
              确定解冻
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="冻结操作日志"
        size="max-w-3xl"
      >
        <div className="space-y-3">
          {freezeLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              暂无操作日志
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {freezeLogs.map(log => (
                <div key={log.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.operateType === 'freeze' ? 'warning' : 'success'} className="text-xs">
                        {log.operateType === 'freeze' ? '冻结' : '解冻'}
                      </Badge>
                      <span className="text-sm font-medium text-slate-700">
                        {log.operator}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{log.operateTime}</span>
                  </div>
                  <div className="text-sm text-slate-600 mb-1">
                    <span className="text-slate-500">操作展会：</span>
                    {log.exhibitionNames.join('、')}
                  </div>
                  {log.remark && (
                    <div className="text-sm text-slate-600">
                      <span className="text-slate-500">备注：</span>
                      {log.remark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-3 border-t">
            <DefaultButton onClick={() => setLogModalOpen(false)}>
              关闭
            </DefaultButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
