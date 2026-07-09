import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  Workflow, ArrowRightLeft, Package, FileText, CheckSquare, Layers, RefreshCw,
  ZoomIn, ZoomOut, Download, Network, GitBranch, Brain, Boxes, Database,
  ArrowDownToLine, ArrowUpFromLine, LayoutGrid, Settings, Users
} from 'lucide-react';
import { DefaultButton } from '@/components/common/Button';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#64748b',
    lineColor: '#475569',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#f1f5f9',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    noteBkgColor: '#fffbeb',
    noteBorderColor: '#f59e0b',
    noteTextColor: '#92400e',
    actorBorder: '#64748b',
    actorBkg: '#f8fafc',
    actorTextColor: '#1e293b',
    signalColor: '#475569',
    signalTextColor: '#1e293b',
    labelBoxBkgColor: '#fff',
    labelBoxBorderColor: '#64748b',
    labelBoxTextColor: '#1e293b',
    rectFill: '#ffffff',
    rectStroke: '#475569',
    rectFillOpacity: 1,
    rectStrokeWidth: '1px',
    decisionFill: '#ffffff',
    decisionStroke: '#475569',
    decisionFillOpacity: 1,
    diamondFill: '#ffffff',
    diamondStroke: '#475569',
    diamondFillOpacity: 1,
    terminalFill: '#e2e8f0',
    terminalStroke: '#475569',
    terminalFillOpacity: 1,
    subGraphFill: '#f8fafc',
    subGraphStroke: '#cbd5e1',
    subGraphTextColor: '#334155',
    subGraphTitleColor: '#334155',
    clusterBkg: '#f8fafc',
    clusterBorder: '#cbd5e1',
    altFill: '#fef3c7',
    altFillOpacity: 0.5,
  },
});

interface FlowChartItem {
  key: string;
  title: string;
  description: string;
  icon: any;
  type: 'flowchart' | 'swimlane';
  code: string;
}

interface SvgDiagramItem {
  key: string;
  title: string;
  description: string;
  icon: any;
  file: string;
  group: '业务流程图' | '架构与模型图';
}

const svgDiagrams: SvgDiagramItem[] = [
  { key: 'flow-warehouse', title: '仓库管理流程', description: '仓库与仓位管理业务流程', icon: Boxes, file: 'flow-warehouse.svg', group: '业务流程图' },
  { key: 'flow-inbound', title: '入库管理流程', description: '采购入库、自制入库、退库流程', icon: ArrowDownToLine, file: 'flow-inbound.svg', group: '业务流程图' },
  { key: 'flow-outbound', title: '出库管理流程', description: '领用、报废、报损出库流程', icon: ArrowUpFromLine, file: 'flow-outbound.svg', group: '业务流程图' },
  { key: 'flow-exhibition-transfer', title: '展会物资调拨流程', description: '展会调拨出库与入库流程', icon: ArrowRightLeft, file: 'flow-exhibition-transfer.svg', group: '业务流程图' },
  { key: 'flow-transfer', title: '仓库调拨流程', description: '仓库间调拨管理流程', icon: ArrowRightLeft, file: 'flow-transfer.svg', group: '业务流程图' },
  { key: 'flow-fixed-asset', title: '固定资产管理流程', description: '资产档案与生命周期流程', icon: LayoutGrid, file: 'flow-fixed-asset.svg', group: '业务流程图' },
  { key: 'flow-basic-data', title: '基础资料流程', description: '基础数据管理流程', icon: Settings, file: 'flow-basic-data.svg', group: '业务流程图' },
  { key: 'er-diagram', title: 'ER图（实体关系图）', description: '数据库实体关系图，含18个核心实体', icon: Database, file: 'er-diagram.svg', group: '架构与模型图' },
  { key: 'mindmap', title: '整体思维导图', description: '系统功能模块思维导图', icon: GitBranch, file: 'mindmap.svg', group: '架构与模型图' },
];

const flowCharts: FlowChartItem[] = [
  {
    key: 'requisition',
    title: '资产领用流程',
    description: '资产领用从申请到归还的完整业务流程',
    icon: Package,
    type: 'flowchart',
    code: `flowchart TD
    start([开始]):::startEnd --> apply[发起领用申请]:::process
    apply --> addr[填写使用地址]:::process
    addr --> selectAsset[选择在仓物资<br/>筛选固定资产仓库]:::process
    selectAsset --> whCount{仓库数量?}:::decision
    whCount -->|只有1个| autoWh[自动选中默认仓库]:::process
    whCount -->|多个| manualWh[手动选择仓库]:::process
    autoWh --> hasReturn{是否填预计归还日期?}:::decision
    manualWh --> hasReturn
    hasReturn -->|是| fillReturn[填写预计归还日期]:::process
    hasReturn -->|否| noReturn[不填写]:::process
    fillReturn --> submit[提交领用申请]:::process
    noReturn --> submit
    submit --> pending[待出库确认]:::status
    pending --> outConfirm[仓库管理员出库确认]:::process
    outConfirm --> inUse[状态: 已领用]:::status
    inUse --> checkExpiry{有预计归还日期<br/>且≤5天?}:::decision
    checkExpiry -->|是| remind[到期提醒通知]:::warn
    checkExpiry -->|否| quickReturn
    remind --> quickReturn[一键归还]:::process
    quickReturn --> genReturn[生成归还单<br/>待入库确认]:::status
    genReturn --> inConfirm[仓库管理员入库确认]:::process
    inConfirm --> done([完成]):::startEnd
    pending --> reverse[反确认]:::reversal
    inUse --> reverse
    reverse --> rollback[回滚状态到待审核]:::process
    rollback --> checkConfirmed{已确认单据?}:::decision
    checkConfirmed -->|是| rollbackStock[回滚库存+生成冲销流水]:::warn
    checkConfirmed -->|否| submit
    rollbackStock --> submit

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e
    classDef reversal fill:#fce7f3,stroke:#ec4899,stroke-width:1px,color:#be185d`,
  },
  {
    key: 'transfer',
    title: '资产调拨流程（泳道图）',
    description: '跨部门资产调拨的多角色协作流程',
    icon: ArrowRightLeft,
    type: 'swimlane',
    code: `flowchart LR
    subgraph 申请人
        direction TB
        A1[发起调拨申请] --> A2[选择资产和仓库]
        A2 --> A3[选择调出/调入部门]
        A3 --> A4[提交申请]
    end

    subgraph 调出部门
        direction TB
        B1[待调出确认] --> B2[审核调拨信息]
        B2 --> B3{是否同意?}
        B3 -->|同意| B4[调出确认]
        B3 -->|拒绝| B5[驳回申请]
        B4 --> B6{反确认?}
        B6 -->|是| B7[回滚状态到待审核]
        B6 -->|否| B8[流程继续]
    end

    subgraph 调入部门
        direction TB
        C1[已调出待调入] --> C2[资产验收]
        C2 --> C3{是否确认?}
        C3 -->|确认| C4[调入确认]
        C3 -->|有异议| C5[沟通协商]
        C4 --> C6{反确认?}
        C6 -->|是| C7[回滚状态到待审核]
        C6 -->|否| C8[流程继续]
    end

    subgraph 仓库管理员
        direction TB
        D1[更新资产位置] --> D2[记录流水]
    end

    A4 ==> B1
    B8 ==> C1
    C8 ==> D1
    B5 --> END([流程结束])
    C5 --> B2
    B7 --> A1
    C7 --> B4
    D2 --> END

    style 申请人 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 调出部门 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 调入部门 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 仓库管理员 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px`,
  },
  {
    key: 'purchase-inbound',
    title: '采购入库流程',
    description: '从采购计划到入库完成的完整流程，支持反确认',
    icon: Workflow,
    type: 'flowchart',
    code: `flowchart TD
    start([开始]):::startEnd --> plan[制定采购计划]:::process
    plan --> summary[采购计划汇总]:::process
    summary --> demand[采购需求申请]:::process
    demand --> approve1[部门审批]:::decision
    approve1 -->|通过| order[生成采购工单]:::process
    approve1 -->|驳回| start
    order --> quote[供应商报价]:::process
    quote --> bid[招标/比价]:::process
    bid --> supplier[确定供应商]:::process
    supplier --> contract[签订采购合同]:::process
    contract --> order2[生成采购订单]:::process
    order2 --> deliver[供应商发货]:::process
    deliver --> arrive[货物到达]:::status
    arrive --> inspect[验收管理]:::process
    inspect --> pass{验收合格?}:::decision
    pass -->|不合格| return[退换货处理]:::warn
    pass -->|合格| genInbound[生成入库单]:::process
    return --> deliver
    genInbound --> submit[提交审核]:::process
    submit --> pending[待审核]:::status
    pending --> confirmIn[仓库确认入库]:::process
    confirmIn --> confirmed[已确认]:::status
    confirmed --> updateStock[更新库存数据]:::process
    updateStock --> archive[台账/归档]:::process
    archive --> done([完成]):::startEnd
    pending --> reverse[反确认]:::reversal
    confirmed --> reverse
    reverse --> rollback[回滚状态到待审核]:::process
    rollback --> checkConfirmed{已确认单据?}:::decision
    checkConfirmed -->|是| rollbackStock[回滚库存+生成冲销流水]:::warn
    checkConfirmed -->|否| genInbound
    rollbackStock --> genInbound

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e
    classDef reversal fill:#fce7f3,stroke:#ec4899,stroke-width:1px,color:#be185d`,
  },
  {
    key: 'asset-scrap',
    title: '资产报废报损流程',
    description: '固定资产报废和报损的审批流程，支持反确认',
    icon: FileText,
    type: 'flowchart',
    code: `flowchart TD
    start([开始]):::startEnd --> apply[发起报废/报损申请]:::process
    apply --> select[选择在仓资产<br/>筛选固定资产仓库]:::process
    select --> reason[填写报废/报损原因]:::process
    reason --> upload[上传证明材料]:::process
    upload --> submit[提交申请]:::process
    submit --> pending[待审批]:::status
    pending --> level1[部门负责人审批]:::decision
    level1 -->|驳回| rejected[申请被驳回]:::warn
    level1 -->|通过| level2[上级部门审批]:::decision
    level2 -->|金额超限| level3[高层审批]:::decision
    level2 -->|通过| approved[审批通过]:::status
    level3 -->|通过| approved
    level3 -->|驳回| rejected
    approved --> pendingOut[待出库确认]:::status
    pendingOut --> outConfirm[仓库管理员出库确认]:::process
    outConfirm --> confirmed[已确认]:::status
    confirmed --> writeOff[资产核销出库]:::process
    writeOff --> update[更新资产状态<br/>已报废/已报损]:::process
    update --> finance[财务做账]:::process
    finance --> done([完成]):::startEnd
    pending --> reverse[反确认]:::reversal
    confirmed --> reverse
    reverse --> rollback[回滚状态到待审核]:::process
    rollback --> checkConfirmed{已确认单据?}:::decision
    checkConfirmed -->|是| rollbackStock[回滚库存+生成冲销流水]:::warn
    checkConfirmed -->|否| upload
    rollbackStock --> upload

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e
    classDef reversal fill:#fce7f3,stroke:#ec4899,stroke-width:1px,color:#be185d`,
  },
  {
    key: 'stock-check',
    title: '库存盘点流程',
    description: '定期库存盘点的作业流程',
    icon: CheckSquare,
    type: 'flowchart',
    code: `flowchart TD
    start([开始]):::startEnd --> create[创建盘点单]:::process
    create --> selectWh[选择盘点仓库]:::process
    selectWh --> selectRange[选择盘点范围<br/>全部/指定分类]:::process
    selectRange --> genTask[生成盘点任务]:::process
    genTask --> print[打印盘点表]:::process
    print --> fieldCheck[现场实物盘点]:::process
    fieldCheck --> inputQty[录入实盘数量]:::process
    inputQty --> compare[系统自动比对]:::process
    compare --> hasDiff{有差异?}:::decision
    hasDiff -->|有差异| diffReport[生成盘点差异表]:::warn
    hasDiff -->|无差异| approve[盘点审批]:::decision
    diffReport --> recheck[复盘确认]:::process
    recheck --> confirmed{差异确认?}:::decision
    confirmed -->|是| approve
    confirmed -->|否| fieldCheck
    approve -->|通过| pending[待确认]:::status
    approve -->|驳回| fieldCheck
    pending --> confirm[确认盘点结果]:::process
    confirm --> confirmedStatus[已确认]:::status
    confirmedStatus --> adjust[调整库存数量]:::process
    adjust --> genAdjust[生成库存调整单]:::process
    genAdjust --> done([盘点完成]):::startEnd
    pending --> reverse[反确认]:::reversal
    confirmedStatus --> reverse
    reverse --> rollback[回滚状态到待审核]:::process
    rollback --> checkConfirmed{已确认单据?}:::decision
    checkConfirmed -->|是| rollbackStock[回滚库存+生成冲销流水]:::warn
    checkConfirmed -->|否| inputQty
    rollbackStock --> inputQty

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e
    classDef reversal fill:#fce7f3,stroke:#ec4899,stroke-width:1px,color:#be185d`,
  },
  {
    key: 'asset-life',
    title: '资产生命周期全景（泳道图）',
    description: '固定资产从入库到报废的全生命周期',
    icon: Layers,
    type: 'swimlane',
    code: `flowchart LR
    subgraph 资产入库
        direction TB
        A1[资产采购] --> A2[验收入库]
        A2 --> A3[资产建档]
        A3 --> A4[贴资产标签]
    end

    subgraph 资产使用
        direction TB
        B1[资产领用] --> B2[使用中]
        B2 --> B3{到期提醒?}
        B3 -->|是| B4[归还/续借]
        B3 -->|否| B2
        B4 --> B5[归还入库]
        B5 --> B6[状态: 在仓]
    end

    subgraph 资产调拨
        direction TB
        C1[部门A使用] --> C2[调拨申请]
        C2 --> C3[调出确认]
        C3 --> C4[调入确认]
        C4 --> C5[部门B使用]
    end

    subgraph 资产维护
        direction TB
        D1[日常巡检] --> D2[发现问题]
        D2 --> D3[维修保养]
        D3 --> D4[恢复使用]
    end

    subgraph 资产报废
        direction TB
        E1[达到使用年限] --> E2[报废申请]
        E3[损坏无法修复] --> E4[报损申请]
        E2 --> E5[审批流程]
        E4 --> E5
        E5 --> E6[出库确认]
        E6 --> E7[资产核销]
    end

    A4 ==> B1
    B6 ==> C1
    B6 ==> D1
    D4 ==> B1
    B2 ==> E1
    C5 ==> E3

    style 资产入库 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 资产使用 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 资产调拨 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 资产维护 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 资产报废 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px`,
  },
  {
    key: 'inbound-sequence',
    title: '入库单确认序列图',
    description: '入库单从提交到确认的时间顺序交互流程，含反确认场景',
    icon: ArrowDownToLine,
    type: 'flowchart',
    code: `sequenceDiagram
    participant 用户 as 用户
    participant 系统 as 系统
    participant 仓库管理员 as 仓库管理员

    用户->>系统: 提交入库单(物资、数量、仓库)
    系统->>系统: 验证表单数据
    alt 验证通过
        系统->>系统: 保存入库单(状态:待审核)
        系统->>仓库管理员: 发送审核通知
        仓库管理员->>系统: 查看入库单详情
        仓库管理员->>系统: 确认入库
        系统->>系统: 更新库存数据
        系统->>系统: 生成库存流水
        系统-->>仓库管理员: 返回确认成功
        系统-->>用户: 推送入库完成通知
    else 验证失败
        系统-->>用户: 返回错误信息
    end

    opt 反确认操作
        仓库管理员->>系统: 执行反确认
        alt 已确认单据
            系统->>系统: 回滚库存数据
            系统->>系统: 生成冲销流水
            系统->>系统: 状态回退到待审核
        else 已提交单据
            系统->>系统: 状态回退到待审核
        end
        系统-->>仓库管理员: 返回反确认成功
    end`,
  },
  {
    key: 'use-case',
    title: '系统用例图',
    description: '仓库管理系统主要功能的用户视角视图',
    icon: Users,
    type: 'flowchart',
    code: `flowchart TD
    subgraph 系统边界
        UC1(提交入库单)
        UC2(确认入库)
        UC3(提交出库单)
        UC4(确认出库)
        UC5(查询库存)
        UC6(库存盘点)
        UC7(物资调拨)
        UC8(资产报废报损)
        UC9(反确认单据)
        UC10(打印单据)
        UC11(生成报表)
    end

    用户((用户))
    管理员((仓库管理员))
    财务((财务人员))

    用户 --> UC1
    用户 --> UC3
    用户 --> UC5
    用户 --> UC7
    用户 --> UC8
    用户 --> UC10
    管理员 --> UC2
    管理员 --> UC4
    管理员 --> UC6
    管理员 --> UC9
    管理员 --> UC10
    财务 --> UC5
    财务 --> UC11

    style 系统边界 stroke-dasharray: 5,5,stroke:#cbd5e1,fill:#f8fafc
    style 用户 fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style 管理员 fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style 财务 fill:#dbeafe,stroke:#3b82f6,stroke-width:2px`,
  },
  {
    key: 'state-machine',
    title: '单据状态机图',
    description: '入库单、出库单、调拨单的状态转换流程',
    icon: RefreshCw,
    type: 'flowchart',
    code: `stateDiagram-v2
    [*] --> 待审核: 创建单据
    待审核 --> 已提交: 用户提交
    已提交 --> 已确认: 管理员确认
    已确认 --> 已完成: 流程结束
    已提交 --> 待审核: 反确认(仅回滚状态)
    已确认 --> 待审核: 反确认(回滚库存+冲销流水)
    待审核 --> [*]: 删除单据
    已完成 --> [*]`,
  },
];

type TabKey = 'mermaid' | 'svg';

export default function BusinessFlowChart() {
  const [tab, setTab] = useState<TabKey>('svg');
  const [activeKey, setActiveKey] = useState(flowCharts[0].key);
  const [activeSvgKey, setActiveSvgKey] = useState(svgDiagrams[0].key);
  const chartRef = useRef<HTMLDivElement>(null);
  const [mermaidKey, setMermaidKey] = useState(0);
  const [zoom, setZoom] = useState(1);

  const activeChart = flowCharts.find((c) => c.key === activeKey) || flowCharts[0];
  const activeSvg = svgDiagrams.find((s) => s.key === activeSvgKey) || svgDiagrams[0];
  const svgUrl = `${import.meta.env.BASE_URL}diagrams/${activeSvg.file}`;

  useEffect(() => {
    setZoom(1);
  }, [tab, activeKey, activeSvgKey]);

  useEffect(() => {
    if (tab !== 'mermaid') return;
    const renderChart = async () => {
      if (chartRef.current) {
        try {
          const { svg } = await mermaid.render(`mermaid-${activeKey}-${mermaidKey}`, activeChart.code);
          chartRef.current.innerHTML = svg;
        } catch (e) {
          console.error('Mermaid render error:', e);
          chartRef.current.innerHTML = `<div class="text-slate-400 text-sm py-20">图表渲染失败，请刷新重试</div>`;
        }
      }
    };
    renderChart();
  }, [tab, activeKey, mermaidKey, activeChart.code]);

  const handleRefresh = () => {
    setMermaidKey((prev) => prev + 1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  const handleDownload = () => {
    if (tab === 'mermaid') {
      if (chartRef.current) {
        const svg = chartRef.current.querySelector('svg');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeChart.title}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } else {
      const a = document.createElement('a');
      a.href = svgUrl;
      a.download = `${activeSvg.title}.svg`;
      a.click();
    }
  };

  const businessFlowDiagrams = svgDiagrams.filter((d) => d.group === '业务流程图');
  const architectureDiagrams = svgDiagrams.filter((d) => d.group === '架构与模型图');

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">业务流程图</h2>
        <div className="flex items-center gap-2">
          <DefaultButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut size={16} />
          </DefaultButton>
          <span className="text-sm text-slate-500 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <DefaultButton onClick={handleZoomIn} disabled={zoom >= 2}>
            <ZoomIn size={16} />
          </DefaultButton>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          {tab === 'mermaid' && (
            <DefaultButton onClick={handleRefresh}>
              <RefreshCw size={16} />
              刷新
            </DefaultButton>
          )}
          <DefaultButton onClick={handleDownload}>
            <Download size={16} />
            下载
          </DefaultButton>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="mb-3 flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setTab('svg')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === 'svg'
              ? 'border-[#2f54eb] text-[#2f54eb]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Network size={14} className="inline mr-1" />
          系统图表（SVG）
        </button>
        <button
          onClick={() => setTab('mermaid')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === 'mermaid'
              ? 'border-[#2f54eb] text-[#2f54eb]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Workflow size={14} className="inline mr-1" />
          资产流程图（Mermaid）
        </button>
      </div>

      {tab === 'svg' ? (
        <>
          {/* SVG 图表分组选择 */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">业务流程图:</span>
              <div className="flex flex-wrap gap-1">
                {businessFlowDiagrams.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setActiveSvgKey(d.key)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all ${
                      activeSvgKey === d.key
                        ? 'bg-[#2f54eb] text-white border-[#2f54eb]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {d.title.replace('流程', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">架构与模型图:</span>
              <div className="flex flex-wrap gap-1">
                {architectureDiagrams.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setActiveSvgKey(d.key)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all ${
                      activeSvgKey === d.key
                        ? 'bg-[#2f54eb] text-white border-[#2f54eb]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {d.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 当前图表信息 */}
          <div className="mb-3 flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
              {activeSvg.icon && <activeSvg.icon size={16} />}
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#303133]">{activeSvg.title}</h3>
              <p className="text-xs text-[#909399]">{activeSvg.description}</p>
            </div>
          </div>

          {/* SVG 展示区域 */}
          <div
            className="overflow-auto bg-white border border-slate-200 rounded"
            style={{
              backgroundImage: `
                linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            <div
              className="min-h-[600px] flex items-start justify-center p-6"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            >
              <img
                src={svgUrl}
                alt={activeSvg.title}
                className="max-w-none"
                style={{ maxWidth: '1400px', width: 'auto' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-slate-400 text-sm py-20">SVG 图表加载失败: ${activeSvg.file}</div>`;
                  }
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mermaid 图表选择 */}
          <div className="mb-3 flex items-center gap-3">
            <div className="relative">
              <select
                value={activeKey}
                onChange={(e) => setActiveKey(e.target.value)}
                className="appearance-none h-8 pl-3 pr-8 border border-slate-200 rounded bg-white text-slate-700 text-sm cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
              >
                {flowCharts.map((chart) => (
                  <option key={chart.key} value={chart.key}>
                    {chart.title}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              {activeChart.type === 'swimlane' ? '泳道图' : '流程图'}
            </span>
          </div>

          <div className="mb-3 flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
              {activeChart.icon && <activeChart.icon size={16} />}
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#303133]">{activeChart.title}</h3>
              <p className="text-xs text-[#909399]">{activeChart.description}</p>
            </div>
          </div>

          <div
            className="overflow-auto bg-white border border-slate-200 rounded"
            style={{
              backgroundImage: `
                linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            <div
              ref={chartRef}
              key={mermaidKey}
              className="min-h-[600px] flex items-start justify-center p-6"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            ></div>
          </div>
        </>
      )}

      <div className="mt-3 py-3">
        <h3 className="text-sm font-medium text-[#303133] mb-2">图例说明</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 rounded-full bg-slate-200 border border-slate-500 flex items-center justify-center text-slate-800 text-xs">
              开始/结束
            </div>
            <span className="text-slate-600">起止节点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-white border border-slate-500 flex items-center justify-center text-slate-800 text-xs">
              处理步骤
            </div>
            <span className="text-slate-600">操作节点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white border border-slate-500 text-slate-800 text-xs flex items-center justify-center rotate-45">
              <span className="-rotate-45 text-[10px]">判断</span>
            </div>
            <span className="text-slate-600">条件分支</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-blue-100 border border-blue-500 flex items-center justify-center text-blue-800 text-xs">
              状态节点
            </div>
            <span className="text-slate-600">单据状态</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-amber-100 border border-amber-500 flex items-center justify-center text-amber-800 text-xs">
              提醒/异常
            </div>
            <span className="text-slate-600">注意事项</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-pink-100 border border-pink-500 flex items-center justify-center text-pink-800 text-xs">
              反确认
            </div>
            <span className="text-slate-600">撤销操作</span>
          </div>
        </div>
      </div>
    </div>
  );
}
