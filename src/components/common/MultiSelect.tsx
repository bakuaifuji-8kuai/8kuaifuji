import { useState, useRef, useEffect } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  width?: string;
  label?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = '请选择',
  width = 'w-[220px]',
  label,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const displayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const opt = options.find((o) => o.value === value[0]);
      return opt?.label || placeholder;
    }
    return `已选 ${value.length} 项`;
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-[#606266] whitespace-nowrap">{label}：</span>}
      <div ref={ref} className={`relative ${width}`}>
        <div
          onClick={() => setOpen(!open)}
          className="h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded cursor-pointer flex items-center justify-between hover:border-[#c0c4cc] focus-within:border-[#2f54eb] select-none"
        >
          <span className={value.length === 0 ? 'text-[#909399]' : ''}>
            {displayText()}
          </span>
          <svg
            className={`w-3 h-3 text-[#909399] transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {open && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#dcdfe6] rounded shadow-lg max-h-[240px] overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#909399] text-center">暂无数据</div>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center gap-2 hover:bg-[#f5f7fa] ${
                    value.includes(opt.value) ? 'text-[#2f54eb] bg-[#ecf5ff]' : 'text-[#303133]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(opt.value)}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 cursor-pointer pointer-events-none"
                  />
                  <span className="flex-1 truncate">{opt.label}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
