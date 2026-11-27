import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import type {
  ContractLedger,
  ProcurementFormation,
  ProcurementContractType,
  Bidding,
  ProcurementDemand,
  BiddingProcurementMethod,
  Supplier,
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
import ContractTierField from '@/components/business/ContractTierField';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { PROCUREMENT_HELP } from '@/constants/procurementHelp';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';

// ============== 状态 → Badge 样式映射 ==============
const STATUS_BADGE: Record<string, { text: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  draft: { text: '草稿', variant: 'default' },
  pending: { text: '待审批', variant: 'warning' },
  approved: { text: '已通过', variant: 'success' },
  active: { text: '履行中', variant: 'primary' },
  expired: { text: '已到期', variant: 'default' },
  terminated: { text: '已终止', variant: 'danger' },
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

// 招采执行工单采购方式 → 合同形成方式 映射
const BIDDING_METHOD_TO_FORMATION: Record<BiddingProcurementMethod, ProcurementFormation> = {
  legal_bidding: 'legal_bidding',
  voluntary_bidding: 'voluntary_bidding',
  inquiry_open: 'state_owned_xunbi',
  inquiry_invited: 'state_owned_xunbi',
  competitive_bidding: 'state_owned_jingjia',
  negotiation_open: 'state_owned_tanpan',
  negotiation_invited: 'state_owned_tanpan',
  direct: 'state_owned_direct',
  framework_catalog: 'state_owned_framework',
  framework_random: 'state_owned_framework',
  e_mall: 'state_owned_mall',
};

// ============== 主组件 ==============
export default function ContractProcurementPage() {
  const contractLedgers = useStore((s) => s.contractLedgers);
  const addContractLedger = useStore((s) => s.addContractLedger);
  const updateContractLedger = useStore((s) => s.updateContractLedger);
  const biddings = useStore((s) => s.biddings);
  const procurementDemands = useStore((s) => s.procurementDemands);
  const suppliers = useStore((s) => s.suppliers);
  const currentUser = useStore((s) => s.currentUser);

  // ========== 审批视角列表过滤 ==========
  const list = useMemo(() => {
    return contractLedgers.filter(
      (l) => l.contractNature === 'procurement'
    );
  }, [contractLedgers]);

  // ========== 补充协议：可作为"关联主合同"下拉的候选列表（同 contractNature 的主合同） ==========
  const primaryOptions = useMemo(() => {
    return contractLedgers
      .filter(
        (l) =>
          l.contractNature === 'procurement' &&
          l.contractTier !== 'supplement' &&
          (l.status === 'draft' ||
            l.status === 'pending' ||
            l.status === 'approved' ||
            l.status === 'active'),
      )
      .map((l) => ({
        value: l.id,
        label: `${l.contractNo} — ${l.contractName}（¥${(l.amount || 0).toLocaleString()}）`,
      }));
  }, [contractLedgers]);

  // ========== 状态筛选 ==========
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ========== 🆕 中标供应商提取（从需求关联工单的中标结果带出供应商） ==========
  /**
   * 汇总工单内全部中标供应商 —— 任何采购方式的需求都可能定标给多家，不预设单/多：
   * - 明细级多中标数组：items[].winningSuppliers[]（含旧单值字段兜底）
   * - 工单顶层单值：winningSupplierId/Name、randomSupplierId/Name
   * - 明细级供应商名：offlineDetails[].supplierName
   * 最后按名称去重 + 在供应商档案里按名称反查修正真实档案 ID（绕开工单侧 SUP001 vs 档案 SUP-001 的格式不一致）
   */
  const extractWinningSuppliers = (bidding?: Bidding): Array<{ supplierId: string; supplierName: string }> => {
    if (!bidding) return [];
    const raw: Array<{ supplierId: string; supplierName: string }> = [];

    (bidding.items || []).forEach((it) => {
      (it.winningSuppliers || []).forEach((w) =>
        raw.push({ supplierId: w.supplierId, supplierName: w.supplierName })
      );
      if (!(it.winningSuppliers || []).length && it.winningSupplierName) {
        raw.push({ supplierId: '', supplierName: it.winningSupplierName });
      }
    });
    if (bidding.randomSupplierName) {
      raw.push({ supplierId: bidding.randomSupplierId || '', supplierName: bidding.randomSupplierName });
    }
    if (bidding.winningSupplierName) {
      raw.push({ supplierId: bidding.winningSupplierId || '', supplierName: bidding.winningSupplierName });
    }
    (bidding.offlineDetails || []).forEach((d) => {
      if (d.supplierName) raw.push({ supplierId: '', supplierName: d.supplierName });
    });

    // 按名称去重
    const seen = new Set<string>();
    const deduped = raw.filter((r) => {
      if (!r.supplierName || seen.has(r.supplierName)) return false;
      seen.add(r.supplierName);
      return true;
    });

    // 名称反查供应商档案修正 ID（档案匹配不到就保留工单侧原值）
    return deduped.map((r) => {
      const hit = suppliers.find((s) => s.name === r.supplierName);
      return { supplierId: hit?.id || r.supplierId, supplierName: r.supplierName };
    });
  };

  // ========== 弹窗状态 ==========
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContractLedger | null>(null);
  const [form, setForm] = useState<Partial<ContractLedger>>({});

  // ========== 补充序号自动计算（依赖 form.parentContractId，所以必须在 form 声明之后）==========
  const currentSupplementCount = useMemo(() => {
    if (!form.parentContractId) return 0;
    return contractLedgers.filter(
      (l) =>
        l.parentContractId === form.parentContractId &&
        l.contractTier === 'supplement',
    ).length;
  }, [contractLedgers, form.parentContractId]);

  const filteredList = useMemo(() => {
    if (statusFilter === 'all') return list;
    return list.filter((l) => l.status === statusFilter);
  }, [list, statusFilter]);

  // ========== 打开新增 ==========
  const openAdd = () => {
    setEditing(null);
    setForm({
      contractNature: 'procurement',
      contractTier: 'primary',
      supplementAmount: undefined,
      supplementType: 'price_change',
      supplementIndex: 1,
      formation: 'state_owned_xunbi',
      contractType: 'non_engineering',
      isModelText: true,
      archiveStatus: 'not_started',
      status: 'draft',
      guaranteeEvaluation: { isOpen: false },
      assessmentManagement: [],
      yearlyEvaluation: false,
      enableExpireAlert: true,
      businessCategory: undefined,
      isOnsite: undefined,
      priceType: 'incl_tax',       // 🆕 默认按含税价签
      taxRate: 0.13,               // 🆕 默认税率 13%
    });
    setModalOpen(true);
  };

  // ========== 打开编辑草稿 ==========
  const openEdit = (row: ContractLedger) => {
    // 🆕 一合同一供应商：历史数据兜底——明细记录涉及多家供应商时，锁定第一家并剔除其他家（避免保存被硬校验拦死）
    const links = row.detailLinks ?? [];
    const firstSid = links.find((l) => l.supplierId)?.supplierId;
    let fixed = row;
    if (links.length > 0 && firstSid && links.some((l) => l.supplierId !== firstSid)) {
      fixed = { ...row, supplierId: row.supplierId || firstSid, detailLinks: links.filter((l) => l.supplierId === firstSid) };
    }
    setEditing(fixed);
    setForm({ ...fixed });
    setModalOpen(true);
  };

  // ========== 字段更新 ==========
  const update = (patch: Partial<ContractLedger>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // ========== 保存 ==========
  const save = (submit: boolean) => {
    const now = getNowString();

    // 🆕 防重复签约：每条「明细+中标供应商」记录只能被一份合同占用（编辑时排除本合同自身）
    const conflict = (form.detailLinks ?? []).some((l) => {
      if (!l.supplierId) return false;
      return contractLedgers.some((c) => {
        if (editing && c.id === editing.id) return false;
        return (c.detailLinks ?? []).some(
          (o) => o.detailId === l.detailId && o.supplierId && o.supplierId === l.supplierId
        );
      });
    });
    if (conflict) {
      alert('勾选的明细中标记录已被其他合同签约（每条中标记录只能签一份合同），请取消勾选后再保存！');
      return;
    }

    // 🆕 一合同一供应商：勾选记录必须全部属于本合同供应商
    if ((form.detailLinks ?? []).some((l) => l.supplierId && l.supplierId !== form.supplierId)) {
      alert('一份合同只能签一个供应商：勾选中包含其他供应商的中标记录，请取消勾选后再保存！');
      return;
    }
    if ((form.detailLinks ?? []).length > 0 && !form.supplierId) {
      alert('请先选择本合同供应商（一份合同对应一个供应商）！');
      return;
    }

    const finalForm: Partial<ContractLedger> = {
      ...form,
      contractNature: 'procurement', // 强制兜底
      status: submit ? 'pending' : 'draft',
    };

    if (editing) {
      updateContractLedger(editing.id, finalForm);
    } else {
      // 自动生成合同编号（HT + YYYYMMDD + 3位），除非用户手动填了
      const existingNos = contractLedgers.map((c) => c.contractNo).filter(Boolean);
      const autoContractNo = finalForm.contractNo?.trim() || genSerialNo(SERIAL_CONFIG.CONTRACT, existingNos);

      const newLedger: ContractLedger = {
        id: 'CL' + Date.now() + Math.random().toString(36).slice(2, 7),
        contractId: autoContractNo,
        contractNo: autoContractNo,
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
        businessCategory: finalForm.businessCategory,
        archiveStatus: finalForm.archiveStatus ?? 'not_started',
        remark: finalForm.remark,
        status: finalForm.status as ContractLedger['status'],
        biddingId: finalForm.biddingId,
        biddingNo: finalForm.biddingNo,
        projectName: finalForm.projectName,
        guaranteeEvaluation: finalForm.guaranteeEvaluation ?? { isOpen: false },
        assessmentManagement: finalForm.assessmentManagement ?? [],
        yearlyEvaluation: finalForm.yearlyEvaluation ?? false,
        enableExpireAlert: finalForm.enableExpireAlert ?? true,
        enablePaidAlert: finalForm.enablePaidAlert ?? true,
        enableEvalAlert: finalForm.enableEvalAlert ?? true,
        isOnsite: finalForm.isOnsite,
        detailLinks: finalForm.detailLinks ?? [],
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
      approved: list.filter((l) => ['approved', 'active'].includes(l.status)).length,
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
          <div className="flex items-center gap-2">
            <FeatureHelpButton content={PROCUREMENT_HELP.contractProcurement} />
            <PrimaryButton onClick={openAdd}>+ 新增招采类合同</PrimaryButton>
          </div>
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
                <th className="px-4 py-3 font-medium text-right">合同金额(元)</th>
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
                      <Badge variant={row.contractTier === 'supplement' ? 'warning' : 'info'}>
                        招采类 · {row.contractTier === 'supplement' ? '补充协议' : '主合同'}
                      </Badge>
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
                        {(row.status === 'pending' || row.status === 'approved' || row.status === 'active') && (
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
          contractLedgers={contractLedgers}
          primaryOptions={primaryOptions}
          currentSupplementCount={currentSupplementCount}
          suppliers={suppliers}
          extractWinningSuppliers={extractWinningSuppliers}
          editing={editing}
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
  contractLedgers: ContractLedger[];
  primaryOptions: Array<{ value: string; label: string }>;
  currentSupplementCount: number;
  /** 供应商档案（对方单位下拉候选） */
  suppliers: Supplier[];
  /** 从工单中标结果提取供应商（含名称反查档案修正 ID） */
  extractWinningSuppliers: (bidding?: Bidding) => Array<{ supplierId: string; supplierName: string }>;
  /** 当前正在编辑的合同（防重复签约时排除自身占用；新增时为 null） */
  editing: ContractLedger | null;
}

function ContractProcurementForm({ form, update, biddings, procurementDemands, isEdit, contractLedgers, primaryOptions, currentSupplementCount, suppliers, extractWinningSuppliers, editing }: FormProps) {
  const formationOptions = Object.entries(PROCUREMENT_FORMATION_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const contractTypeOptions = Object.entries(PROCUREMENT_CONTRACT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  // 🆕 PL-01: 子组件内的明细相关数据（供 JSX 中标记录勾选表格使用）
  const currentDemand = form.demandId
    ? procurementDemands.find((d) => d.id === form.demandId) ?? null
    : null;

  // 需求关联的招采工单
  const currentBidding = currentDemand
    ? biddings.find((b) => b.id === currentDemand.relatedOrderId || b.demandId === currentDemand.id) ?? null
    : null;

  // ===== 🆕 需求级多家中标：每家中标供应商一行（一份需求可签多个供应商，每家一份合同） =====
  // 占用维度 = 需求×供应商（该供应商在本需求已有合同 → 已占用；编辑时排除本合同自身）
  const occupiedSupplierMap = new Map<string, string>(); // key: demandId|supplierId → 占用合同编号
  contractLedgers.forEach((c) => {
    if (editing && c.id === editing.id) return;
    (c.detailLinks ?? []).forEach((l) => {
      if (l.demandId && l.supplierId && !occupiedSupplierMap.has(`${l.demandId}|${l.supplierId}`)) {
        occupiedSupplierMap.set(`${l.demandId}|${l.supplierId}`, c.contractNo || c.contractName || '');
      }
    });
  });

  /** 从工单提取需求级中标供应商名单（每家含口径价与税率：taxRate 有值=按含税价签，空=按不含税价签） */
  const extractDemandWinners = (bidding: (typeof biddings)[number] | null): Array<{
    supplierId: string; supplierName: string; unitPrice: number; taxRate?: number;
  }> => {
    if (!bidding) return [];
    const top = (bidding.winningSuppliers || []) as Array<{ supplierId: string; supplierName: string; unitPrice: number; taxRate?: number }>;
    if (top.length > 0) return top;
    // 兜底：明细行中标名单去重
    const dedup = new Map<string, { supplierId: string; supplierName: string; unitPrice: number; taxRate?: number }>();
    [...(bidding.items || []), ...((bidding as any).offlineDetails || [])].forEach((line: any) => {
      (line.winningSuppliers || []).forEach((w: any) => {
        if (!dedup.has(w.supplierId)) dedup.set(w.supplierId, { supplierId: w.supplierId, supplierName: w.supplierName, unitPrice: w.unitPrice || 0, taxRate: w.taxRate });
      });
    });
    if (dedup.size === 0 && (bidding as any).winningSupplierName) {
      // 旧单值兜底：旧数据只有含税价 → 默认含税 13% 口径
      const sid = suppliers.find((s) => s.name === (bidding as any).winningSupplierName)?.id || '';
      const price = (bidding as any).execUnitPriceIncludingTax ?? (bidding as any).unitPriceIncludingTax ?? 0;
      if (sid) dedup.set(sid, { supplierId: sid, supplierName: (bidding as any).winningSupplierName, unitPrice: price, taxRate: 0.13 });
    }
    return Array.from(dedup.values());
  };

  // 本需求的中标供应商行（含占用状态）+ 当前选中供应商的中标记录
  const winningSupplierRows = extractDemandWinners(currentBidding).map((w) => ({
    ...w,
    signedBy: form.demandId ? occupiedSupplierMap.get(`${form.demandId}|${w.supplierId}`) : undefined,
  }));
  const selectedWinRow = winningSupplierRows.find((r) => r.supplierId === form.supplierId) || null;

  // 🆕 口径换算：含税 → 不含税 = 含税 / (1 + 税率)
  const inclToExcl = (inclPrice: number, taxRate: number | undefined) => inclPrice / (1 + (taxRate ?? 0.13));

  /**
   * 🆕 按中标供应商生成合同明细关联（一份合同自动关联该需求全部明细，无需手动勾选明细）
   * 签约口径取自招采执行定标：中标时填了税率 → 按含税价签；没填税率 → 按不含税价签
   */
  const buildLinksForSupplier = (demand: (typeof procurementDemands)[number], row: { supplierId: string; unitPrice: number; taxRate?: number }) => {
    const incl = row.taxRate != null;
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return (demand.details ?? []).map((d) => ({
      demandId: demand.id,
      demandNo: demand.demandNo,
      detailId: d.id,
      supplierId: row.supplierId,
      unitPrice: row.unitPrice,               // 口径单价（即合同单价）
      priceType: incl ? ('incl_tax' as const) : ('excl_tax' as const),
      unitPriceExcludingTax: incl ? r2(inclToExcl(row.unitPrice, row.taxRate)) : r2(row.unitPrice),
    }));
  };

  // 🆕 选择本合同供应商：签约口径自动取自招采执行（填了税率=按含税价签），明细关联自动生成，金额自动计算
  const handleContractSupplierChange = (sid: string) => {
    if (!currentDemand) return;
    const row = winningSupplierRows.find((r) => r.supplierId === sid);
    if (!sid || !row) {
      const sup = (suppliers as Supplier[]).find((s) => s.id === sid);
      update({ supplierId: sid || undefined, counterpartyName: sup?.name || '', detailLinks: [] });
      return;
    }
    const incl = row.taxRate != null;
    const r2 = (v: number) => Math.round(v * 100) / 100;
    const links = buildLinksForSupplier(currentDemand, row);
    const total = (currentDemand.details ?? []).reduce((s, d) => s + row.unitPrice * d.quantity, 0);
    update({
      supplierId: sid,
      counterpartyName: row.supplierName,
      priceType: incl ? 'incl_tax' : 'excl_tax',
      taxRate: incl ? row.taxRate : undefined,
      detailLinks: links,
      amount: r2(total),
    });
  };

  // ===== 🆕 一合同一供应商 =====
  // 计算某需求下「可签」的中标供应商名单（本需求已被其他合同签约的供应商排除；编辑时排除本合同自身）
  const computeSignableSuppliers = (demand: (typeof procurementDemands)[number], bidding: (typeof biddings)[number] | null) => {
    const occ = new Set<string>();
    contractLedgers.forEach((c) => {
      if (editing && c.id === editing.id) return;
      (c.detailLinks ?? []).forEach((l) => { if (l.demandId === demand.id && l.supplierId) occ.add(l.supplierId); });
    });
    return extractDemandWinners(bidding).filter((w) => w.unitPrice > 0 && !occ.has(w.supplierId));
  };

  // 本合同供应商下拉：仅列出「未被他合同签约」的中标供应商（全部签完的不出现）
  const contractSupplierOptions = [
    { value: '', label: '-- 请选择本合同供应商（一份合同对应一个供应商）--' },
    ...winningSupplierRows.filter((r) => r.supplierId && !r.signedBy).map((r) => ({
      value: r.supplierId,
      label: r.supplierName,
    })),
  ];

  // ========== 招采工单自动带入 ==========
  // ========== 关联采购需求自动带入 ==========
  // 需求背景：立项确认 needContract='yes' 的需求走标准链路 → 建工单 → 建合同
  //          合同表单选"关联采购需求"后自动从工单带入数据
  const handleDemandChange = (demandId: string) => {
    const demand = procurementDemands.find((d) => d.id === demandId);
    if (!demand) return;
    // 需求关联的工单
    const bidding = biddings.find((b) => b.id === demand.relatedOrderId || b.demandId === demand.id);
    // 需求类型自动推导：从关联采购需求的 businessCategory 映射
    const autoContractType: ProcurementContractType =
      demand.businessCategory === 'engineering' ? 'engineering' : 'non_engineering';
    // 合同形成方式自动推导：从关联工单的采购方式映射
    const autoFormation: ProcurementFormation | undefined =
      bidding?.procurementMethod ? BIDDING_METHOD_TO_FORMATION[bidding.procurementMethod] : undefined;

    // 🆕 需求级多家中标：默认选中第一家「可签」供应商（本需求未被他合同签约的）
    const signable = computeSignableSuppliers(demand, bidding);
    const defaultSid = signable[0]?.supplierId || '';

    // ====== 自动回填规则：需求有值就覆盖（以需求为准） ======
    const patch: Partial<ContractLedger> = {
      biddingId: bidding?.id || '',
      biddingNo: bidding?.biddingNo || '',
      demandId: demand.id,
      demandNo: demand.demandNo,
      contractType: autoContractType,
      ...(autoFormation ? { formation: autoFormation } : {}),

      // —— 已有（之前就带的）——
      projectName: bidding?.projectName || demand.projectName,
      contractName: bidding?.projectName || demand.projectName || '',
      counterpartyName: defaultSid ? (signable.find((r) => r.supplierId === defaultSid)?.supplierName || '') : '',
      winningDate: bidding?.awardTime || demand.approveTime || '',

      // —— 新增：从需求带 ——
      demandDepartment: demand.applicantDept || '',
      handler: bidding?.procurementHandler || demand.applicant || '',
      mainContent: demand.reason || demand.projectDescription || '',
      terminationDate: demand.requiredDeliveryDate || '',

      // —— 新增：从工单带 ——
      handlingDepartment: bidding?.implementationUnit || '',
      counterpartyContact: bidding?.winningSupplierLegalPerson || '',
      // 🆕 供应商 = 需求物资明细的中标供应商（名称反查档案后的真实档案 ID）
      supplierId: defaultSid,

      // 🆕 合同时间：生效时间 = 中标时间（或现在），有效期默认长期有效
      effectDateTime: bidding?.awardTime || '',
      validityStart: bidding?.awardTime || '',
      isLongTerm: true,
    };

    // 合同金额：需求有预估金额 → 直接带入（现在统一为元，不需要换算）
    if (demand.estimatedAmount != null && demand.estimatedAmount > 0) {
      patch.amount = demand.estimatedAmount;
    }

    // 🆕 需求级多中标：明细关联自动生成（无需手动勾选明细）+ 签约口径取自招采执行定标
    const defaultRow = signable.find((r) => r.supplierId === defaultSid);
    if (defaultRow) {
      const incl = defaultRow.taxRate != null;
      const r2 = (v: number) => Math.round(v * 100) / 100;
      patch.counterpartyName = defaultRow.supplierName;
      patch.priceType = incl ? 'incl_tax' : 'excl_tax';
      patch.taxRate = incl ? defaultRow.taxRate : undefined;
      patch.detailLinks = buildLinksForSupplier(demand, defaultRow);
      patch.amount = r2((demand.details ?? []).reduce((s, d) => s + defaultRow.unitPrice * d.quantity, 0));
    } else {
      patch.detailLinks = [];
    }

    update(patch);
  };

  /**
   * 关联采购需求下拉选项
   * 筛选条件：needContract='yes'（走标准链路的）且已立项通过且有工单
   * ⚠️ needContract='no_link'/'no_none' 的需求不进入合同签订链路
   */
  const demandOptions = [
    { value: '', label: '-- 选择关联采购需求（可选）--' },
    ...procurementDemands
      .filter((d) => {
        const nc = d.needContract ?? 'yes';
        return nc === 'yes'; // 只有 yes 走标准链路进合同签订
      })
      .filter((d) => d.status === 'confirm_approved')
      // 电子商城 / 直接采购 不签订合同：这两种采购方式不进入招采合同签订流程
      .filter((d) => {
        const linkedBidding = biddings.find((b) => b.id === d.relatedOrderId || b.demandId === d.id);
        const m = linkedBidding?.procurementMethod;
        return m !== 'e_mall' && m !== 'direct';
      })
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
          {/* ===== 合同层级字段组 — 最顶部 ===== */}
          <ContractTierField
            tier={form.contractTier || 'primary'}
            onChangeTier={(t) =>
              update({
                contractTier: t,
                // 切换成补充协议时，自动带序号；切回主合同时清掉
                supplementIndex:
                  t === 'supplement' ? (currentSupplementCount + 1) : 1,
                parentContractId: t === 'supplement' ? form.parentContractId : undefined,
              })
            }
            contractNature="procurement"
            primaryOptions={primaryOptions}
            parentContractId={form.parentContractId}
            onChangeParent={(id) =>
              update({
                parentContractId: id,
                // 切换主合同后自动重新算补充序号
                supplementIndex: id
                  ? contractLedgers.filter(
                      (l) =>
                        l.parentContractId === id &&
                        l.contractTier === 'supplement',
                    ).length + 1
                  : 1,
              })
            }
            supplementAmount={form.supplementAmount}
            onChangeSupplementAmount={(v) => update({ supplementAmount: v })}
            supplementType={form.supplementType}
            onChangeSupplementType={(v) => update({ supplementType: v })}
            supplementIndex={form.supplementIndex}
            onChangeSupplementIndex={(v) => update({ supplementIndex: v })}
            disabled={isEdit}
          />

          {/* ===== 第一行：关联采购需求 + 合同名称 — 关联需求优先 ===== */}
          {/* 关联采购需求（needContract='yes' 的已立项通过需求）*/}
          {/* 需求背景：合同表单选关联采购需求后，自动从关联工单带入需求类型、合同形成方式、对方单位、中标时间等字段 */}
          <Select
            label="关联采购需求"
            options={demandOptions}
            value={form.demandId || ''}
            onChange={(e) => handleDemandChange(e.target.value)}
            placeholder="选了之后自动从工单带入类型/方式/对方单位/中标时间"
          />

          {/* 🆕 按中标记录签约：需求明细 × 各家中标 展开成行，每条记录只能被一份合同占用 */}
          {form.demandId && winningSupplierRows.length > 0 && (
            <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              {/* 🆕 一合同一供应商：先选供应商，自动全勾其可签记录；其他供应商禁用置灰 */}
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                <label className="text-sm font-semibold text-amber-900 whitespace-nowrap">
                  本合同供应商 <span className="text-red-500">*</span>
                </label>
                <div className="w-64">
                  <Select
                    options={contractSupplierOptions}
                    value={form.supplierId || ''}
                    onChange={(e) => handleContractSupplierChange(e.target.value)}
                    placeholder="一份合同对应一个供应商"
                  />
                </div>
                <span className="text-xs text-amber-700">
                  选定后自动带出签约口径与合同金额；其他中标供应商请分别新建合同
                </span>
              </div>

              {/* 🆕 签约口径：自动取自招采执行定标（中标时填了税率=按含税价签；没填=按不含税价签），只读不可改 */}
              {form.supplierId && selectedWinRow ? (
                <div className="rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50/40 px-4 py-3 mb-3">
                  <div className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                    📌 本合同签约口径（自动取自招采执行定标，不可修改）
                  </div>
                  <div className="mt-2 flex items-center gap-3 flex-wrap text-[13px]">
                    {selectedWinRow.taxRate != null ? (
                      <>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-700 font-semibold text-xs">
                          按含税价签（税率 {(selectedWinRow.taxRate * 100).toFixed(0)}%）
                        </span>
                        <span className="text-slate-600">该供应商中标时已填税率</span>
                        <span className="text-slate-600">含税单价 <b className="text-indigo-700">¥{selectedWinRow.unitPrice.toFixed(2)}</b></span>
                        <span className="text-slate-500">不含税 ¥{inclToExcl(selectedWinRow.unitPrice, selectedWinRow.taxRate).toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 font-semibold text-xs">
                          按不含税价签
                        </span>
                        <span className="text-slate-600">该供应商中标时未填税率</span>
                        <span className="text-slate-600">不含税单价 <b className="text-emerald-700">¥{selectedWinRow.unitPrice.toFixed(2)}</b></span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    💰 合同金额（自动）= 口径单价 × 需求各明细数量合计；本需求每家中标供应商各签一份合同
                  </div>
                </div>
              ) : form.supplierId ? (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 mb-3">
                  ⚠ 该供应商不在本需求的中标名单中，请从下拉中选择中标供应商
                </div>
              ) : (
                <div className="text-xs text-slate-400 mb-3">请先选择本合同供应商，签约口径将自动从招采执行定标带出</div>
              )}

            </div>
          )}

          {/* 合同名称* */}
          <Input
            label="合同名称 *"
            required
            value={form.contractName || ''}
            onChange={(e) => update({ contractName: e.target.value })}
            placeholder="招采类合同名称"
          />

          {/* 🆕 所属项目：选关联需求后自动从需求 projectName 带出（台账列表、预警按项目归类用），可编辑 */}
          <Input
            label="所属项目"
            value={form.projectName || ''}
            onChange={(e) => update({ projectName: e.target.value })}
            placeholder={form.demandId ? '已从关联需求自动带出' : '选关联需求后自动带出，也可手动填写'}
          />

          {/* ===== 第二行：需求类型 + 合同形成方式 — 选了关联采购需求后自动带出并锁定 ===== */}
          <Select
            label="需求类型 *"
            required
            disabled={!!form.demandId}
            options={contractTypeOptions}
            value={form.contractType as string || ''}
            onChange={(e) => update({ contractType: e.target.value as ProcurementContractType })}
            placeholder={form.demandId ? '由关联采购需求自动带入' : '选择需求类型'}
          />
          <Select
            label="合同形成方式 *"
            required
            disabled={!!form.demandId}
            options={formationOptions}
            value={form.formation as string || ''}
            onChange={(e) => update({ formation: e.target.value as ProcurementFormation })}
            placeholder={form.demandId ? '由关联采购需求自动带入' : '选择合同形成方式'}
          />

          {/* ===== 第三行：合同编号 + 中标时间 ===== */}
          <Input
            label="合同编号 *"
            required
            value={form.contractNo || ''}
            onChange={(e) => update({ contractNo: e.target.value })}
            placeholder="手工输入，如：HT-202609001"
          />
          <Input
            label="中标时间"
            type="date"
            value={form.winningDate || ''}
            onChange={(e) => update({ winningDate: e.target.value })}
          />

          {/* 🆕 生效时间（精确到时分） */}
          <div className="w-64">
            <label className="block text-[13px] font-medium text-slate-700 mb-1">
              合同生效时间
              <span className="text-slate-400 font-normal">（精确到时分）</span>
            </label>
            <input
              type="datetime-local"
              value={form.effectDateTime || ''}
              onChange={(e) => update({ effectDateTime: e.target.value })}
              className="h-9 px-3 w-full border border-slate-300 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              step="60"
            />
          </div>

          {/* 🆕 合同有效期（起止 + 长期开关） */}
          <div className="w-full">
            <label className="block text-[13px] font-medium text-slate-700 mb-1">
              合同有效期
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="datetime-local"
                value={form.validityStart || ''}
                onChange={(e) => update({ validityStart: e.target.value })}
                className="h-9 px-3 w-52 border border-slate-300 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400"
                step="60"
                placeholder="起始时间"
              />
              <span className="text-slate-400 text-sm">→</span>
              <input
                type="datetime-local"
                disabled={form.isLongTerm === true}
                value={form.validityEnd || ''}
                onChange={(e) => update({ validityEnd: e.target.value })}
                className="h-9 px-3 w-52 border border-slate-300 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400"
                step="60"
                placeholder={form.isLongTerm ? '长期有效（不填）' : '结束时间'}
              />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isLongTerm === true}
                  onChange={(e) => update({
                    isLongTerm: e.target.checked,
                    validityEnd: e.target.checked ? undefined : form.validityEnd,
                  })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-sm text-slate-700">长期有效</span>
              </label>
            </div>
          </div>

          {/* ===== 第四行：示范文本 + 是否展会现场相关 ===== */}
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
          {/* 是否展会现场相关 */}
          <div className="flex items-end gap-3 pb-2">
            <span className="text-sm text-slate-700">是否展会现场相关</span>
            <button
              type="button"
              onClick={() => update({ isOnsite: !form.isOnsite })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                form.isOnsite ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  form.isOnsite ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-xs ${form.isOnsite ? 'text-indigo-600' : 'text-slate-400'}`}>
              {form.isOnsite ? '是' : '否'}
            </span>
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
              {/* 🆕 方案A：关联供应商档案下拉（选需求自动带中标供应商，可手动改） */}
              {/* 🆕 一合同一供应商：已选需求（有中标供应商）时，切换供应商 = 自动带出签约口径/明细关联/合同金额 */}
              <div>
                <Select
                  label="关联供应商档案"
                  options={
                    form.demandId && winningSupplierRows.length > 0
                      ? contractSupplierOptions
                      : [
                          { value: '', label: '未关联档案（手填下方单位名称）' },
                          ...suppliers.filter((s) => s.status === 'enabled').map((s) => ({
                            value: s.id,
                            label: s.name,
                          })),
                        ]
                  }
                  value={form.supplierId || ''}
                  onChange={(e) => {
                    if (form.demandId && winningSupplierRows.length > 0) {
                      handleContractSupplierChange(e.target.value);
                      return;
                    }
                    const sup = suppliers.find((s) => s.id === e.target.value);
                    // 选中档案 → supplierId 更新 + 单位名称自动同步；清空 → 保留手填名称
                    update({
                      supplierId: e.target.value,
                      ...(sup ? { counterpartyName: sup.name } : {}),
                    });
                  }}
                />
                {form.supplierId && !suppliers.find((s) => s.id === form.supplierId) && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠ 关联的供应商未在档案中找到（可能来自工单侧旧数据），请重新选择
                  </p>
                )}
                {/* 🆕 一合同一供应商：已选需求时供应商下拉只列本需求中标名单（未签约的），明细关联自动生成 */}
              </div>
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
              label="合同金额（元）*"
              required
              type="number"
              step="0.01"
              value={form.amount ?? ''}
              onChange={(e) => update({ amount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0.00"
            />
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
        <div className="grid grid-cols-4 gap-4">
          {/* 履约评价（是/否）— 审批通过后自动关联合同履约评价流程 */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer pt-6">
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
          </div>
          {/* 考核管理（多选勾 —— 与履约评价/年度评价/到期预警统一交互） */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <div className="text-xs font-medium text-amber-900 mb-2">考核管理（可多选，全部不勾 = 不设置）</div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {([
                { key: 'single_project', label: '单个项目考核' },
                { key: 'monthly', label: '月度考核' },
                { key: 'quarterly', label: '季度考核' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!(form.assessmentManagement || []).includes(key)}
                    onChange={(e) => {
                      const cur = form.assessmentManagement || [];
                      const next = e.target.checked
                        ? [...cur, key]
                        : cur.filter((k) => k !== key);
                      update({ assessmentManagement: next });
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-amber-800">{label}</span>
                </label>
              ))}
            </div>
            <div className="text-[11px] text-amber-600 mt-2 leading-relaxed">
              📌 具体考核模板、提醒频率请到
              <span className="font-medium">合同台账 → 考核绑定管理</span> 设置
            </div>
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
          {/* 合同到期预警 */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer pt-6">
              <input
                type="checkbox"
                checked={form.enableExpireAlert ?? true}
                onChange={(e) => update({ enableExpireAlert: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-amber-800">🔔 合同到期预警</span>
            </label>
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          💡 勾选履约评价/考核/年度评价后自动关联后续流程；关闭"合同到期预警"则合同台账顶部到期预警条不显示该合同。
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
