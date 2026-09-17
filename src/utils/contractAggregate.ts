/**
 * 合同台账 — paidAmount 自动聚合工具
 *
 * 需求背景（2026-09-17）：
 *   招采需求立项确认阶段新增「是否需签订合同」选择：
 *   - needContract='yes' → 走标准链路（建工单 → 建合同 → 审批 → 归档）
 *   - needContract='no'  → 直接挂到一个"执行中"的已有合同台账上，
 *     该需求的 estimatedAmount 自动计入合同的 paidAmount
 *
 * paidAmount 计算规则：
 *   展示值 = paidAmountBase（手动填的基础值）
 *          + Σ 每个 linkedDemandIds 中需求的"有效已挂账金额"
 *
 * 有效已挂账金额优先级（按精度从高到低）：
 *   1. 如果需求已生成工单 → 用工单成交金额 totalAmountIncludingTax（最准确）
 *   2. 还没工单           → 用需求 estimatedAmount（预估金额）
 *
 * 使用方式：
 *   台账页面渲染 paidAmount 时调用 getAutoPaidAmount(ledger, demands, biddings)
 *   不再直接读 ledger.paidAmount
 */
import type { ContractLedger, ProcurementDemand, Bidding } from '@/types';

export function getAutoPaidAmount(
  ledger: ContractLedger,
  demands: ProcurementDemand[],
  biddings: Bidding[] = []
): number {
  const base = ledger.paidAmountBase ?? ledger.paidAmount ?? 0;
  const linkedIds = ledger.linkedDemandIds ?? [];

  const linkedTotal = demands
    .filter((d) => linkedIds.includes(d.id))
    .reduce((sum, d) => {
      // 优先工单成交金额（已转化为合同的真实金额）
      const bidding = biddings.find((b) => b.demandId === d.id || b.demandNo === d.demandNo);
      if (bidding?.totalAmountIncludingTax) {
        // 工单金额是"元"单位，合同台账是"万元"单位 → / 10000
        return sum + bidding.totalAmountIncludingTax / 10000;
      }
      // 兜底：需求预估金额（也是元）
      return sum + (d.estimatedAmount ?? 0) / 10000;
    }, 0);

  return Math.round((base + linkedTotal) * 100) / 100;
}

/**
 * 合同是否可被 needContract='no' 的需求关联
 * 规则：status='active'（执行中）的招采类合同才能挂新需求
 */
export function isContractLinkable(ledger: ContractLedger): boolean {
  return (
    ledger.status === 'active' &&
    ledger.contractNature === 'procurement'
  );
}

/**
 * 挂账：给合同追加一个需求 ID（去重）
 */
export function addLinkedDemand(ledger: ContractLedger, demandId: string): string[] {
  const existing = ledger.linkedDemandIds ?? [];
  if (existing.includes(demandId)) return existing;
  return [...existing, demandId];
}

/**
 * 解绑：从合同移除一个需求 ID
 */
export function removeLinkedDemand(ledger: ContractLedger, demandId: string): string[] {
  return (ledger.linkedDemandIds ?? []).filter((id) => id !== demandId);
}
