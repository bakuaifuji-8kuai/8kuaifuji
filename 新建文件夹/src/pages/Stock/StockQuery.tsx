import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { Layers, Package } from 'lucide-react';

export default function StockQueryPage() {
  const batchInventories = useStore((s) => s.batchInventories);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const categories = useStore((s) => s.categories);
  const products = useStore((s) => s.products);

  const [activeTab, setActiveTab] = useState<'summary' | 'batch'>('summary');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ product: '', category: '', warehouse: '', position: '' });

  const filteredBatchData = useMemo(() => {
    return batchInventories.filter((b) => {
      if (
        appliedFilter.product &&
        !(b.productName || '').includes(appliedFilter.product) &&
        !(b.productCode || '').includes(appliedFilter.product)
      )
        return false;
      if (appliedFilter.category && b.categoryId !== appliedFilter.category) return false;
      if (appliedFilter.warehouse && b.warehouseId !== appliedFilter.warehouse) return false;
      if (appliedFilter.position && b.positionId !== appliedFilter.position) return false;
      return true;
    });
  }, [batchInventories, appliedFilter]);

  const summaryData = useMemo(() => {
    const filtered = batchInventories.filter((b) => {
      if (
        appliedFilter.product &&
        !(b.productName || '').includes(appliedFilter.product) &&
        !(b.productCode || '').includes(appliedFilter.product)
      )
        return false;
      if (appliedFilter.category && b.categoryId !== appliedFilter.category) return false;
      if (appliedFilter.warehouse && b.warehouseId !== appliedFilter.warehouse) return false;
      if (appliedFilter.position && b.positionId !== appliedFilter.position) return false;
      return true;
    });

    const summaryMap = new Map<string, {
      productId: string;
      productCode: string;
      productName: string;
      categoryName: string;
      warehouseName: string;
      positionName: string;
      totalQuantity: number;
      batches: typeof batchInventories;
    }>();

    filtered.forEach((batch) => {
      const key = `${batch.productId}-${batch.warehouseId}-${batch.positionId}`;
      const product = products.find(p => p.id === batch.productId);
      const category = categories.find(c => c.id === (product?.categoryId || batch.categoryId));
      
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          productId: batch.productId,
          productCode: batch.productCode || '',
          productName: batch.productName || '',
          categoryName: category?.name || (batch.categoryName || ''),
          warehouseName: batch.warehouseName || '',
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
  }, [batchInventories, appliedFilter, products, categories]);

  const summaryColumns: ColumnDef<typeof summaryData[number]>[] = [
    { key: 'productCode', title: '物资编码' },
    { key: 'productName', title: '物资名称' },
    { key: 'categoryName', title: '物资分类' },
    { key: 'warehouseName', title: '仓库' },
    { key: 'positionName', title: '仓位' },
    { key: 'totalQuantity', title: '库存总量', align: 'right' },
    {
      key: 'batchCount',
      title: '批次数量',
      align: 'center',
      render: (row) => row.batches.length,
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <TextButton onClick={() => setViewItem(row)}>查看批次</TextButton>
      ),
    },
  ];

  const batchColumns: ColumnDef<typeof batchInventories[number]>[] = [
    { key: 'productCode', title: '物资编码' },
    { key: 'productName', title: '物资名称' },
    { key: 'categoryName', title: '物资分类' },
    { key: 'warehouseName', title: '仓库' },
    { key: 'positionName', title: '仓位' },
    { key: 'batchNo', title: '批次号' },
    { key: 'inboundTime', title: '入库时间' },
    { key: 'quantity', title: '库存量', align: 'right' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <TextButton onClick={() => setViewBatchItem(row)}>查看详情</TextButton>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<typeof summaryData[number] | null>(null);
  const [viewBatchItem, setViewBatchItem] = useState<typeof batchInventories[number] | null>(null);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">库存查询</h2>
        <div className="flex items-center gap-2">
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
          setAppliedFilter({ product: filterProduct, category: filterCategory, warehouse: filterWarehouse, position: filterPosition })
        }
        onReset={() => {
          setFilterProduct('');
          setFilterCategory('');
          setFilterWarehouse('');
          setFilterPosition('');
          setAppliedFilter({ product: '', category: '', warehouse: '', position: '' });
        }}
      >
        <SearchField
          label="物资"
          placeholder="输入物资编码/名称"
          value={filterProduct}
          onChange={setFilterProduct}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">分类：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">全部</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
        <DataTable data={summaryData} columns={summaryColumns} />
      ) : (
        <DataTable data={filteredBatchData} columns={batchColumns} />
      )}

      <Modal open={!!viewItem} title="批次详情" onClose={() => setViewItem(null)} width="max-w-[800px]">
        {viewItem && (
          <>
            <div className="grid grid-cols-3 gap-y-2 text-xs mb-3 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">物资编码：</div>
              <div className="text-[#303133]">{viewItem.productCode}</div>
              <div />
              <div className="text-[#606266]">物资名称：</div>
              <div className="text-[#303133]">{viewItem.productName}</div>
              <div />
              <div className="text-[#606266]">物资分类：</div>
              <div className="text-[#303133]">{viewItem.categoryName}</div>
              <div />
              <div className="text-[#606266]">仓库：</div>
              <div className="text-[#303133]">{viewItem.warehouseName}</div>
              <div />
              <div className="text-[#606266]">仓位：</div>
              <div className="text-[#303133]">{viewItem.positionName}</div>
              <div />
              <div className="text-[#606266]">库存总量：</div>
              <div className="text-[#2f54eb] font-medium">{viewItem.totalQuantity}</div>
              <div />
            </div>
            <div className="text-xs font-medium text-[#303133] mb-2">批次明细</div>
            <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-2 py-2 text-left">批次号</th>
                  <th className="px-2 py-2 text-left">入库时间</th>
                  <th className="px-2 py-2 text-right">原始数量</th>
                  <th className="px-2 py-2 text-right">当前数量</th>
                  <th className="px-2 py-2 text-left">来源单号</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.batches.map((b, i) => (
                  <tr key={i} className="border-t border-[#ebeef5]">
                    <td className="px-2 py-2 text-[#303133]">{b.batchNo}</td>
                    <td className="px-2 py-2 text-[#303133]">{b.inboundTime}</td>
                    <td className="px-2 py-2 text-right text-[#303133]">{b.originalQuantity}</td>
                    <td className="px-2 py-2 text-right text-[#2f54eb]">{b.quantity}</td>
                    <td className="px-2 py-2 text-[#303133]">{b.inboundOrderNo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      <Modal open={!!viewBatchItem} title="库存详情" onClose={() => setViewBatchItem(null)} width="max-w-[560px]">
        {viewBatchItem && (
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="text-[#606266]">物资编码：</div>
            <div className="text-[#303133]">{viewBatchItem.productCode}</div>
            <div className="text-[#606266]">物资名称：</div>
            <div className="text-[#303133]">{viewBatchItem.productName}</div>
            <div className="text-[#606266]">物资分类：</div>
            <div className="text-[#303133]">{viewBatchItem.categoryName}</div>
            <div className="text-[#606266]">仓库：</div>
            <div className="text-[#303133]">{viewBatchItem.warehouseName}</div>
            <div className="text-[#606266]">仓位：</div>
            <div className="text-[#303133]">{viewBatchItem.positionName}</div>
            <div className="text-[#606266]">批次号：</div>
            <div className="text-[#303133]">{viewBatchItem.batchNo}</div>
            <div className="text-[#606266]">入库时间：</div>
            <div className="text-[#303133]">{viewBatchItem.inboundTime}</div>
            <div className="text-[#606266]">原始数量：</div>
            <div className="text-[#303133]">{viewBatchItem.originalQuantity}</div>
            <div className="text-[#606266]">当前数量：</div>
            <div className="text-[#2f54eb] font-medium">{viewBatchItem.quantity}</div>
            <div className="text-[#606266]">来源单号：</div>
            <div className="text-[#303133]">{viewBatchItem.inboundOrderNo || '-'}</div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewBatchItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>
    </div>
  );
}
