import { describe, it, expect } from 'vitest';
import { calculateFifoConsumption, applyFifoDeductions } from '@/lib/fifo';
import type { BatchInventory } from '@/types';

const createBatch = (
  id: string,
  batchNo: string,
  productId: string,
  quantity: number,
  inboundTime: string,
  warehouseId: string = 'WH001'
): BatchInventory => ({
  id,
  batchNo,
  productId,
  productName: '测试产品',
  productCode: 'P001',
  warehouseId,
  warehouseName: '测试仓库',
  positionId: 'POS001',
  positionName: 'A01',
  quantity,
  originalQuantity: quantity,
  inboundTime,
});

describe('calculateFifoConsumption', () => {
  it('单批次完全消耗', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 50);

    expect(result.consumptions).toHaveLength(1);
    expect(result.consumptions[0].batchId).toBe('B1');
    expect(result.consumptions[0].quantity).toBe(50);
    expect(result.remaining).toBe(0);
    expect(result.totalAvailable).toBe(100);
  });

  it('多批次按FIFO顺序消耗', () => {
    const batches = [
      createBatch('B2', 'BATCH002', 'PRD001', 50, '2024-01-02 10:00:00'),
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
      createBatch('B3', 'BATCH003', 'PRD001', 200, '2024-01-03 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 120);

    expect(result.consumptions).toHaveLength(2);
    expect(result.consumptions[0].batchId).toBe('B1');
    expect(result.consumptions[0].quantity).toBe(100);
    expect(result.consumptions[1].batchId).toBe('B2');
    expect(result.consumptions[1].quantity).toBe(20);
    expect(result.remaining).toBe(0);
  });

  it('库存不足时返回剩余数量', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 30, '2024-01-01 10:00:00'),
      createBatch('B2', 'BATCH002', 'PRD001', 20, '2024-01-02 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 100);

    expect(result.consumptions).toHaveLength(2);
    expect(result.remaining).toBe(50);
    expect(result.totalAvailable).toBe(50);
  });

  it('按仓库过滤批次', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00', 'WH001'),
      createBatch('B2', 'BATCH002', 'PRD001', 200, '2024-01-02 10:00:00', 'WH002'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 150, 'WH001');

    expect(result.consumptions).toHaveLength(1);
    expect(result.consumptions[0].batchId).toBe('B1');
    expect(result.remaining).toBe(50);
    expect(result.totalAvailable).toBe(100);
  });

  it('只消耗指定产品的批次', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
      createBatch('B2', 'BATCH002', 'PRD002', 200, '2024-01-02 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 150);

    expect(result.consumptions).toHaveLength(1);
    expect(result.consumptions[0].batchId).toBe('B1');
    expect(result.remaining).toBe(50);
  });

  it('跳过数量为0的批次', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 0, '2024-01-01 10:00:00'),
      createBatch('B2', 'BATCH002', 'PRD001', 100, '2024-01-02 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 50);

    expect(result.consumptions).toHaveLength(1);
    expect(result.consumptions[0].batchId).toBe('B2');
    expect(result.remaining).toBe(0);
  });

  it('空批次列表返回空结果', () => {
    const result = calculateFifoConsumption([], 'PRD001', 50);

    expect(result.consumptions).toHaveLength(0);
    expect(result.remaining).toBe(50);
    expect(result.totalAvailable).toBe(0);
  });

  it('消耗数量为0返回空结果', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 0);

    expect(result.consumptions).toHaveLength(0);
    expect(result.remaining).toBe(0);
    expect(result.totalAvailable).toBe(100);
  });

  it('精确匹配库存数量', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 10, '2024-01-01 10:00:00'),
      createBatch('B2', 'BATCH002', 'PRD001', 20, '2024-01-02 10:00:00'),
      createBatch('B3', 'BATCH003', 'PRD001', 30, '2024-01-03 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 60);

    expect(result.consumptions).toHaveLength(3);
    expect(result.remaining).toBe(0);
    expect(result.totalAvailable).toBe(60);
  });

  it('同日入库按批次ID排序的稳定性', () => {
    const batches = [
      createBatch('B2', 'BATCH002', 'PRD001', 50, '2024-01-01 10:00:00'),
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
    ];

    const result = calculateFifoConsumption(batches, 'PRD001', 120);

    expect(result.consumptions).toHaveLength(2);
    expect(result.consumptions[0].quantity + result.consumptions[1].quantity).toBe(120);
    expect(result.remaining).toBe(0);
  });
});

describe('applyFifoDeductions', () => {
  it('应正确扣减批次库存', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
      createBatch('B2', 'BATCH002', 'PRD001', 200, '2024-01-02 10:00:00'),
    ];

    const result = applyFifoDeductions(batches, [
      { batchId: 'B1', batchNo: 'BATCH001', quantity: 30 },
    ]);

    expect(result.find((b) => b.id === 'B1')?.quantity).toBe(70);
    expect(result.find((b) => b.id === 'B2')?.quantity).toBe(200);
  });

  it('扣减到0不应出现负数', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 50, '2024-01-01 10:00:00'),
    ];

    const result = applyFifoDeductions(batches, [
      { batchId: 'B1', batchNo: 'BATCH001', quantity: 100 },
    ]);

    expect(result[0].quantity).toBe(0);
  });

  it('空消耗列表返回原批次', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
    ];

    const result = applyFifoDeductions(batches, []);

    expect(result[0].quantity).toBe(100);
  });

  it('不应修改原始批次对象', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
    ];

    const result = applyFifoDeductions(batches, [
      { batchId: 'B1', batchNo: 'BATCH001', quantity: 30 },
    ]);

    expect(batches[0].quantity).toBe(100);
    expect(result[0].quantity).toBe(70);
  });

  it('多个消耗记录同一批次累加扣减', () => {
    const batches = [
      createBatch('B1', 'BATCH001', 'PRD001', 100, '2024-01-01 10:00:00'),
    ];

    const result = applyFifoDeductions(batches, [
      { batchId: 'B1', batchNo: 'BATCH001', quantity: 20 },
      { batchId: 'B1', batchNo: 'BATCH001', quantity: 30 },
    ]);

    expect(result[0].quantity).toBe(50);
  });
});
