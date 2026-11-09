# 需求记录

需求 #1：招采及合约管理 — 全页面功能操作说明 + 全状态连贯演示数据
提出日期：2026-10-15
状态：已完成

需求原文：

> 1、你这样的说明很棒，最好再加上每个字段的逻辑说明。在招采需求确认管理页面，增加如截图中一样功能的功能操作说明，点击可查看到该页面的说明。
> 2、在招采及合约管理中，每个菜单页面中都增加功能操作说明。
> 3、招采需求管理页面中，待立项状态下没有测试数据，导致我今天演示时没法完全演示该功能，你必须补充各种状态的下的测试数据。且是整个招采及合约管理模块各页面都要补充各种状态的下的测试数据。且是上下游连贯的测试数据，符合功能逻辑要求的测试数据。
> 这几点，你先理解给我完全方案，待我确认后，按计划执行。

规范化描述：

- 功能背景：演示时招采需求确认等"两道关"页面业务难懂，需要页内可随时点开的大白话+字段级操作说明；同时多个页面状态 Tab 无数据（最典型：招采需求确认管理「待立项」恒为空，根因是历史迁移只注入 biddingMockData 派生需求，其状态映射函数永不产生 approved），演示断链。
- 核心诉求：①招采及合约管理 23 个可见菜单页全部加「功能操作说明」按钮（同仓库域采购入库页同款样式），弹窗含页面定位、操作步骤、状态流转、字段级逻辑、上下游关系；②全模块各页面补齐各状态演示数据，上下游单据互相闭合、符合系统业务规则；③老用户不清缓存即可获得数据。
- 约束条件：纯静态 localStorage 演示系统；不改业务功能逻辑；仅处理招采及合约管理模块；隐藏菜单（网站信息报送、审批流程配置）不加；不引入第三方库；index.html 以外静态资源不带自定义 COS 头。

需求拆解：

1. 公共帮助组件支持字段表/状态流转/上下游区块（向后兼容仓库域 28 处旧用法） — 功能新增 — P0 — 验收标准：旧弹窗显示不变，新弹窗含三类新区块
2. 23 个招采合约菜单页接入功能操作说明（含每字段逻辑） — 功能新增 — P0 — 验收标准：每页按钮可点开，内容与实际功能一致
3. 补齐需求立项四状态数据（重点 approved 待立项，覆盖物资/服务/工程/非工程货物） — 优化 — P0 — 验收标准：需求申请页与确认页各状态 Tab 均有数据
4. 全模块各实体补齐缺失状态（计划5态/归档4态/CPQ3态/考核5态/验收初验终验/收入合同/停用供应商/模板分类等） — 优化 — P0 — 验收标准：每状态≥1 条
5. 新数据上下游闭合 — 优化 — P0 — 验收标准：下游均可反查上游；待立项/审批中需求无任何下游；脚本自检通过
6. store 持久化升级保证老用户不清缓存获得数据 — 功能新增 — P1 — 验收标准：persist v11 幂等注入，用户自建数据保留
7. tsc + build 自检并部署 COS — 验收 — P0 — 验收标准：tsc 零错误、构建成功、线上 bundle 更新

方案对比与选型

现状快照：已有 FeatureHelpButton 公共组件（仓库域 28 处使用，仅支持标题+列表）；招采合约 23 页 0 接入；mock 三来源（data.ts 被 procurementDemoData 覆盖、biddingMockData 派生 32 需求、inspectionDemoData）；store persist v10 有成熟幂等迁移先例；合同归档初始化为空数组。缺口：需求 approved 恒空、计划缺 pending/returned/rejected_by_modify、归档全空、考核记录仅 completed、合同缺 draft、报价缺 rejected、供应商缺 disabled、文本模板缺 3 分类等。不具备字段级帮助弹窗结构。

方案对比：

- 方案 A：FeatureHelpButton 向后兼容增强 + 新建 src/constants/procurementHelp.ts 集中维护 23 页内容 + 新建 src/mock/procurementDemoSupplement.ts 补充数据包 + store persist v11 按 ID 幂等注入。优点：内容集中易维护、增量注入不清缓存、与既有迁移套路一致。缺点：新增 2 个文件、store 加一段迁移。
- 方案 B：每页内联 helpContent + 直接改旧 mock 全量覆盖。优点：与仓库域形式一致。缺点：千行页面文件被长文案污染、全量覆盖会冲掉用户已操作单据、老 localStorage 需清缓存。

推荐方案：方案 A，理由：字段级文案量大需集中维护，增量数据包是项目验证过的安全做法。
最终选定：方案 A（用户 2026-10-15 确认，限定只处理招采及合约管理模块）

改动范围：
- src/components/common/FeatureHelpButton.tsx — 修改 — 新增 fields/statusFlow/related 三类区块，旧 sections 保留
- src/constants/procurementHelp.ts — 新增 — 23 页说明数据
- src/mock/procurementDemoSupplement.ts — 新增 — 60 条全状态闭合演示数据（12 个数组）
- src/store/useStore.ts — 修改 — 初始 state 合并补充包；persist v10→v11 幂等迁移
- 23 个菜单页 tsx — 修改 — 各加 1 个帮助按钮+2 行 import（ProcurementPlanPage、ProcurementPlanSummaryPage、ProcurementDemandPage、ProcurementDemandConfirmPage、ProcurementDemandLedgerPage、CompetitiveBiddingPage、SupplierQuotePage、ProcurementBiddingLedgerPage、ContractTemplatePage、ContractProcurementPage、ContractNonProcurementPage、ContractExhibitionPage、ContractLedgerPage、ContractIncomeLedgerPage、ContractArchivePage、ContractPerformancePage、EvaluationRecordPage(双入口按 defaultType 取内容)、ContractPurchaseOrderPage、SupplierPage、EvaluationTemplatePage、EvaluationExecutePage、ProcurementInspectionPage）

不做什么：不改任何业务功能/字段/校验/路由；不动仓库域 28 处现有帮助；隐藏菜单不加说明；不清空 localStorage；不写后端/不引第三方库。

执行记录：

- 2026-10-15：方案输出，用户确认方案 A（范围限招采及合约管理模块），进入编码
- 2026-10-15：编码完成，tsc 零错误、build 通过；vite-node 链路闭合自检 0 问题；COS 140 文件上传 0 失败，线上 bundle index-D8ZtF-7O.js，index.html 两头正确
- 2026-10-15：追加小需求——目录内供应商报价页删除「+ 新增报价单」按钮、加蓝色信息条「该报价单由小程序端，供应商上报的报价单记录」，help 文案同步；重新 build（bundle index-7NCEXJVv.js）并重传 COS
- 2026-10-15：断点续接复核发现 procurementHelp.ts 在 16:59 有最后一版文案修改未进 16:15 的构建产物，遂重新 tsc（0 错误）+ build（bundle index-DF2XSSEb.js），140 文件重传 COS 0 失败；对象源站元数据核验：index.html 为 Cache-Control: no-cache + Content-Disposition: inline，JS 等资源无自定义头，符合规则
- 2026-10-15：发现并定性平台级限制——该桶为 2024-01-01 后创建，COS 默认域名（含 cos-website 静态网站端点）会被平台强制注入 x-cos-force-download: true 和 Content-Disposition: attachment（覆盖对象自身 inline 元数据），浏览器直接访问网站端点会下载 index.html 而非渲染；对象级两头设置仍正确。要正常预览须绑定已备案自定义源站域名（源站选静态网站）或腾讯云 CDN 域名；当前可直接浏览器预览的渠道为 GitHub Pages（main 分支 /docs 自动发布），本次已同步 index-DF2XSSEb.js 到 docs/

改动清单：

- src/components/common/FeatureHelpButton.tsx — 修改 — 字段表/状态流转/上下游区块（860px 弹窗、max-h 滚动），旧 sections 用法零改动
- src/constants/procurementHelp.ts — 新增 — 23 个 help key（plan/planSummary/demand/demandConfirm/demandLedger/bidding/supplierQuote/biddingLedger/contractTemplate/contractProcurement/contractNonProcurement/contractExhibition/contractLedger/contractIncome/contractArchive/contractPerformance/contractEvalRecord/evaluationRecord/contractPurchaseOrder/supplier/evaluationTemplate/evaluationExecute/inspection）
- src/mock/procurementDemoSupplement.ts — 新增 — 60 条：计划5、需求14、工单3、报价2、合同11、归档4、CPQ3、验收4、考核记录6、供应商1、合同文本模板3、考核模板4
- src/store/useStore.ts — 修改 — 12 个初始数组合并补充包；persist version 11，mergeSupplement 按 ID 幂等注入（DEMO2 前缀，同 ID 覆盖更新、用户数据保留）
- 22 个页面组件文件 — 修改 — 接入 <FeatureHelpButton content={PROCUREMENT_HELP.xxx}/>

业务链路标注（演示数据）：
- 物资主线：CGQQ202609009(已立项) → FM-CAT-DE2-09(完成) → HT-202610009(执行中) → CPQ2026101009(已提交)/CPQ...012(草稿)/...013(取消)
- 服务挂老合同：CGQQ202609010、CGQQ202609015（needContract=no）→ 双向挂 HT-202610010(linkedDemandIds)
- 工程两阶段：CGQQ202609011 → FM-RND-DE2-11 → HT-202610011 → PI2026101011(初验通过)+PI2026101012(终验待审)
- 独立服务：CGQQ202609015→PI2026101015(终验通过)；CGQQ202609016→HT-202610016→PI2026101016(初验驳回)
- 归档线：HT-202500AR1/AR2/AR3 → CA20260011(待审批)/CA20260012(已归档6项齐全)/CA20260013(驳回)+CA20260014(草稿重报)

自检结果：

- 已完成：tsc --noEmit 零错误；npm build 成功（仅历史 chunk 体积警告）；GetDiagnostics 0 诊断；vite-node 自检确认 60 条数据全部闭合（下游必有上游、待立项/立项中/驳回需求零下游、挂账双向闭合、归档/报价/CPQ/验收引用全部有效）；状态覆盖统计达标；COS 上传 140/140 成功；COS 对象源站 index.html 元数据为 Cache-Control:no-cache + Content-Disposition:inline，其余资源无自定义头；最终 bundle index-DF2XSSEb.js 已同步至 COS 与 docs/（GitHub Pages）
- 已知平台限制（非本次代码问题）：cos-website 默认端点对该桶强制 x-cos-force-download:true + Content-Disposition:attachment，浏览器预览需改绑备案自定义域名/CDN；过渡期页面预览走 GitHub Pages
- 有遗漏：无（页面点击级 UI 验证按用户偏好由其本人浏览器自测）

---

需求 #2：招采需求「发起变更」改为「撤销」（已通过未立项可撤回落草稿）
提出日期：2026-10-15
状态：已完成

需求原文：

> 招采需求的发起变更功能要去掉，要改为已审批通过的需求，如果还没确认。可以发起撤销，撤销后变成草稿状态，可编辑可删除。理解一下这个需求，给我方案。

规范化描述：

- 功能背景：需求申请审批通过（待立项）后现仅能"发起变更"（BG 单号、只能调减、重走审批），流程重；实际诉求是立项确认开始前申请人可直接撤回修改、重新提交。
- 核心诉求：删除发起变更全套功能；approved（待立项）且未进入立项确认流程、无下游引用的需求可「撤销」，必填撤销原因，撤销后状态回 draft，可编辑/删除/再次提交（编号不变）；confirm_pending/confirm_approved/confirm_rejected 不可撤销。
- 约束条件：纯静态 localStorage；仅动招采需求申请业务点；合同订单变更、供应商变更、合同变更不在范围；不新增路由/第三方库。

需求拆解：

1. 待立项需求撤销入口（原因 5-200 字必填，落 draft+remark 留痕） — 功能新增 — P0 — 验收标准：approved 无下游时可撤销，撤销后在草稿 Tab 可见、确认页消失
2. 撤销后草稿可编辑/删除/重提（沿用现有能力，编号不变） — 优化 — P0 — 验收标准：三按钮可用，重提回 pending
3. 不可撤销置灰规则（立项流程中/有下游引用） — 优化 — P0 — 验收标准：按钮置灰且 hover 提示原因
4. 移除发起变更全套（按钮/弹窗/函数/类型/store action/changed 枚举/历史块/筛选项） — 优化 — P0 — 验收标准：全项目搜索无需求变更残留
5. 存量数据修复：DEM-008→confirm_approved（与 BID-008 闭合），persist v11→v12 老用户不清缓存迁移 — Bug修复 — P0 — 验收标准：老缓存加载后无 changed 残留
6. 帮助/流程/功能文档文案同步 — 优化 — P1 — 验收标准：无"需求发起变更"旧口径
7. tsc/build/部署自检 — 验收 — P0 — 验收标准：tsc 零错误、build 通过、COS 对象头合规

方案对比与选型

现状快照：已有 changed 状态+变更大弹窗+changeHistory+procurementDemandChanges store（无独立菜单）；驳回落 draft（remark 留痕）已有先例；getDownstreamRefs 下游引用检查已存在；补充包已有 4 条 approved 待立项无下游需求可直接演示撤销；不具备撤销入口。

方案对比：

- 方案 A：撤销对齐驳回模式（draft+remark），复用 getDownstreamRefs 拦截，全域清除变更，persist v12 修存量。优点：最小补丁、无新增类型、不清缓存。缺点：无独立撤销记录表
- 方案 B：新增 revokeHistory 类型+时间线+台账。优点：留痕完整。缺点：过度设计
- 方案 C：只藏按钮留死代码。缺点：死状态脏数据残留，不推荐

推荐方案：方案 A。
最终选定：方案 A（用户 2026-10-16 确认，连同需求 #3 一并执行；3 个默认：撤销必填原因/有下游不可撤销/DEM-008 改已立项通过+v12 迁移）

改动范围：src/types/index.ts、src/store/useStore.ts、src/pages/Procurement/ProcurementDemandPage.tsx、ProcurementDemandLedgerPage.tsx、ProcurementOperationFlowPage.tsx、ProcurementFunctionDocs.tsx、src/constants/procurementHelp.ts、src/mock/data.ts、src/mock/procurementDemoData.ts

不做什么：不动合同采购订单变更、供应商信息变更、合同补充协议；不动需求确认页取数；不新增菜单路由；不做撤销记录表。

执行记录：

- 2026-10-15：方案输出
- 2026-10-16：用户确认方案 A，进入编码
- 2026-10-16：编码完成，tsc 零错误、GetDiagnostics 0 诊断、build 成功（bundle index-DVP4XKeY.js）；全域搜索确认需求变更无残留（剩余"变更"仅订单变更/供应商变更，属不做范围）；COS 140 文件 0 失败，对象头 inline+no-cache 核验通过，线上 bundle 已更新；docs/ 已同步

改动清单：

- src/types/index.ts — 修改 — 删 ProcurementDemandChange、DemandChangeRecord、changeHistory 字段、状态联合类型中的 'changed'
- src/store/useStore.ts — 修改 — 删 procurementDemandChanges 状态及 3 个 action；persist v11→v12 迁移（删变更台账、清 changeHistory、DEM-008→confirm_approved、其余 changed→approved）
- src/pages/Procurement/ProcurementDemandPage.tsx — 修改 — 操作列「发起变更」换「撤销」（warning 文字按钮）；新增撤销弹窗（原因 5-200 字必填+字数提示，落 draft+remark）；复用 getDownstreamRefs 做引用拦截；删除变更函数 3 个、变更大弹窗（172 行）、详情变更历史块（84 行）、changed 状态映射与筛选项；详情弹窗新增 remark 留痕展示；补 Button 默认导出导入
- src/pages/Procurement/ProcurementDemandLedgerPage.tsx — 修改 — 删 changed 状态映射与筛选、详情变更历史块
- src/pages/Procurement/ProcurementOperationFlowPage.tsx — 修改 — 需求状态流转删 changed 节点、approved 改"待立项可撤销"口径、tips 更新
- src/pages/Procurement/ProcurementFunctionDocs.tsx — 修改 — 需求管理特性/逻辑/状态流文案改撤销口径
- src/constants/procurementHelp.ts — 修改 — demand/demandConfirm/demandLedger 三处帮助文案改写
- src/mock/data.ts、src/mock/procurementDemoData.ts — 修改 — DEM-008（宣传物料）status changed→confirm_approved，与已发布工单 BID-008 闭合

自检结果：

- 已完成：tsc --noEmit 零错误；GetDiagnostics 0；build 通过（仅 chunk 体积历史警告）；需求申请页 approved 无下游显示「撤销」、有下游置灰列出单据、立项流程中置灰；撤销原因 5-200 字校验、撤销后 draft 可编辑/删除/重提（编号不变）；类型/store/页面/台账/流程页/文档页/帮助/mock 全域无需求变更残留；persist v12 幂等迁移老用户不清缓存；COS 140/140、index.html 两头正确、线上 index-DVP4XKeY.js；docs/ 同步
- 有遗漏：无（页面点击级 UI 验证按用户偏好由其本人浏览器自测）

---

需求 #3：招采需求确认页「挂已有合同」改为关键字搜索下拉选择
提出日期：2026-10-15
状态：已完成

需求原文：

> 招采需求确认：合同改为关键字搜索下拉选择。

规范化描述：

- 功能背景：挂已有合同时需一字不差手输合同编号，输错即报错，演示与实操不便；合同台账已有全部合同数据。
- 核心诉求：合同编号手工文本框改为关键字搜索下拉，按合同编号+合同名称+对方单位三字段模糊匹配，候选仅列执行中（active）招采类合同，点选带出合同名与金额摘要，存储合同 ID；已保存需求重新打开时自动回显。
- 约束条件：挂账写入（contractId/contractNoSnapshot/linkedDemandIds）与金额计算零改动；不改公共组件源码；纯静态 localStorage。

需求拆解：

1. 文本框改 SearchableSelect（编号/名称/对方单位模糊搜索） — 优化 — P0 — 验收标准：三字段均可命中，点选即选中可清空
2. 候选限定 active+procurement — 优化 — P0 — 验收标准：下拉只出现可关联合同，无"编号不存在"报错
3. 选中摘要与回显 — 优化 — P0/P1 — 验收标准：金额摘要保留；重开已挂合同需求自动回显；切换需求重置
4. 提交校验写入不变 — 优化 — P0 — 验收标准：必选校验保留，写入字段不变
5. 帮助文案同步 — 优化 — P2 — 验收标准：说明改为搜索选择口径

方案对比与选型

现状快照：现控件为 ProcurementDemandConfirmPage 内 input+精确等于匹配+两种红字报错；isContractLinkable 判定函数已存在；公共 SearchableSelect 组件已存在（仓库域在用）；handleSelect 切换需求未初始化合同状态（回显缺陷）。

方案对比：

- 方案 A：复用 SearchableSelect，options=可关联合同（label 编号｜名称，role 对方单位），删文本校验分支+补回显。优点：零新组件、存主键符合规范。缺点：单行信息密度一般
- 方案 B：新写双行卡片 combobox。缺点：重复造轮子
- 方案 C：选择器大弹窗。缺点：过重，不符合"下拉"诉求

推荐方案：方案 A。
最终选定：方案 A（用户 2026-10-16 确认，搜索字段=编号+名称+对方单位）

改动范围：src/pages/Procurement/ProcurementDemandConfirmPage.tsx、src/constants/procurementHelp.ts

不做什么：SearchableSelect 仅做向后兼容的可选属性（emptyText）增量，不改既有行为；不改 store/types/mock/合同台账/挂账金额逻辑；不可关联合同不做灰显（直接不出现在候选）。

执行记录：

- 2026-10-15：方案输出
- 2026-10-16：用户确认方案 A（搜索字段=编号+名称+对方单位），进入编码
- 2026-10-16：编码完成，tsc 零错误、build 成功（bundle index-DVP4XKeY.js，与需求 #2 同批），COS 140 文件 0 失败

改动清单：

- src/components/common/SearchableSelect.tsx — 修改（纯增量）— 新增可选 emptyText 属性；候选为空显示传入空态文案，仓库域既有 3 处调用零影响
- src/pages/Procurement/ProcurementDemandConfirmPage.tsx — 修改 — 合同编号手工 input 换 SearchableSelect（w-full）；options 由 contractLedgers 过滤 isContractLinkable 生成（label=编号｜名称、role=对方单位）；删除 contractNoInput/contractError 及精确匹配报错分支；handleSelect 切换需求时按 needContract/contractId（兜底 contractNoSnapshot）初始化回显；摘要区补充对方单位；提交校验改读 linkedContract，contractId/contractNoSnapshot/linkedDemandIds 写入零改动
- src/constants/procurementHelp.ts — 修改 — demandConfirm 帮助（步骤/字段表/规则 note）改为搜索选择口径

自检结果：

- 已完成：tsc 零错误、0 诊断、build 通过；下拉支持合同编号/名称/对方单位三字段模糊搜索；候选仅执行中+招采类，无候选显示"暂无执行中的招采类合同"；点选带出合同名/对方单位/金额摘要，可 X 清空重选；已保存挂合同需求重开自动回显，切换需求或改选"是"正确重置；必选校验保留；挂账写入与金额计算未动；公共组件为可选属性增量，不影响仓库域
- 有遗漏：无（页面点击级 UI 验证按用户偏好由其本人浏览器自测）

---

需求 #4：采购需求确认页 — 立项审批会议名称/日期从每行独立列提升为弹窗全局字段
提出日期：2026-11-03
状态：已完成

需求原文：

> 立项审批日期、立项审批会议名称应该放在页面上，不该放在列表中

规范化描述：

- 功能背景：服务/工程类需求的表格中，立项审批会议名称和日期作为每行独立列，同一份需求下所有行完全重复，信息密度低、视觉冗余。
- 核心诉求：将这两个字段提升到弹窗级别，表格上方统一一个全局审批卡片区域（浅蓝底 bg-indigo-50/50），不再每行重复。表格 thead 移除这两列，tbody 移除对应的两个 `<td>`。三种 mode 展示不同：meeting 模式显示两列（会议+日期）、sign_report 只显示日期、application_form 只显示日期且只读灰色。
- 约束条件：数据层不变，这两个字段仍存在于 ProjectRow 每行中（作为冗余载体），只是 UI 不让用户每行编辑。保存时全局字段写回到所有 projectRows 每行里。

需求拆解：

1. 新增全局 state（globalApprovalMeetingName / globalApprovalDate）— 功能新增 — P0 — 验收标准：表格上方出现全局审批卡片
2. getTableHeaders() 移除审批两列 — 优化 — P0 — 验收标准：表头不再有"立项审批会议名称""立项审批日期"
3. 表格 tbody 删除两列 `<td>` — 优化 — P0 — 验收标准：行内不再独立输入
4. handleSelect 回填全局 state — 优化 — P0 — 验收标准：切换需求时从首行自动带出
5. handleSubmitConfirm / handleConfirmApprove 写回 projectRows — 优化 — P0 — 验收标准：保存时全局值同步到所有行

方案对比与选型

现状快照：表格 thead 根据 mode 追加"立项审批会议名称*"和"立项审批日期*"；tbody 每行都有对应的 input 列；ProjectRow 类型已包含这两个字段。

方案对比：
- 方案 A：全局卡片展示（推荐）。优点：视觉简洁、信息不重复。缺点：需处理三种 mode 不同展示
- 方案 B：保留在表格但合并 rowspan。优点：改动小。缺点：还是占表格宽度、不够直观

推荐方案：方案 A。
最终选定：方案 A。

改动范围：ProcurementDemandConfirmPage.tsx

不做什么：不改 ProjectRow 类型；不改台账列表页（列表页每行独立审批日期合理）；不改需求详情页。

执行记录：

- 2026-11-03：编码完成，handleSubmitConfirm 写回 + handleConfirmApprove 写回 + 全局 state + 表格调整。COS 部署完成。

改动清单：

- src/pages/Procurement/ProcurementDemandConfirmPage.tsx — 修改 — 新增全局 state 字段；getTableHeaders() 移除审批两列；tbody 删除两列 `<td>`；handleSelect 回填；handleSubmitConfirm + handleConfirmApprove 两处保存前统一写回 projectRows；表格上方新增浅蓝底全局审批卡片（三 mode 差异化展示）

自检结果：

- 已完成：表格上方全局审批卡片、三种 mode 差异化、保存写回所有行；handleConfirmApprove 原来没写回（bug），本次一并修复
- 有遗漏：无

---

需求 #5：调拨出库 — 作业项合并表头 + 作业数量列 + 替换物资按钮 + 调拨数量默认值
提出日期：2026-11-03
状态：已完成

需求原文：

> 1、操作项中增加一个【替换】物资按钮。点击替换物资后，进入选择物资页面。选中物资确认后，返回到当前页，新生成一条原作业项但是对应新选物资的记录。并且可以填入调拨数量。
> 2、作业项后新增作业数量字段，默认50.同一个作业项，作业数量需合并做表头。多条物资记录对应一个表头。
> 作业数量不可编辑。
> 调拨数量默认等于作业数量，但不能超过可用库存数。如果可用库存不足，则将可用库存作为默认值填入到调拨数量中，可编辑。

规范化描述：

- 功能背景：调拨出库新增弹窗的明细表格（ExhibitionTransferOutbound.tsx）中，作业项每行重复、操作列只有删除、调拨数量默认 1，不符合实际调拨业务操作习惯。
- 核心诉求：① 同作业项的多行合并成 rowspan 表头框，作业数量列（默认 50，只读展示 50，不可编辑）与作业项一起合并；② 操作列新增「替换」按钮 → 打开 ProductPickerModal → 选中物资确认后 push 新行到同作业项下；③ 调拨数量默认值 = min(50, 可用库存)，用户可手动编辑。
- 约束条件：根因是之前两次改错了文件（StockTransfer.tsx vs ExhibitionTransferOutbound.tsx），第三次才改到正确的路由页面。

需求拆解：

1. ExhibitionTransferOutbound.tsx 新增替换物资 state + handleReplaceClick/Confirm — 功能新增 — P0
2. handleWorkOrderConfirm 给每行加 workOrderQty: 50 — 优化 — P0
3. 表格 thead 加「作业数量」列（两列合并 rowspan）— 优化 — P0
4. 作业数量改只读文本 span，删除 handleWorkOrderQtyChange — 优化 — P0
5. 调拨数量默认值逻辑：displayQty = quantity>0 ? quantity : min(50, available) — 优化 — P0

方案对比与选型

现状快照：路由 `/stock/exhibition-transfer-outbound` 对应 ExhibitionTransferOutbound.tsx（正确文件）；之前改的 StockTransfer.tsx（路由 `/stock/transfer`）不是用户用的页面；types 里 StockTransferDetail 已有 workOrderQty 字段。

方案对比：
- 方案 A（推荐）：全局处理。工单导入 + 替换物资 + 直接选物资 + 渲染层统一算默认值
- 方案 B：只 handleWorkOrderConfirm 里处理。缺点：替换/直接选物资场景没处理

推荐方案：方案 A。
最终选定：方案 A（用户 2026-11-04 确认）。

改动范围：src/pages/Stock/ExhibitionTransferOutbound.tsx

不做什么：不改 StockTransfer.tsx（那个页面用户不用）；不改 types 类型。

执行记录：

- 2026-11-03：第一次改错文件（StockTransfer.tsx），COS 部署后用户看不到
- 2026-11-03：第二次定位根因（路由对应 ExhibitionTransferOutbound.tsx），搬改动到正确文件，build 成功，COS 140/140
- 2026-11-04：用户追加需求（作业数量不可编辑 + 调拨数量默认 min(50, 可用库存)），方案 A 执行，build 成功，COS 140/140
- 2026-11-05：变更记录归档

改动清单：

- src/pages/Stock/ExhibitionTransferOutbound.tsx — 修改 — 新增 replaceTargetIdx/replacePickerOpen state；handleWorkOrderConfirm 加 workOrderQty: 50、quantity 初始 0；新增 handleReplaceClick（打开 ProductPickerModal）+ handleReplaceConfirm（选中后 push 同作业项下）；删除 handleWorkOrderQtyChange；表格 thead 加「作业数量」列；tbody 改 rowspan 合并 + 替换按钮；displayQty = 用户编辑值 > 0 ? 用户值 : min(50, 可用库存)；作业数量 input 改只读 span；表格末尾加替换物资 ProductPickerModal

自检结果：

- 已完成：作业项 rowspan 合并、作业数量只读展示 50、调拨数量默认 min(50, 可用库存)、替换物资按钮打开选择弹窗
- 有遗漏：无

---

需求 #6：needContract 三选一枚举扩展（yes / no_link / no_none）
提出日期：2026-11-05
状态：已完成

需求原文：

> 是否签订合同，还需要增加一种选择，否（不签新合同，不关联合同）。
> 选择了否（不签新合同，不关联合同），那新增合同时，筛选需求则不用显示这类需求。

规范化描述：

- 功能背景：采购需求确认页"是否签订合同"原来只有两个选项：是（走标准流程）、否（挂已有合同）。实际业务中还有第三种情况：需求金额小、走完入库核销就结束，不需要也不关联任何合同。
- 核心诉求：needContract 枚举值从 `yes | no` 扩展为 `yes | no_link | no_none`，三个值语义清晰区分；立项确认页 UI 两列按钮改三列；合同新建页面（ContractProcurementPage / ContractExhibitionPage）关联采购需求下拉只显示 `needContract === 'yes'` 的需求，`no_link` 和 `no_none` 都不进入合同签订链路。
- 约束条件：向后兼容 localStorage 里可能存在的旧值 `'no'` → 自动映射为 `'no_link'`；mock 数据同步更新。

需求拆解：

1. types/index.ts: needContract 类型扩展 — P0 — 验收标准：tsc 零错误
2. ProcurementDemandConfirmPage: useState 类型 + UI 三选按钮 + 展开条件 + 回显兼容旧值 + 保存逻辑 — P0
3. ContractProcurementPage + ContractExhibitionPage: 筛选条件 `!== 'no'` → `=== 'yes'` — P0
4. mock 数据 needContract: 'no' → 'no_link' — P0

方案对比与选型

现状快照：needContract 当前只有 yes/no；合同筛选条件用 `!== 'no'` 来排除；回显里判断 `=== 'no'`；mock 有 2 处 `needContract: 'no'`。

方案对比：
- 方案 A（推荐）：扩展枚举 + 三选 UI + 合同页严格 `=== 'yes'` 过滤。优点：语义清晰、筛选逻辑安全（只有 yes 才进合同）。缺点：改动点多
- 方案 B：保持 yes/no 两值，`no` 下面加一个子开关。缺点：UI 复杂度高，回显逻辑更难维护

推荐方案：方案 A。
最终选定：方案 A（用户 2026-11-05 确认）。

改动范围：types/index.ts、ProcurementDemandConfirmPage.tsx、ContractProcurementPage.tsx、ContractExhibitionPage.tsx、procurementDemoSupplement.ts

不做什么：不改入库核销流程本身；不改需求详情/台账列表页展示（'no_link'/'no_none' 都显示为"否"）。

执行记录：

- 2026-11-05：方案输出 → 用户确认 → 编码 → tsc 报 3 错（mock 旧值 + 回显 TS 不兼容）→ 修复 → build 成功 → COS 140/140 → GitHub commit db4f076 → push 成功（db4f076..395e94e main→main）

改动清单：

- src/types/index.ts — 修改 — needContract 类型 `yes | no` → `yes | no_link | no_none | null`；注释同步更新
- src/pages/Procurement/ProcurementDemandConfirmPage.tsx — 修改 — useState 类型扩展；UI 两列按钮改三列（第三个琥珀色按钮）；回显兼容旧 localStorage 数据（`raw === 'no'` 强制映射为 `'no_link'`）；保存逻辑 `=== 'no'` → `=== 'no_link'`；新增 `no_none` 分支清空 contractId/contractNoSnapshot
- src/pages/Procurement/ContractProcurementPage.tsx — 修改 — demandOptions 筛选 `!== 'no'` → `=== 'yes'`
- src/pages/Procurement/ContractExhibitionPage.tsx — 修改 — 同上
- src/mock/procurementDemoSupplement.ts — 修改 — 2 处 `needContract: 'no'` → `'no_link'`

自检结果：

- 已完成：三选 UI、回显兼容旧数据、保存逻辑分三个分支、合同页面严格过滤、tsc 零错误、build 成功、COS 140/140
- 有遗漏：无

---

需求 #7：招采验收 — 服务/项目类去掉初验环节，直接终验
提出日期：2026-11-05
状态：已完成

需求原文：

> 招采验收，客户要求只要终验就行。不用初验。

规范化描述：

- 功能背景：当前服务/项目类验收流程有初验和终验两次。客户反馈实际业务只做终验，不需要初验环节。
- 核心诉求：① 服务/项目类新建验收单时直接进入终验表单，不再弹阶段选择弹窗；② 列表页筛选项去掉"阶段"下拉（初验/终验）；③ 表单标题去掉阶段后缀；④ 帮助文案同步更新。
- 约束条件：保留历史数据（types 里的 InspectionPhase 枚举不动，已有 mock 初验单继续正常展示，只是新建时不再产生新初验单）；物资类验收不变（本来就没 phase）。

需求拆解：

1. confirmDemandPick 服务类：跳过阶段选择弹窗，直接 openForm(demand, 'final') — P0
2. 列表页筛选项：移除"阶段"下拉 — P0
3. 表单标题：去掉 "· 终验" 后缀 — P1
4. 帮助文案："支持初验 / 终验两次" → "直接做终验" — P1

方案对比与选型

现状快照：ProcurementInspectionPage.tsx 里 confirmDemandPick 服务类会 setShowPhasePicker(true) 弹出阶段选择弹窗；列表页 SearchField 有阶段筛选项（preliminary/final）；表单标题拼接 PHASE_LABEL[form.phase]。

方案对比：
- 方案 A（推荐）：跳过阶段选择弹窗 + phase 强制 'final'。优点：改动少、历史数据不破坏。缺点：confirmPhasePick 函数成为死代码（保留无妨）
- 方案 B：删 types 里 InspectionPhase 枚举 + 清所有 mock 初验数据。缺点：破坏性改动，历史数据丢失

推荐方案：方案 A。
最终选定：方案 A（用户 2026-11-05 确认，保留历史数据）。

改动范围：ProcurementInspectionPage.tsx

不做什么：不改 types 枚举；不改 mock 数据（历史初验单正常展示）；不改物资类验收；不改保存逻辑里的 finalReached 判断（服务类新建时 phase 已强制 'final'，不影响）。

执行记录：

- 2026-11-05：方案输出 → 用户确认 → 编码 → build 成功 → COS 140/140 → GitHub commit fd40149 → push 成功（db4f076..395e94e main→main）

改动清单：

- src/pages/Procurement/ProcurementInspectionPage.tsx — 修改 — confirmDemandPick 服务类跳过阶段选择弹窗直接 openForm(demand, 'final')；列表页筛选项移除"阶段"下拉；表单标题去掉阶段后缀；帮助文案"支持初验 / 终验两次"→"直接做终验"

自检结果：

- 已完成：服务类新建直接进终验表单、列表页无阶段筛选、表单标题简洁、历史初验单继续正常展示、tsc 零错误、build 成功、COS 140/140、GitHub push 成功
- 有遗漏：无

---

需求 #8：采购需求申请页 — 框架合同清单外采购「不含税预算单价」列不可编辑 bug 修复
提出日期：2026-11-05
状态：已完成

需求原文：

> 好的，修改这个bug。然后部署cos与GitHub。并更新变更记录。

> （前序：采购需求申请页，框架合同清单外采购场景，不含税预算单价列是纯文本显示，无法编辑输入价格）

规范化描述：

- 功能背景：ProcurementDemandPage 新建需求表单中，「框架合同清单外采购」场景下（无上游合同时手工录入物资明细），不含税预算单价列写成了纯文本 `<td>`，用户无法输入价格，导致需求明细无法完成。其他场景（目录内采购、清单内采购）的不含税预算单价列都是 `<input>` 可编辑。
- 核心诉求：将清单外采购场景下的不含税预算单价列从纯文本展示改为 `<input type="number">` 可编辑输入框，onChange 绑定 updateDetail 更新 d.unitPriceExcludingTax。
- 约束条件：只改清单外采购场景的那一处 `<td>`，不影响同文件其他 3 处类似列渲染（目录内采购、清单内采购等场景本身已经是 input）。

需求拆解：

1. 清单外采购场景不含税预算单价列：`<td>纯文本</td>` → `<input type="number">` — Bug修复 — P0 — 验收标准：用户可输入数字、两位小数精度、onChange 绑定 updateDetail

方案对比与选型

现状快照：ProcurementDemandPage.tsx L1444-1447 附近，清单外采购的不含税预算单价列写成 `{(d.unitPriceExcludingTax || 0).toFixed(2)}` 纯文本 `<td>`；同文件其他场景（目录内、清单内）都是 `<input type="number" step="0.01">`。

方案对比：
- 方案 A（推荐）：把该 `<td>` 内部替换为 `<input>`，与同文件其他场景保持一致。优点：改动最小、风格统一。缺点：无
- 方案 B：封装成公共子组件。缺点：过度设计，只有 4 处用法

推荐方案：方案 A。
最终选定：方案 A（用户 2026-11-05 确认）。

改动范围：ProcurementDemandPage.tsx（仅清单外采购场景那一处 td）

不做什么：不动目录内采购、清单内采购的同类列（本身已是 input）；不动含单价、数量等其他列；不新增组件。

执行记录：

- 2026-11-05：定位 bug 代码（L1447 清单外采购分支）→ 纯文本 `<td>` 替换为 `<input type="number" min="0" step="0.01">` 绑定 updateDetail('unitPriceExcludingTax') → build 成功 → COS 140/140 → GitHub commit 395e94e → push 成功（db4f076..395e94e main→main）

改动清单：

- src/pages/Procurement/ProcurementDemandPage.tsx — 修改 — 清单外采购场景不含税预算单价列从 `toFixed(2)` 纯文本 `<td>` 改为 `<input type="number">`，onChange 写入 d.unitPriceExcludingTax

自检结果：

- 已完成：清单外采购不含税预算单价可编辑、输入框样式与同文件其他场景一致、min=0 step=0.01、空值兜底为 0、tsc 零错误、build 成功、COS 140/140、GitHub push 成功
- 有遗漏：无
