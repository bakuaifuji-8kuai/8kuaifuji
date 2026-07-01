import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Supplier } from '@/types';

export default function SupplierPage() {
  const suppliers = useStore((s) => s.suppliers);
  const addSupplier = useStore((s) => s.addSupplier);
  const updateSupplier = useStore((s) => s.updateSupplier);
  const deleteSupplier = useStore((s) => s.deleteSupplier);

  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [applied, setApplied] = useState({ name: '', code: '' });

  const filteredData = useMemo(() => {
    return suppliers.filter((s) => {
      if (applied.name && !s.name.includes(applied.name)) return false;
      if (applied.code && !(s.code || '').includes(applied.code)) return false;
      return true;
    });
  }, [suppliers, applied]);

  const columns: ColumnDef<Supplier>[] = [
    { key: 'code', title: '供应商编码' },
    { key: 'name', title: '供应商名称' },
    { key: 'contact', title: '联系人', render: (row) => row.contact || '-' },
    { key: 'phone', title: '电话', render: (row) => row.phone || '-' },
    { key: 'address', title: '地址', render: (row) => row.address || '-' },
    {
      key: 'status',
      title: '状态',
      render: (row) => (
        <span className={row.status === 'enabled' ? 'text-[#67c23a]' : 'text-[#909399]'}>
          {row.status === 'enabled' ? '启用' : '停用'}
        </span>
      ),
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除供应商 ${row.name}？`)) deleteSupplier(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    const newItem: Supplier = {
      id: 'SUP' + Date.now(),
      code: '',
      name: '',
      contact: '',
      phone: '',
      address: '',
      status: 'enabled',
    };
    setIsNew(true);
    setEditItem(newItem);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">供应商管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增供应商</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ name: filterName, code: filterCode })}
        onReset={() => {
          setFilterName('');
          setFilterCode('');
          setApplied({ name: '', code: '' });
        }}
      >
        <SearchField label="供应商名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField label="供应商编码" placeholder="请输入" value={filterCode} onChange={setFilterCode} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增供应商' : '编辑供应商'}
        onClose={() => setEditItem(null)}
        width="max-w-[700px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">供应商编码 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.code}
                  onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">供应商名称 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">联系人</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.contact}
                  onChange={(e) => setEditItem({ ...editItem, contact: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">电话</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.phone}
                  onChange={(e) => setEditItem({ ...editItem, phone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <div className="mb-1 text-[#606266]">地址</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.address}
                  onChange={(e) => setEditItem({ ...editItem, address: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">状态</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                >
                  <option value="enabled">启用</option>
                  <option value="disabled">停用</option>
                </select>
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
              if (isNew) addSupplier(editItem);
              else updateSupplier(editItem.id, editItem);
              setEditItem(null);
            }}
          >保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
