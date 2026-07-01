import { useMemo } from 'react';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';

type Row = {
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  warehouse: string;
  total: number;
};

export default function StockReportPage() {
  const batchInventories = useStore((s) => s.batchInventories);
  const products = useStore((s) => s.products);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);

  const rows: Row[] = useMemo(() => {
    const aggregated: Record<string, number> = {};
    batchInventories.forEach((b) => {
      const key = `${b.productId}-${b.warehouseId}`;
      aggregated[key] = (aggregated[key] || 0) + b.quantity;
    });
    return Object.entries(aggregated).map(([key, total]) => {
      const [productId, warehouseId] = key.split('-');
      const p = products.find((x) => x.id === productId);
      const w = warehouses.find((x) => x.id === warehouseId);
      return {
        productCode: p?.code || productId,
        productName: p?.name || '-',
        specification: p?.specification || '-',
        unit: p?.unit || '-',
        warehouse: w?.name || positions.find((x) => x.id === warehouseId)?.name || warehouseId,
        total,
      };
    });
  }, [batchInventories, products, warehouses, positions]);

  const columns: ColumnDef<Row>[] = [
    { key: 'productCode', title: '产品编码' },
    { key: 'productName', title: '产品名称' },
    { key: 'specification', title: '规格' },
    { key: 'unit', title: '单位' },
    { key: 'warehouse', title: '仓库/仓位' },
    { key: 'total', title: '总库存', align: 'right' },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">库存报表</h2>
      </div>
      <DataTable data={rows} columns={columns} />
    </div>
  );
}
