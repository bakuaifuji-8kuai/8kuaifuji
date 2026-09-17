/**
 * 含税视图切换工具
 *
 * 需求背景（2026-09-17）：
 *   招采模块各页面需支持"含税/不含税"视图切换。每个页面自己维护开关 state，
 *   因为"一个单据内口径统一，但不同单据可以口径不同"。
 *
 * 作用范围：
 *   ✅ 表格列渲染（单价列、金额列、汇总行）
 *   ✅ 卡片展示（最低单价、最低税率、合计金额）
 *   ✅ 详情弹窗（含税金额 vs 不含税金额分区显示）
 *   ❌ 表单输入（表单两个字段联动计算，开关不影响输入层）
 *
 * 字段映射（types 里已经双字段完备，不需要改数据结构）：
 *   含税单价 → unitPriceIncludingTax 或 兜底 unitPrice
 *   不含税单价 → unitPriceExcludingTax
 *   含税金额 → amountIncludingTax / totalAmountIncludingTax / totalAmount
 *   不含税金额 → amountExcludingTax / totalAmountExcludingTax
 *   税率 → taxRate（含税模式才显示）
 */

export type TaxViewMode = 'inclusive' | 'exclusive';

/** 表格列标题后缀：含税/不含税 */
export const PRICE_LABEL_SUFFIX = (mode: TaxViewMode) =>
  mode === 'inclusive' ? '(含税)' : '(不含税)';

/** 金额列标题后缀 */
export const AMOUNT_LABEL_SUFFIX = (mode: TaxViewMode) =>
  mode === 'inclusive' ? '(含税)' : '(不含税)';

/**
 * 从明细 item 取单价（根据模式）
 * 适配所有明细类型：ProcurementDemandItem / BiddingItem / QuoteDetail / OrderDetail
 */
export function getDisplayUnitPrice(
  item: Record<string, any>,
  mode: TaxViewMode
): number | undefined {
  if (mode === 'inclusive') {
    // 含税：优先 unitPriceIncludingTax，旧字段兜底 unitPrice
    return item.unitPriceIncludingTax ?? item.unitPrice;
  }
  // 不含税：unitPriceExcludingTax
  return item.unitPriceExcludingTax;
}

/**
 * 从明细 item 取金额（根据模式）
 * 适配所有明细类型的 amount 字段
 */
export function getDisplayAmount(
  item: Record<string, any>,
  mode: TaxViewMode
): number | undefined {
  if (mode === 'inclusive') {
    return (
      item.amountIncludingTax ??
      item.totalAmountIncludingTax ??
      item.amount ??
      item.totalAmount
    );
  }
  return (
    item.amountExcludingTax ??
    item.totalAmountExcludingTax
  );
}

/**
 * 从工单汇总取总金额
 */
export function getDisplayTotal(
  bidding: Record<string, any>,
  mode: TaxViewMode
): number | undefined {
  if (mode === 'inclusive') {
    return (
      bidding.totalAmountIncludingTax ??
      bidding.totalAmount ??
      bidding.totalAmountExcludingTax
    );
  }
  return (
    bidding.totalAmountExcludingTax ??
    bidding.totalAmountIncludingTax
  );
}

/**
 * 税率是否要显示
 * 规则：含税模式才显示税率列，不含税模式隐藏
 */
export function showTaxRate(mode: TaxViewMode): boolean {
  return mode === 'inclusive';
}

/**
 * 格式化金额显示（带千分位，空值显示 '-'）
 */
export function fmtPrice(v: number | undefined | null): string {
  if (v === undefined || v === null || isNaN(v)) return '-';
  return v.toLocaleString();
}

/**
 * 格式化税率（转百分比，空值显示 '-'）
 */
export function fmtTaxRate(rate: number | undefined | null): string {
  if (rate === undefined || rate === null || isNaN(rate)) return '-';
  return (rate * 100).toFixed(0) + '%';
}
