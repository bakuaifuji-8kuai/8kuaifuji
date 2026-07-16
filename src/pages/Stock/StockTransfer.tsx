import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import MultiSelect from '@/components/common/MultiSelect';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import PrintDocument from '@/components/common/PrintDocument';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import { useStore } from '@/store/useStore';
import { generateTransferNo } from '@/mock/data';
import type { ProductPickerItem } from '@/components/common/ProductPickerModal';
import type { StockTransfer, StockTransferDetail } from '@/types';
import { Eye, ArrowRightLeft, Printer } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '仓库调拨 - 功能操作说明',
  description: '仓库调拨用于在不同仓库之间转移物资，支持出库确认和入库确认的双向库存变动。',
  sections: [
    {
      heading: '新增调拨单',
      items: [
        '点击"新增调拨单"按钮打开新增弹窗',
        '选择调出仓库和调入仓库',
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
        '出库确认后单据状态更新为待入库确认'
      ]
    },
    {
      heading: '入库确认',
      items: [
        '待入库确认状态的调拨单可点击"入库确认"',
        '确认后增加调入仓库库存（生成新批次）',
        '同步生成调拨入库流水记录',
        '入库确认后单据状态更新为已完成，不可修改'
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

export default function StockTransferPage() {
  const stockTransfers = useStore((s) => s.stockTransfers);
  const addStockTransfer = useStore((s) => s.addStockTransfer);
  const updateStockTransfer = useStore((s) => s.updateStockTransfer);
  const deleteStockTransfer = useStore((s) => s.deleteStockTransfer);
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addBatchInventory = useStore((s) => s.addBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);
  const reverseStockTransfer = useStore((s) => s.reverseStockTransfer);

  const physicalWarehouses = warehouses.filter(w => w.property === 'physical');

  // 筛选条件
  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromWarehouse, setFilterFromWarehouse] = useState<string[]>([]);
  const [filterToWarehouse, setFilterToWarehouse] = useState<string[]>([]);
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

  const filteredData = useMemo(() => {
    return stockTransfers.filter((o) => {
      if (applied.no && !o.transferNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.fromWarehouses.length > 0 && !applied.fromWarehouses.includes(o.fromWarehouseId)) return false;
      if (applied.toWarehouses.length > 0 && !applied.toWarehouses.includes(o.toWarehouseId)) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [stockTransfers, applied]);

  const statusText = (s: string) => {
    if (s === 'pending') return '待出库确认';
    if (s === 'outbound_confirmed') return '待入库确认';
    if (s === 'completed') return '已完成';
    if (s === 'cancelled') return '已取消';
    return s;
  };
  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-[#e6a23c]';
    if (s === 'outbound_confirmed') return 'text-[#409eff]';
    if (s === 'completed') return 'text-[#67c23a]';
    if (s === 'cancelled') return 'text-[#909399]';
    return '';
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
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'createTime', title: '创建时间' },
    { key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
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
          {row.status === 'outbound_confirmed' && (
            <>
              <TextButton onClick={() => handleInboundConfirm(row.id)}>入库确认</TextButton>
              <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
            </>
          )}
          {row.status === 'completed' && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const handleReverseConfirm = (id: string) => {
    const transfer = stockTransfers.find((t) => t.id === id);
    if (!transfer) return;
    const statusText = transfer.status === 'outbound_confirmed' ? '待入库确认' : '已完成';
    if (!confirm(`确认反确认调拨单 ${transfer.transferNo}（当前状态：${statusText}）？反确认后单据将回退到可编辑状态，库存将回滚，且会生成冲销流水记录。`)) return;

    const result = reverseStockTransfer(id);
    if (result.success) {
      alert(result.message);
    } else {
      alert('反确认失败：' + result.message);
    }
  };

  // 查看弹窗
  const [viewItem, setViewItem] = useState<StockTransfer | null>(null);
  const [printItem, setPrintItem] = useState<StockTransfer | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);

  // 编辑弹窗
  const [editItem, setEditItem] = useState<StockTransfer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openAdd = () => {
    const newOrder: StockTransfer = {
      id: 'TF' + Date.now(),
      transferNo: generateTransferNo(),
      fromWarehouseId: physicalWarehouses[0]?.id || '',
      fromWarehouseName: physicalWarehouses[0]?.name || '',
      toWarehouseId: physicalWarehouses[1]?.id || '',
      toWarehouseName: physicalWarehouses[1]?.name || '',
      status: 'pending',
      creator: currentUser.name,
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
    };
    setIsNew(true);
    setEditItem(newOrder);
  };

  // 产品选择
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
    if (fromWarehouse && fromWarehouse.property !== 'physical') {
      alert(`调出仓库 "${fromWarehouse.name}" 必须是实物仓`);
      return;
    }
    if (toWarehouse && toWarehouse.property !== 'physical') {
      alert(`调入仓库 "${toWarehouse.name}" 必须是实物仓`);
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
      // 校验调拨数量不超过可用库存
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

  // 出库确认：扣减调出仓库库存
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

    // 生成出库流水
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

  // 入库确认：增加调入仓库库存
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
      
      // 创建新的批次库存
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

      // 生成入库流水
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

  const totalQuantity = editItem?.details.reduce((s, d) => s + (d.quantity || 0), 0) || 0;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">调拨管理</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <PrimaryButton onClick={openAdd}>
            <ArrowRightLeft size={14} />
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
        <MultiSelect
          label="调出仓库"
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterFromWarehouse}
          onChange={setFilterFromWarehouse}
          placeholder="全部"
        />
        <MultiSelect
          label="调入仓库"
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterToWarehouse}
          onChange={setFilterToWarehouse}
          placeholder="全部"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">状态：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部</option>
            <option value="pending">待出库确认</option>
            <option value="outbound_confirmed">待入库确认</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 查看弹窗 */}
      <Modal open={!!viewItem} title="调拨单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">调拨单号：</span><span className="text-[#303133]">{viewItem.transferNo}</span></div>
              <div><span className="text-[#606266]">调出仓库：</span><span className="text-[#303133]">{viewItem.fromWarehouseName}</span></div>
              <div><span className="text-[#606266]">调入仓库：</span><span className="text-[#303133]">{viewItem.toWarehouseName}</span></div>
              <div><span className="text-[#606266]">状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">制单人：</span><span className="text-[#303133]">{viewItem.creator}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              {viewItem.outboundConfirmer && (
                <>
                  <div><span className="text-[#606266]">出库确认人：</span><span className="text-[#303133]">{viewItem.outboundConfirmer}</span></div>
                  <div><span className="text-[#606266]">出库确认时间：</span><span className="text-[#303133]">{viewItem.outboundConfirmTime}</span></div>
                </>
              )}
              {viewItem.inboundConfirmer && (
                <>
                  <div><span className="text-[#606266]">入库确认人：</span><span className="text-[#303133]">{viewItem.inboundConfirmer}</span></div>
                  <div><span className="text-[#606266]">入库确认时间：</span><span className="text-[#303133]">{viewItem.inboundConfirmTime}</span></div>
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

      {/* 编辑/新增弹窗 */}
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
            {/* 基本信息 */}
            <div className="grid grid-cols-4 gap-3">
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
                  <span className="text-[#f56c6c]">*</span> 调出仓库（仅实物仓）
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.fromWarehouseId}
                  onChange={(e) => {
                    const wh = physicalWarehouses.find((w) => w.id === e.target.value);
                    setEditItem({
                      ...editItem,
                      fromWarehouseId: e.target.value,
                      fromWarehouseName: wh?.name,
                    });
                  }}
                >
                  {physicalWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 调入仓库（仅实物仓）
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.toWarehouseId}
                  onChange={(e) => {
                    const wh = physicalWarehouses.find((w) => w.id === e.target.value);
                    setEditItem({
                      ...editItem,
                      toWarehouseId: e.target.value,
                      toWarehouseName: wh?.name,
                    });
                  }}
                >
                  {physicalWarehouses.map((w) => (
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
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>

            {/* 产品明细 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-[#303133]">
                  产品明细{' '}
                  <span className="text-[#909399] font-normal">
                    （共 {editItem.details.length} 种，合计 {totalQuantity} 件）
                  </span>
                </div>
                <DefaultButton onClick={() => setPickerOpen(true)}>+ 添加产品</DefaultButton>
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
                        <td colSpan={8} className="py-8 text-center text-[#909399]">
                          暂无物资，请点击「选择物资」按钮添加
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

      {/* 物资选择弹窗 */}
      <ProductPickerModal
        open={pickerOpen}
        title="选择物资"
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        showStockQty={true}
        onlyStocked={true}
      />

      {/* 打印组件 */}
      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="调拨单"
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
