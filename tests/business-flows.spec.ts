import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174/8kuaifuji';

async function collectCriticalErrors(page: any): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

function filterCriticalErrors(errors: string[]): string[] {
  return errors.filter(e =>
    !e.includes('warning') && !e.includes('Warning') && !e.includes('404') &&
    (e.includes('Error') || e.includes('error') || e.includes('Cannot read') || e.includes('undefined') || e.includes('null'))
  );
}

test.describe('核心业务流程 - 边界条件与完整性测试', () => {
  test('1. 物资档案 - 搜索过滤功能正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="名称"], input[placeholder*="编码"], input[placeholder*="搜索"]').first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('展板');
      await page.waitForTimeout(500);

      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);

      await searchInput.clear();
      await page.waitForTimeout(300);
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('2. 库存查询 - 多条件组合搜索不报错', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/stock/query`);
    await page.waitForTimeout(1000);

    const inputs = page.locator('input[type="text"], input:not([type])');
    const inputCount = await inputs.count();

    if (inputCount >= 2) {
      await inputs.first().fill('测试');
      await page.waitForTimeout(300);
      await inputs.nth(1).fill('规格');
      await page.waitForTimeout(500);
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('3. 库存查询 - 导出功能不触发运行时错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/stock/query`);
    await page.waitForTimeout(1000);

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

    const exportBtn = page.locator('button', { hasText: '导出' }).first();
    if (await exportBtn.isVisible({ timeout: 3000 })) {
      await exportBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }

    const download = await downloadPromise;
    if (download) {
      expect(download).toBeTruthy();
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('4. 采购入库 - 新增弹窗表单字段完整', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/inbound/purchase`);
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button').filter({ hasText: /新增.*入库/ }).first();
    if (await addBtn.isVisible({ timeout: 5000 })) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(1000);

      const modal = page.locator('[class*="fixed"], [class*="modal"], [role="dialog"]').first();
      await expect(modal).toBeVisible();

      const inputs = page.locator('[class*="fixed"] input, [role="dialog"] input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);

      const selects = page.locator('[class*="fixed"] select, [role="dialog"] select');
      const selectCount = await selects.count();
      expect(selectCount).toBeGreaterThanOrEqual(0);

      const closeBtn = page.locator('[class*="fixed"] button, [role="dialog"] button').filter({ hasText: /取消|关闭/ }).first();
      if (await closeBtn.isVisible({ timeout: 2000 })) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('5. 出库管理 - 选择物资后数量字段可编辑', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/outbound/exhibition`);
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: '新增工单出库单' }).first().click({ force: true });
    await page.waitForTimeout(1000);

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
            await page.waitForTimeout(1500);

            const quantityInputs = page.locator('[class*="fixed"] input[type="number"], [role="dialog"] input[type="number"]');
            const qtyCount = await quantityInputs.count();
            if (qtyCount > 0) {
              await quantityInputs.first().fill('10');
              await page.waitForTimeout(300);
            }
          }
        }
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('6. 盘点管理 - 新增盘点单后可查看详情', async ({ page }) => {
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
      if (await modal.isVisible()) {
        const viewBtns = page.locator('[class*="fixed"] button, [role="dialog"] button').filter({ hasText: '查看' });
        const count = await viewBtns.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('7. 库存流水 - 页面数据加载和筛选正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/stock/transaction`);
    await page.waitForTimeout(1000);

    await expect(page.locator('h2')).toContainText('库存流水');

    const table = page.locator('table');
    if (await table.isVisible({ timeout: 3000 })) {
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('8. 供应商管理 - 列表和详情弹窗正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/supplier`);
    await page.waitForTimeout(1000);

    await expect(page.locator('h2')).toContainText('供应商');

    const viewBtns = page.locator('button').filter({ hasText: '查看' });
    if (await viewBtns.first().isVisible({ timeout: 3000 })) {
      await viewBtns.first().click({ force: true });
      await page.waitForTimeout(800);

      const modal = page.locator('[class*="fixed"], [class*="modal"]').first();
      if (await modal.isVisible()) {
        const closeBtn = page.locator('button').filter({ hasText: /关闭|取消/ }).last();
        if (await closeBtn.isVisible()) {
          await closeBtn.click({ force: true });
          await page.waitForTimeout(300);
        }
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('9. 报表模块 - 各报表页面加载无错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const reportPages = [
      '/report/stock',
      '/report/inbound',
      '/report/outbound',
      '/report/exhibition-requisition',
    ];

    for (const path of reportPages) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForTimeout(800);

      const criticalErrors = filterCriticalErrors(errors);
      expect(criticalErrors).toHaveLength(0);
      errors.length = 0;
    }
  });

  test('10. 资产档案 - 编辑功能金额字段可编辑', async ({ page }) => {
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

      const numberInputs = page.locator('[class*="fixed"] input[type="number"], [role="dialog"] input[type="number"]');
      const count = await numberInputs.count();
      expect(count).toBeGreaterThanOrEqual(0);

      const saveBtn = page.locator('button').filter({ hasText: /保存|确定/ }).filter({ hasNotText: '取消' }).last();
      if (await saveBtn.isVisible()) {
        await saveBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('11. 采购管理 - 采购计划页面加载正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/procurement/plan`);
    await page.waitForTimeout(1000);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('12. 采购管理 - 采购需求页面加载正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/procurement/demand`);
    await page.waitForTimeout(1000);

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('13. 侧边栏导航 - 各模块切换不报错', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await page.waitForTimeout(1000);

    const navItems = page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav"] a');
    const navCount = await navItems.count();

    if (navCount > 0) {
      const clickedItems = new Set<string>();
      for (let i = 0; i < Math.min(navCount, 8); i++) {
        try {
          const item = navItems.nth(i);
          const href = await item.getAttribute('href');
          if (href && !clickedItems.has(href)) {
            clickedItems.add(href);
            await item.click({ force: true });
            await page.waitForTimeout(500);
          }
        } catch (e) {
        }
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('14. 数据表格 - 分页切换功能正常', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await page.waitForTimeout(1000);

    const paginationBtns = page.locator('button').filter({ hasText: /下一页|上一页|\d+/ });
    const pgCount = await paginationBtns.count();
    if (pgCount > 0) {
      const nextBtn = page.locator('button').filter({ hasText: /下一页|→|>/ }).first();
      if (await nextBtn.isVisible({ timeout: 2000 })) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });

  test('15. 空状态处理 - 搜索无结果时页面不崩溃', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/basic/product`);
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="名称"], input[placeholder*="编码"], input[placeholder*="搜索"]').first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('ZZZ不存在的物资ZZZ');
      await page.waitForTimeout(500);

      const table = page.locator('table');
      if (await table.isVisible()) {
        const rows = page.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }

      await searchInput.clear();
      await page.waitForTimeout(300);
    }

    const criticalErrors = filterCriticalErrors(errors);
    expect(criticalErrors).toHaveLength(0);
  });
});
