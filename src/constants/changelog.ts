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
  // ============ 2026-10-26 ============
  {
    date: '2026-10-26',
    summary: '修复直接采购/电子商城采购 4 处税率文案错配',
    entries: [
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
