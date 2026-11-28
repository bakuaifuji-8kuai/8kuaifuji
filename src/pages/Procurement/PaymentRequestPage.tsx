import { useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { PROCUREMENT_HELP } from '@/constants/procurementHelp';
import type {
  PaymentRequest,
  PaymentRequestStatus,
  PaymentAttachment,
  PaymentAttachmentType,
  Attachment,
  ContractLedger,
  SupplierAgent,
} from '@/types';
import {
  PAYMENT_REQUEST_STATUS_LABELS,
  PAYMENT_ATTACHMENT_TYPE_LABELS,
  NON_PROCUREMENT_FORMATION_LABELS,
  NON_PROCUREMENT_CONTRACT_TYPE_LABELS,
} from '@/types';

/**
 * 付款申请（招采及合约管理 > 顶层菜单）
 *
 * 业务规则（一切数据皆有源）：
 * 1. 只能选「自办展/合办展合同 + 形成方式=代理合同」的合同进行付款（收款方=代理商档案）
 * 2. 对方单位信息（名称/地址/联系人/电话）与收款账户（开户行/银行账号）从代理商档案自动带出，留存快照
 * 3. 本次申请付款 = 合同金额 × 付款比例%（自动计算，不可手改金额）
 * 4. 累计申请付款 = 该合同全部已提交（待审批+已通过）申请之和（草稿不计入）
 * 5. 校验：累计申请比例不得超过 100%
 * 6. 审批流：草稿 → 提交待审批 → 通过/驳回（与合同归档审批模式一致）
 *
 * ⚠️ 本为 COS 静态演示原型：数据保存在浏览器 localStorage，仅同浏览器同源演示。
 */
const EXPENSE_DEPARTMENTS = ['展览部', '市场部', '宣传部', '活动部', '行政部', '技术部', '工程部', '招商部', '采购部', '财务部'];

const STATUS_BADGE: Record<PaymentRequestStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const fmt = (v?: number) => (v == null ? '-' : `¥${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

export default function PaymentRequestPage() {
  const paymentRequests = useStore((s) => s.paymentRequests);
  const addPaymentRequest = useStore((s) => s.addPaymentRequest);
  const updatePaymentRequest = useStore((s) => s.updatePaymentRequest);
  const deletePaymentRequest = useStore((s) => s.deletePaymentRequest);
  const contractLedgers = useStore((s) => s.contractLedgers);
  const supplierAgents = useStore((s) => s.supplierAgents);
  const currentUser = useStore((s) => s.currentUser);

  // ========== 可付款合同：自办展/合办展 + 形成方式=代理合同 + 已生效（approved/active）==========
  const payableContracts = useMemo(() => {
    return contractLedgers.filter(
      (c) =>
        c.contractNature === 'non_procurement' &&
        (c.contractType === 'self_host' || c.contractType === 'joint_host') &&
        c.formation === 'agency_contract' &&
        (c.status === 'approved' || c.status === 'active'),
    );
  }, [contractLedgers]);

  const contractOptions = [
    { value: '', label: '-- 请选择代理合同（自办展/合办展 + 代理合同）--' },
    ...payableContracts.map((c) => ({
      value: c.id,
      label: `${c.contractNo} · ${c.contractName}（${fmt(c.amount)}）`,
    })),
  ];

  // ========== 搜索筛选（字段尽量多：应用式） ==========
  const [f, setF] = useState({
    paymentNo: '', contractKw: '', contractType: '', agentKw: '',
    expenseDepartment: '', status: '',
    dateFrom: '', dateTo: '', amountMin: '', amountMax: '',
  });
  const [applied, setApplied] = useState<typeof f>({
    paymentNo: '', contractKw: '', contractType: '', agentKw: '',
    expenseDepartment: '', status: '',
    dateFrom: '', dateTo: '', amountMin: '', amountMax: '',
  });

  const filteredData = useMemo(() => {
    return [...paymentRequests]
      .sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
      .filter((r) => {
        if (applied.paymentNo && !r.paymentNo.toLowerCase().includes(applied.paymentNo.toLowerCase())) return false;
        if (applied.contractKw) {
          const kw = applied.contractKw.toLowerCase();
          const hit = r.contractNo?.toLowerCase().includes(kw) || r.contractName?.toLowerCase().includes(kw);
          if (!hit) return false;
        }
        if (applied.contractType && r.contractType !== applied.contractType) return false;
        if (applied.agentKw && !(r.counterpartyName || '').includes(applied.agentKw)) return false;
        if (applied.expenseDepartment && r.expenseDepartment !== applied.expenseDepartment) return false;
        if (applied.status && r.status !== applied.status) return false;
        const ct = (r.createTime || '').slice(0, 10);
        if (applied.dateFrom && ct < applied.dateFrom) return false;
        if (applied.dateTo && ct > applied.dateTo) return false;
        if (applied.amountMin && (r.requestAmount || 0) < Number(applied.amountMin)) return false;
        if (applied.amountMax && (r.requestAmount || 0) > Number(applied.amountMax)) return false;
        return true;
      });
  }, [paymentRequests, applied]);

  // ========== 弹窗 ==========
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentRequest | null>(null);
  const [form, setForm] = useState<Partial<PaymentRequest>>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  const update = (patch: Partial<PaymentRequest>) => setForm((p) => ({ ...p, ...patch }));

  /** 该合同「已提交」申请的累计金额/比例（待审批+已通过；草稿不计；编辑时排除本单自身） */
  const committedTotals = (contractId: string, excludeId?: string) => {
    const list = paymentRequests.filter(
      (r) => r.contractId === contractId && r.id !== excludeId && (r.status === 'pending' || r.status === 'approved'),
    );
    return {
      amount: list.reduce((s, r) => s + (r.requestAmount || 0), 0),
      percent: list.reduce((s, r) => s + (r.paidPercent || 0), 0),
    };
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ paidPercent: undefined });
    setModalOpen(true);
  };

  const openEdit = (row: PaymentRequest) => {
    if (row.status !== 'draft') { alert('只有草稿状态的付款申请可以编辑！'); return; }
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  /** 选择代理合同 → 自动带出合同信息 + 对方单位（代理商）信息 + 收款账户 */
  const handleContractChange = (cid: string) => {
    const c = payableContracts.find((x) => x.id === cid);
    if (!cid || !c) {
      update({ contractId: '', contractNo: '', contractName: '', contractAmount: undefined, counterpartyName: '', summary: '' });
      return;
    }
    // 对方单位 = 代理商档案（代理合同的 supplierId 存代理商档案 ID）
    const agent = supplierAgents.find((a) => a.id === (c as any).supplierId);
    update({
      contractId: c.id,
      contractNo: c.contractNo,
      contractName: c.contractName,
      contractType: c.contractType,
      formation: c.formation,
      agentId: agent?.id,
      counterpartyName: agent?.name || c.counterpartyName || '',
      counterpartyAddress: agent?.address || '',
      counterpartyContact: agent?.contact || c.counterpartyContact || '',
      counterpartyPhone: agent?.phone || '',
      bankName: agent?.bankName || '',
      bankAccountNo: agent?.bankAccountNo || '',
      contractAmount: c.amount,
      summary: c.mainContent || '',
      // 切换合同后清掉金额相关（重新填比例）
      paidPercent: undefined,
      requestAmount: undefined,
    });
  };

  /** 付款比例变化 → 本次申请付款自动计算（= 合同金额 × 比例%） */
  const handlePercentChange = (v: string) => {
    const percent = v === '' ? undefined : Number(v);
    const amount = percent != null && form.contractAmount ? Math.round(form.contractAmount * percent) / 100 : undefined;
    update({ paidPercent: percent, requestAmount: amount });
  };

  // ========== 付款说明材料上传（附件字段） ==========
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: PaymentAttachmentType) => {
    const files = e.target.files;
    if (!files) return;
    const cur = form.attachments || [];
    if (cur.length + files.length > 5) {
      alert('付款说明材料最多上传 5 个文件！');
      return;
    }
    const added: PaymentAttachment[] = Array.from(files).map((file) => ({
      type,
      file: {
        id: 'ATT' + Date.now() + Math.random().toString(36).slice(2, 6),
        fileName: file.name,
        filePath: URL.createObjectURL(file),
        fileSize: file.size,
        fileType: file.type,
        uploadTime: new Date().toISOString().slice(0, 19),
      } as Attachment,
    }));
    update({ attachments: [...(form.attachments || []), ...added] });
    e.target.value = '';
  };

  const removeAttachment = (fileId: string) => {
    update({ attachments: (form.attachments || []).filter((a) => a.file.id !== fileId) });
  };

  const fmtSize = (bytes: number) => (bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB');

  // ========== 保存（草稿 / 提交审批） ==========
  const save = (submit: boolean) => {
    if (!form.contractId) { alert('请选择代理合同！'); return; }
    if (form.paidPercent == null || form.paidPercent <= 0) { alert('请填写本次付款比例（%），必须大于 0！'); return; }
    const totals = committedTotals(form.contractId, editing?.id);
    if (totals.percent + (form.paidPercent || 0) > 100) {
      alert(`累计申请比例超限：该合同已提交申请合计 ${totals.percent}%，本次 ${form.paidPercent}%，合计超过 100%！`);
      return;
    }
    if (submit && (form.attachments || []).length === 0) {
      if (!confirm('提交审批前建议上传付款说明材料（付款条件、进度确认单等），确定不上传直接提交吗？')) return;
    }
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const totalsWithThis = totals.amount + (form.requestAmount || 0);

    const finalForm: Partial<PaymentRequest> = {
      ...form,
      totalAppliedAmount: totalsWithThis,
      status: submit ? 'pending' : 'draft',
    };

    if (editing) {
      updatePaymentRequest(editing.id, finalForm);
    } else {
      const existingNos = paymentRequests.map((r) => r.paymentNo).filter(Boolean);
      const autoNo = genSerialNo(SERIAL_CONFIG.PAYMENT, existingNos);
      addPaymentRequest({
        ...(finalForm as PaymentRequest),
        id: 'PR' + Date.now() + Math.random().toString(36).slice(2, 6),
        paymentNo: autoNo,
        applicant: currentUser?.name || '测试用户',
        createTime: now,
      });
    }
    setModalOpen(false);
  };

  // ========== 审批（通过/驳回） ==========
  const [approveModal, setApproveModal] = useState<PaymentRequest | null>(null);
  const [approveAction, setApproveAction] = useState<'approved' | 'rejected'>('approved');
  const [approveRemark, setApproveRemark] = useState('');

  const openApprove = (row: PaymentRequest, action: 'approved' | 'rejected') => {
    setApproveAction(action);
    setApproveRemark('');
    setApproveModal(row);
  };

  const doApprove = () => {
    if (!approveModal) return;
    if (approveAction === 'rejected' && !approveRemark.trim()) { alert('驳回时请填写审批意见！'); return; }
    updatePaymentRequest(approveModal.id, {
      status: approveAction,
      approver: currentUser?.name || '财务主管',
      approveTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      approveRemark: approveRemark || undefined,
    });
    setApproveModal(null);
  };

  const handleDelete = (row: PaymentRequest) => {
    if (row.status === 'pending' || row.status === 'approved') {
      alert('待审批/已通过的付款申请不能删除！');
      return;
    }
    if (confirm(`确定删除付款申请「${row.paymentNo}」吗？`)) {
      deletePaymentRequest(row.id);
    }
  };

  const handleSubmit = (row: PaymentRequest) => {
    if (row.status !== 'draft') return;
    const totals = committedTotals(row.contractId, row.id);
    if (totals.percent + (row.paidPercent || 0) > 100) {
      alert(`累计申请比例超限（已提交 ${totals.percent}% + 本单 ${row.paidPercent}% > 100%），请调整后再提交！`);
      return;
    }
    if (confirm(`确定提交付款申请「${row.paymentNo}」进入审批流吗？提交后不可编辑。`)) {
      updatePaymentRequest(row.id, {
        status: 'pending',
        totalAppliedAmount: totals.amount + (row.requestAmount || 0),
      });
    }
  };

  // ========== 表格列（字段尽量多） ==========
  const columns: ColumnDef<PaymentRequest>[] = [
    { key: 'paymentNo', title: '付款申请编号', width: '140px', render: (r) => <span className="font-medium text-indigo-600">{r.paymentNo}</span> },
    { key: 'contractNo', title: '合同编号', width: '140px' },
    {
      key: 'contractName', title: '合同名称',
      render: (r) => <span className="block max-w-[200px] truncate font-medium text-slate-800" title={r.contractName}>{r.contractName}</span>,
    },
    {
      key: 'contractType', title: '合同类型', width: '90px',
      render: (r) => (r.contractType ? (NON_PROCUREMENT_CONTRACT_TYPE_LABELS as any)[r.contractType] || r.contractType : '-'),
    },
    {
      key: 'formation', title: '形成方式', width: '90px',
      render: (r) => (r.formation ? (NON_PROCUREMENT_FORMATION_LABELS as any)[r.formation] || r.formation : '-'),
    },
    {
      key: 'counterpartyName', title: '对方单位',
      render: (r) => <span className="block max-w-[160px] truncate text-slate-700" title={r.counterpartyName}>{r.counterpartyName || '-'}</span>,
    },
    { key: 'contractAmount', title: '合同金额', width: '110px', align: 'right', render: (r) => fmt(r.contractAmount) },
    { key: 'paidPercent', title: '付款比例', width: '80px', align: 'right', render: (r) => (r.paidPercent != null ? `${r.paidPercent}%` : '-') },
    { key: 'requestAmount', title: '本次申请付款', width: '120px', align: 'right', render: (r) => <span className="font-semibold text-indigo-600">{fmt(r.requestAmount)}</span> },
    { key: 'totalAppliedAmount', title: '累计申请付款', width: '120px', align: 'right', render: (r) => fmt(r.totalAppliedAmount) },
    { key: 'expenseDepartment', title: '支出部门', width: '90px' },
    { key: 'applicant', title: '申请人', width: '90px' },
    { key: 'createTime', title: '申请时间', width: '160px' },
    {
      key: 'status', title: '状态', width: '90px',
      render: (r) => <Badge variant={STATUS_BADGE[r.status]}>{PAYMENT_REQUEST_STATUS_LABELS[r.status]}</Badge>,
    },
    {
      key: 'action', title: '操作', width: '200px', fixed: 'right',
      render: (r) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          {r.status === 'draft' && (
            <>
              <TextButton onClick={() => openEdit(r)}>编辑</TextButton>
              <TextButton onClick={() => handleSubmit(r)}>提交</TextButton>
            </>
          )}
          {r.status === 'pending' && (
            <>
              <TextButton onClick={() => openApprove(r, 'approved')} className="text-emerald-600 hover:text-emerald-700">通过</TextButton>
              <TextButton onClick={() => openApprove(r, 'rejected')} className="text-red-500 hover:text-red-600">驳回</TextButton>
            </>
          )}
          <TextButton
            onClick={() => { setEditing(null); setForm({ ...r }); setModalOpen(true); }}
          >
            详情
          </TextButton>
          {(r.status === 'draft' || r.status === 'rejected') && (
            <TextButton onClick={() => handleDelete(r)} className="text-red-500 hover:text-red-600">删除</TextButton>
          )}
        </div>
      ),
    },
  ];

  // 只读详情模式判断（详情 = 非草稿且未点编辑）
  const isDetail = !editing && !!form.id && form.status !== 'draft';

  return (
    <Card>
      <div className="p-5">
        {/* 搜索筛选区（字段尽量多） */}
        <SearchBar
          onSearch={() => setApplied({ ...f })}
          onReset={() => {
            const empty = { paymentNo: '', contractKw: '', contractType: '', agentKw: '', expenseDepartment: '', status: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '' };
            setF(empty); setApplied(empty);
          }}
        >
          <SearchField label="付款编号" placeholder="FK-xxxx" value={f.paymentNo} onChange={(v) => setF({ ...f, paymentNo: v })} />
          <SearchField label="合同" placeholder="合同编号/名称" value={f.contractKw} onChange={(v) => setF({ ...f, contractKw: v })} />
          <SearchField
            label="合同类型" type="select" value={f.contractType} onChange={(v) => setF({ ...f, contractType: v })}
            options={[
              { value: 'self_host', label: '自办展合同' },
              { value: 'joint_host', label: '合办展合同' },
            ]}
          />
          <SearchField label="对方单位" placeholder="代理商名称" value={f.agentKw} onChange={(v) => setF({ ...f, agentKw: v })} />
          <SearchField
            label="支出部门" type="select" value={f.expenseDepartment} onChange={(v) => setF({ ...f, expenseDepartment: v })}
            options={EXPENSE_DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          />
          <SearchField
            label="状态" type="select" value={f.status} onChange={(v) => setF({ ...f, status: v })}
            options={Object.entries(PAYMENT_REQUEST_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <SearchField label="申请日期从" type="date" value={f.dateFrom} onChange={(v) => setF({ ...f, dateFrom: v })} />
          <SearchField label="至" type="date" value={f.dateTo} onChange={(v) => setF({ ...f, dateTo: v })} />
          <SearchField label="金额≥" placeholder="最低金额" value={f.amountMin} onChange={(v) => setF({ ...f, amountMin: v })} width="w-[130px]" />
          <SearchField label="金额≤" placeholder="最高金额" value={f.amountMax} onChange={(v) => setF({ ...f, amountMax: v })} width="w-[130px]" />
        </SearchBar>

        {/* 操作按钮区 */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <span>共 {filteredData.length} 笔付款申请（仅限「自办展/合办展 + 代理合同」按合同金额比例付款）</span>
            <FeatureHelpButton content={PROCUREMENT_HELP.paymentRequest} />
          </div>
          <PrimaryButton onClick={openAdd}>+ 新增付款申请</PrimaryButton>
        </div>

        {/* 数据表格 */}
        <DataTable data={filteredData} columns={columns} pageSize={10} showPageSizeSelect striped compact />
      </div>

      {/* 新增/编辑/详情弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isDetail ? '付款申请详情' : editing ? '编辑付款申请（草稿）' : '新增付款申请'}
        size="lg"
        footer={
          isDetail ? (
            <div className="flex justify-end gap-2">
              <DefaultButton onClick={() => setModalOpen(false)}>关闭</DefaultButton>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <DefaultButton onClick={() => setModalOpen(false)}>取消</DefaultButton>
              <DefaultButton onClick={() => save(false)}>保存草稿</DefaultButton>
              <PrimaryButton onClick={() => save(true)}>提交审批</PrimaryButton>
            </div>
          )
        }
      >
        <div className="max-h-[62vh] overflow-y-auto pr-1 space-y-5">
          {/* ===== 一、选择代理合同 ===== */}
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>一、选择代理合同（自办展/合办展 + 形成方式=代理合同）
            </div>
            <Select
              label="代理合同 *"
              options={contractOptions}
              value={form.contractId || ''}
              onChange={(e) => handleContractChange(e.target.value)}
              disabled={isDetail}
              placeholder="选中后自动带出合同信息与对方单位/收款账户"
            />
          </div>

          {/* ===== 二、对方单位信息与收款账户（自动带出，只读快照） ===== */}
          {form.contractId && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-4 py-3">
              <div className="text-sm font-semibold text-emerald-700 mb-2">💰 对方单位信息与收款账户（自动从代理商档案带出）</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
                <div className="text-slate-600">对方名称：<b className="text-slate-800">{form.counterpartyName || '-'}</b></div>
                <div className="text-slate-600">对方联系人：<b className="text-slate-800">{form.counterpartyContact || '-'}</b></div>
                <div className="text-slate-600">对方联系电话：<b className="text-slate-800">{form.counterpartyPhone || '-'}</b></div>
                <div className="text-slate-600">对方地址：<span className="text-slate-800">{form.counterpartyAddress || '-'}</span></div>
                <div className="text-slate-600">对方开户行：<b className="text-emerald-700">{form.bankName || '-'}</b></div>
                <div className="text-slate-600">对方银行账号：<b className="text-emerald-700">{form.bankAccountNo || '-'}</b></div>
                <div className="text-slate-600">合同金额：<b className="text-indigo-700">{fmt(form.contractAmount)}</b></div>
                <div className="text-slate-600">合同摘要：<span className="block max-w-[320px] truncate text-slate-800" title={form.summary}>{form.summary || '-'}</span></div>
              </div>
            </div>
          )}

          {/* ===== 三、付款信息 ===== */}
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>二、付款信息
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">本次付款比例（%）<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number" min="0" max="100" step="0.01"
                    disabled={isDetail}
                    value={form.paidPercent ?? ''}
                    onChange={(e) => handlePercentChange(e.target.value)}
                    placeholder="按合同金额的百分比"
                    className="w-full h-9 px-3 pr-7 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">本次申请付款（元）</label>
                <div className="h-9 px-3 flex items-center border border-slate-200 rounded-lg bg-slate-50 text-sm font-semibold text-indigo-600">
                  {fmt(form.requestAmount)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">累计申请付款（元）</label>
                <div className="h-9 px-3 flex items-center border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
                  {form.contractId ? fmt(committedTotals(form.contractId, editing?.id).amount + (form.requestAmount || 0)) : '-'}
                </div>
              </div>
              <Select
                label="支出部门"
                value={form.expenseDepartment || ''}
                onChange={(e) => update({ expenseDepartment: e.target.value || undefined })}
                disabled={isDetail}
                options={[
                  { value: '', label: '请选择' },
                  ...EXPENSE_DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ]}
              />
              <Input label="费用类型" value={form.expenseType || ''} onChange={(e) => update({ expenseType: e.target.value })} disabled={isDetail} placeholder="如：代理费" />
              <div>
                <label className="block text-sm font-medium text-slate-700">付款说明材料</label>
                <div className="h-9 px-3 flex items-center border border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-500">
                  在下方附件区上传（合同扫描件、进度确认单、结算单等）
                </div>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  disabled={isDetail}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  value={form.remark || ''}
                  onChange={(e) => update({ remark: e.target.value })}
                  placeholder="付款说明、付款条件等"
                />
              </div>
            </div>
          </div>

          {/* ===== 三、付款说明材料（附件上传） ===== */}
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>三、付款说明材料
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left w-[140px]">附件类型</th>
                    <th className="px-3 py-2 text-left">附件</th>
                    <th className="px-3 py-2 text-center w-[100px]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-700">{PAYMENT_ATTACHMENT_TYPE_LABELS.payment_material}</td>
                    <td className="px-3 py-2">
                      {(form.attachments || []).length === 0 ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(form.attachments || []).map((a) => (
                            <span key={a.file.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                              📄 {a.file.fileName}（{fmtSize(a.file.fileSize)}）
                              {!isDetail && (
                                <button onClick={() => removeAttachment(a.file.id)} className="text-red-400 hover:text-red-600">✕</button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {!isDetail && (
                        <>
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            ⬆ 上传
                          </button>
                          <input
                            ref={fileRef} type="file" multiple className="hidden"
                            onChange={(e) => handleUpload(e, 'payment_material')}
                          />
                        </>
                      )}
                      {isDetail && <span className="text-slate-300 text-xs">只读</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-1.5 text-xs text-slate-400">
              付款说明材料：合同付款条款扫描件、进度确认单、结算单、验收资料等证明材料，最多 5 个；文件保存在浏览器本地（演示原型）
            </div>
          </div>

          {/* 审批信息（详情时展示） */}
          {isDetail && (form.approveTime || form.approveRemark) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px]">
              <div className="text-slate-600">审批人：<b className="text-slate-800">{form.approver || '-'}</b>　审批时间：{form.approveTime || '-'}</div>
              {form.approveRemark && <div className="text-slate-600 mt-1">审批意见：{form.approveRemark}</div>}
            </div>
          )}
        </div>
      </Modal>

      {/* 审批弹窗 */}
      <Modal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        title={approveAction === 'approved' ? '付款申请 · 审批通过' : '付款申请 · 审批驳回'}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <DefaultButton onClick={() => setApproveModal(null)}>取消</DefaultButton>
            <PrimaryButton
              onClick={doApprove}
              className={approveAction === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-500' : ''}
            >
              {approveAction === 'approved' ? '确认通过' : '确认驳回'}
            </PrimaryButton>
          </div>
        }
      >
        {approveModal && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-[13px] space-y-1">
              <div>付款申请编号：<b className="text-indigo-600">{approveModal.paymentNo}</b></div>
              <div>合同：{approveModal.contractName}</div>
              <div>对方单位：{approveModal.counterpartyName}</div>
              <div>本次申请付款：<b className="text-indigo-600">{fmt(approveModal.requestAmount)}</b>（比例 {approveModal.paidPercent}%）</div>
              <div>累计申请付款：{fmt(approveModal.totalAppliedAmount)}</div>
              <div>收款账户：{approveModal.bankName} · {approveModal.bankAccountNo}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                审批意见 {approveAction === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder={approveAction === 'approved' ? '同意按比例支付（可填写付款安排）' : '请填写驳回原因'}
              />
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
