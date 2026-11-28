// ⚠️ 此文件由 scripts/gen-changelog.cjs 构建时自动生成（数据源：git log），请勿手改
// 生成时间：2026-11-28 12:54 · 统计范围：2026-10-12 起 · git 解析成功
import type { ChangeDay } from './changelog';

export const AUTO_CHANGELOG: ChangeDay[] = [
  {
    "date": "2026-11-27",
    "entries": [
      {
        "type": "feat",
        "scope": "合同",
        "title": "定标口径到合同全链路 — 每家中标供应商独立单价+是否含税开关定税率，合同自动带口径免勾明细",
        "commit": "7e5053f"
      }
    ]
  },
  {
    "date": "2026-11-26",
    "entries": [
      {
        "type": "fix",
        "scope": "供应商",
        "title": "中标供应商整单统一选 — 清单明细弹窗删除每行供应商列",
        "commit": "3e45e0c"
      },
      {
        "type": "feat",
        "scope": "采购需求",
        "title": "定标模型纠偏 — 需求级多中标+统一单价+签约口径(含税/不含税)",
        "commit": "0d9f50c"
      },
      {
        "type": "feat",
        "scope": "文档",
        "title": "变更记录页自动更新(构建时git log生成提交明细区) + 功能说明防过期护栏(落后自动亮黄条提醒)",
        "commit": "175c1cd"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "报价采纳改为明细级(单条物资粒度,partial部分采纳状态,整单状态自动推导) + 小程序端逐物资采纳徽章 + 回写只含已采纳明细 + 1126三端联动测试数据",
        "commit": "0e05ac0"
      },
      {
        "type": "feat",
        "scope": "合同",
        "title": "考核评价选合同口径从非草稿改为审核通过及以后(approved/active可考核,草稿/审批中/终止/到期拦截) + 帮助文档3处同步",
        "commit": "0e70b52"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采供应商改为档案搜索下拉选择(4处入口禁止手输+存supplierId+历史手填黄字提示+保存硬校验)",
        "commit": "b162430"
      },
      {
        "type": "feat",
        "scope": "合同",
        "title": "一合同一供应商硬约束(先选供应商自动全勾可签记录+他商禁用+保存硬校验+编辑历史数据兜底)",
        "commit": "3da5176"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "注入条件改为不足10条即重灌(免疫旧单条1125残留)",
        "commit": "02b53d3"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "1125测试数据扩至10条(生成器+完整链路) + App启动强制注入(无视persist缓存)",
        "commit": "ebddd23"
      }
    ]
  },
  {
    "date": "2026-11-25",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "合同按中标记录签约(明细x供应商展开行+勾选+已签约锁死+防重复校验) + 报价页移除删除按钮",
        "commit": "c8f9c12"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "1125测试数据(需求按明细多供应商定标→按明细签3份合同→同项目金额预警) + 合同表单/台账/预警增加所属项目",
        "commit": "c4399ee"
      },
      {
        "type": "feat",
        "scope": "采购需求",
        "title": "新增合同关联需求明细改为展示定标结果(中标供应商/单价/总价)，移除预算列",
        "commit": "4520eda"
      }
    ]
  },
  {
    "date": "2026-11-24",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采类合同新增供应商字段——选需求自动带出中标供应商(一份合同一个供应商)",
        "commit": "1f3208d"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "调拨出库基础信息区加展会项目+施工单位下拉 联动虚拟仓自动匹配 persist v28",
        "commit": "c946772"
      },
      {
        "type": "docs",
        "scope": "库存",
        "title": "调拨出库页面功能操作说明弹窗扩充父子组组合场景",
        "commit": "faf431b"
      },
      {
        "type": "feat",
        "scope": "构建",
        "title": "父子组组合规则多规格(A001电箱380V/400A+智能模块) persist v27",
        "commit": "46e9fd8"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "所有采购方式清单表格统一双价格列(预算审定+招采执行)+超预算红框+保存拦截",
        "commit": "2982ae6"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "线下录入类表格加复制+删除操作列 去掉新增条目按钮",
        "commit": "6fdc7c7"
      },
      {
        "type": "feat",
        "scope": "合同",
        "title": "新增合同表单生效时间(时分)+合同有效期(起止+长期开关) persist v26",
        "commit": "20d439e"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行清单明细拆预算审定+招采执行双价格列 + 复制按钮 + 执行价≤预算审定校验",
        "commit": "f346370"
      }
    ]
  },
  {
    "date": "2026-11-23",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "多供应商中标测试数据 BID-MULTI-001 目录内比价 3明细×3供应商 persist v25",
        "commit": "f7b6b07"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行明细多供应商中标 checkbox 操作入口 + changelog 同步 PL-01 及父子组工单联动",
        "commit": "505376b"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "父子组格式 -1/-2 仅用于电箱+智慧模块组合场景 普通同作业项工单改独立编码 persist v24",
        "commit": "18009d3"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "persist v23 注入父子组工单 + PRD803 智慧电箱 解决老用户看不到新工单",
        "commit": "f357b5c"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "调拨出库父子组工单联动选择 + 电箱智慧模块硬编码组合 + 同作业项多工单测试数据",
        "commit": "e54356e"
      },
      {
        "type": "feat",
        "scope": "合同",
        "title": "[PL-01] Wave 3 合同台账详情只读表 + 预警看板关联明细区块",
        "commit": "3ffa295"
      },
      {
        "type": "feat",
        "scope": "采购需求",
        "title": "[PL-01] Wave 3 — 需求申请页 4 种表格场景全部加合同关联状态 chip + 帮助手册补 3 条 detailLinks 说明",
        "commit": "68daed7"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "[PL-01] 招采执行多供应商报价展开 — 目录内比价物资清单每行可展开所有供应商报价 + MAX vs 预算 + 合同聚合状态",
        "commit": "13bdc89"
      },
      {
        "type": "feat",
        "scope": "合同",
        "title": "[PL-01] 数据层落地 — ContractLedger.detailLinks + persist v22 迁移 + 聚合工具 + 合同侧 2 页明细勾选",
        "commit": "10ae4ef"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "虚拟仓名称自动生成 默认展会名+施工单位 可手动编辑 支持恢复默认",
        "commit": "9100d38"
      }
    ]
  },
  {
    "date": "2026-11-20",
    "entries": [
      {
        "type": "refactor",
        "scope": "招采",
        "title": "新增场景4测试数据 - 相同作业项不同工单号 - 电箱220V室内 x3 / 音响调试 x2",
        "commit": "4088968"
      },
      {
        "type": "feat",
        "scope": "库存",
        "title": "作业项汇总改折叠抽屉 - 默认收起44px一行统计条 - 展开紧凑表格max-height滚动 - 状态圆点+未配+库存不足汇总",
        "commit": "8f37beb"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "作业项物资配置列表也去掉展会名称列",
        "commit": "2d12544"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "作业项物资配置弹窗去掉展会名称输入字段",
        "commit": "891ad29"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "工单物资配置结构重构 - 合并主辅表为单一products数组 - quantity改为ratio比例系数 - 调拨出库支持同作业项跨工单汇总 - v21 store migration",
        "commit": "4707a05"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "调拨出库领料页全屏改造 - 按工单作业项分组卡片 + 库存不足标记 + 空组追加物资",
        "commit": "261ec82"
      }
    ]
  },
  {
    "date": "2026-11-18",
    "entries": [
      {
        "type": "feat",
        "scope": "综合",
        "title": "全景预警提醒设置中心化 + 新增3种预警可配阈值",
        "commit": "1ce5baa"
      },
      {
        "type": "docs",
        "scope": "采购需求",
        "title": "修正成本审核适用范围为3种需求类型+帮助文案对齐实际规则",
        "commit": "6f051a7"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "多工单顶部卡片改多标签显示 + mock造4组重复作业项用于验证合并",
        "commit": "ae410b9"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "汇总板块简化为紧凑胶囊样式",
        "commit": "98004ca"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "展会调拨出库工单选择改造 - 作业项目汇总显示",
        "commit": "1cface4"
      },
      {
        "type": "fix",
        "scope": "采购需求",
        "title": "功能操作说明去除所有代码关键词(store/useMemo/英文枚举/函数名)，全部改为中文业务术语；生成采购订单规则修正为按需求类型(物资类)而非采购方式",
        "commit": "7d00e4f"
      }
    ]
  },
  {
    "date": "2026-11-17",
    "entries": [
      {
        "type": "fix",
        "scope": "合同",
        "title": "合同状态最终定型6种，删除invalid(已失效)/suspended(已暂停)死代码，类型定义同步修正",
        "commit": "ceb1eed"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "合同台账清除completed/suspended/returned/invalid(已作废)非法状态，统一以台账主页面7种状态为准",
        "commit": "cdfdcaa"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "合同台账删除非法completed状态 + 三个页面状态映射清理 + store v19迁移",
        "commit": "2eb0738"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "供应商报价模拟器输入不含税单价 + 去掉税额显示",
        "commit": "dc94397"
      }
    ]
  },
  {
    "date": "2026-11-16",
    "entries": [
      {
        "type": "feat",
        "scope": "综合",
        "title": "全景预警中心补 FeatureHelpButton + 完整功能说明",
        "commit": "936bf68"
      },
      {
        "type": "fix",
        "scope": "验收",
        "title": "验收表单硬编码文案修正，目录内比价→物资类任何采购方式",
        "commit": "ac3d7a7"
      },
      {
        "type": "feat",
        "scope": "合同",
        "title": "新增验收单始终显示关联合同区块",
        "commit": "de20949"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "任何采购方式的物资类工单都可生成采购订单",
        "commit": "74c6970"
      },
      {
        "type": "fix",
        "scope": "验收",
        "title": "验收表去掉审批意见和底部备注",
        "commit": "b34c59a"
      }
    ]
  },
  {
    "date": "2026-11-14",
    "entries": [
      {
        "type": "fix",
        "scope": "合同",
        "title": "合同台账去掉中标时间列及筛选",
        "commit": "e35b40d"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "合同台账仅草稿态允许删除",
        "commit": "57d1d2f"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "去掉验收审批Banner + 合同台账包含收支",
        "commit": "05d02a9"
      }
    ]
  },
  {
    "date": "2026-11-13",
    "entries": [
      {
        "type": "feat",
        "scope": "验收",
        "title": "验收模板驱动 + 可搜索下拉",
        "commit": "a4da75a"
      }
    ]
  },
  {
    "date": "2026-11-12",
    "entries": [
      {
        "type": "feat",
        "scope": "验收",
        "title": "服务/施工类验收新增通用验收表（贴合 Word 模板）+ 审批流程说明",
        "commit": "58a402d"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "考核管理下拉→多选勾 + 删除招采执行列表报价数/最低报价两列",
        "commit": "3f86ee8"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "Modal 弹窗闪烁 — 去掉双 rAF 嵌套 + 用 useRef 正确清理 timeout/raf",
        "commit": "f26c928"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "移除招采执行清单明细弹窗的3处移除按钮",
        "commit": "d3b7f1b"
      },
      {
        "type": "docs",
        "scope": "采购需求",
        "title": "需求确认管理补充合同归属决策规则（框架合同清单外/新增供应商目录三选项）",
        "commit": "52a0eb1"
      },
      {
        "type": "docs",
        "scope": "招采",
        "title": "招采模块 8 份业务流程图 SVG（9 种国企采购方式 + 招标时间交互规则）",
        "commit": "04ea9de"
      }
    ]
  },
  {
    "date": "2026-11-10",
    "entries": [
      {
        "type": "docs",
        "scope": "文档",
        "title": "新增变更记录 CHANGELOG.md",
        "commit": "7d2e837"
      }
    ]
  },
  {
    "date": "2026-11-09",
    "entries": [
      {
        "type": "docs",
        "scope": "综合",
        "title": "PRD 流程图替换为引用 SVG 文件，清理残留 ASCII 行",
        "commit": "eab6bfb"
      },
      {
        "type": "docs",
        "scope": "招采",
        "title": "新增目录内比价完整链路流程图 SVG（三栏：采购方后台+供应商小程序+报价管理页）",
        "commit": "0a1c947"
      },
      {
        "type": "docs",
        "scope": "招采",
        "title": "重写PRD，修复之前跳过报价管理页采纳→回写的错误",
        "commit": "43348a9"
      }
    ]
  },
  {
    "date": "2026-11-05",
    "entries": [
      {
        "type": "docs",
        "scope": "库存",
        "title": "changelog 补充库存快照功能",
        "commit": "be9b439"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "移除招采执行场景模板菜单、路由、面包屑（页面文件保留）",
        "commit": "3df12e2"
      },
      {
        "type": "docs",
        "scope": "库存",
        "title": "系统变更记录新增 2026-11-05 4 条（needContract三选/调拨出库/验收去初验/预算单价可编辑）",
        "commit": "8195e4f"
      },
      {
        "type": "feat",
        "scope": "库存",
        "title": "needContract三选一枚举(yes/no_link/no_none) + 调拨出库作业项合并表头与替换物资 + 调拨数量默认值min(50,可用库存)",
        "commit": "db4f076"
      }
    ]
  },
  {
    "date": "2026-11-03",
    "entries": [
      {
        "type": "fix",
        "scope": "综合",
        "title": "全局审批字段三处bug修复 — handleConfirmApprove写回 + 物资类表单绑定 + 空projectRows自动载体行",
        "commit": "da7b727"
      }
    ]
  },
  {
    "date": "2026-11-02",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "工单物资配置改名为作业项物资配置 + 作业项数据替换为配电箱220V 16A和吊点",
        "commit": "6fbab11"
      },
      {
        "type": "docs",
        "scope": "文档",
        "title": "变更记录补全 2026-10-26 ~ 2026-11-02 共 7 天 31 个 commit",
        "commit": "8dee12b"
      }
    ]
  },
  {
    "date": "2026-10-30",
    "entries": [
      {
        "type": "fix",
        "scope": "综合",
        "title": "功能说明文案全部对齐页面实际列数和列清单",
        "commit": "7399b5c"
      },
      {
        "type": "fix",
        "scope": "采购需求",
        "title": "采购需求场景 description 列数对齐 + newSupplier 真砍单价备注",
        "commit": "d23d9cc"
      },
      {
        "type": "fix",
        "scope": "采购需求",
        "title": "修复 random 方式关联采购需求条件 + linkDemand 开关",
        "commit": "f854d4b"
      }
    ]
  },
  {
    "date": "2026-10-29",
    "entries": [
      {
        "type": "fix",
        "scope": "综合",
        "title": "条件渲染改用 form.procurementMethod 跟随采购方式 select 变化",
        "commit": "ecffa24"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "FormInteractiveSection 完全复刻 CompetitiveBiddingPage 弹窗",
        "commit": "a3b8df7"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "删掉页面顶部 SceneTabs tab 切换按钮（Sidebar 已有）",
        "commit": "449159a"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "彻底对齐 CompetitiveBiddingPage 新增弹窗所有字段 + 修复路由切换报错",
        "commit": "7fdf46f"
      }
    ]
  },
  {
    "date": "2026-10-28",
    "entries": [
      {
        "type": "fix",
        "scope": "综合",
        "title": "逐字段对齐 CompetitiveBiddingPage 弹窗所有采购方式",
        "commit": "d20fa76"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "补全招采执行场景模板所有采购方式缺失字段",
        "commit": "d2f857d"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行场景模板改成可交互空表单原型",
        "commit": "2938be5"
      },
      {
        "type": "fix",
        "scope": "供应商",
        "title": "考核提醒逻辑解耦 — 绑定表删频率字段，全局补质保期评估类型",
        "commit": "8540f29"
      },
      {
        "type": "feat",
        "scope": "综合",
        "title": "场景模板复刻弹窗审批材料区块（7槽双列+流标+竞价评定结果）",
        "commit": "7f01f1b"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "招采执行场景模板全部9种采购方式补全表单字段并修复CRLF换行",
        "commit": "be1505c"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行场景模板补全所有采购方式的完整表单字段（对齐新增弹窗）",
        "commit": "0630562"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行/订单管理/验收三个 help 加顶部业务边界卡（businessSummary）+ FeatureHelpButton scope 支持换行",
        "commit": "91c775b"
      },
      {
        "type": "fix",
        "scope": "采购需求",
        "title": "help 文案对齐代码实际逻辑（仅 framework_catalog 生成采购订单，其余 10 种方式验收直接走需求明细兜底）+ 验收页无订单提示改绿色",
        "commit": "985f3a1"
      }
    ]
  },
  {
    "date": "2026-10-27",
    "entries": [
      {
        "type": "fix",
        "scope": "招采",
        "title": "所有 9 个 framework_catalog 工单补齐 biddingAnnouncement/biddingDocuments/totalPriceLimit + 版本号升到 3",
        "commit": "479a93c"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "版本号检测强制补齐 framework_catalog 工单新字段（localStorage 持久化旧数据不刷新根因）",
        "commit": "6abdddf"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "整单上限超限改为警告而非阻断（confirm 弹窗自选）",
        "commit": "ed4cced"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "submitQuote 加整单上限兜底校验",
        "commit": "547d58e"
      },
      {
        "type": "feat",
        "scope": "供应商",
        "title": "供应商模拟器补公告附件/比价文件附件/整单上限/供应商附件上传",
        "commit": "2ff6750"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "合同台账金额单位统一 + 线下流程必填校验 + direct/e_mall 必填对齐 + 合同自动编号",
        "commit": "0493f25"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "采购方式审批方式枚举值修正 + 竞价采购附件区块放开",
        "commit": "0216cec"
      }
    ]
  },
  {
    "date": "2026-10-26",
    "entries": [
      {
        "type": "fix",
        "scope": "招采",
        "title": "直接/电子商城排除招采类合同 + 采购计划需求部门上移 + 隐藏审批批注按钮",
        "commit": "ef4a2bb"
      },
      {
        "type": "fix",
        "scope": "招采",
        "title": "直接采购/电子商城 4 处税率文案错配修复 + 招采场景模板/changelog/供应商模拟器一系列改进",
        "commit": "d33dc46"
      }
    ]
  },
  {
    "date": "2026-10-24",
    "entries": [
      {
        "type": "fix",
        "scope": "采购需求",
        "title": "需求场景模板 URL 解析修复, slug / 替换成 - 匹配 SCENE_MOCKS key",
        "commit": "f021abf"
      },
      {
        "type": "feat",
        "scope": "采购需求",
        "title": "物资/服务审批→档案自动打通 + 14种需求场景模板演示",
        "commit": "129a760"
      }
    ]
  },
  {
    "date": "2026-10-22",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采计划月度计划表——采购方式必填校验 + 佐证资料改为附件上传",
        "commit": "7b717f8"
      },
      {
        "type": "feat",
        "scope": "综合",
        "title": "物资申请导入强校验 + 重复物资模糊检测弹窗",
        "commit": "1f1254e"
      },
      {
        "type": "feat",
        "scope": "综合",
        "title": "物资申请明细加类别字段 + 审批通过自动生成物资档案",
        "commit": "a5d3625"
      }
    ]
  },
  {
    "date": "2026-10-21",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "电子商城采购升级（清单单价备注列 + 不进入招采合同签订）",
        "commit": "cec0c5d"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行全采购方式升级（业主代表/报名单位/答疑/审批材料/目录内比价保存校验）",
        "commit": "0503a46"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "业主代表输入框联动是否委派业主评委（选否时隐藏）",
        "commit": "92e85cc"
      },
      {
        "type": "fix",
        "scope": "综合",
        "title": "采购计划表头分组 新增中间段 招标采购准备阶段（佐证资料+采购方式移出招标采购阶段）",
        "commit": "2a5e81e"
      },
      {
        "type": "feat",
        "scope": "供应商",
        "title": "供应商账号管理（管理员新增/删/启禁/重置密码，账号无自助改密）",
        "commit": "fd0422c"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "自办展与合办展合同表单删除履约评价/考核管理/年度评价3字段",
        "commit": "9c97603"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采流程管理自由审批 + 调拨还库 + 合同模板按钮门控 + CompetitiveBidding完善",
        "commit": "ce1df9d"
      }
    ]
  },
  {
    "date": "2026-10-20",
    "entries": [
      {
        "type": "feat",
        "scope": "采购需求",
        "title": "采购需求申请 — 申请事由门控(施工→仅新供应商)+ 必填校验 + outside工程货物加2列 + new_supplier删2列",
        "commit": "a8aea42"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采计划月报表盘更新 — 项目类别5类收敛 + 新增佐证资料/采购方式/备注3列 + CSV同步",
        "commit": "c5df5e8"
      }
    ]
  },
  {
    "date": "2026-10-19",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行答疑门控改造 — 选是显示说明字段; 流标保持已有门控",
        "commit": "2b77fe6"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采执行三字段改造 — 项目实施单位下拉部门、招标代理机构门控Radio、业主代表多值数组",
        "commit": "766a1b7"
      },
      {
        "type": "feat",
        "scope": "综合",
        "title": "询比采购拆为公开/邀请两种，共 11 种采购方式",
        "commit": "21d387d"
      },
      {
        "type": "feat",
        "scope": "采购需求",
        "title": "自办展与合办展合同表单去掉关联采购需求和中标时间",
        "commit": "f5bc5c0"
      },
      {
        "type": "docs",
        "scope": "招采",
        "title": "招采需求申请+招采执行操作说明穷举所有组合字段",
        "commit": "9ba1671"
      },
      {
        "type": "fix",
        "scope": "库存",
        "title": "修复调拨出库页面projects store字段名错误导致白屏",
        "commit": "8e5984c"
      },
      {
        "type": "feat",
        "scope": "库存",
        "title": "调拨单明细加备注字段 + 调拨出库加所属展会筛选",
        "commit": "67ee7b1"
      }
    ]
  },
  {
    "date": "2026-10-16",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采合约23页功能操作说明新增逐操作清单（操作/可用条件/说明/做完后影响）",
        "commit": "16d1d2b"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采需求发起变更改为撤销回草稿 + 需求确认合同改关键字搜索下拉",
        "commit": "8c20495"
      }
    ]
  },
  {
    "date": "2026-10-15",
    "entries": [
      {
        "type": "feat",
        "scope": "招采",
        "title": "招采合约23页字段级功能操作说明 + 全状态闭合演示数据",
        "commit": "b597e33"
      }
    ]
  },
  {
    "date": "2026-10-13",
    "entries": [
      {
        "type": "feat",
        "scope": "验收",
        "title": "验收详情弹窗内容对等增强",
        "commit": "a0c8697"
      },
      {
        "type": "feat",
        "scope": "验收",
        "title": "验收单支持多附件上传（现场照片/盖章资料）",
        "commit": "3a1f429"
      },
      {
        "type": "fix",
        "scope": "合同",
        "title": "修复非物资类初验/终验单不显示合同明细信息",
        "commit": "8844d43"
      },
      {
        "type": "feat",
        "scope": "招采",
        "title": "物资验收补齐仓库测试数据链路 + 服务验收合同信息扩充",
        "commit": "339709a"
      }
    ]
  }
];

export const AUTO_GENERATED_AT = '2026-11-28 12:54';

// 功能说明防过期护栏：构建时检测「最近触碰页面代码的功能提交」是否晚于 procurementHelp.ts 最后更新
export const HELP_STALE = {
  "stale": true,
  "count": 1,
  "commits": [
    "2026-11-27 定标口径到合同全链路 — 每家中标供应商独立单价+是否含税开关定税率，合同自动带口径免勾明细"
  ],
  "helpDate": "2026-11-26"
};
