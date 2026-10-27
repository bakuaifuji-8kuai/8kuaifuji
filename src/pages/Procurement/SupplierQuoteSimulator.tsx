import { useMemo, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { Bidding, CatalogCompareItem, SupplierQuote, SupplierQuoteDetail, ProcurementDemandType, Attachment } from '@/types';
import { MOCK_BIDDINGS, MOCK_SUPPLIER_QUOTES } from '@/mock/biddingMockData';
import { ChevronLeft, ChevronDown, FileText, AlertTriangle, CheckCircle2, Clock, User, Building2, MapPin, Calendar, Hash, Paperclip, FileDown, Upload } from 'lucide-react';

// ========== Mock 供应商身份（localStorage 切换） ==========
interface MockSupplierUser {
  id: string;
  name: string;
  contact: string;
  phone: string;
}
const MOCK_SUPPLIER_USERS: MockSupplierUser[] = [
  { id: 'SUP008', name: '湖南展台搭建有限公司', contact: '王经理', phone: '138****5678' },
  { id: 'SUP005', name: '长沙展架供应有限公司', contact: '李总', phone: '139****1234' },
  { id: 'SUP002', name: '宏远展览物资有限公司', contact: '张采购', phone: '137****9999' },
  { id: 'SUP007', name: '会展设备租赁中心', contact: '陈主管', phone: '136****8888' },
  { id: 'SUP003', name: '星辰办公家具供应商', contact: '刘经理', phone: '135****7777' },
  { id: 'SUP009', name: '视界投影科技有限公司', contact: '赵工', phone: '134****6666' },
];

// ========== 5 种需求类型 → 报价视角映射 ==========
// 物资类 → 按物资逐行报价
// 工程/服务类 → 按需求明细逐行报价
const MATERIAL_TYPES: ProcurementDemandType[] = ['material', 'material_non_engineering'];
const getQuoteView = (demandType?: ProcurementDemandType): 'material_row' | 'demand_detail_row' => {
  if (!demandType) return 'material_row';
  return MATERIAL_TYPES.includes(demandType) ? 'material_row' : 'demand_detail_row';
};

const DEMAND_TYPE_LABEL: Record<string, string> = {
  material: '物资采购（工程类-货物）',
  material_non_engineering: '非工程类-货物',
  implementation_project: '实施项目（工程类-施工）',
  service_project: '服务项目（工程类-服务）',
  service_non_engineering: '非工程类-服务',
};

// ========== 报价输入行（动态字段） ==========
interface QuoteInputRow {
  itemIndex: number;       // 对应 bidding.items 的下标
  unitPrice: number;       // 含税单价（通用）
  taxRate: number;         // 税率
  deliveryDate: string;
  remark: string;
  // 费率结算
  ratePerMonth?: number;
  months?: number;
  // 按量结算
  estQuantity?: number;
  // 按次计费
  unitPricePerTime?: number;
  times?: number;
}

// 根据 CatalogCompareItem 的 priceDescription 计算金额
function calcRowAmount(item: CatalogCompareItem, row: QuoteInputRow): { amount: number; taxAmount: number } {
  const taxRate = row.taxRate || item.taxRate || 0.13;
  let unitPrice = row.unitPrice;
  let qty = item.quantity;

  const pd = item.priceDescription || '固定单价';
  if (pd === '费率结算' && row.ratePerMonth != null && row.months != null) {
    unitPrice = row.ratePerMonth;
    qty = row.months;
  } else if (pd === '按量结算' && row.estQuantity != null) {
    qty = row.estQuantity;
  } else if (pd === '按次计费' && row.unitPricePerTime != null && row.times != null) {
    unitPrice = row.unitPricePerTime;
    qty = row.times;
  }

  const amount = Math.round(unitPrice * qty * 100) / 100;
  const taxAmount = Math.round((amount / (1 + taxRate)) * taxRate * 100) / 100;
  return { amount, taxAmount };
}

// 判断报价是否超限
function isOverLimit(item: CatalogCompareItem, row: QuoteInputRow): boolean {
  const limit = item.unitPriceLimitIncludingTax ?? item.singlePriceLimit;
  if (!limit) return false;
  const pd = item.priceDescription || '固定单价';
  if (pd === '固定单价' || pd === '按量结算') return row.unitPrice > limit;
  if (pd === '费率结算') return (row.ratePerMonth ?? row.unitPrice) > limit;
  if (pd === '按次计费') return (row.unitPricePerTime ?? row.unitPrice) > limit;
  return row.unitPrice > limit;
}

// ========== 手机框架 ==========
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

// ========== 工单卡片 ==========
interface BiddingCardProps {
  bidding: Bidding;
  demandType?: ProcurementDemandType;
  onClick: () => void;
  actionLabel: string; // "去报价" / "已报价" / "已过期" / "已完成"
  actionStyle: 'primary' | 'muted' | 'warning';
}
function BiddingCard({ bidding, demandType, onClick, actionLabel, actionStyle }: BiddingCardProps) {
  const end = bidding.endTime ? new Date(bidding.endTime) : null;
  const isExpired = end ? end < new Date() : false;
  const daysLeft = end ? Math.ceil((end.getTime() - Date.now()) / 86400000) : null;

  const actionClass = actionStyle === 'primary'
    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
    : actionStyle === 'warning'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-slate-100 text-slate-500';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-3 active:scale-[0.98] transition-all cursor-pointer"
    >
      {/* 顶部：编号 + 状态 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Hash size={12} />
          <span>{bidding.biddingNo}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          isExpired ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'
        }`}>
          {bidding.status || 'bidding'}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-[15px] font-semibold text-slate-800 leading-snug mb-2 line-clamp-1">
        {bidding.projectName || bidding.biddingName}
      </h3>

      {/* 需求类型标签 */}
      {demandType && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded mb-2">
          <FileText size={10} />
          {DEMAND_TYPE_LABEL[demandType] || demandType}
        </div>
      )}

      {/* 时间 */}
      {end && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
          <Clock size={11} />
          <span>报价截止：{end.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
          {daysLeft !== null && !isExpired && (
            <span className="text-indigo-500 font-medium ml-1">（剩 {daysLeft} 天）</span>
          )}
          {isExpired && <span className="text-slate-400 ml-1">（已过期）</span>}
        </div>
      )}

      {/* 底部：条目数 + 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="text-[11px] text-slate-400">
          共 {bidding.items?.length || 0} 条报价项
        </div>
        <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${actionClass}`}>
          {actionLabel}
        </span>
      </div>
    </div>
  );
}

// ========== 报价明细行组件 ==========
interface QuoteRowItemProps {
  item: CatalogCompareItem;
  row: QuoteInputRow;
  view: 'material_row' | 'demand_detail_row';
  onChange: (row: QuoteInputRow) => void;
}
function QuoteRowItem({ item, row, view, onChange }: QuoteRowItemProps) {
  const priceDesc = item.priceDescription || '固定单价';
  const limit = item.unitPriceLimitIncludingTax ?? item.singlePriceLimit;
  const overLimit = isOverLimit(item, row);
  const { amount } = calcRowAmount(item, row);

  // 标题：物资视角 → 编码+规格；需求明细视角 → 项目名称+概况
  const mainTitle = view === 'material_row'
    ? item.productName
    : (item.projectName || item.productName);
  const subInfo = view === 'material_row'
    ? `${item.productCode}${item.specification ? ' · ' + item.specification : ''}`
    : (item.description || '');

  return (
    <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
      {/* 标题区 */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-slate-800 line-clamp-1">{mainTitle}</div>
            {subInfo && <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{subInfo}</div>}
          </div>
          {limit && (
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400">含税上限</div>
              <div className="text-[13px] font-semibold text-slate-600">¥{limit.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* 单位 + 数量 + 价格方式标签 */}
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
          <span>{item.unit}</span>
          <span>×</span>
          <span className="font-medium text-slate-700">{item.quantity}</span>
          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px]">{priceDesc}</span>
        </div>
      </div>

      {/* 报价输入区 — 按 priceDescription 分支 */}
      <div className="space-y-2">
        {priceDesc === '固定单价' && (
          <div>
            <label className="text-[11px] text-slate-500">含税单价</label>
            <div className="flex items-center mt-1">
              <span className="text-slate-400 mr-1">¥</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={row.unitPrice || ''}
                onChange={(e) => onChange({ ...row, unitPrice: parseFloat(e.target.value) || 0 })}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                placeholder="请输入报价"
              />
            </div>
          </div>
        )}

        {priceDesc === '费率结算' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500">费率(元/月)</label>
              <div className="flex items-center mt-1">
                <span className="text-slate-400 mr-1">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.ratePerMonth ?? ''}
                  onChange={(e) => onChange({ ...row, ratePerMonth: parseFloat(e.target.value) || 0 })}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  placeholder="费率"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500">月数</label>
              <input
                type="number"
                step="1"
                min="1"
                value={row.months ?? ''}
                onChange={(e) => onChange({ ...row, months: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white mt-1"
                placeholder="月数"
              />
            </div>
          </div>
        )}

        {priceDesc === '按量结算' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500">含税单价</label>
              <div className="flex items-center mt-1">
                <span className="text-slate-400 mr-1">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.unitPrice || ''}
                  onChange={(e) => onChange({ ...row, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  placeholder="单价"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500">预估量</label>
              <input
                type="number"
                step="1"
                min="0"
                value={row.estQuantity ?? ''}
                onChange={(e) => onChange({ ...row, estQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white mt-1"
                placeholder="预估量"
              />
            </div>
          </div>
        )}

        {priceDesc === '按次计费' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500">单次报价</label>
              <div className="flex items-center mt-1">
                <span className="text-slate-400 mr-1">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.unitPricePerTime ?? ''}
                  onChange={(e) => onChange({ ...row, unitPricePerTime: parseFloat(e.target.value) || 0 })}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  placeholder="单次"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500">次数</label>
              <input
                type="number"
                step="1"
                min="1"
                value={row.times ?? ''}
                onChange={(e) => onChange({ ...row, times: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white mt-1"
                placeholder="次数"
              />
            </div>
          </div>
        )}

        {/* 金额汇总 + 超限警告 */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[12px] text-slate-500">
            小计：<span className="text-[14px] font-semibold text-slate-800">¥{amount.toLocaleString()}</span>
          </div>
          {overLimit && (
            <div className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
              <AlertTriangle size={12} />
              单价超上限
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== 身份切换弹窗 ==========
function SupplierPicker({
  current,
  onPick,
  onClose,
}: {
  current: MockSupplierUser;
  onPick: (s: MockSupplierUser) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl p-4 pb-6 max-h-[70%] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-[16px] font-semibold text-slate-800">切换供应商身份</div>
          <button onClick={onClose} className="text-slate-400 text-[20px]">✕</button>
        </div>
        <div className="space-y-2">
          {MOCK_SUPPLIER_USERS.map((s) => {
            const active = s.id === current.id;
            return (
              <div
                key={s.id}
                onClick={() => { onPick(s); onClose(); }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  active ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  active ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-slate-800">{s.name}</div>
                  <div className="text-[11px] text-slate-500">{s.contact} · {s.phone}</div>
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

// ========== 主组件 ==========
export default function SupplierQuoteSimulator() {
  const navigate = ((window as any).__router_navigate) || null;
  // store
  const biddings = useStore((s) => s.biddings || []) as Bidding[];
  const demands = useStore((s) => s.procurementDemands || []);
  const supplierQuotes = useStore((s) => s.supplierQuotes || []) as SupplierQuote[];
  const setBiddings = useStore((s) => s.setBiddings);
  const setSupplierQuotes = useStore((s) => s.setSupplierQuotes);
  const addSupplierQuote = useStore((s) => s.addSupplierQuote);
  const updateBidding = useStore((s) => s.updateBidding);

  // 供应商身份（初始从 localStorage 读或取第一个）
  const [currentSupplier, setCurrentSupplier] = useState<MockSupplierUser>(() => {
    const raw = localStorage.getItem('sim_supplier_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const found = MOCK_SUPPLIER_USERS.find((s) => s.id === parsed.id);
        if (found) return found;
      } catch { /* ignore */ }
    }
    return MOCK_SUPPLIER_USERS[0];
  });

  // ========== Mock 数据版本号：升级时强制补齐新字段 ==========
  // 版本 2（2026-10-27）：framework_catalog 工单新增 biddingAnnouncement / biddingDocuments / totalPriceLimit
  const MOCK_VERSION = 2;

  // 初始化：确保 mock 数据注入 + 升级时补齐新字段
  useEffect(() => {
    const LS_KEY = 'sim_mock_version';
    const storedVer = parseInt(localStorage.getItem(LS_KEY) || '0', 10);

    if (biddings.length === 0) {
      // 首次：全量注入
      setBiddings?.(MOCK_BIDDINGS);
      localStorage.setItem(LS_KEY, String(MOCK_VERSION));
    } else if (storedVer < MOCK_VERSION) {
      // 升级：定向 merge framework_catalog 工单的新字段，其他类型保持不变
      const mockFC = MOCK_BIDDINGS.filter((m) => m.procurementMethod === 'framework_catalog');
      const mockFCMap = new Map(mockFC.map((m) => [m.biddingNo, m]));
      const merged = biddings.map((b) => {
        const mock = mockFCMap.get(b.biddingNo);
        if (!mock) return b; // 非 framework_catalog 或 mock 里不存在，保持原样
        // 只补齐缺失字段，不覆盖用户可能已改动的其他字段
        return {
          ...b,
          biddingAnnouncement: b.biddingAnnouncement?.length ? b.biddingAnnouncement : mock.biddingAnnouncement,
          biddingDocuments: b.biddingDocuments?.length ? b.biddingDocuments : mock.biddingDocuments,
          totalPriceLimit: b.totalPriceLimit ?? mock.totalPriceLimit,
        };
      });
      setBiddings?.(merged);
      localStorage.setItem(LS_KEY, String(MOCK_VERSION));
    }

    if (supplierQuotes.length === 0) {
      setSupplierQuotes?.(MOCK_SUPPLIER_QUOTES as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSupplier.id]);

  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);

  // 工单详情 / 报价弹窗状态
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentBidding, setCurrentBidding] = useState<Bidding | null>(null);
  const [quoteRows, setQuoteRows] = useState<QuoteInputRow[]>([]);
  const [supplierAttachments, setSupplierAttachments] = useState<Attachment[]>([]);

  // 工单 → demandType
  const getDemandType = (demandId?: string): ProcurementDemandType | undefined => {
    if (!demandId) return undefined;
    const d = demands.find((x) => x.id === demandId);
    return d?.demandType;
  };

  // 过滤：目录内比价 + 受邀 + 未过期
  const today = new Date();
  const myPendingBiddings = useMemo(() => {
    return biddings.filter((b) => {
      if (b.procurementMethod !== 'framework_catalog') return false;
      if (!b.inviteSupplierIds?.includes(currentSupplier.id)) return false;
      const end = b.endTime ? new Date(b.endTime) : null;
      if (end && end < today) return false;
      return true;
    });
  }, [biddings, currentSupplier.id]);

  // 我已报过价的工单 id 集合
  const myQuoteBiddingIds = useMemo(() => {
    return new Set(
      supplierQuotes
        .filter((q) => q.supplierId === currentSupplier.id)
        .map((q) => q.biddingId)
    );
  }, [supplierQuotes, currentSupplier.id]);

  // 待报价 = 受邀目录内比价 − 已报过的
  const pendingBiddings = useMemo(() => {
    return myPendingBiddings.filter((b) => !myQuoteBiddingIds.has(b.id));
  }, [myPendingBiddings, myQuoteBiddingIds]);

  // 已报价
  const mySubmittedQuotes = useMemo(() => {
    return supplierQuotes.filter((q) => q.supplierId === currentSupplier.id);
  }, [supplierQuotes, currentSupplier.id]);

  // 身份切换 → 存 localStorage
  const handlePickSupplier = (s: MockSupplierUser) => {
    setCurrentSupplier(s);
    localStorage.setItem('sim_supplier_user', JSON.stringify(s));
  };

  // 打开工单详情（进入报价表单）
  const openDetail = (bidding: Bidding) => {
    setCurrentBidding(bidding);
    // 初始化 quoteRows
    const items = bidding.items || [];
    const rows: QuoteInputRow[] = items.map((item, idx) => ({
      itemIndex: idx,
      unitPrice: 0,
      taxRate: item.taxRate || 0.13,
      deliveryDate: '',
      remark: '',
      ratePerMonth: item.contractRatePerMonth,
      months: item.priceDescription === '费率结算' ? 12 : undefined,
      estQuantity: item.priceDescription === '按量结算' ? item.quantity : undefined,
      unitPricePerTime: item.priceDescription === '按次计费' ? 0 : undefined,
      times: item.priceDescription === '按次计费' ? 1 : undefined,
    }));
    setQuoteRows(rows);
    setSupplierAttachments([]);
    setDetailOpen(true);
  };

  // 提交报价
  const submitQuote = () => {
    if (!currentBidding) return;

    const items = currentBidding.items || [];

    // 校验：每行必须有报价
    const invalidRow = quoteRows.find((r, i) => {
      const item = items[i];
      const pd = item.priceDescription || '固定单价';
      if (pd === '固定单价' || pd === '按量结算') return !r.unitPrice || r.unitPrice <= 0;
      if (pd === '费率结算') return !(r.ratePerMonth && r.ratePerMonth > 0) || !(r.months && r.months > 0);
      if (pd === '按次计费') return !(r.unitPricePerTime && r.unitPricePerTime > 0) || !(r.times && r.times > 0);
      return !r.unitPrice || r.unitPrice <= 0;
    });
    if (invalidRow) {
      alert('请填写完整的报价信息');
      return;
    }

    // 组装 SupplierQuoteDetail 列表
    const details: SupplierQuoteDetail[] = items.map((item, idx) => {
      const row = quoteRows[idx];
      const { amount, taxAmount } = calcRowAmount(item, row);
      return {
        productCode: item.productCode || '',
        productName: item.projectName || item.productName,
        specification: item.specification,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: row.unitPrice || row.ratePerMonth || row.unitPricePerTime || 0,
        taxRate: row.taxRate,
        amount,
        taxAmount,
        deliveryDate: row.deliveryDate,
        remark: row.remark,
      };
    });

    const totalAmount = details.reduce((s, d) => s + d.amount, 0);
    const totalTax = details.reduce((s, d) => s + (d.taxAmount || 0), 0);

    // 整单上限总价：超限警告但允许继续（confirm 弹窗让用户自选）
    if (currentBidding.totalPriceLimit && totalAmount > currentBidding.totalPriceLimit) {
      const ok = confirm(
        `⚠️ 报价总金额 ¥${Math.round(totalAmount * 100) / 100} 已超过整单上限总价 ¥${currentBidding.totalPriceLimit}。\n\n是否仍要提交报价？`
      );
      if (!ok) return;
    }

    const quoteNo = `SQ${Date.now().toString().slice(-8)}`;
    const now = new Date().toISOString();

    const quote: SupplierQuote = {
      id: `quote_${Date.now()}`,
      quoteNo,
      biddingId: currentBidding.id,
      biddingNo: currentBidding.biddingNo,
      biddingName: currentBidding.projectName || currentBidding.biddingName || '',
      supplierId: currentSupplier.id,
      supplierName: currentSupplier.name,
      contactPerson: currentSupplier.contact,
      contactPhone: currentSupplier.phone,
      totalAmount: Math.round(totalAmount * 100) / 100,
      taxRate: 0.13,
      taxAmount: Math.round(totalTax * 100) / 100,
      quoteDate: now,
      submittedAt: now,
      status: 'submitted',
      details,
      attachments: supplierAttachments.length > 0 ? supplierAttachments : undefined,
    };

    // 写入 store
    addSupplierQuote(quote);

    // 同时把报价写回 bidding.quotes（兼容旧结构）
    const existingQuotes = currentBidding.quotes || [];
    updateBidding(currentBidding.id, {
      quotes: [...existingQuotes, {
        id: quote.id,
        supplierId: currentSupplier.id,
        supplierName: currentSupplier.name,
        supplierContact: currentSupplier.contact,
        supplierPhone: currentSupplier.phone,
        submitTime: now,
        details: details.map((d) => ({
          productCode: d.productCode,
          productName: d.productName,
          unit: d.unit,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          unitPriceExcludingTax: Math.round((d.unitPrice / (1 + (d.taxRate || 0.13))) * 100) / 100,
          amount: d.amount,
          amountExcludingTax: Math.round((d.amount - (d.taxAmount || 0)) * 100) / 100,
          taxRate: d.taxRate,
          taxAmount: d.taxAmount,
          isOverSingleLimit: false,
        })),
      } as any],
    });

    // 关闭详情 → 切到已报价 tab
    setDetailOpen(false);
    setCurrentBidding(null);
    setActiveTab('submitted');
  };

  // ========== 渲染 ==========
  const renderPhoneFrame = () => {
    return (
      <div className="relative w-[375px] h-[720px] mx-auto rounded-[36px] shadow-2xl overflow-hidden bg-white border-[10px] border-slate-800 flex flex-col">
        {/* iOS 状态栏 */}
        <StatusBar />

        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <ChevronLeft size={22} onClick={() => navigate?.(-1)} className="cursor-pointer opacity-0" />
          <div className="text-[16px] font-semibold">供应商报价中心</div>
          <div className="w-[22px]" />
        </div>

        {/* Tab 切换 */}
        <div className="flex bg-white border-b border-slate-100">
          {(['pending', 'submitted'] as const).map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-3 text-[14px] font-medium cursor-pointer relative transition ${
                activeTab === tab ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              {tab === 'pending' ? `待报价（${pendingBiddings.length}）` : `已报价（${mySubmittedQuotes.length}）`}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded" />
              )}
            </div>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3">
          {activeTab === 'pending' && (
            pendingBiddings.length > 0 ? pendingBiddings.map((b) => {
              const dt = getDemandType(b.demandId);
              const end = b.endTime ? new Date(b.endTime) : null;
              const isExpired = end ? end < new Date() : false;
              return (
                <BiddingCard
                  key={b.id}
                  bidding={b}
                  demandType={dt}
                  onClick={() => !isExpired && openDetail(b)}
                  actionLabel={isExpired ? '已过期' : '去报价'}
                  actionStyle={isExpired ? 'warning' : 'primary'}
                />
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <div className="text-[14px]">暂无待报价工单</div>
                <div className="text-[11px] mt-1">当前供应商未被任何目录内比价工单邀请</div>
              </div>
            )
          )}

          {activeTab === 'submitted' && (
            mySubmittedQuotes.length > 0 ? mySubmittedQuotes.map((q) => {
              const bidding = biddings.find((b) => b.id === q.biddingId);
              const dt = getDemandType(bidding?.demandId);
              return (
                <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Hash size={11} />{q.biddingNo}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      q.status === 'submitted' ? 'bg-green-50 text-green-600' :
                      q.status === 'accepted' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {q.status === 'submitted' ? '已提交' : q.status === 'accepted' ? '已接受' : '已拒绝'}
                    </span>
                  </div>
                  <div className="text-[14px] font-semibold text-slate-800 mb-1">{bidding?.projectName || q.biddingName}</div>
                  {dt && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded mb-2">
                      {DEMAND_TYPE_LABEL[dt] || dt}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-500">报价单号：{q.quoteNo}</span>
                    <span className="text-slate-700 font-semibold">¥{q.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    提交于 {new Date(q.submittedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-slate-300" />
                </div>
                <div className="text-[14px]">还没有提交过报价</div>
                <div className="text-[11px] mt-1">去"待报价"Tab 开始报价吧</div>
              </div>
            )
          )}
        </div>

        {/* 底部：当前登录身份 */}
        <div
          className="bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-between cursor-pointer active:bg-slate-50"
          onClick={() => setSupplierPickerOpen(true)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
              <User size={14} />
            </div>
            <div>
              <div className="text-[12px] text-slate-400">当前登录供应商</div>
              <div className="text-[13px] font-semibold text-slate-800">{currentSupplier.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-indigo-500">
            <span className="text-[12px]">切换</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 身份切换弹层 */}
        {supplierPickerOpen && (
          <SupplierPicker
            current={currentSupplier}
            onPick={handlePickSupplier}
            onClose={() => setSupplierPickerOpen(false)}
          />
        )}
      </div>
    );
  };

  // 报价弹窗（在手机内部 Modal 式全屏）
  const renderDetailModal = () => {
    if (!detailOpen || !currentBidding) return null;
    const items = currentBidding.items || [];
    const demandType = getDemandType(currentBidding.demandId);
    const view = getQuoteView(demandType);

    // 汇总
    let totalAmount = 0;
    let totalTax = 0;
    quoteRows.forEach((row, idx) => {
      const { amount, taxAmount } = calcRowAmount(items[idx], row);
      totalAmount += amount;
      totalTax += taxAmount;
    });

    return (
      <div className="absolute inset-0 bg-white z-40 flex flex-col">
        {/* 顶部 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDetailOpen(false)}>
            <ChevronLeft size={22} />
            <span className="text-[14px]">返回</span>
          </div>
          <div className="text-[16px] font-semibold">在线报价</div>
          <div className="w-14" />
        </div>

        {/* 工单信息 */}
        <div className="bg-white px-4 py-3 border-b border-slate-100">
          <div className="text-[11px] text-slate-400 mb-1">
            <Hash size={10} className="inline mr-0.5" />{currentBidding.biddingNo}
          </div>
          <div className="text-[15px] font-semibold text-slate-800 mb-1.5">
            {currentBidding.projectName || currentBidding.biddingName}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {demandType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded">
                <FileText size={10} />{DEMAND_TYPE_LABEL[demandType] || demandType}
              </span>
            )}
            {view === 'material_row' ? (
              <span className="text-[11px] text-slate-500">🪑 物资视角报价</span>
            ) : (
              <span className="text-[11px] text-slate-500">📋 项目明细视角报价</span>
            )}
          </div>
          {currentBidding.endTime && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-2">
              <Calendar size={11} />
              截止时间：{new Date(currentBidding.endTime).toLocaleString('zh-CN')}
            </div>
          )}
        </div>

        {/* PC 端下发的附件（比价公告 + 比价文件） */}
        {(currentBidding.biddingAnnouncement?.length || currentBidding.biddingDocuments?.length) ? (
          <div className="bg-white px-4 py-3 border-b border-slate-100 space-y-2">
            {currentBidding.biddingAnnouncement?.length ? (
              <div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600 mb-1.5">
                  <Paperclip size={11} /> 比价公告附件（{currentBidding.biddingAnnouncement.length}）
                </div>
                <div className="space-y-1">
                  {currentBidding.biddingAnnouncement.map((att) => (
                    <div key={att.id} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-blue-50 rounded px-2 py-1">
                      <span>📄</span>
                      <span className="flex-1 truncate">{att.fileName}</span>
                      <FileDown size={11} className="text-blue-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {currentBidding.biddingDocuments?.length ? (
              <div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 mb-1.5">
                  <Paperclip size={11} /> 比价文件附件（{currentBidding.biddingDocuments.length}）
                </div>
                <div className="space-y-1">
                  {currentBidding.biddingDocuments.map((att) => (
                    <div key={att.id} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-amber-50 rounded px-2 py-1">
                      <span>📁</span>
                      <span className="flex-1 truncate">{att.fileName}</span>
                      <FileDown size={11} className="text-amber-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* 明细列表 */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3">
          {items.map((item, idx) => (
            <QuoteRowItem
              key={idx}
              item={item}
              row={quoteRows[idx]}
              view={view}
              onChange={(newRow) => {
                setQuoteRows((prev) => prev.map((r, i) => (i === idx ? newRow : r)));
              }}
            />
          ))}

          {/* 备注区 */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <label className="text-[12px] text-slate-600 font-medium">整体备注（选填）</label>
            <textarea
              value={quoteRows[0]?.remark || ''}
              onChange={(e) => {
                const remark = e.target.value;
                setQuoteRows((prev) => prev.map((r) => ({ ...r, remark })));
              }}
              rows={2}
              className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="交货时间、特殊说明等"
            />
          </div>

          {/* 供应商上传附件（选填） */}
          <div className="bg-white rounded-xl p-3 border border-slate-100 mt-3">
            <label className="text-[12px] text-slate-600 font-medium flex items-center gap-1">
              <Upload size={12} /> 供应商附件（选填）
            </label>
            <label className="mt-2 flex items-center justify-center gap-1 h-9 border border-dashed border-slate-300 rounded-lg text-[11px] text-slate-500 cursor-pointer hover:border-indigo-300 hover:text-indigo-500 transition">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const now = new Date().toLocaleString('zh-CN');
                  const newAtts: Attachment[] = files.map((f) => ({
                    id: `sup-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    fileName: f.name,
                    filePath: `mock://sup/${f.name}`,
                    fileSize: f.size,
                    fileType: f.type || f.name.split('.').pop() || '',
                    uploadTime: now,
                  }));
                  setSupplierAttachments((prev) => [...prev, ...newAtts]);
                  e.target.value = '';
                }}
              />
              <Upload size={12} /> 点击选择文件（PDF/Word/图片等）
            </label>
            {supplierAttachments.length > 0 && (
              <div className="mt-2 space-y-1 max-h-32 overflow-auto">
                {supplierAttachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between text-[11px] bg-slate-50 rounded px-2 py-1.5">
                    <span className="flex-1 truncate text-slate-600">📎 {att.fileName}</span>
                    <span
                      className="text-red-500 hover:underline cursor-pointer ml-2"
                      onClick={() => setSupplierAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                    >删除</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部汇总 + 提交 */}
        <div className="bg-white border-t border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[11px] text-slate-400">报价总金额（含税）</div>
              <div className={`text-[20px] font-bold ${
                currentBidding.totalPriceLimit && totalAmount > currentBidding.totalPriceLimit ? 'text-red-500' : 'text-slate-800'
              }`}>
                ¥{Math.round(totalAmount * 100) / 100 < Number.POSITIVE_INFINITY ? totalAmount.toLocaleString() : '0'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">税额</div>
              <div className="text-[13px] text-slate-600">¥{totalTax.toLocaleString()}</div>
            </div>
          </div>
          {currentBidding.totalPriceLimit ? (
            <div className={`flex items-center justify-between mb-3 px-2.5 py-2 rounded-lg text-[11px] ${
              totalAmount > currentBidding.totalPriceLimit
                ? 'bg-red-50 text-red-600 font-medium border border-red-200'
                : 'bg-slate-50 text-slate-500'
            }`}>
              <span className="flex items-center gap-1">
                {totalAmount > currentBidding.totalPriceLimit ? <AlertTriangle size={12} /> : <span>🏷️</span>}
                整单上限总价（含税）
              </span>
              <span>
                ¥{currentBidding.totalPriceLimit.toLocaleString()}
                {totalAmount > currentBidding.totalPriceLimit && ' · 已超上限'}
              </span>
            </div>
          ) : null}
          <button
            onClick={submitQuote}
            className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all"
          >
            提交报价
          </button>
        </div>
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
              供应商报价模拟端
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              模拟手机端供应商视角对「框架协议采购-目录内比价」工单报价，提交后 PC 后台实时联动展示
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSupplierPickerOpen(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              <MapPin size={12} className="inline mr-1" />
              切换供应商（{MOCK_SUPPLIER_USERS.length}）
            </button>
          </div>
        </div>
      </div>

      {/* 手机框容器 */}
      <div className="flex justify-center relative">
        <div className="relative">
          {renderPhoneFrame()}
          {renderDetailModal()}
          {/* 身份切换弹层（PC 端也可在详情页弹出） */}
          {supplierPickerOpen && !detailOpen && (
            <SupplierPicker
              current={currentSupplier}
              onPick={handlePickSupplier}
              onClose={() => setSupplierPickerOpen(false)}
            />
          )}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-[900px] mx-auto px-6 mt-6 text-center text-[11px] text-slate-400">
        ⚠️ 本为 COS 静态演示原型，数据保存在浏览器 localStorage。同一浏览器同源访问时前后台数据互通；更换浏览器、清除缓存数据即丢失。
      </div>
    </div>
  );
}
