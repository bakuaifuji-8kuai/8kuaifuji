/**
 * 业务单据编号生成器
 *
 * 统一规则：前缀 + YYYY + MM(或省略) + DD(或省略) + N位序号
 * 序号按当天/当月已存在编号的最大值 +1 计算
 *
 * 注意：本为 COS 静态演示原型，编号在前端生成，多标签页或刷新后可能重复。
 * 正式生产应由后端原子分配，不能依赖前端。
 */

/** 编号配置 */
interface SerialConfig {
  /** 前缀，如 CGQQ / HT / JJ */
  prefix: string;
  /** 是否包含日（DD），false 则只有 YYYYMM，默认 true */
  includeDay?: boolean;
  /** 序号位数，默认 3 */
  seqLength?: number;
}

/**
 * 生成一个新的业务编号
 * @param cfg  编号配置
 * @param existingNos 当前所有已存在的同类型编号（用于算最大序号）
 * @param date 基准日期（默认今天）
 */
export function genSerialNo(
  cfg: SerialConfig,
  existingNos: string[],
  date: Date = new Date()
): string {
  const { prefix, includeDay = true, seqLength = 3 } = cfg;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  // 构建正则：^CGQQ20250908(\d{3})$ 或 ^CGJH202509(\d{3})$
  const datePart = includeDay ? `${y}${m}${d}` : `${y}${m}`;
  const re = new RegExp(`^${escapeRegExp(prefix)}${datePart}(\\d{${seqLength}})$`);

  let max = 0;
  for (const no of existingNos) {
    const match = no.match(re);
    if (match) {
      const n = Number(match[1]);
      if (n > max) max = n;
    }
  }
  const seq = String(max + 1).padStart(seqLength, '0');
  return `${prefix}${datePart}${seq}`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ====== 各单据的编号配置常量 ======
export const SERIAL_CONFIG = {
  // 采购需求申请：CGQQ + YYYYMMDD + 3位
  DEMAND: { prefix: 'CGQQ', includeDay: true, seqLength: 3 },
  // 招采计划：CGJH + YYYYMM + 3位（月度计划，按月分片）
  PLAN: { prefix: 'CGJH', includeDay: false, seqLength: 3 },
  // 采购工单（竞价）：JJ + YYYYMMDD + 3位
  BIDDING: { prefix: 'JJ', includeDay: true, seqLength: 3 },
  // 合同台账：HT + YYYYMMDD + 3位
  CONTRACT: { prefix: 'HT', includeDay: true, seqLength: 3 },
  // 采购订单：CPO + YYYYMMDD + 3位
  CPO: { prefix: 'CPO', includeDay: true, seqLength: 3 },
  // 验收记录：YS + YYYYMMDD + 3位
  INSPECTION: { prefix: 'YS', includeDay: true, seqLength: 3 },
  // 合同归档：CA + YYYY + 4位（按年分片）
  ARCHIVE: { prefix: 'CA', includeDay: false, seqLength: 4 },
} as const;
