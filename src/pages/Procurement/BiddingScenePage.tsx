// =====================================================================
// 招采执行场景模板页 —— 9 种采购方式的独立演示
// URL 形如：/procurement/bidding-scene/framework-catalog
// =====================================================================

import { useParams } from 'react-router-dom';
import {
  BIDDING_SCENE_MOCKS,
  PROCUREMENT_METHOD_RULES,
  type BiddingSceneKey,
  type BiddingSceneMock,
  type CatalogDetailRow,
  type OfflineDetailRow,
  type SimpleDetailRow,
} from '@/constants/biddingSceneMocks';

// =====================================================================
// 顶部场景说明卡片
// =====================================================================
function SceneHeaderCard({ mock }: { mock: BiddingSceneMock }) {
  const rule = PROCUREMENT_METHOD_RULES.find(r => r.key === mock.key);
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 mb-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <span className="text-white text-xl font-bold">招</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-lg font-semibold text-slate-800">招采执行场景演示</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
              {mock.label}
            </span>
            {rule && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                {rule.tableTypeLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-2 leading-relaxed">{mock.description}</p>
          {rule && (
            <p className="text-xs text-slate-500 leading-relaxed">
              <b className="text-slate-700">业务含义：</b>{rule.reason}
              <span className="mx-2 text-slate-300">|</span>
              <b className="text-slate-700">适用：</b>{rule.applicableScenario}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 业务门控规则速查表（9 种采购方式 × 表结构类型）
// =====================================================================
function BusinessRulesSummary({ currentKey }: { currentKey: BiddingSceneKey }) {
  const typeColors: Record<string, string> = {
    catalog: 'bg-amber-100 text-amber-700 border-amber-200',
    offline: 'bg-slate-100 text-slate-700 border-slate-200',
    simple: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    random_only: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
          📖 9 种采购方式 · 业务门控规则速查表
        </h2>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-xs border border-slate-200 min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <Th w="w-12">#</Th>
              <Th w="w-52">采购方式</Th>
              <Th w="w-40">明细表结构</Th>
              <Th>业务含义</Th>
            </tr>
          </thead>
          <tbody>
            {PROCUREMENT_METHOD_RULES.map((r, idx) => {
              const highlight = r.key === currentKey;
              return (
                <tr key={r.key} className={`border-t border-slate-100 ${highlight ? 'bg-indigo-50/50 font-medium' : ''}`}>
                  <Td className="text-slate-400">{idx + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {highlight && <span className="text-indigo-500 text-base">⬅</span>}
                      <span className={highlight ? 'text-indigo-800 font-semibold' : 'text-slate-800'}>{r.label}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className={`inline-block px-2 py-0.5 rounded border text-[11px] ${typeColors[r.tableType]}`}>
                      {r.tableTypeLabel}
                    </span>
                  </Td>
                  <Td className="text-slate-600 leading-relaxed">
                    <div><b>为什么：</b>{r.reason}</div>
                    <div className="text-slate-500 mt-0.5"><b>适用：</b>{r.applicableScenario}</div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap gap-3">
        <span>🔴 <b className="text-slate-700">随机抽取</b>：唯一无明细表的方式，只填 6 个字段</span>
        <span>🟠 <b className="text-slate-700">目录内比价</b>：唯一线上报价模式（竞价文件 + 供应商报价 + 中标供应商）</span>
        <span>🟢 <b className="text-slate-700">直接/商城</b>：唯一简化无税表（10 列，无税率/无含税列）</span>
        <span>⚪ <b className="text-slate-700">询比/竞价/谈判</b>：通用线下完整表（12 列，有税率+含税）</span>
      </div>
    </div>
  );
}

// =====================================================================
// 表单只读展示 —— 按采购方式门控渲染完整字段
// =====================================================================
function FormReadOnlySection({ mock }: { mock: BiddingSceneMock }) {
  const { form } = mock;
  const isOfflineFamily = ['inquiry_open','inquiry_invited','competitive_bidding','negotiation_open','negotiation_invited','direct','e_mall'].includes(mock.key);
  const hasAnnouncementInfo = ['inquiry_open','inquiry_invited','competitive_bidding','negotiation_open','negotiation_invited'].includes(mock.key);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-xl flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
          招采执行工单（只读演示）
        </h2>
        <span className="text-xs text-slate-400">表单区 · 全部字段预置演示数据（对齐新增弹窗）</span>
      </div>

      {/* ===== 基础信息（所有 9 种方式共有） ===== */}
      <div className="p-5 grid grid-cols-3 gap-y-4 gap-x-6">
        <FormField label="工单编号" value={form.biddingNo} />
        <FormField label="项目名称" value={form.projectName} />
        <FormField label="工单名称" value={form.biddingName} />
        <FormField label="采购方式" value={form.procurementMethod} highlight />
        <FormField label="截止时间" value={form.deadline} />
        <FormField label="关联采购需求" value={form.demandNo || '（无）'} />
        <FormField label="申请事由" value={form.applyReason} fullWidth />
      </div>

      {/* ===== ① 目录内比价独有区块 ===== */}
      {mock.catalogSection && (
        <CatalogExtraSection section={mock.catalogSection} />
      )}

      {/* ===== ② 框架随机抽取专用字段 ===== */}
      {mock.randomOnly && (
        <RandomOnlySection data={mock.randomOnly} />
      )}

      {/* ===== ③ 线下 9 种通用区块 ===== */}
      {isOfflineFamily && mock.offlineSection && (
        <OfflineExtraSection
          section={mock.offlineSection}
          keyLabel={mock.key}
          showAnnouncement={hasAnnouncementInfo}
          isDirectMall={mock.key === 'direct' || mock.key === 'e_mall'}
        />
      )}

      {/* ===== ④ 直接采购/电子商城独有 ===== */}
      {mock.directMallSection && (
        <DirectMallExtraSection section={mock.directMallSection} />
      )}
    </div>
  );
}

// --- 子区块 1：目录内比价独有 ---
function CatalogExtraSection({ section }: { section: NonNullable<BiddingSceneMock['catalogSection']> }) {
  return (
    <>
      <Divider />
      <SectionHeader icon="🏗️" title="受邀供应商" sub="目录内比价独有：弹窗多选框架供应商库中的受邀对象" tone="amber" />
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-2">
          {section.invitedSuppliers.map((s) => (
            <span key={s.name} className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs rounded-md border border-amber-200">
              {s.name} · <span className="text-amber-600">{s.contact}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4 grid grid-cols-3 gap-y-4 gap-x-6">
        <FormField label="整单含税上限总价（元）" value={`¥ ${section.totalPriceLimitTaxIncl.toLocaleString()}`} />
        <FormField label="报价窗口开始" value={section.bidWindowStart} />
        <FormField label="报价窗口结束" value={section.bidWindowEnd} />
      </div>
      <div className="px-5 pb-4 grid grid-cols-2 gap-x-6">
        <FileListBlock title="📎 比价公告附件" files={section.biddingAnnouncementFiles} color="blue" />
        <FileListBlock title="📎 比价文件附件（逐行）" files={section.biddingDocumentFiles} color="amber" />
      </div>
    </>
  );
}

// --- 子区块 2：随机抽取 ---
function RandomOnlySection({ data }: { data: NonNullable<BiddingSceneMock['randomOnly']> }) {
  return (
    <>
      <Divider />
      <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-700">
        ⚠️ 框架协议采购-随机抽取 专用字段（此方式**无**明细清单表，以下 6 个字段为必填）
      </div>
      <div className="p-5 grid grid-cols-3 gap-y-4 gap-x-6">
        <FormField label="抽取时间" value={data.drawTime} />
        <FormField label="供应商" value={data.randomSupplierName} />
        <FormField label="供应商单位联系人" value={data.randomSupplierContact} />
        <FormField label="关联合同编号" value={data.randomContractNo} />
        <FormField label="是否关联采购需求" value={data.linkDemand ? '✓ 是' : '✗ 否'} />
        {data.linkDemand && <FormField label="关联需求名称" value={data.demandName || ''} />}
      </div>
    </>
  );
}

// --- 子区块 3：线下通用（询比/竞价/谈判/直接/商城） ---
function OfflineExtraSection({
  section, showAnnouncement, isDirectMall,
}: {
  section: NonNullable<BiddingSceneMock['offlineSection']>;
  keyLabel: string;
  showAnnouncement: boolean;
  isDirectMall: boolean;
}) {
  return (
    <>
      {/* 基础执行信息 */}
      <Divider />
      <SectionHeader icon="📋" title="基础执行信息" sub="审批方式、实施单位、经办人（直接/商城 6 项强制必填）" tone="slate" />
      <div className="px-5 pb-4 grid grid-cols-3 gap-y-4 gap-x-6">
        <FormField label="采购方式审批方式" value={section.approvalMethod} />
        <FormField label="采购方式审批日期" value={section.approvalDate} />
        <FormField label="招采实施单位" value={section.implementationUnit} />
        {section.projectImplementationUnit && <FormField label="项目实施单位" value={section.projectImplementationUnit} />}
        <FormField label="招采经办人" value={section.handler} />
        {section.tenderer && <FormField label="招标人" value={section.tenderer} />}
      </div>

      {/* 线下清单合计金额（直接/商城显示在 directMallSection 里了） */}
      {!isDirectMall && (
        <>
          <div className="px-5 pb-4 grid grid-cols-4 gap-x-6">
            <div className="px-3 py-2 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500">清单不含税自动合计</div>
              <div className="text-sm font-semibold text-slate-700">¥ {section.listAutoTotalExTax.toLocaleString()}</div>
            </div>
            <div className="px-3 py-2 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500">清单含税自动合计</div>
              <div className="text-sm font-semibold text-slate-700">¥ {section.listAutoTotalInclTax.toLocaleString()}</div>
            </div>
            {section.manualTotalExTax !== undefined && (
              <div className="px-3 py-2 bg-indigo-50 rounded border border-indigo-200 text-center">
                <div className="text-[11px] text-indigo-600">手填不含税合计</div>
                <div className="text-sm font-semibold text-indigo-700">¥ {section.manualTotalExTax.toLocaleString()}</div>
              </div>
            )}
            {section.manualTotalInclTax !== undefined && (
              <div className="px-3 py-2 bg-purple-50 rounded border border-purple-200 text-center">
                <div className="text-[11px] text-purple-600">手填含税合计</div>
                <div className="text-sm font-semibold text-purple-700">¥ {section.manualTotalInclTax.toLocaleString()}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 招标公告与时间（询比/竞价/谈判 5 种） */}
      {showAnnouncement && section.announcementPublishDate && (
        <>
          <Divider />
          <SectionHeader icon="📢" title="招标公告与时间" sub="发布时间、开标时间、评标办法" tone="blue" />
          <div className="px-5 pb-4 grid grid-cols-3 gap-y-4 gap-x-6">
            <FormField label="招标公告发布时间" value={section.announcementPublishDate} />
            <FormField label="开标时间" value={section.bidOpeningTime || '-'} />
            <FormField label="评标办法" value={section.judgeMethod || '-'} />
          </div>
          {section.hasAgency && (
            <div className="px-5 pb-4 grid grid-cols-3 gap-y-4 gap-x-6">
              <FormField label="是否委托招标代理机构" value={section.hasAgency ? '✓ 是' : '✗ 否'} />
              {section.agencyName && <FormField label="招标代理机构" value={section.agencyName} />}
            </div>
          )}
        </>
      )}

      {/* 报名单位 */}
      {(section.bidders || []).length > 0 && (
        <>
          <Divider />
          <SectionHeader icon="👥" title="报名单位" sub={`共 ${(section.bidders || []).length} 家`} tone="slate" />
          <div className="px-5 pb-4 overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 min-w-[600px]">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-2 py-2 border border-slate-200 text-left w-10">#</th>
                  <th className="px-2 py-2 border border-slate-200 text-left">单位名称</th>
                  <th className="px-2 py-2 border border-slate-200 text-left">联系人</th>
                  <th className="px-2 py-2 border border-slate-200 text-left">联系电话</th>
                  <th className="px-2 py-2 border border-slate-200 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {(section.bidders || []).map((b, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 border border-slate-200 text-slate-400">{i + 1}</td>
                    <td className="px-2 py-1.5 border border-slate-200 font-medium text-slate-800">{b.name}</td>
                    <td className="px-2 py-1.5 border border-slate-200">{b.contact}</td>
                    <td className="px-2 py-1.5 border border-slate-200 font-mono text-slate-600">{b.phone}</td>
                    <td className="px-2 py-1.5 border border-slate-200 text-slate-500">{b.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 中标结果 */}
      {section.winningSupplier && (
        <>
          <Divider />
          <SectionHeader icon="🏆" title="中标结果" sub="中标单位、得分、合同金额" tone="green" />
          <div className="px-5 pb-4 grid grid-cols-3 gap-y-4 gap-x-6">
            <FormField label="中标供应商全称" value={section.winningSupplier} />
            {section.winningSupplierLegal && <FormField label="中标单位法人" value={section.winningSupplierLegal} />}
            {section.winningSupplierScore !== undefined && <FormField label="中标单位得分" value={section.winningSupplierScore.toString()} />}
            {section.winningContractAmount !== undefined && <FormField label="中标合同金额（元）" value={`¥ ${section.winningContractAmount.toLocaleString()}`} />}
            {section.winningDate && <FormField label="中标时间" value={section.winningDate} />}
            {section.hasDispute !== undefined && <FormField label="是否存在纠纷/质疑/投诉" value={section.hasDispute ? '⚠ 是' : '✗ 否'} />}
          </div>
          {(section.loser1 || section.loser2) && (
            <div className="px-5 pb-4 grid grid-cols-2 gap-x-6">
              {section.loser1 && (
                <div className="px-3 py-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-1">未中标单位 1</div>
                  <div className="text-sm font-medium text-slate-700">{section.loser1.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">法人：{section.loser1.legal || '-'} · 得分：{section.loser1.score ?? '-'}</div>
                </div>
              )}
              {section.loser2 && (
                <div className="px-3 py-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-1">未中标单位 2</div>
                  <div className="text-sm font-medium text-slate-700">{section.loser2.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">法人：{section.loser2.legal || '-'} · 得分：{section.loser2.score ?? '-'}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 审批材料附件 */}
      {(section.awardNoticeFiles?.length || section.approvalFileFiles?.length) && (
        <>
          <Divider />
          <SectionHeader icon="📎" title="审批材料附件" sub={isDirectMall ? '直接/商城：相关文件资料（成交通知书必填）' : '线下方式：成交通知书 + 采购方式审批文件'} tone="slate" />
          <div className="px-5 pb-4 grid grid-cols-2 gap-x-6">
            {section.awardNoticeFiles && section.awardNoticeFiles.length > 0 && (
              <FileListBlock title={isDirectMall ? '📎 成交通知书（必填）' : '📎 成交通知书（必填）'} files={section.awardNoticeFiles} color="green" />
            )}
            {section.approvalFileFiles && section.approvalFileFiles.length > 0 && (
              <FileListBlock title={isDirectMall ? '📎 相关文件资料' : '📎 采购方式审批文件'} files={section.approvalFileFiles} color="slate" />
            )}
          </div>
        </>
      )}
    </>
  );
}

// --- 子区块 4：直接采购/电子商城独有 ---
function DirectMallExtraSection({ section }: { section: NonNullable<BiddingSceneMock['directMallSection']> }) {
  return (
    <>
      <Divider />
      <SectionHeader icon="⚠️" title="直接/商城 独有字段" sub="6 项强制必填（供应商、含税/不含税总金额、成交通知书附件）" tone="emerald" />
      <div className="px-5 pb-4 grid grid-cols-3 gap-y-4 gap-x-6">
        <FormField label="供应商" value={section.supplier} highlight />
        {section.taxTotalAmount !== undefined && <FormField label="含税总金额（元）" value={`¥ ${section.taxTotalAmount.toLocaleString()}`} />}
        {section.taxExclusiveTotalAmount !== undefined && <FormField label="不含税总金额（元）" value={`¥ ${section.taxExclusiveTotalAmount.toLocaleString()}`} />}
      </div>
      <div className="px-5 pb-4">
        <FileListBlock title="📎 成交通知书附件（强制必填）" files={section.awardNoticeFiles} color="emerald" />
      </div>
    </>
  );
}

// --- 通用小组件 ---
function Divider() {
  return <div className="border-t border-slate-200 mx-5"></div>;
}
function SectionHeader({ icon, title, sub, tone }: { icon: string; title: string; sub?: string; tone: 'amber' | 'blue' | 'slate' | 'green' | 'emerald' | 'rose' }) {
  const toneMap: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    green: 'bg-green-50 border-green-200 text-green-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
  };
  return (
    <div className={`px-5 py-3 border-b ${toneMap[tone]}`}>
      <span className="text-sm font-semibold">{icon} {title}</span>
      {sub && <span className="ml-2 text-xs opacity-70">{sub}</span>}
    </div>
  );
}
function FileListBlock({ title, files, color }: { title: string; files: string[]; color: 'blue' | 'amber' | 'green' | 'slate' | 'emerald' }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <div className="text-xs font-semibold mb-2">{title}</div>
      {files.length === 0 ? (
        <div className="text-[11px] opacity-60">（无附件）</div>
      ) : (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={i} className="text-xs flex items-center gap-1.5">
              <span>📄</span>
              <span className="font-mono">{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, fullWidth, highlight }: { label: string; value: string; fullWidth?: boolean; highlight?: boolean }) {
  return (
    <div className={fullWidth ? 'col-span-3' : ''}>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`px-3 py-2 rounded-lg text-sm border border-slate-200 ${highlight ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-medium' : 'bg-slate-50 text-slate-800'}`}>
        {value}
      </div>
    </div>
  );
}

// =====================================================================
// 明细表 1：目录内比价（14 列宽表，有竞价文件/供应商报价/中标/合同编号）
// =====================================================================
function CatalogTable({ rows }: { rows: CatalogDetailRow[] }) {
  const totalEx = rows.reduce((s, r) => s + r.supplierAmountExTax, 0);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50/30 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">📋 框架协议采购-目录内比价（线上报价模式）</h3>
          <p className="text-xs text-slate-500 mt-0.5">共 {rows.length} 条 · 供应商不含税金额合计 ¥ {totalEx.toLocaleString()}</p>
        </div>
        <div className="flex gap-1">
          <DisabledBtn text="导入清单" />
          <DisabledBtn text="+ 添加条目" primary />
        </div>
      </div>
      <div className="border border-slate-200 rounded overflow-auto">
        <table className="text-xs w-full" style={{ minWidth: 2200 }}>
          <thead className="bg-amber-50/60 text-slate-700">
            <tr>
              <Th>#</Th><Th>项目名称</Th><Th>项目概况/物料名称</Th>
              <Th>合同费率(元/月)</Th><Th>不含税单价</Th><Th>单价说明</Th>
              <Th>数量</Th><Th>单位</Th>
              <Th bg="#FEF2F2">竞价文件*</Th>
              <Th bg="#EEF2FF">供应商不含税单价</Th><Th bg="#EEF2FF">供应商不含税金额</Th>
              <Th>中标供应商名称</Th><Th>关联合同编号</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-amber-50/10">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td>{r.projectName}</Td>
                <Td>{r.description}</Td>
                <Td className="text-right">{r.contractRatePerMonth ?? '-'}</Td>
                <Td className="text-right font-mono">{r.demandUnitPriceExcludingTax.toFixed(2)}</Td>
                <Td>{r.priceDescription}</Td>
                <Td className="text-right">{r.quantity}</Td>
                <Td>{r.unit}</Td>
                <Td>📎 报价单.pdf</Td>
                <Td className="text-right font-mono text-indigo-600">{r.supplierUnitPrice.toFixed(2)}</Td>
                <Td className="text-right font-semibold text-indigo-600">{r.supplierAmountExTax.toLocaleString()}</Td>
                <Td>{r.winningSupplierName || '-'}</Td>
                <Td className="font-mono">{r.contractNo}</Td>
                <Td className="text-center text-slate-400">只读</Td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-amber-50/40 font-semibold">
            <tr>
              <td colSpan={10} className="px-2 py-2 border border-slate-200 text-right text-slate-700">供应商不含税金额合计</td>
              <td className="px-2 py-2 border border-slate-200 text-indigo-600">¥ {totalEx.toLocaleString()}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700">
        💡 这 5 列（<b>竞价文件</b>、<b>供应商不含税单价</b>、<b>供应商不含税金额</b>、<b>中标供应商名称</b>、<b>关联合同编号</b>）是目录内比价**独有的**，其他 8 种采购方式没有。流程：从合同目录选物资 → 上传竞价文件 → 供应商在模拟器报价 → 系统比出价最低者中标。
      </div>
    </div>
  );
}

// =====================================================================
// 明细表 2：线下完整表（12 列，有税率+含税）
// =====================================================================
function OfflineTable({ rows, title }: { rows: OfflineDetailRow[]; title: string }) {
  const totalEx = rows.reduce((s, r) => s + r.unitPriceExcludingTax * r.quantity, 0);
  const totalTax = rows.reduce((s, r) => s + r.unitPriceExcludingTax * r.quantity * r.taxRate, 0);
  const totalIn = totalEx + totalTax;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="px-5 py-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">📋 {title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">共 {rows.length} 条 · 不含税合计 ¥ {totalEx.toLocaleString()} · 含税合计 ¥ {totalIn.toLocaleString()}</p>
        </div>
        <div className="flex gap-1">
          <DisabledBtn text="导入清单" />
          <DisabledBtn text="导出清单" />
          <DisabledBtn text="+ 添加条目" primary />
        </div>
      </div>
      <div className="border border-slate-200 rounded overflow-auto">
        <table className="text-xs w-full" style={{ minWidth: 1600 }}>
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <Th>#</Th><Th>供应商单位</Th><Th>项目/物料名称</Th>
              <Th>数量</Th><Th>单位</Th><Th>税率</Th>
              <Th>不含税单价</Th><Th>单价备注</Th>
              <Th bg="#EEF2FF">含税单价(自动)</Th>
              <Th>不含税金额</Th><Th bg="#F3E8FF">含税金额</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const unitIncl = r.unitPriceExcludingTax * (1 + r.taxRate);
              const amtEx = r.unitPriceExcludingTax * r.quantity;
              const amtIn = amtEx * (1 + r.taxRate);
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-indigo-50/10">
                  <Td className="text-slate-400">{idx + 1}</Td>
                  <Td>{r.supplierName}</Td>
                  <Td className="font-medium text-slate-800">{r.itemName}</Td>
                  <Td className="text-right">{r.quantity}</Td>
                  <Td>{r.unit}</Td>
                  <Td className="text-center">{(r.taxRate * 100).toFixed(0)}%</Td>
                  <Td className="text-right font-mono">{r.unitPriceExcludingTax.toFixed(2)}</Td>
                  <Td>{r.priceRemark || '-'}</Td>
                  <Td className="text-right font-mono text-indigo-600">{unitIncl.toFixed(2)}</Td>
                  <Td className="text-right font-medium">{amtEx.toLocaleString()}</Td>
                  <Td className="text-right font-semibold text-purple-600">{amtIn.toLocaleString()}</Td>
                  <Td className="text-center text-slate-400">只读</Td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 font-semibold">
            <tr>
              <td colSpan={9} className="px-2 py-2 border border-slate-200 text-right text-slate-700">合计</td>
              <td className="px-2 py-2 border border-slate-200 text-slate-700">¥ {totalEx.toLocaleString()}</td>
              <td className="px-2 py-2 border border-slate-200 text-purple-700">¥ {totalIn.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        💡 此表为线下录入通用模板，**询比（公开/邀请）、竞价、谈判（公开/邀请）** 5 种采购方式共用。税率下拉可选 0%/3%/6%/9%/13%，含税单价自动计算。
      </div>
    </div>
  );
}

// =====================================================================
// 明细表 3：简化无税表（10 列，直接采购/电子商城）
// =====================================================================
function SimpleTable({ rows, title }: { rows: SimpleDetailRow[]; title: string }) {
  const totalEx = rows.reduce((s, r) => s + r.unitPriceExcludingTax * r.quantity, 0);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50/30 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">📋 {title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">共 {rows.length} 条 · 不含税金额合计 ¥ {totalEx.toLocaleString()}</p>
        </div>
        <div className="flex gap-1">
          <DisabledBtn text="+ 添加条目" primary />
        </div>
      </div>
      <div className="border border-slate-200 rounded overflow-auto">
        <table className="text-xs w-full" style={{ minWidth: 1100 }}>
          <thead className="bg-emerald-50/60 text-slate-700">
            <tr>
              <Th>#</Th><Th>项目名称</Th><Th>项目概况/物料名称</Th>
              <Th>数量</Th><Th>单位</Th><Th>不含税单价</Th>
              <Th>单价备注</Th><Th bg="#EEF2FF">不含税金额</Th><Th>供应商名称</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const amt = r.unitPriceExcludingTax * r.quantity;
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-emerald-50/10">
                  <Td className="text-slate-400">{idx + 1}</Td>
                  <Td>{r.itemName}</Td>
                  <Td>{r.description || '-'}</Td>
                  <Td className="text-right">{r.quantity}</Td>
                  <Td>{r.unit}</Td>
                  <Td className="text-right font-mono">{r.unitPriceExcludingTax.toFixed(2)}</Td>
                  <Td>{r.priceRemark || '-'}</Td>
                  <Td className="text-right font-semibold text-indigo-600">{amt.toLocaleString()}</Td>
                  <Td>{r.supplierName}</Td>
                  <Td className="text-center text-slate-400">只读</Td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-emerald-50/30 font-semibold">
            <tr>
              <td colSpan={7} className="px-2 py-2 border border-slate-200 text-right text-slate-700">不含税金额合计（元）</td>
              <td className="px-2 py-2 border border-slate-200 text-indigo-600">¥ {totalEx.toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 text-xs text-emerald-700">
        💡 <b>直接采购</b>（单笔 ≤5 万）和 <b>电子商城采购</b>（京东企业购等）共用此简化表。**没有税率、没有含税单价、没有含税金额**——因为商城价/直采价通常就是最终成交价，发票自动开。
      </div>
    </div>
  );
}

// =====================================================================
// 明细表调度
// =====================================================================
function DetailSection({ mock }: { mock: BiddingSceneMock }) {
  if (mock.key === 'framework_catalog' && mock.catalogDetails) {
    return <CatalogTable rows={mock.catalogDetails} />;
  }
  if (mock.key === 'framework_random') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
        <div className="text-4xl mb-2">📝</div>
        <h3 className="text-sm font-semibold text-rose-700 mb-1">此采购方式无明细清单表</h3>
        <p className="text-xs text-rose-600 leading-relaxed max-w-xl mx-auto">
          框架协议采购-随机抽取 走的是"表单填 6 个字段 → 随机抽取 → 确定供应商"流程，
          不生成逐行明细清单。实际使用中：抽取时间由抽标员现场记录，供应商名称/联系人/合同编号手动填，
          如关联采购需求会自动带入需求号。
        </p>
      </div>
    );
  }
  if (mock.simpleDetails && (mock.key === 'direct' || mock.key === 'e_mall')) {
    return <SimpleTable rows={mock.simpleDetails} title={mock.label + '（简化无税 10 列）'} />;
  }
  if (mock.offlineDetails) {
    return <OfflineTable rows={mock.offlineDetails} title={mock.label + '（线下完整 12 列，有税率+含税）'} />;
  }
  return null;
}

// =====================================================================
// 工具：单元格 helper + 禁用按钮
// =====================================================================
function Th({ children, w, bg }: { children: React.ReactNode; w?: string; bg?: string }) {
  return <th className={`px-2 py-2 text-left border border-slate-200 ${w || ''}`} style={bg ? { backgroundColor: bg } : undefined}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-2 py-1.5 border border-slate-200 ${className}`}>{children}</td>;
}
function DisabledBtn({ text, primary }: { text: string; primary?: boolean }) {
  return (
    <button disabled className={`px-3 py-1 text-xs rounded-md border cursor-not-allowed select-none ${
      primary ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-400'
    }`}>{text}</button>
  );
}

// =====================================================================
// 主组件
// =====================================================================
export default function BiddingScenePage() {
  const params = useParams();
  // URL 使用连字符（如 framework-random），mock key 使用下划线（framework_random），统一转换
  const slug = (params['*'] || '').trim().replace(/-/g, '_') as BiddingSceneKey;
  const mock = BIDDING_SCENE_MOCKS[slug];

  if (!mock) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">未找到对应场景</h2>
        <p className="text-slate-500 mb-4">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">{slug}</code></p>
        <p className="text-sm text-slate-400">请从左侧菜单选择具体的招采执行场景模板</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <SceneHeaderCard mock={mock} />
      <BusinessRulesSummary currentKey={mock.key} />
      <FormReadOnlySection mock={mock} />
      <DetailSection mock={mock} />
    </div>
  );
}
