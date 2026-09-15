const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5174/#/procurement/demand');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("新增需求申请")').first().click();
  await page.waitForTimeout(800);

  const modal = page.locator('div.fixed.inset-0.z-50').first();
  
  // 打印弹窗内所有 input/select/textarea/button/label
  console.log('=== ALL ELEMENTS IN MODAL ===');
  const allEls = modal.locator('input, select, textarea, button, label');
  const cnt = await allEls.count();
  console.log('Total interactive elements: ' + cnt);
  for (let i = 0; i < cnt; i++) {
    const el = allEls.nth(i);
    const tag = await el.evaluate(e => e.tagName);
    const type = await el.getAttribute('type') || '';
    const ph = await el.getAttribute('placeholder') || '';
    const val = await el.inputValue().catch(() => '') || '';
    const cls = (await el.getAttribute('class') || '').substring(0, 40);
    const txt = await el.innerText().catch(() => '') || '';
    if (tag === 'LABEL') {
      console.log(`  [${i}] ${tag}: ${txt.trim()}`);
    } else if (tag === 'BUTTON') {
      console.log(`  [${i}] ${tag}: "${txt.trim()}" cls="${cls}"`);
    } else {
      console.log(`  [${i}] ${tag} type="${type}" ph="${ph}" val="${val.substring(0, 30)}" cls="${cls}"`);
    }
  }
  
  // 也打印一下 modal 内所有带 placeholder 的元素
  const withPh = modal.locator('[placeholder]');
  const phCnt = await withPh.count();
  console.log('\n=== Elements with placeholder: ' + phCnt + ' ===');
  for (let i = 0; i < phCnt; i++) {
    const ph = await withPh.nth(i).getAttribute('placeholder');
    const tag = await withPh.nth(i).evaluate(e => e.tagName);
    console.log(`  [${i}] ${tag}: "${ph}"`);
  }

  await browser.close();
})();
