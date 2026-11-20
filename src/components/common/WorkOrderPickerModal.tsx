import { useState, useEffect, useMemo } from 'react';
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
  constructionUnit?: string;
  boothName?: string;
  boothNo?: string;
  workItemName?: string;
  workItemQty?: number;
  category: string;
  products: {
    productId: string;
    productCode: string;
    productName: string;
    specification?: string;
    unit: string;
    ratio: number;
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

  const [filterWorkOrderCode, setFilterWorkOrderCode] = useState('');
  const [filterWorkOrderName, setFilterWorkOrderName] = useState('');
  const [filterExhibitionName, setFilterExhibitionName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const exhibitionOptions = useMemo((): string[] => {
    return Array.from(new Set(workOrderConfigs.map((o) => o.exhibitionName).filter((v): v is string => !!v)));
  }, [workOrderConfigs]);

  const categoryOptions = useMemo((): string[] => {
    return Array.from(new Set(workOrderConfigs.map((o) => o.category).filter((v): v is string => !!v)));
  }, [workOrderConfigs]);

  useEffect(() => {
    if (open) {
      setFilterWorkOrderCode('');
      setFilterWorkOrderName('');
      setFilterExhibitionName('');
      setFilterCategory('');
      setExpandedOrders(new Set());
      setSelectedItems(new Set());
    }
  }, [open]);

  const filteredOrders = workOrderConfigs.filter((o) => {
    if (filterWorkOrderCode && !o.workOrderCode.toLowerCase().includes(filterWorkOrderCode.toLowerCase())) return false;
    if (filterWorkOrderName && !o.workOrderName.toLowerCase().includes(filterWorkOrderName.toLowerCase())) return false;
    if (filterExhibitionName && o.exhibitionName !== filterExhibitionName) return false;
    if (filterCategory && o.category !== filterCategory) return false;
    return true;
  });

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

  const getBizType = (category: string): string => {
    const parts = category.split('/');
    return parts[0] || category;
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
        constructionUnit: config.constructionUnit,
        boothName: config.boothName,
        boothNo: config.boothNo,
        workItemName: config.workItemName,
        workItemQty: config.workItemQty,
        category: config.category,
        products: config.products.map((p) => ({
          productId: p.productId,
          productCode: p.productCode,
          productName: p.productName,
          specification: p.specification,
          unit: p.unit,
          ratio: p.ratio,
        })),
      });
    }
    onConfirm(items);
  };

  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-[1000px]">
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" />
          <input
            type="text"
            value={filterWorkOrderCode}
            onChange={(e) => setFilterWorkOrderCode(e.target.value)}
            placeholder="工单编号（模糊匹配）"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" />
          <input
            type="text"
            value={filterWorkOrderName}
            onChange={(e) => setFilterWorkOrderName(e.target.value)}
            placeholder="工单名称（模糊匹配）"
            className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-xs rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        <select
          value={filterExhibitionName}
          onChange={(e) => setFilterExhibitionName(e.target.value)}
          className="h-8 px-2 border border-[#dcdfe6] text-xs rounded text-[#303133] focus:outline-none focus:border-[#2f54eb] bg-white"
        >
          <option value="">全部展会</option>
          {exhibitionOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-8 px-2 border border-[#dcdfe6] text-xs rounded text-[#303133] focus:outline-none focus:border-[#2f54eb] bg-white"
        >
          <option value="">全部作业分类</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 mb-2 text-xs text-[#606266] font-medium bg-[#f5f7fa] rounded px-3 py-2">
        <div className="w-8"></div>
        <div className="w-28 text-left">工单编号</div>
        <div className="w-14 text-center">展馆</div>
        <div className="w-20 text-center">档位号</div>
        <div className="w-20 text-center">施工单位</div>
        <div className="w-16 text-center">业务类型</div>
        <div className="flex-1 text-center">作业项目</div>
        <div className="w-16 text-center">作业数量</div>
        <div className="w-12 text-center">明细</div>
      </div>

      <div className="max-h-[420px] overflow-y-auto border border-[#e4e7ed] rounded">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#909399] text-xs">暂无作业项物资配置</div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const isSelected = selectedItems.has(order.id);
            const workItemQty = order.workItemQty;
            const bizType = getBizType(order.category);
            const pCount = order.products.length;

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
                  <div className="w-28 text-[#303133] font-medium truncate" title={order.workOrderCode}>
                    {order.workOrderCode}
                  </div>
                  <div className="w-14 text-center text-[#606266]">{order.boothName || '-'}</div>
                  <div className="w-20 text-center text-[#606266] truncate" title={order.boothNo || ''}>{order.boothNo || '-'}</div>
                  <div className="w-20 text-center text-[#606266] truncate" title={order.constructionUnit || ''}>{order.constructionUnit || '-'}</div>
                  <div className="w-16 text-center text-[#606266] truncate" title={bizType}>{bizType}</div>
                  <div
                    className="flex-1 text-center text-[#303133] truncate"
                    title={order.workItemName || order.workOrderName}
                    onClick={() => toggleOrder(order.id)}
                  >
                    {order.workItemName || order.workOrderName}
                  </div>
                  <div className="w-16 text-center text-[#303133] font-medium">{workItemQty ?? '-'}</div>
                  <div
                    className="w-12 flex justify-center text-[#909399] text-[10px]"
                    onClick={() => toggleOrder(order.id)}
                  >
                    {pCount > 0
                      ? isExpanded ? <ChevronDown size={14} className="text-[#909399]" /> : <ChevronRight size={14} className="text-[#909399]" />
                      : null}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-[#fafbfc]">
                    {pCount > 0 ? (
                      <div className="px-3 py-1 text-[10px] text-[#409eff] bg-[#ecf5ff] border-b border-[#ebeef5]">
                        📦 物资配置（不分主辅，数量为比例系数）
                      </div>
                    ) : null}
                    {order.products.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 text-xs border-b border-[#ebeef5]">
                        <div className="w-8"></div>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="text-[#303133] truncate" title={p.productCode}>{p.productCode}</div>
                          <div className="text-[#303133] truncate" title={p.productName}>{p.productName}</div>
                        </div>
                        <div className="w-20 text-[#909399] truncate" title={p.specification || '-'}>{p.specification || '-'}</div>
                        <div className="w-16 text-center text-[#303133]">{p.ratio}</div>
                        <div className="w-16 text-center text-[#909399]">{p.unit}</div>
                        <div className="w-12"></div>
                      </div>
                    ))}
                    {pCount === 0 && (
                      <div className="px-3 py-4 text-center text-[#909399] text-xs">⚠️ 该工单未配置物资</div>
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
