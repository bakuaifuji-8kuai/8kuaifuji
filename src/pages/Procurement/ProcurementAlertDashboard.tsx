import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, FileWarning, CalendarCheck, Wallet, UserCog, Gavel, Archive,
  ChevronRight, ExternalLink
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ContractLedger, Supplier, Bidding } from '@/types';

// ==================== 类型定义 ====================
type AlertType =
  | 'contract_expire'     // 合同到期
  | 'contract_eval'       // 合同考核到期
  | 'contract_paid'       // 合同已支付占比
  | 'supplier_qual'       // 供应商资质到期
  | 'bidding_end'         // 招采截止临近
  | 'archive_overdue';    // 合同归档逾期

type AlertLevel = 'danger' | 'warning';

interface AlertItem {
  id: string;                // 唯一 id（type + sourceId 组合）
  type: AlertType;
  level: AlertLevel;
  title: string;             // 简短标题，如"合同到期"
  message: string;           // 完整预警描述
  sourceId: string;           // 源单据 ID
  sourceNo: string;           // 源单据编号
  sourceName: string;         // 源单据名称
  meta?: string;             // 附加信息（经办部门/对方单位等）
  jumpPath: string;           // 跳转路由
}

// ==================== 常量：类型元数据 ====================
const TYPE_META: Record<AlertType, { label: string; icon: any; color: string; bg: string }> = {
  contract_expire: { label: '合同到期',   icon: CalendarCheck, color: 'text-rose-600',  bg: 'bg-rose-50' },
  contract_eval:   { label: '合同考核',   icon: Gavel,         color: 'text-purple-600', bg: 'bg-purple-50' },
  contract_paid:   { label: '支付占比',   icon: Wallet,        color: 'text-amber-600', bg: 'bg-amber-50' },
  supplier_qual:   { label: '供应商资质', icon: UserCog,       color: 'text-cyan-600',  bg: 'bg-cyan-50' },
  bidding_end:     { label: '招采截止',   icon: FileWarning,   color: 'text-orange-600',bg: 'bg-orange-50' },
  archive_overdue: { label: '归档逾期',   icon: Archive,       color: 'text-slate-600', bg: 'bg-slate-50' },
};

// ==================== 辅助函数 ====================
const diffDays = (dateStr: string, today = new Date()) => {
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const evalKindLabel: Record<string, string> = {
  monthly: '月度考核', quarterly: '季度考核', yearly: '年度评价',
  project_single: '项目考核', contract_performance: '履约评价',
  single: '项目考核', warranty: '履约评价',
};

// ==================== 主组件 ====================
export default function ProcurementAlertDashboard() {
  const navigate = useNavigate();
  const contractLedgers = useStore((s) => s.contractLedgers) || [];
  const suppliers = useStore((s) => s.suppliers) || [];
  const biddings = useStore((s) => s.biddings) || [];
  const reminderSettings = useStore((s) => s.contractReminderSettings);

  // ====== 统一计算所有预警条目 ======
  const allAlerts = useMemo<AlertItem[]>(() => {
    const today = new Date();
    const result: AlertItem[] = [];

    // ---------- 1) 合同：到期预警 ----------
    contractLedgers.forEach((c: ContractLedger) => {
      if (c.status === 'terminated' || c.status === 'completed') return;
      const expire = c.terminationDate || c.endDate || c.expireDate;
      if (!expire) return;
      const d = diffDays(expire, today);
      const days = reminderSettings?.expireDays ?? 30;
      if (d >= 0 && d <= days) {
        result.push({
          id: `expire-${c.id}`,
          type: 'contract_expire',
          level: d <= 7 ? 'danger' : 'warning',
          title: '合同到期',
          message: d === 0 ? '今日到期' : `还有 ${d} 天到期`,
          sourceId: c.id,
          sourceNo: c.contractNo,
          sourceName: c.contractName,
          meta: `${c.contractNature === 'procurement' ? '招采类' : '非招采类'} · ${c.handlingDepartment || '-'} · 对方：${c.counterpartyName || '-'}`,
          jumpPath: `/procurement/contract?id=${c.id}`,
        });
      } else if (d < 0) {
        result.push({
          id: `expired-${c.id}`,
          type: 'contract_expire',
          level: 'danger',
          title: '合同已过期',
          message: `已过期 ${Math.abs(d)} 天`,
          sourceId: c.id,
          sourceNo: c.contractNo,
          sourceName: c.contractName,
          meta: `到期日 ${expire} · 状态 ${c.status}`,
          jumpPath: `/procurement/contract?id=${c.id}`,
        });
      }
    });

    // ---------- 2) 合同：已支付占比 ----------
    const paidThreshold = reminderSettings?.paidThreshold ?? 80;
    contractLedgers.forEach((c: ContractLedger) => {
      if (c.status === 'terminated' || c.status === 'completed') return;
      const total = Number(c.amount || 0);
      const paid = Number(c.paidAmount || 0);
      if (total <= 0) return;
      const ratio = (paid / total) * 100;
      if (ratio >= paidThreshold) {
        result.push({
          id: `paid-${c.id}`,
          type: 'contract_paid',
          level: ratio >= 95 ? 'danger' : 'warning',
          title: '合同付款占比偏高',
          message: `已支付 ${ratio.toFixed(1)}%`,
          sourceId: c.id,
          sourceNo: c.contractNo,
          sourceName: c.contractName,
          meta: `¥${paid.toLocaleString()} / ¥${total.toLocaleString()} · 合同金额 ${total} 万`,
          jumpPath: `/procurement/contract?id=${c.id}`,
        });
      }
    });

    // ---------- 3) 合同：考核到期（按类型独立判断） ----------
    const evalSettings = reminderSettings?.eval ?? {};
    contractLedgers.forEach((c: ContractLedger) => {
      if (!c.contractEvaluations || c.contractEvaluations.length === 0) return;
      c.contractEvaluations.forEach((ev) => {
        if (!ev.nextRemindDate) return;
        const cfg: any = (evalSettings as any)[ev.kind];
        if (!cfg || !cfg.enabled) return;
        const days = cfg.days ?? 7;
        const d = diffDays(ev.nextRemindDate, today);
        const label = evalKindLabel[ev.kind] || '考核';
        if (d >= 0 && d <= days) {
          result.push({
            id: `eval-${c.id}-${ev.kind}`,
            type: 'contract_eval',
            level: d <= 3 ? 'danger' : 'warning',
            title: `${label}到期`,
            message: d === 0 ? '今日到期' : `${d} 天后到期`,
            sourceId: c.id,
            sourceNo: c.contractNo,
            sourceName: c.contractName,
            meta: `模板：${ev.templateName || '-'} · 下次提醒：${ev.nextRemindDate}`,
            jumpPath: `/procurement/contract?id=${c.id}`,
          });
        } else if (d < 0 && d >= -30) {
          result.push({
            id: `eval-overdue-${c.id}-${ev.kind}`,
            type: 'contract_eval',
            level: 'danger',
            title: `${label}已过期`,
            message: `已过期 ${Math.abs(d)} 天`,
            sourceId: c.id,
            sourceNo: c.contractNo,
            sourceName: c.contractName,
            meta: `待执行 · 下次提醒：${ev.nextRemindDate}`,
            jumpPath: `/procurement/contract?id=${c.id}`,
          });
        }
      });
    });

    // ---------- 4) 供应商：资质到期 ----------
    suppliers.forEach((s: Supplier) => {
      if (!s.qualificationExpiryDate) return;
      const d = diffDays(s.qualificationExpiryDate, today);
      if (d >= 0 && d <= 30) {
        result.push({
          id: `qual-${s.id}`,
          type: 'supplier_qual',
          level: d <= 7 ? 'danger' : 'warning',
          title: '供应商资质到期',
          message: d === 0 ? '今日到期' : `还有 ${d} 天到期`,
          sourceId: s.id,
          sourceNo: s.code,
          sourceName: s.name,
          meta: `到期日：${s.qualificationExpiryDate}`,
          jumpPath: `/procurement/supplier?id=${s.id}`,
        });
      } else if (d < 0 && d >= -30) {
        result.push({
          id: `qual-expired-${s.id}`,
          type: 'supplier_qual',
          level: 'danger',
          title: '供应商资质已过期',
          message: `已过期 ${Math.abs(d)} 天`,
          sourceId: s.id,
          sourceNo: s.code,
          sourceName: s.name,
          meta: `到期日：${s.qualificationExpiryDate}，请尽快更新`,
          jumpPath: `/procurement/supplier?id=${s.id}`,
        });
      }
    });

    // ---------- 5) 招采：竞价截止临近（仅目录内比价 + 活跃状态） ----------
    biddings.forEach((b: Bidding) => {
      if (b.procurementMethod !== 'framework_catalog') return;
      if (b.status !== 'approved') return;  // 已审批通过的才会有真实竞价
      if (!b.endTime) return;
      const d = diffDays(b.endTime, today);
      if (d >= 0 && d <= 3) {
        result.push({
          id: `bidding-${b.id}`,
          type: 'bidding_end',
          level: d <= 1 ? 'danger' : 'warning',
          title: '招采截止临近',
          message: d === 0 ? '今日截止' : `${d} 天后截止`,
          sourceId: b.id,
          sourceNo: b.biddingNo,
          sourceName: b.projectName || b.biddingNo,
          meta: `采购方式：框架协议-目录内比价 · 截止：${b.endTime}`,
          jumpPath: `/procurement/bidding?id=${b.id}`,
        });
      }
    });

    // ---------- 6) 合同归档逾期（终止/完成后 30 天仍未归档） ----------
    contractLedgers.forEach((c: ContractLedger) => {
      if (c.archiveStatus === 'archived') return;
      if (c.status !== 'terminated' && c.status !== 'completed') return;
      const end = c.terminationDate || c.endDate || c.expireDate;
      if (!end) return;
      const d = diffDays(end, today);
      if (d < -30) {
        result.push({
          id: `archive-${c.id}`,
          type: 'archive_overdue',
          level: 'warning',
          title: '合同归档逾期',
          message: `已${c.status === 'terminated' ? '终止' : '完成'} ${Math.abs(d)} 天`,
          sourceId: c.id,
          sourceNo: c.contractNo,
          sourceName: c.contractName,
          meta: `归档状态：${c.archiveStatus || '未开始'} · 终止日 ${end}`,
          jumpPath: `/procurement/contract-archive?contractId=${c.id}`,
        });
      }
    });

    // 排序：danger 在前，按到期紧迫度
    return result.sort((a, b) => {
      if (a.level !== b.level) return a.level === 'danger' ? -1 : 1;
      return a.type.localeCompare(b.type);
    });
  }, [contractLedgers, suppliers, biddings, reminderSettings]);

  // ====== 分类统计 ======
  const stats = useMemo(() => {
    const danger = allAlerts.filter((a) => a.level === 'danger').length;
    const warning = allAlerts.filter((a) => a.level === 'warning').length;
    const byType: Record<AlertType, number> = {
      contract_expire: 0, contract_eval: 0, contract_paid: 0,
      supplier_qual: 0, bidding_end: 0, archive_overdue: 0,
    };
    allAlerts.forEach((a) => { byType[a.type]++; });
    return { danger, warning, byType };
  }, [allAlerts]);

  // ====== Tab 切换 ======
  const tabs: { key: AlertType | 'all'; label: string; icon: any; count: number }[] = [
    { key: 'all',             label: '全部',      icon: AlertTriangle, count: allAlerts.length },
    { key: 'contract_expire',  label: '合同到期',   icon: CalendarCheck, count: stats.byType.contract_expire },
    { key: 'contract_eval',    label: '合同考核',   icon: Gavel,         count: stats.byType.contract_eval },
    { key: 'contract_paid',    label: '支付占比',   icon: Wallet,        count: stats.byType.contract_paid },
    { key: 'supplier_qual',    label: '供应商资质', icon: UserCog,       count: stats.byType.supplier_qual },
    { key: 'bidding_end',      label: '招采截止',   icon: FileWarning,   count: stats.byType.bidding_end },
    { key: 'archive_overdue',  label: '归档逾期',   icon: Archive,       count: stats.byType.archive_overdue },
  ];

  // 当前选中 tab（组件级 state 用 useState，这里简化为 props 形式）
  // 直接用 URL search param 也行，但简单起见用 state
  // 👇 下面组件函数体开头用 useState 管理

  return <DashboardBody allAlerts={allAlerts} stats={stats} tabs={tabs} navigate={navigate} />;
}

// ==================== 展示组件 ====================
function DashboardBody({
  allAlerts, stats, tabs, navigate,
}: {
  allAlerts: AlertItem[];
  stats: { danger: number; warning: number; byType: Record<AlertType, number> };
  tabs: { key: AlertType | 'all'; label: string; icon: any; count: number }[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  // Tab + 严重度筛选（组件级 state）
  const [activeTab, setActiveTab] = useState<AlertType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all');

  const filtered = allAlerts.filter((a) => {
    if (activeTab !== 'all' && a.type !== activeTab) return false;
    if (levelFilter !== 'all' && a.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* ===== 页面头部 ===== */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-amber-200">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">全景预警中心</h1>
            <p className="text-sm text-slate-500 mt-1">
              实时汇聚合同、供应商资质、招采截止、合同归档等全链路到期预警 —
              <span className="ml-1 text-indigo-600 font-medium">共 {allAlerts.length} 条</span>
              {stats.danger > 0 && <span className="ml-2 text-rose-600 font-medium">· 紧急 {stats.danger}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* ===== 指标卡（6 个 + 总紧急/警告） ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 总紧急 */}
        <button
          onClick={() => { setActiveTab('all'); setLevelFilter('danger'); }}
          className="bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-xl p-4 shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <div className="text-2xl font-bold">{stats.danger}</div>
          <div className="text-xs opacity-90 mt-1">🔴 紧急</div>
        </button>
        {/* 总警告 */}
        <button
          onClick={() => { setActiveTab('all'); setLevelFilter('warning'); }}
          className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl p-4 shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <div className="text-2xl font-bold">{stats.warning}</div>
          <div className="text-xs opacity-90 mt-1">🟠 警告</div>
        </button>
        {/* 各类型 */}
        {tabs.slice(1).map((t) => {
          const meta = TYPE_META[t.key as AlertType];
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key as AlertType); setLevelFilter('all'); }}
              className={`${meta.bg} border border-slate-200 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-left`}
            >
              <div className={`text-2xl font-bold ${meta.color}`}>{t.count}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ===== Tab 筛选条 ===== */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={`ml-1 px-1.5 rounded text-xs ${active ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLevelFilter(levelFilter === 'danger' ? 'all' : 'danger')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                levelFilter === 'danger'
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
              }`}
            >🔴 仅紧急</button>
            <button
              onClick={() => setLevelFilter(levelFilter === 'warning' ? 'all' : 'warning')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                levelFilter === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
              }`}
            >🟠 仅警告</button>
          </div>
        </div>
      </div>

      {/* ===== 预警列表 ===== */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4">
            <CalendarCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="text-lg font-medium text-slate-700">✅ 当前无预警</div>
          <div className="text-sm text-slate-400 mt-1">所有合同、供应商资质、招采进度均在正常范围内</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const isDanger = item.level === 'danger';
            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all group ${
                  isDanger ? 'border-rose-200 shadow-rose-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 左侧类型图标 */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDanger ? 'bg-rose-100' : meta.bg
                  }`}>
                    <Icon className={`w-5 h-5 ${isDanger ? 'text-rose-600' : meta.color}`} />
                  </div>

                  {/* 中间主内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isDanger ? 'bg-rose-100 text-rose-600' : `${meta.bg} ${meta.color}`
                      }`}>
                        {isDanger ? '🔴 紧急' : '🟠 警告'} · {meta.label}
                      </span>
                      <span className="text-xs text-slate-400">{item.sourceNo}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {item.sourceName}
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      {item.title}：<span className={isDanger ? 'text-rose-600 font-medium' : 'text-amber-600 font-medium'}>
                        {item.message}
                      </span>
                    </div>
                    {item.meta && (
                      <div className="text-xs text-slate-400 mt-1">{item.meta}</div>
                    )}
                  </div>

                  {/* 右侧跳转按钮 */}
                  <button
                    onClick={() => navigate(item.jumpPath)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-1 group-hover:shadow"
                  >
                    查看
                    <ExternalLink className="w-3.5 h-3.5" />
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
