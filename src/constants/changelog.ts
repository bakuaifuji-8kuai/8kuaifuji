// ============================================================
// 变更记录（Changelog）— 2026-10-12 起
// 不含部署/CI 构建类 commit（如 "重新部署最新版本"）
// 数据源：git log --since="2026-10-12"
// ============================================================

export type ChangeType = 'feat' | 'fix' | 'refactor' | 'docs';

export interface ChangeEntry {
  type: ChangeType;
  scope: string;      // 模块标签：招采 / 采购需求 / 合同 / 库存 / 资产 / 档案 / 服务 / 供应商 / 基础 / 验收 / 调拨 / 文档
  title: string;      // 简短标题
  detail?: string;    // 可选：更详细的改动说明
  commit?: string;    // commit hash（末尾 7 位）
}

export interface ChangeDay {
  date: string;          // YYYY-MM-DD
  summary?: string;       // 可选：当天改动概述
  entries: ChangeEntry[];
}

export const CHANGELOG: ChangeDay[] = [
  // ============ 2026-11-05 ============
  {
    date: '2026-11-05',
    summary: 'needContract 三选一枚举 + 调拨出库升级 + 招采验收去初验 + 预算单价可编辑',
    entries: [
      {
        type: 'feat', scope: '采购需求',
        title: 'needContract 扩展为三选一枚举（yes / no_link / no_none）',
        detail: 'yes=走标准链路建工单签合同；no_link=挂已有执行中合同（展开合同搜索下拉必选）；no_none=不签也不关联需求到入库核销就结束。合同新建页严格筛选只有 yes 才进合同签订，回显兼容旧 localStorage 数据（旧 no 自动映射 no_link）',
        commit: 'db4f076',
      },
      {
        type: 'feat', scope: '调拨出库',
        title: '调拨出库作业项合并表头 + 替换物资按钮 + 调拨数量默认值',
        detail: '作业项行 rowspan 合并表头；新增"替换物资"按钮可替换作业项关联的配电箱/吊点；作业数量固定 50 只读；调拨数量默认 min(50, 可用库存)',
        commit: 'db4f076',
      },
      {
        type: 'fix', scope: '验收',
        title: '招采验收服务/项目类去掉初验环节，直接终验',
        detail: 'confirmDemandPick 服务类跳过阶段选择弹窗直接 openForm(demand, "final")；列表页移除阶段筛选项；表单标题去掉"· 终验"后缀。历史初验单保留正常展示',
        commit: 'fd40149',
      },
      {
        type: 'fix', scope: '采购需求',
        title: '框架合同清单外采购不含税预算单价列改为可编辑 input',
        detail: '清单外采购场景下不含税预算单价列之前写成纯文本 `<td>`，改为 `<input type="number" min="0" step="0.01">`，绑定 updateDetail 更新 d.unitPriceExcludingTax',
        commit: '395e94e',
      },
    ],
  },

  // ============ 2026-11-02 ============
  {
    date: '2026-11-02',
    summary: '仓库表单布局优化 + 调拨出库列调整',
    entries: [
      {
        type: 'feat', scope: '仓库管理',
        title: '仓库表单优化：仓库属性移顶 + 虚拟仓支持展会/施工单位 + 自动生成名称',
        detail: '仓库表单字段重排：仓库属性移到第一块；虚拟仓新增"所属展会"和"施工单位"字段；新增"根据地址+类型自动生成仓库名称"按钮',
        commit: '6997246',
      },
    ],
  },

  // ============ 2026-11-01 ============
  {
    date: '2026-11-01',
    entries: [
      {
        type: 'refactor', scope: '调拨出库',
        title: '调拨出库产品明细列表列调整',
        detail: '作业项替换物资编码+工单；调拨数量前置到第一列',
        commit: '69f6972',
      },
    ],
  },

  // ============ 2026-10-30 ============
  {
    date: '2026-10-30',
    summary: '移除需求场景模板菜单 + 功能说明文案全对齐',
    entries: [
      {
        type: 'fix', scope: '基础',
        title: '移除需求场景模板菜单、路由、面包屑（页面文件保留）',
        commit: 'eda30f8',
      },
      {
        type: 'fix', scope: '功能说明',
        title: '功能说明文案全部对齐页面实际列数和列清单',
        commit: '7399b5c',
      },
      {
        type: 'fix', scope: '采购需求',
        title: '采购需求场景 description 列数对齐 + newSupplier 真砍单价备注',
        commit: 'd23d9cc',
      },
      {
        type: 'fix', scope: '采购需求',
        title: '修复 random 方式关联采购需求条件 + linkDemand 开关',
        commit: 'f854d4b',
      },
    ],
  },

  // ============ 2026-10-29 ============
  {
    date: '2026-10-29',
    summary: '招采执行场景弹窗逐字段对齐 CompetitiveBiddingPage',
    entries: [
      {
        type: 'fix', scope: '招采执行',
        title: 'FormInteractiveSection 完全复刻 CompetitiveBiddingPage 弹窗',
        detail: '条件渲染改用 form.procurementMethod 跟随采购方式 select 变化；页面顶部 SceneTabs tab 切换按钮删除（Sidebar 已有）；彻底对齐所有字段 + 修复路由切换报错',
        commit: 'ecffa24',
      },
    ],
  },

  // ============ 2026-10-28 ============
  {
    date: '2026-10-28',
    summary: '招采执行场景模板全采购方式补全 + help 业务边界卡',
    entries: [
      {
        type: 'feat', scope: '招采执行',
        title: '招采执行场景模板改成可交互空表单原型',
        detail: '补全所有 9 种采购方式完整表单字段（对齐新增弹窗）；复刻弹窗审批材料区块（7槽双列+流标+竞价评定结果）；修复 CRLF 换行符导致字段不生效',
        commit: '0630562',
      },
      {
        type: 'feat', scope: '功能说明',
        title: '招采执行/订单管理/验收三个 help 加顶部业务边界卡（businessSummary）',
        detail: '明确仅 framework_catalog 生成采购订单，其余 10 种方式验收直接走需求明细兜底；验收页无订单提示改绿色',
        commit: '91c775b',
      },
      {
        type: 'fix', scope: '合同',
        title: '采购计划汇总 → 招采计划汇总（7 处）',
        commit: '5b3f27e',
      },
      {
        type: 'fix', scope: '验收',
        title: '考核提醒逻辑解耦：绑定表删频率字段，全局补质保期评估类型',
        commit: '8540f29',
      },
    ],
  },

  // ============ 2026-10-27 ============
  {
    date: '2026-10-27',
    summary: '供应商模拟器 + 合同台账 + framework_catalog 工单补全',
    entries: [
      {
        type: 'feat', scope: '供应商',
        title: '供应商模拟器补公告附件/比价文件附件/整单上限/供应商附件上传',
        detail: 'submitQuote 加整单上限兜底校验；超限改为警告而非阻断（confirm 弹窗自选）',
        commit: '2ff6750',
      },
      {
        type: 'fix', scope: '合同',
        title: '合同台账金额单位统一 + 线下流程必填校验 + 合同自动编号',
        detail: '采购方式审批方式枚举值修正 + 竞价采购附件区块放开',
        commit: '0493f25',
      },
      {
        type: 'fix', scope: '招采执行',
        title: '9 个 framework_catalog 工单补齐 biddingAnnouncement/biddingDocuments/totalPriceLimit',
        detail: '版本号升到 3，版本号检测强制补齐新字段（修复 localStorage 持久化旧数据不刷新根因）',
        commit: '479a93c',
      },
    ],
  },

  // ============ 2026-10-26 ============
  {
    date: '2026-10-26',
    summary: '采购计划需求部门上移 + 直接/电子商城排除招采类合同 + 4 处税率文案错配修复',
    entries: [
      {
        type: 'feat', scope: '采购计划',
        title: '需求部门移至主表单 + 功能说明补字段分工说明',
        commit: '2fa20f6',
      },
      {
        type: 'fix', scope: '合同',
        title: '直接/电子商城排除招采类合同 + 隐藏审批批注按钮',
        commit: 'ef4a2bb',
      },
      {
        type: 'fix', scope: '招采执行',
        title: '直接采购/电子商城弹窗与详情页错误显示税率/含税列',
        detail: '直接采购和电子商城采购走 B 表简化表格（无税率/含税/税额列），但弹窗模式提示条、摘要卡灰色小字、汇总卡、详情只读表格四处都套了 C 表完整税率互算的模板，导致用户看到矛盾文案。修复：4 处按 isDirectOrMall 分支，B 表只显示不含税合计 + 已填单价，去掉税率/含税/税额所有字样',
      },
    ],
  },

  // ============ 2026-10-24 ============
  {
    date: '2026-10-24',
    summary: '招采执行场景模板 + 物资服务审批自动生成档案',
    entries: [
      {
        type: 'feat', scope: '招采执行',
        title: '14 种招采执行场景模板演示',
        detail: '覆盖框架协议/询比/竞价/谈判/直接采购/电子商城 9 大类，按采购方式展示完整工单 + 清单 + 报价流程',
        commit: '129a760',
      },
      {
        type: 'feat', scope: '档案',
        title: '物资/服务审批通过自动生成档案',
        detail: '物资申请、服务申请审批流完成后，数据自动流转到物资档案 / 服务档案，避免重复录入',
        commit: '129a760',
      },
      {
        type: 'fix', scope: '招采执行',
        title: '需求场景模板 URL 解析修复',
        detail: '路由使用连字符 / 数据 key 使用下划线，导致 9 种场景模板全部显示"未找到"，修复后全部可访问',
        commit: 'f021abf',
      },
    ],
  },

  // ============ 2026-10-23 ============
  {
    date: '2026-10-23',
    summary: '供应商报价模拟器 + 库存期初导入 + 物资档案模板升级',
    entries: [
      {
        type: 'feat', scope: '招采执行',
        title: '供应商报价模拟手机端页面',
        detail: '模拟供应商视角对目录内比价工单报价，覆盖货物/服务/工程施工 5 种需求类型，支持 6 家供应商切换',
        commit: 'fd9ced0',
      },
      {
        type: 'feat', scope: '库存',
        title: '期初库存导入功能',
        detail: '系统初始化时可批量导入期初库存数量，支持 Excel 模板下载 + 上传 + 自动匹配仓库/库位',
        commit: 'd9f6126',
      },
      {
        type: 'fix', scope: '采购需求',
        title: '清单外/非工程类场景采购数量列改为可编辑',
        commit: '47f9c78',
      },
      {
        type: 'fix', scope: '档案',
        title: '物资档案模板下载 + 导入增强',
        detail: '模板新增"类别"必填列，导入时按类别自动匹配前缀编码（如工程类 GCHW / 办公类 BGLW）',
        commit: '9516c7e',
      },
    ],
  },

  // ============ 2026-10-22 ============
  {
    date: '2026-10-22',
    summary: '招采计划自动带出部门 + 物资申请导入校验 + 档案自动打通',
    entries: [
      {
        type: 'feat', scope: '采购需求',
        title: '物资申请导入强校验 + 重复物资模糊检测弹窗',
        detail: '导入时检测同类别下已存在的相似名称物资，弹窗提示用户是否覆盖或跳过',
        commit: '1f1254e',
      },
      {
        type: 'feat', scope: '采购需求',
        title: '物资申请审批通过自动生成物资档案',
        commit: 'a5d3625',
      },
      {
        type: 'fix', scope: '招采计划',
        title: '需求部门根据经办人自动带出',
        detail: '去掉顶部需求部门输入框，currentUser.department 自动赋值，避免手填出错',
        commit: '7976812',
      },
      {
        type: 'feat', scope: '招采计划',
        title: '月度计划表采购方式必填 + 佐证资料改附件上传',
        detail: '采购计划明细行采购方式改为下拉必填；佐证资料从纯文本改为附件上传（支持多文件）',
        commit: '7b717f8',
      },
    ],
  },

  // ============ 2026-10-21 ============
  {
    date: '2026-10-21',
    summary: '招采执行全采购方式升级 + 供应商账号管理 + 合同字段清理',
    entries: [
      {
        type: 'feat', scope: '招采执行',
        title: '招采执行全采购方式升级',
        detail: '业主代表/报名单位/答疑/审批材料/目录内比价保存校验全部补齐',
        commit: '0503a46',
      },
      {
        type: 'feat', scope: '供应商',
        title: '供应商账号管理',
        detail: '管理员可新增/删除/启用/禁用/重置密码，供应商端无自助改密入口',
        commit: 'fd0422c',
      },
      {
        type: 'feat', scope: '招采流程',
        title: '招采流程自由审批 + 调拨还库 + 合同模板按钮门控',
        commit: 'ce1df9d',
      },
      {
        type: 'feat', scope: '招采执行',
        title: '电子商城采购升级',
        detail: '清单新增单价备注列；电子商城采购工单不进入后续招采合同签订流程',
        commit: 'cec0c5d',
      },
      { type: 'fix', scope: '招采执行', title: '业主代表输入框联动"是否委派业主评委"（选否时隐藏）', commit: '92e85cc' },
      { type: 'fix', scope: '合同', title: '自办展/合办展合同表单删除履约评价/考核管理/年度评价 3 字段', commit: '9c97603' },
      { type: 'fix', scope: '招采计划', title: '采购计划表头分组新增中间段（佐证资料+采购方式移出招标采购阶段）', commit: '2a5e81e' },
    ],
  },

  // ============ 2026-10-20 ============
  {
    date: '2026-10-20',
    entries: [
      {
        type: 'feat', scope: '采购需求',
        title: '采购需求申请事由门控 + 必填校验',
        detail: '施工类需求事由必须写新供应商；outside 工程货物加 2 列；new_supplier 删 2 列',
        commit: 'a8aea42',
      },
      {
        type: 'feat', scope: '招采计划',
        title: '月度计划表盘更新',
        detail: '项目类别收敛为 5 类；新增佐证资料/采购方式/备注 3 列；CSV 同步导出',
        commit: 'c5df5e8',
      },
    ],
  },

  // ============ 2026-10-19 ============
  {
    date: '2026-10-19',
    summary: '招采执行三大门控改造 + 询比拆为公开/邀请',
    entries: [
      { type: 'feat', scope: '招采执行', title: '答疑门控改造：选是显示说明字段；流标保持已有门控', commit: '2b77fe6' },
      {
        type: 'feat', scope: '招采执行',
        title: '三字段改造',
        detail: '项目实施单位改为部门下拉；招标代理机构门控 Radio；业主代表改为多值数组',
        commit: '766a1b7',
      },
      {
        type: 'feat', scope: '招采执行',
        title: '询比采购拆为公开/邀请两种',
        detail: '合计 11 种采购方式：框架协议(2)/询比(2)/竞价/谈判(2)/直接/电子商城/单一来源/竞争性磋商',
        commit: '21d387d',
      },
      { type: 'feat', scope: '合同', title: '自办展/合办展合同表单去掉"关联采购需求"和"中标时间"字段', commit: 'f5bc5c0' },
      { type: 'feat', scope: '调拨', title: '调拨单明细加备注字段 + 调拨出库加"所属展会"筛选', commit: '67ee7b1' },
      { type: 'fix', scope: '调拨', title: '修复调拨出库页面 store 字段名错误导致白屏', commit: '8e5984c' },
      { type: 'docs', scope: '文档', title: '招采需求申请 + 招采执行操作说明穷举所有组合字段', commit: '9ba1671' },
    ],
  },

  // ============ 2026-10-16 ============
  {
    date: '2026-10-16',
    entries: [
      {
        type: 'feat', scope: '合同',
        title: '招采合约 23 页功能操作说明升级',
        detail: '新增"逐操作清单"表格：每个按钮什么时候能用 / 做什么 / 做完后的影响',
        commit: '16d1d2b',
      },
      {
        type: 'feat', scope: '采购需求',
        title: '需求发起变更改为撤销回草稿 + 需求确认合同改关键字搜索下拉',
        commit: '8c20495',
      },
    ],
  },

  // ============ 2026-10-15 ============
  {
    date: '2026-10-15',
    entries: [
      {
        type: 'feat', scope: '合同',
        title: '招采合约 23 页字段级功能操作说明 + 全状态闭合演示数据',
        commit: 'b597e33',
      },
    ],
  },

  // ============ 2026-10-13 ============
  {
    date: '2026-10-13',
    summary: '验收模块升级 + 构建修复',
    entries: [
      { type: 'feat', scope: '验收', title: '验收详情弹窗内容对等增强', commit: 'a0c8697' },
      {
        type: 'feat', scope: '验收',
        title: '验收单支持多附件上传',
        detail: '现场照片、盖章资料等多附件，支持批量上传 + 预览',
        commit: '3a1f429',
      },
      {
        type: 'feat', scope: '验收',
        title: '物资验收补齐仓库测试数据链路 + 服务验收合同信息扩充',
        commit: '339709a',
      },
      { type: 'fix', scope: '验收', title: '修复非物资类初验/终验单不显示合同明细信息', commit: '8844d43' },
      { type: 'fix', scope: '构建', title: '修复 accessor 非法 this 参数导致 CI tsc 构建失败（TS2784）', commit: '4e1094a' },
    ],
  },
];
