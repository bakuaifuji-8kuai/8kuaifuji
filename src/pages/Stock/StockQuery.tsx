import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import MultiSelect from '@/components/common/MultiSelect';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { Layers, Package, Edit3, Download, FileText } from 'lucide-react';
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
    },
    {
      heading: '导出报表',
      items: [
        '在汇总库存视图下，选择一个仓库后可点击"导出报表"按钮',
        '导出PDF格式的库存报表，标题为仓库名称',
        '报表包含：物资编码、物资名称、规格、单位、在仓发料数量',
        '在仓发料数量为生成报表时的当前库存数量'
      ]
    }
  ]
};


interface SummaryItem {
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
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
  const [filterWarehouse, setFilterWarehouse] = useState<string[]>([]);
  const [filterPosition, setFilterPosition] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>(['enabled']);
  const [appliedFilter, setAppliedFilter] = useState({
    product: '',
    specification: '',
    warehouses: [] as string[],
    positions: [] as string[],
    statuses: ['enabled'] as string[],
  });

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
      if (appliedFilter.warehouses.length > 0 && !appliedFilter.warehouses.includes(b.warehouseId)) return false;
      if (appliedFilter.positions.length > 0 && !appliedFilter.positions.includes(b.positionId)) return false;
      if (appliedFilter.statuses.length > 0) {
        const wh = warehouses.find((w) => w.id === b.warehouseId);
        if (!wh || !appliedFilter.statuses.includes(wh.status)) return false;
      }
      return true;
    });
  }, [batchInventories, products, appliedFilter, warehouses]);

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
      if (appliedFilter.warehouses.length > 0 && !appliedFilter.warehouses.includes(b.warehouseId)) return false;
      if (appliedFilter.positions.length > 0 && !appliedFilter.positions.includes(b.positionId)) return false;
      if (appliedFilter.statuses.length > 0) {
        const wh = warehouses.find((w) => w.id === b.warehouseId);
        if (!wh || !appliedFilter.statuses.includes(wh.status)) return false;
      }
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
          unit: product?.unit || '',
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
  }, [batchInventories, products, appliedFilter, warehouses]);

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
    { key: 'unit', title: '单位', render: (row) => row.unit || '-' },
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

  const handleExportReport = () => {
    if (appliedFilter.warehouses.length === 0) {
      alert('请先选择一个仓库');
      return;
    }
    if (appliedFilter.warehouses.length > 1) {
      alert('导出报表仅支持选择一个仓库');
      return;
    }
    if (summaryData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const warehouse = warehouses.find((w) => w.id === appliedFilter.warehouses[0]);
    const warehouseName = warehouse?.name || '库存报表';
    const now = new Date();
    const printTime = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const totalQty = summaryData.reduce((sum, item) => sum + item.totalQuantity, 0);

    const detailRows = summaryData.map((item, idx) => {
      const product = products.find((p) => p?.id === item.productId);
      const unit = product?.unit || '-';
      return `
        <tr>
          <td style="border:1px solid #666;padding:8px;text-align:center;font-size:12px;">${idx + 1}</td>
          <td style="border:1px solid #666;padding:8px;text-align:left;font-size:12px;">${item.productCode}</td>
          <td style="border:1px solid #666;padding:8px;text-align:left;font-size:12px;">${item.productName}</td>
          <td style="border:1px solid #666;padding:8px;text-align:left;font-size:12px;">${item.specification || '-'}</td>
          <td style="border:1px solid #666;padding:8px;text-align:center;font-size:12px;">${unit}</td>
          <td style="border:1px solid #666;padding:8px;text-align:right;font-size:12px;">${item.totalQuantity}</td>
        </tr>
      `;
    }).join('');

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${warehouseName} - 库存报表</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .print-header h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 10px 0;
            letter-spacing: 4px;
          }
          .print-header .meta {
            font-size: 13px;
            color: #555;
            display: flex;
            justify-content: center;
            gap: 40px;
          }
          .detail-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          .detail-table thead tr {
            background-color: #f0f0f0;
          }
          .detail-table th {
            border: 1px solid #666;
            padding: 10px 8px;
            font-weight: 600;
            font-size: 12px;
            text-align: center;
          }
          .detail-table td {
            border: 1px solid #666;
            padding: 8px;
          }
          .total-row {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .print-time {
            text-align: right;
            margin-top: 20px;
            font-size: 11px;
            color: #888;
          }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div style="max-width:900px;margin:0 auto;">
          <div class="print-header">
            <h1>${warehouseName}</h1>
            <div class="meta">
              <span>库存报表</span>
              <span>报表日期：${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}</span>
            </div>
          </div>

          <table class="detail-table">
            <thead>
              <tr>
                <th style="width:50px;">序号</th>
                <th style="width:120px;">物资编码</th>
                <th>物资名称</th>
                <th style="width:150px;">规格</th>
                <th style="width:60px;">单位</th>
                <th style="width:100px;">在仓发料数量</th>
              </tr>
            </thead>
            <tbody>
              ${detailRows}
              <tr class="total-row">
                <td colspan="5" style="border:1px solid #666;padding:8px;text-align:center;font-weight:600;">合计</td>
                <td style="border:1px solid #666;padding:8px;text-align:right;font-weight:600;">${totalQty}</td>
              </tr>
            </tbody>
          </table>

          <div class="print-time">打印时间：${printTime}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('无法打开打印窗口，请检查浏览器弹窗设置');
      return;
    }
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.addEventListener('load', () => {
      printWindow.focus();
      printWindow.print();
    });
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
          {activeTab === 'summary' && (
            <DefaultButton onClick={handleExportReport} icon={<FileText size={14} />}>
              导出报表
            </DefaultButton>
          )}
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
          setAppliedFilter({
            product: filterProduct,
            specification: filterSpecification,
            warehouses: filterWarehouse,
            positions: filterPosition,
            statuses: filterStatuses,
          })
        }
        onReset={() => {
          setFilterProduct('');
          setFilterSpecification('');
          setFilterWarehouse([]);
          setFilterPosition([]);
          setFilterStatuses(['enabled']);
          setAppliedFilter({
            product: '',
            specification: '',
            warehouses: [],
            positions: [],
            statuses: ['enabled'],
          });
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
        <MultiSelect
          label="仓库"
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterWarehouse}
          onChange={(vals) => {
            setFilterWarehouse(vals);
            setFilterPosition([]);
          }}
          placeholder="全部"
        />
        <MultiSelect
          label="仓位"
          options={positions
            .filter((p) => filterWarehouse.length === 0 || filterWarehouse.includes(p.warehouseId))
            .map((p) => ({ value: p.id, label: p.name }))}
          value={filterPosition}
          onChange={setFilterPosition}
          placeholder="全部"
        />
        <MultiSelect
          label="状态"
          options={[
            { value: 'enabled', label: '启用' },
            { value: 'disabled', label: '禁用' },
          ]}
          value={filterStatuses}
          onChange={setFilterStatuses}
          placeholder="全部"
          width="w-[160px]"
        />
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

