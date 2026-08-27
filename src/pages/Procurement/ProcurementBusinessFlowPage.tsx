import { useState } from 'react';
import {
  Calendar, FileText, Users, ClipboardCheck, DollarSign, Truck, Award,
  ArrowRight, Layers, Eye, ExternalLink, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  description: string;
  menuPath?: string;
  menuTitle?: string;
  color: string; // main color class
  bg: string;
  border: string;
  icon: any;
  steps: string[];
  result: string; // 产出物
  notes?: string;
}

interface SwimLane {
  id: string;
  laneTitle: string;
  laneColor: string;
  stages: Stage[];
}

const lanes: SwimLane[] = [
  {
    id: 'plan',
    laneTitle: '计划阶段',
    laneColor: '#409eff',
    stages: [
      {
        id: 'plan-flow',
        name: '采购业务流程',
        description: '查看全流程与菜单入口（本页）',
        color: 'text-[#409eff]',
        bg: 'bg-[#ecf5ff]',
        border: 'border-[#91c5ff]',
        icon: Eye,
        steps: ['了解各菜单功能与流转关系', '点击卡片快捷跳转到业务模块', '从左侧菜单进入对应业务'],
        result: '流程总览、快捷导航',
        notes: '本页面作为招采及合约管理的门户入口，对新员工友好',
      },
      {
        id: 'plan-mgmt',
        name: '招采计划管理',
        description: '编制年度/月度采购计划并完成审批',
        menuPath: '/procurement/plan',
        menuTitle: '招采计划管理',
        color: 'text-[#409eff]',
        bg: 'bg-[#ecf5ff]',
        border: 'border-[#91c5ff]',
        icon: Calendar,
        steps: ['新增计划并填报明细（物资、预算、采购方式等）', '提交部门负责人/管理层审批', '审批退回可修改后再提交', '审批通过的计划进入"已生效"'],
        result: '已生效采购计划（作为后续需求、订单的依据）',
      },
      {
        id: 'plan-summary',
        name: '采购计划汇总',
        description: '按部门/采购方式/期间等维度汇总计划',
        menuPath: '/procurement/plan-summary',
        menuTitle: '采购计划汇总',
        color: 'text-[#3dbd7d]',
        bg: 'bg-[#e8f7ee]',
        border: 'border-[#9edcb7]',
        icon: Layers,
        steps: ['选择汇总维度（部门、采购类型、期间等）', '查看统计图表与明细表格', '导出 CSV 供汇报使用'],
        result: '部门/期间/采购方式维度的计划汇总表',
      },
    ],
  },
  {
    id: 'demand',
    laneTitle: '需求与采购执行阶段',
    laneColor: '#fa8c16',
    stages: [
      {
        id: 'demand-apply',
        name: '采购需求申请',
        description: '由业务部门发起具体采购需求',
        menuPath: '/procurement/demand',
        menuTitle: '采购需求申请',
        color: 'text-[#fa8c16]',
        bg: 'bg-[#fff4e6]',
        border: 'border-[#ffc069]',
        icon: FileText,
        steps: ['发起需求申请，填写物资、规格、数量、预算', '独立创建需求，填写项目名称、申请部门等信息', '提交部门负责人审批 → 采购部复核', '审批通过后成为可生成采购订单的需求'],
        result: '已生效的需求申请单',
      },
      {
        id: 'workorder',
        name: '招采工单',
        description: '针对采购需求发起招标/竞价工单',
        menuPath: '/procurement/bidding',
        menuTitle: '招采工单',
        color: 'text-[#fa8c16]',
        bg: 'bg-[#fff4e6]',
        border: 'border-[#ffc069]',
        icon: ClipboardCheck,
        steps: ['从生效需求生成采购工单', '指定经办人、交货期限、采购方式', '组织询价/比价（对应报价单管理）', '记录评审过程与结果'],
        result: '已确认供应商与价格的采购工单',
      },
      {
        id: 'quote',
        name: '报价单',
        description: '供应商对采购工单的报价响应',
        menuPath: '/procurement/supplier-quote',
        menuTitle: '报价单',
        color: 'text-[#fa8c16]',
        bg: 'bg-[#fff4e6]',
        border: 'border-[#ffc069]',
        icon: DollarSign,
        steps: ['录入或导入供应商报价单（物资、数量、单价、税率、有效期）', '对多家供应商报价进行横向比价（含税价/不含税价对比）', '记录比价结论，确定中标供应商'],
        result: '供应商报价单库 + 比价结论',
      },
    ],
  },
  {
    id: 'contract',
    laneTitle: '合同与订单阶段',
    laneColor: '#722ed1',
    stages: [
      {
        id: 'website',
        name: '网站信息报送审核发布',
        description: '采购信息在公司/外部网站的审核与发布',
        menuPath: '/procurement/website-info',
        menuTitle: '网站信息报送审核发布',
        color: 'text-[#722ed1]',
        bg: 'bg-[#f9f0ff]',
        border: 'border-[#d3adf7]',
        icon: ExternalLink,
        steps: ['编制采购公告 / 中标公告等信息', '提交审核（内容合规性审核）', '审核通过后在网站发布', '记录发布时间与链接'],
        result: '已发布的采购公告/中标公告',
      },
      {
        id: 'contract-ledger',
        name: '合同台账管理',
        description: '合同档案登记、审批、执行与中止/终止',
        menuPath: '/procurement/contract',
        menuTitle: '合同台账管理',
        color: 'text-[#722ed1]',
        bg: 'bg-[#f9f0ff]',
        border: 'border-[#d3adf7]',
        icon: FileText,
        steps: ['新增合同（基本信息、金额、付款条件）并上传附件', '提交审批（采购部→法务→管理层）', '审批通过后合同正式"已生效"', '按节点执行付款、变更、中止或终止', '多维筛选+打印+导出CSV'],
        result: '完整的合同档案（含变更、付款、附件）',
      },
      {
        id: 'contract-order',
        name: '招采订单管理',
        description: '从需求/合同生成采购订单',
        menuPath: '/procurement/contract-purchase-order',
        menuTitle: '招采订单管理',
        color: 'text-[#722ed1]',
        bg: 'bg-[#f9f0ff]',
        border: 'border-[#d3adf7]',
        icon: Truck,
        steps: ['选择来源（框架合同 / 单次采购）', '从需求/合同带入明细与价格（锁定信息）', '录入交货地址、联系人、备注', '提交审批 → 审批通过 → 模拟发送给供应商', '如需变更：发起变更申请并重新审批，回写原订单'],
        result: '已发送/已完成/已取消的采购订单 + 变更历史',
      },
    ],
  },
  {
    id: 'fulfillment',
    laneTitle: '履约与验收阶段',
    laneColor: '#13c2c2',
    stages: [
      {
        id: 'inspection',
        name: '招采项目验收',
        description: '对到货物资进行验收',
        menuPath: '/procurement/inspection',
        menuTitle: '招采项目验收',
        color: 'text-[#13c2c2]',
        bg: 'bg-[#e6fffb]',
        border: 'border-[#87e8de]',
        icon: CheckCircle,
        steps: ['创建验收单（关联采购订单）', '登记入库数量、合格/不合格数量', '上传照片、检测报告等附件', '提交验收结论（通过 / 有条件通过 / 拒收）', '生成入库单入口'],
        result: '验收单 + 质量记录 + 入库凭据',
      },
      {
        id: 'supplier',
        name: '供应商管理',
        description: '供应商档案、资质、联系人维护与评级',
        menuPath: '/procurement/supplier',
        menuTitle: '供应商管理',
        color: 'text-[#13c2c2]',
        bg: 'bg-[#e6fffb]',
        border: 'border-[#87e8de]',
        icon: Users,
        steps: ['新增供应商档案（基础资料、联系方式、资质文件）', '定期更新资质有效期并进行风险提示', '依据报价、交期、质量等维度进行评级', '黑名单管理'],
        result: '规范的供应商档案与评级结果',
      },
    ],
  },
  {
    id: 'foundation',
    laneTitle: '基础配置与统计',
    laneColor: '#f5222d',
    stages: [
      {
        id: 'contract-template',
        name: '合同模板管理',
        description: '提供统一合同模板，避免重复制作',
        menuPath: '/procurement/contract-template',
        menuTitle: '合同模板管理',
        color: 'text-[#f5222d]',
        bg: 'bg-[#fff1f0]',
        border: 'border-[#ffa39e]',
        icon: FileText,
        steps: ['按采购类型（货物/服务/工程）维护模板', '上传合同模板文件并填写关键字段', '登记模板版本与启用状态', '创建合同选择对应模板'],
        result: '统一、可复用的合同模板库',
      },
      {
        id: 'approval-flow',
        name: '审批流程配置',
        description: '为各业务单据配置多级审批流程',
        menuPath: '/procurement/approval-flow',
        menuTitle: '审批流程配置',
        color: 'text-[#f5222d]',
        bg: 'bg-[#fff1f0]',
        border: 'border-[#ffa39e]',
        icon: ClipboardCheck,
        steps: ['选择单据类型（采购计划、需求申请、订单等）', '配置多级审批节点与审批人', '启用/禁用流程', '查看已配置流程列表'],
        result: '可被各业务模块调用的审批流程配置',
      },
    ],
  },
];

const legend = [
  { text: '已审批通过 / 完成态', color: '#52c41a', icon: CheckCircle },
  { text: '待审批 / 进行中', color: '#fa8c16', icon: AlertCircle },
  { text: '被驳回 / 已取消', color: '#f5222d', icon: XCircle },
];

export default function ProcurementBusinessFlowPage() {
  const [activeLane, setActiveLane] = useState<string | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  const activeStage = activeLane
    ? lanes.find((l) => l.id === activeLane)?.stages.find((s) => s.id === activeStageId) || null
    : null;

  return (
    <div className="p-4 space-y-4">
      {/* 顶部标题区 */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ebeef5]">
        <div className="flex items-center gap-2">
          <Award className="text-[#409eff]" size={20} />
          <h2 className="text-sm font-semibold text-[#303133]">采购业务流程</h2>
        </div>
        <div className="text-xs text-[#909399]">
          以下展示"招采及合约管理"模块各菜单组成的业务泳道图，可点击卡片查看详情与跳转至对应业务页面
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-6 text-xs text-[#606266] bg-[#fafafa] px-3 py-2 rounded border border-[#ebeef5]">
        <span className="font-medium text-[#303133]">状态图例：</span>
        {legend.map((l) => {
          const Icon = l.icon;
          return (
            <div key={l.text} className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: l.color }}></span>
              <span>{l.text}</span>
              <Icon size={12} style={{ color: l.color }} />
            </div>
          );
        })}
      </div>

      {/* 泳道图 */}
      <div className="space-y-6">
        {lanes.map((lane) => {
          const isActive = activeLane === lane.id;
          return (
            <div
              key={lane.id}
              className="rounded border-2 bg-white overflow-hidden transition-shadow"
              style={{ borderColor: lane.laneColor, boxShadow: isActive ? '0 6px 16px rgba(0,0,0,0.06)' : '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              {/* 泳道标题 */}
              <div
                className="flex items-center justify-between px-4 py-2 text-white cursor-pointer"
                style={{ background: lane.laneColor }}
                onClick={() => setActiveLane(isActive ? null : lane.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wide">{lane.laneTitle}</span>
                  <span className="text-xs opacity-80">
                    （{lane.stages.length} 个业务节点）
                  </span>
                </div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  {isActive ? '点击收起' : '点击展开'}
                  <ArrowRight
                    size={14}
                    style={{ transform: `rotate(${isActive ? 90 : 0}deg)`, transition: 'transform 0.2s' }}
                  />
                </div>
              </div>

              {/* 泳道内容：阶段卡片 */}
              {(isActive || activeLane === null) && (
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:flex-wrap md:items-stretch gap-3">
                    {lane.stages.map((stage, idx) => {
                      const IconCmp = stage.icon;
                      const isStageActive = activeStageId === stage.id;
                      return (
                        <div
                          key={stage.id}
                          className="relative flex-1 min-w-[280px] border rounded p-3 cursor-pointer transition-all"
                          style={{
                            borderColor: isStageActive ? '#409eff' : '#dcdfe6',
                            background: isStageActive ? '#f0f7ff' : stage.bg.replace('bg-[', '').replace(']', ''),
                            boxShadow: isStageActive ? '0 2px 8px rgba(64,158,255,0.2)' : 'none',
                          }}
                          onClick={() => setActiveStageId(isStageActive ? null : stage.id)}
                        >
                          {/* 阶段编号 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                                style={{ background: lane.laneColor }}
                              >
                                {idx + 1}
                              </div>
                              <div className={`text-sm font-semibold ${stage.color}`}>{stage.name}</div>
                            </div>
                            <IconCmp size={16} style={{ color: lane.laneColor }} />
                          </div>

                          <div className="text-xs text-[#606266] mt-2 leading-5">{stage.description}</div>

                          {/* 关键步骤（折叠时显示） */}
                          {!isStageActive && (
                            <div className="mt-2 pt-2 border-t border-[#f0f0f0] text-[11px] text-[#909399]">
                              点击查看详细步骤与产出物
                            </div>
                          )}

                          {/* 展开详细步骤 */}
                          {isStageActive && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-medium text-[#303133]">操作步骤：</div>
                              <ol className="space-y-1 pl-4 list-decimal text-xs text-[#606266]">
                                {stage.steps.map((step, i) => (
                                  <li key={i} className="leading-5">{step}</li>
                                ))}
                              </ol>
                              <div className="text-xs">
                                <span className="font-medium text-[#303133]">产出物：</span>
                                <span className="text-[#606266]">{stage.result}</span>
                              </div>
                              {stage.notes && (
                                <div className="text-xs text-[#fa8c16] bg-[#fff7e6] border border-[#ffe7ba] rounded px-2 py-1.5">
                                  提示：{stage.notes}
                                </div>
                              )}
                              {stage.menuPath && (
                                <div className="flex justify-end pt-2">
                                  <a
                                    href={stage.menuPath}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#409eff] text-white text-xs hover:opacity-90"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.location.hash = stage.menuPath!;
                                    }}
                                  >
                                    <span>前往"{stage.menuTitle}"</span>
                                    <ArrowRight size={12} />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 泳道内部箭头连接（可视化） */}
                  <div className="mt-4 flex items-center justify-center text-[#909399] text-[11px]">
                    {lane.stages.map((_, i) => (
                      <span key={i} className="flex items-center">
                        <span className="text-[#606266]">节点{i + 1}</span>
                        {i < lane.stages.length - 1 && <ArrowRight size={12} className="mx-1" />}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 总览大流程图（竖向） */}
      <div className="rounded border border-[#dcdfe6] bg-white p-4">
        <div className="text-sm font-semibold text-[#303133] mb-3">
          📊 总览：从"采购计划"到"验收入库"的整体业务链路
        </div>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 items-stretch">
          {lanes.flatMap((lane) => lane.stages).map((stage, idx, arr) => {
            const IconCmp = stage.icon;
            return (
              <div key={stage.id} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 border rounded px-3 py-2"
                  style={{ background: stage.bg.replace('bg-[', '').replace(']', ''), borderColor: '#dcdfe6' }}
                >
                  <IconCmp size={14} className={stage.color} />
                  <div className="text-xs">
                    <div className={`font-medium ${stage.color}`}>{idx + 1}. {stage.name}</div>
                    <div className="text-[#909399] text-[11px]">{stage.description}</div>
                  </div>
                </div>
                {idx < arr.length - 1 && <ArrowRight size={14} className="text-[#909399] mx-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 业务模块菜单清单 */}
      <div className="rounded border border-[#dcdfe6] bg-white p-4">
        <div className="text-sm font-semibold text-[#303133] mb-3">
          📋 招采及合约管理模块菜单清单
        </div>
        <table className="w-full text-xs">
          <thead className="bg-[#f5f7fa] text-[#606266]">
            <tr>
              <th className="px-3 py-2 text-left w-16">序号</th>
              <th className="px-3 py-2 text-left">菜单名称</th>
              <th className="px-3 py-2 text-left w-40">所属阶段</th>
              <th className="px-3 py-2 text-left">路径</th>
            </tr>
          </thead>
          <tbody>
            {[
              { title: '采购业务流程', path: '/procurement/business-flow', lane: '计划阶段（门户入口）' },
              { title: '招采计划', path: '/procurement/plan', lane: '计划阶段' },
              { title: '招采计划汇总', path: '/procurement/plan-summary', lane: '计划阶段' },
              { title: '招采需求申请管理', path: '/procurement/demand', lane: '需求与采购执行阶段' },
              { title: '招采工单', path: '/procurement/bidding', lane: '需求与采购执行阶段' },
              { title: '报价单', path: '/procurement/supplier-quote', lane: '需求与采购执行阶段' },
              { title: '网站信息报送审核发布', path: '/procurement/website-info', lane: '合同与订单阶段' },
              { title: '合同台账', path: '/procurement/contract', lane: '合同与订单阶段' },
              { title: '招采订单管理', path: '/procurement/contract-purchase-order', lane: '合同与订单阶段' },
              { title: '招采项目验收', path: '/procurement/inspection', lane: '履约与验收阶段' },
              { title: '供应商列表', path: '/procurement/supplier', lane: '履约与验收阶段' },
              { title: '合同文本管理', path: '/procurement/contract-template', lane: '基础配置与统计' },
              { title: '审批流程配置', path: '/procurement/approval-flow', lane: '基础配置与统计' },
            ].map((m, i) => (
              <tr key={m.path} className="border-t border-[#ebeef5] hover:bg-[#fafafa]">
                <td className="px-3 py-2 text-[#606266]">{i + 1}</td>
                <td className="px-3 py-2 text-[#303133] font-medium">{m.title}</td>
                <td className="px-3 py-2 text-[#606266]">{m.lane}</td>
                <td className="px-3 py-2 text-[#409eff]">{m.path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部说明 */}
      <div className="rounded border border-[#ffe7ba] bg-[#fff7e6] p-3 text-xs text-[#606266] leading-5">
        <div className="font-medium text-[#fa8c16] mb-1">业务流程说明：</div>
        <div>
          ① 计划阶段：通过"招采计划"编制年度/月度计划 → 审批后生效；通过"招采计划汇总"进行多维度统计。
        </div>
        <div>
          ② 需求与采购执行阶段：业务部门通过"招采需求申请管理"独立发起物资需求 → 采购部在"招采工单"中组织询价/比价 →
          "报价单"收集多家供应商报价并形成比价结论。
        </div>
        <div>
          ③ 合同与订单阶段：必要时通过"网站信息报送审核发布"发布采购公告 →
          "合同台账"登记合同并完成审批 → "招采订单管理"从需求/合同生成订单并发送供应商（支持变更与回写）。
        </div>
        <div>
          ④ 履约与验收阶段：供应商交货 → "招采项目验收"进行到货物资验收（可生成入库凭据） →
          全程由"供应商列表"维护供应商档案与评级。
        </div>
        <div>
          ⑤ 基础配置与统计：通过"合同文本管理"统一合同模板；"审批流程配置"为各业务模块配置审批节点。
        </div>
      </div>
    </div>
  );
}
