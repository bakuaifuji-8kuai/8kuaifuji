// =====================================================================
// 招采需求场景模板 —— 14 种组合的演示数据
// 用途：需求场景模板页面（只读展示）
// =====================================================================

import type { ProcurementDemandType, ProcurementType } from '@/types';

export interface SceneMockDetail {
  id: string;
  // 物资明细字段
  productCode?: string;
  productName?: string;
  productType?: string;
  productAttribute?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unitPriceExcludingTax?: number;
  unitPriceIncludingTax?: number;
  taxRate?: number;
  amountExcludingTax?: number;
  amountIncludingTax?: number;
  taxAmount?: number;
  stockQuantity?: number;
  contractNo?: string;
  contractExpiryDate?: string;
  isInContractList?: boolean;
  isContractItem?: boolean;
  projectNo?: string;
  projectName?: string;
  unitPriceRemark?: string;
  procurementDescription?: string;
  remark?: string;
  // 项目多行表字段
  dept?: string;
  mainContent?: string;
  budgetAmount?: number;
}

export interface SceneMock {
  // 场景定位
  demandType: ProcurementDemandType;
  procurementType: ProcurementType;
  // 表单预置
  form: {
    applicationNo: string;
    projectName: string;
    applicant: string;
    applicantDept: string;
    applyReason: string;
    businessCategory: 'engineering' | 'non_engineering';
    subType: 'construction' | 'service' | 'goods';
  };
  // 顶部说明
  description: string;
  // 明细行（物资类用 details 数组，项目类用 projectRows）
  details?: SceneMockDetail[];
  projectRows?: SceneMockDetail[];
}

// =====================================================================
// 14 种场景
// =====================================================================

export const SCENE_MOCKS: Record<string, SceneMock> = {
  // ==================== 工程类 / 货物（物资采购 material）====================
  'engineering-goods-within': {
    demandType: 'material',
    procurementType: 'within_framework',
    form: {
      applicationNo: 'CGQQ-20261024-001',
      projectName: '2026 年度展馆装修材料采购',
      applicant: '张三',
      applicantDept: '会展运营部',
      applyReason: '11月 A 馆升级改造，需采购墙面涂料、吊顶龙骨、门窗等装修材料，部分已在 2026-001 框架合同清单内。',
      businessCategory: 'engineering',
      subType: 'goods',
    },
    description: '【清单内采购】场景：合同物资已锁定编码/名称/单价/税率/合同编号，列宽表显示含"合同清单内外/合同编号/合同有效期/税率/税额/含税金额/库存数量"等完整列；含锁定行（灰底+不可编辑）与非锁定行的对比。',
    details: [
      {
        id: 'd1', productCode: 'P00001', productName: '立邦净味全效涂料（白色）', productType: '墙面涂料',
        productAttribute: '工程类-乙供', specification: '20L/桶', unit: '桶', quantity: 50,
        unitPriceExcludingTax: 168.00, unitPriceIncludingTax: 190.08, taxRate: 13,
        amountExcludingTax: 8400, amountIncludingTax: 9504, taxAmount: 1104,
        stockQuantity: 30, contractNo: 'CHT-2026-001', contractExpiryDate: '2026-12-31',
        isInContractList: true, isContractItem: true,
        projectNo: 'XM-2026-001', projectName: 'A馆墙面翻新工程',
        unitPriceRemark: '合同固定单价，有效期至2026年底', procurementDescription: 'A馆主通道墙面涂料',
      },
      {
        id: 'd2', productCode: 'P00015', productName: '国标轻钢龙骨（60主龙）', productType: '吊顶龙骨',
        productAttribute: '工程类-乙供', specification: '60系列主龙 0.8mm', unit: 'm', quantity: 2000,
        unitPriceExcludingTax: 12.50, unitPriceIncludingTax: 14.13, taxRate: 13,
        amountExcludingTax: 25000, amountIncludingTax: 28250, taxAmount: 3250,
        stockQuantity: 1200, contractNo: 'CHT-2026-001', contractExpiryDate: '2026-12-31',
        isInContractList: true, isContractItem: true,
        projectNo: 'XM-2026-001', projectName: 'A馆吊顶翻新工程',
        unitPriceRemark: '框架协议价', procurementDescription: 'A馆吊顶龙骨',
      },
      {
        id: 'd3', productCode: 'P00032', productName: '隔热断桥铝合金窗（60系列）', productType: '门窗',
        productAttribute: '工程类-乙供', specification: '60系列断桥隔热 壁厚1.4mm', unit: '㎡', quantity: 150,
        unitPriceExcludingTax: 480.00, unitPriceIncludingTax: 542.40, taxRate: 13,
        amountExcludingTax: 72000, amountIncludingTax: 81360, taxAmount: 9360,
        stockQuantity: 0, contractNo: 'CHT-2025-008', contractExpiryDate: '2026-06-30',
        isInContractList: false, isContractItem: false,
        projectNo: 'XM-2026-001', projectName: 'A馆门窗改造工程',
        unitPriceRemark: '旧合同到期，本次走清单外', procurementDescription: 'A馆落地窗改造',
      },
    ],
  },

  'engineering-goods-outside': {
    demandType: 'material',
    procurementType: 'outside_framework',
    form: {
      applicationNo: 'CGQQ-20261024-002',
      projectName: 'B 馆临时展具采购',
      applicant: '李四',
      applicantDept: '展览服务部',
      applyReason: '11 月智能制造展需一批定制展具，均不在当前框架合同清单内，走清单外采购。',
      businessCategory: 'engineering',
      subType: 'goods',
    },
    description: '【清单外采购】场景：无合同关联，列窄表显示（无"合同编号/合同有效期/税率/税额/含税金额"列），单价可手填，含单价备注/库存数量/采购情况说明。',
    details: [
      {
        id: 'd1', productCode: 'P00055', productName: '定制展台背景板（3m×2.5m）',
        productType: '展具', productAttribute: '定制展具', specification: '3000×2500mm 写真+KT板',
        unit: '套', quantity: 8, unitPriceExcludingTax: 650.00,
        amountExcludingTax: 5200,
        stockQuantity: 0, projectNo: 'XM-2026-005', projectName: '智能制造展 B馆布置',
        unitPriceRemark: '含设计费', procurementDescription: '8 家参展商各 1 套',
      },
      {
        id: 'd2', productCode: 'P00056', productName: '铝合金折叠洽谈桌（1.2m）',
        productType: '展具', productAttribute: '标准展具', specification: '1200×600×750mm 白色',
        unit: '张', quantity: 30, unitPriceExcludingTax: 180.00,
        amountExcludingTax: 5400,
        stockQuantity: 12, projectNo: 'XM-2026-005', projectName: '智能制造展 B馆布置',
        unitPriceRemark: '市场参考价', procurementDescription: '洽谈区用',
      },
      {
        id: 'd3', productCode: 'P00057', productName: '资料架（A4 四层）',
        productType: '展具', productAttribute: '标准展具', specification: '210×297mm 四层金属',
        unit: '个', quantity: 20, unitPriceExcludingTax: 85.00,
        amountExcludingTax: 1700,
        stockQuantity: 5, projectNo: 'XM-2026-005', projectName: '智能制造展 B馆布置',
        unitPriceRemark: '', procurementDescription: '各展位入口放置',
      },
    ],
  },

  'engineering-goods-new': {
    demandType: 'material',
    procurementType: 'new_supplier',
    form: {
      applicationNo: 'CGQQ-20261024-003',
      projectName: '首次采购：新型环保建材试点',
      applicant: '王五',
      applicantDept: '技术部',
      applyReason: '试用新型环保涂料，供应商未在现有框架合同名录内，需走新增供应商目录采购。',
      businessCategory: 'engineering',
      subType: 'goods',
    },
    description: '【新增供应商目录】场景：极简预算版双表头（项目信息 + 采购申请），砍含税/合同列，单价全手填；库存数量黄色高亮；可导入清单。',
    details: [
      {
        id: 'd1', productCode: 'P00099', productName: '新型生物基环保涂料（米白色）',
        productType: '墙面涂料', productAttribute: '工程类-乙供-新供应商', specification: '20L/桶 VOC≤10g/L',
        unit: '桶', quantity: 20, unitPriceExcludingTax: 320.00,
        amountExcludingTax: 6400,
        stockQuantity: 0, projectNo: 'XM-2026-008', projectName: '环保建材试点项目',
        unitPriceRemark: '新供应商首次报价，可议价', procurementDescription: '技术部试点，面积约 400㎡',
      },
      {
        id: 'd2', productCode: 'P00100', productName: '可回收模块化展墙',
        productType: '展墙系统', productAttribute: '定制-新供应商', specification: '2.4m×0.6m 铝合金框架+可回收面板',
        unit: '㎡', quantity: 100, unitPriceExcludingTax: 280.00,
        amountExcludingTax: 28000,
        stockQuantity: 0, projectNo: 'XM-2026-008', projectName: '环保建材试点项目',
        unitPriceRemark: '供应商：绿色展具科技有限公司', procurementDescription: '试点采购，后续可批量',
      },
    ],
  },

  // ==================== 工程类 / 施工（实施项目 implementation_project） —— 仅 new_supplier ====================
  'engineering-construction-new': {
    demandType: 'implementation_project',
    procurementType: 'new_supplier',
    form: {
      applicationNo: 'CGQQ-20261024-004',
      projectName: 'D 馆消防系统升级工程',
      applicant: '赵六',
      applicantDept: '安全管理部',
      applyReason: 'D 馆消防系统已运行 8 年，需整体升级改造；实施项目类只能走新增供应商目录。',
      businessCategory: 'engineering',
      subType: 'construction',
    },
    description: '【工程类/施工】场景：明细表为"项目多行表"（非物资明细），每行一个施工子项目，填需求部门/项目名称/主要内容/不含税预算总金额/备注；施工类仅允许"新增供应商目录"采购。',
    projectRows: [
      {
        id: 'p1', dept: '安全管理部', projectName: 'D馆喷淋系统更换',
        mainContent: '更换 D 馆 1-3 层全部喷淋头（约 1200 个），配套管网压力测试',
        budgetAmount: 120000, remark: '含人工、材料、机械',
      },
      {
        id: 'p2', dept: '安全管理部', projectName: 'D馆烟感报警器更换',
        mainContent: '更换 D 馆全部烟感（约 800 个），同步更新消防主机程序',
        budgetAmount: 80000, remark: '含 3 年质保',
      },
      {
        id: 'p3', dept: '安全管理部', projectName: 'D馆防火门更换',
        mainContent: '更换 D 馆 28 樘甲级防火门（含闭门器、顺序器）',
        budgetAmount: 56000, remark: '需消防验收合格',
      },
    ],
  },

  // ==================== 工程类 / 服务（服务项目 service_project）====================
  'engineering-service-within': {
    demandType: 'service_project',
    procurementType: 'within_framework',
    form: {
      applicationNo: 'CGQQ-20261024-005',
      projectName: '2026 年度展馆安保服务项目',
      applicant: '张三',
      applicantDept: '综合管理部',
      applyReason: '2026 年度展馆日常安保，服务供应商已在 CHT-2026-003 框架合同内。',
      businessCategory: 'engineering',
      subType: 'service',
    },
    description: '【工程类/服务 + 清单内】场景：明细表为"项目多行表"（同施工类结构），但框架类型可三选一；服务项目多行表字段：需求部门/项目名称/主要内容/不含税预算总金额/备注。',
    projectRows: [
      {
        id: 'p1', dept: '综合管理部', projectName: '展馆日常安保服务',
        mainContent: '24 小时巡逻 + 出入口岗亭 + 监控中心值守，日均 8 名安保人员',
        budgetAmount: 720000, remark: '合同价 ¥ 60 万/年，预算 ¥ 72 万含加班费',
      },
      {
        id: 'p2', dept: '综合管理部', projectName: '大型展会期间安保增援',
        mainContent: '展会期间额外增派安保，按 300 元/人/天结算',
        budgetAmount: 180000, remark: '预计全年 12 场 × 5 天 × 10 人',
      },
    ],
  },

  'engineering-service-outside': {
    demandType: 'service_project',
    procurementType: 'outside_framework',
    form: {
      applicationNo: 'CGQQ-20261024-006',
      projectName: '展馆临时保洁项目（展会期间）',
      applicant: '李四',
      applicantDept: '展览服务部',
      applyReason: '11 月智能制造展需额外保洁，现有框架合同覆盖不了高峰期，走清单外。',
      businessCategory: 'engineering',
      subType: 'service',
    },
    description: '【工程类/服务 + 清单外】场景：项目多行表，无合同关联，预算金额手填。',
    projectRows: [
      {
        id: 'p1', dept: '展览服务部', projectName: '展会期间标准保洁（A馆）',
        mainContent: '开展期间每日 4 次全面保洁，4 名保洁员',
        budgetAmount: 48000, remark: '12 天 × 4 人 × ¥ 1000/人/天',
      },
      {
        id: 'p2', dept: '展览服务部', projectName: '展会撤展后深度保洁',
        mainContent: '撤展后 2 天内完成 A/B 馆深度保洁（含地毯清洗）',
        budgetAmount: 28000, remark: '地毯约 8000㎡',
      },
    ],
  },

  'engineering-service-new': {
    demandType: 'service_project',
    procurementType: 'new_supplier',
    form: {
      applicationNo: 'CGQQ-20261024-007',
      projectName: '首次采购：智能 AI 导览服务',
      applicant: '王五',
      applicantDept: '信息中心',
      applyReason: '试点智能 AI 导览，供应商为首次合作的科技公司，需走新增供应商目录。',
      businessCategory: 'engineering',
      subType: 'service',
    },
    description: '【工程类/服务 + 新增供应商目录】场景：项目多行表，新增供应商无合同关联，预算金额全手填。',
    projectRows: [
      {
        id: 'p1', dept: '信息中心', projectName: 'AI 导览系统定制开发',
        mainContent: '针对展馆场景定制 AI 导览问答库 + 现场部署 20 台智能导览机',
        budgetAmount: 150000, remark: '新供应商：智导科技',
      },
    ],
  },

  // ==================== 非工程类 / 货物（material_non_engineering）====================
  'noneng-goods-within': {
    demandType: 'material_non_engineering',
    procurementType: 'within_framework',
    form: {
      applicationNo: 'CGQQ-20261024-008',
      projectName: '办公耗材季度采购 Q4',
      applicant: '张三',
      applicantDept: '行政人事部',
      applyReason: 'Q4 办公耗材补货，打印纸/墨盒已在 CHT-2026-005 框架合同清单内。',
      businessCategory: 'non_engineering',
      subType: 'goods',
    },
    description: '【非工程类/货物 + 清单内】场景：明细表为宽表（16 列含合同列 + 单价备注 + 库存数量），比工程类少项目编号/名称分组；合同物资锁价不可改；可导入清单。',
    details: [
      {
        id: 'd1', productCode: 'O00001', productName: 'A4 复印纸（70g 500张/包）',
        productType: '办公耗材', productAttribute: '非工程类', specification: '70g/m² 500张/包',
        unit: '包', quantity: 500, unitPriceExcludingTax: 22.50,
        amountExcludingTax: 11250,
        stockQuantity: 120, contractNo: 'CHT-2026-005', contractExpiryDate: '2026-12-31',
        isInContractList: true, isContractItem: true,
        unitPriceRemark: '合同固定价',
      },
      {
        id: 'd2', productCode: 'O00003', productName: 'HP CF217A 黑色硒鼓',
        productType: '办公耗材', productAttribute: '非工程类', specification: '适配 LaserJet Pro M102w',
        unit: '个', quantity: 80, unitPriceExcludingTax: 320.00,
        amountExcludingTax: 25600,
        stockQuantity: 15, contractNo: 'CHT-2026-005', contractExpiryDate: '2026-12-31',
        isInContractList: true, isContractItem: true,
        unitPriceRemark: '合同价含上门安装',
      },
      {
        id: 'd3', productCode: 'O00010', productName: '会议记录中性笔（黑色 0.5mm）',
        productType: '办公耗材', productAttribute: '非工程类', specification: '0.5mm 黑色 12支/盒',
        unit: '盒', quantity: 100, unitPriceExcludingTax: 15.00,
        amountExcludingTax: 1500,
        stockQuantity: 30,
        unitPriceRemark: '合同清单外，手动询价',
      },
    ],
  },

  'noneng-goods-outside': {
    demandType: 'material_non_engineering',
    procurementType: 'outside_framework',
    form: {
      applicationNo: 'CGQQ-20261024-009',
      projectName: '员工福利：中秋节月饼采购',
      applicant: '李四',
      applicantDept: '行政人事部',
      applyReason: '中秋员工福利月饼，福利品不在办公耗材框架合同内，走清单外。',
      businessCategory: 'non_engineering',
      subType: 'goods',
    },
    description: '【非工程类/货物 + 清单外】场景：明细表窄表（13 列），无合同列，有单价备注 + 库存数量（货物类专属）；单价全手填。',
    details: [
      {
        id: 'd1', productCode: 'O00100', productName: '美心月饼（双黄白莲蓉 740g）',
        productType: '员工福利', specification: '740g/盒 含双黄', unit: '盒', quantity: 80,
        unitPriceExcludingTax: 168.00, amountExcludingTax: 13440,
        stockQuantity: 0, unitPriceRemark: '市场价约 180，批量议价',
      },
      {
        id: 'd2', productCode: 'O00101', productName: '定制月饼礼盒（带公司 logo）',
        productType: '员工福利', specification: '含 6 枚装 + 手提袋', unit: '套', quantity: 80,
        unitPriceExcludingTax: 45.00, amountExcludingTax: 3600,
        stockQuantity: 0, unitPriceRemark: '定制加印 3 元/套',
      },
    ],
  },

  'noneng-goods-new': {
    demandType: 'material_non_engineering',
    procurementType: 'new_supplier',
    form: {
      applicationNo: 'CGQQ-20261024-010',
      projectName: '员工福利：首次采购健康体检套餐',
      applicant: '王五',
      applicantDept: '行政人事部',
      applyReason: '首次采购健康体检服务，供应商为体检中心，未在合同名录内。',
      businessCategory: 'non_engineering',
      subType: 'goods',
    },
    description: '【非工程类/货物 + 新增供应商目录】场景：同清单外窄表，单价全手填，不可导入清单。',
    details: [
      {
        id: 'd1', productCode: 'O00200', productName: '美年大健康体检套餐（标准 A）',
        productType: '员工福利-体检', specification: '含常规检查 35 项', unit: '人', quantity: 200,
        unitPriceExcludingTax: 380.00, amountExcludingTax: 76000,
        stockQuantity: 0, unitPriceRemark: '新供应商，批量 200 人报价',
      },
    ],
  },

  // ==================== 非工程类 / 服务（service_non_engineering）====================
  'noneng-service-within': {
    demandType: 'service_non_engineering',
    procurementType: 'within_framework',
    form: {
      applicationNo: 'CGQQ-20261024-011',
      projectName: '年度法律咨询服务',
      applicant: '张三',
      applicantDept: '法务部',
      applyReason: '年度常年法律顾问服务，供应商已在 CHT-2026-006 框架合同内。',
      businessCategory: 'non_engineering',
      subType: 'service',
    },
    description: '【非工程类/服务 + 清单内】场景：宽表（16 列含合同列 + 单价备注），比货物类少"库存数量"列（服务无库存）；合同物资锁价；可导入清单。',
    details: [
      {
        id: 'd1', productCode: 'S00001', productName: '常年法律顾问服务（年度）',
        productType: '法律服务', productAttribute: '非工程类', specification: '年度 365 天 不限次咨询',
        unit: '年', quantity: 1, unitPriceExcludingTax: 120000.00,
        amountExcludingTax: 120000,
        contractNo: 'CHT-2026-006', contractExpiryDate: '2026-12-31',
        isInContractList: true, isContractItem: true,
        unitPriceRemark: '合同固定价，含 4 次现场服务',
      },
      {
        id: 'd2', productCode: 'S00002', productName: '合同审查专项服务',
        productType: '法律服务', productAttribute: '非工程类', specification: '每份合同约 30 分钟审查',
        unit: '份', quantity: 60, unitPriceExcludingTax: 800.00,
        amountExcludingTax: 48000,
        contractNo: 'CHT-2026-006', contractExpiryDate: '2026-12-31',
        isInContractList: true, isContractItem: true,
        unitPriceRemark: '合同约定价',
      },
    ],
  },

  'noneng-service-outside': {
    demandType: 'service_non_engineering',
    procurementType: 'outside_framework',
    form: {
      applicationNo: 'CGQQ-20261024-012',
      projectName: '临时翻译服务（展会期间）',
      applicant: '李四',
      applicantDept: '展览服务部',
      applyReason: '11 月国际工程机械展需英语/日语双语翻译，不在现有框架合同内。',
      businessCategory: 'non_engineering',
      subType: 'service',
    },
    description: '【非工程类/服务 + 清单外】场景：窄表（12 列，无库存列），单价全手填；单价备注列保留。',
    details: [
      {
        id: 'd1', productCode: 'S00010', productName: '英语现场翻译（会议）',
        productType: '翻译服务', specification: '英语-中文 同传/交传', unit: '人/天', quantity: 5,
        unitPriceExcludingTax: 2800.00, amountExcludingTax: 14000,
        unitPriceRemark: '市场价 3000，展会期间批量优惠',
      },
      {
        id: 'd2', productCode: 'S00011', productName: '日语口译（展台）',
        productType: '翻译服务', specification: '日语-中文 展台陪伴', unit: '人/天', quantity: 3,
        unitPriceExcludingTax: 3200.00, amountExcludingTax: 9600,
        unitPriceRemark: '需会展行业经验',
      },
    ],
  },

  'noneng-service-new': {
    demandType: 'service_non_engineering',
    procurementType: 'new_supplier',
    form: {
      applicationNo: 'CGQQ-20261024-013',
      projectName: '首次采购：员工心理健康 EAP 服务',
      applicant: '王五',
      applicantDept: '行政人事部',
      applyReason: '首次引入员工心理健康 EAP 项目，供应商为心理咨询公司，需新增目录。',
      businessCategory: 'non_engineering',
      subType: 'service',
    },
    description: '【非工程类/服务 + 新增供应商目录】场景：同清单外窄表，单价全手填，不可导入清单。',
    details: [
      {
        id: 'd1', productCode: 'S00100', productName: '员工 EAP 年度服务包',
        productType: '心理健康服务', specification: '含 24h 心理热线 + 3 次/人免费咨询 + 心理讲座',
        unit: '人/年', quantity: 350, unitPriceExcludingTax: 360.00,
        amountExcludingTax: 126000,
        unitPriceRemark: '新供应商：心晴心理咨询',
      },
    ],
  },
};

// 菜单分组
export interface SceneMenuGroup {
  group: string;
  groupLabel: string;
  children: Array<{
    key: string;
    title: string;
    path: string;
  }>;
}

export const SCENE_MENU: SceneMenuGroup[] = [
  {
    group: 'engineering-goods',
    groupLabel: '工程类 / 货物（物资采购）',
    children: [
      { key: 'engineering-goods-within', title: '清单内采购', path: '/procurement/demand-scene/engineering-goods/within' },
      { key: 'engineering-goods-outside', title: '清单外采购', path: '/procurement/demand-scene/engineering-goods/outside' },
      { key: 'engineering-goods-new', title: '新增供应商目录', path: '/procurement/demand-scene/engineering-goods/new' },
    ],
  },
  {
    group: 'engineering-construction',
    groupLabel: '工程类 / 施工（实施项目）',
    children: [
      { key: 'engineering-construction-new', title: '新增供应商目录', path: '/procurement/demand-scene/engineering-construction/new' },
    ],
  },
  {
    group: 'engineering-service',
    groupLabel: '工程类 / 服务（服务项目）',
    children: [
      { key: 'engineering-service-within', title: '清单内采购', path: '/procurement/demand-scene/engineering-service/within' },
      { key: 'engineering-service-outside', title: '清单外采购', path: '/procurement/demand-scene/engineering-service/outside' },
      { key: 'engineering-service-new', title: '新增供应商目录', path: '/procurement/demand-scene/engineering-service/new' },
    ],
  },
  {
    group: 'noneng-goods',
    groupLabel: '非工程类 / 货物',
    children: [
      { key: 'noneng-goods-within', title: '清单内采购', path: '/procurement/demand-scene/noneng-goods/within' },
      { key: 'noneng-goods-outside', title: '清单外采购', path: '/procurement/demand-scene/noneng-goods/outside' },
      { key: 'noneng-goods-new', title: '新增供应商目录', path: '/procurement/demand-scene/noneng-goods/new' },
    ],
  },
  {
    group: 'noneng-service',
    groupLabel: '非工程类 / 服务',
    children: [
      { key: 'noneng-service-within', title: '清单内采购', path: '/procurement/demand-scene/noneng-service/within' },
      { key: 'noneng-service-outside', title: '清单外采购', path: '/procurement/demand-scene/noneng-service/outside' },
      { key: 'noneng-service-new', title: '新增供应商目录', path: '/procurement/demand-scene/noneng-service/new' },
    ],
  },
];
