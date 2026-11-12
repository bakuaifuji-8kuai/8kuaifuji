// 生成 8 份招采模块业务流程图 SVG（9 种国企采购方式版）
const fs = require('fs');

const base = 'd:/会展仓库项目/docs/';

function writeFile(name, content) {
    fs.writeFileSync(base + name, content, 'utf-8');
    console.log('✅ ' + name);
}

const defs = `<defs>
    <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#475569"/></marker>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000018"/></filter>
  </defs>`;

// ============ 总体业务流程图 ============
function genOverall() {
const L = [];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1060" width="1400" height="1060">');
L.push(defs);
L.push('    <linearGradient id="g-plan" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>');
L.push('    <linearGradient id="g-demand" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient>');
L.push('    <linearGradient id="g-bid" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f97316"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>');
L.push('    <linearGradient id="g-contract" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient>');
L.push('    <linearGradient id="g-order" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>');
L.push('    <marker id="arrow-indigo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1"/></marker>');
L.push('    <marker id="arrow-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6"/></marker>');
L.push('  </defs>');
L.push('  <rect width="1400" height="1060" fill="#f8fafc"/>');
L.push('  <text x="700" y="46" text-anchor="middle" font-size="22" font-weight="700" fill="#1e293b" font-family="sans-serif">招采模块 · 总体业务流程图</text>');
L.push('  <text x="700" y="72" text-anchor="middle" font-size="13" fill="#64748b" font-family="sans-serif">9 种国企采购方式 · 1 种自动订单 + 8 种走合同 CPO · 合同与订单解耦</text>');

// 阶段①计划
L.push('  <rect x="40" y="96" width="1320" height="108" rx="14" fill="#eff6ff" stroke="#bfdbfe" stroke-dasharray="6,3"/>');
L.push('  <rect x="40" y="96" width="120" height="28" rx="6" fill="url(#g-plan)"/>');
L.push('  <text x="100" y="115" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">① 计划管理（独立）</text>');
[ [190,190,'招采计划（月度/年度）'],[430,200,'招采计划汇总'],[680,180,'计划审批/归档'] ].forEach(([x,w,t])=>{
  L.push(`  <rect x="${x}" y="146" width="${w}" height="44" rx="8" fill="#fff" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+w/2}" y="173" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="600" font-family="sans-serif">${t}</text>`);
});
L.push('  <line x1="380" y1="168" x2="430" y2="168" stroke="#3b82f6" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <line x1="630" y1="168" x2="680" y2="168" stroke="#3b82f6" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <line x1="860" y1="190" x2="860" y2="250" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow)"/>');
L.push('  <text x="872" y="226" font-size="11" fill="#64748b" font-family="sans-serif">可选参考</text>');

// 阶段②需求
L.push('  <rect x="40" y="222" width="1320" height="108" rx="14" fill="#eef2ff" stroke="#c7d2fe" stroke-dasharray="6,3"/>');
L.push('  <rect x="40" y="222" width="120" height="28" rx="6" fill="url(#g-demand)"/>');
L.push('  <text x="100" y="241" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">② 需求管理</text>');
[ [170,260,'需求申请（3 种入口）'],[500,200,'需求确认'],[760,200,'需求台账'] ].forEach(([x,w,t])=>{
  L.push(`  <rect x="${x}" y="272" width="${w}" height="44" rx="8" fill="#fff" stroke="#6366f1" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+w/2}" y="299" text-anchor="middle" font-size="13" fill="#4338ca" font-weight="600" font-family="sans-serif">${t}</text>`);
});
L.push('  <line x1="430" y1="294" x2="500" y2="294" stroke="#6366f1" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <line x1="700" y1="294" x2="760" y2="294" stroke="#6366f1" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <path d="M 890,316 L 890,370 L 420,370 L 420,400" stroke="#6366f1" stroke-width="2.2" fill="none" marker-end="url(#arrow-indigo)"/>');

// 阶段③招采执行（9 种国企采购方式）
L.push('  <rect x="40" y="398" width="980" height="230" rx="14" fill="#fff7ed" stroke="#fed7aa" stroke-dasharray="6,3"/>');
L.push('  <rect x="40" y="398" width="140" height="28" rx="6" fill="url(#g-bid)"/>');
L.push('  <text x="110" y="417" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">③ 招采执行（9 种国企）</text>');
// 工单主框
L.push('  <rect x="190" y="440" width="280" height="78" rx="8" fill="#fff" stroke="#f97316" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="330" y="465" text-anchor="middle" font-size="13" font-weight="700" fill="#c2410c" font-family="sans-serif">招采工单（9 状态机）</text>');
L.push('  <text x="330" y="483" text-anchor="middle" font-size="11" fill="#64748b" font-family="sans-serif">draft → 审核 → 发布 → 招标中 → 评审 → 完成</text>');
L.push('  <text x="330" y="499" text-anchor="middle" font-size="10" fill="#ea580c" font-family="sans-serif">🕐 发布前必设招标时间 · 截止前可反复修改</text>');
L.push('  <line x1="470" y1="470" x2="488" y2="470" stroke="#f97316" stroke-width="1.8" marker-end="url(#arrow)"/>');

// ===== 9 种采购方式（2 行）=====
// 第一行：目录内比价（唯一线上 + 自动订单）高亮金标
L.push('  <rect x="488" y="432" width="140" height="78" rx="8" fill="#fff" stroke="#ea580c" stroke-width="2.2" filter="url(#shadow)"/>');
L.push('  <rect x="488" y="432" width="140" height="20" rx="8" fill="#ea580c"/>');
L.push('  <rect x="488" y="445" width="140" height="7" fill="#ea580c"/>');
L.push('  <text x="558" y="447" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="sans-serif">⭐ 唯一线上报价</text>');
L.push('  <text x="558" y="472" text-anchor="middle" font-size="11.5" fill="#c2410c" font-weight="700" font-family="sans-serif">框架协议采购</text>');
L.push('  <text x="558" y="488" text-anchor="middle" font-size="11.5" fill="#c2410c" font-weight="700" font-family="sans-serif">- 目录内比价</text>');
L.push('  <text x="558" y="505" text-anchor="middle" font-size="10" fill="#ea580c" font-weight="600" font-family="sans-serif">→ 自动生成 ProcurementOrder</text>');

// 第二行：其他 8 种线下（2 列 × 4 行）
const offlineMethods = [
  ['框架协议采购-随机抽取','framework_random'],
  ['询比采购-公开','inquiry_open'],
  ['询比采购-邀请','inquiry_invited'],
  ['竞价采购','competitive_bidding'],
  ['谈判采购-公开','negotiation_open'],
  ['谈判采购-邀请','negotiation_invited'],
  ['直接采购','direct'],
  ['电子商城采购','e_mall'],
];
const gridStartX = 650, gridStartY = 432, cellW = 110, cellH = 32, gapX = 6;
L.push('  <text x="780" y="426" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">（8 种线下录入，完成后走合同）</text>');
for (let i = 0; i < offlineMethods.length; i++) {
  const [label] = offlineMethods[i];
  const col = i % 4;
  const row = Math.floor(i / 4);
  const x = gridStartX + col * (cellW + gapX);
  const y = gridStartY + row * (cellH + 4);
  L.push(`  <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="5" fill="#fff" stroke="#f97316" stroke-width="1.1"/>`);
  // 长名称截断适配
  const display = label.length > 9 ? label.slice(0, 8) + '…' : label;
  L.push(`  <text x="${x+cellW/2}" y="${y+21}" text-anchor="middle" font-size="10.5" fill="#9a3412" font-weight="600" font-family="sans-serif">${display}</text>`);
}

// ===== 分支：1 种自动订单 → 阶段⑤左路；8 种 → 合同 → CPO =====
L.push('  <path d="M 558,535 L 558,600 L 260,600 L 260,640" stroke="#8b5cf6" stroke-width="2.5" fill="none" marker-end="url(#arrow-purple)"/>');
L.push('  <text x="380" y="592" font-size="11" fill="#7c3aed" font-weight="700" font-family="sans-serif">目录内比价 → 自动 ProcurementOrder</text>');

L.push('  <path d="M 880,500 L 880,600 L 420,600 L 420,640" stroke="#059669" stroke-width="2" fill="none" marker-end="url(#arrow)"/>');
L.push('  <text x="560" y="592" font-size="11" fill="#047857" font-weight="700" font-family="sans-serif">其余 8 种线下 → 完成 → 进入合同</text>');

// 阶段④合同
L.push('  <rect x="40" y="638" width="1320" height="110" rx="14" fill="#ecfdf5" stroke="#a7f3d0" stroke-dasharray="6,3"/>');
L.push('  <rect x="40" y="638" width="130" height="28" rx="6" fill="url(#g-contract)"/>');
L.push('  <text x="105" y="657" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">④ 合同管理（3 类并行）</text>');
const cnodes=[ [180,140,'合同模版'],[360,160,'合同录入（3 类）'],[550,130,'合同审批'],[730,130,'合同台账'],[910,130,'合同归档'],[1090,110,'履约评估'] ];
for (const [x,w,t] of cnodes) {
  L.push(`  <rect x="${x}" y="688" width="${w}" height="44" rx="8" fill="#fff" stroke="#10b981" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+w/2}" y="715" text-anchor="middle" font-size="12.5" fill="#047857" font-weight="600" font-family="sans-serif">${t}</text>`);
}
for (let i=0;i<cnodes.length-1;i++){
  const xl=cnodes[i][0]+cnodes[i][1], xr=cnodes[i+1][0];
  L.push(`  <line x1="${xl}" y1="710" x2="${xr}" y2="710" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>`);
}
// CPO 手动下单从合同台账出发
L.push('  <path d="M 950,732 L 950,790 L 620,790 L 620,820" stroke="#10b981" stroke-width="2" fill="none" marker-end="url(#arrow)"/>');
L.push('  <rect x="960" y="745" width="130" height="24" rx="4" fill="#ecfdf5" stroke="#10b981"/>');
L.push('  <text x="1025" y="762" text-anchor="middle" font-size="10" fill="#047857" font-family="sans-serif">CPO 手动下单（通用）</text>');

// 阶段⑤订单 → 入库 → 验收
L.push('  <rect x="40" y="820" width="1320" height="115" rx="14" fill="#f5f3ff" stroke="#ddd6fe" stroke-dasharray="6,3"/>');
L.push('  <rect x="40" y="820" width="180" height="28" rx="6" fill="url(#g-order)"/>');
L.push('  <text x="130" y="839" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">⑤ 订单 → 入库 → 验收</text>');
// 两路订单源
L.push('  <rect x="240" y="860" width="160" height="55" rx="8" fill="#fff" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="320" y="882" text-anchor="middle" font-size="12" fill="#6d28d9" font-weight="700" font-family="sans-serif">ProcurementOrder</text>');
L.push('  <text x="320" y="897" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">仅目录内比价自动生成</text>');
L.push('  <rect x="420" y="860" width="160" height="55" rx="8" fill="#fff" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="500" y="882" text-anchor="middle" font-size="12" fill="#6d28d9" font-weight="700" font-family="sans-serif">CPO 合同下单</text>');
L.push('  <text x="500" y="897" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">8 种线下 + 非招采合同通用</text>');
// 合并后链路
L.push('  <path d="M 400,888 L 430,888" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#arrow-purple)"/>');
L.push('  <path d="M 580,888 L 610,888" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#arrow-purple)"/>');
L.push('  <rect x="610" y="860" width="170" height="55" rx="8" fill="#fff" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="695" y="882" text-anchor="middle" font-size="12" fill="#6d28d9" font-weight="700" font-family="sans-serif">仓库采购入库</text>');
L.push('  <text x="695" y="897" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">跨模块对接</text>');
L.push('  <line x1="780" y1="888" x2="810" y2="888" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#arrow-purple)"/>');
L.push('  <rect x="810" y="860" width="160" height="55" rx="8" fill="#fff" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="890" y="882" text-anchor="middle" font-size="12" fill="#6d28d9" font-weight="700" font-family="sans-serif">验收</text>');
L.push('  <text x="890" y="897" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">有订单核对订单明细</text>');
L.push('  <line x1="970" y1="888" x2="1000" y2="888" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#arrow-purple)"/>');
L.push('  <rect x="1000" y="860" width="160" height="55" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>');
L.push('  <text x="1080" y="882" text-anchor="middle" font-size="12" fill="#047857" font-weight="700" font-family="sans-serif">合同履约回写</text>');
L.push('  <text x="1080" y="897" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">自动更新履约进度</text>');

// 右侧支撑（下移）
L.push('  <rect x="1060" y="96" width="300" height="290" rx="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="6,3"/>');
L.push('  <text x="1210" y="120" text-anchor="middle" font-size="12.5" font-weight="700" fill="#475569" font-family="sans-serif">支撑体系</text>');
const supports = [
  ['供应商管理','入驻→分类→考核模版→执行→记录→分级 S/A/B/C',135],
  ['审批流配置 & 实例','节点/条件/驳回/超时 → 实例流转可视化',210],
  ['招采预警看板（7 种）','①需求超期 ②工单超期 ③报价未收齐\n④合同到期 ⑤履约缺失 ⑥订单超量 ⑦报价异常',285],
];
for (const [t,d,y] of supports){
  L.push(`  <rect x="1075" y="${y}" width="270" height="58" rx="8" fill="#fff" stroke="#94a3b8" stroke-width="1.2"/>`);
  L.push(`  <text x="1210" y="${y+22}" text-anchor="middle" font-size="12" font-weight="700" fill="#334155" font-family="sans-serif">${t}</text>`);
  d.split('\n').forEach((line, j) => {
    L.push(`  <text x="1210" y="${y+40+j*14}" text-anchor="middle" font-size="10" fill="#64748b" font-family="sans-serif">${line}</text>`);
  });
}

// 图例
L.push('  <rect x="40" y="975" width="1320" height="30" rx="6" fill="#fff" stroke="#e2e8f0"/>');
const leg=[ ['url(#g-plan)','计划（独立）'],['url(#g-demand)','需求'],['url(#g-bid)','招采执行（9 种）'],['url(#g-contract)','合同（3 类）'],['url(#g-order)','订单→入库→验收'] ];
let lx=56;
for (const [fill,lbl] of leg){
  L.push(`  <rect x="${lx}" y="983" width="14" height="14" rx="3" fill="${fill}"/>`);
  L.push(`  <text x="${lx+22}" y="995" font-size="11" fill="#475569" font-family="sans-serif">${lbl}</text>`);
  lx += 14 + 110;
}
L.push('  <rect x="900" y="983" width="14" height="14" rx="3" fill="#ea580c"/>');
L.push('  <text x="918" y="995" font-size="11" fill="#475569" font-family="sans-serif">⭐ 唯一线上 → 自动 ProcurementOrder</text>');
L.push('  <rect x="1140" y="983" width="14" height="14" rx="3" fill="#f97316" opacity="0.5"/>');
L.push('  <text x="1158" y="995" font-size="11" fill="#475569" font-family="sans-serif">8 种线下 → 合同 → CPO</text>');

L.push('</svg>');
writeFile('招采模块_总体业务流程图.svg', L.join('\n'));
}

// ============ 计划管理 ============
function genPlan(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 580" width="1200" height="580">');
L.push(defs);
L.push('  <rect width="1200" height="580" fill="#f8fafc"/>');
L.push('  <text x="600" y="44" text-anchor="middle" font-size="20" font-weight="700" fill="#1e293b" font-family="sans-serif">招采计划 · 业务流程图</text>');
L.push('  <text x="600" y="66" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">独立模块 · 与招采需求无强制串联 · 仅作可选参考</text>');
L.push('  <text x="600" y="115" text-anchor="middle" font-size="13" font-weight="700" fill="#1e40af" font-family="sans-serif">招采计划（两种类型）</text>');
L.push('  <rect x="340" y="130" width="160" height="50" rx="8" fill="#fff" stroke="#3b82f6" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="420" y="153" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="700" font-family="sans-serif">月度招采计划</text>');
L.push('  <text x="420" y="170" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">按月滚动编制</text>');
L.push('  <rect x="700" y="130" width="160" height="50" rx="8" fill="#fff" stroke="#3b82f6" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="780" y="153" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="700" font-family="sans-serif">年度招采计划</text>');
L.push('  <text x="780" y="170" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">全年统筹安排</text>');
L.push('  <line x1="500" y1="155" x2="600" y2="210" stroke="#3b82f6" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <line x1="700" y1="155" x2="600" y2="210" stroke="#3b82f6" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <rect x="510" y="210" width="180" height="50" rx="8" fill="#fff" stroke="#3b82f6" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="600" y="233" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="700" font-family="sans-serif">招采计划汇总</text>');
L.push('  <text x="600" y="250" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">自动统计各期计划数据</text>');
L.push('  <line x1="600" y1="260" x2="600" y2="295" stroke="#3b82f6" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <polygon points="600,295 660,325 600,355 540,325" fill="#fff" stroke="#3b82f6" stroke-width="1.8"/>');
L.push('  <text x="600" y="329" text-anchor="middle" font-size="12" font-weight="700" fill="#1e40af" font-family="sans-serif">审批？</text>');
L.push('  <line x1="660" y1="325" x2="850" y2="325" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="740" y="319" font-size="11" fill="#10b981" font-weight="600" font-family="sans-serif">通过</text>');
L.push('  <line x1="540" y1="325" x2="350" y2="325" stroke="#ef4444" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="420" y="319" font-size="11" fill="#ef4444" font-weight="600" font-family="sans-serif">驳回</text>');
L.push('  <rect x="850" y="300" width="160" height="50" rx="8" fill="#fff" stroke="#10b981" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="930" y="323" text-anchor="middle" font-size="13" fill="#047857" font-weight="700" font-family="sans-serif">计划归档</text>');
L.push('  <text x="930" y="340" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">状态：已批准→归档</text>');
L.push('  <rect x="200" y="300" width="150" height="50" rx="8" fill="#fff" stroke="#ef4444" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="275" y="323" text-anchor="middle" font-size="13" fill="#b91c1c" font-weight="700" font-family="sans-serif">修改计划</text>');
L.push('  <text x="275" y="340" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">状态：退回修改</text>');
L.push('  <path d="M 200,325 L 100,325 L 100,255 L 340,255" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#arrow)"/>');
L.push('  <text x="30" y="295" font-size="10.5" fill="#ef4444" font-family="sans-serif">重新提交</text>');
L.push('  <rect x="280" y="440" width="640" height="120" rx="10" fill="#fff" stroke="#cbd5e1" stroke-dasharray="6,3"/>');
L.push('  <text x="600" y="463" text-anchor="middle" font-size="12.5" font-weight="700" fill="#475569" font-family="sans-serif">⚠️ 与招采需求的关系（重要）</text>');
L.push('  <text x="600" y="486" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">计划是独立模块，<tspan font-weight="700" fill="#ef4444">不强制串联</tspan>到需求。</text>');
L.push('  <text x="600" y="506" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">已审批通过的计划可作需求申报参考，但需求可以不经过计划直接发起。</text>');
L.push('  <text x="600" y="526" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="sans-serif">数据模型：ProcurementPlan 和 ProcurementDemand 之间无外键依赖。</text>');
L.push('</svg>');
writeFile('招采_计划管理_流程图.svg', L.join('\n'));
}

// ============ 需求管理 ============
function genDemand(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="1200" height="700">');
L.push(defs);
L.push('  <rect width="1200" height="700" fill="#f8fafc"/>');
L.push('  <text x="600" y="44" text-anchor="middle" font-size="20" font-weight="700" fill="#1e293b" font-family="sans-serif">招采需求申请 · 业务流程图</text>');
L.push('  <text x="600" y="66" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">3 种需求入口 → 需求确认 → 招采执行（9 种方式）/ 直接合同</text>');
const entries=[['场景化需求（工程类）','含工位/展位号/作业项',110],['场景化需求（非工程类）','不含工位号，直接清单',460],['标准需求申请','传统通用申请',810]];
for (const [lbl,desc,x] of entries){
  L.push(`  <rect x="${x}" y="120" width="230" height="65" rx="8" fill="#fff" stroke="#6366f1" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+115}" y="146" text-anchor="middle" font-size="13" fill="#4338ca" font-weight="700" font-family="sans-serif">${lbl}</text>`);
  L.push(`  <text x="${x+115}" y="168" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">${desc}</text>`);
}
for (const [,desc,x] of entries){
  const target = x + 115;
  L.push(`  <line x1="${target}" y1="185" x2="600" y2="260" stroke="#6366f1" stroke-width="1.5" marker-end="url(#arrow)"/>`);
}
L.push('  <rect x="470" y="260" width="260" height="50" rx="8" fill="#fff" stroke="#6366f1" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="600" y="283" text-anchor="middle" font-size="13" fill="#4338ca" font-weight="700" font-family="sans-serif">需求单草稿（ProcurementDemand）</text>');
L.push('  <text x="600" y="300" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">提交后进入审批流</text>');
L.push('  <line x1="600" y1="310" x2="600" y2="355" stroke="#6366f1" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <polygon points="600,355 670,385 600,415 530,385" fill="#fff" stroke="#6366f1" stroke-width="1.8"/>');
L.push('  <text x="600" y="389" text-anchor="middle" font-size="12" font-weight="700" fill="#4338ca" font-family="sans-serif">审批？</text>');
L.push('  <line x1="530" y1="385" x2="330" y2="385" stroke="#ef4444" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="410" y="379" font-size="11" fill="#ef4444" font-weight="600" font-family="sans-serif">驳回</text>');
L.push('  <rect x="180" y="360" width="150" height="50" rx="8" fill="#fff" stroke="#ef4444" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="255" y="383" text-anchor="middle" font-size="13" fill="#b91c1c" font-weight="700" font-family="sans-serif">退回修改</text>');
L.push('  <path d="M 180,385 L 90,385 L 90,285 L 470,285" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#arrow)"/>');
L.push('  <text x="22" y="340" font-size="10.5" fill="#ef4444" font-family="sans-serif">重新提交</text>');
L.push('  <line x1="670" y1="385" x2="900" y2="385" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="770" y="379" font-size="11" fill="#10b981" font-weight="600" font-family="sans-serif">通过</text>');
L.push('  <rect x="900" y="360" width="200" height="50" rx="8" fill="#fff" stroke="#10b981" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="1000" y="383" text-anchor="middle" font-size="13" fill="#047857" font-weight="700" font-family="sans-serif">需求确认</text>');
L.push('  <text x="1000" y="400" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">立项通过 / 锁定明细</text>');
L.push('  <line x1="1000" y1="410" x2="1000" y2="460" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <polygon points="1000,460 1060,490 1000,520 940,490" fill="#fff" stroke="#10b981" stroke-width="1.8"/>');
L.push('  <text x="1000" y="494" text-anchor="middle" font-size="11.5" font-weight="700" fill="#047857" font-family="sans-serif">是否招采？</text>');
L.push('  <line x1="940" y1="490" x2="620" y2="490" stroke="#f97316" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="760" y="484" font-size="11" fill="#f97316" font-weight="600" font-family="sans-serif">是（9 种方式可选）</text>');
L.push('  <rect x="400" y="465" width="220" height="50" rx="8" fill="#fff" stroke="#f97316" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="510" y="488" text-anchor="middle" font-size="12.5" fill="#c2410c" font-weight="700" font-family="sans-serif">招采执行（9 种方式）</text>');
L.push('  <text x="510" y="503" text-anchor="middle" font-size="10" fill="#64748b" font-family="sans-serif">目录内比价 / 随机抽取 / 询比 / 竞价 / 谈判 / 直接 / 电子商城</text>');
L.push('  <path d="M 1060,490 L 1140,490 L 1140,550" stroke="#64748b" stroke-width="1.8" fill="none" marker-end="url(#arrow)"/>');
L.push('  <text x="1090" y="484" font-size="11" fill="#64748b" font-weight="600" font-family="sans-serif">否</text>');
L.push('  <rect x="1085" y="545" width="110" height="40" rx="8" fill="#fff" stroke="#64748b" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="1140" y="570" text-anchor="middle" font-size="12" fill="#334155" font-weight="600" font-family="sans-serif">直接合同</text>');
L.push('  <rect x="380" y="615" width="440" height="60" rx="10" fill="#eef2ff" stroke="#c7d2fe"/>');
L.push('  <text x="600" y="638" text-anchor="middle" font-size="13" font-weight="700" fill="#4338ca" font-family="sans-serif">📊 需求台账（DemandLedger）</text>');
L.push('  <text x="600" y="658" text-anchor="middle" font-size="11" fill="#64748b" font-family="sans-serif">汇总所有状态需求单 · 按状态/类型/展会筛选 · 全链路追踪</text>');
L.push('</svg>');
writeFile('招采_需求管理_流程图.svg', L.join('\n'));
}

// ============ 合同全生命周期 ============
function genContract(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 560" width="1280" height="560">');
L.push(defs);
L.push('  <rect width="1280" height="560" fill="#f8fafc"/>');
L.push('  <text x="640" y="44" text-anchor="middle" font-size="20" font-weight="700" fill="#1e293b" font-family="sans-serif">合同 · 全业务生命周期流程图</text>');
L.push('  <text x="640" y="66" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">3 类合同并行 · 合同模版 → 录入 → 审批 → 台账 → 归档 → 履约评估 → CPO 手动下单</text>');
L.push('  <rect x="40" y="100" width="180" height="55" rx="8" fill="#fff" stroke="#059669" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="130" y="123" text-anchor="middle" font-size="13" fill="#047857" font-weight="700" font-family="sans-serif">合同模版</text>');
L.push('  <text x="130" y="140" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">ContractTemplate</text>');
L.push('  <line x1="220" y1="127" x2="270" y2="127" stroke="#059669" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="450" y="120" text-anchor="middle" font-size="12" font-weight="700" fill="#047857" font-family="sans-serif">合同录入（3 类并行）</text>');
const ctypes=[['招采类合同',320],['非招采类合同',520],['自办展/合办展',720]];
for (const [lbl,x] of ctypes){
  L.push(`  <rect x="${x}" y="130" width="160" height="55" rx="8" fill="#fff" stroke="#059669" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+80}" y="152" text-anchor="middle" font-size="12.5" fill="#047857" font-weight="700" font-family="sans-serif">${lbl}</text>`);
}
for (const [,x] of ctypes){
  const cx = x + 80;
  L.push(`  <line x1="${cx}" y1="185" x2="500" y2="250" stroke="#059669" stroke-width="1.5" marker-end="url(#arrow)"/>`);
}
L.push('  <rect x="410" y="250" width="180" height="50" rx="8" fill="#fff" stroke="#059669" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="500" y="273" text-anchor="middle" font-size="13" fill="#047857" font-weight="700" font-family="sans-serif">合同审批</text>');
L.push('  <text x="500" y="290" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">进入审批流配置</text>');
L.push('  <line x1="500" y1="300" x2="500" y2="340" stroke="#059669" stroke-width="1.8"/>');
L.push('  <polygon points="500,340 570,370 500,400 430,370" fill="#fff" stroke="#059669" stroke-width="1.8"/>');
L.push('  <text x="500" y="374" text-anchor="middle" font-size="12" font-weight="700" fill="#047857" font-family="sans-serif">审批？</text>');
L.push('  <line x1="430" y1="370" x2="230" y2="370" stroke="#ef4444" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="310" y="364" font-size="11" fill="#ef4444" font-family="sans-serif">驳回</text>');
L.push('  <rect x="80" y="345" width="150" height="50" rx="8" fill="#fff" stroke="#ef4444" stroke-width="1.5"/>');
L.push('  <text x="155" y="368" text-anchor="middle" font-size="13" fill="#b91c1c" font-weight="700" font-family="sans-serif">退回修改</text>');
L.push('  <line x1="570" y1="370" x2="820" y2="370" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="680" y="364" font-size="11" fill="#10b981" font-family="sans-serif">通过 → 生效</text>');
L.push('  <rect x="820" y="345" width="180" height="50" rx="8" fill="#fff" stroke="#059669" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="910" y="368" text-anchor="middle" font-size="13" fill="#047857" font-weight="700" font-family="sans-serif">合同台账</text>');
L.push('  <text x="910" y="385" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">ContractLedger</text>');
L.push('  <line x1="910" y1="395" x2="910" y2="430" stroke="#059669" stroke-width="1.8"/>');
L.push('  <line x1="910" y1="430" x2="730" y2="430" stroke="#059669" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <line x1="910" y1="430" x2="1090" y2="430" stroke="#059669" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <rect x="620" y="430" width="110" height="45" rx="8" fill="#fff" stroke="#059669" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="675" y="457" text-anchor="middle" font-size="12" fill="#047857" font-weight="700" font-family="sans-serif">合同归档</text>');
L.push('  <rect x="1090" y="430" width="150" height="45" rx="8" fill="#fff" stroke="#059669" stroke-width="1.5" filter="url(#shadow)"/>');
L.push('  <text x="1165" y="457" text-anchor="middle" font-size="12" fill="#047857" font-weight="700" font-family="sans-serif">履约评估</text>');
// CPO 手动下单从台账出发（唯一订单入口）
L.push('  <path d="M 820,370 L 790,370 L 790,470 L 900,470" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#arrow)"/>');
L.push('  <rect x="895" y="455" width="170" height="34" rx="6" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.3"/>');
L.push('  <text x="980" y="477" text-anchor="middle" font-size="11" fill="#7c3aed" font-weight="700" font-family="sans-serif">📦 CPO 手动下单（合同入口）</text>');
L.push('  <text x="980" y="526" text-anchor="middle" font-size="10" fill="#64748b" font-family="sans-serif">任何合同随时手动下单 · 选合同 → 选需求 → 填本次量</text>');
L.push('  <path d="M 1240,452 L 1265,452 L 1265,370 L 1000,370" stroke="#059669" stroke-width="1.2" fill="none" stroke-dasharray="4,3"/>');
L.push('  <text x="1253" y="415" font-size="10" fill="#059669" font-family="sans-serif">回写</text>');
L.push('</svg>');
writeFile('招采_合同全生命周期_流程图.svg', L.join('\n'));
}

// ============ 订单到验收（清晰区分 1 自动订单 : 8 CPO ============
function genOrder(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 720" width="1400" height="720">');
L.push(defs);
L.push('  <rect width="1400" height="720" fill="#f8fafc"/>');
L.push('  <text x="700" y="44" text-anchor="middle" font-size="20" font-weight="700" fill="#1e293b" font-family="sans-serif">订单 → 入库 → 验收 · 业务流程图</text>');
L.push('  <text x="700" y="66" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">9 种国企采购方式 → 1 种自动 ProcurementOrder : 8 种走合同 → CPO 手动下单</text>');

// ===== 上游：9 种采购方式 =====
L.push('  <rect x="40" y="96" width="1320" height="120" rx="12" fill="#fff7ed" stroke="#fed7aa"/>');
L.push('  <text x="700" y="118" text-anchor="middle" font-size="12.5" font-weight="700" fill="#c2410c" font-family="sans-serif">🟠 招采执行 · 9 种国企采购方式</text>');

// 方式 1：目录内比价（唯一自动订单 ⭐）
L.push('  <rect x="60" y="135" width="220" height="70" rx="8" fill="#fff" stroke="#ea580c" stroke-width="2" filter="url(#shadow)"/>');
L.push('  <rect x="60" y="135" width="220" height="18" rx="8" fill="#ea580c"/>');
L.push('  <rect x="60" y="147" width="220" height="6" fill="#ea580c"/>');
L.push('  <text x="170" y="158" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="sans-serif">⭐ 唯一线上报价</text>');
L.push('  <text x="170" y="185" text-anchor="middle" font-size="12" fill="#9a3412" font-weight="700" font-family="sans-serif">框架协议采购-目录内比价</text>');
L.push('  <text x="170" y="202" text-anchor="middle" font-size="10.5" fill="#ea580c" font-weight="600" font-family="sans-serif">framework_catalog</text>');

// 8 种线下（2 行 4 列）
const methods = [
  ['随机抽取','framework_random'],
  ['询比-公开','inquiry_open'],
  ['询比-邀请','inquiry_invited'],
  ['竞价采购','competitive_bidding'],
  ['谈判-公开','negotiation_open'],
  ['谈判-邀请','negotiation_invited'],
  ['直接采购','direct'],
  ['电子商城','e_mall'],
];
L.push('  <text x="880" y="128" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">（8 种线下录入，无自动订单 → 合同生效后走 CPO）</text>');
for (let i=0; i<methods.length; i++){
  const [label] = methods[i];
  const col = i % 4;
  const row = Math.floor(i / 4);
  const x = 310 + col * (115 + 10);
  const y = 135 + row * (30 + 4);
  L.push(`  <rect x="${x}" y="${y}" width="115" height="30" rx="5" fill="#fff" stroke="#f97316" stroke-width="1.1"/>`);
  L.push(`  <text x="${x+57}" y="${y+20}" text-anchor="middle" font-size="10.5" fill="#9a3412" font-weight="600" font-family="sans-serif">${label}</text>`);
}

// ===== 分叉箭头 =====
L.push('  <path d="M 170,205 L 170,260 L 170,280" stroke="#ea580c" stroke-width="2.5" fill="none" marker-end="url(#arrow)"/>');
L.push('  <text x="182" y="245" font-size="11" fill="#9a3412" font-weight="700" font-family="sans-serif">完成 → 一键生成</text>');

// 8 种线下汇聚
L.push('  <path d="M 920,205 L 920,240 L 700,240 L 700,280" stroke="#f97316" stroke-width="1.8" fill="none" marker-end="url(#arrow)"/>');
L.push('  <text x="750" y="234" font-size="11" fill="#c2410c" font-weight="700" font-family="sans-serif">8 种线下完成 → 合同生效 → 手动下单</text>');

// ===== 两套订单源（并行，左右并列）=====
L.push('  <rect x="40" y="290" width="460" height="100" rx="12" fill="#fff" stroke="#8b5cf6" stroke-width="2"/>');
L.push('  <rect x="40" y="290" width="460" height="30" rx="12" fill="#8b5cf6"/>');
L.push('  <rect x="40" y="307" width="460" height="13" fill="#8b5cf6"/>');
L.push('  <text x="270" y="312" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="sans-serif">📦 订单源 A：ProcurementOrder（自动生成）</text>');
L.push('  <text x="270" y="347" text-anchor="middle" font-size="13" fill="#6d28d9" font-weight="700" font-family="sans-serif">handleGenerateOrder 一键触发</text>');
L.push('  <text x="270" y="367" text-anchor="middle" font-size="11" fill="#64748b" font-family="sans-serif">仅目录内比价 framework_catalog 完成后可生成</text>');
L.push('  <text x="270" y="383" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">sourceType="framework_bidding" · CompetitiveBiddingPage 内按钮</text>');

L.push('  <rect x="900" y="290" width="460" height="100" rx="12" fill="#fff" stroke="#059669" stroke-width="2"/>');
L.push('  <rect x="900" y="290" width="460" height="30" rx="12" fill="#059669"/>');
L.push('  <rect x="900" y="307" width="460" height="13" fill="#059669"/>');
L.push('  <text x="1130" y="312" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="sans-serif">📦 订单源 B：CPO（合同手动下单 · 通用）</text>');
L.push('  <text x="1130" y="347" text-anchor="middle" font-size="13" fill="#047857" font-weight="700" font-family="sans-serif">ContractPurchaseOrderPage 独立入口</text>');
L.push('  <text x="1130" y="367" text-anchor="middle" font-size="11" fill="#64748b" font-family="sans-serif">所有合同类型随时可手动下单：选合同 → 选需求 → 填本次量</text>');
L.push('  <text x="1130" y="383" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">8 种线下 + 非招采合同 + 自办展合同 全部适用</text>');

// ===== 合并 → 入库 → 验收 → 回写 =====
L.push('  <path d="M 270,390 L 270,430 L 640,430" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#arrow)"/>');
L.push('  <path d="M 1130,390 L 1130,430 L 760,430" stroke="#059669" stroke-width="2" fill="none" marker-end="url(#arrow)"/>');

const chain = [
  ['仓库采购入库','跨模块对接 · 自动更新 deliveredQuantity','640','#8b5cf6'],
  ['验收（ProcurementInspection）','有订单优先核对订单明细 · 无订单兜底需求明细','830','#8b5cf6'],
  ['合同履约进度回写','自动更新合同已履约比例','1020','#10b981'],
];
for (const [title,desc,x,color] of chain){
  L.push(`  <rect x="${x}" y="450" width="180" height="70" rx="8" fill="#fff" stroke="${color}" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+90}" y="477" text-anchor="middle" font-size="12" fill="${color}" font-weight="700" font-family="sans-serif">${title}</text>`);
  L.push(`  <text x="${x+90}" y="497" text-anchor="middle" font-size="10" fill="#64748b" font-family="sans-serif">${desc}</text>`);
}
L.push('  <path d="M 730,485 L 830,485" stroke="#8b5cf6" stroke-width="1.8" fill="none" marker-end="url(#arrow)"/>');
L.push('  <path d="M 1010,485 L 1020,485" stroke="#8b5cf6" stroke-width="1.8" fill="none" marker-end="url(#arrow)"/>');

// ===== 底部总结 =====
L.push('  <rect x="40" y="560" width="1320" height="140" rx="12" fill="#f8fafc" stroke="#e2e8f0"/>');
L.push('  <text x="700" y="585" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b" font-family="sans-serif">🔑 关键结论</text>');
L.push('  <text x="700" y="608" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">① 仅 目录内比价 framework_catalog 自动生成 ProcurementOrder（橙→紫实线）</text>');
L.push('  <text x="700" y="628" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">② 其余 8 种线下方式完成后，进入合同流程，合同生效后通过 CPO 手动下单（橙→绿→紫）</text>');
L.push('  <text x="700" y="648" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">③ CPO 是独立通用下单工具，不与目录内比价订单冲突，任何合同类型随时可手动下单</text>');
L.push('  <text x="700" y="668" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">④ 仓库只能凭已提交订单入库；验收有订单优先核对订单明细，无订单兜底需求明细</text>');
L.push('  <text x="700" y="690" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="sans-serif">数据模型：ProcurementOrder 和 CPO 同属订单域，sourceType 字段区分来源（framework_bidding / cpo_manual）</text>');

L.push('</svg>');
writeFile('招采_订单到验收_流程图.svg', L.join('\n'));
}

// ============ 供应商管理 ============
function genSupplier(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 460" width="1100" height="460">');
L.push(defs);
L.push('  <rect width="1100" height="460" fill="#f8fafc"/>');
L.push('  <text x="550" y="44" text-anchor="middle" font-size="20" font-weight="700" fill="#1e293b" font-family="sans-serif">供应商管理 · 业务流程图</text>');
L.push('  <text x="550" y="66" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">入驻 → 分类 → 考核模版 → 考核执行 → 记录 → 分级管理</text>');
const snodes=[ ['供应商入驻','SupplierPage',60],['供应商分类','（货物/服务/工程）',260],['考核模版管理','EvaluationTemplate',480],['考核执行','EvaluationExecute',700],['考核记录','EvaluationRecord',900] ];
for (const [t1,t2,x] of snodes){
  L.push(`  <rect x="${x}" y="120" width="190" height="55" rx="8" fill="#fff" stroke="#475569" stroke-width="1.5" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+95}" y="143" text-anchor="middle" font-size="12" fill="#1e293b" font-weight="700" font-family="sans-serif">${t1}</text>`);
  L.push(`  <text x="${x+95}" y="160" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">${t2}</text>`);
}
for (let i=0;i<snodes.length-1;i++){
  const xl=snodes[i][2]+190, xr=snodes[i+1][2];
  L.push(`  <line x1="${xl}" y1="147" x2="${xr}" y2="147" stroke="#475569" stroke-width="1.8" marker-end="url(#arrow)"/>`);
}
L.push('  <rect x="420" y="250" width="260" height="70" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="5,3"/>');
L.push('  <text x="550" y="274" text-anchor="middle" font-size="13" font-weight="700" fill="#334155" font-family="sans-serif">供应商分级（综合评估）</text>');
L.push('  <text x="550" y="295" text-anchor="middle" font-size="10.5" fill="#64748b" font-family="sans-serif">按考核结果自动分级 · 影响后续报价受邀</text>');
const levels=[['S 级','#10b981'],['A 级','#3b82f6'],['B 级','#f59e0b'],['C 级','#ef4444']];
for (let i=0;i<levels.length;i++){
  const [lbl,color]=levels[i];
  const bx=430+i*62;
  L.push(`  <rect x="${bx}" y="312" width="56" height="22" rx="11" fill="${color}22" stroke="${color}"/>`);
  L.push(`  <text x="${bx+28}" y="327" text-anchor="middle" font-size="11" fill="${color}" font-weight="700" font-family="sans-serif">${lbl}</text>`);
}
L.push('  <path d="M 995,175 L 995,225 L 680,225 L 680,250" stroke="#475569" stroke-width="1.5" fill="none" stroke-dasharray="4,3" marker-end="url(#arrow)"/>');
L.push('  <text x="820" y="219" font-size="10" fill="#64748b" font-family="sans-serif">评估结果驱动分级</text>');
L.push('</svg>');
writeFile('招采_供应商管理_流程图.svg', L.join('\n'));
}

// ============ 执行工单状态机（清晰区分 9 种方式的不同状态路径）============
function genBidState(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1380 780" width="1380" height="780">');
L.push(defs);
L.push('  <rect width="1380" height="780" fill="#f8fafc"/>');
L.push('  <text x="650" y="40" text-anchor="middle" font-size="19" font-weight="700" fill="#1e293b" font-family="sans-serif">招采工单 · 状态机流程图（CompetitiveBiddingPage）</text>');
L.push('  <text x="650" y="60" text-anchor="middle" font-size="11.5" fill="#64748b" font-family="sans-serif">9 种国企采购方式共用此状态机 · 仅目录内比价走完整 8 状态 · 其余 8 种跳过中间节点</text>');

// 9 种方式顶部展示（2 行，第 1 行目录内比价高亮 ⭐）
L.push('  <rect x="30" y="80" width="1240" height="90" rx="10" fill="#fff7ed" stroke="#fed7aa"/>');
L.push('  <text x="650" y="100" text-anchor="middle" font-size="11.5" fill="#c2410c" font-weight="700" font-family="sans-serif">🟠 9 种国企采购方式（approvalStatus 通用 status 分岔）</text>');
// 方式 1：目录内比价
L.push('  <rect x="50" y="112" width="180" height="48" rx="6" fill="#fff" stroke="#ea580c" stroke-width="1.8" filter="url(#shadow)"/>');
L.push('  <text x="140" y="132" text-anchor="middle" font-size="9" fill="#ea580c" font-weight="700" font-family="sans-serif">⭐ 唯一目录内比价</text>');
L.push('  <text x="140" y="148" text-anchor="middle" font-size="11" fill="#9a3412" font-weight="700" font-family="sans-serif">framework_catalog</text>');
L.push('  <text x="140" y="160" text-anchor="middle" font-size="9" fill="#64748b" font-family="sans-serif">完整 8 状态 + 自动订单</text>');
// 8 种线下
const offlineList = ['随机抽取','询比公开','询比邀请','竞价','谈判公开','谈判邀请','直接','电子商城'];
for (let i=0; i<offlineList.length; i++){
  const x = 245 + (i % 4) * 130;
  const y = 112 + Math.floor(i / 4) * 26;
  L.push(`  <rect x="${x}" y="${y}" width="120" height="22" rx="4" fill="#fff" stroke="#f97316" stroke-width="1"/>`);
  L.push(`  <text x="${x+60}" y="${y+16}" text-anchor="middle" font-size="10" fill="#9a3412" font-weight="600" font-family="sans-serif">${offlineList[i]}</text>`);
}

// ===== 状态机主体 =====
const states=[
  ['draft','草稿','#64748b',100,270],
  ['submitted','已提交（线下审批）','#f59e0b',340,270],
  ['approved','审核通过','#f97316',580,270],
  ['published','已发布（仅目录内比价）','#f97316',820,270],
  ['bidding','招标中 供应商报价','#ea580c',1060,270],
  ['evaluated','已评审','#ea580c',820,420],
  ['completed','已完成','#10b981',580,570],
  ['cancelled','已取消','#ef4444',100,570],
];
for (const [,label,color,x,y] of states){
  L.push(`  <rect x="${x}" y="${y}" width="220" height="68" rx="10" fill="#fff" stroke="${color}" stroke-width="2" filter="url(#shadow)"/>`);
  label.split('\n').forEach((l,j)=>{
    L.push(`  <text x="${x+110}" y="${y+28+j*18}" text-anchor="middle" font-size="12.5" fill="${color}" font-weight="700" font-family="sans-serif">${l}</text>`);
  });
}

// 状态流转线（目录内比价路径：完整）
L.push('  <line x1="320" y1="304" x2="340" y2="304" stroke="#ea580c" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="260" y="296" font-size="10" fill="#64748b" font-family="sans-serif">提交审批</text>');
L.push('  <line x1="560" y1="304" x2="580" y2="304" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="460" y="296" font-size="10" fill="#64748b" font-family="sans-serif">审批通过</text>');
L.push('  <line x1="800" y1="304" x2="820" y2="304" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="690" y="296" font-size="10" fill="#64748b" font-family="sans-serif">发布（仅目录内比价）</text>');
// ⚠️ 发布前置：必须先设招标时间
L.push('  <rect x="820" y="212" width="220" height="34" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.3"/>');
L.push('  <text x="930" y="228" text-anchor="middle" font-size="9.5" fill="#92400e" font-weight="700" font-family="sans-serif">⚠️ 发布前置条件</text>');
L.push('  <text x="930" y="240" text-anchor="middle" font-size="8.8" fill="#78350f" font-family="sans-serif">必须先设招标开始 + 截止时间</text>');
L.push('  <path d="M 930,246 L 930,268" stroke="#f59e0b" stroke-width="1.3" fill="none" marker-end="url(#arrow)"/>');
// bidding 前的线
L.push('  <line x1="1040" y1="304" x2="1060" y2="304" stroke="#10b981" stroke-width="1.8" marker-end="url(#arrow)"/>');
L.push('  <text x="950" y="296" font-size="10" fill="#64748b" font-family="sans-serif">开始线上报价</text>');
L.push('  <path d="M 1170,338 L 1170,385 L 930,385 L 930,420" stroke="#ea580c" stroke-width="1.8" fill="none" marker-end="url(#arrow)"/>');
L.push('  <text x="1040" y="378" font-size="10" fill="#64748b" font-family="sans-serif">报价截止 → 评审</text>');
// 🔄 bidding 截止前可修改招标时间（自回环）
L.push('  <path d="M 1280,304 L 1310,304 L 1310,260 L 1280,260" stroke="#ea580c" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#arrow)"/>');
L.push('  <rect x="1222" y="222" width="72" height="32" rx="4" fill="#fff" stroke="#ea580c"/>');
L.push('  <text x="1258" y="237" text-anchor="middle" font-size="8" fill="#c2410c" font-weight="700" font-family="sans-serif">🔄 截止前可修改</text>');
L.push('  <text x="1258" y="248" text-anchor="middle" font-size="8" fill="#9a3412" font-family="sans-serif">招标时间</text>');
L.push('  <path d="M 1222,238 L 1212,238 L 1212,304 L 1222,304" stroke="#ea580c" stroke-width="1.2" fill="none" stroke-dasharray="4,3"/>');
L.push('  <path d="M 930,488 L 930,540 L 700,540 L 700,570" stroke="#ea580c" stroke-width="1.8" fill="none" marker-end="url(#arrow)"/>');
L.push('  <text x="942" y="520" font-size="10" fill="#64748b" font-family="sans-serif">评审通过 → 完成</text>');

// ===== 8 种线下快捷路径（跳过 published/bidding/evaluated）=====
L.push('  <path d="M 690,338 L 690,470 L 690,570" stroke="#f97316" stroke-width="2.5" fill="none" stroke-dasharray="8,4" marker-end="url(#arrow)"/>');
L.push('  <rect x="700" y="418" width="195" height="36" rx="6" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>');
L.push('  <text x="797" y="435" text-anchor="middle" font-size="10.5" fill="#c2410c" font-weight="700" font-family="sans-serif">8 种线下快捷路径</text>');
L.push('  <text x="797" y="448" text-anchor="middle" font-size="9.5" fill="#9a3412" font-family="sans-serif">跳过 published / bidding / evaluated</text>');

// 取消路径
L.push('  <path d="M 210,338 L 210,470 L 210,570" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="5,3" marker-end="url(#arrow)"/>');
L.push('  <text x="222" y="440" font-size="10" fill="#ef4444" font-family="sans-serif">草稿可取消</text>');

// ===== 完成后分支：自动订单 vs 合同 =====
L.push('  <line x1="800" y1="604" x2="1000" y2="604" stroke="#64748b" stroke-width="1.5"/>');
L.push('  <rect x="1000" y="580" width="270" height="50" rx="8" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.8"/>');
L.push('  <text x="1135" y="603" text-anchor="middle" font-size="11.5" fill="#6d28d9" font-weight="700" font-family="sans-serif">📦 ProcurementOrder 自动生成</text>');
L.push('  <text x="1135" y="618" text-anchor="middle" font-size="9.5" fill="#64748b" font-family="sans-serif">仅 framework_catalog 可触发 · 一键 handleGenerateOrder</text>');
L.push('  <line x1="800" y1="604" x2="760" y2="604" stroke="#64748b" stroke-width="1.5"/>');
L.push('  <rect x="540" y="645" width="320" height="50" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>');
L.push('  <text x="700" y="668" text-anchor="middle" font-size="11.5" fill="#047857" font-weight="700" font-family="sans-serif">📋 进入合同流程 → 合同台账 → CPO 手动下单</text>');
L.push('  <text x="700" y="683" text-anchor="middle" font-size="9.5" fill="#64748b" font-family="sans-serif">8 种线下方式完成后统一进入合同模块处理</text>');
// 分支线
L.push('  <path d="M 690,604 L 690,645" stroke="#10b981" stroke-width="1.5" fill="none" marker-end="url(#arrow)"/>');

// 底部关键说明
L.push('  <rect x="30" y="715" width="1320" height="55" rx="8" fill="#fff" stroke="#e2e8f0"/>');
L.push('  <text x="50" y="736" font-size="11" font-weight="700" fill="#1e293b" font-family="sans-serif">💡 关键区分</text>');
L.push('  <text x="50" y="755" font-size="10.5" fill="#64748b" font-family="sans-serif">① 仅 framework_catalog 走完整 8 状态（含线上报价）；其余 8 种 approvalStatus 通过后 → status 直接 completed</text>');
L.push('  <text x="700" y="755" font-size="10.5" fill="#64748b" font-family="sans-serif">② 仅目录内比价完成后可一键生成 ProcurementOrder；CPO 是合同独立手动下单工具，和解耦</text>');
L.push('  <text x="50" y="770" font-size="10.5" fill="#64748b" font-family="sans-serif">③ 🕐 发布前必设招标时间（开始+截止）；bidding 截止前可反复修改，截止后锁定不可改</text>');

L.push('</svg>');
writeFile('招采_执行工单_状态机.svg', L.join('\n'));
}

// ============ 审批与预警 ============
function genApproval(){
const L=[];
L.push('<?xml version="1.0" encoding="UTF-8"?>');
L.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 560" width="1200" height="560">');
L.push(defs);
L.push('  <rect width="1200" height="560" fill="#f8fafc"/>');
L.push('  <text x="600" y="40" text-anchor="middle" font-size="19" font-weight="700" fill="#1e293b" font-family="sans-serif">审批流配置 & 预警看板 · 业务流程图</text>');
L.push('  <text x="600" y="60" text-anchor="middle" font-size="11.5" fill="#64748b" font-family="sans-serif">支撑体系 · 服务于所有模块的审批节点和异常监控</text>');
L.push('  <rect x="40" y="90" width="560" height="430" rx="14" fill="#f1f5f9" stroke="#cbd5e1"/>');
L.push('  <text x="320" y="115" text-anchor="middle" font-size="14" font-weight="700" fill="#334155" font-family="sans-serif">审批流配置（ApprovalFlowConfig）</text>');
for (const [x,y,t1,t2] of [[70,135,'审批节点定义','节点名称 / 审批人角色（支持会签或或签）'],[350,135,'条件分支配置','金额/类型/部门 不同条件走不同节点链'],[70,230,'驳回后处理策略','直接驳回发起人 / 回到上节点 / 支持转办加签'],[350,230,'超时自动处理','超时自动提醒 / 自动通过 / 可配置时限']]){
  L.push(`  <rect x="${x}" y="${y}" width="240" height="70" rx="8" fill="#fff" stroke="#64748b" filter="url(#shadow)"/>`);
  L.push(`  <text x="${x+120}" y="${y+25}" text-anchor="middle" font-size="12" fill="#1e293b" font-weight="700" font-family="sans-serif">${t1}</text>`);
  L.push(`  <text x="${x+120}" y="${y+45}" text-anchor="middle" font-size="10" fill="#64748b" font-family="sans-serif">${t2}</text>`);
}
L.push('  <rect x="70" y="330" width="500" height="170" rx="10" fill="#fff" stroke="#e2e8f0"/>');
L.push('  <text x="320" y="355" text-anchor="middle" font-size="12.5" font-weight="700" fill="#334155" font-family="sans-serif">审批实例流转（ApprovalFlowInstance）</text>');
const chain=[['发起人提交',100,'#3b82f6'],['部门主管',230,'#f59e0b'],['财务审核',360,'#8b5cf6'],['总经理（超10万）',490,'#10b981']];
for (const [lbl,x,color] of chain){
  L.push(`  <rect x="${x}" y="380" width="90" height="35" rx="6" fill="${color}15" stroke="${color}" stroke-width="1.5"/>`);
  L.push(`  <text x="${x+45}" y="402" text-anchor="middle" font-size="10" fill="${color}" font-weight="600" font-family="sans-serif">${lbl}</text>`);
}
for (let i=0;i<chain.length-1;i++){
  const xl=chain[i][1]+90, xr=chain[i+1][1];
  L.push(`  <line x1="${xl}" y1="397" x2="${xr}" y2="397" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)"/>`);
}
const dots=[[145,'#10b981','已完成'],[275,'#10b981','已通过'],[405,'#f59e0b','当前节点（待办）'],[535,'#cbd5e1','排队中']];
for (const [x,color,lbl] of dots){
  L.push(`  <circle cx="${x}" cy="440" r="6" fill="${color}"/>`);
  L.push(`  <text x="${x+14}" y="444" font-size="9.5" fill="#64748b" font-family="sans-serif">${lbl}</text>`);
}
L.push('  <rect x="640" y="90" width="520" height="430" rx="14" fill="#fff7ed" stroke="#fed7aa"/>');
L.push('  <text x="900" y="115" text-anchor="middle" font-size="14" font-weight="700" fill="#c2410c" font-family="sans-serif">预警看板（ProcurementAlertDashboard · 7 种规则）</text>');
const rules=[ ['① 需求超期未确认','需求申请后超过 7 天仍在草稿状态',12],['② 工单超期未发布','提交审批后超过 5 天未审核',5],['③ 报价截止未收齐','目录内比价报价截止后仍有供应商未报价',2],['④ 合同到期未归档','合同终止/到期后超过 10 天未归档',3],['⑤ 履约评价缺失','合同完成后 30 天内未做履约评价',8],['⑥ 订单超量预警','累计下单即将超过合同总量（≥90%）',6],['⑦ 供应商报价异常','同一物资报价偏离均值超过 30%',1] ];
for (let idx=0; idx<rules.length; idx++){
  const [title,desc,count] = rules[idx];
  const y=135+idx*39;
  L.push(`  <rect x="670" y="${y}" width="460" height="32" rx="6" fill="#fff" stroke="#fed7aa"/>`);
  L.push(`  <circle cx="688" cy="${y+16}" r="9" fill="#f97316" opacity="0.8"/>`);
  L.push(`  <text x="688" y="${y+20}" text-anchor="middle" font-size="10.5" fill="#fff" font-weight="700" font-family="sans-serif">${count}</text>`);
  L.push(`  <text x="710" y="${y+15}" font-size="11.5" fill="#c2410c" font-weight="700" font-family="sans-serif">${title}</text>`);
  L.push(`  <text x="710" y="${y+27}" font-size="9.5" fill="#64748b" font-family="sans-serif">${desc}</text>`);
}
L.push('</svg>');
writeFile('招采_审批与预警_流程图.svg', L.join('\n'));
}

// run all
genOverall();
genPlan();
genDemand();
genContract();
genOrder();
genSupplier();
genBidState();
genApproval();
console.log('\n🎉 全部 8 份 SVG 生成完毕（9 种国企采购方式版）！');
