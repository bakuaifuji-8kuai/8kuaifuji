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

/** 安全除法，避免 / 0 */
function safeDiv(a: number, b: number): number | undefined {
  if (!b || b === 0 || !isFinite(a)) return undefined;
  return a / b;
}

/**
 * 从明细 item 取单价（根据模式）
 * 适配所有明细类型：ProcurementDemandItem / SupplierQuoteDetail / OrderDetail
 *
 * 反推规则（当不含税字段不存在时）：
 *   不含税单价 = 含税单价 / (1 + taxRate)
 */
export function getDisplayUnitPrice(
  item: Record<string, any>,
  mode: TaxViewMode
): number | undefined {
  if (mode === 'inclusive') {
    return item.unitPriceIncludingTax ?? item.unitPrice;
  }
  // 不含税：优先 unitPriceExcludingTax，否则反推
  if (item.unitPriceExcludingTax !== undefined && item.unitPriceExcludingTax !== null) {
    return item.unitPriceExcludingTax;
  }
  const inc = item.unitPriceIncludingTax ?? item.unitPrice;
  const rate = item.taxRate ?? 0;
  if (inc !== undefined && inc !== null && rate > 0) {
    return Math.round((inc / (1 + rate)) * 100) / 100;
  }
  return inc; // 无税率则等同不含税
}

/**
 * 从明细 item 取金额（根据模式）
 *
 * 反推规则：
 *   不含税金额 = amount - taxAmount（税额已知时最准）
 *   或 = 含税金额 / (1 + taxRate)
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
  // 不含税
  if (item.amountExcludingTax !== undefined && item.amountExcludingTax !== null) {
    return item.amountExcludingTax;
  }
  // 优先用 amount - taxAmount
  const inc = item.amountIncludingTax ?? item.amount;
  if (inc !== undefined && inc !== null) {
    if (item.taxAmount !== undefined && item.taxAmount !== null) {
      return Math.round((inc - item.taxAmount) * 100) / 100;
    }
    const rate = item.taxRate ?? 0;
    if (rate > 0) {
      return Math.round((inc / (1 + rate)) * 100) / 100;
    }
    return inc;
  }
  return item.totalAmountExcludingTax;
}

/**
 * 从工单/报价汇总取总金额（含反推）
 */
export function getDisplayTotal(
  source: Record<string, any>,
  mode: TaxViewMode
): number | undefined {
  if (mode === 'inclusive') {
    return (
      source.totalAmountIncludingTax ??
      source.totalAmount ??
      source.amount ??
      source.totalAmountExcludingTax
    );
  }
  // 不含税：优先已存字段，否则反推
  if (source.totalAmountExcludingTax !== undefined && source.totalAmountExcludingTax !== null) {
    return source.totalAmountExcludingTax;
  }
  const inc = source.totalAmountIncludingTax ?? source.totalAmount ?? source.amount;
  if (inc !== undefined && inc !== null) {
    if (source.taxAmount !== undefined && source.taxAmount !== null) {
      return Math.round((inc - source.taxAmount) * 100) / 100;
    }
    const rate = source.taxRate ?? 0;
    if (rate > 0) {
      return Math.round((inc / (1 + rate)) * 100) / 100;
    }
    return inc;
  }
  return source.totalAmountExcludingTax;
}

/**
 * 批量汇总一组明细的总金额（根据模式）
 * 用于替代手写的 details.reduce((s,d) => s + d.amount, 0)
 */
export function sumDisplayAmount(
  details: Record<string, any>[] | undefined | null,
  mode: TaxViewMode
): number {
  if (!details || details.length === 0) return 0;
  return details.reduce((sum, d) => {
    const v = getDisplayAmount(d, mode);
    return sum + (v ?? 0);
  }, 0);
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
