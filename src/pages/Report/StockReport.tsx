import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { useStore } from '@/store/useStore';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '库存报表 - 功能操作说明',
  description: '库存报表用于统计当前库存数据，支持按仓库、物资等维度筛选，并可导出报表。',
  sections: [
    {
      heading: '报表筛选',
      items: [
        '按产品编码模糊筛选库存数据',
        '按产品名称模糊筛选库存数据',
        '按仓库筛选指定仓库的库存',
        '按项目筛选指定项目的库存',
        '实时显示统计结果，包含记录数和合计库存'
      ]
    },
    {
      heading: '导出报表',
      items: [
        '支持导出当前筛选结果',
        '导出数据包含产品编码、名称、规格、单位、仓库、所属项目、总库存等字段',
        '方便库存数据分析和存档'
      ]
    }
  ]
};

type Row = {
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  warehouse: string;
  projectId?: string;
  projectName?: string;
  total: number;
};

export default function StockReportPage() {
  const batchInventories = useStore((s) => s.batchInventories);
  const products = useStore((s) => s.products);
  const warehouses = useStore((s) => s.warehouses);
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);

  const [filterProductCode, setFilterProductCode] = useState('');
  const [filterProductName, setFilterProductName] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    productCode: '',
    productName: '',
    warehouse: '',
    project: '',
  });

  const rows: Row[] = useMemo(() => {
    const safeProducts = products || [];
    const safeWarehouses = warehouses || [];
    const safeBatchInventories = batchInventories || [];

    const aggregated: Record<string, { total: number; lastInboundTime?: string; projectName?: string }> = {};
    safeBatchInventories.forEach((b) => {
      const key = `${b.productId}||${b.warehouseId}||${b.projectId || 'none'}`;
      const current = aggregated[key];
      const newTime = b.inboundTime || '';
      aggregated[key] = {
        total: (current?.total || 0) + b.quantity,
        lastInboundTime: current?.lastInboundTime
          ? (newTime > current.lastInboundTime ? newTime : current.lastInboundTime)
          : newTime,
        projectName: current?.projectName || b.projectName,
      };
    });

    return Object.entries(aggregated)
      .map(([key, data]) => {
        const [productId, warehouseId, projectId] = key.split('||');
        const p = safeProducts.find((x) => x && x.id === productId);
        const w = safeWarehouses.find((x) => x && x.id === warehouseId);
        return {
          productCode: p?.code || productId,
          productName: p?.name || '-',
          specification: p?.specification || '-',
          unit: p?.unit || '-',
          warehouse: w?.name || warehouseId,
          projectId: projectId !== 'none' ? projectId : undefined,
          projectName: data.projectName,
          total: data.total,
        };
      })
      .filter((row) => {
        if (appliedFilter.productCode && !row.productCode.toLowerCase().includes(appliedFilter.productCode.toLowerCase())) {
          return false;
        }
        if (appliedFilter.productName && !row.productName.toLowerCase().includes(appliedFilter.productName.toLowerCase())) {
          return false;
        }
        if (appliedFilter.warehouse) {
          const w = safeWarehouses.find((x) => x && x.id === appliedFilter.warehouse);
          if (w && row.warehouse !== w.name) return false;
        }
        if (appliedFilter.project && row.projectId !== appliedFilter.project) {
          return false;
        }
        return true;
      });
  }, [batchInventories, products, warehouses, appliedFilter]);

  const columns: ColumnDef<Row>[] = [
    { key: 'productCode', title: '产品编码' },
    { key: 'productName', title: '产品名称' },
    { key: 'specification', title: '规格' },
    { key: 'unit', title: '单位' },
    { key: 'warehouse', title: '仓库' },
    { key: 'projectName', title: '所属项目', render: (row) => row.projectName || '-' },
    { key: 'total', title: '总库存', align: 'right' },
  ];

  const safeWarehouses = warehouses || [];
  const safeExhibitionProjects = exhibitionProjects || [];

  const warehouseOptions = [
    { value: '', label: '全部仓库' },
    ...safeWarehouses.map((w) => ({ value: w.id, label: w.name })),
  ];

  const projectOptions = [
    { value: '', label: '全部项目' },
    ...safeExhibitionProjects.map((p) => ({ value: p.id, label: p.projectName })),
  ];

  const totalQty = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">库存报表</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <DefaultButton>
          <Download size={16} />
          导出
        </DefaultButton>
      </div>

      <SearchBar
        onSearch={() =>
          setAppliedFilter({
            productCode: filterProductCode,
            productName: filterProductName,
            warehouse: filterWarehouse,
            project: filterProject,
          })
        }
        onReset={() => {
          setFilterProductCode('');
          setFilterProductName('');
          setFilterWarehouse('');
          setFilterProject('');
          setAppliedFilter({
            productCode: '',
            productName: '',
            warehouse: '',
            project: '',
          });
        }}
      >
        <SearchField
          label="产品编码"
          type="input"
          value={filterProductCode}
          onChange={setFilterProductCode}
          placeholder="请输入产品编码"
        />
        <SearchField
          label="产品名称"
          type="input"
          value={filterProductName}
          onChange={setFilterProductName}
          placeholder="请输入产品名称"
        />
        <SearchField
          label="仓库"
          type="select"
          options={warehouseOptions}
          value={filterWarehouse}
          onChange={setFilterWarehouse}
          placeholder="全部仓库"
        />
        <SearchField
          label="所属项目"
          type="select"
          options={projectOptions}
          value={filterProject}
          onChange={setFilterProject}
          placeholder="全部项目"
        />
      </SearchBar>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">记录数</p>
          <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">合计库存</p>
          <p className="text-2xl font-bold text-emerald-600">{totalQty.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={rows} columns={columns} />
      </div>
    </div>
  );
}
