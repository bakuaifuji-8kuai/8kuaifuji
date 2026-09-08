import { useState, useEffect, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';

export interface ProductPickerItem {
  id: string;
  code: string;
  name: string;
  categoryId?: string;
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
  defaultAttributeFilter?: string;
  /** 仅显示库存数量 > 0 的产品（适用：出库/报废/报损/调拨等扣减场景） */
  onlyStocked?: boolean;
}

export default function ProductPickerModal({
  open,
  onClose,
  onConfirm,
  title = '选择物资',
  showStockQty = false,
  products: externalProducts,
  selectedIds: externalSelectedIds,
  warehouseId,
  defaultAttributeFilter,
  onlyStocked = false,
}: ProductPickerModalProps) {
  const { products: storeProducts, categories, batchInventories } = useStore();
  const products = externalProducts || storeProducts;
  const [codeFilter, setCodeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(externalSelectedIds || []);

  // 只取一级分类
  const topCategories = useMemo(() => {
    return categories.filter((c: any) => !c.parentId || c.parentId === '');
  }, [categories]);

  // 递归收集选中分类及其所有子分类 ID
  const collectCategoryIds = (ids: string[]) => {
    const result = new Set(ids);
    const queue = [...ids];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      categories.forEach((c: any) => {
        if (c.parentId === cur && !result.has(c.id)) {
          result.add(c.id);
          queue.push(c.id);
        }
      });
    }
    return Array.from(result);
  };

  useEffect(() => {
    if (open) {
      setCodeFilter('');
      setNameFilter('');
      setSpecFilter('');
      setSelectedCategoryIds([]);
      setSelectedIds(externalSelectedIds || []);
    }
  }, [open, externalSelectedIds, defaultAttributeFilter]);

  const getStockQty = (productId: string) => {
    return batchInventories
      .filter((b) => b.productId === productId)
      .reduce((sum, b) => sum + ((b as any).remainingQuantity || b.quantity || 0), 0);
  };

  const filteredProducts = useMemo(() => {
    const effectiveCategoryIds = selectedCategoryIds.length > 0 ? collectCategoryIds(selectedCategoryIds) : [];
    return products
      .filter((p: any) => p && (p.status === 'enabled' || !p.status))
      .filter((p: any) => {
        if (codeFilter && !(p.code || '').toLowerCase().includes(codeFilter.toLowerCase())) return false;
        if (nameFilter && !(p.name || '').toLowerCase().includes(nameFilter.toLowerCase())) return false;
        if (specFilter && !(p.specification || '').toLowerCase().includes(specFilter.toLowerCase())) return false;
        if (onlyStocked && getStockQty(p.id) <= 0) return false;
        if (effectiveCategoryIds.length > 0) {
          const pCategoryId = p.categoryId || p.productCategoryId;
          // 匹配自身 categoryId，或匹配 categoryName（有些产品存的是名称）
          const catMatch = effectiveCategoryIds.includes(pCategoryId) ||
            (p.categoryName && effectiveCategoryIds.some(id => {
              const cat = categories.find((c: any) => c.id === id);
              return cat && cat.name === p.categoryName;
            }));
          if (!catMatch) return false;
        }
        return true;
      });
  }, [products, codeFilter, nameFilter, specFilter, onlyStocked, batchInventories, selectedCategoryIds, categories]);

  const columns: ColumnDef<any>[] = [
    { key: 'code', title: '物资编码' },
    { key: 'name', title: '物资名称' },
    { key: 'specification', title: '规格型号', render: (row: any) => row.specification || '-' },
    { key: 'unit', title: '单位' },
  ];

  if (showStockQty) {
    columns.push({
      key: 'stock',
      title: '库存数',
      align: 'right',
      render: (row: any) => {
        const stock = getStockQty(row.id);
        return (
          <span className={stock <= 0 ? 'text-[#909399]' : 'text-[#303133] font-medium'}>
            {stock}
          </span>
        );
      },
    });
  }

  // 校验：仅当 onlyStocked 为 true 时才验证选中产品是否有库存
  // 盘点场景（onlyStocked=false）允许选择库存为 0 的物资
  const allSelectedHaveStock = useMemo(() => {
    if (!onlyStocked || selectedIds.length === 0) return true;
    return selectedIds.every((id) => getStockQty(id) > 0);
  }, [selectedIds, batchInventories, onlyStocked]);

  const handleConfirm = () => {
    if (onlyStocked && !allSelectedHaveStock) {
      alert('所选物资中包含库存为 0 的物资，请重新选择');
      return;
    }
    const items = selectedIds
      .map((id) => products.find((p: any) => p?.id === id))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: categories.find((c: any) => c?.id === p.categoryId)?.name,
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
      <div className="mb-3 grid grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            placeholder="搜索物资编码"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="搜索物资名称"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            placeholder="搜索规格"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        {/* 物资分类多选筛选 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded text-left flex items-center justify-between hover:border-[#409eff]"
          >
            <span className="truncate">
              {selectedCategoryIds.length === 0
                ? '物资分类（可多选）'
                : `已选 ${selectedCategoryIds.length} 个分类`}
            </span>
            <svg className="w-3 h-3 ml-1 flex-shrink-0 text-[#909399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCategoryDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dcdfe6] rounded shadow-lg z-10 max-h-52 overflow-y-auto"
              onMouseLeave={() => setShowCategoryDropdown(false)}
            >
              <div
                className="px-3 py-1.5 text-xs text-[#606266] hover:bg-[#f5f7fa] cursor-pointer border-b border-[#ebeef5]"
                onClick={() => { setSelectedCategoryIds([]); setShowCategoryDropdown(false); }}
              >
                清除筛选
              </div>
              {topCategories.length === 0 && (
                <div className="px-3 py-4 text-xs text-center text-[#909399]">暂无分类数据</div>
              )}
              {topCategories.map((cat: any) => {
                const checked = selectedCategoryIds.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#f5f7fa] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                        } else {
                          setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id));
                        }
                      }}
                      className="rounded border-[#dcdfe6] accent-[#2f54eb]"
                    />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {selectedCategoryIds.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedCategoryIds.map(id => {
            const cat = categories.find((c: any) => c.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                {cat?.name || id}
                <button
                  onClick={() => setSelectedCategoryIds(selectedCategoryIds.filter(x => x !== id))}
                  className="hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

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
        <PrimaryButton onClick={handleConfirm} disabled={onlyStocked && !allSelectedHaveStock}>
          <Check size={14} />
          确认选择（{selectedIds.length}）
        </PrimaryButton>
      </div>
    </Modal>
  );
}
