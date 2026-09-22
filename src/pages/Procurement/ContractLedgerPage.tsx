import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import { getAutoPaidAmount } from '@/utils/contractAggregate';
import type { ContractLedger, Bidding, ContractEvaluationBinding, EvaluationType, ProcurementFormation, NonProcurementFormation, ProcurementContractType, NonProcurementContractType, ProcurementDemand } from '@/types';
import { PROCUREMENT_FORMATION_LABELS, NON_PROCUREMENT_FORMATION_LABELS, PROCUREMENT_CONTRACT_TYPE_LABELS, NON_PROCUREMENT_CONTRACT_TYPE_LABELS, ARCHIVE_STATUS_LABELS, BUSINESS_CATEGORY_LABELS } from '@/types';
import { Printer, FileSpreadsheet, FileDown, Bell, ExternalLink } from 'lucide-react';

const categoryMap: Record<string, string> = {
  exhibition_service: '展览服务',
  exhibition_display: '展览展示',
  procurement: '采购类',
  investment: '招商类',
  other: '其他',
};

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'text-[#909399]', bg: 'bg-[#f4f4f5]' },
  pending: { label: '待审批', color: 'text-[#e6a23c]', bg: 'bg-[#fdf6ec]' },
  approved: { label: '已审批', color: 'text-[#409eff]', bg: 'bg-[#ecf5ff]' },
  active: { label: '执行中', color: 'text-[#67c23a]', bg: 'bg-[#f0f9eb]' },
  expired: { label: '已到期', color: 'text-[#909399]', bg: 'bg-[#f4f4f5]' },
  terminated: { label: '已终止', color: 'text-[#f56c6c]', bg: 'bg-[#fef0f0]' },
  invalid: { label: '已失效', color: 'text-[#f56c6c]', bg: 'bg-[#fef0f0]' },
};

/** 考核类型枚举 */
const EVAL_KIND_LABEL: Record<EvaluationType, string> = {
  project_single: '单个项目考核',
  monthly: '月度考核',
  quarterly: '季度考核',
  yearly: '年度评价',
  contract_performance: '合同履约评价',
  warranty: '质保期评估',
  single: '单个项目考核（兼容）',
};

/** 考核频率枚举 */
const EVAL_FREQ_LABEL: Record<string, string> = {
  once: '单次',
  monthly: '每月',
  quarterly: '每季度',
  yearly: '每年',
  contract_end: '合同到期时',
};

const isExpiringSoon = (date?: string) => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
};

const isExpired = (date?: string) => {
  if (!date) return false;
  return new Date(date).getTime() < new Date().getTime();
};

export default function ContractLedgerPage() {
  const navigate = useNavigate();
  const contractLedgers = useStore((s) => s.contractLedgers) || [];
  const addContractLedger = useStore((s) => s.addContractLedger);
  const updateContractLedger = useStore((s) => s.updateContractLedger);
  const deleteContractLedger = useStore((s) => s.deleteContractLedger);
  const currentUser = useStore((s) => s.currentUser);
  const biddings = (useStore((s) => s.biddings) || []) as Bidding[];
  const procurementDemands = (useStore((s) => s.procurementDemands) || []) as ProcurementDemand[];
  const evaluationTemplates = useStore((s) => s.evaluationTemplates) || [];
  // 合同提醒设置（从 store 持久化读取）
  const reminderSettings = useStore((s) => s.contractReminderSettings);
  const setReminderSettings = useStore((s) => s.setContractReminderSettings);
  const contractArchives = useStore((s) => s.contractArchives) || [];

  // 归档状态反查表：contractNo → 归档信息
  const archiveByContractNo = useMemo(() => {
    const map = new Map<string, { status: string; archiveNo?: string; approveTime?: string }>();
    for (const arc of contractArchives) {
      for (const no of arc.contractNos) {
        // 已归档优先覆盖，pending 其次，rejected/draft 最后
        const existing = map.get(no);
        if (!existing || existing.status === 'draft' || existing.status === 'rejected') {
          map.set(no, { status: arc.status, archiveNo: arc.archiveNo, approveTime: arc.approveTime });
        } else if (existing.status === 'pending' && arc.status === 'approved') {
          map.set(no, { status: arc.status, archiveNo: arc.archiveNo, approveTime: arc.approveTime });
        }
      }
    }
    return map;
  }, [contractArchives]);

  // 从 store 动态派生模板选项（内置 + 用户自定义克隆）
  const templateOptions = useMemo(() =>
    evaluationTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      kind: t.type,
    })), [evaluationTemplates]);

  // 筛选条件
  const [filterNo, setFilterNo] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterNature, setFilterNature] = useState('');
  const [filterFormation, setFilterFormation] = useState('');
  const [filterArchiveStatus, setFilterArchiveStatus] = useState('');
  const [filterIsModelText, setFilterIsModelText] = useState('');
  const [filterCounterparty, setFilterCounterparty] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterWinningDateFrom, setFilterWinningDateFrom] = useState('');
  const [filterWinningDateTo, setFilterWinningDateTo] = useState('');

  const [applied, setApplied] = useState({
    no: '', name: '', status: '', nature: '', formation: '',
    archiveStatus: '', isModelText: '',
    counterparty: '', department: '',
    dateFrom: '', dateTo: '',
    winningDateFrom: '', winningDateTo: '',
  });

  // 弹窗状态
  const [editItem, setEditItem] = useState<ContractLedger | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewItem, setViewItem] = useState<ContractLedger | null>(null);
  const [terminateItem, setTerminateItem] = useState<ContractLedger | null>(null);
  const [suspendItem, setSuspendItem] = useState<ContractLedger | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [terminateReason, setTerminateReason] = useState('');
  // 采购工单选择弹窗
  const [biddingPickerOpen, setBiddingPickerOpen] = useState(false);
  const [selectedBidding, setSelectedBidding] = useState<Bidding | null>(null);

  // 考核绑定管理弹窗
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalTarget, setEvalTarget] = useState<ContractLedger | null>(null);
  const [evalEditItem, setEvalEditItem] = useState<ContractEvaluationBinding | null>(null);
  const [isNewEval, setIsNewEval] = useState(false);

  // 预警详情弹框（点击顶部紧凑条弹出）
  const [reminderDetailOpen, setReminderDetailOpen] = useState(false);

  // 合同提醒设置弹窗（临时草稿，保存时才写 store）
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false);
  const [draftPaidThreshold, setDraftPaidThreshold] = useState(80);
  const [draftExpireDays, setDraftExpireDays] = useState(30);
  const [draftEval, setDraftEval] = useState<Record<string, { enabled: boolean; days: number }>>({});

  // 弹窗打开时：store → 草稿（避免直接改 store）
  useEffect(() => {
    if (reminderSettingsOpen && reminderSettings) {
      setDraftPaidThreshold(reminderSettings.paidThreshold);
      setDraftExpireDays(reminderSettings.expireDays);
      setDraftEval({ ...reminderSettings.eval });
    }
  }, [reminderSettingsOpen, reminderSettings]);

  const filteredData = useMemo(() => {
    return contractLedgers.filter((c) => {
      if (applied.no && !c.contractNo.includes(applied.no)) return false;
      if (applied.name && !c.contractName.includes(applied.name)) return false;
      if (applied.status && c.status !== applied.status) return false;
      if (applied.nature && c.contractNature !== applied.nature) return false;
      if (applied.formation && c.formation !== applied.formation) return false;
      if (applied.archiveStatus) {
        // 从归档板块反查归档状态
        const arc = archiveByContractNo.get(c.contractNo);
        const actual = arc?.status;
        let match = false;
        if (applied.archiveStatus === 'not_started') match = !actual || actual === 'rejected' || actual === 'draft';
        else if (applied.archiveStatus === 'in_progress') match = actual === 'pending';
        else if (applied.archiveStatus === 'archived') match = actual === 'approved';
        if (!match) return false;
      }
      if (applied.isModelText !== '' && applied.isModelText !== undefined) {
        const wantTrue = applied.isModelText === 'true';
        if (!!c.isModelText !== wantTrue) return false;
      }
      if (applied.counterparty && !c.counterpartyName?.includes(applied.counterparty)) return false;
      if (applied.department && !c.handlingDepartment?.includes(applied.department) && !c.demandDepartment?.includes(applied.department)) return false;
      if (applied.dateFrom && (!c.signingDate || c.signingDate < applied.dateFrom)) return false;
      if (applied.dateTo && (!c.signingDate || c.signingDate > applied.dateTo)) return false;
      if (applied.winningDateFrom && (!c.winningDate || c.winningDate < applied.winningDateFrom)) return false;
      if (applied.winningDateTo && (!c.winningDate || c.winningDate > applied.winningDateTo)) return false;
      return true;
    });
  }, [contractLedgers, applied]);

  // 统计数据：按分类/类型/部门/供应商/年度的金额数量统计
  const stats = useMemo(() => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((s, c) => s + (c.amount || 0), 0);
    const totalPaid = filteredData.reduce((s, c) => s + (c.paidAmount || 0), 0);
    const activeCount = filteredData.filter((c) => c.status === 'active').length;
    const pendingCount = filteredData.filter((c) => c.status === 'pending').length;
    const expiringCount = filteredData.filter((c) =>
      c.status === 'active' && isExpiringSoon(c.terminationDate)
    ).length;
    const expiredCount = filteredData.filter((c) =>
      c.status === 'active' && isExpired(c.terminationDate)
    ).length;

    // 按分类统计
    const byCategory: Record<string, { count: number; amount: number }> = {};
    filteredData.forEach((c) => {
      const key = categoryMap[c.category] || c.category;
      if (!byCategory[key]) byCategory[key] = { count: 0, amount: 0 };
      byCategory[key].count++;
      byCategory[key].amount += c.amount || 0;
    });

    // 按合同类型统计
    const byContractType: Record<string, { count: number; amount: number }> = {};
    filteredData.forEach((c) => {
      const key = c.contractType === 'engineering' ? '工程类' : '非工程类';
      if (!byContractType[key]) byContractType[key] = { count: 0, amount: 0 };
      byContractType[key].count++;
      byContractType[key].amount += c.amount || 0;
    });

    // 按经办部门统计
    const byDepartment: Record<string, { count: number; amount: number }> = {};
    filteredData.forEach((c) => {
      const key = c.handlingDepartment || c.demandDepartment || '未指定';
      if (!byDepartment[key]) byDepartment[key] = { count: 0, amount: 0 };
      byDepartment[key].count++;
      byDepartment[key].amount += c.amount || 0;
    });

    // 按供应商统计（TOP 10）
    const byCounterparty: Record<string, { count: number; amount: number }> = {};
    filteredData.forEach((c) => {
      const key = c.counterpartyName || '未指定';
      if (!byCounterparty[key]) byCounterparty[key] = { count: 0, amount: 0 };
      byCounterparty[key].count++;
      byCounterparty[key].amount += c.amount || 0;
    });
    const topCounterparties = Object.entries(byCounterparty)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 10);

    // 按年度统计（按签订日期）
    const byYear: Record<string, { count: number; amount: number }> = {};
    filteredData.forEach((c) => {
      const key = c.signingDate?.slice(0, 4) || '未知';
      if (!byYear[key]) byYear[key] = { count: 0, amount: 0 };
      byYear[key].count++;
      byYear[key].amount += c.amount || 0;
    });

    // 按状态统计
    const byStatus: Record<string, { count: number; amount: number }> = {};
    filteredData.forEach((c) => {
      const key = statusMap[c.status]?.label || c.status;
      if (!byStatus[key]) byStatus[key] = { count: 0, amount: 0 };
      byStatus[key].count++;
      byStatus[key].amount += c.amount || 0;
    });

    return { total, totalAmount, totalPaid, activeCount, pendingCount, expiringCount, expiredCount, byCategory, byContractType, byDepartment, byCounterparty: topCounterparties, byYear, byStatus };
  }, [filteredData]);

  // 派生选项
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    contractLedgers.forEach((c) => {
      if (c.signingDate) years.add(c.signingDate.slice(0, 4));
    });
    return Array.from(years).sort().reverse();
  }, [contractLedgers]);

  const departmentOptions = useMemo(() => {
    const deps = new Set<string>();
    contractLedgers.forEach((c) => {
      if (c.handlingDepartment) deps.add(c.handlingDepartment);
      if (c.demandDepartment) deps.add(c.demandDepartment);
    });
    return Array.from(deps).sort();
  }, [contractLedgers]);

  // ========== 提醒规则：已支付金额占比 + 到期日提前提醒 ==========
  // 提醒合同列表
  const reminderContracts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: Array<{ contract: ContractLedger; type: 'paid' | 'expire' | 'eval'; message: string; level: 'warning' | 'danger' }> = [];
    filteredData.forEach((c) => {
      if (c.status === 'terminated' || c.status === 'completed') return;
      // 1) 已支付金额占比提醒
      const total = Number((c as any).contractAmount || (c as any).totalAmount || c.amount || 0);
      const paid = Number((c as any).paidAmount || c.paidAmount || 0);
      if (total > 0) {
        const ratio = (paid / total) * 100;
        if (ratio >= (reminderSettings?.paidThreshold ?? 80)) {
          result.push({
            contract: c,
            type: 'paid',
            message: `已支付 ${ratio.toFixed(1)}%（¥${paid.toLocaleString()} / ¥${total.toLocaleString()}）`,
            level: ratio >= 95 ? 'danger' : 'warning',
          });
        }
      }
      // 2) 到期日提前提醒
      const expire = c.endDate || c.expireDate || c.terminationDate;
      if (expire) {
        const expireDate = new Date(expire);
        const diffDays = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= (reminderSettings?.expireDays ?? 30)) {
          result.push({
            contract: c,
            type: 'expire',
            message: diffDays === 0 ? '今日到期' : `还有 ${diffDays} 天到期（${expire}）`,
            level: diffDays <= 7 ? 'danger' : 'warning',
          });
        } else if (diffDays < 0) {
          result.push({
            contract: c,
            type: 'expire',
            message: `已过期 ${Math.abs(diffDays)} 天（${expire}）`,
            level: 'danger',
          });
        }
      }
      // 3) 合同考核到期提醒 —— 按考核类型独立判断（从 store.eval 读各自的 enabled + days）
      if (c.contractEvaluations && c.contractEvaluations.length > 0) {
        c.contractEvaluations.forEach((ev) => {
          if (!ev.nextRemindDate) return;
          const kindKey = (reminderSettings?.eval as any)?.[ev.kind];
          if (!kindKey || !kindKey.enabled) return;
          const days = kindKey.days ?? 7;
          const remindDate = new Date(ev.nextRemindDate);
          const diffDays = Math.ceil((remindDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const labelMap: Record<string, string> = { monthly: '月度考核', quarterly: '季度考核', yearly: '年度评价', contract_performance: '履约评价', project_single: '项目考核', single: '项目考核', warranty: '履约评价' };
          const label = labelMap[ev.kind] || '考核';
          if (diffDays >= 0 && diffDays <= days) {
            result.push({
              contract: c,
              type: 'eval',
              message: `${label}${diffDays === 0 ? '今日到期' : diffDays + ' 天后到期'}（${ev.templateName || ev.kind}）`,
              level: diffDays <= 3 ? 'danger' : 'warning',
            });
          } else if (diffDays < 0 && diffDays >= -30) {
            result.push({
              contract: c,
              type: 'eval',
              message: `${label}已过期 ${Math.abs(diffDays)} 天，待执行`,
              level: 'danger',
            });
          }
        });
      }
    });
    return result;
  }, [filteredData, reminderSettings]);

  // ========== 导出 Excel (CSV) ==========
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert('当前无数据可导出');
      return;
    }
    const headers = ['合同编码', '合同名称', '分类', '类型', '签订主体', '经办部门', '需求部门', '经办人', '对方单位', '项目名称', '合同金额(万元)', '已支付(万元)', '结算金额(万元)', '签订日期', '生效日期', '终止日期', '状态', '履行情况', '备注'];
    const rows = filteredData.map((c) => [
      c.contractNo,
      c.contractName,
      categoryMap[c.category] || c.category,
      c.contractType === 'engineering' ? '工程类' : '非工程类',
      (c as any).signingEntity || '-',
      c.handlingDepartment || '-',
      c.demandDepartment || '-',
      c.handler || '-',
      c.counterpartyName || '-',
      (c as any).projectName || '-',
      c.amount?.toFixed(2) || '0.00',
      c.paidAmount?.toFixed(2) || '0.00',
      c.settlementAmount?.toFixed(2) || '0.00',
      c.signingDate || '-',
      c.effectiveDate || '-',
      c.terminationDate || '-',
      statusMap[c.status]?.label || c.status,
      c.performanceStatus || '-',
      c.remark || '',
    ]);
    // 汇总行
    const totalAmount = filteredData.reduce((s, c) => s + (c.amount || 0), 0);
    const totalPaid = filteredData.reduce((s, c) => s + (c.paidAmount || 0), 0);
    const totalSettlement = filteredData.reduce((s, c) => s + (c.settlementAmount || 0), 0);
    const summaryRow = [
      `合计(${filteredData.length}份)`, '', '', '', '', '', '', '', '', '',
      totalAmount.toFixed(2), totalPaid.toFixed(2), totalSettlement.toFixed(2),
      '', '', '', '', '', '',
    ];
    const csv = '\uFEFF' + [headers, ...rows, summaryRow].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `合同台账_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ========== 导出 PDF (通过打印实现) ==========
  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      alert('当前无数据可导出');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许弹出窗口以导出 PDF');
      return;
    }
    // 计算汇总
    const totalAmount = filteredData.reduce((s, c) => s + (c.amount || 0), 0);
    const totalPaid = filteredData.reduce((s, c) => s + (c.paidAmount || 0), 0);
    const totalSettlement = filteredData.reduce((s, c) => s + (c.settlementAmount || 0), 0);

    const rowsHtml = filteredData.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c.contractNo}</td>
        <td>${c.contractName}</td>
        <td>${categoryMap[c.category] || c.category}</td>
        <td>${c.contractType === 'engineering' ? '工程类' : '非工程类'}</td>
        <td>${c.counterpartyName || '-'}</td>
        <td>${c.handlingDepartment || '-'}</td>
        <td>${c.amount?.toFixed(2) || '0.00'}</td>
        <td>${c.paidAmount?.toFixed(2) || '0.00'}</td>
        <td>${c.settlementAmount?.toFixed(2) || '0.00'}</td>
        <td>${c.signingDate || '-'}</td>
        <td>${statusMap[c.status]?.label || c.status}</td>
      </tr>
    `).join('');

    const summaryHtml = `
      <tfoot>
        <tr style="background: #f0f2f5; font-weight: bold;">
          <td colspan="7" style="text-align: center;">合计（${filteredData.length}份合同）</td>
          <td style="text-align: right;">${totalAmount.toFixed(2)}</td>
          <td style="text-align: right;">${totalPaid.toFixed(2)}</td>
          <td style="text-align: right;">${totalSettlement.toFixed(2)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>合同台账报表</title>
        <style>
          body { font-family: 'Microsoft YaHei', sans-serif; padding: 20px; font-size: 12px; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
          th { background: #f5f7fa; font-weight: 600; }
          tfoot td { background: #f0f2f5; font-weight: bold; }
          .summary { margin-bottom: 20px; padding: 12px; background: #f5f7fa; border-radius: 4px; }
          .summary-item { display: inline-block; margin-right: 24px; }
          .summary-item strong { color: #409eff; font-size: 16px; }
        </style>
      </head>
      <body>
        <h2>合同台账报表</h2>
        <div class="summary">
          <div class="summary-item">合同总数：<strong>${filteredData.length}</strong> 份</div>
          <div class="summary-item">合同总金额：<strong>${totalAmount.toFixed(2)}</strong> 万元</div>
          <div class="summary-item">已支付金额：<strong>${totalPaid.toFixed(2)}</strong> 万元</div>
          <div class="summary-item">结算金额：<strong>${totalSettlement.toFixed(2)}</strong> 万元</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>序号</th><th>合同编码</th><th>合同名称</th><th>分类</th><th>类型</th>
              <th>对方单位</th><th>经办部门</th><th>金额(万元)</th><th>已支付(万元)</th>
              <th>结算金额(万元)</th><th>签订日期</th><th>状态</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          ${summaryHtml}
        </table>
        <div style="margin-top: 30px; text-align: right; font-size: 12px; color: #909399;">
          导出日期：${new Date().toLocaleString('zh-CN')}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // ========== 打印台账 ==========
  const handlePrint = () => {
    handleExportPDF();
  };

  // ========== 新增/编辑合同 ==========
  const openAdd = () => {
    const now = new Date();
    const newLedger: ContractLedger = {
      id: 'CL' + Date.now(),
      contractId: 'CT' + Date.now(),
      contractNo: '',   // 保存时才生成编号
      contractNature: 'procurement',
      contractName: '',
      category: 'procurement',
      contractType: 'non_engineering',
      formation: 'state_owned_xunbi',
      isModelText: true,
      archiveStatus: 'not_started',
      handlerContact: '',
      status: 'draft',
    };
    setIsNew(true);
    setSelectedBidding(null);
    setEditItem(newLedger);
  };

  // 选择采购工单
  const handleSelectBidding = (bidding: Bidding) => {
    setSelectedBidding(bidding);
    // 从工单带入项目信息
    setEditItem({
      ...editItem!,
      biddingId: bidding.id,
      biddingNo: bidding.biddingNo,
      projectName: bidding.projectName || bidding.biddingName,
      // 如果工单有确认供应商，自动带入对方单位
      counterpartyName: bidding.quotes?.find(q => q.confirmedSupplierId)?.confirmedSupplierName || bidding.winningSupplierName || editItem?.counterpartyName,
    });
    setBiddingPickerOpen(false);
  };

  // 清除工单关联
  const handleClearBidding = () => {
    setSelectedBidding(null);
    setEditItem({
      ...editItem!,
      biddingId: undefined,
      biddingNo: undefined,
      projectName: undefined,
    });
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.contractNo) {
      alert('请填写合同编码');
      return;
    }
    if (!editItem.contractName) {
      alert('请填写合同名称');
      return;
    }
    if (isNew) {
      addContractLedger(editItem);
    } else {
      updateContractLedger(editItem.id, editItem);
    }
    setEditItem(null);
  };

  // ========== 中止合同 ==========
  const handleSuspend = () => {
    if (!suspendItem) return;
    updateContractLedger(suspendItem.id, {
      ...suspendItem,
      status: 'pending' as any, // 临时标记为待审批，模拟中止审批流程
      remark: (suspendItem.remark || '') + `\n[中止申请] ${new Date().toLocaleString('zh-CN')}: ${suspendReason || '无说明'}`,
    });
    setSuspendItem(null);
    setSuspendReason('');
    alert('合同中止申请已提交，等待审批');
  };

  // ========== 终止合同 ==========
  const handleTerminate = () => {
    if (!terminateItem) return;
    updateContractLedger(terminateItem.id, {
      ...terminateItem,
      status: 'terminated',
      remark: (terminateItem.remark || '') + `\n[终止] ${new Date().toLocaleString('zh-CN')}: ${terminateReason || '无说明'}`,
    });
    setTerminateItem(null);
    setTerminateReason('');
    alert('合同已终止');
  };

  // ========== 确认有效（从已失效恢复） ==========
  const handleActivate = (row: ContractLedger) => {
    if (!confirm(`确认将合同 ${row.contractNo} 状态更改为"执行中"？`)) return;
    updateContractLedger(row.id, { ...row, status: 'active' });
  };

  // ========== 考核绑定管理 ==========
  const openEvalModal = (row: ContractLedger) => {
    setEvalTarget(row);
    setEvalEditItem(null);
    setIsNewEval(false);
    setEvalModalOpen(true);
  };

  const openNewEvalBinding = () => {
    if (!evalTarget) return;
    const defaultKind: EvaluationType = 'monthly';
    const defaultTemplate = templateOptions.find((t) => t.kind === defaultKind);
    const newItem: ContractEvaluationBinding = {
      id: `EVAL_BIND_${Date.now()}`,
      kind: defaultKind,
      templateId: defaultTemplate?.id || '',
      templateName: defaultTemplate?.name || '',
      frequency: 'monthly',
      nextRemindDate: evalTarget.effectiveDate || new Date().toISOString().slice(0, 10),
      createTime: new Date().toISOString(),
    };
    setEvalEditItem(newItem);
    setIsNewEval(true);
  };

  const saveEvalBinding = () => {
    if (!evalTarget || !evalEditItem) return;
    if (!evalEditItem.kind) { alert('请选择考核类型'); return; }
    if (!evalEditItem.templateId) { alert('请选择考核模板'); return; }

    const bindings = [...(evalTarget.contractEvaluations || [])];
    if (isNewEval) {
      bindings.push(evalEditItem);
    } else {
      const idx = bindings.findIndex((b) => b.id === evalEditItem.id);
      if (idx >= 0) bindings[idx] = evalEditItem;
      else bindings.push(evalEditItem);
    }
    updateContractLedger(evalTarget.id, { contractEvaluations: bindings });
    setEvalEditItem(null);
    setIsNewEval(false);
    setEvalTarget({ ...evalTarget, contractEvaluations: bindings });
  };

  const deleteEvalBinding = (bindId: string) => {
    if (!evalTarget) return;
    if (!confirm('确认删除此考核绑定？')) return;
    const bindings = (evalTarget.contractEvaluations || []).filter((b) => b.id !== bindId);
    updateContractLedger(evalTarget.id, { contractEvaluations: bindings });
    setEvalTarget({ ...evalTarget, contractEvaluations: bindings });
    setEvalEditItem(null);
    setIsNewEval(false);
  };

  // ========== 动态 label 映射辅助函数 ==========
  const getFormationLabel = (row: ContractLedger) => {
    return row.contractNature === 'procurement'
      ? PROCUREMENT_FORMATION_LABELS[row.formation as ProcurementFormation] || row.formation
      : NON_PROCUREMENT_FORMATION_LABELS[row.formation as NonProcurementFormation] || row.formation;
  };

  const getContractTypeLabel = (row: ContractLedger) => {
    if (row.contractNature === 'procurement') {
      return PROCUREMENT_CONTRACT_TYPE_LABELS[row.contractType as ProcurementContractType] || row.contractType;
    }
    return NON_PROCUREMENT_CONTRACT_TYPE_LABELS[row.contractType as NonProcurementContractType] || row.contractType;
  };

  const getRequisitionRatio = (row: ContractLedger) => {
    if (!row.requisitionAmount || row.requisitionAmount <= 0 || !row.amount) return null;
    // requisitionAmount 是元，amount 是万元，amount*10000 转为元后对比
    return ((row.amount * 10000) / row.requisitionAmount * 100).toFixed(1);
  };

  // ========== 表格列定义 ==========
  // ====================================================================
  // 合同台账列定义（26 列，严格对齐 916 文档 L50-52 字段顺序）
  // ====================================================================
  // 列与 916 文档映射：
  //   0   合同性质          → 本项目自增区分列（招采类/非招采类），916L50 无但业务必需
  //   1   合同名称          → 916L50
  //   2   合同编号          → 916L50 —— ⚠️ 手工输入，不自动生成
  //   3   合同类型          → 916L50
  //   4   合同形成方式      → 916L50
  //   5   中标时间          → 916L50
  //   6   示范文本          → 916L50
  //   7   经办部门          → 916L50 我方-经办部门
  //   8   经办人            → 916L50 我方-经办人
  //   9   联系方式          → 916L50 我方-联系方式
  //   10  对方单位          → 916L50 对方-单位名称
  //   11  对方负责人        → 916L50 对方-负责人
  //   12  合同主要内容      → 916L50 —— 原项目缺失，2026-09-17 补齐
  //   13  签订日期          → 916L50
  //   14  生效日期          → 916L50 合同约定生效日期
  //   15  终止日期          → 916L50 合同约定终止日期
  //   16  合同金额          → 916L50
  //   17  采购申请金额      → 916L50
  //   18  采购申请占比      → 916L50
  //   19  已支付金额        → 916L50
  //   20  结算金额          → 916L50
  //   21  资金流向分类      → 916L50
  //   22  合同履行情况      → 916L50
  //   23  合同履约评估情况  → 916L50 —— 原项目缺失，2026-09-17 补齐（紫色标签显示绑定的考核类型）
  //   24  合同状态          → 916L50
  //   25  备注              → 916L50
  //   +   操作列            → 本项目自增（查看/编辑/归档/终止）
  //
  // 需求背景：用户提醒合同台账也要跟 916 文档对齐 → 补齐 2 个缺失列 + 重排列序
  // ====================================================================
  const columns: ColumnDef<ContractLedger>[] = [
    // 0. 合同性质（业务区分用，916L50无但实际必需）
    {
      key: 'contractNature',
      title: '合同性质',
      width: '72',
      render: (row) => (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
          row.contractNature === 'procurement'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {row.contractNature === 'procurement' ? '招采类' : '非招采类'}
        </span>
      ),
      footer: '',
    },
    // 1. 合同名称
    { key: 'contractName', title: '合同名称', render: (row) => row.contractName, footer: '' },
    // 2. 合同编号
    { key: 'contractNo', title: '合同编号', render: (row) => row.contractNo,
      footer: (data) => `合计 ${data.length} 份` },
    // 3. 合同类型
    { key: 'contractType', title: '合同类型', render: (row) => getContractTypeLabel(row), footer: '' },
    // 4. 合同形成方式
    { key: 'formation', title: '合同形成方式', render: (row) => getFormationLabel(row), footer: '' },
    // 5. 中标时间
    { key: 'winningDate', title: '中标时间', render: (row) => {
      if (row.contractNature !== 'procurement') return <span className="text-[#c0c4cc]">-</span>;
      return row.winningDate || '-';
    }, footer: '' },
    // 6. 示范文本（是/否）
    { key: 'isModelText', title: '示范文本', render: (row) => (
      row.isModelText
        ? <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">是</span>
        : <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200">否</span>
    ), footer: '' },
    // 7-11. 合同当事人（我方3列 + 对方2列）
    { key: 'handlingDepartment', title: '经办部门', render: (row) => row.handlingDepartment || '-', footer: '' },
    { key: 'handler', title: '经办人', render: (row) => row.handler || '-', footer: '' },
    { key: 'handlerContact', title: '联系方式', render: (row) => row.handlerContact || '-', footer: '' },
    { key: 'counterpartyName', title: '对方单位', render: (row) => row.counterpartyName || '-', footer: '' },
    { key: 'counterpartyContact', title: '对方负责人', render: (row) => row.counterpartyContact || '-', footer: '' },
    // 12. 合同主要内容（916L50字段，原缺失）
    { key: 'mainContent', title: '合同主要内容', width: '200', render: (row) => {
      const text = row.mainContent || '-';
      return <span title={text} className="block max-w-[200px] truncate">{text}</span>;
    }, footer: '' },
    // 13. 签订日期
    { key: 'signingDate', title: '签订日期', render: (row) => row.signingDate || '-', footer: '' },
    // 14. 合同约定生效日期
    { key: 'effectiveDate', title: '生效日期', render: (row) => row.effectiveDate || '-', footer: '' },
    // 15. 合同约定终止日期
    {
      key: 'terminationDate',
      title: '终止日期',
      footer: '',
      render: (row) => {
        if (!row.terminationDate) return '-';
        const classes = [];
        if (row.status === 'active' && isExpiringSoon(row.terminationDate)) classes.push('text-[#e6a23c]', 'font-medium');
        if (row.status === 'active' && isExpired(row.terminationDate)) classes.push('text-[#f56c6c]', 'font-medium');
        return (
          <span className={classes.join(' ')}>
            {row.terminationDate}
            {row.status === 'active' && isExpiringSoon(row.terminationDate) && !isExpired(row.terminationDate) && ' ⚠即将到期'}
            {row.status === 'active' && isExpired(row.terminationDate) && ' ⚠已过期'}
          </span>
        );
      },
    },
    // 16. 合同金额（万元）
    {
      key: 'amount', title: '合同金额(万)', align: 'right',
      render: (row) => row.amount?.toLocaleString() || '-',
      footer: (data) => {
        const sum = data.reduce((s, c) => s + (c.amount || 0), 0);
        return sum > 0 ? sum.toLocaleString() : '-';
      },
    },
    // 17. 采购申请合计金额（万元）
    { key: 'requisitionAmount', title: '采购申请金额(万)', align: 'right', render: (row) => {
      if (!row.requisitionAmount) return '-';
      return (row.requisitionAmount / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }, footer: '' },
    // 18. 采购申请占合同金额比例（%）
    { key: 'requisitionRatio', title: '采购申请占比(%)', align: 'right', render: (row) => {
      const ratio = getRequisitionRatio(row);
      return ratio !== null ? `${ratio}%` : '-';
    }, footer: '' },
    // 19. 已支付金额（万元）— ⚠️ 展示值 = paidAmountBase + Σ(linkedDemandIds 需求金额)
    //    聚合函数 getAutoPaidAmount 在 utils/contractAggregate.ts
    {
      key: 'paidAmount', title: '已支付金额(万)', align: 'right',
      render: (row) => getAutoPaidAmount(row as ContractLedger, procurementDemands, biddings).toLocaleString(),
      footer: (data) => {
        const sum = data.reduce((s, c) => s + getAutoPaidAmount(c as ContractLedger, procurementDemands, biddings), 0);
        return sum > 0 ? sum.toLocaleString() : '-';
      },
    },
    // 20. 合同结算金额（万元）
    {
      key: 'settlementAmount', title: '结算金额(万)', align: 'right',
      render: (row) => row.settlementAmount?.toLocaleString() || '-',
      footer: (data) => {
        const sum = data.reduce((s, c) => s + (c.settlementAmount || 0), 0);
        return sum > 0 ? sum.toLocaleString() : '-';
      },
    },
    // 21. 资金流向分类
    { key: 'businessCategory', title: '资金流向分类', render: (row) => {
      if (!row.businessCategory) return '-';
      return BUSINESS_CATEGORY_LABELS[row.businessCategory] || row.businessCategory;
    }, footer: '' },
    // 22. 合同履行情况
    { key: 'performanceStatus', title: '合同履行情况', render: (row) => row.performanceStatus || '-', footer: '' },
    // 23. 合同履约评估情况（916L50字段，原缺失）
    { key: 'evalStatus', title: '合同履约评估情况', width: '180', render: (row) => {
      const evals = row.contractEvaluations || [];
      if (evals.length === 0) return <span className="text-[#c0c4cc]">未设置</span>;
      const kinds = [...new Set(evals.map(e => e.kind))];
      const kindLabel = { single_project: '单个项目', monthly: '月度', quarterly: '季度', yearly: '年度' };
      return (
        <div className="flex flex-wrap gap-1">
          {kinds.map(k => (
            <span key={k} className="px-1.5 py-0.5 rounded text-[11px] bg-purple-50 text-purple-700 border border-purple-200">
              {kindLabel[k] || k}
            </span>
          ))}
        </div>
      );
    }, footer: '' },
    // 23-2. 合同是否归档（从归档板块反查）
    {
      key: 'contractArchiveStatus', title: '合同是否归档', footer: '',
      render: (row) => {
        const arc = archiveByContractNo.get(row.contractNo);
        if (!arc) return <span className="text-[#c0c4cc]">未归档</span>;
        if (arc.status === 'approved') {
          return (
            <span
              className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200"
              title={`归档编号：${arc.archiveNo}｜归档时间：${arc.approveTime || '-'}`}
            >✅ 已归档</span>
          );
        }
        if (arc.status === 'pending') {
          return (
            <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">🟡 归档中</span>
          );
        }
        if (arc.status === 'rejected') {
          return (
            <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200">❌ 曾被驳回</span>
          );
        }
        return <span className="text-[#c0c4cc]">未归档</span>;
      },
    },
    // 24. 合同状态
    {
      key: 'status', title: '合同状态', footer: '',
      render: (row) => {
        let displayStatus = statusMap[row.status] || statusMap.draft;
        let extraLabel = '';
        if (row.status === 'active' && isExpired(row.terminationDate)) extraLabel = ' (已过期)';
        return (
          <span className={`px-2 py-0.5 rounded text-xs ${displayStatus.color} ${displayStatus.bg}`}>
            {displayStatus.label}{extraLabel}
          </span>
        );
      },
    },
    // 25. 备注
    { key: 'remark', title: '备注', render: (row) => row.remark || '-', footer: '' },
    // 操作列（916L50无，UI保留）
    {
      key: 'op', title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看详情</TextButton>
          {row.status === 'pending' && (
            <TextButton
              type="success"
              onClick={() => {
                if (!confirm(`确认审批通过合同 ${row.contractNo}？\n\n审批通过后合同将进入执行状态，并根据表单门控字段自动关联考核绑定。`)) return;
                updateContractLedger(row.id, { status: 'active' });
                alert('审批通过 ✅ 合同已进入执行状态，考核绑定已自动关联');
              }}
            >审批通过</TextButton>
          )}
          <TextButton onClick={() => openEvalModal(row)}>考核绑定</TextButton>
          {(row.status === 'active' || row.status === 'approved') && (
            <TextButton type="danger" onClick={() => { setTerminateItem(row); setTerminateReason(''); }}>终止</TextButton>
          )}
          {(row.status === 'terminated' || row.status === 'expired' || row.status === 'invalid') && (
            <TextButton onClick={() => handleActivate(row)}>恢复执行</TextButton>
          )}
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除合同 ${row.contractNo}？\n\n建议：建议将合同状态设为"已终止"而非删除，以保留历史数据。`)) {
                deleteContractLedger(row.id);
              }
            }}
          >删除</TextButton>
        </div>
      ),
      footer: '',
    },
  ];

  return (
    <div className="p-4">
      {/* 页面标题与操作区 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#303133]">合同台账管理</h2>
          <span className="text-xs text-[#909399]">共 {contractLedgers.length} 份合同</span>
          {stats.expiringCount > 0 && (
            <span className="text-xs text-[#e6a23c] px-2 py-0.5 bg-[#fdf6ec] rounded">
              ⚠ {stats.expiringCount} 份合同 30 天内到期
            </span>
          )}
          {stats.expiredCount > 0 && (
            <span className="text-xs text-[#f56c6c] px-2 py-0.5 bg-[#fef0f0] rounded">
              ⚠ {stats.expiredCount} 份合同已过期（未终止状态）
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DefaultButton onClick={() => setReminderSettingsOpen(true)}>
            <Bell size={14} /> 提醒设置
          </DefaultButton>
          <DefaultButton onClick={handlePrint}>
            <Printer size={14} /> 打印
          </DefaultButton>
          <DefaultButton onClick={handleExportExcel}>
            <FileSpreadsheet size={14} /> 导出 Excel
          </DefaultButton>
          <DefaultButton onClick={handleExportPDF}>
            <FileDown size={14} /> 导出 PDF
          </DefaultButton>
        </div>
      </div>

      {/* 紧凑预警条 + 统计入口（点击弹出 Modal） */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        {/* 预警提醒条 */}
        {reminderContracts.length > 0 ? (
          <button
            onClick={() => setReminderDetailOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-xs cursor-pointer"
          >
            <span className="text-amber-500">🔔</span>
            <span className="text-amber-700 font-medium">
              {reminderContracts.length} 条预警
            </span>
            {reminderContracts.some((r) => r.level === 'danger') && (
              <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[10px]">
                紧急 {reminderContracts.filter((r) => r.level === 'danger').length}
              </span>
            )}
          </button>
        ) : (
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            ✅ 无预警
          </span>
        )}

        {/* 统计汇总条 */}
        <button
          onClick={() => setReminderDetailOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-xs cursor-pointer"
        >
          <span>📊</span>
          <span className="text-slate-700">
            {stats.total} 份合同 · 总 {stats.totalAmount.toFixed(0)} 万 · {stats.activeCount} 执行中 · {stats.expiringCount} 即将到期
          </span>
        </button>

        {/* 提醒设置（已有，保留原按钮） */}
        <DefaultButton onClick={() => setReminderSettingsOpen(true)}>
          <Bell size={14} /> 提醒设置
        </DefaultButton>
      </div>

      {/* 预警详情 Modal —— 包含预警列表 + 统计汇总 */}
      {reminderDetailOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="font-bold text-slate-800">合同预警 & 统计汇总</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    预警 {reminderContracts.length} 条 · 紧急 {reminderContracts.filter((r) => r.level === 'danger').length} 条
                  </p>
                </div>
              </div>
              <button onClick={() => setReminderDetailOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none px-2">×</button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Section A：预警详情表格 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-500 rounded"></span>
                  预警详情
                </h4>
                {reminderContracts.length === 0 ? (
                  <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg border border-green-200">
                    ✅ 当前无合同预警，所有合同状态正常
                  </div>
                ) : (
                  <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium">类型</th>
                        <th className="text-left py-2 px-3 font-medium">严重度</th>
                        <th className="text-left py-2 px-3 font-medium">合同编号</th>
                        <th className="text-left py-2 px-3 font-medium">合同名称</th>
                        <th className="text-left py-2 px-3 font-medium">对方单位</th>
                        <th className="text-left py-2 px-3 font-medium">详情</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reminderContracts.map((r, idx) => (
                        <tr key={idx} className="border-t border-slate-100 hover:bg-amber-50/40">
                          <td className="py-2 px-3">
                            {r.type === 'paid' ? (
                              <span className="px-2 py-0.5 rounded text-white text-[11px] bg-amber-500">支付预警</span>
                            ) : r.type === 'eval' ? (
                              <span className="px-2 py-0.5 rounded text-white text-[11px] bg-purple-500">考核提醒</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-white text-[11px] bg-orange-500">到期预警</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className={r.level === 'danger' ? 'text-rose-500 font-medium' : 'text-amber-500'}>
                              {r.level === 'danger' ? '● 紧急' : '○ 注意'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-mono">{r.contract.contractNo}</td>
                          <td className="py-2 px-3 text-slate-800">{r.contract.contractName}</td>
                          <td className="py-2 px-3 text-slate-600">{r.contract.counterpartyName || '-'}</td>
                          <td className={`py-2 px-3 ${r.level === 'danger' ? 'text-rose-600 font-medium' : 'text-amber-700'}`}>{r.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Section B：统计汇总 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-500 rounded"></span>
                  统计汇总（筛选后）
                </h4>
                {/* 6 个指标卡 */}
                <div className="grid grid-cols-6 gap-3 mb-4">
                  {[
                    { label: '合同总数', value: stats.total, unit: '份', color: '#3b82f6', bg: '#eff6ff' },
                    { label: '合同总金额', value: stats.totalAmount.toFixed(0), unit: '万元', color: '#22c55e', bg: '#f0fdf4' },
                    { label: '已支付金额', value: stats.totalPaid.toFixed(0), unit: '万元', color: '#f59e0b', bg: '#fffbeb' },
                    { label: '执行中', value: stats.activeCount, unit: '份', color: '#22c55e', bg: '#f0fdf4' },
                    { label: '待审批', value: stats.pendingCount, unit: '份', color: '#f59e0b', bg: '#fffbeb' },
                    { label: '即将到期(30天)', value: stats.expiringCount, unit: '份', color: '#ef4444', bg: '#fef2f2' },
                  ].map((item, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="mt-1">
                        <span className="text-xl font-bold" style={{ color: item.color }}>{item.value}</span>
                        <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 维度分布（压缩版，只显示按合同性质 + 按状态两列） */}
                <div className="grid grid-cols-3 gap-3">
                  {/* 按合同性质 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700">按合同性质</div>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-green-700">● 招采类</span>
                        <span className="text-slate-700 font-medium">{(contractLedgers || []).filter(c => c.contractNature === 'procurement').length} 份</span>
                      </div>
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-slate-500">● 非招采类</span>
                        <span className="text-slate-700 font-medium">{(contractLedgers || []).filter(c => c.contractNature === 'non_procurement').length} 份</span>
                      </div>
                    </div>
                  </div>
                  {/* 按状态 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700">按状态</div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {Object.entries(stats.byStatus).map(([key, v]) => (
                        <div key={key} className="flex justify-between px-3 py-2">
                          <span className="text-slate-600">{key}</span>
                          <span className="text-slate-700 font-medium">{v.count} 份</span>
                        </div>
                      ))}
                      {Object.keys(stats.byStatus).length === 0 && (
                        <div className="px-3 py-4 text-center text-slate-400">无数据</div>
                      )}
                    </div>
                  </div>
                  {/* 按经办部门 TOP 3 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700">经办部门 TOP 3</div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {Object.entries(stats.byDepartment).slice(0, 3).map(([key, v], i) => (
                        <div key={key} className="flex justify-between px-3 py-2">
                          <span className="text-slate-600">
                            <span className="text-indigo-500 mr-1">{i + 1}.</span>{key}
                          </span>
                          <span className="text-slate-700 font-medium">{v.count} 份</span>
                        </div>
                      ))}
                      {Object.keys(stats.byDepartment).length === 0 && (
                        <div className="px-3 py-4 text-center text-slate-400">无数据</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
              <DefaultButton onClick={() => setReminderDetailOpen(false)}>关闭</DefaultButton>
              <PrimaryButton onClick={() => { setReminderDetailOpen(false); setReminderSettingsOpen(true); }}>
                <Bell size={14} /> 提醒设置
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* 搜索筛选区 */}
      <SearchBar
        onSearch={() => setApplied({
          no: filterNo, name: filterName, status: filterStatus,
          nature: filterNature, formation: filterFormation,
          archiveStatus: filterArchiveStatus, isModelText: filterIsModelText,
          counterparty: filterCounterparty, department: filterDepartment,
          dateFrom: filterDateFrom, dateTo: filterDateTo,
          winningDateFrom: filterWinningDateFrom, winningDateTo: filterWinningDateTo,
        })}
        onReset={() => {
          setFilterNo(''); setFilterName(''); setFilterStatus('');
          setFilterNature(''); setFilterFormation('');
          setFilterArchiveStatus(''); setFilterIsModelText('');
          setFilterCounterparty(''); setFilterDepartment('');
          setFilterDateFrom(''); setFilterDateTo('');
          setFilterWinningDateFrom(''); setFilterWinningDateTo('');
          setApplied({
            no: '', name: '', status: '', nature: '', formation: '',
            archiveStatus: '', isModelText: '',
            counterparty: '', department: '',
            dateFrom: '', dateTo: '',
            winningDateFrom: '', winningDateTo: '',
          });
        }}
      >
        <SearchField label="合同编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="合同名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField
          label="合同性质"
          type="select"
          value={filterNature}
          onChange={setFilterNature}
          options={[
            { value: '', label: '全部' },
            { value: 'procurement', label: '招采类合同' },
            { value: 'non_procurement', label: '非招采类合同' },
          ]}
        />
        <SearchField
          label="合同形成方式"
          type="select"
          value={filterFormation}
          onChange={setFilterFormation}
          options={[
            { value: '', label: '全部' },
            ...(filterNature === 'non_procurement'
              ? Object.entries(NON_PROCUREMENT_FORMATION_LABELS).map(([v, label]) => ({ value: v, label }))
              : Object.entries(PROCUREMENT_FORMATION_LABELS).map(([v, label]) => ({ value: v, label }))
            ),
          ]}
        />
        <SearchField
          label="示范文本"
          type="select"
          value={filterIsModelText}
          onChange={setFilterIsModelText}
          options={[
            { value: '', label: '全部' },
            { value: 'true', label: '是' },
            { value: 'false', label: '否' },
          ]}
        />
        <SearchField
          label="归档情况"
          type="select"
          value={filterArchiveStatus}
          onChange={setFilterArchiveStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'not_started', label: '未开始' },
            { value: 'in_progress', label: '进行中' },
            { value: 'archived', label: '已归档' },
          ]}
        />
        <SearchField
          label="状态"
          type="select"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'pending', label: '待审批' },
            { value: 'approved', label: '已审批' },
            { value: 'active', label: '执行中' },
            { value: 'expired', label: '已到期' },
            { value: 'terminated', label: '已终止' },
          ]}
        />
        <SearchField label="对方单位" placeholder="对方单位名称" value={filterCounterparty} onChange={setFilterCounterparty} />
        <SearchField label="经办部门" placeholder="部门关键字" value={filterDepartment} onChange={setFilterDepartment} />
        <SearchField label="签订日期起" type="date" value={filterDateFrom} onChange={setFilterDateFrom} />
        <SearchField label="签订日期止" type="date" value={filterDateTo} onChange={setFilterDateTo} />
        <SearchField label="中标时间起" type="date" value={filterWinningDateFrom} onChange={setFilterWinningDateFrom} />
        <SearchField label="中标时间止" type="date" value={filterWinningDateTo} onChange={setFilterWinningDateTo} />
      </SearchBar>

      {/* 主数据表格 */}
      <DataTable data={filteredData} columns={columns} rowKey={(row: any) => row.id} showFooter />

      {/* 新增/编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增合同台账' : '编辑合同台账'}
        onClose={() => { setEditItem(null); }}
        footer={
          <>
            <DefaultButton onClick={() => { setEditItem(null); }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="1000px"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">合同编码 *</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  placeholder="请输入合同编码"
                  value={editItem.contractNo || ''}
                  onChange={(e) => setEditItem({ ...editItem, contractNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">合同形成方式</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.formation}
                  onChange={(e) => setEditItem({ ...editItem, formation: e.target.value as any })}
                >
                  {(editItem.contractNature === 'procurement'
                    ? Object.entries(PROCUREMENT_FORMATION_LABELS)
                    : Object.entries(NON_PROCUREMENT_FORMATION_LABELS)
                  ).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">状态</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                >
                  <option value="draft">草稿</option>
                  <option value="pending">待审批</option>
                  <option value="approved">已审批</option>
                  <option value="active">执行中</option>
                  <option value="expired">已到期</option>
                  <option value="terminated">已终止</option>
                </select>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[#606266]">合同名称 *</div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem.contractName}
                onChange={(e) => setEditItem({ ...editItem, contractName: e.target.value })}
              />
            </div>

            {/* 关联采购工单 */}
            <div className="border border-[#409eff] rounded p-3 bg-[#ecf5ff]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-[#303133]">关联采购工单（可选）</div>
                {selectedBidding ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#67c23a]">已关联：{selectedBidding.biddingNo}</span>
                    <TextButton type="danger" onClick={handleClearBidding}>清除</TextButton>
                  </div>
                ) : (
                  <PrimaryButton size="small" onClick={() => setBiddingPickerOpen(true)}>选择工单</PrimaryButton>
                )}
              </div>
              {selectedBidding ? (
                <div className="grid grid-cols-3 gap-2 text-xs bg-white rounded p-2 border border-[#b3d8ff]">
                  <div><span className="text-[#909399]">工单编号：</span>{selectedBidding.biddingNo}</div>
                  <div><span className="text-[#909399]">工单名称：</span>{selectedBidding.biddingName}</div>
                  <div><span className="text-[#909399]">项目名称：</span>{selectedBidding.projectName || '-'}</div>
                  <div><span className="text-[#909399]">工单状态：</span>{selectedBidding.status}</div>
                  <div><span className="text-[#909399]">确认供应商：</span>
                    {selectedBidding.quotes?.find(q => q.confirmedSupplierId)?.confirmedSupplierName
                      || selectedBidding.winningSupplierName || '-'}
                  </div>
                  <div><span className="text-[#909399]">报价总额：</span>
                    {selectedBidding.quotes?.find(q => q.confirmedSupplierId)?.totalAmount
                      ? '¥' + selectedBidding.quotes.find(q => q.confirmedSupplierId)?.totalAmount?.toLocaleString()
                      : '-'}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#909399] text-center py-2 border border-dashed border-[#b3d8ff] rounded bg-white">
                  未关联采购工单，点击「选择工单」从已完成采购工单中选择
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">分类</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value as any })}
                >
                  <option value="exhibition_service">展览服务</option>
                  <option value="exhibition_display">展览展示</option>
                  <option value="procurement">采购类</option>
                  <option value="investment">招商类</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">合同类型</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.contractType}
                  onChange={(e) => setEditItem({ ...editItem, contractType: e.target.value as any })}
                >
                  <option value="engineering">工程类</option>
                  <option value="non_engineering">非工程类</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">签订主体</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={(editItem as any).signingEntity || ''}
                  onChange={(e) => setEditItem({ ...(editItem as any), signingEntity: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">项目名称</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={(editItem as any).projectName || ''}
                  onChange={(e) => setEditItem({ ...(editItem as any), projectName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">经办部门</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.handlingDepartment || ''}
                  onChange={(e) => setEditItem({ ...editItem, handlingDepartment: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">需求部门</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.demandDepartment || ''}
                  onChange={(e) => setEditItem({ ...editItem, demandDepartment: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">经办人</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.handler || ''}
                  onChange={(e) => setEditItem({ ...editItem, handler: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">对方单位名称</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.counterpartyName || ''}
                  onChange={(e) => setEditItem({ ...editItem, counterpartyName: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">对方单位负责人</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.counterpartyContact || ''}
                  onChange={(e) => setEditItem({ ...editItem, counterpartyContact: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">合同金额(万元)</div>
                <input type="number" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.amount || ''}
                  onChange={(e) => setEditItem({ ...editItem, amount: Number(e.target.value) || undefined })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">已支付金额(万元)</div>
                <input type="number" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.paidAmount || ''}
                  onChange={(e) => setEditItem({ ...editItem, paidAmount: Number(e.target.value) || undefined })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">结算金额(万元)</div>
                <input type="number" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.settlementAmount || ''}
                  onChange={(e) => setEditItem({ ...editItem, settlementAmount: Number(e.target.value) || undefined })}
                />
              </div>
            </div>

            {/* 三个日期字段（签订/生效/终止）移至合同归档环节填写 */}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">立项方式</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.approvalMethod || ''}
                  onChange={(e) => setEditItem({ ...editItem, approvalMethod: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 text-[#606266]">合同主要内容</div>
              <textarea className="w-full px-2 py-1 border border-[#dcdfe6] rounded text-xs" rows={2}
                value={editItem.mainContent || ''}
                onChange={(e) => setEditItem({ ...editItem, mainContent: e.target.value })}
              />
            </div>

            <div>
              <div className="mb-1 text-[#606266]">履行情况</div>
              <textarea className="w-full px-2 py-1 border border-[#dcdfe6] rounded text-xs" rows={2}
                value={editItem.performanceStatus || ''}
                onChange={(e) => setEditItem({ ...editItem, performanceStatus: e.target.value })}
              />
            </div>

            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea className="w-full px-2 py-1 border border-[#dcdfe6] rounded text-xs" rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 查看详情弹窗 */}
      <Modal open={!!viewItem} title="合同详情" onClose={() => setViewItem(null)} footer={
        <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
      } width="1000px">
        {viewItem && (
          <div className="text-xs space-y-3">
            {/* 关联招采执行工单 - 紫色渐变卡片（仅招采类且有 biddingNo 时显示） */}
            {viewItem.contractNature === 'procurement' && viewItem.biddingId && viewItem.biddingNo && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-md">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/70 leading-none mb-1">关联招采执行工单</div>
                  <div className="text-sm font-bold truncate">{viewItem.biddingNo}</div>
                </div>
                <PrimaryButton
                  size="small"
                  onClick={() => { setViewItem(null); navigate('/procurement/bidding'); }}
                  className="flex-shrink-0 !bg-white !text-purple-600 hover:!bg-white/90 !shadow-none"
                >
                  跳转查看 →
                </PrimaryButton>
              </div>
            )}

            <div className="grid grid-cols-3 gap-y-2 gap-x-4 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#909399]">合同编码：</span>{viewItem.contractNo}</div>
              <div><span className="text-[#909399]">状态：</span>
                <span className={`px-2 py-0.5 rounded ${statusMap[viewItem.status]?.color} ${statusMap[viewItem.status]?.bg}`}>
                  {statusMap[viewItem.status]?.label || viewItem.status}
                </span>
              </div>
              <div><span className="text-[#909399]">形成方式：</span>{
                viewItem.contractNature === 'procurement'
                  ? PROCUREMENT_FORMATION_LABELS[viewItem.formation as keyof typeof PROCUREMENT_FORMATION_LABELS]
                  : NON_PROCUREMENT_FORMATION_LABELS[viewItem.formation as keyof typeof NON_PROCUREMENT_FORMATION_LABELS]
              }</div>
              <div className="col-span-3"><span className="text-[#909399]">合同名称：</span>{viewItem.contractName}</div>
              <div><span className="text-[#909399]">分类：</span>{categoryMap[viewItem.category] || viewItem.category}</div>
              <div><span className="text-[#909399]">类型：</span>{viewItem.contractType === 'engineering' ? '工程类' : '非工程类'}</div>
              <div><span className="text-[#909399]">签订主体：</span>{(viewItem as any).signingEntity || '-'}</div>
              <div><span className="text-[#909399]">经办部门：</span>{viewItem.handlingDepartment || '-'}</div>
              <div><span className="text-[#909399]">需求部门：</span>{viewItem.demandDepartment || '-'}</div>
              <div><span className="text-[#909399]">经办人：</span>{viewItem.handler || '-'}</div>
              <div><span className="text-[#909399]">对方单位：</span>{viewItem.counterpartyName || '-'}</div>
              <div><span className="text-[#909399]">对方负责人：</span>{viewItem.counterpartyContact || '-'}</div>
              <div><span className="text-[#909399]">项目名称：</span>{(viewItem as any).projectName || '-'}</div>
              <div><span className="text-[#909399]">立项方式：</span>{viewItem.approvalMethod || '-'}</div>
              <div><span className="text-[#909399]">合同金额：</span><span className="text-[#409eff] font-medium">{viewItem.amount?.toFixed(2)} 万元</span></div>
              <div><span className="text-[#909399]">已支付：</span><span className="text-[#67c23a] font-medium">{viewItem.paidAmount?.toFixed(2)} 万元</span></div>
              <div><span className="text-[#909399]">结算金额：</span>{viewItem.settlementAmount?.toFixed(2) || '-'} 万元</div>
              <div><span className="text-[#909399]">签订日期：</span>{viewItem.signingDate || '-'}</div>
              <div><span className="text-[#909399]">生效日期：</span>{viewItem.effectiveDate || '-'}</div>
              <div><span className="text-[#909399]">终止日期：</span>{viewItem.terminationDate || '-'}</div>
            </div>
            <div>
              <div className="text-[#909399] mb-1">合同主要内容：</div>
              <div className="p-2 border border-[#ebeef5] rounded text-[#303133] whitespace-pre-wrap">{viewItem.mainContent || '-'}</div>
            </div>
            <div>
              <div className="text-[#909399] mb-1">履行情况：</div>
              <div className="p-2 border border-[#ebeef5] rounded text-[#303133] whitespace-pre-wrap">{viewItem.performanceStatus || '-'}</div>
            </div>
            <div>
              <div className="text-[#909399] mb-1">备注：</div>
              <div className="p-2 border border-[#ebeef5] rounded text-[#303133] whitespace-pre-wrap">{viewItem.remark || '-'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* 中止合同弹窗 */}
      <Modal open={!!suspendItem} title="申请中止合同" onClose={() => setSuspendItem(null)} footer={
        <>
          <DefaultButton onClick={() => setSuspendItem(null)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSuspend}>提交中止申请</PrimaryButton>
        </>
      } width="560px">
        {suspendItem && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#f5f7fa] rounded">
              <div>合同编码：<span className="font-medium">{suspendItem.contractNo}</span></div>
              <div>合同名称：<span className="font-medium">{suspendItem.contractName}</span></div>
              <div>当前状态：<span className="text-[#409eff] font-medium">{statusMap[suspendItem.status]?.label}</span></div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">中止原因（将写入合同备注）</div>
              <textarea rows={4} className="w-full px-2 py-1 border border-[#dcdfe6] rounded"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="请说明中止原因..."
              />
            </div>
            <div className="text-[#909399] text-xs">
              ⓘ 提交后合同状态将变为"待审批"，待审批通过后生效。
            </div>
          </div>
        )}
      </Modal>

      {/* 终止合同弹窗 */}
      <Modal open={!!terminateItem} title="终止合同" onClose={() => setTerminateItem(null)} footer={
        <>
          <DefaultButton onClick={() => setTerminateItem(null)}>取消</DefaultButton>
          <PrimaryButton onClick={handleTerminate}>确认终止</PrimaryButton>
        </>
      } width="560px">
        {terminateItem && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#fef0f0] border border-[#f56c6c] rounded text-[#f56c6c]">
              <div className="font-medium mb-1">⚠ 终止合同为不可逆操作</div>
              <div>合同编码：<span className="font-medium">{terminateItem.contractNo}</span></div>
              <div>合同名称：<span className="font-medium">{terminateItem.contractName}</span></div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">终止原因</div>
              <textarea rows={4} className="w-full px-2 py-1 border border-[#dcdfe6] rounded"
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                placeholder="请说明终止原因..."
              />
            </div>
            <div className="text-[#909399]">
              ⓘ 终止后，合同状态变为"已终止"，无法再用于采购需求申请。
            </div>
          </div>
        )}
      </Modal>

      {/* 采购工单选择弹窗 */}
      <Modal
        open={biddingPickerOpen}
        title="选择采购工单"
        onClose={() => setBiddingPickerOpen(false)}
        footer={<DefaultButton onClick={() => setBiddingPickerOpen(false)}>取消</DefaultButton>}
        width="900px"
      >
        <div className="space-y-2">
          <div className="text-xs text-[#909399] mb-2">
            请从已完成的采购工单中选择，系统将自动带入项目名称、确认供应商等信息到合同台账。
          </div>
          <div className="border border-[#dcdfe6] rounded overflow-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="bg-[#f5f7fa] sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">工单编号</th>
                  <th className="px-3 py-2 text-left">工单名称</th>
                  <th className="px-3 py-2 text-left">项目名称</th>
                  <th className="px-3 py-2 text-center">状态</th>
                  <th className="px-3 py-2 text-left">确认供应商</th>
                  <th className="px-3 py-2 text-right">报价总额</th>
                  <th className="px-3 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {biddings
                  .filter(b => b.status === 'completed' || b.status === 'evaluated')
                  .map(b => {
                    const confirmedQuote = b.quotes?.find(q => q.confirmedSupplierId);
                    const supplierName = confirmedQuote?.confirmedSupplierName || b.winningSupplierName || '-';
                    const totalAmount = confirmedQuote?.totalAmount || b.quotes?.[0]?.totalAmount || 0;
                    return (
                      <tr key={b.id} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                        <td className="px-3 py-2">{b.biddingNo}</td>
                        <td className="px-3 py-2">{b.biddingName}</td>
                        <td className="px-3 py-2">{b.projectName || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-[#67c23a]">{b.status === 'completed' ? '已完成' : '已评审'}</span>
                        </td>
                        <td className="px-3 py-2">{supplierName}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[#f56c6c]">
                          ¥{totalAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <PrimaryButton size="small" onClick={() => handleSelectBidding(b)}>选择</PrimaryButton>
                        </td>
                      </tr>
                    );
                  })}
                {biddings.filter(b => b.status === 'completed' || b.status === 'evaluated').length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">
                      暂无已完成的采购工单可供选择
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 合同提醒设置弹窗 */}
      <Modal
        open={reminderSettingsOpen}
        title="合同提醒设置"
        onClose={() => setReminderSettingsOpen(false)}
        footer={
          <>
            <DefaultButton onClick={() => setReminderSettingsOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={() => {
              if (draftPaidThreshold < 0 || draftPaidThreshold > 100) {
                alert('已支付金额占比必须在 0-100 之间');
                return;
              }
              if (draftExpireDays < 0) {
                alert('到期提前天数不能为负数');
                return;
              }
              // 校验考核类型的天数
              for (const [kind, cfg] of Object.entries(draftEval)) {
                if (cfg.days < 0) { alert(`${kind} 提前天数不能为负数`); return; }
              }
              // 写入 store（持久化）
              setReminderSettings({
                paidThreshold: draftPaidThreshold,
                expireDays: draftExpireDays,
                eval: draftEval as any,
              });
              setReminderSettingsOpen(false);
            }}>保存设置</PrimaryButton>
          </>
        }
        width="600px"
      >
        <div className="space-y-4">
          <div className="text-xs text-[#909399] mb-2">
            设置合同预警提醒规则，符合条件的合同将在合同台账页面上方以提醒面板形式展示。
          </div>

          {/* 字段1：已支付金额占比 */}
          <div className="border border-[#ebeef5] rounded p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-1 h-4 bg-[#e6a23c] rounded mt-0.5"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#303133]">① 已支付金额占比预警阈值</div>
                <div className="text-xs text-[#909399] mt-1">
                  当某合同的"已支付金额 / 合同总金额" ≥ 设定阈值时，系统自动在提醒面板中提示。
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min={0}
                max={100}
                value={draftPaidThreshold}
                onChange={(e) => setDraftPaidThreshold(Number(e.target.value) || 0)}
                className="w-24 h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              />
              <span className="text-sm text-[#606266]">%</span>
              <span className="text-xs text-[#909399] ml-2">
                （当前：{draftPaidThreshold}%，达到该比例时触发提醒）
              </span>
            </div>
            <div className="text-xs text-[#e6a23c] mt-2 bg-[#fdf6ec] p-2 rounded">
              💡 建议设置 80%~95%，便于及时掌握合同付款进度与履约情况。
            </div>
          </div>

          {/* 字段2：到期日提前提醒天数 */}
          <div className="border border-[#ebeef5] rounded p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-1 h-4 bg-[#f56c6c] rounded mt-0.5"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#303133]">② 合同到期日提前提醒天数</div>
                <div className="text-xs text-[#909399] mt-1">
                  当合同有效期到期日距离当前日期 ≤ 设定天数时，系统自动在提醒面板中提示。
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min={0}
                max={365}
                value={draftExpireDays}
                onChange={(e) => setDraftExpireDays(Number(e.target.value) || 0)}
                className="w-24 h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              />
              <span className="text-sm text-[#606266]">天</span>
              <span className="text-xs text-[#909399] ml-2">
                （当前：到期前 {draftExpireDays} 天开始提醒）
              </span>
            </div>
            <div className="text-xs text-[#f56c6c] mt-2 bg-[#fef0f0] p-2 rounded">
              💡 建议设置 15~60 天，便于提前安排续签、验收、归档等事宜。
            </div>
          </div>

          {/* 字段3：合同考核到期提醒 —— 每种考核类型独立配置 */}
          <div className="border border-[#ebeef5] rounded p-3">
            <div className="flex items-start gap-2 mb-3">
              <div className="w-1 h-4 bg-purple-500 rounded mt-0.5"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#303133]">③ 合同考核到期提醒（按类型独立配置）</div>
                <div className="text-xs text-[#909399] mt-1">
                  已绑定考核的合同，在下次考核到期前自动提醒。可按考核类型独立开关、独立设置提前天数。
                </div>
              </div>
            </div>
            {/* 5 行独立配置 */}
            <div className="space-y-2">
              {([
                { key: 'monthly',            label: '月度考核',   defaultDays: 7,  desc: '每月固定循环' },
                { key: 'quarterly',          label: '季度考核',   defaultDays: 10, desc: '每季度固定循环' },
                { key: 'yearly',             label: '年度评价',   defaultDays: 30, desc: '每年固定循环' },
                { key: 'project_single',     label: '项目考核',   defaultDays: 7,  desc: '单个项目结束后一次性考核' },
                { key: 'contract_performance', label: '履约评价',   defaultDays: 15, desc: '合同履约保证金/质保金评估' },
              ] as const).map((item) => {
                const cfg = draftEval[item.key] ?? { enabled: true, days: item.defaultDays };
                return (
                  <div key={item.key} className="flex items-center gap-3 py-1.5 border-b border-[#ebeef5] last:border-0">
                    <input
                      type="checkbox"
                      checked={cfg.enabled}
                      onChange={(e) => setDraftEval((prev) => ({ ...prev, [item.key]: { ...cfg, enabled: e.target.checked } }))}
                      className="w-4 h-4 accent-purple-500 flex-shrink-0"
                    />
                    <span className="text-sm text-[#303133] w-24 flex-shrink-0">{item.label}</span>
                    <span className="text-xs text-[#909399] flex-1 truncate">{item.desc}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-[#606266]">到期前</span>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={cfg.days}
                        onChange={(e) => setDraftEval((prev) => ({ ...prev, [item.key]: { ...cfg, days: Number(e.target.value) || 0 } }))}
                        disabled={!cfg.enabled}
                        className="w-16 h-7 px-2 border border-[#dcdfe6] rounded text-sm disabled:bg-[#f5f7fa] disabled:cursor-not-allowed text-center"
                      />
                      <span className="text-xs text-[#606266]">天</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-purple-600 mt-2 bg-purple-50 p-2 rounded">
              💡 已过期 30 天内的考核也会预警。
            </div>
          </div>

          {/* 实时触发统计 */}
          <div className="border border-[#dcdfe6] rounded p-3 bg-[#f5f7fa]">
            <div className="text-xs text-[#606266] mb-1">当前设置下命中提醒的合同数</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6a23c]">🔔 共 <b>{reminderContracts.length}</b> 条</span>
              <span className="text-xs text-[#909399]">
                （支付预警 + 到期预警 + 考核提醒）
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========== 考核绑定管理弹窗 ========== */}
      <Modal
        open={evalModalOpen}
        title={`考核绑定管理 - ${evalTarget?.contractNo || ''}`}
        size="lg"
        onClose={() => setEvalModalOpen(false)}
        footer={<DefaultButton onClick={() => setEvalModalOpen(false)}>关闭</DefaultButton>}
      >
        {evalTarget && (
          <div>
            {/* 绑定列表 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#303133]">考核绑定清单</span>
                <PrimaryButton size="small" onClick={openNewEvalBinding}>+ 新增考核绑定</PrimaryButton>
              </div>
              <table className="w-full text-sm border border-[#ebeef5] rounded">
                <thead className="bg-[#fafafa]">
                  <tr className="text-[#606266]">
                    <th className="text-left py-2 px-3 border-b">考核类型</th>
                    <th className="text-left py-2 px-3 border-b">考核模板</th>
                    <th className="text-left py-2 px-3 border-b">提醒频率</th>
                    <th className="text-left py-2 px-3 border-b">下次提醒</th>
                    <th className="text-left py-2 px-3 border-b">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {(evalTarget.contractEvaluations || []).length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-[#c0c4cc]">暂无考核绑定，点击右上角新增</td></tr>
                  )}
                  {(evalTarget.contractEvaluations || []).map((b) => (
                    <tr key={b.id} className="border-b border-[#ebeef5] hover:bg-[#f5f7fa]">
                      <td className="py-2 px-3">{EVAL_KIND_LABEL[b.kind] || b.kind}</td>
                      <td className="py-2 px-3">{b.templateName || '-'}</td>
                      <td className="py-2 px-3">{EVAL_FREQ_LABEL[b.frequency] || b.frequency}</td>
                      <td className="py-2 px-3">
                        {b.nextRemindDate ? (
                          <span className={new Date(b.nextRemindDate) < new Date() ? 'text-[#f56c6c]' : 'text-[#606266]'}>
                            {b.nextRemindDate}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <TextButton onClick={() => { setEvalEditItem(b); setIsNewEval(false); }}>编辑</TextButton>
                          <TextButton type="danger" onClick={() => deleteEvalBinding(b.id)}>删除</TextButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 新增/编辑表单 */}
            {evalEditItem && (
              <div className="border border-[#dcdfe6] rounded-lg p-4 bg-[#fafafa]">
                <div className="text-sm font-medium text-[#303133] mb-3">
                  {isNewEval ? '新增考核绑定' : '编辑考核绑定'}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#606266] mb-1">考核类型 <span className="text-red-500">*</span></label>
                    <select
                      className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm bg-white"
                      value={evalEditItem.kind}
                      onChange={(e) => {
                        const kind = e.target.value as EvaluationType;
                        const tpl = templateOptions.find((t) => t.kind === kind);
                        setEvalEditItem({ ...evalEditItem, kind, templateId: tpl?.id || '', templateName: tpl?.name || '' });
                      }}
                    >
                      {Object.entries(EVAL_KIND_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#606266] mb-1">考核模板 <span className="text-red-500">*</span></label>
                    <select
                      className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm bg-white"
                      value={evalEditItem.templateId}
                      onChange={(e) => {
                        const tpl = templateOptions.find((t) => t.id === e.target.value);
                        setEvalEditItem({ ...evalEditItem, templateId: e.target.value, templateName: tpl?.name || '' });
                      }}
                    >
                      <option value="">请选择模板</option>
                      {templateOptions
                        .filter((t) => !evalEditItem.kind || t.kind === evalEditItem.kind)
                        .map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#606266] mb-1">提醒频率</label>
                    <select
                      className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm bg-white"
                      value={evalEditItem.frequency}
                      onChange={(e) => setEvalEditItem({ ...evalEditItem, frequency: e.target.value as any })}
                    >
                      {Object.entries(EVAL_FREQ_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#606266] mb-1">下次提醒日期</label>
                    <input
                      type="date"
                      className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm"
                      value={evalEditItem.nextRemindDate || ''}
                      onChange={(e) => setEvalEditItem({ ...evalEditItem, nextRemindDate: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#606266] mb-1">备注</label>
                    <input
                      type="text"
                      className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm"
                      placeholder="可选备注"
                      value={evalEditItem.remark || ''}
                      onChange={(e) => setEvalEditItem({ ...evalEditItem, remark: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <DefaultButton size="small" onClick={() => { setEvalEditItem(null); setIsNewEval(false); }}>取消</DefaultButton>
                  <PrimaryButton size="small" onClick={saveEvalBinding}>保存绑定</PrimaryButton>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
