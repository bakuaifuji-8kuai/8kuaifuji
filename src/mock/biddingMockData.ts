import type {
  Bidding,
  SupplierQuote,
  SupplierQuoteDetail,
  OfflineDetailItem,
  CatalogCompareItem,
  Attachment,
  ProcurementDemand,
  ProcurementDemandDetail,
  ProcurementDemandStatus,
  ProcurementDemandType,
  ProcurementOrder,
  ProcurementOrderDetail,
  ProcurementOrderStatus,
  ProcurementInspection,
  ContractLedger,
  ContractPurchaseOrder,
  ContractPurchaseOrderDetail,
  ContractPurchaseOrderStatus,
  Supplier,
} from '@/types';

// ======== 时间戳工具 ========
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, '0');
const d = String(now.getDate()).padStart(2, '0');
const ds = `${y}-${m}-${d}`;
const mkTime = (offsetDays: number, h = 9) => {
  const t = new Date(now.getTime() + offsetDays * 86400000);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')} ${String(h).padStart(2, '0')}:00:00`;
};

// ======== 附件占位（所有上传入口都用这个假附件）=======
const mkAttach = (name: string): Attachment => ({
  id: `att-${name}-${Date.now().toString().slice(-6)}`,
  fileName: name,
  filePath: `/mock/uploads/${name}`,
  fileSize: Math.floor(Math.random() * 5000000) + 100000,
  fileType: 'application/pdf',
  uploadTime: mkTime(-1),
});

// ======== 线下录入明细行（自动算税额/含税）=======
const mkOfflineRow = (
  rowNo: number,
  itemName: string,
  quantity: number,
  unit: string,
  unitPriceExTax: number,
  taxRate = 0.13,
  supplierName?: string
): OfflineDetailItem => {
  const amtEx = Math.round(unitPriceExTax * quantity * 100) / 100;
  const tax = taxRate > 0 ? Math.round(amtEx * taxRate * 100) / 100 : 0;
  const amtIn = Math.round((amtEx + tax) * 100) / 100;
  return {
    rowNo,
    itemName,
    quantity,
    unit,
    taxRate,
    unitPriceExcludingTax: unitPriceExTax,
    unitPriceIncludingTax: Math.round(unitPriceExTax * (1 + taxRate) * 100) / 100,
    amountExcludingTax: amtEx,
    amountIncludingTax: amtIn,
    taxAmount: tax,
    supplierName,
  };
};

// ======== 简化明细（直接/电子商城，无税率/含税）=======
const mkSimpleRow = (
  rowNo: number,
  itemName: string,
  quantity: number,
  unit: string,
  unitPrice: number,
  supplierName?: string
): OfflineDetailItem => {
  const amt = Math.round(unitPrice * quantity * 100) / 100;
  return {
    rowNo,
    itemName,
    quantity,
    unit,
    unitPriceExcludingTax: unitPrice,
    unitPriceIncludingTax: unitPrice,
    amountExcludingTax: amt,
    amountIncludingTax: amt,
    taxAmount: 0,
    supplierName,
  };
};

// ======== 目录内比价明细 ========
const mkCatalogItem = (
  projectName: string,
  description: string,
  qty: number,
  unit: string,
  limitExTax: number,
  contractRate = 0,
  priceDesc = '固定单价'
): CatalogCompareItem => ({
  productCode: `P-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  productName: description,
  unit,
  quantity: qty,
  specification: '标准',
  contractScope: 'in',
  priceDescription: priceDesc,
  contractRatePerMonth: contractRate,
  unitPriceLimitExcludingTax: limitExTax,
  unitPriceLimitIncludingTax: Math.round(limitExTax * 1.13 * 100) / 100,
  taxRate: 0.13,
  projectName,
  description,
});

// ======== 汇总计算 ========
const sumOffline = (rows: OfflineDetailItem[]) => {
  const amtEx = rows.reduce((s, r) => s + (r.amountExcludingTax || 0), 0);
  const tax = rows.reduce((s, r) => s + (r.taxAmount || 0), 0);
  const amtIn = amtEx + tax;
  return {
    totalAmountExcludingTax: Math.round(amtEx * 100) / 100,
    totalAmountIncludingTax: Math.round(amtIn * 100) / 100,
    totalTaxAmount: Math.round(tax * 100) / 100,
  };
};

// ======== 供应商报价单构造 ========
const mkQuote = (
  seq: number,
  bidId: string,
  bidNo: string,
  bidName: string,
  supplierId: string,
  supplierName: string,
  contact: string,
  phone: string,
  details: SupplierQuoteDetail[],
  status: 'submitted' | 'accepted' | 'rejected' = 'submitted'
): SupplierQuote => {
  const totalAmount = Math.round(details.reduce((s, d) => s + d.amount, 0) * 100) / 100;
  const totalTax = Math.round(details.reduce((s, d) => s + (d.taxAmount || 0), 0) * 100) / 100;
  return {
    id: `SQ${String(seq).padStart(3, '0')}`,
    quoteNo: `BJS${y}${m}${d}${String(seq).padStart(3, '0')}`,
    biddingId: bidId,
    biddingNo: bidNo,
    biddingName: bidName,
    supplierId,
    supplierName,
    contactPerson: contact,
    contactPhone: phone,
    totalAmount,
    taxRate: 0.13,
    taxAmount: totalTax,
    quoteDate: ds,
    submittedAt: mkTime(-1, 10 + (seq % 8)),
    status,
    details,
  };
};

// ======== 基础字段：审批方式三选一 ========
const APPROVAL_METHODS = ['meeting', 'sign_report', 'application_form'] as const;
const APPROVAL_METHOD_LABELS: Record<string, string> = {
  meeting: '会议审批',
  sign_report: '签报审批',
  application_form: '采购项目申请表',
};

// ======== 统一供应商池 ========
const S = {
  s1: { id: 'SUP001', name: '华东钢材有限公司', contact: '张经理', phone: '13800001001' },
  s2: { id: 'SUP002', name: '华北铝业集团', contact: '李总', phone: '13900002002' },
  s3: { id: 'SUP003', name: '南方建材公司', contact: '王经理', phone: '13700003003' },
  s4: { id: 'SUP004', name: '西部材料科技', contact: '赵工', phone: '13600004004' },
  s5: { id: 'SUP005', name: '东方供应集团', contact: '陈经理', phone: '13500005005' },
  s6: { id: 'SUP006', name: '恒盛展览服务有限公司', contact: '周经理', phone: '18800006001' },
  s7: { id: 'SUP007', name: '龙腾办公家具', contact: '冯经理', phone: '18700007001' },
  s8: { id: 'SUP008', name: '星光显示技术', contact: '许经理', phone: '18600008001' },
  s9: { id: 'SUP009', name: '华星电脑供应商', contact: '李经理', phone: '18500009001' },
  s10: { id: 'SUP010', name: '云创电子商城', contact: '吴经理', phone: '18400010001' },
  s11: { id: 'SUP011', name: '德邦装饰工程公司', contact: '孙经理', phone: '18300011001' },
  s12: { id: 'SUP012', name: '万达五金批发中心', contact: '郑经理', phone: '18200012001' },
};

// ======== 项目池 ========
const PROJ = [
  { name: '2026春季国际会展', prefix: 'XQ' },
  { name: '2026秋季博览会', prefix: 'XQ' },
  { name: '新办公楼装修项目', prefix: 'XQ' },
  { name: '展厅改造项目', prefix: 'XQ' },
  { name: '新会议室建设', prefix: 'XQ' },
  { name: '总部办公区改造', prefix: 'XQ' },
  { name: '新库房配套设施', prefix: 'XQ' },
  { name: '2026国际消费电子展', prefix: 'XQ' },
];

// =====================================================================
//  MOCK_BIDDINGS —— 10 种采购方式 × 全状态链
// =====================================================================

export const MOCK_BIDDINGS: Bidding[] = [
  // ==================== 1. 框架协议采购-目录内比价 ====================
  // 状态覆盖：approved/published/bidding/evaluated/completed/cancelled
  {
    id: 'FM-CAT-001',
    demandId: 'DEM-FM-CAT-001',
    biddingNo: 'FM-CAT-001',
    biddingName: 'LED显示设备框架协议采购',
    procurementMethod: 'framework_catalog',
    approvalStatus: 'approved',
    demandNo: 'XQ20260901001',
    projectName: PROJ[3].name,
    items: [
      mkCatalogItem('LED屏体采购', 'P2.5全彩LED屏', 20, '㎡', 3500, 0, '固定单价'),
      mkCatalogItem('LED控制主机', '四路4K拼接控制器', 4, '台', 7200, 0, '固定单价'),
    ],
    totalAmountExcludingTax: 98800,
    totalAmountIncludingTax: 111644,
    totalTaxAmount: 12844,
    inviteSupplierIds: [S.s8.id, S.s5.id, S.s2.id],
    startTime: mkTime(-2, 10),
    endTime: mkTime(5, 18),
    winningSupplierId: S.s8.id,
    winningSupplierName: S.s8.name,
    contractAmount: 108000,
    status: 'published',
    announcementPublishTime: mkTime(-2, 9),
    creator: '采购部',
    createTime: mkTime(-3, 9),
    quotes: [],
  },
  {
    id: 'FM-CAT-002',
    demandId: 'DEM-FM-CAT-002',
    biddingNo: 'FM-CAT-002',
    biddingName: '办公家具框架协议采购',
    procurementMethod: 'framework_catalog',
    approvalStatus: 'approved',
    demandNo: 'XQ20260901002',
    projectName: PROJ[2].name,
    items: [
      mkCatalogItem('办公桌采购', '1.4m带侧柜办公桌', 50, '张', 1800, 0, '固定单价'),
      mkCatalogItem('办公椅采购', '人体工学网布椅', 50, '把', 850, 0, '固定单价'),
    ],
    totalAmountExcludingTax: 132500,
    totalAmountIncludingTax: 149725,
    totalTaxAmount: 17225,
    inviteSupplierIds: [S.s7.id, S.s3.id],
    startTime: mkTime(-5, 10),
    endTime: mkTime(-1, 18),
    winningSupplierId: S.s7.id,
    winningSupplierName: S.s7.name,
    contractAmount: 142000,
    status: 'evaluated',
    announcementPublishTime: mkTime(-6, 9),
    bidOpeningTime: mkTime(0, 10),
    awardTime: mkTime(0, 14),
    creator: '采购部',
    createTime: mkTime(-7, 9),
    quotes: [],
  },
  {
    id: 'FM-CAT-003',
    demandId: 'DEM-FM-CAT-003',
    biddingNo: 'FM-CAT-003',
    biddingName: '钢材框架协议采购（已完成）',
    procurementMethod: 'framework_catalog',
    approvalStatus: 'approved',
    demandNo: 'XQ20260815001',
    projectName: PROJ[0].name,
    items: [
      mkCatalogItem('铝合金支架', '3米高度标准支架', 200, '根', 170, 0, '固定单价'),
      mkCatalogItem('连接件套装', '通用型连接件', 300, '套', 65, 0, '固定单价'),
    ],
    totalAmountExcludingTax: 53500,
    totalAmountIncludingTax: 60455,
    totalTaxAmount: 6955,
    winningSupplierId: S.s1.id,
    winningSupplierName: S.s1.name,
    contractAmount: 58000,
    status: 'completed',
    announcementPublishTime: mkTime(-30, 9),
    bidOpeningTime: mkTime(-25, 10),
    awardTime: mkTime(-25, 14),
    creator: '采购部',
    createTime: mkTime(-35, 9),
    quotes: [],
  },
  {
    id: 'FM-CAT-004',
    demandId: 'DEM-FM-CAT-004',
    biddingNo: 'FM-CAT-004',
    biddingName: '投影仪框架协议采购（已取消）',
    procurementMethod: 'framework_catalog',
    approvalStatus: 'approved',
    demandNo: 'XQ20260810001',
    projectName: PROJ[4].name,
    items: [
      mkCatalogItem('高清投影仪', '1080P/5000流明', 10, '台', 5500, 0, '固定单价'),
    ],
    totalAmountExcludingTax: 55000,
    totalAmountIncludingTax: 62150,
    totalTaxAmount: 7150,
    winningSupplierId: S.s9.id,
    winningSupplierName: S.s9.name,
    status: 'cancelled',
    announcementPublishTime: mkTime(-20, 9),
    creator: '采购部',
    createTime: mkTime(-22, 9),
    quotes: [],
  },

  // ==================== 2. 框架协议采购-随机抽取 ====================
  // 状态覆盖：draft/submitted/approved/completed/rejected
  {
    id: 'FM-RND-001',
    demandId: 'DEM-FM-RND-001',
    biddingNo: 'FM-RND-001',
    biddingName: '展会搭建材料框架协议采购（随机抽取-进行中）',
    procurementMethod: 'framework_random',
    approvalStatus: 'submitted',
    demandNo: 'XQ20260902001',
    projectName: PROJ[1].name,
    drawTime: mkTime(0, 14),
    randomSupplierId: S.s11.id,
    randomSupplierName: S.s11.name,
    randomSupplierContact: S.s11.contact,
    randomContractId: 'CON-2026-0088',
    randomContractNo: 'CON-2026-0088',
    linkDemand: true,
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '刘明',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-3, 10).slice(0, 10),
    status: 'submitted',
    creator: '采购部',
    createTime: mkTime(-3, 14),
    quotes: [],
  },
  {
    id: 'FM-RND-002',
    demandId: 'DEM-FM-RND-002',
    biddingNo: 'FM-RND-002',
    biddingName: '五金配件框架协议采购（随机抽取-已完成）',
    procurementMethod: 'framework_random',
    approvalStatus: 'approved',
    demandNo: 'XQ20260825001',
    projectName: PROJ[6].name,
    drawTime: mkTime(-10, 10),
    randomSupplierId: S.s12.id,
    randomSupplierName: S.s12.name,
    randomSupplierContact: S.s12.contact,
    randomContractId: 'CON-2026-0065',
    randomContractNo: 'CON-2026-0065',
    linkDemand: true,
    implementationUnit: '仓储部',
    projectImplementationUnit: '仓储部',
    procurementHandler: '王芳',
    procurementApprovalMethod: APPROVAL_METHODS[1],
    procurementApprovalDate: mkTime(-12, 10).slice(0, 10),
    winningSupplierId: S.s12.id,
    winningSupplierName: S.s12.name,
    contractAmount: 28500,
    status: 'completed',
    awardTime: mkTime(-9, 14),
    creator: '采购部',
    createTime: mkTime(-12, 9),
    quotes: [],
  },
  {
    id: 'FM-RND-003',
    demandId: 'DEM-FM-RND-003',
    biddingNo: 'FM-RND-003',
    biddingName: '空调设备框架协议采购（随机抽取-草稿）',
    procurementMethod: 'framework_random',
    approvalStatus: 'draft',
    projectName: PROJ[4].name,
    linkDemand: true,
    status: 'draft',
    creator: '采购部',
    createTime: mkTime(0, 15),
    quotes: [],
  },
  {
    id: 'FM-RND-004',
    demandId: 'DEM-FM-RND-004',
    biddingNo: 'FM-RND-004',
    biddingName: '清洁用品框架协议采购（随机抽取-驳回）',
    procurementMethod: 'framework_random',
    approvalStatus: 'rejected',
    demandNo: 'XQ20260801001',
    projectName: PROJ[0].name,
    drawTime: mkTime(-25, 14),
    randomSupplierId: S.s12.id,
    randomSupplierName: S.s12.name,
    randomSupplierContact: S.s12.contact,
    randomContractNo: 'CON-2026-0012',
    linkDemand: false,
    implementationUnit: '行政部',
    projectImplementationUnit: '行政部',
    procurementHandler: '张伟',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-26, 10).slice(0, 10),
    remark: '驳回理由：采购方式选择不符合框架协议采购条件',
    status: 'rejected',
    creator: '采购部',
    createTime: mkTime(-28, 9),
    quotes: [],
  },

  // ==================== 3. 询比采购 ====================
  // 状态覆盖：draft/submitted/approved/completed/cancelled/rejected
  {
    id: 'INQ-001',
    demandId: 'DEM-INQ-001',
    biddingNo: 'INQ-001',
    biddingName: '2026秋季博览会展架搭建询比采购（已完成）',
    procurementMethod: 'inquiry',
    approvalStatus: 'approved',
    demandNo: 'XQ20260903001',
    projectName: PROJ[1].name,
    offlineDetails: [
      mkOfflineRow(1, '标准展架搭建（3m高）', 150, '套', 680, 0.09, S.s6.name),
      mkOfflineRow(2, '特装展位搭建（5×5m）', 20, '个', 8500, 0.09, S.s6.name),
      mkOfflineRow(3, '展架拆除服务', 170, '项', 120, 0.06, S.s6.name),
    ],
    ...sumOffline([
      mkOfflineRow(1, '标准展架搭建（3m高）', 150, '套', 680, 0.09),
      mkOfflineRow(2, '特装展位搭建（5×5m）', 20, '个', 8500, 0.09),
      mkOfflineRow(3, '展架拆除服务', 170, '项', 120, 0.06),
    ]),
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '李明',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-15, 10).slice(0, 10),
    meetingMinutes: [mkAttach('会议纪要-9月10日.pdf')],
    onMeetingMaterials: [mkAttach('上会材料-展架方案.pdf')],
    agentDrawResult: [mkAttach('招标代理抽取结果表.pdf')],
    awardNotice: [mkAttach('成交通知书.pdf')],
    processArchive: [mkAttach('招采过程备案.pdf')],
    winningSupplierId: S.s6.id,
    winningSupplierName: S.s6.name,
    contractAmount: 265800,
    announcementPublishTime: mkTime(-12, 9),
    bidOpeningTime: mkTime(-8, 10),
    awardTime: mkTime(-7, 15),
    isFailed: false,
    hasDispute: '否',
    status: 'completed',
    creator: '采购部',
    createTime: mkTime(-15, 9),
    quotes: [],
  },
  {
    id: 'INQ-002',
    demandId: 'DEM-INQ-002',
    biddingNo: 'INQ-002',
    biddingName: 'LED展示屏询比采购（已取消-流标）',
    procurementMethod: 'inquiry',
    approvalStatus: 'approved',
    demandNo: 'XQ20260902002',
    projectName: PROJ[3].name,
    offlineDetails: [
      mkOfflineRow(1, 'P2.5全彩LED屏', 15, '㎡', 3500, 0.13),
      mkOfflineRow(2, '安装支架定制钢架', 2, '套', 2500, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, 'P2.5全彩LED屏', 15, '㎡', 3500, 0.13),
      mkOfflineRow(2, '安装支架定制钢架', 2, '套', 2500, 0.13),
    ]),
    implementationUnit: '展厅改造项目组',
    projectImplementationUnit: '展厅改造项目组',
    procurementHandler: '赵磊',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-8, 10).slice(0, 10),
    meetingMinutes: [mkAttach('会议纪要-9月12日.pdf')],
    onMeetingMaterials: [mkAttach('上会材料-LED方案.pdf')],
    awardNotice: [],
    processArchive: [],
    isFailed: true,
    hasDispute: '否',
    status: 'cancelled',
    creator: '采购部',
    createTime: mkTime(-8, 9),
    quotes: [],
  },
  {
    id: 'INQ-003',
    demandId: 'DEM-INQ-003',
    biddingNo: 'INQ-003',
    biddingName: '办公隔断询比采购（待审）',
    procurementMethod: 'inquiry',
    approvalStatus: 'submitted',
    demandNo: 'XQ20260905001',
    projectName: PROJ[6].name,
    offlineDetails: [
      mkOfflineRow(1, '玻璃隔断（双玻百叶）', 80, '㎡', 680, 0.13),
      mkOfflineRow(2, '隔断门（含锁）', 10, '套', 5440, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, '玻璃隔断（双玻百叶）', 80, '㎡', 680, 0.13),
      mkOfflineRow(2, '隔断门（含锁）', 10, '套', 5440, 0.13),
    ]),
    implementationUnit: '后勤部',
    projectImplementationUnit: '后勤部',
    procurementHandler: '钱勇',
    procurementApprovalMethod: APPROVAL_METHODS[1],
    procurementApprovalDate: mkTime(0, 10).slice(0, 10),
    meetingMinutes: [mkAttach('会议纪要-9月21日.pdf')],
    onMeetingMaterials: [mkAttach('上会材料-隔断方案.pdf')],
    isFailed: false,
    hasDispute: '否',
    status: 'submitted',
    creator: '采购部',
    createTime: mkTime(0, 15),
    quotes: [],
  },
  {
    id: 'INQ-004',
    demandId: 'DEM-INQ-004',
    biddingNo: 'INQ-004',
    biddingName: '打印机询比采购（草稿）',
    procurementMethod: 'inquiry',
    approvalStatus: 'draft',
    projectName: PROJ[4].name,
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '孙丽',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    meetingMinutes: [mkAttach('会议纪要-草稿.pdf')],
    onMeetingMaterials: [mkAttach('上会材料-草稿.pdf')],
    isFailed: false,
    hasDispute: '否',
    status: 'draft',
    creator: '采购部',
    createTime: mkTime(0, 16),
    quotes: [],
  },
  {
    id: 'INQ-005',
    demandId: 'DEM-INQ-005',
    biddingNo: 'INQ-005',
    biddingName: '投影仪询比采购（驳回）',
    procurementMethod: 'inquiry',
    approvalStatus: 'rejected',
    demandNo: 'XQ20260820001',
    projectName: PROJ[4].name,
    offlineDetails: [
      mkOfflineRow(1, '高清投影仪', 6, '台', 3500, 0.13),
    ],
    ...sumOffline([mkOfflineRow(1, '高清投影仪', 6, '台', 3500, 0.13)]),
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '孙丽',
    procurementApprovalMethod: APPROVAL_METHODS[1],
    procurementApprovalDate: mkTime(-30, 10).slice(0, 10),
    meetingMinutes: [mkAttach('会议纪要-8月22日.pdf')],
    onMeetingMaterials: [mkAttach('上会材料-投影仪.pdf')],
    isFailed: false,
    hasDispute: '否',
    remark: '驳回理由：预算超支，建议重新评估需求',
    status: 'rejected',
    creator: '采购部',
    createTime: mkTime(-32, 9),
    quotes: [],
  },

  // ==================== 4. 竞价采购 ====================
  // 状态覆盖：draft/approved/completed/bidding
  {
    id: 'BID-001',
    demandId: 'DEM-BID-001',
    biddingNo: 'BID-001',
    biddingName: 'LED全彩屏竞价采购（竞价中）',
    procurementMethod: 'competitive_bidding',
    approvalStatus: 'approved',
    demandNo: 'XQ20260904001',
    projectName: PROJ[0].name,
    offlineDetails: [
      mkOfflineRow(1, 'P2.5全彩LED屏', 50, '㎡', 3500, 0.13),
      mkOfflineRow(2, 'LED控制主机', 3, '台', 7200, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, 'P2.5全彩LED屏', 50, '㎡', 3500, 0.13),
      mkOfflineRow(2, 'LED控制主机', 3, '台', 7200, 0.13),
    ]),
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '马超',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-5, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-LED方案.pdf')],
    agentDrawResult: [mkAttach('招标代理抽取结果表.pdf')],
    awardNotice: [],
    processArchive: [],
    biddingAnnouncement: [mkAttach('竞价公告-LED屏.pdf')],
    isFailed: false,
    hasDispute: '否',
    status: 'bidding',
    announcementPublishTime: mkTime(-3, 9),
    creator: '采购部',
    createTime: mkTime(-5, 9),
    quotes: [],
  },
  {
    id: 'BID-002',
    demandId: 'DEM-BID-002',
    biddingNo: 'BID-002',
    biddingName: '服务器竞价采购（已完成）',
    procurementMethod: 'competitive_bidding',
    approvalStatus: 'approved',
    demandNo: 'XQ20260828001',
    projectName: PROJ[4].name,
    offlineDetails: [
      mkOfflineRow(1, '机架式服务器（双路至强/128G）', 5, '台', 33000, 0.13),
      mkOfflineRow(2, '存储设备（SSD全闪/10TB）', 2, '台', 48000, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, '机架式服务器（双路至强/128G）', 5, '台', 33000, 0.13),
      mkOfflineRow(2, '存储设备（SSD全闪/10TB）', 2, '台', 48000, 0.13),
    ]),
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '林涛',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-18, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-服务器.pdf')],
    agentDrawResult: [mkAttach('招标代理抽取结果表.pdf')],
    awardNotice: [mkAttach('成交通知书.pdf')],
    processArchive: [mkAttach('招采过程备案.pdf')],
    winningSupplierId: S.s9.id,
    winningSupplierName: S.s9.name,
    contractAmount: 265000,
    isFailed: false,
    hasDispute: '否',
    status: 'completed',
    announcementPublishTime: mkTime(-15, 9),
    bidOpeningTime: mkTime(-11, 10),
    awardTime: mkTime(-10, 14),
    creator: '采购部',
    createTime: mkTime(-18, 9),
    quotes: [],
  },
  {
    id: 'BID-003',
    demandId: 'DEM-BID-003',
    biddingNo: 'BID-003',
    biddingName: '笔记本电脑竞价采购（草稿）',
    procurementMethod: 'competitive_bidding',
    approvalStatus: 'draft',
    projectName: PROJ[4].name,
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '林涛',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    isFailed: false,
    hasDispute: '否',
    status: 'draft',
    creator: '采购部',
    createTime: mkTime(0, 17),
    quotes: [],
  },

  // ==================== 5. 谈判采购-公开 ====================
  // 状态覆盖：approved/completed/rejected
  {
    id: 'NEG-O-001',
    demandId: 'DEM-NEG-O-001',
    biddingNo: 'NEG-O-001',
    biddingName: '展厅装修材料谈判采购-公开（已完成）',
    procurementMethod: 'negotiation_open',
    approvalStatus: 'approved',
    demandNo: 'XQ20260901003',
    projectName: PROJ[1].name,
    offlineDetails: [
      mkOfflineRow(1, '墙面乳胶漆', 800, '㎡', 35, 0.13, S.s11.name),
      mkOfflineRow(2, '吊顶石膏板', 450, '㎡', 58, 0.13, S.s11.name),
      mkOfflineRow(3, '地面地毯', 600, '㎡', 120, 0.09, S.s11.name),
    ],
    ...sumOffline([
      mkOfflineRow(1, '墙面乳胶漆', 800, '㎡', 35, 0.13),
      mkOfflineRow(2, '吊顶石膏板', 450, '㎡', 58, 0.13),
      mkOfflineRow(3, '地面地毯', 600, '㎡', 120, 0.09),
    ]),
    implementationUnit: '展厅改造项目组',
    projectImplementationUnit: '展厅改造项目组',
    procurementHandler: '周明',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-20, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-装修.pdf')],
    preContractReview: [mkAttach('前置审核合同文本.pdf')],
    awardNotice: [mkAttach('成交通知书.pdf')],
    processArchive: [mkAttach('招采过程备案.pdf')],
    winningSupplierId: S.s11.id,
    winningSupplierName: S.s11.name,
    contractAmount: 132000,
    isFailed: false,
    hasDispute: '否',
    status: 'completed',
    announcementPublishTime: mkTime(-17, 9),
    bidOpeningTime: mkTime(-13, 10),
    awardTime: mkTime(-12, 14),
    creator: '采购部',
    createTime: mkTime(-20, 9),
    quotes: [],
  },
  {
    id: 'NEG-O-002',
    demandId: 'DEM-NEG-O-002',
    biddingNo: 'NEG-O-002',
    biddingName: '中央空调维修服务谈判采购-公开（驳回）',
    procurementMethod: 'negotiation_open',
    approvalStatus: 'rejected',
    demandNo: 'XQ20260810002',
    projectName: PROJ[2].name,
    offlineDetails: [
      mkOfflineRow(1, '中央空调主机维修', 2, '台', 5800, 0.09),
      mkOfflineRow(2, '管道清洗保养', 1, '项', 6500, 0.06),
    ],
    ...sumOffline([
      mkOfflineRow(1, '中央空调主机维修', 2, '台', 5800, 0.09),
      mkOfflineRow(2, '管道清洗保养', 1, '项', 6500, 0.06),
    ]),
    implementationUnit: '后勤部',
    projectImplementationUnit: '后勤部',
    procurementHandler: '何刚',
    procurementApprovalMethod: APPROVAL_METHODS[1],
    procurementApprovalDate: mkTime(-35, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-空调维修.pdf')],
    isFailed: false,
    hasDispute: '否',
    remark: '驳回理由：谈判方式选择不当，建议改用询比采购',
    status: 'rejected',
    creator: '采购部',
    createTime: mkTime(-35, 9),
    quotes: [],
  },
  {
    id: 'NEG-O-003',
    demandId: 'DEM-NEG-O-003',
    biddingNo: 'NEG-O-003',
    biddingName: '弱电系统升级谈判采购-公开（流标）',
    procurementMethod: 'negotiation_open',
    approvalStatus: 'approved',
    demandNo: 'XQ20260820002',
    projectName: PROJ[4].name,
    offlineDetails: [
      mkOfflineRow(1, '网络交换机升级', 20, '台', 2800, 0.13),
      mkOfflineRow(2, '企业路由器', 5, '台', 3500, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, '网络交换机升级', 20, '台', 2800, 0.13),
      mkOfflineRow(2, '企业路由器', 5, '台', 3500, 0.13),
    ]),
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '林涛',
    procurementApprovalMethod: APPROVAL_METHODS[0],
    procurementApprovalDate: mkTime(-22, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-弱电.pdf')],
    isFailed: true,
    hasDispute: '是',
    status: 'cancelled',
    creator: '采购部',
    createTime: mkTime(-22, 9),
    quotes: [],
  },

  // ==================== 6. 谈判采购-邀请 ====================
  // 状态覆盖：approved/completed/cancelled
  {
    id: 'NEG-I-001',
    demandId: 'DEM-NEG-I-001',
    biddingNo: 'NEG-I-001',
    biddingName: '展架搭建服务谈判采购-邀请（已完成）',
    procurementMethod: 'negotiation_invited',
    approvalStatus: 'approved',
    demandNo: 'XQ20260901004',
    projectName: PROJ[1].name,
    offlineDetails: [
      mkOfflineRow(1, '标准展架搭建（3m高）', 120, '套', 680, 0.09, S.s6.name),
      mkOfflineRow(2, '特装展位搭建（5×5m）', 15, '个', 8500, 0.09, S.s6.name),
    ],
    ...sumOffline([
      mkOfflineRow(1, '标准展架搭建（3m高）', 120, '套', 680, 0.09),
      mkOfflineRow(2, '特装展位搭建（5×5m）', 15, '个', 8500, 0.09),
    ]),
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '李明',
    procurementApprovalMethod: APPROVAL_METHODS[1],
    procurementApprovalDate: mkTime(-25, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-展架.pdf')],
    awardNotice: [mkAttach('成交通知书.pdf')],
    processArchive: [mkAttach('招采过程备案.pdf')],
    winningSupplierId: S.s6.id,
    winningSupplierName: S.s6.name,
    contractAmount: 173100,
    hasDispute: '否',
    status: 'completed',
    announcementPublishTime: mkTime(-22, 9),
    bidOpeningTime: mkTime(-18, 10),
    awardTime: mkTime(-17, 14),
    creator: '采购部',
    createTime: mkTime(-25, 9),
    quotes: [],
  },
  {
    id: 'NEG-I-002',
    demandId: 'DEM-NEG-I-002',
    biddingNo: 'NEG-I-002',
    biddingName: '办公家具更换谈判采购-邀请（已取消）',
    procurementMethod: 'negotiation_invited',
    approvalStatus: 'approved',
    demandNo: 'XQ20260815002',
    projectName: PROJ[2].name,
    offlineDetails: [
      mkOfflineRow(1, '员工办公桌', 30, '张', 1800, 0.13),
      mkOfflineRow(2, '员工办公椅', 30, '把', 850, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, '员工办公桌', 30, '张', 1800, 0.13),
      mkOfflineRow(2, '员工办公椅', 30, '把', 850, 0.13),
    ]),
    implementationUnit: '后勤部',
    projectImplementationUnit: '后勤部',
    procurementHandler: '钱勇',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-30, 10).slice(0, 10),
    demandMaterial: [mkAttach('需求立项材料-家具.pdf')],
    hasDispute: '否',
    status: 'cancelled',
    remark: '项目暂停，采购计划调整',
    creator: '采购部',
    createTime: mkTime(-30, 9),
    quotes: [],
  },

  // ==================== 7. 直接采购 ====================
  // 状态覆盖：draft/submitted/approved/completed/cancelled/rejected
  {
    id: 'DRT-001',
    demandId: 'DEM-DRT-001',
    biddingNo: 'DRT-001',
    biddingName: 'LED屏配件紧急采购（已完成）',
    procurementMethod: 'direct',
    approvalStatus: 'approved',
    demandNo: 'XQ20260901005',
    projectName: PROJ[0].name,
    offlineDetails: [
      mkSimpleRow(1, 'LED电源模块', 50, '个', 120, S.s8.name),
      mkSimpleRow(2, 'LED接收卡', 20, '张', 280, S.s8.name),
    ],
    ...sumOffline([
      mkSimpleRow(1, 'LED电源模块', 50, '个', 120),
      mkSimpleRow(2, 'LED接收卡', 20, '张', 280),
    ]),
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '刘明',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-10, 10).slice(0, 10),
    procurementApprovalFile: [mkAttach('直接采购审批表.pdf')],
    demandMaterial: [mkAttach('需求立项材料-LED配件.pdf')],
    winningSupplierId: S.s8.id,
    winningSupplierName: S.s8.name,
    contractAmount: 11600,
    status: 'completed',
    awardTime: mkTime(-9, 14),
    creator: '采购部',
    createTime: mkTime(-10, 9),
    quotes: [],
  },
  {
    id: 'DRT-002',
    demandId: 'DEM-DRT-002',
    biddingNo: 'DRT-002',
    biddingName: '办公耗材直接采购（已取消）',
    procurementMethod: 'direct',
    approvalStatus: 'approved',
    demandNo: 'XQ20260825002',
    projectName: PROJ[2].name,
    offlineDetails: [
      mkSimpleRow(1, 'A4复印纸', 50, '箱', 125),
      mkSimpleRow(2, '签字笔', 100, '盒', 45),
    ],
    ...sumOffline([
      mkSimpleRow(1, 'A4复印纸', 50, '箱', 125),
      mkSimpleRow(2, '签字笔', 100, '盒', 45),
    ]),
    implementationUnit: '行政部',
    projectImplementationUnit: '行政部',
    procurementHandler: '张伟',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-15, 10).slice(0, 10),
    procurementApprovalFile: [mkAttach('直接采购审批表-耗材.pdf')],
    status: 'cancelled',
    remark: '库存盘点后发现尚有存量，取消采购',
    creator: '采购部',
    createTime: mkTime(-15, 9),
    quotes: [],
  },
  {
    id: 'DRT-003',
    demandId: 'DEM-DRT-003',
    biddingNo: 'DRT-003',
    biddingName: '消防器材补充采购（待审）',
    procurementMethod: 'direct',
    approvalStatus: 'submitted',
    demandNo: 'XQ20260918001',
    projectName: PROJ[6].name,
    offlineDetails: [
      mkSimpleRow(1, '4kg干粉灭火器', 30, '具', 85),
      mkSimpleRow(2, '烟雾探测器', 20, '个', 120),
    ],
    ...sumOffline([
      mkSimpleRow(1, '4kg干粉灭火器', 30, '具', 85),
      mkSimpleRow(2, '烟雾探测器', 20, '个', 120),
    ]),
    implementationUnit: '安监部',
    projectImplementationUnit: '安监部',
    procurementHandler: '王强',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-1, 10).slice(0, 10),
    procurementApprovalFile: [mkAttach('直接采购审批表-消防.pdf')],
    demandMaterial: [mkAttach('需求立项材料-消防.pdf')],
    status: 'submitted',
    creator: '采购部',
    createTime: mkTime(-1, 14),
    quotes: [],
  },
  {
    id: 'DRT-004',
    demandId: 'DEM-DRT-004',
    biddingNo: 'DRT-004',
    biddingName: '门禁系统升级直接采购（草稿）',
    procurementMethod: 'direct',
    approvalStatus: 'draft',
    projectName: PROJ[4].name,
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '林涛',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    status: 'draft',
    creator: '采购部',
    createTime: mkTime(0, 18),
    quotes: [],
  },
  {
    id: 'DRT-005',
    demandId: 'DEM-DRT-005',
    biddingNo: 'DRT-005',
    biddingName: '空调配件采购（驳回）',
    procurementMethod: 'direct',
    approvalStatus: 'rejected',
    demandNo: 'XQ20260805001',
    projectName: PROJ[2].name,
    offlineDetails: [
      mkSimpleRow(1, '空调压缩机', 5, '台', 3500),
    ],
    ...sumOffline([mkSimpleRow(1, '空调压缩机', 5, '台', 3500)]),
    implementationUnit: '后勤部',
    projectImplementationUnit: '后勤部',
    procurementHandler: '何刚',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-40, 10).slice(0, 10),
    procurementApprovalFile: [mkAttach('直接采购审批表-空调.pdf')],
    remark: '驳回理由：未充分说明为何不采用框架协议采购',
    status: 'rejected',
    creator: '采购部',
    createTime: mkTime(-40, 9),
    quotes: [],
  },

  // ==================== 8. 电子商城采购 ====================
  // 状态覆盖：approved/completed/bidding
  {
    id: 'EML-001',
    demandId: 'DEM-EML-001',
    biddingNo: 'EML-001',
    biddingName: '电脑及配件电子商城采购（已完成）',
    procurementMethod: 'e_mall',
    approvalStatus: 'approved',
    demandNo: 'XQ20260905002',
    projectName: PROJ[4].name,
    offlineDetails: [
      mkSimpleRow(1, '14寸笔记本电脑', 5, '台', 5500, S.s10.name),
      mkSimpleRow(2, '27寸4K显示器', 5, '台', 2400, S.s10.name),
      mkSimpleRow(3, '无线鼠标键盘套装', 10, '套', 150, S.s10.name),
    ],
    ...sumOffline([
      mkSimpleRow(1, '14寸笔记本电脑', 5, '台', 5500),
      mkSimpleRow(2, '27寸4K显示器', 5, '台', 2400),
      mkSimpleRow(3, '无线鼠标键盘套装', 10, '套', 150),
    ]),
    implementationUnit: '信息部',
    projectImplementationUnit: '信息部',
    procurementHandler: '林涛',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-12, 10).slice(0, 10),
    procurementApprovalFile: [mkAttach('电子商城采购审批表.pdf')],
    demandMaterial: [mkAttach('需求立项材料-电脑.pdf')],
    winningSupplierId: S.s10.id,
    winningSupplierName: S.s10.name,
    contractAmount: 43000,
    status: 'completed',
    awardTime: mkTime(-11, 14),
    creator: '采购部',
    createTime: mkTime(-12, 9),
    quotes: [],
  },
  {
    id: 'EML-002',
    demandId: 'DEM-EML-002',
    biddingNo: 'EML-002',
    biddingName: '打印耗材电子商城采购（已提交）',
    procurementMethod: 'e_mall',
    approvalStatus: 'submitted',
    demandNo: 'XQ20260919001',
    projectName: PROJ[2].name,
    offlineDetails: [
      mkSimpleRow(1, '激光打印机硒鼓', 20, '个', 350, S.s10.name),
      mkSimpleRow(2, 'A4复印纸', 80, '箱', 115, S.s10.name),
    ],
    ...sumOffline([
      mkSimpleRow(1, '激光打印机硒鼓', 20, '个', 350),
      mkSimpleRow(2, 'A4复印纸', 80, '箱', 115),
    ]),
    implementationUnit: '行政部',
    projectImplementationUnit: '行政部',
    procurementHandler: '张伟',
    procurementApprovalMethod: APPROVAL_METHODS[2],
    procurementApprovalDate: mkTime(-2, 10).slice(0, 10),
    procurementApprovalFile: [mkAttach('电子商城采购审批表-耗材.pdf')],
    status: 'submitted',
    creator: '采购部',
    createTime: mkTime(-2, 15),
    quotes: [],
  },

  // ==================== 9. 法定招标 ====================
  // 状态覆盖：submitted/bidding/completed
  {
    id: 'LEGAL-001',
    demandId: 'DEM-LEGAL-001',
    biddingNo: 'LEGAL-001',
    biddingName: '2026秋季博览会主场搭建法定招标（已发布）',
    procurementMethod: 'legal_bidding',
    approvalStatus: 'approved',
    demandNo: 'XQ20260908001',
    projectName: PROJ[1].name,
    offlineDetails: [
      mkOfflineRow(1, '主场桁架搭建（含顶篷）', 500, '㎡', 680, 0.09),
      mkOfflineRow(2, '主场地毯铺装', 500, '㎡', 95, 0.06),
      mkOfflineRow(3, '主场照明系统', 1, '项', 35000, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, '主场桁架搭建（含顶篷）', 500, '㎡', 680, 0.09),
      mkOfflineRow(2, '主场地毯铺装', 500, '㎡', 95, 0.06),
      mkOfflineRow(3, '主场照明系统', 1, '项', 35000, 0.13),
    ]),
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '李明',
    announcementPublishTime: mkTime(-1, 9),
    awardNotice: [],
    processArchive: [],
    judgeMethod: '综合评分法',
    status: 'published',
    creator: '采购部',
    createTime: mkTime(-3, 9),
    quotes: [],
  },
  {
    id: 'LEGAL-002',
    demandId: 'DEM-LEGAL-002',
    biddingNo: 'LEGAL-002',
    biddingName: '新办公楼装修工程法定招标（已完成）',
    procurementMethod: 'legal_bidding',
    approvalStatus: 'approved',
    demandNo: 'XQ20260601001',
    projectName: PROJ[2].name,
    offlineDetails: [
      mkOfflineRow(1, '墙面乳胶漆工程', 8000, '㎡', 32, 0.09),
      mkOfflineRow(2, '地面地砖铺设', 3500, '㎡', 180, 0.09),
      mkOfflineRow(3, '吊顶工程', 2000, '㎡', 120, 0.09),
    ],
    ...sumOffline([
      mkOfflineRow(1, '墙面乳胶漆工程', 8000, '㎡', 32, 0.09),
      mkOfflineRow(2, '地面地砖铺设', 3500, '㎡', 180, 0.09),
      mkOfflineRow(3, '吊顶工程', 2000, '㎡', 120, 0.09),
    ]),
    implementationUnit: '后勤部',
    projectImplementationUnit: '后勤部',
    procurementHandler: '何刚',
    awardNotice: [mkAttach('成交通知书-装修.pdf')],
    processArchive: [mkAttach('招采过程备案-装修.pdf')],
    winningSupplierId: S.s11.id,
    winningSupplierName: S.s11.name,
    contractAmount: 1280000,
    announcementPublishTime: mkTime(-60, 9),
    bidOpeningTime: mkTime(-50, 10),
    awardTime: mkTime(-48, 14),
    judgeMethod: '综合评分法',
    status: 'completed',
    creator: '采购部',
    createTime: mkTime(-62, 9),
    quotes: [],
  },

  // ==================== 10. 自愿招标 ====================
  // 状态覆盖：draft/approved/rejected
  {
    id: 'VOL-001',
    demandId: 'DEM-VOL-001',
    biddingNo: 'VOL-001',
    biddingName: '展厅改造自愿招标（已驳回）',
    procurementMethod: 'voluntary_bidding',
    approvalStatus: 'rejected',
    demandNo: 'XQ20260910001',
    projectName: PROJ[3].name,
    offlineDetails: [
      mkOfflineRow(1, '展厅墙面设计施工', 500, '㎡', 480, 0.09),
      mkOfflineRow(2, '展陈道具制作安装', 1, '项', 85000, 0.13),
    ],
    ...sumOffline([
      mkOfflineRow(1, '展厅墙面设计施工', 500, '㎡', 480, 0.09),
      mkOfflineRow(2, '展陈道具制作安装', 1, '项', 85000, 0.13),
    ]),
    implementationUnit: '展厅改造项目组',
    projectImplementationUnit: '展厅改造项目组',
    procurementHandler: '赵磊',
    remark: '驳回理由：项目规模未达到自愿招标标准，建议改用询比采购',
    awardNotice: [],
    processArchive: [],
    judgeMethod: '综合评分法',
    status: 'rejected',
    creator: '采购部',
    createTime: mkTime(-4, 9),
    quotes: [],
  },
  {
    id: 'VOL-002',
    demandId: 'DEM-VOL-002',
    biddingNo: 'VOL-002',
    biddingName: '2026国际消费电子展搭建自愿招标（已审批通过）',
    procurementMethod: 'voluntary_bidding',
    approvalStatus: 'approved',
    demandNo: 'XQ20260911001',
    projectName: PROJ[7].name,
    offlineDetails: [
      mkOfflineRow(1, '展位标准搭建（6×6m）', 30, '个', 28000, 0.09),
      mkOfflineRow(2, '特装展位（9×9m）', 10, '个', 65000, 0.09),
    ],
    ...sumOffline([
      mkOfflineRow(1, '展位标准搭建（6×6m）', 30, '个', 28000, 0.09),
      mkOfflineRow(2, '特装展位（9×9m）', 10, '个', 65000, 0.09),
    ]),
    implementationUnit: '展商服务部',
    projectImplementationUnit: '展会运营部',
    procurementHandler: '李明',
    awardNotice: [],
    processArchive: [],
    judgeMethod: '综合评分法',
    status: 'submitted',
    creator: '采购部',
    createTime: mkTime(-1, 9),
    quotes: [],
  },
];

// =====================================================================
//  MOCK_SUPPLIER_QUOTES —— 关联目录内比价工单
// =====================================================================

export const MOCK_SUPPLIER_QUOTES: SupplierQuote[] = (() => {
  let seq = 1;
  const result: SupplierQuote[] = [];

  // 目录内比价 FM-CAT-001（LED显示设备）—— 3 家供应商
  {
    const b = MOCK_BIDDINGS.find((x) => x.id === 'FM-CAT-001')!;
    const items = b.items || [];
    const prices = [
      { sup: S.s8, rates: [0.13, 0.13], prices: [3400, 7100] },
      { sup: S.s5, rates: [0.13, 0.13], prices: [3450, 7150] },
      { sup: S.s2, rates: [0.09, 0.09], prices: [3380, 7080] },
    ];
    prices.forEach(({ sup, rates, prices }) => {
      const details: SupplierQuoteDetail[] = items.map((it, i) => {
        const p = prices[i] || 0;
        const amt = Math.round(p * (it.quantity || 0) * 100) / 100;
        const tax = rates[i] > 0 ? Math.round((amt / (1 + rates[i])) * rates[i] * 100) / 100 : 0;
        return {
          productCode: it.productCode,
          productName: it.productName,
          specification: it.specification,
          unit: it.unit,
          quantity: it.quantity || 0,
          unitPrice: p,
          taxRate: rates[i],
          amount: amt,
          taxAmount: tax,
          amountExcludingTax: Math.round((amt - tax) * 100) / 100,
          isOverSingleLimit: false,
          deliveryDate: ds,
        };
      });
      result.push(mkQuote(seq++, b.id, b.biddingNo, b.biddingName, sup.id, sup.name, sup.contact, sup.phone, details, sup.id === S.s8.id ? 'accepted' : 'submitted'));
    });
  }

  // 目录内比价 FM-CAT-002（办公家具）—— 2 家
  {
    const b = MOCK_BIDDINGS.find((x) => x.id === 'FM-CAT-002')!;
    const items = b.items || [];
    const prices = [
      { sup: S.s7, rates: [0.13, 0.13], prices: [1750, 820] },
      { sup: S.s3, rates: [0.13, 0.13], prices: [1780, 830] },
    ];
    prices.forEach(({ sup, rates, prices }) => {
      const details: SupplierQuoteDetail[] = items.map((it, i) => {
        const p = prices[i] || 0;
        const amt = Math.round(p * (it.quantity || 0) * 100) / 100;
        const tax = rates[i] > 0 ? Math.round((amt / (1 + rates[i])) * rates[i] * 100) / 100 : 0;
        return {
          productCode: it.productCode,
          productName: it.productName,
          specification: it.specification,
          unit: it.unit,
          quantity: it.quantity || 0,
          unitPrice: p,
          taxRate: rates[i],
          amount: amt,
          taxAmount: tax,
          amountExcludingTax: Math.round((amt - tax) * 100) / 100,
          isOverSingleLimit: false,
          deliveryDate: ds,
        };
      });
      result.push(mkQuote(seq++, b.id, b.biddingNo, b.biddingName, sup.id, sup.name, sup.contact, sup.phone, details, sup.id === S.s7.id ? 'accepted' : 'submitted'));
    });
  }

  // 目录内比价 FM-CAT-003（已完成）—— 2 家
  {
    const b = MOCK_BIDDINGS.find((x) => x.id === 'FM-CAT-003')!;
    const items = b.items || [];
    const prices = [
      { sup: S.s1, rates: [0.13, 0.13], prices: [165, 62] },
      { sup: S.s2, rates: [0.09, 0.09], prices: [168, 63] },
    ];
    prices.forEach(({ sup, rates, prices }) => {
      const details: SupplierQuoteDetail[] = items.map((it, i) => {
        const p = prices[i] || 0;
        const amt = Math.round(p * (it.quantity || 0) * 100) / 100;
        const tax = rates[i] > 0 ? Math.round((amt / (1 + rates[i])) * rates[i] * 100) / 100 : 0;
        return {
          productCode: it.productCode,
          productName: it.productName,
          specification: it.specification,
          unit: it.unit,
          quantity: it.quantity || 0,
          unitPrice: p,
          taxRate: rates[i],
          amount: amt,
          taxAmount: tax,
          amountExcludingTax: Math.round((amt - tax) * 100) / 100,
          isOverSingleLimit: false,
          deliveryDate: ds,
        };
      });
      result.push(mkQuote(seq++, b.id, b.biddingNo, b.biddingName, sup.id, sup.name, sup.contact, sup.phone, details, sup.id === S.s1.id ? 'accepted' : 'rejected'));
    });
  }

  return result;
})();


// =====================================================================
//  MOCK_PROCUREMENT_DEMANDS —— 与 MOCK_BIDDINGS 一一对应（32条）
// =====================================================================

const DEMAND_APPLICANTS = ['张三', '李四', '王五', '赵六'];
const DEMAND_MODES: Array<'meeting' | 'sign_report' | 'application_form'> = ['meeting', 'sign_report', 'application_form'];
const DEMAND_TYPES: ProcurementDemandType[] = ['material', 'service_project', 'material', 'implementation_project', 'service_non_engineering'];

// 精简 biddingName 得到 projectName
const mkSimpleProjectName = (name?: string): string => {
  if (!name) return '未命名项目';
  return name
    .replace(/框架协议采购（随机抽取[^）]*）/g, '')
    .replace(/框架协议采购/g, '采购')
    .replace(/（已完成）|（已取消[^）]*）|（进行中）|（草稿）|（驳回）|（流标）/g, '')
    .replace(/谈判采购-[^（]+/g, '')
    .replace(/询比采购|竞价采购|直接采购|电子商城采购|法定招标|自愿招标/g, '')
    .replace(/（[^）]*）/g, '')
    .trim() || name;
};

// 采购方式 → 采购需求状态
const biddingToDemandStatus = (bs?: string): ProcurementDemandStatus => {
  switch (bs) {
    case 'completed':
    case 'evaluated':
      return 'confirm_approved';
    case 'published':
    case 'bidding':
      return 'confirm_approved';
    case 'cancelled':
      return 'confirm_rejected';
    case 'approved':
      return 'confirm_pending';
    case 'submitted':
      return 'pending';
    case 'rejected':
      return 'rejected';
    case 'draft':
      return 'draft';
    default:
      return 'pending';
  }
};

// 从 bidding items 生成需求明细
const mkDemandDetails = (b: Bidding): ProcurementDemandDetail[] => {
  const out: ProcurementDemandDetail[] = [];
  if (b.items && b.items.length > 0) {
    b.items.slice(0, 3).forEach((it, i) => {
      out.push({
        id: `PDD-${b.id}-${i + 1}`,
        demandId: `DEM-${b.id}`,
        productCode: it.productCode,
        productName: it.productName,
        specification: it.specification,
        unit: it.unit,
        quantity: it.quantity || 0,
        unitPriceExcludingTax: it.unitPriceLimitExcludingTax,
        unitPriceIncludingTax: it.unitPriceLimitIncludingTax,
        taxRate: it.taxRate,
        amountExcludingTax: it.unitPriceLimitExcludingTax
          ? Math.round(it.unitPriceLimitExcludingTax * (it.quantity || 0) * 100) / 100
          : undefined,
      });
    });
  } else if (b.offlineDetails && b.offlineDetails.length > 0) {
    b.offlineDetails.slice(0, 3).forEach((it, i) => {
      out.push({
        id: `PDD-${b.id}-${i + 1}`,
        demandId: `DEM-${b.id}`,
        productCode: `OD-${b.id}-${i + 1}`,
        productName: it.itemName,
        specification: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unitPriceExcludingTax: it.unitPriceExcludingTax,
        unitPriceIncludingTax: it.unitPriceIncludingTax,
        taxRate: it.taxRate,
        amountExcludingTax: it.amountExcludingTax,
        taxAmount: it.taxAmount,
        amountIncludingTax: it.amountIncludingTax,
      });
    });
  }
  return out;
};

// 采购方式 → 业务分类 + 采购类型
const methodToBiz = (m?: string): { procurementType: 'within_framework' | 'outside_framework' | 'new_supplier'; isFramework: boolean } => {
  if (!m) return { procurementType: 'outside_framework', isFramework: false };
  if (m.startsWith('framework_')) return { procurementType: 'within_framework', isFramework: true };
  if (m === 'legal_bidding' || m === 'voluntary_bidding' || m === 'inquiry' || m === 'competitive_bidding' || m === 'negotiation_open' || m === 'negotiation_invited') {
    return { procurementType: 'outside_framework', isFramework: false };
  }
  return { procurementType: 'outside_framework', isFramework: false }; // direct / e_mall
};

// 生成一条 ProcurementDemand
const mkDemand = (b: Bidding, idx: number): ProcurementDemand => {
  const biz = methodToBiz(b.procurementMethod);
  const applyOffset = -(15 + (idx % 15)); // createTime 前 15-30 天
  const deliOffset = b.startTime ? -(7 + (idx % 5)) : -(10 + (idx % 8));
  const projectName = mkSimpleProjectName(b.biddingName);
  const amountBase = b.contractAmount || b.totalAmountExcludingTax || b.totalAmountIncludingTax || 50000;
  const estAmount = Math.round(amountBase / 0.95 / 100) * 100; // 预算略高于中标金额
  
  return {
    id: `DEM-${b.id}`,
    demandNo: b.demandNo || `XQ${y}${m}${String(idx + 1).padStart(3, '0')}001`,
    demandType: DEMAND_TYPES[idx % DEMAND_TYPES.length],
    procurementType: biz.procurementType,
    procurementMode: DEMAND_MODES[idx % DEMAND_MODES.length],
    applicant: DEMAND_APPLICANTS[idx % DEMAND_APPLICANTS.length],
    applicantDept: '采购部',
    applyDate: mkTime(applyOffset).slice(0, 10),
    projectName,
    reason: `${projectName}物资采购需求`,
    estimatedAmount: estAmount,
    requiredDeliveryDate: mkTime(deliOffset).slice(0, 10),
    status: biddingToDemandStatus(b.status),
    createTime: mkTime(applyOffset, 9),
    details: mkDemandDetails(b),
    relatedOrderId: undefined,
  };
};

export const MOCK_PROCUREMENT_DEMANDS: ProcurementDemand[] = MOCK_BIDDINGS.map((b, i) => mkDemand(b, i));

// =====================================================================
//  MOCK_PROCUREMENT_ORDERS —— 仅给 completed/evaluated 的 bidding 创建
// =====================================================================

const ORDER_STATUS_MAP: Record<string, ProcurementOrderStatus> = {
  completed: 'completed',
  evaluated: 'approved',
};

// 从 bidding.items 生成订单明细
const mkOrderDetails = (b: Bidding): ProcurementOrderDetail[] => {
  const out: ProcurementOrderDetail[] = [];
  if (b.items && b.items.length > 0) {
    b.items.slice(0, 3).forEach((it, i) => {
      out.push({
        id: `POD-${b.id}-${i + 1}`,
        orderId: `PO-${b.id}`,
        productId: `PROD-${it.productCode}`,
        productCode: it.productCode,
        productName: it.productName,
        specification: it.specification,
        unit: it.unit,
        quantity: it.quantity || 0,
        unitPrice: it.unitPriceLimitExcludingTax,
        unitPriceIncludingTax: it.unitPriceLimitIncludingTax,
        amount: it.unitPriceLimitExcludingTax
          ? Math.round(it.unitPriceLimitExcludingTax * (it.quantity || 0) * 100) / 100
          : undefined,
        taxRate: it.taxRate,
        winningSupplierId: b.winningSupplierId,
        winningSupplierName: b.winningSupplierName,
      });
    });
  } else if (b.offlineDetails && b.offlineDetails.length > 0) {
    b.offlineDetails.slice(0, 3).forEach((it, i) => {
      out.push({
        id: `POD-${b.id}-${i + 1}`,
        orderId: `PO-${b.id}`,
        productId: `PROD-OD-${b.id}-${i + 1}`,
        productCode: `OD-${b.id}-${i + 1}`,
        productName: it.itemName,
        specification: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPriceExcludingTax,
        unitPriceIncludingTax: it.unitPriceIncludingTax,
        amount: it.amountExcludingTax,
        taxRate: it.taxRate,
        taxAmount: it.taxAmount,
        winningSupplierId: b.winningSupplierId,
        winningSupplierName: b.winningSupplierName,
      });
    });
  }
  return out;
};

// 生成订单编号
const mkOrderNo = (b: Bidding, seq: number): string => {
  const baseDate = (b.awardTime || b.createTime || mkTime(0)).slice(0, 10).replace(/-/g, '');
  return `CGDD${baseDate}${String(seq).padStart(3, '0')}`;
};

const COMPLETED_BIDDINGS = MOCK_BIDDINGS.filter(b => b.status === 'completed' || b.status === 'evaluated');

export const MOCK_PROCUREMENT_ORDERS: ProcurementOrder[] = COMPLETED_BIDDINGS.map((b, i) => {
  const finishTime = b.awardTime || b.createTime || mkTime(-10);
  const createOffset = 1 + (i % 3); // awardTime 后 1-3 天
  
  const sourceType: ProcurementOrder['sourceType'] = b.procurementMethod?.startsWith('framework')
    ? 'framework'
    : 'one_time';

  const status: ProcurementOrderStatus = b.status === 'completed' ? 'completed' : 'approved';
  
  const total = b.contractAmount || b.totalAmountIncludingTax || 50000;
  
  return {
    id: `PO-${b.id}`,
    orderNo: mkOrderNo(b, i + 1),
    sourceType,
    demandId: `DEM-${b.id}`,
    demandNo: b.demandNo,
    contractId: b.contractAmount ? `HT-${b.id}` : undefined,
    contractNo: b.contractAmount ? `HT-${b.id}` : undefined,
    supplierId: b.winningSupplierId || (b.inviteSupplierIds && b.inviteSupplierIds[0]),
    supplierName: b.winningSupplierName,
    status,
    createTime: mkTime(createOffset, 10),
    creator: '采购部',
    creatorDept: '采购部',
    handler: '刘明',
    handlingDepartment: '采购部',
    deliveryDate: mkTime(createOffset + 10).slice(0, 10),
    contactPerson: b.winningSupplierId ? '' : undefined,
    contactPhone: '',
    completionTime: status === 'completed' ? mkTime(createOffset + 15, 18) : undefined,
    details: mkOrderDetails(b),
  };
});

// =====================================================================
//  MOCK_PROCUREMENT_INSPECTIONS —— 仅给 completed 的订单创建
// =====================================================================

const COMPLETED_ORDERS = MOCK_PROCUREMENT_ORDERS.filter(o => o.status === 'completed');

// 生成验收明细（从订单 details 复制）
const mkInspectionDetails = (order: ProcurementOrder) => order.details.map((d, i) => ({
  id: `INSPD-${order.id}-${i + 1}`,
  productId: d.productId,
  productCode: d.productCode,
  productName: d.productName,
  specification: d.specification,
  unit: d.unit,
  orderedQuantity: d.quantity,
  inspectedQuantity: d.quantity,
  passQuantity: d.quantity,
  failQuantity: 0,
  isQualified: true,
}));

const mkInspectionNo = (order: ProcurementOrder, seq: number): string => {
  const baseDate = (order.createTime || mkTime(-5)).slice(0, 10).replace(/-/g, '');
  return `YSSJ${baseDate}${String(seq).padStart(3, '0')}`;
};

export const MOCK_PROCUREMENT_INSPECTIONS: ProcurementInspection[] = COMPLETED_ORDERS.map((o, i) => ({
  id: `INSP-${o.id}`,
  inspectionNo: mkInspectionNo(o, i + 1),
  orderId: o.id,
  orderNo: o.orderNo,
  supplierId: o.supplierId,
  supplierName: o.supplierName,
  inspectionDate: mkTime(25 + i, 10).slice(0, 10),
  inspector: '质检员A',
  status: 'approved',
  remark: '验收合格，数量和质量均符合要求',
  details: mkInspectionDetails(o),
  approveTime: mkTime(25 + i, 14),
  approver: '质量管理部',
}));

// =====================================================================
//  MOCK_CONTRACT_LEDGERS —— 合同台账（只给 completed/evaluated 的 bidding 生成）
// =====================================================================

/** BiddingProcurementMethod → ContractFormation 映射（类型安全） */
const METHOD_TO_FORMATION: Record<string, ContractLedger['formation']> = {
  framework_catalog: 'state_owned_framework',
  framework_random: 'state_owned_framework',
  inquiry: 'state_owned_xunbi',
  competitive_bidding: 'state_owned_jingjia',
  negotiation_open: 'state_owned_tanpan',
  negotiation_invited: 'state_owned_tanpan',
  direct: 'state_owned_direct',
  e_mall: 'state_owned_mall',
  legal_bidding: 'legal_bidding',
  voluntary_bidding: 'voluntary_bidding',
};

/** Bidding.status → ContractLedger.status 映射 */
const BIDDING_TO_CONTRACT_STATUS: Record<string, ContractLedger['status']> = {
  completed: 'completed',
  evaluated: 'active',
};

/** 根据 bidding 信息判断 contractType（工程类 vs 非工程类） */
const inferContractType = (b: Bidding): ContractLedger['contractType'] => {
  const name = (b.biddingName || b.projectName || '').toLowerCase();
  const method = b.procurementMethod || '';
  // 法定/自愿招标通常是工程类
  if (method === 'legal_bidding' || method === 'voluntary_bidding') return 'engineering';
  // 名称含工程类关键词
  if (/工程|布线|改造|搭建|装修|施工/.test(b.biddingName || '')) return 'engineering';
  if (/工程|布线|改造|搭建|装修|施工/.test(b.projectName || '')) return 'engineering';
  return 'non_engineering';
};

/** 生成合同编号：HT + YYMMDD + 3位序号 */
const mkContractNo = (dateStr: string, seq: number): string => {
  const d = (dateStr || ds).slice(2, 10).replace(/-/g, ''); // YYMMDD
  return `HT${d}${String(seq).padStart(3, '0')}`;
};

/** 金额元 → 万元 */
const yuanToWan = (yuan?: number): number | undefined => {
  if (yuan == null) return undefined;
  return Math.round((yuan / 10000) * 100) / 100;
};

const COMPLETED_BIDDINGS_FOR_LEDGER = MOCK_BIDDINGS.filter(
  (b) => b.status === 'completed' || b.status === 'evaluated'
);

/** 根据合同状态推断归档/履行情况 */
const ledgerArchiveStatus = (s: ContractLedger['status']): ContractLedger['archiveStatus'] => {
  if (s === 'completed') return 'archived';
  if (s === 'active') return 'in_progress';
  return 'not_started';
};

/** 根据合同状态推断 paidAmount */
const ledgerPaidAmount = (s: ContractLedger['status'], totalWan?: number): number | undefined => {
  if (totalWan == null) return undefined;
  if (s === 'completed') return totalWan; // 付清
  if (s === 'active') return Math.round(totalWan * 0.6 * 100) / 100; // 60% 已付
  return 0;
};

export const MOCK_CONTRACT_LEDGERS: ContractLedger[] = COMPLETED_BIDDINGS_FOR_LEDGER.map((b, i) => {
  const awardDate = (b.awardTime || b.createTime || mkTime(0)).slice(0, 10);
  const signingDate = mkTime(3 + i, 10).slice(0, 10); // awardTime 后 3+i 天签
  const effectiveDate = signingDate;
  const terminationDate = mkTime(365, 10).slice(0, 10); // 1 年后
  const status: ContractLedger['status'] = BIDDING_TO_CONTRACT_STATUS[b.status!] || 'active';
  const formation = METHOD_TO_FORMATION[b.procurementMethod || ''] || 'state_owned_direct';
  const contractNo = mkContractNo(awardDate, i + 1);
  const amountWan = yuanToWan(b.contractAmount || b.totalAmountIncludingTax);

  return {
    id: `HT-${b.id}`,
    contractId: `HT-${b.id}`,
    contractNo,
    contractName: `${b.biddingName || b.projectName || '招采'}合同`,
    contractNature: 'procurement',
    category: 'procurement',
    contractType: inferContractType(b),
    formation,
    winningDate: awardDate,
    isModelText: true,
    demandDepartment: b.procurementHandler ? '采购部' : '需求部门',
    handlingDepartment: '采购部',
    handler: b.procurementHandler || '刘明',
    handlerContact: '0731-88880000',
    counterpartyName: b.winningSupplierName,
    counterpartyContact: '',
    mainContent: `${b.biddingName || b.projectName}，按招采文件约定的技术标准和服务内容执行`,
    signingDate,
    effectiveDate,
    terminationDate,
    endDate: terminationDate,
    expireDate: terminationDate,
    amount: amountWan,
    paidAmount: ledgerPaidAmount(status, amountWan),
    paidAmountBase: ledgerPaidAmount(status, amountWan) || 0,
    businessCategory: 'expense',
    archiveStatus: ledgerArchiveStatus(status),
    approvalMethod: b.procurementApprovalMethod || '采购项目申请表',
    status,
    biddingId: b.id,
    biddingNo: b.biddingNo,
    demandId: b.demandId,
    demandNo: b.demandNo,
    projectName: b.projectName || b.biddingName,
    guaranteeEvaluation: { isOpen: !b.procurementMethod?.startsWith('framework'), guaranteeType: '履约保证金' },
    assessmentManagement: 'single_project',
    yearlyEvaluation: false,
  };
});

// =====================================================================
//  MOCK_CONTRACT_PURCHASE_ORDERS —— 合同采购订单（基于非 framework 且 active/completed 的台账生成）
// =====================================================================

/** 取台账对应的 contractType 枚举值 → 同时作为 CPO 的备注分类 */
const SUPPORTED_CPO_STATUSES: ContractLedger['status'][] = ['active', 'completed'];

const LEDGERS_FOR_CPO = MOCK_CONTRACT_LEDGERS.filter(
  (l) => SUPPORTED_CPO_STATUSES.includes(l.status) && !l.formation.startsWith('state_owned_framework')
);

/** 生成 CPO 编号：CPO + YYMMDD + 3位序号 */
const mkCPONo = (dateStr: string, seq: number): string => {
  const d = (dateStr || ds).slice(2, 10).replace(/-/g, '');
  return `CPO${d}${String(seq).padStart(3, '0')}`;
};

/** 从 bidding 的 offlineDetails 或 items 取前 N 条生成 CPO details */
const mkCPODetails = (b: Bidding, cpoId: string): ContractPurchaseOrderDetail[] => {
  const takeN = 3;
  if (b.procurementMethod?.startsWith('framework')) {
    // 目录内比价：从 items 取
    return (b.items || []).slice(0, takeN).map((it, i) => {
      const unitPrice = it.supplierUnitPriceExTax ?? it.unitPriceLimitExcludingTax ?? 0;
      const qty = it.quantity || 0;
      const amt = Math.round(unitPrice * qty * 100) / 100;
      return {
        id: `CPOD-${cpoId}-${i + 1}`,
        orderId: cpoId,
        productId: `P-${i + 1}`,
        productCode: it.productCode || `SKU-${String(i + 1).padStart(4, '0')}`,
        productName: it.productName || it.projectName || '框架协议商品',
        specification: it.specification || it.description,
        unit: it.unit || '个',
        contractQuantity: qty,
        deliveredQuantity: 0,
        orderQuantity: qty,
        unitPrice,
        amount: amt,
        deliveryDate: mkTime(30 + i, 10).slice(0, 10),
      };
    });
  }
  // 线下录入：从 offlineDetails 取
  return (b.offlineDetails || []).slice(0, takeN).map((it, i) => {
    const unitPrice = it.unitPriceIncludingTax || it.unitPriceExcludingTax || 0;
    const qty = it.quantity || 0;
    const amt = Math.round(unitPrice * qty * 100) / 100;
    return {
      id: `CPOD-${cpoId}-${i + 1}`,
      orderId: cpoId,
      productId: `P-${i + 1}`,
      productCode: `SKU-${String(i + 1).padStart(4, '0')}`,
      productName: it.itemName,
      specification: '',
      unit: it.unit || '个',
      contractQuantity: qty,
      deliveredQuantity: 0,
      orderQuantity: qty,
      unitPrice,
      amount: amt,
      deliveryDate: mkTime(30 + i, 10).slice(0, 10),
    };
  });
};

export const MOCK_CONTRACT_PURCHASE_ORDERS: ContractPurchaseOrder[] = LEDGERS_FOR_CPO.map((ledger, i) => {
  const bidding = MOCK_BIDDINGS.find((b) => b.id === ledger.biddingId)!;
  const cpoId = `CPO-${bidding.id}`;
  const createTime = mkTime(5 + i, 10);
  const cpoStatus: ContractPurchaseOrderStatus = ledger.status === 'completed' ? 'submitted' : 'submitted';

  return {
    id: cpoId,
    orderNo: mkCPONo(ledger.signingDate || ds, i + 1),
    contractId: ledger.id,
    contractNo: ledger.contractNo,
    contractName: ledger.contractName,
    supplierId: bidding.winningSupplierId || '',
    supplierName: bidding.winningSupplierName || '',
    status: cpoStatus,
    createTime,
    creator: '采购部',
    submitTime: createTime,
    procurementDemandId: bidding.demandId,
    procurementDemandNo: bidding.demandNo,
    projectName: bidding.projectName || bidding.biddingName,
    totalDuration: '按合同约定',
    acceptanceStandard: '按国家及行业标准',
    paymentTerms: '货到验收合格后 30 日内付款',
    details: mkCPODetails(bidding, cpoId),
  };
});

// =====================================================================
//  MOCK_SUPPLIERS —— 12 条供应商数据，与 S.s1~S.s12 一一对应
// =====================================================================

const mkSupplierCode = (idx: number): string => `SUP-CG-${String(idx).padStart(3, '0')}`;
const mkSupplierAddress = (idx: number): string => (
  [
    '江苏省南京市江宁区经济开发区 88 号',
    '天津市滨海新区工业园区 12 号',
    '广东省佛山市顺德区工业园 36 号',
    '四川省成都市高新区科技园 58 号',
    '上海市浦东新区张江高科技园区 101 号',
    '北京市朝阳区建国路 77 号',
    '浙江省杭州市余杭区良渚街道 22 号',
    '安徽省合肥市蜀山区高新区 15 号',
    '福建省厦门市思明区软件园 9 号',
    '广东省深圳市南山区科技园 66 号',
    '江苏省苏州市工业园区 42 号',
    '辽宁省沈阳市铁西区装备制造园 7 号',
  ][idx - 1] || '中国'
);
const mkSupplierBusinessScope = (idx: number): string => (
  [
    '钢材、金属制品生产与销售',
    '铝材生产、加工、销售',
    '建材、装饰材料批发零售',
    '新材料研发、生产与销售',
    '综合物资供应与配送',
    '展览展示设计、搭建与服务',
    '办公家具生产、销售与安装',
    'LED 显示技术开发、产品销售',
    '电脑硬件、网络设备销售',
    '电子产品线上商城销售',
    '装饰工程设计与施工',
    '五金制品批发与零售',
  ][idx - 1] || '一般经营项目'
);

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: S.s1.id,
    code: mkSupplierCode(1),
    name: S.s1.name,
    contact: S.s1.contact,
    phone: S.s1.phone,
    address: mkSupplierAddress(1),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(1),
    createTime: '2024-06-15 10:00:00',
    creator: '系统',
  },
  {
    id: S.s2.id,
    code: mkSupplierCode(2),
    name: S.s2.name,
    contact: S.s2.contact,
    phone: S.s2.phone,
    address: mkSupplierAddress(2),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(2),
    createTime: '2024-07-20 10:00:00',
    creator: '系统',
  },
  {
    id: S.s3.id,
    code: mkSupplierCode(3),
    name: S.s3.name,
    contact: S.s3.contact,
    phone: S.s3.phone,
    address: mkSupplierAddress(3),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(3),
    createTime: '2024-08-10 10:00:00',
    creator: '系统',
  },
  {
    id: S.s4.id,
    code: mkSupplierCode(4),
    name: S.s4.name,
    contact: S.s4.contact,
    phone: S.s4.phone,
    address: mkSupplierAddress(4),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(4),
    createTime: '2024-09-05 10:00:00',
    creator: '系统',
  },
  {
    id: S.s5.id,
    code: mkSupplierCode(5),
    name: S.s5.name,
    contact: S.s5.contact,
    phone: S.s5.phone,
    address: mkSupplierAddress(5),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(5),
    createTime: '2024-10-01 10:00:00',
    creator: '系统',
  },
  {
    id: S.s6.id,
    code: mkSupplierCode(6),
    name: S.s6.name,
    contact: S.s6.contact,
    phone: S.s6.phone,
    address: mkSupplierAddress(6),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(6),
    createTime: '2024-04-18 10:00:00',
    creator: '系统',
  },
  {
    id: S.s7.id,
    code: mkSupplierCode(7),
    name: S.s7.name,
    contact: S.s7.contact,
    phone: S.s7.phone,
    address: mkSupplierAddress(7),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(7),
    createTime: '2024-05-22 10:00:00',
    creator: '系统',
  },
  {
    id: S.s8.id,
    code: mkSupplierCode(8),
    name: S.s8.name,
    contact: S.s8.contact,
    phone: S.s8.phone,
    address: mkSupplierAddress(8),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(8),
    createTime: '2024-03-11 10:00:00',
    creator: '系统',
  },
  {
    id: S.s9.id,
    code: mkSupplierCode(9),
    name: S.s9.name,
    contact: S.s9.contact,
    phone: S.s9.phone,
    address: mkSupplierAddress(9),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(9),
    createTime: '2024-02-28 10:00:00',
    creator: '系统',
  },
  {
    id: S.s10.id,
    code: mkSupplierCode(10),
    name: S.s10.name,
    contact: S.s10.contact,
    phone: S.s10.phone,
    address: mkSupplierAddress(10),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(10),
    createTime: '2024-11-08 10:00:00',
    creator: '系统',
  },
  {
    id: S.s11.id,
    code: mkSupplierCode(11),
    name: S.s11.name,
    contact: S.s11.contact,
    phone: S.s11.phone,
    address: mkSupplierAddress(11),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(11),
    createTime: '2024-12-12 10:00:00',
    creator: '系统',
  },
  {
    id: S.s12.id,
    code: mkSupplierCode(12),
    name: S.s12.name,
    contact: S.s12.contact,
    phone: S.s12.phone,
    address: mkSupplierAddress(12),
    status: 'enabled',
    businessScope: mkSupplierBusinessScope(12),
    createTime: '2025-01-20 10:00:00',
    creator: '系统',
  },
];

