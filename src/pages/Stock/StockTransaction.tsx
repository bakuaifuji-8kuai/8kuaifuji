import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useStore } from '@/store/useStore';
import type { StockTransaction } from '@/types';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const helpContent = {
  title: '库存流水 - 功能操作说明',
  description: '库存流水记录所有库存变动明细，包括入库、出库、盘点、调拨等操作，支持多条件筛选查询。',
  sections: [
    {
      heading: '流水筛选',
      items: [
        '按物资编码/名称模糊筛选流水记录',
        '按仓库筛选指定仓库的库存变动',
        '按更新类型筛选（入库、出库、盘点差异等）',
        '按时间范围筛选指定时间段的流水',
        '支持从库存查询页面跳转，自动筛选对应物资'
      ]
    },
    {
      heading: '流水明细',
      items: [
        '显示每笔库存变动的更新时间和类型',
        '显示物资信息、仓库、仓位等详细信息',
        '正数表示入库（库存增加），负数表示出库（库存减少）',
        '显示来源单号和来源类型，可追溯库存变动原因',
        '显示操作员和批次号等信息'
      ]
    }
  ]
};

export default function StockTransactionPage() {
  const stockTransactions = useStore((s) => s.stockTransactions);
  const warehouses = useStore((s) => s.warehouses);
  const products = useStore((s) => s.products);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlProductId = searchParams.get('productId') || '';
  const urlProductName = searchParams.get('productName') || '';

  const [filterProduct, setFilterProduct] = useState(urlProductName);
  const [filterSpecification, setFilterSpecification] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({
    product: urlProductName,
    productId: urlProductId,
    specification: '',
    warehouse: '',
    type: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    if (urlProductId || urlProductName) {
      setFilterProduct(urlProductName);
      setApplied((prev) => ({
        ...prev,
        product: urlProductName,
        productId: urlProductId,
      }));
    }
  }, [urlProductId, urlProductName]);

  const filteredData = useMemo(() => {
    return stockTransactions.filter((t) => {
      const product = products.find((p) => p?.id === t.productId);
      const spec = t.specification || product?.specification || '';
      // 优先按 productId 精确匹配（来自库存查询跳转）
      if (applied.productId && t.productId !== applied.productId) return false;
      // 否则按物资编码/名称模糊匹配
      if (
        applied.product &&
        !(t.productCode || '').includes(applied.product) &&
        !(t.productName || '').includes(applied.product)
      )
        return false;
      if (applied.specification && !spec.includes(applied.specification)) return false;
      if (applied.warehouse && t.warehouseId !== applied.warehouse) return false;
      if (applied.type && t.transactionType !== applied.type) return false;
      if (applied.from && t.transactionTime < applied.from) return false;
      if (applied.to && t.transactionTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [stockTransactions, products, applied]);

  const typeText = (t: string) => {
    if (t === 'inbound') return '入库';
    if (t === 'outbound') return '出库';
    if (t === 'check_diff') return '盘点差异';
    if (t === 'check_profit') return '盘点盘盈';
    if (t === 'check_loss') return '盘点盘亏';
    if (t === 'reversal') return '冲销';
    return t;
  };

  const typeColor = (t: string) => {
    if (t === 'inbound') return 'text-[#67c23a]';
    if (t === 'outbound') return 'text-[#f56c6c]';
    if (t === 'reversal') return 'text-[#909399]';
    return 'text-[#e6a23c]';
  };

  const columns: ColumnDef<StockTransaction>[] = [
    { key: 'transactionTime', title: '更新时间' },
    {
      key: 'type',
      title: '更新类型',
      render: (row) => (
        <span className={typeColor(row.transactionType)}>{typeText(row.transactionType)}</span>
      ),
    },
    { key: 'productCode', title: '物资编码' },
    { key: 'productName', title: '物资名称' },
    { key: 'specification', title: '规格型号', render: (row) => {
      const product = products.find((p) => p?.id === row.productId);
      return row.specification || product?.specification || '-';
    } },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => (
        <span className={row.quantity > 0 ? 'text-[#67c23a]' : 'text-[#f56c6c]'}>{row.quantity}</span>
      ),
      footer: (data: StockTransaction[]) => {
        const total = data.reduce((sum, item) => sum + item.quantity, 0);
        return `合计: ${total}`;
      },
    },
    { key: 'sourceOrderNo', title: '来源单号', render: (row) => row.sourceOrderNo || '-' },
    { key: 'sourceType', title: '来源类型', render: (row) => row.sourceType || '-' },
    { key: 'operator', title: '操作员' },
    { key: 'batchNo', title: '批次号', render: (row) => row.batchNo || '-' },
  ];

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const exportData = filteredData.map((item) => {
      const product = products.find((p) => p?.id === item.productId);
      const spec = item.specification || product?.specification || '-';
      return {
        '更新时间': item.transactionTime,
        '更新类型': typeText(item.transactionType),
        '物资编码': item.productCode,
        '物资名称': item.productName,
        '规格型号': spec,
        '仓库': item.warehouseName,
        '数量': item.quantity,
        '来源单号': item.sourceOrderNo || '-',
        '来源类型': item.sourceType || '-',
        '操作员': item.operator,
        '批次号': item.batchNo || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '库存流水');
    ws['!cols'] = [
      { wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 10 }, { wch: 18 },
      { wch: 15 }, { wch: 10 }, { wch: 15 }
    ];
    XLSX.writeFile(wb, `库存流水_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExportOpen(false);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">
          库存流水
          {urlProductName && (
            <span className="ml-2 text-xs text-[#2f54eb] font-normal">
              （已筛选：{urlProductName}）
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          {urlProductId && (
            <DefaultButton
              onClick={() => {
                searchParams.delete('productId');
                searchParams.delete('productName');
                setSearchParams(searchParams);
              }}
            >
              清除物资筛选
            </DefaultButton>
          )}
          <PrimaryButton onClick={() => setExportOpen(true)}>导出</PrimaryButton>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({
            product: filterProduct,
            productId: '',
            specification: filterSpecification,
            warehouse: filterWarehouse,
            type: filterType,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterProduct('');
          setFilterSpecification('');
          setFilterWarehouse('');
          setFilterType('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ product: '', productId: '', specification: '', warehouse: '', type: '', from: '', to: '' });
        }}
      >
        <SearchField label="物资" placeholder="编码/名称" value={filterProduct} onChange={setFilterProduct} />
        <SearchField label="规格型号" placeholder="输入规格型号" value={filterSpecification} onChange={setFilterSpecification} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">仓库：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
          >
            <option value="">全部</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">更新类型：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">全部</option>
            <option value="inbound">入库</option>
            <option value="outbound">出库</option>
            <option value="check_diff">盘点差异</option>
            <option value="reversal">冲销</option>
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} showFooter={true} />

      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-[500px] p-6">
            <h3 className="text-sm font-semibold text-[#303133] mb-3">导出流水</h3>
            <p className="text-xs text-[#606266] mb-4">
              将导出当前筛选结果，共 {filteredData.length} 条记录。
            </p>
            <div className="flex justify-end gap-2">
              <DefaultButton onClick={() => setExportOpen(false)}>取消</DefaultButton>
              <PrimaryButton onClick={handleExport}>确认导出</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
