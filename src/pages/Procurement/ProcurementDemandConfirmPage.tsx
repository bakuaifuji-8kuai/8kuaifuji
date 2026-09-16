import { useMemo, useState } from 'react';
import Button from '@/components/common/Button'; import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type {
  ProcurementDemand,
  ProcurementMode,
  ProjectRow,
} from '@/types';

// ============ 业务输入类型 → 表单类型映射 ============
// 5 输入 → 3 表单
type ConfirmFormType = 'material' | 'service' | 'engineering';

function toFormType(demand: ProcurementDemand): ConfirmFormType {
  if (demand.businessCategory === 'engineering' && demand.subType === 'construction') return 'engineering';
  const st = demand.subType || (demand.demandType === 'material' ? 'goods' : 'service');
  if (st === 'goods') return 'material';
  if (st === 'service') return 'service';
  if (st === 'construction') return 'engineering';
  // 兜底
  if (demand.demandType === 'material') return 'material';
  if (demand.demandType === 'implementation_project') return 'engineering';
  return 'service';
}

const FORM_TYPE_LABEL: Record<ConfirmFormType, string> = {
  material: '物资类',
  service: '服务类',
  engineering: '工程类',
};

const BUSINESS_TYPE_LABEL: Record<string, string> = {
  'engineering/construction': '工程类 / 施工',
  'engineering/service': '工程类 / 服务',
  'engineering/goods': '工程类 / 货物',
  'non_engineering/service': '非工程类 / 服务',
  'non_engineering/goods': '非工程类 / 货物',
};

function getBusinessTypeLabel(d: ProcurementDemand): string {
  if (d.businessCategory && d.subType) {
    return BUSINESS_TYPE_LABEL[`${d.businessCategory}/${d.subType}`] || d.demandType;
  }
  return d.demandType;
}

// 立项方式选项
const MODE_OPTIONS: { value: ProcurementMode; label: string; desc: string; color: string }[] = [
  { value: 'meeting', label: '会议审批', desc: '适用于需要召开立项审批会议的重大项目', color: 'text-blue-600' },
  { value: 'sign_report', label: '签报审批', desc: '适用于以签报形式流转的中小型采购', color: 'text-amber-600' },
  { value: 'application_form', label: '采购项目申请表', desc: '适用于标准化采购项目申请', color: 'text-emerald-600' },
];

// 状态筛选 Tab
const STATUS_TABS: { key: string; label: string; color: string }[] = [
  { key: 'approved', label: '待立项', color: 'text-slate-600' },
  { key: 'confirm_pending', label: '立项审批中', color: 'text-amber-600' },
  { key: 'confirm_approved', label: '已立项通过', color: 'text-emerald-600' },
  { key: 'confirm_rejected', label: '已驳回', color: 'text-rose-600' },
];

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  approved: { label: '待立项', cls: 'bg-slate-100 text-slate-600' },
  confirm_pending: { label: '立项审批中', cls: 'bg-amber-100 text-amber-700' },
  confirm_approved: { label: '已立项通过', cls: 'bg-emerald-100 text-emerald-700' },
  confirm_rejected: { label: '立项已驳回', cls: 'bg-rose-100 text-rose-700' },
};

export default function ProcurementDemandConfirmPage() {
  const { procurementDemands, updateProcurementDemand, currentUser } = useStore();

  // ============ 状态 ============
  const [activeTab, setActiveTab] = useState('approved');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState<ProcurementMode>('meeting');
  const [isThreeImportant, setIsThreeImportant] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([]);
  // 附件（简化为文件名列表，演示用）
  const [attachments, setAttachments] = useState<string[]>([]);

  // ============ 左侧列表过滤 ============
  const filteredDemands = useMemo(() => {
    return procurementDemands
      .filter((d) => d.status === activeTab)
      .sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  }, [procurementDemands, activeTab]);

  // ============ 选中的需求 ============
  const selected = useMemo(() => {
    if (!selectedId) return null;
    return procurementDemands.find((d) => d.id === selectedId) || null;
  }, [procurementDemands, selectedId]);

  const formType = selected ? toFormType(selected) : null;

  // ============ 选中需求时初始化表单 ============
  const handleSelect = (d: ProcurementDemand) => {
    setSelectedId(d.id);
    // 用已有的 procurementMode，没有就默认 meeting
    setConfirmMode(d.procurementMode || 'meeting');
    setIsThreeImportant(d.isThreeImportant || false);
    setProjectRows(
      d.projectRows?.length
        ? d.projectRows
        : d.demandType !== 'material'
        ? [{
            id: 'PR' + Date.now(),
            dept: d.applicantDept || '',
            projectName: d.projectName || '',
            mainContent: '',
            budgetAmount: 0,
            budgetControlAmount: 0,
            approvalDate: '',
            remark: '',
          }]
        : []
    );
    setRejectReason('');
  };

  // ============ 提交立项 ============
  const handleSubmitConfirm = () => {
    if (!selected) return;

    // 基础校验
    if (selected.demandType !== 'material') {
      if (projectRows.length === 0) {
        alert('请至少添加一行项目明细');
        return;
      }
      for (const r of projectRows) {
        if (!r.dept || !r.projectName || !r.budgetAmount) {
          alert('请完整填写所有项目行的需求部门、项目名称、预算总金额');
          return;
        }
      }
    }

    updateProcurementDemand(selected.id, {
      procurementMode: confirmMode,
      isThreeImportant,
      projectRows: projectRows.length > 0 ? projectRows : undefined,
      confirmSubmitter: currentUser.name,
      confirmSubmitTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'confirm_pending',
    });
    alert('立项申请已提交，请等待立项审批');
  };

  // ============ 审批通过 ============
  const handleConfirmApprove = () => {
    if (!selected) return;
    updateProcurementDemand(selected.id, {
      status: 'confirm_approved',
      confirmApprover: currentUser.name,
      confirmApproveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    alert('已立项通过，下游系统可见此需求');
  };

  // ============ 驳回 ============
  const handleConfirmReject = () => {
    if (!selected || !rejectReason.trim()) {
      alert('请填写驳回原因');
      return;
    }
    updateProcurementDemand(selected.id, {
      status: 'confirm_rejected',
      confirmRejectReason: rejectReason.trim(),
      confirmRejectTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    setRejectModalOpen(false);
    setRejectReason('');
  };

  // ============ 重提立项 ============
  const handleResubmit = () => {
    if (!selected) return;
    updateProcurementDemand(selected.id, {
      status: 'confirm_pending',
      confirmSubmitter: currentUser.name,
      confirmSubmitTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      confirmRejectReason: undefined,
      confirmRejectTime: undefined,
    });
  };

  // ============ projectRows 操作 ============
  const addProjectRow = () => {
    setProjectRows([
      ...projectRows,
      {
        id: 'PR' + Date.now() + Math.random().toString(36).slice(2, 6),
        dept: selected?.applicantDept || '',
        projectName: '',
        mainContent: '',
        budgetAmount: 0,
        budgetControlAmount: 0,
        approvalMeetingName: '',
        approvalDate: '',
        remark: '',
      },
    ]);
  };
  const removeProjectRow = (idx: number) => {
    setProjectRows(projectRows.filter((_, i) => i !== idx));
  };
  const updateProjectRow = (idx: number, field: keyof ProjectRow, value: any) => {
    const arr = [...projectRows];
    (arr[idx] as any)[field] = value;
    setProjectRows(arr);
  };

  // ============ 渲染 ============
  return (
    <div className="flex h-full gap-4 p-4">
      {/* ============ 左侧列表 ============ */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 w-[420px] flex-shrink-0">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">招采需求确认管理</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            申请审批通过后，在此完成立项信息填写与审批
          </p>
        </div>

        {/* Tab 筛选 */}
        <div className="flex border-b border-slate-100">
          {STATUS_TABS.map((tab) => {
            const count = procurementDemands.filter((d) => d.status === tab.key).length;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-2 py-2.5 text-xs font-medium transition-all relative ${
                  active
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-auto">
          {filteredDemands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-sm">暂无{STATUS_TABS.find((t) => t.key === activeTab)?.label}的需求</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredDemands.map((d) => {
                const st = STATUS_LABEL[d.status] || STATUS_LABEL.approved;
                const sel = selectedId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSelect(d)}
                    className={`w-full text-left px-4 py-3 transition-all border-l-2 ${
                      sel
                        ? 'bg-indigo-50/60 border-indigo-500'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-slate-800 truncate">
                          {d.projectName || '(未命名)'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{d.demandNo}</div>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                        {getBusinessTypeLabel(d)}
                      </span>
                      <span className="truncate">
                        {d.applicantDept} · {d.applicant}
                      </span>
                    </div>
                    {d.confirmRejectReason && (
                      <div className="mt-1.5 text-xs text-rose-500 line-clamp-1">
                        驳回：{d.confirmRejectReason}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============ 右侧详情+表单 ============ */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-6xl mb-4">👈</div>
            <div className="text-base font-medium text-slate-500">从左侧选择一个需求</div>
            <div className="text-sm mt-1">开始立项信息填写与审批流程</div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* --- 需求只读信息 --- */}
            <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 rounded-xl p-5 border border-indigo-100/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-indigo-600 font-medium mb-1">需求编号</div>
                  <div className="font-mono text-sm text-slate-700">{selected.demandNo}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${(STATUS_LABEL[selected.status] || STATUS_LABEL.approved).cls}`}>
                  {(STATUS_LABEL[selected.status] || STATUS_LABEL.approved).label}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mt-3">{selected.projectName || '(未命名)'}</h3>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">业务类型</div>
                  <div className="text-slate-700">{getBusinessTypeLabel(selected)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">表单类型</div>
                  <div className="text-slate-700 font-medium">{FORM_TYPE_LABEL[formType!]}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">框架采购</div>
                  <div className="text-slate-700">
                    {selected.procurementType === 'within_framework' ? '清单内' : selected.procurementType === 'outside_framework' ? '清单外' : '新增供应商'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">申请人</div>
                  <div className="text-slate-700">{selected.applicant}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">申请部门</div>
                  <div className="text-slate-700">{selected.applicantDept}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">申请时间</div>
                  <div className="text-slate-700 text-xs">{selected.createTime}</div>
                </div>
              </div>
              {/* 物资清单汇总 */}
              {selected.details?.length > 0 && formType === 'material' && (
                <div className="mt-4 pt-4 border-t border-indigo-100/60">
                  <div className="text-xs text-slate-500 mb-2">物资明细清单 · {selected.details.length} 项</div>
                  <div className="grid grid-cols-4 gap-3">
                    {selected.details.slice(0, 8).map((d) => (
                      <div key={d.id} className="bg-white rounded-lg px-3 py-2 text-xs border border-indigo-100/50">
                        <div className="font-medium text-slate-700 truncate">{d.productName}</div>
                        <div className="text-slate-500 mt-0.5">{d.productCode} · ×{d.quantity}</div>
                      </div>
                    ))}
                    {selected.details.length > 8 && (
                      <div className="flex items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        +{selected.details.length - 8} 项
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- 立项方式选择 --- */}
            {(selected.status === 'approved' || selected.status === 'confirm_rejected') && (
              <div>
                <div className="text-sm font-semibold text-slate-800 mb-3">
                  立项审批方式 <span className="text-rose-500">*</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {MODE_OPTIONS.map((opt) => {
                    const selectedMode = confirmMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setConfirmMode(opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedMode
                            ? 'border-indigo-500 bg-indigo-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${selectedMode ? opt.color.replace('600', '700') : opt.color}`}>
                            {opt.label}
                          </span>
                          {selectedMode && (
                            <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-white" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- 三重一大 --- */}
            {(selected.status === 'approved' || selected.status === 'confirm_rejected') && (
              <label className="flex items-center gap-3 px-4 py-3 bg-amber-50/50 rounded-xl border border-amber-200/60 cursor-pointer hover:bg-amber-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isThreeImportant}
                  onChange={(e) => setIsThreeImportant(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <div>
                  <div className="text-sm font-medium text-amber-800">是否属于"三重一大"事项</div>
                  <div className="text-xs text-amber-600/80 mt-0.5">三种立项方式均需勾选</div>
                </div>
              </label>
            )}

            {/* --- 立项字段矩阵 --- */}
            {(selected.status === 'approved' || selected.status === 'confirm_rejected' || selected.status === 'confirm_pending') && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-800">
                  立项信息 · {FORM_TYPE_LABEL[formType!]} × {MODE_OPTIONS.find((m) => m.value === confirmMode)?.label}
                </div>
                <ConfirmFormFields
                  formType={formType!}
                  mode={confirmMode}
                  projectRows={projectRows}
                  setProjectRows={setProjectRows}
                  addProjectRow={addProjectRow}
                  removeProjectRow={removeProjectRow}
                  updateProjectRow={updateProjectRow}
                  readOnly={selected.status === 'confirm_approved' || selected.status === 'confirm_pending'}
                />
              </div>
            )}

            {/* --- 操作区 --- */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {/* 左侧：已驳回显示驳回原因 */}
              {selected.status === 'confirm_rejected' && selected.confirmRejectReason && (
                <div className="text-sm text-rose-600">
                  上次驳回原因：{selected.confirmRejectReason}
                </div>
              )}
              {selected.status === 'confirm_approved' && (
                <div className="text-sm text-emerald-600">
                  立项审批通过 · {selected.confirmApprover} · {selected.confirmApproveTime}
                </div>
              )}
              {selected.status === 'confirm_pending' && (
                <div className="text-sm text-amber-600">
                  立项申请中 · 提交人 {selected.confirmSubmitter} · {selected.confirmSubmitTime}
                </div>
              )}
              {selected.status === 'approved' && (
                <div className="text-sm text-slate-500">
                  请填写立项信息后提交
                </div>
              )}

              {/* 右侧：按钮组 */}
              <div className="flex gap-2 ml-auto">
                {selected.status === 'approved' && (
                  <PrimaryButton onClick={handleSubmitConfirm}>提交立项</PrimaryButton>
                )}
                {selected.status === 'confirm_pending' && (
                  <>
                    <DefaultButton variant="danger" onClick={() => setRejectModalOpen(true)}>驳回</DefaultButton>
                    <PrimaryButton onClick={handleConfirmApprove}>确认通过</PrimaryButton>
                  </>
                )}
                {selected.status === 'confirm_rejected' && (
                  <PrimaryButton onClick={handleResubmit}>重提立项</PrimaryButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ 驳回原因弹窗 ============ */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="立项驳回"
        width="480px"
        footer={
          <>
            <DefaultButton onClick={() => setRejectModalOpen(false)}>取消</DefaultButton>
            <Button variant="danger" onClick={handleConfirmReject}>确认驳回</Button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <div className="text-sm text-slate-600">请填写立项驳回原因：</div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="请输入驳回原因（必填）"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}

// ============ 动态立项字段组件 ============
interface ConfirmFormProps {
  formType: ConfirmFormType;
  mode: ProcurementMode;
  projectRows: ProjectRow[];
  setProjectRows: (rows: ProjectRow[]) => void;
  addProjectRow: () => void;
  removeProjectRow: (idx: number) => void;
  updateProjectRow: (idx: number, field: keyof ProjectRow, value: any) => void;
  readOnly?: boolean;
}

function ConfirmFormFields({
  formType,
  mode,
  projectRows,
  addProjectRow,
  removeProjectRow,
  updateProjectRow,
  readOnly,
}: ConfirmFormProps) {
  const inputCls = "w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500";
  const textareaCls = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-slate-50 disabled:text-slate-500";
  const labelCls = "text-xs text-slate-600 mb-1 font-medium";
  const requiredCls = "text-rose-500 ml-0.5";

  // 双层锁：
  // listLocked  — 需求申请已审批，清单行不可增删、清单字段（dept/projectName/mainContent/budget*）永远只读
  // confirmLocked — 立项审批中/已通过时，立项专属字段也 disabled
  const listLocked = true;
  const confirmLocked = !!readOnly;

  // 服务/工程类确认阶段：若无项目行，自动注入一行空白行供立项字段填写
  // （listLocked=true 表示不能新增删除，但需求申请阶段可能没填过 projectRows）
  let effectiveRows = projectRows;
  if (formType !== 'material' && projectRows.length === 0) {
    effectiveRows = [{
      id: 'PR_AUTO',
      dept: '',
      projectName: '',
      mainContent: '',
      budgetAmount: 0,
      budgetControlAmount: 0,
      approvalMeetingName: '',
      approvalDate: '',
      remark: '',
    }];
  }


  // 根据表单类型和立项方式决定每行列数和显示字段
  const rowCols = formType === 'material'
    ? 'grid grid-cols-2 gap-4'  // 物资类用表单形式
    : null;                     // 服务/工程类用表格

  // 附件字段名映射
  const getRequiredDocs = () => {
    if (mode === 'meeting') return ['会议纪要及上会材料', '用户需求书', '预算审核文件'];
    if (mode === 'sign_report') return ['签报审批相关文件', '预算审核文件', ...(formType !== 'material' ? ['用户需求书/施工方案'] : [])];
    return [...(formType === 'engineering' ? ['用户需求书/施工方案'] : formType === 'service' ? ['用户需求书'] : []), '预算审核文件（可选）'];
  };

  // 物资类用标准表单布局
  if (formType === 'material') {
    return (
      <div className="space-y-4">
        {/* 物资类 × 会议审批：有合资公司字段 */}
        {mode === 'meeting' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelCls}>预算总金额（元）<span className={requiredCls}>*</span></div>
                <input type="number" className={inputCls} disabled={confirmLocked} placeholder="自动关联申请阶段的物资清单" />
              </div>
              <div>
                <div className={labelCls}>预算控制金额（元）<span className={requiredCls}>*</span></div>
                <input type="number" className={inputCls} disabled={confirmLocked} placeholder="请输入预算控制金额" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelCls}>立项审批会议名称<span className={requiredCls}>*</span></div>
                <input className={inputCls} disabled={confirmLocked} placeholder="请输入会议名称" />
              </div>
              <div>
                <div className={labelCls}>立项审批日期<span className={requiredCls}>*</span></div>
                <input type="date" className={inputCls} disabled={confirmLocked} />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-700 mb-3">合资公司审批信息（可选）</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className={labelCls}>合资公司立项审批会议名称</div>
                  <input className={inputCls} disabled={confirmLocked} placeholder="选填" />
                </div>
                <div>
                  <div className={labelCls}>合资公司立项审批日期</div>
                  <input type="date" className={inputCls} disabled={confirmLocked} />
                </div>
                <div>
                  <div className={labelCls}>合资公司会议纪要</div>
                  <input className={inputCls} disabled={confirmLocked} placeholder="选填" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 物资类 × 签报审批 */}
        {mode === 'sign_report' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={labelCls}>不含税预算总金额（元）<span className={requiredCls}>*</span></div>
              <input type="number" className={inputCls} disabled={confirmLocked} placeholder="自动关联申请阶段" />
            </div>
            <div>
              <div className={labelCls}>预算控制金额（元）<span className={requiredCls}>*</span></div>
              <input type="number" className={inputCls} disabled={confirmLocked} placeholder="请输入预算控制金额" />
            </div>
            <div>
              <div className={labelCls}>立项审批日期<span className={requiredCls}>*</span></div>
              <input type="date" className={inputCls} disabled={confirmLocked} />
            </div>
          </div>
        )}

        {/* 物资类 × 采购项目申请表 */}
        {mode === 'application_form' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={labelCls}>不含税预算总金额（元）<span className={requiredCls}>*</span></div>
              <input type="number" className={inputCls} disabled={confirmLocked} placeholder="自动关联申请阶段" />
            </div>
            <div>
              <div className={labelCls}>预算控制金额（元）<span className={requiredCls}>*</span></div>
              <input type="number" className={inputCls} disabled={confirmLocked} placeholder="请输入预算控制金额" />
            </div>
            <div>
              <div className={labelCls}>立项审批日期<span className={requiredCls}>*</span></div>
              <input type="date" className={inputCls} disabled={confirmLocked} />
            </div>
          </div>
        )}

        {/* 附件上传区（通用） */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-700 mb-3">需上传附件</div>
          <div className="space-y-2">
            {getRequiredDocs().map((doc) => (
              <div key={doc} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{doc}</span>
                <span className="text-xs text-indigo-600 hover:underline cursor-pointer">
                  {readOnly ? '已上传 ✓' : '+ 上传'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 服务类 / 工程类 → 多行项目表单
  const getTableHeaders = () => {
    const base = ['#', '需求部门*', '项目名称*', ['主要内容'], mode === 'meeting' ? '预算总金额*' : '不含税预算*', '预算控制金额*'];
    if (mode === 'meeting') base.push('立项审批会议名称*', '立项审批日期*');
    if (mode === 'sign_report') base.push('立项审批日期*');
    if (mode === 'application_form') base.push('立项审批日期*');
    base.push('备注', '操作');
    return base;
  };

  return (
    <div>
      {/* 项目多行表单 */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
          <div className="text-xs text-slate-600">共 {effectiveRows.length} 条 · 合计 ¥{effectiveRows.reduce((s, r) => s + (r.budgetAmount || 0), 0).toFixed(2)}</div>
          
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 900 }}>
            <thead>
              <tr className="bg-white border-b border-slate-200">
                {getTableHeaders().map((h, i) => (
                  <th key={i} className="px-2 py-2 text-left text-slate-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {effectiveRows.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-2 py-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="px-2 py-2">
                    <input className={inputCls} disabled={listLocked} value={row.dept} onChange={(e) => updateProjectRow(idx, 'dept', e.target.value)} />
                  </td>
                  <td className="px-2 py-2">
                    <input className={inputCls} disabled={listLocked} value={row.projectName} onChange={(e) => updateProjectRow(idx, 'projectName', e.target.value)} />
                  </td>
                  {(() => (
                    <td className="px-2 py-2">
                      <textarea className={textareaCls} rows={2} disabled={listLocked} value={row.mainContent || ''} onChange={(e) => updateProjectRow(idx, 'mainContent', e.target.value)} />
                    </td>
                  ))()}
                  <td className="px-2 py-2">
                    <input type="number" className={inputCls} disabled={listLocked} value={row.budgetAmount || ''} onChange={(e) => updateProjectRow(idx, 'budgetAmount', Number(e.target.value) || 0)} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" className={inputCls} disabled={listLocked} value={row.budgetControlAmount || ''} onChange={(e) => updateProjectRow(idx, 'budgetControlAmount', Number(e.target.value) || 0)} />
                  </td>
                  {mode === 'meeting' && (
                    <td className="px-2 py-2">
                      <input className={inputCls} disabled={confirmLocked} value={row.approvalMeetingName || ''} onChange={(e) => updateProjectRow(idx, 'approvalMeetingName', e.target.value)} />
                    </td>
                  )}
                  {(mode === 'meeting' || mode === 'sign_report' || mode === 'application_form') && (
                    <td className="px-2 py-2">
                      <input type="date" className={inputCls} disabled={confirmLocked} value={row.approvalDate || ''} onChange={(e) => updateProjectRow(idx, 'approvalDate', e.target.value)} />
                    </td>
                  )}
                  <td className="px-2 py-2">
                    <input className={inputCls} disabled={confirmLocked} value={row.remark || ''} onChange={(e) => updateProjectRow(idx, 'remark', e.target.value)} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    
                  </td>
                </tr>
              ))}
              {effectiveRows.length === 0 && (
                <tr>
                  <td colSpan={getTableHeaders().length} className="text-center py-8 text-slate-400">
                    需求申请阶段未填写项目清单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 附件上传区 */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs font-medium text-slate-700 mb-3">需上传附件（每行列行对应上传）</div>
        <div className="space-y-2">
          {getRequiredDocs().map((doc) => (
            <div key={doc} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">{doc}</span>
              <span className="text-xs text-indigo-600 hover:underline cursor-pointer">
                {readOnly ? '已上传 ✓' : '+ 上传'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
