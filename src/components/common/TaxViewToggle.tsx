/**
 * 含税/不含税视图切换 Toggle
 *
 * 需求背景（2026-09-17）：
 *   每个页面自己维护 state，因为"一个单据内口径统一，但不同单据可以口径不同"。
 *   点击即切换当前页面所有表格/卡片的显示口径。
 *
 * 使用方式：
 *   const [taxMode, setTaxMode] = useState<TaxViewMode>('inclusive');
 *   <TaxViewToggle value={taxMode} onChange={setTaxMode} />
 *
 *   然后表格列渲染时：
 *   render: (row) => fmtPrice(getDisplayUnitPrice(row, taxMode))
 *   title: '单价' + PRICE_LABEL_SUFFIX(taxMode)
 */
import type { TaxViewMode } from '@/utils/taxView';

interface Props {
  value: TaxViewMode;
  onChange: (mode: TaxViewMode) => void;
  size?: 'sm' | 'md';
}

export default function TaxViewToggle({ value, onChange, size = 'sm' }: Props) {
  const isInclusive = value === 'inclusive';
  const h = size === 'sm' ? 'h-7' : 'h-9';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padX = size === 'sm' ? 'px-3' : 'px-4';

  return (
    <div className={`inline-flex ${h} items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5`}>
      {/* 含税 */}
      <button
        type="button"
        onClick={() => onChange('inclusive')}
        className={`${padX} ${textSize} h-full rounded-md font-medium transition-all ${
          isInclusive
            ? 'bg-white shadow-sm text-indigo-600 border border-slate-200'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        含税
      </button>
      {/* 不含税 */}
      <button
        type="button"
        onClick={() => onChange('exclusive')}
        className={`${padX} ${textSize} h-full rounded-md font-medium transition-all ${
          !isInclusive
            ? 'bg-white shadow-sm text-indigo-600 border border-slate-200'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        不含税
      </button>
    </div>
  );
}
