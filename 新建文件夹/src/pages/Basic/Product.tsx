import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
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
import type { Product } from '@/types';

export default function ProductPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    categoryId: string;
    unit: string;
    specification: string;
    status: 'enabled' | 'disabled';
  }>({
    code: '',
    name: '',
    categoryId: '',
    unit: '',
    specification: '',
    status: 'enabled',
  });

  const filteredData = products
    .map(p => ({
      ...p,
      categoryName: categories.find(c => c.id === p.categoryId)?.name || '',
    }))
    .filter((item) => {
      const matchSearch = !searchText ||
        item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = !categoryFilter || item.categoryId === categoryFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });

  const columns: ColumnDef<Product & { categoryName?: string }, unknown>[] = [
    { accessorKey: 'code', header: '物资编码' },
    { accessorKey: 'name', header: '物资名称' },
    { accessorKey: 'categoryName', header: '分类' },
    { accessorKey: 'specification', header: '规格' },
    { accessorKey: 'unit', header: '单位' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'enabled' ? 'success' : 'default'}>
          {row.original.status === 'enabled' ? '启用' : '禁用'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <span className="text-red-500">删除</span>
          </Button>
        </div>
      ),
    },
  ];

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const statusOptions = [
    { value: 'enabled', label: '启用' },
    { value: 'disabled', label: '禁用' },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      categoryId: categoryOptions[0]?.value || '',
      unit: '',
      specification: '',
      status: 'enabled',
    });
    setModalOpen(true);
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      categoryId: item.categoryId,
      unit: item.unit,
      specification: item.specification || '',
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除吗？')) {
      deleteProduct(id);
    }
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateProduct(editingItem.id, formData);
    } else {
      addProduct({
        id: generateId(),
        ...formData,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">物资档案</h1>
        <Button onClick={handleAdd}>
          <Plus size={16} />
          新增物资
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索物资编码/名称..."
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
          <DataTable data={filteredData} columns={columns} pageSize={15} />
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? '编辑物资' : '新增物资'}
        size="lg"
      >
        <div className="space-y-4 min-w-[600px]">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="物资编码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              label="物资名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="物资分类"
              options={categoryOptions}
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            />
            <Input
              label="单位"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="如: 吨、个、台"
            />
          </div>
          <Input
            label="规格型号"
            value={formData.specification}
            onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
            placeholder="如: 10mm*1000mm*2000mm"
          />
          <Select
            label="状态"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'enabled' | 'disabled' })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
