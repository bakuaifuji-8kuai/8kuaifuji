// =====================================================================
// 招采需求场景模板页 —— 14 种"需求类型 × 框架清单类型"组合的演示
// URL 形如：/procurement/demand-scene/:group/:framework
//   group 示例：engineering-goods / engineering-construction / engineering-service
//               noneng-goods / noneng-service
//   framework 示例：within / outside / new
// 用法：只读展示，打开即看完整表单 + 明细表
// =====================================================================

import { useParams } from 'react-router-dom';
import { SCENE_MOCKS, SCENE_MENU, type SceneMock, type SceneMockDetail } from '@/constants/demandSceneMocks';

// ============ 工具 ============
const getSceneLabel = (m: SceneMock) => {
  const bc = m.form.businessCategory === 'engineering' ? '工程类' : '非工程类';
  const st = m.form.subType === 'construction' ? '施工' : m.form.subType === 'service' ? '服务' : '货物';
  const ft = m.procurementType === 'within_framework' ? '清单内采购'
    : m.procurementType === 'outside_framework' ? '清单外采购'
    : '新增供应商目录';
  return `${bc} / ${st} — ${ft}`;
};

// ============ 顶部场景卡片 ============
function SceneHeaderCard({ mock }: { mock: SceneMock }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 mb-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <span className="text-white text-xl font-bold">场</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-semibold text-slate-800">采购需求申请场景演示</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
              {getSceneLabel(mock)}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">{mock.description}</p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span>📋 本页为 <b className="text-slate-700">只读展示模板</b>，点击"新增需求申请"可对比真实操作流程</span>
            <span>•</span>
            <span>明细清单共 <b className="text-slate-700">{mock.details?.length || mock.projectRows?.length || 0}</b> 行</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ 表单只读展示 ============
function FormReadOnlySection({ mock }: { mock: SceneMock }) {
  const { form } = mock;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-xl flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
          采购需求申请单（只读演示）
        </h2>
        <span className="text-xs text-slate-400">表单区 · 全部字段预置演示数据</span>
      </div>
      <div className="p-5 grid grid-cols-3 gap-y-4 gap-x-8">
        <FormField label="需求编号" value={form.applicationNo} />
        <FormField label="项目名称" value={form.projectName} />
        <FormField label="申请事由" value={form.applyReason} fullWidth />
        <FormField label="申请人" value={form.applicant} />
        <FormField label="申请部门" value={form.applicantDept} />
        <FormField label="业务分类" value={`${form.businessCategory === 'engineering' ? '工程类' : '非工程类'} / ${form.subType === 'construction' ? '施工' : form.subType === 'service' ? '服务' : '货物'}`} />
        <FormField label="采购方式" value={
          mock.procurementType === 'within_framework' ? '框架合同清单内'
          : mock.procurementType === 'outside_framework' ? '框架合同清单外'
          : '新增供应商目录'
        } highlight />
      </div>
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

// ============ 明细表区标题 ============
function DetailListHeader({ title, count, totalAmount }: { title: string; count: number; totalAmount?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-6">
        <span className="text-slate-700 font-semibold">{title}</span>
        <span className="text-xs text-slate-400">明细数量：<span className="text-slate-600 font-medium">{count} 条</span></span>
        {totalAmount !== undefined && (
          <span className="text-xs text-slate-400">
            不含税预算总金额：<span className="text-red-500 font-semibold">¥ {totalAmount.toFixed(2)}</span>
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <DisabledBtn text="导入清单" />
        <DisabledBtn text="导出清单" />
        <DisabledBtn text="+ 添加" primary />
      </div>
    </div>
  );
}

function DisabledBtn({ text, primary }: { text: string; primary?: boolean }) {
  return (
    <button className={`px-3 py-1 text-xs rounded-md border cursor-not-allowed select-none ${
      primary
        ? 'bg-slate-100 border-slate-200 text-slate-400'
        : 'bg-white border-slate-200 text-slate-400'
    }`} disabled>
      {text}（演示）
    </button>
  );
}

// ============ 5 种明细表渲染 ============

// ① 工程类/货物 material + within_framework：宽表 22 列（双表头分组）
function MaterialWithinTable({ details }: { details: SceneMockDetail[] }) {
  const totalAmount = details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0);
  const totalTax = details.reduce((s, d) => s + (d.taxAmount || 0), 0);
  const totalIncl = details.reduce((s, d) => s + (d.amountIncludingTax || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <DetailListHeader title="【工程类/货物 · 清单内】采购申请需求明细清单表" count={details.length} totalAmount={totalAmount} />
      <div className="border border-[#dcdfe6] rounded overflow-auto" style={{ maxHeight: 'calc(100vh - 480px)' }}>
        <table className="text-xs" style={{ minWidth: 2800 }}>
          <thead className="sticky top-0 bg-[#f5f7fa]">
            <tr>
              <th colSpan={2} className="px-2 py-2 text-left border border-[#dcdfe6] text-slate-700 font-medium">项目信息</th>
              <th colSpan={6} className="px-2 py-2 border border-[#dcdfe6]"></th>
              <th className="px-2 py-2 border border-[#dcdfe6]"></th>
              <th colSpan={9} className="px-2 py-2 text-center border border-[#dcdfe6] text-slate-700 font-semibold">采购申请</th>
              <th className="px-2 py-2 border border-[#dcdfe6]"></th>
              <th className="px-2 py-2 border border-[#dcdfe6]"></th>
              <th className="px-2 py-2 border border-[#dcdfe6] w-20">操作</th>
            </tr>
            <tr>
              <Th w="w-24">项目编号</Th><Th w="w-32">项目名称</Th>
              <Th w="w-20">产品属性</Th><Th w="w-20">商品编码</Th><Th w="w-24">产品类型</Th><Th w="w-32">产品名称</Th>
              <Th w="w-28">规格型号</Th><Th w="w-14">单位</Th><Th w="w-24">合同清单内外</Th>
              <Th w="w-24">单价(不含税)</Th><Th w="w-24">单价(含税)</Th><Th w="w-16">税率</Th>
              <Th w="w-24">单价备注</Th><Th w="w-20">采购数量</Th>
              <Th w="w-24">不含税金额</Th><Th w="w-20">税额</Th><Th w="w-24">含税金额</Th>
              <Th w="w-20" bg="#fff9c4">库存数量</Th>
              <Th w="w-20">合同编号</Th><Th w="w-32">合同有效期</Th>
              <Th w="w-36">采购情况说明</Th><Th w="w-20">操作</Th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => {
              const locked = d.isContractItem || d.productCode?.startsWith('P000');
              const lockedCls = locked ? 'bg-[#f0f0f0] text-[#909399]' : '';
              return (
                <tr key={d.id} className={`border-t border-[#dcdfe6] ${d.isContractItem ? 'bg-[#fffbeb]' : ''}`}>
                  <Td>{d.projectNo || '-'}</Td>
                  <Td>{d.projectName || '-'}</Td>
                  <Td>{d.productAttribute || '-'}</Td>
                  <Td className={`font-mono ${lockedCls}`}>{d.productCode || '-'}</Td>
                  <Td className={lockedCls}>{d.productType || '-'}</Td>
                  <Td className={lockedCls}>{d.productName}</Td>
                  <Td className={lockedCls}>{d.specification || '-'}</Td>
                  <Td className={lockedCls}>{d.unit || '-'}</Td>
                  <Td className="text-center">
                    {d.isInContractList ? (
                      <span className="text-green-600 font-semibold">✓ 清单内</span>
                    ) : (
                      <span className="text-amber-600 font-medium">✗ 清单外</span>
                    )}
                  </Td>
                  <Td className={`font-mono ${lockedCls}`}>{(d.unitPriceExcludingTax ?? 0).toFixed(2)}</Td>
                  <Td className="font-mono text-slate-600">{(d.unitPriceIncludingTax ?? 0).toFixed(4)}</Td>
                  <Td className={lockedCls}>{d.taxRate !== undefined ? `${d.taxRate}%` : '-'}</Td>
                  <Td>{d.unitPriceRemark || '-'}</Td>
                  <Td className="text-right">{d.quantity ?? '-'}</Td>
                  <Td className="text-right font-medium text-slate-700">{(d.amountExcludingTax ?? 0).toFixed(2)}</Td>
                  <Td className="text-right text-slate-600">{(d.taxAmount ?? 0).toFixed(2)}</Td>
                  <Td className="text-right font-semibold text-red-600">{(d.amountIncludingTax ?? 0).toFixed(2)}</Td>
                  <Td className="text-right font-medium text-red-500" style={{ backgroundColor: '#fff9c4' }}>{d.stockQuantity ?? 0}</Td>
                  <Td className={lockedCls}>{d.contractNo || '-'}</Td>
                  <Td className={lockedCls}>{d.contractExpiryDate || '-'}</Td>
                  <Td>{d.procurementDescription || '-'}</Td>
                  <Td className="text-center text-slate-400 text-xs">只读</Td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#f5f7fa] font-semibold">
            <tr>
              <td colSpan={12} className="px-2 py-2 border border-[#dcdfe6] text-right text-slate-700">总计（元）</td>
              <td className="px-2 py-2 border border-[#dcdfe6] text-right text-slate-700">{totalAmount.toFixed(2)}</td>
              <td className="px-2 py-2 border border-[#dcdfe6] text-right text-slate-700">{totalTax.toFixed(2)}</td>
              <td className="px-2 py-2 border border-[#dcdfe6] text-right text-red-600">{totalIncl.toFixed(2)}</td>
              <td colSpan={5} className="px-2 py-2 border border-[#dcdfe6]"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700 flex items-center gap-2">
        <span>💡 说明：本场景 <b className="text-amber-800">清单内合同物资行（第 1、2 行带浅黄色底）</b> 的编码/名称/单价/税率/合同编号等均已锁定不可修改；第 3 行清单外物资可编辑。</span>
      </div>
    </div>
  );
}

// ② 工程类/货物 material + outside_framework：窄表
function MaterialOutsideTable({ details }: { details: SceneMockDetail[] }) {
  const totalAmount = details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <DetailListHeader title="【工程类/货物 · 清单外】采购申请需求明细清单" count={details.length} totalAmount={totalAmount} />
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th w="w-12">序号</Th><Th>项目编号</Th><Th>项目名称</Th><Th>商品编码</Th>
              <Th>产品名称</Th><Th>规格/参数</Th><Th w="w-14">单位</Th>
              <Th w="w-20 text-right">采购数量</Th><Th w="w-28 text-right">不含税预算单价</Th>
              <Th w="w-24">单价备注</Th><Th w="w-20 text-right">库存数量</Th>
              <Th w="w-28 text-right">不含税预算金额</Th><Th>采购情况说明</Th><Th w="w-20">操作</Th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td>{d.projectNo || '-'}</Td>
                <Td>{d.projectName || '-'}</Td>
                <Td className="font-mono">{d.productCode || '-'}</Td>
                <Td>{d.productName}</Td>
                <Td>{d.specification || '-'}</Td>
                <Td>{d.unit || '-'}</Td>
                <Td className="text-right">{d.quantity ?? '-'}</Td>
                <Td className="text-right font-mono">{(d.unitPriceExcludingTax ?? 0).toFixed(2)}</Td>
                <Td>{d.unitPriceRemark || '-'}</Td>
                <Td className="text-right font-medium text-amber-600">{d.stockQuantity ?? 0}</Td>
                <Td className="text-right font-medium text-red-600">{(d.amountExcludingTax ?? 0).toFixed(2)}</Td>
                <Td>{d.procurementDescription || '-'}</Td>
                <Td className="text-center text-slate-400 text-xs">只读</Td>
              </tr>
            ))}
          </tbody>
          {details.length > 0 && (
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={11} className="px-2 py-2 text-right text-slate-700 font-medium">不含税预算总金额：</td>
                <td className="px-2 py-2 text-right text-red-600 font-semibold">¥ {totalAmount.toFixed(2)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-200 text-xs text-indigo-700 flex items-center gap-2">
        <span>💡 说明：本场景为清单外采购，<b className="text-indigo-800">无合同关联</b>，单价全手填，无税率/税额/含税金额列，无合同编号/合同有效期列。</span>
      </div>
    </div>
  );
}

// ③ 工程类/货物 material + new_supplier：极简预算版（双表头）
function MaterialNewSupplierTable({ details }: { details: SceneMockDetail[] }) {
  const totalAmount = details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <DetailListHeader title="【工程类/货物 · 新增供应商目录】采购申请需求明细清单（极简预算版）" count={details.length} totalAmount={totalAmount} />
      <div className="border border-[#dcdfe6] rounded overflow-auto">
        <table className="text-xs" style={{ minWidth: 1800 }}>
          <thead className="sticky top-0 bg-[#f5f7fa]">
            <tr>
              <th colSpan={2} className="px-2 py-2 text-left border border-[#dcdfe6]">项目信息</th>
              <th colSpan={8} className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
              <th colSpan={2} className="px-2 py-2 text-center border border-[#dcdfe6] font-semibold text-slate-700">采购申请</th>
              <th colSpan={2} className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
              <th className="px-2 py-2 border border-[#dcdfe6] w-20">操作</th>
            </tr>
            <tr>
              <Th w="w-24">项目编号</Th><Th w="w-32">项目名称</Th>
              <Th w="w-20">产品属性</Th><Th w="w-20">商品编码</Th><Th w="w-24">产品类型</Th>
              <Th w="w-32">产品名称</Th><Th w="w-28">规格型号</Th><Th w="w-14">单位</Th>
              <Th w="w-32">不含税预算单价</Th><Th w="w-24">单价备注</Th><Th w="w-20">采购数量</Th>
              <Th w="w-28">不含税预算金额</Th><Th w="w-20" bg="#fff9c4">库存数量</Th>
              <Th w="w-36">采购情况说明</Th><Th w="w-20">操作</Th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => (
              <tr key={d.id} className="border-t border-[#ebeef5]">
                <Td>{d.projectNo || '-'}</Td><Td>{d.projectName || '-'}</Td>
                <Td>{d.productAttribute || '-'}</Td>
                <Td className="font-mono">{d.productCode || '-'}</Td>
                <Td>{d.productType || '-'}</Td>
                <Td>{d.productName}</Td>
                <Td>{d.specification || '-'}</Td>
                <Td>{d.unit || '-'}</Td>
                <Td className="text-right font-mono">{(d.unitPriceExcludingTax ?? 0).toFixed(2)}</Td>
                <Td>{d.unitPriceRemark || '-'}</Td>
                <Td className="text-right">{d.quantity ?? '-'}</Td>
                <Td className="text-right font-medium text-red-600">{(d.amountExcludingTax ?? 0).toFixed(2)}</Td>
                <Td className="text-right font-medium text-red-500" style={{ backgroundColor: '#fff9c4' }}>{d.stockQuantity ?? 0}</Td>
                <Td>{d.procurementDescription || '-'}</Td>
                <Td className="text-center text-slate-400 text-xs">只读</Td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#f5f7fa] font-semibold">
            <tr>
              <td colSpan={12} className="px-2 py-2 border border-[#dcdfe6] text-right text-slate-700">不含税预算总金额</td>
              <td className="px-2 py-2 border border-[#dcdfe6] text-right text-red-600">¥ {totalAmount.toFixed(2)}</td>
              <td colSpan={2} className="px-2 py-2 border border-[#dcdfe6]"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700 flex items-center gap-2">
        <span>💡 说明：新增供应商目录场景砍了 <b className="text-amber-800">含税/合同列</b>，单价全手填，库存数量黄色高亮；不可导入清单。</span>
      </div>
    </div>
  );
}

// ④ 非工程类物资明细表（within / outside / new_supplier 三合一，差异仅在"合同列"和"库存数量列"）
function NonEngGoodsTable({ details, within, newSupplier }: { details: SceneMockDetail[]; within: boolean; newSupplier: boolean }) {
  const totalAmount = details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0);
  const title = within ? '【非工程类/货物 · 清单内】' : newSupplier ? '【非工程类/货物 · 新增供应商目录】' : '【非工程类/货物 · 清单外】';

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <DetailListHeader title={`${title}非工程类货物需求明细清单`} count={details.length} totalAmount={totalAmount} />
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th w="w-12">序号</Th><Th>编码</Th><Th>名称</Th><Th>分类</Th><Th>规格/参数</Th><Th w="w-14">单位</Th>
              {within && <Th w="w-24 text-center">合同清单内外</Th>}
              <Th w="w-28 text-right">不含税预算单价</Th><Th w="w-24">单价备注</Th>
              <Th w="w-20 text-right">库存数量</Th><Th w="w-28 text-right">不含税预算金额</Th>
              {within && <Th>合同编号</Th>}
              {within && <Th>合同有效期</Th>}
              <Th>备注</Th><Th w="w-16">操作</Th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-mono">{d.productCode || '-'}</Td>
                <Td>{d.productName}</Td>
                <Td>{d.productType || '-'}</Td>
                <Td>{d.specification || '-'}</Td>
                <Td>{d.unit || '-'}</Td>
                {within && (
                  <Td className="text-center">
                    {d.isInContractList
                      ? <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">✓ 清单内</span>
                      : <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">✗ 清单外</span>}
                  </Td>
                )}
                <Td className="text-right font-mono">{(d.unitPriceExcludingTax ?? 0).toFixed(2)}</Td>
                <Td>{d.unitPriceRemark || '-'}</Td>
                <Td className="text-right font-medium text-amber-600">{d.stockQuantity ?? 0}</Td>
                <Td className="text-right font-medium text-red-600">{(d.amountExcludingTax ?? 0).toFixed(2)}</Td>
                {within && <Td>{d.contractNo || '-'}</Td>}
                {within && <Td>{d.contractExpiryDate || '-'}</Td>}
                <Td>{d.remark || '-'}</Td>
                <Td className="text-center text-slate-400 text-xs">只读</Td>
              </tr>
            ))}
          </tbody>
          {details.length > 0 && (
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={within ? 9 : 8} className="px-2 py-2 text-right text-slate-700 font-medium">不含税预算总金额：</td>
                <td className="px-2 py-2 text-right text-red-600 font-semibold">¥ {totalAmount.toFixed(2)}</td>
                <td colSpan={within ? 5 : 4}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ⑤ 非工程类服务明细表（within / outside / new_supplier 三合一，差异：无库存列）
function NonEngServiceTable({ details, within, newSupplier }: { details: SceneMockDetail[]; within: boolean; newSupplier: boolean }) {
  const totalAmount = details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0);
  const title = within ? '【非工程类/服务 · 清单内】' : newSupplier ? '【非工程类/服务 · 新增供应商目录】' : '【非工程类/服务 · 清单外】';
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <DetailListHeader title={`${title}非工程类服务需求明细清单`} count={details.length} totalAmount={totalAmount} />
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th w="w-12">序号</Th><Th>编码</Th><Th>名称</Th><Th>分类</Th><Th>规格/参数</Th><Th w="w-14">单位</Th>
              {within && <Th w="w-24 text-center">合同清单内外</Th>}
              <Th w="w-28 text-right">不含税预算单价</Th><Th w="w-24">单价备注</Th>
              <Th w="w-28 text-right">不含税预算金额</Th>
              {within && <Th>合同编号</Th>}
              {within && <Th>合同有效期</Th>}
              <Th>备注</Th><Th w="w-16">操作</Th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <Td className="text-slate-400">{idx + 1}</Td>
                <Td className="font-mono">{d.productCode || '-'}</Td>
                <Td>{d.productName}</Td>
                <Td>{d.productType || '-'}</Td>
                <Td>{d.specification || '-'}</Td>
                <Td>{d.unit || '-'}</Td>
                {within && (
                  <Td className="text-center">
                    {d.isInContractList
                      ? <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">✓ 清单内</span>
                      : <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">✗ 清单外</span>}
                  </Td>
                )}
                <Td className="text-right font-mono">{(d.unitPriceExcludingTax ?? 0).toFixed(2)}</Td>
                <Td>{d.unitPriceRemark || '-'}</Td>
                <Td className="text-right font-medium text-red-600">{(d.amountExcludingTax ?? 0).toFixed(2)}</Td>
                {within && <Td>{d.contractNo || '-'}</Td>}
                {within && <Td>{d.contractExpiryDate || '-'}</Td>}
                <Td>{d.remark || '-'}</Td>
                <Td className="text-center text-slate-400 text-xs">只读</Td>
              </tr>
            ))}
          </tbody>
          {details.length > 0 && (
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={within ? 8 : 7} className="px-2 py-2 text-right text-slate-700 font-medium">不含税预算总金额：</td>
                <td className="px-2 py-2 text-right text-red-600 font-semibold">¥ {totalAmount.toFixed(2)}</td>
                <td colSpan={within ? 5 : 4}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <span>💡 服务类无库存数量列（服务不占库存），其余差异同货物类。</span>
      </div>
    </div>
  );
}

// ⑥ 项目多行表（施工 implementation_project / 服务 service_project）
function ProjectRowsTable({ rows, demandType }: { rows: SceneMockDetail[]; demandType: string }) {
  const total = rows.reduce((s, r) => s + (r.budgetAmount || 0), 0);
  const title = demandType === 'implementation_project' ? '工程类（施工）采购需求清单' : '工程类（服务项目）采购需求清单';
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="px-3 py-2 flex items-center justify-between bg-[#fafafa] border-b border-[#dcdfe6]">
        <div className="flex items-center gap-3">
          <span className="text-[#606266] font-semibold text-sm">{title}</span>
          <span className="text-xs text-[#606266]">共 {rows.length} 条</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266]">合计：<span className="text-[#f56c6c] font-semibold">¥{total.toFixed(2)}</span></span>
          <DisabledBtn text="+ 添加行" primary />
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f5f7fa]">
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-10">#</th>
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-32">需求部门</th>
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-40">项目名称</th>
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-64">主要内容</th>
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-32">不含税预算总金额（元）</th>
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-36">备注</th>
            <th className="px-2 py-2 text-center border border-[#ebeef5] w-16">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} className="border-t border-[#ebeef5]">
              <Td className="text-center">{idx + 1}</Td>
              <Td>{r.dept || '-'}</Td>
              <Td>{r.projectName || '-'}</Td>
              <Td>{r.mainContent || '-'}</Td>
              <Td className="text-right font-medium text-red-600">{r.budgetAmount?.toLocaleString() || '-'}</Td>
              <Td>{r.remark || '-'}</Td>
              <Td className="text-center text-slate-400 text-xs">只读</Td>
            </tr>
          ))}
        </tbody>
        {rows.length > 0 && (
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={4} className="px-2 py-2 text-right text-slate-700 font-medium border border-[#dcdfe6]">不含税预算合计（元）：</td>
              <td className="px-2 py-2 text-right text-red-600 font-semibold border border-[#dcdfe6]">¥ {total.toFixed(2)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        )}
      </table>
      <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-200 text-xs text-indigo-700">
        💡 说明：工程类施工/服务项目采购走<b className="text-indigo-800">"项目多行表"模式</b>，每行一个子项目；<b className="text-indigo-800">施工类仅允许"新增供应商目录"</b>采购（不可选清单内/外），服务项目类三种采购方式都可选。
      </div>
    </div>
  );
}

// ============ 表格单元格 helper ============
function Th({ children, w, bg }: { children: React.ReactNode; w?: string; bg?: string }) {
  return (
    <th className={`px-2 py-2 text-left border border-[#dcdfe6] ${w || ''}`} style={bg ? { backgroundColor: bg } : undefined}>
      {children}
    </th>
  );
}

function Td({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <td className={`px-2 py-1 border border-[#ebeef5] ${className}`} style={style}>{children}</td>
  );
}

// ============ 主组件 ============
export default function ProcurementDemandScenePage() {
  const params = useParams();
  // params['*'] 形如 "engineering-goods/within"
  const slug = params['*'] || ''; // 兼容 React Router v6 的 path="*"
  // 从 URL 解析 framework：路径最后一段是 within/outside/new
  const framework = slug.endsWith('/within') ? 'within_framework'
    : slug.endsWith('/outside') ? 'outside_framework'
    : slug.endsWith('/new') ? 'new_supplier'
    : undefined;
  // group 去掉最后的 framework 段
  const group = framework ? slug.slice(0, slug.lastIndexOf('/')) : slug;
  const key = framework ? `${group}/${slug.split('/').pop()}` : slug;

  // 也直接试 key 作为 index
  const mock = SCENE_MOCKS[key] || SCENE_MOCKS[slug];

  if (!mock) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">未找到对应场景</h2>
        <p className="text-slate-500 mb-4">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">{slug}</code></p>
        <p className="text-sm text-slate-400">请从左侧菜单选择具体的需求场景模板</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <SceneHeaderCard mock={mock} />
      <FormReadOnlySection mock={mock} />
      <DetailSection mock={mock} />
    </div>
  );
}

// ============ 明细表调度 ============
function DetailSection({ mock }: { mock: SceneMock }) {
  const dt = mock.demandType;
  const ft = mock.procurementType;
  const isWithin = ft === 'within_framework';
  const isNew = ft === 'new_supplier';

  // 项目多行表
  if ((dt === 'implementation_project' || dt === 'service_project') && mock.projectRows) {
    return <ProjectRowsTable rows={mock.projectRows} demandType={dt} />;
  }

  // 工程类/货物
  if (dt === 'material') {
    if (isWithin) return <MaterialWithinTable details={mock.details || []} />;
    if (isNew) return <MaterialNewSupplierTable details={mock.details || []} />;
    return <MaterialOutsideTable details={mock.details || []} />;
  }

  // 非工程类/货物
  if (dt === 'material_non_engineering') {
    return <NonEngGoodsTable details={mock.details || []} within={isWithin} newSupplier={isNew} />;
  }

  // 非工程类/服务
  if (dt === 'service_non_engineering') {
    return <NonEngServiceTable details={mock.details || []} within={isWithin} newSupplier={isNew} />;
  }

  return null;
}
