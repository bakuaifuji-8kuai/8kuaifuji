import { useState, useMemo } from 'react';
import { CHANGELOG, type ChangeType } from '@/constants/changelog';
import Badge from '@/components/common/Badge';
import {
  PackagePlus, Wrench, RefreshCw, FileText,
  CalendarDays, Tag, Filter, Hash,
} from 'lucide-react';

const TYPE_META: Record<ChangeType, { label: string; variant: any; icon: any; color: string }> = {
  feat:    { label: '新增',   variant: 'primary',   icon: PackagePlus,  color: 'from-indigo-500 to-violet-500' },
  fix:     { label: '修复',   variant: 'warning',   icon: Wrench,       color: 'from-amber-500 to-orange-500' },
  refactor:{ label: '重构',   variant: 'secondary', icon: RefreshCw,    color: 'from-slate-500 to-slate-600' },
  docs:    { label: '文档',   variant: 'info',      icon: FileText,     color: 'from-blue-500 to-indigo-500' },
};

const SCOPE_CHIP_VARIANT: Record<string, any> = {
  '招采执行': 'primary',
  '采购需求': 'primary',
  '招采计划': 'primary',
  '招采流程': 'primary',
  '合同': 'info',
  '资产': 'success',
  '档案': 'success',
  '库存': 'success',
  '供应商': 'warning',
  '验收': 'warning',
  '调拨': 'warning',
  '服务': 'info',
  '基础': 'default',
  '构建': 'default',
  '文档': 'default',
};

export default function ChangelogPage() {
  const [typeFilter, setTypeFilter] = useState<ChangeType | 'all'>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  // 收集所有 scope
  const allScopes = useMemo(() => {
    const set = new Set<string>();
    CHANGELOG.forEach((d) => d.entries.forEach((e) => set.add(e.scope)));
    return Array.from(set).sort();
  }, []);

  // 总条目数
  const totalCount = useMemo(
    () => CHANGELOG.reduce((sum, d) => sum + d.entries.length, 0),
    []
  );

  // 过滤后的数据
  const filteredDays = useMemo(() => {
    return CHANGELOG
      .map((day) => ({
        ...day,
        entries: day.entries.filter((e) => {
          if (typeFilter !== 'all' && e.type !== typeFilter) return false;
          if (scopeFilter !== 'all' && e.scope !== scopeFilter) return false;
          return true;
        }),
      }))
      .filter((day) => day.entries.length > 0);
  }, [typeFilter, scopeFilter]);

  const filteredCount = filteredDays.reduce((s, d) => s + d.entries.length, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* 顶部标题区 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25">
            <Hash className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">变更记录</h1>
            <p className="text-xs text-slate-500">
              2026-10-12 起 · 共 {totalCount} 条变更 · 不含部署/CI 构建记录
            </p>
          </div>
        </div>
      </div>

      {/* 过滤 Tab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* 类型过滤 */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">类型：</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  typeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部
              </button>
              {(Object.keys(TYPE_META) as ChangeType[]).map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      typeFilter === t
                        ? `bg-gradient-to-r ${meta.color} text-white shadow-sm`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={11} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 模块筛选 */}
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">模块：</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">全部模块</option>
              {allScopes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 筛选结果计数 */}
          <div className="ml-auto text-xs text-slate-500">
            显示 <span className="font-semibold text-indigo-600">{filteredCount}</span> / {totalCount} 条
          </div>
        </div>
      </div>

      {/* 时间线 */}
      <div className="relative">
        {/* 左侧竖线 */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-slate-100" />

        {filteredDays.length === 0 && (
          <div className="text-center py-20 text-slate-400 text-sm">
            当前筛选条件下暂无变更记录
          </div>
        )}

        {filteredDays.map((day) => (
          <div key={day.date} className="relative mb-8 last:mb-0">
            {/* 日期节点 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-indigo-400 flex items-center justify-center shadow-sm">
                <CalendarDays size={14} className="text-indigo-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{day.date}</div>
                {day.summary && (
                  <div className="text-xs text-slate-500 mt-0.5">{day.summary}</div>
                )}
              </div>
              <Badge variant="default" size="sm" className="ml-1">
                {day.entries.length} 条
              </Badge>
            </div>

            {/* 当日变更卡片 */}
            <div className="pl-12 space-y-3">
              {day.entries.map((entry, idx) => {
                const meta = TYPE_META[entry.type];
                const Icon = meta.icon;
                const scopeVariant = SCOPE_CHIP_VARIANT[entry.scope] || 'default';
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* 类型图标 */}
                      <div className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-sm`}>
                        <Icon size={13} className="text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                          <Badge variant={scopeVariant} size="sm">{entry.scope}</Badge>
                          {entry.commit && (
                            <span className="text-[11px] text-slate-400 font-mono">{entry.commit}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-slate-800 leading-snug">
                          {entry.title}
                        </h4>
                        {entry.detail && (
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {entry.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 底部说明 */}
      <div className="mt-10 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        部署记录、CI 构建日志不在此处展示 · 下次发布后手动追加 changelog.ts
      </div>
    </div>
  );
}
