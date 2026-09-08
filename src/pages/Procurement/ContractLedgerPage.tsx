import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import type { ContractLedger, Bidding } from '@/types';
import { Printer, FileSpreadsheet, FileDown, Bell } from 'lucide-react';

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
  const contractLedgers = useStore((s) => s.contractLedgers) || [];
  const addContractLedger = useStore((s) => s.addContractLedger);
  const updateContractLedger = useStore((s) => s.updateContractLedger);
  const deleteContractLedger = useStore((s) => s.deleteContractLedger);
  const currentUser = useStore((s) => s.currentUser);
  const biddings = (useStore((s) => s.biddings) || []) as Bidding[];

  // 筛选条件
  const [filterNo, setFilterNo] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterContractType, setFilterContractType] = useState('');
  const [filterCounterparty, setFilterCounterparty] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [applied, setApplied] = useState({
    no: '', name: '', status: '', category: '', contractType: '',
    counterparty: '', department: '', project: '', year: '',
    dateFrom: '', dateTo: '',
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

  // 统计面板是否展开
  const [statsExpanded, setStatsExpanded] = useState(true);

  // 合同提醒设置
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false);
  const [reminderPaidThreshold, setReminderPaidThreshold] = useState(80);  // 已支付金额占比阈值（%）
  const [reminderExpireDays, setReminderExpireDays] = useState(30);        // 到期日前提前多少天提醒（天）

  const filteredData = useMemo(() => {
    return contractLedgers.filter((c) => {
      if (applied.no && !c.contractNo.includes(applied.no)) return false;
      if (applied.name && !c.contractName.includes(applied.name)) return false;
      if (applied.status && c.status !== applied.status) return false;
      if (applied.category && c.category !== applied.category) return false;
      if (applied.contractType && c.contractType !== applied.contractType) return false;
      if (applied.counterparty && !c.counterpartyName?.includes(applied.counterparty)) return false;
      if (applied.department && !c.handlingDepartment?.includes(applied.department) && !c.demandDepartment?.includes(applied.department)) return false;
      if (applied.project && !(c as any).projectName?.includes(applied.project)) return false;
      if (applied.year) {
        const yr = c.signingDate?.slice(0, 4);
        if (yr !== applied.year) return false;
      }
      if (applied.dateFrom && (!c.signingDate || c.signingDate < applied.dateFrom)) return false;
      if (applied.dateTo && (!c.signingDate || c.signingDate > applied.dateTo)) return false;
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
    const result: Array<{ contract: ContractLedger; type: 'paid' | 'expire'; message: string; level: 'warning' | 'danger' }> = [];
    filteredData.forEach((c) => {
      if (c.status === 'terminated' || c.status === 'completed') return;
      // 1) 已支付金额占比提醒
      const total = Number((c as any).contractAmount || (c as any).totalAmount || 0);
      const paid = Number((c as any).paidAmount || 0);
      if (total > 0) {
        const ratio = (paid / total) * 100;
        if (ratio >= reminderPaidThreshold) {
          result.push({
            contract: c,
            type: 'paid',
            message: `已支付 ${ratio.toFixed(1)}%（¥${paid.toLocaleString()} / ¥${total.toLocaleString()}）`,
            level: ratio >= 95 ? 'danger' : 'warning',
          });
        }
      }
      // 2) 到期日提前提醒
      const expire = c.endDate || c.expireDate;
      if (expire) {
        const expireDate = new Date(expire);
        const diffDays = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= reminderExpireDays) {
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
    });
    return result;
  }, [filteredData, reminderPaidThreshold, reminderExpireDays]);

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
      contractName: '',
      category: 'procurement',
      contractType: 'non_engineering',
      formation: 'online',
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
    // 新增时才生成编号，编辑保留原编号
    if (isNew && !editItem.contractNo) {
      editItem.contractNo = genSerialNo(SERIAL_CONFIG.CONTRACT, contractLedgers.map(c => c.contractNo));
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

  // ========== 表格列定义 ==========
  const columns: ColumnDef<ContractLedger>[] = [
    { key: 'contractNo', title: '合同编码', render: (row) => row.contractNo,
      footer: (data: ContractLedger[]) => `合计 ${data.length} 份` },
    { key: 'contractName', title: '合同名称', render: (row) => row.contractName, footer: '' },
    {
      key: 'category',
      title: '分类',
      render: (row) => categoryMap[row.category] || row.category,
      footer: '',
    },
    {
      key: 'contractType',
      title: '合同类型',
      render: (row) => row.contractType === 'engineering' ? '工程类' : '非工程类',
      footer: '',
    },
    { key: 'signingEntity', title: '签订主体', render: (row) => (row as any).signingEntity || '-', footer: '' },
    { key: 'handlingDepartment', title: '经办部门', render: (row) => row.handlingDepartment || '-', footer: '' },
    { key: 'demandDepartment', title: '需求部门', render: (row) => row.demandDepartment || '-', footer: '' },
    { key: 'handler', title: '经办人', render: (row) => row.handler || '-', footer: '' },
    { key: 'counterpartyName', title: '对方单位', render: (row) => row.counterpartyName || '-', footer: '' },
    { key: 'projectName', title: '项目名称', render: (row) => (row as any).projectName || '-', footer: '' },
    {
      key: 'amount', title: '合同金额(万)', align: 'right',
      render: (row) => row.amount?.toLocaleString() || '-',
      footer: (data: ContractLedger[]) => {
        const sum = data.reduce((s, c) => s + (c.amount || 0), 0);
        return sum > 0 ? sum.toLocaleString() : '-';
      },
    },
    {
      key: 'paidAmount', title: '已支付(万)', align: 'right',
      render: (row) => row.paidAmount?.toLocaleString() || '-',
      footer: (data: ContractLedger[]) => {
        const sum = data.reduce((s, c) => s + (c.paidAmount || 0), 0);
        return sum > 0 ? sum.toLocaleString() : '-';
      },
    },
    {
      key: 'settlementAmount', title: '结算金额(万)', align: 'right',
      render: (row) => row.settlementAmount?.toLocaleString() || '-',
      footer: (data: ContractLedger[]) => {
        const sum = data.reduce((s, c) => s + (c.settlementAmount || 0), 0);
        return sum > 0 ? sum.toLocaleString() : '-';
      },
    },
    { key: 'signingDate', title: '签订日期', render: (row) => row.signingDate || '-', footer: '' },
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
    {
      key: 'status',
      title: '状态',
      footer: '',
      render: (row) => {
        // 自动判断：执行中合同已过期 → 逻辑状态提示
        let displayStatus = statusMap[row.status] || statusMap.draft;
        let extraLabel = '';
        if (row.status === 'active' && isExpired(row.terminationDate)) {
          extraLabel = ' (已过期)';
        }
        return (
          <span className={`px-2 py-0.5 rounded text-xs ${displayStatus.color} ${displayStatus.bg}`}>
            {displayStatus.label}{extraLabel}
          </span>
        );
      },
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => { setIsNew(false); setEditItem(row); }}>编辑</TextButton>
          {(row.status === 'active' || row.status === 'approved') && (
            <>
              <TextButton
                onClick={() => { setSuspendItem(row); setSuspendReason(''); }}
              >中止</TextButton>
              <TextButton type="danger" onClick={() => { setTerminateItem(row); setTerminateReason(''); }}>
                终止
              </TextButton>
            </>
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
          <PrimaryButton onClick={openAdd}>+ 新增合同</PrimaryButton>
        </div>
      </div>

      {/* 合同提醒面板 */}
      {reminderContracts.length > 0 && (
        <div className="mb-3 border border-[#e6a23c] rounded bg-[#fdf6ec]">
          <div
            className="px-4 py-2 flex items-center justify-between cursor-pointer"
            onClick={() => setStatsExpanded(!statsExpanded)}
          >
            <div className="font-semibold text-[#e6a23c] text-xs">
              🔔 合同预警提醒（共 {reminderContracts.length} 条）
              <span className="text-[#909399] ml-2 font-normal">
                （已支付占比 ≥ {reminderPaidThreshold}% / 到期提前 {reminderExpireDays} 天）
              </span>
            </div>
          </div>
          <div className="px-4 pb-3">
            <table className="w-full text-xs">
              <thead className="text-[#909399]">
                <tr>
                  <th className="text-left py-1 font-normal">提醒类型</th>
                  <th className="text-left py-1 font-normal">合同编号</th>
                  <th className="text-left py-1 font-normal">合同名称</th>
                  <th className="text-left py-1 font-normal">对方单位</th>
                  <th className="text-left py-1 font-normal">提醒详情</th>
                  <th className="text-left py-1 font-normal">经办人</th>
                </tr>
              </thead>
              <tbody>
                {reminderContracts.map((r, idx) => (
                  <tr key={idx} className="border-t border-[#faecd8]">
                    <td className="py-1.5">
                      {r.type === 'paid' ? (
                        <span className={`px-2 py-0.5 rounded text-white ${r.level === 'danger' ? 'bg-[#f56c6c]' : 'bg-[#e6a23c]'}`}>
                          支付预警
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-white ${r.level === 'danger' ? 'bg-[#f56c6c]' : 'bg-[#e6a23c]'}`}>
                          到期预警
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-[#303133]">{r.contract.contractNo}</td>
                    <td className="py-1.5 text-[#303133]">{r.contract.contractName}</td>
                    <td className="py-1.5 text-[#606266]">{r.contract.counterpartyName || '-'}</td>
                    <td className={`py-1.5 ${r.level === 'danger' ? 'text-[#f56c6c] font-medium' : 'text-[#e6a23c]'}`}>
                      {r.message}
                    </td>
                    <td className="py-1.5 text-[#606266]">{r.contract.handler || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 统计汇总面板 */}
      <div className="mb-3 border border-[#ebeef5] rounded bg-white">
        <div
          className="px-4 py-2 flex items-center justify-between cursor-pointer bg-[#f5f7fa] rounded-t text-xs"
          onClick={() => setStatsExpanded(!statsExpanded)}
        >
          <div className="font-semibold text-[#303133]">
            📊 统计汇总
            <span className="text-[#909399] ml-2 font-normal">
              （筛选后：{stats.total} 份合同，总金额 {stats.totalAmount.toFixed(2)} 万元）
            </span>
          </div>
          <span className="text-[#909399]">{statsExpanded ? '▲ 收起' : '▼ 展开'}</span>
        </div>

        {statsExpanded && (
          <div className="p-4 space-y-4">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-6 gap-3">
              {[
                { label: '合同总数', value: stats.total, unit: '份', color: '#409eff', bg: '#ecf5ff' },
                { label: '合同总金额', value: stats.totalAmount.toFixed(0), unit: '万元', color: '#67c23a', bg: '#f0f9eb' },
                { label: '已支付金额', value: stats.totalPaid.toFixed(0), unit: '万元', color: '#e6a23c', bg: '#fdf6ec' },
                { label: '执行中', value: stats.activeCount, unit: '份', color: '#67c23a', bg: '#f0f9eb' },
                { label: '待审批', value: stats.pendingCount, unit: '份', color: '#e6a23c', bg: '#fdf6ec' },
                { label: '即将到期(30天)', value: stats.expiringCount, unit: '份', color: '#f56c6c', bg: '#fef0f0' },
              ].map((item, i) => (
                <div key={i} className="border border-[#ebeef5] rounded p-3" style={{ background: item.bg }}>
                  <div className="text-xs text-[#909399]">{item.label}</div>
                  <div className="mt-1">
                    <span className="text-lg font-bold" style={{ color: item.color }}>{item.value}</span>
                    <span className="text-xs text-[#909399] ml-1">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 维度统计表 */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              {/* 按分类 */}
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f7fa] font-semibold text-[#303133]">按分类</div>
                <div className="divide-y divide-[#f0f2f5]">
                  {Object.entries(stats.byCategory).map(([key, v]) => (
                    <div key={key} className="flex justify-between px-3 py-1.5">
                      <span className="text-[#606266]">{key}</span>
                      <span className="text-[#303133]">{v.count}份 / ¥{v.amount.toFixed(1)}万</span>
                    </div>
                  ))}
                  {Object.keys(stats.byCategory).length === 0 && (
                    <div className="px-3 py-4 text-center text-[#c0c4cc]">无数据</div>
                  )}
                </div>
              </div>

              {/* 按类型 */}
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f7fa] font-semibold text-[#303133]">按合同类型</div>
                <div className="divide-y divide-[#f0f2f5]">
                  {Object.entries(stats.byContractType).map(([key, v]) => (
                    <div key={key} className="flex justify-between px-3 py-1.5">
                      <span className="text-[#606266]">{key}</span>
                      <span className="text-[#303133]">{v.count}份 / ¥{v.amount.toFixed(1)}万</span>
                    </div>
                  ))}
                  {Object.keys(stats.byContractType).length === 0 && (
                    <div className="px-3 py-4 text-center text-[#c0c4cc]">无数据</div>
                  )}
                </div>
              </div>

              {/* 按状态 */}
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f7fa] font-semibold text-[#303133]">按状态</div>
                <div className="divide-y divide-[#f0f2f5]">
                  {Object.entries(stats.byStatus).map(([key, v]) => (
                    <div key={key} className="flex justify-between px-3 py-1.5">
                      <span className="text-[#606266]">{key}</span>
                      <span className="text-[#303133]">{v.count}份 / ¥{v.amount.toFixed(1)}万</span>
                    </div>
                  ))}
                  {Object.keys(stats.byStatus).length === 0 && (
                    <div className="px-3 py-4 text-center text-[#c0c4cc]">无数据</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              {/* 按经办部门 */}
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f7fa] font-semibold text-[#303133]">按经办部门</div>
                <div className="divide-y divide-[#f0f2f5] max-h-48 overflow-y-auto">
                  {Object.entries(stats.byDepartment).map(([key, v]) => (
                    <div key={key} className="flex justify-between px-3 py-1.5">
                      <span className="text-[#606266]">{key}</span>
                      <span className="text-[#303133]">{v.count}份 / ¥{v.amount.toFixed(1)}万</span>
                    </div>
                  ))}
                  {Object.keys(stats.byDepartment).length === 0 && (
                    <div className="px-3 py-4 text-center text-[#c0c4cc]">无数据</div>
                  )}
                </div>
              </div>

              {/* 按年度 */}
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f7fa] font-semibold text-[#303133]">按签订年度</div>
                <div className="divide-y divide-[#f0f2f5]">
                  {Object.entries(stats.byYear).map(([key, v]) => (
                    <div key={key} className="flex justify-between px-3 py-1.5">
                      <span className="text-[#606266]">{key}年</span>
                      <span className="text-[#303133]">{v.count}份 / ¥{v.amount.toFixed(1)}万</span>
                    </div>
                  ))}
                  {Object.keys(stats.byYear).length === 0 && (
                    <div className="px-3 py-4 text-center text-[#c0c4cc]">无数据</div>
                  )}
                </div>
              </div>

              {/* TOP 10 供应商 */}
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f7fa] font-semibold text-[#303133]">按供应商金额排行（TOP 10）</div>
                <div className="divide-y divide-[#f0f2f5] max-h-48 overflow-y-auto">
                  {stats.byCounterparty.map(([key, v], i) => (
                    <div key={key} className="flex justify-between px-3 py-1.5">
                      <span className="text-[#606266]">
                        <span className="text-[#409eff] mr-1">{i + 1}.</span>{key}
                      </span>
                      <span className="text-[#303133]">{v.count}份 / ¥{v.amount.toFixed(1)}万</span>
                    </div>
                  ))}
                  {stats.byCounterparty.length === 0 && (
                    <div className="px-3 py-4 text-center text-[#c0c4cc]">无数据</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 搜索筛选区 */}
      <SearchBar
        onSearch={() => setApplied({
          no: filterNo, name: filterName, status: filterStatus,
          category: filterCategory, contractType: filterContractType,
          counterparty: filterCounterparty, department: filterDepartment,
          project: filterProject, year: filterYear,
          dateFrom: filterDateFrom, dateTo: filterDateTo,
        })}
        onReset={() => {
          setFilterNo(''); setFilterName(''); setFilterStatus('');
          setFilterCategory(''); setFilterContractType(''); setFilterCounterparty('');
          setFilterDepartment(''); setFilterProject(''); setFilterYear('');
          setFilterDateFrom(''); setFilterDateTo('');
          setApplied({
            no: '', name: '', status: '', category: '', contractType: '',
            counterparty: '', department: '', project: '', year: '',
            dateFrom: '', dateTo: '',
          });
        }}
      >
        <SearchField label="合同编码" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="合同名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
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
        <SearchField
          label="分类"
          type="select"
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: '', label: '全部' },
            { value: 'exhibition_service', label: '展览服务' },
            { value: 'exhibition_display', label: '展览展示' },
            { value: 'procurement', label: '采购类' },
            { value: 'investment', label: '招商类' },
            { value: 'other', label: '其他' },
          ]}
        />
        <SearchField
          label="合同类型"
          type="select"
          value={filterContractType}
          onChange={setFilterContractType}
          options={[
            { value: '', label: '全部' },
            { value: 'engineering', label: '工程类' },
            { value: 'non_engineering', label: '非工程类' },
          ]}
        />
        <SearchField label="供应商" placeholder="对方单位名称" value={filterCounterparty} onChange={setFilterCounterparty} />
        <SearchField label="部门" placeholder="经办/需求部门" value={filterDepartment} onChange={setFilterDepartment} />
        <SearchField label="项目名称" placeholder="项目关键字" value={filterProject} onChange={setFilterProject} />
        <SearchField
          label="年度"
          type="select"
          value={filterYear}
          onChange={setFilterYear}
          options={[
            { value: '', label: '全部' },
            ...yearOptions.map((y) => ({ value: y, label: `${y}年` })),
          ]}
        />
        <SearchField label="签订日期起" type="date" value={filterDateFrom} onChange={setFilterDateFrom} />
        <SearchField label="签订日期止" type="date" value={filterDateTo} onChange={setFilterDateTo} />
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
                {isNew ? (
                  <input disabled placeholder="保存后自动生成"
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#c0c4cc]"
                    value={editItem.contractNo || ''}
                  />
                ) : (
                  <input disabled
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]"
                    value={editItem.contractNo}
                  />
                )}
              </div>
              <div>
                <div className="mb-1 text-[#606266]">合同形成方式</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.formation}
                  onChange={(e) => setEditItem({ ...editItem, formation: e.target.value as any })}
                >
                  <option value="online">敞口/非在线</option>
                  <option value="offline">非在线</option>
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">签订日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.signingDate || ''}
                  onChange={(e) => setEditItem({ ...editItem, signingDate: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">生效日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.effectiveDate || ''}
                  onChange={(e) => setEditItem({ ...editItem, effectiveDate: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">终止日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.terminationDate || ''}
                  onChange={(e) => setEditItem({ ...editItem, terminationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">立项方式</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.approvalMethod || ''}
                  onChange={(e) => setEditItem({ ...editItem, approvalMethod: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">付款情况说明</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.paymentDescription || ''}
                  onChange={(e) => setEditItem({ ...editItem, paymentDescription: e.target.value })}
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
            <div className="grid grid-cols-3 gap-y-2 gap-x-4 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#909399]">合同编码：</span>{viewItem.contractNo}</div>
              <div><span className="text-[#909399]">状态：</span>
                <span className={`px-2 py-0.5 rounded ${statusMap[viewItem.status]?.color} ${statusMap[viewItem.status]?.bg}`}>
                  {statusMap[viewItem.status]?.label || viewItem.status}
                </span>
              </div>
              <div><span className="text-[#909399]">形成方式：</span>{viewItem.formation === 'online' ? '敞口/非在线' : '非在线'}</div>
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
              <div className="col-span-2"><span className="text-[#909399]">付款情况：</span>{viewItem.paymentDescription || '-'}</div>
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
              if (reminderPaidThreshold < 0 || reminderPaidThreshold > 100) {
                alert('已支付金额占比必须在 0-100 之间');
                return;
              }
              if (reminderExpireDays < 0) {
                alert('到期提前天数不能为负数');
                return;
              }
              setReminderSettingsOpen(false);
              alert('提醒设置已保存');
            }}>保存设置</PrimaryButton>
          </>
        }
        width="500px"
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
                value={reminderPaidThreshold}
                onChange={(e) => setReminderPaidThreshold(Number(e.target.value) || 0)}
                className="w-24 h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              />
              <span className="text-sm text-[#606266]">%</span>
              <span className="text-xs text-[#909399] ml-2">
                （当前：{reminderPaidThreshold}%，达到该比例时触发提醒）
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
                value={reminderExpireDays}
                onChange={(e) => setReminderExpireDays(Number(e.target.value) || 0)}
                className="w-24 h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              />
              <span className="text-sm text-[#606266]">天</span>
              <span className="text-xs text-[#909399] ml-2">
                （当前：到期前 {reminderExpireDays} 天开始提醒）
              </span>
            </div>
            <div className="text-xs text-[#f56c6c] mt-2 bg-[#fef0f0] p-2 rounded">
              💡 建议设置 15~60 天，便于提前安排续签、验收、归档等事宜。
            </div>
          </div>

          {/* 实时触发统计 */}
          <div className="border border-[#dcdfe6] rounded p-3 bg-[#f5f7fa]">
            <div className="text-xs text-[#606266] mb-1">当前设置下命中提醒的合同数</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#e6a23c]">🔔 共 <b>{reminderContracts.length}</b> 条</span>
              <span className="text-xs text-[#909399]">
                （支付预警 + 到期预警）
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
