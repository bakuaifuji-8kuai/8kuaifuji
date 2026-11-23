/**
 * PL-01：需求明细 ↔ 合同 聚合工具函数
 *
 * 解决的问题：
 *  同一个需求明细行，可能被多个合同全额关联（如 LED屏明细预算 ¥50,000，
 *  供应商A签 ¥50,000、供应商B签 ¥50,000），预警时把同一明细关联的
 *  所有合同金额取 MAX 对比明细自己的预算，而不是取 SUM。
 *
 * 数据来源：
 *  合同侧 ContractLedger.detailLinks[].detailId → 精确指向需求明细行
 *
 * 单位约定：
 *  - ContractLedger.amount 单位是「万元」，这里统一 ×10000 转「元」
 *  - ProcurementDemandDetail.amountIncludingTax 单位是「元」
 */

import type { ContractLedger, ProcurementDemand, ProcurementDemandDetail } from '../types';

export interface DetailStatusItem {
  /** 明细ID（detailId） */
  detailId: string;
  /** 该明细自己的需求单ID */
  demandId: string;
  /** 明细预算（元）= amountIncludingTax */
  budget: number;
  /** 关联到这条明细的所有合同数组 */
  linkedContracts: ContractLedger[];
  /** 所有关联合同金额的 MAX（元） */
  maxContractAmountYuan: number;
  /** 所有关联合同金额的 SUM（元）—— 备用，预警不用但可能展示 */
  sumContractAmountYuan: number;
  /** max / budget（预算比） */
  ratio: number;
  /** 预警状态 */
  status: 'ok' | 'warning' | 'danger';
  /** 状态阈值说明 */
  statusLabel: string;
}

// ---------------------------------------------------------------------------
// 1) 按 detailId 分组所有关联合同
// ---------------------------------------------------------------------------

/**
 * 把所有合同的 detailLinks 拍平成 Map<detailId, ContractLedger[]>
 * 一个合同可能关联多个 detailId → 会同时出现在多个分组里（这是预期行为）
 */
export function buildDetailContractMap(
  contracts: ContractLedger[]
): Map<string, ContractLedger[]> {
  const map = new Map<string, ContractLedger[]>();
  if (!Array.isArray(contracts)) return map;

  contracts.forEach((c) => {
    const links = c.detailLinks;
    if (!Array.isArray(links) || links.length === 0) return;
    links.forEach((link) => {
      const key = link.detailId;
      if (!key) return;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    });
  });
  return map;
}

// ---------------------------------------------------------------------------
// 2) 单条明细状态计算
// ---------------------------------------------------------------------------

const CONTRACT_AMOUNT_UNIT_FACTOR = 10000; // 万元 → 元

function contractAmountToYuan(c: ContractLedger): number {
  const amount = typeof c.amount === 'number' && !Number.isNaN(c.amount) ? c.amount : 0;
  return amount * CONTRACT_AMOUNT_UNIT_FACTOR;
}

function calcStatus(ratio: number): { status: DetailStatusItem['status']; statusLabel: string } {
  if (ratio <= 0) return { status: 'ok', statusLabel: '未关联合同' };
  if (ratio > 1) return { status: 'danger', statusLabel: `超支 ${Math.round((ratio - 1) * 100)}%` };
  if (ratio >= 0.9) return { status: 'warning', statusLabel: `接近预算 ${Math.round(ratio * 100)}%` };
  return { status: 'ok', statusLabel: `预算内 ${Math.round(ratio * 100)}%` };
}

/**
 * 计算单条需求明细的合同关联状态
 */
export function computeDetailStatus(
  detail: ProcurementDemandDetail,
  allContracts: ContractLedger[]
): DetailStatusItem {
  const contractMap = buildDetailContractMap(allContracts);
  const linked = contractMap.get(detail.id) ?? [];

  const budget = typeof detail.amountIncludingTax === 'number' ? detail.amountIncludingTax : 0;
  const amountsYuan = linked.map(contractAmountToYuan);
  const maxYuan = amountsYuan.length > 0 ? Math.max(...amountsYuan) : 0;
  const sumYuan = amountsYuan.reduce((a, b) => a + b, 0);
  const ratio = budget > 0 ? maxYuan / budget : 0;
  const { status, statusLabel } = calcStatus(ratio);

  return {
    detailId: detail.id,
    demandId: detail.demandId,
    budget,
    linkedContracts: linked,
    maxContractAmountYuan: maxYuan,
    sumContractAmountYuan: sumYuan,
    ratio,
    status,
    statusLabel,
  };
}

// ---------------------------------------------------------------------------
// 3) 全量明细预警列表（给预警看板用）
// ---------------------------------------------------------------------------

/**
 * 遍历所有需求的所有明细，返回带合同关联状态的数组
 * 默认只返回「有关联合同的明细」+「状态不为 ok 的明细」——
 * 预警看板通常只关心这些，避免噪声
 */
export function getAllDetailAlerts(
  contracts: ContractLedger[],
  demands: ProcurementDemand[],
  opts: { includeOk?: boolean } = {}
): Array<DetailStatusItem & { productName: string; demandNo?: string }> {
  const { includeOk = false } = opts;
  if (!Array.isArray(demands)) return [];

  const out: Array<DetailStatusItem & { productName: string; demandNo?: string }> = [];

  demands.forEach((demand) => {
    const details = Array.isArray(demand.details) ? demand.details : [];
    details.forEach((detail) => {
      const s = computeDetailStatus(detail, contracts);
      const hasLink = s.linkedContracts.length > 0;
      if (!includeOk && !hasLink) return;
      if (!includeOk && s.status === 'ok' && hasLink) {
        // 关联了合同但 MAX ≤ 预算 → 看板里只作为次要展示，过滤掉
        // （可根据实际需要调整；预警看板只放 warning/danger）
        return;
      }
      out.push({
        ...s,
        productName: detail.productName,
        demandNo: demand.demandNo,
      });
    });
  });

  // danger 排最前，warning 次之，ok 最后
  out.sort((a, b) => {
    const order = { danger: 0, warning: 1, ok: 2 };
    return order[a.status] - order[b.status];
  });

  return out;
}

// ---------------------------------------------------------------------------
// 4) 格式化小工具
// ---------------------------------------------------------------------------

export function formatYuan(amount: number): string {
  if (!Number.isFinite(amount)) return '¥0';
  if (amount >= 10000) {
    const wan = amount / 10000;
    return wan >= 100 ? `¥${wan.toFixed(0)}万` : `¥${wan.toFixed(1)}万`;
  }
  return `¥${Math.round(amount).toLocaleString('zh-CN')}`;
}
