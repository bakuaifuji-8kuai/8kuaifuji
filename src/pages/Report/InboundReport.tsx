import { useState } from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '入库报表 - 功能操作说明',
  description: '入库报表用于统计和分析入库数据，支持按时间、仓库、物资等条件筛选，并可导出报表。',
  sections: [
    {
      heading: '报表筛选',
      items: [
        '按仓库筛选指定仓库的入库数据',
        '按时间范围筛选指定时间段的入库记录',
        '报表按产品维度汇总入库数量和入库单数',
        '实时显示统计结果，包含入库单数、产品种类、入库总量'
      ]
    },
    {
      heading: '导出报表',
      items: [
        '点击"导出"按钮可导出当前筛选结果',
        '导出数据包含产品编码、名称、规格、单位、入库单数、入库数量等字段',
        '支持按当前筛选条件导出，方便数据分析和存档'
      ]
    }
  ]
};

export default function InboundReportPage() {
  const { inboundOrders, products, warehouses } = useStore();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ warehouse: '', startDate: '', endDate: '' });

  const filteredOrders = inboundOrders
    .filter(o => o.status === 'submitted')
    .filter((item) => {
      const matchWarehouse = !appliedFilter.warehouse || item.warehouseId === appliedFilter.warehouse;
      const matchDate = (!appliedFilter.startDate || item.createTime >= appliedFilter.startDate) &&
        (!appliedFilter.endDate || item.createTime <= appliedFilter.endDate + ' 23:59:59');
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
        totalQuantity,
        orderCount: filteredOrders.filter(o => o.details.some(d => d.productId === p.id)).length,
      };
    })
    .filter(p => p.totalQuantity > 0);

  const totalQuantity = productSummary.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalProducts = productSummary.length;
  const totalOrders = filteredOrders.length;

  const columns: ColumnDef<typeof productSummary[0], unknown>[] = [
    { accessorKey: 'productCode', header: '产品编码' },
    { accessorKey: 'productName', header: '产品名称' },
    { accessorKey: 'specification', header: '规格' },
    { accessorKey: 'unit', header: '单位' },
    { accessorKey: 'orderCount', header: '入库单数' },
    { accessorKey: 'totalQuantity', header: '入库数量' },
  ];

  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">入库汇总表（按产品）</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <DefaultButton>
            <Download size={16} />
            导出
          </DefaultButton>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setAppliedFilter({ warehouse: warehouseFilter, startDate: dateRange.start, endDate: dateRange.end })
        }
        onReset={() => {
          setWarehouseFilter('');
          setDateRange({ start: '', end: '' });
          setAppliedFilter({ warehouse: '', startDate: '', endDate: '' });
        }}
      >
        <SearchField
          label="仓库"
          type="select"
          options={warehouseOptions}
          value={warehouseFilter}
          onChange={setWarehouseFilter}
          placeholder="全部仓库"
        />
        <SearchField label="起始日期" type="date" value={dateRange.start} onChange={(v) => setDateRange({ ...dateRange, start: v })} />
        <SearchField label="结束日期" type="date" value={dateRange.end} onChange={(v) => setDateRange({ ...dateRange, end: v })} />
      </SearchBar>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">入库单数</p>
          <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">产品种类</p>
          <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">入库总量</p>
          <p className="text-2xl font-bold text-emerald-600">{totalQuantity}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={productSummary} columns={columns} pageSize={15} />
      </div>
    </div>
  );
}
