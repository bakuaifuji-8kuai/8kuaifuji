import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/store/useStore';

function resetStore() {
  const state = useStore.getState();
  state.setWarehouses([]);
  state.setPositions([]);
  state.setCategories([]);
  state.setProducts([]);
  state.setSuppliers([]);
  state.setSupplierAssessments([]);
  state.setSupplierQualifications([]);
  state.setSupplierChangeRequests([]);
  state.setCustomers([]);
  state.setEmployees([]);
  state.setProductApplications([]);
  state.setContracts([]);
  state.setProductContracts([]);
  state.setExhibitionProjects([]);
  state.setPurchaseOrders([]);
  state.setInventories([]);
  state.setBatchInventories([]);
  state.setInboundOrders([]);
  state.setInboundApplications([]);
  state.setOutboundOrders([]);
  state.setTransferOrders([]);
  state.setReturnOrders([]);
  state.setPendingReturns([]);
  state.setCheckOrders([]);
  state.setAssetEquipments([]);
  state.setScrappedRecords([]);
  state.setDamagedRecords([]);
  state.setStockTransactions([]);
  state.setStockTransfers([]);
  state.setWorkOrderConfigs([]);
  state.setImplementationProjects([]);
  state.setServiceProjects([]);
  state.setProcurementPlans([]);
  state.setApprovalFlowConfigs([]);
  state.setProcurementDemands([]);
  state.setContractLedgers([]);
  state.setProcurementOrders([]);
  state.setProcurementInspections([]);
  state.setBiddings([]);
  state.setSupplierQuotes([]);
  state.setWebsiteInfos([]);
  state.setContractTemplates([]);
  state.setContractWarnings([]);
  state.setContractPurchaseOrders([]);
  useStore.setState({
    frozenExhibitions: [],
    freezeLogs: [],
    contractPurchaseOrderChanges: [],
    procurementDemandChanges: [],
    procurementOrderChanges: [],
  });
}

describe('展会冻结逻辑', () => {
  beforeEach(() => {
    resetStore();
  });

  it('freezeExhibitions 应该添加冻结记录和日志', () => {
    const state = useStore.getState();
    state.freezeExhibitions(['展会A', '展会B'], '操作员1', '测试备注');

    const current = useStore.getState();
    expect(current.frozenExhibitions).toHaveLength(2);
    expect(current.frozenExhibitions[0].exhibitionName).toBe('展会A');
    expect(current.frozenExhibitions[1].exhibitionName).toBe('展会B');
    expect(current.frozenExhibitions[0].operator).toBe('操作员1');
    expect(current.freezeLogs).toHaveLength(1);
    expect(current.freezeLogs[0].operateType).toBe('freeze');
    expect(current.freezeLogs[0].exhibitionNames).toEqual(['展会A', '展会B']);
    expect(current.freezeLogs[0].remark).toBe('测试备注');
  });

  it('unfreezeExhibitions 应该移除冻结记录并添加解冻日志', () => {
    const state = useStore.getState();
    state.freezeExhibitions(['展会A', '展会B', '展会C'], '操作员1');

    const state2 = useStore.getState();
    state2.unfreezeExhibitions(['展会B'], '操作员2', '解冻备注');

    const current = useStore.getState();
    expect(current.frozenExhibitions).toHaveLength(2);
    expect(current.frozenExhibitions.map(f => f.exhibitionName)).toContain('展会A');
    expect(current.frozenExhibitions.map(f => f.exhibitionName)).toContain('展会C');
    expect(current.frozenExhibitions.map(f => f.exhibitionName)).not.toContain('展会B');
    expect(current.freezeLogs).toHaveLength(2);
    expect(current.freezeLogs[0].operateType).toBe('unfreeze');
    expect(current.freezeLogs[0].operator).toBe('操作员2');
  });

  it('isExhibitionFrozen 应该正确判断冻结状态', () => {
    const state = useStore.getState();
    expect(state.isExhibitionFrozen('展会A')).toBe(false);

    state.freezeExhibitions(['展会A'], '操作员');
    expect(state.isExhibitionFrozen('展会A')).toBe(true);
    expect(state.isExhibitionFrozen('展会B')).toBe(false);
  });

  it('重复冻结同一展会不应添加重复记录', () => {
    const state = useStore.getState();
    state.freezeExhibitions(['展会A'], '操作员1');
    state.freezeExhibitions(['展会A'], '操作员2');

    const current = useStore.getState();
    expect(current.frozenExhibitions.filter(f => f.exhibitionName === '展会A')).toHaveLength(1);
    expect(current.freezeLogs).toHaveLength(2);
  });

  it('解冻不存在的展会不应报错', () => {
    const state = useStore.getState();
    expect(() => {
      state.unfreezeExhibitions(['不存在的展会'], '操作员');
    }).not.toThrow();

    const current = useStore.getState();
    expect(current.freezeLogs).toHaveLength(1);
    expect(current.freezeLogs[0].operateType).toBe('unfreeze');
  });
});

describe('合同采购订单变更审批', () => {
  beforeEach(() => {
    resetStore();
  });

  const createTestOrder = () => ({
    id: 'CPO001',
    orderNo: 'CPO20240101001',
    contractId: 'CON001',
    contractNo: 'CON-2024-001',
    contractName: '测试合同',
    supplierId: 'SUP001',
    supplierName: '测试供应商',
    status: 'draft' as const,
    createTime: '2024-01-01 10:00:00',
    creator: '测试员',
    details: [
      {
        id: 'DET001',
        orderId: 'CPO001',
        productId: 'PRD001',
        productCode: 'P10001',
        productName: '测试产品',
        unit: '个',
        contractQuantity: 100,
        deliveredQuantity: 0,
        orderQuantity: 50,
        unitPrice: 100,
        amount: 5000,
      }
    ],
  });

  const createTestChange = () => ({
    id: 'CHG001',
    changeNo: 'CHG20240101001',
    orderId: 'CPO001',
    orderNo: 'CPO20240101001',
    changeReason: '数量调整',
    changeTime: '2024-01-02 10:00:00',
    changer: '申请人',
    beforeDetails: [
      {
        id: 'DET001',
        orderId: 'CPO001',
        productId: 'PRD001',
        productCode: 'P10001',
        productName: '测试产品',
        unit: '个',
        contractQuantity: 100,
        deliveredQuantity: 0,
        orderQuantity: 50,
        unitPrice: 100,
        amount: 5000,
      }
    ],
    afterDetails: [
      {
        id: 'DET001',
        orderId: 'CPO001',
        productId: 'PRD001',
        productCode: 'P10001',
        productName: '测试产品',
        unit: '个',
        contractQuantity: 100,
        deliveredQuantity: 0,
        orderQuantity: 80,
        unitPrice: 100,
        amount: 8000,
      }
    ],
    status: 'pending' as const,
  });

  it('approveContractPurchaseOrderChange 应更新变更状态和订单明细', () => {
    const state = useStore.getState();
    state.setContractPurchaseOrders([createTestOrder()]);
    state.addContractPurchaseOrderChange(createTestChange());

    const state2 = useStore.getState();
    state2.approveContractPurchaseOrderChange('CPO001', 'CHG001', '审批人A');

    const current = useStore.getState();
    const change = current.contractPurchaseOrderChanges.find(c => c.id === 'CHG001');
    expect(change?.status).toBe('approved');
    expect(change?.approver).toBe('审批人A');
    expect(change?.approveTime).toBeDefined();

    const order = current.contractPurchaseOrders.find(o => o.id === 'CPO001');
    expect(order?.details[0].orderQuantity).toBe(80);
    expect(order?.details[0].amount).toBe(8000);
    expect(order?.changeHistory).toHaveLength(1);
    expect(order?.changeHistory?.[0].status).toBe('approved');
  });

  it('rejectContractPurchaseOrderChange 应只更新变更状态', () => {
    const state = useStore.getState();
    state.setContractPurchaseOrders([createTestOrder()]);
    state.addContractPurchaseOrderChange(createTestChange());

    const state2 = useStore.getState();
    state2.rejectContractPurchaseOrderChange('CPO001', 'CHG001', '审批人B');

    const current = useStore.getState();
    const change = current.contractPurchaseOrderChanges.find(c => c.id === 'CHG001');
    expect(change?.status).toBe('rejected');
    expect(change?.approver).toBe('审批人B');

    const order = current.contractPurchaseOrders.find(o => o.id === 'CPO001');
    expect(order?.details[0].orderQuantity).toBe(50);
    expect(order?.changeHistory).toBeUndefined();
  });

  it('审批不存在的变更不应报错', () => {
    const state = useStore.getState();
    state.setContractPurchaseOrders([createTestOrder()]);

    expect(() => {
      state.approveContractPurchaseOrderChange('CPO001', 'NONEXISTENT', '审批人');
    }).not.toThrow();

    const order = useStore.getState().contractPurchaseOrders.find(o => o.id === 'CPO001');
    expect(order?.details[0].orderQuantity).toBe(50);
  });
});

describe('仓库CRUD操作', () => {
  beforeEach(() => {
    resetStore();
  });

  it('addWarehouse 应该添加仓库', () => {
    const state = useStore.getState();
    state.addWarehouse({
      id: 'WH001',
      code: 'WH20240101001',
      warehouseNo: 'TEST001',
      name: '测试仓库',
      category: 'general',
      property: 'physical',
      address: '测试地址',
      manager: '测试员',
      status: 'enabled',
      createTime: '2024-01-01',
    });

    const current = useStore.getState();
    expect(current.warehouses).toHaveLength(1);
    expect(current.warehouses[0].name).toBe('测试仓库');
  });

  it('updateWarehouse 应该更新指定仓库', () => {
    const state = useStore.getState();
    state.addWarehouse({
      id: 'WH001',
      code: 'WH20240101001',
      warehouseNo: 'TEST001',
      name: '旧名称',
      category: 'general',
      property: 'physical',
      address: '测试地址',
      manager: '测试员',
      status: 'enabled',
      createTime: '2024-01-01',
    });

    const state2 = useStore.getState();
    state2.updateWarehouse('WH001', { name: '新名称', status: 'disabled' });

    const current = useStore.getState();
    expect(current.warehouses[0].name).toBe('新名称');
    expect(current.warehouses[0].status).toBe('disabled');
    expect(current.warehouses[0].code).toBe('WH20240101001');
  });

  it('deleteWarehouse 应该删除指定仓库', () => {
    const state = useStore.getState();
    state.addWarehouse({
      id: 'WH001',
      code: 'WH20240101001',
      warehouseNo: 'TEST001',
      name: '测试仓库',
      category: 'general',
      property: 'physical',
      address: '测试地址',
      manager: '测试员',
      status: 'enabled',
      createTime: '2024-01-01',
    });

    const state2 = useStore.getState();
    state2.deleteWarehouse('WH001');

    const current = useStore.getState();
    expect(current.warehouses).toHaveLength(0);
  });
});

describe('合同预警逻辑', () => {
  beforeEach(() => {
    resetStore();
  });

  it('markContractWarningRead 应该标记预警为已读', () => {
    const state = useStore.getState();
    state.addContractWarning({
      id: 'WARN001',
      contractId: 'CON001',
      contractNo: 'CON-001',
      contractName: '测试合同',
      warningType: 'expiring',
      warningDate: '2024-12-01',
      content: '合同即将到期',
      isRead: false,
      isHandled: false,
    });

    const state2 = useStore.getState();
    state2.markContractWarningRead('WARN001');

    const current = useStore.getState();
    expect(current.contractWarnings[0].isRead).toBe(true);
  });

  it('handleContractWarning 应该标记预警为已处理', () => {
    const state = useStore.getState();
    state.addContractWarning({
      id: 'WARN001',
      contractId: 'CON001',
      contractNo: 'CON-001',
      contractName: '测试合同',
      warningType: 'expiring',
      warningDate: '2024-12-01',
      content: '合同即将到期',
      isRead: false,
      isHandled: false,
    });

    const state2 = useStore.getState();
    state2.handleContractWarning('WARN001', '处理人A');

    const current = useStore.getState();
    expect(current.contractWarnings[0].isHandled).toBe(true);
    expect(current.contractWarnings[0].handler).toBe('处理人A');
    expect(current.contractWarnings[0].handleTime).toBeDefined();
  });
});

describe('库存流水记录', () => {
  beforeEach(() => {
    resetStore();
  });

  it('addStockTransaction 应该在列表开头添加流水记录', () => {
    const state = useStore.getState();
    state.addStockTransaction({
      id: 'TX001',
      transactionNo: 'TX20240101001',
      transactionTime: '2024-01-01 10:00:00',
      transactionType: 'inbound',
      productId: 'PRD001',
      productCode: 'P10001',
      productName: '测试产品',
      warehouseId: 'WH001',
      warehouseName: '测试仓库',
      positionId: 'POS001',
      positionName: 'A01',
      quantity: 100,
      operator: '测试员',
    });

    state.addStockTransaction({
      id: 'TX002',
      transactionNo: 'TX20240101002',
      transactionTime: '2024-01-02 10:00:00',
      transactionType: 'outbound',
      productId: 'PRD001',
      productCode: 'P10001',
      productName: '测试产品',
      warehouseId: 'WH001',
      warehouseName: '测试仓库',
      positionId: 'POS001',
      positionName: 'A01',
      quantity: -50,
      operator: '测试员',
    });

    const current = useStore.getState();
    expect(current.stockTransactions).toHaveLength(2);
    expect(current.stockTransactions[0].id).toBe('TX002');
    expect(current.stockTransactions[1].id).toBe('TX001');
  });
});

describe('供应商CRUD操作', () => {
  beforeEach(() => {
    resetStore();
  });

  it('addSupplier 应该添加供应商', () => {
    const state = useStore.getState();
    state.addSupplier({
      id: 'SUP001',
      code: 'S001',
      name: '测试供应商',
      contact: '张三',
      phone: '13800138000',
      address: '测试地址',
      status: 'enabled',
    });

    const current = useStore.getState();
    expect(current.suppliers).toHaveLength(1);
    expect(current.suppliers[0].name).toBe('测试供应商');
  });

  it('updateSupplier 应该部分更新供应商信息', () => {
    const state = useStore.getState();
    state.addSupplier({
      id: 'SUP001',
      code: 'S001',
      name: '旧名称',
      contact: '张三',
      phone: '13800138000',
      address: '旧地址',
      status: 'enabled',
    });

    const state2 = useStore.getState();
    state2.updateSupplier('SUP001', { name: '新名称', phone: '13900139000' });

    const current = useStore.getState();
    expect(current.suppliers[0].name).toBe('新名称');
    expect(current.suppliers[0].phone).toBe('13900139000');
    expect(current.suppliers[0].address).toBe('旧地址');
  });
});
