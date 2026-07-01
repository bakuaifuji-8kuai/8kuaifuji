import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174/8kuaifuji';

test.describe('基础资料模块', () => {
  test('物资档案页面加载正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await expect(page.locator('h2')).toContainText('物资档案');
    await expect(page.locator('button', { hasText: '新增物资' }).first()).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('新增物资弹窗可以打开', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await page.locator('button', { hasText: '新增物资' }).first().click();
    await page.waitForTimeout(500);

    const modal = page.locator('[class*="fixed"], [class*="modal"], [role="dialog"]').first();
    await expect(modal).toBeVisible();

    await expect(page.locator('[class*="modal"] textarea, [class*="modal"] input, [role="dialog"] input').first()).toBeVisible();

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read'))
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('出库管理模块', () => {
  test('展会物资领用出库页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/outbound/exhibition`);
    await expect(page.locator('h2')).toContainText('展会物资领用出库');
    await expect(page.locator('button', { hasText: '新增工单出库单' }).first()).toBeVisible();
  });

  test('新增工单出库单 - 选择工单和物资（关键功能）', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/outbound/exhibition`);
    await page.locator('button', { hasText: '新增工单出库单' }).first().click();
    await page.waitForTimeout(800);

    const workOrderBtn = page.locator('button', { hasText: '选择工单' }).first();
    if (await workOrderBtn.isVisible()) {
      await workOrderBtn.click();
      await page.waitForTimeout(800);

      const firstCheckbox = page.locator('[class*="modal"] input[type="checkbox"], [role="dialog"] input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible()) {
        await firstCheckbox.check();
        await page.waitForTimeout(300);

        const confirmBtn = page.locator('[class*="modal"] button, [role="dialog"] button').filter({ hasText: /确认|确定/ }).filter({ hasNotText: '取消' }).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(800);
        }
      }
    }

    const selectProductBtn = page.locator('button', { hasText: '选择物资' }).first();
    if (await selectProductBtn.isVisible({ timeout: 5000 })) {
      await selectProductBtn.click();
      await page.waitForTimeout(800);

      const productCheckboxes = page.locator('[class*="modal"] input[type="checkbox"], [role="dialog"] input[type="checkbox"]');
      const count = await productCheckboxes.count();
      if (count > 0) {
        await productCheckboxes.first().check();
        await page.waitForTimeout(300);

        const confirmBtn = page.locator('[class*="modal"] button, [role="dialog"] button').filter({ hasText: /确认选择|确定/ }).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(800);
        }
      }
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors:', criticalErrors);
    }
    expect(criticalErrors).toHaveLength(0);
  });

  test('低值易耗领用出库页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/outbound/lowvalue`);
    await expect(page.locator('h2')).toContainText('低值易耗领用出库');
  });
});

test.describe('入库管理模块', () => {
  test('采购入库页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/inbound/purchase`);
    await expect(page.locator('h2')).toContainText('采购入库');
    await expect(page.locator('button').filter({ hasText: /新增.*入库/ }).first()).toBeVisible();
  });

  test('新增采购入库单 - 选择物资', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/inbound/purchase`);
    const addBtn = page.locator('button').filter({ hasText: /新增.*入库/ }).first();
    await addBtn.click();
    await page.waitForTimeout(800);

    const selectProductBtn = page.locator('button', { hasText: '选择物资' }).first();
    if (await selectProductBtn.isVisible({ timeout: 5000 })) {
      await selectProductBtn.click();
      await page.waitForTimeout(800);

      const productCheckboxes = page.locator('[class*="modal"] input[type="checkbox"], [role="dialog"] input[type="checkbox"]');
      const count = await productCheckboxes.count();
      if (count > 0) {
        await productCheckboxes.first().check();
        await page.waitForTimeout(300);

        const confirmBtn = page.locator('[class*="modal"] button, [role="dialog"] button').filter({ hasText: /确认选择|确定/ }).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(800);
        }
      }
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('库存管理模块', () => {
  test('库存查询页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/stock/query`);
    await expect(page.locator('h2')).toContainText('库存查询');
    await expect(page.locator('input[placeholder*="规格"]').first()).toBeVisible();
    await expect(page.locator('button', { hasText: '导出' }).first()).toBeVisible();
  });

  test('库存查询 - 导出按钮可点击', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/stock/query`);
    await page.waitForTimeout(500);

    const exportBtn = page.locator('button', { hasText: '导出' }).first();
    await expect(exportBtn).toBeVisible();

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('库存流水页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/stock/transaction`);
    await expect(page.locator('h2')).toContainText('库存流水');
    await expect(page.locator('input[placeholder*="规格"]').first()).toBeVisible();
  });

  test('盘点管理页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/stock/check`);
    await expect(page.locator('h2')).toContainText('盘点');
  });
});

test.describe('报表管理模块', () => {
  test('展会物资领用报表页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/exhibition-requisition`);
    await expect(page.locator('h2')).toContainText('展会物资领用报表');
  });

  test('展会物资领用报表详情页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/exhibition-requisition-detail`);
    await expect(page.locator('h2')).toContainText('展会物资领用报表详情');
    await expect(page.locator('input[placeholder*="物资编码"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="物资名称"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="规格"]').first()).toBeVisible();
  });

  test('库存报表页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/report/stock`);
    await expect(page.locator('h2')).toContainText('库存报表');
  });
});

test.describe('固定资产管理模块', () => {
  test('资产档案页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/asset/list`);
    await expect(page.locator('h2')).toContainText('资产档案');
  });

  test('资产领用页面加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/asset/requisition`);
    await expect(page.locator('h2')).toContainText('资产领用');
  });
});
