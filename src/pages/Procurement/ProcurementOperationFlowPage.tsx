import { useState } from 'react';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, FileText, Users, ClipboardCheck, DollarSign, Truck, Award,
  ArrowRight, Layers, Eye, ExternalLink, CheckCircle, AlertCircle, XCircle,
  FilePlus, ShoppingCart, Handshake, FileCheck, Box, Settings, BarChart3,
  ClipboardList, PenTool, Upload, Download, Search, Filter, Plus, Edit, Trash2,
  Send, RefreshCw, Lock, Unlock, EyeOff, History, Printer
} from 'lucide-react';

interface OperationStep {
  stepNo: number;
  title: string;
  description: string;
  operator: string; // 操作角色
  systemAction: string; // 系统动作
  businessRule?: string; // 业务规则
  prerequisite?: string; // 前置条件
  output?: string; // 产出物
  nextStep?: string; // 下一步
  exception?: string; // 异常处理
}

interface OperationFlow {
  id: string;
  moduleName: string; // 功能模块名称
  menuPath: string; // 菜单路径
  menuTitle: string; // 菜单标题
  icon: any;
  color: string;
  bg: string;
  border: string;
  description: string; // 功能概述
  businessLogic: string; // 业务逻辑说明
  steps: OperationStep[]; // 操作步骤
  keyFields: string[]; // 关键字段
  statusFlow: { status: string; label: string; color: string; description: string }[]; // 状态流转
  relatedModules: string[]; // 关联模块
  tips: string[]; // 使用提示
}

const operationFlows: OperationFlow[] = [
  {
    id: 'plan',
    moduleName: '招采计划',
    menuPath: '/procurement/plan',
    menuTitle: '招采计划',
    icon: Calendar,
    color: 'text-[#409eff]',
    bg: 'bg-[#ecf5ff]',
    border: 'border-[#91c5ff]',
    description: '编制年度/月度采购计划，明确采购物资、预算金额、采购方式，并完成审批流程。',
    businessLogic: '采购计划是采购执行的依据，需经过部门负责人/管理层审批后方可生效。计划审批通过后，可作为采购需求申请的来源引用。',
    steps: [
      { stepNo: 1, title: '新增计划', description: '点击「新增计划」按钮，填写计划基本信息（计划名称、计划期间、采购类型等）', operator: '采购专员', systemAction: '生成计划编号，初始化草稿状态', businessRule: '计划期间通常为年度或月度', output: '草稿计划记录' },
      { stepNo: 2, title: '添加物资明细', description: '在明细表中添加采购物资（物资编码、名称、规格、数量、预算单价、采购方式）', operator: '采购专员', systemAction: '自动计算明细金额和计划总金额', businessRule: '采购方式可选：公开招标、邀请招标、竞争性谈判、询价采购、单一来源', prerequisite: '至少添加一条物资明细', output: '完整物资明细表' },
      { stepNo: 3, title: '提交审批', description: '确认计划内容无误后，点击「提交审批」', operator: '采购专员', systemAction: '状态变更为「待审批」，记录提交时间和提交人', businessRule: '提交前必须填写计划名称和至少一条明细', nextStep: '等待审批' },
      { stepNo: 4, title: '审批通过/驳回', description: '部门负责人或管理层查看计划详情，决定通过或驳回', operator: '审批人', systemAction: '通过：状态变更为「已生效」；驳回：状态变更为「已驳回」，记录审批意见', businessRule: '审批人可查看计划明细、预算金额、采购方式合理性', exception: '驳回后可修改后重新提交', output: '已生效/已驳回计划' },
      { stepNo: 5, title: '计划引用', description: '已生效计划可作为采购需求申请的来源引用', operator: '采购专员', systemAction: '在需求申请时可选择关联计划', businessRule: '引用计划后，需求物资自动从计划明细带入', nextStep: '采购需求申请' },
    ],
    keyFields: ['计划编号', '计划名称', '计划期间', '采购类型', '物资明细', '预算金额', '审批状态'],
    statusFlow: [
      { status: 'draft', label: '草稿', color: 'text-[#909399]', description: '新增后初始状态，可编辑修改' },
      { status: 'pending', label: '待审批', color: 'text-[#e6a23c]', description: '已提交审批，等待审批人处理' },
      { status: 'approved', label: '已生效', color: 'text-[#67c23a]', description: '审批通过，可作为需求来源引用' },
      { status: 'rejected', label: '已驳回', color: 'text-[#f56c6c]', description: '审批驳回，可修改后重新提交' },
    ],
    relatedModules: ['招采计划汇总', '招采需求申请管理'],
    tips: ['计划审批通过后不可修改，如需调整请发起变更申请', '计划总金额 = 各明细预算金额之和', '建议按年度/月度编制计划，便于后续汇总统计'],
  },
  {
    id: 'demand',
    moduleName: '招采需求申请管理',
    menuPath: '/procurement/demand',
    menuTitle: '招采需求申请管理',
    icon: FilePlus,
    color: 'text-[#fa8c16]',
    bg: 'bg-[#fdf6ec]',
    border: 'border-[#f5dab1]',
    description: '各部门提交采购需求申请，明确采购物资、数量、预算，并完成审批流程。',
    businessLogic: '需求申请可从采购计划引用或独立创建。审批通过后，需求进入招采工单生成环节。',
    steps: [
      { stepNo: 1, title: '新增需求', description: '点击「新增需求」，填写需求基本信息（需求类型、项目名称、申请部门、申请人）', operator: '需求申请人', systemAction: '生成需求编号，初始化草稿状态', businessRule: '需求类型可选：物资采购、服务采购、工程项目', output: '草稿需求记录' },
      { stepNo: 2, title: '选择物资来源', description: '选择物资来源：从采购计划引用 或 从物资库选择', operator: '需求申请人', systemAction: '引用计划：自动带入计划明细；物资库：手动选择物资', businessRule: '引用计划时，物资明细自动锁定', prerequisite: '必须选择至少一条物资', output: '物资明细表' },
      { stepNo: 3, title: '填写采购申请信息', description: '填写采购申请单价（含税）、数量，系统自动计算含税金额、不含税金额、税额', operator: '需求申请人', systemAction: '自动计算金额，税率默认13%', businessRule: '含税金额 = 数量 × 采购申请单价（含税）；税额 = 含税金额 / (1+税率) × 税率', output: '完整需求明细' },
      { stepNo: 4, title: '提交审批', description: '确认需求内容后，点击「提交审批」', operator: '需求申请人', systemAction: '状态变更为「待审批」', businessRule: '提交前必须填写物资明细和采购申请单价', nextStep: '等待审批' },
      { stepNo: 5, title: '审批通过/驳回', description: '审批人审核需求合理性，决定通过或驳回', operator: '审批人', systemAction: '通过：状态变更为「已通过」；驳回：状态变更为「已驳回」', businessRule: '审批人可查看需求明细、预算金额、采购方式', exception: '驳回后可修改重新提交', output: '已通过/已驳回需求' },
      { stepNo: 6, title: '生成招采工单', description: '已通过需求可生成招采工单', operator: '采购专员', systemAction: '点击「生成工单」，自动创建招采工单并关联需求', businessRule: '工单物资明细从需求带入', nextStep: '招采工单' },
    ],
    keyFields: ['需求编号', '需求类型', '项目名称', '申请部门', '物资明细', '采购申请单价', '含税金额', '审批状态'],
    statusFlow: [
      { status: 'draft', label: '草稿', color: 'text-[#909399]', description: '新增后初始状态，可编辑修改' },
      { status: 'pending', label: '待审批', color: 'text-[#e6a23c]', description: '已提交审批，等待审批人处理' },
      { status: 'approved', label: '已通过', color: 'text-[#67c23a]', description: '审批通过，可生成招采工单' },
      { status: 'rejected', label: '已驳回', color: 'text-[#f56c6c]', description: '审批驳回，可修改重新提交' },
      { status: 'changed', label: '已变更', color: 'text-[#409eff]', description: '已通过后发起变更申请' },
    ],
    relatedModules: ['招采计划', '招采工单'],
    tips: ['引用采购计划时，物资明细自动带入且不可修改', '含税金额、税额由系统自动计算，无需手动填写', '审批通过后如需调整，请发起变更申请'],
  },
  {
    id: 'bidding',
    moduleName: '招采工单',
    menuPath: '/procurement/bidding',
    menuTitle: '招采工单',
    icon: ClipboardList,
    color: 'text-[#67c23a]',
    bg: 'bg-[#f0f9eb]',
    border: 'border-[#c2e7b0]',
    description: '管理招采工单的创建、发布、报价收集、评审、成交确认全流程。',
    businessLogic: '招采工单是采购执行的核心载体，包含物资明细、单品上限、整单上限、受邀供应商、报价对比、成交确认等关键信息。',
    steps: [
      { stepNo: 1, title: '新增工单', description: '点击「新增工单」，填写工单基本信息（工单名称、工单类型、关联需求）', operator: '采购专员', systemAction: '生成工单编号，初始化草稿状态', businessRule: '工单类型：市场采购、库内采购', output: '草稿工单' },
      { stepNo: 2, title: '设置单品上限', description: '为每条物资明细设置单品上限单价（供应商报价不得超过此上限）', operator: '采购专员', systemAction: '自动计算上限小计和整单上限', businessRule: '单品上限 = 成本审核单价（含税）或市场询价上限', prerequisite: '必须设置单品上限', output: '完整上限设置' },
      { stepNo: 3, title: '选择受邀供应商', description: '从供应商库中选择受邀参与报价的供应商（至少3家）', operator: '采购专员', systemAction: '记录受邀供应商ID列表', businessRule: '公开招标可不限制供应商；邀请招标至少3家', output: '受邀供应商名单' },
      { stepNo: 4, title: '发布工单', description: '点击「发布」，工单状态变更为「已发布」，供应商可开始报价', operator: '采购专员', systemAction: '状态变更为「已发布」，记录发布时间', businessRule: '发布前必须设置单品上限和受邀供应商', nextStep: '供应商报价' },
      { stepNo: 5, title: '供应商报价', description: '供应商登录系统，查看工单明细，提交报价（单价、税率、交货日期）', operator: '供应商', systemAction: '生成报价单，计算含税金额、税额，判断是否超限', businessRule: '报价单价超过单品上限标记为「超出」；报价总额超过整单上限标记为「超出」', output: '报价单记录' },
      { stepNo: 6, title: '报价对比', description: '采购专员查看报价对比表，对比各供应商单价、总价、是否超限', operator: '采购专员', systemAction: '按物资维度横向对比，标注最低价', businessRule: '最低价供应商优先成交；相同最低价需抽签', output: '报价对比表' },
      { stepNo: 7, title: '成交确认', description: '点击「采纳」确认成交供应商，或触发抽签（多家相同最低价）', operator: '采购专员', systemAction: '记录成交供应商ID、成交时间，状态变更为「已评审」', businessRule: '采纳后报价单状态变更为「已采纳」', exception: '多家相同最低价时触发抽签，系统随机选择', output: '成交供应商确认' },
      { stepNo: 8, title: '上传评定结果', description: '上传竞价小组评定结果附件（评审报告、比价记录等）', operator: '采购专员', systemAction: '附件保存到工单记录', businessRule: '评定结果附件作为审计依据', output: '评定结果附件' },
      { stepNo: 9, title: '完成工单', description: '点击「完成」，工单状态变更为「已完成」', operator: '采购专员', systemAction: '状态变更为「已完成」，记录完成时间', businessRule: '完成后可生成合同台账', nextStep: '合同台账' },
    ],
    keyFields: ['工单编号', '工单名称', '物资明细', '单品上限', '整单上限', '受邀供应商', '报价对比', '成交供应商', '评定结果附件'],
    statusFlow: [
      { status: 'draft', label: '草稿', color: 'text-[#909399]', description: '新增后初始状态，可编辑修改' },
      { status: 'published', label: '已发布', color: 'text-[#409eff]', description: '已发布，供应商可报价' },
      { status: 'bidding', label: '招标中', color: 'text-[#e6a23c]', description: '供应商报价进行中' },
      { status: 'evaluated', label: '已评审', color: 'text-[#67c23a]', description: '成交供应商已确认' },
      { status: 'completed', label: '已完成', color: 'text-[#67c23a]', description: '工单完成，可生成合同' },
    ],
    relatedModules: ['招采需求申请管理', '报价单', '合同台账'],
    tips: ['单品上限是供应商报价的硬性约束，超过上限自动标记为「不符合」', '多家供应商相同最低价时，系统自动触发抽签', '评定结果附件务必上传，作为审计依据'],
  },
  {
    id: 'quote',
    moduleName: '报价单',
    menuPath: '/procurement/quote',
    menuTitle: '报价单',
    icon: DollarSign,
    color: 'text-[#f56c6c]',
    bg: 'bg-[#fef0f0]',
    border: 'border-[#fbc4c4]',
    description: '管理供应商提交的报价单，支持按报价单和按物资两种视图查看。',
    businessLogic: '报价单是供应商对招采工单的响应，包含物资明细报价、税率、交货日期。系统自动判断是否超限。',
    steps: [
      { stepNo: 1, title: '查看报价单列表', description: '切换「按报价单」或「按物资（推荐）」视图', operator: '采购专员', systemAction: '按报价单：列出所有报价单；按物资：按物资维度横向对比', businessRule: '按物资视图便于横向对比单价', output: '报价列表' },
      { stepNo: 2, title: '查看报价详情', description: '点击「查看详情」，查看报价单完整信息（供应商、税率、明细、是否超限）', operator: '采购专员', systemAction: '弹窗展示报价详情，标注最低价', output: '报价详情弹窗' },
      { stepNo: 3, title: '报价对比', description: '点击「报价对比」，横向对比同一物资各供应商报价', operator: '采购专员', systemAction: '生成对比表，标注最低价、差价', businessRule: '最低价标注绿色，超限标注红色', output: '报价对比表' },
      { stepNo: 4, title: '采纳报价', description: '点击「采纳」，确认该报价单为成交供应商', operator: '采购专员', systemAction: '报价单状态变更为「已采纳」，工单记录成交供应商', businessRule: '采纳后其他报价单自动标记为「未中标」', exception: '多家相同最低价触发抽签', output: '成交确认' },
      { stepNo: 5, title: '驳回报价', description: '点击「驳回」，拒绝该报价单', operator: '采购专员', systemAction: '报价单状态变更为「已驳回」', businessRule: '驳回后供应商可重新报价（如工单仍在报价期）', output: '驳回记录' },
      { stepNo: 6, title: '回写工单', description: '点击「回写工单」，将报价信息回写到招采工单', operator: '采购专员', systemAction: '报价明细回写到工单报价记录', businessRule: '回写后工单可查看完整报价信息', output: '工单报价记录' },
    ],
    keyFields: ['报价单编号', '招采工单', '供应商', '税率', '含税金额', '税额', '是否超限', '报价状态'],
    statusFlow: [
      { status: 'submitted', label: '已提交', color: 'text-[#e6a23c]', description: '供应商已提交报价' },
      { status: 'accepted', label: '已采纳', color: 'text-[#67c23a]', description: '已确认为成交供应商' },
      { status: 'rejected', label: '已驳回', color: 'text-[#f56c6c]', description: '报价被拒绝' },
    ],
    relatedModules: ['招采工单', '供应商列表'],
    tips: ['按物资视图更便于横向对比各供应商报价', '采纳报价后，系统自动回写成交供应商到工单', '税率差异会影响税额计算，需注意对比'],
  },
  {
    id: 'order',
    moduleName: '招采订单管理',
    menuPath: '/procurement/order',
    menuTitle: '招采订单管理',
    icon: ShoppingCart,
    color: 'text-[#9b59b6]',
    bg: 'bg-[#f4ecf7]',
    border: 'border-[#d7bde2]',
    description: '管理招采订单的创建、审批、发送、变更全流程。',
    businessLogic: '招采订单可从需求申请或合同生成，包含物资明细、供应商、价格、交货日期。审批通过后发送给供应商执行。',
    steps: [
      { stepNo: 1, title: '新增订单', description: '点击「新增订单」，选择订单来源类型（框架合同/单次采购）', operator: '采购专员', systemAction: '生成订单编号，初始化草稿状态', businessRule: '框架合同：从需求/合同生成；单次采购：无框架合同', output: '草稿订单' },
      { stepNo: 2, title: '选择来源', description: '选择需求申请或合同，自动带入物资明细和供应商信息', operator: '采购专员', systemAction: '弹窗选择需求/合同，自动带入明细', businessRule: '从合同带入时，价格锁定不可修改', prerequisite: '必须选择来源', output: '订单明细' },
      { stepNo: 3, title: '填写订单信息', description: '填写交货日期、备注等信息', operator: '采购专员', systemAction: '记录订单信息', businessRule: '交货日期必须填写', output: '完整订单' },
      { stepNo: 4, title: '提交审批', description: '点击「提交审批」，订单进入审批流程', operator: '采购专员', systemAction: '状态变更为「待审批」', businessRule: '提交前必须有明细和供应商', nextStep: '等待审批' },
      { stepNo: 5, title: '审批通过/驳回', description: '审批人审核订单合理性，决定通过或驳回', operator: '审批人', systemAction: '通过：状态变更为「已审批」；驳回：状态变更为「已驳回」', businessRule: '审批人可查看订单明细、价格、供应商', exception: '驳回后可修改重新提交', output: '已审批/已驳回订单' },
      { stepNo: 6, title: '发送订单', description: '点击「发送订单」，订单发送给供应商', operator: '采购专员', systemAction: '状态变更为「已发送」，记录发送时间', businessRule: '发送后供应商可查看订单', nextStep: '供应商确认' },
      { stepNo: 7, title: '订单变更', description: '如需调整订单内容，点击「发起变更」', operator: '采购专员', systemAction: '生成变更申请，原订单锁定', businessRule: '变更需审批通过后才生效', exception: '变更驳回后原订单解锁', output: '变更记录' },
      { stepNo: 8, title: '完成订单', description: '订单执行完毕后，点击「完成」', operator: '采购专员', systemAction: '状态变更为「已完成」', businessRule: '完成后可生成入库单', nextStep: '入库管理' },
    ],
    keyFields: ['订单编号', '订单来源', '供应商', '物资明细', '价格', '交货日期', '审批状态', '发送状态'],
    statusFlow: [
      { status: 'draft', label: '草稿', color: 'text-[#909399]', description: '新增后初始状态，可编辑修改' },
      { status: 'pending', label: '待审批', color: 'text-[#e6a23c]', description: '已提交审批，等待审批人处理' },
      { status: 'approved', label: '已审批', color: 'text-[#67c23a]', description: '审批通过，可发送给供应商' },
      { status: 'sent', label: '已发送', color: 'text-[#409eff]', description: '已发送给供应商执行' },
      { status: 'completed', label: '已完成', color: 'text-[#67c23a]', description: '订单执行完毕' },
      { status: 'cancelled', label: '已取消', color: 'text-[#f56c6c]', description: '订单取消' },
    ],
    relatedModules: ['招采需求申请管理', '合同台账', '入库管理'],
    tips: ['从合同生成订单时，价格自动锁定不可修改', '订单变更需审批，审批通过后自动更新原订单', '发送订单后，供应商可在APP查看订单'],
  },
  {
    id: 'contract',
    moduleName: '合同台账',
    menuPath: '/procurement/contract',
    menuTitle: '合同台账',
    icon: Handshake,
    color: 'text-[#8e44ad]',
    bg: 'bg-[#f5f0fa]',
    border: 'border-[#d4b8e8]',
    description: '管理合同的创建、审批、执行、终止全生命周期。',
    businessLogic: '合同台账可从招采工单生成或独立创建，包含合同基本信息、对方单位、金额、签订日期、履行情况等。',
    steps: [
      { stepNo: 1, title: '新增合同', description: '点击「新增合同」，填写合同基本信息（合同编码、名称、分类、类型）', operator: '合同管理员', systemAction: '生成合同编号，初始化草稿状态', businessRule: '分类可选：展览服务、展览展示、招采合同、招商合同、其他', output: '草稿合同' },
      { stepNo: 2, title: '关联招采工单', description: '点击「选择工单」，从已完成工单中选择，自动带入项目名称、供应商信息', operator: '合同管理员', systemAction: '弹窗选择工单，自动带入信息', businessRule: '工单确认供应商自动带入对方单位', output: '关联工单信息' },
      { stepNo: 3, title: '填写合同详情', description: '填写对方单位、金额、签订日期、生效日期、终止日期、主要内容等', operator: '合同管理员', systemAction: '记录合同详情', businessRule: '金额、签订日期必须填写', output: '完整合同' },
      { stepNo: 4, title: '提交审批', description: '点击「提交审批」，合同进入审批流程', operator: '合同管理员', systemAction: '状态变更为「待审批」', businessRule: '提交前必须填写合同名称和金额', nextStep: '等待审批' },
      { stepNo: 5, title: '审批通过', description: '审批人审核合同内容，决定通过', operator: '审批人', systemAction: '状态变更为「已审批」', businessRule: '审批通过后合同可执行', output: '已审批合同' },
      { stepNo: 6, title: '合同执行', description: '合同进入执行阶段，记录履行情况、付款情况', operator: '合同管理员', systemAction: '状态变更为「执行中」，记录履行情况', businessRule: '执行中合同可生成招采订单，价格从合同带入', output: '执行中合同' },
      { stepNo: 7, title: '合同中止', description: '如需暂停合同执行，点击「中止合同」', operator: '合同管理员', systemAction: '提交中止申请，状态变更为「待审批」', businessRule: '中止需审批，审批通过后合同暂停执行', exception: '中止后可恢复执行', output: '中止记录' },
      { stepNo: 8, title: '合同终止', description: '合同到期或提前终止，点击「终止合同」', operator: '合同管理员', systemAction: '状态变更为「已终止」，记录终止原因', businessRule: '终止为不可逆操作', exception: '终止后合同不可再用于采购', output: '终止合同' },
    ],
    keyFields: ['合同编码', '合同名称', '分类', '对方单位', '金额', '签订日期', '生效日期', '终止日期', '履行情况', '关联工单'],
    statusFlow: [
      { status: 'draft', label: '草稿', color: 'text-[#909399]', description: '新增后初始状态，可编辑修改' },
      { status: 'pending', label: '待审批', color: 'text-[#e6a23c]', description: '已提交审批，等待审批人处理' },
      { status: 'approved', label: '已审批', color: 'text-[#409eff]', description: '审批通过，可进入执行' },
      { status: 'active', label: '执行中', color: 'text-[#67c23a]', description: '合同正在执行' },
      { status: 'expired', label: '已到期', color: 'text-[#909399]', description: '合同到期' },
      { status: 'terminated', label: '已终止', color: 'text-[#f56c6c]', description: '合同提前终止' },
    ],
    relatedModules: ['招采工单', '招采订单管理'],
    tips: ['关联招采工单后，项目名称、供应商信息自动带入', '合同终止为不可逆操作，请谨慎操作', '执行中合同可生成招采订单，价格从合同带入'],
  },
  {
    id: 'supplier',
    moduleName: '供应商列表',
    menuPath: '/procurement/supplier',
    menuTitle: '供应商列表',
    icon: Users,
    color: 'text-[#2ecc71]',
    bg: 'bg-[#e8f8f0]',
    border: 'border-[#a3e4c7]',
    description: '管理供应商档案、资质、评估、准入/退出。',
    businessLogic: '供应商是采购执行的合作方，需经过准入审核后方可参与报价。供应商状态影响报价资格。',
    steps: [
      { stepNo: 1, title: '新增供应商', description: '点击「新增供应商」，填写供应商基本信息（名称、类型、联系人、电话、地址）', operator: '供应商管理员', systemAction: '生成供应商编号，初始化「待审核」状态', businessRule: '供应商类型可选：生产商、经销商、服务商', output: '待审核供应商' },
      { stepNo: 2, title: '上传资质文件', description: '上传供应商资质文件（营业执照、资质证书、产品认证等）', operator: '供应商管理员', systemAction: '附件保存到供应商记录', businessRule: '资质文件作为准入审核依据', output: '资质文件' },
      { stepNo: 3, title: '准入审核', description: '点击「准入审核」，审核供应商资质', operator: '审核人', systemAction: '通过：状态变更为「已准入」；驳回：状态变更为「已驳回」', businessRule: '准入后供应商可参与报价', exception: '驳回后可补充资质重新申请', output: '已准入/已驳回供应商' },
      { stepNo: 4, title: '供应商评估', description: '定期对供应商进行绩效评估（质量、交货、服务、价格）', operator: '采购专员', systemAction: '记录评估结果，计算综合评分', businessRule: '评估结果影响供应商等级', output: '评估记录' },
      { stepNo: 5, title: '供应商退出', description: '如供应商不再合作，点击「退出」', operator: '供应商管理员', systemAction: '状态变更为「已退出」', businessRule: '退出后供应商不可参与报价', output: '退出供应商' },
    ],
    keyFields: ['供应商编号', '名称', '类型', '联系人', '电话', '状态', '资质文件', '评估结果'],
    statusFlow: [
      { status: 'pending', label: '待审核', color: 'text-[#e6a23c]', description: '新增后等待准入审核' },
      { status: 'enabled', label: '已准入', color: 'text-[#67c23a]', description: '准入通过，可参与报价' },
      { status: 'disabled', label: '已退出', color: 'text-[#909399]', description: '退出，不可参与报价' },
    ],
    relatedModules: ['招采工单', '报价单'],
    tips: ['供应商准入后方可参与报价', '定期评估供应商绩效，影响供应商等级', '退出后供应商不可再参与报价'],
  },
];

export default function ProcurementOperationFlowPage() {
  const navigate = useNavigate();
  const [selectedFlow, setSelectedFlow] = useState<OperationFlow | null>(null);

  return (
    <div className="p-4 space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#303133]">招采合约管理功能操作流程</h1>
          <p className="text-xs text-[#909399] mt-1">
            本页面展示招采合约管理模块各功能的详细操作流程与业务逻辑说明，点击卡片查看完整流程。
          </p>
        </div>
      </div>

      {/* 功能模块卡片网格 */}
      <div className="grid grid-cols-3 gap-4">
        {operationFlows.map((flow) => (
          <div
            key={flow.id}
            className={'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ' + flow.bg + ' ' + flow.border}
            onClick={() => setSelectedFlow(flow)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={'w-10 h-10 rounded-lg flex items-center justify-center ' + flow.bg}>
                <flow.icon className={'w-5 h-5 ' + flow.color} />
              </div>
              <div>
                <div className={'font-semibold text-sm ' + flow.color}>{flow.moduleName}</div>
                <div className="text-xs text-[#909399]">{flow.menuTitle}</div>
              </div>
            </div>
            <div className="text-xs text-[#606266] mb-3 line-clamp-2">{flow.description}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#909399]">操作步骤：{flow.steps.length} 步</div>
              <PrimaryButton size="small" onClick={() => setSelectedFlow(flow)}>查看流程</PrimaryButton>
            </div>
          </div>
        ))}
      </div>

      {/* 详细流程弹窗 */}
      <Modal
        open={!!selectedFlow}
        title={selectedFlow ? selectedFlow.moduleName + ' · 操作流程详解' : ''}
        onClose={() => setSelectedFlow(null)}
        footer={
          <div className="flex justify-between">
            <DefaultButton onClick={() => setSelectedFlow(null)}>关闭</DefaultButton>
            {selectedFlow && (
              <PrimaryButton onClick={() => navigate(selectedFlow.menuPath)}>
                进入功能 <ExternalLink className="w-4 h-4 ml-1" />
              </PrimaryButton>
            )}
          </div>
        }
        width="1100px"
      >
        {selectedFlow && (
          <div className="space-y-4 text-xs">
            {/* 功能概述与业务逻辑 */}
            <div className="grid grid-cols-2 gap-3">
              <div className={'p-3 rounded border ' + selectedFlow.bg + ' ' + selectedFlow.border}>
                <div className="font-semibold mb-2 text-[#303133]">📋 功能概述</div>
                <div className="text-[#606266]">{selectedFlow.description}</div>
              </div>
              <div className="p-3 rounded border border-[#e6a23c] bg-[#fdf6ec]">
                <div className="font-semibold mb-2 text-[#303133]">⚙️ 业务逻辑</div>
                <div className="text-[#606266]">{selectedFlow.businessLogic}</div>
              </div>
            </div>

            {/* 操作步骤流程图 */}
            <div>
              <div className="font-semibold mb-2 text-[#303133]">🔄 操作步骤流程</div>
              <div className="border border-[#dcdfe6] rounded p-3 bg-[#f5f7fa] overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  {selectedFlow.steps.map((step, idx) => (
                    <div key={step.stepNo} className="flex items-center gap-2">
                      <div className={'flex flex-col items-center p-3 rounded-lg border min-w-[140px] ' + selectedFlow.bg + ' ' + selectedFlow.border}>
                        <div className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ' + selectedFlow.bg + ' ' + selectedFlow.color}>
                          {step.stepNo}
                        </div>
                        <div className={'font-semibold mt-1 text-center ' + selectedFlow.color}>{step.title}</div>
                        <div className="text-[#909399] text-center mt-1 line-clamp-2" style={{ maxWidth: 120 }}>{step.description}</div>
                        <div className="text-[#606266] mt-1 text-center">👤 {step.operator}</div>
                      </div>
                      {idx < selectedFlow.steps.length - 1 && (
                        <ArrowRight className={'w-5 h-5 ' + selectedFlow.color} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 步骤详情表 */}
            <div>
              <div className="font-semibold mb-2 text-[#303133]">📝 步骤详情</div>
              <div className="border border-[#dcdfe6] rounded overflow-auto max-h-64">
                <table className="w-full">
                  <thead className="bg-[#f5f7fa] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">步骤</th>
                      <th className="px-3 py-2 text-left">操作说明</th>
                      <th className="px-3 py-2 text-left">操作角色</th>
                      <th className="px-3 py-2 text-left">系统动作</th>
                      <th className="px-3 py-2 text-left">业务规则</th>
                      <th className="px-3 py-2 text-left">产出物</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFlow.steps.map((step) => (
                      <tr key={step.stepNo} className="border-t border-[#ebeef5]">
                        <td className="px-3 py-2 font-semibold">{step.stepNo}. {step.title}</td>
                        <td className="px-3 py-2">{step.description}</td>
                        <td className="px-3 py-2">{step.operator}</td>
                        <td className="px-3 py-2 text-[#409eff]">{step.systemAction}</td>
                        <td className="px-3 py-2 text-[#e6a23c]">{step.businessRule || '-'}</td>
                        <td className="px-3 py-2 text-[#67c23a]">{step.output || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 状态流转 */}
            <div>
              <div className="font-semibold mb-2 text-[#303133]">📊 状态流转</div>
              <div className="flex items-center gap-2">
                {selectedFlow.statusFlow.map((s, idx) => (
                  <div key={s.status} className="flex items-center gap-2">
                    <div className={'px-3 py-1 rounded-full text-xs font-medium ' + s.color + ' bg-[#f5f7fa] border'}>
                      {s.label}
                    </div>
                    {idx < selectedFlow.statusFlow.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-[#909399]" />
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {selectedFlow.statusFlow.map((s) => (
                  <div key={s.status} className={'p-2 rounded border ' + s.color.replace('text-', 'border-')}>
                    <div className={'font-semibold ' + s.color}>{s.label}</div>
                    <div className="text-[#909399]">{s.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 关键字段 */}
            <div>
              <div className="font-semibold mb-2 text-[#303133]">🔑 关键字段</div>
              <div className="flex flex-wrap gap-2">
                {selectedFlow.keyFields.map((field) => (
                  <div key={field} className={'px-2 py-1 rounded text-xs ' + selectedFlow.bg + ' ' + selectedFlow.color}>
                    {field}
                  </div>
                ))}
              </div>
            </div>

            {/* 关联模块 */}
            <div>
              <div className="font-semibold mb-2 text-[#303133]">🔗 关联模块</div>
              <div className="flex flex-wrap gap-2">
                {selectedFlow.relatedModules.map((mod) => (
                  <div key={mod} className="px-2 py-1 rounded text-xs bg-[#f5f7fa] border border-[#dcdfe6]">
                    {mod}
                  </div>
                ))}
              </div>
            </div>

            {/* 使用提示 */}
            <div className="p-3 rounded border border-[#67c23a] bg-[#f0f9eb]">
              <div className="font-semibold mb-2 text-[#67c23a]">💡 使用提示</div>
              <ul className="space-y-1">
                {selectedFlow.tips.map((tip, idx) => (
                  <li key={idx} className="text-[#606266]">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}