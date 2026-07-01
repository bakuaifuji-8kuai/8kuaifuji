import { useState } from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import { formatNumber, formatDate } from '@/utils';
import dayjs from 'dayjs';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface SluggishData {
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  quantity: number;
  unit: string;
  lastTransactionDate: string;
  sluggishDays: number;
}

const helpContent = {
  title: '库存呆滞报表 - 功能操作说明',
  description: '按仓库/物资/呆滞天数统计库存呆滞物资；支持导出报表',
  sections: [
    {
      heading: '数据筛选',
      items: [
        '可按仓库筛选特定仓库的呆滞物资数据',
        '系统自动按呆滞天数从大到小排序展示',
      ]
    },
    {
      heading: '呆滞天数说明',
      items: [
        '呆滞天数 = 当前日期 - 最后异动日期',
        '最后异动日期取入库单、出库单和库存入库时间中的最新日期',
        '30天以内：正常周转库存',
        '30-90天：关注级呆滞',
        '90-180天：预警级呆滞',
        '180天以上：严重呆滞',
      ]
    },
    {
      heading: '其他操作',
      items: [
        '顶部统计卡片展示物料种类、库存总量和平均呆滞天数',
        '点击"导出"按钮导出当前筛选结果',
      ]
    }
  ]
};

export default function StockSluggishReportPage() {
  const { inventories, warehouses, products, inboundOrders, outboundOrders } = useStore();
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ warehouse: '' });

  // 获取某货品在某仓库的最后异动日期
  const getLastTransactionDate = (productId: string, warehouseId: string): string => {
    const dates: string[] = [];

    // 检查入库单中的最后日期
    inboundOrders.forEach(order => {
      if (order.warehouseId === warehouseId) {
        const hasProduct = order.details.some(d => d.productId === productId);
        if (hasProduct) {
          dates.push(order.createTime);
        }
      }
    });

    // 检查出库单中的最后日期
    outboundOrders.forEach(order => {
      if (order.warehouseId === warehouseId) {
        const hasProduct = order.details.some(d => d.productId === productId);
        if (hasProduct) {
          dates.push(order.createTime);
        }
      }
    });

    // 检查库存的入库时间
    inventories.forEach(inv => {
      if (inv.productId === productId && inv.warehouseId === warehouseId) {
        if (inv.inboundTime) {
          dates.push(inv.inboundTime);
        }
      }
    });

    if (dates.length === 0) {
      return dayjs().format('YYYY-MM-DD');
    }

    // 返回最后日期
    return dates.sort().reverse()[0];
  };

  // 呆滞物料数据
  const reportData: SluggishData[] = inventories
    .filter(inv => !appliedFilter.warehouse || inv.warehouseId === appliedFilter.warehouse)
    .map(inv => {
      const product = products.find(p => p.id === inv.productId);
      const lastTransactionDate = getLastTransactionDate(inv.productId, inv.warehouseId);
      const sluggishDays = dayjs().diff(dayjs(lastTransactionDate), 'day');

      return {
        productId: inv.productId,
        productCode: product?.code || '',
        productName: product?.name || '',
        specification: product?.specification || '-',
        quantity: inv.quantity,
        unit: product?.unit || '',
        lastTransactionDate,
        sluggishDays,
      };
    })
    .reduce((acc, curr) => {
      const existing = acc.find(a => a.productCode === curr.productCode && a.specification === curr.specification);
      if (existing) {
        existing.quantity += curr.quantity;
        // 使用更久的异动日期（更呆滞的）
        if (dayjs(curr.lastTransactionDate).isBefore(dayjs(existing.lastTransactionDate))) {
          existing.lastTransactionDate = curr.lastTransactionDate;
          existing.sluggishDays = curr.sluggishDays;
        }
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, [] as SluggishData[])
    // 按呆滞天数从大到小排序
    .sort((a, b) => b.sluggishDays - a.sluggishDays);

  // 计算汇总数据
  const summary = {
    totalQuantity: reportData.reduce((sum, item) => sum + item.quantity, 0),
    totalItems: reportData.length,
    avgSluggishDays: reportData.length > 0
      ? Math.round(reportData.reduce((sum, item) => sum + item.sluggishDays, 0) / reportData.length)
      : 0,
  };

  const columns: ColumnDef<SluggishData, unknown>[] = [
    { accessorKey: 'productCode', header: '物料长代码' },
    { accessorKey: 'productName', header: '物料名称' },
    { accessorKey: 'specification', header: '规格型号' },
    { accessorKey: 'quantity', header: '数量', cell: ({ row }) => formatNumber(row.original.quantity) },
    { accessorKey: 'unit', header: '单位' },
    { accessorKey: 'lastTransactionDate', header: '最后异动日期', cell: ({ row }) => formatDate(row.original.lastTransactionDate) },
    {
      accessorKey: 'sluggishDays',
      header: '呆滞天数',
      cell: ({ row }) => (
        <span className={`font-medium ${
          row.original.sluggishDays >= 180 ? 'text-red-600' :
          row.original.sluggishDays >= 90 ? 'text-orange-600' :
          row.original.sluggishDays >= 30 ? 'text-yellow-600' :
          'text-slate-600'
        }`}>
          {row.original.sluggishDays}天
        </span>
      ),
    },
  ];

  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">库存呆滞分析表</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <DefaultButton>
          <Download size={16} />
          导出
        </DefaultButton>
      </div>
      <p className="text-xs text-[#909399] mb-3">统计日期：{dayjs().format('YYYY.MM.DD')}</p>

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

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">物料种类</p>
          <p className="text-2xl font-bold text-slate-900">{summary.totalItems}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600">库存总量</p>
          <p className="text-2xl font-bold text-blue-900">{formatNumber(summary.totalQuantity)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600">平均呆滞天数</p>
          <p className="text-2xl font-bold text-orange-900">{summary.avgSluggishDays}天</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={reportData} columns={columns} pageSize={15} />

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center justify-end gap-4">
            <span className="font-medium text-slate-700">合计数量：</span>
            <span className="font-bold text-slate-900">{formatNumber(summary.totalQuantity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
