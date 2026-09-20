import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import type {
  ContractLedger,
  NonProcurementFormation,
  NonProcurementContractType,
} from '@/types';
import {
  NON_PROCUREMENT_FORMATION_LABELS,
  NON_PROCUREMENT_CONTRACT_TYPE_LABELS,
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
const STATUS_BADGE: Record<string, { text: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' }> = {
  draft: { text: '草稿', variant: 'default' },
  pending: { text: '待审批', variant: 'warning' },
  approved: { text: '已通过', variant: 'success' },
  active: { text: '履行中', variant: 'primary' },
  expired: { text: '已到期', variant: 'secondary' },
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

// ============== 工具函数 ==============
function getNowString(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ============== 主组件 ==============
export default function ContractNonProcurementPage() {
  const contractLedgers = useStore((s) => s.contractLedgers);
  const addContractLedger = useStore((s) => s.addContractLedger);
  const updateContractLedger = useStore((s) => s.updateContractLedger);
  const currentUser = useStore((s) => s.currentUser);

  // ========== 审批视角列表过滤 ==========
  const list = useMemo(() => {
    return contractLedgers.filter(
      (l) => l.contractNature === 'non_procurement'
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

  // ========== 金额明细（主办/主场合同时使用） ==========
  type AmountDetailItem = { id: string; label: string; value: number };
  const [amountDetails, setAmountDetails] = useState<AmountDetailItem[]>([]);

  // ========== 打开新增 ==========
  const openAdd = () => {
    setEditing(null);
    setForm({
      contractNature: 'non_procurement',
      formation: 'exhibition_host',
      contractType: 'non_engineering_service',
      isModelText: true,
      archiveStatus: 'not_started',
      status: 'draft',
      businessCategory: undefined,
      performanceBond: { gateByFormation: true, isEnabled: false },
    });
    setAmountDetails([
      { id: 'ad-1', label: '场租金额', value: 0 },
      { id: 'ad-2', label: '管理费', value: 0 },
      { id: 'ad-3', label: '履约保证金', value: 0 },
    ]);
    setModalOpen(true);
  };

  // ========== 打开编辑草稿 ==========
  const openEdit = (row: ContractLedger) => {
    setEditing(row);
    setForm({ ...row });
    // 兼容旧数据 exhibition_service → exhibition_host（运行时字符串比较，类型层已移除）
    const rawFormation = row.formation as unknown as string;
    const f: NonProcurementFormation = rawFormation === 'exhibition_service'
      ? 'exhibition_host'
      : (row.formation as NonProcurementFormation);
    setForm((prev) => ({ ...prev, formation: f }));
    // 初始化金额明细（仅主办/主场）
    if (f === 'exhibition_host') {
      setAmountDetails([
        { id: 'ad-1', label: '场租金额', value: 0 },
        { id: 'ad-2', label: '管理费', value: 0 },
        { id: 'ad-3', label: '履约保证金', value: 0 },
      ]);
    } else if (f === 'exhibition_venue') {
      setAmountDetails([
        { id: 'ad-1', label: '安全清洁押金', value: 0 },
        { id: 'ad-2', label: '搭建押金', value: 0 },
      ]);
    } else {
      setAmountDetails([]);
    }
    setModalOpen(true);
  };

  // ========== 字段更新 ==========
  const update = (patch: Partial<ContractLedger>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // ========== 保存 ==========
  const save = (submit: boolean) => {
    const now = getNowString();
    // 履约保证金门控自动同步：只有展览服务类（主办/主场）才允许 gateByFormation=true
    const isExhibition = form.formation === 'exhibition_host' || form.formation === 'exhibition_venue';
    // 主办/主场合同时：合同金额 = 明细汇总（元），其他 formation 保持手填
    const isDetailLedger = isExhibition;
    const detailTotal = amountDetails.reduce((s, d) => s + (d.value || 0), 0);
    const finalForm: Partial<ContractLedger> = {
      ...form,
      contractNature: 'non_procurement', // 强制兜底
      status: submit ? 'pending' : 'draft',
      amount: isDetailLedger ? detailTotal : form.amount, // 自动汇总
      performanceBond: {
        gateByFormation: isExhibition,
        isEnabled: isExhibition ? (form.performanceBond?.isEnabled ?? false) : false,
        amount: isExhibition ? form.performanceBond?.amount : undefined,
        receiveDate: isExhibition ? form.performanceBond?.receiveDate : undefined,
      },
    };

    if (editing) {
      updateContractLedger(editing.id, finalForm);
    } else {
      const newLedger: ContractLedger = {
        id: 'CL' + Date.now() + Math.random().toString(36).slice(2, 7),
        contractId: finalForm.contractNo || '',
        contractNo: finalForm.contractNo || '',
        contractName: finalForm.contractName || '未命名合同',
        contractNature: 'non_procurement',
        category: 'other',
        contractType: finalForm.contractType as NonProcurementContractType,
        formation: finalForm.formation as NonProcurementFormation,
        isModelText: finalForm.isModelText ?? true,
        handlingDepartment: finalForm.handlingDepartment,
        handler: finalForm.handler,
        handlerContact: finalForm.handlerContact,
        counterpartyName: finalForm.counterpartyName,
        counterpartyContact: finalForm.counterpartyContact,
        mainContent: finalForm.mainContent,
        amount: finalForm.amount,
        businessCategory: finalForm.businessCategory,
        archiveStatus: finalForm.archiveStatus ?? 'not_started',
        remark: finalForm.remark,
        status: finalForm.status as ContractLedger['status'],
        performanceBond: finalForm.performanceBond,
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

  // ========== 渲染 ==========
  return (
    <div className="p-6 space-y-4">
      {/* 顶部说明卡片 */}
      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100">
        <div className="px-5 py-4 text-sm text-purple-700">
          📋 <b>非招采类合同新增入口</b> — 由经办人手动填写合同名称、类型等信息。
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
          <PrimaryButton onClick={openAdd}>+ 新增非招采类合同</PrimaryButton>
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
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
              {filteredList.map((row) => {
                const sb = STATUS_BADGE[row.status] || { text: row.status, variant: 'default' as const };
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge variant="secondary">非招采类</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[220px] truncate" title={row.contractName}>
                      {row.contractName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.contractNo}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {NON_PROCUREMENT_CONTRACT_TYPE_LABELS[row.contractType as NonProcurementContractType] || row.contractType}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {NON_PROCUREMENT_FORMATION_LABELS[row.formation as NonProcurementFormation] || row.formation}
                    </td>
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
        title={editing ? '编辑非招采类合同草稿' : '新增非招采类合同'}
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
        <ContractNonProcurementForm form={form} update={update}
          amountDetails={amountDetails}
          setAmountDetails={setAmountDetails}
        />
      </Modal>
    </div>
  );
}

// ============== 表单子组件 ==============
interface AmountDetailItem { id: string; label: string; value: number; }
interface FormProps {
  form: Partial<ContractLedger>;
  update: (patch: Partial<ContractLedger>) => void;
  amountDetails: AmountDetailItem[];
  setAmountDetails: (v: AmountDetailItem[] | ((prev: AmountDetailItem[]) => AmountDetailItem[])) => void;
}

function ContractNonProcurementForm({ form, update, amountDetails, setAmountDetails }: FormProps) {
  const contractTypeOptions = Object.entries(NON_PROCUREMENT_CONTRACT_TYPE_LABELS).map(([v, l]) => ({
    value: v,
    label: l,
  }));

  const formation = form.formation as NonProcurementFormation;
  const isHost = formation === 'exhibition_host';
  const isVenue = formation === 'exhibition_venue';
  const isExhibitionLedger = isHost || isVenue;

  // formation 改变时，自动重置履约保证金门控 + 金额明细初始化
  const handleFormationChange = (newFormation: NonProcurementFormation) => {
    const nowIsExhibition = newFormation === 'exhibition_host' || newFormation === 'exhibition_venue';
    update({
      formation: newFormation,
      performanceBond: nowIsExhibition
        ? { gateByFormation: true, isEnabled: false }
        : { gateByFormation: false, isEnabled: false },
    });
    // 切换 formation 时重置金额明细
    if (newFormation === 'exhibition_host') {
      setAmountDetails([
        { id: 'ad-1', label: '场租金额', value: 0 },
        { id: 'ad-2', label: '管理费', value: 0 },
        { id: 'ad-3', label: '履约保证金', value: 0 },
      ]);
    } else if (newFormation === 'exhibition_venue') {
      setAmountDetails([
        { id: 'ad-1', label: '安全清洁押金', value: 0 },
        { id: 'ad-2', label: '搭建押金', value: 0 },
      ]);
    } else {
      setAmountDetails([]);
    }
  };

  // 计算明细汇总
  const detailTotal = amountDetails.reduce((s, d) => s + (d.value || 0), 0);

  // 金额明细辅助函数
  const addDetailRow = () => {
    setAmountDetails((prev) => [...prev, { id: 'ad-' + Date.now() + Math.random().toString(36).slice(2, 5), label: '自定义项目', value: 0 }]);
  };
  const removeDetailRow = (id: string) => {
    setAmountDetails((prev) => prev.filter((d) => d.id !== id));
  };
  const updateDetailRow = (id: string, patch: Partial<AmountDetailItem>) => {
    setAmountDetails((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  return (
    <div className="max-h-[72vh] overflow-y-auto px-6 py-4 space-y-5">
      {/* ========== 916文档 一、基本信息 ========== */}
      <Section title="📋 基本信息（按916文档L20字段顺序）" tone="blue">
        <div className="grid grid-cols-2 gap-4">
          {/* 合同名称* */}
          <Input
            label="合同名称 *"
            required
            value={form.contractName || ''}
            onChange={(e) => update({ contractName: e.target.value })}
            placeholder="非招采类由经办人填写"
          />
          {/* 合同编号* */}
          <Input
            label="合同编号 *"
            required
            value={form.contractNo || ''}
            onChange={(e) => update({ contractNo: e.target.value })}
            placeholder="手工输入，如：HT-202609001"
          />
          {/* 需求类型（非招采类：由经办人自行勾选）*/}
          <Select
            label="需求类型 *"
            required
            options={contractTypeOptions}
            value={form.contractType as string || ''}
            onChange={(e) => update({ contractType: e.target.value as NonProcurementContractType })}
            placeholder="选择需求类型"
          />
          {/* 合同形成方式* —— 原生 select 带 optgroup 分组 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">合同形成方式 <span className="text-red-500">*</span></label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={formation || ''}
              onChange={(e) => handleFormationChange(e.target.value as NonProcurementFormation)}
            >
              <option value="">请选择合同形成方式</option>
              <optgroup label="展览服务">
                <option value="exhibition_host">主办合同</option>
                <option value="exhibition_venue">主场合同</option>
              </optgroup>
              <optgroup label="其他">
                <option value="exhibition_display">展览展示服务</option>
                <option value="investment_contract">招商合同</option>
                <option value="other">其他</option>
              </optgroup>
            </select>
          </div>
          {/* 示范文本* —— 两个 checkbox 实现单选语义（是/否二选一） */}
          <div className="flex items-end gap-4">
            <span className="text-sm text-slate-700 pb-2 mr-2">示范文本 *</span>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.isModelText === true}
                onChange={() => update({ isModelText: true })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700">是</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.isModelText === false}
                onChange={() => update({ isModelText: false })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700">否</span>
            </label>
          </div>
        </div>
      </Section>

      {/* ========== 916文档 二、合同当事人 ========== */}
      <Section title="👥 合同当事人（916文档L21-22）">
        <div className="grid grid-cols-2 gap-6">
          {/* 我方单位 */}
          <div>
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>我方单位
            </div>
            <div className="space-y-3">
              <Input label="经办部门 *" required value={form.handlingDepartment || ''}
                onChange={(e) => update({ handlingDepartment: e.target.value })} placeholder="如：财务部" />
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
                onChange={(e) => update({ counterpartyName: e.target.value })} placeholder="供应商全称" />
              <Input label="负责人" value={form.counterpartyContact || ''}
                onChange={(e) => update({ counterpartyContact: e.target.value })} placeholder="对方项目负责人" />
            </div>
          </div>
        </div>
      </Section>

      {/* ========== 916文档 三、合同内容与金额 ========== */}
      <Section title="📝 合同内容与金额（916文档L20）">
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
            {isExhibitionLedger ? (
              // 主办/主场合同时：只读显示，自动汇总（单位：元）
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  合同金额（元）<span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-indigo-500">由下方明细自动汇总</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed"
                  value={detailTotal.toFixed(2)}
                  placeholder="明细自动汇总"
                />
              </div>
            ) : (
              <Input
                label="合同金额（元）*"
                required
                type="number"
                step="0.01"
                value={form.amount ?? ''}
                onChange={(e) => update({ amount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
              />
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">资金流向分类 <span className="text-red-500">*</span></label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={form.businessCategory || ''}
                onChange={(e) => update({ businessCategory: (e.target.value || undefined) as 'expense' | 'income' | 'other' | undefined })}
              >
                <option value="">请选择</option>
                <option value="expense">支出合同</option>
                <option value="income">收入合同</option>
                <option value="other">其他合同</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========== 主办/主场合同：金额明细区 ========== */}
        {isExhibitionLedger && (
          <div className="mt-4 border border-indigo-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-50 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-indigo-700 font-semibold text-sm">
                  {isHost ? '主办合同金额明细' : '主场合同金额明细'}
                </span>
                <span className="text-xs text-indigo-500">
                  合同总金额由以下明细自动汇总而成
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1 text-xs text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-100 transition-colors"
                onClick={addDetailRow}
              >
                + 添加行
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs">
                  <th className="px-3 py-2 text-left w-12">#</th>
                  <th className="px-3 py-2 text-left">金额项名称</th>
                  <th className="px-3 py-2 text-right w-48">金额（元）</th>
                  <th className="px-3 py-2 text-center w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {amountDetails.map((d, idx) => (
                  <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                        value={d.label}
                        onChange={(e) => updateDetailRow(d.id, { label: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-2 py-1 border border-slate-200 rounded text-sm text-right"
                        value={d.value ?? 0}
                        onChange={(e) => updateDetailRow(d.id, { value: e.target.value ? Number(e.target.value) : 0 })}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        className="text-rose-500 hover:underline text-xs"
                        onClick={() => removeDetailRow(d.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-right text-slate-700 font-medium">
                    合同总金额（元）
                  </td>
                  <td className="px-3 py-2 text-right text-red-500 font-semibold">
                    {detailTotal.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Section>

      {/* ========== 916文档 四、附件 ========== */}
      <Section title="📎 附件（916文档L20-合同审批表/合同盖章附件）">
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

      {/* ========== 916文档 L23 第三条：门控履约保证金 ========== */}
      <Section title="🔒 履约保证金（门控 · 916文档L23）" tone="amber">
        {isExhibitionLedger ? (
          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/60 space-y-3">
            <div className="text-xs text-amber-600 mb-1">💡 展览服务合同专属 — 门控生效中</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.performanceBond?.isEnabled ?? false}
                onChange={(e) =>
                  update({
                    performanceBond: {
                      gateByFormation: true,
                      isEnabled: e.target.checked,
                      amount: form.performanceBond?.amount,
                      receiveDate: form.performanceBond?.receiveDate,
                    },
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-amber-800">是否收取履约保证金</span>
            </label>
            {form.performanceBond?.isEnabled && (
              <div className="mt-3 flex gap-4 flex-wrap">
                <div className="min-w-[180px]">
                  <Input
                    label="保证金金额(万)"
                    type="number"
                    step="0.01"
                    value={form.performanceBond?.amount ?? ''}
                    onChange={(e) =>
                      update({
                        performanceBond: {
                          gateByFormation: true,
                          isEnabled: true,
                          amount: e.target.value ? Number(e.target.value) : undefined,
                          receiveDate: form.performanceBond?.receiveDate,
                        },
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="min-w-[180px]">
                  <Input
                    label="收款时间"
                    type="date"
                    value={form.performanceBond?.receiveDate || ''}
                    onChange={(e) =>
                      update({
                        performanceBond: {
                          gateByFormation: true,
                          isEnabled: true,
                          amount: form.performanceBond?.amount,
                          receiveDate: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-400 text-sm">
            <span className="mr-1">🔒</span>
            仅当合同形成方式为「展览服务」下的主办合同 / 主场合同时，履约保证金门控才会显示。
          </div>
        )}
      </Section>

      {/* ========== 916文档 五、备注 ========== */}
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
