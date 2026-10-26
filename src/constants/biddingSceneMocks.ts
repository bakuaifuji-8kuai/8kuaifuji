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
