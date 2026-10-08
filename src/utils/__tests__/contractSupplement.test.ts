/**
 * contractSupplement.ts 单元测试
 *
 * 运行方式：npx vite-node src/utils/__tests__/contractSupplement.test.ts
 * （零新依赖，Node 内置 assert + 已有的 vite-node）
 */
import assert from 'node:assert/strict';
import { splitContracts, computeAccumulated, attachAccumulated } from '../contractSupplement';
import type { ContractLedger } from '@/types';

// ==================== 测试数据工厂 ====================

/** 创建一份主合同（最小必要字段） */
function mkPrimary(overrides: Partial<ContractLedger> = {}): ContractLedger {
  return {
    id: 'P1',
    contractNo: 'CL001',
    contractName: '主合同 A',
    contractNature: 'procurement',
    contractTier: 'primary',
    amount: 1_000_000,
    terminationDate: '2026-12-31',
    status: 'active',
    signingDate: '2026-01-01',
    ...overrides,
  } as ContractLedger;
}

/** 创建一份补充协议 */
function mkSupplement(
  parentId: string,
  overrides: Partial<ContractLedger> = {},
): ContractLedger {
  return {
    id: `${parentId}-S${overrides.supplementIndex ?? 1}`,
    contractNo: `${parentId}-S${overrides.supplementIndex ?? 1}`,
    contractName: '补充协议',
    contractNature: 'procurement',
    contractTier: 'supplement',
    parentContractId: parentId,
    supplementAmount: overrides.supplementAmount ?? 200_000,
    supplementType: overrides.supplementType ?? 'price_change',
    supplementIndex: overrides.supplementIndex ?? 1,
    terminationDate: overrides.terminationDate ?? '2027-03-31',
    status: overrides.status ?? 'active',
    signingDate: overrides.signingDate ?? '2026-06-01',
    amount: 0,
    ...overrides,
  } as ContractLedger;
}

// ==================== splitContracts ====================

function testSplitContracts() {
  console.log('🔹 splitContracts');

  // Case 1: 空数组
  {
    const { primaryList, supplementMap } = splitContracts([]);
    assert.deepEqual(primaryList, [], '空数组 → primaryList 为空');
    assert.deepEqual(supplementMap, {}, '空数组 → supplementMap 为空 map');
  }

  // Case 2: 只有主合同，没有补充协议
  {
    const primaries = [mkPrimary({ id: 'P1' }), mkPrimary({ id: 'P2' })];
    const { primaryList, supplementMap } = splitContracts(primaries);
    assert.equal(primaryList.length, 2, '主合同全部保留');
    assert.deepEqual(supplementMap, {}, '没有补充协议时 map 为空');
  }

  // Case 3: 主合同 + 补充协议混在一起
  {
    const primaries = [mkPrimary({ id: 'P1' }), mkPrimary({ id: 'P2' })];
    const supplements = [
      mkSupplement('P1', { id: 'P1-S1', supplementIndex: 1 }),
      mkSupplement('P1', { id: 'P1-S2', supplementIndex: 2 }),
      mkSupplement('P2', { id: 'P2-S1', supplementIndex: 1 }),
    ];
    const all = [...primaries, ...supplements];
    const { primaryList, supplementMap } = splitContracts(all);

    assert.equal(primaryList.length, 2, '主合同分离出来');
    assert.ok(!primaryList.some((c) => c.contractTier === 'supplement'), 'primaryList 不含补充协议');
    assert.equal(supplementMap['P1'].length, 2, 'P1 有 2 份补充协议');
    assert.equal(supplementMap['P2'].length, 1, 'P2 有 1 份补充协议');
    assert.equal(supplementMap['P1'][0].supplementIndex, 1, '同主合同下的补充协议按 supplementIndex 升序排');
    assert.equal(supplementMap['P1'][1].supplementIndex, 2);
  }

  // Case 4: legacy 数据（没有 contractTier 字段）→ 都当成主合同
  {
    const legacy = [
      { ...mkPrimary(), contractTier: undefined },
      { ...mkPrimary({ id: 'P2' }), contractTier: undefined },
    ] as ContractLedger[];
    const { primaryList, supplementMap } = splitContracts(legacy);
    assert.equal(primaryList.length, 2, 'legacy 数据全进 primaryList');
    assert.deepEqual(supplementMap, {}, '没有 supplement 字段时 map 为空');
  }

  // Case 5: 补充协议的 parentContractId 对应主合同不存在（孤儿补充协议）→ 进 supplementMap 但不进 primaryList
  {
    const orphans = [mkSupplement('NO_SUCH_PARENT', { id: 'orphan-1' })];
    const { primaryList, supplementMap } = splitContracts(orphans);
    assert.equal(primaryList.length, 0, '孤儿补充协议不进 primaryList');
    assert.equal(supplementMap['NO_SUCH_PARENT']?.length, 1, '孤儿补充协议仍在 map 里（key 是不存在的 parentId）');
  }

  console.log('   ✅ 5 cases passed');
}

// ==================== computeAccumulated ====================

function testComputeAccumulated() {
  console.log('🔹 computeAccumulated');

  // Case 1: 没有补充协议 → 累计 = 原始额，累计终止日期 = 主合同终止日期
  {
    const primary = mkPrimary({ amount: 1_000_000, terminationDate: '2026-12-31' });
    const result = computeAccumulated(primary, []);
    assert.equal(result.accumulatedAmount, 1_000_000, '无补充 → 累计额 = 原始额');
    assert.equal(result.accumulatedTerminationDate, '2026-12-31', '无补充 → 累计终止日期 = 主合同');
    assert.equal(result.supplementCount, 0);
    assert.equal(result.supplementAmountSum, 0);
  }

  // Case 2: 一份正补充（加钱 + 延期）
  {
    const primary = mkPrimary({ amount: 1_000_000, terminationDate: '2026-12-31' });
    const supplements = [
      mkSupplement('P1', { supplementAmount: 200_000, terminationDate: '2027-03-31', status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 1_200_000, '加钱 20 万 → 累计 120 万');
    assert.equal(result.accumulatedTerminationDate, '2027-03-31', '延期 → 累计终止日期取最晚');
    assert.equal(result.supplementCount, 1);
    assert.equal(result.supplementAmountSum, 200_000);
  }

  // Case 3: 一份负补充（减钱）
  {
    const primary = mkPrimary({ amount: 1_000_000 });
    const supplements = [
      mkSupplement('P1', { supplementAmount: -500_000, status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 500_000, '减钱 50 万 → 累计 50 万');
    assert.equal(result.supplementAmountSum, -500_000);
  }

  // Case 4: 多份补充，正+负混合
  {
    const primary = mkPrimary({ amount: 1_000_000 });
    const supplements = [
      mkSupplement('P1', { supplementIndex: 1, supplementAmount: 200_000, status: 'active' }),
      mkSupplement('P1', { supplementIndex: 2, supplementAmount: -80_000, status: 'active' }),
      mkSupplement('P1', { supplementIndex: 3, supplementAmount: 300_000, status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.supplementAmountSum, 420_000, '+20 -8 +30 = 42 万');
    assert.equal(result.accumulatedAmount, 1_420_000, '100 + 42 = 142 万');
    assert.equal(result.supplementCount, 3);
  }

  // Case 5: 补充协议被驳回（rejected）→ 不计入累计
  {
    const primary = mkPrimary({ amount: 1_000_000, terminationDate: '2026-12-31' });
    const supplements = [
      mkSupplement('P1', { supplementAmount: 200_000, status: 'invalid', terminationDate: '2027-03-31' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 1_000_000, '驳回 → 不计入累计额');
    assert.equal(result.accumulatedTerminationDate, '2026-12-31', '驳回 → 不影响累计终止日期');
    assert.equal(result.supplementCount, 1, 'supplementCount 含被驳回的（展示用）');
    assert.equal(result.supplementAmountSum, 0, 'supplementAmountSum 只算有效的');
  }

  // Case 6: 两份补充协议，一份被驳回一份生效 → 只有生效的计入
  {
    const primary = mkPrimary({ amount: 1_000_000 });
    const supplements = [
      mkSupplement('P1', { supplementIndex: 1, supplementAmount: 200_000, status: 'invalid' }),
      mkSupplement('P1', { supplementIndex: 2, supplementAmount: 300_000, status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 1_300_000, '只有 active 的 +30 万计入');
    assert.equal(result.supplementAmountSum, 300_000);
    assert.equal(result.supplementCount, 2);
  }

  // Case 7: 主合同没有终止日期，补充协议有 → 累计终止日期取补充的
  {
    const primary = mkPrimary({ terminationDate: undefined });
    const supplements = [
      mkSupplement('P1', { terminationDate: '2027-06-30', status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedTerminationDate, '2027-06-30');
  }

  // Case 8: 主合同和所有补充协议都没有终止日期 → 累计终止日期为 undefined
  {
    const primary = mkPrimary({ terminationDate: undefined });
    const supplements = [
      mkSupplement('P1', { terminationDate: undefined, status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedTerminationDate, undefined);
  }

  console.log('   ✅ 8 cases passed');
}

// ==================== attachAccumulated ====================

function testAttachAccumulated() {
  console.log('🔹 attachAccumulated');

  // Case 1: 空 primaryList
  {
    const result = attachAccumulated([], {});
    assert.deepEqual(result, [], '空 primaryList → 空结果');
  }

  // Case 2: 主合同没有补充协议（supplementMap 里没有对应 key）
  {
    const primaries = [mkPrimary({ id: 'P1', amount: 500_000 })];
    const result = attachAccumulated(primaries, {});
    assert.equal(result.length, 1);
    assert.equal(result[0].accumulatedAmount, 500_000);
    assert.equal(result[0].supplementCount, 0);
  }

  // Case 3: 完整链路 — splitContracts + attachAccumulated 走一遍
  {
    const primaries = [
      mkPrimary({ id: 'P1', amount: 1_000_000, terminationDate: '2026-12-31' }),
      mkPrimary({ id: 'P2', amount: 2_000_000, terminationDate: '2026-06-30' }),
    ];
    const supplements = [
      mkSupplement('P1', { supplementIndex: 1, supplementAmount: 200_000, terminationDate: '2027-03-31' }),
      mkSupplement('P1', { supplementIndex: 2, supplementAmount: -50_000, status: 'invalid' }),
      mkSupplement('P2', { supplementIndex: 1, supplementAmount: 500_000 }),
    ];
    const all = [...primaries, ...supplements];
    const { primaryList, supplementMap } = splitContracts(all);
    const enriched = attachAccumulated(primaryList, supplementMap);

    assert.equal(enriched.length, 2, '只返回主合同数量');

    const p1 = enriched.find((c) => c.id === 'P1')!;
    assert.equal(p1.accumulatedAmount, 1_200_000, 'P1: 100 + 20（驳回的 -5 不计）');
    assert.equal(p1.accumulatedTerminationDate, '2027-03-31', 'P1: 延期生效');
    assert.equal(p1.supplementCount, 2, 'P1: 有 2 份补充（含驳回）');
    assert.equal(p1.supplementAmountSum, 200_000, 'P1: 生效补充合计 +20 万');

    const p2 = enriched.find((c) => c.id === 'P2')!;
    assert.equal(p2.accumulatedAmount, 2_500_000, 'P2: 200 + 50');
    assert.equal(p2.accumulatedTerminationDate, '2027-03-31', 'P2: 补充协议 2027-03-31 晚于主合同 2026-06-30');
    assert.equal(p2.supplementCount, 1);
  }

  // Case 4: enriched 对象保留原始字段（ContractLedgerWithAccumulated 不是全新对象）
  {
    const primaries = [mkPrimary({ id: 'P1', contractName: '原始合同名' })];
    const enriched = attachAccumulated(primaries, {});
    assert.equal(enriched[0].contractName, '原始合同名', '原始字段保留');
    assert.equal(enriched[0].id, 'P1', '原始 id 保留');
  }

  console.log('   ✅ 4 cases passed');
}

// ==================== 边界条件：空 supplementAmount ====================

function testEdgeCases() {
  console.log('🔹 边界条件');

  // supplementAmount = 0 的补充协议是否计入？
  {
    const primary = mkPrimary({ amount: 1_000_000 });
    const supplements = [
      mkSupplement('P1', { supplementAmount: 0, supplementType: 'scope_change', status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 1_000_000, '0 元补充不改变累计额');
    assert.equal(result.supplementAmountSum, 0);
    assert.equal(result.supplementCount, 1, '但 supplementCount 仍然计 1 份');
  }

  // 主合同 amount 为 0 的极端情况
  {
    const primary = mkPrimary({ amount: 0 });
    const supplements = [
      mkSupplement('P1', { supplementAmount: 500_000, status: 'active' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 500_000);
  }

  // 全部被驳回的补充协议 → 累计额 = 原始额
  {
    const primary = mkPrimary({ amount: 1_000_000 });
    const supplements = [
      mkSupplement('P1', { supplementAmount: 200_000, status: 'invalid' }),
      mkSupplement('P1', { supplementAmount: 300_000, status: 'pending' }),
    ];
    const result = computeAccumulated(primary, supplements);
    assert.equal(result.accumulatedAmount, 1_000_000, 'rejected + pending 都不计入');
    assert.equal(result.supplementCount, 2);
  }

  console.log('   ✅ 3 cases passed');
}

// ==================== 运行 ====================

function run() {
  const start = Date.now();
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const suites: Array<{ name: string; fn: () => void }> = [
    { name: 'splitContracts', fn: testSplitContracts },
    { name: 'computeAccumulated', fn: testComputeAccumulated },
    { name: 'attachAccumulated', fn: testAttachAccumulated },
    { name: '边界条件', fn: testEdgeCases },
  ];

  for (const suite of suites) {
    try {
      suite.fn();
      passed++;
    } catch (e: any) {
      failed++;
      errors.push(`${suite.name}: ${e?.message ?? e}`);
      console.log(`   ❌ ${suite.name} FAILED: ${e?.message ?? e}`);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log('');
  console.log('========================================');
  console.log(` 测试结果：${passed} 组通过 · ${failed} 组失败 · ${duration}s`);
  console.log('========================================');

  if (errors.length) {
    console.log('\n失败详情：');
    errors.forEach((e) => console.log(`  ❌ ${e}`));
    process.exit(1);
  } else {
    console.log('\n🎉 全部通过！');
    process.exit(0);
  }
}

run();
