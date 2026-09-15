const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERR: ' + err.message));

  await page.goto('http://localhost:5174/#/procurement/demand');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  // 点新增
  await page.locator('button:has-text("新增需求申请")').first().click();
  await page.waitForTimeout(800);
  const modal = page.locator('div.fixed.inset-0.z-50').first();

  // 业务类型
  const bizSel = modal.locator('select').first();
  await bizSel.selectOption({ label: '工程类 / 货物（含材料和设备）' });

  // 立项方式
  const modeSel = modal.locator('select').nth(1);
  await modeSel.selectOption({ label: '会议审批' });

  // 采购类型
  const typeSel = modal.locator('select').nth(2);
  await typeSel.selectOption({ label: '新增供应商目录' });

  // 所有 input（不加 type 过滤）
  const inputs = modal.locator('input');
  const inCount = await inputs.count();
  console.log('Total inputs (no type filter): ' + inCount);
  for (let i = 0; i < inCount; i++) {
    const ph = (await inputs.nth(i).getAttribute('placeholder')) || '';
    const tag = await inputs.nth(i).evaluate(e => e.type);
    console.log(`  in[${i}] type="${tag}" ph="${ph}"`);
    if (ph.includes('项目名称')) {
      console.log('  -> Filling BROWSER_TEST_0914');
      await inputs.nth(i).fill('BROWSER_TEST_0914');
    }
  }

  // textarea 填理由
  const ta = modal.locator('textarea');
  if (await ta.count() > 0) await ta.first().fill('test reason');

  // 保存
  const tbodyBefore = await page.locator('tbody tr').count();
  console.log('\n保存前行数: ' + tbodyBefore);
  await modal.locator('button:has-text("保存")').first().click();
  await page.waitForTimeout(1500);
  const tbodyAfter = await page.locator('tbody tr').count();
  console.log('保存后行数: ' + tbodyAfter);

  const tableText = await page.locator('table').first().innerText();
  if (tableText.includes('BROWSER_TEST_0914')) {
    console.log('✅ SUCCESS!');
  } else {
    console.log('❌ FAIL!');
    console.log('--- 当前表格 ---');
    console.log(tableText);
  }

  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(e));
  if (errors.length === 0) console.log('(none)');

  await browser.close();
})();
