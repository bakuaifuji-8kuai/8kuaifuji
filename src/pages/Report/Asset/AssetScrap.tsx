import { useMemo, useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { Plus, Trash2, Clock, CheckCircle2, DollarSign, Printer, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface ScrapDetail {
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  originalValue: number;
  warehouseId: string;
  warehouseName: string;
}

interface AssetScrap {
  id: string;
  scrapNo: string;
  details: ScrapDetail[];
  scrapType: 'full' | 'partial';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  remark: string;
  applicant: string;
  applyDate: string;
  approver?: string;
  approveTime?: string;
  approveRemark?: string;
  outConfirmer?: string;
  outConfirmTime?: string;
}

const generateScrapNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCBF${dateStr}${random}`;
};

const initialData: AssetScrap[] = [
  {
    id: 'AS001',
    scrapNo: 'ZCBF20240601001',
    details: [
      {
        assetId: 'AE001',
        assetCode: 'SB20240001',
        assetName: '数控车床',
        specification: 'CJK6136',
        unit: '台',
        quantity: 1,
        originalValue: 150000,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    scrapType: 'full',
    status: 'pending',
    reason: '设备老化，无法正常使用',
    remark: '使用年限已达8年',
    applicant: '张三',
    applyDate: '2024-06-01 09:30',
  },
  {
    id: 'AS002',
    scrapNo: 'ZCBF20240602001',
    details: [
      {
        assetId: 'AE002',
        assetCode: 'SB20240002',
        assetName: '铣床',
        specification: 'X5032',
        unit: '台',
        quantity: 1,
        originalValue: 85000,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    scrapType: 'partial',
    status: 'approved',
    reason: '损坏严重，无法修复',
    remark: '运输途中损坏',
    applicant: '李四',
    applyDate: '2024-06-02 14:20',
    approver: '王经理',
    approveTime: '2024-06-03 10:00',
    approveRemark: '同意报废',
  },
  {
    id: 'AS003',
    scrapNo: 'ZCBF20240603001',
    details: [
      {
        assetId: 'AE005',
        assetCode: 'SB20240005',
        assetName: '叉车',
        specification: 'CPCD30',
        unit: '辆',
        quantity: 1,
        originalValue: 68000,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    scrapType: 'full',
    status: 'rejected',
    reason: '外观老旧',
    remark: '想更换新的',
    applicant: '王五',
    applyDate: '2024-06-03 10:00',
    approver: '王经理',
    approveTime: '2024-06-03 15:30',
    approveRemark: '可以继续使用，不同意报废',
  },
  {
    id: 'AS004',
    scrapNo: 'ZCBF20240605001',
    details: [
      {
        assetId: 'AE007',
        assetCode: 'SB20240007',
        assetName: '钻床',
        specification: 'Z516',
        unit: '台',
        quantity: 1,
        originalValue: 12000,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    scrapType: 'full',
    status: 'approved',
    reason: '主轴损坏，维修成本过高',
    remark: '维修需要8000元，建议报废',
    applicant: '张三',
    applyDate: '2024-06-05 11:00',
    approver: '李总监',
    approveTime: '2024-06-06 09:00',
    approveRemark: '同意报废处理',
  },
];

export default function AssetScrap() {
  const { assetEquipments, updateAssetEquipment, warehouses } = useStore();
  const [data, setData] = useState<AssetScrap[]>(initialData);

  const [filterNo, setFilterNo] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({
    no: '',
    assetName: '',
    status: '',
    from: '',
    to: '',
  });

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (applied.no && !o.scrapNo.includes(applied.no)) return false;
      if (applied.assetName && !o.details.some((d) => d.assetName.includes(applied.assetName))) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.applyDate < applied.from) return false;
      if (applied.to && o.applyDate > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [data, applied]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthCount = data.filter((d) => d.applyDate.startsWith(monthStr)).length;
    const pendingCount = data.filter((d) => d.status === 'pending').length;
    const approvedCount = data.filter((d) => d.status === 'approved').length;
    const totalAmount = data
      .filter((d) => d.status === 'approved')
      .reduce((sum, d) => sum + d.details.reduce((s, det) => s + det.originalValue, 0), 0);
    return { monthCount, pendingCount, approvedCount, totalAmount };
  }, [data]);

  const fixedAssetWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.category === 'fixed_asset' && w.status === 'enabled');
  }, [warehouses]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const inUseAssets = useMemo(() => {
    return assetEquipments.filter((a) => {
      if (a.status !== 'in_use') return false;
      if (selectedWarehouseId && a.warehouseId !== selectedWarehouseId) return false;
      return true;
    });
  }, [assetEquipments, selectedWarehouseId]);

  const [assetFilterCode, setAssetFilterCode] = useState('');
  const [assetFilterName, setAssetFilterName] = useState('');
  const [assetFilterSpec, setAssetFilterSpec] = useState('');

  const filteredAssets = useMemo(() => {
    return inUseAssets.filter((a) => {
      if (assetFilterCode && !a.code.toLowerCase().includes(assetFilterCode.toLowerCase())) return false;
      if (assetFilterName && !a.name.toLowerCase().includes(assetFilterName)) return false;
      if (assetFilterSpec && !a.specification.toLowerCase().includes(assetFilterSpec.toLowerCase())) return false;
      return true;
    });
  }, [inUseAssets, assetFilterCode, assetFilterName, assetFilterSpec]);

  useEffect(() => {
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  }, [fixedAssetWarehouses]);

  const statusText = (s: string) => {
    if (s === 'pending') return '待出库';
    if (s === 'approved') return '已出库';
    if (s === 'rejected') return '已驳回';
    return s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-[#e6a23c]';
    if (s === 'approved') return 'text-[#67c23a]';
    if (s === 'rejected') return 'text-[#f56c6c]';
    return '';
  };

  const scrapTypeText = (t: string) => {
    return t === 'full' ? '全部报废' : '部分报废';
  };

  const columns: ColumnDef<AssetScrap>[] = [
    { key: 'scrapNo', title: '报废单号' },
    {
      key: 'totalQuantity',
      title: '数量',
      align: 'right',
      render: (row) => row.details.reduce((s, d) => s + d.quantity, 0),
    },
    {
      key: 'totalValue',
      title: '原值合计',
      align: 'right',
      render: (row) => `¥${row.details.reduce((s, d) => s + d.originalValue, 0).toLocaleString()}`,
    },
    {
      key: 'scrapType',
      title: '报废类型',
      render: (row) => scrapTypeText(row.scrapType),
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'applyDate', title: '申请日期' },
    {
      key: 'itemCount',
      title: '明细数',
      align: 'right',
      render: (row) => row.details.length,
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => handlePrint(row)}>
            <Printer size={12} /> 打印
          </TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  const cloned = JSON.parse(JSON.stringify(row));
                  setEditItem(cloned);
                  setEditDetails(cloned.details);
                }}
              >
                编辑
              </TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.scrapNo}？`)) {
                    setData(data.filter((d) => d.id !== row.id));
                  }
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleOutConfirm(row.id)}>确认出库</TextButton>
              <TextButton type="danger" onClick={() => handleReject(row.id)}>
                驳回
              </TextButton>
            </>
          )}
          {row.status === 'approved' && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const handleReverseConfirm = (id: string) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (!confirm(`确认反确认报废单 ${item.scrapNo}？反确认后单据将回退到待出库状态，资产状态将恢复为领用中。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'pending',
              outConfirmer: undefined,
              outConfirmTime: undefined,
            }
          : d
      )
    );

    item.details.forEach((detail) => {
      updateAssetEquipment(detail.assetId, { status: 'in_use' });
    });

    alert(`反确认成功！报废单 ${item.scrapNo} 已回退到待出库状态。`);
  };

  const [viewItem, setViewItem] = useState<AssetScrap | null>(null);

  const [editItem, setEditItem] = useState<AssetScrap | null>(null);
  const [editDetails, setEditDetails] = useState<ScrapDetail[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const openAdd = () => {
    const newItem: AssetScrap = {
      id: 'AS' + Date.now(),
      scrapNo: generateScrapNo(),
      details: [],
      scrapType: 'full',
      status: 'pending',
      reason: '',
      remark: '',
      applicant: '当前用户',
      applyDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setIsNew(true);
    setEditItem(newItem);
    setEditDetails([]);
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  };

  const [pickerSelectedIds, setPickerSelectedIds] = useState<string[]>([]);

  const togglePickerAsset = (assetId: string) => {
    setPickerSelectedIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const togglePickerSelectAll = () => {
    if (pickerSelectedIds.length === filteredAssets.length) {
      setPickerSelectedIds([]);
    } else {
      setPickerSelectedIds(filteredAssets.map((a) => a.id));
    }
  };

  const addSelectedAssets = () => {
    if (!editItem || pickerSelectedIds.length === 0) {
      setAssetPickerOpen(false);
      return;
    }
    const newDetails = pickerSelectedIds
      .map((id) => {
        const asset = filteredAssets.find((a) => a.id === id);
        if (!asset) return null;
        const warehouse = warehouses.find((w) => w.id === asset.warehouseId);
        return {
          assetId: asset.id,
          assetCode: asset.code,
          assetName: asset.name,
          specification: asset.specification || '',
          unit: asset.unit,
          quantity: 1,
          originalValue: asset.amount,
          warehouseId: asset.warehouseId || '',
          warehouseName: warehouse?.name || '',
        } as ScrapDetail;
      })
      .filter((d): d is ScrapDetail => d !== null);

    setEditDetails([...editDetails, ...newDetails]);
    setPickerSelectedIds([]);
    setAssetPickerOpen(false);
  };

  const removeDetail = (index: number) => {
    setEditDetails(editDetails.filter((_, i) => i !== index));
  };

  const updateDetailQuantity = (index: number, value: number) => {
    if (value < 1) return;
    setEditDetails(editDetails.map((d, i) => (i === index ? { ...d, quantity: value } : d)));
  };

  const handleSave = () => {
    if (!editItem) return;
    if (editDetails.length === 0) {
      alert('请至少选择一项资产');
      return;
    }
    if (editDetails.some((d) => d.quantity < 1)) {
      alert('每项资产数量必须大于等于1');
      return;
    }
    if (!editItem.reason) {
      alert('请填写报废原因');
      return;
    }
    const toSave: AssetScrap = { ...editItem, details: editDetails };
    if (isNew) {
      setData([toSave, ...data]);
    } else {
      setData(data.map((d) => (d.id === editItem.id ? toSave : d)));
    }
    setEditItem(null);
    setEditDetails([]);
  };

  const handleOutConfirm = (id: string) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (item.status !== 'pending') return;
    if (!confirm(`确认出库 ${item.scrapNo}？确认后单据状态将变更为已出库，资产状态将变更为已报废。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'approved',
              outConfirmer: '当前用户',
              outConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : d
      )
    );

    if (item.scrapType === 'full') {
      item.details.forEach((detail) => {
        updateAssetEquipment(detail.assetId, { status: 'scrapped' });
      });
    }
  };

  const handleReject = (id: string) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (item.status !== 'pending') return;
    const remark = prompt('请输入驳回原因：');
    if (remark === null) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'rejected',
              approver: '当前用户',
              approveTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              approveRemark: remark,
            }
          : d
      )
    );
  };

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printItem, setPrintItem] = useState<AssetScrap | null>(null);

  const handlePrint = (row: AssetScrap) => {
    setViewItem(null);
    setPrintItem(row);
    setPrintTrigger((prev) => prev + 1);
  };

  const helpContent = {
    title: '资产报废功能说明',
    description: '资产报废用于对达到使用年限或无法修复的固定资产进行报废处理，支持多选资产批量报废，确认出库后单据状态变更为已出库，资产状态变更为已报废。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增报废单"按钮',
          '点击"选择资产"打开资产选择弹窗，支持多选和全选',
          '每项资产可单独编辑数量（最少为1）',
          '选择报废类型（全部报废/部分报废）',
          '填写报废原因和备注后保存'
        ]
      },
      {
        heading: '出库流程',
        items: [
          '待出库状态的报废单，点击"确认出库"',
          '确认出库后单据状态变更为已出库，所有资产状态变更为已报废',
          '点击"驳回"可驳回报废申请，需填写驳回原因'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '报废单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印报废单',
          '打印内容包含所有报废资产明细'
        ]
      },
      {
        heading: '统计卡片说明',
        items: [
          '本月报废：按制单日期为本月统计，包含所有状态的报废单数量',
          '待审核：状态为 pending 的报废单数量',
          '已报废：状态为 approved 的报废单数量',
          '已驳回：状态为 rejected 的报废单数量'
        ]
      },
      {
        heading: '反确认',
        items: [
          '已出库(approved)的报废单可执行反确认',
          '反确认操作会回退单据状态为待出库，并将资产状态恢复为领用中',
          '点击操作栏的"反确认"按钮，确认后即可执行'
        ]
      }
    ]
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">资产报废管理</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <PrimaryButton onClick={openAdd}>
          <Plus size={14} />
          新增报废单
        </PrimaryButton>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">本月报废</div>
              <div className="text-2xl font-bold text-[#303133]">{stats.monthCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fef0f0] flex items-center justify-center">
              <Trash2 className="text-[#f56c6c]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">待审核</div>
              <div className="text-2xl font-bold text-[#e6a23c]">{stats.pendingCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fdf6ec] flex items-center justify-center">
              <Clock className="text-[#e6a23c]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">已报废</div>
              <div className="text-2xl font-bold text-[#67c23a]">{stats.approvedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f0f9eb] flex items-center justify-center">
              <CheckCircle2 className="text-[#67c23a]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">报废金额</div>
              <div className="text-2xl font-bold text-[#409eff]">
                ¥{stats.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ecf5ff] flex items-center justify-center">
              <DollarSign className="text-[#409eff]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <SearchBar
        onSearch={() =>
          setApplied({
            no: filterNo,
            assetName: filterAssetName,
            status: filterStatus,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterNo('');
          setFilterAssetName('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({
            no: '',
            assetName: '',
            status: '',
            from: '',
            to: '',
          });
        }}
      >
        <SearchField label="报废单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="资产名称" placeholder="请输入" value={filterAssetName} onChange={setFilterAssetName} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">状态：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部</option>
            <option value="pending">待出库</option>
            <option value="approved">已出库</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      {/* 数据表格 */}
      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* 查看弹窗 */}
      <Modal open={!!viewItem} title="报废单详情" onClose={() => setViewItem(null)} width="max-w-[800px]">
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">报废单号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.scrapNo}</div>
              <div className="text-[#606266]">报废类型：</div>
              <div className="text-[#303133] col-span-2">{scrapTypeText(viewItem.scrapType)}</div>
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status) + ' col-span-2'}>
                {statusText(viewItem.status)}
              </div>
              <div className="text-[#606266]">申请人：</div>
              <div className="text-[#303133] col-span-2">{viewItem.applicant}</div>
              <div className="text-[#606266]">申请日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.applyDate}</div>
              <div className="text-[#606266]">明细数：</div>
              <div className="text-[#303133] col-span-2">{viewItem.details.length} 项</div>
              {viewItem.outConfirmer && (
                <>
                  <div className="text-[#606266]">出库确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmer}</div>
                  <div className="text-[#606266]">出库确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmTime}</div>
                </>
              )}
              {viewItem.approver && (
                <>
                  <div className="text-[#606266]">审核人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.approver}</div>
                  <div className="text-[#606266]">审核时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.approveTime}</div>
                </>
              )}
            </div>

            <div className="text-sm">
              <div className="text-[#606266] mb-1 font-medium">报废资产明细：</div>
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f7fa] text-[#606266]">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">物资编码</th>
                      <th className="px-2 py-2 text-left font-medium">物资名称</th>
                      <th className="px-2 py-2 text-left font-medium">规格</th>
                      <th className="px-2 py-2 text-left font-medium">单位</th>
                      <th className="px-2 py-2 text-right font-medium">数量</th>
                      <th className="px-2 py-2 text-right font-medium">原值</th>
                      <th className="px-2 py-2 text-left font-medium">所在仓库</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((d, i) => (
                      <tr key={`${d.assetId}-${i}`} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-2 text-[#303133]">{d.assetCode}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.assetName}</td>
                        <td className="px-2 py-2 text-[#606266]">{d.specification}</td>
                        <td className="px-2 py-2 text-[#606266]">{d.unit}</td>
                        <td className="px-2 py-2 text-right text-[#303133]">{d.quantity}</td>
                        <td className="px-2 py-2 text-right text-[#303133]">¥{d.originalValue.toLocaleString()}</td>
                        <td className="px-2 py-2 text-[#606266]">{d.warehouseName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#ebeef5] bg-[#fafbfc]">
                      <td colSpan={4} className="px-2 py-2 text-right text-[#606266]">合计：</td>
                      <td className="px-2 py-2 text-right font-medium text-[#303133]">
                        {viewItem.details.reduce((s, d) => s + d.quantity, 0)}
                      </td>
                      <td className="px-2 py-2 text-right font-medium text-[#303133]">
                        ¥{viewItem.details.reduce((s, d) => s + d.originalValue, 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="text-sm">
              <div className="text-[#606266] mb-1">报废原因：</div>
              <div className="text-[#303133] p-3 bg-[#f5f7fa] rounded">{viewItem.reason}</div>
            </div>
            {viewItem.approveRemark && (
              <div className="text-sm">
                <div className="text-[#606266] mb-1">审核意见：</div>
                <div className="text-[#303133] p-3 bg-[#f5f7fa] rounded">{viewItem.approveRemark}</div>
              </div>
            )}
            {viewItem.remark && (
              <div className="text-sm">
                <span className="text-[#606266]">备注：</span>
                <span className="text-[#303133]">{viewItem.remark}</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {/* 编辑/新增弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增报废单' : '编辑报废单'}
        onClose={() => {
          setEditItem(null);
          setEditDetails([]);
        }}
        width="max-w-[800px]"
      >
        {editItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-[#606266]">报废单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.scrapNo}
                  onChange={(e) => setEditItem({ ...editItem, scrapNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 报废类型
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.scrapType}
                  onChange={(e) =>
                    setEditItem({ ...editItem, scrapType: e.target.value as 'full' | 'partial' })
                  }
                >
                  <option value="full">全部报废</option>
                  <option value="partial">部分报废</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 报废资产明细
                  {editDetails.length > 0 && (
                    <span className="ml-2 text-[#909399]">共 {editDetails.length} 项</span>
                  )}
                </div>
                <DefaultButton onClick={() => setAssetPickerOpen(true)}>选择资产</DefaultButton>
              </div>
              {editDetails.length === 0 ? (
                <div
                  className="border border-dashed border-[#dcdfe6] rounded py-8 text-center text-[#909399] cursor-pointer hover:border-[#2f54eb] hover:text-[#2f54eb] transition-colors"
                  onClick={() => setAssetPickerOpen(true)}
                >
                  请点击"选择资产"添加要报废的资产
                </div>
              ) : (
                <div className="border border-[#ebeef5] rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f5f7fa] text-[#606266]">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium">物资编码</th>
                        <th className="px-2 py-2 text-left font-medium">物资名称</th>
                        <th className="px-2 py-2 text-left font-medium">规格</th>
                        <th className="px-2 py-2 text-left font-medium">单位</th>
                        <th className="px-2 py-2 text-right font-medium w-[100px]">数量</th>
                        <th className="px-2 py-2 text-right font-medium">原值</th>
                        <th className="px-2 py-2 text-center font-medium w-[60px]">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editDetails.map((d, i) => (
                        <tr key={`${d.assetId}-${i}`} className="border-t border-[#ebeef5]">
                          <td className="px-2 py-2 text-[#303133]">{d.assetCode}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.assetName}</td>
                          <td className="px-2 py-2 text-[#606266]">{d.specification}</td>
                          <td className="px-2 py-2 text-[#606266]">{d.unit}</td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              min={1}
                              value={d.quantity}
                              onChange={(e) => updateDetailQuantity(i, parseInt(e.target.value, 10) || 1)}
                              className="w-[70px] h-7 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                            />
                          </td>
                          <td className="px-2 py-2 text-right text-[#303133]">
                            ¥{d.originalValue.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              className="text-[#f56c6c] hover:opacity-80"
                              onClick={() => removeDetail(i)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#ebeef5] bg-[#fafbfc]">
                        <td colSpan={4} className="px-2 py-2 text-right text-[#606266]">合计：</td>
                        <td className="px-2 py-2 text-right font-medium text-[#303133]">
                          {editDetails.reduce((s, d) => s + d.quantity, 0)}
                        </td>
                        <td className="px-2 py-2 text-right font-medium text-[#303133]">
                          ¥{editDetails.reduce((s, d) => s + d.originalValue, 0).toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 text-[#606266]">
                <span className="text-[#f56c6c]">*</span> 报废原因
              </div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={3}
                value={editItem.reason}
                onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
                placeholder="请输入报废原因"
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.remark}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
                placeholder="请输入备注信息"
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton
            onClick={() => {
              setEditItem(null);
              setEditDetails([]);
            }}
          >
            取消
          </DefaultButton>
          <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
        </div>
      </Modal>

      {/* 资产选择弹窗 */}
      <Modal
        open={assetPickerOpen}
        title="选择资产"
        onClose={() => {
          setAssetPickerOpen(false);
          setPickerSelectedIds([]);
        }}
        width="max-w-[900px]"
      >
        <div className="space-y-3">
          {fixedAssetWarehouses.length > 1 && (
            <div className="flex items-center gap-2 pb-2 border-b border-[#ebeef5]">
              <span className="text-sm text-[#606266] whitespace-nowrap">所在仓库：</span>
              <select
                className="w-[200px] h-8 px-2 border border-[#dcdfe6] text-sm text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
              >
                <option value="">全部仓库</option>
                {fixedAssetWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" size={14} />
              <input
                className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-sm text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                placeholder="设备编码"
                value={assetFilterCode}
                onChange={(e) => setAssetFilterCode(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" size={14} />
              <input
                className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-sm text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                placeholder="设备名称"
                value={assetFilterName}
                onChange={(e) => setAssetFilterName(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" size={14} />
              <input
                className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-sm text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                placeholder="规格型号"
                value={assetFilterSpec}
                onChange={(e) => setAssetFilterSpec(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filteredAssets.length > 0 && pickerSelectedIds.length === filteredAssets.length}
                  onChange={togglePickerSelectAll}
                  className="w-4 h-4 accent-[#2f54eb]"
                />
                <span className="text-[#606266]">全选</span>
              </label>
              {pickerSelectedIds.length > 0 && (
                <span className="text-sm text-[#2f54eb]">已选 {pickerSelectedIds.length} 项</span>
              )}
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f7fa] text-[#606266]">
                <tr>
                  <th className="px-3 py-2 w-[40px]"></th>
                  <th className="px-3 py-2 text-left font-medium">设备编码</th>
                  <th className="px-3 py-2 text-left font-medium">设备名称</th>
                  <th className="px-3 py-2 text-left font-medium">规格型号</th>
                  <th className="px-3 py-2 text-left font-medium">单位</th>
                  <th className="px-3 py-2 text-right font-medium">原值</th>
                  <th className="px-3 py-2 text-left font-medium">所在仓库</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const assetWarehouse = warehouses.find((w) => w.id === asset.warehouseId);
                  const checked = pickerSelectedIds.includes(asset.id);
                  return (
                    <tr
                      key={asset.id}
                      className={`border-t border-[#ebeef5] cursor-pointer hover:bg-[#ecf5ff] ${checked ? 'bg-[#ecf5ff]' : ''}`}
                      onClick={() => togglePickerAsset(asset.id)}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePickerAsset(asset.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-[#2f54eb]"
                        />
                      </td>
                      <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                      <td className="px-3 py-2 text-[#606266]">{asset.specification}</td>
                      <td className="px-3 py-2 text-[#606266]">{asset.unit}</td>
                      <td className="px-3 py-2 text-right text-[#303133]">¥{asset.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[#606266]">{assetWarehouse?.name || '-'}</td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton
            onClick={() => {
              setAssetPickerOpen(false);
              setPickerSelectedIds([]);
            }}
          >
            取消
          </DefaultButton>
          <PrimaryButton onClick={addSelectedAssets}>
            确认添加 {pickerSelectedIds.length > 0 && `(${pickerSelectedIds.length})`}
          </PrimaryButton>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="资产报废单"
          orderNo={printItem.scrapNo}
          orderType="资产报废"
          orderDate={printItem.applyDate.slice(0, 10)}
          warehouseName=""
          custodian={printItem.applicant}
          remark={printItem.remark}
          details={printItem.details.map((d) => ({
            productCode: d.assetCode,
            productName: d.assetName,
            specification: d.specification,
            unit: d.unit,
            quantity: d.quantity,
            unitPrice: d.originalValue,
            amount: d.originalValue,
            remark: `报废类型：${scrapTypeText(printItem.scrapType)}，报废原因：${printItem.reason}`,
          }))}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '设备编码' },
            { key: 'productName', label: '设备名称' },
            { key: 'specification', label: '规格型号' },
            { key: 'unit', label: '单位' },
            { key: 'quantity', label: '数量', align: 'right' },
            { key: 'unitPrice', label: '原值', align: 'right' },
            { key: 'remark', label: '备注' },
          ]}
        />
      )}
    </div>
  );
}
