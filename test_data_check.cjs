const fs = require('fs');

// 读取 mock 数据文件
const dataContent = fs.readFileSync('./src/mock/data.ts', 'utf-8');

// 简单解析：提取关键数组统计
console.log('========== 基础资料模块数据检查 ==========');

// 仓库统计
const warehouseMatches = dataContent.match(/id: 'WH\d+'/g) || [];
console.log(`仓库数量: ${[...new Set(warehouseMatches)].length}`);
[...new Set(warehouseMatches)].forEach(w => console.log(`  - ${w}`));

// 仓位统计
const positionMatches = dataContent.match(/id: 'POS\d+'/g) || [];
console.log(`\n仓位数量: ${[...new Set(positionMatches)].length}`);

// 产品统计
const productMatches = dataContent.match(/id: '(PRD|MAT)\d+'/g) || [];
const uniqueProducts = [...new Set(productMatches)];
console.log(`\n物资数量: ${uniqueProducts.length}`);

// 无品牌物资统计
const noBrandProducts = [];
const productBlocks = dataContent.match(/id: '(PRD|MAT)\d+',[\s\S]*?brand: '.*?'/g) || [];
productBlocks.forEach(block => {
  const idMatch = block.match(/id: '((PRD|MAT)\d+)'/);
  const brandMatch = block.match(/brand: '(.*?)'/);
  if (idMatch && brandMatch && brandMatch[1] === '') {
    noBrandProducts.push(idMatch[1]);
  }
});
console.log(`无品牌物资数量: ${noBrandProducts.length}`);
console.log(`无品牌物资列表: ${noBrandProducts.join(', ')}`);

// 工单配置统计
const workOrderMatches = dataContent.match(/id: 'WI\d+'/g) || [];
console.log(`\n工单配置数量: ${[...new Set(workOrderMatches)].length}`);

// 检查工单是否有关联项目
const woWithProject = [];
const woBlocks = dataContent.match(/id: 'WI\d+',[\s\S]*?projectName: '.*?'/g) || [];
woBlocks.forEach(block => {
  const idMatch = block.match(/id: '(WI\d+)'/);
  const projMatch = block.match(/projectName: '(.*?)'/);
  if (idMatch && projMatch && projMatch[1]) {
    woWithProject.push({ id: idMatch[1], project: projMatch[1] });
  }
});
console.log(`有项目名称的工单数量: ${woWithProject.length}`);
const projects = [...new Set(woWithProject.map(w => w.project))];
console.log(`项目数量: ${projects.length}`);
projects.forEach(p => console.log(`  - ${p}`));

// 用户统计
const userMatches = dataContent.match(/id: 'USER\d+'/g) || [];
console.log(`\n用户数量: ${[...new Set(userMatches)].length}`);

console.log('\n========== 业务模块数据检查 ==========');

// 入库单统计
const inboundMatches = dataContent.match(/id: '(IN\d+|IN_TEST_\d+)'/g) || [];
console.log(`入库单数量: ${[...new Set(inboundMatches)].length}`);

// 出库单统计
const outboundMatches = dataContent.match(/id: '(OUT\d+|OUT_TEST_\d+)'/g) || [];
console.log(`出库单数量: ${[...new Set(outboundMatches)].length}`);

// 调拨单统计
const transferMatches = dataContent.match(/id: '(TR\d+|TR_TEST_\d+)'/g) || [];
console.log(`调拨单数量: ${[...new Set(transferMatches)].length}`);

// 批次库存统计
const batchMatches = dataContent.match(/id: '(BI\d+|BI_TEST_\d+)'/g) || [];
console.log(`批次库存记录: ${[...new Set(batchMatches)].length}`);

// 库存流水统计
const stockTransMatches = dataContent.match(/id: '(ST\d+|ST_TEST_\d+)'/g) || [];
console.log(`库存流水记录: ${[...new Set(stockTransMatches)].length}`);

// 盘点单统计
const checkMatches = dataContent.match(/id: '(CK\d+|CK_TEST_\d+)'/g) || [];
console.log(`库存盘点单: ${[...new Set(checkMatches)].length}`);

// 退货单统计
const returnMatches = dataContent.match(/id: '(RT\d+|RT_TEST_\d+)'/g) || [];
console.log(`退货单: ${[...new Set(returnMatches)].length}`);

// 采购计划统计
const ppMatches = dataContent.match(/id: '(PP\d+|PP_TEST_\d+)'/g) || [];
console.log(`采购计划: ${[...new Set(ppMatches)].length}`);

// 资产设备统计
const assetMatches = dataContent.match(/id: '(AE\d+|AE_TEST_\d+)'/g) || [];
console.log(`资产设备: ${[...new Set(assetMatches)].length}`);

// 报废记录统计
const scrapMatches = dataContent.match(/id: '(SC\d+|SC_TEST_\d+)'/g) || [];
console.log(`报废记录: ${[...new Set(scrapMatches)].length}`);

// 报损记录统计
const damagedMatches = dataContent.match(/id: '(DM\d+|DM_TEST_\d+)'/g) || [];
console.log(`报损记录: ${[...new Set(damagedMatches)].length}`);

console.log('\n========== 数据引用一致性检查 ==========');

// 检查入库单引用的产品ID是否存在
console.log('正在检查数据引用一致性...');

// 提取所有产品ID
const allProductIds = [];
const productIdRegex = /id: '((PRD|MAT)\d+)'/g;
let match;
while ((match = productIdRegex.exec(dataContent)) !== null) {
  allProductIds.push(match[1]);
}

// 提取所有仓库ID
const allWarehouseIds = [];
const whIdRegex = /id: '(WH\d+)'/g;
while ((match = whIdRegex.exec(dataContent)) !== null) {
  allWarehouseIds.push(match[1]);
}

// 提取所有仓位ID
const allPositionIds = [];
const posIdRegex = /id: '(POS\d+)'/g;
while ((match = posIdRegex.exec(dataContent)) !== null) {
  allPositionIds.push(match[1]);
}

console.log(`产品ID总数: ${new Set(allProductIds).size}`);
console.log(`仓库ID总数: ${new Set(allWarehouseIds).size}`);
console.log(`仓位ID总数: ${new Set(allPositionIds).size}`);

// 检查入库单明细中的 productId
const inboundDetailProductIds = [];
const inboundBlocks = dataContent.match(/id: '(IN\d+|IN_TEST_\d+)',[\s\S]*?details: \[[\s\S]*?\]/g) || [];
inboundBlocks.forEach(block => {
  const detailProdIds = block.match(/productId: '((PRD|MAT)\d+)'/g) || [];
  detailProdIds.forEach(p => {
    const id = p.match(/productId: '((PRD|MAT)\d+)'/)[1];
    inboundDetailProductIds.push(id);
  });
});

const invalidInboundProducts = inboundDetailProductIds.filter(p => !allProductIds.includes(p));
console.log(`\n入库单引用产品数: ${inboundDetailProductIds.length}`);
console.log(`无效产品引用: ${invalidInboundProducts.length}`);
if (invalidInboundProducts.length > 0) {
  console.log(`  无效ID: ${[...new Set(invalidInboundProducts)].join(', ')}`);
}

// 检查出库单明细中的 productId
const outboundDetailProductIds = [];
const outboundBlocks = dataContent.match(/id: '(OUT\d+|OUT_TEST_\d+)',[\s\S]*?details: \[[\s\S]*?\]/g) || [];
outboundBlocks.forEach(block => {
  const detailProdIds = block.match(/productId: '((PRD|MAT)\d+)'/g) || [];
  detailProdIds.forEach(p => {
    const id = p.match(/productId: '((PRD|MAT)\d+)'/)[1];
    outboundDetailProductIds.push(id);
  });
});

const invalidOutboundProducts = outboundDetailProductIds.filter(p => !allProductIds.includes(p));
console.log(`\n出库单引用产品数: ${outboundDetailProductIds.length}`);
console.log(`无效产品引用: ${invalidOutboundProducts.length}`);
if (invalidOutboundProducts.length > 0) {
  console.log(`  无效ID: ${[...new Set(invalidOutboundProducts)].join(', ')}`);
}

console.log('\n========== 测试完成 ==========');
