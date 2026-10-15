import { useState } from 'react';
import Modal from './Modal';
import { HelpCircle } from 'lucide-react';

// ============ 功能操作说明弹窗数据结构 ============
// sections（操作说明，旧结构，仓库域 28 处继续使用，保持向后兼容）
// fields  字段级逻辑说明：字段名 | 业务含义 | 取值/计算逻辑 | 来源与关联
// statusFlow 状态流转：状态 | 含义 | 可执行操作 | 下一状态
// related 上下游单据关系
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
  description?: string;
  sections?: {
    heading: string;
    items: string[];
  }[];
  fields?: HelpFieldRow[];
  statusFlow?: HelpStatusRow[];
  related?: { upstream?: string[]; downstream?: string[]; note?: string };
}

interface Props {
  content: HelpContent;
}

export default function FeatureHelpButton({ content }: Props) {
  const [open, setOpen] = useState(false);

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
        width="max-w-[860px]"
      >
        <div className="space-y-4 text-sm text-[#606266] max-h-[70vh] overflow-auto pr-1">
          {content.description && (
            <p className="text-[#303133] leading-relaxed bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2">
              {content.description}
            </p>
          )}

          {/* 操作说明 */}
          {content.sections?.map((section, idx) => (
            <div key={`s-${idx}`}>
              <h4 className="text-[#303133] font-semibold mb-2 text-[13px]">
                {idx + 1}. {section.heading}
              </h4>
              <ul className="space-y-1 pl-5 list-disc">
                {section.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* 状态流转 */}
          {content.statusFlow && content.statusFlow.length > 0 && (
            <div>
              <h4 className="text-[#303133] font-semibold mb-2 text-[13px]">
                {content.sections?.length ? content.sections.length + 1 : 1}. 状态流转说明
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-2.5 py-2 text-left border border-slate-200 whitespace-nowrap w-28">状态</th>
                      <th className="px-2.5 py-2 text-left border border-slate-200">含义</th>
                      <th className="px-2.5 py-2 text-left border border-slate-200">该状态可做什么</th>
                      <th className="px-2.5 py-2 text-left border border-slate-200 whitespace-nowrap w-36">下一状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.statusFlow.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-2.5 py-1.5 border border-slate-200 font-medium text-slate-700 whitespace-nowrap">{row.status}</td>
                        <td className="px-2.5 py-1.5 border border-slate-200">{row.meaning}</td>
                        <td className="px-2.5 py-1.5 border border-slate-200">{row.actions || '-'}</td>
                        <td className="px-2.5 py-1.5 border border-slate-200">{row.next || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 字段级逻辑说明 */}
          {content.fields && content.fields.length > 0 && (
            <div>
              <h4 className="text-[#303133] font-semibold mb-2 text-[13px]">
                {(content.sections?.length || 0) + (content.statusFlow ? 1 : 0) + 1}. 字段逻辑说明
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-50 text-amber-900">
                      <th className="px-2.5 py-2 text-left border border-amber-200 whitespace-nowrap w-36">字段</th>
                      <th className="px-2.5 py-2 text-left border border-amber-200 w-44">业务含义</th>
                      <th className="px-2.5 py-2 text-left border border-amber-200">取值 / 计算 / 校验逻辑</th>
                      <th className="px-2.5 py-2 text-left border border-amber-200 w-44">来源与关联</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.fields.map((f, i) => (
                      <tr key={i} className="hover:bg-amber-50/40 align-top">
                        <td className="px-2.5 py-1.5 border border-slate-200 font-medium text-slate-800 whitespace-nowrap">{f.name}</td>
                        <td className="px-2.5 py-1.5 border border-slate-200">{f.meaning}</td>
                        <td className="px-2.5 py-1.5 border border-slate-200">{f.logic || '-'}</td>
                        <td className="px-2.5 py-1.5 border border-slate-200 text-slate-500">{f.relation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 上下游关系 */}
          {content.related && (
            <div>
              <h4 className="text-[#303133] font-semibold mb-2 text-[13px]">
                {(content.sections?.length || 0) + (content.statusFlow ? 1 : 0) + (content.fields ? 1 : 0) + 1}. 上下游单据关系
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">⬆ 上游（数据从哪来）</div>
                  {content.related.upstream && content.related.upstream.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-xs">
                      {content.related.upstream.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  ) : <div className="text-xs text-slate-400">无（本环节为起点）</div>}
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">⬇ 下游（通过后流向哪）</div>
                  {content.related.downstream && content.related.downstream.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-xs">
                      {content.related.downstream.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  ) : <div className="text-xs text-slate-400">无（末端查询/归档环节）</div>}
                </div>
              </div>
              {content.related.note && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  {content.related.note}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
