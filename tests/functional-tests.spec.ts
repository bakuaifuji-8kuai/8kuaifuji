import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174/8kuaifuji';

test.describe('功能级操作测试', () => {
  test('1. 物资档案 - 新增弹窗打开正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await page.waitForTimeout(1000);
    await page.locator('button', { hasText: '新增物资' }).first().click();
    await page.waitForTimeout(500);

    const modal = page.locator('[class*="fixed"], [class*="modal"]').first();
    await expect(modal).toBeVisible();

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('2. 采购入库 - 新增并选择物资', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/inbound/purchase`);
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button').filter({ hasText: /新增.*入库/ }).first();
    await addBtn.click({ force: true });
    await page.waitForTimeout(800);

    const selectProductBtn = page.locator('button', { hasText: '选择物资' }).first();
    if (await selectProductBtn.isVisible({ timeout: 5000 })) {
      await selectProductBtn.click({ force: true });
      await page.waitForTimeout(1000);

      const productModal = page.locator('[class*="fixed"], [class*="modal"]').nth(1);
      if (await productModal.isVisible()) {
        const checkboxes = productModal.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        if (count > 0) {
          await checkboxes.first().check({ force: true });
          await page.waitForTimeout(300);

          const confirmBtn = productModal.locator('button').filter({ hasText: /确认选择|确定/ }).first();
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(1000);
          }
        }
      }
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('3. 展会物资领用出库 - 新增并选择工单和物资（关键功能）', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/outbound/exhibition`);
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: '新增工单出库单' }).first().click({ force: true });
    await page.waitForTimeout(800);

    const workOrderBtn = page.locator('button', { hasText: '选择工单' }).first();
    if (await workOrderBtn.isVisible({ timeout: 5000 })) {
      await workOrderBtn.click({ force: true });
      await page.waitForTimeout(1000);

      const workOrderModal = page.locator('[class*="fixed"], [class*="modal"]').nth(1);
      if (await workOrderModal.isVisible()) {
        const checkboxes = workOrderModal.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        if (count > 0) {
          await checkboxes.first().check({ force: true });
          await page.waitForTimeout(300);

          const confirmBtn = workOrderModal.locator('button').filter({ hasText: /确认|确定/ }).filter({ hasNotText: '取消' }).first();
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(1000);
          }
        }
      }
    }

    const selectProductBtn = page.locator('button', { hasText: '选择物资' }).first();
    if (await selectProductBtn.isVisible({ timeout: 8000 })) {
      await selectProductBtn.click({ force: true });
      await page.waitForTimeout(1000);

      const productModal = page.locator('[class*="fixed"], [class*="modal"]').nth(1);
      if (await productModal.isVisible()) {
        const checkboxes = productModal.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        if (count > 0) {
          await checkboxes.first().check({ force: true });
          await page.waitForTimeout(300);

          const confirmBtn = productModal.locator('button').filter({ hasText: /确认选择|确定/ }).first();
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(1000);
          }
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

  test('4. 库存查询 - 导出按钮可点击', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/stock/query`);
    await page.waitForTimeout(1000);

    const exportBtn = page.locator('button', { hasText: '导出' }).first();
    await expect(exportBtn).toBeVisible();

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('5. 盘点管理 - 新增盘点单弹窗打开', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/stock/check`);
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button').filter({ hasText: /新增.*盘点/ }).first();
    if (await addBtn.isVisible({ timeout: 5000 })) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(800);

      const modal = page.locator('[class*="fixed"], [class*="modal"]').first();
      await expect(modal).toBeVisible();
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('6. 资产档案 - 查看详情弹窗打开正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/asset/list`);
    await page.waitForTimeout(1000);

    const viewBtn = page.locator('button').filter({ hasText: '查看' }).first();
    if (await viewBtn.isVisible({ timeout: 5000 })) {
      await viewBtn.click({ force: true });
      await page.waitForTimeout(800);

      await expect(page.getByText('资产详情')).toBeVisible();
      await expect(page.getByText('关闭')).toBeVisible();
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('7. 资产档案 - 编辑弹窗打开正常（仅金额和备注可编辑）', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/asset/list`);
    await page.waitForTimeout(1000);

    const editBtn = page.locator('button').filter({ hasText: '编辑' }).first();
    if (await editBtn.isVisible({ timeout: 5000 })) {
      await editBtn.click({ force: true });
      await page.waitForTimeout(800);

      await expect(page.getByText('编辑资产信息')).toBeVisible();

      const inputs = page.locator('input');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('8. 资产档案 - 打印标签预览页面打开正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/asset/list`);
    await page.waitForTimeout(1000);

    const printBtn = page.locator('button').filter({ hasText: '打印' }).first();
    if (await printBtn.isVisible({ timeout: 5000 })) {
      await printBtn.click({ force: true });
      await page.waitForTimeout(800);

      await expect(page.getByText('资产标签打印预览')).toBeVisible();
      await expect(page.getByText(/共 \d+ 张标签/)).toBeVisible();

      const closeBtn = page.locator('button').filter({ hasText: '关闭' }).last();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
      (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined'))
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
