const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 从 body 文本里找招采相关菜单文字
  const allText = await page.locator('body').innerText();
  const lines = allText.split('\n').map(s => s.trim()).filter(Boolean);
  console.log('=== ALL MENU TEXT LINES ===');
  lines.forEach(l => console.log(l));

  // 从左侧栏专门抓
  const sidebar = page.locator('[class*="sidebar"], [class*="menu"], [class*="nav"], [class*="Sidebar"], [class*="Menu"]');
  const sbCount = await sidebar.count();
  console.log(`\n=== Sidebar elements: ${sbCount} ===`);
  for (let i = 0; i < sbCount; i++) {
    try {
      const t = await sidebar.nth(i).innerText();
      console.log(`SB[${i}]: ${t.substring(0, 500)}`);
    } catch (e) {}
  }

  await browser.close();
})();
