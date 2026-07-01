import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import * as XLSX from 'xlsx';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface OutboundDetailRow {
  id: string;
  outboundTime: string;
  orderNo: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productCode: string;
  productName: string;
  specification?: string;
  unit?: string;
  quantity: number;
  unitPrice?: number;
  amount?: number;
  positionId?: string;
  positionName?: string;
  workOrderId?: string;
  workOrderCode?: string;
  workOrderName?: string;
  projectName?: string;
  operator?: string;
  receiver?: string;
}

const helpContent = {
  title: '出库明细报表 - 功能操作说明',
  description: '出库明细报表用于查看所有出库单的物资明细记录，支持多条件筛选和导出Excel。',
  sections: [
    {
      heading: '报表筛选',
      items: [
        '按仓库筛选指定仓库的出库明细',
        '按出库类型筛选（低值易耗领用、展会物资领用、报废、报损等）',
        '按出库单号模糊搜索',
        '按物资编码/名称模糊搜索',
        '按出库时段筛选指定时间段的记录',
        '按状态筛选（待确认、已出库）',
      ]
    },
    {
      heading: '报表数据说明',
      items: [
        '每条明细对应一条出库单的物资记录',
        '显示出库时间、出库单号、出库类型、状态等信息',
        '显示物资编码、名称、规格型号、单位、数量、单价、金额等',
        '列表底部显示数量合计',
      ]
    },
    {
      heading: '导出功能',
      items: [
        '点击"导出Excel"按钮导出当前筛选结果',
        '导出数据包含所有列表字段，方便数据分析和存档',
      ]
    }
  ]
};

const outboundTypeOptions = [
  { value: '', label: '全部' },
  { value: 'lowvalue', label: '低值易耗领用' },
  { value: 'exhibition', label: '展会物资领用' },
  { value: 'requisition', label: '领用出库' },
  { value: 'scrap', label: '报废出库' },
  { value: 'damaged', label: '报损出库' },
  { value: 'workorder', label: '工单出库' },
];

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'submitted', label: '已出库' },
  { value: 'confirmed', label: '已出库' },
];

export default function OutboundDetailReport() {
  const { outboundOrders, products: rawProducts, warehouses: rawWarehouses, positions: rawPositions } = useStore();
  const products = rawProducts || [];
  const warehouses = rawWarehouses || [];
  const positions = rawPositions || [];

  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [orderNoFilter, setOrderNoFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('');
  const [applied, setApplied] = useState({
    warehouse: '',
    type: '',
    orderNo: '',
    product: '',
    start: '',
    end: '',
    status: '',
  });

  const handleSearch = () => {
    setApplied({
      warehouse: warehouseFilter,
      type: typeFilter,
      orderNo: orderNoFilter,
      product: productFilter,
      start: dateRange.start,
      end: dateRange.end,
      status: statusFilter,
    });
  };

  const handleReset = () => {
    setWarehouseFilter('');
    setTypeFilter('');
    setOrderNoFilter('');
    setProductFilter('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('');
    setApplied({
      warehouse: '',
      type: '',
      orderNo: '',
      product: '',
      start: '',
      end: '',
      status: '',
    });
  };

  const reportData = useMemo(() => {
    const result: OutboundDetailRow[] = [];

    outboundOrders.forEach((order) => {
      if (applied.warehouse && order.warehouseId !== applied.warehouse) return;
      if (applied.type && order.type !== applied.type) return;
      if (applied.orderNo && !order.orderNo.includes(applied.orderNo)) return;
      if (applied.status && order.status !== applied.status) return;

      const orderDate = order.createTime?.slice(0, 10) || '';
      if (applied.start && orderDate < applied.start) return;
      if (applied.end && orderDate > applied.end) return;

      const typeLabel = (() => {
        const t = order.type as string;
        switch (t) {
          case 'lowvalue': return '低值易耗领用';
          case 'exhibition': return '展会物资领用';
          case 'requisition': return '领用出库';
          case 'scrap': return '报废出库';
          case 'damaged': return '报损出库';
          case 'workorder': return '工单出库';
          default: return t;
        }
      })();

      const statusLabel = (() => {
        switch (order.status) {
          case 'pending': return '待确认';
          case 'submitted': return '已出库';
          case 'confirmed': return '已出库';
          default: return order.status;
        }
      })();

      order.details.forEach((detail: any) => {
        if (applied.product) {
          const product = products.find(p => p && p.id === detail.productId);
          const code = product?.code || detail.productCode || '';
          const name = product?.name || detail.productName || '';
          if (!code.includes(applied.product) && !name.includes(applied.product)) return;
        }

        const product = products.find(p => p && p.id === detail.productId);
        const warehouse = warehouses.find(w => w && w.id === order.warehouseId);
        const position = positions.find(p => p && p.id === detail.positionId);

        const unitPrice = detail.unitPrice;
        const quantity = detail.quantity || 0;
        const amount = unitPrice != null ? quantity * unitPrice : undefined;

        result.push({
          id: `${order.id}-${detail.id}`,
          outboundTime: order.createTime,
          orderNo: order.orderNo,
          type: order.type,
          typeLabel,
          status: order.status,
          statusLabel,
          warehouseId: order.warehouseId,
          warehouseName: warehouse?.name || order.warehouseName || '',
          productId: detail.productId,
          productCode: product?.code || detail.productCode || '',
          productName: product?.name || detail.productName || '',
          specification: product?.specification,
          unit: product?.unit,
          quantity,
          unitPrice,
          amount,
          positionId: detail.positionId,
          positionName: position?.name || detail.positionName,
          workOrderId: detail.workOrderId,
          workOrderCode: detail.workOrderCode,
          workOrderName: detail.workOrderName,
          projectName: order.projectName,
          operator: order.operator,
          receiver: detail.receiver,
        });
      });
    });

    return result;
  }, [outboundOrders, products, warehouses, positions, applied]);

  const totalQuantity = reportData.reduce((sum, item) => sum + item.quantity, 0);

  const columns: ColumnDef<OutboundDetailRow>[] = [
    { accessorKey: 'outboundTime', header: '出库时间' },
    { accessorKey: 'orderNo', header: '出库单号' },
    { accessorKey: 'typeLabel', header: '出库类型' },
    { accessorKey: 'statusLabel', header: '状态' },
    { accessorKey: 'warehouseName', header: '仓库' },
    { accessorKey: 'productCode', header: '物资编码' },
    { accessorKey: 'productName', header: '物资名称' },
    { accessorKey: 'specification', header: '规格型号', cell: ({ row }: any) => row.original.specification || '-' },
    { accessorKey: 'unit', header: '单位', cell: ({ row }: any) => row.original.unit || '-' },
    {
      accessorKey: 'quantity',
      header: '数量',
      cell: ({ row }: any) => <span className="font-medium text-[#f56c6c]">{row.original.quantity}</span>,
      footer: (data: OutboundDetailRow[]) => {
        const total = data.reduce((sum: number, item: OutboundDetailRow) => sum + item.quantity, 0);
        return `合计: ${total}`;
      },
    },
    {
      accessorKey: 'unitPrice',
      header: '单价',
      cell: ({ row }: any) => row.original.unitPrice != null ? row.original.unitPrice : '-',
    },
    {
      accessorKey: 'amount',
      header: '金额',
      cell: ({ row }: any) => row.original.amount != null ? row.original.amount : '-',
    },
    { accessorKey: 'workOrderCode', header: '工单号', cell: ({ row }: any) => row.original.workOrderCode || '-' },
    { accessorKey: 'workOrderName', header: '工单名称', cell: ({ row }: any) => row.original.workOrderName || '-' },
    { accessorKey: 'projectName', header: '所属项目', cell: ({ row }: any) => row.original.projectName || '-' },
    { accessorKey: 'operator', header: '操作员', cell: ({ row }: any) => row.original.operator || '-' },
  ];

  const warehouseOptions = useMemo(() => {
    return [
      { value: '', label: '全部' },
      ...warehouses.map(w => ({ value: w.id, label: w.name })),
    ];
  }, [warehouses]);

  const handleExport = () => {
    if (reportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const exportData = reportData.map(item => ({
      '出库时间': item.outboundTime,
      '出库单号': item.orderNo,
      '出库类型': item.typeLabel,
      '状态': item.statusLabel,
      '仓库': item.warehouseName,
      '物资编码': item.productCode,
      '物资名称': item.productName,
      '规格型号': item.specification || '-',
      '单位': item.unit || '-',
      '数量': item.quantity,
      '单价': item.unitPrice != null ? item.unitPrice : '-',
      '金额': item.amount != null ? item.amount : '-',

      '工单号': item.workOrderCode || '-',
      '工单名称': item.workOrderName || '-',
      '所属项目': item.projectName || '-',
      '操作员': item.operator || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '出库明细报表');
    XLSX.writeFile(wb, `出库明细报表_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">出库明细报表</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <DefaultButton icon={<Download size={16} />} onClick={handleExport}>
          导出Excel
        </DefaultButton>
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
          label="出库类型"
          type="select"
          options={outboundTypeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <SearchField
          label="出库单号"
          type="input"
          value={orderNoFilter}
          onChange={setOrderNoFilter}
          width="w-[220px]"
        />
        <SearchField
          label="物资"
          type="input"
          value={productFilter}
          onChange={setProductFilter}
          width="w-[220px]"
        />
        <SearchField
          label="起始日期"
          type="date"
          value={dateRange.start}
          onChange={(v) => setDateRange({ ...dateRange, start: v })}
        />
        <SearchField
          label="结束日期"
          type="date"
          value={dateRange.end}
          onChange={(v) => setDateRange({ ...dateRange, end: v })}
        />
        <SearchField
          label="状态"
          type="select"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </SearchBar>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-500">明细记录数</p>
          <p className="text-2xl font-bold text-slate-900">{reportData.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-500">出库总数量</p>
          <p className="text-2xl font-bold text-rose-600">{totalQuantity}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-md">
          <p className="text-sm text-slate-500">物资种类</p>
          <p className="text-2xl font-bold text-slate-900">
            {new Set(reportData.map(item => item.productId)).size}
          </p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={reportData} columns={columns} pageSize={15} showFooter={true} />
      </div>
    </div>
  );
}
