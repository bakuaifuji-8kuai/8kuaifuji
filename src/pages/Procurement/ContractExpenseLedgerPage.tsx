/**
 * 支出合同台账 — ContractExpenseLedgerPage
 *
 * 业务定位：支出合同（businessCategory = 'expense'）专用台账视图
 * — 与"收入/其他合同台账"共用同一份 contractLedgers 数据源
 * — 只做前端 filter 隔离，store 不拆分
 *
 * 与收入/其他台账的核心差异：
 *   1. 对方单位列名恢复为"供应商单位"（支出台账的对方是供应商）
 *   2. 去掉"资金流向"列（全是支出）
 *   3. 新增"未结金额"派生列 = 合同金额 - 结算金额
 *   4. 新增"挂账需求数"派生列 = linkedDemandIds.length
 *   5. 顶部预警面板改支出视角：未结金额 TOP5 + 即将到期 TOP5
 */
import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { getAutoPaidAmount } from '@/utils/contractAggregate';
import type { ContractLedger } from '@/types';
import {
  PROCUREMENT_FORMATION_LABELS, NON_PROCUREMENT_FORMATION_LABELS,
  PROCUREMENT_CONTRACT_TYPE_LABELS, NON_PROCUREMENT_CONTRACT_TYPE_LABELS,
} from '@/types';
import { FileSpreadsheet } from 'lucide-react';

// ============ 标签映射（复用 ContractLedgerPage 的定义）============
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'text-slate-500', bg: 'bg-slate-100' },
  pending: { label: '待审批', color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: '已审批', color: 'text-blue-600', bg: 'bg-blue-50' },
  active: { label: '执行中', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  expired: { label: '已到期', color: 'text-slate-500', bg: 'bg-slate-100' },
  terminated: { label: '已终止', color: 'text-rose-600', bg: 'bg-rose-50' },
};

const ARCHIVE_MAP: Record<string, { label: string; color: string }> = {
  not_started: { label: '未归档', color: 'text-slate-400' },
  in_progress: { label: '归档中', color: 'text-amber-500' },
  archived: { label: '已归档', color: 'text-emerald-500' },
};

const isExpiringSoon = (dateStr?: string, days = 15) => {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= days;
};
const isExpired = (dateStr?: string) => {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
};

export default function ContractExpenseLedgerPage() {
  const contractLedgers = useStore((s) => s.contractLedgers);
  const procurementDemands = useStore((s) => s.procurementDemands);
  const biddings = useStore((s) => s.biddings);

  // ============ 筛选 state ============
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterNature, setFilterNature] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterArchiveStatus, setFilterArchiveStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [applied, setApplied] = useState({
    keyword: '', nature: '', status: '', archiveStatus: '',
    dateFrom: '', dateTo: '',
  });

  // ============ 详情 Modal ============
  const [viewItem, setViewItem] = useState<ContractLedger | null>(null);

  // ============ 核心过滤：只留支出合同 ============
  const filteredData = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return contractLedgers.filter((c) => {
      // 必须是支出合同
      if (c.businessCategory !== 'expense') return false;
      if (kw) {
        const hitNo = c.contractNo.toLowerCase().includes(kw);
        const hitName = (c.contractName || '').toLowerCase().includes(kw);
        const hitCp = (c.counterpartyName || '').toLowerCase().includes(kw);
        if (!hitNo && !hitName && !hitCp) return false;
      }
      if (applied.nature && c.contractNature !== applied.nature) return false;
      if (applied.status && c.status !== applied.status) return false;
      if (applied.archiveStatus && (c.archiveStatus || 'not_started') !== applied.archiveStatus) return false;
      if (applied.dateFrom && (!c.signingDate || c.signingDate < applied.dateFrom)) return false;
      if (applied.dateTo && (!c.signingDate || c.signingDate > applied.dateTo)) return false;
      return true;
    });
  }, [contractLedgers, applied]);

  // ============ 顶部汇总（支出专属）============
  const summary = useMemo(() => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((s, c) => s + (c.amount || 0), 0);
    const totalPaid = filteredData.reduce(
      (s, c) => s + getAutoPaidAmount(c, procurementDemands, biddings), 0,
    );
    const totalSettlement = filteredData.reduce((s, c) => s + (c.settlementAmount || 0), 0);
    const totalUnsettled = totalAmount - totalSettlement;
    const expiringCount = filteredData.filter(
      (c) => c.status === 'active' && isExpiringSoon(c.terminationDate),
    ).length;
    return { total, totalAmount, totalPaid, totalSettlement, totalUnsettled, expiringCount };
  }, [filteredData, procurementDemands, biddings]);

  // ============ 支出专属预警：未结金额 TOP5 ============
  const unsettledTop5 = useMemo(() => {
    return [...filteredData]
      .map((c) => ({ ...c, unsettled: (c.amount || 0) - (c.settlementAmount || 0) }))
      .filter((c) => c.unsettled > 0)
      .sort((a, b) => b.unsettled - a.unsettled)
      .slice(0, 5);
  }, [filteredData]);

  // ============ 支出专属预警：即将到期 TOP5 ============
  const expiringTop5 = useMemo(() => {
    return [...filteredData]
      .filter((c) => c.status === 'active' && c.terminationDate && !isExpired(c.terminationDate))
      .sort((a, b) => (a.terminationDate || '').localeCompare(b.terminationDate || ''))
      .slice(0, 5);
  }, [filteredData]);

  // ============ 辅助 label ============
  const getFormationLabel = (row: ContractLedger) =>
    row.contractNature === 'procurement'
      ? PROCUREMENT_FORMATION_LABELS[row.formation as keyof typeof PROCUREMENT_FORMATION_LABELS] || row.formation
      : NON_PROCUREMENT_FORMATION_LABELS[row.formation as keyof typeof NON_PROCUREMENT_FORMATION_LABELS] || row.formation;

  const getContractTypeLabel = (row: ContractLedger) => {
    if (row.contractNature === 'procurement') {
      return PROCUREMENT_CONTRACT_TYPE_LABELS[row.contractType as keyof typeof PROCUREMENT_CONTRACT_TYPE_LABELS] || row.contractType;
    }
    return NON_PROCUREMENT_CONTRACT_TYPE_LABELS[row.contractType as keyof typeof NON_PROCUREMENT_CONTRACT_TYPE_LABELS] || row.contractType;
  };

  // ============ 列定义（支出视角，22 列）============
  const columns: ColumnDef<ContractLedger>[] = [
    {
      key: 'contractNature', title: '合同性质', width: '72',
      render: (row) => (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
          row.contractNature === 'procurement'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>{row.contractNature === 'procurement' ? '招采类' : '非招采类'}</span>
      ),
    },
    { key: 'contractNo', title: '合同编号', width: '130', render: (row) => row.contractNo || '-' },
    { key: 'contractName', title: '合同名称', render: (row) => <span title={row.contractName} className="block max-w-[200px] truncate">{row.contractName || '-'}</span> },
    { key: 'handlingDepartment', title: '我方-经办部门', width: '100', render: (row) => row.handlingDepartment || '-' },
    { key: 'handler', title: '我方-经办人', width: '80', render: (row) => row.handler || '-' },
    // ⭐ 支出视角：对方 = 供应商
    { key: 'counterpartyName', title: '供应商单位', width: '160', render: (row) => row.counterpartyName || '-' },
    { key: 'counterpartyContact', title: '供应商负责人', width: '90', render: (row) => row.counterpartyContact || '-' },
    { key: 'contractType', title: '合同类型', width: '110', render: (row) => getContractTypeLabel(row) },
    { key: 'formation', title: '合同形成方式', width: '130', render: (row) => getFormationLabel(row) },
    {
      key: 'winningDate', title: '中标时间', width: '100',
      render: (row) => row.contractNature === 'procurement' ? (row.winningDate || '-') : <span className="text-slate-300">-</span>,
    },
    { key: 'signingDate', title: '签订日期', width: '100', render: (row) => row.signingDate || '-' },
    { key: 'effectiveDate', title: '生效日期', width: '100', render: (row) => row.effectiveDate || '-' },
    {
      key: 'terminationDate', title: '终止日期', width: '100',
      render: (row) => {
        if (!row.terminationDate) return '-';
        const classes: string[] = [];
        if (row.status === 'active' && isExpiringSoon(row.terminationDate)) classes.push('text-amber-600 font-medium');
        if (row.status === 'active' && isExpired(row.terminationDate)) classes.push('text-rose-600 font-medium');
        return <span className={classes.join(' ')}>{row.terminationDate}</span>;
      },
    },
    {
      key: 'amount', title: '合同金额(万)', width: '110', align: 'right',
      render: (row) => (row.amount || 0).toLocaleString(),
      footer: (data) => {
        const sum = data.reduce((s, c) => s + (c.amount || 0), 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : "-";
      },
    },
    // ⭐ 支出专属
    {
      key: 'requisitionAmount', title: '采购申请金额(万)', width: '120', align: 'right',
      render: (row) => row.requisitionAmount
        ? (row.requisitionAmount / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : '-',
    },
    {
      key: 'requisitionRatio', title: '采购申请占比(%)', width: '120', align: 'right',
      render: (row) => {
        if (!row.requisitionAmount || row.requisitionAmount <= 0 || !row.amount) return '-';
        return `${((row.amount * 10000) / row.requisitionAmount * 100).toFixed(1)}%`;
      },
    },
    {
      key: 'paidAmount', title: '已支付金额(万)', width: '120', align: 'right',
      render: (row) => getAutoPaidAmount(row as ContractLedger, procurementDemands, biddings).toLocaleString(),
      footer: (data) => {
        const sum = data.reduce((s, c) => s + getAutoPaidAmount(c as ContractLedger, procurementDemands, biddings), 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : "-";
      },
    },
    {
      key: 'settlementAmount', title: '结算金额(万)', width: '110', align: 'right',
      render: (row) => (row.settlementAmount || 0).toLocaleString(),
      footer: (data) => {
        const sum = data.reduce((s, c) => s + (c.settlementAmount || 0), 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : "-";
      },
    },
    // ⭐⭐ 新增派生列
    {
      key: 'unsettled', title: '未结金额(万)', width: '110', align: 'right',
      render: (row) => {
        const v = (row.amount || 0) - (row.settlementAmount || 0);
        if (v <= 0) return <span className="text-emerald-600">已结清</span>;
        return <span className="text-rose-600 font-medium">{v.toLocaleString()}</span>;
      },
      footer: (data) => {
        const sum = data.reduce((s, c) => s + ((c.amount || 0) - (c.settlementAmount || 0)), 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : "-";
      },
    },
    {
      key: 'linkedDemandCount', title: '挂账需求数', width: '90', align: 'center',
      render: (row) => {
        const n = (row.linkedDemandIds || []).length;
        if (n === 0) return <span className="text-slate-300">-</span>;
        return <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs">{n} 条</span>;
      },
    },
    {
      key: 'isModelText', title: '示范文本', width: '80',
      render: (row) => row.isModelText
        ? <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">是</span>
        : <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200">否</span>,
    },
    {
      key: 'status', title: '合同状态', width: '90',
      render: (row) => {
        const m = STATUS_MAP[row.status] || STATUS_MAP.draft;
        return <span className={`inline-block px-2 py-0.5 rounded text-xs ${m.bg} ${m.color}`}>{m.label}</span>;
      },
    },
    // ⭐⭐ 操作列
    {
      key: 'action', title: '操作', width: '120',
      render: (row) => (
        <button
          onClick={() => setViewItem(row)}
          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
        >查看详情</button>
      ),
      footer: '',
    },
  ];

  // ============ 导出 Excel ============
  const handleExport = () => {
    const headers = [
      '合同性质', '合同编号', '合同名称', '我方-经办部门', '我方-经办人',
      '供应商单位', '供应商负责人', '合同类型', '合同形成方式', '中标时间',
      '签订日期', '生效日期', '终止日期', '合同金额(万)', '采购申请金额(万)',
      '采购申请占比(%)', '已支付金额(万)', '结算金额(万)', '未结金额(万)',
      '挂账需求数', '示范文本', '合同状态',
    ];
    const rows = filteredData.map((c) => {
      const unsettled = (c.amount || 0) - (c.settlementAmount || 0);
      const ratio = c.requisitionAmount && c.amount && c.requisitionAmount > 0
        ? `${((c.amount * 10000) / c.requisitionAmount * 100).toFixed(1)}%` : '';
      return [
        c.contractNature === 'procurement' ? '招采类' : '非招采类',
        c.contractNo, c.contractName, c.handlingDepartment || '', c.handler || '',
        c.counterpartyName || '', c.counterpartyContact || '',
        getContractTypeLabel(c), getFormationLabel(c),
        c.contractNature === 'procurement' ? (c.winningDate || '') : '',
        c.signingDate || '', c.effectiveDate || '', c.terminationDate || '',
        c.amount ?? '',
        c.requisitionAmount ? (c.requisitionAmount / 10000).toFixed(2) : '',
        ratio,
        getAutoPaidAmount(c, procurementDemands, biddings),
        c.settlementAmount ?? '',
        unsettled,
        (c.linkedDemandIds || []).length,
        c.isModelText ? '是' : '否',
        STATUS_MAP[c.status]?.label || c.status,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `支出合同台账_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ============================================================
  //                              渲染
  // ============================================================
  return (
    <div className="p-5 space-y-4">
      {/* ===== 页面标题 ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">支出合同台账</h1>
          <p className="text-xs text-slate-500 mt-1">
            采购支出类合同（向供应商付款）· 共 {summary.total} 份 ·
            总金额 ¥{summary.totalAmount.toLocaleString()} 万 ·
            <span className="text-rose-600 font-medium"> 未结 ¥{summary.totalUnsettled.toLocaleString()} 万</span>
          </p>
        </div>
        <PrimaryButton onClick={handleExport}>
          <FileSpreadsheet className="w-4 h-4 mr-1" /> 导出台账
        </PrimaryButton>
      </div>

      {/* ===== 支出专属预警面板 ===== */}
      <div className="grid grid-cols-12 gap-3">
        {/* 汇总卡 */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-3 font-semibold">支出合同汇总</div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">合同总数(份)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">¥{summary.totalAmount.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">合同总金额(万)</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-emerald-600">¥{summary.totalPaid.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">已支付合计(万)</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-rose-600">¥{summary.totalUnsettled.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">未结金额(万)</div>
            </div>
          </div>
        </div>
        {/* 未结金额 TOP5 */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-3 font-semibold">⚠ 未结金额 TOP5（还有钱没结算）</div>
          {unsettledTop5.length === 0 ? (
            <div className="text-center text-[11px] text-emerald-500 py-4">全部已结清 🎉</div>
          ) : (
            <div className="space-y-1.5">
              {unsettledTop5.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-600 truncate max-w-[180px]" title={c.contractName}>
                    <span className="text-rose-500 font-bold mr-1">{i + 1}</span>
                    {c.contractName}
                  </span>
                  <span className="text-rose-600 font-medium">¥{c.unsettled.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 即将到期 TOP5 */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-3 font-semibold">⏰ 即将到期 TOP5（15 天内）</div>
          {expiringTop5.length === 0 ? (
            <div className="text-center text-[11px] text-slate-300 py-4">暂无即将到期的合同</div>
          ) : (
            <div className="space-y-1.5">
              {expiringTop5.map((c, i) => {
                const days = Math.ceil((new Date(c.terminationDate!).getTime() - Date.now()) / 86400000);
                return (
                  <div key={c.id} className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-600 truncate max-w-[180px]" title={c.contractName}>
                      <span className="text-amber-500 font-bold mr-1">{i + 1}</span>
                      {c.contractName}
                    </span>
                    <span className="text-amber-600 font-medium">{days} 天后</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            共 {summary.expiringCount} 份合同即将到期
          </div>
        </div>
      </div>

      {/* ===== 搜索筛选区 ===== */}
      <SearchBar
        onSearch={() => setApplied({
          keyword: filterKeyword.trim(), nature: filterNature, status: filterStatus,
          archiveStatus: filterArchiveStatus, dateFrom: filterDateFrom, dateTo: filterDateTo,
        })}
        onReset={() => {
          setFilterKeyword(''); setFilterNature(''); setFilterStatus('');
          setFilterArchiveStatus(''); setFilterDateFrom(''); setFilterDateTo('');
          setApplied({ keyword: '', nature: '', status: '', archiveStatus: '', dateFrom: '', dateTo: '' });
        }}
      >
        <SearchField label="关键字" placeholder="合同编号/名称/供应商" value={filterKeyword} onChange={setFilterKeyword} />
        <SearchField
          label="合同性质" type="select" value={filterNature} onChange={setFilterNature}
          options={[
            { value: '', label: '全部' },
            { value: 'procurement', label: '招采类' },
            { value: 'non_procurement', label: '非招采类' },
          ]}
        />
        <SearchField
          label="合同状态" type="select" value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'pending', label: '待审批' },
            { value: 'active', label: '执行中' },
            { value: 'expired', label: '已到期' },
            { value: 'terminated', label: '已终止' },
          ]}
        />
        <SearchField
          label="归档情况" type="select" value={filterArchiveStatus} onChange={setFilterArchiveStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'not_started', label: '未归档' },
            { value: 'in_progress', label: '归档中' },
            { value: 'archived', label: '已归档' },
          ]}
        />
        <SearchField label="签订日期起" type="date" value={filterDateFrom} onChange={setFilterDateFrom} />
        <SearchField label="签订日期止" type="date" value={filterDateTo} onChange={setFilterDateTo} />
      </SearchBar>

      {/* ===== 数据表格 ===== */}
      <DataTable
        data={filteredData}
        columns={columns as ColumnDef<ContractLedger>[]}
        rowKey={(row: ContractLedger) => row.id}
        showFooter
      />

      {/* ===== 详情 Modal ===== */}
      {viewItem && (
        <Modal
          open={!!viewItem}
          title="支出合同详情"
          width="max-w-[720px]"
          onClose={() => setViewItem(null)}
          footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        >
          <div className="text-xs space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-x-6 gap-y-2">
              <div><span className="text-slate-400">合同编号：</span><span className="font-mono text-indigo-600">{viewItem.contractNo}</span></div>
              <div><span className="text-slate-400">合同性质：</span>{STATUS_MAP[viewItem.status] ? `${viewItem.contractNature === 'procurement' ? '招采类' : '非招采类'}` : '-'}</div>
              <div className="col-span-2"><span className="text-slate-400">合同名称：</span>{viewItem.contractName}</div>
              <div><span className="text-slate-400">供应商单位：</span>{viewItem.counterpartyName || '-'}</div>
              <div><span className="text-slate-400">供应商负责人：</span>{viewItem.counterpartyContact || '-'}</div>
              <div><span className="text-slate-400">我方经办部门：</span>{viewItem.handlingDepartment || '-'}</div>
              <div><span className="text-slate-400">我方经办人：</span>{viewItem.handler || '-'}</div>
            </div>

            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
              <div className="text-rose-700 font-semibold mb-2">💰 金额（支出专属）</div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div><div className="text-lg font-bold text-slate-800">¥{(viewItem.amount || 0).toLocaleString()}</div><div className="text-[11px] text-slate-400">合同金额(万)</div></div>
                <div><div className="text-lg font-bold text-emerald-600">¥{getAutoPaidAmount(viewItem, procurementDemands, biddings).toLocaleString()}</div><div className="text-[11px] text-slate-400">已支付(万)</div></div>
                <div><div className="text-lg font-bold text-indigo-600">¥{(viewItem.settlementAmount || 0).toLocaleString()}</div><div className="text-[11px] text-slate-400">结算金额(万)</div></div>
                <div><div className={`text-lg font-bold ${(viewItem.amount || 0) - (viewItem.settlementAmount || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>¥{((viewItem.amount || 0) - (viewItem.settlementAmount || 0)).toLocaleString()}</div><div className="text-[11px] text-slate-400">未结金额(万)</div></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div><span className="text-slate-400">签订日期：</span>{viewItem.signingDate || '-'}</div>
              <div><span className="text-slate-400">生效日期：</span>{viewItem.effectiveDate || '-'}</div>
              <div><span className="text-slate-400">终止日期：</span>{viewItem.terminationDate || '-'}</div>
              <div><span className="text-slate-400">挂账需求数：</span>{(viewItem.linkedDemandIds || []).length} 条</div>
              <div><span className="text-slate-400">合同状态：</span>{STATUS_MAP[viewItem.status]?.label || viewItem.status}</div>
              <div><span className="text-slate-400">归档情况：</span>{ARCHIVE_MAP[viewItem.archiveStatus || 'not_started']?.label || '-'}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
