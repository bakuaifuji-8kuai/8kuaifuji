import { test, expect } from '@playwright/test';
import { useStore } from '@/store/useStore';

test.describe('展会冻结/解冻逻辑', () => {
  test.beforeEach(() => {
    useStore.getState().frozenExhibitions = [];
    useStore.getState().freezeLogs = [];
  });

  test('冻结展会 - 单个展会', () => {
    const store = useStore.getState();
    
    store.freezeExhibitions(['春季展会'], '管理员');
    
    const newState = useStore.getState();
    expect(newState.frozenExhibitions).toHaveLength(1);
    expect(newState.frozenExhibitions[0].exhibitionName).toBe('春季展会');
    expect(newState.frozenExhibitions[0].operator).toBe('管理员');
    expect(newState.freezeLogs).toHaveLength(1);
    expect(newState.freezeLogs[0].operateType).toBe('freeze');
  });

  test('冻结展会 - 多个展会', () => {
    const store = useStore.getState();
    
    store.freezeExhibitions(['春季展会', '夏季展会', '秋季展会'], '采购经理', '测试冻结');
    
    const newState = useStore.getState();
    expect(newState.frozenExhibitions).toHaveLength(3);
    expect(newState.frozenExhibitions.map(f => f.exhibitionName)).toEqual(['春季展会', '夏季展会', '秋季展会']);
    expect(newState.freezeLogs[0].exhibitionNames).toEqual(['春季展会', '夏季展会', '秋季展会']);
    expect(newState.freezeLogs[0].remark).toBe('测试冻结');
  });

  test('冻结展会 - 重复展会不重复添加', () => {
    const store = useStore.getState();
    
    store.freezeExhibitions(['春季展会'], '管理员');
    store.freezeExhibitions(['春季展会', '夏季展会'], '管理员');
    
    const newState = useStore.getState();
    expect(newState.frozenExhibitions).toHaveLength(2);
  });

  test('解冻展会', () => {
    const store = useStore.getState();
    
    store.freezeExhibitions(['春季展会', '夏季展会'], '管理员');
    store.unfreezeExhibitions(['春季展会'], '管理员');
    
    const newState = useStore.getState();
    expect(newState.frozenExhibitions).toHaveLength(1);
    expect(newState.frozenExhibitions[0].exhibitionName).toBe('夏季展会');
    expect(newState.freezeLogs).toHaveLength(2);
    expect(newState.freezeLogs[0].operateType).toBe('unfreeze');
  });

  test('解冻不存在的展会不报错', () => {
    const store = useStore.getState();
    
    store.unfreezeExhibitions(['不存在的展会'], '管理员');
    
    const newState = useStore.getState();
    expect(newState.frozenExhibitions).toHaveLength(0);
    expect(newState.freezeLogs).toHaveLength(1);
  });

  test('isExhibitionFrozen - 冻结状态检查', () => {
    const store = useStore.getState();
    
    store.freezeExhibitions(['春季展会'], '管理员');
    
    expect(useStore.getState().isExhibitionFrozen('春季展会')).toBe(true);
    expect(useStore.getState().isExhibitionFrozen('夏季展会')).toBe(false);
  });

  test('isWorkOrderFrozen - 工单冻结状态检查', () => {
    const store = useStore.getState();
    
    store.freezeExhibitions(['2026春季国际会展'], '管理员');
    
    const workOrderWithFrozenExhibition = { workOrderId: 'WO001', exhibitionName: '2026春季国际会展' };
    const workOrderWithUnfrozenExhibition = { workOrderId: 'WO002', exhibitionName: '未冻结展会' };
    
    expect(useStore.getState().isWorkOrderFrozen('WO001')).toBe(false);
  });
});

test.describe('合同预警处理逻辑', () => {
  test.beforeEach(() => {
    useStore.getState().contractWarnings = [
      {
        id: 'WARN001',
        contractId: 'CT001',
        contractNo: 'HT2024001',
        contractName: '测试合同',
        warningType: 'expiring',
        warningDate: '2024-12-31',
        content: '合同即将到期',
        isRead: false,
        isHandled: false,
      },
      {
        id: 'WARN002',
        contractId: 'CT002',
        contractNo: 'HT2024002',
        contractName: '已读合同',
        warningType: 'expired',
        warningDate: '2024-01-01',
        content: '合同已到期',
        isRead: true,
        isHandled: false,
      },
    ];
  });

  test('标记合同预警为已读', () => {
    const store = useStore.getState();
    
    store.markContractWarningRead('WARN001');
    
    const newState = useStore.getState();
    const warning = newState.contractWarnings.find(w => w.id === 'WARN001');
    expect(warning?.isRead).toBe(true);
    expect(newState.contractWarnings.find(w => w.id === 'WARN002')?.isRead).toBe(true);
  });

  test('处理合同预警', () => {
    const store = useStore.getState();
    
    store.handleContractWarning('WARN001', '张三');
    
    const newState = useStore.getState();
    const warning = newState.contractWarnings.find(w => w.id === 'WARN001');
    expect(warning?.isHandled).toBe(true);
    expect(warning?.handler).toBe('张三');
    expect(warning?.handleTime).toBeDefined();
  });
});

test.describe('合同采购订单变更审批逻辑', () => {
  test.beforeEach(() => {
    useStore.getState().contractPurchaseOrders = [];
    useStore.getState().contractPurchaseOrderChanges = [];
  });

  test('审批通过合同采购订单变更', () => {
    const store = useStore.getState();
    
    const orderId = 'CPO001';
    const changeId = 'CHG001';
    
    store.addContractPurchaseOrder({
      id: orderId,
      orderNo: 'CPO2024001',
      contractId: 'CT001',
      contractNo: 'HT2024001',
      contractName: '采购合同',
      supplierId: 'SUP001',
      supplierName: '供应商A',
      status: 'draft',
      createTime: '2024-01-01',
      creator: '采购经理',
      details: [
        {
          id: 'D001',
          orderId,
          productId: 'PRD001',
          productCode: 'P001',
          productName: '物料A',
          unit: '个',
          contractQuantity: 100,
          deliveredQuantity: 0,
          orderQuantity: 50,
          unitPrice: 100,
          amount: 5000,
        },
      ],
    });
    
    store.addContractPurchaseOrderChange({
      id: changeId,
      changeNo: 'CHG2024001',
      orderId,
      orderNo: 'CPO2024001',
      changeReason: '调整数量',
      changeTime: '2024-01-02',
      changer: '采购员',
      beforeDetails: [
        {
          id: 'D001',
          orderId,
          productId: 'PRD001',
          productCode: 'P001',
          productName: '物料A',
          unit: '个',
          contractQuantity: 100,
          deliveredQuantity: 0,
          orderQuantity: 50,
          unitPrice: 100,
          amount: 5000,
        },
      ],
      afterDetails: [
        {
          id: 'D001',
          orderId,
          productId: 'PRD001',
          productCode: 'P001',
          productName: '物料A',
          unit: '个',
          contractQuantity: 100,
          deliveredQuantity: 0,
          orderQuantity: 80,
          unitPrice: 100,
          amount: 8000,
        },
      ],
      status: 'pending',
    });
    
    store.approveContractPurchaseOrderChange(orderId, changeId, '审批人');
    
    const newState = useStore.getState();
    const change = newState.contractPurchaseOrderChanges.find(c => c.id === changeId);
    const order = newState.contractPurchaseOrders.find(o => o.id === orderId);
    
    expect(change?.status).toBe('approved');
    expect(change?.approver).toBe('审批人');
    expect(order?.details[0].orderQuantity).toBe(80);
    expect(order?.changeHistory).toHaveLength(1);
  });

  test('驳回合同采购订单变更', () => {
    const store = useStore.getState();
    
    const orderId = 'CPO001';
    const changeId = 'CHG001';
    
    store.addContractPurchaseOrder({
      id: orderId,
      orderNo: 'CPO2024001',
      contractId: 'CT001',
      contractNo: 'HT2024001',
      contractName: '采购合同',
      supplierId: 'SUP001',
      supplierName: '供应商A',
      status: 'draft',
      createTime: '2024-01-01',
      creator: '采购经理',
      details: [
        {
          id: 'D001',
          orderId,
          productId: 'PRD001',
          productCode: 'P001',
          productName: '物料A',
          unit: '个',
          contractQuantity: 100,
          deliveredQuantity: 0,
          orderQuantity: 50,
          unitPrice: 100,
          amount: 5000,
        },
      ],
    });
    
    store.addContractPurchaseOrderChange({
      id: changeId,
      changeNo: 'CHG2024001',
      orderId,
      orderNo: 'CPO2024001',
      changeReason: '调整数量',
      changeTime: '2024-01-02',
      changer: '采购员',
      beforeDetails: [],
      afterDetails: [],
      status: 'pending',
    });
    
    store.rejectContractPurchaseOrderChange(orderId, changeId, '审批人');
    
    const newState = useStore.getState();
    const change = newState.contractPurchaseOrderChanges.find(c => c.id === changeId);
    const order = newState.contractPurchaseOrders.find(o => o.id === orderId);
    
    expect(change?.status).toBe('rejected');
    expect(change?.approver).toBe('审批人');
    expect(order?.changeHistory).toBeUndefined();
  });

  test('审批不存在的变更不报错', () => {
    const store = useStore.getState();
    
    store.approveContractPurchaseOrderChange('CPO001', 'CHG999', '审批人');
    
    const newState = useStore.getState();
    expect(newState.contractPurchaseOrderChanges).toHaveLength(0);
  });
});