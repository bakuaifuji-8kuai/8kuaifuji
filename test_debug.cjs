const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => console.log('[' + msg.type() + '] ' + msg.text()));
  page.on('pageerror', err => console.log('[PAGEERR] ' + err.message));

  await page.goto('http://localhost:5174/#/procurement/demand');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  await page.locator('button:has-text("新增需求申请")').first().click();
  await page.waitForTimeout(800);

  const modal = page.locator('div.fixed.inset-0.z-50').first();

  // 填表单
  await modal.locator('select').first().selectOption({ label: '工程类 / 货物（含材料和设备）' });
  await modal.locator('select').nth(1).selectOption({ label: '会议审批' });
  await modal.locator('select').nth(2).selectOption({ label: '新增供应商目录' });
  const inputs = modal.locator('input');
  const ic = await inputs.count();
  for (let i = 0; i < ic; i++) {
    const ph = (await inputs.nth(i).getAttribute('placeholder')) || '';
    if (ph.includes('项目名称')) await inputs.nth(i).fill('BROWSER_TEST_0914');
  }

  // 保存按钮
  const saveBtn = modal.locator('button:has-text("保存")').first();

  // evaluate 按钮上的 React props，看看 onClick 有没有绑定
  const reactInfo = await saveBtn.evaluate(el => {
    const keys = Object.keys(el).filter(k => k.startsWith('__reactProps'));
    const firstKey = keys[0];
    if (firstKey) {
      const props = el[firstKey];
      return { totalKeys: keys.length, hasOnClick: !!props.onClick, onClickType: typeof props.onClick };
    }
    return { totalKeys: 0 };
  });
  console.log('Save button React info:', JSON.stringify(reactInfo));

  // 也打印一下按钮的 outerHTML（简化版）
  const html = await saveBtn.evaluate(el => el.outerHTML.substring(0, 200));
  console.log('Save button HTML:', html);

  // 保存前 store 状态
  const beforeCount = await page.locator('tbody tr').count();
  console.log('Before save rows:', beforeCount);

  await saveBtn.click({ force: true });
  await page.waitForTimeout(2000);

  const afterCount = await page.locator('tbody tr').count();
  console.log('After save rows:', afterCount);

  const tbl = await page.locator('table').first().innerText();
  console.log('Contains BROWSER_TEST:', tbl.includes('BROWSER_TEST_0914'));

  await browser.close();
})();
