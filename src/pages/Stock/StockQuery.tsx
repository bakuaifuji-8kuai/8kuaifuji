import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { Layers, Package, Edit3, Download } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import type { BatchInventory } from '@/types';
import * as XLSX from 'xlsx';

const helpContent = {
  title: '库存查询 - 功能操作说明',
  description: '库存查询用于查看当前库存情况，支持按物资、仓库、仓位筛选，并可查看库存流水及修改仓位。',
  sections: [
    {
      heading: '库存筛选',
      items: [
        '按物资编码/名称模糊筛选库存',
        '按仓库筛选指定仓库的库存',
        '按仓位筛选指定仓位的库存',
        '支持汇总库存和批次库存两种视图切换'
      ]
    },
    {
      heading: '查看库存流水',
      items: [
        '点击操作列的"查看流水"按钮',
        '跳转到库存流水页面，自动筛选对应物资',
        '可查看该物资所有出入库、调拨等库存变动明细'
      ]
    },
    {
      heading: '修改仓位',
      items: [
        '单条修改：点击仓位旁的编辑图标，选择目标仓位后保存',
        '批量修改：勾选多条记录，点击"批量修改仓位"按钮，统一设置目标仓位',
        '修改仓位后，该物资所有批次的仓位都会同步更新'
      ]
    },
    {
      heading: '库存汇总',
      items: [
        '表格底部显示当前筛选条件下的库存总量汇总',
        '汇总库存视图按物资+仓库+仓位维度聚合',
        '批次库存视图显示每个批次的详细库存信息'
      ]
    }
  ]
};


interface SummaryItem {
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  warehouseId: string;
  warehouseName: string;
  positionId: string;
  positionName: string;
  totalQuantity: number;
  batches: BatchInventory[];
}

export default function StockQueryPage() {
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'summary' | 'batch'>('summary');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterSpecification, setFilterSpecification] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ product: '', specification: '', warehouse: '', position: '' });

  // 仓位修改相关
  const [editPositionRow, setEditPositionRow] = useState<SummaryItem | null>(null);
  const [newPositionId, setNewPositionId] = useState('');
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [batchNewPositionId, setBatchNewPositionId] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const filteredBatchData = useMemo(() => {
    return batchInventories.filter((b) => {
      const product = products.find((p) => p?.id === b.productId);
      const spec = b.specification || product?.specification || '';
      if (
        appliedFilter.product &&
        !(b.productName || '').includes(appliedFilter.product) &&
        !(b.productCode || '').includes(appliedFilter.product)
      )
        return false;
      if (appliedFilter.specification && !spec.includes(appliedFilter.specification)) return false;
      if (appliedFilter.warehouse && b.warehouseId !== appliedFilter.warehouse) return false;
      if (appliedFilter.position && b.positionId !== appliedFilter.position) return false;
      return true;
    });
  }, [batchInventories, products, appliedFilter]);

  const summaryData = useMemo(() => {
    const filtered = batchInventories.filter((b) => {
      const product = products.find((p) => p?.id === b.productId);
      const spec = b.specification || product?.specification || '';
      if (
        appliedFilter.product &&
        !(b.productName || '').includes(appliedFilter.product) &&
        !(b.productCode || '').includes(appliedFilter.product)
      )
        return false;
      if (appliedFilter.specification && !spec.includes(appliedFilter.specification)) return false;
      if (appliedFilter.warehouse && b.warehouseId !== appliedFilter.warehouse) return false;
      if (appliedFilter.position && b.positionId !== appliedFilter.position) return false;
      return true;
    });

    const summaryMap = new Map<string, SummaryItem>();

    filtered.forEach((batch) => {
      const key = `${batch.productId}-${batch.warehouseId}-${batch.positionId}`;
      const product = products.find((p) => p?.id === batch.productId);
      const spec = batch.specification || product?.specification || '';

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          productId: batch.productId,
          productCode: batch.productCode || '',
          productName: batch.productName || '',
          specification: spec,
          warehouseId: batch.warehouseId,
          warehouseName: batch.warehouseName || '',
          positionId: batch.positionId,
          positionName: batch.positionName || '',
          totalQuantity: 0,
          batches: [],
        });
      }

      const item = summaryMap.get(key)!;
      item.totalQuantity += batch.quantity;
      item.batches.push(batch);
    });

    return Array.from(summaryMap.values());
  }, [batchInventories, products, appliedFilter]);

  const totalSummary = useMemo(() => {
    return summaryData.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  }, [summaryData]);

  const openSingleEdit = (row: SummaryItem) => {
    setEditPositionRow(row);
    setNewPositionId(row.positionId);
  };

  const handleSaveSinglePosition = () => {
    if (!editPositionRow) return;
    if (!newPositionId) {
      alert('请选择目标仓位');
      return;
    }
    const target = positions.find((p) => p.id === newPositionId);
    if (!target) {
      alert('所选仓位不存在');
      return;
    }
    if (editPositionRow.positionId === newPositionId) {
      alert('仓位未变化');
      return;
    }
    if (!confirm(`确认将「${editPositionRow.productName}」的仓位从「${editPositionRow.positionName || '-'}」修改为「${target.name}」？`)) {
      return;
    }
    editPositionRow.batches.forEach((b) => {
      updateBatchInventory(b.id, {
        positionId: newPositionId,
        positionName: target.name,
      });
    });
    setEditPositionRow(null);
  };

  const handleSaveBatchPosition = () => {
    if (!batchNewPositionId) {
      alert('请选择目标仓位');
      return;
    }
    if (selectedRowIds.length === 0) {
      alert('请先勾选要修改的记录');
      return;
    }
    const target = positions.find((p) => p.id === batchNewPositionId);
    if (!target) {
      alert('所选仓位不存在');
      return;
    }
    if (!confirm(`确认将已选 ${selectedRowIds.length} 条记录的仓位统一修改为「${target.name}」？`)) {
      return;
    }
    const selectedRows = summaryData.filter((r) =>
      selectedRowIds.includes(`${r.productId}-${r.warehouseId}-${r.positionId}`)
    );
    selectedRows.forEach((row) => {
      row.batches.forEach((b) => {
        updateBatchInventory(b.id, {
          positionId: batchNewPositionId,
          positionName: target.name,
        });
      });
    });
    setBatchEditOpen(false);
    setBatchNewPositionId('');
    setSelectedRowIds([]);
  };

  const summaryColumns: ColumnDef<SummaryItem>[] = [
    { key: 'productCode', title: '物资编码' },
    { key: 'productName', title: '物资名称' },
    { key: 'specification', title: '规格型号', render: (row) => row.specification || '-' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'positionName',
      title: '仓位',
      render: (row) => (
        <div className="flex items-center gap-1">
          <span>{row.positionName || '-'}</span>
          <button
            className="text-[#2f54eb] hover:text-[#1d39c4] inline-flex items-center"
            title="修改仓位"
            onClick={() => openSingleEdit(row)}
          >
            <Edit3 size={12} />
          </button>
        </div>
      ),
    },
    {
      key: 'totalQuantity',
      title: '库存总量',
      align: 'right',
      footer: () => (
        <span className="text-[#2f54eb] font-semibold">{totalSummary}</span>
      ),
    },
    {
      key: 'op',
      title: '操作',
      footer: () => (
        <span className="text-[#606266]">汇总库存总量</span>
      ),
      render: (row) => (
        <TextButton onClick={() => navigate(`/stock/transaction?productId=${encodeURIComponent(row.productId)}&productName=${encodeURIComponent(row.productName)}`)}>
          查看流水
        </TextButton>
      ),
    },
  ];

  const batchColumns: ColumnDef<BatchInventory>[] = [
    { key: 'productCode', title: '物资编码' },
    { key: 'productName', title: '物资名称' },
    { key: 'specification', title: '规格型号', render: (row) => {
      const product = products.find((p) => p?.id === row.productId);
      return row.specification || product?.specification || '-';
    } },
    { key: 'warehouseName', title: '仓库' },
    { key: 'positionName', title: '仓位' },
    { key: 'batchNo', title: '批次号' },
    { key: 'inboundTime', title: '入库时间' },
    { key: 'quantity', title: '库存量', align: 'right' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <TextButton onClick={() => navigate(`/stock/transaction?productId=${encodeURIComponent(row.productId)}&productName=${encodeURIComponent(row.productName)}`)}>
          查看流水
        </TextButton>
      ),
    },
  ];

  const handleSelectChange = (keys: string[]) => {
    setSelectedRowIds(keys);
  };

  const handleExport = () => {
    const data = activeTab === 'summary' ? summaryData : filteredBatchData;
    if (data.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    let exportData: any[];
    if (activeTab === 'summary') {
      exportData = (data as SummaryItem[]).map((item) => ({
        '物资编码': item.productCode,
        '物资名称': item.productName,
        '规格型号': item.specification || '-',
        '仓库': item.warehouseName,
        '仓位': item.positionName || '-',
        '库存总量': item.totalQuantity,
      }));
    } else {
      exportData = (data as BatchInventory[]).map((item) => {
        const product = products.find((p) => p?.id === item.productId);
        const spec = item.specification || product?.specification || '-';
        return {
          '物资编码': item.productCode,
          '物资名称': item.productName,
          '规格型号': spec,
          '仓库': item.warehouseName,
          '仓位': item.positionName,
          '批次号': item.batchNo,
          '入库时间': item.inboundTime,
          '库存量': item.quantity,
        };
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'summary' ? '汇总库存' : '批次库存');
    ws['!cols'] = activeTab === 'summary'
      ? [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }]
      : [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 10 }];
    XLSX.writeFile(wb, `库存查询_${activeTab === 'summary' ? '汇总' : '批次'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const operationSlot = (
    <>
      <PrimaryButton
        onClick={() => {
          if (selectedRowIds.length === 0) {
            alert('请先勾选要修改的记录');
            return;
          }
          setBatchEditOpen(true);
        }}
      >
        <Edit3 size={14} /> 批量修改仓位
      </PrimaryButton>
    </>
  );

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">库存查询</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <DefaultButton onClick={handleExport} icon={<Download size={14} />}>
            导出
          </DefaultButton>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
              activeTab === 'summary'
                ? 'bg-[#2f54eb] text-white'
                : 'bg-[#f5f7fa] text-[#606266] hover:bg-[#e4e7ed]'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            <Layers size={14} />
            汇总库存
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
              activeTab === 'batch'
                ? 'bg-[#2f54eb] text-white'
                : 'bg-[#f5f7fa] text-[#606266] hover:bg-[#e4e7ed]'
            }`}
            onClick={() => setActiveTab('batch')}
          >
            <Package size={14} />
            批次库存
          </button>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setAppliedFilter({ product: filterProduct, specification: filterSpecification, warehouse: filterWarehouse, position: filterPosition })
        }
        onReset={() => {
          setFilterProduct('');
          setFilterSpecification('');
          setFilterWarehouse('');
          setFilterPosition('');
          setAppliedFilter({ product: '', specification: '', warehouse: '', position: '' });
        }}
      >
        <SearchField
          label="物资"
          placeholder="输入物资编码/名称"
          value={filterProduct}
          onChange={setFilterProduct}
        />
        <SearchField
          label="规格型号"
          placeholder="输入规格型号"
          value={filterSpecification}
          onChange={setFilterSpecification}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">仓库：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
          >
            <option value="">全部</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">仓位：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
          >
            <option value="">全部</option>
            {positions
              .filter((p) => !filterWarehouse || p.warehouseId === filterWarehouse)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
      </SearchBar>

      {activeTab === 'summary' ? (
        <DataTable
          data={summaryData}
          columns={summaryColumns}
          selectable={true}
          selectedKeys={selectedRowIds}
          onSelectChange={handleSelectChange}
          rowKey={(row) => `${row.productId}-${row.warehouseId}-${row.positionId}`}
          operationSlot={operationSlot}
          showFooter={true}
        />
      ) : (
        <DataTable
          data={filteredBatchData}
          columns={batchColumns}
          rowKey={(row: BatchInventory) => row.id}
        />
      )}

      {/* 单条修改仓位弹窗 */}
      <Modal
        open={!!editPositionRow}
        title="修改仓位"
        onClose={() => setEditPositionRow(null)}
        width="max-w-[500px]"
      >
        {editPositionRow && (
          <div className="text-xs space-y-3">
            <div className="grid grid-cols-3 gap-y-2 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">物资：</div>
              <div className="text-[#303133] col-span-2">{editPositionRow.productName}（{editPositionRow.productCode}）</div>
              <div className="text-[#606266]">仓库：</div>
              <div className="text-[#303133] col-span-2">{editPositionRow.warehouseName}</div>
              <div className="text-[#606266]">当前仓位：</div>
              <div className="text-[#303133] col-span-2">{editPositionRow.positionName || '-'}</div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">目标仓位 <span className="text-[#f56c6c]">*</span></div>
              <select
                className="w-full h-8 px-2 border border-[#dcdfe6] text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                value={newPositionId}
                onChange={(e) => setNewPositionId(e.target.value)}
              >
                <option value="">请选择</option>
                {positions
                  .filter((p) => p.warehouseId === editPositionRow.warehouseId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditPositionRow(null)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSaveSinglePosition}>保存</PrimaryButton>
        </div>
      </Modal>

      {/* 批量修改仓位弹窗 */}
      <Modal
        open={batchEditOpen}
        title="批量修改仓位"
        onClose={() => {
          setBatchEditOpen(false);
          setBatchNewPositionId('');
        }}
        width="max-w-[500px]"
      >
        <div className="text-xs space-y-3">
          <div className="p-3 border border-[#ebeef5] rounded bg-[#f5f7fa] text-[#606266]">
            已选 <span className="text-[#2f54eb] font-semibold">{selectedRowIds.length}</span> 条记录，批量修改后所有选中记录的仓位将统一更新。
          </div>
          <div>
            <div className="mb-1 text-[#606266]">目标仓位 <span className="text-[#f56c6c]">*</span></div>
            <select
              className="w-full h-8 px-2 border border-[#dcdfe6] text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
              value={batchNewPositionId}
              onChange={(e) => setBatchNewPositionId(e.target.value)}
            >
              <option value="">请选择</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {warehouses.find((w) => w.id === p.warehouseId)?.name || ''} / {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => {
            setBatchEditOpen(false);
            setBatchNewPositionId('');
          }}>取消</DefaultButton>
          <PrimaryButton onClick={handleSaveBatchPosition}>保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

