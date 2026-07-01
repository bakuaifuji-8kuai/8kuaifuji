import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { useStore } from '@/store/useStore';

export interface TransferPickerItem {
  detailId: string;     // 调拨明细ID (TRDxxx)
  orderId: string;      // 调拨单ID
  orderNo: string;      // 调拨单号
  productId: string;
  productCode: string;
  productName: string;
  specification?: string;
  unit?: string;
  positionId: string;
  positionName: string;
  warehouseId: string;
  warehouseName: string;
  totalQty: number;     // 调拨总量
  usedQty: number;      // 已领用
  availableQty: number; // 可领用 = totalQty - usedQty
  transferOrderNo: string;
}

interface TransferPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: TransferPickerItem[]) => void;
  title?: string;
}

export default function TransferPickerModal({
  open,
  onClose,
  onConfirm,
  title = '选择调拨单',
}: TransferPickerModalProps) {
  const { transferOrders, products } = useStore();
  const [search, setSearch] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSearch('');
      setExpandedOrders(new Set());
      setSelectedItems(new Set());
    }
  }, [open]);

  // 只显示已审核且有可领用数量的调拨单
  const availableOrders = transferOrders.filter(
    (o) =>
      (o.status === 'approved' || o.status === 'partiallyUsed') &&
      o.details.some((d) => (d.quantity - (d.usedQuantity || 0)) > 0)
  );

  const filteredOrders = availableOrders.filter(
    (o) =>
      !search ||
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.details.some(
        (d) =>
          d.productCode.toLowerCase().includes(search.toLowerCase()) ||
          d.productName.toLowerCase().includes(search.toLowerCase())
      )
  );

  const toggleOrder = (orderId: string) => {
    const next = new Set(expandedOrders);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setExpandedOrders(next);
  };

  const getItemKey = (orderId: string, detailId: string) => `${orderId}::${detailId}`;

  const toggleItem = (orderId: string, detailId: string) => {
    const key = getItemKey(orderId, detailId);
    const next = new Set(selectedItems);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedItems(next);
  };

  const selectAllInOrder = (orderId: string) => {
    const order = transferOrders.find((o) => o.id === orderId);
    if (!order) return;
    const hasAll = order.details
      .filter((d) => (d.quantity - (d.usedQuantity || 0)) > 0)
      .every((d) => selectedItems.has(getItemKey(orderId, d.id)));
    const next = new Set(selectedItems);
    if (hasAll) {
      order.details
        .filter((d) => (d.quantity - (d.usedQuantity || 0)) > 0)
        .forEach((d) => next.delete(getItemKey(orderId, d.id)));
    } else {
      order.details
        .filter((d) => (d.quantity - (d.usedQuantity || 0)) > 0)
        .forEach((d) => next.add(getItemKey(orderId, d.id)));
    }
    setSelectedItems(next);
  };

  const isAllSelectedInOrder = (orderId: string) => {
    const order = transferOrders.find((o) => o.id === orderId);
    if (!order) return false;
    return order.details
      .filter((d) => (d.quantity - (d.usedQuantity || 0)) > 0)
      .every((d) => selectedItems.has(getItemKey(orderId, d.id)));
  };

  const handleConfirm = () => {
    const items: TransferPickerItem[] = [];
    for (const key of selectedItems) {
      const [orderId, detailId] = key.split('::');
      const order = transferOrders.find((o) => o.id === orderId);
      const detail = order?.details.find((d) => d.id === detailId);
      if (!order || !detail) continue;
      const availableQty = detail.quantity - (detail.usedQuantity || 0);
      if (availableQty <= 0) continue;
      const p = products.find((x) => x.id === detail.productId);
      items.push({
        detailId: detail.id,
        orderId: order.id,
        orderNo: order.orderNo,
        productId: detail.productId,
        productCode: detail.productCode,
        productName: detail.productName,
        specification: p?.specification,
        unit: p?.unit,
        positionId: detail.positionId,
        positionName: detail.positionName,
        warehouseId: order.toWarehouseId,
        warehouseName: order.toWarehouseName || '',
        totalQty: detail.quantity,
        usedQty: detail.usedQuantity || 0,
        availableQty,
        transferOrderNo: order.orderNo,
      });
    }
    onConfirm(items);
  };

  const statusText: Record<string, string> = {
    approved: '已审核',
    partiallyUsed: '部分领用',
    fullyUsed: '已用完',
    pending: '待审核',
    cancelled: '已取消',
  };
  const statusColor: Record<string, string> = {
    approved: 'text-[#67c23a]',
    partiallyUsed: 'text-[#e6a23c]',
    fullyUsed: 'text-[#909399]',
    pending: 'text-[#606266]',
    cancelled: 'text-[#f56c6c]',
  };

  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-[900px]">
      {/* 搜索栏 */}
      <div className="mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索调拨单号 / 物资编码 / 物资名称"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
      </div>

      {/* 表头 */}
      <div className="flex items-center gap-2 mb-2 text-xs text-[#606266] font-medium bg-[#f5f7fa] rounded px-3 py-2">
        <div className="w-8"></div>
        <div className="flex-1">调拨单号 / {search ? '筛选' : '全部'}({filteredOrders.length})</div>
        <div className="w-28 text-center">源仓库</div>
        <div className="w-28 text-center">目标仓库</div>
        <div className="w-20 text-center">状态</div>
        <div className="w-8"></div>
      </div>

      {/* 调拨单列表 */}
      <div className="max-h-[420px] overflow-y-auto border border-[#e4e7ed] rounded">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#909399] text-xs">暂无可领用的调拨单</div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const hasAvailable = order.details.some((d) => d.quantity - (d.usedQuantity || 0) > 0);
            const allSelected = isAllSelectedInOrder(order.id);
            return (
              <div key={order.id}>
                {/* 调拨单行 */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 text-xs border-b border-[#ebeef5] bg-white hover:bg-[#f5f7fa] cursor-pointer ${isExpanded ? 'bg-[#f5f7fa]' : ''}`}
                >
                  <div className="w-8 flex justify-center">
                    {hasAvailable ? (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => selectAllInOrder(order.id)}
                        className="accent-[#2f54eb] cursor-pointer"
                      />
                    ) : (
                      <span className="text-[#c0c4cc] text-[10px]">全选</span>
                    )}
                  </div>
                  <div
                    className="flex-1 flex items-center gap-1"
                    onClick={() => toggleOrder(order.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-[#909399]" />
                    ) : (
                      <ChevronRight size={14} className="text-[#909399]" />
                    )}
                    <span className="text-[#303133] font-medium">{order.orderNo}</span>
                    <span className="text-[#909399] text-[10px]">
                      {order.details.length}项 /{' '}
                      {order.details.reduce((s, d) => s + (d.quantity - (d.usedQuantity || 0)), 0)}件可领
                    </span>
                  </div>
                  <div className="w-28 text-center text-[#606266] truncate" title={order.fromWarehouseName}>
                    {order.fromWarehouseName}
                  </div>
                  <div className="w-28 text-center text-[#606266] truncate" title={order.toWarehouseName}>
                    {order.toWarehouseName}
                  </div>
                  <div className={`w-20 text-center text-[10px] ${statusColor[order.status]}`}>
                    {statusText[order.status]}
                  </div>
                  <div className="w-8 flex justify-center text-[#909399] text-[10px]">
                    {order.details.length > 1 ? (isExpanded ? '收起' : '展开') : ''}
                  </div>
                </div>

                {/* 明细行（可展开） */}
                {isExpanded && (
                  <div className="bg-[#fafbfc]">
                    {order.details.map((d) => {
                      const available = d.quantity - (d.usedQuantity || 0);
                      const isSelected = selectedItems.has(getItemKey(order.id, d.id));
                      const p = products.find((x) => x.id === d.productId);
                      return (
                        <div
                          key={d.id}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs border-b border-[#ebeef5] last:border-b-0 ${available <= 0 ? 'opacity-40' : 'hover:bg-[#ecf5ff]'} cursor-pointer`}
                          onClick={() => available > 0 && toggleItem(order.id, d.id)}
                        >
                          <div className="w-8 flex justify-center">
                            {available > 0 && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItem(order.id, d.id)}
                                className="accent-[#2f54eb] cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div className="col-span-1 text-[#303133] truncate" title={d.productCode}>
                              {d.productCode}
                            </div>
                            <div className="col-span-1 text-[#303133] truncate" title={d.productName}>
                              {d.productName}
                            </div>
                            <div className="col-span-1 text-[#909399] truncate" title={d.positionName}>
                              {d.positionName}
                            </div>
                          </div>
                          <div className="w-20 text-center text-[#606266]">{d.quantity}</div>
                          <div className="w-20 text-center text-[#909399]">{d.usedQuantity || 0}</div>
                          <div className={`w-20 text-center font-medium ${available > 0 ? 'text-[#67c23a]' : 'text-[#f56c6c]'}`}>
                            {available}
                          </div>
                          <div className="w-20 text-right text-[10px] text-[#909399]">
                            {p?.specification || '-'}
                          </div>
                        </div>
                      );
                    })}
                    {/* 明细表头 */}
                    {isExpanded && (
                      <div className="flex items-center gap-2 px-3 py-1 text-[10px] text-[#909399] bg-[#f0f2f5] border-b border-[#ebeef5]">
                        <div className="w-8"></div>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>物资编码</div>
                          <div>物资名称</div>
                          <div>仓位</div>
                        </div>
                        <div className="w-20 text-center">调拨量</div>
                        <div className="w-20 text-center">已领用</div>
                        <div className="w-20 text-center">可领用</div>
                        <div className="w-20 text-right">规格</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-[#909399]">
          已选 <span className="text-[#2f54eb] font-medium">{selectedItems.size}</span> 项
        </div>
        <div className="flex gap-2">
          <DefaultButton onClick={onClose}>取消</DefaultButton>
          <PrimaryButton onClick={handleConfirm} disabled={selectedItems.size === 0}>
            确认选择（{selectedItems.size}）
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
