import { PrimaryButton, DefaultButton } from './Button';

interface SearchFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  options?: string[] | { value: string; label: string }[];
  type?: 'input' | 'select' | 'date';
  width?: string;
}

// 单个搜索字段：标签 + 控件
export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  options,
  type = 'input',
  width = 'w-[220px]',
}: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm text-slate-600 whitespace-nowrap font-medium">{label}：</span>
      {type === 'input' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || `请输入${label}`}
          className={`${width} h-9 px-3 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 rounded-lg focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-200 transition-all duration-200 bg-white`}
        />
      )}
      {type === 'select' && options && (
        <select
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${width} h-9 px-3 border border-slate-200 text-sm text-slate-700 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-200 transition-all duration-200 cursor-pointer`}
        >
          <option value="">请选择</option>
          {options.map((opt) => {
            if (typeof opt === 'string') {
              return <option key={opt} value={opt}>{opt}</option>;
            }
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
      )}
      {type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${width} h-9 px-3 border border-slate-200 text-sm text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-200 transition-all duration-200 bg-white`}
        />
      )}
    </div>
  );
}

// 搜索区容器
export function SearchBar({
  children,
  onSearch,
  onReset,
  searchLabel = '搜索',
  resetLabel = '重置',
}: {
  children: React.ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  searchLabel?: string;
  resetLabel?: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 mb-4 shadow-md">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4">{children}</div>
      <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
        <PrimaryButton onClick={onSearch} icon={<span>🔍</span>}>
          {searchLabel}
        </PrimaryButton>
        <DefaultButton onClick={onReset} icon={<span>↻</span>}>
          {resetLabel}
        </DefaultButton>
      </div>
    </div>
  );
}

export default { SearchBar, SearchField };
