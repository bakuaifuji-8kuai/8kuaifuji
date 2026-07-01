import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ProductCategory } from '@/types';

export default function CategoryPage() {
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);

  const [filterName, setFilterName] = useState('');
  const [applied, setApplied] = useState({ name: '' });

  const filteredData = useMemo(() => {
    return categories.filter((c) => !applied.name || c.name.includes(applied.name));
  }, [categories, applied]);

  const columns: ColumnDef<ProductCategory>[] = [
    { key: 'code', title: '分类编码' },
    { key: 'name', title: '分类名称' },
    { key: 'codePrefix', title: '编码前缀', render: (row) => row.codePrefix || '-' },
    { key: 'parentId', title: '上级分类', render: (row) => {
      if (row.parentId) {
        const parent = categories.find((c) => c.id === row.parentId);
        return parent?.name || '-';
      }
      return '-';
    }},
    { key: 'sort', title: '排序', align: 'right', render: (row) => row.sort },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除分类 ${row.name}？`)) deleteCategory(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<ProductCategory | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    const newItem: ProductCategory = {
      id: 'CAT' + Date.now(),
      code: '',
      name: '',
      sort: (categories.length + 1),
    };
    setIsNew(true);
    setEditItem(newItem);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">物资分类</h2>
        <PrimaryButton onClick={openAdd}>+ 新增分类</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ name: filterName })}
        onReset={() => {
          setFilterName('');
          setApplied({ name: '' });
        }}
      >
        <SearchField label="分类名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增分类' : '编辑分类'}
        onClose={() => setEditItem(null)}
        width="max-w-[600px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">分类编码 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.code}
                  onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">编码前缀</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.codePrefix || ''}
                  onChange={(e) => setEditItem({ ...editItem, codePrefix: e.target.value.toUpperCase() })}
                  placeholder="如 QD、RD"
                  maxLength={10}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">分类名称 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">上级分类</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.parentId || ''}
                  onChange={(e) => setEditItem({ ...editItem, parentId: e.target.value })}
                >
                  <option value="">无</option>
                  {categories
                    .filter((c) => c.id !== editItem.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">排序</div>
                <input
                  type="number"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.sort}
                  onChange={(e) => setEditItem({ ...editItem, sort: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <PrimaryButton
            onClick={() => {
              if (!editItem) return;
              if (!editItem.code || !editItem.name) {
                alert('请填写必填项');
                return;
              }
              if (isNew) addCategory(editItem);
              else updateCategory(editItem.id, editItem);
              setEditItem(null);
            }}
          >保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
