import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { useStore } from '@/store/useStore';
import { cn, generateId } from '@/utils';
import type { AssetEquipment } from '@/types';
import { generateAssetCode } from '@/mock/data';

export default function AssetEquipmentPage() {
  const { assetEquipments, categories, warehouses, positions, addAssetEquipment, updateAssetEquipment, deleteAssetEquipment } = useStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<AssetEquipment | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetEquipment | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    specification: '',
    unit: '',
    amount: 0,
    storageLocation: '',
    warehouseId: '',
    positionId: '',
    status: 'in_use' as 'in_use' | 'scrapped' | 'written_off',
    remark: '',
  });

  const filteredData = assetEquipments
    .filter(a => !statusFilter || a.status === statusFilter)
    .filter(a => !categoryFilter || a.categoryId === categoryFilter)
    .filter(a => !searchText ||
      a.code.toLowerCase().includes(searchText.toLowerCase()) ||
      a.name.toLowerCase().includes(searchText.toLowerCase())
    );

  const columns: ColumnDef<AssetEquipment, unknown>[] = [
    { accessorKey: 'code', header: '设备编码' },
    { accessorKey: 'name', header: '设备名称' },
    {
      accessorKey: 'categoryId',
      header: '分类',
      cell: ({ row }) => categories.find(c => c.id === row.original.categoryId)?.name || '-',
    },
    { accessorKey: 'specification', header: '规格型号' },
    {
      accessorKey: 'amount',
      header: '金额',
      cell: ({ row }) => `¥${row.original.amount.toLocaleString()}`,
    },
    { accessorKey: 'storageLocation', header: '存放地点' },
    { accessorKey: 'warehouseName', header: '仓库' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
          in_use: 'success',
          scrapped: 'danger',
          written_off: 'default',
        };
        const labels: Record<string, string> = {
          in_use: '在用',
          scrapped: '已报废',
          written_off: '已报损',
        };
        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => handleView(row.original)}>查看</Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>编辑</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original)}><span className="text-red-500">删除</span></Button>
        </div>
      ),
    },
  ];

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const warehouseOptions = warehouses.filter(w => w.status === 'enabled').map(w => ({ value: w.id, label: w.name }));

  const handleOpenModal = (asset?: AssetEquipment) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        code: asset.code,
        name: asset.name,
        categoryId: asset.categoryId,
        specification: asset.specification || '',
        unit: asset.unit,
        amount: asset.amount,
        storageLocation: asset.storageLocation,
        warehouseId: asset.warehouseId,
        positionId: asset.positionId,
        status: asset.status,
        remark: asset.remark || '',
      });
    } else {
      setEditingAsset(null);
      setFormData({
        code: generateAssetCode(),
        name: '',
        categoryId: categoryOptions[0]?.value || '',
        specification: '',
        unit: '台',
        amount: 0,
        storageLocation: '',
        warehouseId: warehouseOptions[0]?.value || '',
        positionId: '',
        status: 'in_use',
        remark: '',
      });
    }
    setModalOpen(true);
  };

  const handleView = (asset: AssetEquipment) => {
    setViewingAsset(asset);
    setDetailModalOpen(true);
  };

  const handleEdit = (asset: AssetEquipment) => {
    handleOpenModal(asset);
  };

  const handleDelete = (asset: AssetEquipment) => {
    if (confirm(`确认删除设备"${asset.name}"吗？`)) {
      deleteAssetEquipment(asset.id);
    }
  };

  const handleSubmit = () => {
    if (!formData.name) {
      alert('请填写设备名称');
      return;
    }
    if (!formData.warehouseId) {
      alert('请选择仓库');
      return;
    }

    const warehouse = warehouses.find(w => w.id === formData.warehouseId);
    const position = positions.find(p => p.id === formData.positionId);
    const category = categories.find(c => c.id === formData.categoryId);

    if (editingAsset) {
      updateAssetEquipment(editingAsset.id, {
        ...formData,
        warehouseName: warehouse?.name,
        positionName: position?.name,
        categoryName: category?.name,
      });
    } else {
      addAssetEquipment({
        id: generateId(),
        ...formData,
        warehouseName: warehouse?.name,
        positionName: position?.name,
        categoryName: category?.name,
        createTime: new Date().toISOString().slice(0, 10),
      });
    }
    setModalOpen(false);
  };

  const statusOptions = [
    { value: 'in_use', label: '在用' },
    { value: 'scrapped', label: '已报废' },
    { value: 'written_off', label: '已报损' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">资产设备档案</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={16} />
          新增设备
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索设备编码/名称..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="全部分类"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="全部状态"
            />
          </div>
        </CardHeader>
        <CardBody>
          <DataTable data={filteredData} columns={columns} pageSize={10} />
        </CardBody>
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAsset ? '编辑设备' : '新增设备'}
        size="lg"
      >
        <div className="space-y-4 min-w-[600px]">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="设备编码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled
            />
            <Input
              label="设备名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入设备名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="设备分类"
              options={categoryOptions}
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              placeholder="选择分类"
            />
            <Input
              label="规格型号"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="请输入规格型号"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="计量单位"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="如：台、辆"
            />
            <Input
              label="金额"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <Select
              label="状态"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="存放地点"
              value={formData.storageLocation}
              onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              placeholder="如：车间A区"
            />
            <Select
              label="仓库"
              options={warehouseOptions}
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value, positionId: '' })}
              placeholder="选择仓库"
            />
          </div>
          <Input
            label="备注"
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            placeholder="备注信息"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      {/* 查看详情模态框 */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="设备详情"
        size="lg"
      >
        {viewingAsset && (
          <div className="space-y-4 min-w-[600px]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">设备编码：</span>{viewingAsset.code}</div>
              <div><span className="text-slate-500">设备名称：</span>{viewingAsset.name}</div>
              <div><span className="text-slate-500">设备分类：</span>{viewingAsset.categoryName}</div>
              <div><span className="text-slate-500">规格型号：</span>{viewingAsset.specification || '-'}</div>
              <div><span className="text-slate-500">计量单位：</span>{viewingAsset.unit}</div>
              <div><span className="text-slate-500">金额：</span>¥{viewingAsset.amount.toLocaleString()}</div>
              <div><span className="text-slate-500">存放地点：</span>{viewingAsset.storageLocation}</div>
              <div><span className="text-slate-500">仓库：</span>{viewingAsset.warehouseName}</div>
              <div><span className="text-slate-500">仓位：</span>{viewingAsset.positionName}</div>
              <div><span className="text-slate-500">状态：</span>
                <Badge variant={viewingAsset.status === 'in_use' ? 'success' : 'danger'}>
                  {viewingAsset.status === 'in_use' ? '在用' : viewingAsset.status === 'scrapped' ? '已报废' : '已报损'}
                </Badge>
              </div>
              <div><span className="text-slate-500">登记日期：</span>{viewingAsset.createTime}</div>
              <div><span className="text-slate-500">备注：</span>{viewingAsset.remark || '-'}</div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
