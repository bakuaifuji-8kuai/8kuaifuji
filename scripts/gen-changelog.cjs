/**
 * 构建前置脚本：变更记录自动生成 + 功能说明防过期护栏
 *
 * 1. 读取 git log（2026-10-12 起，feat/fix/refactor/docs 类提交），
 *    按日期分组生成 src/constants/changelog.generated.ts —— 变更记录页「提交明细」区数据源
 *    （commit 提交信息即业务中文描述，功能一提交部署，变更页自动出现，无需手写）
 * 2. 护栏：对比「最近触碰页面代码的功能提交」与「procurementHelp.ts 最后更新日期」，
 *    说明文档落后时生成 HELP_STALE 标记 —— 变更页顶部与功能说明弹窗亮黄条提醒同步
 *
 * ⚠️ changelog.generated.ts 为构建产物，请勿手改
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'constants', 'changelog.generated.ts');
const SINCE = '2026-10-12'; // 与手写 changelog.ts 起始日期一致
const HELP_FILE = 'src/constants/procurementHelp.ts';

// commit 标题 → 模块归类（关键词映射，按顺序命中即停；兜底「综合」）
const SCOPE_RULES = [
  ['小程序', '招采'], ['报价', '招采'], ['招采', '招采'], ['工单', '招采'], ['测试数据', '招采'],
  ['采购需求', '采购需求'], ['需求', '采购需求'], ['立项', '采购需求'],
  ['合同', '合同'],
  ['供应商', '供应商'],
  ['入库', '库存'], ['出库', '库存'], ['库存', '库存'], ['快照', '库存'], ['盘点', '库存'],
  ['调拨', '调拨'], ['资产', '资产'],
  ['验收', '验收'],
  ['考核', '供应商'], ['评价', '供应商'],
  ['变更记录', '文档'], ['帮助', '文档'], ['操作说明', '文档'], ['文档', '文档'],
  ['persist', '构建'],
];

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: ROOT }).trim();
  } catch {
    return '';
  }
}

let gitOk = true;
let raw = '';
try {
  raw = execSync(
    `git log --since="${SINCE}" --date=short --pretty="format:@@%h|%ad|%s" --name-only`,
    { encoding: 'utf8', cwd: ROOT }
  );
} catch {
  gitOk = false;
}

const SKIP_RE = /部署|push|merge|Merge|chore|CI\b|构建发布|revert/i;
const TYPE_MAP = { feat: 'feat', fix: 'fix', refactor: 'refactor', docs: 'docs', style: 'refactor', perf: 'refactor', test: 'refactor' };

const days = new Map(); // date → entries[]
const pageCommits = []; // 触碰 src/pages/** 的功能提交（护栏用）

if (gitOk && raw) {
  let current = null;
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('@@')) {
      const [hash, date, subject = ''] = trimmed.slice(2).split('|');
      if (!hash || !subject) { current = null; continue; }
      if (SKIP_RE.test(subject)) { current = null; continue; }
      const m = subject.match(/^(feat|fix|refactor|docs|style|perf|test)\s*[:：]\s*(.*)$/);
      if (!m) { current = null; continue; }
      const type = TYPE_MAP[m[1]];
      const title = m[2].trim();
      let scope = '综合';
      for (const [kw, sc] of SCOPE_RULES) {
        if (title.includes(kw)) { scope = sc; break; }
      }
      current = { hash, date, title, scope, type, touchedPage: false };
      pageCommits.push(current);
      if (!days.has(date)) days.set(date, { date, entries: [] });
      days.get(date).entries.push({ type, scope, title, commit: hash });
    } else if (current && trimmed) {
      if (trimmed.startsWith('src/pages/') || trimmed.startsWith('src/components/')) current.touchedPage = true;
    }
  }
}

// ===== 功能说明过期护栏 =====
const helpDate = run(`git log -1 --date=short --pretty="format:%ad" -- ${HELP_FILE}`) || '0000-00-00';
const staleCommits = pageCommits.filter((c) => c.touchedPage && c.date > helpDate);
const HELP_STALE = {
  stale: staleCommits.length > 0,
  count: staleCommits.length,
  commits: staleCommits.slice(0, 5).map((c) => `${c.date} ${c.title}`),
  helpDate,
};

// ===== 生成 TS =====
const sortedDays = Array.from(days.values()).sort((a, b) => b.date.localeCompare(a.date));
const now = new Date();
const generatedAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

const ts = `// ⚠️ 此文件由 scripts/gen-changelog.cjs 构建时自动生成（数据源：git log），请勿手改
// 生成时间：${generatedAt} · 统计范围：${SINCE} 起 · ${gitOk ? 'git 解析成功' : 'git 不可用，输出为空'}
import type { ChangeDay } from './changelog';

export const AUTO_CHANGELOG: ChangeDay[] = ${JSON.stringify(sortedDays, null, 2)};

export const AUTO_GENERATED_AT = '${generatedAt}';

// 功能说明防过期护栏：构建时检测「最近触碰页面代码的功能提交」是否晚于 procurementHelp.ts 最后更新
export const HELP_STALE = ${JSON.stringify(HELP_STALE, null, 2)};
`;

fs.writeFileSync(OUT, ts, 'utf8');
console.log(
  `[gen-changelog] 生成 ${sortedDays.length} 天 / ${sortedDays.reduce((s, d) => s + d.entries.length, 0)} 条提交明细` +
    (HELP_STALE.stale ? ` · ⚠️ 功能说明落后 ${HELP_STALE.count} 项功能改动，已标记提醒` : ' · 功能说明与最新改动同步 ✓')
);
