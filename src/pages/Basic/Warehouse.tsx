import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Warehouse, WarehouseCategory, WarehouseProperty } from '@/types';

const warehouseCategoryOptions: { value: WarehouseCategory; label: string }[] = [
  { value: 'general', label: '综合仓' },
  { value: 'raw_material', label: '原料仓' },
  { value: 'finished_product', label: '成品仓' },
  { value: 'exhibition', label: '会展仓' },
  { value: 'consumable', label: '低值易耗仓' },
  { value: 'fixed_asset', label: '固定资产仓' },
];

const warehousePropertyOptions: { value: WarehouseProperty; label: string }[] = [
  { value: 'physical', label: '实物仓' },
  { value: 'virtual', label: '虚拟仓' },
];

// 生成仓库编码（系统自动生成，不可编辑）
function generateWarehouseCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WH${dateStr}${random}`;
}

// 生成仓库编号（可编辑）
function generateWarehouseNo(existingWarehouses: Warehouse[]): string {
  const prefix = 'CK';
  const maxNum = existingWarehouses.reduce((max, w) => {
    const match = w.warehouseNo.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  const nextNum = maxNum + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

export default function WarehousePage() {
  const warehouses = useStore((s) => s.warehouses);
  const addWarehouse = useStore((s) => s.addWarehouse);
  const updateWarehouse = useStore((s) => s.updateWarehouse);
  const deleteWarehouse = useStore((s) => s.deleteWarehouse);

  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [applied, setApplied] = useState({ name: '', code: '', category: '' });

  const filteredData = useMemo(() => {
    return warehouses.filter((w) => {
      if (applied.name && !w.name.includes(applied.name)) return false;
      if (applied.code && !(w.warehouseNo || '').includes(applied.code) && !(w.code || '').includes(applied.code)) return false;
      if (applied.category && w.category !== applied.category) return false;
      return true;
    });
  }, [warehouses, applied]);

  const columns: ColumnDef<Warehouse>[] = [
    { key: 'warehouseNo', title: '仓库编号' },
    { key: 'code', title: '系统编码' },
    { key: 'name', title: '仓库名称' },
    { key: 'categoryName', title: '仓库类别', render: (row) => row.categoryName || '-' },
    { key: 'propertyName', title: '仓库属性', render: (row) => row.propertyName || '-' },
    { key: 'manager', title: '管理人员', render: (row) => row.manager || '-' },
    { key: 'contactPhone', title: '联系电话', render: (row) => row.contactPhone || '-' },
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
      code: generateWarehouseCode(),
      warehouseNo: generateWarehouseNo(warehouses),
      name: '',
      category: 'general',
      categoryName: '综合仓',
      property: 'physical',
      propertyName: '实物仓',
      address: '',
      manager: '',
      contactPhone: '',
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
        onSearch={() => setApplied({ name: filterName, code: filterCode, category: filterCategory })}
        onReset={() => {
          setFilterName('');
          setFilterCode('');
          setFilterCategory('');
          setApplied({ name: '', code: '', category: '' });
        }}
      >
        <SearchField label="仓库名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField label="仓库编号" placeholder="请输入" value={filterCode} onChange={setFilterCode} />
        <SearchField label="仓库类别" type="select" value={filterCategory} onChange={setFilterCategory} options={warehouseCategoryOptions} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增仓库' : '编辑仓库'}
        onClose={() => setEditItem(null)}
        width="max-w-[800px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">仓库编号 <span className="text-[#f56c6c]">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.warehouseNo}
                  onChange={(e) => setEditItem({ ...editItem, warehouseNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">系统编码</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] focus:outline-none"
                  value={editItem.code}
                  readOnly
                  title="系统自动生成，不可编辑"
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
                <div className="mb-1 text-[#606266]">仓库类别 <span className="text-[#f56c6c]">*</span></div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.category}
                  onChange={(e) => {
                    const cat = e.target.value as WarehouseCategory;
                    const opt = warehouseCategoryOptions.find(o => o.value === cat);
                    setEditItem({ ...editItem, category: cat, categoryName: opt?.label || '' });
                  }}
                >
                  {warehouseCategoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">仓库属性 <span className="text-[#f56c6c]">*</span></div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.property}
                  onChange={(e) => {
                    const prop = e.target.value as WarehouseProperty;
                    const opt = warehousePropertyOptions.find(o => o.value === prop);
                    setEditItem({ ...editItem, property: prop, propertyName: opt?.label || '' });
                  }}
                >
                  {warehousePropertyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">管理人员</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.manager}
                  onChange={(e) => setEditItem({ ...editItem, manager: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">联系电话</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.contactPhone || ''}
                  onChange={(e) => setEditItem({ ...editItem, contactPhone: e.target.value })}
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
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <PrimaryButton
            onClick={() => {
              if (!editItem) return;
              if (!editItem.warehouseNo || !editItem.name) {
                alert('请填写必填项');
                return;
              }
              // 更新属性名称
              const propOpt = warehousePropertyOptions.find(o => o.value === editItem.property);
              const catOpt = warehouseCategoryOptions.find(o => o.value === editItem.category);
              const finalItem = {
                ...editItem,
                propertyName: propOpt?.label || '',
                categoryName: catOpt?.label || '',
              };
              if (isNew) addWarehouse(finalItem);
              else updateWarehouse(finalItem.id, finalItem);
              setEditItem(null);
            }}
          >保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
