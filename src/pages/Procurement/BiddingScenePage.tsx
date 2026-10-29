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
} from '@/constants/biddingSceneMocks';

const SCENE_MOCKS_ARRAY = Object.values(BIDDING_SCENE_MOCKS);
const isCatalog = (k?: string) => k === 'framework_catalog';
const isRandom = (k?: string) => k === 'framework_random';
const isOffline = (k?: string) =>
  k === 'inquiry_open' || k === 'inquiry_invited' ||
  k === 'competitive_bidding' || k === 'negotiation_open' || k === 'negotiation_invited';
const isSimple = (k?: string) => k === 'direct' || k === 'e_mall';
const isInquiry = (k?: string) => k === 'inquiry_open' || k === 'inquiry_invited';
const isCompetitive = (k?: string) => k === 'competitive_bidding';
const isNegotiation = (k?: string) => k === 'negotiation_open' || k === 'negotiation_invited';
const hasAnnounceTime = (k?: string) => isInquiry(k) || k === 'competitive_bidding' || k === 'negotiation_open';
const hasBidOpening = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasJudgeMethod = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasOwnerJudge = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasLosers = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasWinnerScore = (k?: string) => isInquiry(k) || isCompetitive(k);
const hasNegotiator = (k?: string) => isInquiry(k) || isCompetitive(k) || isNegotiation(k);

const PROJECT_DEPARTMENTS = ['展览部', '市场部', '宣传部', '活动部', '行政部', '技术部', '工程部'];
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

// =====================================================================
// 顶部场景说明卡片
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
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">{mock.label}</span>
            {rule && <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700 border border-amber-200">{rule.tableTypeLabel}</span>}
          </div>
          <p className="text-sm text-slate-600 mb-1">{mock.description}</p>
          <p className="text-xs text-slate-500"><b className="text-slate-700">业务含义：</b>{rule?.reason}<span className="mx-2 text-slate-300">|</span><b className="text-slate-700">适用：</b>{rule?.applicableScenario}</p>
          <p className="text-[11px] text-rose-500 mt-2">⚠️ 本页为交互原型：所有字段为空、控件可点击操作、红色 * 为必填项、按采购方式条件渲染对应区块</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 附件槽位（复刻弹窗的 renderMaterialSlot + 弹窗里的虚线框样式）
// =====================================================================
function MaterialSlot({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className={`rounded-lg border-2 border-dashed p-3 transition ${required ? 'border-rose-300 bg-rose-50/40' : 'border-slate-300 bg-slate-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          📎 {label}{required && <span className="text-rose-500">（必填）</span>}
        </span>
        <span className="text-[11px] text-slate-400">0 个文件</span>
      </div>
      <button type="button" className="w-full py-2 text-xs text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 bg-white transition">+ 点击上传附件</button>
    </div>
  );
}

// =====================================================================
// 主表单：完全复刻 CompetitiveBiddingPage 弹窗（1611-2610 行）
// =====================================================================
function FormInteractiveSection({ methodKey }: { methodKey: string }) {
  const [isNew] = useState(true);
  const [selectedSuppliers] = useState<string[]>([]);
  const [selectedDemandId] = useState<number | null>(null);
  const itemsTotalLimit = 0;
  const offlineTotals = { ex: 0, in: 0, tax: 0 };
  const offlineFilledCount = 0;

  const [form, setForm] = useState<any>({
    biddingNo: '', projectName: '', procurementMethod: methodKey,
    projectImplementationUnit: '', implementationUnit: '', procurementHandler: '',
    procurementApprovalMethod: '', procurementApprovalDate: '',
    tenderer: '', hasAgent: false, agentName: '',
    announcementPublishTime: '', bidOpeningTime: '', judgeMethod: '',
    hasOwnerJudge: false, ownerRepresentatives: [''],
    winningSupplierName: '', winningSupplierLegalPerson: '', winningSupplierScore: undefined,
    contractAmount: undefined, awardTime: '',
    hasDispute: '否' as '是' | '否', disputeReason: '',
    losingSupplier1Name: '', losingSupplier1LegalPerson: '', losingSupplier1Score: undefined,
    losingSupplier2Name: '', losingSupplier2LegalPerson: '', losingSupplier2Score: undefined,
    isFailed: false, failedReason: '',
    supplier: '', taxTotalAmount: undefined, taxExclusiveTotalAmount: undefined,
    totalPriceLimit: undefined, frameworkCompareAmountExcludingTaxInput: undefined,
    drawTime: '', randomSupplierName: '', randomSupplierContact: '', randomContractNo: '', remark: '',
  });
  const upd = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const [bidderList, setBidderList] = useState<any[]>([{ name: '', contactPerson: '', phone: '', remark: '' }]);

  return (
    <div className="space-y-3">

      {/* ========== 基础信息（弹窗 1626-1671 行，3 字段 grid-cols-3） ========== */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="mb-1 text-xs text-[#606266]">工单编号</div>
          <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-sm"
            value={form.biddingNo || ''} placeholder={isNew ? '保存后自动生成' : undefined} disabled />
        </div>
        <div>
          <div className="mb-1 text-xs text-[#606266]">采购方式 <span className="text-[#f56c6c]">*</span></div>
          <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
            value={form.procurementMethod || methodKey}
            onChange={(e) => upd('procurementMethod', e.target.value)}>
            {PROCUREMENT_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <div className="mb-1 text-xs text-[#606266]">项目名称 <span className="text-[#f56c6c]">*</span><span className="text-slate-400 ml-1">(从需求自动带出，可编辑)</span></div>
          <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
            value={form.projectName || ''} onChange={(e) => upd('projectName', e.target.value)} placeholder="请输入项目名称" />
        </div>
      </div>

      {/* ========== 当前采购方式提示条（弹窗 1673-1692 行） ========== */}
      {form.procurementMethod && (
        <div className={`text-xs px-3 py-2 rounded border ${
          isCatalog(methodKey) ? 'bg-blue-50 border-blue-200 text-blue-700'
            : isRandom(methodKey) ? 'bg-purple-50 border-purple-200 text-purple-700'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          {isCatalog(methodKey) ? '📋 模式：目录内比价（线上报价）— 供应商在小程序报价，你只需设置单品上限和整单上限。'
            : isRandom(methodKey) ? '🎲 模式：随机抽取（线下录入）— 系统仅记录抽取结果，抽取动作不在本系统进行。可选择是否关联采购需求。'
            : isSimple(methodKey) ? '📝 模式：线下录入（简化无税率）— 你自己填写清单、不含税单价，走审批流程。无税率/含税列。'
            : '📝 模式：线下录入 — 你自己填写清单、单价、税率，走审批流程。'}
        </div>
      )}

      {/* ========== 关联采购需求（弹窗 1694-1721 行） ========== */}
      {(!isRandom(methodKey)) && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-[#606266]">
              关联采购需求 <span className="text-[#f56c6c]">*</span>
              <span className="text-slate-400 ml-1">(选择后将带入需求中的物资)</span>
            </span>
            <button type="button" className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">
              {selectedDemandId ? '更换' : '选择'}
            </button>
          </div>
          {selectedDemandId ? (
            <div className="border border-indigo-200 bg-indigo-50 rounded px-3 py-2 text-xs">
              <span className="font-mono text-indigo-600 mr-2">DM-DEMAND-XXXX</span>
              <span className="text-slate-700">示例项目名称</span>
            </div>
          ) : (
            <div className="border border-dashed border-[#dcdfe6] rounded px-3 py-2 text-xs text-slate-400 text-center">
              请点击上方"选择"按钮，从已审核通过的采购需求中选择
            </div>
          )}
        </div>
      )}

      {/* ========== 框架协议采购-随机抽取 专属表单（弹窗 1723-1811 行） ========== */}
      {isRandom(methodKey) && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-sm font-semibold text-purple-700 flex items-center gap-2">
            <span>🎲</span> 随机抽取结果录入
            <span className="text-xs text-slate-400 font-normal">(截图 L1-6 字段 + linkDemand 开关)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#606266]">是否关联采购需求</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
            <span className="text-xs text-slate-500">关闭后下方"关联采购需求"将隐藏（展会现场相关需求通常不关联）</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="mb-1 text-xs text-[#606266]">抽取时间 <span className="text-[#f56c6c]">*</span></div>
              <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={(form.drawTime || '').slice(0, 10)}
                onChange={(e) => upd('drawTime', e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">供应商 <span className="text-[#f56c6c]">*</span></div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.randomSupplierName || ''} onChange={(e) => upd('randomSupplierName', e.target.value)}
                placeholder="输入关键字模糊匹配供应商" />
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">供应商单位联系人 <span className="text-[#f56c6c]">*</span></div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.randomSupplierContact || ''} onChange={(e) => upd('randomSupplierContact', e.target.value)}
                placeholder="联系人姓名" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-xs text-[#606266]">关联合同编号 <span className="text-[#f56c6c]">*</span></div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.randomContractNo || ''} onChange={(e) => upd('randomContractNo', e.target.value)}
                placeholder="输入关键字，从供应商框架合同中匹配" />
              <div className="text-[11px] text-slate-400 mt-0.5">提示：先选择供应商，下拉将自动筛选该供应商的合同</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">备注</div>
              <textarea className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm resize-none" rows={1}
                value={form.remark || ''} onChange={(e) => upd('remark', e.target.value)} placeholder="(选填)" />
            </div>
          </div>
        </div>
      )}

      {/* ========== 明细摘要卡（弹窗 1813-2013 行，目录内比价 vs 线下录入） ========== */}
      {isCatalog(methodKey) ? (
        <>
          {/* 目录内比价：邀请供应商 + 物资明细摘要卡 + 整单上限 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-[#606266]">
                物资明细（0项）- 对每条物资设置「单品上限单价(含税)」
              </span>
            </div>
            <div className="border border-dashed border-[#dcdfe6] rounded p-6 text-center text-sm text-[#909399]">
              请先在上方选择一条已通过的采购需求，需求中的物资将自动带入。
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-[11px] text-slate-400">条目上限合计</div>
                <div className="text-sm font-semibold text-slate-800">¥{itemsTotalLimit.toLocaleString()}</div>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-[11px] text-slate-400">不含税金额合计</div>
                <div className="text-sm font-semibold text-indigo-600">¥0</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-[0.97] transition-all duration-200">
                📋 查看 / 编辑清单（0）
              </button>
            </div>
          </div>
          {/* 整单上限 */}
          <div>
            <div className="mb-1 text-xs text-[#606266]">
              整单上限总价(含税) <span className="text-[#f56c6c]">*</span>
              <span className="text-[#909399] ml-2">(参考：所有条目的上限×数量之和 ≈ ¥{itemsTotalLimit.toLocaleString()})</span>
            </div>
            <input type="number" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              value={form.totalPriceLimit ?? ''}
              onChange={(e) => upd('totalPriceLimit', e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder="请输入整单含税上限" />
          </div>
        </>
      ) : (
        <>
          {/* 线下录入类：清单明细摘要卡 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                清单明细
                <span className="ml-1.5 text-xs text-slate-400 font-normal">
                  （0 项）· {isSimple(methodKey) ? '填写不含税单价，自动计算不含税金额（无税率/含税列）' : '填写不含税单价和税率，含税自动计算'}
                </span>
              </span>
            </div>
            <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-8 text-center">
              <div className="text-slate-400 text-sm mb-3">请先在上方选择采购需求自动带入，或点击下方按钮导入 / 录入清单</div>
              <div className="flex items-center justify-center gap-2">
                <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200">📥 导入清单</button>
                <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-[0.97] transition-all duration-200">+ 录入清单条目</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== 受邀供应商（仅 framework_catalog，弹窗 2117-2155 行） ========== */}
      {isCatalog(methodKey) && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-[#606266]">受邀供应商</span>
            <button type="button" className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">
              {selectedSuppliers.length > 0 ? '重新选择' : '选择'}（已选 {selectedSuppliers.length} 家）
            </button>
          </div>
          {selectedSuppliers.length > 0 ? (
            <div className="border border-[#dcdfe6] rounded p-2 flex flex-wrap gap-1.5 min-h-[40px]">
              {selectedSuppliers.map((sid) => (
                <span key={sid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200">
                  {sid}<button type="button" className="hover:text-red-500 ml-0.5">×</button>
                </span>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#dcdfe6] rounded px-3 py-2 text-xs text-slate-400 text-center min-h-[40px]">
              请点击上方"选择"按钮，从启用的供应商中选择受邀对象
            </div>
          )}
        </div>
      )}

      {/* ========== 公告附件蓝框（framework_catalog + competitive_bidding，弹窗 2157-2214 行） ========== */}
      {(isCatalog(methodKey) || isCompetitive(methodKey)) && (
        <div className="border border-[#409eff] rounded p-3 bg-[#ecf5ff]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-[#303133]">{isCompetitive(methodKey) ? '竞价公告附件' : '比价公告附件'}</div>
              <div className="text-xs text-[#909399]">上传相关文件（PDF/Word/图片等）</div>
            </div>
          </div>
          <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#b3d8ff] rounded bg-white">暂无附件，点击上方「上传附件」选择文件</div>
        </div>
      )}

      {/* ========== 线下流程专属：基础执行信息（弹窗 2016-2115 行） ========== */}
      {(isOffline(methodKey) || isSimple(methodKey)) && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
            <span>📋</span> 基础执行信息
            <span className="text-xs text-slate-400 font-normal">(916 L12-20)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="mb-1 text-xs text-[#606266]">采购方式审批方式 <span className="text-[#f56c6c]">*</span></div>
              <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.procurementApprovalMethod || ''} onChange={(e) => upd('procurementApprovalMethod', e.target.value)}>
                <option value="">请选择</option>
                <option value="meeting">会议审批</option>
                <option value="sign_report">签报审批</option>
                <option value="application_form">采购项目申请表</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">采购方式审批日期 <span className="text-[#f56c6c]">*</span></div>
              <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={(form.procurementApprovalDate || '').slice(0, 10)} onChange={(e) => upd('procurementApprovalDate', e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">招采实施单位 <span className="text-[#f56c6c]">*</span></div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.implementationUnit || ''} onChange={(e) => upd('implementationUnit', e.target.value)} placeholder="如：国金招标采购中心" />
            </div>
            {/* 项目实施单位：inquiry + competitive + direct + e_mall 有 */}
            {(isInquiry(methodKey) || isCompetitive(methodKey) || isSimple(methodKey)) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">项目实施单位
                  {isSimple(methodKey) && <span className="text-[#f56c6c]">*</span>}
                </div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.projectImplementationUnit || ''} onChange={(e) => upd('projectImplementationUnit', e.target.value)}>
                  <option value="">请选择部门</option>
                  {PROJECT_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <div>
              <div className="mb-1 text-xs text-[#606266]">招采经办人 <span className="text-[#f56c6c]">*</span></div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.procurementHandler || ''} onChange={(e) => upd('procurementHandler', e.target.value)} placeholder="经办人姓名" />
            </div>
            {/* 直接/商城 供应商 */}
            {isSimple(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">供应商 <span className="text-[#f56c6c]">*</span></div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.supplier || ''} onChange={(e) => upd('supplier', e.target.value)} placeholder="请输入供应商名称" />
              </div>
            )}
            {isSimple(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">含税总金额 <span className="text-[#909399] text-[11px]">(与清单自动合计比对)</span></div>
                <input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.taxTotalAmount ?? ''} onChange={(e) => upd('taxTotalAmount', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="请输入含税总金额(可留空)" />
              </div>
            )}
            {isSimple(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">不含税总金额 <span className="text-[#909399] text-[11px]">(与清单自动合计比对)</span></div>
                <input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.taxExclusiveTotalAmount ?? ''} onChange={(e) => upd('taxExclusiveTotalAmount', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="请输入不含税总金额(可留空)" />
              </div>
            )}
            {/* 招标人：inquiry + competitive + negotiation 有 */}
            {hasNegotiator(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">招标人</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.tenderer || ''} onChange={(e) => upd('tenderer', e.target.value)} placeholder="如：长沙国际会展中心" />
              </div>
            )}
          </div>
          {/* 审批文件附件 */}
          <MaterialSlot
            label={isSimple(methodKey) ? '相关文件资料' : '采购方式审批文件资料'}
            required={isSimple(methodKey)}
          />
        </div>
      )}

      {/* ========== 线下流程专属：招标公告与时间（弹窗 2216-2342 行） ========== */}
      {isOffline(methodKey) && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
            <span>📢</span>
            {methodKey === 'inquiry_invited' ? '邀请公告与时间' : '招标公告与时间'}
            <span className="text-xs text-slate-400 font-normal">(916 L21-30)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {/* 代理机构 radio：5 种线下都有 */}
            {hasNegotiator(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">是否有招标代理机构</div>
                <div className="flex gap-3 pt-1">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="hasAgent" checked={!!form.hasAgent}
                      onChange={() => upd('hasAgent', true)} /> 是
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="hasAgent" checked={!form.hasAgent}
                      onChange={() => { upd('hasAgent', false); upd('agentName', ''); }} /> 否
                  </label>
                </div>
              </div>
            )}
            {hasNegotiator(methodKey) && form.hasAgent && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">招标代理机构名称</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.agentName || ''} onChange={(e) => upd('agentName', e.target.value)} placeholder="如：湖南招标代理公司" />
              </div>
            )}
            {/* 公告发布时间：询比/竞价/谈判-公开 */}
            {hasAnnounceTime(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">招采公告发布时间</div>
                <input type="datetime-local" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={(form.announcementPublishTime || '').replace(' ', 'T').slice(0, 16)}
                  onChange={(e) => upd('announcementPublishTime', e.target.value.replace('T', ' '))} />
              </div>
            )}
            {/* 开标时间：询比/竞价 */}
            {hasBidOpening(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">开标时间</div>
                <input type="datetime-local" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={(form.bidOpeningTime || '').replace(' ', 'T').slice(0, 16)}
                  onChange={(e) => upd('bidOpeningTime', e.target.value.replace('T', ' '))} />
              </div>
            )}
            {/* 评标办法：询比/竞价 */}
            {hasJudgeMethod(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">评标办法</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.judgeMethod || ''} onChange={(e) => upd('judgeMethod', e.target.value)} placeholder="如：综合评估法 / 最低价法" />
              </div>
            )}
          </div>
          {/* 业主评委 + 业主代表：只有 inquiry + competitive 有 */}
          {hasOwnerJudge(methodKey) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-xs text-[#606266]">是否委派业主评委</div>
                <div className="flex gap-3 pt-1">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="hasOwnerJudge" checked={!!form.hasOwnerJudge}
                      onChange={() => upd('hasOwnerJudge', true)} /> 是
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="hasOwnerJudge" checked={!form.hasOwnerJudge}
                      onChange={() => upd('hasOwnerJudge', false)} /> 否
                  </label>
                </div>
              </div>
              {form.hasOwnerJudge && (
                <div>
                  <div className="mb-1 text-xs text-[#606266]">业主代表</div>
                  <div className="space-y-1.5">
                    {(form.ownerRepresentatives && form.ownerRepresentatives.length > 0
                      ? form.ownerRepresentatives
                      : ['']
                    ).map((name: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                          value={name} placeholder={`业主代表 ${idx + 1}`}
                          onChange={(e) => {
                            const arr = [...(form.ownerRepresentatives && form.ownerRepresentatives.length > 0
                              ? form.ownerRepresentatives
                              : [''])];
                            arr[idx] = e.target.value;
                            upd('ownerRepresentatives', arr);
                          }} />
                        {idx > 0 && (
                          <button type="button" className="px-1 text-xs text-red-500 hover:text-red-600 shrink-0"
                            onClick={() => {
                              const arr = (form.ownerRepresentatives || ['']).filter((_: any, i: number) => i !== idx);
                              upd('ownerRepresentatives', arr.length ? arr : ['']);
                            }}>删除</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 pt-0.5"
                      onClick={() => {
                        const base = (form.ownerRepresentatives && form.ownerRepresentatives.length > 0
                          ? form.ownerRepresentatives
                          : ['']);
                        upd('ownerRepresentatives', [...base, '']);
                      }}>+ 添加业主代表
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== 报名单位（弹窗 2344-2443 行） ========== */}
      {(isInquiry(methodKey) || isCompetitive(methodKey) || isNegotiation(methodKey)) && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
            <span>👥</span> 报名单位
            <span className="text-xs text-slate-400 font-normal">(可自行增减行项)</span>
          </div>
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left w-10">#</th>
                  <th className="px-2 py-2 text-left">单位名称</th>
                  <th className="px-2 py-2 text-left w-28">联系人</th>
                  <th className="px-2 py-2 text-left w-28">联系电话</th>
                  <th className="px-2 py-2 text-left">备注</th>
                  <th className="px-2 py-2 text-center w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {(bidderList.length > 0 ? bidderList : [{ name: '', contactPerson: '', phone: '', remark: '' }])
                  .map((b: any, idx: number) => (
                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-1.5 text-slate-500">{idx + 1}</td>
                    {['name', 'contactPerson', 'phone', 'remark'].map((k) => (
                      <td key={k} className="px-2 py-1.5">
                        <input
                          className="w-full h-7 px-1.5 border border-slate-200 rounded text-xs"
                          value={b[k] || ''}
                          placeholder={k === 'name' ? '单位名称(必填)' : ''}
                          onChange={(e) => {
                            const arr = [...((bidderList.length > 0) ? bidderList : [{ name: '', contactPerson: '', phone: '', remark: '' }])];
                            arr[idx] = { ...arr[idx], [k]: e.target.value };
                            setBidderList(arr);
                          }}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center">
                      <button type="button" className="text-rose-500 hover:text-rose-600 text-xs"
                        onClick={() => setBidderList(bidderList.filter((_, i) => i !== idx))}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button"
              className="w-full py-1.5 text-indigo-600 hover:text-indigo-700 text-xs bg-slate-50 border-t border-slate-200"
              onClick={() => setBidderList([...bidderList, { name: '', contactPerson: '', phone: '', remark: '' }])}>
              + 添加一行报名单位
            </button>
          </div>
        </div>
      )}

      {/* ========== 中标结果（弹窗 2445-2556 行） ========== */}
      {isOffline(methodKey) && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
            <span>🏆</span> 中标结果
            <span className="text-xs text-slate-400 font-normal">(916 L31-45)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="mb-1 text-xs text-[#606266]">中标供应商姓名</div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.winningSupplierName || ''} onChange={(e) => upd('winningSupplierName', e.target.value)}
                placeholder="中标单位全称" />
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">中标单位法人</div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.winningSupplierLegalPerson || ''} onChange={(e) => upd('winningSupplierLegalPerson', e.target.value)}
                placeholder="法人姓名" />
            </div>
            {hasWinnerScore(methodKey) && (
              <div>
                <div className="mb-1 text-xs text-[#606266]">中标单位得分</div>
                <input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={form.winningSupplierScore ?? ''} onChange={(e) => upd('winningSupplierScore', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="如：92.50" />
              </div>
            )}
            <div>
              <div className="mb-1 text-xs text-[#606266]">中标/合同金额（元）</div>
              <input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={form.contractAmount ?? ''} onChange={(e) => upd('contractAmount', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00" />
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">中标时间</div>
              <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={(form.awardTime || '').slice(0, 10)} onChange={(e) => upd('awardTime', e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs text-[#606266]">是否存在答疑/质疑/投诉</div>
              <div className="flex gap-3 pt-1">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="radio" name="hasDispute" value="是" checked={form.hasDispute === '是'}
                    onChange={() => upd('hasDispute', '是')} /> 是
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="radio" name="hasDispute" value="否" checked={form.hasDispute === '否'}
                    onChange={() => { upd('hasDispute', '否'); upd('disputeReason', ''); }} /> 否
                </label>
              </div>
              {form.hasDispute === '是' && (
                <textarea value={form.disputeReason || ''} onChange={(e) => upd('disputeReason', e.target.value)}
                  rows={2} placeholder="请简要说明答疑/质疑/投诉情况"
                  className="mt-1.5 w-full text-xs px-2 py-1.5 border border-[#dcdfe6] rounded resize-none min-h-[56px]" />
              )}
            </div>
          </div>
          {/* 未中标单位1/2（只有 inquiry + competitive 有完整字段） */}
          {hasLosers(methodKey) && (
            <>
              <div className="text-xs text-slate-500 mt-2">未中标单位</div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => {
                  const prefix = i === 1 ? 'losingSupplier1' : 'losingSupplier2';
                  return (
                    <div key={i} className="border border-slate-200 rounded p-2.5 space-y-2">
                      <div className="text-xs font-medium text-slate-600">未中标单位 {i}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <input className="h-7 px-1.5 border border-slate-200 rounded text-xs"
                          value={form[`${prefix}Name`] || ''}
                          onChange={(e) => upd(`${prefix}Name`, e.target.value)}
                          placeholder="单位名称" />
                        <input className="h-7 px-1.5 border border-slate-200 rounded text-xs"
                          value={form[`${prefix}LegalPerson`] || ''}
                          onChange={(e) => upd(`${prefix}LegalPerson`, e.target.value)}
                          placeholder="法人" />
                        <input type="number" step="0.01" className="h-7 px-1.5 border border-slate-200 rounded text-xs"
                          value={form[`${prefix}Score`] ?? ''}
                          onChange={(e) => upd(`${prefix}Score`, e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="得分" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== 审批材料附件 + 流标（弹窗 2558-2610 行） ========== */}
      {isOffline(methodKey) && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
            <span>📎</span> 审批材料附件
            <span className="text-xs text-slate-400 font-normal">(916 L46-55)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(isInquiry(methodKey) || isCompetitive(methodKey) || isNegotiation(methodKey)) && (
              <MaterialSlot label="会议纪要" required />
            )}
            {(isInquiry(methodKey) || isCompetitive(methodKey) || isNegotiation(methodKey)) && (
              <MaterialSlot label="上会材料" required />
            )}
            {hasNegotiator(methodKey) && (
              <MaterialSlot label="招标代理抽取结果表" />
            )}
            {(isInquiry(methodKey) || isCompetitive(methodKey) || isNegotiation(methodKey)) && (
              <MaterialSlot label="成交通知书" required />
            )}
            {(isInquiry(methodKey) || isCompetitive(methodKey) || isNegotiation(methodKey)) && (
              <MaterialSlot label="招采过程备案" required />
            )}
            <MaterialSlot label="合资公司会议纪要" />
            <MaterialSlot label="合资公司上会材料" />
          </div>

          {/* 流标 */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#606266] font-semibold">流标：</span>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" name="isFailed" checked={!!form.isFailed}
                  onChange={() => upd('isFailed', true)} />
                <span className="text-xs text-[#606266]">是</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" name="isFailed" checked={!form.isFailed}
                  onChange={() => { upd('isFailed', false); upd('failedReason', ''); }} />
                <span className="text-xs text-[#606266]">否</span>
              </label>
            </div>
            {!!form.isFailed && (
              <div className="mt-2">
                <label className="text-xs text-[#606266] font-semibold block mb-1">流标原因</label>
                <textarea
                  value={form.failedReason || ''} onChange={(e) => upd('failedReason', e.target.value)}
                  rows={4}
                  placeholder="请填写流标原因（如：投标供应商不足3家、报价均超出预算、有效标不足等）"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-y min-h-[96px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================================================
// 主页面
// =====================================================================
export default function BiddingScenePage() {
  const { sceneKey } = useParams<{ sceneKey: string }>();
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <FormInteractiveSection methodKey={methodKey} />
      </div>
    </div>
  );
}
