const fs = require('fs');

const filePath = 'd:\\会展仓库项目\\src\\pages\\Procurement\\BiddingScenePage.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// 边界：第 333 行之后（// 主表单：按采购方式条件渲染 注释块）
// 找 "function FormInteractiveSection" 的位置
const funcStart = content.indexOf('function FormInteractiveSection({ methodKey }: { methodKey: string }) {');
// 找下一个顶层 function/export default 开头
const nextExport = content.indexOf('\nexport default function BiddingScenePage() {', funcStart);

if (funcStart === -1 || nextExport === -1) {
  console.error('找不到边界！funcStart=', funcStart, 'nextExport=', nextExport);
  process.exit(1);
}

// 复刻版 FormInteractiveSection（从 CompetitiveBiddingPage 弹窗逐行复刻）
const newFormSection = `function FormInteractiveSection({ methodKey }: { methodKey: string }) {
  const isCatalogCompare = isCatalog(methodKey);
  const isFrameworkRandom = isRandom(methodKey);
  const isDirectOrMall = isSimple(methodKey);
  const isOfflineExecution = isOffline(methodKey);

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
    totalPriceLimit: undefined,
    drawTime: '', randomSupplierName: '', randomSupplierContact: '', randomContractNo: '', remark: '',
  });
  const upd = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const [selectedSuppliers] = useState<string[]>([]);
  const [selectedDemandId] = useState<number | null>(null);
  const [bidderList, setBidderList] = useState<any[]>([{ name: '', contactPerson: '', phone: '', remark: '' }]);
  const itemsTotalLimit = 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* ====== 基础信息 ====== */}
      <div className="grid grid-cols-3 gap-3 px-5 py-3 border-b border-slate-200">
        <div>
          <div className="mb-1 text-xs text-[#606266]">工单编号</div>
          <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-sm" value={form.biddingNo} disabled placeholder="保存后自动生成" />
        </div>
        <div>
          <div className="mb-1 text-xs text-[#606266]">采购方式 <span className="text-[#f56c6c]">*</span></div>
          <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white" value={form.procurementMethod || methodKey} onChange={(e) => upd('procurementMethod', e.target.value)}>
            {PROCUREMENT_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <div className="mb-1 text-xs text-[#606266]">项目名称 <span className="text-[#f56c6c]">*</span> <span className="text-slate-400 ml-1 text-[11px]">(从需求自动带出)</span></div>
          <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.projectName} onChange={(e) => upd('projectName', e.target.value)} placeholder="请输入项目名称" />
        </div>
      </div>

      {/* ====== 模式描述提示条 ====== */}
      <div className={`mx-5 my-2 text-xs px-3 py-2 rounded border ${
        isCatalogCompare ? 'bg-blue-50 border-blue-200 text-blue-700'
          : isFrameworkRandom ? 'bg-purple-50 border-purple-200 text-purple-700'
          : isDirectOrMall ? 'bg-slate-50 border-slate-200 text-slate-600'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        {isCatalogCompare ? '📋 模式：目录内比价（线上报价）— 供应商在小程序报价，你只需设置单品上限和整单上限。'
          : isFrameworkRandom ? '🎲 模式：随机抽取（线下录入）— 系统仅记录抽取结果，抽取动作不在本系统进行。可选择是否关联采购需求。'
          : isDirectOrMall ? '📝 模式：线下录入（简化无税率）— 自己填写清单、不含税单价，走审批流程。无税率/含税列。'
          : '📝 模式：线下录入 — 自己填写清单、单价、税率，走审批流程。'}
      </div>

      {/* ====== 关联采购需求 ====== */}
      {(!isFrameworkRandom || true) && (
      <div className="px-5 pb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-[#606266]">关联采购需求 {!isFrameworkRandom && <span className="text-[#f56c6c]">*</span>} <span className="text-slate-400 ml-1">(选择后将带入需求中的物资)</span></span>
          <button type="button" className="text-xs text-indigo-500 hover:underline">{selectedDemandId ? '更换' : '选择'}</button>
        </div>
        <div className="border border-dashed border-[#dcdfe6] rounded px-3 py-2 text-xs text-slate-400 text-center">
          请点击上方「选择」按钮，从已审核通过的采购需求中选择
        </div>
      </div>
      )}

      {/* ====== framework_random 专属 ====== */}
      {isFrameworkRandom && (
      <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-semibold text-purple-700">🎲 随机抽取结果录入</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266]">是否关联采购需求</span>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="relative w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
          </label>
          <span className="text-xs text-slate-500">关闭后下方"关联采购需求"将隐藏</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><div className="mb-1 text-xs text-[#606266]">抽取时间 <span className="text-[#f56c6c]">*</span></div><input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.drawTime} onChange={(e) => upd('drawTime', e.target.value)} /></div>
          <div><div className="mb-1 text-xs text-[#606266]">供应商 <span className="text-[#f56c6c]">*</span></div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.randomSupplierName} onChange={(e) => upd('randomSupplierName', e.target.value)} placeholder="输入关键字模糊匹配供应商" /></div>
          <div><div className="mb-1 text-xs text-[#606266]">供应商单位联系人 <span className="text-[#f56c6c]">*</span></div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.randomSupplierContact} onChange={(e) => upd('randomSupplierContact', e.target.value)} placeholder="联系人姓名" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="mb-1 text-xs text-[#606266]">关联合同编号 <span className="text-[#f56c6c]">*</span></div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.randomContractNo} onChange={(e) => upd('randomContractNo', e.target.value)} placeholder="输入关键字，从供应商框架合同中匹配" /></div>
          <div><div className="mb-1 text-xs text-[#606266]">备注</div><textarea rows={1} className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm resize-none" value={form.remark} onChange={(e) => upd('remark', e.target.value)} placeholder="(选填)" /></div>
        </div>
      </div>
      )}

      {/* ====== 目录内比价 / 线下录入 模式切换 ====== */}
      {isCatalogCompare ? (
        <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
          <div className="text-sm font-semibold text-slate-700">📋 物资明细（目录内比价 · 线上报价）</div>
          <div className="border border-dashed border-[#dcdfe6] rounded p-6 text-center text-sm text-[#909399]">
            请先在上方选择一条已通过的采购需求，需求中的物资将自动带入。
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md"><div className="text-[11px] text-slate-400">条目上限合计</div><div className="text-sm font-semibold text-slate-800">¥{itemsTotalLimit.toLocaleString()}</div></div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md"><div className="text-[11px] text-slate-400">不含税金额合计</div><div className="text-sm font-semibold text-indigo-600">¥0</div></div>
          </div>
          <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">📋 查看 / 编辑清单（0）</button>
          <div className="pt-2 border-t border-dashed border-slate-200">
            <div className="mb-1 text-xs text-[#606266]">整单上限总价(含税) <span className="text-[#f56c6c]">*</span> <span className="text-[#909399] ml-2 text-[11px]">(参考：所有条目的上限×数量之和)</span></div>
            <input type="number" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.totalPriceLimit ?? ''} onChange={(e) => upd('totalPriceLimit', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="请输入整单含税上限" />
          </div>
        </div>
      ) : (
        <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
          <div className="text-sm font-semibold text-slate-700">📦 清单明细</div>
          <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-8 text-center">
            <div className="text-slate-400 text-sm mb-3">请先在上方选择采购需求自动带入，或点击下方按钮导入 / 录入清单</div>
            <div className="flex items-center justify-center gap-2">
              <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600">📥 导入清单</button>
              <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">+ 录入清单条目</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== 受邀供应商（仅 framework_catalog） ====== */}
      {isCatalogCompare && (
      <div className="px-5 pb-3 border-t border-slate-200 pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-[#606266]">受邀供应商</span>
          <button type="button" className="text-xs text-indigo-500 hover:underline">选择（已选 {selectedSuppliers.length} 家）</button>
        </div>
        <div className="border border-dashed border-[#dcdfe6] rounded px-3 py-2 text-xs text-slate-400 text-center min-h-[40px]">
          请点击上方「选择」按钮，从启用的供应商中选择受邀对象
        </div>
      </div>
      )}

      {/* ====== 公告附件蓝框（catalog / competitive） ====== */}
      {(isCatalogCompare || isCompetitive(methodKey)) && (
      <div className="px-5 pb-3 border-t border-slate-200 pt-3">
        <div className="border border-[#409eff] rounded p-3 bg-[#ecf5ff]">
          <div className="text-sm font-semibold text-[#303133] mb-1">{isCompetitive(methodKey) ? '竞价公告附件' : '比价公告附件'}</div>
          <div className="text-xs text-[#909399] mb-2">上传相关文件（PDF/Word/图片等）</div>
          <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#b3d8ff] rounded bg-white">暂无附件，点击上传</div>
        </div>
      </div>
      )}

      {/* ====== 竞价文件附件橙框（catalog） ====== */}
      {isCatalogCompare && (
      <div className="px-5 pb-3">
        <div className="border border-[#e6a23c] rounded p-3 bg-[#fdf6ec]">
          <div className="text-sm font-semibold text-[#303133] mb-1">竞价文件附件</div>
          <div className="text-xs text-[#909399] mb-2">上传竞价文件相关资料（PDF/Word/Excel等）</div>
          <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#e6c98a] rounded bg-white">暂无附件，点击上传</div>
        </div>
      </div>
      )}

      {/* ====== 线下流程专属：基础执行信息 ====== */}
      {(isOfflineExecution || isDirectOrMall) && (
      <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-semibold text-indigo-700">📋 基础执行信息</div>
        <div className="grid grid-cols-3 gap-3">
          <div><div className="mb-1 text-xs text-[#606266]">采购方式审批方式 <span className="text-[#f56c6c]">*</span></div>
            <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white" value={form.procurementApprovalMethod} onChange={(e) => upd('procurementApprovalMethod', e.target.value)}>
              <option value="">请选择</option><option value="meeting">会议审批</option><option value="sign_report">签报审批</option>
            </select></div>
          <div><div className="mb-1 text-xs text-[#606266]">采购方式审批日期 <span className="text-[#f56c6c]">*</span></div><input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.procurementApprovalDate} onChange={(e) => upd('procurementApprovalDate', e.target.value)} /></div>
          <div><div className="mb-1 text-xs text-[#606266]">招采实施单位 <span className="text-[#f56c6c]">*</span></div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.implementationUnit} onChange={(e) => upd('implementationUnit', e.target.value)} placeholder="如：国金招标采购中心" /></div>
          {(isInquiry(methodKey) || isCompetitive(methodKey) || isDirectOrMall) && (
          <div><div className="mb-1 text-xs text-[#606266]">项目实施单位{isDirectOrMall && <span className="text-[#f56c6c]">*</span>}</div>
            <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white" value={form.projectImplementationUnit} onChange={(e) => upd('projectImplementationUnit', e.target.value)}>
              <option value="">请选择部门</option>{PROJECT_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select></div>
          )}
          <div><div className="mb-1 text-xs text-[#606266]">招采经办人 <span className="text-[#f56c6c]">*</span></div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.procurementHandler} onChange={(e) => upd('procurementHandler', e.target.value)} placeholder="经办人姓名" /></div>
          {isDirectOrMall && (
          <>
          <div><div className="mb-1 text-xs text-[#606266]">供应商 <span className="text-[#f56c6c]">*</span></div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.supplier} onChange={(e) => upd('supplier', e.target.value)} placeholder="请输入供应商名称" /></div>
          <div><div className="mb-1 text-xs text-[#606266]">含税总金额</div><input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.taxTotalAmount ?? ''} onChange={(e) => upd('taxTotalAmount', e.target.value === '' ? undefined : Number(e.target.value))} /></div>
          <div><div className="mb-1 text-xs text-[#606266]">不含税总金额</div><input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.taxExclusiveTotalAmount ?? ''} onChange={(e) => upd('taxExclusiveTotalAmount', e.target.value === '' ? undefined : Number(e.target.value))} /></div>
          </>
          )}
          {hasNegotiator(methodKey) && (
          <div><div className="mb-1 text-xs text-[#606266]">招标人</div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.tenderer} onChange={(e) => upd('tenderer', e.target.value)} placeholder="如：长沙国际会展中心" /></div>
          )}
        </div>
        <div className="text-xs text-[#606266] pt-1">
          {isDirectOrMall ? '相关文件资料' : '采购方式审批文件资料'} {isDirectOrMall && <span className="text-[#f56c6c]">*</span>}
          <div className="mt-1 text-[11px] text-slate-400 border border-dashed border-[#dcdfe6] rounded px-2 py-1.5 text-center">点击上传附件</div>
        </div>
      </div>
      )}

      {/* ====== 线下流程：招标公告与时间 ====== */}
      {isOfflineExecution && (
      <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-semibold text-indigo-700">📢 招标公告与时间</div>
        <div className="grid grid-cols-3 gap-3">
          {hasNegotiator(methodKey) && (
          <div><div className="mb-1 text-xs text-[#606266]">是否有招标代理机构</div>
            <div className="flex gap-3 pt-1">
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="hasAgent" checked={!!form.hasAgent} onChange={() => upd('hasAgent', true)} /> 是</label>
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="hasAgent" checked={!form.hasAgent} onChange={() => { upd('hasAgent', false); upd('agentName', ''); }} /> 否</label>
            </div></div>
          )}
          {hasNegotiator(methodKey) && form.hasAgent && (
          <div><div className="mb-1 text-xs text-[#606266]">招标代理机构名称</div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.agentName} onChange={(e) => upd('agentName', e.target.value)} /></div>
          )}
          {hasAnnounceTime(methodKey) && (
          <div><div className="mb-1 text-xs text-[#606266]">招采公告发布时间</div><input type="datetime-local" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={(form.announcementPublishTime || '').replace(' ', 'T').slice(0, 16)} onChange={(e) => upd('announcementPublishTime', e.target.value.replace('T', ' '))} /></div>
          )}
          {hasBidOpening(methodKey) && (
          <div><div className="mb-1 text-xs text-[#606266]">开标时间</div><input type="datetime-local" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={(form.bidOpeningTime || '').replace(' ', 'T').slice(0, 16)} onChange={(e) => upd('bidOpeningTime', e.target.value.replace('T', ' '))} /></div>
          )}
          {hasJudgeMethod(methodKey) && (
          <div><div className="mb-1 text-xs text-[#606266]">评标办法</div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.judgeMethod} onChange={(e) => upd('judgeMethod', e.target.value)} placeholder="如：综合评估法 / 最低价法" /></div>
          )}
        </div>
        {hasOwnerJudge(methodKey) && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-200">
          <div><div className="mb-1 text-xs text-[#606266]">是否委派业主评委</div>
            <div className="flex gap-3 pt-1">
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="hasOwnerJudge" checked={!!form.hasOwnerJudge} onChange={() => upd('hasOwnerJudge', true)} /> 是</label>
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="hasOwnerJudge" checked={!form.hasOwnerJudge} onChange={() => upd('hasOwnerJudge', false)} /> 否</label>
            </div></div>
          {form.hasOwnerJudge && (
          <div><div className="mb-1 text-xs text-[#606266]">业主代表</div>
            <div className="space-y-1.5">
              {form.ownerRepresentatives.map((name: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={name} placeholder={\`业主代表 \${idx + 1}\`}
                    onChange={(e) => { const arr = [...form.ownerRepresentatives]; arr[idx] = e.target.value; upd('ownerRepresentatives', arr); }} />
                  {idx > 0 && <button type="button" className="px-1 text-xs text-red-500 shrink-0" onClick={() => { const arr = form.ownerRepresentatives.filter((_: any, i: number) => i !== idx); upd('ownerRepresentatives', arr.length ? arr : ['']); }}>删除</button>}
                </div>
              ))}
              <button type="button" className="text-xs text-indigo-600 pt-0.5" onClick={() => upd('ownerRepresentatives', [...form.ownerRepresentatives, ''])}>+ 添加业主代表</button>
            </div>
          </div>
          )}
        </div>
        )}
      </div>
      )}

      {/* ====== 报名单位 ====== */}
      {(isInquiry(methodKey) || isCompetitive(methodKey) || isNegotiation(methodKey)) && (
      <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-semibold text-indigo-700">👥 报名单位（可自行增减行项）</div>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600"><tr>
              <th className="px-2 py-2 text-left w-10">#</th><th className="px-2 py-2 text-left">单位名称</th><th className="px-2 py-2 text-left w-28">联系人</th><th className="px-2 py-2 text-left w-28">联系电话</th><th className="px-2 py-2 text-left">备注</th><th className="px-2 py-2 text-center w-16">操作</th>
            </tr></thead>
            <tbody>
              {(bidderList.length > 0 ? bidderList : [{ name: '', contactPerson: '', phone: '', remark: '' }]).map((b, idx) => (
              <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-2 py-1.5 text-slate-500">{idx + 1}</td>
                {['name','contactPerson','phone','remark'].map((k) => (
                  <td key={k} className="px-2 py-1.5"><input className="w-full h-7 px-1.5 border border-slate-200 rounded text-xs" value={b[k] || ''} onChange={(e) => { const arr = [...bidderList]; arr[idx] = { ...arr[idx], [k]: e.target.value }; setBidderList(arr); }} /></td>
                ))}
                <td className="px-2 py-1.5 text-center"><button type="button" className="text-rose-500 text-xs" onClick={() => setBidderList(bidderList.filter((_, i) => i !== idx))}>删除</button></td>
              </tr>))}
            </tbody>
          </table>
          <button type="button" className="w-full py-1.5 text-indigo-600 text-xs bg-slate-50 border-t border-slate-200" onClick={() => setBidderList([...bidderList, { name: '', contactPerson: '', phone: '', remark: '' }])}>+ 添加一行报名单位</button>
        </div>
      </div>
      )}

      {/* ====== 中标结果 ====== */}
      {isOfflineExecution && (
      <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-semibold text-indigo-700">🏆 中标结果</div>
        <div className="grid grid-cols-3 gap-3">
          <div><div className="mb-1 text-xs text-[#606266]">中标供应商姓名</div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.winningSupplierName} onChange={(e) => upd('winningSupplierName', e.target.value)} placeholder="中标单位全称" /></div>
          <div><div className="mb-1 text-xs text-[#606266]">中标单位法人</div><input className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.winningSupplierLegalPerson} onChange={(e) => upd('winningSupplierLegalPerson', e.target.value)} placeholder="法人姓名" /></div>
          {hasWinnerScore(methodKey) && <div><div className="mb-1 text-xs text-[#606266]">中标单位得分</div><input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.winningSupplierScore ?? ''} onChange={(e) => upd('winningSupplierScore', e.target.value ? Number(e.target.value) : undefined)} /></div>}
          <div><div className="mb-1 text-xs text-[#606266]">中标/合同金额（元）</div><input type="number" step="0.01" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.contractAmount ?? ''} onChange={(e) => upd('contractAmount', e.target.value === '' ? undefined : Number(e.target.value))} /></div>
          <div><div className="mb-1 text-xs text-[#606266]">中标时间</div><input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm" value={form.awardTime} onChange={(e) => upd('awardTime', e.target.value)} /></div>
          <div><div className="mb-1 text-xs text-[#606266]">是否存在答疑/质疑/投诉</div>
            <div className="flex gap-3 pt-1">
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="hasDispute" value="是" checked={form.hasDispute === '是'} onChange={() => upd('hasDispute', '是')} /> 是</label>
              <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="hasDispute" value="否" checked={form.hasDispute === '否'} onChange={() => { upd('hasDispute', '否'); upd('disputeReason', ''); }} /> 否</label>
            </div>
            {form.hasDispute === '是' && <textarea value={form.disputeReason} onChange={(e) => upd('disputeReason', e.target.value)} rows={2} className="mt-1.5 w-full text-xs px-2 py-1.5 border border-[#dcdfe6] rounded resize-none" placeholder="请简要说明" />}
          </div>
        </div>
        {hasLosers(methodKey) && (
        <div className="pt-2 border-t border-dashed border-slate-200">
          <div className="text-xs text-slate-500 mb-2">未中标单位</div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => {
              const p = i === 1 ? 'losingSupplier1' : 'losingSupplier2';
              return (
              <div key={i} className="border border-slate-200 rounded p-2.5 space-y-2">
                <div className="text-xs font-medium text-slate-600">未中标单位 {i}</div>
                <div className="grid grid-cols-3 gap-2">
                  <input className="h-7 px-1.5 border border-slate-200 rounded text-xs" placeholder="单位名称" onChange={(e) => upd(\`\${p}Name\`, e.target.value)} />
                  <input className="h-7 px-1.5 border border-slate-200 rounded text-xs" placeholder="法人" onChange={(e) => upd(\`\${p}LegalPerson\`, e.target.value)} />
                  <input type="number" step="0.01" className="h-7 px-1.5 border border-slate-200 rounded text-xs" placeholder="得分" onChange={(e) => upd(\`\${p}Score\`, e.target.value ? Number(e.target.value) : undefined)} />
                </div>
              </div>);
            })}
          </div>
        </div>
        )}
      </div>
      )}

      {/* ====== 审批材料附件 + 流标 ====== */}
      {isOfflineExecution && (
      <div className="px-5 pb-3 space-y-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-semibold text-indigo-700">📎 审批材料附件</div>
        <div className="grid grid-cols-2 gap-3">
          {[['会议纪要',true],['上会材料',true],['招标代理抽取结果表',false],['成交通知书',true],['招采过程备案',true],['合资公司会议纪要',false],['合资公司上会材料',false],...(isNegotiation(methodKey) ? [['会议纪要(谈判)',true]] : [])].map(([label, req]: any[], idx) => (
            <div key={idx} className={`rounded-lg border-2 border-dashed p-3 ${req ? 'border-rose-300 bg-rose-50/40' : 'border-slate-300 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">📎 {label}{req && <span className="text-rose-500 ml-1">(必填)</span>}</span>
              </div>
              <button type="button" className="w-full py-2 text-xs text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 bg-white">+ 点击上传</button>
            </div>
          ))}
        </div>
        {/* 流标 */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#606266] font-semibold">流标：</span>
            <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name="isFailed" checked={!!form.isFailed} onChange={() => upd('isFailed', true)} /><span className="text-xs">是</span></label>
            <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name="isFailed" checked={!form.isFailed} onChange={() => { upd('isFailed', false); upd('failedReason', ''); }} /><span className="text-xs">否</span></label>
          </div>
          {!!form.isFailed && <textarea value={form.failedReason} onChange={(e) => upd('failedReason', e.target.value)} rows={3} placeholder="请填写流标原因" className="mt-2 w-full text-sm px-3 py-2 border border-slate-300 rounded-lg resize-y min-h-[80px]" />}
        </div>
      </div>
      )}

    </div>
  );
}
\n\n`;

// 替换：从 funcStart 到 nextExport 之间的内容（不包括 export default 本身）
const before = content.slice(0, funcStart);
const after = content.slice(nextExport);  // 从 '\nexport default' 开始
const newContent = before + newFormSection + after;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ 替换完成！新文件行数：', newContent.split('\n').length);
