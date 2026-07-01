import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Workflow, ArrowRightLeft, Package, FileText, CheckSquare, Layers, RefreshCw, ZoomIn, ZoomOut, Download } from 'lucide-react';
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

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e`,
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
    end

    subgraph 调入部门
        direction TB
        C1[已调出待调入] --> C2[资产验收]
        C2 --> C3{是否确认?}
        C3 -->|确认| C4[调入确认]
        C3 -->|有异议| C5[沟通协商]
    end

    subgraph 仓库管理员
        direction TB
        D1[更新资产位置] --> D2[记录流水]
    end

    A4 ==> B1
    B4 ==> C1
    C4 ==> D1
    B5 --> END([流程结束])
    C5 --> B2
    D2 --> END

    style 申请人 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 调出部门 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 调入部门 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    style 仓库管理员 fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px`,
  },
  {
    key: 'purchase-inbound',
    title: '采购入库流程',
    description: '从采购计划到入库完成的完整流程',
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
    genInbound --> confirmIn[仓库确认入库]:::process
    confirmIn --> updateStock[更新库存数据]:::process
    updateStock --> archive[台账/归档]:::process
    archive --> done([完成]):::startEnd

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e`,
  },
  {
    key: 'asset-scrap',
    title: '资产报废报损流程',
    description: '固定资产报废和报损的审批流程',
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
    outConfirm --> writeOff[资产核销出库]:::process
    writeOff --> update[更新资产状态<br/>已报废/已报损]:::process
    update --> finance[财务做账]:::process
    finance --> done([完成]):::startEnd

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef status fill:#dbeafe,stroke:#3b82f6,stroke-width:1px,color:#1e40af
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e`,
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
    approve -->|通过| adjust[调整库存数量]:::process
    approve -->|驳回| fieldCheck
    adjust --> genAdjust[生成库存调整单]:::process
    genAdjust --> done([盘点完成]):::startEnd

    classDef startEnd fill:#e2e8f0,stroke:#475569,stroke-width:1px,color:#1e293b
    classDef process fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef decision fill:#ffffff,stroke:#64748b,stroke-width:1px,color:#1e293b
    classDef warn fill:#fef3c7,stroke:#f59e0b,stroke-width:1px,color:#92400e`,
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
];

export default function BusinessFlowChart() {
  const [activeKey, setActiveKey] = useState(flowCharts[0].key);
  const chartRef = useRef<HTMLDivElement>(null);
  const [mermaidKey, setMermaidKey] = useState(0);
  const [zoom, setZoom] = useState(1);

  const activeChart = flowCharts.find((c) => c.key === activeKey) || flowCharts[0];

  useEffect(() => {
    setZoom(1);
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
  }, [activeKey, mermaidKey, activeChart.code]);

  const handleRefresh = () => {
    setMermaidKey((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleDownload = () => {
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
  };

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
          <DefaultButton onClick={handleRefresh}>
            <RefreshCw size={16} />
            刷新
          </DefaultButton>
          <DefaultButton onClick={handleDownload}>
            <Download size={16} />
            下载
          </DefaultButton>
        </div>
      </div>

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
        </div>
      </div>
    </div>
  );
}
