import fs from 'fs';

const filePath = 'src/pages/Procurement/ContractPurchaseOrderPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. 在MOCK_CONTRACTS中添加新合同
const newContract = `  {
    id: 'C003', contractNo: 'HT-2026-003', contractName: '展会物资采购合同',
    supplierId: 'SUP001', supplierName: '华东物资供应有限公司',
    totalDuration: '3个月', acceptanceStandard: '按合同附件技术标准验收',
    paymentTerms: '货到验收合格后30日内付款',
    products: [
      { productId: 'PRD770', productCode: 'QD2001', productName: '电缆', specification: '6㎡（单线63A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 150 },
      { productId: 'PRD771', productCode: 'QD2002', productName: '电缆', specification: '6㎡（单线125A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 180 },
      { productId: 'PRD772', productCode: 'QD2003', productName: '电缆', specification: '4㎡（单线32A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 120 },
      { productId: 'PRD773', productCode: 'QD2004', productName: '电缆', specification: '16㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 250 },
      { productId: 'PRD774', productCode: 'QD2005', productName: '电缆', specification: '25㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 350 },
      { productId: 'PRD775', productCode: 'QD2006', productName: '电缆', specification: '35㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 480 },
      { productId: 'PRD776', productCode: 'QD2007', productName: '电缆', specification: '50㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 650 },
      { productId: 'PRD777', productCode: 'QD2008', productName: '电缆', specification: '70㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 850 },
      { productId: 'PRD778', productCode: 'QD2009', productName: '电缆', specification: '95㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 1100 },
      { productId: 'PRD779', productCode: 'QD2010', productName: '电缆', specification: '120㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 1350 },
      { productId: 'PRD780', productCode: 'QD2011', productName: '电缆', specification: '150㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 1650 },
      { productId: 'PRD781', productCode: 'QD2012', productName: '电缆', specification: '185㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 2000 },
      { productId: 'PRD782', productCode: 'QD2013', productName: '电缆', specification: '240㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 2500 },
      { productId: 'PRD783', productCode: 'QD2014', productName: '电缆', specification: '300㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 3000 },
      { productId: 'PRD784', productCode: 'QD2015', productName: '电缆', specification: '400㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 3800 },
      { productId: 'PRD785', productCode: 'XS1001', productName: '线鼻子', specification: '10-400㎡', unit: '个', contractQuantity: 500, deliveredQuantity: 0, unitPrice: 15 },
      { productId: 'PRD786', productCode: 'XS1002', productName: '热缩管', specification: 'Φ20-Φ100', unit: '米', contractQuantity: 500, deliveredQuantity: 0, unitPrice: 12 },
      { productId: 'PRD787', productCode: 'XS1003', productName: '电缆桥架', specification: '200*100', unit: '米', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 85 },
      { productId: 'PRD788', productCode: 'XS1004', productName: '接地铜线', specification: '16㎡多股', unit: '米', contractQuantity: 500, deliveredQuantity: 0, unitPrice: 28 },
    ]
  },\r\n`;

// 找到MOCK_CONTRACTS的结束位置（MOCK_INITIAL_ORDERS前面的];）
const mockInitStr = 'const MOCK_INITIAL_ORDERS';
const mockInitIdx = content.indexOf(mockInitStr);
if (mockInitIdx === -1) {
  console.log('Could not find MOCK_INITIAL_ORDERS');
  process.exit(1);
}

// 往前找];
const mockContractsEnd = content.lastIndexOf('];', mockInitIdx);
if (mockContractsEnd === -1) {
  console.log('Could not find MOCK_CONTRACTS end');
  process.exit(1);
}

console.log('MOCK_CONTRACTS ends at:', mockContractsEnd);

// 找到最后一个合同的结尾（在];之前的最后一个  },）
const lastContractEnd = content.lastIndexOf('  },', mockContractsEnd);
console.log('Last contract ends at:', lastContractEnd);

if (lastContractEnd === -1) {
  console.log('Could not find last contract end');
  process.exit(1);
}

content = content.substring(0, lastContractEnd + 4) + '\r\n' + newContract + content.substring(lastContractEnd + 4);
console.log('Added new contract to MOCK_CONTRACTS');

// 2. 在MOCK_INITIAL_ORDERS中添加新采购订单
const newOrder = `  {
    id: 'CPO003', orderNo: 'CPO20260626001',
    contractId: 'C003', contractNo: 'HT-2026-003', contractName: '展会物资采购合同',
    supplierId: 'SUP001', supplierName: '华东物资供应有限公司',
    totalDuration: '3个月', acceptanceStandard: '按合同附件技术标准验收', paymentTerms: '货到验收合格后30日内付款',
    procurementDemandId: 'PD003', procurementDemandNo: 'CGQQ20240626001',
    projectId: 'PRJ003', projectName: '新物资采购测试', projectType: 'material',
    status: 'pending', createTime: '2026-06-26 10:00:00', creator: '孙七',
    details: [
      { id: 'D004', orderId: 'CPO003', productId: 'PRD770', productCode: 'QD2001', productName: '电缆', specification: '6㎡（单线63A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 150, amount: 15000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D005', orderId: 'CPO003', productId: 'PRD771', productCode: 'QD2002', productName: '电缆', specification: '6㎡（单线125A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 180, amount: 18000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D006', orderId: 'CPO003', productId: 'PRD772', productCode: 'QD2003', productName: '电缆', specification: '4㎡（单线32A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 120, amount: 12000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D007', orderId: 'CPO003', productId: 'PRD773', productCode: 'QD2004', productName: '电缆', specification: '16㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 250, amount: 25000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D008', orderId: 'CPO003', productId: 'PRD774', productCode: 'QD2005', productName: '电缆', specification: '25㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 350, amount: 35000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D009', orderId: 'CPO003', productId: 'PRD775', productCode: 'QD2006', productName: '电缆', specification: '35㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 480, amount: 48000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D010', orderId: 'CPO003', productId: 'PRD776', productCode: 'QD2007', productName: '电缆', specification: '50㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 650, amount: 65000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D011', orderId: 'CPO003', productId: 'PRD777', productCode: 'QD2008', productName: '电缆', specification: '70㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 850, amount: 85000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D012', orderId: 'CPO003', productId: 'PRD778', productCode: 'QD2009', productName: '电缆', specification: '95㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 1100, amount: 110000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D013', orderId: 'CPO003', productId: 'PRD779', productCode: 'QD2010', productName: '电缆', specification: '120㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 1350, amount: 135000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D014', orderId: 'CPO003', productId: 'PRD780', productCode: 'QD2011', productName: '电缆', specification: '150㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 1650, amount: 165000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D015', orderId: 'CPO003', productId: 'PRD781', productCode: 'QD2012', productName: '电缆', specification: '185㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 2000, amount: 200000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D016', orderId: 'CPO003', productId: 'PRD782', productCode: 'QD2013', productName: '电缆', specification: '240㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 2500, amount: 250000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D017', orderId: 'CPO003', productId: 'PRD783', productCode: 'QD2014', productName: '电缆', specification: '300㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 3000, amount: 300000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D018', orderId: 'CPO003', productId: 'PRD784', productCode: 'QD2015', productName: '电缆', specification: '400㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 3800, amount: 380000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D019', orderId: 'CPO003', productId: 'PRD785', productCode: 'XS1001', productName: '线鼻子', specification: '10-400㎡', unit: '个', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 15, amount: 1500, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D020', orderId: 'CPO003', productId: 'PRD786', productCode: 'XS1002', productName: '热缩管', specification: 'Φ20-Φ100', unit: '米', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 12, amount: 1200, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D021', orderId: 'CPO003', productId: 'PRD787', productCode: 'XS1003', productName: '电缆桥架', specification: '200*100', unit: '米', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 85, amount: 8500, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D022', orderId: 'CPO003', productId: 'PRD788', productCode: 'XS1004', productName: '接地铜线', specification: '16㎡多股', unit: '米', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 28, amount: 2800, deliveryDate: '2026-07-10', remark: '' },
    ]
  },\r\n`;

// 找到MOCK_INITIAL_ORDERS的结束位置（export default前面的];）
const exportStr = 'export default function';
const exportIdx = content.indexOf(exportStr);
if (exportIdx === -1) {
  console.log('Could not find export default');
  process.exit(1);
}

const mockOrdersEnd = content.lastIndexOf('];', exportIdx);
if (mockOrdersEnd === -1) {
  console.log('Could not find MOCK_INITIAL_ORDERS end');
  process.exit(1);
}

console.log('MOCK_INITIAL_ORDERS ends at:', mockOrdersEnd);

const lastOrderEnd = content.lastIndexOf('  },', mockOrdersEnd);
console.log('Last order ends at:', lastOrderEnd);

if (lastOrderEnd === -1) {
  console.log('Could not find last order end');
  process.exit(1);
}

content = content.substring(0, lastOrderEnd + 4) + '\r\n' + newOrder + content.substring(lastOrderEnd + 4);
console.log('Added new order to MOCK_INITIAL_ORDERS');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('File saved!');
