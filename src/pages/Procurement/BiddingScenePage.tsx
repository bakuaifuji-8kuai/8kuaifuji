// =====================================================================
// 招采执行场景模板页 —— 9 种采购方式的空表单交互原型
// 目的：让开发一眼看到每种采购方式有哪些字段、控件类型、必填标记、条件分支
// URL 形如：/procurement/bidding-scene/framework-catalog
// =====================================================================

import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  BIDDING_SCENE_MOCKS,
  PROCUREMENT_METHOD_RULES,
  type BiddingSceneKey,
} from '@/constants/biddingSceneMocks';

// =====================================================================
// 工具：3 个判定函数（和 CompetitiveBiddingPage 完全对齐）
// =====================================================================
const SCENE_MOCKS_ARRAY = Object.values(BIDDING_SCENE_MOCKS);
const isCatalog = (k?: string) => k === 'framework_catalog';
const isRandom = (k?: string) => k === 'framework_random';
const isOffline = (k?: string) =>
  k === 'inquiry_open' || k === 'inquiry_invited' ||
  k === 'competitive_bidding' || k === 'negotiation_open' || k === 'negotiation_invited';
const isSimple = (k?: string) => k === 'direct' || k === 'e_mall';
// 辅助：精确匹配线下子类型
const isInquiry = (k?: string) => k === 'inquiry_open' || k === 'inquiry_invited';
const isCompetitive = (k?: string) => k === 'competitive_bidding';
const isNegotiation = (k?: string) => k === 'negotiation_open' || k === 'negotiation_invited';
const hasAnnounceTime = (k?: string) => isInquiry(k) || k === 'competitive_bidding' || k === 'negotiation_open';
const hasBidOpening = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasJudgeMethod = (k?: string) => isInquiry(k) || isCompetitive(k);
// hasOwnerJudge 只有 inquiry* + competitive 有，negotiation* 没有这个字段
const hasOwnerJudge = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasLosers = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasWinnerScore = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasNegotiator = (k?: string) => isInquiry(k) || isCompetitive(k) || isNegotiation(k);
// 项目实施部门 select：仅 inquiry* / competitive / direct / e_mall 有，negotiation 没有
const hasProjectUnit = (k?: string) => isInquiry(k) || isCompetitive(k) || isSimple(k);

// 项目部门下拉（从 CompetitiveBiddingPage 同步）
const PROJECT_DEPARTMENTS = ['展览部', '市场部', '宣传部', '活动部', '行政部', '技术部', '工程部'];

// =====================================================================
// 顶部场景说明卡片（保留）
// =====================================================================
function SceneHeaderCard({ methodKey }: { methodKey: string }) {
  const mock = SCENE_MOCKS_ARRAY.find((m) => m.key === methodKey);
  const rule = PROCUREMENT_METHOD_RULES.find((r) => r.key === methodKey);
  if (!mock) return null;
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 mb-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <span className="text-white text-xl font-bold">招</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-lg font-semibold text-slate-800">招采执行场景模板（交互原型）</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
              {mock.label}
            </span>
            {rule && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                {rule.tableTypeLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-1">{mock.description}</p>
          <p className="text-xs text-slate-500">
            <b className="text-slate-700">业务含义：</b>{rule?.reason}
            <span className="mx-2 text-slate-300">|</span>
            <b className="text-slate-700">适用：</b>{rule?.applicableScenario}
          </p>
          <p className="text-[11px] text-rose-500 mt-2">
            ⚠️ 本页为交互原型：所有字段为空、控件可点击操作、红色 * 为必填项、按采购方式条件渲染对应区块
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 区块标题
// =====================================================================
function SectionHeader({ icon, title, sub, tone = 'slate' }: {
  icon: string; title: string; sub?: string; tone?: 'amber' | 'blue' | 'slate' | 'green' | 'emerald' | 'rose' | 'indigo';
}) {
  const toneMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className={`px-5 py-2.5 border-l-4 ${toneMap[tone]} mb-2 flex items-center gap-2`}>
      <span className="text-base">{icon}</span>
      <span className="font-semibold text-sm">{title}</span>
      {sub && <span className="text-xs text-slate-400 ml-auto">{sub}</span>}
    </div>
  );
}

// =====================================================================
// 通用表单控件（轻量复刻 CompetitiveBiddingPage 弹窗的控件样式）
// =====================================================================
function FieldRow({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 | 4 }) {
  const colMap = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
  return <div className={`grid ${colMap[cols]} gap-3 px-5 py-2`}>{children}</div>;
}

function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs text-[#606266] mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value = '', onChange, placeholder }: {
  value?: string; onChange?: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder || ''}
    />
  );
}

function NumberInput({ value, onChange, min, step = '0.01', placeholder }: {
  value?: number | ''; onChange?: (v: number | '') => void; min?: number; step?: string; placeholder?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      min={min}
      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : '')}
      placeholder={placeholder || ''}
    />
  );
}

function DateInput({ value = '', onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <input
      type="date"
      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

function SelectInput({ value = '', onChange, options, placeholder }: {
  value?: string; onChange?: (v: string) => void; options: { label: string; value: string }[]; placeholder?: string;
}) {
  return (
    <select
      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white focus:border-indigo-500 outline-none"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">{placeholder || '请选择'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function TextArea({ value = '', onChange, rows = 2, placeholder }: {
  value?: string; onChange?: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      className="w-full px-2 py-1.5 border border-[#dcdfe6] rounded text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder || ''}
    />
  );
}

function Switch({ checked = false, onChange, label }: {
  checked?: boolean; onChange?: (v: boolean) => void; label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <span
        onClick={() => onChange?.(!checked)}
        className={`relative inline-block w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
      {label && <span className="text-xs text-slate-600">{label}</span>}
    </label>
  );
}

// 附件槽位（虚线框 + 上传按钮 + 已上传文件名列表）
function AttachmentSlot({ label, required, files = [], onAddFile, onRemoveFile, hint }: {
  label: string; required?: boolean; files?: string[];
  onAddFile?: () => void; onRemoveFile?: (idx: number) => void; hint?: string;
}) {
  const [localFiles, setLocalFiles] = useState<string[]>(files);
  const handleUpload = () => {
    const name = prompt(`输入一个文件名模拟上传：`, `${label.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${Date.now()}.pdf`);
    if (name) setLocalFiles([...localFiles, name]);
  };
  return (
    <div className={`rounded-lg border-2 border-dashed p-3 transition ${required ? 'border-rose-300 bg-rose-50/40' : 'border-slate-300 bg-slate-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <span>📎</span> {label}
          {required && <span className="text-rose-500">（必填）</span>}
        </span>
        <span className="text-[11px] text-slate-400">{localFiles.length} 个文件</span>
      </div>
      {hint && <div className="text-[11px] text-slate-400 mb-2">{hint}</div>}
      {localFiles.length === 0 ? (
        <button
          type="button"
          onClick={handleUpload}
          className="w-full py-2 text-xs text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 bg-white transition"
        >
          + 点击上传附件
        </button>
      ) : (
        <div className="space-y-1">
          {localFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-white rounded text-[11px] group">
              <span>📄</span>
              <span className="font-mono text-slate-700 flex-1 truncate">{f}</span>
              <button
                type="button"
                onClick={() => setLocalFiles(localFiles.filter((_, j) => j !== i))}
                className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
              >✕</button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleUpload}
            className="w-full py-1 text-xs text-indigo-600 border border-dashed border-indigo-200 rounded hover:bg-indigo-50"
          >+ 继续上传</button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 采购方式枚举（11 种，和 CompetitiveBiddingPage 对齐）
// =====================================================================
const PROCUREMENT_METHOD_OPTIONS = [
  { label: '框架协议采购-目录内比价', value: 'framework_catalog' },
  { label: '框架协议采购-随机抽取', value: 'framework_random' },
  { label: '询比采购-公开', value: 'inquiry_open' },
  { label: '询比采购-邀请', value: 'inquiry_invited' },
  { label: '竞价采购', value: 'competitive_bidding' },
  { label: '谈判采购-公开', value: 'negotiation_open' },
  { label: '谈判采购-邀请', value: 'negotiation_invited' },
  { label: '直接采购', value: 'direct' },
  { label: '电子商城', value: 'e_mall' },
];

// 评标办法枚举
const EVAL_METHOD_OPTIONS = [
  { label: '最低价法', value: 'lowest_price' },
  { label: '综合评分法', value: 'comprehensive_score' },
  { label: '经评审的最低投标价法', value: 'reviewed_lowest' },
];

// 审批方式枚举
const APPROVAL_METHOD_OPTIONS = [
  { label: '内部审批', value: 'internal' },
  { label: '董事会审批', value: 'board' },
  { label: '合资公司审批', value: 'joint_venture' },
];

// =====================================================================
// 空表格组件：只渲染列头 + 空状态 + 添加行按钮
// =====================================================================
function EmptyTable({ columns, onAddRow, addLabel = '+ 新增一行' }: {
  columns: string[]; onAddRow?: () => void; addLabel?: string;
}) {
  return (
    <div className="px-5 pb-3">
      <div className="border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="text-left py-2 px-2 border-b border-slate-200 w-10">#</th>
              {columns.map((c, i) => (
                <th key={i} className="text-left py-2 px-2 border-b border-slate-200 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-4 text-slate-400 text-[11px]">
                暂无数据，点击下方按钮添加
              </td>
            </tr>
          </tbody>
        </table>
        {onAddRow && (
          <button
            type="button"
            onClick={onAddRow}
            className="w-full py-2 text-indigo-600 hover:text-indigo-700 text-xs bg-slate-50 border-t border-slate-200 transition"
          >
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// 主表单：按采购方式条件渲染
// =====================================================================
function FormInteractiveSection({ methodKey }: { methodKey: string }) {
  // 本地空表单 state（不提交，只用于交互演示）
  const [form, setForm] = useState({
    workOrderNo: '', projectName: '', workOrderName: '', procurementMethod: methodKey,
    deadline: '', refPlanNo: '', description: '',
  });
  const upd = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  // 报名单位行（线下 5 种 + 直接/商城 共用）
  const [bidderRows, setBidderRows] = useState([{ name: '', contactPerson: '', phone: '', remark: '' }]);
  const addBidder = () => setBidderRows([...bidderRows, { name: '', contactPerson: '', phone: '', remark: '' }]);
  const delBidder = (i: number) => setBidderRows(bidderRows.filter((_, j) => j !== i));

  // 受邀供应商标签（目录内比价独有）
  const [invitedSuppliers, setInvitedSuppliers] = useState<string[]>([]);
  const [supplierInput, setSupplierInput] = useState('');
  const addSupplier = () => {
    if (supplierInput.trim()) {
      setInvitedSuppliers([...invitedSuppliers, supplierInput.trim()]);
      setSupplierInput('');
    }
  };

  // 流标
  const [flowBid, setFlowBid] = useState({ isFlow: false, reason: '' });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* ====== 基础信息（所有方式共用 · 和 CompetitiveBiddingPage 弹窗完全对齐） ====== */}
      <SectionHeader icon="📋" title="基础信息" sub="工单编号/采购方式/项目名称 3 字段" tone="indigo" />
      <FieldRow cols={3}>
        <div>
          <FormLabel label="工单编号" />
          <TextInput value={form.workOrderNo} onChange={(v) => upd('workOrderNo', v)} placeholder="保存后自动生成" />
        </div>
        <div>
          <FormLabel label="采购方式" required />
          <SelectInput value={form.procurementMethod} onChange={(v) => upd('procurementMethod', v)} options={PROCUREMENT_METHOD_OPTIONS} />
        </div>
        <div>
          <FormLabel label="项目名称" required />
          <TextInput value={form.projectName} onChange={(v) => upd('projectName', v)} placeholder="如：A 馆改造升级" />
        </div>
      </FieldRow>

      {/* ====== 当前采购方式模式描述提示条（和弹窗完全对齐） ====== */}
      <div className={`mx-5 mb-3 text-xs px-3 py-2 rounded border ${
        isCatalog(methodKey) ? 'bg-blue-50 border-blue-200 text-blue-700'
          : isRandom(methodKey) ? 'bg-purple-50 border-purple-200 text-purple-700'
          : isSimple(methodKey) ? 'bg-slate-50 border-slate-200 text-slate-600'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        {isCatalog(methodKey) ? (
          '📋 模式：目录内比价（线上报价）— 供应商在小程序报价，你只需设置单品上限和整单上限。'
        ) : isRandom(methodKey) ? (
          '🎲 模式：随机抽取（线下录入）— 系统仅记录抽取结果，抽取动作不在本系统进行。可选择是否关联采购需求。'
        ) : isSimple(methodKey) ? (
          '📝 模式：线下录入（简化无税率）— 自己填写清单、不含税单价，走审批流程。无税率/含税列。'
        ) : (
          '📝 模式：线下录入 — 自己填写清单、单价、税率，走审批流程。'
        )}
      </div>

      {/* ====== 关联采购需求（所有方式都有，random 关 linkDemand 时隐藏） ====== */}
      {(!isRandom(methodKey) || flowBid.isFlow === false /* linkDemand 默认 true */) && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600">
              关联采购需求 {!isRandom(methodKey) && <span className="text-rose-500">*</span>}
              <span className="text-slate-400 ml-1">（选择后将带入需求中的物资）</span>
            </span>
            <button className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">选择</button>
          </div>
          <div className="border border-dashed border-slate-300 rounded px-3 py-2 text-xs text-slate-400 text-center">
            请点击上方「选择」按钮，从已审核通过的采购需求中选择
          </div>
        </div>
      )}

      {/* ====== 项目说明 ====== */}
      <FieldRow cols={1}>
        <div>
          <FormLabel label="项目说明" />
          <TextArea value={form.description} onChange={(v) => upd('description', v)} rows={2} placeholder="简要说明采购背景、范围、要求..." />
        </div>
      </FieldRow>

      {/* ====== 框架协议采购-随机抽取 专属区块 ====== */}
      {isRandom(methodKey) && (
        <>
          <div className="h-px bg-slate-200 my-2" />
          <SectionHeader icon="🎲" title="随机抽取结果录入" sub="框架随机抽取独有 · 6 字段" tone="emerald" />
          <div className="px-5 py-2">
            <div className="flex items-center gap-2 py-1">
              <span className="text-xs text-slate-600">是否关联采购需求</span>
              <Switch checked={true} label="关联后基础信息的关联采购计划单才会显示" />
            </div>
          </div>
          <FieldRow cols={3}>
            <div>
              <FormLabel label="抽取时间" required />
              <DateInput />
            </div>
            <div>
              <FormLabel label="供应商" required />
              <TextInput placeholder="输入关键字模糊匹配供应商" />
            </div>
            <div>
              <FormLabel label="供应商单位联系人" required />
              <TextInput placeholder="联系人姓名" />
            </div>
          </FieldRow>
          <FieldRow cols={2}>
            <div>
              <FormLabel label="关联合同编号" required />
              <TextInput placeholder="输入关键字，从供应商框架合同中匹配" />
            </div>
            <div>
              <FormLabel label="备注" />
              <TextArea rows={1} placeholder="（选填）" />
            </div>
          </FieldRow>
          <div className="px-5 pb-3">
            <div className="text-[11px] text-slate-400 py-1">
              📌 框架随机抽取 <b className="text-rose-500">不生成任何明细清单</b>，也不进入招采模拟器。抽取动作不在本系统进行。
            </div>
          </div>
        </>
      )}

      {/* ====== 目录内比价专属区块（完全对齐 CompetitiveBiddingPage 弹窗 1813-2008 行）====== */}
      {isCatalog(methodKey) && (
        <>
          <div className="h-px bg-slate-200 my-2" />

          {/* 受邀供应商 */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">受邀供应商</span>
              <button className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">
                {invitedSuppliers.length > 0 ? '重新选择' : '选择'}（已选 {invitedSuppliers.length} 家）
              </button>
            </div>
            {invitedSuppliers.length > 0 ? (
              <div className="border border-slate-300 rounded p-2 flex flex-wrap gap-1.5 min-h-[40px] bg-white">
                {invitedSuppliers.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200">
                    {s}
                    <button onClick={() => setInvitedSuppliers(invitedSuppliers.filter((_, j) => j !== i))} className="hover:text-rose-500">×</button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded px-3 py-2 text-xs text-slate-400 text-center min-h-[40px]">
                请点击上方「选择」按钮，从启用的供应商中选择受邀对象
              </div>
            )}
          </div>

          {/* 物资明细 + 单品上限（弹窗核心区块！之前完全没做） */}
          <div className="px-5 pb-3 border-t border-dashed border-slate-200 pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">
                物资明细（0项）- 对每条物资设置「单品上限单价(含税)」
              </span>
              <span className="text-xs text-slate-400">条目上限合计（仅供参考）：¥0</span>
            </div>
            <div className="border border-dashed border-slate-300 rounded p-6 text-center text-sm text-slate-500 bg-white">
              请先在上方选择一条已通过的采购需求，需求中的物资将自动带入。
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-[11px] text-slate-400">条目上限合计</div>
                <div className="text-sm font-semibold text-slate-800">¥0</div>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-[11px] text-slate-400">不含税金额合计</div>
                <div className="text-sm font-semibold text-indigo-600">¥0</div>
              </div>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg">
                📋 查看 / 编辑清单（0）
              </button>
            </div>
          </div>

          {/* 整单上限总价（弹窗里是物资明细下面的独立字段） */}
          <div className="px-5 pb-3 border-t border-slate-200 pt-3">
            <div className="mb-1 text-xs text-slate-600">
              整单上限总价(含税) <span className="text-rose-500">*</span>
              <span className="text-slate-400 ml-2 text-[11px]">
                （参考：所有条目的上限×数量之和 ≈ ¥0）
              </span>
            </div>
            <NumberInput min={0} placeholder="请输入整单含税上限" />
          </div>

          {/* 比价公告附件（蓝色框） */}
          <div className="px-5 pb-3">
            <div className="border border-blue-200 rounded p-3 bg-blue-50">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-sm font-semibold text-slate-800">比价公告附件</div>
                  <div className="text-xs text-slate-500">上传比价公告相关文件（PDF/Word/图片等）</div>
                </div>
              </div>
              <div className="mt-2">
                <AttachmentSlot label="比价公告附件" required hint="支持 PDF/DOC，多文件" />
              </div>
            </div>
          </div>

          {/* 竞价文件附件（橙色框，目录内比价独有） */}
          <div className="px-5 pb-3">
            <div className="border border-amber-200 rounded p-3 bg-amber-50">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-sm font-semibold text-slate-800">竞价文件附件</div>
                  <div className="text-xs text-slate-500">上传竞价文件相关资料（PDF/Word/Excel等）</div>
                </div>
              </div>
              <div className="mt-2">
                <AttachmentSlot label="竞价文件附件（逐行对应明细）" required hint="支持 PDF/DOC/Excel，多文件" />
              </div>
            </div>
          </div>

          {/* 物料明细 14 列（竞价表） */}
          <SectionHeader icon="📦" title="物料明细（竞价表）" sub="14 列：竞价文件列逐行对应" tone="slate" />
          <EmptyTable
            columns={['物料编号', '名称', '规格型号', '单位', '预估数量', '框架单价(元)', '小计(元)', '品牌', '竞价文件', '交付周期', '质量标准', '技术参数', '售后服务', '验收标准']}
            addLabel="+ 从框架协议库导入 / 手动新增一行"
          />

          {/* 比价结果汇总 */}
          <div className="px-5 pb-3 border-t border-dashed border-slate-200 mt-2 pt-3">
            <div className="text-xs text-slate-600 mb-2 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-amber-500"></span>
              比价结果汇总（请填写不含税总金额，保存时将与清单明细合计比对，必须一致）
            </div>
            <FieldRow cols={2}>
              <div>
                <FormLabel label="不含税总金额（元）" required />
                <NumberInput step="0.01" min={0} placeholder="手填最终比价结果" />
              </div>
              <div>
                <FormLabel label="清单明细不含税合计（自动）" />
                <div className="w-full h-8 px-2 border border-slate-200 rounded text-sm bg-slate-50 flex items-center text-indigo-600 font-bold">
                  ¥ 自动计算
                </div>
              </div>
            </FieldRow>
          </div>
        </>
      )}

      {/* ====== 线下 5 种专属区块 ====== */}
      {isOffline(methodKey) && (
        <>
          <div className="h-px bg-slate-200 my-2" />
          <SectionHeader icon="🏗️" title="基础执行信息" sub="基础审批 + 部门 + 经办人" tone="slate" />
          <FieldRow cols={3}>
            <div>
              <FormLabel label="审批方式" required />
              <SelectInput options={APPROVAL_METHOD_OPTIONS} />
            </div>
            <div>
              <FormLabel label="实施单位" required />
              <TextInput placeholder="如：长沙国际会展中心综合采购部" />
            </div>
            <div>
              <FormLabel label="经办人" required />
              <TextInput placeholder="经办人姓名" />
            </div>
            <div>
              <FormLabel label="采购方式审批日期" required />
              <DateInput />
            </div>
            {/* 项目实施单位：仅询比/竞价有（谈判公开/邀请没有这个字段） */}
            {(isInquiry(methodKey) || isCompetitive(methodKey)) && (
            <div>
              <FormLabel label="项目实施单位" required />
              <SelectInput options={PROJECT_DEPARTMENTS.map((d) => ({ label: d, value: d }))} placeholder="请选择部门" />
            </div>
            )}
            {/* 招标人：询比/竞价/谈判 5 种都有 */}
            {hasNegotiator(methodKey) && (
            <div>
              <FormLabel label="招标人" />
              <TextInput placeholder="如：长沙国际会展中心" />
            </div>
            )}
          </FieldRow>

          {/* 采购方式审批文件资料附件（所有线下都有） */}
          <div className="px-5 pb-3">
            <AttachmentSlot label="采购方式审批文件资料" hint="采购项目申请表/上会材料等" />
          </div>

          <SectionHeader icon="📢" title={methodKey === 'inquiry_invited' ? '邀请公告与时间' : '招标公告与时间'} sub="按采购方式条件渲染字段" tone="blue" />
          <FieldRow cols={3}>
            {/* 是否有招标代理机构：询比/竞价/谈判 */}
            {hasNegotiator(methodKey) && (
            <div>
              <FormLabel label="是否有招标代理机构" />
              <div className="flex gap-3 pt-1">
                <label className="text-xs cursor-pointer"><input type="radio" name="hasAgent" /> 是</label>
                <label className="text-xs cursor-pointer"><input type="radio" name="hasAgent" defaultChecked /> 否</label>
              </div>
            </div>
            )}
            {/* 代理机构名称：条件显示（选了代理后） */}
            {hasNegotiator(methodKey) && (
            <div>
              <FormLabel label="招标代理机构名称" />
              <TextInput placeholder="如：湖南招标代理公司" />
            </div>
            )}
            {/* 公告发布时间：询比/竞价/谈判-公开 */}
            {hasAnnounceTime(methodKey) && (
            <div>
              <FormLabel label="公告发布时间" />
              <DateInput />
            </div>
            )}
            {/* 开标时间：询比/竞价 */}
            {hasBidOpening(methodKey) && (
            <div>
              <FormLabel label="开标时间" />
              <DateInput />
            </div>
            )}
            {/* 评标办法：询比/竞价（谈判用技术方案） */}
            {hasJudgeMethod(methodKey) && (
            <div>
              <FormLabel label="评标办法" />
              <SelectInput options={EVAL_METHOD_OPTIONS} />
            </div>
            )}
          </FieldRow>

          {/* 是否委派业主评委 + 业主代表（询比/竞价） */}
          {hasOwnerJudge(methodKey) && (
            <div className="px-5 pb-2">
              <FieldRow cols={2}>
                <div>
                  <FormLabel label="是否委派业主评委" />
                  <div className="flex gap-3 pt-1">
                    <label className="text-xs cursor-pointer"><input type="radio" name="hasOwnerJudge" /> 是</label>
                    <label className="text-xs cursor-pointer"><input type="radio" name="hasOwnerJudge" defaultChecked /> 否</label>
                  </div>
                </div>
                <div>
                  <FormLabel label="业主代表（可多个）" />
                  <div className="space-y-1.5">
                    <TextInput placeholder="业主代表 1" />
                    <TextInput placeholder="业主代表 2（可选）" />
                    <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700">+ 添加业主代表</button>
                  </div>
                </div>
              </FieldRow>
            </div>
          )}

          {/* 竞价采购专属：竞价公告附件（蓝色块）+ 竞价文件附件（橙色块）*/}
          {isCompetitive(methodKey) && (
            <>
              <div className="px-5 pb-3 border border-blue-200 rounded bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">📢 竞价公告附件</span>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">上传竞价公告相关文件（PDF/Word/图片等）</div>
                <AttachmentSlot label="竞价公告附件" hint="支持 PDF/DOC/图片，多文件" />
              </div>
              <div className="px-5 pb-3 border border-amber-200 rounded bg-amber-50 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">📄 竞价文件附件</span>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">上传竞价文件相关资料（PDF/Word/Excel等）</div>
                <AttachmentSlot label="竞价文件附件" hint="支持 PDF/DOC/Excel，多文件" />
              </div>
            </>
          )}

          <SectionHeader icon="📦" title="物料明细" sub="12 列" tone="slate" />
          <EmptyTable
            columns={['物料编号', '名称', '规格型号', '单位', '预估数量', '不含税单价', '不含税小计', '含税单价', '含税小计', '品牌', '备注', '交付周期']}
          />

          <SectionHeader icon="🧮" title="清单合计金额" sub="系统自动计算 + 手填比对" tone="amber" />
          <FieldRow cols={4}>
            <div>
              <FormLabel label="不含税合计（元）" />
              <NumberInput placeholder="系统计算" />
            </div>
            <div>
              <FormLabel label="含税合计（元）" />
              <NumberInput placeholder="系统计算" />
            </div>
            <div>
              <FormLabel label="税额（元）" />
              <NumberInput placeholder="系统计算" />
            </div>
            <div>
              <FormLabel label="已填单价 / 总数" />
              <div className="w-full h-8 px-2 border border-slate-200 rounded text-sm bg-slate-50 flex items-center text-slate-600 font-semibold">
                0 / 0
              </div>
            </div>
          </FieldRow>
          {/* 手填合计（保存时与系统比对，必须一致） */}
          <FieldRow cols={2}>
            <div>
              <FormLabel label="手填不含税总金额（元）" />
              <NumberInput step="0.01" min={0} placeholder="至少填一项，保存时比对" />
            </div>
            <div>
              <FormLabel label="手填含税总金额（元）" />
              <NumberInput step="0.01" min={0} placeholder="至少填一项，保存时比对" />
            </div>
          </FieldRow>

          <SectionHeader icon="👥" title="报名单位" sub={`共 ${bidderRows.length} 家 · 可增删`} tone="slate" />
          <div className="px-5 pb-3">
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="text-left py-2 px-2 border-b w-10">#</th>
                    <th className="text-left py-2 px-2 border-b">单位名称</th>
                    <th className="text-left py-2 px-2 border-b">联系人</th>
                    <th className="text-left py-2 px-2 border-b">联系电话</th>
                    <th className="text-left py-2 px-2 border-b">备注</th>
                    <th className="text-left py-2 px-2 border-b w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {bidderRows.map((b, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 px-2 text-slate-400">{i + 1}</td>
                      <td className="py-1.5 px-2"><TextInput /></td>
                      <td className="py-1.5 px-2"><TextInput /></td>
                      <td className="py-1.5 px-2"><TextInput /></td>
                      <td className="py-1.5 px-2"><TextInput /></td>
                      <td className="py-1.5 px-2 text-center">
                        <button type="button" className="text-rose-500 hover:text-rose-600 text-xs" onClick={() => delBidder(i)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addBidder} className="w-full py-2 text-indigo-600 hover:text-indigo-700 text-xs bg-slate-50 border-t border-slate-200">
                + 添加一行报名单位
              </button>
            </div>
          </div>

          <SectionHeader icon="🏆" title="中标结果" sub="中标信息 + 答疑/投诉 + 未中标单位" tone="green" />
          <FieldRow cols={3}>
            <div>
              <FormLabel label="中标供应商姓名" />
              <TextInput placeholder="中标单位全称" />
            </div>
            <div>
              <FormLabel label="中标单位法人" />
              <TextInput placeholder="法人姓名" />
            </div>
            {hasWinnerScore(methodKey) && (
            <div>
              <FormLabel label="中标单位得分" />
              <NumberInput step="0.01" placeholder="如：92.50" />
            </div>
            )}
            <div>
              <FormLabel label="中标/合同金额（元）" />
              <NumberInput step="0.01" placeholder="如：756000" />
            </div>
            <div>
              <FormLabel label="中标时间" />
              <DateInput />
            </div>
            <div>
              <FormLabel label="是否存在答疑/质疑/投诉" />
              <div className="flex gap-3 pt-1">
                <label className="text-xs cursor-pointer"><input type="radio" name="hasDispute" /> 是</label>
                <label className="text-xs cursor-pointer"><input type="radio" name="hasDispute" defaultChecked /> 否</label>
              </div>
            </div>
          </FieldRow>
          {/* 答疑/投诉原因（选了"是"后显示） */}
          <FieldRow cols={1}>
            <div>
              <FormLabel label="答疑/质疑/投诉情况" />
              <TextArea rows={2} placeholder="请简要说明答疑/质疑/投诉情况（选「是」时才需要填）" />
            </div>
          </FieldRow>

          {/* 未中标单位 1 / 未中标单位 2（询比/竞价 有完整字段；谈判只有名称） */}
          <div className="px-5 pb-2">
            <div className="text-xs text-slate-500 mb-1">未中标单位</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded p-2.5 space-y-2">
                <div className="text-xs font-medium text-slate-600">未中标单位 1</div>
                {hasLosers(methodKey) ? (
                  <div className="grid grid-cols-3 gap-2">
                    <TextInput placeholder="单位名称" />
                    <TextInput placeholder="法人" />
                    <NumberInput step="0.01" placeholder="得分" />
                  </div>
                ) : (
                  <TextInput placeholder="单位名称" />
                )}
              </div>
              <div className="border border-slate-200 rounded p-2.5 space-y-2">
                <div className="text-xs font-medium text-slate-600">未中标单位 2</div>
                {hasLosers(methodKey) ? (
                  <div className="grid grid-cols-3 gap-2">
                    <TextInput placeholder="单位名称" />
                    <TextInput placeholder="法人" />
                    <NumberInput step="0.01" placeholder="得分" />
                  </div>
                ) : (
                  <TextInput placeholder="单位名称" />
                )}
              </div>
            </div>
          </div>

          <SectionHeader icon="📎" title="审批材料附件（7 槽）" sub="必填 * / 选填 代理抽取·合资两项" tone="rose" />
          <div className="px-5 pb-3 grid grid-cols-2 gap-3">
            <AttachmentSlot label="会议纪要" required hint="评审会议纪要 PDF" />
            <AttachmentSlot label="上会材料" required hint="申报上会的全套材料" />
            <AttachmentSlot label="招标代理抽取结果表" hint="如委托了代理机构" />
            <AttachmentSlot label="成交通知书" required />
            <AttachmentSlot label="招采过程备案" required hint="全流程合规性备案表" />
            <AttachmentSlot label="合资公司会议纪要" hint="合资方投决会议（如有）" />
            <AttachmentSlot label="合资公司上会材料" hint="合资方上会材料（如有）" />
          </div>

          {/* 流标区（radio 是/否，和 CompetitiveBiddingPage 一致） */}
          <div className="px-5 pb-4 border-t border-slate-200 pt-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-slate-700">流标：</span>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" name="isFailed" checked={flowBid.isFlow}
                  onChange={() => setFlowBid({ ...flowBid, isFlow: true, reason: '' })} />
                <span className="text-xs text-slate-700">是</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" name="isFailed" checked={!flowBid.isFlow}
                  onChange={() => setFlowBid({ ...flowBid, isFlow: false, reason: '' })} />
                <span className="text-xs text-slate-700">否</span>
              </label>
            </div>
            {flowBid.isFlow && (
              <div>
                <FormLabel label="流标原因" required />
                <TextArea rows={2} placeholder="请填写流标原因（如：投标供应商不足3家、报价均超出预算、有效标不足等）" />
              </div>
            )}
          </div>
        </>
      )}

      {/* ====== 直接采购 / 电子商城 专属区块 ====== */}
      {isSimple(methodKey) && (
        <>
          <div className="h-px bg-slate-200 my-2" />
          <SectionHeader icon="🏗️" title="基础执行信息" sub="直接/商城独有 · 简化字段" tone="emerald" />
          <FieldRow cols={3}>
            <div>
              <FormLabel label="审批方式" required />
              <SelectInput options={APPROVAL_METHOD_OPTIONS} />
            </div>
            <div>
              <FormLabel label="实施单位" required />
              <TextInput placeholder="如：长沙国际会展中心综合采购部" />
            </div>
            <div>
              <FormLabel label="经办人" required />
              <TextInput placeholder="经办人姓名" />
            </div>
            <div>
              <FormLabel label="采购方式审批日期" required />
              <DateInput />
            </div>
            <div>
              <FormLabel label="项目实施单位" required />
              <SelectInput options={PROJECT_DEPARTMENTS.map((d) => ({ label: d, value: d }))} placeholder="请选择部门" />
            </div>
          </FieldRow>

          <SectionHeader icon="📦" title="物料明细" sub="简化列" tone="slate" />
          <EmptyTable columns={['物料编号', '名称', '规格', '单位', '数量', '单价(不含税)', '小计', '备注']} />

          <SectionHeader icon="💰" title="金额与供应商" sub="直接/商城独有 6 项" tone="emerald" />
          <FieldRow cols={3}>
            <div>
              <FormLabel label="供应商" required />
              <TextInput placeholder="如：XX 办公耗材商城" />
            </div>
            <div>
              <FormLabel label="不含税总金额（元）" required />
              <NumberInput step="0.01" min={0} />
            </div>
            <div>
              <FormLabel label="含税总金额（元）" required />
              <NumberInput step="0.01" min={0} />
            </div>
            <div>
              <FormLabel label="预算金额（元）" />
              <NumberInput step="0.01" />
            </div>
            <div className="col-span-2">
              <FormLabel label="备注" />
              <TextArea rows={1} />
            </div>
          </FieldRow>

          <SectionHeader icon="📎" title="附件（直接/商城）" sub="1 槽必填" tone="blue" />
          <div className="px-5 pb-3">
            <AttachmentSlot label="相关文件资料" required hint="直接/商城场景的采购审批文件（必填）" />
          </div>
        </>
      )}

      {/* ====== 底部操作区 ====== */}
      <div className="border-t border-slate-200 px-5 py-4 flex items-center justify-between bg-slate-50 rounded-b-xl">
        <span className="text-[11px] text-slate-400">💡 本页为交互原型，点击控件可操作，不会真的提交数据</span>
        <div className="flex gap-2">
          <button type="button" className="px-4 py-1.5 text-xs border border-slate-300 rounded text-slate-600 hover:bg-white">重置</button>
          <button type="button" className="px-4 py-1.5 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 shadow-sm">提交工单（原型）</button>
        </div>
      </div>
    </div>
  );
}

// key → URL slug 转换（下划线→短横线），和 Sidebar 路由一致
const keyToSlug = (k: string) => k.replace(/_/g, '-');

// =====================================================================
// 9 种方式切换标签
// =====================================================================
function SceneTabs({ current }: { current: string }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {SCENE_MOCKS_ARRAY.map((m) => (
        <a
          key={m.key}
          href={`/procurement/bidding-scene/${keyToSlug(m.key)}`}
          className={`px-3 py-1.5 text-xs rounded-md border transition ${
            current === m.key || sceneParamMatches(m.key, current)
              ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {m.label}
        </a>
      ))}
    </div>
  );
}

// URL param 可能是 slug（framework-catalog）或原始 key（framework_catalog），都能匹配
function sceneParamMatches(key: string, param?: string) {
  if (!param) return false;
  return key === param || keyToSlug(key) === param;
}

// =====================================================================
// 主页面
// =====================================================================
export default function BiddingScenePage() {
  const { sceneKey } = useParams<{ sceneKey: string }>();
  // URL 可能是 framework-catalog（slug）或 framework_catalog（原始），统一转成原始 key
  const methodKey = (sceneKey || 'framework_catalog').replace(/-/g, '_');
  const mock = useMemo(() => SCENE_MOCKS_ARRAY.find((m) => m.key === methodKey), [methodKey]);
  if (!mock) {
    return (
      <div className="p-8 text-center text-slate-500">
        未找到场景 "{methodKey}"，<a href="/procurement/bidding-scene/framework-catalog" className="text-indigo-500">返回目录内比价</a>
      </div>
    );
  }
  return (
    <div className="p-5 max-w-[1280px] mx-auto">
      <SceneHeaderCard methodKey={methodKey} />
      <SceneTabs current={methodKey} />
      <FormInteractiveSection methodKey={methodKey} />
    </div>
  );
}
