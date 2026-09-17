import React from 'react';
import { FileText, ArrowRight, ArrowLeft, Database, Workflow, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface FieldOptionLogic {
  value: string;
  logic: string;
}

interface FieldLogic {
  field: string;
  options: FieldOptionLogic[];
}

interface DocItem {
  id: string;
  title: string;
  overview: string;
  features: string[];
  logic: string[];
  fieldLogic?: FieldLogic[];
  upstream: string;
  downstream: string;
}

const docs: DocItem[] = [
  {
    id: 'plan',
    title: '招采计划',
    overview: '管理企业年度/月度采购计划的编制、审批与跟踪，是采购业务的起点。',
    features: [
      '新增、编辑、删除采购计划',
      '提交审批、审批流转（支持多级审批节点）',
      '计划明细增删改',
      '查看审批历史与批注',
      '重新提交被退回的计划',
      '导出计划列表',
    ],
    logic: [
      '状态流转：草稿(draft) → 待审批(pending) → 已审批(approved) / 已退回(returned) / 驳回后回到草稿(draft)',
      '支持配置审批流程，按流程节点逐级审批',
      '退回操作可指定退回节点（含起草人），并需填写退回原因',
      '驳回后回到草稿状态，可编辑后重新提交',
      '已审批计划的数据为后续采购执行提供预算参考',
    ],
    upstream: '无（手工创建，或由预算系统生成）',
    downstream: '招采计划汇总',
  },
  {
    id: 'plan-summary',
    title: '招采计划汇总',
    overview: '按年份、月份、部门、项目类别等维度汇总统计采购计划，支持多维度分析。',
    features: [
      '按年份、月份、部门、计划类型筛选',
      '自动汇总总预算、明细数量',
      '支持按部门/类别/时间段分组统计',
      '导出汇总报表（CSV格式）',
      '导出明细报表',
    ],
    logic: [
      '基于已审批的采购计划进行汇总',
      '预算总额 = 所有计划明细的预算之和',
      '支持按类别分组，计算各类别预算占比',
      '仅展示有效状态的计划（已审批/执行中）',
    ],
    upstream: '招采计划管理',
    downstream: '无（数据展示层）',
  },
  {
    id: 'demand',
    title: '招采需求申请管理',
    overview: '各部门发起采购需求申请，填写物资、数量、预算等信息，进入采购执行环节。',
    features: [
      '独立创建采购需求申请',
      '需求明细增删改',
      '需求审批流转',
      '发起需求变更（修改需求内容）',
      '支持需求驳回',
      '附件上传',
    ],
    logic: [
      '状态流转：草稿(draft) → 待审批(pending) → 已审批(approved) / 已驳回(rejected) / 变更中(changed)',
      '驳回后回到草稿状态，可编辑后重新提交',
      '需求申请独立创建，不依赖采购计划',
      '框架采购类型审批通过后自动生成采购订单',
      '需求变更需要走审批流程，原需求数据保留',
    ],
    fieldLogic: [
      {
        field: '需求类型',
        options: [
          { value: '物资采购', logic: '直接从物资档案选择物资；可按采购类型（框架/单次）过滤物资' },
          { value: '实施项目', logic: '先选择实施项目，再选择该项目下的物资；明细自动关联项目编号和项目名称' },
          { value: '服务项目', logic: '先选择服务项目，再选择该项目下的物资；明细自动关联项目编号和项目名称' },
        ],
      },
      {
        field: '采购类型',
        options: [
          { value: '框架采购', logic: '只能选择已有有效合同的物资；审批通过后按合同自动生成招采订单' },
          { value: '单次采购', logic: '只能选择无有效合同的物资；需通过招采工单走招标流程' },
          { value: '混选采购', logic: '可选全部物资（含框架和非框架）；支持灵活组合采购方式' },
        ],
      },
      {
        field: '项目名称',
        options: [
          { value: '手动填写', logic: '手动输入项目名称；确定后自动带出项目预算和需求部门信息' },
        ],
      },
      {
        field: '附件上传',
        options: [
          { value: '上传附件', logic: '支持会议纪要及上会材料、签呈审批相关文件、预算审核文件、用户需求书/施工方案等多种附件上传。支持上传多个附件。附件随单据一同保存，审批时可查看' },
        ],
      },
    ],
    upstream: '无（独立创建）',
    downstream: '招采执行、目录内供应商报价、招采订单管理',
  },
  {
    id: 'bidding',
    title: '招采执行',
    overview: '针对采购需求发起招采执行（询比/竞价/谈判/直接采购/框架协议/电子商城），管理受邀供应商、报价与中标评审。',
    features: [
      '从招采需求创建招采执行',
      '支持7种采购方式：询比/竞价/谈判-公开/谈判-邀请/直接采购/框架协议(目录内比价)/电子商城',
      '受邀供应商选择（支持模糊搜索、多选、已选数量统计）',
      '清单明细导入导出（含框架合同清单内/外标记）',
      '离线报价清单导入，自动计算不含税单价/含税金额/税额',
      '招标时间设置（开始/结束时间校验）',
      '中标评审与选择',
    ],
    logic: [
      '状态流转：草稿(draft) → 已发布(published) → 竞价中(bidding) → 评审中(evaluated) → 已完成(completed)',
      '框架协议采购：清单内比价一种方式，无随机抽取；清单内采购自动带入合同编码筛选',
      '谈判采购：公开/邀请两个独立选项，谈判公告需上传',
      '评审通过后生成合同台账记录',
      '已被下游引用的需求申请不可发起变更',
    ],
    upstream: '招采需求申请管理、招采需求确认管理',
    downstream: '目录内供应商报价、合同台账、招采订单',
  },
  {
    id: 'supplier-quote',
    title: '目录内供应商报价',
    overview: '收集和管理框架合同目录内供应商的报价信息，支持多维度报价对比与采纳决策。',
    features: [
      '按物资维度聚合报价（最低/最高/平均单价）',
      '按执行单维度汇总报价（总金额/税率对比）',
      '报价采纳/驳回',
      '自动选择最低价',
      '相同最低价时手动选择',
    ],
    logic: [
      '状态流转：已提交(submitted) → 已采纳(accepted) / 已驳回(rejected)',
      '供应商报价不能超过招采执行单品上限',
      '采纳报价后自动回写招采执行状态',
      '多个供应商报相同最低价时需手动选择',
      '驳回报价需填写原因',
    ],
    upstream: '招采执行',
    downstream: '合同台账、招采订单',
  },
  {
    id: 'demand-confirm',
    title: '招采需求确认管理',
    overview: '审批通过的招采需求申请进入立项确认流程，选择立项方式（会议/签报/采购项目申请表）并填写立项专属字段。',
    features: [
      '立项方式选择（会议审批/签报审批/采购项目申请表）',
      '项目清单行锁定（已审批需求不可增删改）',
      '立项专属字段补填（会议名称/审批日期/合资公司审批信息）',
      '立项提交与审批',
      '立项驳回',
      '合资公司审批信息（可选）',
    ],
    logic: [
      '状态流转：待立项(confirm_pending) → 立项审批中(confirm_pending) → 已立项通过(approved) / 立项已驳回(rejected)',
      '需求清单行已审批后锁定不可增删，dept/projectName/mainContent/budget* 永远只读',
      '立项审批中/已通过时，立项专属字段也被锁定不可编辑',
      '三种立项方式的必填字段不同：会议审批需会议名称+日期；签报/采购项目申请表需日期',
      '合资公司审批信息为可选项，独立一套会议名称和日期字段',
    ],
    upstream: '招采需求申请管理（已审批通过的需求）',
    downstream: '招采执行',
  },
  {
    id: 'contract',
    title: '合同台账',
    overview: '管理所有采购合同的全生命周期，包括合同创建、执行、变更、终止等。',
    features: [
      '新增/编辑合同（可从招采工单带入）',
      '合同执行跟踪',
      '合同中止/终止/恢复',
      '合同预警提醒（到期、支付进度）',
      '多维度筛选与统计',
      '合同变更记录',
    ],
    logic: [
      '状态流转：待审批(pending) → 执行中(executing) → 已完成(completed) / 已中止(suspended) / 已终止(terminated)',
      '合同金额 = 已支付金额 + 未支付金额',
      '合同到期前30天自动预警',
      '已终止合同不可恢复',
      '合同变更需记录变更前后数据',
    ],
    upstream: '招采工单、报价单、合同文本管理',
    downstream: '合同归档、招采订单管理、财务付款',
  },
  {
    id: 'contract-procurement',
    title: '招采类合同',
    overview: '招采类合同轻量审批表单，支持8种形成方式（公开招标/邀请招标/询比/竞价/谈判-公开/谈判-邀请/直接采购/框架协议/电子商城），审批通过后自动同步至合同台账。',
    features: [
      '轻量审批表单（合同编码/合同名称/形成方式/签订日期等核心字段）',
      '形成方式8选1下拉，不同形成方式显示不同附属字段',
      '招采类合同标识，需走审批流',
      '关联招采执行单与中选结果',
      '审批通过自动回写合同台账状态',
    ],
    logic: [
      '形成方式枚举覆盖全部招采路径：公开招标/邀请招标/询比采购/竞价采购/谈判采购-公开/谈判采购-邀请/直接采购/框架协议采购/电子商城采购',
      '状态流转：待审批(pending) → 已审批(approved) / 已驳回(rejected)',
      '已审批通过后自动生成合同台账记录，合同编号从招采执行带入',
      '核心字段：合同编码（手动输入）、合同名称、形成方式、签订日期、合同金额、供应商',
    ],
    upstream: '招采执行（中标评审通过后发起）',
    downstream: '合同台账（自动同步）',
  },
  {
    id: 'contract-non-procurement',
    title: '非招采类合同',
    overview: '非招采类合同轻量审批表单，支持5种类型（直接采购/单一来源/紧急采购/协议供货/其他），可选履约保证金门控。',
    features: [
      '轻量审批表单',
      '非招采类型5选1下拉',
      '履约保证金门控（可选开关）',
      '审批通过自动同步至合同台账',
    ],
    logic: [
      '非招采类型：直接采购/单一来源采购/紧急采购/协议供货/其他非招采',
      '履约保证金门控开启后，需填写保证金金额、缴纳方式、缴纳日期',
      '状态流转：待审批(pending) → 已审批(approved) / 已驳回(rejected)',
      '审批通过后自动生成合同台账记录',
    ],
    upstream: '手工创建（非招采路径的合同）',
    downstream: '合同台账（自动同步）',
  },
  {
    id: 'contract-archive',
    title: '合同归档',
    overview: '对已完成/终止的合同进行归档管理，支持归档审批流程。',
    features: [
      '创建归档申请（选择已完成合同）',
      '归档审批流转',
      '归档记录查询',
      '归档附件上传',
      '批量归档',
    ],
    logic: [
      '状态流转：草稿(draft) → 待审批(pending) → 已归档(approved) / 驳回后回到草稿(draft)',
      '仅已完成或已终止的合同可申请归档',
      '归档审批通过后合同标记为"已归档"，不可再编辑',
      '驳回后回到草稿状态，可编辑后重新提交',
    ],
    upstream: '合同台账',
    downstream: '无（归档后锁定）',
  },
  {
    id: 'contract-performance',
    title: '合同履约评估',
    overview: '合同执行过程中对供应商履约情况进行评估打分，基于评估模板逐项评分，提交后进入审批流程。',
    features: [
      '选择合同台账中的合同进行评估',
      '选择合同履约评价模板（从考核评价模版管理中创建）',
      '按模板指标逐项打分（支持预览满分和加权分）',
      '自动计算总分（各指标加权分之和）',
      '评估备注与附件上传',
      '保存草稿 / 提交审批',
    ],
    logic: [
      '状态流转：草稿(draft) → 待审批(pending) → 已审批(approved) / 已驳回(rejected)',
      '合同履约评估模板类型为 contract_performance',
      '总分 = 各指标 (得分/满分×权重) 之和，保留1位小数',
      '已评估合同可多次评估（按时间间隔区分）',
      '提交后在「履约评估记录」中可查看审批进度',
    ],
    upstream: '合同台账、考核评价模版管理',
    downstream: '履约评估记录',
  },
  {
    id: 'contract-eval-record',
    title: '履约评估记录',
    overview: '合约管理视角下的履约评估记录查询，仅展示合同履约评价类型的记录，支持筛选、审批和统计分析。',
    features: [
      '仅展示合同履约评价类型（contract_performance）的评估记录',
      '状态筛选（草稿/待审批/已通过/已驳回/已完成）',
      '日期范围筛选',
      '查看评估详情（各指标得分、总分、审批历史）',
      '评估记录审批（通过/驳回）',
      '重新提交被驳回的记录',
      'CSV导出',
    ],
    logic: [
      '该页面为合约管理子菜单，强制过滤只显示 contract_performance 类型记录',
      '评估类型下拉在此入口被锁定禁用',
      '评估记录同时也在「供应商管理 > 考核评价管理 > 考核评价记录」入口可查（全类型）',
      '统计卡片展示：总数/待审批/已通过/已驳回/平均分',
      '右侧展示供应商评分排行榜和考核类型分布',
    ],
    upstream: '合同履约评估（提交后自动产生记录）',
    downstream: '无（记录查询与审批层）',
  },
  {
    id: 'purchase-order',
    title: '招采订单管理',
    overview: '基于招采合同或需求创建招采订单，跟踪订单执行状态与变更；框架内采购可直接从合同生成。',
    features: [
      '新增/编辑招采订单',
      '从招采需求快速创建订单',
      '框架内采购直接从合同生成订单',
      '订单明细维护',
      '订单提交/取消',
      '订单变更管理',
      '订单确认/反确认',
    ],
    logic: [
      '状态流转：草稿(draft) → 已提交(submitted) → 已确认(confirmed) → 已完成(completed) / 已取消(cancelled)',
      '订单数量不可超过合同约定总量',
      '已提交订单需走变更流程才能修改',
      '反确认需确保无下游关联单据（如已验收则不可反确认）',
      '订单确认后可生成入库单',
    ],
    upstream: '合同台账、招采需求申请管理',
    downstream: '招采项目验收、入库管理',
  },
  {
    id: 'inspection',
    title: '招采项目验收',
    overview: '对采购物资进行验收登记与审批，合格物资自动入库。',
    features: [
      '创建验收单（关联采购订单）',
      '验收明细登记',
      '验收审批流转',
      '不合格处理',
      '验收报告生成',
    ],
    logic: [
      '状态流转：草稿(draft) → 待验收(pending) → 已验收(approved) / 驳回后回到草稿(draft)',
      '验收合格数量不可超过订单数量',
      '审批通过后自动更新库存数量',
      '驳回后回到草稿状态，可编辑后重新提交',
      '不合格物资触发退货/换货流程',
      '验收单需关联质检报告',
    ],
    upstream: '招采订单管理',
    downstream: '库存管理、入库管理',
  },
  {
    id: 'contract-template',
    title: '合同文本管理',
    overview: '创建和管理合同模板，支持拖拽式组件设计与版本管理。',
    features: [
      '模板分类管理（展览服务/招采合同/招商合同等）',
      '可视化拖拽设计（组件库、布局组件）',
      '模板版本管理',
      '模板预览',
      '模板导入/导出',
      'Word/PDF导出',
    ],
    logic: [
      '模板分类为扁平结构：展览服务、展览展示服务、招采合同、招商合同、其他类合同',
      '支持基础组件（标题、文本、日期等）、高级组件（附件、签字等）、布局组件（两列布局、页签）',
      '模板版本号自动递增',
      '已被合同引用的模板不可删除',
      '支持模板克隆创建',
    ],
    upstream: '无（独立设计）',
    downstream: '合同台账（创建合同时选择模板）',
  },
  {
    id: 'supplier',
    title: '供应商列表',
    overview: '管理供应商档案、资质证书与信用评级，是采购业务的基础数据。',
    features: [
      '供应商档案维护',
      '资质证书管理（有效期预警）',
      '供应商分级（A/B/C/D级）',
      '供应商黑名单管理',
      '供应商业绩统计',
      '供应商变更申请',
    ],
    logic: [
      '资质证书到期前30天自动预警',
      '黑名单供应商不可参与采购',
      '供应商评级根据履约情况自动更新',
      '变更申请需审批通过才能生效',
      '一家供应商可同时拥有多个资质',
    ],
    upstream: '无（基础数据维护）',
    downstream: '招采执行、目录内供应商报价、合同台账',
  },
  {
    id: 'evaluation-template',
    title: '考核评价模版管理',
    overview: '创建和管理考核评价模板，5种模板类型覆盖不同考核场景，支持指标与权重配置。',
    features: [
      '5种模板类型：合同履约评价/单个项目考核/月度考核/季度考核/年度评价',
      '自定义评价指标与权重',
      '指标支持满分、评分说明、权重分配',
      '模板创建/编辑/删除',
      '系统初始化模板不可修改（基于评价表模版文件夹）',
      '可基于系统模板生成自定义模板',
    ],
    logic: [
      '5种模板类型对应不同业务场景：contract_performance/project_single/monthly/quarterly/yearly',
      '指标权重总和必须为100%',
      '已被考核执行引用的模板不可删除',
      '系统初始化模板只读，不可直接修改或删除',
      '创建新模板时可克隆已有模板快速复制',
    ],
    upstream: '无（独立创建）',
    downstream: '合同履约评估、考核评价执行',
  },
  {
    id: 'evaluation-execute',
    title: '考核评价执行',
    overview: '基于评价模板选择供应商，逐项打分并提交审批，支持5种考核类型。',
    features: [
      '选择评价模板 + 选择供应商',
      '按模板指标逐项打分',
      '自动计算总分（各指标加权分之和）',
      '查看历史考核记录',
      '考核备注与附件上传',
      '保存草稿 / 提交审批',
    ],
    logic: [
      '考核类型 = 模板类型（project_single/monthly/quarterly/yearly）',
      '状态流转：草稿(draft) → 待审批(pending) → 已审批(approved) / 已驳回(rejected) → 已完成(completed)',
      '合同履约类考核从「合同履约评估」入口发起，不走考核评价执行',
      '单个供应商 + 单次考核类型 + 考核周期唯一，不可重复创建',
    ],
    upstream: '考核评价模版管理、供应商列表',
    downstream: '考核评价记录',
  },
  {
    id: 'evaluation-record',
    title: '考核评价记录',
    overview: '供应商管理视角下的全类型考核评价记录查询与审批，支持多种统计分析。',
    features: [
      '全类型评估记录展示（单个项目/月度/季度/年度/合同履约）',
      '状态筛选 + 类型筛选 + 供应商搜索 + 日期范围',
      '查看评估详情（各指标得分、总分、审批历史）',
      '待审批记录审批（通过/驳回）',
      '重新提交被驳回的记录',
      'CSV导出',
      '统计卡片：总数/待审批/已通过/已驳回/平均分',
      '右侧：供应商评分排行榜、考核类型分布',
    ],
    logic: [
      '与「合约管理 > 履约评估记录」为同一组件不同入口，本入口显示全类型',
      '状态流转：草稿(draft) → 待审批(pending) → 已通过(approved) / 已驳回(rejected) → 已完成(completed)',
      '合同履约评价记录在此也可查，但合约管理入口只看合同履约',
      '统计数据基于全量记录，不受入口过滤影响',
    ],
    upstream: '考核评价执行、合同履约评估',
    downstream: '无（记录查询与审批层）',
  },
];

export default function ProcurementFunctionDocs() {
  const [activeId, setActiveId] = React.useState('plan');

  const handleScroll = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(`doc-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    const handleScrollSpy = () => {
      for (const doc of docs) {
        const element = document.getElementById(`doc-${doc.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveId(doc.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const renderStatusFlow = (logic: string[]) => {
    const flowItem = logic.find((l) => l.includes('状态流转'));
    if (!flowItem) return null;
    const parts = flowItem.replace('状态流转：', '').split('→').map((p) => p.trim());
    return (
      <div className="flex flex-wrap items-center gap-1 mt-2 mb-3">
        {parts.map((part, idx) => {
          const isError = part.includes('驳回') || part.includes('rejected') || part.includes('终止') || part.includes('terminated') || part.includes('取消') || part.includes('cancelled');
          const isSuccess = part.includes('已审批') || part.includes('approved') || part.includes('已完成') || part.includes('completed') || part.includes('已归档') || part.includes('已确认');
          const Icon = isError ? XCircle : isSuccess ? CheckCircle2 : AlertCircle;
          const color = isError ? 'text-red-500 bg-red-50 border-red-200' : isSuccess ? 'text-green-600 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200';
          return (
            <React.Fragment key={idx}>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${color}`}>
                <Icon size={12} />
                {part}
              </span>
              {idx < parts.length - 1 && <ArrowRight size={14} className="text-gray-300" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Navigation */}
      <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            功能说明
          </h2>
          <p className="text-xs text-gray-400 mt-1">招采及合约管理模块</p>
        </div>
        <nav className="p-2">
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleScroll(doc.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                activeId === doc.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {docs.map((doc) => (
            <section
              key={doc.id}
              id={`doc-${doc.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{doc.overview}</p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5">
                {/* Core Features */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    核心功能点
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {doc.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Logic */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Workflow size={14} className="text-indigo-500" />
                    业务逻辑与规则
                  </h4>
                  {renderStatusFlow(doc.logic)}
                  <ul className="space-y-2">
                    {doc.logic.filter((l) => !l.includes('状态流转')).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-amber-500 mt-0.5">
                          <AlertCircle size={14} />
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Field Selection Logic */}
                {doc.fieldLogic && doc.fieldLogic.length > 0 && (
                  <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Info size={14} className="text-indigo-500" />
                      字段选择逻辑
                    </h4>
                    <div className="space-y-4">
                      {doc.fieldLogic.map((field, fieldIdx) => (
                        <div key={fieldIdx}>
                          <div className="text-xs font-medium text-indigo-700 mb-2 flex items-center gap-1">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                            {field.field}
                          </div>
                          <div className="space-y-1.5 pl-3">
                            {field.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-start gap-2 text-xs bg-white rounded p-2 border border-gray-100">
                                <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium flex-shrink-0 min-w-fit">
                                  {opt.value}
                                </span>
                                <span className="text-gray-600 leading-relaxed">{opt.logic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Flow */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowLeft size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600 uppercase">上游数据</span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">{doc.upstream}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight size={14} className="text-green-500" />
                      <span className="text-xs font-semibold text-green-600 uppercase">下游数据</span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">{doc.downstream}</div>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Footer */}
          <div className="text-center text-sm text-gray-400 py-8">
            — 招采及合约管理模块功能说明文档 —
          </div>
        </div>
      </div>
    </div>
  );
}
