// =====================================================================
// 招采执行场景模板 —— 9 种采购方式的演示数据 + 业务门控速查表
// 注意：法定招标 / 自愿招标 不在此（业务上已废止，或归入自愿招标）
// =====================================================================

export type BiddingSceneKey =
  | 'framework_catalog'
  | 'framework_random'
  | 'inquiry_open'
  | 'inquiry_invited'
  | 'competitive_bidding'
  | 'negotiation_open'
  | 'negotiation_invited'
  | 'direct'
  | 'e_mall';

// 明细表 1：目录内比价（framework_catalog）— 14 列宽表
export interface CatalogDetailRow {
  id: string;
  projectName: string;
  description: string;
  contractRatePerMonth?: number;
  demandUnitPriceExcludingTax: number;
  priceDescription: string;
  quantity: number;
  unit: string;
  supplierUnitPrice: number;       // 供应商报的不含税单价
  supplierAmountExTax: number;     // 供应商报的不含税金额
  winningSupplierName?: string;
  contractNo: string;
}

// 明细表 2：线下完整表（询比/竞价/谈判）— 12 列（有税率）
export interface OfflineDetailRow {
  id: string;
  supplierName: string;
  itemName: string;
  quantity: number;
  unit: string;
  taxRate: number;                 // 0 / 3 / 6 / 9 / 13%
  unitPriceExcludingTax: number;
  priceRemark?: string;
}

// 明细表 3：简化无税表（直接采购/电子商城）— 10 列
export interface SimpleDetailRow {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPriceExcludingTax: number;
  priceRemark?: string;
  supplierName: string;
}

// =====================================================================
// 扩展区块：按采购方式门控展示的额外字段（对齐 CompetitiveBiddingPage 新增弹窗）
// =====================================================================

// 目录内比价独有：受邀供应商 + 公告/文件附件 + 整单上限 + 报价窗口
export interface CatalogSection {
  invitedSuppliers: { name: string; contact: string }[];
  biddingAnnouncementFiles: string[];
  biddingDocumentFiles: string[];
  totalPriceLimitTaxIncl: number;
  bidWindowStart: string;
  bidWindowEnd: string;
  evaluationResultFiles?: string[];  // 竞价小组评定结果附件（目录内比价独有）
}

// 线下 9 种通用：基础执行信息 + 招标公告时间 + 报名单位 + 中标结果
export interface OfflineExecutionSection {
  approvalMethod: string;
  approvalDate: string;
  implementationUnit: string;
  projectImplementationUnit?: string;
  handler: string;
  tenderer?: string;
  listAutoTotalExTax: number;
  listAutoTotalInclTax: number;
  manualTotalExTax?: number;
  manualTotalInclTax?: number;
  announcementPublishDate?: string;
  bidOpeningTime?: string;
  judgeMethod?: string;
  hasAgency?: boolean;
  agencyName?: string;
  bidders?: { name: string; contact: string; phone: string; remark?: string }[];
  winningSupplier?: string;
  winningSupplierLegal?: string;
  winningSupplierScore?: number;
  winningContractAmount?: number;
  winningDate?: string;
  hasDispute?: boolean;
  loser1?: { name: string; legal?: string; score?: number };
  loser2?: { name: string; legal?: string; score?: number };
  awardNoticeFiles?: string[];
  approvalFileFiles?: string[];
  // 审批材料附件槽位（复刻 CompetitiveBiddingPage 新增弹窗的 7 个槽位）
  // key 取值: meetingMinutes | onMeetingMaterials | agentDrawResult | awardNotice | processArchive | jointMeetingMinutes | jointOnMeetingMaterials
  attachmentSlots?: { key: string; label: string; required?: boolean; files: string[] }[];
  // 流标（询比/竞价/谈判 5 种方式显示）
  flowBid?: { isFlow: boolean; reason?: string };
}

// 直接采购/电子商城独有
export interface DirectMallSection {
  supplier: string;
  taxTotalAmount?: number;
  taxExclusiveTotalAmount?: number;
  awardNoticeFiles: string[];
}

// 场景 mock
export interface BiddingSceneMock {
  key: BiddingSceneKey;
  label: string;
  form: {
    biddingNo: string;
    projectName: string;
    demandNo?: string;
    biddingName: string;
    procurementMethod: string;
    deadline: string;
    applyReason: string;
  };
  description: string;
  // 明细表：三选一
  catalogDetails?: CatalogDetailRow[];
  offlineDetails?: OfflineDetailRow[];
  simpleDetails?: SimpleDetailRow[];
  // 框架随机抽取专用字段（无明细表）
  randomOnly?: {
    drawTime: string;
    randomSupplierName: string;
    randomSupplierContact: string;
    randomContractNo: string;
    linkDemand: boolean;
    demandName?: string;
  };
  // 扩展区块：按采购方式门控
  catalogSection?: CatalogSection;
  offlineSection?: OfflineExecutionSection;
  directMallSection?: DirectMallSection;
}

export const BIDDING_SCENE_MOCKS: Record<BiddingSceneKey, BiddingSceneMock> = {

  // ══════════════════════════════════════════════════════════════
  // ① 框架协议采购-目录内比价（14 列宽表，线上报价模式）
  // ══════════════════════════════════════════════════════════════
  framework_catalog: {
    key: 'framework_catalog',
    label: '框架协议采购-目录内比价',
    form: {
      biddingNo: 'ZC-20261024-001',
      biddingName: '展厅装修材料采购（目录内比价）',
      projectName: '2026 A 馆升级改造工程',
      demandNo: 'CGQQ-20261020-003',
      procurementMethod: '框架协议采购-目录内比价',
      deadline: '2026-11-05',
      applyReason: 'A 馆升级改造需采购涂料、龙骨、门窗，均在 CHT-2026-001 框架合同目录内，采用目录内比价让 3 家框架供应商线上报价。',
    },
    description: '【唯一线上报价模式】从已签框架合同的目录里选物资 → 上传竞价文件 → 供应商在模拟器报价 → 系统比出价最低者中标。明细表最特殊：有"竞价文件/供应商不含税单价/供应商不含税金额/中标供应商名称/关联合同编号"5 列是其他方式没有的。',
    catalogDetails: [
      { id: 'c1', projectName: 'A馆墙面涂料', description: '立邦净味全效（白色）20L/桶',
        contractRatePerMonth: 0, demandUnitPriceExcludingTax: 168, priceDescription: '固定单价',
        quantity: 50, unit: '桶', supplierUnitPrice: 165, supplierAmountExTax: 8250,
        winningSupplierName: '立邦涂料（长沙）经销商', contractNo: 'CHT-2026-001' },
      { id: 'c2', projectName: 'A馆吊顶龙骨', description: '国标轻钢龙骨 60 系列主龙 0.8mm',
        contractRatePerMonth: 0, demandUnitPriceExcludingTax: 12.5, priceDescription: '固定单价',
        quantity: 2000, unit: 'm', supplierUnitPrice: 12.3, supplierAmountExTax: 24600,
        winningSupplierName: '龙牌建材贸易公司', contractNo: 'CHT-2026-001' },
      { id: 'c3', projectName: 'A馆断桥铝窗', description: '60 系列隔热断桥 壁厚 1.4mm',
        contractRatePerMonth: 0, demandUnitPriceExcludingTax: 480, priceDescription: '按工程量结算',
        quantity: 150, unit: '㎡', supplierUnitPrice: 475, supplierAmountExTax: 71250,
        winningSupplierName: '湖南铝业集团', contractNo: 'CHT-2025-008' },
    ],
    catalogSection: {
      invitedSuppliers: [
        { name: '立邦涂料（长沙）经销商', contact: '张经理 / 13900001111' },
        { name: '龙牌建材贸易公司', contact: '李总 / 13900002222' },
        { name: '湖南铝业集团', contact: '王工 / 13900003333' },
      ],
      biddingAnnouncementFiles: ['比价公告-展厅装修材料采购.pdf'],
      biddingDocumentFiles: ['竞价文件-涂料.pdf', '竞价文件-龙骨.pdf', '竞价文件-断桥铝窗.pdf'],
      totalPriceLimitTaxIncl: 115000,
      bidWindowStart: '2026-10-28 09:00',
      bidWindowEnd: '2026-10-30 17:00',
      evaluationResultFiles: ['竞价小组评定结果-A馆装修材料-20261031.pdf'],
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ② 框架协议采购-随机抽取（无明细表，只有 6 个字段）
  // ══════════════════════════════════════════════════════════════
  framework_random: {
    key: 'framework_random',
    label: '框架协议采购-随机抽取',
    form: {
      biddingNo: 'ZC-20261024-002',
      biddingName: '空调维保服务（框架随机抽取）',
      projectName: '2026 年度空调系统维保',
      demandNo: 'CGQQ-20261022-010',
      procurementMethod: '框架协议采购-随机抽取',
      deadline: '2026-11-01',
      applyReason: '年度空调维保服务金额小（15 万以内）、技术标准统一，走框架供应商库随机抽取方式，提高效率。',
    },
    description: '【唯一无明细表的采购方式】适用"金额小 + 技术标准统一 + 框架库内供应商服务同质化"的场景。不进入招采模拟器，不生成明细表，只填：抽取时间、供应商名称、联系人、关联合同编号、是否关联采购需求。',
    randomOnly: {
      drawTime: '2026-10-25 09:30',
      randomSupplierName: '长沙制冷设备维修有限公司',
      randomSupplierContact: '王经理 / 13800001234',
      randomContractNo: 'CHT-2026-007',
      linkDemand: true,
      demandName: '年度空调维保服务需求（CGQQ-20261022-010）',
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ③ 询比采购-公开
  // ══════════════════════════════════════════════════════════════
  inquiry_open: {
    key: 'inquiry_open',
    label: '询比采购-公开',
    form: {
      biddingNo: 'ZC-20261024-003',
      biddingName: '办公耗材季度采购 Q4',
      projectName: '2026 Q4 办公物资采购',
      demandNo: 'CGQQ-20261019-005',
      procurementMethod: '询比采购-公开',
      deadline: '2026-10-28',
      applyReason: '办公耗材金额约 4.3 万，低于公开招标限额（40 万），技术标准统一，走公开询比。',
    },
    description: '【线下完整表 · 公开方式】公开发布询比公告，3 家及以上供应商报价，线下比选确定中标人。明细表 12 列：含"税率下拉（13/9/6/3/0%）、含税单价自动算、含税金额"。',
    offlineDetails: [
      { id: 'o1', supplierName: '文泰办公设备有限公司', itemName: 'A4 复印纸 70g 500张/包', quantity: 500, unit: '包', taxRate: 0.13, unitPriceExcludingTax: 21.8, priceRemark: '批量优惠价' },
      { id: 'o2', supplierName: '文泰办公设备有限公司', itemName: 'HP CF217A 硒鼓', quantity: 80, unit: '个', taxRate: 0.13, unitPriceExcludingTax: 315, priceRemark: '含税含上门安装' },
      { id: 'o3', supplierName: '得力集团湖南办事处', itemName: '会议中性笔 0.5mm 黑色', quantity: 100, unit: '盒', taxRate: 0.13, unitPriceExcludingTax: 14.5, priceRemark: '12支/盒' },
    ],
    offlineSection: {
      approvalMethod: '会议审批',
      approvalDate: '2026-10-20',
      implementationUnit: '长沙国际会展中心综合采购部',
      projectImplementationUnit: '行政部',
      handler: '刘明',
      tenderer: '长沙国际会展中心',
      listAutoTotalExTax: 42550,
      listAutoTotalInclTax: 48081.5,
      manualTotalExTax: 42550,
      manualTotalInclTax: 48081.5,
      announcementPublishDate: '2026-10-21',
      bidOpeningTime: '2026-10-27 10:00',
      judgeMethod: '综合评分法：价格分 60% + 质量分 30% + 服务分 10%',
      hasAgency: false,
      bidders: [
        { name: '文泰办公设备有限公司', contact: '张经理', phone: '13800001001', remark: '本地供应商，合作 3 年' },
        { name: '得力集团湖南办事处', contact: '李主任', phone: '13800001002', remark: '品牌代理商' },
        { name: '晨光文具长沙分公司', contact: '王总', phone: '13800001003', remark: '备选' },
      ],
      winningSupplier: '文泰办公设备有限公司',
      winningSupplierLegal: '张建国',
      winningSupplierScore: 92.5,
      winningContractAmount: 48081.5,
      winningDate: '2026-10-28',
      hasDispute: false,
      loser1: { name: '得力集团湖南办事处', legal: '李明', score: 85.3 },
      loser2: { name: '晨光文具长沙分公司', legal: '王志', score: 78.0 },
      awardNoticeFiles: ['成交通知书-办公耗材Q4采购.pdf'],
      approvalFileFiles: ['采购方式审批文件-办公耗材Q4采购.pdf', '上会材料-办公耗材Q4采购.docx'],
      attachmentSlots: [
        { key: 'meetingMinutes', label: '会议纪要', required: true, files: ['会议纪要-评审-20261025.pdf'] },
        { key: 'onMeetingMaterials', label: '上会材料', required: true, files: ['上会材料-20261025.docx'] },
        { key: 'agentDrawResult', label: '招标代理抽取结果表', files: ['招标代理抽取结果.pdf'] },
        { key: 'awardNotice', label: '成交通知书', required: true, files: ['成交通知书.pdf'] },
        { key: 'processArchive', label: '招采过程备案', required: true, files: ['招采过程备案表.pdf'] },
        { key: 'jointMeetingMinutes', label: '合资公司会议纪要', files: [] },
        { key: 'jointOnMeetingMaterials', label: '合资公司上会材料', files: [] }
      ],
      flowBid: { isFlow: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ④ 询比采购-邀请
  // ══════════════════════════════════════════════════════════════
  inquiry_invited: {
    key: 'inquiry_invited',
    label: '询比采购-邀请',
    form: {
      biddingNo: 'ZC-20261024-004',
      biddingName: '展会临时保洁服务',
      projectName: '11月智能制造展配套保洁',
      demandNo: 'CGQQ-20261018-008',
      procurementMethod: '询比采购-邀请',
      deadline: '2026-10-30',
      applyReason: '展会保洁为临时性服务，金额 7.6 万，定向邀请 3 家合作过的保洁服务商，不走公开程序。',
    },
    description: '【线下完整表 · 邀请方式】定向邀请 ≥3 家供应商报价（不公开），流程比公开询比快，适合"有稳定合作圈 + 时间紧"的场景。明细表同公开询比（12 列有税率）。',
    offlineDetails: [
      { id: 'o1', supplierName: '悦享保洁服务有限公司', itemName: '展会期间标准保洁（4名/天×12天）', quantity: 48, unit: '人天', taxRate: 0.06, unitPriceExcludingTax: 280, priceRemark: '含清洁剂、工具' },
      { id: 'o2', supplierName: '悦享保洁服务有限公司', itemName: '撤展后深度保洁（地毯清洗）', quantity: 8000, unit: '㎡', taxRate: 0.06, unitPriceExcludingTax: 4.5, priceRemark: '热洗+吹干' },
    ],
    offlineSection: {
      approvalMethod: '签报审批', approvalDate: '2026-10-22',
      implementationUnit: '长沙国际会展中心综合采购部', projectImplementationUnit: '运营部',
      handler: '陈军', tenderer: '长沙国际会展中心',
      listAutoTotalExTax: 49440, listAutoTotalInclTax: 52406.4,
      manualTotalExTax: 49440, manualTotalInclTax: 52406.4,
      announcementPublishDate: '2026-10-23', bidOpeningTime: '2026-10-29 14:00',
      judgeMethod: '低价法：合格供应商中最低报价者中标', hasAgency: false,
      bidders: [
        { name: '悦享保洁服务有限公司', contact: '赵经理', phone: '13800002001', remark: '合作过3次展会保洁' },
        { name: '洁雅环境服务', contact: '孙总', phone: '13800002002', remark: '备选' },
        { name: '绿之源清洁有限公司', contact: '周主管', phone: '13800002003', remark: '备选' },
      ],
      winningSupplier: '悦享保洁服务有限公司', winningSupplierLegal: '赵云',
      winningSupplierScore: 95.0, winningContractAmount: 52406.4,
      winningDate: '2026-10-30', hasDispute: false,
      loser1: { name: '洁雅环境服务', legal: '孙明', score: 88.0 },
      loser2: { name: '绿之源清洁有限公司', legal: '周强', score: 82.5 },
      awardNoticeFiles: ['成交通知书-展会临时保洁.pdf'],
      approvalFileFiles: ['采购方式审批文件-展会保洁.pdf'],
      attachmentSlots: [
        { key: 'meetingMinutes', label: '会议纪要', required: true, files: ['会议纪要-评审-20261025.pdf'] },
        { key: 'onMeetingMaterials', label: '上会材料', required: true, files: ['上会材料-20261025.docx'] },
        { key: 'agentDrawResult', label: '招标代理抽取结果表', files: ['招标代理抽取结果.pdf'] },
        { key: 'awardNotice', label: '成交通知书', required: true, files: ['成交通知书.pdf'] },
        { key: 'processArchive', label: '招采过程备案', required: true, files: ['招采过程备案表.pdf'] },
        { key: 'jointMeetingMinutes', label: '合资公司会议纪要', files: [] },
        { key: 'jointOnMeetingMaterials', label: '合资公司上会材料', files: [] }
      ],
      flowBid: { isFlow: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ⑤ 竞价采购
  // ══════════════════════════════════════════════════════════════
  competitive_bidding: {
    key: 'competitive_bidding',
    label: '竞价采购',
    form: {
      biddingNo: 'ZC-20261024-005',
      biddingName: '展具租赁采购',
      projectName: '智能制造展展具租赁',
      demandNo: 'CGQQ-20261020-002',
      procurementMethod: '竞价采购',
      deadline: '2026-11-02',
      applyReason: '展具租赁金额约 12 万，3 家供应商同时报价，系统按"最低报价中标"自动判定。',
    },
    description: '【线下完整表 · 竞价方式】多家供应商同时报价，价低者得。通常用在"标准化程度高、价格敏感度强"的品类（如标准展具、耗材）。明细表同询比（12 列有税率）。',
    offlineDetails: [
      { id: 'o1', supplierName: '博瑞会展服务', itemName: '标准展位 3×3m（含 4 种配置）', quantity: 20, unit: '套', taxRate: 0.13, unitPriceExcludingTax: 2800, priceRemark: '含楣板、桌椅、射灯' },
      { id: 'o2', supplierName: '博瑞会展服务', itemName: '洽谈区沙发组合（3+2+茶几）', quantity: 10, unit: '套', taxRate: 0.13, unitPriceExcludingTax: 650, priceRemark: '白色布艺' },
    ],
    offlineSection: {
      approvalMethod: '采购项目申请表', approvalDate: '2026-10-25',
      implementationUnit: '长沙国际会展中心综合采购部', projectImplementationUnit: '展览部',
      handler: '张伟', tenderer: '长沙国际会展中心',
      listAutoTotalExTax: 62500, listAutoTotalInclTax: 70625,
      manualTotalExTax: 62500, manualTotalInclTax: 70625,
      announcementPublishDate: '2026-10-26', bidOpeningTime: '2026-11-01 09:00',
      judgeMethod: '最低价中标法', hasAgency: false,
      bidders: [
        { name: '博瑞会展服务', contact: '吴经理', phone: '13800003001', remark: '本地会展服务商' },
        { name: '华展展具租赁', contact: '郑总', phone: '13800003002', remark: '备选' },
        { name: '国际会展租赁公司', contact: '冯工', phone: '13800003003', remark: '备选' },
      ],
      winningSupplier: '博瑞会展服务', winningSupplierLegal: '吴博',
      winningSupplierScore: 90.0, winningContractAmount: 70625,
      winningDate: '2026-11-02', hasDispute: false,
      loser1: { name: '华展展具租赁', legal: '郑华', score: 82.0 },
      loser2: { name: '国际会展租赁公司', legal: '冯国', score: 76.5 },
      awardNoticeFiles: ['成交通知书-展具租赁采购.pdf'],
      approvalFileFiles: ['采购方式审批文件-展具租赁.pdf'],
      attachmentSlots: [
        { key: 'meetingMinutes', label: '会议纪要', required: true, files: ['会议纪要-评审-20261025.pdf'] },
        { key: 'onMeetingMaterials', label: '上会材料', required: true, files: ['上会材料-20261025.docx'] },
        { key: 'agentDrawResult', label: '招标代理抽取结果表', files: ['招标代理抽取结果.pdf'] },
        { key: 'awardNotice', label: '成交通知书', required: true, files: ['成交通知书.pdf'] },
        { key: 'processArchive', label: '招采过程备案', required: true, files: ['招采过程备案表.pdf'] },
        { key: 'jointMeetingMinutes', label: '合资公司会议纪要', files: [] },
        { key: 'jointOnMeetingMaterials', label: '合资公司上会材料', files: [] }
      ],
      flowBid: { isFlow: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ⑥ 谈判采购-公开
  // ══════════════════════════════════════════════════════════════
  negotiation_open: {
    key: 'negotiation_open',
    label: '谈判采购-公开',
    form: {
      biddingNo: 'ZC-20261024-006',
      biddingName: 'AI 导览系统定制开发',
      projectName: '展馆智能导览试点项目',
      demandNo: 'CGQQ-20261015-011',
      procurementMethod: '谈判采购-公开',
      deadline: '2026-11-10',
      applyReason: 'AI 导览为定制化软件开发，需求复杂、技术方案差异大，走公开谈判，选方案最优者而不是最低价。',
    },
    description: '【线下完整表 · 谈判方式】技术复杂/需求不明确的项目，先谈判方案再谈价格。适合软件开发、系统集成、复杂工程。明细表同询比（12 列有税率），但"单价备注"列会写谈判达成的特殊条款。',
    offlineDetails: [
      { id: 'o1', supplierName: '智导科技（北京）', itemName: 'AI 导览系统定制开发费', quantity: 1, unit: '套', taxRate: 0.06, unitPriceExcludingTax: 98000, priceRemark: '含 20 台导览机硬件+1年维护' },
      { id: 'o2', supplierName: '智导科技（北京）', itemName: '导览问答库定制（展会场景）', quantity: 1, unit: '项', taxRate: 0.06, unitPriceExcludingTax: 28000, priceRemark: '覆盖展馆介绍+10 类常见问题' },
    ],
    offlineSection: {
      approvalMethod: '会议审批', approvalDate: '2026-10-28',
      implementationUnit: '长沙国际会展中心综合采购部', projectImplementationUnit: '信息技术部',
      handler: '黄涛', tenderer: '长沙国际会展中心',
      listAutoTotalExTax: 126000, listAutoTotalInclTax: 133560,
      manualTotalExTax: 126000, manualTotalInclTax: 133560,
      announcementPublishDate: '2026-10-29', bidOpeningTime: '2026-11-08 10:00',
      judgeMethod: '综合评估法：技术方案50%+报价30%+团队经验20%', hasAgency: false,
      bidders: [
        { name: '智导科技（北京）', contact: '陈博士', phone: '13800004001', remark: 'AI导览头部供应商' },
        { name: '未来科技股份', contact: '林CTO', phone: '13800004002', remark: '备选方案' },
      ],
      winningSupplier: '智导科技（北京）', winningSupplierLegal: '陈智',
      winningSupplierScore: 96.0, winningContractAmount: 133560,
      winningDate: '2026-11-10', hasDispute: false,
      loser1: { name: '未来科技股份', legal: '林来', score: 83.5 },
      awardNoticeFiles: ['成交通知书-AI导览系统.pdf'],
      approvalFileFiles: ['采购方式审批文件-AI导览系统.pdf', '技术方案评审纪要.docx'],
      attachmentSlots: [
        { key: 'meetingMinutes', label: '会议纪要', required: true, files: ['会议纪要-评审-20261025-AI导览.pdf'] },
        { key: 'onMeetingMaterials', label: '上会材料', required: true, files: ['上会材料-20261025-AI导览.docx'] },
        { key: 'agentDrawResult', label: '招标代理抽取结果表', files: ['招标代理抽取结果-AI导览.pdf'] },
        { key: 'awardNotice', label: '成交通知书', required: true, files: ['成交通知书-AI导览.pdf'] },
        { key: 'processArchive', label: '招采过程备案', required: true, files: ['招采过程备案表-AI导览.pdf'] },
        { key: 'jointMeetingMinutes', label: '合资公司会议纪要', files: [] },
        { key: 'jointOnMeetingMaterials', label: '合资公司上会材料', files: [] }
      ],
      flowBid: { isFlow: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ⑦ 谈判采购-邀请
  // ══════════════════════════════════════════════════════════════
  negotiation_invited: {
    key: 'negotiation_invited',
    label: '谈判采购-邀请',
    form: {
      biddingNo: 'ZC-20261024-007',
      biddingName: '消防系统升级工程',
      projectName: 'D 馆消防系统整体升级',
      demandNo: 'CGQQ-20261010-006',
      procurementMethod: '谈判采购-邀请',
      deadline: '2026-11-15',
      applyReason: '消防升级涉及现有系统对接，技术门槛高，定向邀请 2 家有消防一级资质的单位谈判。',
    },
    description: '【线下完整表 · 邀请谈判】定向邀请少数具备特殊资质/经验的供应商，一对一谈判。适合"资质门槛高、潜在供应商少"的项目（如消防、涉密、专有技术）。',
    offlineDetails: [
      { id: 'o1', supplierName: '湖南消安建设工程', itemName: '喷淋系统更换（1200 个+管网改造）', quantity: 1, unit: '项', taxRate: 0.09, unitPriceExcludingTax: 108000, priceRemark: '含人工、材料、机械、试压' },
      { id: 'o2', supplierName: '湖南消安建设工程', itemName: '烟感报警器更换（800 个）', quantity: 1, unit: '项', taxRate: 0.09, unitPriceExcludingTax: 72000, priceRemark: '含消防主机升级+3年质保' },
    ],
    offlineSection: {
      approvalMethod: '会议审批', approvalDate: '2026-10-30',
      implementationUnit: '长沙国际会展中心综合采购部', projectImplementationUnit: '工程部',
      handler: '李强', tenderer: '长沙国际会展中心',
      listAutoTotalExTax: 180000, listAutoTotalInclTax: 196200,
      manualTotalExTax: 180000, manualTotalInclTax: 196200,
      announcementPublishDate: '2026-10-31', bidOpeningTime: '2026-11-13 09:30',
      judgeMethod: '综合评估法：施工方案40%+报价40%+资质业绩20%', hasAgency: false,
      bidders: [
        { name: '湖南消安建设工程', contact: '谭总', phone: '13800005001', remark: '消防一级资质' },
        { name: '中消建设集团', contact: '彭工', phone: '13800005002', remark: '备选' },
      ],
      winningSupplier: '湖南消安建设工程', winningSupplierLegal: '谭消',
      winningSupplierScore: 94.5, winningContractAmount: 196200,
      winningDate: '2026-11-15', hasDispute: false,
      loser1: { name: '中消建设集团', legal: '彭安', score: 85.0 },
      awardNoticeFiles: ['成交通知书-消防升级工程.pdf'],
      approvalFileFiles: ['采购方式审批文件-消防升级.pdf', '消防资质审核表.pdf'],
      attachmentSlots: [
        { key: 'meetingMinutes', label: '会议纪要', required: true, files: ['会议纪要-评审-20261025-消防升级.pdf'] },
        { key: 'onMeetingMaterials', label: '上会材料', required: true, files: ['上会材料-20261025.docx'] },
        { key: 'agentDrawResult', label: '招标代理抽取结果表', files: ['招标代理抽取结果-消防升级.pdf'] },
        { key: 'awardNotice', label: '成交通知书', required: true, files: ['成交通知书-消防升级.pdf'] },
        { key: 'processArchive', label: '招采过程备案', required: true, files: ['招采过程备案表-消防升级.pdf'] },
        { key: 'jointMeetingMinutes', label: '合资公司会议纪要', files: [] },
        { key: 'jointOnMeetingMaterials', label: '合资公司上会材料', files: [] }
      ],
      flowBid: { isFlow: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ⑧ 直接采购（简化无税 10 列）
  // ══════════════════════════════════════════════════════════════
  direct: {
    key: 'direct',
    label: '直接采购',
    form: {
      biddingNo: 'ZC-20261024-008',
      biddingName: '中秋员工月饼采购',
      projectName: '2026 中秋节员工福利',
      demandNo: 'CGQQ-20261022-015',
      procurementMethod: '直接采购',
      deadline: '2026-09-10',
      applyReason: '月饼采购 80 盒，金额约 1.7 万，找定点供应商美心月饼直接下单，不招标不询比。',
    },
    description: '【唯一简化无税表 · 直接下单】单笔 ≤5 万（或企业制度规定限额），可直接找一家供应商买，不走任何招标/询比程序。明细表无税率、无含税列，不含税单价就是最终成交价。',
    simpleDetails: [
      { id: 's1', itemName: '美心月饼（双黄白莲蓉 740g）', description: '礼盒装 含手提袋', quantity: 80, unit: '盒', unitPriceExcludingTax: 165, priceRemark: '老客户价，原价 180', supplierName: '美心月饼长沙总代理' },
      { id: 's2', itemName: '定制月饼礼盒（印公司 logo）', description: '6 枚装 + 手提袋加印', quantity: 80, unit: '套', unitPriceExcludingTax: 42, priceRemark: '加印 3 元/套', supplierName: '美心月饼长沙总代理' },
    ],
    offlineSection: {
      approvalMethod: '签报审批', approvalDate: '2026-09-05',
      implementationUnit: '长沙国际会展中心综合采购部', projectImplementationUnit: '人力资源部',
      handler: '徐芳',
      listAutoTotalExTax: 16560, listAutoTotalInclTax: 16560,
      manualTotalExTax: 16560, manualTotalInclTax: 16560,
      approvalFileFiles: ['采购方式审批文件-月饼采购.pdf'],
    },
    directMallSection: {
      supplier: '美心月饼长沙总代理',
      taxTotalAmount: 16560, taxExclusiveTotalAmount: 16560,
      awardNoticeFiles: ['成交通知书-中秋月饼采购.pdf', '月饼样品确认单.pdf'],
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ⑨ 电子商城采购（简化无税 10 列，同直接采购）
  // ══════════════════════════════════════════════════════════════
  e_mall: {
    key: 'e_mall',
    label: '电子商城采购',
    form: {
      biddingNo: 'ZC-20261024-009',
      biddingName: 'IT 设备紧急采购',
      projectName: '技术部新增 5 台 ThinkPad',
      demandNo: 'CGQQ-20261023-001',
      procurementMethod: '电子商城采购',
      deadline: '2026-10-26',
      applyReason: '技术部紧急需要 5 台笔记本，直接在京东企业购下单，比线下比价快。',
    },
    description: '【唯一简化无税表 · 商城下单】企业采购平台（京东企业购/苏宁企业购等）直接下单，价格透明、发票自动开、物流可追溯。明细表同直接采购（10 列无税），供应商固定显示商城名称。',
    simpleDetails: [
      { id: 's1', itemName: 'ThinkPad X1 Carbon Gen12（i7-1360P / 16GB / 1TB）', description: '商务本 黑色', quantity: 5, unit: '台', unitPriceExcludingTax: 10299, priceRemark: '企业购专属价，送 3 年上门', supplierName: '京东企业购-联想旗舰店' },
      { id: 's2', itemName: 'ThinkPad 原装扩展坞（4K 输出）', description: 'USB-C 接口', quantity: 5, unit: '个', unitPriceExcludingTax: 899, priceRemark: '搭配笔记本同批次', supplierName: '京东企业购-联想旗舰店' },
    ],
    offlineSection: {
      approvalMethod: '采购项目申请表', approvalDate: '2026-10-24',
      implementationUnit: '长沙国际会展中心综合采购部', projectImplementationUnit: '信息技术部',
      handler: '赵磊',
      listAutoTotalExTax: 55990, listAutoTotalInclTax: 55990,
      manualTotalExTax: 55990, manualTotalInclTax: 55990,
      approvalFileFiles: ['采购方式审批文件-IT设备紧急采购.pdf'],
    },
    directMallSection: {
      supplier: '京东企业购-联想旗舰店',
      taxTotalAmount: 55990, taxExclusiveTotalAmount: 55990,
      awardNoticeFiles: ['成交通知书-IT设备采购.pdf', '京东企业购订单截图.pdf'],
    },
  },
};

// ============ 业务门控速查表（用于场景页顶部展示）============
export interface ProcurementMethodRule {
  key: BiddingSceneKey;
  label: string;
  tableType: 'catalog' | 'offline' | 'simple' | 'random_only';
  tableTypeLabel: string;
  reason: string;
  applicableScenario: string;
}

export const PROCUREMENT_METHOD_RULES: ProcurementMethodRule[] = [
  { key: 'framework_catalog', label: '框架协议采购-目录内比价', tableType: 'catalog',
    tableTypeLabel: '14 列宽表（线上报价）',
    reason: '已签框架合同目录，供应商在线上报价比拼 → 比"直接采购"多了竞价文件/供应商报价/中标供应商/合同编号 5 列',
    applicableScenario: '标准化物资且有框架合同（装修材料、办公耗材、展具）' },
  { key: 'framework_random', label: '框架协议采购-随机抽取', tableType: 'random_only',
    tableTypeLabel: '⚠️ 无明细表（仅 6 字段）',
    reason: '金额小 + 技术统一 + 框架库内供应商同质化 → 随机抽取省流程，不走招采模拟器，不生成任何明细清单',
    applicableScenario: '年度维保、小额服务、耗材补货' },
  { key: 'inquiry_open', label: '询比采购-公开', tableType: 'offline',
    tableTypeLabel: '12 列线下完整表（有税率）',
    reason: '公开发布公告，≥3 家供应商报价，线下比选',
    applicableScenario: '金额低于公开招标限额（40 万）、技术标准统一的品类' },
  { key: 'inquiry_invited', label: '询比采购-邀请', tableType: 'offline',
    tableTypeLabel: '12 列线下完整表（有税率）',
    reason: '定向邀请 ≥3 家合作过的供应商，不公开，比公开询比快',
    applicableScenario: '临时性服务、小额工程、有稳定合作圈的项目' },
  { key: 'competitive_bidding', label: '竞价采购', tableType: 'offline',
    tableTypeLabel: '12 列线下完整表（有税率）',
    reason: '多家供应商同时报价，价低者得（自动判定中标人）',
    applicableScenario: '标准化程度高、价格敏感度强的品类（展具、耗材）' },
  { key: 'negotiation_open', label: '谈判采购-公开', tableType: 'offline',
    tableTypeLabel: '12 列线下完整表（有税率）',
    reason: '先谈技术方案再谈价格，选方案最优者不是最低价',
    applicableScenario: '技术复杂/需求不明确的定制化项目（软件开发、系统集成）' },
  { key: 'negotiation_invited', label: '谈判采购-邀请', tableType: 'offline',
    tableTypeLabel: '12 列线下完整表（有税率）',
    reason: '定向邀请少数具备特殊资质的供应商一对一谈判',
    applicableScenario: '资质门槛高、潜在供应商少的项目（消防、涉密、专有技术）' },
  { key: 'direct', label: '直接采购', tableType: 'simple',
    tableTypeLabel: '10 列简化表（无税率/无含税列）',
    reason: '单笔 ≤5 万，直接找一家下单，不招标不询比 → 比线下表少税率/含税列',
    applicableScenario: '紧急小额采购、员工福利、定点供应商' },
  { key: 'e_mall', label: '电子商城采购', tableType: 'simple',
    tableTypeLabel: '10 列简化表（无税率/无含税列）',
    reason: '企业采购平台（京东/苏宁企业购）直接下单，价格透明、发票自动开',
    applicableScenario: 'IT 设备、办公设备、日常耗材（金额通常 ≤10 万）' },
];
