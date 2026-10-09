/**
 * 验收功能测试演示数据
 * =========================================================
 * 覆盖 5 种完整业务链路（一切数据皆有源）：
 *
 *  1. 物资类(material)          → 全入库 → 可直接验收
 *  2. 物资类(material_non_eng)  → 部分入库 → 未全入库，不可直接验收
 *  3. 服务项目(service_project) → 有合同 → 可初验 / 可直接终验
 *  4. 非工程服务(service_non_eng) → 有合同 → 可初验 / 可直接终验
 *  5. 实施项目(implementation_project) → 有合同 → 可初验 / 可直接终验
 *
 *  业务链路：需求 → 订单 → 合同 → (物资类) 入库单
 * =========================================================
 */
import type {
  ProcurementDemand,
  ProcurementOrder,
  ContractLedger,
  InboundOrder,
} from '@/types';

// ============ 供应商（复用已有名称，避免冲突） ============
const SUP_MATERIAL = '晨光办公物资有限公司';
const SUP_SERVICE  = '展大师展览设计有限公司';
const SUP_CATERING = '北京优食餐饮管理有限公司';
const SUP_IMPL     = '启航信息科技有限公司';

// ============ 合同台账（3 份主合同 + 1 份补充协议演示累计） ============
export const INSPECTION_DEMO_CONTRACTS: ContractLedger[] = [
  // --- 合同 1：办公物资采购框架合同（物资类用） ---
  {
    id: 'CT-DEMO-001',
    contractId: 'CT-DEMO-001',
    contractNo: 'HT-2026FW001',
    contractName: '2026 年度办公物资采购框架合同',
    contractNature: 'procurement',
    contractTier: 'primary',
    contractType: 'non_engineering',
    formation: 'state_owned_framework',
    category: 'procurement',
    handlingDepartment: '行政部',
    handler: '张三',
        counterpartyName: SUP_MATERIAL,
    counterpartyContact: '李经理 13800001111',
    signingDate: '2025-12-20',
    effectiveDate: '2026-01-01',
    terminationDate: '2026-12-31',
    amount: 800000,
        status: 'active',
    isModelText: true,
      },
  // --- 合同 2：展台搭建服务合同（服务项目用，附补充协议演示） ---
  {
    id: 'CT-DEMO-002',
    contractId: 'CT-DEMO-002',
    contractNo: 'HT-2026FW002',
    contractName: '2026 年品牌展台设计搭建服务合同',
    contractNature: 'procurement',
    contractTier: 'primary',
    contractType: 'non_engineering',
    formation: 'state_owned_jingjia',
    category: 'exhibition_display',
    handlingDepartment: '会展部',
    handler: '王五',
        counterpartyName: SUP_SERVICE,
    counterpartyContact: '陈总监 13900002222',
    signingDate: '2026-03-10',
    effectiveDate: '2026-04-01',
    terminationDate: '2026-12-31',
    amount: 600000,
        status: 'active',
    isModelText: false,
      },
  // --- 补充协议：展台搭建合同延期 + 追加 ---
  {
    id: 'CT-DEMO-002-S1',
    contractId: 'CT-DEMO-002-S1',
    contractNo: 'HT-2026FW002-补001',
    contractName: '品牌展台搭建合同 补充协议（延期 + 金额追加）',
    contractNature: 'procurement',
    contractTier: 'supplement',
    parentContractId: 'CT-DEMO-002',
    supplementAmount: 120000,
    contractType: 'non_engineering',
    formation: 'state_owned_jingjia',
    category: 'exhibition_display',
    handlingDepartment: '会展部',
    handler: '王五',
        counterpartyName: SUP_SERVICE,
    counterpartyContact: '陈总监 13900002222',
    signingDate: '2026-07-15',
    effectiveDate: '2026-07-15',
    terminationDate: '2027-03-31',
    amount: 120000,
        status: 'active',
    isModelText: false,
      },
  // --- 合同 3：员工餐饮年度服务（非工程服务用） ---
  {
    id: 'CT-DEMO-003',
    contractId: 'CT-DEMO-003',
    contractNo: 'HT-2026FW003',
    contractName: '2026 年度员工午餐供应服务合同',
    contractNature: 'procurement',
    contractTier: 'primary',
    contractType: 'non_engineering',
    formation: 'state_owned_direct',
    category: 'procurement',
    handlingDepartment: '行政部',
    handler: '赵六',
        counterpartyName: SUP_CATERING,
    counterpartyContact: '王经理 13700003333',
    signingDate: '2025-12-28',
    effectiveDate: '2026-01-01',
    terminationDate: '2026-12-31',
    amount: 480000,
        status: 'active',
    isModelText: false,
      },
  // --- 合同 4：ERP 系统实施服务（实施项目用） ---
  {
    id: 'CT-DEMO-004',
    contractId: 'CT-DEMO-004',
    contractNo: 'HT-2026FW004',
    contractName: '会展业务管理系统 ERP 实施服务合同',
    contractNature: 'procurement',
    contractTier: 'primary',
    contractType: 'non_engineering',
    formation: 'state_owned_jingjia',
    category: 'procurement',
    handlingDepartment: '信息部',
    handler: '孙七',
        counterpartyName: SUP_IMPL,
    counterpartyContact: '刘架构师 13600004444',
    signingDate: '2026-04-20',
    effectiveDate: '2026-05-01',
    terminationDate: '2026-10-31',
    amount: 1200000,
        status: 'active',
    isModelText: false,
      },
];

// ============ 招采需求（5 种类型 × confirm_approved × 带 contractId） ============
export const INSPECTION_DEMO_DEMANDS: ProcurementDemand[] = [
  // --- 需求 1：物资类 - 全入库场景（可直接验收） ---
  {
    id: 'DEMO-DM-001',
    demandNo: 'DMP-20261001',
    demandType: 'material',
    businessCategory: 'engineering',
    procurementType: 'within_framework',
    procurementMode: 'application_form',
    applicant: '张三',
    applicantDept: '行政部',
    applyDate: '2026-09-28',
    projectName: 'Q4 办公物资采购（全入库已完成）',
    estimatedAmount: 85000,
    requiredDeliveryDate: '2026-10-05',
    reason: 'Q4 季度办公耗材集中采购',
    status: 'confirm_approved',
    createTime: '2026-09-28',
    contractId: 'CT-DEMO-001',
    contractNoSnapshot: 'HT-2026FW001',
        details: [
      { id: 'DD-DEMO-001-1', demandId: 'DEMO-DM-001', productCode: 'SKU-PAPER-A4', productName: 'A4 复印纸', unit: '包', quantity: 300, unitPriceExcludingTax: 28, amountExcludingTax: 8400 },
      { id: 'DD-DEMO-001-2', demandId: 'DEMO-DM-001', productCode: 'SKU-PEN-BALL', productName: '签字笔（黑色）', unit: '盒', quantity: 50, unitPriceExcludingTax: 25, amountExcludingTax: 1250 },
      { id: 'DD-DEMO-001-3', demandId: 'DEMO-DM-001', productCode: 'SKU-FOLDER', productName: '文件资料夹', unit: '个', quantity: 200, unitPriceExcludingTax: 15, amountExcludingTax: 3000 },
    ],
  },
  // --- 需求 2：物资类（非工程）- 部分入库场景（不可验收，演示前置校验） ---
  {
    id: 'DEMO-DM-002',
    demandNo: 'DMP-20261002',
    demandType: 'material_non_engineering',
    businessCategory: 'non_engineering',
    procurementType: 'within_framework',
    procurementMode: 'application_form',
    applicant: '李四',
    applicantDept: '市场部',
    applyDate: '2026-09-30',
    projectName: '市场宣传物料采购（仅部分入库）',
    estimatedAmount: 30000,
    requiredDeliveryDate: '2026-10-15',
    reason: '行业展会宣传物料准备',
    status: 'confirm_approved',
    createTime: '2026-09-30',
    contractId: 'CT-DEMO-001',
    contractNoSnapshot: 'HT-2026FW001',
        details: [
      { id: 'DD-DEMO-002-1', demandId: 'DEMO-DM-002', productCode: 'SKU-POSTER', productName: '宣传海报 A2', unit: '张', quantity: 100, unitPriceExcludingTax: 80, amountExcludingTax: 8000 },
      { id: 'DD-DEMO-002-2', demandId: 'DEMO-DM-002', productCode: 'SKU-BANNER', productName: '展架横幅 3x1.5m', unit: '条', quantity: 20, unitPriceExcludingTax: 300, amountExcludingTax: 6000 },
    ],
  },
  // --- 需求 3：服务项目 - 展台搭建（有合同，可初验/终验） ---
  {
    id: 'DEMO-DM-003',
    demandNo: 'DMP-20261003',
    demandType: 'service_project',
    businessCategory: 'engineering',
    procurementType: 'outside_framework',
    procurementMode: 'meeting',
    applicant: '王五',
    applicantDept: '会展部',
    applyDate: '2026-09-15',
    projectName: '2026 金融博览会品牌展台设计搭建',
    estimatedAmount: 350000,
    requiredDeliveryDate: '2026-11-10',
    reason: '年度最大展会品牌展示',
    status: 'confirm_approved',
    createTime: '2026-09-15',
    contractId: 'CT-DEMO-002',
    contractNoSnapshot: 'HT-2026FW002',
        projectRows: [
      { id: 'PR-DEMO-003-1', dept: '会展部', projectName: '展台方案设计', mainContent: '含 3D 效果图、材质清单、结构安全评估', budgetAmount: 50000, budgetControlAmount: 48000, approvalDate: '2026-09-20' },
      { id: 'PR-DEMO-003-2', dept: '会展部', projectName: '展台主体搭建', mainContent: '200 平米双层结构展台，含灯带、互动屏', budgetAmount: 200000, budgetControlAmount: 195000, approvalDate: '2026-09-20' },
      { id: 'PR-DEMO-003-3', dept: '会展部', projectName: '展期现场保障', mainContent: '展期 4 天现场值守 + 撤展清运', budgetAmount: 100000, budgetControlAmount: 95000, approvalDate: '2026-09-20' },
    ],
    details: [],
  },
  // --- 需求 4：非工程服务 - 员工餐饮 ---
  {
    id: 'DEMO-DM-004',
    demandNo: 'DMP-20261004',
    demandType: 'service_non_engineering',
    businessCategory: 'non_engineering',
    procurementType: 'within_framework',
    procurementMode: 'application_form',
    applicant: '赵六',
    applicantDept: '行政部',
    applyDate: '2026-09-25',
    projectName: '2026 Q4 员工午餐供应服务',
    estimatedAmount: 120000,
    reason: '年度框架合同内执行',
    status: 'confirm_approved',
    createTime: '2026-09-25',
    contractId: 'CT-DEMO-003',
    contractNoSnapshot: 'HT-2026FW003',
        projectRows: [
      { id: 'PR-DEMO-004-1', dept: '行政部', projectName: 'Q4 月度供餐', mainContent: '工作日午餐，标准 30 元/人，日均 150 人', budgetAmount: 120000, budgetControlAmount: 118000, approvalDate: '2026-09-28' },
    ],
    details: [],
  },
  // --- 需求 5：实施项目 - ERP 系统 ---
  {
    id: 'DEMO-DM-005',
    demandNo: 'DMP-20261005',
    demandType: 'implementation_project',
    businessCategory: 'non_engineering',
    procurementType: 'outside_framework',
    procurementMode: 'meeting',
    applicant: '孙七',
    applicantDept: '信息部',
    applyDate: '2026-09-20',
    projectName: '会展业务管理 ERP 系统实施',
    estimatedAmount: 950000,
    reason: '业务系统升级换代',
    status: 'confirm_approved',
    createTime: '2026-09-20',
    contractId: 'CT-DEMO-004',
    contractNoSnapshot: 'HT-2026FW004',
        projectRows: [
      { id: 'PR-DEMO-005-1', dept: '信息部', projectName: '需求调研与蓝图设计', mainContent: '业务访谈、需求规格书、整体蓝图', budgetAmount: 200000, budgetControlAmount: 195000, approvalDate: '2026-09-25' },
      { id: 'PR-DEMO-005-2', dept: '信息部', projectName: '系统配置与定制开发', mainContent: '基础配置 + 核心模块定制 + 接口开发', budgetAmount: 500000, budgetControlAmount: 490000, approvalDate: '2026-09-25' },
      { id: 'PR-DEMO-005-3', dept: '信息部', projectName: '用户培训与上线切换', mainContent: '管理员培训 + 最终用户培训 + 数据迁移 + 上线支持', budgetAmount: 250000, budgetControlAmount: 245000, approvalDate: '2026-09-25' },
    ],
    details: [],
  },
];

// ============ 采购订单（5 条，每条关联上面的需求） ============
export const INSPECTION_DEMO_ORDERS: ProcurementOrder[] = [
  // 订单 1：物资类，deliveredQuantity === quantity（全入库）
  {
    id: 'ORD-DEMO-001',
    orderNo: 'CGDD-202610001',
    demandId: 'DEMO-DM-001',
    demandNo: 'DMP-20261001',
    contractId: 'CT-DEMO-001',
    contractNo: 'HT-2026FW001',
    supplierId: 'SUP-MAT-001',
    supplierName: SUP_MATERIAL,
    status: 'approved',
    createTime: '2026-10-01',
    creator: '张三',
    handlingDepartment: '行政部',
    details: [
      { id: 'OD-DEMO-001-1', orderId: 'ORD-DEMO-001', productId: 'SKU-PAPER-A4', productCode: 'SKU-PAPER-A4', productName: 'A4 复印纸', specification: '70g 500张/包', unit: '包', quantity: 300, deliveredQuantity: 300, unitPrice: 28, amount: 8400 },
      { id: 'OD-DEMO-001-2', orderId: 'ORD-DEMO-001', productId: 'SKU-PEN-BALL', productCode: 'SKU-PEN-BALL', productName: '签字笔（黑色）', specification: '0.5mm 12支/盒', unit: '盒', quantity: 50, deliveredQuantity: 50, unitPrice: 25, amount: 1250 },
      { id: 'OD-DEMO-001-3', orderId: 'ORD-DEMO-001', productId: 'SKU-FOLDER', productCode: 'SKU-FOLDER', productName: '文件资料夹', specification: 'A4 双夹', unit: '个', quantity: 200, deliveredQuantity: 200, unitPrice: 15, amount: 3000 },
    ],
  },
  // 订单 2：物资类（非工程），deliveredQuantity < quantity（部分入库，未全）
  {
    id: 'ORD-DEMO-002',
    orderNo: 'CGDD-202610002',
    demandId: 'DEMO-DM-002',
    demandNo: 'DMP-20261002',
    contractId: 'CT-DEMO-001',
    contractNo: 'HT-2026FW001',
    supplierId: 'SUP-MAT-001',
    supplierName: SUP_MATERIAL,
    status: 'approved',
    createTime: '2026-10-02',
    creator: '李四',
    handlingDepartment: '市场部',
    details: [
      { id: 'OD-DEMO-002-1', orderId: 'ORD-DEMO-002', productId: 'SKU-POSTER', productCode: 'SKU-POSTER', productName: '宣传海报 A2', specification: '铜版纸 250g', unit: '张', quantity: 100, deliveredQuantity: 60, unitPrice: 80, amount: 8000 },
      { id: 'OD-DEMO-002-2', orderId: 'ORD-DEMO-002', productId: 'SKU-BANNER', productCode: 'SKU-BANNER', productName: '展架横幅 3x1.5m', specification: 'PVC 喷绘', unit: '条', quantity: 20, deliveredQuantity: 10, unitPrice: 300, amount: 6000 },
    ],
  },
  // 订单 3：服务项目（无 deliveredQuantity 概念）
  {
    id: 'ORD-DEMO-003',
    orderNo: 'CGDD-202610003',
    demandId: 'DEMO-DM-003',
    demandNo: 'DMP-20261003',
    contractId: 'CT-DEMO-002',
    contractNo: 'HT-2026FW002',
    supplierId: 'SUP-SVC-001',
    supplierName: SUP_SERVICE,
    status: 'sent',
    createTime: '2026-10-05',
    creator: '王五',
    handlingDepartment: '会展部',
    details: [],
  },
  // 订单 4：非工程服务
  {
    id: 'ORD-DEMO-004',
    orderNo: 'CGDD-202610004',
    demandId: 'DEMO-DM-004',
    demandNo: 'DMP-20261004',
    contractId: 'CT-DEMO-003',
    contractNo: 'HT-2026FW003',
    supplierId: 'SUP-FOOD-001',
    supplierName: SUP_CATERING,
    status: 'approved',
    createTime: '2026-10-01',
    creator: '赵六',
    handlingDepartment: '行政部',
    details: [],
  },
  // 订单 5：实施项目
  {
    id: 'ORD-DEMO-005',
    orderNo: 'CGDD-202610005',
    demandId: 'DEMO-DM-005',
    demandNo: 'DMP-20261005',
    contractId: 'CT-DEMO-004',
    contractNo: 'HT-2026FW004',
    supplierId: 'SUP-IMPL-001',
    supplierName: SUP_IMPL,
    status: 'sent',
    createTime: '2026-09-25',
    creator: '孙七',
    handlingDepartment: '信息部',
    details: [],
  },
];

// ============ 仓库入库单（2 条，关联物资类订单） ============
// 入库单 1：对应 ORD-DEMO-001 全部入库
// 入库单 2：对应 ORD-DEMO-002 部分入库（60/100 海报，10/20 横幅）
export const INSPECTION_DEMO_INBOUNDS: Partial<InboundOrder>[] = [
  {
    id: 'INB-DEMO-001',
    orderNo: 'CGDD-202610001',
    supplierName: SUP_MATERIAL,
    warehouseName: '总部主仓',
    type: 'purchase',
    status: 'confirmed',
    confirmTime: '2026-10-03 14:30',
    confirmer: '仓管员-周八',
    details: [
      { id: 'INBD-001-1', inboundOrderId: 'INB-DEMO-001', productId: 'SKU-PAPER-A4', productName: 'A4 复印纸', specification: '70g 500张/包', unit: '包', quantity: 300, positionName: 'A-01-01' },
      { id: 'INBD-001-2', inboundOrderId: 'INB-DEMO-001', productId: 'SKU-PEN-BALL', productName: '签字笔（黑色）', specification: '0.5mm 12支/盒', unit: '盒', quantity: 50, positionName: 'A-01-02' },
      { id: 'INBD-001-3', inboundOrderId: 'INB-DEMO-001', productId: 'SKU-FOLDER', productName: '文件资料夹', specification: 'A4 双夹', unit: '个', quantity: 200, positionName: 'A-02-05' },
    ],
  },
  {
    id: 'INB-DEMO-002',
    orderNo: 'CGDD-202610002',
    supplierName: SUP_MATERIAL,
    warehouseName: '总部主仓',
    type: 'purchase',
    status: 'confirmed',
    confirmTime: '2026-10-04 10:15',
    confirmer: '仓管员-周八',
    details: [
      { id: 'INBD-002-1', inboundOrderId: 'INB-DEMO-002', productId: 'SKU-POSTER', productName: '宣传海报 A2', specification: '铜版纸 250g', unit: '张', quantity: 60, positionName: 'B-03-01' },
      { id: 'INBD-002-2', inboundOrderId: 'INB-DEMO-002', productId: 'SKU-BANNER', productName: '展架横幅 3x1.5m', specification: 'PVC 喷绘', unit: '条', quantity: 10, positionName: 'B-03-02' },
    ],
  },
];




