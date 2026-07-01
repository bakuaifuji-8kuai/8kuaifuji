import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Position } from '@/types';

export default function PositionPage() {
  const positions = useStore((s) => s.positions);
  const warehouses = useStore((s) => s.warehouses);
  const addPosition = useStore((s) => s.addPosition);
  const updatePosition = useStore((s) => s.updatePosition);
  const deletePosition = useStore((s) => s.deletePosition);

  const [filterName, setFilterName] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [applied, setApplied] = useState({ name: '', warehouse: '' });

  const filteredData = useMemo(() => {
    return positions.filter((p) => {
      if (applied.name && !p.name.includes(applied.name)) return false;
      if (applied.warehouse && p.warehouseId !== applied.warehouse) return false;
      return true;
    });
  }, [positions, applied]);

  const warehouseName = (id: string) => warehouses.find((w) => w.id === id)?.name || '-';

  const columns: ColumnDef<Position>[] = [
    { key: 'code', title: '仓位编码' },
    { key: 'name', title: '仓位名称' },
    { key: 'warehouseId', title: '所属仓库', render: (row) => warehouseName(row.warehouseId) },
    { key: 'status', title: '状态', render: (row) => (
      <span className={row.status === 'enabled' ? 'text-[#67c23a]' : 'text-[#909399]'}>
        {row.status === 'enabled' ? '启用' : '停用'}
      </span>
    )},
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除仓位 ${row.name}？`)) deletePosition(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<Position | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    const newItem: Position = {
      id: 'POS' + Date.now(),
      code: '',
      name: '',
      warehouseId: warehouses[0]?.id || '',
      status: 'enabled',
    };
    setIsNew(true);
    setEditItem(newItem);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">仓位管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增仓位</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ name: filterName, warehouse: filterWarehouse })}
        onReset={() => {
          setFilterName('');
          setFilterWarehouse('');
          setApplied({ name: '', warehouse: '' });
        }}
      >
        <SearchField label="仓位名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">所属仓库：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
          >
            <option value="">全部</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增仓位' : '编辑仓位'}
        onClose={() => setEditItem(null)}
        width="max-w-[600px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">仓位编码 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.code}
                  onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">仓位名称 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">所属仓库</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.warehouseId}
                  onChange={(e) => setEditItem({ ...editItem, warehouseId: e.target.value })}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
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
              if (isNew) addPosition(editItem);
              else updatePosition(editItem.id, editItem);
              setEditItem(null);
            }}
          >保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
