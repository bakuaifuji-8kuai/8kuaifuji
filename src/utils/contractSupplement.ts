/**
 * 主合同 / 补充协议 累计计算工具
 *
 * 核心职责：
 *   1. splitContracts — 从扁平 contractLedgers 数组中分离出主合同列表 + 补充协议 Map
 *   2. computeAccumulated — 计算单份主合同的累计金额和累计终止日期
 *
 * 设计原则：
 *   - 不改变原始数据（不写库），纯运行时计算
 *   - 只对生效状态（active / approved）的补充协议做累计
 *   - 主合同的 amount 始终存原始签署额，累计额单独返回
 */

import type { ContractLedger } from '@/types';

/** 从完整 contractLedgers 数组中分离 */
export function splitContracts(list: ContractLedger[]): {
  primaryList: ContractLedger[];
  supplementMap: Record<string, ContractLedger[]>;
} {
  const primaryList: ContractLedger[] = [];
  const supplementMap: Record<string, ContractLedger[]> = {};

  for (const c of list) {
    if (c.contractTier === 'supplement' && c.parentContractId) {
      // 补充协议：挂到对应主合同下
      if (!supplementMap[c.parentContractId]) {
        supplementMap[c.parentContractId] = [];
      }
      supplementMap[c.parentContractId].push(c);
    } else {
      // 主合同（或 legacy 数据没标 tier 的）
      primaryList.push(c);
    }
  }

  // 每份主合同下的补充协议按 supplementIndex 或签订日期排序
  for (const key of Object.keys(supplementMap)) {
    supplementMap[key].sort((a, b) => {
      const ai = a.supplementIndex ?? 999;
      const bi = b.supplementIndex ?? 999;
      if (ai !== bi) return ai - bi;
      return (a.signingDate || '').localeCompare(b.signingDate || '');
    });
  }

  return { primaryList, supplementMap };
}

/** 判断补充协议是否计入累计（active 或 approved） */
const EFFECTIVE_STATUSES = new Set(['active', 'approved', 'expired']);
function isEffective(c: ContractLedger): boolean {
  return EFFECTIVE_STATUSES.has(c.status);
}

/** 计算单份主合同的累计值 */
export function computeAccumulated(
  primary: ContractLedger,
  supplements: ContractLedger[],
): {
  accumulatedAmount: number;
  accumulatedTerminationDate?: string;
  supplementCount: number;
  supplementAmountSum: number;
} {
  const effective = supplements.filter(isEffective);

  // 1. 累计金额 = 主合同原始额 + Σ 有效补充协议的 supplementAmount（带正负号）
  const supplementAmountSum = effective.reduce(
    (sum, s) => sum + (s.supplementAmount || 0),
    0,
  );
  const accumulatedAmount = (primary.amount || 0) + supplementAmountSum;

  // 2. 累计终止日期 = max(主合同 + 所有有效补充协议的 terminationDate)
  const allDates = [
    primary.terminationDate,
    ...effective.map((s) => s.terminationDate),
  ].filter((d): d is string => Boolean(d));

  // 日期字符串升序排，最后一个就是最晚的
  const accumulatedTerminationDate = allDates.length
    ? [...allDates].sort().pop()
    : undefined;

  return {
    accumulatedAmount,
    accumulatedTerminationDate,
    supplementCount: supplements.length, // 总补充数（含已驳回的）
    supplementAmountSum,
  };
}

/** 给 ContractLedger 的扩展类型（台账用，不存库） */
export type ContractLedgerWithAccumulated = ContractLedger & {
  accumulatedAmount: number;
  accumulatedTerminationDate?: string;
  supplementCount: number;
  supplementAmountSum: number;
};

/** 批量给主合同挂累计值（台账用，一次算完） */
export function attachAccumulated(
  primaryList: ContractLedger[],
  supplementMap: Record<string, ContractLedger[]>,
): ContractLedgerWithAccumulated[] {
  return primaryList.map((p) => ({
    ...p,
    ...computeAccumulated(p, supplementMap[p.id] || []),
  }));
}
