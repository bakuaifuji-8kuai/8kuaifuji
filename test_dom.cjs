const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5174/#/procurement/demand');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  // 点新增
  await page.locator('button:has-text("新增需求申请")').first().click();
  await page.waitForTimeout(800);

  // 检查所有 select
  const allSelects = page.locator('select');
  const total = await allSelects.count();
  console.log('Total selects on page: ' + total);
  
  // 检查所有可见 div 的 class 里有没有 modal / dialog / popup / overlay
  const divs = page.locator('div');
  const dCount = await divs.count();
  console.log('Total divs: ' + dCount);
  
  // 找含 modal/dialog/popup/overlay 的类名
  const clsSet = new Set();
  for (let i = 0; i < dCount; i++) {
    const cls = await divs.nth(i).getAttribute('class') || '';
    if (cls && (cls.includes('modal') || cls.includes('Modal') || cls.includes('dialog') || cls.includes('Dialog') || cls.includes('popup') || cls.includes('Popup') || cls.includes('overlay') || cls.includes('Overlay') || cls.includes('mask') || cls.includes('Mask'))) {
      clsSet.add(cls.substring(0, 80));
    }
  }
  console.log('Modal-like classes:');
  [...clsSet].forEach(c => console.log('  .' + c));

  // 直接打印包含"工程类"文本的最近父 div
  const businessSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '工程类' }) });
  const bCount = await businessSelect.count();
  console.log('\nBusiness select (has 工程类 options) count: ' + bCount);
  if (bCount > 0) {
    const parent = businessSelect.first().locator('..').locator('..').locator('..');
    const cls = await parent.getAttribute('class');
    console.log('Parent (3 up) class: ' + cls);
    const grandparent = parent.locator('..').locator('..');
    const gcls = await grandparent.getAttribute('class');
    console.log('Grandparent (5 up) class: ' + gcls);
  }

  // 保存按钮呢？
  const saveBtns = page.locator('button:has-text("保存")');
  const sCount = await saveBtns.count();
  console.log('\nSave buttons: ' + sCount);
  for (let i = 0; i < sCount; i++) {
    const txt = await saveBtns.nth(i).innerText();
    const parentCls = await saveBtns.nth(i).locator('xpath=ancestor::div[3]').getAttribute('class');
    console.log('  save[' + i + '] text="' + txt + '" parentCls=' + (parentCls || 'null'));
  }

  await browser.close();
})();
