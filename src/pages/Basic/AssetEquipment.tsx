import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { PrimaryButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { useStore } from '@/store/useStore';
import { generateId } from '@/utils';
import type { AssetEquipment } from '@/types';
import { generateAssetCode } from '@/mock/data';

export default function AssetEquipmentPage() {
  const { assetEquipments, addAssetEquipment, updateAssetEquipment, deleteAssetEquipment } = useStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ searchText: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<AssetEquipment | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetEquipment | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    specification: '',
    unit: '',
    amount: 0,
    storageLocation: '',
    status: 'in_storage' as 'in_storage' | 'in_use' | 'scrapped' | 'written_off',
    remark: '',
  });

  const filteredData = assetEquipments
    .filter(a => !appliedFilter.status || a.status === appliedFilter.status)
    .filter(a => !appliedFilter.searchText ||
      a.code.toLowerCase().includes(appliedFilter.searchText.toLowerCase()) ||
      a.name.toLowerCase().includes(appliedFilter.searchText.toLowerCase())
    );

  const columns: ColumnDef<AssetEquipment, unknown>[] = [
    { accessorKey: 'code', header: '设备编码' },
    { accessorKey: 'name', header: '设备名称' },
    { accessorKey: 'specification', header: '规格型号' },
    {
      accessorKey: 'amount',
      header: '金额',
      cell: ({ row }) => `¥${row.original.amount.toLocaleString()}`,
    },
    { accessorKey: 'storageLocation', header: '存放地点' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
          in_storage: 'default',
          in_use: 'success',
          scrapped: 'danger',
          written_off: 'warning',
        };
        const labels: Record<string, string> = {
          in_storage: '在仓',
          in_use: '领用中',
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
          <TextButton onClick={() => handleView(row.original)}>查看</TextButton>
          <TextButton onClick={() => handleEdit(row.original)}>编辑</TextButton>
          <TextButton type="danger" onClick={() => handleDelete(row.original)}>删除</TextButton>
        </div>
      ),
    },
  ];

  const handleOpenModal = (asset?: AssetEquipment) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        code: asset.code,
        name: asset.name,
        specification: asset.specification || '',
        unit: asset.unit,
        amount: asset.amount,
        storageLocation: asset.storageLocation,
        status: asset.status,
        remark: asset.remark || '',
      });
    } else {
      setEditingAsset(null);
      setFormData({
        code: generateAssetCode(),
        name: '',
        specification: '',
        unit: '台',
        amount: 0,
        storageLocation: '',
        status: 'in_storage',
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

    if (editingAsset) {
      updateAssetEquipment(editingAsset.id, {
        ...formData,
      });
    } else {
      addAssetEquipment({
        id: generateId(),
        ...formData,
        warehouseId: '',
        warehouseName: '',
        positionId: '',
        positionName: '',
        createTime: new Date().toISOString().slice(0, 10),
        changeLogs: [],
      });
    }
    setModalOpen(false);
  };

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'in_storage', label: '在仓' },
    { value: 'in_use', label: '领用中' },
    { value: 'scrapped', label: '已报废' },
    { value: 'written_off', label: '已报损' },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">资产设备档案</h2>
        <PrimaryButton onClick={() => handleOpenModal()}>
          <Plus size={16} />
          新增设备
        </PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setAppliedFilter({ searchText, status: statusFilter })}
        onReset={() => {
          setSearchText('');
          setStatusFilter('');
          setAppliedFilter({ searchText: '', status: '' });
        }}
      >
        <SearchField
          label="设备"
          placeholder="输入设备编码/名称"
          value={searchText}
          onChange={setSearchText}
        />
        <SearchField
          label="状态"
          type="select"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} pageSize={10} />

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
          <Input
            label="存放地点"
            value={formData.storageLocation}
            onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            placeholder="如：车间A区"
          />
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
              <div><span className="text-slate-500">规格型号：</span>{viewingAsset.specification || '-'}</div>
              <div><span className="text-slate-500">计量单位：</span>{viewingAsset.unit}</div>
              <div><span className="text-slate-500">金额：</span>¥{viewingAsset.amount.toLocaleString()}</div>
              <div><span className="text-slate-500">存放地点：</span>{viewingAsset.storageLocation}</div>
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
