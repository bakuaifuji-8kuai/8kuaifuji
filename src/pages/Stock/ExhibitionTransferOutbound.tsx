import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import MultiSelect from '@/components/common/MultiSelect';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import PrintDocument from '@/components/common/PrintDocument';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import WorkOrderPickerModal from '@/components/common/WorkOrderPickerModal';
import type { WorkOrderPickerItem } from '@/components/common/WorkOrderPickerModal';
import { useStore } from '@/store/useStore';
import { generateTransferNo } from '@/mock/data';
import type { ProductPickerItem } from '@/components/common/ProductPickerModal';
import type { StockTransfer, StockTransferDetail } from '@/types';
import { Eye, ArrowRightLeft, Printer, ArrowUpFromLine } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '展会物资调拨出库 - 功能操作说明',
  description: '展会物资调拨出库用于从展会仓库调出物资，支持新增调拨单、出库确认等操作。',
  sections: [
    {
      heading: '新增调拨单',
      items: [
        '点击"新增调拨单"按钮打开新增弹窗',
        '选择调出仓库和调入仓库（仅限展会物资仓库）',
        '点击"添加产品"按钮选择调拨物资',
        '填写调拨数量（不可超过调出仓库可用库存）',
        '可填写备注信息',
        '点击"保存"生成调拨单，状态为待出库确认'
      ]
    },
    {
      heading: '出库确认',
      items: [
        '待出库确认状态的调拨单可点击"出库确认"',
        '确认后扣减调出仓库库存（按FIFO原则扣减批次）',
        '同步生成调拨出库流水记录',
        '出库确认后单据状态更新为待入库确认，流转到调拨入库页面'
      ]
    },
    {
      heading: '其他操作',
      items: [
        '查看：查看调拨单详细信息及物资明细',
        '编辑：待出库确认状态可修改调拨单信息',
        '删除：待出库确认状态可删除调拨单',
        '打印：调拨单生成后即可打印，与状态无关'
      ]
    }
  ]
};

export default function ExhibitionTransferOutboundPage() {
  const stockTransfers = useStore((s) => s.stockTransfers);
  const addStockTransfer = useStore((s) => s.addStockTransfer);
  const updateStockTransfer = useStore((s) => s.updateStockTransfer);
  const deleteStockTransfer = useStore((s) => s.deleteStockTransfer);
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);
  const workOrderConfigs = useStore((s) => s.workOrderConfigs);

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

  const outboundTransfers = useMemo(() => {
    return stockTransfers.filter((t) => {
      const fromWh = warehouses.find(w => w.id === t.fromWarehouseId);
      const toWh = warehouses.find(w => w.id === t.toWarehouseId);
      return fromWh?.category === 'exhibition' && toWh?.category === 'exhibition';
    });
  }, [stockTransfers, warehouses]);

  const filteredData = useMemo(() => {
    return outboundTransfers.filter((o) => {
      if (applied.no && !o.transferNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.fromWarehouses.length > 0 && !applied.fromWarehouses.includes(o.fromWarehouseId)) return false;
      if (applied.toWarehouses.length > 0 && !applied.toWarehouses.includes(o.toWarehouseId)) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [outboundTransfers, applied]);

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
    {
      key: 'workOrderCode',
      title: '关联工单号',
      render: (row) => {
        const woDetail = row.details.find((d) => d.workOrderCode);
        return woDetail ? <span className="text-[#2f54eb]">{woDetail.workOrderCode}</span> : '-';
      },
    },
    { key: 'fromWarehouseName', title: '调出仓库' },
    { key: 'toWarehouseName', title: '调入仓库' },
    {
      key: 'quantity',
      title: '调拨数量',
      align: 'right',
      render: (row) => row.details.reduce((a, b) => a + (b.quantity || 0), 0),
    },
    { key: 'creator', title: '制单人' },
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
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  const cloned = JSON.parse(JSON.stringify(row));
                  setEditItem(cloned);
                }}
              >
                编辑
              </TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.transferNo}？`)) deleteStockTransfer(row.id);
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleOutboundConfirm(row.id)}>出库确认</TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<StockTransfer | null>(null);
  const [printItem, setPrintItem] = useState<StockTransfer | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);

  const [editItem, setEditItem] = useState<StockTransfer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [workOrderPickerOpen, setWorkOrderPickerOpen] = useState(false);

  const openAdd = () => {
    const newOrder: StockTransfer = {
      id: 'TF' + Date.now(),
      transferNo: generateTransferNo(),
      fromWarehouseId: exhibitionWarehouses[0]?.id || '',
      fromWarehouseName: exhibitionWarehouses[0]?.name || '',
      toWarehouseId: exhibitionWarehouses[1]?.id || exhibitionWarehouses[0]?.id || '',
      toWarehouseName: exhibitionWarehouses[1]?.name || exhibitionWarehouses[0]?.name || '',
      status: 'pending',
      creator: currentUser.name,
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
    };
    setIsNew(true);
    setEditItem(newOrder);
  };

  const handlePickerConfirm = (selectedProducts: ProductPickerItem[]) => {
    if (!editItem) return;
    const newDetails: StockTransferDetail[] = selectedProducts.map((p) => {
      return {
        id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
        stockTransferId: editItem.id,
        productId: p.id,
        productCode: p.code || '',
        productName: p.name || '',
        fromPositionId: '',
        fromPositionName: '',
        toPositionId: '',
        toPositionName: '',
        quantity: 0,
      };
    });
    const existingIds = new Set(editItem.details.map((d) => d.productId));
    const toAdd = newDetails.filter((d) => !existingIds.has(d.productId));
    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setPickerOpen(false);
  };

  const handleWorkOrderConfirm = (selectedItems: WorkOrderPickerItem[]) => {
    if (!editItem) return;

    const newDetails: StockTransferDetail[] = [];
    selectedItems.forEach((item) => {
      [...item.mainProducts, ...item.auxiliaryProducts].forEach((product) => {
        newDetails.push({
          id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
          stockTransferId: editItem.id,
          productId: product.productId,
          productCode: product.productCode,
          productName: product.productName,
          fromPositionId: '',
          fromPositionName: '',
          toPositionId: '',
          toPositionName: '',
          quantity: product.quantity,
          workOrderId: item.workOrderId,
          workOrderCode: item.workOrderCode,
          workOrderName: item.workOrderName,
          isMain: item.mainProducts.some((p) => p.productId === product.productId),
        });
      });
    });

    const existingIds = new Set(editItem.details.map((d) => `${d.workOrderId || ''}::${d.productId}`));
    const toAdd = newDetails.filter((d) => !existingIds.has(`${d.workOrderId}::${d.productId}`));

    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setWorkOrderPickerOpen(false);
  };

  const updateDetail = (idx: number, field: string, value: any) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    (newDetails[idx] as any)[field] = value;
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    if (!editItem) return;
    if (editItem.fromWarehouseId === editItem.toWarehouseId) {
      alert('调出仓库和调入仓库不能相同');
      return;
    }
    const fromWarehouse = warehouses.find((w) => w.id === editItem.fromWarehouseId);
    const toWarehouse = warehouses.find((w) => w.id === editItem.toWarehouseId);
    if (fromWarehouse && fromWarehouse.category !== 'exhibition') {
      alert(`调出仓库 "${fromWarehouse.name}" 不是展会物资仓库`);
      return;
    }
    if (toWarehouse && toWarehouse.category !== 'exhibition') {
      alert(`调入仓库 "${toWarehouse.name}" 不是展会物资仓库`);
      return;
    }
    if (!editItem.details.length) {
      alert('请添加至少一个产品');
      return;
    }
    for (const d of editItem.details) {
      if (!d.quantity || d.quantity <= 0) {
        alert(`产品 "${d.productName}" 的数量必须大于0`);
        return;
      }
      const available = batchInventories
        .filter(
          (b) =>
            b.productId === d.productId &&
            b.quantity > 0 &&
            b.warehouseId === editItem.fromWarehouseId
        )
        .reduce((s, b) => s + b.quantity, 0);
      if (d.quantity > available) {
        alert(`产品 "${d.productName}" 的调拨数量(${d.quantity})超过可用库存(${available})`);
        return;
      }
    }
    if (isNew) addStockTransfer(editItem);
    else updateStockTransfer(editItem.id, editItem);
    setEditItem(null);
  };

  const handleOutboundConfirm = (id: string) => {
    const order = stockTransfers.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'pending') return;
    if (!confirm(`确认出库 ${order.transferNo}？确认后将扣减调出仓库库存。`)) return;

    const defaultFromPos = positions.find((p) => p.warehouseId === order.fromWarehouseId);
    const newDetails = [...order.details];
    for (let i = 0; i < newDetails.length; i++) {
      const d = newDetails[i];
      const fromPosId = d.fromPositionId || defaultFromPos?.id || '';
      const fromPosName = d.fromPositionName || defaultFromPos?.name || '';
      const productBatches = batchInventories
        .filter(
          (b) =>
            b.productId === d.productId &&
            b.quantity > 0 &&
            b.warehouseId === order.fromWarehouseId
        )
        .sort((a, b) => a.inboundTime.localeCompare(b.inboundTime));

      let remaining = d.quantity;
      const consumptions: { batchId: string; batchNo: string; quantity: number }[] = [];
      for (const batch of productBatches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.quantity, remaining);
        consumptions.push({ batchId: batch.id, batchNo: batch.batchNo, quantity: deduct });
        updateBatchInventory(batch.id, { quantity: batch.quantity - deduct });
        remaining -= deduct;
      }

      if (remaining > 0) {
        alert(`产品 "${d.productName}" 可用量不足，需要 ${d.quantity}，可用 ${d.quantity - remaining}`);
        return;
      }
      (newDetails[i] as any).batchConsumptions = consumptions;
      (newDetails[i] as any).fromPositionId = fromPosId;
      (newDetails[i] as any).fromPositionName = fromPosName;
    }

    for (const d of newDetails) {
      addStockTransaction({
        id: 'TX' + Date.now() + Math.random().toString(36).slice(2, 7),
        transactionNo:
          'TX' +
          new Date().toISOString().slice(0, 10).replace(/-/g, '') +
          Math.random().toString(36).slice(2, 8).toUpperCase(),
        transactionTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        transactionType: 'outbound',
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        warehouseId: order.fromWarehouseId,
        warehouseName: order.fromWarehouseName || '',
        positionId: (d as any).fromPositionId,
        positionName: (d as any).fromPositionName || '',
        quantity: -d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.transferNo,
        sourceType: '调拨出库',
        batchNo: (d as any).batchConsumptions?.[0]?.batchNo || '',
        operator: currentUser.name,
      });
    }

    updateStockTransfer(id, {
      ...order,
      details: newDetails,
      status: 'outbound_confirmed',
      outboundConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      outboundConfirmer: currentUser.name,
    });
  };

  const totalQuantity = editItem?.details.reduce((s, d) => s + (d.quantity || 0), 0) || 0;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">展会物资调拨出库</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <PrimaryButton onClick={openAdd}>
            <ArrowUpFromLine size={14} />
            新增调拨单
          </PrimaryButton>
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
        <SearchField label="状态" type="select" value={filterStatus} onChange={setFilterStatus}>
          <option value="">全部</option>
          <option value="pending">待出库确认</option>
          <option value="outbound_confirmed">待入库确认</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </SearchField>
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
              {(() => {
                const woDetail = viewItem.details.find((d) => d.workOrderCode);
                if (!woDetail) return null;
                const config = workOrderConfigs.find((c) => c.workOrderId === woDetail.workOrderId);
                return (
                  <>
                    <div><span className="text-[#606266]">关联工单号：</span><span className="text-[#2f54eb]">{woDetail.workOrderCode}</span></div>
                    <div><span className="text-[#606266]">所属展会：</span><span className="text-[#303133]">{config?.exhibitionName || '-'}</span></div>
                  </>
                );
              })()}
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
                  <th className="px-4 py-3 text-left">工单</th>
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
                      <td className="px-4 py-3 text-[#2f54eb]">{d.workOrderCode || '-'}</td>
                      <td className="px-4 py-3 text-right text-[#303133]">{d.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#909399]">
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

      <Modal
        open={!!editItem}
        title={isNew ? '新增调拨单' : '编辑调拨单'}
        onClose={() => {
          setEditItem(null);
        }}
        width="max-w-[1200px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto">
            <div className="flex gap-3">
              <div className="flex-1 grid grid-cols-4 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">调拨单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.transferNo}
                  onChange={(e) => setEditItem({ ...editItem, transferNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 调出仓库
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.fromWarehouseId}
                  onChange={(e) => {
                    const wh = exhibitionWarehouses.find((w) => w.id === e.target.value);
                    setEditItem({
                      ...editItem,
                      fromWarehouseId: e.target.value,
                      fromWarehouseName: wh?.name,
                    });
                  }}
                >
                  {exhibitionWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 调入仓库
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.toWarehouseId}
                  onChange={(e) => {
                    const wh = exhibitionWarehouses.find((w) => w.id === e.target.value);
                    setEditItem({
                      ...editItem,
                      toWarehouseId: e.target.value,
                      toWarehouseName: wh?.name,
                    });
                  }}
                >
                  {exhibitionWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">制单人</div>
                <input
                  disabled
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                  value={editItem.creator}
                />
              </div>
              </div>
              {/* 工单号显示区 */}
              <div className="w-[200px] flex flex-col items-center justify-center p-3 border border-dashed border-[#dcdfe6] rounded">
                <div className="text-xs text-[#606266] mb-1">工单号</div>
                <div className="text-lg font-bold text-[#f56c6c]">
                  {(() => {
                    const woDetail = editItem.details.find((d) => d.workOrderCode);
                    return woDetail ? woDetail.workOrderCode : '暂无';
                  })()}
                </div>
                <div className="text-xs text-[#606266] mt-2 mb-0.5">所属展会</div>
                <div className="text-xs font-medium text-[#303133]">
                  {(() => {
                    const woDetail = editItem.details.find((d) => d.workOrderId);
                    if (!woDetail) return '暂无';
                    const config = workOrderConfigs.find((c) => c.workOrderId === woDetail.workOrderId);
                    return config?.exhibitionName || '暂无';
                  })()}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-[#303133]">
                  产品明细{' '}
                  <span className="text-[#909399] font-normal">
                    （共 {editItem.details.length} 种，合计 {totalQuantity} 件）
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DefaultButton onClick={() => setWorkOrderPickerOpen(true)}>+ 选择工单</DefaultButton>
                  <DefaultButton onClick={() => setPickerOpen(true)}>+ 选择物资</DefaultButton>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden min-w-[700px]">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      <th className="px-2 py-2 text-left w-8">#</th>
                      <th className="px-2 py-2 text-left w-28">物资编码</th>
                      <th className="px-2 py-2 text-left flex-1">物资名称</th>
                      <th className="px-2 py-2 text-left w-24">规格</th>
                      <th className="px-2 py-2 text-left w-16">单位</th>
                      <th className="px-2 py-2 text-left w-24">工单</th>
                      <th className="px-2 py-2 text-left w-20">可用库存</th>
                      <th className="px-2 py-2 text-right w-24">调拨数量</th>
                      <th className="px-2 py-2 text-center w-12">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.details.length ? (
                      editItem.details.map((d: any, i: number) => {
                        const p = products.find((x) => x.id === d.productId);
                        const available = batchInventories
                          .filter(
                            (b) =>
                              b.productId === d.productId &&
                              b.quantity > 0 &&
                              b.warehouseId === editItem.fromWarehouseId
                          )
                          .reduce((s, b) => s + b.quantity, 0);
                        return (
                          <tr key={i} className="border-t border-[#ebeef5]">
                            <td className="px-2 py-1.5 text-[#909399]">{i + 1}</td>
                            <td className="px-2 py-1.5 text-[#303133]">{d.productCode}</td>
                            <td className="px-2 py-1.5 text-[#303133]">{d.productName}</td>
                            <td className="px-2 py-1.5 text-[#909399]">{p?.specification || '-'}</td>
                            <td className="px-2 py-1.5 text-[#909399]">{p?.unit || '-'}</td>
                            <td className="px-2 py-1.5 text-[#2f54eb]">{(d as any).workOrderCode || '-'}</td>
                            <td className="px-2 py-1.5 text-[#67c23a]">{available}</td>
                            <td className="px-2 py-1.5 text-right">
                              <input
                                type="number"
                                min="0"
                                className={`w-20 h-7 px-2 border rounded text-right focus:outline-none ${
                                  d.quantity > available
                                    ? 'border-[#f56c6c] text-[#f56c6c] focus:border-[#f56c6c]'
                                    : 'border-[#dcdfe6] text-[#303133] focus:border-[#2f54eb]'
                                }`}
                                value={d.quantity || ''}
                                onChange={(e) => updateDetail(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <TextButton type="danger" onClick={() => removeDetail(i)}>
                                删除
                              </TextButton>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[#909399]">
                          暂无物资，请点击「选择工单」或「选择物资」按钮添加
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton
            onClick={() => {
              setEditItem(null);
            }}
          >
            取消
          </DefaultButton>
          <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
        </div>
      </Modal>

      <ProductPickerModal
        open={pickerOpen}
        title="选择物资"
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        showStockQty={true}
        onlyStocked={true}
        warehouseId={editItem?.fromWarehouseId}
      />

      <WorkOrderPickerModal
        open={workOrderPickerOpen}
        title="选择工单"
        onClose={() => setWorkOrderPickerOpen(false)}
        onConfirm={handleWorkOrderConfirm}
      />

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="展会物资调拨出库单"
          orderNo={printItem.transferNo}
          orderDate={printItem.createTime.slice(0, 10)}
          operator={printItem.creator || ''}
          warehouseName={printItem.fromWarehouseName || ''}
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