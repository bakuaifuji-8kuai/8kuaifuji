import { useState } from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '出库报表 - 功能操作说明',
  description: '出库报表用于统计和分析出库数据，支持按时间、仓库、物资、部门等条件筛选，并可导出报表。',
  sections: [
    {
      heading: '报表筛选',
      items: [
        '按仓库筛选指定仓库的出库数据',
        '按时间范围筛选指定时间段的出库记录',
        '报表按产品维度汇总出库数量和出库单数',
        '实时显示统计结果，包含出库单数、产品种类、出库总量'
      ]
    },
    {
      heading: '导出报表',
      items: [
        '点击"导出"按钮可导出当前筛选结果',
        '导出数据包含产品编码、名称、规格、单位、出库单数、出库数量等字段',
        '支持按当前筛选条件导出，方便数据分析和存档'
      ]
    }
  ]
};

export default function OutboundReportPage() {
  const { outboundOrders, products, warehouses } = useStore();
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ warehouse: '', startDate: '', endDate: '' });

  const filteredOrders = outboundOrders
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
    { accessorKey: 'orderCount', header: '出库单数' },
    { accessorKey: 'totalQuantity', header: '出库数量' },
  ];

  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));

  const handleSearch = () => {
    setAppliedFilter({ warehouse: warehouseFilter, startDate, endDate });
  };

  const handleReset = () => {
    setWarehouseFilter('');
    setStartDate('');
    setEndDate('');
    setAppliedFilter({ warehouse: '', startDate: '', endDate: '' });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">出库汇总表（按产品）</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <DefaultButton icon={<Download size={16} />}>
            导出
          </DefaultButton>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} onReset={handleReset}>
        <SearchField
          label="仓库"
          type="select"
          options={warehouseOptions}
          value={warehouseFilter}
          onChange={setWarehouseFilter}
        />
        <SearchField
          label="起始日期"
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <SearchField
          label="结束日期"
          type="date"
          value={endDate}
          onChange={setEndDate}
        />
      </SearchBar>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-500">出库单数</p>
          <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-500">产品种类</p>
          <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-500">出库总量</p>
          <p className="text-2xl font-bold text-blue-600">{totalQuantity}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={productSummary} columns={columns} pageSize={15} />
      </div>
    </div>
  );
}
