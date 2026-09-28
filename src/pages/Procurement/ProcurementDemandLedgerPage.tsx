import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import * as XLSX from 'xlsx';
import type { ProcurementDemand } from '@/types';

// ========== 标签辅助函数 ==========
function getCategoryLabel(bc?: string, st?: string, dt?: string): string {
  if (bc && st) {
    const bcLabel = bc === 'engineering' ? '工程类' : '非工程类';
    const stLabel = st === 'construction' ? '施工' : st === 'service' ? '服务' : '货物';
    return `${bcLabel} / ${stLabel}`;
  }
  if (dt) {
    const bc2 = dt === 'implementation_project' || dt === 'service_project' ? '工程类' : '非工程类';
    const st2 = dt === 'implementation_project' ? '施工' : dt === 'service_project' ? '服务' : '货物';
    return `${bc2} / ${st2}`;
  }
  return '-';
}
function getModeLabel(mode?: string): string {
  const map: Record<string, string> = { meeting: '会议审批', sign: '签报审批', application: '采购项目申请表' };
  return (mode && map[mode]) || '-';
}
function getProcurementTypeLabel(pt?: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    within_framework: { label: '清单内采购', color: 'text-[#409eff]' },
    outside_framework: { label: '清单外采购', color: 'text-[#e6a23c]' },
    new_supplier: { label: '新增供应商', color: 'text-[#67c23a]' },
  };
  return (pt && map[pt]) || { label: '-', color: '' };
}
function getStatusLabel(s?: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
    pending: { label: '待审批', color: 'bg-amber-100 text-amber-700' },
    confirm_pending: { label: '待立项确认', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '已立项通过', color: 'bg-green-100 text-green-700' },
    confirm_approved: { label: '已立项通过', color: 'bg-green-100 text-green-700' },
    confirm_rejected: { label: '立项已驳回', color: 'bg-rose-100 text-rose-700' },
    changed: { label: '已变更', color: 'bg-purple-100 text-purple-700' },
  };
  return (s && map[s]) || { label: s || '-', color: 'bg-slate-100 text-slate-600' };
}

// 需求类型下拉选项（5 种）
const CATEGORY_OPTIONS = [
  { value: 'engineering__construction', label: '工程类-施工' },
  { value: 'engineering__service', label: '工程类-服务' },
  { value: 'engineering__goods', label: '工程类-货物' },
  { value: 'non_engineering__service', label: '非工程类-服务' },
  { value: 'non_engineering__goods', label: '非工程类-货物' },
];

export default function ProcurementDemandLedgerPage() {
  const { procurementDemands } = useStore();

  // ========== 筛选状态（10 个维度）==========
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterIsThree, setFilterIsThree] = useState(''); // '' | 'true' | 'false'
  const [filterDept, setFilterDept] = useState('');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [filterApplyStart, setFilterApplyStart] = useState('');
  const [filterApplyEnd, setFilterApplyEnd] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterApproveStart, setFilterApproveStart] = useState('');
  const [filterApproveEnd, setFilterApproveEnd] = useState('');
  const [filterProcurementType, setFilterProcurementType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // 已应用筛选（搜索时才生效）
  const [applied, setApplied] = useState<Record<string, string>>({});

  // ========== 重置 ==========
  const handleReset = () => {
    setKeyword(''); setFilterCategory(''); setFilterIsThree('');
    setFilterDept(''); setFilterApplicant('');
    setFilterApplyStart(''); setFilterApplyEnd('');
    setFilterMode(''); setFilterApproveStart(''); setFilterApproveEnd('');
    setFilterProcurementType(''); setFilterStatus('');
    setApplied({});
  };
  const handleSearch = () => {
    setApplied({
      keyword, filterCategory, filterIsThree,
      filterDept, filterApplicant,
      filterApplyStart, filterApplyEnd,
      filterMode, filterApproveStart, filterApproveEnd,
      filterProcurementType, filterStatus,
    });
  };

  // ========== 筛选逻辑 ==========
  const filteredData = useMemo(() => {
    return procurementDemands.filter((d) => {
      const a = applied;
      // 1. 关键字
      if (a.keyword) {
        const kw = a.keyword.toLowerCase();
        const hit = (d.demandNo || '').toLowerCase().includes(kw)
          || (d.projectName || '').toLowerCase().includes(kw)
          || (d.applicant || '').toLowerCase().includes(kw);
        if (!hit) return false;
      }
      // 2. 需求类型
      if (a.filterCategory) {
        const [bc, st] = a.filterCategory.split('__');
        if (d.businessCategory !== bc || d.subType !== st) return false;
      }
      // 3. 三重大
      if (a.filterIsThree === 'true' && !d.isThreeImportant) return false;
      if (a.filterIsThree === 'false' && d.isThreeImportant) return false;
      // 4. 申请部门
      if (a.filterDept && !(d.applicantDept || '').includes(a.filterDept)) return false;
      // 5. 申请人
      if (a.filterApplicant && !(d.applicant || '').includes(a.filterApplicant)) return false;
      // 6. 申请日期范围
      if (a.filterApplyStart && d.applyDate && d.applyDate < a.filterApplyStart) return false;
      if (a.filterApplyEnd && d.applyDate && d.applyDate > a.filterApplyEnd) return false;
      // 7. 立项审批方式
      if (a.filterMode && d.procurementMode !== a.filterMode) return false;
      // 8. 立项审批日期范围
      if (a.filterApproveStart && d.confirmApproveTime && d.confirmApproveTime.slice(0, 10) < a.filterApproveStart) return false;
      if (a.filterApproveEnd && d.confirmApproveTime && d.confirmApproveTime.slice(0, 10) > a.filterApproveEnd) return false;
      // 9. 清单内/外
      if (a.filterProcurementType && d.procurementType !== a.filterProcurementType) return false;
      // 10. 状态
      if (a.filterStatus && d.status !== a.filterStatus) return false;
      return true;
    }).sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  }, [procurementDemands, applied]);

  // ========== 导出 Excel ==========
  const handleExport = () => {
    const HEADERS = ['需求编号', '需求类型', '项目名称', '三重大', '申请部门', '申请人', '申请日期',
      '立项审批方式', '立项审批日期', '不含税审定金额(元)', '清单内/外', '状态', '备注'];
    const rows = filteredData.map((d) => [
      d.demandNo || '',
      getCategoryLabel(d.businessCategory, d.subType, d.demandType),
      d.projectName || '',
      d.isThreeImportant ? '是' : '否',
      d.applicantDept || '',
      d.applicant || '',
      d.applyDate || '',
      getModeLabel(d.procurementMode),
      d.confirmApproveTime?.slice(0, 10) || '',
      d.budgetAudit?.auditAmount ?? '',
      getProcurementTypeLabel(d.procurementType).label,
      getStatusLabel(d.status).label,
      d.remark || '',
    ]);
    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
    ws['!cols'] = [
      { wch: 18 }, { wch: 14 }, { wch: 28 }, { wch: 8 }, { wch: 16 }, { wch: 10 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '招采需求台账');
    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `招采需求台账_${ts}.xlsx`);
  };

  // ========== 表格列（13 列）==========
  const columns: ColumnDef<ProcurementDemand>[] = [
    { key: 'demandNo', title: '需求编号', width: 'w-32' },
    {
      key: 'category',
      title: '需求类型',
      width: 'w-28',
      render: (row) => getCategoryLabel(row.businessCategory, row.subType, row.demandType),
    },
    {
      key: 'projectName',
      title: '项目名称',
      width: 'w-48',
      render: (row) => (
        <span className="text-slate-800" title={row.projectName}>{row.projectName}</span>
      ),
    },
    {
      key: 'isThreeImportant',
      title: '三重大',
      width: 'w-20',
      render: (row) => row.isThreeImportant
        ? <span className="px-1.5 py-0.5 text-[11px] rounded bg-rose-100 text-rose-600 font-medium">是</span>
        : <span className="text-slate-300">—</span>,
    },
    { key: 'applicantDept', title: '申请部门', width: 'w-28' },
    { key: 'applicant', title: '申请人', width: 'w-20' },
    { key: 'applyDate', title: '申请日期', width: 'w-24' },
    {
      key: 'procurementMode',
      title: '立项审批方式',
      width: 'w-28',
      render: (row) => getModeLabel(row.procurementMode),
    },
    {
      key: 'confirmApproveTime',
      title: '立项审批日期',
      width: 'w-28',
      render: (row) => row.confirmApproveTime ? row.confirmApproveTime.slice(0, 10) : '-',
    },
    {
      key: 'budgetAuditAmount',
      title: '不含税审定金额(元)',
      width: 'w-36',
      align: 'right',
      render: (row) => {
        const amt = row.budgetAudit?.auditAmount;
        return amt != null && amt !== undefined ? `¥${amt.toLocaleString()}` : '-';
      },
    },
    {
      key: 'procurementType',
      title: '清单内/外',
      width: 'w-24',
      render: (row) => {
        const t = getProcurementTypeLabel(row.procurementType);
        return <span className={t.color}>{t.label}</span>;
      },
    },
    {
      key: 'status',
      title: '状态',
      width: 'w-24',
      render: (row) => {
        const s = getStatusLabel(row.status);
        return <span className={`px-2 py-0.5 text-[11px] rounded ${s.color}`}>{s.label}</span>;
      },
    },
    { key: 'remark', title: '备注', width: 'w-32', render: (row) => row.remark || '-' },
    {
      key: 'action',
      title: '操作',
      width: 'w-20',
      render: (row) => <TextButton onClick={() => setViewItem(row)}>详情</TextButton>,
    },
  ];

  // ========== 详情 Modal ==========
  const [viewItem, setViewItem] = useState<ProcurementDemand | null>(null);

  return (
    <div className="p-5 space-y-4">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">招采需求台账</h1>
          <p className="text-xs text-slate-500 mt-1">
            汇总展示全部招采需求申请记录，支持多维度筛选和详情查看
            {procurementDemands.length > 0 && (
              <span className="ml-2 text-indigo-600">· 共 {procurementDemands.length} 条记录</span>
            )}
          </p>
        </div>
        <PrimaryButton onClick={handleExport}>📥 导出 Excel（当前筛选结果 {filteredData.length} 条）</PrimaryButton>
      </div>

      {/* ========== 筛选区（10 维）========== */}
      <SearchBar>
        <SearchField label="关键字" placeholder="需求编号/项目名称/申请人" value={keyword} onChange={setKeyword} />
        <SearchField
          label="需求类型"
          type="select"
          value={filterCategory}
          onChange={setFilterCategory}
          options={[{ value: '', label: '全部' }, ...CATEGORY_OPTIONS]}
        />
        <SearchField
          label="三重一大"
          type="select"
          value={filterIsThree}
          onChange={setFilterIsThree}
          options={[
            { value: '', label: '全部' },
            { value: 'true', label: '是' },
            { value: 'false', label: '否' },
          ]}
        />
        <SearchField label="申请部门" placeholder="请输入" value={filterDept} onChange={setFilterDept} />
        <SearchField label="申请人" placeholder="请输入" value={filterApplicant} onChange={setFilterApplicant} />
        {/* 申请日期范围 */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] text-slate-600 font-medium">申请日期</label>
          <div className="flex items-center gap-1">
            <input type="date" className="h-8 px-2 border border-slate-300 rounded text-xs w-[130px]"
              value={filterApplyStart} onChange={(e) => setFilterApplyStart(e.target.value)} />
            <span className="text-slate-400 text-xs">~</span>
            <input type="date" className="h-8 px-2 border border-slate-300 rounded text-xs w-[130px]"
              value={filterApplyEnd} onChange={(e) => setFilterApplyEnd(e.target.value)} />
          </div>
        </div>
        <SearchField
          label="立项审批方式"
          type="select"
          value={filterMode}
          onChange={setFilterMode}
          options={[
            { value: '', label: '全部' },
            { value: 'meeting', label: '会议审批' },
            { value: 'sign', label: '签报审批' },
            { value: 'application', label: '采购项目申请表' },
          ]}
        />
        {/* 立项审批日期范围 */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] text-slate-600 font-medium">立项审批日期</label>
          <div className="flex items-center gap-1">
            <input type="date" className="h-8 px-2 border border-slate-300 rounded text-xs w-[130px]"
              value={filterApproveStart} onChange={(e) => setFilterApproveStart(e.target.value)} />
            <span className="text-slate-400 text-xs">~</span>
            <input type="date" className="h-8 px-2 border border-slate-300 rounded text-xs w-[130px]"
              value={filterApproveEnd} onChange={(e) => setFilterApproveEnd(e.target.value)} />
          </div>
        </div>
        <SearchField
          label="清单内/外"
          type="select"
          value={filterProcurementType}
          onChange={setFilterProcurementType}
          options={[
            { value: '', label: '全部' },
            { value: 'within_framework', label: '清单内采购' },
            { value: 'outside_framework', label: '清单外采购' },
            { value: 'new_supplier', label: '新增供应商' },
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
            { value: 'confirm_pending', label: '待立项确认' },
            { value: 'confirm_approved', label: '已立项通过' },
            { value: 'confirm_rejected', label: '立项已驳回' },
            { value: 'changed', label: '已变更' },
          ]}
        />
        <div className="flex items-end gap-2 ml-auto">
          <DefaultButton onClick={handleReset}>重置</DefaultButton>
          <PrimaryButton onClick={handleSearch}>搜索</PrimaryButton>
        </div>
      </SearchBar>

      {/* ========== 台账表 ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            台账列表
            {Object.keys(applied).some((k) => applied[k]) && (
              <span className="ml-2 text-xs text-indigo-600">
                · 筛选后 {filteredData.length} 条（共 {procurementDemands.length} 条）
              </span>
            )}
          </div>
        </div>
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* ========== 详情 Modal ========== */}
      {viewItem && (
        <Modal
          open={!!viewItem}
          onClose={() => setViewItem(null)}
          title={`招采需求详情 — ${viewItem.demandNo || '未生成编号'}`}
          width="lg"
          footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        >
          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
            {/* 基本信息 */}
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">📋 基本信息</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <DetailRow label="需求编号" value={viewItem.demandNo || '保存后自动生成'} />
                <DetailRow label="需求类型" value={getCategoryLabel(viewItem.businessCategory, viewItem.subType, viewItem.demandType)} />
                <DetailRow label="项目名称" value={viewItem.projectName} />
                <DetailRow label="是否三重大" value={viewItem.isThreeImportant ? '是' : '否'} />
                <DetailRow label="申请部门" value={viewItem.applicantDept} />
                <DetailRow label="申请人" value={viewItem.applicant} />
                <DetailRow label="申请日期" value={viewItem.applyDate} />
                <DetailRow label="状态" value={<StatusBadge s={viewItem.status} />} />
                <DetailRow label="立项审批方式" value={getModeLabel(viewItem.procurementMode)} />
                <DetailRow label="立项审批日期" value={viewItem.confirmApproveTime?.slice(0, 10) || '-'} />
                <DetailRow label="清单内/外" value={
                  (() => { const t = getProcurementTypeLabel(viewItem.procurementType); return <span className={t.color}>{t.label}</span>; })()
                } />
                <DetailRow label="预估金额" value={viewItem.estimatedAmount != null ? `¥${viewItem.estimatedAmount.toLocaleString()}` : '-'} />
                <DetailRow label="不含税审定金额" value={viewItem.budgetAudit?.auditAmount != null ? `¥${viewItem.budgetAudit.auditAmount.toLocaleString()}` : '-'} />
                <DetailRow label="备注" value={viewItem.remark || '-'} full />
              </div>
            </section>

            {/* 项目概况 */}
            {viewItem.reason && (
              <section>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">📝 申请事由</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100">{viewItem.reason}</p>
              </section>
            )}

            {/* 变更历史 */}
            {viewItem.changeHistory && viewItem.changeHistory.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">🔄 变更历史（{viewItem.changeHistory.length} 次）</h3>
                <div className="space-y-2">
                  {viewItem.changeHistory.map((c, i) => (
                    <div key={i} className="text-xs bg-purple-50 p-2 rounded border border-purple-100">
                      <span className="font-medium text-purple-700">{c.changeNo}</span>
                      <span className="text-slate-500 ml-2">{c.changeTime} · {c.changer}</span>
                      <div className="text-slate-600 mt-1">{c.changeReason}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ========== 详情 Modal 内部小组件 ==========
function DetailRow({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={`${full ? 'col-span-2' : ''} flex gap-2`}>
      <span className="text-slate-500 shrink-0 w-24 text-right">{label}：</span>
      <span className="text-slate-800 break-all">{value}</span>
    </div>
  );
}
function StatusBadge({ s }: { s?: string }) {
  const st = getStatusLabel(s);
  return <span className={`px-2 py-0.5 text-[11px] rounded ${st.color}`}>{st.label}</span>;
}
