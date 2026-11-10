import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import type { StockTransfer } from '@/types';
import { ChevronLeft, ChevronDown, Hash, ArrowRightLeft, Calendar, Building2, FileText, CheckCircle2, Clock, XCircle, User, Package } from 'lucide-react';

// ========== iPhone 状态栏 ==========
function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-xs font-semibold text-slate-900">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="w-4 h-2.5 border border-slate-900 rounded-[2px] relative">
          <span className="absolute inset-0.5 bg-slate-900 rounded-[1px]" />
        </span>
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>
  );
}

// ========== 状态文案映射 ==========
const STATUS_META: Record<string, { text: string; color: string; bg: string }> = {
  pending:            { text: '待出库确认', color: '#d97706', bg: 'bg-amber-50 text-amber-700' },
  outbound_confirmed: { text: '待入库确认', color: '#2563eb', bg: 'bg-blue-50 text-blue-700' },
  completed:          { text: '已完成',     color: '#059669', bg: 'bg-green-50 text-green-700' },
  cancelled:          { text: '已取消',     color: '#6b7280', bg: 'bg-slate-100 text-slate-500' },
};

// ========== Mock 审批人身份（localStorage 切换） ==========
interface MockApprover {
  id: string;
  name: string;
  dept: string;
  role: string; // 审批角色标签
}
const MOCK_APPROVERS: MockApprover[] = [
  { id: 'AP001', name: '陈主管', dept: '展会运营部', role: '展会审批人' },
  { id: 'AP002', name: '李总监', dept: '展会管理部', role: '部门负责人' },
  { id: 'AP003', name: '王经理', dept: '仓库管理部', role: '仓储审批人' },
];

// ========== 调拨单卡片（列表视图） ==========
interface TransferCardProps {
  item: StockTransfer;
  onClick: () => void;
  actionLabel: string;
  actionStyle: 'primary' | 'success' | 'muted' | 'warning';
}
function TransferCard({ item, onClick, actionLabel, actionStyle }: TransferCardProps) {
  const meta = STATUS_META[item.status] || STATUS_META.pending;
  const totalQty = item.details.reduce((a, b) => a + (b.quantity || 0), 0);

  const actionClass = actionStyle === 'primary'
    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
    : actionStyle === 'success'
      ? 'bg-green-500 text-white'
      : actionStyle === 'warning'
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : 'bg-slate-100 text-slate-500';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-3 active:scale-[0.98] transition-all cursor-pointer"
    >
      {/* 顶部：单号 + 状态 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Hash size={12} />
          <span>{item.transferNo}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.bg}`}>
          {meta.text}
        </span>
      </div>

      {/* 仓库流向 */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-700 mb-2">
        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">{item.fromWarehouseName || '-'}</span>
        <ArrowRightLeft size={12} className="text-slate-400" />
        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">{item.toWarehouseName || '-'}</span>
      </div>

      {/* 展会 + 摊位 + 作业项 */}
      {(item.projectName || item.details.find(d => d.boothNo) || item.details.find(d => d.workItemName)) && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2 flex-wrap">
          {item.projectName && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">
              <Building2 size={10} />{item.projectName}
            </span>
          )}
          {item.details.find(d => d.boothNo) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px]">
              摊位 {item.details.find(d => d.boothNo)?.boothNo}
            </span>
          )}
          {item.details.find(d => d.workItemName) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px]">
              {item.details.find(d => d.workItemName)?.workItemName}
            </span>
          )}
        </div>
      )}

      {/* 时间 + 数量 + 按钮 */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Calendar size={11} />
          {item.createTime?.slice(0, 16) || '-'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">共 {totalQty} 件</span>
          <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${actionClass}`}>
            {actionLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ========== 审批人切换弹层 ==========
function ApproverPicker({
  current,
  onPick,
  onClose,
}: {
  current: MockApprover;
  onPick: (a: MockApprover) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl p-4 pb-6 max-h-[70%] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-[16px] font-semibold text-slate-800">切换审批人身份</div>
          <button onClick={onClose} className="text-slate-400 text-[20px]">✕</button>
        </div>
        <div className="space-y-2">
          {MOCK_APPROVERS.map((a) => {
            const active = a.id === current.id;
            return (
              <div
                key={a.id}
                onClick={() => { onPick(a); onClose(); }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  active ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  active ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-slate-800">{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.dept} · {a.role}</div>
                </div>
                {active && <CheckCircle2 size={20} className="text-indigo-500" />}
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-center text-slate-400 mt-4">
          切换仅影响本地预览，实际业务请以 PC 后台为准
        </div>
      </div>
    </div>
  );
}

// ========== 流转记录 ==========
interface FlowNode {
  actor: string;
  dept: string;
  action: string;
  time: string;
  opinion?: string;
  status: 'done' | 'current' | 'pending';
}
function FlowRecord({ item, approver }: { item: StockTransfer; approver: MockApprover }) {
  const nodes: FlowNode[] = [
    {
      actor: item.creator || '-',
      dept: '展会运营部',
      action: '发起调拨申请',
      time: item.createTime || '-',
      opinion: '请审批，展会物资急需调拨至虚拟仓',
      status: 'done',
    },
    {
      actor: approver.name,
      dept: approver.dept,
      action: '出库审批',
      time: '',
      status: 'current',
    },
  ];

  if (item.outboundConfirmer) {
    nodes.push({
      actor: item.outboundConfirmer,
      dept: '仓库管理部',
      action: '出库确认',
      time: item.outboundConfirmTime || '-',
      status: 'pending',
    });
  }
  if (item.status === 'completed' || item.inboundConfirmer) {
    nodes.push({
      actor: item.inboundConfirmer || '入库确认人',
      dept: '仓库管理部',
      action: '入库确认',
      time: item.inboundConfirmTime || '-',
      status: 'pending',
    });
  }

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100">
      <div className="text-[13px] font-semibold text-slate-800 mb-3 flex items-center gap-1">
        <FileText size={13} /> 流转记录
      </div>
      <div className="relative pl-5">
        {/* 时间线 */}
        <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-slate-200" />
        {nodes.map((n, i) => {
          const isLast = i === nodes.length - 1;
          return (
            <div key={i} className={`relative pb-4 ${isLast ? '' : ''}`}>
              {/* 节点圆点 */}
              <div className={`absolute -left-5 top-0 w-3.5 h-3.5 rounded-full border-2 ${
                n.status === 'done' ? 'bg-green-500 border-green-500' :
                n.status === 'current' ? 'bg-white border-indigo-500 ring-2 ring-indigo-100' :
                'bg-slate-200 border-slate-300'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-slate-800">{n.action}</span>
                  {n.status === 'current' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 font-medium">待办</span>
                  )}
                  {n.status === 'done' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-50 text-green-600 font-medium">已完成</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {n.actor} · {n.dept}
                </div>
                {n.time && (
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />{n.time}
                  </div>
                )}
                {n.opinion && (
                  <div className="text-[11px] text-slate-600 mt-1 px-2 py-1 bg-slate-50 rounded border-l-2 border-slate-200">
                    意见：{n.opinion}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== 业务表单区块（键值对） ==========
function BusinessInfoGrid({ item }: { item: StockTransfer }) {
  const firstDetail = item.details[0];
  const rows: [string, string][] = [
    ['调拨单号', item.transferNo],
    ['调出仓库', item.fromWarehouseName || '-'],
    ['调入仓库', item.toWarehouseName || '-'],
    ['所属展会', item.projectName || '-'],
  ];
  if (firstDetail?.boothNo) rows.push(['施工摊位号', firstDetail.boothNo]);
  if (firstDetail?.workItemName) rows.push(['作业项', firstDetail.workItemName]);
  if (item.constructionUnit) rows.push(['施工单位', item.constructionUnit]);
  rows.push(['制单人', item.creator]);
  rows.push(['创建时间', item.createTime?.slice(0, 16).replace('T', ' ') || '-']);
  if (item.outboundConfirmer) rows.push(['出库确认人', item.outboundConfirmer]);
  if (item.outboundConfirmTime) rows.push(['出库确认时间', item.outboundConfirmTime]);

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100">
      <div className="text-[13px] font-semibold text-slate-800 mb-3">业务表单</div>
      <div className="space-y-2">
        {rows.map(([label, value], i) => (
          <div key={i} className="flex items-start gap-3 text-[12px]">
            <div className="w-[72px] shrink-0 text-slate-400">{label}</div>
            <div className="flex-1 text-slate-800 break-all">{value}</div>
          </div>
        ))}
        {item.remark && (
          <div className="flex items-start gap-3 text-[12px] pt-1 border-t border-slate-50">
            <div className="w-[72px] shrink-0 text-slate-400">备注</div>
            <div className="flex-1 text-slate-800">{item.remark}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 物资明细（移动端卡片化） ==========
function MaterialDetailList({ item, products }: { item: StockTransfer; products: any[] }) {
  const totalQty = item.details.reduce((a, b) => a + (b.quantity || 0), 0);

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold text-slate-800 flex items-center gap-1">
          <Package size={13} /> 物资明细
        </div>
        <span className="text-[11px] text-slate-500">
          共 {item.details.length} 种 / {totalQty} 件
        </span>
      </div>
      <div className="space-y-2">
        {item.details.map((d, i) => {
          const product = products.find((p: any) => p.id === d.productId);
          return (
            <div key={i} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 line-clamp-1">
                    {d.productName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    <span className="font-mono">{d.productCode || '-'}</span>
                    {(d.specification || product?.specification) && ` · ${d.specification || product?.specification}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[15px] font-bold text-slate-800">{d.quantity}</div>
                  <div className="text-[10px] text-slate-400">{d.unit || product?.unit || '件'}</div>
                </div>
              </div>
              {(d.boothNo || d.workItemName || d.remark) && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {d.boothNo && (
                    <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px]">
                      摊位 {d.boothNo}
                    </span>
                  )}
                  {d.workItemName && (
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px]">
                      {d.workItemName}
                    </span>
                  )}
                  {d.workOrderQty && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">
                      作业数量 {d.workOrderQty}
                    </span>
                  )}
                  {d.isMain && (
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px]">主料</span>
                  )}
                  {d.remark && (
                    <span className="text-[10px] text-slate-500">{d.remark}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== 详情页 Modal ==========
function ApprovalDetailModal({
  item,
  approver,
  products,
  onClose,
}: {
  item: StockTransfer;
  approver: MockApprover;
  products: any[];
  onClose: () => void;
}) {
  const meta = STATUS_META[item.status] || STATUS_META.pending;
  const isPending = item.status === 'pending' || item.status === 'outbound_confirmed';

  return (
    <div className="absolute inset-0 bg-white z-40 flex flex-col">
      {/* 顶部 Nav */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
          <ChevronLeft size={22} />
          <span className="text-[14px]">返回</span>
        </div>
        <div className="text-[16px] font-semibold">调拨出库审批</div>
        <button onClick={onClose} className="text-[14px] opacity-80">关闭</button>
      </div>

      {/* 审批头信息 */}
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-slate-800">{meta.text}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <User size={11} />
              发起人：{item.creator || '-'}（{approver.dept}）
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              流程：transferOutboundAudit
            </div>
          </div>
          <ArrowRightLeft size={28} className="text-indigo-400" />
        </div>
      </div>

      {/* 内容滚动区 */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3 space-y-3 pb-24">
        <BusinessInfoGrid item={item} />
        <MaterialDetailList item={item} products={products} />
        <FlowRecord item={item} approver={approver} />
      </div>

      {/* 底部操作栏 */}
      {isPending ? (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex gap-3">
          <button
            onClick={() => alert('已退回（演示）')}
            className="flex-1 h-11 bg-slate-100 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-1 active:scale-[0.98] transition"
          >
            <XCircle size={16} /> 退回
          </button>
          <button
            onClick={() => alert('已同意（演示）')}
            className="flex-1 h-11 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-[0.98] transition"
          >
            <CheckCircle2 size={16} /> 同意
          </button>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-100 px-4 py-3 text-center text-[12px] text-slate-400">
          单据已 {meta.text}，无待办操作
        </div>
      )}
    </div>
  );
}

// ========== 主组件 ==========
export default function ExhibitionTransferApprovalOutbound() {
  const stockTransfers = useStore((s) => s.stockTransfers || []);
  const warehouses = useStore((s) => s.warehouses || []);
  const products = useStore((s) => s.products || []);

  // 审批人身份
  const [currentApprover, setCurrentApprover] = useState<MockApprover>(() => {
    const raw = localStorage.getItem('transfer_approver_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const found = MOCK_APPROVERS.find((a) => a.id === parsed.id);
        if (found) return found;
      } catch { /* ignore */ }
    }
    return MOCK_APPROVERS[0];
  });

  const [activeTab, setActiveTab] = useState<'pending' | 'handled'>('pending');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<StockTransfer | null>(null);

  // 过滤展会类调拨单（调出/调入仓库 category=exhibition）
  const exhibitionTransfers = useMemo(() => {
    return stockTransfers.filter((t) => {
      const fromWh = warehouses.find((w) => w.id === t.fromWarehouseId);
      const toWh = warehouses.find((w) => w.id === t.toWarehouseId);
      return fromWh?.category === 'exhibition' && toWh?.category === 'exhibition';
    });
  }, [stockTransfers, warehouses]);

  // 待审批 = pending（待出库确认）
  const pendingList = useMemo(() => {
    return exhibitionTransfers.filter((t) => t.status === 'pending');
  }, [exhibitionTransfers]);

  // 已处理 = outbound_confirmed + completed + cancelled
  const handledList = useMemo(() => {
    return exhibitionTransfers.filter((t) => t.status !== 'pending');
  }, [exhibitionTransfers]);

  const handlePickApprover = (a: MockApprover) => {
    setCurrentApprover(a);
    localStorage.setItem('transfer_approver_user', JSON.stringify(a));
  };

  const openDetail = (item: StockTransfer) => {
    setCurrentItem(item);
    setDetailOpen(true);
  };

  const list = activeTab === 'pending' ? pendingList : handledList;

  const renderPhoneFrame = () => {
    return (
      <div className="relative w-[375px] h-[720px] mx-auto rounded-[36px] shadow-2xl overflow-hidden bg-white border-[10px] border-slate-800 flex flex-col">
        <StatusBar />

        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <ChevronLeft size={22} className="cursor-pointer opacity-0" />
          <div className="text-[16px] font-semibold">展会调拨出库 · 审批中心</div>
          <div className="w-[22px]" />
        </div>

        {/* Tab 切换 */}
        <div className="flex bg-white border-b border-slate-100">
          {(['pending', 'handled'] as const).map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-3 text-[14px] font-medium cursor-pointer relative transition ${
                activeTab === tab ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              {tab === 'pending' ? `待审批（${pendingList.length}）` : `已处理（${handledList.length}）`}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded" />
              )}
            </div>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3">
          {list.length > 0 ? list.map((item) => {
            const meta = STATUS_META[item.status] || STATUS_META.pending;
            let actionLabel = '查看详情';
            let actionStyle: 'primary' | 'success' | 'muted' | 'warning' = 'muted';
            if (item.status === 'pending') {
              actionLabel = '去审批';
              actionStyle = 'primary';
            } else if (item.status === 'outbound_confirmed' || item.status === 'completed') {
              actionLabel = meta.text;
              actionStyle = item.status === 'completed' ? 'success' : 'warning';
            } else {
              actionLabel = meta.text;
              actionStyle = 'muted';
            }

            return (
              <TransferCard
                key={item.id}
                item={item}
                onClick={() => openDetail(item)}
                actionLabel={actionLabel}
                actionStyle={actionStyle}
              />
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <FileText size={28} className="text-slate-300" />
              </div>
              <div className="text-[14px]">
                {activeTab === 'pending' ? '暂无待审批单据' : '暂无已处理记录'}
              </div>
              <div className="text-[11px] mt-1">
                {activeTab === 'pending' ? '当前审批人没有待办的出库审批单' : '去"待审批"看看吧'}
              </div>
            </div>
          )}
        </div>

        {/* 底部：当前审批人 */}
        <div
          className="bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-between cursor-pointer active:bg-slate-50"
          onClick={() => setPickerOpen(true)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
              <User size={14} />
            </div>
            <div>
              <div className="text-[12px] text-slate-400">当前审批人</div>
              <div className="text-[13px] font-semibold text-slate-800">{currentApprover.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-indigo-500">
            <span className="text-[12px]">切换</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 审批人切换弹层 */}
        {pickerOpen && !detailOpen && (
          <ApproverPicker
            current={currentApprover}
            onPick={handlePickApprover}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {/* 详情 Modal */}
        {detailOpen && currentItem && (
          <ApprovalDetailModal
            item={currentItem}
            approver={currentApprover}
            products={products}
            onClose={() => { setDetailOpen(false); setCurrentItem(null); }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      {/* PC 顶部标题栏 */}
      <div className="max-w-[900px] mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-slate-800 flex items-center gap-2">
              <span>📱</span>
              展会调拨出库 · 审批小程序
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              模拟手机端审批人视角，对展会调拨出库单据进行查看与审批操作（演示原型，数据来自 PC 后台）
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPickerOpen(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              切换审批人（{MOCK_APPROVERS.length}）
            </button>
          </div>
        </div>
      </div>

      {/* 手机框容器 */}
      <div className="flex justify-center relative">
        <div className="relative">
          {renderPhoneFrame()}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-[900px] mx-auto px-6 mt-6 text-center text-[11px] text-slate-400">
        ⚠️ 本为 COS 静态演示原型，数据保存在浏览器 localStorage。同一浏览器同源访问时前后台数据互通；更换浏览器、清除缓存数据即丢失。
      </div>
    </div>
  );
}
