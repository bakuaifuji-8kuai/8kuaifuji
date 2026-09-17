// ============================================================================
// 招采全链路 Demo 数据（2026-09-17 重建）
// 上下游严格闭环，一切数据皆有源
// ============================================================================

import type {
  ProcurementDemand,
  ContractLedger,
  ContractPurchaseOrder,
  ProcurementInspection,
  EvaluationTemplate,
  EvaluationRecord,
  EvaluationIndicator,
} from '@/types';

// ----------------------------------------------------------------------------
// 1. 招采需求申请
// ----------------------------------------------------------------------------

export const procurementDemands: ProcurementDemand[] = [
  // ===== 链路 A：物资采购 + 清单内 + 会议审批 → confirm_approved =====
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

  // ===== 链路 B：服务项目 + 清单外 + 签报审批 → confirm_approved =====
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
      { id: 'PDR-002-1', dept: '市场部', projectName: '国际会展中心展台设计搭建',
        mainContent: '展台36㎡特装设计、制作、现场搭建及展后拆除',
        budgetAmount: 480000, budgetControlAmount: 500000, approvalDate: '2026-09-08', remark: '展会特装预算' },
    ],
    details: [
      { id: 'PD-002-D1', demandId: 'PD-002', productCode: 'FW-001', productName: '展台设计搭建服务', unit: '项', quantity: 1, specification: '36㎡特装 含设计/制作/搭建/拆除', unitPriceIncludingTax: 424778, taxRate: 0.06, amountIncludingTax: 424778 },
    ],
  },

  // ===== 链路 C：实施项目 + 新增供应商 + 采购项目申请表 → confirm_approved =====
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
      { id: 'PDR-003-1', dept: '技术部', projectName: '新办公区综合布线及网络改造',
        mainContent: '综合布线、机房建设、网络设备安装、WiFi覆盖、系统联调',
        budgetAmount: 1250000, budgetControlAmount: 1300000, approvalDate: '2026-09-14' },
    ],
    details: [
      { id: 'PD-003-D1', demandId: 'PD-003', productCode: 'GC-001', productName: '六类网线', unit: '箱', quantity: 200, specification: '305m/箱', unitPriceIncludingTax: 680, taxRate: 0.13, amountIncludingTax: 136000 },
      { id: 'PD-003-D2', demandId: 'PD-003', productCode: 'GC-002', productName: '24口千兆交换机', unit: '台', quantity: 40, specification: 'H3C S5130-28P', unitPriceIncludingTax: 3200, taxRate: 0.13, amountIncludingTax: 128000 },
      { id: 'PD-003-D3', demandId: 'PD-003', productCode: 'GC-003', productName: '无线AP', unit: '台', quantity: 60, specification: 'TP-LINK WAP712H', unitPriceIncludingTax: 1180, taxRate: 0.13, amountIncludingTax: 70800 },
    ],
  },

  // ===== 链路 D：物资采购 + 清单外 → draft =====
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

  // ===== 链路 E：变更中（relatedOrderId 已被下游引用）=====
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
      { id: 'PDR-005-1', dept: 'IT部', projectName: '服务器运维托管服务',
        mainContent: '服务器托管及7×24小时运维', budgetAmount: 320000, budgetControlAmount: 350000, approvalDate: '2026-08-24' },
    ],
    details: [
      { id: 'PD-005-D1', demandId: 'PD-005', productCode: 'FW-002', productName: '服务器运维服务', unit: '年', quantity: 1, specification: '7×24小时 年度服务', unitPriceIncludingTax: 301887, taxRate: 0.06, amountIncludingTax: 301887 },
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
];

// ----------------------------------------------------------------------------
// 2. 合同台账
// ----------------------------------------------------------------------------

export const contractLedgers: ContractLedger[] = [
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
    biddingId: 'BP-001', biddingNo: 'BP-202609001',
    projectName: '2026年办公用品集中采购',
  },
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
    biddingId: 'BP-002', biddingNo: 'BP-202609002',
    projectName: '国际会展中心展台设计搭建',
    guaranteeEvaluation: { isOpen: true, guaranteeType: '履约保证金' },
  },
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
    biddingId: 'BP-003', biddingNo: 'BP-202609003',
    projectName: '新办公区综合布线及网络改造',
  },
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
    biddingId: 'BP-005', biddingNo: 'BP-202609005',
    projectName: '服务器运维托管服务',
    remark: '因供应商经营异常终止合同',
  },
  {
    id: 'HT-006', contractId: 'HT-006', contractNo: 'HT-202609006',
    contractName: '员工餐厅食材供应框架合同（审批中）',
    contractNature: 'procurement', category: 'procurement',
    contractType: 'non_engineering', formation: 'state_owned_framework',
    demandDepartment: '行政部', handlingDepartment: '采购部',
    handler: '周八', handlerContact: '0731-88881006',
    counterpartyName: '新视觉广告制作有限公司', counterpartyContact: '赵姐',
    mainContent: '员工餐厅食材框架合同，清单内采购',
    amount: 80,
    archiveStatus: 'not_started',
    status: 'pending',
  },
];

// ----------------------------------------------------------------------------
// 3. 招采订单
// ----------------------------------------------------------------------------

export const contractPurchaseOrders: ContractPurchaseOrder[] = [
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
      { id: 'CPO-001-D1', orderId: 'CPO-001', productId: 'P-GYWJ-001', productCode: 'GYWJ-001', productName: 'A4打印纸', unit: '箱', contractQuantity: 2000, deliveredQuantity: 0, orderQuantity: 500, unitPrice: 110.62, amount: 55310, deliveryDate: '2026-10-05' },
      { id: 'CPO-001-D2', orderId: 'CPO-001', productId: 'P-GYWJ-002', productCode: 'GYWJ-002', productName: '圆珠笔', unit: '盒', contractQuantity: 3000, deliveredQuantity: 0, orderQuantity: 800, unitPrice: 21.24, amount: 16992, deliveryDate: '2026-10-05' },
      { id: 'CPO-001-D3', orderId: 'CPO-001', productId: 'P-GYWJ-003', productCode: 'GYWJ-003', productName: '文件夹', unit: '件', contractQuantity: 5000, deliveredQuantity: 0, orderQuantity: 1200, unitPrice: 15.93, amount: 19116, deliveryDate: '2026-10-05' },
      { id: 'CPO-001-D4', orderId: 'CPO-001', productId: 'P-GYWJ-004', productCode: 'GYWJ-004', productName: '打印墨盒', unit: '个', contractQuantity: 300, deliveredQuantity: 0, orderQuantity: 60, unitPrice: 336.28, amount: 20177, deliveryDate: '2026-10-05' },
    ],
  },
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
  {
    id: 'CPO-003', orderNo: 'CPO20260922001',
    contractId: 'HT-003', contractNo: 'HT-202609003',
    contractName: '新办公区综合布线及网络改造合同',
    supplierId: 'SUP-003', supplierName: '华东物资供应有限公司',
    procurementDemandId: 'PD-003', procurementDemandNo: 'PD-202609003',
    projectName: '新办公区综合布线及网络改造',
    projectType: 'implementation_project',
    status: 'draft',
    createTime: '2026-09-22 15:00:00', creator: '王五',
    details: [
      { id: 'CPO-003-D1', orderId: 'CPO-003', productId: 'P-GC-001', productCode: 'GC-001', productName: '六类网线', unit: '箱', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 200, unitPrice: 601.77, amount: 120354 },
      { id: 'CPO-003-D2', orderId: 'CPO-003', productId: 'P-GC-002', productCode: 'GC-002', productName: '24口千兆交换机', unit: '台', contractQuantity: 100, deliveredQuantity: 0, orderQuantity: 40, unitPrice: 2831.86, amount: 113274 },
    ],
  },
  {
    id: 'CPO-004', orderNo: 'CPO20260910001',
    contractId: 'HT-005', contractNo: 'HT-202609005',
    contractName: '服务器运维托管服务合同（已终止）',
    supplierId: 'SUP-999', supplierName: '某倒闭的供应商',
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

// ----------------------------------------------------------------------------
// 4. 招采项目验收
// ----------------------------------------------------------------------------

export const procurementInspections: ProcurementInspection[] = [
  {
    id: 'PI-001', inspectionNo: 'PI-20260920001',
    orderId: 'CPO-001', orderNo: 'CPO20260915001',
    supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司',
    inspectionDate: '2026-09-20', inspector: '张三',
    status: 'approved',
    approveTime: '2026-09-21 10:30:00', approver: '陈总',
    remark: '框架合同清单内办公用品按合同规格验收',
    details: [
      { id: 'PI-001-D1', productId: 'P-GYWJ-001', productCode: 'GYWJ-001', productName: 'A4打印纸', unit: '箱', orderedQuantity: 500, inspectedQuantity: 500, passQuantity: 500, failQuantity: 0, isQualified: true },
      { id: 'PI-001-D2', productId: 'P-GYWJ-002', productCode: 'GYWJ-002', productName: '圆珠笔', unit: '盒', orderedQuantity: 800, inspectedQuantity: 800, passQuantity: 800, failQuantity: 0, isQualified: true },
      { id: 'PI-001-D3', productId: 'P-GYWJ-003', productCode: 'GYWJ-003', productName: '文件夹', unit: '件', orderedQuantity: 1200, inspectedQuantity: 1200, passQuantity: 1195, failQuantity: 5, isQualified: false, remark: '5件规格偏差' },
      { id: 'PI-001-D4', productId: 'P-GYWJ-004', productCode: 'GYWJ-004', productName: '打印墨盒', unit: '个', orderedQuantity: 60, inspectedQuantity: 60, passQuantity: 60, failQuantity: 0, isQualified: true },
    ],
  },
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
  {
    id: 'PI-003', inspectionNo: '',
    supplierId: 'SUP-004', supplierName: '新视觉广告制作有限公司',
    inspectionDate: '2026-09-25', inspector: '王五',
    status: 'draft',
    details: [
      { id: 'PI-003-D1', productId: '', productCode: 'WL-TEST-001', productName: '测试物料', unit: '个', orderedQuantity: 100, inspectedQuantity: 100, passQuantity: 100, failQuantity: 0, isQualified: true },
    ],
  },
];

// ----------------------------------------------------------------------------
// 5. 考核评价模板
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// 6. 考核评价记录
// ----------------------------------------------------------------------------

const _score = (indicatorId: string, name: string, score: number, weight: number, maxScore = 10) => ({
  indicatorId, indicatorName: name, score, weight, weightedScore: Number((score * weight / maxScore).toFixed(1)),
});

export const evaluationRecords: EvaluationRecord[] = [
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
    evaluator: '技术部-孙八', evaluationDate: '2026-09-25',
    status: 'completed',
    approvalHistory: [
      { approver: '陈总', action: 'approved', time: '2026-09-26 14:00:00' },
    ],
    remark: '整体履约情况良好，现场管理规范',
  },
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
    evaluator: '行政部-赵六', evaluationDate: '2026-09-22',
    status: 'pending',
    remark: '框架合同清单内产品稳定供应',
  },
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
