import { useState, useEffect, useRef } from 'react';
import { Search, Check, X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';

export interface ProductPickerItem {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  specification?: string;
  status?: string;
}

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: ProductPickerItem[]) => void;
  title?: string;
  showStockQty?: boolean;
  products?: ProductPickerItem[];
  selectedIds?: string[];
  warehouseId?: string;
}

export default function ProductPickerModal({
  open,
  onClose,
  onConfirm,
  title = '选择产品',
  showStockQty = false,
  products: externalProducts,
  selectedIds: externalSelectedIds,
  warehouseId,
}: ProductPickerModalProps) {
  const { products: storeProducts, categories, batchInventories } = useStore();
  const products = externalProducts || storeProducts;
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(externalSelectedIds || []);

  useEffect(() => {
    if (open) {
      setSearchText('');
      setCategoryFilter('');
      setSelectedIds(externalSelectedIds || []);
    }
  }, [open, externalSelectedIds]);

  const getStockQty = (productId: string) => {
    return batchInventories
      .filter((b) => b.productId === productId)
      .reduce((sum, b) => sum + ((b as any).remainingQuantity || b.quantity || 0), 0);
  };

  const filteredProducts = products
    .filter((p: any) => p.status === 'enabled' || !p.status)
    .filter((p: any) => {
      if (!searchText) return true;
      const txt = searchText.toLowerCase();
      return (
        (p.code || '').toLowerCase().includes(txt) ||
        (p.name || '').toLowerCase().includes(txt) ||
        (p.specification || '').toLowerCase().includes(txt)
      );
    })
    .filter((p: any) => !categoryFilter || p.categoryId === categoryFilter);

  const columns: ColumnDef<any>[] = [
    { key: 'code', title: '物资编码' },
    { key: 'name', title: '物资名称' },
    {
      key: 'categoryId',
      title: '分类',
      render: (row: any) => categories.find((c: any) => c.id === row.categoryId)?.name || '-',
    },
    { key: 'specification', title: '规格型号', render: (row: any) => row.specification || '-' },
    { key: 'unit', title: '单位' },
  ];

  if (showStockQty) {
    columns.push({
      key: 'stock',
      title: '库存数量',
      align: 'right',
      render: (row: any) => getStockQty(row.id),
    });
  }

  const handleConfirm = () => {
    const items = selectedIds
      .map((id) => products.find((p: any) => p.id === id))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: categories.find((c: any) => c.id === p.categoryId)?.name,
        unit: p.unit,
        specification: p.specification,
      }));
    onConfirm(items);
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width="max-w-[1000px]"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索物资编码 / 名称 / 规格"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
        >
          <option value="">全部分类</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="text-xs text-[#606266] mb-2">
        共 {filteredProducts.length} 条，已选 {selectedIds.length} 条
      </div>

      <div className="border border-[#ebeef5] rounded max-h-[400px] overflow-y-auto">
        <DataTable
          data={filteredProducts}
          columns={columns}
          selectable={true}
          selectedKeys={selectedIds}
          onSelectChange={setSelectedIds}
          rowKey={(row: any) => row.id}
          pageSize={50}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        <DefaultButton onClick={onClose}>取消</DefaultButton>
        <PrimaryButton onClick={handleConfirm}>
          <Check size={14} />
          确认选择（{selectedIds.length}）
        </PrimaryButton>
      </div>
    </Modal>
  );
}
