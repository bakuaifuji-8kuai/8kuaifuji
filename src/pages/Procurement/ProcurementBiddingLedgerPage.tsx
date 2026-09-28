import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import * as XLSX from 'xlsx';
import type { Bidding } from '@/types';
import { BIDDING_METHOD_LABEL } from '@/types';

// ========== 工具：Demand 左联 ==========
type JoinedRow = Bidding & {
  demand?: {
    id?: string;
    demandNo?: string;
    businessCategory?: string;
    subType?: string;
    projectName?: string;
    isThreeImportant?: boolean;
    applicantDept?: string;
    applicant?: string;
    applyDate?: string;
    procurementMode?: string;
    confirmApproveTime?: string;
    budgetAudit?: { auditAmount?: number };
  } | null;
};

// ========== 标签 ==========
function catLabel(bc?: string, st?: string): string {
  if (!bc) return '-';
  const bcLabel = bc === 'engineering' ? '工程类' : '非工程类';
  const stLabel = st === 'construction' ? '施工' : st === 'service' ? '服务' : '货物';
  return `${bcLabel}-${stLabel}`;
}
function modeLabel(m?: string): string {
  const map: Record<string, string> = { meeting: '会议审批', sign: '签报审批', application: '采购项目申请表' };
  return (m && map[m]) || '-';
}
function statusLabel(s?: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
    submitted: { label: '待审批', color: 'bg-amber-100 text-amber-700' },
    approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
    rejected: { label: '已驳回', color: 'bg-rose-100 text-rose-700' },
  };
  return (s && map[s]) || { label: s || '-', color: 'bg-slate-100 text-slate-600' };
}

export default function ProcurementBiddingLedgerPage() {
  const { biddings, procurementDemands } = useStore();

  // ========== 左联 ==========
  const joined: JoinedRow[] = useMemo(() => {
    return biddings.map((b) => {
      const demand = procurementDemands.find((d) => d.id === b.demandId || d.demandNo === b.demandNo) || null;
      return { ...b, demand };
    });
  }, [biddings, procurementDemands]);

  // ========== 筛选状态（12 维）==========
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterIsThree, setFilterIsThree] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterImplUnit, setFilterImplUnit] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterApplyStart, setFilterApplyStart] = useState('');
  const [filterApplyEnd, setFilterApplyEnd] = useState('');
  const [filterApprovalStart, setFilterApprovalStart] = useState('');
  const [filterApprovalEnd, setFilterApprovalEnd] = useState('');
  const [filterAwardStart, setFilterAwardStart] = useState('');
  const [filterAwardEnd, setFilterAwardEnd] = useState('');
  const [filterIsFailed, setFilterIsFailed] = useState('');
  const [filterHasDispute, setFilterHasDispute] = useState('');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState('');
  const [applied, setApplied] = useState<Record<string, string>>({});

  const handleReset = () => {
    setKeyword(''); setFilterCategory(''); setFilterIsThree('');
    setFilterMethod(''); setFilterImplUnit(''); setFilterAgent('');
    setFilterApplyStart(''); setFilterApplyEnd('');
    setFilterApprovalStart(''); setFilterApprovalEnd('');
    setFilterAwardStart(''); setFilterAwardEnd('');
    setFilterIsFailed(''); setFilterHasDispute(''); setFilterApprovalStatus('');
    setApplied({});
  };
  const handleSearch = () => {
    setApplied({
      keyword, filterCategory, filterIsThree,
      filterMethod, filterImplUnit, filterAgent,
      filterApplyStart, filterApplyEnd,
      filterApprovalStart, filterApprovalEnd,
      filterAwardStart, filterAwardEnd,
      filterIsFailed, filterHasDispute, filterApprovalStatus,
    });
  };

  // ========== 筛选逻辑 ==========
  const filteredData = useMemo(() => {
    return joined.filter((r) => {
      const a = applied;
      const d = r.demand;
      // 1. 关键字：工单编号 / 项目名称 / 中标单位
      if (a.keyword) {
        const kw = a.keyword.toLowerCase();
        const hit = (r.biddingNo || '').toLowerCase().includes(kw)
          || (r.projectName || '').toLowerCase().includes(kw)
          || (r.winningSupplierName || '').toLowerCase().includes(kw);
        if (!hit) return false;
      }
      // 2. 需求类型
      if (a.filterCategory) {
        const [bc, st] = a.filterCategory.split('__');
        if (d?.businessCategory !== bc || d?.subType !== st) return false;
      }
      // 3. 三重大
      if (a.filterIsThree === 'true' && !d?.isThreeImportant) return false;
      if (a.filterIsThree === 'false' && d?.isThreeImportant) return false;
      // 4. 采购方式
      if (a.filterMethod && r.procurementMethod !== a.filterMethod) return false;
      // 5. 实施单位
      if (a.filterImplUnit && !(r.implementationUnit || '').includes(a.filterImplUnit)) return false;
      // 6. 代理机构
      if (a.filterAgent && !(r.agentName || '').includes(a.filterAgent)) return false;
      // 7. 申请日期
      if (a.filterApplyStart && d?.applyDate && d.applyDate < a.filterApplyStart) return false;
      if (a.filterApplyEnd && d?.applyDate && d.applyDate > a.filterApplyEnd) return false;
      // 8. 采购方式审批日期
      if (a.filterApprovalStart && r.procurementApprovalDate && r.procurementApprovalDate.slice(0, 10) < a.filterApprovalStart) return false;
      if (a.filterApprovalEnd && r.procurementApprovalDate && r.procurementApprovalDate.slice(0, 10) > a.filterApprovalEnd) return false;
      // 9. 中标时间
      if (a.filterAwardStart && r.awardTime && r.awardTime.slice(0, 10) < a.filterAwardStart) return false;
      if (a.filterAwardEnd && r.awardTime && r.awardTime.slice(0, 10) > a.filterAwardEnd) return false;
      // 10. 是否流标
      if (a.filterIsFailed === 'true' && !r.isFailed) return false;
      if (a.filterIsFailed === 'false' && r.isFailed) return false;
      // 11. 是否答疑质疑
      if (a.filterHasDispute === '是' && r.hasDispute !== '是') return false;
      if (a.filterHasDispute === '否' && r.hasDispute !== '否') return false;
      // 12. 审批状态
      if (a.filterApprovalStatus && r.approvalStatus !== a.filterApprovalStatus) return false;
      return true;
    }).sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  }, [joined, applied]);

  // ========== 导出 Excel ==========
  const handleExport = () => {
    const HEADERS = [
      '编号', '项目名称', '采购方式',
      '需求类型', '三重一大', '申请部门', '申请人', '申请日期', '立项审批方式', '立项审批日期', '不含税审定金额(元)',
      '采购方式审批', '方式审批日期', '招标人', '招采实施单位', '项目实施单位', '招标代理', '业务代表',
      '答疑/质疑', '流标', '委派业主评委',
      '中标单位', '中标法人', '中标得分',
      '未中标单位1', '未中标法人1', '未中1得分',
      '未中标单位2', '未中标法人2', '未中2得分',
      '审批状态',
    ];
    const rows = filteredData.map((r) => {
      const d = r.demand;
      const ss = statusLabel(r.approvalStatus);
      return [
        r.biddingNo,
        r.projectName || '',
        r.procurementMethod ? BIDDING_METHOD_LABEL[r.procurementMethod] : '',
        catLabel(d?.businessCategory, d?.subType),
        d?.isThreeImportant ? '是' : '否',
        d?.applicantDept || '',
        d?.applicant || '',
        d?.applyDate || '',
        modeLabel(d?.procurementMode),
        d?.confirmApproveTime?.slice(0, 10) || '',
        d?.budgetAudit?.auditAmount ?? '',
        r.procurementApprovalMethod || '',
        r.procurementApprovalDate?.slice(0, 10) || '',
        r.tenderer || '',
        r.implementationUnit || '',
        r.projectImplementationUnit || '',
        r.agentName || '',
        r.ownerRepresentative || '',
        r.hasDispute || '',
        r.isFailed ? '是' : '否',
        r.hasOwnerJudge ? '是' : '否',
        r.winningSupplierName || '',
        r.winningSupplierLegalPerson || '',
        r.winningSupplierScore ?? '',
        r.losingSupplier1Name || '',
        r.losingSupplier1LegalPerson || '',
        r.losingSupplier1Score ?? '',
        r.losingSupplier2Name || '',
        r.losingSupplier2LegalPerson || '',
        r.losingSupplier2Score ?? '',
        ss.label,
      ];
    });
    const aoa = [HEADERS, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // 列宽
    ws['!cols'] = [
      { wch: 14 }, { wch: 24 }, { wch: 18 },
      { wch: 14 }, { wch: 8 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 },
      { wch: 10 }, { wch: 8 }, { wch: 12 },
      { wch: 20 }, { wch: 14 }, { wch: 10 },
      { wch: 20 }, { wch: 14 }, { wch: 10 },
      { wch: 20 }, { wch: 14 }, { wch: 10 },
      { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '招采执行台账');
    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `招采执行台账_${ts}.xlsx`);
  };

  // ========== 详情 ==========
  const [viewItem, setViewItem] = useState<JoinedRow | null>(null);

  // ========== 渲染 ==========
  return (
    <div className="p-5 space-y-4">
      {/* 头部 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">招采执行台账</h1>
          <p className="text-xs text-slate-500 mt-1">
            以招采执行工单为主表，关联采购需求信息，全链路展示 {biddings.length} 条记录
          </p>
        </div>
        <PrimaryButton onClick={handleExport}>📥 导出 Excel（当前筛选结果 {filteredData.length} 条）</PrimaryButton>
      </div>

      {/* ========== 筛选区（12 维）========== */}
      <SearchBar>
        <SearchField label="关键字" placeholder="编号/项目名称/中标单位" value={keyword} onChange={setKeyword} />
        <SearchField
          label="需求类型"
          type="select"
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: '', label: '全部' },
            { value: 'engineering__construction', label: '工程类-施工' },
            { value: 'engineering__service', label: '工程类-服务' },
            { value: 'engineering__goods', label: '工程类-货物' },
            { value: 'non_engineering__service', label: '非工程类-服务' },
            { value: 'non_engineering__goods', label: '非工程类-货物' },
          ]}
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
        <SearchField
          label="采购方式"
          type="select"
          value={filterMethod}
          onChange={setFilterMethod}
          options={[
            { value: '', label: '全部' },
            ...Object.entries(BIDDING_METHOD_LABEL).map(([v, l]) => ({ value: v, label: l })),
          ]}
        />
        <SearchField label="实施单位" placeholder="招采实施单位" value={filterImplUnit} onChange={setFilterImplUnit} />
        <SearchField label="代理机构" placeholder="招标代理机构" value={filterAgent} onChange={setFilterAgent} />
        {/* 申请日期范围 */}
        <DateRangeField label="申请日期" start={filterApplyStart} end={filterApplyEnd}
          onStart={setFilterApplyStart} onEnd={setFilterApplyEnd} />
        {/* 采购方式审批日期范围 */}
        <DateRangeField label="方式审批日期" start={filterApprovalStart} end={filterApprovalEnd}
          onStart={setFilterApprovalStart} onEnd={setFilterApprovalEnd} />
        {/* 中标时间范围 */}
        <DateRangeField label="中标时间" start={filterAwardStart} end={filterAwardEnd}
          onStart={setFilterAwardStart} onEnd={setFilterAwardEnd} />
        <SearchField
          label="是否流标"
          type="select"
          value={filterIsFailed}
          onChange={setFilterIsFailed}
          options={[
            { value: '', label: '全部' },
            { value: 'true', label: '是' },
            { value: 'false', label: '否' },
          ]}
        />
        <SearchField
          label="答疑/质疑"
          type="select"
          value={filterHasDispute}
          onChange={setFilterHasDispute}
          options={[
            { value: '', label: '全部' },
            { value: '是', label: '是' },
            { value: '否', label: '否' },
          ]}
        />
        <SearchField
          label="审批状态"
          type="select"
          value={filterApprovalStatus}
          onChange={setFilterApprovalStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'submitted', label: '待审批' },
            { value: 'approved', label: '已通过' },
            { value: 'rejected', label: '已驳回' },
          ]}
        />
        <div className="flex items-end gap-2 ml-auto">
          <DefaultButton onClick={handleReset}>重置</DefaultButton>
          <PrimaryButton onClick={handleSearch}>搜索</PrimaryButton>
        </div>
      </SearchBar>

        {/* ========== 27 列表格：colgroup 控宽 + sticky 左侧/右侧关键列 ========== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>共 {filteredData.length} 条（全量 {biddings.length} 条）· 横向滚动查看全部 30 列</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse" style={{ minWidth: 2920 }}>
              <colgroup>
                {/* sticky 左侧 3 列 — 总宽 460px */}
                <col style={{ width: 110 }} />  {/* 编号 */}
                <col style={{ width: 200 }} />  {/* 项目名称 */}
                <col style={{ width: 150 }} />  {/* 采购方式 */}
                {/* 需求字段 8 列 — 总宽 720px */}
                <col style={{ width: 90 }} />   {/* 需求类型 */}
                <col style={{ width: 80 }} />   {/* 三重一大 */}
                <col style={{ width: 100 }} />  {/* 申请部门 */}
                <col style={{ width: 80 }} />   {/* 申请人 */}
                <col style={{ width: 90 }} />   {/* 申请日期 */}
                <col style={{ width: 100 }} />  {/* 立项审批方式 */}
                <col style={{ width: 90 }} />   {/* 立项审批日期 */}
                <col style={{ width: 110 }} />  {/* 不含税审定 */}
                {/* 执行字段 19 列 — 总宽 1720px */}
                <col style={{ width: 100 }} />  {/* 采购方式审批 */}
                <col style={{ width: 90 }} />   {/* 方式审批日期 */}
                <col style={{ width: 90 }} />   {/* 招标人 */}
                <col style={{ width: 110 }} />  {/* 招采实施单位 */}
                <col style={{ width: 110 }} />  {/* 项目实施单位 */}
                <col style={{ width: 100 }} />  {/* 招标代理 */}
                <col style={{ width: 80 }} />   {/* 业务代表 */}
                <col style={{ width: 70 }} />   {/* 答疑/质疑 */}
                <col style={{ width: 60 }} />   {/* 流标 */}
                <col style={{ width: 80 }} />   {/* 委派业主评委 */}
                <col style={{ width: 150 }} />  {/* 中标单位 */}
                <col style={{ width: 100 }} />  {/* 中标法人 */}
                <col style={{ width: 70 }} />   {/* 中标得分 */}
                <col style={{ width: 130 }} />  {/* 未中标1/法人 */}
                <col style={{ width: 70 }} />   {/* 未中1得分 */}
                <col style={{ width: 110 }} />  {/* 未中标2/法人 */}
                <col style={{ width: 70 }} />   {/* 未中2得分 */}
                <col style={{ width: 80 }} />   {/* 审批状态 */}
                <col style={{ width: 60 }} />   {/* 操作 */}
              </colgroup>
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
                <tr>
                  {/* ===== Sticky 左侧关键列（shadow 分隔线）===== */}
                  <Th className="sticky left-0 bg-slate-100 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">编号</Th>
                  <Th className="sticky left-[110px] bg-slate-100 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">项目名称</Th>
                  <Th className="sticky left-[310px] bg-slate-100 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">采购方式</Th>

                  {/* ===== 需求字段（9 列）===== */}
                  <Th>需求类型</Th>
                  <Th className="text-center">三重一大</Th>
                  <Th>申请部门</Th>
                  <Th>申请人</Th>
                  <Th>申请日期</Th>
                  <Th>立项审批方式</Th>
                  <Th>立项审批日期</Th>
                  <Th align="right">不含税审定(元)</Th>

                  {/* ===== 执行字段（18 列）===== */}
                  <Th>采购方式审批</Th>
                  <Th>方式审批日期</Th>
                  <Th>招标人</Th>
                  <Th>招采实施单位</Th>
                  <Th>项目实施单位</Th>
                  <Th>招标代理</Th>
                  <Th>业务代表</Th>
                  <Th className="text-center">答疑/质疑</Th>
                  <Th className="text-center">流标</Th>
                  <Th className="text-center">委派业主评委</Th>
                  <Th>中标单位</Th>
                  <Th>中标法人</Th>
                  <Th align="right">中标得分</Th>
                  <Th>未中标1/法人</Th>
                  <Th align="right">未中1得分</Th>
                  <Th>未中标2/法人</Th>
                  <Th align="right">未中2得分</Th>
                  <Th className="text-center">审批状态</Th>
                  <Th className="text-center sticky right-0 bg-slate-100 z-20 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">操作</Th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={30} className="py-10 text-center text-slate-400">暂无数据</td>
                  </tr>
                )}
                {filteredData.map((r) => {
                  const d = r.demand;
                  const ss = statusLabel(r.approvalStatus);
                  return (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-indigo-50/40 transition-colors">
                      {/* Sticky 左侧 */}
                      <Td className="sticky left-0 bg-white z-10 font-mono text-slate-700">{r.biddingNo}</Td>
                      <Td className="sticky left-[110px] bg-white z-10">{r.projectName || '-'}</Td>
                      <Td className="sticky left-[310px] bg-white z-10">{r.procurementMethod ? BIDDING_METHOD_LABEL[r.procurementMethod] : '-'}</Td>

                      {/* 需求字段 */}
                      <Td>{catLabel(d?.businessCategory, d?.subType)}</Td>
                      <Td className="text-center">{d?.isThreeImportant ? <Tag c="rose">是</Tag> : <span className="text-slate-300">—</span>}</Td>
                      <Td>{d?.applicantDept || '-'}</Td>
                      <Td>{d?.applicant || '-'}</Td>
                      <Td className="font-mono">{d?.applyDate || '-'}</Td>
                      <Td>{modeLabel(d?.procurementMode)}</Td>
                      <Td className="font-mono">{d?.confirmApproveTime?.slice(0, 10) || '-'}</Td>
                      <Td align="right" className="font-mono">{d?.budgetAudit?.auditAmount != null ? `¥${d.budgetAudit.auditAmount.toLocaleString()}` : '-'}</Td>

                      {/* 执行字段 */}
                      <Td>{r.procurementApprovalMethod || '-'}</Td>
                      <Td className="font-mono">{r.procurementApprovalDate?.slice(0, 10) || '-'}</Td>
                      <Td>{r.tenderer || '-'}</Td>
                      <Td>{r.implementationUnit || '-'}</Td>
                      <Td>{r.projectImplementationUnit || '-'}</Td>
                      <Td>{r.agentName || '-'}</Td>
                      <Td>{r.ownerRepresentative || '-'}</Td>
                      <Td className="text-center">{r.hasDispute || '-'}</Td>
                      <Td className="text-center">{r.isFailed ? <Tag c="rose">是</Tag> : <span className="text-slate-300">—</span>}</Td>
                      <Td className="text-center">{r.hasOwnerJudge ? <Tag c="indigo">是</Tag> : <span className="text-slate-300">—</span>}</Td>
                      <Td>{r.winningSupplierName || '-'}</Td>
                      <Td>{r.winningSupplierLegalPerson || '-'}</Td>
                      <Td align="right" className="font-mono">{r.winningSupplierScore != null ? r.winningSupplierScore : '-'}</Td>
                      <Td>
                        {r.losingSupplier1Name
                          ? <span>{r.losingSupplier1Name}{r.losingSupplier1LegalPerson ? <span className="text-slate-400"> / </span> : ''}{r.losingSupplier1LegalPerson}</span>
                          : '-'}
                      </Td>
                      <Td align="right" className="font-mono">{r.losingSupplier1Score != null ? r.losingSupplier1Score : '-'}</Td>
                      <Td>
                        {r.losingSupplier2Name
                          ? <span>{r.losingSupplier2Name}{r.losingSupplier2LegalPerson ? <span className="text-slate-400"> / </span> : ''}{r.losingSupplier2LegalPerson}</span>
                          : '-'}
                      </Td>
                      <Td align="right" className="font-mono">{r.losingSupplier2Score != null ? r.losingSupplier2Score : '-'}</Td>
                      <Td className="text-center"><span className={`px-1.5 py-0.5 rounded text-[11px] ${ss.color}`}>{ss.label}</span></Td>
                      {/* sticky 右侧 */}
                      <Td className="text-center sticky right-0 bg-white z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        <TextButton onClick={() => setViewItem(r)}>详情</TextButton>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* ========== 详情 Modal ========== */}
      {viewItem && (
        <Modal
          open={!!viewItem}
          onClose={() => setViewItem(null)}
          title={`招采执行详情 — ${viewItem.biddingNo || viewItem.id}`}
          width="lg"
          footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        >
          <BiddingDetailContent row={viewItem} />
        </Modal>
      )}
    </div>
  );
}

// ========== 小组件 ==========
function Th({ children, className = '', align }: any) {
  return (
    <th className={`px-2 py-2 text-left font-medium border-b border-slate-200 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''} ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = '', align }: any) {
  return (
    <td className={`px-2 py-1.5 border-b border-slate-100 text-slate-700 whitespace-nowrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''} ${className}`}>
      {children}
    </td>
  );
}
function Tag({ children, c = 'slate' }: any) {
  const map: Record<string, string> = {
    rose: 'bg-rose-100 text-rose-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`px-1.5 py-0.5 rounded text-[11px] ${map[c] || map.slate}`}>{children}</span>;
}
function DateRangeField({ label, start, end, onStart, onEnd }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] text-slate-600 font-medium">{label}</label>
      <div className="flex items-center gap-1">
        <input type="date" className="h-8 px-2 border border-slate-300 rounded text-xs w-[130px]" value={start} onChange={(e) => onStart(e.target.value)} />
        <span className="text-slate-400 text-xs">~</span>
        <input type="date" className="h-8 px-2 border border-slate-300 rounded text-xs w-[130px]" value={end} onChange={(e) => onEnd(e.target.value)} />
      </div>
    </div>
  );
}
function DetailRow({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={`${full ? 'col-span-2' : ''} flex gap-2 text-sm`}>
      <span className="text-slate-500 shrink-0 w-28 text-right">{label}：</span>
      <span className="text-slate-800 break-all">{value || '-'}</span>
    </div>
  );
}
function BiddingDetailContent({ row }: { row: JoinedRow }) {
  const d = row.demand;
  const ss = statusLabel(row.approvalStatus);
  return (
    <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">📋 执行工单基本信息</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <DetailRow label="编号" value={row.biddingNo} />
          <DetailRow label="审批状态" value={<span className={`px-2 py-0.5 rounded text-[11px] ${ss.color}`}>{ss.label}</span>} />
          <DetailRow label="项目名称" value={row.projectName} full />
          <DetailRow label="采购方式" value={row.procurementMethod ? BIDDING_METHOD_LABEL[row.procurementMethod] : '-'} />
          <DetailRow label="采购方式审批" value={row.procurementApprovalMethod} />
          <DetailRow label="方式审批日期" value={row.procurementApprovalDate?.slice(0, 10)} />
          <DetailRow label="招标人" value={row.tenderer} />
          <DetailRow label="招采实施单位" value={row.implementationUnit} />
          <DetailRow label="项目实施单位" value={row.projectImplementationUnit} />
          <DetailRow label="招标代理机构" value={row.agentName} />
          <DetailRow label="业务代表/业主评委" value={`${row.ownerRepresentative || '-'}${row.hasOwnerJudge ? ' · 委派' : ''}`} />
          <DetailRow label="中标时间" value={row.awardTime?.slice(0, 10)} />
          <DetailRow label="中标金额(元)" value={row.contractAmount != null ? `¥${row.contractAmount.toLocaleString()}` : '-'} />
          <DetailRow label="是否答疑/质疑/投诉" value={row.hasDispute || '-'} />
          <DetailRow label="是否流标" value={row.isFailed ? '是' : '否'} />
        </div>
      </section>

      {/* 中标信息 */}
      {(row.winningSupplierName || row.losingSupplier1Name) && (
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">🏆 中标与未中标供应商</h3>
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-3 py-1.5 text-left">角色</th><th className="px-3 py-1.5 text-left">单位</th><th className="px-3 py-1.5 text-left">法人</th><th className="px-3 py-1.5 text-right">得分</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-rose-600 font-medium">中标</td>
                  <td className="px-3 py-1.5">{row.winningSupplierName || '-'}</td>
                  <td className="px-3 py-1.5">{row.winningSupplierLegalPerson || '-'}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{row.winningSupplierScore ?? '-'}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-slate-500">未中标 1</td>
                  <td className="px-3 py-1.5">{row.losingSupplier1Name || '-'}</td>
                  <td className="px-3 py-1.5">{row.losingSupplier1LegalPerson || '-'}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{row.losingSupplier1Score ?? '-'}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-slate-500">未中标 2</td>
                  <td className="px-3 py-1.5">{row.losingSupplier2Name || '-'}</td>
                  <td className="px-3 py-1.5">{row.losingSupplier2LegalPerson || '-'}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{row.losingSupplier2Score ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 关联需求 */}
      {d && (
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">🔗 关联采购需求</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <DetailRow label="需求编号" value={d.demandNo} />
            <DetailRow label="需求类型" value={catLabel(d.businessCategory, d.subType)} />
            <DetailRow label="项目名称" value={d.projectName} full />
            <DetailRow label="三重一大" value={d.isThreeImportant ? '是' : '否'} />
            <DetailRow label="申请部门" value={d.applicantDept} />
            <DetailRow label="申请人" value={d.applicant} />
            <DetailRow label="申请日期" value={d.applyDate} />
            <DetailRow label="立项审批方式" value={modeLabel(d.procurementMode)} />
            <DetailRow label="立项审批日期" value={d.confirmApproveTime?.slice(0, 10)} />
            <DetailRow label="不含税审定金额" value={d.budgetAudit?.auditAmount != null ? `¥${d.budgetAudit.auditAmount.toLocaleString()}` : '-'} />
          </div>
        </section>
      )}
    </div>
  );
}
