import type { BatchInventory } from '@/types';

export interface BatchConsumption {
  batchId: string;
  batchNo: string;
  quantity: number;
}

export interface FifoResult {
  consumptions: BatchConsumption[];
  remaining: number;
  totalAvailable: number;
}

export function calculateFifoConsumption(
  batches: BatchInventory[],
  productId: string,
  quantity: number,
  warehouseId?: string
): FifoResult {
  const productBatches = batches
    .filter(
      (b) =>
        b.productId === productId &&
        b.quantity > 0 &&
        (!warehouseId || b.warehouseId === warehouseId)
    )
    .sort((a, b) => a.inboundTime.localeCompare(b.inboundTime));

  let remaining = quantity;
  const consumptions: BatchConsumption[] = [];

  for (const batch of productBatches) {
    if (remaining <= 0) break;
    const deduct = Math.min(batch.quantity, remaining);
    consumptions.push({ batchId: batch.id, batchNo: batch.batchNo, quantity: deduct });
    remaining -= deduct;
  }

  const totalAvailable = productBatches.reduce((sum, b) => sum + b.quantity, 0);

  return { consumptions, remaining, totalAvailable };
}

export function applyFifoDeductions(
  batches: BatchInventory[],
  consumptions: BatchConsumption[]
): BatchInventory[] {
  const deductionMap = new Map<string, number>();
  for (const c of consumptions) {
    deductionMap.set(c.batchId, (deductionMap.get(c.batchId) || 0) + c.quantity);
  }

  return batches.map((b) => {
    const deduct = deductionMap.get(b.id);
    if (deduct !== undefined) {
      return { ...b, quantity: Math.max(0, b.quantity - deduct) };
    }
    return b;
  });
}
