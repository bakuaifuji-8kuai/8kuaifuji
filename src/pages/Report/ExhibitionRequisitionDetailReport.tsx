import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/common/DataTable';
import { DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { useStore } from '@/store/useStore';
import * as XLSX from 'xlsx';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface ExhibitionProductDetail {
  exhibitionName: string;
  implementUnit: string;
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  outboundQuantity: number;
  returnQuantity: number;
  diff: number;
}

const helpContent = {
  title: '展会物资领用报表详情 - 功能操作说明',
  description: '按展会+实施单位+物资维度展示展会物资领用明细数据；支持多维度筛选和导出',
  sections: [
    {
      heading: '数据筛选',
      items: [
        '可按展会筛选特定展会的领用数据',
        '可按实施单位筛选特定实施单位的领用数据',
        '可按日期范围筛选出库单日期内的数据',
        '可按物资编码、物资名称、规格进行筛选',
        '支持多条件组合筛选，点击"搜索"应用筛选条件',
      ]
    },
    {
      heading: '报表数据说明',
      items: [
        '以展会名称+实施单位+物资为维度汇总统计物资领用情况',
        '领用数量：该物资在该展会+实施单位下的出库数量汇总（已确认出库）',
        '归还数量：该物资在该展会+实施单位下的退库数量汇总（已确认入库）',
        '差异 = 领用数量 - 归还数量（即在用数）',
        '差异为正数表示尚未归还，为负数表示多还了',
      ]
    },
    {
      heading: '其他操作',
      items: [
        '点击左上角"返回"按钮可返回上一页',
        '点击"导出Excel"按钮导出当前筛选结果',
      ]
    }
  ]
};

export default function ExhibitionRequisitionDetailReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { outboundOrders, returnOrders, products, workOrderConfigs } = useStore();
  const [filterExhibition, setFilterExhibition] = useState('');
  const [filterImplementUnit, setFilterImplementUnit] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterProductCode, setFilterProductCode] = useState('');
  const [filterProductName, setFilterProductName] = useState('');
  const [filterSpecification, setFilterSpecification] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    exhibition: '',
    implementUnit: '',
    startDate: '',
    endDate: '',
    productCode: '',
    productName: '',
    specification: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const exhibition = params.get('exhibition') || '';
    const implementUnit = params.get('implementUnit') || '';
    if (exhibition || implementUnit) {
      setFilterExhibition(exhibition);
      setFilterImplementUnit(implementUnit);
      setAppliedFilter({
        exhibition,
        implementUnit,
        startDate: '',
        endDate: '',
        productCode: '',
        productName: '',
        specification: '',
      });
    }
  }, [location.search]);

  const IMPLEMENT_UNIT_OPTIONS = [
    { value: '会展服务部', label: '会展服务部' },
    { value: '工程技术部', label: '工程技术部' },
    { value: '市场部', label: '市场部' },
    { value: '综合管理部', label: '综合管理部' },
  ];

  const reportData = useMemo(() => {
    const exhibitionOutboundOrders = outboundOrders.filter(
      o => o.type === 'exhibition' && o.status === 'confirmed'
    );

    const confirmedReturnOrders = returnOrders.filter(
      r => r.type === 'return' && r.status === 'confirmed'
    );

    const detailMap = new Map<string, ExhibitionProductDetail>();

    const getKey = (exhibitionName: string, implementUnit: string, productId: string) =>
      `${exhibitionName}|${implementUnit}|${productId}`;

    exhibitionOutboundOrders.forEach(order => {
      const orderDate = order.createTime?.slice(0, 10) || '';

      if (appliedFilter.startDate && orderDate < appliedFilter.startDate) return;
      if (appliedFilter.endDate && orderDate > appliedFilter.endDate) return;

      const implementUnit = (order as any).implementUnit || '';
      
      let exhibitionName = '';
      const firstDetail = order.details[0];
      if (firstDetail && (firstDetail as any).workOrderId) {
        const config = workOrderConfigs.find(c => c.workOrderId === (firstDetail as any).workOrderId);
        exhibitionName = config?.exhibitionName || '';
      }

      if (!exhibitionName) return;

      order.details.forEach((detail: any) => {
        if (detail.productId) {
          const product = products.find((p: any) => p?.id === detail.productId);
          const productCode = product?.code || detail.productCode || '';
          const productName = product?.name || detail.productName || '';
          const specification = product?.specification || detail.specification || '';
          const unit = product?.unit || detail.unit || '';

          const key = getKey(exhibitionName, implementUnit, detail.productId);
          const existing = detailMap.get(key);
          if (existing) {
            existing.outboundQuantity += detail.quantity || 0;
          } else {
            detailMap.set(key, {
              exhibitionName,
              implementUnit,
              productId: detail.productId,
              productCode,
              productName,
              specification,
              unit,
              outboundQuantity: detail.quantity || 0,
              returnQuantity: 0,
              diff: 0,
            });
          }
        }
      });
    });

    confirmedReturnOrders.forEach(returnOrder => {
      const sourceOrder = exhibitionOutboundOrders.find(o => o.id === returnOrder.sourceOrderId);
      if (!sourceOrder) return;

      const returnDate = returnOrder.createTime?.slice(0, 10) || '';

      if (appliedFilter.startDate && returnDate < appliedFilter.startDate) return;
      if (appliedFilter.endDate && returnDate > appliedFilter.endDate) return;

      const implementUnit = (sourceOrder as any).implementUnit || '';
      
      let exhibitionName = '';
      const firstDetail = sourceOrder.details[0];
      if (firstDetail && (firstDetail as any).workOrderId) {
        const config = workOrderConfigs.find(c => c.workOrderId === (firstDetail as any).workOrderId);
        exhibitionName = config?.exhibitionName || '';
      }

      if (!exhibitionName) return;

      returnOrder.details.forEach((detail: any) => {
        if (detail.productId) {
          const product = products.find((p: any) => p?.id === detail.productId);
          const productCode = product?.code || detail.productCode || '';
          const productName = product?.name || detail.productName || '';
          const specification = product?.specification || detail.specification || '';
          const unit = product?.unit || detail.unit || '';

          const key = getKey(exhibitionName, implementUnit, detail.productId);
          const existing = detailMap.get(key);
          if (existing) {
            existing.returnQuantity += detail.quantity || 0;
          } else {
            detailMap.set(key, {
              exhibitionName,
              implementUnit,
              productId: detail.productId,
              productCode,
              productName,
              specification,
              unit,
              outboundQuantity: 0,
              returnQuantity: detail.quantity || 0,
              diff: 0,
            });
          }
        }
      });
    });

    let result = Array.from(detailMap.values()).map(item => ({
      ...item,
      diff: item.outboundQuantity - item.returnQuantity,
    }));

    if (appliedFilter.exhibition) {
      result = result.filter(item => item.exhibitionName === appliedFilter.exhibition);
    }
    if (appliedFilter.implementUnit) {
      result = result.filter(item => item.implementUnit === appliedFilter.implementUnit);
    }
    if (appliedFilter.productCode) {
      const code = appliedFilter.productCode.toLowerCase();
      result = result.filter(item =>
        item.productCode.toLowerCase().includes(code)
      );
    }
    if (appliedFilter.productName) {
      const name = appliedFilter.productName.toLowerCase();
      result = result.filter(item =>
        item.productName.toLowerCase().includes(name)
      );
    }
    if (appliedFilter.specification) {
      const spec = appliedFilter.specification.toLowerCase();
      result = result.filter(item =>
        item.specification.toLowerCase().includes(spec)
      );
    }

    result.sort((a, b) => {
      const exhibitionCompare = a.exhibitionName.localeCompare(b.exhibitionName);
      if (exhibitionCompare !== 0) return exhibitionCompare;
      const unitCompare = a.implementUnit.localeCompare(b.implementUnit);
      if (unitCompare !== 0) return unitCompare;
      return a.productName.localeCompare(b.productName);
    });

    return result;
  }, [outboundOrders, returnOrders, appliedFilter, workOrderConfigs, products]);

  const totalRows = reportData.length;
  const totalOutbound = reportData.reduce((sum, d) => sum + d.outboundQuantity, 0);
  const totalReturn = reportData.reduce((sum, d) => sum + d.returnQuantity, 0);
  const totalDiff = totalOutbound - totalReturn;

  const columns: ColumnDef<ExhibitionProductDetail, unknown>[] = [
    {
      accessorKey: 'exhibitionName',
      header: '展会名称',
      cell: ({ row }) => row.original.exhibitionName || '-',
    },
    {
      accessorKey: 'implementUnit',
      header: '实施单位',
      cell: ({ row }) => row.original.implementUnit || '-',
    },
    {
      accessorKey: 'productCode',
      header: '物资编码',
      cell: ({ row }) => row.original.productCode || '-',
    },
    {
      accessorKey: 'productName',
      header: '物资名称',
      cell: ({ row }) => row.original.productName || '-',
    },
    {
      accessorKey: 'specification',
      header: '规格',
      cell: ({ row }) => row.original.specification || '-',
    },
    {
      accessorKey: 'unit',
      header: '单位',
      cell: ({ row }) => row.original.unit || '-',
    },
    {
      accessorKey: 'outboundQuantity',
      header: '领用数量',
      cell: ({ row }) => (
        <span className="text-blue-600 font-medium">{row.original.outboundQuantity}</span>
      ),
    },
    {
      accessorKey: 'returnQuantity',
      header: '归还数量',
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">{row.original.returnQuantity}</span>
      ),
    },
    {
      id: 'diff',
      header: '在用数',
      cell: ({ row }) => {
        const diff = row.original.diff;
        return (
          <span className={diff > 0 ? 'text-orange-600 font-medium' : diff < 0 ? 'text-red-600 font-medium' : 'text-slate-500'}>
            {diff > 0 ? '+' : ''}{diff}
          </span>
        );
      },
    },
  ];

  const exhibitionOptions = useMemo(() => {
    const set = new Set<string>();
    outboundOrders
      .filter(o => o.type === 'exhibition' && o.status === 'confirmed')
      .forEach(order => {
        const firstDetail = order.details[0];
        if (firstDetail && (firstDetail as any).workOrderId) {
          const config = workOrderConfigs.find(c => c.workOrderId === (firstDetail as any).workOrderId);
          if (config?.exhibitionName) {
            set.add(config.exhibitionName);
          }
        }
      });
    return Array.from(set).map(name => ({ value: name, label: name }));
  }, [outboundOrders, workOrderConfigs]);

  const handleSearch = () => {
    setAppliedFilter({
      exhibition: filterExhibition,
      implementUnit: filterImplementUnit,
      startDate: filterStartDate,
      endDate: filterEndDate,
      productCode: filterProductCode,
      productName: filterProductName,
      specification: filterSpecification,
    });
  };

  const handleReset = () => {
    setFilterExhibition('');
    setFilterImplementUnit('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterProductCode('');
    setFilterProductName('');
    setFilterSpecification('');
    setAppliedFilter({
      exhibition: '',
      implementUnit: '',
      startDate: '',
      endDate: '',
      productCode: '',
      productName: '',
      specification: '',
    });
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const exportData = reportData.map(item => ({
      '展会名称': item.exhibitionName || '-',
      '实施单位': item.implementUnit || '-',
      '物资编码': item.productCode || '-',
      '物资名称': item.productName || '-',
      '规格': item.specification || '-',
      '单位': item.unit || '-',
      '领用数量': item.outboundQuantity,
      '归还数量': item.returnQuantity,
      '在用数': item.diff,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '展会物资领用明细');
    XLSX.writeFile(wb, `展会物资领用明细_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[#606266] hover:text-[#303133] text-sm"
          >
            <ArrowLeft size={16} />
            返回
          </button>
          <h2 className="text-sm font-semibold text-[#303133]">展会物资领用报表详情</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <div className="flex items-center gap-2">
          <DefaultButton onClick={handleExport}>
            <Download size={16} />
            导出
          </DefaultButton>
        </div>
      </div>

      <SearchBar
        onSearch={handleSearch}
        onReset={handleReset}
      >
        <SearchField
          label="展会"
          type="select"
          options={exhibitionOptions}
          value={filterExhibition}
          onChange={setFilterExhibition}
          placeholder="全部展会"
        />
        <SearchField
          label="实施单位"
          type="select"
          options={IMPLEMENT_UNIT_OPTIONS}
          value={filterImplementUnit}
          onChange={setFilterImplementUnit}
          placeholder="全部单位"
        />
        <SearchField
          label="开始日期"
          type="date"
          value={filterStartDate}
          onChange={setFilterStartDate}
        />
        <SearchField
          label="结束日期"
          type="date"
          value={filterEndDate}
          onChange={setFilterEndDate}
        />
        <SearchField
          label="物资编码"
          type="input"
          value={filterProductCode}
          onChange={setFilterProductCode}
          placeholder="输入物资编码"
        />
        <SearchField
          label="物资名称"
          type="input"
          value={filterProductName}
          onChange={setFilterProductName}
          placeholder="输入物资名称"
        />
        <SearchField
          label="规格"
          type="input"
          value={filterSpecification}
          onChange={setFilterSpecification}
          placeholder="输入规格"
        />
      </SearchBar>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">记录数</p>
          <p className="text-2xl font-bold text-slate-900">{totalRows}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">领用总数量</p>
          <p className="text-2xl font-bold text-blue-600">{totalOutbound}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">归还总数量</p>
          <p className="text-2xl font-bold text-green-600">{totalReturn}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-500">在用数</p>
          <p className="text-2xl font-bold text-orange-600">{totalDiff}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={reportData} columns={columns} pageSize={15} />
      </div>
    </div>
  );
}
