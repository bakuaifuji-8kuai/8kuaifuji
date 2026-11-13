import { useEffect, useRef, useState } from 'react';

/**
 * 轻量可搜索下拉选择器（不需要 react-select 等外部依赖）
 *
 * 功能：
 *   1. 点击按钮展开下拉 → 输入框自动聚焦
 *   2. 实时关键字模糊过滤（name + description 都可搜）
 *   3. 选中后关闭并回显
 *   4. 点击外部 / ESC / 选中项 = 关闭
 *
 * 专为验收模板选择场景设计，但也能复用做其他选择器。
 */
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface Props {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export default function SelectWithSearch({
  options,
  value,
  placeholder = '请选择',
  onChange,
  searchPlaceholder = '输入关键字搜索…',
  emptyText = '暂无匹配选项',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setKeyword('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // 展开后自动聚焦搜索框
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setKeyword('');
    }
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setKeyword('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const filtered = options.filter((o) => {
    if (!keyword.trim()) return true;
    const k = keyword.toLowerCase();
    return (
      o.label.toLowerCase().includes(k) ||
      (o.description ?? '').toLowerCase().includes(k) ||
      o.value.toLowerCase().includes(k)
    );
  });

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-w-[220px] px-3 py-2 border border-slate-200 rounded-lg text-left text-sm bg-white
                   hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400
                   transition-all flex items-center gap-2"
      >
        <span className="flex-1 truncate">
          {selected ? (
            <>
              <span className="font-medium text-slate-800">{selected.label}</span>
              {selected.description && (
                <span className="ml-2 text-xs text-slate-400 truncate">
                  — {selected.description}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl
                         shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
          {/* 搜索框 */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none
                         focus:ring-2 focus:ring-indigo-400 bg-slate-50/50"
            />
          </div>

          {/* 选项列表 */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">{emptyText}</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex flex-col gap-0.5 transition-colors
                    ${value === opt.value
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[11px] text-slate-400 leading-snug">
                      {opt.description}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
