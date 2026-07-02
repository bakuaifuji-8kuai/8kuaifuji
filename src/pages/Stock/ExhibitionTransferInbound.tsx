import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import MultiSelect from '@/components/common/MultiSelect';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import PrintDocument from '@/components/common/PrintDocument';
import { useStore } from '@/store/useStore';
import type { StockTransfer, StockTransferDetail } from '@/types';
import { Eye, Printer, ArrowDownToLine } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '展会物资调拨入库 - 功能操作说明',
  description: '展会物资调拨入库用于确认接收从其他展会仓库调拨来的物资，支持入库确认操作。',
  sections: [
    {
      heading: '入库确认',
      items: [
        '列表显示待入库确认的调拨单',
        '点击"入库确认"按钮确认接收物资',
        '确认后增加调入仓库库存（生成新批次）',
        '同步生成调拨入库流水记录',
        '入库确认后单据状态更新为已完成'
      ]
    },
    {
      heading: '其他操作',
      items: [
        '查看：查看调拨单详细信息及物资明细',
        '打印：调拨单生成后即可打印，与状态无关'
      ]
    }
  ]
};

export default function ExhibitionTransferInboundPage() {
  const stockTransfers = useStore((s) => s.stockTransfers);
  const updateStockTransfer = useStore((s) => s.updateStockTransfer);
  const batchInventories = useStore((s) => s.batchInventories);
  const addBatchInventory = useStore((s) => s.addBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);

  const exhibitionWarehouses = useMemo(() => {
    return warehouses.filter(w => w.category === 'exhibition');
  }, [warehouses]);

  const [filterNo, setFilterNo] = useState('');
  const [filterFromWarehouse, setFilterFromWarehouse] = useState<string[]>([]);
  const [filterToWarehouse, setFilterToWarehouse] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({
    no: '',
    status: '',
    fromWarehouses: [] as string[],
    toWarehouses: [] as string[],
    from: '',
    to: '',
  });

  const inboundTransfers = useMemo(() => {
    return stockTransfers.filter((t) => {
      const fromWh = warehouses.find(w => w.id === t.fromWarehouseId);
      const toWh = warehouses.find(w => w.id === t.toWarehouseId);
      return fromWh?.category === 'exhibition' && toWh?.category === 'exhibition';
    });
  }, [stockTransfers, warehouses]);

  const filteredData = useMemo(() => {
    return inboundTransfers.filter((o) => {
      if (applied.no && !o.transferNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.fromWarehouses.length > 0 && !applied.fromWarehouses.includes(o.fromWarehouseId)) return false;
      if (applied.toWarehouses.length > 0 && !applied.toWarehouses.includes(o.toWarehouseId)) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [inboundTransfers, applied]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待出库确认';
      case 'outbound_confirmed': return '待入库确认';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#e6a23c';
      case 'outbound_confirmed': return '#2f54eb';
      case 'completed': return '#67c23a';
      case 'cancelled': return '#909399';
      default: return '#303133';
    }
  };

  const columns: ColumnDef<StockTransfer>[] = [
    { key: 'transferNo', title: '调拨单号' },
    { key: 'fromWarehouseName', title: '调出仓库' },
    { key: 'toWarehouseName', title: '调入仓库' },
    {
      key: 'quantity',
      title: '调拨数量',
      align: 'right',
      render: (row) => row.details.reduce((a, b) => a + (b.quantity || 0), 0),
    },
    { key: 'creator', title: '制单人' },
    { key: 'outboundConfirmer', title: '出库确认人' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span style={{ color: getStatusColor(row.status) }}>{getStatusText(row.status)}</span>,
    },
    { key: 'createTime', title: '创建时间' },
    { key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => { setViewItem(null); setPrintItem(row); setPrintTrigger(prev => prev + 1); }}>
              <Printer size={12} /> 打印
            </TextButton>
          {row.status === 'outbound_confirmed' && (
            <TextButton onClick={() => handleInboundConfirm(row.id)}>入库确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<StockTransfer | null>(null);
  const [printItem, setPrintItem] = useState<StockTransfer | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);

  const handleInboundConfirm = (id: string) => {
    const order = stockTransfers.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'outbound_confirmed') return;
    if (!confirm(`确认入库 ${order.transferNo}？确认后将增加调入仓库库存。`)) return;

    const defaultToPos = positions.find((p) => p.warehouseId === order.toWarehouseId);
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newDetails = [...order.details];
    for (let i = 0; i < newDetails.length; i++) {
      const d = newDetails[i];
      const toPosId = d.toPositionId || defaultToPos?.id || '';
      const toPosName = d.toPositionName || defaultToPos?.name || '';
      
      const product = products.find((p) => p.id === d.productId);
      const newBatch = {
        id: 'BI' + Date.now() + Math.random().toString(36).slice(2, 7),
        batchNo: 'PC' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.random().toString(36).slice(2, 6).toUpperCase(),
        productId: d.productId,
        productName: d.productName,
        productCode: d.productCode,
        specification: (d as any).specification || product?.specification || '',
        warehouseId: order.toWarehouseId,
        warehouseName: order.toWarehouseName,
        positionId: toPosId,
        positionName: toPosName,
        quantity: d.quantity,
        originalQuantity: d.quantity,
        inboundTime: now,
      };
      addBatchInventory(newBatch);

      addStockTransaction({
        id: 'TX' + Date.now() + Math.random().toString(36).slice(2, 7),
        transactionNo:
          'TX' +
          new Date().toISOString().slice(0, 10).replace(/-/g, '') +
          Math.random().toString(36).slice(2, 8).toUpperCase(),
        transactionTime: now,
        transactionType: 'inbound',
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        warehouseId: order.toWarehouseId,
        warehouseName: order.toWarehouseName || '',
        positionId: toPosId,
        positionName: toPosName || '',
        quantity: d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.transferNo,
        sourceType: '调拨入库',
        batchNo: newBatch.batchNo,
        operator: currentUser.name,
      });
      
      (newDetails[i] as any).toPositionId = toPosId;
      (newDetails[i] as any).toPositionName = toPosName;
    }

    updateStockTransfer(id, {
      ...order,
      details: newDetails,
      status: 'completed',
      inboundConfirmTime: now,
      inboundConfirmer: currentUser.name,
    });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">展会物资调拨入库</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({
            no: filterNo,
            status: filterStatus,
            fromWarehouses: filterFromWarehouse,
            toWarehouses: filterToWarehouse,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterFromWarehouse([]);
          setFilterToWarehouse([]);
          setFilterFrom('');
          setFilterTo('');
          setApplied({
            no: '',
            status: '',
            fromWarehouses: [],
            toWarehouses: [],
            from: '',
            to: '',
          });
        }}
      >
        <SearchField label="调拨单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="状态" type="select" value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'pending', label: '待出库确认' },
            { value: 'outbound_confirmed', label: '待入库确认' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
        <MultiSelect
          label="调出仓库"
          options={exhibitionWarehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterFromWarehouse}
          onChange={setFilterFromWarehouse}
          placeholder="全部"
        />
        <MultiSelect
          label="调入仓库"
          options={exhibitionWarehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterToWarehouse}
          onChange={setFilterToWarehouse}
          placeholder="全部"
        />
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal open={!!viewItem} title="调拨单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">调拨单号：</span><span className="text-[#303133]">{viewItem.transferNo}</span></div>
              <div><span className="text-[#606266]">调出仓库：</span><span className="text-[#303133]">{viewItem.fromWarehouseName}</span></div>
              <div><span className="text-[#606266]">调入仓库：</span><span className="text-[#303133]">{viewItem.toWarehouseName}</span></div>
              <div><span className="text-[#606266]">状态：</span><span style={{ color: getStatusColor(viewItem.status) }}>{getStatusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">制单人：</span><span className="text-[#303133]">{viewItem.creator}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              {viewItem.outboundConfirmer && (
                <>
                  <div><span className="text-[#606266]">出库确认人：</span><span className="text-[#303133]">{viewItem.outboundConfirmer}</span></div>
                  <div><span className="text-[#606266]">出库确认时间：</span><span className="text-[#303133]">{viewItem.outboundConfirmTime}</span></div>
                </>
              )}
            </div>
            {viewItem.remark && (
              <div className="text-sm mb-3">
                <span className="text-[#606266]">备注：</span>
                <span className="text-[#303133]">{viewItem.remark}</span>
              </div>
            )}
            <div className="text-sm font-medium text-[#303133] mb-3">产品明细</div>
            <table className="w-full text-sm border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-4 py-3 text-left">物资编码</th>
                  <th className="px-4 py-3 text-left">物资名称</th>
                  <th className="px-4 py-3 text-left">规格</th>
                  <th className="px-4 py-3 text-left">单位</th>
                  <th className="px-4 py-3 text-right">数量</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.details.length ? (
                  viewItem.details.map((d, i) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-4 py-3 text-[#303133]">{d.productCode}</td>
                      <td className="px-4 py-3 text-[#303133]">{d.productName}</td>
                      <td className="px-4 py-3 text-[#303133]">
                        {products.find((p) => p.id === d.productId)?.specification || '-'}
                      </td>
                      <td className="px-4 py-3 text-[#303133]">
                        {products.find((p) => p.id === d.productId)?.unit || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-[#303133]">{d.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#909399]">
                      无明细
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="展会物资调拨入库单"
          orderNo={printItem.transferNo}
          orderDate={printItem.createTime.slice(0, 10)}
          operator={printItem.outboundConfirmer || ''}
          warehouseName={printItem.toWarehouseName || ''}
          details={printItem.details.map((d) => ({
            productCode: d.productCode,
            productName: d.productName,
            specification: products.find((p) => p.id === d.productId)?.specification || '',
            unit: products.find((p) => p.id === d.productId)?.unit || '',
            quantity: d.quantity,
          }))}
        />
      )}
    </div>
  );
}