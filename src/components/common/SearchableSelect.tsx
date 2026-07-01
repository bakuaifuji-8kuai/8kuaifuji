import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export interface SearchableSelectOption {
  id: string;
  label: string;
  role?: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange?: (value: string, option?: SearchableSelectOption) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  width?: string;
  filter?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '请选择',
  label,
  required,
  width = 'w-[220px]',
  filter,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options
    .filter((o) => !filter || o.role === filter || (o as any).role === filter)
    .filter((o) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        o.label.toLowerCase().includes(s) ||
        (o.role || '').toLowerCase().includes(s)
      );
    });

  const current = options.find((o) => o.id === value);

  const handleSelect = (opt: SearchableSelectOption) => {
    onChange?.(opt.id, opt);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('', undefined);
  };

  return (
    <div className={`flex items-center gap-2`}>
      {label && (
        <span className="text-xs text-[#606266] whitespace-nowrap">
          {label}：{required && <span className="text-[#f56c6c]">*</span>}
        </span>
      )}
      <div ref={wrapRef} className={`relative ${width}`}>
        <div
          onClick={() => setOpen(!open)}
          className={`h-8 px-2 border text-xs rounded cursor-pointer flex items-center justify-between gap-1 ${
            required && !value
              ? 'border-[#f56c6c] bg-white'
              : 'border-[#dcdfe6] bg-white hover:border-[#2f54eb]'
          } focus-within:border-[#2f54eb]`}
        >
          <span className={`flex-1 truncate ${current ? 'text-[#303133]' : 'text-[#c0c4cc]'}`}>
            {current ? current.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {current && (
              <X
                size={12}
                className="text-slate-400 hover:text-slate-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              size={12}
              className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
        {open && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#e4e7ed] rounded shadow-lg max-h-[280px] overflow-y-auto">
            <div className="p-2 border-b border-[#f0f2f5] sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="输入关键字搜索"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-7 pl-7 pr-2 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
                />
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-[#909399]">无匹配结果</div>
              ) : (
                filtered.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-[#ecf5ff] ${
                      opt.id === value ? 'bg-[#e6f0ff] text-[#2f54eb] font-medium' : 'text-[#303133]'
                    }`}
                  >
                    {opt.label}
                    {opt.role && <span className="text-[#909399] ml-2">[{opt.role}]</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
