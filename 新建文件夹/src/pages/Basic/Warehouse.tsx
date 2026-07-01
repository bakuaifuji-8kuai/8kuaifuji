import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Warehouse } from '@/types';

export default function WarehousePage() {
  const warehouses = useStore((s) => s.warehouses);
  const addWarehouse = useStore((s) => s.addWarehouse);
  const updateWarehouse = useStore((s) => s.updateWarehouse);
  const deleteWarehouse = useStore((s) => s.deleteWarehouse);

  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [applied, setApplied] = useState({ name: '', code: '' });

  const filteredData = useMemo(() => {
    return warehouses.filter((w) => {
      if (applied.name && !w.name.includes(applied.name)) return false;
      if (applied.code && !(w.code || '').includes(applied.code)) return false;
      return true;
    });
  }, [warehouses, applied]);

  const columns: ColumnDef<Warehouse>[] = [
    { key: 'code', title: '仓库编码' },
    { key: 'name', title: '仓库名称' },
    { key: 'address', title: '地址', render: (row) => row.address || '-' },
    { key: 'manager', title: '联系人', render: (row) => row.manager || '-' },
    { key: 'contact', title: '电话', render: () => '-' },
    { key: 'status', title: '状态', render: (row) => (
      <span className={row.status === 'enabled' ? 'text-[#67c23a]' : 'text-[#909399]'}>
        {row.status === 'enabled' ? '启用' : '停用'}
      </span>
    )},
    { key: 'remark', title: '备注', render: (row) => (row as any).remark || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除仓库 ${row.name}？`)) deleteWarehouse(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<Warehouse | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    const newItem: Warehouse = {
      id: 'WH' + Date.now(),
      code: '',
      name: '',
      address: '',
      manager: '',
      status: 'enabled',
      createTime: new Date().toISOString().slice(0, 10),
    };
    setIsNew(true);
    setEditItem(newItem);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">仓库管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增仓库</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ name: filterName, code: filterCode })}
        onReset={() => {
          setFilterName('');
          setFilterCode('');
          setApplied({ name: '', code: '' });
        }}
      >
        <SearchField label="仓库名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField label="仓库编码" placeholder="请输入" value={filterCode} onChange={setFilterCode} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增仓库' : '编辑仓库'}
        onClose={() => setEditItem(null)}
        width="max-w-[700px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">仓库编码 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.code}
                  onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">仓库名称 <span className="text-[#f56c6c]">*</span></div>
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
                  value={editItem.manager}
                  onChange={(e) => setEditItem({ ...editItem, manager: e.target.value })}
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
            <div>
              <div className="mb-1 text-[#606266]">地址</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.address}
                onChange={(e) => setEditItem({ ...editItem, address: e.target.value })}
              />
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
              if (isNew) addWarehouse(editItem);
              else updateWarehouse(editItem.id, editItem);
              setEditItem(null);
            }}
          >保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
