import { PrimaryButton, DefaultButton } from './Button';

interface SearchFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  options?: string[];
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
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#606266] whitespace-nowrap">{label}：</span>
      {type === 'input' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || `请输入${label}`}
          className={`${width} h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] placeholder:text-[#c0c4cc] rounded focus:outline-none focus:border-[#2f54eb] focus:ring-1 focus:ring-[#2f54eb]/20`}
        />
      )}
      {type === 'select' && options && (
        <select
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${width} h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]`}
        >
          <option value="">请选择</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
      {type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${width} h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]`}
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
    <div className="bg-white border border-[#e4e7ed] rounded px-4 py-3 mb-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">{children}</div>
      <div className="flex items-center gap-2 pt-1">
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
