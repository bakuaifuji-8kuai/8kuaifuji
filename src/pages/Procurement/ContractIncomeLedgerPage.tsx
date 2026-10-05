/**
 * 收入合同台账 — ContractIncomeLedgerPage
 *
 * 业务定位：收入类合同（businessCategory = 'income'）专用台账视图
 * — 与"合同台账"共用同一份 contractLedgers 数据源
 * — 只做前端 filter 隔离，store 不拆分
 *
 * 与合同台账的核心差异：
 *   1. 客户单位列名（收入台账的对方是付费客户）
 *   2. 去掉采购申请金额/采购申请占比/中标时间/挂账需求数（收入不走招采）
 *   3. 新增"已收金额"派生列 = paidAmount
 *   4. 新增"未收金额"派生列 = 合同金额 − 已收金额
 *   5. 顶部预警面板改收入视角：未收金额 TOP5 + 即将到期 TOP5
 */
import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ContractLedger } from '@/types';
import {
  PROCUREMENT_FORMATION_LABELS, NON_PROCUREMENT_FORMATION_LABELS,
  PROCUREMENT_CONTRACT_TYPE_LABELS, NON_PROCUREMENT_CONTRACT_TYPE_LABELS,
} from '@/types';
import { FileSpreadsheet } from 'lucide-react';

// ============ 标签映射 ============
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

export default function ContractIncomeLedgerPage() {
  const contractLedgers = useStore((s) => s.contractLedgers);

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

  // ============ 核心过滤：只留收入合同 ============
  const filteredData = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return contractLedgers.filter((c) => {
      if (c.businessCategory !== 'income' && !c.isSalesContract) return false;
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

  // ============ 派生指标 ============
  const withDerived = useMemo(() => {
    return filteredData.map((c) => {
      const paid = c.paidAmount || 0;
      const uncollected = (c.amount || 0) - paid;
      return { ...c, paid, uncollected };
    });
  }, [filteredData]);

  // ============ 顶部汇总（收入专属）============
  const summary = useMemo(() => {
    const total = withDerived.length;
    const totalAmount = withDerived.reduce((s, c) => s + (c.amount || 0), 0);
    const totalPaid = withDerived.reduce((s, c) => s + c.paid, 0);
    const totalUncollected = withDerived.reduce((s, c) => s + c.uncollected, 0);
    const expiringCount = withDerived.filter(
      (c) => c.status === 'active' && isExpiringSoon(c.terminationDate),
    ).length;
    return { total, totalAmount, totalPaid, totalUncollected, expiringCount };
  }, [withDerived]);

  // ============ 收入专属预警：未收金额 TOP5 ============
  const uncollectedTop5 = useMemo(() => {
    return [...withDerived]
      .filter((c) => c.uncollected > 0)
      .sort((a, b) => b.uncollected - a.uncollected)
      .slice(0, 5);
  }, [withDerived]);

  // ============ 收入专属预警：即将到期 TOP5 ============
  const expiringTop5 = useMemo(() => {
    return [...withDerived]
      .filter((c) => c.status === 'active' && c.terminationDate && !isExpired(c.terminationDate))
      .sort((a, b) => (a.terminationDate || '').localeCompare(b.terminationDate || ''))
      .slice(0, 5);
  }, [withDerived]);

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

  // ============ 列定义（收入视角，19 列）============
  const columns: ColumnDef<(typeof withDerived)[number]>[] = [
    {
      key: 'contractNature', title: '合同性质', width: '72px',
      render: (row) => (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
          row.contractNature === 'procurement'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>{row.contractNature === 'procurement' ? '招采类' : '非招采类'}</span>
      ),
    },
    { key: 'contractNo', title: '合同编号', width: '130px', render: (row) => row.contractNo || '-' },
    { key: 'contractName', title: '合同名称', render: (row) => <span title={row.contractName} className="block max-w-[200px] truncate">{row.contractName || '-'}</span> },
    { key: 'handlingDepartment', title: '我方-经办部门', width: '100px', render: (row) => row.handlingDepartment || '-' },
    { key: 'handler', title: '我方-经办人', width: '80px', render: (row) => row.handler || '-' },
    // ⭐ 收入视角：对方 = 客户
    { key: 'counterpartyName', title: '客户单位', width: '160px', render: (row) => row.counterpartyName || '-' },
    { key: 'counterpartyContact', title: '客户负责人', width: '90px', render: (row) => row.counterpartyContact || '-' },
    { key: 'contractType', title: '合同类型', width: '110px', render: (row) => getContractTypeLabel(row as ContractLedger) },
    { key: 'formation', title: '合同形成方式', width: '130px', render: (row) => getFormationLabel(row as ContractLedger) },
    { key: 'signingDate', title: '签订日期', width: '100px', render: (row) => row.signingDate || '-' },
    { key: 'effectiveDate', title: '生效日期', width: '100px', render: (row) => row.effectiveDate || '-' },
    {
      key: 'terminationDate', title: '终止日期', width: '100px',
      render: (row) => {
        if (!row.terminationDate) return '-';
        const classes: string[] = [];
        if (row.status === 'active' && isExpiringSoon(row.terminationDate)) classes.push('text-amber-600 font-medium');
        if (row.status === 'active' && isExpired(row.terminationDate)) classes.push('text-rose-600 font-medium');
        return <span className={classes.join(' ')}>{row.terminationDate}</span>;
      },
    },
    {
      key: 'amount', title: '合同金额(万)', width: '110px', align: 'right',
      render: (row) => (row.amount || 0).toLocaleString(),
      footer: (data) => {
        const sum = data.reduce((s, c) => s + (c.amount || 0), 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : '-';
      },
    },
    // ⭐⭐ 收入专属派生列
    {
      key: 'paid', title: '已收金额(万)', width: '110px', align: 'right',
      render: (row) => row.paid.toLocaleString(),
      footer: (data) => {
        const sum = data.reduce((s, c) => s + c.paid, 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : '-';
      },
    },
    {
      key: 'uncollected', title: '未收金额(万)', width: '110px', align: 'right',
      render: (row) => {
        const v = row.uncollected;
        if (v <= 0) return <span className="text-emerald-600">已收齐</span>;
        return <span className="text-rose-600 font-medium">{v.toLocaleString()}</span>;
      },
      footer: (data) => {
        const sum = data.reduce((s, c) => s + c.uncollected, 0);
        return sum > 0 ? `合计 ${sum.toLocaleString()}` : '-';
      },
    },
    {
      key: 'isModelText', title: '示范文本', width: '80px',
      render: (row) => row.isModelText
        ? <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">是</span>
        : <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200">否</span>,
    },
    {
      key: 'status', title: '合同状态', width: '90px',
      render: (row) => {
        const m = STATUS_MAP[row.status] || STATUS_MAP.draft;
        return <span className={`inline-block px-2 py-0.5 rounded text-xs ${m.bg} ${m.color}`}>{m.label}</span>;
      },
    },
    {
      key: 'action', title: '操作', width: '120px',
      render: (row) => (
        <button onClick={() => setViewItem(row as ContractLedger)}
          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
        >查看详情</button>
      ),
      footer: '',
    },
  ];

  // ============ 导出 CSV ============
  const handleExport = () => {
    const headers = [
      '合同性质', '合同编号', '合同名称', '我方-经办部门', '我方-经办人',
      '客户单位', '客户负责人', '合同类型', '合同形成方式',
      '签订日期', '生效日期', '终止日期',
      '合同金额(万)', '已收金额(万)', '未收金额(万)',
      '示范文本', '合同状态',
    ];
    const rows = withDerived.map((c) => [
      c.contractNature === 'procurement' ? '招采类' : '非招采类',
      c.contractNo, c.contractName, c.handlingDepartment || '', c.handler || '',
      c.counterpartyName || '', c.counterpartyContact || '',
      getContractTypeLabel(c as ContractLedger), getFormationLabel(c as ContractLedger),
      c.signingDate || '', c.effectiveDate || '', c.terminationDate || '',
      c.amount ?? '', c.paid, c.uncollected,
      c.isModelText ? '是' : '否',
      STATUS_MAP[c.status]?.label || c.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `收入合同台账_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <h1 className="text-xl font-bold text-slate-800">收入合同台账</h1>
          <p className="text-xs text-slate-500 mt-1">
            客户付款类合同 · 共 {summary.total} 份 ·
            合同金额 ¥{summary.totalAmount.toLocaleString()} 万 ·
            已收 ¥{summary.totalPaid.toLocaleString()} 万 ·
            <span className="text-rose-600 font-medium"> 未收 ¥{summary.totalUncollected.toLocaleString()} 万</span>
          </p>
        </div>
        <PrimaryButton onClick={handleExport}>
          <FileSpreadsheet className="w-4 h-4 mr-1" /> 导出台账
        </PrimaryButton>
      </div>

      {/* ===== 收入专属预警面板 ===== */}
      <div className="grid grid-cols-12 gap-3">
        {/* 汇总卡 */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-3 font-semibold">收入合同汇总</div>
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
              <div className="text-[11px] text-slate-400 mt-0.5">已收合计(万)</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-rose-600">¥{summary.totalUncollected.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">未收金额(万)</div>
            </div>
          </div>
        </div>
        {/* 未收金额 TOP5 */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-3 font-semibold">💰 未收金额 TOP5（客户还欠最多）</div>
          {uncollectedTop5.length === 0 ? (
            <div className="text-center text-[11px] text-emerald-500 py-4">全部收齐 🎉</div>
          ) : (
            <div className="space-y-1.5">
              {uncollectedTop5.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-600 truncate max-w-[180px]" title={c.counterpartyName}>
                    <span className="text-rose-500 font-bold mr-1">{i + 1}</span>
                    {c.counterpartyName}
                  </span>
                  <span className="text-rose-600 font-medium">¥{c.uncollected.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 即将到期 TOP5 */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-3 font-semibold">⏰ 即将到期 TOP5（该催尾款了）</div>
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
        <SearchField label="关键字" placeholder="合同编号/名称/客户单位" value={filterKeyword} onChange={setFilterKeyword} />
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
            { value: 'active', label: '执行中' },
            { value: 'expired', label: '已到期' },
            { value: 'terminated', label: '已终止' },
            { value: 'draft', label: '草稿' },
            { value: 'pending', label: '待审批' },
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
        data={withDerived}
        columns={columns as ColumnDef<(typeof withDerived)[number]>[]}
        rowKey={(row: (typeof withDerived)[number]) => row.id}
        showFooter
      />

      {/* ===== 详情 Modal ===== */}
      {viewItem && (
        <Modal
          open={!!viewItem}
          title="收入合同详情"
          width="max-w-[720px]"
          onClose={() => setViewItem(null)}
          footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        >
          <div className="text-xs space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-x-6 gap-y-2">
              <div><span className="text-slate-400">合同编号：</span><span className="font-mono text-indigo-600">{viewItem.contractNo}</span></div>
              <div><span className="text-slate-400">合同性质：</span>{viewItem.contractNature === 'procurement' ? '招采类' : '非招采类'}</div>
              <div className="col-span-2"><span className="text-slate-400">合同名称：</span>{viewItem.contractName}</div>
              <div><span className="text-slate-400">客户单位：</span>{viewItem.counterpartyName || '-'}</div>
              <div><span className="text-slate-400">客户负责人：</span>{viewItem.counterpartyContact || '-'}</div>
              <div><span className="text-slate-400">我方经办部门：</span>{viewItem.handlingDepartment || '-'}</div>
              <div><span className="text-slate-400">我方经办人：</span>{viewItem.handler || '-'}</div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <div className="text-indigo-700 font-semibold mb-2">💰 金额（收入专属）</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><div className="text-lg font-bold text-slate-800">¥{(viewItem.amount || 0).toLocaleString()}</div><div className="text-[11px] text-slate-400">合同金额(万)</div></div>
                <div><div className="text-lg font-bold text-emerald-600">¥{(viewItem.paidAmount || 0).toLocaleString()}</div><div className="text-[11px] text-slate-400">已收金额(万)</div></div>
                <div><div className={`text-lg font-bold ${(viewItem.amount || 0) - (viewItem.paidAmount || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>¥{((viewItem.amount || 0) - (viewItem.paidAmount || 0)).toLocaleString()}</div><div className="text-[11px] text-slate-400">未收金额(万)</div></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div><span className="text-slate-400">签订日期：</span>{viewItem.signingDate || '-'}</div>
              <div><span className="text-slate-400">生效日期：</span>{viewItem.effectiveDate || '-'}</div>
              <div><span className="text-slate-400">终止日期：</span>{viewItem.terminationDate || '-'}</div>
              <div><span className="text-slate-400">合同状态：</span>{STATUS_MAP[viewItem.status]?.label || viewItem.status}</div>
              <div><span className="text-slate-400">归档情况：</span>{ARCHIVE_MAP[viewItem.archiveStatus || 'not_started']?.label || '-'}</div>
              <div><span className="text-slate-400">示范文本：</span>{viewItem.isModelText ? '是' : '否'}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
