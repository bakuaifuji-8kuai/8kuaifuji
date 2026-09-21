// ============================================================================
// 招采全链路 Demo 数据 v2（2026-09-17 重建）
// 完整链路：Supplier → Plan → Demand → Bidding → SupplierQuote → Contract → Order → Inspection → Evaluation
// 一切数据皆有源，上下游严格闭环
// ============================================================================

import type {
  Supplier,
  ProcurementPlan,
  ProcurementDemand,
  Bidding,
  SupplierQuote,
  ContractLedger,
  ContractPurchaseOrder,
  ProcurementInspection,
  EvaluationTemplate,
  EvaluationRecord,
  EvaluationIndicator,
} from '@/types';

// ============================================================================
// 0. 供应商（基础数据，所有招采实体引用）
// ============================================================================

export const suppliers: Supplier[] = [
  { id: 'SUP-001', code: 'SUP-CG-001', name: '晨光办公用品有限公司', contact: '张经理', phone: '0731-88881001', address: '湖南省长沙市岳麓区麓谷工业园', status: 'enabled', unifiedSocialCreditCode: '91430100MA1ABCDE01', businessScope: '办公用品、文化用品生产销售', createTime: '2024-03-15 10:00:00', creator: '系统' },
  { id: 'SUP-002', code: 'SUP-CG-002', name: '华展展览服务有限公司', contact: '李总', phone: '0731-88881002', address: '湖南省长沙市雨花区环保科技园', status: 'enabled', unifiedSocialCreditCode: '91430100MA1ABCDE02', businessScope: '展览展示设计搭建服务', createTime: '2024-05-20 10:00:00', creator: '系统' },
  { id: 'SUP-003', code: 'SUP-CG-003', name: '华东物资供应有限公司', contact: '王工', phone: '0731-88881003', address: '江苏省南京市江宁区经济开发区', status: 'enabled', unifiedSocialCreditCode: '91320100MA1ABCDE03', businessScope: '网络设备、电子产品销售安装', createTime: '2024-01-10 10:00:00', creator: '系统' },
  { id: 'SUP-004', code: 'SUP-CG-004', name: '新视觉广告制作有限公司', contact: '赵姐', phone: '0731-88881004', address: '湖南省长沙市天心区芙蓉南路', status: 'enabled', unifiedSocialCreditCode: '91430100MA1ABCDE04', businessScope: '广告设计制作、物料印刷', createTime: '2024-08-05 10:00:00', creator: '系统' },
  { id: 'SUP-005', code: 'SUP-CG-005', name: '湖南华信会计师事务所', contact: '刘会计师', phone: '0731-88881005', address: '湖南省长沙市开福区万达广场', status: 'enabled', unifiedSocialCreditCode: '91430100MA1ABCDE05', businessScope: '财务审计、税务咨询', createTime: '2025-01-20 10:00:00', creator: '系统' },
  { id: 'SUP-006', code: 'SUP-CG-006', name: '鼎盛餐饮管理有限公司', contact: '孙经理', phone: '0731-88881006', address: '湖南省长沙市岳麓区观沙岭', status: 'enabled', unifiedSocialCreditCode: '91430100MA1ABCDE06', businessScope: '餐饮服务、食材供应', createTime: '2025-06-10 10:00:00', creator: '系统' },
  { id: 'SUP-007', code: 'SUP-CG-007', name: '某倒闭的供应商', contact: '-', phone: '-', address: '-', status: 'disabled', createTime: '2026-01-01 10:00:00', creator: '系统' },
];

// ============================================================================
// 1. 招采计划（最上游）
// ============================================================================

export const procurementPlans: ProcurementPlan[] = [
  {
    id: 'PP-001', planNo: 'PP-2026-Q4-001',     year: '2026', department: '采购部', planType: 'annual', status: 'approved',
    creator: '张三', createTime: '2026-08-15 09:00:00',
    details: [
      { id: 'PPD-001', planId: 'PP-001', seq: 1, projectName: '2026年秋季办公用品集中采购', projectNature: '物资', projectOverview: 'Q4办公用品框架合同内集中采购', budgetAmount: 120, planProcurementStartDate: '2026-08-20', planProcurementEndDate: '2026-08-25', approvalDate: '2026-08-18', approvalFileNo: 'PR-202609001' },
      { id: 'PPD-002', planId: 'PP-001', seq: 2, projectName: '国际会展中心展台设计搭建', projectNature: '服务', projectOverview: '2026国际会展中心展会36㎡特装展台', budgetAmount: 48, planProcurementStartDate: '2026-09-10', planProcurementEndDate: '2026-09-20', approvalDate: '2026-09-08', approvalFileNo: 'PR-202609002' },
      { id: 'PPD-003', planId: 'PP-001', seq: 3, projectName: '展会物料制作及运输', projectNature: '物资', projectOverview: '年度展会宣传物料设计制作及现场运输安装', budgetAmount: 41.5, planProcurementStartDate: '2026-09-15', planProcurementEndDate: '2026-10-15', approvalDate: '2026-09-14' },
    ],
  },
  {
    id: 'PP-002', planNo: 'PP-2026-Q4-002',     year: '2026', department: '技术部', planType: 'monthly', status: 'approved',
    creator: '孙八', createTime: '2026-08-20 10:00:00',
    details: [
      { id: 'PPD-004', planId: 'PP-002', seq: 1, projectName: '新办公区综合布线及网络改造', projectNature: '工程', projectOverview: '10F-15F综合布线、机房建设、网络设备安装', budgetAmount: 125, planProcurementStartDate: '2026-09-01', planProcurementEndDate: '2026-09-30', approvalDate: '2026-08-25', approvalFileNo: 'PR-202609003' },
    ],
  },
  {
    id: 'PP-003', planNo: 'PP-2026-Q4-003',     year: '2026', department: '财务部', planType: 'annual', status: 'approved',
    creator: '钱六', createTime: '2025-11-15 09:00:00',
    details: [
      { id: 'PPD-005', planId: 'PP-003', seq: 1, projectName: '2026年度财务报表审计', projectNature: '服务', projectOverview: '年度财务审计及内控咨询服务', budgetAmount: 12, approvalDate: '2025-12-20' },
    ],
  },
  {
    id: 'PP-004', planNo: 'PP-2026-Q4-004',     year: '2026', department: '行政部', planType: 'annual', status: 'pending',
    creator: '周八', createTime: '2026-09-10 14:00:00',
    details: [
      { id: 'PPD-006', planId: 'PP-004', seq: 1, projectName: '员工餐厅食材框架采购', projectNature: '物资', projectOverview: '2027年度员工餐厅食材供应框架合同', budgetAmount: 80 },
    ],
  },
  {
    id: 'PP-005', planNo: 'PP-2026-Q4-005',     year: '2026', department: 'IT部', planType: 'monthly', status: 'archived',
    creator: '吴十', createTime: '2026-08-15 11:00:00',
    details: [
      { id: 'PPD-007', planId: 'PP-005', seq: 1, projectName: '服务器运维托管服务', projectNature: '服务', projectOverview: '7x24小时服务器运维托管服务', budgetAmount: 32, approvalDate: '2026-08-18' },
    ],
  },
];

// ============================================================================
// 2. 招采需求申请/确认（5条完整链路 + 2条草稿/驳回）
// ============================================================================

export const procurementDemands: ProcurementDemand[] = [
  // ===== 链路 A：办公用品（清单内 + 会议审批 + confirm_approved）=====
  {
    id: 'PD-001', demandNo: 'PD-202609001', demandType: 'material',
    businessCategory: 'non_engineering', subType: 'goods',
    procurementType: 'within_framework', procurementMode: 'meeting',
    applicant: '赵六', applicantDept: '行政部', applyDate: '2026-09-01',
    projectName: '2026年秋季办公用品集中采购',
    projectDescription: '全集团Q4办公用品框架合同内集中采购',
    technicalRequirements: '严格按框架合同目录内规格型号',
    estimatedAmount: 285000, requiredDeliveryDate: '2026-10-10',
    reason: 'Q4办公用品备货',
    status: 'confirm_approved',
    createTime: '2026-09-01 09:30:00',
    approveTime: '2026-09-02 14:20:00', approver: '陈总',
    confirmSubmitter: '赵六', confirmSubmitTime: '2026-09-03 10:00:00',
    confirmApproveTime: '2026-09-03 15:30:00', confirmApprover: '陈总',
    isThreeImportant: true,
    details: [
      { id: 'PD-001-D1', demandId: 'PD-001', productCode: 'GYWJ-001', productName: 'A4打印纸', unit: '箱', quantity: 500, specification: '70g 500张/包', unitPriceIncludingTax: 125, taxRate: 0.13, amountIncludingTax: 62500, isInContractList: true, contractNo: 'HT-202609001' },
      { id: 'PD-001-D2', demandId: 'PD-001', productCode: 'GYWJ-002', productName: '圆珠笔', unit: '盒', quantity: 800, specification: '0.5mm黑色 12支/盒', unitPriceIncludingTax: 24, taxRate: 0.13, amountIncludingTax: 19200, isInContractList: true, contractNo: 'HT-202609001' },
      { id: 'PD-001-D3', demandId: 'PD-001', productCode: 'GYWJ-003', productName: '文件夹', unit: '件', quantity: 1200, specification: 'A4双夹', unitPriceIncludingTax: 18, taxRate: 0.13, amountIncludingTax: 21600, isInContractList: true, contractNo: 'HT-202609001' },
      { id: 'PD-001-D4', demandId: 'PD-001', productCode: 'GYWJ-004', productName: '打印墨盒', unit: '个', quantity: 60, specification: 'HP-802黑色', unitPriceIncludingTax: 380, taxRate: 0.13, amountIncludingTax: 22800, isInContractList: true, contractNo: 'HT-202609001' },
    ],
  },
  // ===== 链路 B：展台搭建（清单外 + 签报审批 + confirm_approved）=====
  {
    id: 'PD-002', demandNo: 'PD-202609002', demandType: 'service_project',
    businessCategory: 'engineering', subType: 'service',
    procurementType: 'outside_framework', procurementMode: 'sign_report',
    applicant: '钱七', applicantDept: '市场部', applyDate: '2026-09-05',
    projectName: '国际会展中心展台设计搭建服务',
    projectDescription: '2026年国际会展中心展会特装展位设计搭建（36㎡）',
    estimatedAmount: 480000, requiredDeliveryDate: '2026-11-15',
    reason: '参加2026国际会展中心年度展会',
    status: 'confirm_approved',
    createTime: '2026-09-05 10:15:00',
    approveTime: '2026-09-06 16:45:00', approver: '陈总',
    confirmSubmitter: '钱七', confirmSubmitTime: '2026-09-07 09:30:00',
    confirmApproveTime: '2026-09-08 11:00:00', confirmApprover: '陈总',
    isThreeImportant: true,
    projectRows: [
      { id: 'PDR-002-1', dept: '市场部', projectName: '国际会展中心展台设计搭建', mainContent: '展台36㎡特装设计、制作、现场搭建及展后拆除', budgetAmount: 480000, budgetControlAmount: 500000, approvalDate: '2026-09-08', remark: '展会特装预算' },
    ],
    details: [
      { id: 'PD-002-D1', demandId: 'PD-002', productCode: 'FW-001', productName: '展台设计搭建服务', unit: '项', quantity: 1, specification: '36㎡特装 含设计/制作/搭建/拆除', unitPriceIncludingTax: 424778, taxRate: 0.06, amountIncludingTax: 424778 },
    ],
  },
  // ===== 链路 C：综合布线（新增供应商 + 申请表 + confirm_approved）=====
  {
    id: 'PD-003', demandNo: 'PD-202609003', demandType: 'implementation_project',
    businessCategory: 'engineering', subType: 'construction',
    procurementType: 'new_supplier', procurementMode: 'application_form',
    applicant: '孙八', applicantDept: '技术部', applyDate: '2026-09-10',
    projectName: '新办公区综合布线及网络改造',
    projectDescription: '10F-15F新办公区综合布线、机房建设、网络设备安装调试',
    estimatedAmount: 1250000, requiredDeliveryDate: '2026-12-20',
    reason: '新办公区装修同步进行网络基础设施建设',
    status: 'confirm_approved',
    createTime: '2026-09-10 08:45:00',
    approveTime: '2026-09-11 13:20:00', approver: '陈总',
    confirmSubmitter: '孙八', confirmSubmitTime: '2026-09-12 10:00:00',
    confirmApproveTime: '2026-09-14 09:30:00', confirmApprover: '陈总',
    isThreeImportant: true,
    projectRows: [
      { id: 'PDR-003-1', dept: '技术部', projectName: '新办公区综合布线及网络改造', mainContent: '综合布线、机房建设、网络设备安装、WiFi覆盖、系统联调', budgetAmount: 1250000, budgetControlAmount: 1300000, approvalDate: '2026-09-14' },
    ],
    details: [
      { id: 'PD-003-D1', demandId: 'PD-003', productCode: 'GC-001', productName: '六类网线', unit: '箱', quantity: 200, specification: '305m/箱', unitPriceIncludingTax: 680, taxRate: 0.13, amountIncludingTax: 136000 },
      { id: 'PD-003-D2', demandId: 'PD-003', productCode: 'GC-002', productName: '24口千兆交换机', unit: '台', quantity: 40, specification: 'H3C S5130-28P', unitPriceIncludingTax: 3200, taxRate: 0.13, amountIncludingTax: 128000 },
      { id: 'PD-003-D3', demandId: 'PD-003', productCode: 'GC-003', productName: '无线AP', unit: '台', quantity: 60, specification: 'TP-LINK WAP712H', unitPriceIncludingTax: 1180, taxRate: 0.13, amountIncludingTax: 70800 },
    ],
  },
  // ===== 链路 D：变更中（已被下游引用 + changed 状态）=====
  {
    id: 'PD-005', demandNo: 'PD-202609005', demandType: 'service_project',
    businessCategory: 'engineering', subType: 'service',
    procurementType: 'outside_framework', procurementMode: 'sign_report',
    applicant: '吴十', applicantDept: 'IT部', applyDate: '2026-08-20',
    projectName: '服务器运维托管服务',
    estimatedAmount: 320000, requiredDeliveryDate: '2026-10-01',
    reason: '服务器运维外包',
    status: 'changed',
    createTime: '2026-08-20 11:00:00',
    approveTime: '2026-08-22 10:00:00', approver: '陈总',
    confirmSubmitter: '吴十', confirmSubmitTime: '2026-08-23 09:00:00',
    confirmApproveTime: '2026-08-24 14:00:00', confirmApprover: '陈总',
    relatedOrderId: 'CPO-004',
    projectRows: [
      { id: 'PDR-005-1', dept: 'IT部', projectName: '服务器运维托管服务', mainContent: '服务器托管及7×24小时运维', budgetAmount: 320000, budgetControlAmount: 350000, approvalDate: '2026-08-24' },
    ],
    details: [
      { id: 'PD-005-D1', demandId: 'PD-005', productCode: 'FW-002', productName: '服务器运维服务', unit: '年', quantity: 1, specification: '7×24小时 年度服务', unitPriceIncludingTax: 301887, taxRate: 0.06, amountIncludingTax: 301887 },
    ],
  },
  // ===== 链路 E：展会物料（draft 草稿）=====
  {
    id: 'PD-004', demandNo: 'PD-202609004', demandType: 'material',
    businessCategory: 'non_engineering', subType: 'goods',
    procurementType: 'outside_framework', procurementMode: 'meeting',
    applicant: '周九', applicantDept: '运营部', applyDate: '2026-09-15',
    projectName: '展会物料制作及运输',
    projectDescription: '2026年度展会宣传物料设计制作及现场运输安装',
    estimatedAmount: 560000, requiredDeliveryDate: '2026-10-25',
    reason: '年度展会宣传物料需外包制作',
    status: 'draft',
    createTime: '2026-09-15 16:20:00',
    details: [
      { id: 'PD-004-D1', demandId: 'PD-004', productCode: 'WL-001', productName: '易拉宝', unit: '个', quantity: 200, specification: '80*200cm 铝合金支架', unitPriceIncludingTax: 120, taxRate: 0.13, amountIncludingTax: 24000 },
    ],
  },
  // ===== confirm_rejected（立项驳回）=====
  {
    id: 'PD-006', demandNo: 'PD-202609006', demandType: 'material',
    businessCategory: 'non_engineering', subType: 'goods',
    procurementType: 'outside_framework', procurementMode: 'meeting',
    applicant: '郑十一', applicantDept: '人事部', applyDate: '2026-09-12',
    projectName: '员工福利采购方案',
    estimatedAmount: 150000, requiredDeliveryDate: '2026-12-15',
    reason: '年度员工福利',
    status: 'confirm_rejected',
    createTime: '2026-09-12 14:00:00',
    approveTime: '2026-09-13 10:00:00', approver: '陈总',
    confirmSubmitter: '郑十一', confirmSubmitTime: '2026-09-14 09:00:00',
    confirmRejectTime: '2026-09-14 15:00:00',
    confirmRejectReason: '预算需重新核定后再提交立项',
    confirmApprover: '陈总',
    details: [
      { id: 'PD-006-D1', demandId: 'PD-006', productCode: 'FL-001', productName: '节日礼盒', unit: '份', quantity: 500, specification: '含食品/日用品', unitPriceIncludingTax: 300, taxRate: 0.13, amountIncludingTax: 150000 },
    ],
  },
  // ===== pending（待审批）=====
  {
    id: 'PD-007', demandNo: 'PD-202609007', demandType: 'service_project',
    businessCategory: 'engineering', subType: 'service',
    procurementType: 'outside_framework', procurementMode: 'sign_report',
    applicant: '钱七', applicantDept: '市场部', applyDate: '2026-09-16',
    projectName: '展览展示设计咨询服务',
    estimatedAmount: 200000, requiredDeliveryDate: '2026-11-01',
    reason: '大型展会特装前需专业设计咨询',
    status: 'pending',
    createTime: '2026-09-16 09:00:00',
    details: [
      { id: 'PD-007-D1', demandId: 'PD-007', productCode: 'FW-003', productName: '展览设计咨询', unit: '项', quantity: 1, unitPriceIncludingTax: 188679, taxRate: 0.06, amountIncludingTax: 188679 },
    ],
  },
  // ===== rejected（需求审批驳回）=====
  {
    id: 'PD-008', demandNo: 'PD-202609008', demandType: 'material',
    businessCategory: 'non_engineering', subType: 'goods',
    procurementType: 'outside_framework', procurementMode: 'meeting',
    applicant: '周九', applicantDept: '运营部', applyDate: '2026-09-14',
    projectName: '非必要办公设备采购',
    estimatedAmount: 80000, requiredDeliveryDate: '2026-11-30',
    reason: '部分电脑老化需更换',
    status: 'rejected',
    createTime: '2026-09-14 11:00:00',
    details: [
      { id: 'PD-008-D1', demandId: 'PD-008', productCode: 'IT-001', productName: '办公电脑', unit: '台', quantity: 20, unitPriceIncludingTax: 4000, taxRate: 0.13, amountIncludingTax: 80000 },
    ],
  },

  // ===== 演示全状态覆盖（补缺失状态 approved / confirm_pending）=====
  // ① material 物资 — 申请审批通过、待立项（approved）
  {
    id: 'PD-009', demandNo: 'PD-202609009', demandType: 'material',
    businessCategory: 'engineering', subType: 'goods',
    procurementType: 'outside_framework', procurementMode: 'meeting',
    applicant: '张三', applicantDept: '展务部', applyDate: '2026-09-15',
    projectName: '2026年秋季展主展厅物资采购',
    estimatedAmount: 580000, requiredDeliveryDate: '2026-11-15',
    reason: '秋季主展厅需要展板、展架、地毯等一批物资',
    status: 'approved',
    createTime: '2026-09-15 09:00:00',
    details: [
      { id: 'PD-009-D1', demandId: 'PD-009', productCode: 'ZC-001', productName: '标准展板(3m)', unit: '张', quantity: 120, unitPriceIncludingTax: 350, taxRate: 0.13, amountIncludingTax: 42000 },
      { id: 'PD-009-D2', demandId: 'PD-009', productCode: 'ZJ-001', productName: '标准展架', unit: '套', quantity: 80, unitPriceIncludingTax: 1200, taxRate: 0.13, amountIncludingTax: 96000 },
      { id: 'PD-009-D3', demandId: 'PD-009', productCode: 'DT-002', productName: '防火地毯', unit: '㎡', quantity: 1200, unitPriceIncludingTax: 180, taxRate: 0.13, amountIncludingTax: 216000 },
    ],
  },
  // ② service_non_engineering 非工程-服务 — 立项审批中（confirm_pending）
  {
    id: 'PD-010', demandNo: 'PD-202609010', demandType: 'service_non_engineering',
    businessCategory: 'non_engineering', subType: 'service',
    procurementType: 'outside_framework', procurementMode: 'sign_report',
    applicant: '李四', applicantDept: '市场部', applyDate: '2026-09-16',
    projectName: '秋季展现场安保服务采购',
    estimatedAmount: 120000, requiredDeliveryDate: '2026-11-10',
    reason: '展期 7 天，需每天 20 名持证保安在岗',
    status: 'confirm_pending',
    createTime: '2026-09-16 10:30:00',
    details: [
      { id: 'PD-010-D1', demandId: 'PD-010', productCode: 'FW-SB-001', productName: '持证保安服务', unit: '人天', quantity: 140, unitPriceIncludingTax: 857, taxRate: 0.06, amountIncludingTax: 120000 },
    ],
  },
  // ③ material_non_engineering 非工程-货物 — 申请审批中（pending）
  {
    id: 'PD-011', demandNo: 'PD-202609011', demandType: 'material_non_engineering',
    businessCategory: 'non_engineering', subType: 'goods',
    procurementType: 'outside_framework', procurementMode: 'application_form',
    applicant: '王五', applicantDept: '行政部', applyDate: '2026-09-17',
    projectName: '办公耗材季度采购',
    estimatedAmount: 24000, requiredDeliveryDate: '2026-10-15',
    reason: 'Q4 办公耗材集中采购',
    status: 'pending',
    createTime: '2026-09-17 14:00:00',
    details: [
      { id: 'PD-011-D1', demandId: 'PD-011', productCode: 'HC-001', productName: 'A4复印纸', unit: '包', quantity: 200, unitPriceIncludingTax: 25, taxRate: 0.13, amountIncludingTax: 5000 },
    ],
  },
  // ④ implementation_project 实施项目 — 立项通过（confirm_approved）完整链路
  {
    id: 'PD-012', demandNo: 'PD-202609012', demandType: 'implementation_project',
    businessCategory: 'engineering', subType: 'construction',
    procurementType: 'outside_framework', procurementMode: 'meeting',
    applicant: '赵六', applicantDept: '技术部', applyDate: '2026-09-10',
    projectName: '展馆智能门禁系统建设项目',
    estimatedAmount: 2800000, requiredDeliveryDate: '2027-03-31',
    reason: '展馆升级改造，新增人脸识别门禁系统',
    status: 'confirm_approved',
    createTime: '2026-09-10 09:00:00',
    details: [
      { id: 'PD-012-D1', demandId: 'PD-012', productCode: 'GC-001', productName: '智能门禁建设', unit: '项', quantity: 1, unitPriceIncludingTax: 2800000, taxRate: 0.09, amountIncludingTax: 2800000 },
    ],
  },
  // ⑤ service_project 服务项目 — 立项通过（confirm_approved）完整链路
  {
    id: 'PD-013', demandNo: 'PD-202609013', demandType: 'service_project',
    businessCategory: 'engineering', subType: 'service',
    procurementType: 'outside_framework', procurementMode: 'meeting',
    applicant: '孙七', applicantDept: '展务部', applyDate: '2026-09-11',
    projectName: '秋季展展馆搭建总承包',
    estimatedAmount: 1560000, requiredDeliveryDate: '2026-11-08',
    reason: '秋季展主展厅 20000㎡ 搭建总包',
    status: 'confirm_approved',
    createTime: '2026-09-11 10:00:00',
    details: [
      { id: 'PD-013-D1', demandId: 'PD-013', productCode: 'FW-DJ-001', productName: '展馆搭建总包', unit: '项', quantity: 1, unitPriceIncludingTax: 1560000, taxRate: 0.06, amountIncludingTax: 1560000 },
    ],
  },
  // ⑥ service_non_engineering — 立项驳回（confirm_rejected）
  {
    id: 'PD-014', demandNo: 'PD-202609014', demandType: 'service_non_engineering',
    businessCategory: 'non_engineering', subType: 'service',
    procurementType: 'outside_framework', procurementMode: 'sign_report',
    applicant: '周八', applicantDept: '行政部', applyDate: '2026-09-18',
    projectName: '年度绿植租赁补充',
    estimatedAmount: 36000, requiredDeliveryDate: '2026-10-01',
    reason: '部分绿植到期需续租',
    status: 'confirm_rejected',
    createTime: '2026-09-18 11:00:00',
    details: [
      { id: 'PD-014-D1', demandId: 'PD-014', productCode: 'FW-LZ-001', productName: '绿植租赁', unit: '月', quantity: 12, unitPriceIncludingTax: 3000, taxRate: 0.06, amountIncludingTax: 36000 },
    ],
  },
  // ⑦ material — 变更中（changed）
  {
    id: 'PD-015', demandNo: 'PD-202609015', demandType: 'material',
    businessCategory: 'engineering', subType: 'goods',
    procurementType: 'within_framework', procurementMode: 'application_form',
    applicant: '吴九', applicantDept: '仓储部', applyDate: '2026-09-12',
    projectName: '展具补充采购',
    estimatedAmount: 150000, requiredDeliveryDate: '2026-10-20',
    reason: '部分展具磨损需补充，现申请变更数量',
    status: 'changed',
    createTime: '2026-09-12 15:00:00',
    details: [
      { id: 'PD-015-D1', demandId: 'PD-015', productCode: 'ZJ-001', productName: '标准展架', unit: '套', quantity: 30, unitPriceIncludingTax: 5000, taxRate: 0.13, amountIncludingTax: 150000 },
    ],
  },
];

// ============================================================================
// 3. 招采实施工单（Bidding）
// ============================================================================

export const biddings: Bidding[] = [
  // ===== 链路 A 继续：办公用品 → state_owned_framework（已完成）=====
  {
    id: 'BID-001', biddingNo: 'BP-202609001', biddingName: '2026年秋季办公用品集中采购工单',
    projectName: '2026年秋季办公用品集中采购',
    procurementMethod: 'framework_catalog',
    demandId: 'PD-001', demandNo: 'PD-202609001',
    totalAmountIncludingTax: 126100, totalAmountExcludingTax: 111593, totalTaxAmount: 14507,
    approvalStatus: 'approved', status: 'completed',
    winningSupplierId: 'SUP-001', winningSupplierName: '晨光办公用品有限公司',
    awardTime: '2026-08-20 14:00:00',
    contractAmount: 126100,
    creator: '张三', createTime: '2026-08-18 10:00:00',
  },
  // ===== 链路 B 继续：展台搭建 → voluntary_bidding（已完成）=====
  {
    id: 'BID-002', biddingNo: 'BP-202609002', biddingName: '国际会展中心展台设计搭建工单',
    projectName: '国际会展中心展台设计搭建',
    procurementMethod: 'inquiry',
    demandId: 'PD-002', demandNo: 'PD-202609002',
    procurementApprovalMethod: '上会审议', procurementApprovalDate: '2026-09-10',
    items: [
      { productCode: 'FW-001', productName: '展台设计搭建服务', specification: '36㎡特装', unit: '项', quantity: 1, singlePriceLimit: 450000, demandUnitPriceIncludingTax: 424778 },
    ],
    totalAmountIncludingTax: 424778, totalAmountExcludingTax: 400734, totalTaxAmount: 24044,
    approvalStatus: 'approved', status: 'completed',
    winningSupplierId: 'SUP-002', winningSupplierName: '华展展览服务有限公司',
    losingSupplier1Name: 'XX展览公司', losingSupplier1LegalPerson: '张某', losingSupplier1Score: 82,
    losingSupplier2Name: 'YY展示公司', losingSupplier2LegalPerson: '李某', losingSupplier2Score: 76,
    announcementPublishTime: '2026-09-12 09:00:00',
    bidOpeningTime: '2026-09-15 10:00:00',
    awardTime: '2026-09-15 15:00:00',
    contractAmount: 424778,
    judgeMethod: '综合评分法',
    creator: '李四', createTime: '2026-09-09 09:00:00',
  },
  // ===== 链路 C 继续：综合布线 → legal_bidding（已完成）=====
  {
    id: 'BID-003', biddingNo: 'BP-202609003', biddingName: '新办公区综合布线及网络改造工单',
    projectName: '新办公区综合布线及网络改造',
    procurementMethod: 'competitive_bidding',
    demandId: 'PD-003', demandNo: 'PD-202609003',
    procurementApprovalMethod: '立项申请', procurementApprovalDate: '2026-09-01',
    items: [
      { productCode: 'GC-001', productName: '六类网线', unit: '箱', quantity: 200, singlePriceLimit: 750, demandUnitPriceIncludingTax: 680 },
      { productCode: 'GC-002', productName: '24口千兆交换机', unit: '台', quantity: 40, singlePriceLimit: 3500, demandUnitPriceIncludingTax: 3200 },
      { productCode: 'GC-003', productName: '无线AP', unit: '台', quantity: 60, singlePriceLimit: 1300, demandUnitPriceIncludingTax: 1180 },
    ],
    totalAmountIncludingTax: 334800, totalAmountExcludingTax: 296283, totalTaxAmount: 38517,
    approvalStatus: 'approved', status: 'completed',
    winningSupplierId: 'SUP-003', winningSupplierName: '华东物资供应有限公司',
    losingSupplier1Name: 'XX科技公司', losingSupplier1LegalPerson: '王某某', losingSupplier1Score: 85,
    announcementPublishTime: '2026-09-03 09:00:00',
    bidOpeningTime: '2026-09-10 10:00:00',
    awardTime: '2026-09-10 16:00:00',
    contractAmount: 1250000,
    judgeMethod: '综合评分法',
    creator: '王五', createTime: '2026-08-31 10:00:00',
  },
  // ===== 链路 D 继续：服务器运维（已取消）=====
  {
    id: 'BID-005', biddingNo: 'BP-202609005', biddingName: '服务器运维托管服务工单',
    projectName: '服务器运维托管服务',
    procurementMethod: 'direct',
    demandId: 'PD-005', demandNo: 'PD-202609005',
    totalAmountIncludingTax: 301887, totalAmountExcludingTax: 284800, totalTaxAmount: 17087,
    approvalStatus: 'approved', status: 'cancelled',
    winningSupplierId: 'SUP-007', winningSupplierName: '某倒闭的供应商',
    awardTime: '2026-09-01 10:00:00',
    contractAmount: 301887,
    remark: '中标供应商经营异常，工单取消',
    creator: '孙七', createTime: '2026-08-28 10:00:00',
  },
  // ===== 链路 E：目录内比价（进行中 bidding 状态）=====
  {
    id: 'BID-004', biddingNo: 'BP-202609004', biddingName: '展会物料采购工单（目录内比价）',
    projectName: '展会物料制作及运输',
    procurementMethod: 'e_mall',
    demandId: 'PD-004', demandNo: 'PD-202609004',
    startTime: '2026-09-18 09:00:00',
    endTime: '2026-09-25 18:00:00',
    inviteSupplierIds: ['SUP-001', 'SUP-004'],
    approvalStatus: 'approved', status: 'bidding',
    creator: '周九', createTime: '2026-09-16 14:00:00',
  },
  // ===== 其他状态的工单 =====
  {
    id: 'BID-006', biddingNo: 'BP-202609006', biddingName: '员工餐厅食材框架采购工单',
    projectName: '员工餐厅食材框架采购',
    procurementMethod: 'framework_catalog',
    totalAmountIncludingTax: 800000,
    approvalStatus: 'submitted', status: 'submitted',
    creator: '周八', createTime: '2026-09-17 09:00:00',
  },
  {
    id: 'BID-007', biddingNo: 'BP-202609007', biddingName: '展览设计咨询采购工单（草稿）',
    projectName: '展览展示设计咨询服务',
    procurementMethod: 'negotiation_open',
    demandId: 'PD-007', demandNo: 'PD-202609007',
    approvalStatus: 'draft', status: 'draft',
    creator: '钱七', createTime: '2026-09-16 10:00:00',
  },
  {
    id: 'BID-008', biddingNo: 'BP-202609008', biddingName: '办公电脑采购工单（已驳回）',
    projectName: '非必要办公设备采购',
    procurementMethod: 'direct',
    demandId: 'PD-008', demandNo: 'PD-202609008',
    approvalStatus: 'rejected', status: 'rejected',
    remark: '立项已驳回，工单同步终止',
    creator: '周九', createTime: '2026-09-14 15:00:00',
  },

  // ===== 新链路：PD-009（approved/待立项）→ BID-009（draft，尚未提交审批）=====
  {
    id: 'BID-009', biddingNo: 'BP-202609009', biddingName: '秋季展主展厅物资采购工单',
    projectName: '2026年秋季展主展厅物资采购',
    procurementMethod: 'inquiry',
    demandId: 'PD-009', demandNo: 'PD-202609009',
    totalAmountIncludingTax: 580000, totalAmountExcludingTax: 513274, totalTaxAmount: 66726,
    approvalStatus: 'draft', status: 'draft',
    creator: '张三', createTime: '2026-09-15 14:00:00',
  },
  // ===== 新链路：PD-010（confirm_pending/立项审批中）→ BID-010（bidding/招标进行中）=====
  {
    id: 'BID-010', biddingNo: 'BP-202609010', biddingName: '秋季展现场安保服务采购工单',
    projectName: '秋季展现场安保服务采购',
    procurementMethod: 'negotiation_open',
    demandId: 'PD-010', demandNo: 'PD-202609010',
    startTime: '2026-09-18 09:00:00',
    endTime: '2026-09-28 18:00:00',
    inviteSupplierIds: ['SUP-001', 'SUP-004'],
    approvalStatus: 'approved', status: 'bidding',
    creator: '李四', createTime: '2026-09-16 15:30:00',
  },
  // ===== 新链路：PD-012（confirm_approved/立项通过）→ BID-011（evaluated/已评审）=====
  {
    id: 'BID-011', biddingNo: 'BP-202609011', biddingName: '展馆智能门禁系统建设项目工单',
    projectName: '展馆智能门禁系统建设项目',
    procurementMethod: 'competitive_bidding',
    demandId: 'PD-012', demandNo: 'PD-202609012',
    totalAmountIncludingTax: 2800000, totalAmountExcludingTax: 2568807, totalTaxAmount: 231193,
    approvalStatus: 'approved', status: 'evaluated',
    winningSupplierId: 'SUP-003', winningSupplierName: '华东物资供应有限公司',
    losingSupplier1Name: 'XX智能科技', losingSupplier1LegalPerson: '钱某某', losingSupplier1Score: 88,
    losingSupplier2Name: 'YY安防公司', losingSupplier2LegalPerson: '孙某某', losingSupplier2Score: 84,
    announcementPublishTime: '2026-09-20 09:00:00',
    bidOpeningTime: '2026-09-25 10:00:00',
    awardTime: '2026-09-25 16:00:00',
    contractAmount: 2800000,
    judgeMethod: '综合评分法',
    creator: '赵六', createTime: '2026-09-18 10:00:00',
  },
  // ===== 新链路：PD-013（confirm_approved/立项通过）→ BID-012（completed/已完成）=====
  {
    id: 'BID-012', biddingNo: 'BP-202609012', biddingName: '秋季展展馆搭建总承包工单',
    projectName: '秋季展展馆搭建总承包',
    procurementMethod: 'voluntary_bidding',
    demandId: 'PD-013', demandNo: 'PD-202609013',
    totalAmountIncludingTax: 1560000, totalAmountExcludingTax: 1471698, totalTaxAmount: 88302,
    approvalStatus: 'approved', status: 'completed',
    winningSupplierId: 'SUP-002', winningSupplierName: '华展展览服务有限公司',
    losingSupplier1Name: 'ZZ展览工程', losingSupplier1LegalPerson: '李某某', losingSupplier1Score: 89,
    announcementPublishTime: '2026-09-15 09:00:00',
    bidOpeningTime: '2026-09-20 10:00:00',
    awardTime: '2026-09-20 15:00:00',
    contractAmount: 1560000,
    judgeMethod: '综合评分法',
    creator: '孙七', createTime: '2026-09-13 10:00:00',
  },
  // ===== 新链路：PD-015（changed/变更中）→ BID-013（submitted/已提交审批）=====
  {
    id: 'BID-013', biddingNo: 'BP-202609013', biddingName: '展具补充采购工单（变更）',
    projectName: '展具补充采购',
    procurementMethod: 'framework_catalog',
    demandId: 'PD-015', demandNo: 'PD-202609015',
    approvalStatus: 'submitted', status: 'submitted',
    creator: '吴九', createTime: '2026-09-20 11:00:00',
    remark: '对应需求正在变更审批中，工单暂挂',
  },
];

// ============================================================================
// 4. 供应商报价单（SupplierQuote）
// ============================================================================

export const supplierQuotes: SupplierQuote[] = [
  // ===== BID-002 展台搭建的三家报价 =====
  {
    id: 'SQ-001', quoteNo: 'SQ-20260915001',
    biddingId: 'BID-002', biddingNo: 'BP-202609002', biddingName: '国际会展中心展台设计搭建工单',
    supplierId: 'SUP-002', supplierName: '华展展览服务有限公司',
    contactPerson: '李总', contactPhone: '0731-88881002',
    totalAmount: 424778, taxRate: 0.06, taxAmount: 24044,
    quoteDate: '2026-09-14', submittedAt: '2026-09-14 17:30:00',
    status: 'accepted',
    details: [
      { productCode: 'FW-001', productName: '展台设计搭建服务', specification: '36㎡特装', unit: '项', quantity: 1, unitPrice: 424778, taxRate: 0.06, amount: 424778, taxAmount: 24044 },
    ],
  },
  {
    id: 'SQ-002', quoteNo: 'SQ-20260915002',
    biddingId: 'BID-002', biddingNo: 'BP-202609002', biddingName: '国际会展中心展台设计搭建工单',
    supplierId: 'SUP-004', supplierName: '新视觉广告制作有限公司',
    contactPerson: '赵姐', contactPhone: '0731-88881004',
    totalAmount: 460000, taxRate: 0.06, taxAmount: 26038,
    quoteDate: '2026-09-14', submittedAt: '2026-09-14 16:00:00',
    status: 'rejected',
    details: [
      { productCode: 'FW-001', productName: '展台设计搭建服务', specification: '36㎡特装', unit: '项', quantity: 1, unitPrice: 460000, taxRate: 0.06, amount: 460000, taxAmount: 26038 },
    ],
  },
  // ===== BID-004 目录内比价的两家报价（进行中）=====
  {
    id: 'SQ-003', quoteNo: 'SQ-20260918001',
    biddingId: 'BID-004', biddingNo: 'BP-202609004', biddingName: '展会物料采购工单',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    contactPerson: '张经理', contactPhone: '0731-88881001',
    totalAmount: 28800, taxRate: 0.13, taxAmount: 3313,
    quoteDate: '2026-09-18', submittedAt: '2026-09-18 10:30:00',
    status: 'submitted',
    details: [
      { productCode: 'WL-001', productName: '易拉宝', specification: '80*200cm', unit: '个', quantity: 200, unitPrice: 120, taxRate: 0.13, amount: 24000, taxAmount: 2761 },
    ],
  },
  {
    id: 'SQ-004', quoteNo: 'SQ-20260918002',
    biddingId: 'BID-004', biddingNo: 'BP-202609004', biddingName: '展会物料采购工单',
    supplierId: 'SUP-004', supplierName: '新视觉广告制作有限公司',
    contactPerson: '赵姐', contactPhone: '0731-88881004',
    totalAmount: 26000, taxRate: 0.13, taxAmount: 2991,
    quoteDate: '2026-09-18', submittedAt: '2026-09-18 11:00:00',
    status: 'submitted',
    details: [
      { productCode: 'WL-001', productName: '易拉宝', specification: '80*200cm', unit: '个', quantity: 200, unitPrice: 110, taxRate: 0.13, amount: 22000, taxAmount: 2513 },
    ],
  },
  // ===== BID-010 安保服务招标中（2家已提交）=====
  {
    id: 'SQ-005', quoteNo: 'SQ-20260920001',
    biddingId: 'BID-010', biddingNo: 'BP-202609010', biddingName: '秋季展现场安保服务采购工单',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    contactPerson: '张经理', contactPhone: '0731-88881001',
    totalAmount: 118000, taxRate: 0.06, taxAmount: 6679,
    quoteDate: '2026-09-19', submittedAt: '2026-09-19 16:00:00',
    status: 'submitted',
    details: [
      { productCode: 'FW-SB-001', productName: '持证保安服务', unit: '人天', quantity: 140, unitPrice: 843, taxRate: 0.06, amount: 118000, taxAmount: 6679 },
    ],
  },
  {
    id: 'SQ-006', quoteNo: 'SQ-20260920002',
    biddingId: 'BID-010', biddingNo: 'BP-202609010', biddingName: '秋季展现场安保服务采购工单',
    supplierId: 'SUP-004', supplierName: '新视觉广告制作有限公司',
    contactPerson: '赵姐', contactPhone: '0731-88881004',
    totalAmount: 122000, taxRate: 0.06, taxAmount: 6906,
    quoteDate: '2026-09-20', submittedAt: '2026-09-20 10:30:00',
    status: 'submitted',
    details: [
      { productCode: 'FW-SB-001', productName: '持证保安服务', unit: '人天', quantity: 140, unitPrice: 871, taxRate: 0.06, amount: 122000, taxAmount: 6906 },
    ],
  },
  // ===== BID-012 展馆搭建总承包（1家中标、1家未中）=====
  {
    id: 'SQ-007', quoteNo: 'SQ-20260920003',
    biddingId: 'BID-012', biddingNo: 'BP-202609012', biddingName: '秋季展展馆搭建总承包工单',
    supplierId: 'SUP-002', supplierName: '华展展览服务有限公司',
    contactPerson: '李总', contactPhone: '0731-88881002',
    totalAmount: 1560000, taxRate: 0.06, taxAmount: 88302,
    quoteDate: '2026-09-18', submittedAt: '2026-09-18 14:00:00',
    status: 'accepted',
    details: [
      { productCode: 'FW-DJ-001', productName: '展馆搭建总包', unit: '项', quantity: 1, unitPrice: 1560000, taxRate: 0.06, amount: 1560000, taxAmount: 88302 },
    ],
  },
  {
    id: 'SQ-008', quoteNo: 'SQ-20260920004',
    biddingId: 'BID-012', biddingNo: 'BP-202609012', biddingName: '秋季展展馆搭建总承包工单',
    supplierId: 'SUP-003', supplierName: '华东物资供应有限公司',
    contactPerson: '王总', contactPhone: '0731-88881003',
    totalAmount: 1620000, taxRate: 0.06, taxAmount: 91510,
    quoteDate: '2026-09-19', submittedAt: '2026-09-19 11:00:00',
    status: 'rejected',
    details: [
      { productCode: 'FW-DJ-001', productName: '展馆搭建总包', unit: '项', quantity: 1, unitPrice: 1620000, taxRate: 0.06, amount: 1620000, taxAmount: 91510 },
    ],
  },
];

// ============================================================================
// 5. 合同台账（ContractLedger）
// ============================================================================

export const contractLedgers: ContractLedger[] = [
  // ===== 链路 A 继续：办公用品框架合同（active）=====
  {
    id: 'HT-001', contractId: 'HT-001', contractNo: 'HT-202609001',
    contractName: '2026年办公用品框架采购合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_framework',
    winningDate: '2026-08-20', isModelText: true,
    demandDepartment: '行政部', handlingDepartment: '采购部',
    handler: '张三', handlerContact: '0731-88881001',
    counterpartyName: '晨光办公用品有限公司', counterpartyContact: '张经理',
    mainContent: '办公用品框架合同清单内批量采购，有效期至2026年12月31日',
    signingDate: '2026-08-25', effectiveDate: '2026-08-25',
    terminationDate: '2026-12-31', endDate: '2026-12-31', expireDate: '2026-12-31',
    amount: 120, paidAmount: 48,
    archiveStatus: 'not_started', approvalMethod: '会议审批',
    status: 'active',
    biddingId: 'BID-001', biddingNo: 'BP-202609001',
    projectName: '2026年办公用品集中采购',
  },
  // ===== 链路 B 继续：展台搭建合同（active + guaranteeEvaluation）=====
  {
    id: 'HT-002', contractId: 'HT-002', contractNo: 'HT-202609002',
    contractName: '国际会展中心展台设计搭建服务合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'voluntary_bidding',
    winningDate: '2026-09-15',
    demandDepartment: '市场部', handlingDepartment: '采购部',
    handler: '李四', handlerContact: '0731-88881002',
    counterpartyName: '华展展览服务有限公司', counterpartyContact: '李总',
    mainContent: '2026国际会展中心展会36㎡特装展台设计、制作、搭建及展后拆除',
    signingDate: '2026-09-20', effectiveDate: '2026-09-20',
    terminationDate: '2026-12-20', expireDate: '2026-12-20',
    amount: 48, paidAmount: 24,
    archiveStatus: 'not_started', approvalMethod: '签报审批',
    status: 'active',
    biddingId: 'BID-002', biddingNo: 'BP-202609002',
    projectName: '国际会展中心展台设计搭建',
    guaranteeEvaluation: { isOpen: true, guaranteeType: '履约保证金' },
  },
  // ===== 链路 C 继续：综合布线合同（completed + archived）=====
  {
    id: 'HT-003', contractId: 'HT-003', contractNo: 'HT-202609003',
    contractName: '新办公区综合布线及网络改造合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'engineering', formation: 'legal_bidding',
    winningDate: '2026-09-22',
    demandDepartment: '技术部', handlingDepartment: '采购部',
    handler: '王五', handlerContact: '0731-88881003',
    counterpartyName: '华东物资供应有限公司', counterpartyContact: '王工',
    mainContent: '10F-15F新办公区综合布线、机房建设、网络设备安装调试、WiFi全覆盖',
    signingDate: '2026-09-28', effectiveDate: '2026-09-28',
    terminationDate: '2026-12-28', expireDate: '2026-12-28',
    amount: 125, paidAmount: 125, settlementAmount: 125,
    archiveStatus: 'archived', approvalMethod: '采购项目申请表',
    status: 'completed',
    biddingId: 'BID-003', biddingNo: 'BP-202609003',
    projectName: '新办公区综合布线及网络改造',
  },
  // ===== 链路 D 继续：服务器运维合同（terminated）=====
  {
    id: 'HT-005', contractId: 'HT-005', contractNo: 'HT-202609005',
    contractName: '服务器运维托管服务合同（已终止）',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_direct',
    demandDepartment: 'IT部', handlingDepartment: '采购部',
    handler: '孙七', handlerContact: '0731-88881005',
    counterpartyName: '某倒闭的供应商',
    mainContent: '服务器运维托管服务',
    signingDate: '2026-09-01', effectiveDate: '2026-09-01',
    terminationDate: '2026-09-15', expireDate: '2026-09-15',
    amount: 32, paidAmount: 0,
    archiveStatus: 'not_started',
    status: 'terminated',
    biddingId: 'BID-005', biddingNo: 'BP-202609005',
    projectName: '服务器运维托管服务',
    remark: '因供应商经营异常终止合同',
  },
  // ===== 非招采类合同（财务审计 active）=====
  {
    id: 'HT-004', contractId: 'HT-004', contractNo: 'HT-202609004',
    contractName: '年度财务审计服务合同',
    contractNature: 'non_procurement', category: 'other',
    contractType: 'non_engineering_service', formation: 'other',
    demandDepartment: '财务部', handlingDepartment: '财务部',
    handler: '钱六', handlerContact: '0731-88881004',
    counterpartyName: '湖南华信会计师事务所', counterpartyContact: '刘会计师',
    mainContent: '2026年度财务报表审计及内控咨询服务',
    signingDate: '2026-01-10', effectiveDate: '2026-01-10',
    terminationDate: '2026-12-31', expireDate: '2026-12-31',
    amount: 12, paidAmount: 6,
    archiveStatus: 'not_started',
    status: 'active',
  },
  // ===== 审批中（pending）=====
  {
    id: 'HT-006', contractId: 'HT-006', contractNo: 'HT-202609006',
    contractName: '员工餐厅食材供应框架合同（审批中）',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_framework',
    demandDepartment: '行政部', handlingDepartment: '采购部',
    handler: '周八', handlerContact: '0731-88881006',
    counterpartyName: '鼎盛餐饮管理有限公司', counterpartyContact: '孙经理',
    mainContent: '员工餐厅食材框架合同，清单内采购',
    amount: 80,
    archiveStatus: 'not_started',
    status: 'pending',
    biddingId: 'BID-006', biddingNo: 'BP-202609006',
  },
  // ===== 过期（expired）=====
  {
    id: 'HT-007', contractId: 'HT-007', contractNo: 'HT-202509007',
    contractName: '2025年度办公耗材框架合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_framework',
    winningDate: '2024-12-20',
    demandDepartment: '行政部', handlingDepartment: '采购部',
    handler: '张三', handlerContact: '0731-88881007',
    counterpartyName: '晨光办公用品有限公司', counterpartyContact: '张经理',
    mainContent: '2025年度办公耗材框架合同（已过期）',
    signingDate: '2024-12-25', effectiveDate: '2025-01-01',
    terminationDate: '2025-12-31', expireDate: '2025-12-31',
    amount: 100, paidAmount: 100, settlementAmount: 100,
    archiveStatus: 'archived', approvalMethod: '会议审批',
    status: 'expired',
    projectName: '2025年度办公耗材集中采购',
  },
  // ===== 草稿（draft）=====
  {
    id: 'HT-008', contractId: 'HT-008', contractNo: 'HT-202609008',
    contractName: '展览设计咨询服务合同（草稿）',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_tanpan',
    demandDepartment: '市场部', handlingDepartment: '采购部',
    handler: '钱七',
    counterpartyName: '待确认',
    mainContent: '展览展示设计咨询服务',
    amount: 20,
    archiveStatus: 'not_started',
    status: 'draft',
    biddingId: 'BID-007', biddingNo: 'BP-202609007',
  },

  // ===== 新链路：BID-010（安保服务招标中）→ HT-009（合同待审批 pending）=====
  {
    id: 'HT-009', contractId: 'HT-009', contractNo: 'HT-202609009',
    contractName: '秋季展现场安保服务采购合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_tanpan',
    winningDate: '2026-09-28',
    demandId: 'PD-010', demandNo: 'PD-202609010',
    demandDepartment: '市场部', handlingDepartment: '采购部',
    handler: '李四', handlerContact: '0731-88881002',
    counterpartyName: '晨光办公用品有限公司', counterpartyContact: '张经理',
    mainContent: '秋季展展期7天，每天20名持证保安在岗，覆盖主展厅、停车场、VIP通道',
    signingDate: '2026-09-30', effectiveDate: '2026-09-30',
    terminationDate: '2026-11-20', expireDate: '2026-11-20',
    amount: 11.8,
    archiveStatus: 'not_started', approvalMethod: '签报审批',
    status: 'pending',
    biddingId: 'BID-010', biddingNo: 'BP-202609010',
    projectName: '秋季展现场安保服务采购',
    guaranteeEvaluation: { isOpen: true, guaranteeType: '履约保证金' },
  },
  // ===== 新链路：BID-011（智能门禁已评审）→ HT-010（审批通过待签 approved，带3个考核开关）=====
  {
    id: 'HT-010', contractId: 'HT-010', contractNo: 'HT-202609010',
    contractName: '展馆智能门禁系统建设合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'engineering', formation: 'legal_bidding',
    winningDate: '2026-09-25',
    isModelText: true,
    demandId: 'PD-012', demandNo: 'PD-202609012',
    demandDepartment: '技术部', handlingDepartment: '采购部',
    handler: '赵六', handlerContact: '0731-88881006',
    counterpartyName: '华东物资供应有限公司', counterpartyContact: '王工',
    mainContent: '展馆升级改造，新增人脸识别门禁系统（12个点位），含设备采购、安装调试、试运行、培训',
    signingDate: '2026-09-30', effectiveDate: '2026-10-01',
    terminationDate: '2027-03-31', expireDate: '2027-03-31',
    amount: 280,
    archiveStatus: 'not_started', approvalMethod: '会议审批',
    status: 'approved',
    biddingId: 'BID-011', biddingNo: 'BP-202609011',
    projectName: '展馆智能门禁系统建设项目',
    guaranteeEvaluation: { isOpen: true, guaranteeType: '质保金' },
    assessmentManagement: 'single_project',
    yearlyEvaluation: true,
  },
  // ===== 新链路：BID-012（展馆搭建已完成）→ HT-011（active执行中，带全部考核开关）=====
  {
    id: 'HT-011', contractId: 'HT-011', contractNo: 'HT-202609011',
    contractName: '秋季展展馆搭建总承包合同',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'engineering', formation: 'voluntary_bidding',
    winningDate: '2026-09-20',
    isModelText: true,
    demandId: 'PD-013', demandNo: 'PD-202609013',
    demandDepartment: '展务部', handlingDepartment: '采购部',
    handler: '孙七', handlerContact: '0731-88881007',
    counterpartyName: '华展展览服务有限公司', counterpartyContact: '李总',
    mainContent: '秋季展主展厅20000㎡搭建总包，含展位搭建、通道布置、开幕式舞台、展后拆除清运',
    signingDate: '2026-09-25', effectiveDate: '2026-09-25',
    terminationDate: '2026-11-30', expireDate: '2026-11-30',
    amount: 156, paidAmount: 46.8,
    archiveStatus: 'not_started', approvalMethod: '会议审批',
    status: 'active',
    biddingId: 'BID-012', biddingNo: 'BP-202609012',
    projectName: '秋季展展馆搭建总承包',
    guaranteeEvaluation: { isOpen: true, guaranteeType: '履约保证金' },
    assessmentManagement: 'quarterly',
    yearlyEvaluation: true,
  },
];

// ============================================================================
// 6. 招采订单（ContractPurchaseOrder）
// ============================================================================

export const contractPurchaseOrders: ContractPurchaseOrder[] = [
  // ===== 链路 A：办公用品订单（submitted）=====
  {
    id: 'CPO-001', orderNo: 'CPO20260915001',
    contractId: 'HT-001', contractNo: 'HT-202609001',
    contractName: '2026年办公用品框架采购合同',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    procurementDemandId: 'PD-001', procurementDemandNo: 'PD-202609001',
    projectName: '2026年秋季办公用品集中采购',
    status: 'submitted',
    createTime: '2026-09-15 10:00:00', creator: '张三',
    submitTime: '2026-09-15 14:30:00',
    details: [
      { id: 'CPO-001-D1', orderId: 'CPO-001', productId: 'P-GYWJ-001', productCode: 'GYWJ-001', productName: 'A4打印纸', unit: '箱', contractQuantity: 2000, deliveredQuantity: 500, orderQuantity: 500, unitPrice: 110.62, amount: 55310, deliveryDate: '2026-10-05' },
      { id: 'CPO-001-D2', orderId: 'CPO-001', productId: 'P-GYWJ-002', productCode: 'GYWJ-002', productName: '圆珠笔', unit: '盒', contractQuantity: 3000, deliveredQuantity: 0, orderQuantity: 800, unitPrice: 21.24, amount: 16992, deliveryDate: '2026-10-05' },
      { id: 'CPO-001-D3', orderId: 'CPO-001', productId: 'P-GYWJ-003', productCode: 'GYWJ-003', productName: '文件夹', unit: '件', contractQuantity: 5000, deliveredQuantity: 0, orderQuantity: 1200, unitPrice: 15.93, amount: 19116, deliveryDate: '2026-10-05' },
      { id: 'CPO-001-D4', orderId: 'CPO-001', productId: 'P-GYWJ-004', productCode: 'GYWJ-004', productName: '打印墨盒', unit: '个', contractQuantity: 300, deliveredQuantity: 0, orderQuantity: 60, unitPrice: 336.28, amount: 20177, deliveryDate: '2026-10-05' },
    ],
  },
  // ===== 链路 B：展台搭建订单（submitted）=====
  {
    id: 'CPO-002', orderNo: 'CPO20260920001',
    contractId: 'HT-002', contractNo: 'HT-202609002',
    contractName: '国际会展中心展台设计搭建服务合同',
    supplierId: 'SUP-002', supplierName: '华展展览服务有限公司',
    procurementDemandId: 'PD-002', procurementDemandNo: 'PD-202609002',
    projectName: '国际会展中心展台设计搭建',
    projectType: 'service_project',
    status: 'submitted',
    createTime: '2026-09-20 11:00:00', creator: '李四',
    submitTime: '2026-09-21 09:00:00',
    details: [
      { id: 'CPO-002-D1', orderId: 'CPO-002', productId: 'P-FW-001', productCode: 'FW-001', productName: '展台设计搭建服务', unit: '项', contractQuantity: 1, deliveredQuantity: 0, orderQuantity: 1, unitPrice: 424778, amount: 424778, deliveryDate: '2026-11-15' },
    ],
  },
  // ===== 链路 C：综合布线订单（draft，还没提交）=====
  {
    id: 'CPO-003', orderNo: 'CPO20260928001',
    contractId: 'HT-003', contractNo: 'HT-202609003',
    contractName: '新办公区综合布线及网络改造合同',
    supplierId: 'SUP-003', supplierName: '华东物资供应有限公司',
    procurementDemandId: 'PD-003', procurementDemandNo: 'PD-202609003',
    projectName: '新办公区综合布线及网络改造',
    projectType: 'implementation_project',
    status: 'draft',
    createTime: '2026-09-28 15:00:00', creator: '王五',
    details: [
      { id: 'CPO-003-D1', orderId: 'CPO-003', productId: 'P-GC-001', productCode: 'GC-001', productName: '六类网线', unit: '箱', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 200, unitPrice: 601.77, amount: 120354 },
      { id: 'CPO-003-D2', orderId: 'CPO-003', productId: 'P-GC-002', productCode: 'GC-002', productName: '24口千兆交换机', unit: '台', contractQuantity: 100, deliveredQuantity: 0, orderQuantity: 40, unitPrice: 2831.86, amount: 113274 },
    ],
  },
  // ===== 链路 D：服务器运维订单（cancelled，合同已终止）=====
  {
    id: 'CPO-004', orderNo: 'CPO20260910001',
    contractId: 'HT-005', contractNo: 'HT-202609005',
    contractName: '服务器运维托管服务合同（已终止）',
    supplierId: 'SUP-007', supplierName: '某倒闭的供应商',
    procurementDemandId: 'PD-005', procurementDemandNo: 'PD-202609005',
    projectName: '服务器运维托管服务',
    projectType: 'service_project',
    status: 'cancelled',
    createTime: '2026-09-10 09:00:00', creator: '孙七',
    submitTime: '2026-09-11 14:00:00',
    details: [
      { id: 'CPO-004-D1', orderId: 'CPO-004', productId: 'P-FW-002', productCode: 'FW-002', productName: '服务器运维服务', unit: '年', contractQuantity: 1, deliveredQuantity: 0, orderQuantity: 1, unitPrice: 284800, amount: 284800 },
    ],
    remark: '供应商经营异常，订单随合同一并取消',
  },
];

// ============================================================================
// 7. 招采项目验收（ProcurementInspection）
// ============================================================================

export const procurementInspections: ProcurementInspection[] = [
  // ===== 链路 A 继续：办公用品验收（approved）=====
  {
    id: 'PI-001', inspectionNo: 'PI-20261008001',
    orderId: 'CPO-001', orderNo: 'CPO20260915001',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    inspectionDate: '2026-10-08', inspector: '张三',
    status: 'approved',
    approveTime: '2026-10-09 10:30:00', approver: '陈总',
    remark: '框架合同清单内办公用品按合同规格验收',
    details: [
      { id: 'PI-001-D1', productId: 'P-GYWJ-001', productCode: 'GYWJ-001', productName: 'A4打印纸', unit: '箱', orderedQuantity: 500, inspectedQuantity: 500, passQuantity: 500, failQuantity: 0, isQualified: true },
      { id: 'PI-001-D2', productId: 'P-GYWJ-002', productCode: 'GYWJ-002', productName: '圆珠笔', unit: '盒', orderedQuantity: 800, inspectedQuantity: 800, passQuantity: 800, failQuantity: 0, isQualified: true },
      { id: 'PI-001-D3', productId: 'P-GYWJ-003', productCode: 'GYWJ-003', productName: '文件夹', unit: '件', orderedQuantity: 1200, inspectedQuantity: 1200, passQuantity: 1195, failQuantity: 5, isQualified: false, remark: '5件规格偏差' },
      { id: 'PI-001-D4', productId: 'P-GYWJ-004', productCode: 'GYWJ-004', productName: '打印墨盒', unit: '个', orderedQuantity: 60, inspectedQuantity: 60, passQuantity: 60, failQuantity: 0, isQualified: true },
    ],
  },
  // ===== 链路 B 继续：展台搭建验收（pending）=====
  {
    id: 'PI-002', inspectionNo: 'PI-20261118001',
    orderId: 'CPO-002', orderNo: 'CPO20260920001',
    supplierId: 'SUP-002', supplierName: '华展展览服务有限公司',
    inspectionDate: '2026-11-18', inspector: '李四',
    status: 'pending',
    remark: '展台设计搭建按合同标准验收',
    details: [
      { id: 'PI-002-D1', productId: 'P-FW-001', productCode: 'FW-001', productName: '展台设计搭建服务', unit: '项', orderedQuantity: 1, inspectedQuantity: 1, passQuantity: 1, failQuantity: 0, isQualified: true },
    ],
  },
  // ===== 草稿验收（draft）=====
  {
    id: 'PI-003', inspectionNo: '',
    supplierId: 'SUP-004', supplierName: '新视觉广告制作有限公司',
    inspectionDate: '2026-10-25', inspector: '王五',
    status: 'draft',
    details: [
      { id: 'PI-003-D1', productId: '', productCode: 'WL-TEST-001', productName: '展会物料测试', unit: '个', orderedQuantity: 100, inspectedQuantity: 100, passQuantity: 100, failQuantity: 0, isQualified: true },
    ],
  },
];

// ============================================================================
// 8. 考核评价模板（EvaluationTemplate）
// ============================================================================

const _ind = (id: string, name: string, cat: string, weight: number, maxScore = 10, desc?: string): EvaluationIndicator => ({
  id, name, category: cat, weight, maxScore, description: desc,
});

export const evaluationTemplates: EvaluationTemplate[] = [
  {
    id: 'TPL-001', name: '合同履约评价-办公用品类', type: 'contract_performance',
    indicators: [
      _ind('TPL-001-I1', '交付及时性', '交付履约', 25, 10, '是否按合同约定时间交付'),
      _ind('TPL-001-I2', '产品质量合格率', '交付履约', 25, 10, '交付产品符合合同规格要求的比例'),
      _ind('TPL-001-I3', '价格竞争力', '价格服务', 20, 10, '与同类供应商相比的价格水平'),
      _ind('TPL-001-I4', '售后服务响应', '价格服务', 15, 10, '质量问题响应速度及解决能力'),
      _ind('TPL-001-I5', '配合度', '价格服务', 15, 10, '与采购部门配合沟通的顺畅度'),
    ],
    totalWeight: 100, creator: '系统初始化', createTime: '2026-01-01 00:00:00', isBuiltin: true,
    description: '办公用品及通用物资类合同履约评价模板',
  },
  {
    id: 'TPL-002', name: '合同履约评价-服务工程类', type: 'contract_performance',
    indicators: [
      _ind('TPL-002-I1', '项目进度', '交付履约', 25, 10, '是否按合同约定里程碑完成'),
      _ind('TPL-002-I2', '交付成果质量', '交付履约', 30, 10, '交付成果是否符合技术规范要求'),
      _ind('TPL-002-I3', '现场管理', '服务质量', 15, 10, '施工/服务现场组织管理水平'),
      _ind('TPL-002-I4', '沟通配合', '服务质量', 15, 10, '与甲方沟通协调的效率'),
      _ind('TPL-002-I5', '安全合规', '安全合规', 15, 10, '施工/服务过程的安全合规情况'),
    ],
    totalWeight: 100, creator: '系统初始化', createTime: '2026-01-01 00:00:00', isBuiltin: true,
    description: '服务/工程类合同履约评价模板',
  },
  {
    id: 'TPL-003', name: '单个项目考核模板', type: 'project_single',
    indicators: [
      _ind('TPL-003-I1', '交付质量', '质量', 40),
      _ind('TPL-003-I2', '交付时效', '时效', 30),
      _ind('TPL-003-I3', '服务态度', '服务', 30),
    ],
    totalWeight: 100, creator: '系统初始化', createTime: '2026-01-01 00:00:00', isBuiltin: true,
  },
  {
    id: 'TPL-004', name: '季度考核模板', type: 'quarterly',
    indicators: [
      _ind('TPL-004-I1', '季度交付及时率', '交付', 35),
      _ind('TPL-004-I2', '季度质量合格率', '质量', 35),
      _ind('TPL-004-I3', '问题响应与解决', '服务', 30),
    ],
    totalWeight: 100, creator: '系统初始化', createTime: '2026-01-01 00:00:00', isBuiltin: true,
  },
  {
    id: 'TPL-005', name: '年度评价模板', type: 'yearly',
    indicators: [
      _ind('TPL-005-I1', '年度总交付量', '交付履约', 25),
      _ind('TPL-005-I2', '年度平均质量', '交付履约', 30),
      _ind('TPL-005-I3', '应急/特殊需求响应', '服务能力', 20),
      _ind('TPL-005-I4', '长期合作潜力', '综合能力', 25),
    ],
    totalWeight: 100, creator: '系统初始化', createTime: '2026-01-01 00:00:00', isBuiltin: true,
  },
];

// ============================================================================
// 9. 考核评价记录（EvaluationRecord）
// ============================================================================

const _score = (indicatorId: string, name: string, score: number, weight: number, maxScore = 10) => ({
  indicatorId, indicatorName: name, score, weight, weightedScore: Number((score * weight / maxScore).toFixed(1)),
});

export const evaluationRecords: EvaluationRecord[] = [
  // ===== 链路 C 完成：综合布线合同履约评价（completed）=====
  {
    id: 'EV-001',
    templateId: 'TPL-002', templateName: '合同履约评价-服务工程类',
    supplierId: 'SUP-003', supplierName: '华东物资供应有限公司',
    contractId: 'HT-003', contractNo: 'HT-202609003',
    projectName: '新办公区综合布线及网络改造',
    type: 'contract_performance',
    scores: [
      _score('TPL-002-I1', '项目进度', 9, 25),
      _score('TPL-002-I2', '交付成果质量', 9, 30),
      _score('TPL-002-I3', '现场管理', 8, 15),
      _score('TPL-002-I4', '沟通配合', 9, 15),
      _score('TPL-002-I5', '安全合规', 10, 15),
    ],
    totalScore: 88.5,
    evaluator: '技术部-孙八', evaluationDate: '2026-09-28',
    status: 'completed',
    approvalHistory: [
      { approver: '陈总', action: 'approved', time: '2026-09-29 14:00:00' },
    ],
    remark: '整体履约情况良好，现场管理规范',
  },
  // ===== 链路 A 进行中：办公用品合同履约评价（pending）=====
  {
    id: 'EV-002',
    templateId: 'TPL-001', templateName: '合同履约评价-办公用品类',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    contractId: 'HT-001', contractNo: 'HT-202609001',
    projectName: '2026年办公用品集中采购',
    type: 'contract_performance',
    scores: [
      _score('TPL-001-I1', '交付及时性', 9, 25),
      _score('TPL-001-I2', '产品质量合格率', 8, 25),
      _score('TPL-001-I3', '价格竞争力', 8, 20),
      _score('TPL-001-I4', '售后服务响应', 9, 15),
      _score('TPL-001-I5', '配合度', 9, 15),
    ],
    totalScore: 85.0,
    evaluator: '行政部-赵六', evaluationDate: '2026-10-10',
    status: 'pending',
    remark: '框架合同清单内产品稳定供应',
  },
  // ===== Q3 季度考核（completed）=====
  {
    id: 'EV-003',
    templateId: 'TPL-004', templateName: '季度考核模板',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    type: 'quarterly',
    scores: [
      _score('TPL-004-I1', '季度交付及时率', 9, 35),
      _score('TPL-004-I2', '季度质量合格率', 8, 35),
      _score('TPL-004-I3', '问题响应与解决', 9, 30),
    ],
    totalScore: 86.5,
    evaluator: '采购部-张三', evaluationDate: '2026-08-31',
    status: 'completed',
    approvalHistory: [
      { approver: '陈总', action: 'approved', time: '2026-09-01 10:00:00' },
    ],
    remark: '2026年Q3季度综合考核',
  },
  // ===== Q3 季度考核（draft）=====
  {
    id: 'EV-004',
    templateId: 'TPL-004', templateName: '季度考核模板',
    supplierId: 'SUP-002', supplierName: '华展展览服务有限公司',
    type: 'quarterly',
    scores: [
      _score('TPL-004-I1', '季度交付及时率', 8, 35),
      _score('TPL-004-I2', '季度质量合格率', 7, 35),
      _score('TPL-004-I3', '问题响应与解决', 8, 30),
    ],
    totalScore: 76.5,
    evaluator: '采购部-李四', evaluationDate: '2026-09-15',
    status: 'draft',
    remark: '2026年Q3季度考核草稿',
  },
  // ===== 单个项目考核（rejected，扣分依据不足）=====
  {
    id: 'EV-005',
    templateId: 'TPL-003', templateName: '单个项目考核模板',
    supplierId: 'SUP-004', supplierName: '新视觉广告制作有限公司',
    type: 'project_single',
    scores: [
      _score('TPL-003-I1', '交付质量', 6, 40),
      _score('TPL-003-I2', '交付时效', 5, 30),
      _score('TPL-003-I3', '服务态度', 7, 30),
    ],
    totalScore: 60.0,
    evaluator: '市场部-钱七', evaluationDate: '2026-07-15',
    status: 'rejected',
    approvalHistory: [
      { approver: '陈总', action: 'rejected', time: '2026-07-16 09:00:00', comment: '分数偏低，请补充扣分依据后重新提交' },
    ],
  },
  // ===== 年度评价（completed，优秀供应商）=====
  {
    id: 'EV-006',
    templateId: 'TPL-005', templateName: '年度评价模板',
    supplierId: 'SUP-003', supplierName: '华东物资供应有限公司',
    type: 'yearly',
    scores: [
      _score('TPL-005-I1', '年度总交付量', 9, 25),
      _score('TPL-005-I2', '年度平均质量', 8, 30),
      _score('TPL-005-I3', '应急/特殊需求响应', 9, 20),
      _score('TPL-005-I4', '长期合作潜力', 9, 25),
    ],
    totalScore: 85.5,
    evaluator: '采购部-王五', evaluationDate: '2026-09-10',
    status: 'completed',
    approvalHistory: [
      { approver: '陈总', action: 'approved', time: '2026-09-12 15:30:00' },
    ],
    remark: '2025年度优秀供应商',
  },
];
