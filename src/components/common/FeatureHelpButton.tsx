import { useState } from 'react';
import Modal from './Modal';
import Badge from './Badge';
import { HelpCircle, Compass, ArrowRight, Trash2, AlertTriangle, CheckCircle2, Info, FileText, ArrowUp, ArrowDown, GitBranch } from 'lucide-react';

// ============ 功能操作说明弹窗数据结构 ============
// businessSummary（可选）：业务边界卡，顶部高亮展示
// description：功能概述，升级为带竖线的高亮块
// sections（操作流程引导，旧结构，仓库域 28 处继续使用，保持向后兼容）
// operations 逐操作清单：操作名 | 什么时候能用 | 做什么 | 做完后的影响（risk 标记高危）
// fields  字段级逻辑说明：字段名 | 业务含义 | 取值/计算/校验逻辑 | 来源与关联
// statusFlow 状态流转：状态 | 含义 | 可执行操作 | 下一状态
// related 上下游单据关系

export interface HelpBusinessSummary {
  why?: string;          // 为什么要有这个页面（业务背景）
  scope?: string;        // 核心职责（本页能做什么）
  notDo?: string[];      // 明确不做什么（业务边界）
}

export interface HelpOperationRow {
  name: string;          // 操作名（页面按钮原文）
  condition?: string;    // 什么时候能用（前置状态/权限/条件）
  detail?: string;       // 这个操作做什么（含必填/校验）
  impact: string;        // 做完后的影响（本单变化 + 对上下游环节影响）
  risk?: 'normal' | 'warning' | 'danger'; // danger=不可逆/高危红色标记
  kind?: 'button' | 'form' | 'batch' | 'auto'; // 操作类型：按钮/表单提交/批量/系统自动
}

export interface HelpFieldRow {
  name: string;         // 字段名
  meaning: string;      // 业务含义
  logic?: string;       // 取值来源 / 计算 / 校验逻辑
  relation?: string;    // 与其他单据/字段的关联
}

export interface HelpStatusRow {
  status: string;       // 状态
  meaning: string;      // 含义
  actions?: string;     // 该状态下可做的操作 / 谁操作
  next?: string;        // 可流转到的下一状态
}

export interface HelpContent {
  title: string;
  businessSummary?: HelpBusinessSummary;
  description?: string;
  sections?: {
    heading: string;
    items: string[];
  }[];
  operations?: HelpOperationRow[];
  fields?: HelpFieldRow[];
  statusFlow?: HelpStatusRow[];
  related?: { upstream?: string[]; downstream?: string[]; note?: string };
}

interface Props {
  content: HelpContent;
}

// 根据字段 logic 内容自动打标签
function classifyFieldLogic(logic: string): { text: string; variant: 'default' | 'primary' | 'info' | 'warning' | 'danger' }[] {
  const result: { text: string; variant: any }[] = [];
  const lower = logic.toLowerCase();
  if (/必填|不能为空|required/.test(logic)) result.push({ text: '必填', variant: 'danger' });
  if (/自动|系统|auto|generate/.test(lower)) result.push({ text: '系统自动', variant: 'info' });
  if (/枚举|可选|下拉|select/.test(lower)) result.push({ text: '枚举值', variant: 'primary' });
  if (/计算|公式|calc|=/.test(lower)) result.push({ text: '计算值', variant: 'info' });
  if (/默认|default/.test(lower)) result.push({ text: '默认值', variant: 'default' });
  if (/从.*表|关联|引用|import/.test(logic)) result.push({ text: '关联带入', variant: 'warning' });
  if (result.length === 0) result.push({ text: '业务规则', variant: 'default' });
  return result;
}

function operationKindChip(kind?: HelpOperationRow['kind'], risk?: HelpOperationRow['risk']) {
  if (risk === 'danger') return { text: '危险', variant: 'danger' as const };
  if (risk === 'warning') return { text: '注意', variant: 'warning' as const };
  switch (kind) {
    case 'batch': return { text: '批量', variant: 'warning' as const };
    case 'form': return { text: '表单', variant: 'info' as const };
    case 'auto': return { text: '自动', variant: 'primary' as const };
    default: return { text: '操作', variant: 'default' as const };
  }
}

export default function FeatureHelpButton({ content }: Props) {
  const [open, setOpen] = useState(false);

  const hasAnything =
    !!content.businessSummary ||
    !!content.description ||
    (content.sections && content.sections.length > 0) ||
    (content.operations && content.operations.length > 0) ||
    (content.fields && content.fields.length > 0) ||
    (content.statusFlow && content.statusFlow.length > 0) ||
    !!content.related;

  if (!hasAnything) return null;

  // 区块序号统一按出现顺序累计（跨所有 section）
  let seq = 0;
  const nextNo = () => ++seq;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#e6f4ff] text-[#1677ff] text-xs font-medium rounded border border-[#91caff] hover:bg-[#bae0ff] transition-colors"
        title="功能操作逻辑说明"
      >
        <HelpCircle size={14} />
        <span>功能操作说明</span>
      </button>

      <Modal
        open={open}
        title={content.title}
        onClose={() => setOpen(false)}
        width="max-w-[900px]"
      >
        <div className="space-y-5 max-h-[72vh] overflow-auto pr-1">
          {/* 🧭 业务边界卡（顶部，若有 businessSummary） */}
          {content.businessSummary && (
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50/50 p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600" />
              <div className="flex items-center gap-2 mb-3">
                <Compass size={18} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-indigo-900">🧭 业务边界</h3>
              </div>
              <div className="grid grid-cols-1 gap-2.5 text-[13px]">
                {content.businessSummary.why && (
                  <div className="flex gap-2">
                    <span className="shrink-0 text-slate-500 font-medium w-14">为什么：</span>
                    <span className="text-slate-700 leading-relaxed">{content.businessSummary.why}</span>
                  </div>
                )}
                {content.businessSummary.scope && (
                  <div className="flex gap-2">
                    <span className="shrink-0 text-indigo-600 font-medium w-14 pt-0.5">能做什么：</span>
                    <span className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{content.businessSummary.scope}</span>
                  </div>
                )}
                {content.businessSummary.notDo && content.businessSummary.notDo.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="shrink-0 text-rose-500 font-medium w-14 pt-0.5">不做：</span>
                    <div className="flex flex-wrap gap-1.5">
                      {content.businessSummary.notDo.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-rose-50 text-rose-600 border border-rose-200 rounded-md">
                          <span className="opacity-60">×</span>{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 功能概述 description */}
          {content.description && (
            <div className="rounded-lg bg-slate-50 border-l-4 border-indigo-400 px-4 py-3 text-[13px] text-slate-700 leading-relaxed">
              <span className="font-semibold text-indigo-700 mr-1">📘 概述：</span>
              {content.description}
            </div>
          )}

          {/* 操作流程引导（旧结构） */}
          {content.sections?.map((section, idx) => {
            const no = nextNo();
            return (
              <div key={`s-${idx}`} className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">{no}</span>
                  <h4 className="font-semibold text-slate-800 text-[13px]">{section.heading}</h4>
                </div>
                <ul className="space-y-1 pl-8 list-disc text-[13px] text-slate-600">
                  {section.items.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* 操作清单（每个按钮） */}
          {content.operations && content.operations.length > 0 && (() => {
            const no = nextNo();
            return (
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{no}</span>
                  <FileText size={14} className="text-indigo-500" />
                  <h4 className="font-semibold text-slate-800 text-[13px]">操作清单</h4>
                  <span className="text-[11px] text-slate-400">每个操作什么时候能用 · 做完后的影响</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[12.5px] border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 text-indigo-900">
                        <th className="px-3 py-2 text-left border border-slate-200 whitespace-nowrap w-40">操作</th>
                        <th className="px-3 py-2 text-left border border-slate-200 w-36">前置条件</th>
                        <th className="px-3 py-2 text-left border border-slate-200">做什么</th>
                        <th className="px-3 py-2 text-left border border-slate-200 w-56">影响 / 风险</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.operations.map((op, i) => {
                        const chip = operationKindChip(op.kind, op.risk);
                        return (
                          <tr key={i} className={`align-top ${op.risk === 'danger' ? 'bg-rose-50/40' : op.risk === 'warning' ? 'bg-amber-50/30' : 'hover:bg-indigo-50/30'}`}>
                            <td className="px-3 py-2 border border-slate-200">
                              <div className="flex flex-col gap-1">
                                <div className="font-medium text-slate-800">{op.name}</div>
                                <Badge variant={chip.variant} size="sm">{chip.text}</Badge>
                              </div>
                            </td>
                            <td className="px-3 py-2 border border-slate-200 text-slate-600">
                              {op.condition || <span className="text-slate-300">无特殊条件</span>}
                            </td>
                            <td className="px-3 py-2 border border-slate-200 text-slate-700 leading-relaxed">{op.detail || '-'}</td>
                            <td className="px-3 py-2 border border-slate-200">
                              <div className="flex items-start gap-1.5">
                                {op.risk === 'danger' && <Trash2 size={13} className="text-rose-500 mt-0.5 shrink-0" />}
                                {op.risk === 'warning' && <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />}
                                {!op.risk && <Info size={13} className="text-indigo-500 mt-0.5 shrink-0" />}
                                <span className={`leading-relaxed ${op.risk === 'danger' ? 'text-rose-700 font-medium' : op.risk === 'warning' ? 'text-amber-700' : 'text-slate-700'}`}>
                                  {op.impact}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* 状态流转 */}
          {content.statusFlow && content.statusFlow.length > 0 && (() => {
            const no = nextNo();
            return (
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">{no}</span>
                  <GitBranch size={14} className="text-purple-500" />
                  <h4 className="font-semibold text-slate-800 text-[13px]">状态流转</h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[13px] mb-3">
                  {content.statusFlow.map((row, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="inline-block px-3 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 font-medium text-[12px] shadow-sm">
                        {row.status}
                      </span>
                      {row.next && (
                        <>
                          <ArrowRight size={14} className="text-slate-400" />
                          <span className="inline-block px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-medium text-[12px]">
                            {row.next}
                          </span>
                        </>
                      )}
                      {i < content.statusFlow.length - 1 && !row.next && <span className="w-4" />}
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[12.5px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="px-3 py-2 text-left border border-slate-200 whitespace-nowrap w-28">状态</th>
                        <th className="px-3 py-2 text-left border border-slate-200">含义</th>
                        <th className="px-3 py-2 text-left border border-slate-200">该状态可做什么</th>
                        <th className="px-3 py-2 text-left border border-slate-200 whitespace-nowrap w-36">下一状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.statusFlow.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 border border-slate-200 font-medium text-purple-700 whitespace-nowrap">{row.status}</td>
                          <td className="px-3 py-2 border border-slate-200 text-slate-600">{row.meaning}</td>
                          <td className="px-3 py-2 border border-slate-200 text-slate-700">{row.actions || '-'}</td>
                          <td className="px-3 py-2 border border-slate-200">
                            {row.next ? (
                              <span className="inline-flex items-center gap-1">
                                <ArrowRight size={12} className="text-slate-400" />
                                <span className="text-purple-700 font-medium">{row.next}</span>
                              </span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* 字段级逻辑说明 */}
          {content.fields && content.fields.length > 0 && (() => {
            const no = nextNo();
            return (
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">{no}</span>
                  <h4 className="font-semibold text-slate-800 text-[13px]">字段填写说明</h4>
                  <span className="text-[11px] text-amber-600">必填·计算·枚举 一眼看懂</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[12.5px] border-collapse">
                    <thead>
                      <tr className="bg-amber-50 text-amber-900">
                        <th className="px-3 py-2 text-left border border-amber-200 whitespace-nowrap w-36">字段</th>
                        <th className="px-3 py-2 text-left border border-amber-200 w-44">业务含义</th>
                        <th className="px-3 py-2 text-left border border-amber-200">取值 / 计算 / 校验逻辑</th>
                        <th className="px-3 py-2 text-left border border-amber-200 w-44">来源与关联</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.fields.map((f, i) => (
                        <tr key={i} className="hover:bg-amber-50/40 align-top">
                          <td className="px-3 py-2 border border-slate-200 font-medium text-slate-800 whitespace-nowrap">{f.name}</td>
                          <td className="px-3 py-2 border border-slate-200 text-slate-600">{f.meaning}</td>
                          <td className="px-3 py-2 border border-slate-200">
                            <div className="flex flex-col gap-1">
                              {f.logic && classifyFieldLogic(f.logic).map((c, j) => (
                                <Badge key={j} variant={c.variant} size="sm">{c.text}</Badge>
                              ))}
                              <span className="text-[12px] text-slate-500 leading-relaxed">{f.logic || '-'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 border border-slate-200 text-slate-500">{f.relation || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* 上下游关系 */}
          {content.related && (() => {
            const no = nextNo();
            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{no}</span>
                  <ArrowUp size={14} className="text-slate-400" />
                  <h4 className="font-semibold text-slate-800 text-[13px]">上下游数据流</h4>
                  <ArrowDown size={14} className="text-slate-400" />
                </div>
                <div className="flex items-center gap-3 text-[12.5px]">
                  {/* 上游 */}
                  <div className="flex-1 min-w-0 border border-slate-200 rounded-lg p-3 bg-blue-50/40">
                    <div className="flex items-center gap-1 mb-1.5">
                      <ArrowUp size={12} className="text-blue-500" />
                      <span className="font-semibold text-blue-700">上游（数据从哪来）</span>
                    </div>
                    {content.related.upstream && content.related.upstream.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {content.related.upstream.map((u, i) => <li key={i}>{u}</li>)}
                      </ul>
                    ) : <div className="text-slate-400">无（本环节为起点）</div>}
                  </div>
                  {/* 流向箭头 */}
                  <div className="flex flex-col items-center shrink-0 px-2">
                    <div className="w-px h-3 bg-slate-300" />
                    <div className="inline-flex items-center justify-center w-10 h-7 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200">📄 本页</div>
                    <div className="w-px h-3 bg-slate-300" />
                  </div>
                  {/* 下游 */}
                  <div className="flex-1 min-w-0 border border-slate-200 rounded-lg p-3 bg-emerald-50/40">
                    <div className="flex items-center gap-1 mb-1.5">
                      <ArrowDown size={12} className="text-emerald-500" />
                      <span className="font-semibold text-emerald-700">下游（通过后流向哪）</span>
                    </div>
                    {content.related.downstream && content.related.downstream.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {content.related.downstream.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : <div className="text-slate-400">无（末端查询/归档环节）</div>}
                  </div>
                </div>
                {content.related.note && (
                  <div className="mt-3 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span>{content.related.note}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Modal>
    </>
  );
}
