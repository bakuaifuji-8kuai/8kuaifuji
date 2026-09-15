const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'd:/会展仓库项目/screenshot_a_home.png', fullPage: true });

  // 招采管理
  const zc = page.locator('text=招采管理').first();
  if (await zc.count() > 0) { await zc.click(); await page.waitForTimeout(500); }

  // 采购需求申请
  const xq = page.locator('text=采购需求申请').first();
  if (await xq.count() > 0) { await xq.click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800); }

  await page.screenshot({ path: 'd:/会展仓库项目/screenshot_b_demand.png', fullPage: true });
  let bodyText = await page.locator('body').innerText();
  console.log('=== BODY TEXT (first 3000) ===');
  console.log(bodyText.substring(0, 3000));

  // 新增
  const addBtn = page.locator('text=新增需求申请').first();
  if (await addBtn.count() > 0) {
    console.log('\nFound add button, clicking...');
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'd:/会展仓库项目/screenshot_c_modal.png', fullPage: true });

    // 所有 select
    const selects = page.locator('select');
    const selCount = await selects.count();
    console.log(`Found ${selCount} selects`);
    for (let i = 0; i < selCount; i++) {
      const opts = selects.nth(i).locator('option');
      const cnt = await opts.count();
      const texts = [];
      for (let j = 0; j < Math.min(cnt, 4); j++) texts.push(await opts.nth(j).innerText());
      console.log(`  Select[${i}]: ${texts.join(' | ')}`);
    }

    // 找业务类型 select（第一个带"工程类"选项的）
    for (let i = 0; i < selCount; i++) {
      const opts = selects.nth(i).locator('option');
      const cnt = await opts.count();
      let foundEngineering = false;
      for (let j = 0; j < cnt; j++) {
        const txt = await opts.nth(j).innerText();
        if (txt.includes('工程类')) { foundEngineering = true; break; }
      }
      if (foundEngineering) {
        console.log(`  -> Business type select at index ${i}`);
        await selects.nth(i).selectOption({ label: '工程类 / 货物（含材料和设备）' });
        break;
      }
    }

    // 项目名称 input
    const inputs = page.locator('input[type="text"]');
    const inCount = await inputs.count();
    for (let i = 0; i < inCount; i++) {
      const ph = await inputs.nth(i).getAttribute('placeholder') || '';
      console.log(`  Input[${i}] placeholder="${ph}"`);
      if (ph.includes('项目') || ph === '') {
        await inputs.nth(i).fill('BROWSER_TEST_0914');
        break;
      }
    }

    // textarea
    const ta = page.locator('textarea').first();
    if (await ta.count() > 0) { await ta.fill('test reason'); }

    await page.screenshot({ path: 'd:/会展仓库项目/screenshot_d_filled.png', fullPage: true });

    // 保存
    const saveBtn = page.locator('button:has-text("保存")').first();
    if (await saveBtn.count() > 0) {
      console.log('Clicking save...');
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'd:/会展仓库项目/screenshot_e_after_save.png', fullPage: true });

      bodyText = await page.locator('body').innerText();
      if (bodyText.includes('BROWSER_TEST_0914')) {
        console.log('\n✅ SUCCESS: New record visible in list!');
      } else {
        console.log('\n❌ FAIL: New record NOT found in list!');
        console.log('--- Current body text ---');
        console.log(bodyText.substring(0, 3000));
      }
    }
  }

  console.log('\n=== CONSOLE ERRORS ===');
  errors.forEach(e => console.log(e));

  await browser.close();
})();
