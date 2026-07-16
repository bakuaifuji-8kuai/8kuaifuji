import { useState } from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import { formatNumber } from '@/utils';
import dayjs from 'dayjs';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

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

const helpContent = {
  title: '低值易耗品账龄报表 - 功能操作说明',
  description: '按仓库/物资/账龄区间统计低值易耗品库存账龄；支持导出报表',
  sections: [
    {
      heading: '数据筛选',
      items: [
        '可按仓库筛选特定仓库的库存账龄数据',
        '系统自动统计当前日期的库存账龄情况',
      ]
    },
    {
      heading: '账龄区间说明',
      items: [
        '0天至29天：库龄在30天以内的库存',
        '30天至179天：库龄在30天至179天的库存',
        '180天至359天：库龄在180天至359天的库存',
        '360天以上：库龄超过360天的库存',
      ]
    },
    {
      heading: '其他操作',
      items: [
        '顶部统计卡片展示各账龄区间的库存汇总数量',
        '点击"导出"按钮导出当前筛选结果',
      ]
    }
  ]
};

export default function LowValueAgingReportPage() {
  const { inventories, warehouses, products, categories } = useStore();
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ warehouse: '' });

  // 计算库龄数据
  const reportData: AgingData[] = inventories
    .filter(inv => !appliedFilter.warehouse || inv.warehouseId === appliedFilter.warehouse)
    .map(inv => {
      const product = products.find(p => p.id === inv.productId);
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

      const category = categories.find(c => c.id === product?.categoryId);
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
    { accessorKey: 'categoryName', header: '物资分类' },
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
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">低值易耗品库龄分析表</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <DefaultButton>
          <Download size={16} />
          导出
        </DefaultButton>
      </div>

      <SearchBar
        onSearch={() => setAppliedFilter({ warehouse: warehouseFilter })}
        onReset={() => {
          setWarehouseFilter('');
          setAppliedFilter({ warehouse: '' });
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
      </SearchBar>

      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <p className="text-xs text-[#909399] mb-1">库存总量</p>
          <p className="text-xl font-semibold text-[#303133]">{formatNumber(summary.totalQuantity)}</p>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <p className="text-xs text-[#909399] mb-1">0-29天</p>
          <p className="text-xl font-semibold text-[#67c23a]">{formatNumber(summary.range0_29)}</p>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <p className="text-xs text-[#909399] mb-1">30-179天</p>
          <p className="text-xl font-semibold text-[#e6a23c]">{formatNumber(summary.range30_179)}</p>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <p className="text-xs text-[#909399] mb-1">180-359天</p>
          <p className="text-xl font-semibold text-[#e6a23c]">{formatNumber(summary.range180_359)}</p>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <p className="text-xs text-[#909399] mb-1">360天以上</p>
          <p className="text-xl font-semibold text-[#f56c6c]">{formatNumber(summary.range360_)}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={reportData} columns={columns} pageSize={15} />

        <div className="mt-4 border-t border-[#ebeef5] pt-4 px-4 pb-4">
          <div className="flex items-center justify-end gap-4 text-xs">
            <span className="font-medium text-[#606266]">合计：</span>
            <span className="font-bold text-[#303133]">{formatNumber(summary.totalQuantity)}</span>
            <span className="text-[#c0c4cc] mx-4">|</span>
            <span className="text-[#67c23a]">{formatNumber(summary.range0_29)}</span>
            <span className="text-[#c0c4cc] mx-4">|</span>
            <span className="text-[#e6a23c]">{formatNumber(summary.range30_179)}</span>
            <span className="text-[#c0c4cc] mx-4">|</span>
            <span className="text-[#e6a23c]">{formatNumber(summary.range180_359)}</span>
            <span className="text-[#c0c4cc] mx-4">|</span>
            <span className="text-[#f56c6c]">{formatNumber(summary.range360_)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
