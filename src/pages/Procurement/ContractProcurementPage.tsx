import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import type {
  ContractLedger,
  ProcurementFormation,
  ProcurementContractType,
  Bidding,
  ProcurementDemand,
} from '@/types';
import {
  PROCUREMENT_FORMATION_LABELS,
  PROCUREMENT_CONTRACT_TYPE_LABELS,
  BUSINESS_CATEGORY_LABELS,
  ARCHIVE_STATUS_LABELS,
} from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

// ============== 状态 → Badge 样式映射 ==============
const STATUS_BADGE: Record<string, { text: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  draft: { text: '草稿', variant: 'default' },
  pending: { text: '待审批', variant: 'warning' },
  approved: { text: '已通过', variant: 'success' },
  active: { text: '履行中', variant: 'primary' },
  expired: { text: '已到期', variant: 'default' },
  terminated: { text: '已终止', variant: 'danger' },
  completed: { text: '已完成', variant: 'success' },
  invalid: { text: '已作废', variant: 'danger' },
  suspended: { text: '已暂停', variant: 'warning' },
  returned: { text: '已退回', variant: 'danger' },
};

const BUSINESS_CATEGORY_OPTIONS = Object.entries(BUSINESS_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ASSESSMENT_OPTIONS = [
  { value: '', label: '不设置' },
  { value: 'single_project', label: '单个项目考核' },
  { value: 'monthly', label: '月度考核' },
  { value: 'quarterly', label: '季度考核' },
];

// ============== 工具函数 ==============
function getNowString(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ============== 主组件 ==============
export default function ContractProcurementPage() {
  const contractLedgers = useStore((s) => s.contractLedgers);
  const addContractLedger = useStore((s) => s.addContractLedger);
  const updateContractLedger = useStore((s) => s.updateContractLedger);
  const biddings = useStore((s) => s.biddings);
  const procurementDemands = useStore((s) => s.procurementDemands);
  const currentUser = useStore((s) => s.currentUser);

  // ========== 审批视角列表过滤 ==========
  const list = useMemo(() => {
    return contractLedgers.filter(
      (l) => l.contractNature === 'procurement'
    );
  }, [contractLedgers]);

  // ========== 状态筛选 ==========
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredList = useMemo(() => {
    if (statusFilter === 'all') return list;
    return list.filter((l) => l.status === statusFilter);
  }, [list, statusFilter]);

  // ========== 弹窗状态 ==========
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContractLedger | null>(null);
  const [form, setForm] = useState<Partial<ContractLedger>>({});

  // ========== 打开新增 ==========
  const openAdd = () => {
    setEditing(null);
    setForm({
      contractNature: 'procurement',
      formation: 'state_owned_xunbi',
      contractType: 'non_engineering',
      isModelText: true,
      archiveStatus: 'not_started',
      status: 'draft',
      guaranteeEvaluation: { isOpen: false },
      assessmentManagement: null,
      yearlyEvaluation: false,
      businessCategory: 'expense',
    });
    setModalOpen(true);
  };

  // ========== 打开编辑草稿 ==========
  const openEdit = (row: ContractLedger) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  // ========== 字段更新 ==========
  const update = (patch: Partial<ContractLedger>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // ========== 保存 ==========
  const save = (submit: boolean) => {
    const now = getNowString();
    const finalForm: Partial<ContractLedger> = {
      ...form,
      contractNature: 'procurement', // 强制兜底
      status: submit ? 'pending' : 'draft',
    };

    if (editing) {
      updateContractLedger(editing.id, finalForm);
    } else {
      const newLedger: ContractLedger = {
        id: 'CL' + Date.now() + Math.random().toString(36).slice(2, 7),
        contractId: finalForm.contractNo || '',
        contractNo: finalForm.contractNo || '',
        contractName: finalForm.contractName || '未命名合同',
        contractNature: 'procurement',
        category: 'procurement',
        contractType: finalForm.contractType as ProcurementContractType,
        formation: finalForm.formation as ProcurementFormation,
        winningDate: finalForm.winningDate,
        isModelText: finalForm.isModelText ?? true,
        handlingDepartment: finalForm.handlingDepartment,
        handler: finalForm.handler,
        handlerContact: finalForm.handlerContact,
        counterpartyName: finalForm.counterpartyName,
        counterpartyContact: finalForm.counterpartyContact,
        mainContent: finalForm.mainContent,
        amount: finalForm.amount,
        businessCategory: finalForm.businessCategory ?? 'expense',
        archiveStatus: finalForm.archiveStatus ?? 'not_started',
        remark: finalForm.remark,
        status: finalForm.status as ContractLedger['status'],
        biddingId: finalForm.biddingId,
        biddingNo: finalForm.biddingNo,
        projectName: finalForm.projectName,
        guaranteeEvaluation: finalForm.guaranteeEvaluation ?? { isOpen: false },
        assessmentManagement: finalForm.assessmentManagement ?? null,
        yearlyEvaluation: finalForm.yearlyEvaluation ?? false,
      };
      addContractLedger(newLedger);
    }

    setModalOpen(false);
    setEditing(null);
  };

  // ========== 头部统计 ==========
  const counts = useMemo(() => {
    return {
      total: list.length,
      draft: list.filter((l) => l.status === 'draft').length,
      pending: list.filter((l) => l.status === 'pending').length,
      approved: list.filter((l) => ['approved', 'active', 'completed'].includes(l.status)).length,
      returned: list.filter((l) => l.status === 'returned').length,
    };
  }, [list]);

  const formationOptions = Object.entries(PROCUREMENT_FORMATION_LABELS).map(([v, l]) => ({
    value: v,
    label: l,
  }));
  const contractTypeOptions = Object.entries(PROCUREMENT_CONTRACT_TYPE_LABELS).map(([v, l]) => ({
    value: v,
    label: l,
  }));

  // ========== 渲染 ==========
  return (
    <div className="p-6 space-y-4">
      {/* 顶部说明卡片 */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
        <div className="px-5 py-4 text-sm text-green-700">
          📋 <b>招采类合同新增入口</b> — 合同名称/类型/中标时间等根据前期招采流程自动带入。
          合同履约评价/考核绑定/终止/归档等全生命周期操作请前往「合同台账」。
        </div>
      </Card>

      {/* 工具栏 */}
      <Card>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500 mr-1">筛选：</span>
            {[
              { key: 'all', label: `全部(${counts.total})` },
              { key: 'draft', label: `草稿(${counts.draft})` },
              { key: 'pending', label: `待审批(${counts.pending})` },
              { key: 'approved', label: `已通过(${counts.approved})` },
              { key: 'returned', label: `已退回(${counts.returned})` },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  statusFilter === item.key
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <PrimaryButton onClick={openAdd}>+ 新增招采类合同</PrimaryButton>
        </div>
      </Card>

      {/* 列表表格 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                <th className="px-4 py-3 font-medium">合同性质</th>
                <th className="px-4 py-3 font-medium">合同名称</th>
                <th className="px-4 py-3 font-medium">合同编号</th>
                <th className="px-4 py-3 font-medium">合同类型</th>
                <th className="px-4 py-3 font-medium">合同形成方式</th>
                <th className="px-4 py-3 font-medium">中标时间</th>
                <th className="px-4 py-3 font-medium">经办部门</th>
                <th className="px-4 py-3 font-medium">对方单位</th>
                <th className="px-4 py-3 font-medium text-right">合同金额(万)</th>
                <th className="px-4 py-3 font-medium">资金流向</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
              {filteredList.map((row) => {
                const sb = STATUS_BADGE[row.status] || { text: row.status, variant: 'default' };
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge variant="info">招采类</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate" title={row.contractName}>
                      {row.contractName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.contractNo}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {PROCUREMENT_CONTRACT_TYPE_LABELS[row.contractType as ProcurementContractType] || row.contractType}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {PROCUREMENT_FORMATION_LABELS[row.formation as ProcurementFormation] || row.formation}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.winningDate || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.handlingDepartment || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate" title={row.counterpartyName}>
                      {row.counterpartyName || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      {row.amount != null ? row.amount.toFixed(2) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">
                        {BUSINESS_CATEGORY_LABELS[row.businessCategory as 'expense' | 'income' | 'other'] || row.businessCategory || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sb.variant}>{sb.text}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.status === 'draft' && (
                          <button
                            onClick={() => openEdit(row)}
                            className="text-indigo-500 hover:text-indigo-700 text-xs px-2 py-1 rounded hover:bg-indigo-50"
                          >
                            编辑草稿
                          </button>
                        )}
                        {row.status === 'draft' && (
                          <button
                            onClick={() => openEdit(row)}
                            className="text-green-500 hover:text-green-700 text-xs px-2 py-1 rounded hover:bg-green-50"
                          >
                            提交审批
                          </button>
                        )}
                        {(row.status === 'pending' || row.status === 'approved' || row.status === 'active' || row.status === 'completed') && (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ============ 表单弹窗 ============ */}
      <Modal
        open={modalOpen}
        title={editing ? '编辑招采类合同草稿' : '新增招采类合同'}
        onClose={() => setModalOpen(false)}
        size="xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <DefaultButton onClick={() => setModalOpen(false)}>取消</DefaultButton>
            <DefaultButton onClick={() => save(false)}>保存草稿</DefaultButton>
            <PrimaryButton onClick={() => save(true)}>提交审批</PrimaryButton>
          </div>
        }
      >
        <ContractProcurementForm
          form={form}
          update={update}
          biddings={biddings}
          procurementDemands={procurementDemands}
          isEdit={!!editing}
        />
      </Modal>
    </div>
  );
}

// ============== 表单子组件 ==============
interface FormProps {
  form: Partial<ContractLedger>;
  update: (patch: Partial<ContractLedger>) => void;
  biddings: Bidding[];
  procurementDemands: ProcurementDemand[];
  isEdit: boolean;
}

function ContractProcurementForm({ form, update, biddings, procurementDemands, isEdit }: FormProps) {
  const formationOptions = Object.entries(PROCUREMENT_FORMATION_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const contractTypeOptions = Object.entries(PROCUREMENT_CONTRACT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  // ========== 招采工单自动带入 ==========
  // ========== 关联采购需求自动带入 ==========
  // 需求背景：立项确认 needContract='yes' 的需求走标准链路 → 建工单 → 建合同
  //          合同表单选"关联采购需求"后自动从工单带入数据
  const handleDemandChange = (demandId: string) => {
    const demand = procurementDemands.find((d) => d.id === demandId);
    if (!demand) return;
    // 需求关联的工单
    const bidding = biddings.find((b) => b.id === demand.relatedOrderId || b.demandId === demand.id);
    update({
      biddingId: bidding?.id || '',
      biddingNo: bidding?.biddingNo || '',
      demandId: demand.id,
      demandNo: demand.demandNo,
      projectName: bidding?.projectName || demand.projectName,
      contractName: bidding?.projectName || demand.projectName || form.contractName,
      counterpartyName: bidding?.winningSupplierName || form.counterpartyName,
      winningDate: form.winningDate || bidding?.awardTime,
    });
  };

  /**
   * 关联采购需求下拉选项
   * 筛选条件：needContract='yes'（走标准链路的）且已立项通过且有工单
   * ⚠️ needContract='no' 的需求直接挂已有合同，不出现在这里
   */
  const demandOptions = [
    { value: '', label: '-- 选择关联采购需求（可选）--' },
    ...procurementDemands
      .filter((d) => (d.needContract ?? 'yes') !== 'no') // 默认 yes，兼容老数据
      .filter((d) => d.status === 'confirm_approved')
      .map((d) => ({
        value: d.id,
        label: `${d.demandNo} · ${d.projectName || '(无项目名)'}`,
      })),
  ];

  return (
    <div className="max-h-[72vh] overflow-y-auto px-6 py-4 space-y-5">
      {/* ========== 916文档 一、基本信息 ========== */}
      <Section title="📋 基本信息（按916文档L14字段顺序）">
        <div className="grid grid-cols-2 gap-4">
          {/* 合同名称* */}
          <Input
            label="合同名称 *"
            required
            value={form.contractName || ''}
            onChange={(e) => update({ contractName: e.target.value })}
            placeholder="招采类合同名称"
          />
          {/* 合同编号* */}
          <Input
            label="合同编号 *"
            required
            value={form.contractNo || ''}
            onChange={(e) => update({ contractNo: e.target.value })}
            placeholder="手工输入，如：HT-202609001"
          />
          {/* 合同类型* */}
          <Select
            label="合同类型 *"
            required
            options={contractTypeOptions}
            value={form.contractType as string || ''}
            onChange={(e) => update({ contractType: e.target.value as ProcurementContractType })}
            placeholder="选择合同类型"
          />
          {/* 合同形成方式* */}
          <Select
            label="合同形成方式 *"
            required
            options={formationOptions}
            value={form.formation as string || ''}
            onChange={(e) => update({ formation: e.target.value as ProcurementFormation })}
            placeholder="选择合同形成方式"
          />
          {/* 关联采购需求（needContract='yes' 的已立项通过需求）*/}
          {/* 需求背景：合同表单选关联采购需求后，自动从关联工单带入对方单位、中标时间等字段 */}
          <Select
            label="关联采购需求"
            options={demandOptions}
            value={form.demandId || ''}
            onChange={(e) => handleDemandChange(e.target.value)}
            placeholder="选了之后自动从工单带入对方单位、中标时间"
          />
          {/* 中标时间 */}
          <Input
            label="中标时间"
            type="date"
            value={form.winningDate || ''}
            onChange={(e) => update({ winningDate: e.target.value })}
          />
          {/* 示范文本* */}
          <div className="flex items-end gap-6">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.isModelText ?? true}
                onChange={(e) => update({ isModelText: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700">示范文本（是/否）*</span>
            </label>
          </div>
        </div>
      </Section>

      {/* ========== 916文档 二、合同当事人 ========== */}
      <Section title="👥 合同当事人（916文档L15-16）">
        <div className="grid grid-cols-2 gap-6">
          {/* 我方单位 */}
          <div>
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>我方单位
            </div>
            <div className="space-y-3">
              <Input label="经办部门 *" required value={form.handlingDepartment || ''}
                onChange={(e) => update({ handlingDepartment: e.target.value })} placeholder="如：采购部" />
              <Input label="经办人 *" required value={form.handler || ''}
                onChange={(e) => update({ handler: e.target.value })} />
              <Input label="联系方式 *" required value={form.handlerContact || ''}
                onChange={(e) => update({ handlerContact: e.target.value })} placeholder="电话/邮箱" />
            </div>
          </div>
          {/* 对方单位 */}
          <div>
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>对方单位
            </div>
            <div className="space-y-3">
              <Input label="单位名称 *" required value={form.counterpartyName || ''}
                onChange={(e) => update({ counterpartyName: e.target.value })} placeholder="中标供应商全称" />
              <Input label="负责人" value={form.counterpartyContact || ''}
                onChange={(e) => update({ counterpartyContact: e.target.value })} placeholder="对方项目负责人" />
            </div>
          </div>
        </div>
      </Section>

      {/* ========== 916文档 三、合同内容与金额 ========== */}
      <Section title="📝 合同内容与金额（916文档L14）">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              合同主要内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.mainContent || ''}
              onChange={(e) => update({ mainContent: e.target.value })}
              placeholder="简要描述合同主要内容、范围、标准等"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="合同状态 *"
              required
              value={form.status || 'draft'}
              onChange={(e) => update({ status: e.target.value as ContractLedger['status'] })}
              placeholder="draft/pending/active/..."
            />
            <Input
              label="合同金额（万元）*"
              required
              type="number"
              step="0.01"
              value={form.amount ?? ''}
              onChange={(e) => update({ amount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0.00"
            />
            <Input
              label="资金流向分类 *"
              required
              value={form.businessCategory || 'expense'}
              onChange={(e) => update({ businessCategory: e.target.value as 'expense' | 'income' | 'other' })}
              placeholder="expense支出 / income收入 / other其他"
            />
          </div>
        </div>
      </Section>

      {/* ========== 916文档 四、附件 ========== */}
      <Section title="📎 附件（916文档L14-合同审批表/合同盖章附件）">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-indigo-400 cursor-pointer transition-colors">
            <div className="text-slate-400 text-2xl mb-1">📄</div>
            <div className="text-sm text-slate-600">合同审批表 *</div>
            <div className="text-xs text-slate-400 mt-1">点击上传（占位）</div>
          </div>
          <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-indigo-400 cursor-pointer transition-colors">
            <div className="text-slate-400 text-2xl mb-1">📑</div>
            <div className="text-sm text-slate-600">合同盖章附件 *</div>
            <div className="text-xs text-slate-400 mt-1">点击上传（占位）</div>
          </div>
        </div>
      </Section>

      {/* ========== 916文档 五、招采类独有设置 ========== */}
      <Section title="⭐ 招采类独有设置（916文档L17-18）" tone="amber">
        <div className="grid grid-cols-3 gap-4">
          {/* 履约评价 */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.guaranteeEvaluation?.isOpen ?? false}
                onChange={(e) =>
                  update({
                    guaranteeEvaluation: {
                      ...(form.guaranteeEvaluation || { isOpen: false }),
                      isOpen: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-amber-800">履约评价(保证金/质保金)</span>
            </label>
            {form.guaranteeEvaluation?.isOpen && (
              <div className="mt-2">
                <Input
                  label="类型"
                  value={form.guaranteeEvaluation?.guaranteeType || ''}
                  onChange={(e) =>
                    update({
                      guaranteeEvaluation: {
                        ...(form.guaranteeEvaluation || { isOpen: true }),
                        guaranteeType: e.target.value,
                      },
                    })
                  }
                  placeholder="如：履约保证金 / 质保金"
                />
              </div>
            )}
          </div>
          {/* 考核管理 */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <Select
              label="考核管理"
              options={ASSESSMENT_OPTIONS}
              value={form.assessmentManagement || ''}
              onChange={(e) =>
                update({
                  assessmentManagement: e.target.value
                    ? (e.target.value as ContractLedger['assessmentManagement'])
                    : null,
                })
              }
            />
          </div>
          {/* 年度评价 */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer pt-6">
              <input
                type="checkbox"
                checked={form.yearlyEvaluation ?? false}
                onChange={(e) => update({ yearlyEvaluation: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-amber-800">年度评价</span>
            </label>
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          💡 勾选后自动关联后续履约评价/考核/年度评价流程。
        </p>
      </Section>

      {/* ========== 916文档 六、备注 ========== */}
      <Section title="📝 备注">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.remark || ''}
            onChange={(e) => update({ remark: e.target.value })}
            placeholder="补充说明"
          />
        </div>
      </Section>
    </div>
  );
}

// ============== Section 辅助组件 ==============
interface SectionProps {
  title: string;
  children: React.ReactNode;
  tone?: 'default' | 'blue' | 'amber' | 'green';
}
function Section({ title, children, tone = 'default' }: SectionProps) {
  const toneMap = {
    default: 'border-slate-200 bg-white',
    blue: 'border-blue-200 bg-blue-50/40',
    amber: 'border-amber-200 bg-amber-50/40',
    green: 'border-green-200 bg-green-50/40',
  };
  return (
    <div className={`rounded-lg border ${toneMap[tone]} p-4`}>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      {children}
    </div>
  );
}
