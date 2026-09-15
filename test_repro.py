from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    
    errors = []
    page.on("console", lambda msg: errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type in ["error", "warning"] else None)
    page.on("pageerror", lambda err: errors.append(f"PAGEERROR: {err}"))
    
    page.goto('http://localhost:5174')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(800)
    
    # 找左侧菜单中的招采管理（可能要先展开）
    # 先用 tab 键尝试，或者找带"招"的文本
    page.screenshot(path='/tmp/01_home.png', full_page=True)
    
    # 找到菜单
    found = page.get_by_text("招采管理", exact=False)
    if found.count() > 0:
        found.first.click()
        page.wait_for_timeout(500)
    
    page.screenshot(path='/tmp/02_after_zhao_cai.png', full_page=True)
    
    # 找"采购需求申请"
    found2 = page.get_by_text("采购需求申请", exact=False)
    if found2.count() > 0:
        found2.first.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(800)
    
    page.screenshot(path='/tmp/03_demand_page.png', full_page=True)
    
    # 看看页面实际内容
    body_text = page.locator('body').inner_text()
    print("=== DEMAND PAGE TEXT ===")
    print(body_text[:3000])
    
    # 点"新增"
    add_btn = page.get_by_text("新增需求申请", exact=False)
    if add_btn.count() > 0:
        print("Found add button, clicking...")
        add_btn.first.click()
        page.wait_for_timeout(500)
        page.screenshot(path='/tmp/04_add_modal.png', full_page=True)
        
        # 填表单
        # 业务类型下拉 —— 改成了单选下拉，找第一个 select
        selects = page.locator('select').all()
        print(f"Found {len(selects)} selects")
        
        # 遍历找业务类型的那个
        for sel in selects:
            opts = sel.locator('option').all()
            opt_texts = [o.inner_text() for o in opts]
            print(f"  Select opts: {opt_texts[:3]}")
            if any('工程类' in t for t in opt_texts):
                print("  -> Found business type select!")
                sel.select_option(label="工程类 / 货物（含材料和设备）")
                break
        
        # 需求立项方式
        for sel in selects:
            opts = sel.locator('option').all()
            opt_texts = [o.inner_text() for o in opts]
            if any('会议审批' in t for t in opt_texts):
                sel.select_option(label="会议审批")
                break
        
        # 框架合同清单内/外采购
        for sel in selects:
            opts = sel.locator('option').all()
            opt_texts = [o.inner_text() for o in opts]
            if any('新增供应商' in t for t in opt_texts):
                sel.select_option(label="新增供应商目录")
                break
        
        # 项目名称
        name_inputs = page.locator('input[placeholder*="项目名称"], input[placeholder*="采购项目"], input[type="text"]').all()
        for inp in name_inputs:
            ph = inp.get_attribute('placeholder') or ''
            print(f"  Input placeholder: {ph}")
            if '项目' in ph or ph == '':
                inp.fill('浏览器测试新增0914')
                break
        
        # 填需求理由（textarea）
        tas = page.locator('textarea').all()
        for ta in tas:
            ta.fill('测试保存后能不能在列表看到')
            break
        
        page.screenshot(path='/tmp/05_filled_form.png', full_page=True)
        
        # 保存
        save_btn = page.get_by_text("保存", exact=True)
        if save_btn.count() > 0:
            save_btn.first.click()
            page.wait_for_timeout(800)
            print("Saved, screenshotting...")
            page.screenshot(path='/tmp/06_after_save.png', full_page=True)
            
            # 看 body text 里有没有刚新增的
            body_after = page.locator('body').inner_text()
            if '浏览器测试新增0914' in body_after:
                print("✅ 新增记录在页面上可见!")
            else:
                print("❌ 新增记录在页面上找不到!")
                # 打印当前表格里所有内容
                print("=== CURRENT PAGE TEXT AFTER SAVE ===")
                print(body_after[:3000])
    
    print("\n=== CONSOLE ERRORS ===")
    for e in errors:
        print(e)
    
    browser.close()
