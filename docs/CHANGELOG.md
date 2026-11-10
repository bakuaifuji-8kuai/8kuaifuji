# 变更记录 (CHANGELOG)

> 所有重要的项目变更都将记录在此文件中。
> 格式遵循：日期 → 版本号 → 变更说明 → 改动文件清单。

---

## 2026-11-10 · v1.6.0 — 展会调拨出库/入库审批小程序（完整上线）

### 📦 主要功能

新增展会调拨出库审批小程序 + 展会调拨入库审批小程序两个独立页面，在 PC 端以 iPhone 手机框架模拟展示，用于演示移动端审批人视角对展会调拨单据进行查看与审批操作。

### ✨ 新功能

| # | 功能 | 说明 |
|---|------|------|
| 1 | **展会调拨出库·小程序展示页** | 375×720 iPhone 模拟框架，待审批/已处理 Tab 切换，调拨单卡片列表，审批人身份切换（localStorage 持久化），全屏详情 Modal（业务表单 + 物资明细 + 流转记录时间线 + 底部同意/退回按钮）|
| 2 | **展会调拨入库·小程序展示页** | 同出库页风格，待审批只展示已出库单据（outbound_confirmed），列表卡片区额外显示"已出库确认人"，流转记录多了出库确认节点 |
| 3 | **侧边栏菜单注册** | 在"展会物资调拨管理 → 调拨还库"下新增两条菜单项 |
| 4 | **调拨单测试数据** | 新增 5 条展会专属调拨单（TF2026111001-05），覆盖 pending / outbound_confirmed × 2 / completed / cancelled 全部状态，全部 WH001（实物仓）→ WH004-007（虚拟仓），category=exhibition 能通过小程序过滤 |
| 5 | **摊位号 + 作业项** | StockTransferDetail 新增 boothNo（施工摊位号） + workItemName（作业项）字段，小程序卡片标签/业务表单/物资明细卡片底部全部改为展示摊位号和作业项，替代之前的工单名称 |
| 6 | **mock 数据 v14 + v15 刷新** | zustand persist version 升级到 15，migrate v14→v15 强制刷新 stockTransfers，解决 localStorage 缓存旧 mock 导致新页面空数据的问题 |

### 🗂️ 改动文件清单

| 文件 | 类型 | 改动说明 |
|------|------|----------|
| `src/pages/Stock/ExhibitionTransferApprovalOutbound.tsx` | **新增** | 出库审批小程序模拟器（~470 行） |
| `src/pages/Stock/ExhibitionTransferApprovalInbound.tsx` | **新增** | 入库审批小程序模拟器（~430 行） |
| `src/App.tsx` | 修改 | +2 条 import + 2 条路由（stock/exhibition-transfer-approval-outbound / inbound） |
| `src/components/layout/Sidebar.tsx` | 修改 | 展会物资调拨管理 children 加 2 条菜单项 |
| `src/types/index.ts` | 修改 | StockTransferDetail +3 字段：workItemId / workItemName / boothNo |
| `src/mock/data.ts` | 修改 | 追加 5 条展会专属调拨数据，每条明细补 boothNo + workItemName |
| `src/store/useStore.ts` | 修改 | persist version 13→15，新增 v14/v15 migrate 分支刷 stockTransfers |

### 🧪 测试数据说明

```
DB202611100001 · 2026上海车展 · 待审批
  WH001(展会物资仓) → WH004(2026车展仓)
  摊位 A馆A-03 · 作业项：展位布设、标识系统布设
  明细 4 条：展板 60 / 展架 30 / 地毯 200㎡ / 指示牌 10

DB202611100002 · 2026上海车展 · 待入库审批(outbound_confirmed)
  WH001 → WH005(锦华虚拟仓)
  摊位 B馆B-12 · 作业项：电箱配置、音响调试、设备调试
  明细 3 条：投影仪 8 / 音响 4 / 电脑 6

DB202611100003 · 长沙应急安防展 · 待入库审批(outbound_confirmed)
  WH001 → WH006(警安虚拟仓)
  摊位 整体 · 无工单模式
  明细 4 条：空调 4 / 音响 2 / 桌椅 20 / 展板 80

DB202611100004 · 广州电力展 · 已完成(completed)
  WH001 → WH007(中裕电力虚拟仓)
  摊位 电力馆E-08 · 作业项：展厅设备搭建、调试安装、会议区布设
  明细 3 条：投影仪 5 / 电脑 10 / 桌椅 15

DB202611100005 · 2026上海车展 · 已取消(cancelled)
  WH001 → WH004(2026车展仓)
  摊位 A馆A-10 · 作业项：展位搭建、展位铺设
  明细 2 条：展架 50 / 地毯 500㎡
```

### 🔧 技术细节

- **iPhone 框架**：和 SupplierQuoteSimulator 复用相同模式（375×720 + 36px 圆角 + iOS 状态栏 + 手机壳 border）
- **审批人切换**：3 个 MockApprover，每个页面独立 localStorage key（transfer_approver_user / transfer_inbound_approver_user）
- **过滤条件**：`fromWh.category === 'exhibition' && toWh.category === 'exhibition'`，只有展会实体仓 → 展会虚拟仓的调拨才展示
- **底部按钮**：当前仅做 UI 展示 + alert 提示"已同意/退回（演示）"，不真正改 store 数据
- **COS 部署**：`node cos-deploy.cjs`，index.html 带 Cache-Control: no-cache + Content-Disposition: inline

### 🌐 访问地址

| 页面 | URL |
|------|-----|
| 首页 | http://bkfj-1306169712.cos.ap-guangzhou.myqcloud.com/ |
| 调拨出库审批小程序 | `/#/stock/exhibition-transfer-approval-outbound` |
| 调拨入库审批小程序 | `/#/stock/exhibition-transfer-approval-inbound` |

### 💡 用户操作提示

首次打开新版本后，zustand 会自动执行 v15 migrate 刷新 mock 数据。如果看到旧数据，F12 控制台执行：

```js
localStorage.removeItem('wms-store');
location.reload();
```

### ✅ 自检清单

- [x] `tsc --noEmit` 类型检查通过
- [x] `vite build` 成功
- [x] COS 部署 140/140 全成功
- [x] 侧边栏菜单可访问
- [x] 出库审批页展示 pending 单据
- [x] 入库审批页展示 outbound_confirmed 单据
- [x] 摊位号 + 作业项正确渲染（替代工单名称）
- [x] 物资明细卡片底部标签摊位号/作业项/主料展示正确
- [x] persist version 升级到 15，migrate 覆盖旧数据

---

## 2026-11-09 · v1.5.0 — 移除 ContractStatus.completed + 场景化需求页数量列补全 + PRD + 流程图

### 🗂️ 改动文件清单

| 文件 | 类型 | 改动说明 |
|------|------|----------|
| `src/types/index.ts` | 修改 | ContractStatus 删 `'completed'` 枚举值 |
| `src/pages/Procurement/ContractLedgerPage.tsx` | 修改 | 合同状态过滤删 completed |
| `src/pages/Procurement/ContractExhibitionPage.tsx` | 修改 | 审批通过统计 + 操作按钮条件删 completed |
| `src/pages/Procurement/ProcurementAlertDashboard.tsx` | 修改 | 3 处预警生成删 completed 检查 |
| `src/pages/Procurement/ProcurementDemandScenePage.tsx` | 修改 | NonEngGoodsTable / NonEngServiceTable 表头+tbody 补采购数量列 |
| `src/mock/biddingMockData.ts` | 修改 | 状态映射表 + 归档推断 + 已付推断 + CPO 生成 4 处删 completed |
| `src/mock/data.ts` + `procurementDemoData.ts` | 修改 | 合同台账记录 status: "completed" → "active" |
| `docs/PRD_招采执行_目录内比价.md` | 重写 | 完整跨页链路 PRD |
| `docs/目录内比价_完整链路流程图.svg` | 新增 | 三栏布局 SVG 流程图 |

---

## 2026-11-09 · v1.4.0 — 场景化需求申请页 5 种清单表格

### 🗂️ 改动文件

- `src/pages/Procurement/ProcurementDemandScenePage.tsx`（~1200 行，5 种清单表格 + 动态表单）
- `src/types/index.ts`（场景化需求相关类型）

---

## 说明

- 本文档从 v1.6.0 起开始正式维护，更早的变更以 Git 历史为准
- COS bucket: `bkfj-1306169712`（广州 ap-guangzhou）
- GitHub: `https://github.com/bakuaifuji-8kuai/8kuaifuji.git` (main 分支)
- Commit message 格式：`type(scope): 说明`
