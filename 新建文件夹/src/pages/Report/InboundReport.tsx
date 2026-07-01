import { useState } from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import DataTable from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';

export default function InboundReportPage() {
  const { inboundOrders, products, warehouses } = useStore();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredOrders = inboundOrders
    .filter(o => o.status === 'submitted')
    .filter((item) => {
      const matchWarehouse = !warehouseFilter || item.warehouseId === warehouseFilter;
      const matchDate = (!dateRange.start || item.createTime >= dateRange.start) &&
        (!dateRange.end || item.createTime <= dateRange.end + ' 23:59:59');
      return matchWarehouse && matchDate;
    });

  const productSummary = products
    .map(p => {
      const details = filteredOrders.flatMap(o => o.details.filter(d => d.productId === p.id));
      const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0);
      return {
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        specification: p.specification,
        unit: p.unit,
        categoryName: p.categoryName,
        totalQuantity,
        orderCount: filteredOrders.filter(o => o.details.some(d => d.productId === p.id)).length,
      };
    })
    .filter(p => p.totalQuantity > 0)
    .filter(p => !categoryFilter || p.categoryName === categoryFilter);

  const totalQuantity = productSummary.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalProducts = productSummary.length;
  const totalOrders = filteredOrders.length;

  const columns: ColumnDef<typeof productSummary[0], unknown>[] = [
    { accessorKey: 'productCode', header: '产品编码' },
    { accessorKey: 'productName', header: '产品名称' },
    { accessorKey: 'specification', header: '规格' },
    { accessorKey: 'unit', header: '单位' },
    { accessorKey: 'categoryName', header: '产品分类' },
    { accessorKey: 'orderCount', header: '入库单数' },
    { accessorKey: 'totalQuantity', header: '入库数量' },
  ];

  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));
  const categoryOptions = [...new Set(products.map(p => p.categoryName))].filter(Boolean).map(c => ({ value: c, label: c }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">入库汇总表（按产品）</h1>
        <Button variant="secondary">
          <Download size={16} />
          导出
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              options={warehouseOptions}
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              placeholder="全部仓库"
            />
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="全部分类"
            />
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-40"
            />
            <span className="text-slate-500">至</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">入库单数</p>
              <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">产品种类</p>
              <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">产品分类</p>
              <p className="text-2xl font-bold text-slate-900">{categoryOptions.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">入库总量</p>
              <p className="text-2xl font-bold text-emerald-600">{totalQuantity}</p>
            </div>
          </div>

          <DataTable data={productSummary} columns={columns} pageSize={15} />
        </CardBody>
      </Card>
    </div>
  );
}
