import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import TransferPickerModal from '@/components/common/TransferPickerModal';
import SearchableSelect from '@/components/common/SearchableSelect';
import PrintDocument from '@/components/common/PrintDocument';
import { useStore } from '@/store/useStore';
import { generateOutboundOrderNo } from '@/mock/data';
import type { ProductPickerItem } from '@/components/common/ProductPickerModal';
import type { TransferPickerItem } from '@/components/common/TransferPickerModal';
import type { OutboundOrder, OutboundDetail } from '@/types';
import { Printer } from 'lucide-react';

interface Props {
  type?: 'requisition' | 'production';
}

export default function OutboundPage({ type = 'requisition' }: Props) {
  const outboundOrders = useStore((s) => s.outboundOrders);
  const addOutboundOrder = useStore((s) => s.addOutboundOrder);
  const updateOutboundOrder = useStore((s) => s.updateOutboundOrder);
  const deleteOutboundOrder = useStore((s) => s.deleteOutboundOrder);
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const employees = useStore((s) => s.employees);

  const isProduction = type === 'production';
  const pageTitle = isProduction ? '生产领料' : '领用出库';
  const orderType: 'requisition' | 'production' = type as 'requisition' | 'production';

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', warehouse: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return outboundOrders
      .filter((o) => o.type === orderType)
      .filter((o) => {
        if (applied.no && !o.orderNo.includes(applied.no)) return false;
        if (applied.status && o.status !== applied.status) return false;
        if (applied.warehouse && o.warehouseId !== applied.warehouse) return false;
        if (applied.from && o.createTime < applied.from) return false;
        if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
        return true;
      });
  }, [outboundOrders, applied, orderType]);

  const statusText = (s: string) => (s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) => (s === 'submitted' ? 'text-[#67c23a]' : 'text-[#e6a23c]');

  const columns: ColumnDef<OutboundOrder>[] = [
    { key: 'orderNo', title: '出库单号' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => row.details.reduce((a, b) => a + (b.quantity || 0), 0),
    },
    { key: 'operator', title: '领用人', render: (row) => row.operator || '-' },
    { key: 'creator', title: '制单人', render: (row) => (row as any).creator || '-' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'createTime', title: '创建时间' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          {row.status === 'submitted' && (
            <TextButton onClick={() => setPrintItem(row)}>
              <Printer size={12} /> 打印
            </TextButton>
          )}
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  setEditItem(JSON.parse(JSON.stringify(row)));
                }}
              >
                编辑
              </TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.orderNo}？`)) deleteOutboundOrder(row.id);
                }}
              >
                删除
              </TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  // 查看弹窗
  const [viewItem, setViewItem] = useState<OutboundOrder | null>(null);
  const [printItem, setPrintItem] = useState<OutboundOrder | null>(null);

  // 编辑弹窗
  const [editItem, setEditItem] = useState<OutboundOrder | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [transferPickerOpen, setTransferPickerOpen] = useState(false);
  // 工单出库模式（弹窗内切换，不影响订单类型）
  const [workOrderMode, setWorkOrderMode] = useState(false);

  const openAdd = () => {
    const newOrder: any = {
      id: 'OUT' + Date.now(),
      orderNo: generateOutboundOrderNo(orderType),
      type: orderType,
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      custodian: '',
      personInCharge: '',
      operator: '',
      creator: '',
      status: 'pending',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
    };
    setIsNew(true);
    setWorkOrderMode(false);
    setEditItem(newOrder);
  };

  // 产品选择（普通领用）
  const handlePickerConfirm = (selectedProducts: ProductPickerItem[]) => {
    if (!editItem) return;
    const newDetails: OutboundDetail[] = selectedProducts.map((p) => {
      const firstBatch = batchInventories.find(
        (b) => b.productId === p.id && b.quantity > 0 && (!editItem!.warehouseId || b.warehouseId === editItem!.warehouseId)
      );
      return {
        id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
        outboundOrderId: editItem.id,
        productId: p.id,
        productCode: p.code || '',
        productName: p.name || '',
        positionId: firstBatch?.positionId || positions.find((pos) => pos.warehouseId === editItem!.warehouseId)?.id || '',
        positionName: firstBatch?.positionName || '',
        quantity: 0,
      };
    });
    const existingIds = new Set(editItem.details.map((d) => d.productId));
    const toAdd = newDetails.filter((d) => !existingIds.has(d.productId));
    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setPickerOpen(false);
  };

  // 调拨单选择（工单出库）
  const handleTransferConfirm = (selectedItems: TransferPickerItem[]) => {
    if (!editItem) return;
    const newDetails: OutboundDetail[] = selectedItems.map((item) => ({
      id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
      outboundOrderId: editItem.id,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      positionId: item.positionId,
      positionName: item.positionName,
      quantity: 0,
      transferOrderId: item.orderId,
      transferOrderNo: item.orderNo,
    }));
    const existingKeys = new Set(
      editItem.details.map((d) => (d as any).transferOrderId ? `${(d as any).transferOrderId}::${d.productId}` : d.productId)
    );
    const toAdd = newDetails.filter((d) => !existingKeys.has(`${d.transferOrderId}::${d.productId}`));
    let updated = { ...editItem, details: [...editItem.details, ...toAdd] };
    // 工单出库默认取调拨单目标仓库
    if (selectedItems.length > 0 && !editItem.warehouseId) {
      const first = selectedItems[0];
      const wh = warehouses.find((w) => w.id === first.warehouseId);
      updated = { ...updated, warehouseId: first.warehouseId, warehouseName: wh?.name || first.warehouseName };
    }
    setEditItem(updated);
    setTransferPickerOpen(false);
  };

  const updateDetail = (idx: number, field: string, value: any) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    (newDetails[idx] as any)[field] = value;
    if (field === 'productId') {
      const p = products.find((x) => x.id === value);
      newDetails[idx].productCode = p?.code || '';
      newDetails[idx].productName = p?.name || '';
    }
    if (field === 'positionId') {
      const p = positions.find((x) => x.id === value);
      newDetails[idx].positionName = p?.name || '';
    }
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_, i) => i !== idx) });
  };

  const handleSaveOnly = () => {
    if (!editItem) return;
    const payload = { ...editItem, status: 'pending' as const };
    if (isNew) addOutboundOrder(payload);
    else updateOutboundOrder(editItem.id, payload);
    setEditItem(null);
  };

  const handleSubmit = () => {
    if (!editItem) return;
    if (!editItem.details.length) {
      alert('请添加至少一个产品');
      return;
    }
    for (const d of editItem.details) {
      if (!d.quantity || d.quantity <= 0) {
        alert(`产品 "${d.productName}" 的数量必须大于0`);
        return;
      }
    }

    for (const d of editItem.details) {
      const productBatches = batchInventories
        .filter((b) => b.productId === d.productId && b.quantity > 0 && (!editItem!.warehouseId || b.warehouseId === editItem!.warehouseId))
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
      d.batchConsumptions = consumptions;
    }

    for (const d of editItem.details) {
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
        warehouseId: editItem.warehouseId,
        warehouseName: editItem.warehouseName || '',
        positionId: d.positionId,
        positionName: d.positionName || '',
        quantity: -d.quantity,
        sourceOrderId: editItem.id,
        sourceOrderNo: editItem.orderNo,
        sourceType: workOrderMode ? '工单出库' : pageTitle,
        batchNo: d.batchConsumptions?.[0]?.batchNo || '',
        operator: editItem.operator || '',
      });
    }

    const payload = { ...editItem, status: 'submitted' as const };
    if (isNew) addOutboundOrder(payload);
    else updateOutboundOrder(editItem.id, payload);
    setEditItem(null);
    setWorkOrderMode(false);
  };

  const totalQuantity = editItem?.details.reduce((s, d) => s + (d.quantity || 0), 0) || 0;

  const hasTransferOrder = editItem?.details.some((d) => !!(d as any).transferOrderId);

  // 明细表头配置
  const detailHeaders = [
    { label: '#', w: 'w-8' },
    { label: '物资编码', w: 'w-28' },
    { label: '物资名称', w: 'flex-1' },
    { label: '规格', w: 'w-24' },
    { label: '单位', w: 'w-16' },
    { label: '仓位', w: 'w-28' },
    { label: '可用库存', w: 'w-20' },
    { label: '出库数量', w: 'w-24' },
    { label: '操作', w: 'w-12' },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">{pageTitle}单</h2>
        <PrimaryButton onClick={openAdd}>+ 新增{pageTitle}单</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({ no: filterNo, status: filterStatus, warehouse: filterWarehouse, from: filterFrom, to: filterTo })
        }
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterWarehouse('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ no: '', status: '', warehouse: '', from: '', to: '' });
        }}
      >
        <SearchField label="出库单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">状态：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部</option>
            <option value="pending">待提交</option>
            <option value="submitted">已提交</option>
          </select>
        </div>
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
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 查看弹窗 */}
      <Modal open={!!viewItem} title={`${pageTitle}单详情`} onClose={() => setViewItem(null)} width="max-w-[900px]">
        {viewItem && (
          <>
            <div className="grid grid-cols-3 gap-y-2 text-xs mb-3 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">出库单号：</div>
              <div className="text-[#303133]">{viewItem.orderNo}</div>
              <div />
              <div className="text-[#606266]">仓库：</div>
              <div className="text-[#303133]">{viewItem.warehouseName}</div>
              <div />
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</div>
              <div />
              <div className="text-[#606266]">领用人：</div>
              <div className="text-[#303133]">{viewItem.operator || '-'}</div>
              <div />
              <div className="text-[#606266]">制单人：</div>
              <div className="text-[#303133]">{(viewItem as any).creator || '-'}</div>
              <div />
              <div className="text-[#606266]">创建时间：</div>
              <div className="text-[#303133]">{viewItem.createTime}</div>
              <div />
              {(viewItem as any).custodian && (
                <>
                  <div className="text-[#606266]">保管人：</div>
                  <div className="text-[#303133]">{(viewItem as any).custodian}</div>
                  <div />
                </>
              )}
              {(viewItem as any).personInCharge && (
                <>
                  <div className="text-[#606266]">负责人：</div>
                  <div className="text-[#303133]">{(viewItem as any).personInCharge}</div>
                  <div />
                </>
              )}
              {hasTransferOrder && (
                <>
                  <div className="text-[#606266]">出库类型：</div>
                  <div className="text-[#303133]">工单出库</div>
                  <div />
                </>
              )}
            </div>
            <div className="text-xs font-medium text-[#303133] mb-2">产品明细</div>
            <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-2 py-2 text-left">物资编码</th>
                  <th className="px-2 py-2 text-left">物资名称</th>
                  <th className="px-2 py-2 text-left">规格</th>
                  <th className="px-2 py-2 text-left">单位</th>
                  <th className="px-2 py-2 text-left">仓位</th>
                  {hasTransferOrder && <th className="px-2 py-2 text-left">关联调拨单</th>}
                  <th className="px-2 py-2 text-right">数量</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.details.length ? (
                  viewItem.details.map((d, i) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                      <td className="px-2 py-2 text-[#303133]">
                        {products.find((p) => p.id === d.productId)?.specification || '-'}
                      </td>
                      <td className="px-2 py-2 text-[#303133]">
                        {products.find((p) => p.id === d.productId)?.unit || '-'}
                      </td>
                      <td className="px-2 py-2 text-[#303133]">{d.positionName}</td>
                      {(d as any).transferOrderNo && (
                        <td className="px-2 py-2 text-[#2f54eb] text-xs">{(d as any).transferOrderNo}</td>
                      )}
                      <td className="px-2 py-2 text-right text-[#303133]">{d.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={hasTransferOrder ? 7 : 6} className="py-6 text-center text-[#909399]">
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

      {/* 打印组件 */}
      {printItem && (
        <PrintDocument
          autoPrint
          title={`${pageTitle}单`}
          orderNo={printItem.orderNo}
          orderDate={printItem.createTime.slice(0, 10)}
          orderType={printItem.details.some((d) => !!(d as any).transferOrderId) ? '工单出库' : pageTitle}
          warehouseName={printItem.warehouseName || ''}
          operator={printItem.operator || ''}
          custodian={(printItem as any).custodian || ''}
          personInCharge={(printItem as any).personInCharge || ''}
          details={printItem.details.map((d) => ({
            productCode: d.productCode,
            productName: d.productName,
            specification: products.find((p) => p.id === d.productId)?.specification || '',
            unit: products.find((p) => p.id === d.productId)?.unit || '',
            positionName: d.positionName,
            quantity: d.quantity,
          }))}
        />
      )}

      {/* 编辑/新增弹窗 */}
      <Modal
        open={!!editItem}
        title={`${isNew ? '新增' : '编辑'}${pageTitle}单`}
        onClose={() => {
          setEditItem(null);
          setWorkOrderMode(false);
        }}
        width="max-w-[1200px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto">
            {/* 基本信息 */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">出库单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.orderNo}
                  onChange={(e) => setEditItem({ ...editItem, orderNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">仓库</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.warehouseId}
                  onChange={(e) => {
                    const wh = warehouses.find((w) => w.id === e.target.value);
                    setEditItem({ ...editItem, warehouseId: e.target.value, warehouseName: wh?.name });
                  }}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">领用人</div>
                <SearchableSelect
                  options={employees.map((e) => ({ id: e.id, label: e.name, role: e.role }))}
                  value={editItem.operator}
                  onChange={(val) => setEditItem({ ...editItem, operator: val })}
                  placeholder="请选择"
                  width="w-full"
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">保管人</div>
                <SearchableSelect
                  options={employees.map((e) => ({ id: e.id, label: e.name, role: e.role }))}
                  value={(editItem as any).custodian || ''}
                  onChange={(val) => setEditItem({ ...(editItem as any), custodian: val })}
                  placeholder="请选择"
                  width="w-full"
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">负责人</div>
                <SearchableSelect
                  options={employees.map((e) => ({ id: e.id, label: e.name, role: e.role }))}
                  value={(editItem as any).personInCharge || ''}
                  onChange={(val) => setEditItem({ ...(editItem as any), personInCharge: val })}
                  placeholder="请选择"
                  width="w-full"
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">制单人</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={(editItem as any).creator || ''}
                  onChange={(e) => setEditItem({ ...(editItem as any), creator: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={(editItem as any).remark || ''}
                onChange={(e) => setEditItem({ ...(editItem as any), remark: e.target.value })}
              />
            </div>

            {/* 产品明细 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-[#303133]">
                  产品明细{' '}
                  <span className="text-[#909399] font-normal">
                    （共 {editItem.details.length} 种，合计 {totalQuantity} 件）
                    {workOrderMode && <span className="ml-2 text-[#e6a23c]">「工单出库」模式</span>}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!workOrderMode ? (
                    <>
                      <DefaultButton onClick={() => setPickerOpen(true)}>+ 批量选择产品</DefaultButton>
                      <DefaultButton onClick={() => setWorkOrderMode(true)}>+ 工单出库</DefaultButton>
                    </>
                  ) : (
                    <DefaultButton onClick={() => setWorkOrderMode(false)}>+ 普通领用</DefaultButton>
                  )}
                  {workOrderMode ? (
                    <DefaultButton onClick={() => setTransferPickerOpen(true)}>+ 选择调拨单</DefaultButton>
                  ) : (
                    <DefaultButton
                      onClick={() => {
                        if (!editItem.details.length) return;
                        const last = editItem.details[editItem.details.length - 1] as any;
                        setEditItem({
                          ...editItem,
                          details: [
                            ...editItem.details,
                            {
                              ...last,
                              id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
                              quantity: 0,
                            },
                          ],
                        });
                      }}
                    >
                      + 添加
                    </DefaultButton>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      {detailHeaders.map((h) => (
                        <th key={h.label} className={`px-2 py-2 text-left ${h.w}`}>
                          {h.label}
                        </th>
                      ))}
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
                              (!editItem!.warehouseId || b.warehouseId === editItem!.warehouseId)
                          )
                          .reduce((s, b) => s + b.quantity, 0);
                        return (
                          <tr key={i} className="border-t border-[#ebeef5]">
                            <td className="px-2 py-1.5 text-[#909399]">{i + 1}</td>
                            <td className="px-2 py-1.5 text-[#303133]">{d.productCode}</td>
                            <td className="px-2 py-1.5 text-[#303133]">{d.productName}</td>
                            <td className="px-2 py-1.5 text-[#909399]">{p?.specification || '-'}</td>
                            <td className="px-2 py-1.5 text-[#909399]">{p?.unit || '-'}</td>
                            <td className="px-2 py-1.5">
                              <select
                                className="w-full h-7 px-1 border border-[#dcdfe6] text-xs rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                                value={d.positionId}
                                onChange={(e) => updateDetail(i, 'positionId', e.target.value)}
                              >
                                <option value="">请选择</option>
                                {positions
                                  .filter((pos) => !editItem!.warehouseId || pos.warehouseId === editItem!.warehouseId)
                                  .map((pos) => (
                                    <option key={pos.id} value={pos.id}>
                                      {pos.name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td className="px-2 py-1.5 text-[#67c23a]">{available}</td>
                            <td className="px-2 py-1.5 text-right">
                              <input
                                type="number"
                                min="0"
                                className="w-20 h-7 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                                value={d.quantity || ''}
                                onChange={(e) => updateDetail(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <TextButton
                                type="danger"
                                onClick={() => {
                                  removeDetail(i);
                                }}
                              >
                                删除
                              </TextButton>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={detailHeaders.length} className="py-8 text-center text-[#909399]">
                          暂无产品
                          {workOrderMode
                            ? '，请点击「选择调拨单」从工单调拨单中添加'
                            : '，请点击「批量选择产品」或「添加」'}
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
              setWorkOrderMode(false);
            }}
          >
            取消
          </DefaultButton>
          <DefaultButton onClick={handleSaveOnly}>保存</DefaultButton>
          <PrimaryButton onClick={handleSubmit}>保存并提交</PrimaryButton>
        </div>
      </Modal>

      {/* 产品选择弹窗 */}
      <ProductPickerModal
        open={pickerOpen}
        title="选择产品"
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
      />

      {/* 调拨单选择弹窗 */}
      <TransferPickerModal
        open={transferPickerOpen}
        title="选择调拨单"
        onClose={() => setTransferPickerOpen(false)}
        onConfirm={handleTransferConfirm}
      />
    </div>
  );
}
