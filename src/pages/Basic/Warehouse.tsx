import { useMemo, useRef, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Warehouse, WarehouseCategory, WarehouseProperty } from '@/types';

const warehouseCategoryOptions: { value: WarehouseCategory; label: string }[] = [
  { value: 'exhibition', label: '展会物资仓' },
  { value: 'consumable', label: '低值易耗品仓' },
  { value: 'fixed_asset', label: '固定资产仓' },
];

const warehousePropertyOptions: { value: WarehouseProperty; label: string }[] = [
  { value: 'physical', label: '实物仓' },
  { value: 'virtual', label: '虚拟仓' },
];

// 施工单位选项（项目里实际用的 3 家）
const constructionUnitOptions: string[] = ['上海锦华', '湖南警安', '中裕电力'];

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
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);
  const addWarehouse = useStore((s) => s.addWarehouse);
  const updateWarehouse = useStore((s) => s.updateWarehouse);
  const deleteWarehouse = useStore((s) => s.deleteWarehouse);

  // 标记用户是否手动修改过仓库名称（手动改过后不再自动覆盖）
  const nameEditedRef = useRef(false);

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
      key: 'allowNegativeInventory',
      title: '允许负库存',
      render: (row) => (
        <span className={row.allowNegativeInventory ? 'text-[#67c23a]' : 'text-[#909399]'}>
          {row.allowNegativeInventory ? '是' : '否'}
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
    nameEditedRef.current = false;
    const newItem: Warehouse = {
      id: 'WH' + Date.now(),
      code: generateWarehouseCode(),
      warehouseNo: generateWarehouseNo(warehouses),
      name: '',
      category: 'exhibition',
      categoryName: '展会物资仓',
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
            {/* 仓库属性（移到最顶） */}
            <div>
              <div className="mb-1 text-[#606266]">仓库属性 <span className="text-[#f56c6c]">*</span></div>
              <select
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                value={editItem.property}
                onChange={(e) => {
                  const prop = e.target.value as WarehouseProperty;
                  const opt = warehousePropertyOptions.find(o => o.value === prop);
                  // 从虚拟仓切回实物仓时，清空虚拟仓专属字段
                  if (prop === 'physical') {
                    setEditItem({
                      ...editItem,
                      property: prop,
                      propertyName: opt?.label || '',
                      exhibitionId: undefined,
                      exhibitionName: undefined,
                      constructionUnit: undefined,
                    });
                  } else {
                    // 切到虚拟仓时，如果已经有展会+施工单位，自动生成名称
                    const autoName = editItem.exhibitionName && editItem.constructionUnit
                      ? `${editItem.exhibitionName}${editItem.constructionUnit}仓库`
                      : editItem.name;
                    setEditItem({
                      ...editItem,
                      property: prop,
                      propertyName: opt?.label || '',
                      name: autoName,
                    });
                  }
                }}
              >
                {warehousePropertyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 虚拟仓专属：所属展会 + 所属施工单位 */}
            {editItem.property === 'virtual' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f5f7fa] rounded border border-dashed border-[#dcdfe6]">
                <div>
                  <div className="mb-1 text-[#606266]">所属展会 <span className="text-[#f56c6c]">*</span></div>
                  <select
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.exhibitionId || ''}
                    onChange={(e) => {
                      const proj = exhibitionProjects.find(p => p.id === e.target.value);
                      const newExhibitionId = e.target.value;
                      const newExhibitionName = proj?.projectName || '';
                      // 自动生成名称：展会名 + 施工单位 + 仓库（仅当用户没手动改过名称时）
                      let autoName = editItem.name;
                      if (!nameEditedRef.current && newExhibitionName && editItem.constructionUnit) {
                        autoName = `${newExhibitionName}${editItem.constructionUnit}仓库`;
                      }
                      setEditItem({ ...editItem, exhibitionId: newExhibitionId, exhibitionName: newExhibitionName, name: autoName });
                    }}
                  >
                    <option value="">— 请选择所属展会 —</option>
                    {exhibitionProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.projectName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">所属施工单位 <span className="text-[#f56c6c]">*</span></div>
                  <select
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.constructionUnit || ''}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      // 自动生成名称：展会名 + 施工单位 + 仓库（仅当用户没手动改过名称时）
                      let autoName = editItem.name;
                      if (!nameEditedRef.current && editItem.exhibitionName && newUnit) {
                        autoName = `${editItem.exhibitionName}${newUnit}仓库`;
                      }
                      setEditItem({ ...editItem, constructionUnit: newUnit, name: autoName });
                    }}
                  >
                    <option value="">— 请选择所属施工单位 —</option>
                    {constructionUnitOptions.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 基础信息区（两列网格） */}
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
                  onChange={(e) => {
                    // 用户手动改了名称，标记一下，后面不再自动覆盖
                    if (e.target.value !== editItem.name) nameEditedRef.current = true;
                    setEditItem({ ...editItem, name: e.target.value });
                  }}
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
            <div className="flex items-center justify-between">
              <div className="text-[#606266]">允许库存为负</div>
              <button
                className={`w-10 h-5 rounded-full transition-colors ${editItem.allowNegativeInventory ? 'bg-[#67c23a]' : 'bg-[#dcdfe6]'}`}
                onClick={() => setEditItem({ ...editItem, allowNegativeInventory: !editItem.allowNegativeInventory })}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${editItem.allowNegativeInventory ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
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
              // 虚拟仓专属校验
              if (editItem.property === 'virtual') {
                if (!editItem.exhibitionId) { alert('虚拟仓请选择所属展会'); return; }
                if (!editItem.constructionUnit) { alert('虚拟仓请选择所属施工单位'); return; }
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
