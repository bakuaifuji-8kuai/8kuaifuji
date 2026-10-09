/** 精准生成招采及合约模块测试数据 — 100% 对齐 types/index.ts interface 字段 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_TS = path.resolve('src/mock/data.ts');
const DEMO_TS = path.resolve('src/mock/procurementDemoData.ts');

// ============ 1. Suppliers ============
const suppliers = [
  { id: 'SUP-001', code: 'SUP001', name: '晨光办公用品有限公司', contact: '张经理', phone: '0731-88881001', address: '长沙市雨花区高桥大市场 B1-01', status: 'enabled' as const, unifiedSocialCreditCode: '91430100MA4ABC001X', createTime: '2025-06-01' },
  { id: 'SUP-002', code: 'SUP002', name: '锐捷网络科技股份有限公司', contact: '赵工', phone: '0731-88881005', address: '长沙市高新区麓谷大道 88 号', status: 'enabled' as const, unifiedSocialCreditCode: '91430100MA4ABC002Y', createTime: '2025-03-15' },
  { id: 'SUP-003', code: 'SUP003', name: '华展展览服务有限公司', contact: '李总', phone: '0731-88881002', address: '长沙市开福区湘江世纪城', status: 'enabled' as const, unifiedSocialCreditCode: '91430100MA4ABC003Z', createTime: '2025-04-10' },
  { id: 'SUP-004', code: 'SUP004', name: '启程餐饮管理有限公司', contact: '陈经理', phone: '0731-88881006', address: '长沙市芙蓉区五一大道 77 号', status: 'enabled' as const, unifiedSocialCreditCode: '91430100MA4ABC004A', createTime: '2026-01-01' },
  { id: 'SUP-005', code: 'SUP005', name: '华东物资供应有限公司', contact: '王工', phone: '0731-88881003', address: '长沙市岳麓区麓谷工业园', status: 'enabled' as const, unifiedSocialCreditCode: '91430100MA4ABC005B', createTime: '2025-09-01' },
  { id: 'SUP-006', code: 'SUP006', name: '湖南鸿信物业服务有限公司', contact: '周经理', phone: '0731-88881007', address: '长沙市天心区芙蓉南路', status: 'enabled' as const, unifiedSocialCreditCode: '91430100MA4ABC006C', createTime: '2025-07-01' },
  { id: 'SUP-007', code: 'SUP007', name: '恒通物流有限公司', contact: '孙总', phone: '0731-88881008', address: '长沙县经济开发区物流园', status: 'disabled' as const, unifiedSocialCreditCode: '91430100MA4ABC007D', createTime: '2025-05-01' },
];

// ============ 2. EvaluationTemplates ============
const evalTemplates = [
  { id: 'ET-001', name: '办公用品采购通用评分', type: 'procurement' as const, indicators: [
    { id: 'IND-1-1', name: '价格', category: '报价', weight: 40, maxScore: 100 },
    { id: 'IND-1-2', name: '质量', category: '产品', weight: 30, maxScore: 100 },
    { id: 'IND-1-3', name: '交付能力', category: '服务', weight: 20, maxScore: 100 },
    { id: 'IND-1-4', name: '售后服务', category: '服务', weight: 10, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2025-06-01' },
  { id: 'ET-002', name: '工程建设评分模板', type: 'procurement' as const, indicators: [
    { id: 'IND-2-1', name: '报价', category: '报价', weight: 30, maxScore: 100 },
    { id: 'IND-2-2', name: '施工方案', category: '技术', weight: 25, maxScore: 100 },
    { id: 'IND-2-3', name: '过往业绩', category: '资历', weight: 20, maxScore: 100 },
    { id: 'IND-2-4', name: '安全管理', category: '管理', weight: 15, maxScore: 100 },
    { id: 'IND-2-5', name: '项目团队', category: '团队', weight: 10, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2025-03-15' },
  { id: 'ET-003', name: 'IT设备采购评分', type: 'procurement' as const, indicators: [
    { id: 'IND-3-1', name: '报价', category: '报价', weight: 25, maxScore: 100 },
    { id: 'IND-3-2', name: '技术参数满足度', category: '技术', weight: 30, maxScore: 100 },
    { id: 'IND-3-3', name: '服务响应时间', category: '服务', weight: 25, maxScore: 100 },
    { id: 'IND-3-4', name: '原厂授权', category: '资质', weight: 20, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2025-09-01' },
  { id: 'ET-004', name: '展览设计服务评分', type: 'contract' as const, indicators: [
    { id: 'IND-4-1', name: '设计创意', category: '创意', weight: 35, maxScore: 100 },
    { id: 'IND-4-2', name: '施工质量', category: '质量', weight: 30, maxScore: 100 },
    { id: 'IND-4-3', name: '报价合理性', category: '报价', weight: 20, maxScore: 100 },
    { id: 'IND-4-4', name: '过往案例', category: '资历', weight: 15, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2025-04-10' },
  { id: 'ET-005', name: '物业服务评分模板', type: 'contract' as const, indicators: [
    { id: 'IND-5-1', name: '服务质量', category: '服务', weight: 40, maxScore: 100 },
    { id: 'IND-5-2', name: '报价', category: '报价', weight: 25, maxScore: 100 },
    { id: 'IND-5-3', name: '人员配置', category: '管理', weight: 20, maxScore: 100 },
    { id: 'IND-5-4', name: '应急响应', category: '服务', weight: 15, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2025-07-01' },
  { id: 'ET-006', name: '餐饮服务评分', type: 'contract' as const, indicators: [
    { id: 'IND-6-1', name: '食品安全', category: '质量', weight: 35, maxScore: 100 },
    { id: 'IND-6-2', name: '菜品质量', category: '质量', weight: 30, maxScore: 100 },
    { id: 'IND-6-3', name: '价格', category: '报价', weight: 20, maxScore: 100 },
    { id: 'IND-6-4', name: '卫生管理', category: '管理', weight: 15, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2026-01-01' },
  { id: 'ET-007', name: '物资采购通用模板', type: 'procurement' as const, indicators: [
    { id: 'IND-7-1', name: '报价', category: '报价', weight: 35, maxScore: 100 },
    { id: 'IND-7-2', name: '质量', category: '质量', weight: 30, maxScore: 100 },
    { id: 'IND-7-3', name: '交付', category: '交付', weight: 20, maxScore: 100 },
    { id: 'IND-7-4', name: '售后', category: '服务', weight: 15, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2025-09-01' },
  { id: 'ET-008', name: '框架协议供应商年度评估', type: 'supplier' as const, indicators: [
    { id: 'IND-8-1', name: '履约率', category: '履约', weight: 40, maxScore: 100 },
    { id: 'IND-8-2', name: '质量稳定性', category: '质量', weight: 25, maxScore: 100 },
    { id: 'IND-8-3', name: '响应速度', category: '服务', weight: 20, maxScore: 100 },
    { id: 'IND-8-4', name: '投诉次数', category: '服务', weight: 15, maxScore: 100 },
  ], totalWeight: 100, creator: '张三', createTime: '2026-01-01' },
];

// ============ 3. ProcurementPlans ============
const plans = [
  { id: 'PP-2026-001', planNo: 'PP-2026-001', planType: 'monthly' as const, planMode: 'approval' as const, year: '2026', month: '09', department: '采购部', status: 'approved' as const, createTime: '2026-08-25', creator: '张三', remark: 'Q3集中采购计划', details: [] },
  { id: 'PP-2026-002', planNo: 'PP-2026-002', planType: 'monthly' as const, planMode: 'approval' as const, year: '2026', month: '10', department: '采购部', status: 'approved' as const, createTime: '2026-09-28', creator: '张三', remark: '', details: [] },
  { id: 'PP-2026-003', planNo: 'PP-2026-003', planType: 'annual' as const, planMode: 'approval' as const, year: '2026', department: '采购部', status: 'approved' as const, createTime: '2025-12-20', creator: '张三', remark: '年度框架协议计划', details: [] },
  { id: 'PP-2026-004', planNo: 'PP-2026-004', planType: 'monthly' as const, planMode: 'filing' as const, year: '2026', month: '11', department: '采购部', status: 'draft' as const, createTime: '2026-10-25', creator: '张三', remark: '11月报备计划', details: [] },
  { id: 'PP-2026-005', planNo: 'PP-2026-005', planType: 'monthly' as const, planMode: 'approval' as const, year: '2026', month: '08', department: '采购部', status: 'archived' as const, createTime: '2026-07-25', creator: '张三', remark: '已归档', details: [] },
];

// ============ 4. ProcurementDemands ============
const DEMAND_TYPES = ['material_non_engineering', 'service_non_engineering', 'service_project', 'implementation_project', 'material'] as const;
const DEMAND_STATUSES = ['pending', 'confirm_approved', 'draft', 'approved', 'rejected', 'confirm_pending', 'confirm_rejected', 'changed'] as const;
const mkDemand = (n: number, status: typeof DEMAND_STATUSES[number]) => ({
  id: `DEM-${String(n).padStart(3, '0')}`,
  demandNo: `DMP-202609${String(n).padStart(2, '0')}`,
  demandType: DEMAND_TYPES[n % DEMAND_TYPES.length],
  businessCategory: (n % 2 === 0 ? 'engineering' : 'non_engineering') as 'engineering' | 'non_engineering',
  subType: 'goods' as const,
  procurementType: (n % 3 === 0 ? 'outside_framework' : 'within_framework') as 'within_framework' | 'outside_framework',
  procurementMode: (['meeting', 'application_form', 'sign_report'] as const)[n % 3],
  applicant: ['张三', '李四', '王五', '赵六'][n % 4],
  applicantDept: ['行政部', '技术部', '会展部', '综合部'][n % 4],
  applyDate: `2026-09-${String(Math.min(30, 15 + n)).padStart(2, '0')}`,
  projectName: ['办公用品集中采购', '网络设备及综合布线', '展台设计搭建', '员工餐饮服务', '信息安全系统', '办公区搬迁安装', '安保服务', '会议用品', '宣传物料', '移动办公设备', '车辆维修', '临时水电'][n % 12],
  estimatedAmount: [285000, 1200000, 450000, 180000, 850000, 320000, 120000, 50000, 68000, 380000, 95000, 65000][n % 12],
  requiredDeliveryDate: `2026-${String(10 + (n % 4)).padStart(2, '0')}-15`,
  reason: '部门日常运作及业务开展需求',
  status,
  createTime: `2026-09-${String(Math.min(30, 10 + n)).padStart(2, '0')}`,
  details: [
    { id: `DD-${String(n).padStart(3, '0')}-1`, demandId: `DEM-${String(n).padStart(3, '0')}`, productCode: `SKU-${1000 + n}`, productName: '主采购品项', unit: '个', quantity: 100, unitPriceExcludingTax: 200, unitPriceIncludingTax: 226, taxRate: 0.13, amountExcludingTax: 20000, amountIncludingTax: 22600 },
  ],
});
const demands = Array.from({ length: 12 }, (_, i) => mkDemand(i + 1, DEMAND_STATUSES[i % DEMAND_STATUSES.length]));

// ============ 5. Biddings ============
const BID_STATUSES = ['draft', 'published', 'bidding', 'evaluated', 'completed', 'cancelled'] as const;
const mkBid = (n: number, status: typeof BID_STATUSES[number]) => ({
  id: `BID-${String(n).padStart(3, '0')}`,
  biddingNo: `BP-202609${String(n).padStart(2, '0')}`,
  projectName: ['办公用品框架招标', '网络设备及布线招标', '展台设计搭建邀请招标', '餐饮服务询比', '信息安全系统招标', '办公设备框架', '物业服务续签谈判', '会议用品框架', '宣传物料采购', '移动办公设备招标', '车辆维修服务', '办公用品补充采购'][n % 12],
  procurementMethod: (['state_owned_framework', 'legal_bidding', 'state_owned_xunbi', 'state_owned_tanpan', 'state_owned_direct', 'state_owned_mall', 'voluntary_bidding', 'state_owned_jingjia'] as const)[n % 8],
  demandId: `DEM-${String(n).padStart(3, '0')}`,
  demandNo: `DMP-202609${String(n).padStart(2, '0')}`,
  status,
  totalAmountIncludingTax: [285000, 1200000, 450000, 180000, 850000, 320000, 120000, 50000, 68000, 380000, 95000, 150000][n % 12],
  creator: '张三',
  createTime: '2026-09-01',
});
const biddings = Array.from({ length: 13 }, (_, i) => mkBid(i + 1, BID_STATUSES[i % BID_STATUSES.length]));

// ============ 6. SupplierQuotes ============
const quotes = [
  { id: 'Q-001', quoteNo: 'Q-202609001', biddingId: 'BID-001', biddingNo: 'BP-202609001', biddingName: '办公用品框架招标', supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司', contactPerson: '张经理', contactPhone: '0731-88881001', totalAmount: 280000, taxRate: 0.13, taxAmount: 32212, quoteDate: '2026-09-18', submittedAt: '2026-09-18 15:30', status: 'submitted' as const, details: [{ productCode: 'SKU-1001', productName: 'A4打印纸', unit: '包', quantity: 500, unitPrice: 25, amount: 12500, taxRate: 0.13 }] },
  { id: 'Q-002', quoteNo: 'Q-202609002', biddingId: 'BID-001', biddingNo: 'BP-202609001', biddingName: '办公用品框架招标', supplierId: 'SUP-005', supplierName: '华东物资供应有限公司', contactPerson: '王工', contactPhone: '0731-88881003', totalAmount: 295000, taxRate: 0.13, taxAmount: 33938, quoteDate: '2026-09-19', submittedAt: '2026-09-19 10:00', status: 'submitted' as const, details: [{ productCode: 'SKU-1001', productName: 'A4打印纸', unit: '包', quantity: 500, unitPrice: 26, amount: 13000, taxRate: 0.13 }] },
  { id: 'Q-003', quoteNo: 'Q-202609003', biddingId: 'BID-002', biddingNo: 'BP-202609002', biddingName: '网络设备及布线招标', supplierId: 'SUP-002', supplierName: '锐捷网络科技股份', contactPerson: '赵工', contactPhone: '0731-88881005', totalAmount: 1180000, taxRate: 0.13, taxAmount: 135752, quoteDate: '2026-09-17', submittedAt: '2026-09-17 14:00', status: 'accepted' as const, details: [{ productCode: 'SKU-2002', productName: '锐捷交换机', unit: '台', quantity: 50, unitPrice: 23600, amount: 1180000, taxRate: 0.13 }] },
  { id: 'Q-004', quoteNo: 'Q-202609004', biddingId: 'BID-003', biddingNo: 'BP-202609003', biddingName: '展台设计搭建邀请招标', supplierId: 'SUP-003', supplierName: '华展展览服务有限公司', contactPerson: '李总', contactPhone: '0731-88881002', totalAmount: 440000, taxRate: 0.06, taxAmount: 24906, quoteDate: '2026-09-19', submittedAt: '2026-09-19 11:00', status: 'accepted' as const, details: [{ productCode: 'SKU-3003', productName: '展台搭建', unit: '项', quantity: 1, unitPrice: 440000, amount: 440000, taxRate: 0.06 }] },
  { id: 'Q-005', quoteNo: 'Q-202609005', biddingId: 'BID-004', biddingNo: 'BP-202609004', biddingName: '餐饮服务询比', supplierId: 'SUP-004', supplierName: '启程餐饮管理有限公司', contactPerson: '陈经理', contactPhone: '0731-88881006', totalAmount: 175000, taxRate: 0.06, taxAmount: 9906, quoteDate: '2026-09-20', submittedAt: '2026-09-20 09:00', status: 'accepted' as const, details: [{ productCode: 'SKU-4004', productName: '员工午餐', unit: '月', quantity: 12, unitPrice: 14583, amount: 175000, taxRate: 0.06 }] },
  { id: 'Q-006', quoteNo: 'Q-202609006', biddingId: 'BID-005', biddingNo: 'BP-202609005', biddingName: '信息安全系统招标', supplierId: 'SUP-002', supplierName: '锐捷网络科技股份', contactPerson: '赵工', contactPhone: '0731-88881005', totalAmount: 830000, taxRate: 0.13, taxAmount: 95487, quoteDate: '2026-09-15', submittedAt: '2026-09-15 16:00', status: 'accepted' as const, details: [{ productCode: 'SKU-5005', productName: '安全防护设备', unit: '套', quantity: 1, unitPrice: 830000, amount: 830000, taxRate: 0.13 }] },
  { id: 'Q-007', quoteNo: 'Q-202609007', biddingId: 'BID-006', biddingNo: 'BP-202609006', biddingName: '办公设备框架', supplierId: 'SUP-005', supplierName: '华东物资供应有限公司', contactPerson: '王工', contactPhone: '0731-88881003', totalAmount: 310000, taxRate: 0.13, taxAmount: 35664, quoteDate: '2026-09-18', submittedAt: '2026-09-18 13:00', status: 'submitted' as const, details: [{ productCode: 'SKU-6006', productName: '办公设备套装', unit: '套', quantity: 100, unitPrice: 3100, amount: 310000, taxRate: 0.13 }] },
  { id: 'Q-008', quoteNo: 'Q-202609008', biddingId: 'BID-006', biddingNo: 'BP-202609006', biddingName: '办公设备框架', supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司', contactPerson: '张经理', contactPhone: '0731-88881001', totalAmount: 300000, taxRate: 0.13, taxAmount: 34513, quoteDate: '2026-09-19', submittedAt: '2026-09-19 17:00', status: 'submitted' as const, details: [{ productCode: 'SKU-6006', productName: '办公设备套装', unit: '套', quantity: 100, unitPrice: 3000, amount: 300000, taxRate: 0.13 }] },
];

// ============ 7. ContractLedgers ============
const ledgers: any[] = [
  // 招采类 — primary
  { id: 'HT-001', contractId: 'HT-001', contractNo: 'HT-202609001', contractName: '2026年办公用品框架采购合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_framework', supplierId: 'SUP-001', counterpartyName: '晨光办公用品有限公司', handler: '张三', handlerContact: '0731-88881001', handlingDepartment: '采购部', demandDepartment: '行政部', signingDate: '2026-08-25', effectiveDate: '2026-08-25', terminationDate: '2026-12-31', biddingId: 'BID-001', biddingNo: 'BP-202609001', projectName: '2026年秋季办公用品集中采购', winningDate: '2026-08-20', isModelText: true, amount: 28.5, paidAmount: 14.25, settlementAmount: 14.25, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-S001', contractId: 'HT-S001', contractNo: 'HT-202609001-S1', contractName: '办公用品合同补充协议一(增购)', contractNature: 'procurement', contractTier: 'supplement', parentContractId: 'HT-001', parentContractNo: 'HT-202609001', supplementIndex: 1, supplementAmount: 5, supplementType: 'scope_change', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_framework', supplierId: 'SUP-001', counterpartyName: '晨光办公用品有限公司', handler: '张三', handlerContact: '0731-88881001', handlingDepartment: '采购部', signingDate: '2026-10-15', effectiveDate: '2026-10-15', terminationDate: '2027-03-31', businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-S002', contractId: 'HT-S002', contractNo: 'HT-202609001-S2', contractName: '办公用品合同补充协议二(缩减)', contractNature: 'procurement', contractTier: 'supplement', parentContractId: 'HT-001', parentContractNo: 'HT-202609001', supplementIndex: 2, supplementAmount: -2, supplementType: 'scope_change', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_framework', supplierId: 'SUP-001', counterpartyName: '晨光办公用品有限公司', handler: '张三', handlerContact: '0731-88881001', handlingDepartment: '采购部', signingDate: '2026-11-10', effectiveDate: '2026-11-10', businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-002', contractId: 'HT-002', contractNo: 'HT-202609002', contractName: '新办公区网络设备采购及综合布线合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'engineering', formation: 'legal_bidding', supplierId: 'SUP-002', counterpartyName: '锐捷网络科技股份', handler: '张三', handlerContact: '0731-88881005', handlingDepartment: '采购部', demandDepartment: '技术部', signingDate: '2026-09-20', effectiveDate: '2026-09-20', terminationDate: '2027-02-28', biddingId: 'BID-002', biddingNo: 'BP-202609002', projectName: '新办公区网络设备综合布线', winningDate: '2026-09-15', isModelText: true, amount: 120, paidAmount: 60, settlementAmount: 60, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-S003', contractId: 'HT-S003', contractNo: 'HT-202609002-S1', contractName: '网络设备合同补充协议(增项)', contractNature: 'procurement', contractTier: 'supplement', parentContractId: 'HT-002', parentContractNo: 'HT-202609002', supplementIndex: 1, supplementAmount: 15, supplementType: 'scope_change', category: 'procurement', contractType: 'engineering', formation: 'legal_bidding', supplierId: 'SUP-002', counterpartyName: '锐捷网络科技股份', handler: '张三', handlerContact: '0731-88881005', handlingDepartment: '采购部', signingDate: '2026-10-30', effectiveDate: '2026-10-30', terminationDate: '2027-04-30', businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-003', contractId: 'HT-003', contractNo: 'HT-202609003', contractName: '国际会展中心展台设计搭建服务合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_xunbi', supplierId: 'SUP-003', counterpartyName: '华展展览服务有限公司', handler: '张三', handlerContact: '0731-88881002', handlingDepartment: '采购部', demandDepartment: '会展部', signingDate: '2026-09-20', effectiveDate: '2026-09-20', terminationDate: '2026-12-20', biddingId: 'BID-003', biddingNo: 'BP-202609003', projectName: '国际会展中心展台设计搭建', winningDate: '2026-09-15', amount: 45, paidAmount: 22.5, settlementAmount: 22.5, businessCategory: 'expense', archiveStatus: 'not_started', isOnsite: true, status: 'active' },
  { id: 'HT-004', contractId: 'HT-004', contractNo: 'HT-202609004', contractName: '2026年度员工餐饮服务框架合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_tanpan', supplierId: 'SUP-004', counterpartyName: '启程餐饮管理有限公司', handler: '张三', handlerContact: '0731-88881006', handlingDepartment: '采购部', demandDepartment: '综合部', signingDate: '2026-09-25', effectiveDate: '2026-10-01', terminationDate: '2027-09-30', biddingId: 'BID-004', biddingNo: 'BP-202609004', projectName: '2026年度员工餐饮服务', winningDate: '2026-09-20', isModelText: true, amount: 18, paidAmount: 9, settlementAmount: 9, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-005', contractId: 'HT-005', contractNo: 'HT-202609005', contractName: '2026年秋季办公用品补充采购合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_framework', supplierId: 'SUP-001', counterpartyName: '晨光办公用品有限公司', handler: '张三', handlerContact: '0731-88881001', handlingDepartment: '采购部', demandDepartment: '行政部', signingDate: '2026-09-28', effectiveDate: '2026-09-28', terminationDate: '2026-10-31', biddingId: 'BID-012', biddingNo: 'BP-202609012', projectName: '2026年秋季办公用品补充采购', winningDate: '2026-09-25', isModelText: true, amount: 15, paidAmount: 15, settlementAmount: 15, businessCategory: 'expense', archiveStatus: 'archived', status: 'completed' },
  { id: 'HT-006', contractId: 'HT-006', contractNo: 'HT-202608001', contractName: '企业信息安全系统建设合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'engineering', formation: 'legal_bidding', supplierId: 'SUP-002', counterpartyName: '锐捷网络科技股份', handler: '张三', handlerContact: '0731-88881003', handlingDepartment: '采购部', demandDepartment: '技术部', signingDate: '2026-08-22', effectiveDate: '2026-08-22', terminationDate: '2027-03-31', biddingId: 'BID-005', biddingNo: 'BP-202609013', projectName: '企业信息安全系统建设', winningDate: '2026-08-20', amount: 85, paidAmount: 42.5, settlementAmount: 42.5, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-007', contractId: 'HT-007', contractNo: 'HT-202608002', contractName: '园区物业服务框架合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'voluntary_bidding', supplierId: 'SUP-006', counterpartyName: '湖南鸿信物业服务有限公司', handler: '张三', handlerContact: '0731-88881007', handlingDepartment: '采购部', demandDepartment: '综合部', signingDate: '2026-08-15', effectiveDate: '2026-09-01', terminationDate: '2027-08-31', biddingId: 'BID-009', biddingNo: 'BP-202609009', projectName: '园区物业服务框架合同', winningDate: '2026-08-10', isModelText: true, amount: 60, paidAmount: 20, settlementAmount: 20, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-008', contractId: 'HT-008', contractNo: 'HT-202506002', contractName: '2025年办公用品框架合同(已终止)', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_framework', supplierId: 'SUP-001', counterpartyName: '晨光办公用品有限公司', handler: '张三', handlerContact: '0731-88881001', handlingDepartment: '采购部', demandDepartment: '行政部', signingDate: '2025-06-10', effectiveDate: '2025-06-10', terminationDate: '2026-06-09', winningDate: '2025-06-05', isModelText: true, amount: 25, paidAmount: 25, settlementAmount: 25, businessCategory: 'expense', archiveStatus: 'archived', status: 'expired' },
  { id: 'HT-009', contractId: 'HT-009', contractNo: 'HT-202609010', contractName: '办公区搬迁安装服务合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'engineering', formation: 'state_owned_direct', supplierId: 'SUP-005', counterpartyName: '华东物资供应有限公司', handler: '张三', handlerContact: '0731-88881005', handlingDepartment: '采购部', demandDepartment: '行政部', signingDate: '2026-09-30', effectiveDate: '2026-10-01', terminationDate: '2026-11-30', biddingId: 'BID-006', biddingNo: 'BP-202609006', projectName: '办公区搬迁安装', winningDate: '2026-09-27', amount: 32, paidAmount: 0, settlementAmount: 0, businessCategory: 'expense', archiveStatus: 'not_started', status: 'approved' },
  { id: 'HT-010', contractId: 'HT-010', contractNo: 'HT-202609011', contractName: '宣传物料设计印刷合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_xunbi', supplierId: 'SUP-003', counterpartyName: '华展展览服务有限公司', handler: '张三', handlerContact: '0731-88881002', handlingDepartment: '采购部', demandDepartment: '市场部', effectiveDate: '', terminationDate: '', biddingId: 'BID-008', biddingNo: 'BP-202609008', projectName: '宣传物料设计印刷', winningDate: '2026-09-25', amount: 6.8, paidAmount: 0, settlementAmount: 0, businessCategory: 'expense', archiveStatus: 'not_started', status: 'pending' },
  { id: 'HT-011', contractId: 'HT-011', contractNo: 'HT-202607008', contractName: '某项目材料采购合同(已取消)', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'engineering', formation: 'state_owned_tanpan', supplierId: 'SUP-005', counterpartyName: '华东物资供应有限公司', handler: '张三', handlerContact: '0731-88881003', handlingDepartment: '采购部', demandDepartment: '技术部', signingDate: '2026-07-20', biddingId: '', biddingNo: '', projectName: '已取消项目-材料采购', winningDate: '2026-07-15', amount: 20, paidAmount: 0, settlementAmount: 0, businessCategory: 'expense', archiveStatus: 'not_started', status: 'terminated' },
  { id: 'HT-012', contractId: 'HT-012', contractNo: 'HT-202609012', contractName: '车辆维修年度服务合同', contractNature: 'procurement', contractTier: 'primary', category: 'procurement', contractType: 'non_engineering', formation: 'state_owned_direct', supplierId: 'SUP-007', counterpartyName: '恒通物流有限公司', handler: '张三', handlerContact: '0731-88881007', handlingDepartment: '采购部', demandDepartment: '行政部', signingDate: '2026-09-10', effectiveDate: '2026-09-10', terminationDate: '2027-09-09', biddingId: 'BID-011', biddingNo: 'BP-202609011', projectName: '车辆维修年度服务', winningDate: '2026-09-08', amount: 9.5, paidAmount: 4.75, settlementAmount: 4.75, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  // 非招采类
  { id: 'HT-N001', contractId: 'HT-N001', contractNo: 'HT-NC2026001', contractName: '2026国际会展中心主场搭建合同', contractNature: 'non_procurement', contractTier: 'primary', category: 'exhibition_service', contractType: 'engineering_service', formation: 'exhibition_venue', supplierId: 'SUP-003', counterpartyName: '华展展览服务有限公司', handler: '李四', handlerContact: '0731-88882001', handlingDepartment: '会展部', demandDepartment: '会展部', signingDate: '2026-06-15', effectiveDate: '2026-06-15', terminationDate: '2026-12-31', amount: 180, paidAmount: 50, settlementAmount: 80, businessCategory: 'expense', archiveStatus: 'not_started', isOnsite: true, status: 'active' },
  { id: 'HT-N002', contractId: 'HT-N002', contractNo: 'HT-NC2026002', contractName: '招商合作协议(A馆)', contractNature: 'non_procurement', contractTier: 'primary', category: 'investment', contractType: 'engineering_service', formation: 'investment_contract', counterpartyName: '某品牌展商集团', handler: '王五', handlerContact: '0731-88882002', handlingDepartment: '招商部', signingDate: '2026-07-01', effectiveDate: '2026-07-01', terminationDate: '2027-06-30', amount: 320, paidAmount: 0, settlementAmount: 320, businessCategory: 'income', isSalesContract: true, archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-N003', contractId: 'HT-N003', contractNo: 'HT-NC2026003', contractName: '展馆设备租赁协议', contractNature: 'non_procurement', contractTier: 'primary', category: 'exhibition_service', contractType: 'non_engineering_service', formation: 'other', counterpartyName: '某设备租赁公司', handler: '李四', handlerContact: '0731-88882001', handlingDepartment: '会展部', signingDate: '2026-09-01', effectiveDate: '2026-09-01', terminationDate: '2027-08-31', amount: 12, paidAmount: 6, settlementAmount: 6, businessCategory: 'expense', archiveStatus: 'not_started', status: 'active' },
  { id: 'HT-N004', contractId: 'HT-N004', contractNo: 'HT-NC2026004', contractName: '参展商服务协议模板(通用)', contractNature: 'non_procurement', contractTier: 'primary', category: 'exhibition_service', contractType: 'non_engineering_service', formation: 'exhibitor_contract', counterpartyName: '多家参展商', handler: '王五', handlerContact: '0731-88882002', handlingDepartment: '招商部', signingDate: '2026-01-01', effectiveDate: '2026-01-01', terminationDate: '2026-12-31', amount: 0, paidAmount: 0, settlementAmount: 0, businessCategory: 'income', isSalesContract: true, archiveStatus: 'not_started', status: 'active' },
];

// ============ 8. ContractPurchaseOrders ============
const orders = [
  { id: 'PO-001', orderNo: 'PO-202609001', contractId: 'HT-001', contractNo: 'HT-202609001', contractName: '2026年办公用品框架采购合同', supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司', status: 'submitted' as const, createTime: '2026-09-15', creator: '张三', details: [
    { id: 'PD-001-1', orderId: 'PO-001', productId: 'P001', productCode: 'SKU-1001', productName: 'A4打印纸', unit: '包', contractQuantity: 500, deliveredQuantity: 200, orderQuantity: 300, unitPrice: 25, amount: 7500, deliveryDate: '2026-09-25' },
  ] },
  { id: 'PO-002', orderNo: 'PO-202609002', contractId: 'HT-002', contractNo: 'HT-202609002', contractName: '新办公区网络设备采购及综合布线合同', supplierId: 'SUP-002', supplierName: '锐捷网络科技股份', status: 'submitted' as const, createTime: '2026-09-25', creator: '张三', details: [
    { id: 'PD-002-1', orderId: 'PO-002', productId: 'P002', productCode: 'SKU-2002', productName: '锐捷交换机', unit: '台', contractQuantity: 50, deliveredQuantity: 20, orderQuantity: 30, unitPrice: 8000, amount: 240000, deliveryDate: '2026-11-15' },
  ] },
  { id: 'PO-003', orderNo: 'PO-202609003', contractId: 'HT-003', contractNo: 'HT-202609003', contractName: '国际会展中心展台设计搭建服务合同', supplierId: 'SUP-003', supplierName: '华展展览服务有限公司', status: 'submitted' as const, createTime: '2026-09-28', creator: '张三', details: [
    { id: 'PD-003-1', orderId: 'PO-003', productId: 'P003', productCode: 'SKU-3003', productName: '展台搭建服务', unit: '项', contractQuantity: 1, deliveredQuantity: 0, orderQuantity: 1, unitPrice: 180000, amount: 180000, deliveryDate: '2026-12-10' },
  ] },
  { id: 'PO-004', orderNo: 'PO-202609004', contractId: 'HT-004', contractNo: 'HT-202609004', contractName: '2026年度员工餐饮服务框架合同', supplierId: 'SUP-004', supplierName: '启程餐饮管理有限公司', status: 'submitted' as const, createTime: '2026-10-05', creator: '张三', details: [
    { id: 'PD-004-1', orderId: 'PO-004', productId: 'P004', productCode: 'SKU-4004', productName: '员工午餐服务', unit: '月', contractQuantity: 12, deliveredQuantity: 0, orderQuantity: 1, unitPrice: 15000, amount: 15000, deliveryDate: '2026-10-31' },
  ] },
  { id: 'PO-005', orderNo: 'PO-202609005', contractId: 'HT-001', contractNo: 'HT-202609001', contractName: '2026年办公用品框架采购合同', supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司', status: 'draft' as const, createTime: '2026-10-10', creator: '张三', details: [
    { id: 'PD-005-1', orderId: 'PO-005', productId: 'P005', productCode: 'SKU-5005', productName: '办公文具套装', unit: '套', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 180, amount: 18000 },
  ] },
  { id: 'PO-006', orderNo: 'PO-202609006', contractId: 'HT-006', contractNo: 'HT-202608001', contractName: '企业信息安全系统建设合同', supplierId: 'SUP-002', supplierName: '锐捷网络科技股份', status: 'submitted' as const, createTime: '2026-09-10', creator: '张三', details: [
    { id: 'PD-006-1', orderId: 'PO-006', productId: 'P006', productCode: 'SKU-6006', productName: '安全防护设备', unit: '套', contractQuantity: 2, deliveredQuantity: 0, orderQuantity: 1, unitPrice: 650000, amount: 650000, deliveryDate: '2026-11-30' },
  ] },
  { id: 'PO-007', orderNo: 'PO-202608007', contractId: 'HT-011', contractNo: 'HT-202607008', contractName: '某项目材料采购合同(已取消)', supplierId: 'SUP-005', supplierName: '华东物资供应有限公司', status: 'cancelled' as const, createTime: '2026-07-25', creator: '张三', details: [
    { id: 'PD-007-1', orderId: 'PO-007', productId: 'P007', productCode: 'SKU-7007', productName: '建筑材料(已取消)', unit: '批', contractQuantity: 1, deliveredQuantity: 0, orderQuantity: 1, unitPrice: 200000, amount: 200000 },
  ] },
];

// ============ 9. ProcurementInspections ============
const inspections = [
  { id: 'INS-001', inspectionNo: 'INS-202609001', orderId: 'PO-001', orderNo: 'PO-202609001', supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司', inspectionDate: '2026-09-28', inspector: '质检部-刘工', status: 'approved' as const, remark: '全部品类验收合格', details: [
    { id: 'ID-1-1', productId: 'P001', productCode: 'SKU-1001', productName: 'A4打印纸', unit: '包', orderedQuantity: 300, inspectedQuantity: 300, passQuantity: 300, failQuantity: 0, isQualified: true },
  ] },
  { id: 'INS-002', inspectionNo: 'INS-202609002', orderId: 'PO-002', orderNo: 'PO-202609002', supplierId: 'SUP-002', supplierName: '锐捷网络科技股份', inspectionDate: '2026-11-18', inspector: '技术部-赵工', status: 'pending' as const, remark: '现场验收中', details: [
    { id: 'ID-2-1', productId: 'P002', productCode: 'SKU-2002', productName: '锐捷交换机', unit: '台', orderedQuantity: 30, inspectedQuantity: 30, passQuantity: 28, failQuantity: 2, isQualified: false, remark: '2台接口松动' },
  ] },
  { id: 'INS-003', inspectionNo: 'INS-202609003', orderId: 'PO-003', orderNo: 'PO-202609003', supplierId: 'SUP-003', supplierName: '华展展览服务有限公司', inspectionDate: '2026-12-18', inspector: '会展部-李总', status: 'rejected' as const, remark: '局部细节未达标，整改后复检', details: [
    { id: 'ID-3-1', productId: 'P003', productCode: 'SKU-3003', productName: '展台搭建服务', unit: '项', orderedQuantity: 1, inspectedQuantity: 1, passQuantity: 0, failQuantity: 1, isQualified: false, remark: '灯光位置偏差' },
  ] },
  { id: 'INS-004', inspectionNo: 'INS-202609004', orderId: 'PO-004', orderNo: 'PO-202609004', supplierId: 'SUP-004', supplierName: '启程餐饮管理有限公司', inspectionDate: '2026-10-30', inspector: '综合部-陈经理', status: 'approved' as const, remark: '验收合格', details: [
    { id: 'ID-4-1', productId: 'P004', productCode: 'SKU-4004', productName: '员工午餐服务', unit: '月', orderedQuantity: 1, inspectedQuantity: 1, passQuantity: 1, failQuantity: 0, isQualified: true },
  ] },
  { id: 'INS-005', inspectionNo: 'INS-202609005', supplierId: 'SUP-005', supplierName: '华东物资供应有限公司', inspectionDate: '', inspector: '', status: 'draft' as const, remark: '预录入', details: [] },
];

// ============ 10. EvaluationRecords ============
const evalStatuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed'] as const;
const records = [
  { id: 'ER-001', templateId: 'ET-001', templateName: '办公用品采购通用评分', supplierId: 'SUP-001', supplierName: '晨光办公用品有限公司', type: 'procurement' as const, scores: [
    { indicatorId: 'IND-1-1', indicatorName: '价格', score: 90, weight: 40, weightedScore: 36 },
    { indicatorId: 'IND-1-2', indicatorName: '质量', score: 88, weight: 30, weightedScore: 26.4 },
    { indicatorId: 'IND-1-3', indicatorName: '交付能力', score: 92, weight: 20, weightedScore: 18.4 },
    { indicatorId: 'IND-1-4', indicatorName: '售后服务', score: 85, weight: 10, weightedScore: 8.5 },
  ], totalScore: 89.3, evaluator: '采购部-张三', evaluationDate: '2026-06-15', status: evalStatuses[0], result: 'pass' as const },
  { id: 'ER-002', templateId: 'ET-003', templateName: 'IT设备采购评分', supplierId: 'SUP-002', supplierName: '锐捷网络科技股份有限公司', type: 'procurement' as const, scores: [
    { indicatorId: 'IND-3-1', indicatorName: '报价', score: 85, weight: 25, weightedScore: 21.25 },
    { indicatorId: 'IND-3-2', indicatorName: '技术参数满足度', score: 95, weight: 30, weightedScore: 28.5 },
    { indicatorId: 'IND-3-3', indicatorName: '服务响应时间', score: 88, weight: 25, weightedScore: 22 },
    { indicatorId: 'IND-3-4', indicatorName: '原厂授权', score: 100, weight: 20, weightedScore: 20 },
  ], totalScore: 91.75, evaluator: '技术部-赵工', evaluationDate: '2026-08-25', status: evalStatuses[1], result: 'pass' as const },
  { id: 'ER-003', templateId: 'ET-004', templateName: '展览设计服务评分', supplierId: 'SUP-003', supplierName: '华展展览服务有限公司', type: 'contract' as const, scores: [
    { indicatorId: 'IND-4-1', indicatorName: '设计创意', score: 82, weight: 35, weightedScore: 28.7 },
    { indicatorId: 'IND-4-2', indicatorName: '施工质量', score: 78, weight: 30, weightedScore: 23.4 },
    { indicatorId: 'IND-4-3', indicatorName: '报价合理性', score: 85, weight: 20, weightedScore: 17 },
    { indicatorId: 'IND-4-4', indicatorName: '过往案例', score: 80, weight: 15, weightedScore: 12 },
  ], totalScore: 81.1, evaluator: '会展部-李总', evaluationDate: '2026-10-20', status: evalStatuses[2], result: 'pass' as const },
  { id: 'ER-004', templateId: 'ET-006', templateName: '餐饮服务评分', supplierId: 'SUP-004', supplierName: '启程餐饮管理有限公司', type: 'contract' as const, scores: [
    { indicatorId: 'IND-6-1', indicatorName: '食品安全', score: 95, weight: 35, weightedScore: 33.25 },
    { indicatorId: 'IND-6-2', indicatorName: '菜品质量', score: 82, weight: 30, weightedScore: 24.6 },
    { indicatorId: 'IND-6-3', indicatorName: '价格', score: 75, weight: 20, weightedScore: 15 },
    { indicatorId: 'IND-6-4', indicatorName: '卫生管理', score: 90, weight: 15, weightedScore: 13.5 },
  ], totalScore: 86.35, evaluator: '综合部-陈经理', evaluationDate: '2026-11-01', status: evalStatuses[3], result: 'pass' as const },
  { id: 'ER-005', templateId: 'ET-005', templateName: '物业服务评分模板', supplierId: 'SUP-006', supplierName: '湖南鸿信物业服务有限公司', type: 'contract' as const, scores: [
    { indicatorId: 'IND-5-1', indicatorName: '服务质量', score: 80, weight: 40, weightedScore: 32 },
    { indicatorId: 'IND-5-2', indicatorName: '报价', score: 85, weight: 25, weightedScore: 21.25 },
    { indicatorId: 'IND-5-3', indicatorName: '人员配置', score: 78, weight: 20, weightedScore: 15.6 },
    { indicatorId: 'IND-5-4', indicatorName: '应急响应', score: 75, weight: 15, weightedScore: 11.25 },
  ], totalScore: 80.1, evaluator: '综合部-周经理', evaluationDate: '2026-10-30', status: evalStatuses[4], result: 'pass' as const },
  { id: 'ER-006', templateId: 'ET-002', templateName: '工程建设评分模板', supplierId: 'SUP-005', supplierName: '华东物资供应有限公司', type: 'procurement' as const, scores: [
    { indicatorId: 'IND-2-1', indicatorName: '报价', score: 78, weight: 30, weightedScore: 23.4 },
    { indicatorId: 'IND-2-2', indicatorName: '施工方案', score: 90, weight: 25, weightedScore: 22.5 },
    { indicatorId: 'IND-2-3', indicatorName: '过往业绩', score: 85, weight: 20, weightedScore: 17 },
    { indicatorId: 'IND-2-4', indicatorName: '安全管理', score: 92, weight: 15, weightedScore: 13.8 },
    { indicatorId: 'IND-2-5', indicatorName: '项目团队', score: 88, weight: 10, weightedScore: 8.8 },
  ], totalScore: 85.5, evaluator: '技术部-王工', evaluationDate: '2026-09-20', status: evalStatuses[5], result: 'pass' as const },
];

// ============ TS 序列化 ============
function toTs(v: any, indent = 0): string {
  const pad = ' '.repeat(indent);
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') {
    if (v === 'as const') return 'as const';
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const inner = v.map((x) => `\n${pad}  ${toTs(x, indent + 2)}`).join(',');
    return `[${inner}\n${pad}]`;
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.length === 0) return '{}';
    const inner = keys
      .filter((k) => v[k] !== undefined)
      .map((k) => `${pad}  ${k}: ${toTs(v[k], indent + 2)}`)
      .join(',\n');
    return `{\n${inner}\n${pad}}`;
  }
  return JSON.stringify(v);
}

const DATASETS: Record<string, any[]> = {
  suppliers, evaluationTemplates: evalTemplates, procurementPlans: plans,
  procurementDemands: demands, biddings, supplierQuotes: quotes,
  contractLedgers: ledgers, contractPurchaseOrders: orders,
  procurementInspections: inspections, evaluationRecords: records,
};

// 生成单个 export const 块
function genExportBlock(name: string, list: any[]) {
  return `export const ${name} = ${toTs(list, 2)};`;
}

// 精准替换指定文件中的 export const 块
function patchFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let patched = 0;
  for (const [name, list] of Object.entries(DATASETS)) {
    const newBlock = genExportBlock(name, list);
    // 找 export const name = ... (一直到对应的 ; 为止)
    const startPattern = new RegExp(`export const ${name}\\b[^=]*=\\s*`, 'g');
    const startMatch = startPattern.exec(content);
    if (!startMatch) { console.log(`  ⚠️ ${filePath} 中未找到 ${name}，跳过`); continue; }
    const startIdx = startMatch.index!;
    const firstBracket = content.indexOf('[', startIdx);
    if (firstBracket < 0) continue;
    let depth = 0, i = firstBracket, end = -1;
    while (i < content.length) {
      const c = content[i];
      if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
      i++;
    }
    if (end < 0) continue;
    let blockEnd = end + 1;
    while (blockEnd < content.length && content[blockEnd] !== ';') blockEnd++;
    blockEnd++;
    content = content.slice(0, startIdx) + newBlock + content.slice(blockEnd);
    patched++;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return patched;
}

console.log('===== 精准替换 data.ts =====');
const n1 = patchFile(DATA_TS);
console.log(`  ✅ 替换 ${n1}/10 个数据集`);
console.log('===== 精准替换 procurementDemoData.ts =====');
const n2 = patchFile(DEMO_TS);
console.log(`  ✅ 替换 ${n2}/10 个数据集`);
console.log('\n📦 统计:', Object.fromEntries(Object.entries(DATASETS).map(([k, v]) => [k, v.length])));
