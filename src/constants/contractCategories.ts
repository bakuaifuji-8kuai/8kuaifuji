export interface CategoryItem {
  label: string;
  value: string;
}

export const CONTRACT_CATEGORIES: CategoryItem[] = [
  { label: '展览服务', value: 'exhibition_service' },
  { label: '展览展示服务', value: 'exhibition_display' },
  { label: '招采合同', value: 'procurement' },
  { label: '招商合同', value: 'investment' },
  { label: '其他类合同', value: 'other' },
];

export function getCategoryLabel(value: string): string {
  const item = CONTRACT_CATEGORIES.find((c) => c.value === value);
  return item?.label || value;
}
