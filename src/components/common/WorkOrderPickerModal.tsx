import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { useStore } from '@/store/useStore';

export interface WorkOrderPickerItem {
  workOrderId: string;
  workOrderCode: string;
  workOrderName: string;
  projectId: string;
  projectName: string;
  exhibitionName: string;
  category: string;
  mainProducts: {
    productId: string;
    productCode: string;
    productName: string;
    specification?: string;
    unit: string;
    quantity: number;
  }[];
  auxiliaryProducts: {
    productId: string;
    productCode: string;
    productName: string;
    specification?: string;
    unit: string;
    quantity: number;
  }[];
}

interface WorkOrderPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: WorkOrderPickerItem[]) => void;
  title?: string;
}

export default function WorkOrderPickerModal({
  open,
  onClose,
  onConfirm,
  title = '选择工单',
}: WorkOrderPickerModalProps) {
  const { workOrderConfigs } = useStore();
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

  const filteredOrders = workOrderConfigs.filter(
    (o) =>
      !search ||
      o.workOrderCode.toLowerCase().includes(search.toLowerCase()) ||
      o.workOrderName.toLowerCase().includes(search.toLowerCase()) ||
      o.projectName.toLowerCase().includes(search.toLowerCase()) ||
      o.exhibitionName?.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOrder = (orderId: string) => {
    const next = new Set(expandedOrders);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setExpandedOrders(next);
  };

  const toggleItem = (orderId: string) => {
    const next = new Set(selectedItems);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setSelectedItems(next);
  };

  const handleConfirm = () => {
    const items: WorkOrderPickerItem[] = [];
    for (const workOrderId of selectedItems) {
      const config = workOrderConfigs.find((o) => o.id === workOrderId);
      if (!config) continue;
      items.push({
        workOrderId: config.workOrderId,
        workOrderCode: config.workOrderCode,
        workOrderName: config.workOrderName,
        projectId: config.projectId,
        projectName: config.projectName,
        exhibitionName: config.exhibitionName,
        category: config.category,
        mainProducts: config.mainProducts.map((p) => ({
          productId: p.productId,
          productCode: p.productCode,
          productName: p.productName,
          specification: p.specification,
          unit: p.unit,
          quantity: p.quantity,
        })),
        auxiliaryProducts: config.auxiliaryProducts.map((p) => ({
          productId: p.productId,
          productCode: p.productCode,
          productName: p.productName,
          specification: p.specification,
          unit: p.unit,
          quantity: p.quantity,
        })),
      });
    }
    onConfirm(items);
  };

  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-[900px]">
      <div className="mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工单编码 / 工单名称 / 展会名称 / 作业分类"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2 text-xs text-[#606266] font-medium bg-[#f5f7fa] rounded px-3 py-2">
        <div className="w-8"></div>
        <div className="flex-1">工单 / {search ? '筛选' : '全部'}({filteredOrders.length})</div>
        <div className="w-36 text-center">展会名称</div>
        <div className="w-40 text-center">作业分类</div>
        <div className="w-20 text-center">主料数</div>
        <div className="w-20 text-center">辅料数</div>
        <div className="w-8"></div>
      </div>

      <div className="max-h-[420px] overflow-y-auto border border-[#e4e7ed] rounded">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#909399] text-xs">暂无工单物资配置</div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const isSelected = selectedItems.has(order.id);
            const totalMainQty = order.mainProducts.reduce((s, p) => s + p.quantity, 0);
            const totalAuxQty = order.auxiliaryProducts.reduce((s, p) => s + p.quantity, 0);

            return (
              <div key={order.id}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 text-xs border-b border-[#ebeef5] bg-white hover:bg-[#f5f7fa] cursor-pointer ${isExpanded ? 'bg-[#f5f7fa]' : ''}`}
                >
                  <div className="w-8 flex justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(order.id)}
                      className="accent-[#2f54eb] cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-1"
                    onClick={() => toggleOrder(order.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-[#909399]" />
                    ) : (
                      <ChevronRight size={14} className="text-[#909399]" />
                    )}
                    <span className="text-[#303133] font-medium">{order.workOrderCode}</span>
                    <span className="text-[#909399] text-[10px]">
                      {order.workOrderName}
                    </span>
                  </div>
                  <div className="w-36 text-center text-[#606266] truncate" title={order.exhibitionName}>
                    {order.exhibitionName}
                  </div>
                  <div className="w-40 text-center text-[#606266] truncate" title={order.category}>
                    {order.category}
                  </div>
                  <div className="w-20 text-center text-[#606266]">{order.mainProducts.length}种/{totalMainQty}</div>
                  <div className="w-20 text-center text-[#606266]">{order.auxiliaryProducts.length}种/{totalAuxQty}</div>
                  <div className="w-8 flex justify-center text-[#909399] text-[10px]">
                    {order.mainProducts.length + order.auxiliaryProducts.length > 1 ? (isExpanded ? '收起' : '展开') : ''}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-[#fafbfc]">
                    {order.mainProducts.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1 text-[10px] text-[#67c23a] bg-[#f0f9eb] border-b border-[#ebeef5]">
                          <div className="w-8"></div>
                          <div className="flex-1 font-medium">主料</div>
                          <div className="w-40"></div>
                          <div className="w-20 text-center">数量</div>
                          <div className="w-20 text-center">单位</div>
                          <div className="w-8"></div>
                        </div>
                        {order.mainProducts.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 text-xs border-b border-[#ebeef5]">
                            <div className="w-8"></div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="text-[#303133] truncate" title={p.productCode}>{p.productCode}</div>
                              <div className="text-[#303133] truncate" title={p.productName}>{p.productName}</div>
                            </div>
                            <div className="w-40 text-[#909399] truncate" title={p.specification || '-'}>
                              {p.specification || '-'}
                            </div>
                            <div className="w-20 text-center text-[#303133]">{p.quantity}</div>
                            <div className="w-20 text-center text-[#909399]">{p.unit}</div>
                            <div className="w-8"></div>
                          </div>
                        ))}
                      </>
                    )}

                    {order.auxiliaryProducts.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1 text-[10px] text-[#e6a23c] bg-[#fdf6ec] border-b border-[#ebeef5]">
                          <div className="w-8"></div>
                          <div className="flex-1 font-medium">辅料</div>
                          <div className="w-40"></div>
                          <div className="w-20 text-center">数量</div>
                          <div className="w-20 text-center">单位</div>
                          <div className="w-8"></div>
                        </div>
                        {order.auxiliaryProducts.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 text-xs border-b border-[#ebeef5]">
                            <div className="w-8"></div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="text-[#303133] truncate" title={p.productCode}>{p.productCode}</div>
                              <div className="text-[#303133] truncate" title={p.productName}>{p.productName}</div>
                            </div>
                            <div className="w-40 text-[#909399] truncate" title={p.specification || '-'}>
                              {p.specification || '-'}
                            </div>
                            <div className="w-20 text-center text-[#303133]">{p.quantity}</div>
                            <div className="w-20 text-center text-[#909399]">{p.unit}</div>
                            <div className="w-8"></div>
                          </div>
                        ))}
                      </>
                    )}

                    {order.mainProducts.length === 0 && order.auxiliaryProducts.length === 0 && (
                      <div className="px-3 py-4 text-center text-[#909399] text-xs">暂无物资配置</div>
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
          已选 <span className="text-[#2f54eb] font-medium">{selectedItems.size}</span> 个工单
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
