import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import type { StockTransaction } from '@/types';

export default function StockTransactionPage() {
  const stockTransactions = useStore((s) => s.stockTransactions);
  const warehouses = useStore((s) => s.warehouses);
  const products = useStore((s) => s.products);

  const [filterProduct, setFilterProduct] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ product: '', warehouse: '', type: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return stockTransactions.filter((t) => {
      if (
        applied.product &&
        !(t.productCode || '').includes(applied.product) &&
        !(t.productName || '').includes(applied.product)
      )
        return false;
      if (applied.warehouse && t.warehouseId !== applied.warehouse) return false;
      if (applied.type && t.transactionType !== applied.type) return false;
      if (applied.from && t.transactionTime < applied.from) return false;
      if (applied.to && t.transactionTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [stockTransactions, applied]);

  const typeText = (t: string) => {
    if (t === 'inbound') return '入库';
    if (t === 'outbound') return '出库';
    if (t === 'check_diff') return '盘点差异';
    if (t === 'check_profit') return '盘点盘盈';
    if (t === 'check_loss') return '盘点盘亏';
    return t;
  };

  const typeColor = (t: string) => {
    if (t === 'inbound') return 'text-[#67c23a]';
    if (t === 'outbound') return 'text-[#f56c6c]';
    return 'text-[#e6a23c]';
  };

  const columns: ColumnDef<StockTransaction>[] = [
    { key: 'transactionTime', title: '更新时间' },
    {
      key: 'type',
      title: '更新类型',
      render: (row) => (
        <span className={typeColor(row.transactionType)}>{typeText(row.transactionType)}</span>
      ),
    },
    { key: 'productCode', title: '物资编码' },
    { key: 'productName', title: '物资名称' },
    { key: 'warehouseName', title: '仓库' },
    { key: 'positionName', title: '仓位' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => (
        <span className={row.quantity > 0 ? 'text-[#67c23a]' : 'text-[#f56c6c]'}>{row.quantity}</span>
      ),
    },
    { key: 'sourceOrderNo', title: '来源单号', render: (row) => row.sourceOrderNo || '-' },
    { key: 'sourceType', title: '来源类型', render: (row) => row.sourceType || '-' },
    { key: 'operator', title: '操作员' },
    { key: 'batchNo', title: '批次号', render: (row) => row.batchNo || '-' },
  ];

  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">库存流水</h2>
        <PrimaryButton onClick={() => setExportOpen(true)}>导出</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({
            product: filterProduct,
            warehouse: filterWarehouse,
            type: filterType,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterProduct('');
          setFilterWarehouse('');
          setFilterType('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ product: '', warehouse: '', type: '', from: '', to: '' });
        }}
      >
        <SearchField label="物资" placeholder="编码/名称" value={filterProduct} onChange={setFilterProduct} />
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
          <span className="text-xs text-[#606266] whitespace-nowrap">更新类型：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">全部</option>
            <option value="inbound">入库</option>
            <option value="outbound">出库</option>
            <option value="check_diff">盘点差异</option>
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-[500px] p-6">
            <h3 className="text-sm font-semibold text-[#303133] mb-3">导出流水</h3>
            <p className="text-xs text-[#606266] mb-4">
              将导出当前筛选结果，共 {filteredData.length} 条记录。
            </p>
            <div className="flex justify-end gap-2">
              <DefaultButton onClick={() => setExportOpen(false)}>取消</DefaultButton>
              <PrimaryButton onClick={() => setExportOpen(false)}>确认导出</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
