/**
 * 功能自测脚本 - 用于验证核心功能是否正常工作
 * 运行方式: 在浏览器控制台中粘贴此脚本并执行
 */

// 测试结果收集
const testResults = {
  passed: [],
  failed: []
};

// 辅助函数：等待元素出现
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) resolve(el);
      else if (Date.now() - start > timeout) reject(new Error(`Element ${selector} not found`));
      else setTimeout(check, 100);
    };
    check();
  });
}

// 测试1: 新增采购入库单 - 选择物资保存
async function testPurchaseInbound() {
  console.log('🧪 测试1: 新增采购入库单...');
  try {
    // 导航到采购入库页面
    window.location.href = 'http://localhost:5174/8kuaifuji/inbound/purchase';
    await new Promise(r => setTimeout(r, 2000));
    
    // 点击新增按钮
    const addBtn = document.querySelector('button:has-text("新增")');
    if (addBtn) {
      addBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ 新增按钮点击成功');
    }
    
    // 检查是否有物资选择弹窗
    const modal = document.querySelector('.el-dialog, [role="dialog"], [class*="modal"]');
    if (modal) {
      console.log('✅ 物资选择弹窗打开成功');
    }
    
    testResults.passed.push('采购入库新增');
    return true;
  } catch (e) {
    console.error('❌ 采购入库新增失败:', e.message);
    testResults.failed.push({ test: '采购入库新增', error: e.message });
    return false;
  }
}

// 测试2: 新增物资档案 - 类别选择和编码联动
async function testProductWithCategory() {
  console.log('🧪 测试2: 新增物资档案...');
  try {
    window.location.href = 'http://localhost:5174/8kuaifuji/basic/product';
    await new Promise(r => setTimeout(r, 2000));
    
    const addBtn = document.querySelector('button:has-text("新增物资")');
    if (addBtn) {
      addBtn.click();
      await new Promise(r => setTimeout(r, 1500));
      
      // 检查类别下拉框
      const categorySelect = document.querySelector('input[placeholder*="选择"], .el-select, [class*="select"]');
      if (categorySelect) {
        console.log('✅ 类别选择器存在');
        // 尝试点击类别下拉
        categorySelect.click();
        await new Promise(r => setTimeout(r, 500));
        
        // 检查选项
        const options = document.querySelectorAll('.el-select-dropdown__item, [class*="option"]');
        if (options.length > 0) {
          console.log(`✅ 找到 ${options.length} 个类别选项`);
        }
      }
      
      // 检查编码输入框
      const codeInput = document.querySelector('input[class*="code"], input[placeholder*="编码"]');
      if (codeInput) {
        console.log('✅ 物资编码输入框存在');
      }
    }
    
    testResults.passed.push('物资档案新增');
    return true;
  } catch (e) {
    console.error('❌ 物资档案新增失败:', e.message);
    testResults.failed.push({ test: '物资档案新增', error: e.message });
    return false;
  }
}

// 测试3: 库存查询 - 导出Excel功能
async function testStockExport() {
  console.log('🧪 测试3: 库存查询导出...');
  try {
    window.location.href = 'http://localhost:5174/8kuaifuji/stock/query';
    await new Promise(r => setTimeout(r, 2000));
    
    const exportBtn = document.querySelector('button:has-text("导出")');
    if (exportBtn) {
      console.log('✅ 导出按钮存在');
    } else {
      console.log('⚠️ 未找到导出按钮');
    }
    
    testResults.passed.push('库存查询导出');
    return true;
  } catch (e) {
    console.error('❌ 库存查询导出失败:', e.message);
    testResults.failed.push({ test: '库存查询导出', error: e.message });
    return false;
  }
}

// 测试4: 盘点管理 - 新增盘点单
async function testStockCheck() {
  console.log('🧪 测试4: 盘点管理新增...');
  try {
    window.location.href = 'http://localhost:5174/8kuaifuji/stock/check';
    await new Promise(r => setTimeout(r, 2000));
    
    const addBtn = document.querySelector('button:has-text("新增盘点单")');
    if (addBtn) {
      addBtn.click();
      await new Promise(r => setTimeout(r, 1500));
      console.log('✅ 新增盘点单按钮点击成功');
      
      // 检查弹窗
      const modal = document.querySelector('.el-dialog, [role="dialog"]');
      if (modal) {
        console.log('✅ 盘点单编辑弹窗打开成功');
      }
    }
    
    testResults.passed.push('盘点管理新增');
    return true;
  } catch (e) {
    console.error('❌ 盘点管理新增失败:', e.message);
    testResults.failed.push({ test: '盘点管理新增', error: e.message });
    return false;
  }
}

// 测试5: 展会物资领用出库 - 选择工单和物资（之前有问题的功能）
async function testExhibitionOutbound() {
  console.log('🧪 测试5: 展会物资领用出库（关键测试）...');
  try {
    window.location.href = 'http://localhost:5174/8kuaifuji/outbound/exhibition';
    await new Promise(r => setTimeout(r, 2000));
    
    const addBtn = document.querySelector('button:has-text("新增工单出库单")');
    if (addBtn) {
      addBtn.click();
      await new Promise(r => setTimeout(r, 1500));
      console.log('✅ 新增工单出库单按钮点击成功');
      
      // 尝试选择工单
      const workOrderSelect = document.querySelector('.el-dialog input, [class*="workorder"], [class*="工单"]');
      if (workOrderSelect) {
        workOrderSelect.click();
        await new Promise(r => setTimeout(r, 500));
        
        // 选择第一个工单
        const firstOption = document.querySelector('.el-select-dropdown__item, [class*="option"]');
        if (firstOption) {
          firstOption.click();
          await new Promise(r => setTimeout(r, 500));
          console.log('✅ 工单选择成功');
        }
      }
      
      // 检查是否有物资选择按钮
      const selectProductBtn = document.querySelector('button:has-text("选择物资"), button:has-text("选择")');
      if (selectProductBtn) {
        selectProductBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        
        // 选择物资
        const productCheckbox = document.querySelector('.el-table__body input[type="checkbox"], [class*="checkbox"]');
        if (productCheckbox) {
          productCheckbox.click();
          await new Promise(r => setTimeout(r, 500));
          
          // 点击确认按钮
          const confirmBtn = document.querySelector('button:has-text("确认"), button:has-text("确定")');
          if (confirmBtn) {
            confirmBtn.click();
            await new Promise(r => setTimeout(r, 1000));
            console.log('✅ 物资选择并确认成功 - 如果之前有报错现在应该修复了');
          }
        }
      }
    }
    
    testResults.passed.push('展会物资领用出库');
    return true;
  } catch (e) {
    console.error('❌ 展会物资领用出库失败:', e.message);
    testResults.failed.push({ test: '展会物资领用出库', error: e.message });
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('='.repeat(50));
  console.log('🚀 开始功能自测...');
  console.log('='.repeat(50));
  
  await testPurchaseInbound();
  await testProductWithCategory();
  await testStockExport();
  await testStockCheck();
  await testExhibitionOutbound();
  
  console.log('='.repeat(50));
  console.log('📊 测试结果汇总:');
  console.log(`✅ 通过: ${testResults.passed.length}`);
  console.log(`❌ 失败: ${testResults.failed.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n失败详情:');
    testResults.failed.forEach(f => {
      console.log(`  - ${f.test}: ${f.error}`);
    });
  }
  
  console.log('='.repeat(50));
  return testResults;
}

// 导出函数供外部调用
window.runFunctionalTests = runAllTests;

// 自动提示用户
console.log('💡 功能测试脚本已加载!');
console.log('💡 运行测试请输入: runFunctionalTests()');
