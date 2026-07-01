import { useState } from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import DataTable from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import { formatNumber } from '@/utils';
import dayjs from 'dayjs';

interface AgingData {
  productId: string;
  productCode: string;
  productName: string;
  categoryName: string;
  specification: string;
  unit: string;
  quantity: number;
  warehouseName: string;
  avgDays: number;
  range0_29: number;
  range30_179: number;
  range180_359: number;
  range360_: number;
}

export default function LowValueAgingReportPage() {
  const { inventories, warehouses, products, categories } = useStore();
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // 计算库龄数据
  const reportData: AgingData[] = inventories
    .filter(inv => !warehouseFilter || inv.warehouseId === warehouseFilter)
    .map(inv => {
      const product = products.find(p => p.id === inv.productId);
      const category = categories.find(c => c.id === product?.categoryId);
      const warehouse = warehouses.find(w => w.id === inv.warehouseId);
      
      // 根据入库时间计算库龄
      const inboundDate = dayjs(inv.inboundTime);
      const today = dayjs();
      const avgDays = today.diff(inboundDate, 'day');
      
      // 根据库龄分配到不同区间
      let range0_29 = 0, range30_179 = 0, range180_359 = 0, range360_ = 0;
      if (avgDays <= 29) {
        range0_29 = inv.quantity;
      } else if (avgDays <= 179) {
        range30_179 = inv.quantity;
      } else if (avgDays <= 359) {
        range180_359 = inv.quantity;
      } else {
        range360_ = inv.quantity;
      }

      return {
        productId: inv.productId,
        productCode: product?.code || '',
        productName: product?.name || '',
        categoryName: category?.name || '',
        specification: product?.specification || '',
        unit: product?.unit || '',
        quantity: inv.quantity,
        warehouseName: warehouse?.name || '',
        avgDays,
        range0_29,
        range30_179,
        range180_359,
        range360_,
      };
    })
    .reduce((acc, curr) => {
      const existing = acc.find(a => a.productCode === curr.productCode && a.specification === curr.specification);
      if (existing) {
        existing.quantity += curr.quantity;
        existing.range0_29 += curr.range0_29;
        existing.range30_179 += curr.range30_179;
        existing.range180_359 += curr.range180_359;
        existing.range360_ += curr.range360_;
        existing.avgDays = Math.round((existing.avgDays + curr.avgDays) / 2);
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, [] as AgingData[]);

  // 计算汇总数据
  const summary = {
    totalQuantity: reportData.reduce((sum, item) => sum + item.quantity, 0),
    range0_29: reportData.reduce((sum, item) => sum + item.range0_29, 0),
    range30_179: reportData.reduce((sum, item) => sum + item.range30_179, 0),
    range180_359: reportData.reduce((sum, item) => sum + item.range180_359, 0),
    range360_: reportData.reduce((sum, item) => sum + item.range360_, 0),
  };

  const columns: ColumnDef<AgingData, unknown>[] = [
    { accessorKey: 'productCode', header: '物料代码' },
    { accessorKey: 'categoryName', header: '专业板块' },
    { accessorKey: 'specification', header: '规格型号' },
    { accessorKey: 'quantity', header: '库存数量', cell: ({ row }) => formatNumber(row.original.quantity) },
    { accessorKey: 'unit', header: '单位' },
    { accessorKey: 'range0_29', header: '0天至29天', cell: ({ row }) => formatNumber(row.original.range0_29) },
    { accessorKey: 'range30_179', header: '30天至179天', cell: ({ row }) => formatNumber(row.original.range30_179) },
    { accessorKey: 'range180_359', header: '180天至359天', cell: ({ row }) => formatNumber(row.original.range180_359) },
    { accessorKey: 'range360_', header: '360天以上', cell: ({ row }) => formatNumber(row.original.range360_) },
  ];

  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">低值易耗品库龄分析表</h1>
          <p className="text-sm text-slate-500 mt-1">统计日期：{dayjs().format('YYYY.MM.DD')}</p>
        </div>
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
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">库存总量</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(summary.totalQuantity)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">0-29天</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(summary.range0_29)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">30-179天</p>
              <p className="text-2xl font-bold text-yellow-900">{formatNumber(summary.range30_179)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600">180-359天</p>
              <p className="text-2xl font-bold text-orange-900">{formatNumber(summary.range180_359)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">360天以上</p>
              <p className="text-2xl font-bold text-red-900">{formatNumber(summary.range360_)}</p>
            </div>
          </div>

          <DataTable data={reportData} columns={columns} pageSize={15} />

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-end gap-4">
              <span className="font-medium text-slate-700">合计：</span>
              <span className="font-bold text-slate-900">{formatNumber(summary.totalQuantity)}</span>
              <span className="text-slate-500 mx-4">|</span>
              <span className="text-green-600">{formatNumber(summary.range0_29)}</span>
              <span className="text-slate-500 mx-4">|</span>
              <span className="text-yellow-600">{formatNumber(summary.range30_179)}</span>
              <span className="text-slate-500 mx-4">|</span>
              <span className="text-orange-600">{formatNumber(summary.range180_359)}</span>
              <span className="text-slate-500 mx-4">|</span>
              <span className="text-red-600">{formatNumber(summary.range360_)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
