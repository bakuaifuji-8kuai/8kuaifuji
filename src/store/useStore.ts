import { create } from 'zustand';
import type {
  Warehouse, Position, ProductCategory, Product, Supplier, SupplierAssessment, Customer,
  Inventory, InboundOrder, InboundApplication, OutboundOrder, CheckOrder, TransferOrder, ReturnOrder, PendingReturn,
  AssetEquipment, ScrappedRecord, DamagedRecord,
  BatchInventory, BatchOutboundDetail, StockTransaction, Employee, PurchaseOrder,
  ProductApplication, Contract, ProductContract, ExhibitionProject,
  WorkOrderProductConfig, Project, StockTransfer,
  // 采购管理类型
  ProcurementPlan, ProcurementDemand, ProcurementDemandChange,
  ContractLedger, ProcurementOrder, ProcurementOrderChange, ProcurementInspection,
  Bidding, SupplierQuote, WebsiteInfo, ContractTemplate, ContractWarning,
  ApprovalFlowConfig, SupplierQualification, SupplierChangeRequest,
  // 合同采购订单
  ContractPurchaseOrder, ContractPurchaseOrderChangeRecord,
  // 项目冻结
  FrozenExhibition, FreezeLog
} from '@/types';
import * as mockData from '@/mock/data';

interface WarehouseState {
  // 当前登录账号
  currentUser: { id: string; name: string; role: string; department?: string; phone?: string; email?: string };
  setCurrentUser: (user: { id: string; name: string; role: string }) => void;

  // 仓库
  warehouses: Warehouse[];
  setWarehouses: (data: Warehouse[]) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (id: string, warehouse: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;

  // 仓位
  positions: Position[];
  setPositions: (data: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, position: Partial<Position>) => void;
  deletePosition: (id: string) => void;

  // 货品分类
  categories: ProductCategory[];
  setCategories: (data: ProductCategory[]) => void;
  addCategory: (category: ProductCategory) => void;
  updateCategory: (id: string, category: Partial<ProductCategory>) => void;
  deleteCategory: (id: string) => void;

  // 货品
  products: Product[];
  setProducts: (data: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // 供应商
  suppliers: Supplier[];
  setSuppliers: (data: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // 供应商考核评估
  supplierAssessments: SupplierAssessment[];
  setSupplierAssessments: (data: SupplierAssessment[]) => void;
  addSupplierAssessment: (assessment: SupplierAssessment) => void;
  updateSupplierAssessment: (id: string, data: Partial<SupplierAssessment>) => void;
  deleteSupplierAssessment: (id: string) => void;

  // 供应商资质证书
  supplierQualifications: SupplierQualification[];
  setSupplierQualifications: (data: SupplierQualification[]) => void;
  addSupplierQualification: (q: SupplierQualification) => void;
  updateSupplierQualification: (id: string, data: Partial<SupplierQualification>) => void;
  deleteSupplierQualification: (id: string) => void;

  // 供应商变更申请
  supplierChangeRequests: SupplierChangeRequest[];
  setSupplierChangeRequests: (data: SupplierChangeRequest[]) => void;
  addSupplierChangeRequest: (req: SupplierChangeRequest) => void;
  updateSupplierChangeRequest: (id: string, data: Partial<SupplierChangeRequest>) => void;

  // 客户
  customers: Customer[];
  setCustomers: (data: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // 员工（保管人、验收人、业务员等下拉数据源）
  employees: Employee[];
  setEmployees: (data: Employee[]) => void;

  // 物资申请单
  productApplications: ProductApplication[];
  setProductApplications: (data: ProductApplication[]) => void;
  addProductApplication: (application: ProductApplication) => void;
  updateProductApplication: (id: string, application: Partial<ProductApplication>) => void;
  deleteProductApplication: (id: string) => void;

  // 采购合同
  contracts: Contract[];
  setContracts: (data: Contract[]) => void;

  // 物资合同关联
  productContracts: ProductContract[];
  setProductContracts: (data: ProductContract[]) => void;

  // 展会项目
  exhibitionProjects: ExhibitionProject[];
  setExhibitionProjects: (data: ExhibitionProject[]) => void;

  // 采购单
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: (data: PurchaseOrder[]) => void;
  addPurchaseOrder: (order: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;

  // 库存
  inventories: Inventory[];
  setInventories: (data: Inventory[]) => void;
  updateInventory: (id: string, inventory: Partial<Inventory>) => void;
  addInventory: (inventory: Inventory) => void;

  // 批次库存（FIFO）
  batchInventories: BatchInventory[];
  setBatchInventories: (data: BatchInventory[]) => void;
  addBatchInventory: (batch: BatchInventory) => void;
  updateBatchInventory: (id: string, data: Partial<BatchInventory>) => void;
  deleteBatchInventory: (id: string) => void;

  // 入库单
  inboundOrders: InboundOrder[];
  setInboundOrders: (data: InboundOrder[]) => void;
  addInboundOrder: (order: InboundOrder) => void;
  updateInboundOrder: (id: string, order: Partial<InboundOrder>) => void;
  deleteInboundOrder: (id: string) => void;

  // 入库申请单
  inboundApplications: InboundApplication[];
  setInboundApplications: (data: InboundApplication[]) => void;
  addInboundApplication: (app: InboundApplication) => void;
  updateInboundApplication: (id: string, data: Partial<InboundApplication>) => void;
  deleteInboundApplication: (id: string) => void;

  // 出库单
  outboundOrders: OutboundOrder[];
  setOutboundOrders: (data: OutboundOrder[]) => void;
  addOutboundOrder: (order: OutboundOrder) => void;
  updateOutboundOrder: (id: string, order: Partial<OutboundOrder>) => void;
  deleteOutboundOrder: (id: string) => void;

  // 调拨单
  transferOrders: TransferOrder[];
  setTransferOrders: (data: TransferOrder[]) => void;
  addTransferOrder: (order: TransferOrder) => void;
  updateTransferOrder: (id: string, order: Partial<TransferOrder>) => void;
  deleteTransferOrder: (id: string) => void;

  // 退库单
  returnOrders: ReturnOrder[];
  setReturnOrders: (data: ReturnOrder[]) => void;
  addReturnOrder: (order: ReturnOrder) => void;
  updateReturnOrder: (id: string, order: Partial<ReturnOrder>) => void;
  deleteReturnOrder: (id: string) => void;

  // 待归还记录
  pendingReturns: PendingReturn[];
  setPendingReturns: (data: PendingReturn[]) => void;
  updatePendingReturn: (id: string, data: Partial<PendingReturn>) => void;
  addPendingReturn: (data: PendingReturn) => void;
  deletePendingReturn: (id: string) => void;

  // 盘点单
  checkOrders: CheckOrder[];
  setCheckOrders: (data: CheckOrder[]) => void;
  addCheckOrder: (order: CheckOrder) => void;
  updateCheckOrder: (id: string, order: Partial<CheckOrder>) => void;
  deleteCheckOrder: (id: string) => void;

  // 资产设备档案
  assetEquipments: AssetEquipment[];
  setAssetEquipments: (data: AssetEquipment[]) => void;
  addAssetEquipment: (asset: AssetEquipment) => void;
  updateAssetEquipment: (id: string, data: Partial<AssetEquipment>) => void;
  deleteAssetEquipment: (id: string) => void;

  // 报废记录
  scrappedRecords: ScrappedRecord[];
  setScrappedRecords: (data: ScrappedRecord[]) => void;
  addScrappedRecord: (record: ScrappedRecord) => void;
  updateScrappedRecord: (id: string, data: Partial<ScrappedRecord>) => void;
  deleteScrappedRecord: (id: string) => void;

  // 报损记录
  damagedRecords: DamagedRecord[];
  setDamagedRecords: (data: DamagedRecord[]) => void;
  addDamagedRecord: (record: DamagedRecord) => void;
  updateDamagedRecord: (id: string, data: Partial<DamagedRecord>) => void;
  deleteDamagedRecord: (id: string) => void;

  // 库存流水记录
  stockTransactions: StockTransaction[];
  setStockTransactions: (data: StockTransaction[]) => void;
  addStockTransaction: (transaction: StockTransaction) => void;

  // 仓库调拨单
  stockTransfers: StockTransfer[];
  setStockTransfers: (data: StockTransfer[]) => void;
  addStockTransfer: (transfer: StockTransfer) => void;
  updateStockTransfer: (id: string, data: Partial<StockTransfer>) => void;
  deleteStockTransfer: (id: string) => void;

  // 工单物资配置
  workOrderConfigs: WorkOrderProductConfig[];
  setWorkOrderConfigs: (data: WorkOrderProductConfig[]) => void;

  // ==================== 项目管理 ====================
  // 实施项目
  implementationProjects: Project[];
  setImplementationProjects: (data: Project[]) => void;
  addImplementationProject: (project: Project) => void;
  updateImplementationProject: (id: string, data: Partial<Project>) => void;
  deleteImplementationProject: (id: string) => void;

  // 服务项目
  serviceProjects: Project[];
  setServiceProjects: (data: Project[]) => void;
  addServiceProject: (project: Project) => void;
  updateServiceProject: (id: string, data: Partial<Project>) => void;
  deleteServiceProject: (id: string) => void;

  // ==================== 采购管理系统 ====================

  // 采购计划
  procurementPlans: ProcurementPlan[];
  setProcurementPlans: (data: ProcurementPlan[]) => void;
  addProcurementPlan: (plan: ProcurementPlan) => void;
  updateProcurementPlan: (id: string, data: Partial<ProcurementPlan>) => void;
  deleteProcurementPlan: (id: string) => void;

  // 审批流程配置
  approvalFlowConfigs: ApprovalFlowConfig[];
  setApprovalFlowConfigs: (data: ApprovalFlowConfig[]) => void;
  addApprovalFlowConfig: (config: ApprovalFlowConfig) => void;
  updateApprovalFlowConfig: (id: string, data: Partial<ApprovalFlowConfig>) => void;
  deleteApprovalFlowConfig: (id: string) => void;

  // 采购需求申请
  procurementDemands: ProcurementDemand[];
  setProcurementDemands: (data: ProcurementDemand[]) => void;
  addProcurementDemand: (demand: ProcurementDemand) => void;
  updateProcurementDemand: (id: string, data: Partial<ProcurementDemand>) => void;
  deleteProcurementDemand: (id: string) => void;

  // 采购需求变更
  procurementDemandChanges: ProcurementDemandChange[];
  setProcurementDemandChanges: (data: ProcurementDemandChange[]) => void;
  addProcurementDemandChange: (change: ProcurementDemandChange) => void;
  updateProcurementDemandChange: (id: string, data: Partial<ProcurementDemandChange>) => void;

  // 合同台账
  contractLedgers: ContractLedger[];
  setContractLedgers: (data: ContractLedger[]) => void;
  addContractLedger: (ledger: ContractLedger) => void;
  updateContractLedger: (id: string, data: Partial<ContractLedger>) => void;
  deleteContractLedger: (id: string) => void;

  // 采购订单
  procurementOrders: ProcurementOrder[];
  setProcurementOrders: (data: ProcurementOrder[]) => void;
  addProcurementOrder: (order: ProcurementOrder) => void;
  updateProcurementOrder: (id: string, data: Partial<ProcurementOrder>) => void;
  deleteProcurementOrder: (id: string) => void;

  // 采购订单变更
  procurementOrderChanges: ProcurementOrderChange[];
  setProcurementOrderChanges: (data: ProcurementOrderChange[]) => void;
  addProcurementOrderChange: (change: ProcurementOrderChange) => void;
  updateProcurementOrderChange: (id: string, data: Partial<ProcurementOrderChange>) => void;

  // 验收记录
  procurementInspections: ProcurementInspection[];
  setProcurementInspections: (data: ProcurementInspection[]) => void;
  addProcurementInspection: (inspection: ProcurementInspection) => void;
  updateProcurementInspection: (id: string, data: Partial<ProcurementInspection>) => void;
  deleteProcurementInspection: (id: string) => void;

  // 竞价采购
  biddings: Bidding[];
  setBiddings: (data: Bidding[]) => void;
  addBidding: (bidding: Bidding) => void;
  updateBidding: (id: string, data: Partial<Bidding>) => void;
  deleteBidding: (id: string) => void;

  // 供应商报价单
  supplierQuotes: SupplierQuote[];
  setSupplierQuotes: (data: SupplierQuote[]) => void;
  addSupplierQuote: (quote: SupplierQuote) => void;
  updateSupplierQuote: (id: string, data: Partial<SupplierQuote>) => void;
  deleteSupplierQuote: (id: string) => void;

  // 网站信息报送登记表
  websiteInfos: WebsiteInfo[];
  setWebsiteInfos: (data: WebsiteInfo[]) => void;
  addWebsiteInfo: (info: WebsiteInfo) => void;
  updateWebsiteInfo: (id: string, data: Partial<WebsiteInfo>) => void;
  deleteWebsiteInfo: (id: string) => void;

  // 合同模板
  contractTemplates: ContractTemplate[];
  setContractTemplates: (data: ContractTemplate[]) => void;
  addContractTemplate: (template: ContractTemplate) => void;
  updateContractTemplate: (id: string, data: Partial<ContractTemplate>) => void;
  deleteContractTemplate: (id: string) => void;

  // 合同预警
  contractWarnings: ContractWarning[];
  setContractWarnings: (data: ContractWarning[]) => void;
  addContractWarning: (warning: ContractWarning) => void;
  updateContractWarning: (id: string, data: Partial<ContractWarning>) => void;
  markContractWarningRead: (id: string) => void;
  handleContractWarning: (id: string, handler: string) => void;

  // 合同采购订单
  contractPurchaseOrders: ContractPurchaseOrder[];
  setContractPurchaseOrders: (data: ContractPurchaseOrder[]) => void;
  addContractPurchaseOrder: (order: ContractPurchaseOrder) => void;
  updateContractPurchaseOrder: (id: string, data: Partial<ContractPurchaseOrder>) => void;
  deleteContractPurchaseOrder: (id: string) => void;
  // 采购订单变更
  contractPurchaseOrderChanges: ContractPurchaseOrderChangeRecord[];
  addContractPurchaseOrderChange: (change: ContractPurchaseOrderChangeRecord) => void;
  updateContractPurchaseOrderChange: (id: string, data: Partial<ContractPurchaseOrderChangeRecord>) => void;
  approveContractPurchaseOrderChange: (orderId: string, changeId: string, approver: string) => void;
  rejectContractPurchaseOrderChange: (orderId: string, changeId: string, approver: string) => void;

  // 展会冻结
  frozenExhibitions: FrozenExhibition[];
  freezeLogs: FreezeLog[];
  freezeExhibitions: (exhibitionNames: string[], operator: string, remark?: string) => void;
  unfreezeExhibitions: (exhibitionNames: string[], operator: string, remark?: string) => void;
  isExhibitionFrozen: (exhibitionName: string) => boolean;
  isWorkOrderFrozen: (workOrderId: string) => boolean;
}

export const useStore = create<WarehouseState>((set) => ({
  // 仓库
  warehouses: mockData.warehouses,
  setWarehouses: (data) => set({ warehouses: data }),
  addWarehouse: (warehouse) => set((state) => ({ warehouses: [...state.warehouses, warehouse] })),
  updateWarehouse: (id, warehouse) => set((state) => ({
    warehouses: state.warehouses.map((w) => w.id === id ? { ...w, ...warehouse } : w)
  })),
  deleteWarehouse: (id) => set((state) => ({
    warehouses: state.warehouses.filter((w) => w.id !== id)
  })),

  // 仓位
  positions: mockData.positions,
  setPositions: (data) => set({ positions: data }),
  addPosition: (position) => set((state) => ({ positions: [...state.positions, position] })),
  updatePosition: (id, position) => set((state) => ({
    positions: state.positions.map((p) => p.id === id ? { ...p, ...position } : p)
  })),
  deletePosition: (id) => set((state) => ({
    positions: state.positions.filter((p) => p.id !== id)
  })),

  // 货品分类
  categories: mockData.productCategories,
  setCategories: (data) => set({ categories: data }),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, category) => set((state) => ({
    categories: state.categories.map((c) => c.id === id ? { ...c, ...category } : c)
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id)
  })),

  // 货品
  products: mockData.products,
  setProducts: (data) => set({ products: data }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, product) => set((state) => ({
    products: state.products.map((p) => p.id === id ? { ...p, ...product } : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),

  // 供应商
  suppliers: mockData.suppliers,
  setSuppliers: (data) => set({ suppliers: data }),
  addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, supplier] })),
  updateSupplier: (id, supplier) => set((state) => ({
    suppliers: state.suppliers.map((s) => s.id === id ? { ...s, ...supplier } : s)
  })),
  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter((s) => s.id !== id)
  })),

  // 客户
  customers: mockData.customers,
  setCustomers: (data) => set({ customers: data }),
  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  updateCustomer: (id, customer) => set((state) => ({
    customers: state.customers.map((c) => c.id === id ? { ...c, ...customer } : c)
  })),
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter((c) => c.id !== id)
  })),

  // 员工
  employees: mockData.employees,
  setEmployees: (data) => set({ employees: data }),

  // 物资申请单
  productApplications: mockData.productApplications || [],
  setProductApplications: (data) => set({ productApplications: data }),
  addProductApplication: (application) => set((state) => ({ productApplications: [...state.productApplications, application] })),
  updateProductApplication: (id, application) => set((state) => ({
    productApplications: state.productApplications.map((a) => a.id === id ? { ...a, ...application } : a)
  })),
  deleteProductApplication: (id) => set((state) => ({
    productApplications: state.productApplications.filter((a) => a.id !== id)
  })),

  // 采购合同
  contracts: mockData.contracts || [],
  setContracts: (data) => set({ contracts: data }),

  // 物料合同关联
  productContracts: mockData.productContracts || [],
  setProductContracts: (data) => set({ productContracts: data }),

  // 展会项目
  exhibitionProjects: mockData.exhibitionProjects || [],
  setExhibitionProjects: (data) => set({ exhibitionProjects: data }),

  // 采购单
  purchaseOrders: mockData.purchaseOrders || [],
  setPurchaseOrders: (data) => set({ purchaseOrders: data }),
  addPurchaseOrder: (order) => set((state) => ({ purchaseOrders: [...state.purchaseOrders, order] })),
  updatePurchaseOrder: (id, order) => set((state) => ({
    purchaseOrders: state.purchaseOrders.map((o) => o.id === id ? { ...o, ...order } : o)
  })),
  deletePurchaseOrder: (id) => set((state) => ({
    purchaseOrders: state.purchaseOrders.filter((o) => o.id !== id)
  })),

  // 库存
  inventories: mockData.inventories,
  setInventories: (data) => set({ inventories: data }),
  updateInventory: (id, inventory) => set((state) => ({
    inventories: state.inventories.map((i) => i.id === id ? { ...i, ...inventory } : i)
  })),
  addInventory: (inventory) => set((state) => ({ inventories: [...state.inventories, inventory] })),

  // 批次库存（FIFO）
  batchInventories: mockData.batchInventories as BatchInventory[],
  setBatchInventories: (data) => set({ batchInventories: data }),
  addBatchInventory: (batch) => set((state) => ({ batchInventories: [...state.batchInventories, batch] })),
  updateBatchInventory: (id, data) => set((state) => ({
    batchInventories: state.batchInventories.map((b) => b.id === id ? { ...b, ...data } : b)
  })),
  deleteBatchInventory: (id) => set((state) => ({
    batchInventories: state.batchInventories.filter((b) => b.id !== id)
  })),

  // 入库单
  inboundOrders: mockData.inboundOrders,
  setInboundOrders: (data) => set({ inboundOrders: data }),
  addInboundOrder: (order) => set((state) => ({ inboundOrders: [...state.inboundOrders, order] })),
  updateInboundOrder: (id, order) => set((state) => ({
    inboundOrders: state.inboundOrders.map((o) => o.id === id ? { ...o, ...order } : o)
  })),
  deleteInboundOrder: (id) => set((state) => ({
    inboundOrders: state.inboundOrders.filter((o) => o.id !== id)
  })),

  // 入库申请单
  inboundApplications: mockData.inboundApplications || [],
  setInboundApplications: (data) => set({ inboundApplications: data }),
  addInboundApplication: (app) => set((state) => ({ inboundApplications: [...state.inboundApplications, app] })),
  updateInboundApplication: (id, data) => set((state) => ({
    inboundApplications: state.inboundApplications.map((a) => a.id === id ? { ...a, ...data } : a)
  })),
  deleteInboundApplication: (id) => set((state) => ({
    inboundApplications: state.inboundApplications.filter((a) => a.id !== id)
  })),

  // 出库单
  outboundOrders: mockData.outboundOrders,
  setOutboundOrders: (data) => set({ outboundOrders: data }),
  addOutboundOrder: (order) => set((state) => ({ outboundOrders: [...state.outboundOrders, order] })),
  updateOutboundOrder: (id, order) => set((state) => ({
    outboundOrders: state.outboundOrders.map((o) => o.id === id ? { ...o, ...order } : o)
  })),
  deleteOutboundOrder: (id) => set((state) => ({
    outboundOrders: state.outboundOrders.filter((o) => o.id !== id)
  })),

  // 调拨单
  transferOrders: mockData.transferOrders,
  setTransferOrders: (data) => set({ transferOrders: data }),
  addTransferOrder: (order) => set((state) => ({ transferOrders: [...state.transferOrders, order] })),
  updateTransferOrder: (id, order) => set((state) => ({
    transferOrders: state.transferOrders.map((o) => o.id === id ? { ...o, ...order } : o)
  })),
  deleteTransferOrder: (id) => set((state) => ({
    transferOrders: state.transferOrders.filter((o) => o.id !== id)
  })),

  // 退库单
  returnOrders: mockData.returnOrders,
  setReturnOrders: (data) => set({ returnOrders: data }),
  addReturnOrder: (order) => set((state) => ({ returnOrders: [...state.returnOrders, order] })),
  updateReturnOrder: (id, order) => set((state) => ({
    returnOrders: state.returnOrders.map((o) => o.id === id ? { ...o, ...order } : o)
  })),
  deleteReturnOrder: (id) => set((state) => ({
    returnOrders: state.returnOrders.filter((o) => o.id !== id)
  })),

  // 待归还记录
  pendingReturns: mockData.pendingReturns,
  setPendingReturns: (data) => set({ pendingReturns: data }),
  updatePendingReturn: (id, data) => set((state) => ({
    pendingReturns: state.pendingReturns.map((p) => p.id === id ? { ...p, ...data } : p)
  })),
  addPendingReturn: (data) => set((state) => ({ pendingReturns: [...state.pendingReturns, data] })),
  deletePendingReturn: (id) => set((state) => ({
    pendingReturns: state.pendingReturns.filter((p) => p.id !== id)
  })),

  // 盘点单
  checkOrders: mockData.checkOrders,
  setCheckOrders: (data) => set({ checkOrders: data }),
  addCheckOrder: (order) => set((state) => ({ checkOrders: [...state.checkOrders, order] })),
  updateCheckOrder: (id, order) => set((state) => ({
    checkOrders: state.checkOrders.map((o) => o.id === id ? { ...o, ...order } : o)
  })),
  deleteCheckOrder: (id) => set((state) => ({
    checkOrders: state.checkOrders.filter((o) => o.id !== id)
  })),

  // 资产设备档案
  assetEquipments: mockData.assetEquipments,
  setAssetEquipments: (data) => set({ assetEquipments: data }),
  addAssetEquipment: (asset) => set((state) => ({ assetEquipments: [...state.assetEquipments, asset] })),
  updateAssetEquipment: (id, data) => set((state) => ({
    assetEquipments: state.assetEquipments.map((a) => a.id === id ? { ...a, ...data } : a)
  })),
  deleteAssetEquipment: (id) => set((state) => ({
    assetEquipments: state.assetEquipments.filter((a) => a.id !== id)
  })),

  // 报废记录
  scrappedRecords: mockData.scrappedRecords,
  setScrappedRecords: (data) => set({ scrappedRecords: data }),
  addScrappedRecord: (record) => set((state) => ({ scrappedRecords: [...state.scrappedRecords, record] })),
  updateScrappedRecord: (id, data) => set((state) => ({
    scrappedRecords: state.scrappedRecords.map((r) => r.id === id ? { ...r, ...data } : r)
  })),
  deleteScrappedRecord: (id) => set((state) => ({
    scrappedRecords: state.scrappedRecords.filter((r) => r.id !== id)
  })),

  // 报损记录
  damagedRecords: mockData.damagedRecords,
  setDamagedRecords: (data) => set({ damagedRecords: data }),
  addDamagedRecord: (record) => set((state) => ({ damagedRecords: [...state.damagedRecords, record] })),
  updateDamagedRecord: (id, data) => set((state) => ({
    damagedRecords: state.damagedRecords.map((r) => r.id === id ? { ...r, ...data } : r)
  })),
  deleteDamagedRecord: (id) => set((state) => ({
    damagedRecords: state.damagedRecords.filter((r) => r.id !== id)
  })),

  // 库存流水记录
  stockTransactions: mockData.stockTransactions as StockTransaction[],
  setStockTransactions: (data) => set({ stockTransactions: data }),
  addStockTransaction: (transaction) => set((state) => ({ stockTransactions: [transaction, ...state.stockTransactions] })),

  // 仓库调拨单
  stockTransfers: mockData.stockTransfers || [],
  setStockTransfers: (data) => set({ stockTransfers: data }),
  addStockTransfer: (transfer) => set((state) => ({ stockTransfers: [...state.stockTransfers, transfer] })),
  updateStockTransfer: (id, data) => set((state) => ({
    stockTransfers: state.stockTransfers.map((t) => t.id === id ? { ...t, ...data } : t)
  })),
  deleteStockTransfer: (id) => set((state) => ({
    stockTransfers: state.stockTransfers.filter((t) => t.id !== id)
  })),

  // 工单物资配置
  workOrderConfigs: mockData.workOrderConfigs || [],
  setWorkOrderConfigs: (data) => set({ workOrderConfigs: data }),

  // ==================== 项目管理 ====================
  // 实施项目
  implementationProjects: mockData.implementationProjects || [],
  setImplementationProjects: (data) => set({ implementationProjects: data }),
  addImplementationProject: (project) => set((state) => ({ implementationProjects: [...state.implementationProjects, project] })),
  updateImplementationProject: (id, data) => set((state) => ({
    implementationProjects: state.implementationProjects.map((p) => p.id === id ? { ...p, ...data } : p)
  })),
  deleteImplementationProject: (id) => set((state) => ({
    implementationProjects: state.implementationProjects.filter((p) => p.id !== id)
  })),

  // 服务项目
  serviceProjects: mockData.serviceProjects || [],
  setServiceProjects: (data) => set({ serviceProjects: data }),
  addServiceProject: (project) => set((state) => ({ serviceProjects: [...state.serviceProjects, project] })),
  updateServiceProject: (id, data) => set((state) => ({
    serviceProjects: state.serviceProjects.map((p) => p.id === id ? { ...p, ...data } : p)
  })),
  deleteServiceProject: (id) => set((state) => ({
    serviceProjects: state.serviceProjects.filter((p) => p.id !== id)
  })),

  // ==================== 采购管理系统 ====================

  // 供应商考核评估
  supplierAssessments: mockData.supplierAssessments || [],
  setSupplierAssessments: (data) => set({ supplierAssessments: data }),
  addSupplierAssessment: (assessment) => set((state) => ({ supplierAssessments: [...state.supplierAssessments, assessment] })),
  updateSupplierAssessment: (id, data) => set((state) => ({
    supplierAssessments: state.supplierAssessments.map((a) => a.id === id ? { ...a, ...data } : a)
  })),
  deleteSupplierAssessment: (id) => set((state) => ({
    supplierAssessments: state.supplierAssessments.filter((a) => a.id !== id)
  })),

  // 供应商资质证书
  supplierQualifications: [],
  setSupplierQualifications: (data) => set({ supplierQualifications: data }),
  addSupplierQualification: (q) => set((state) => ({ supplierQualifications: [...state.supplierQualifications, q] })),
  updateSupplierQualification: (id, data) => set((state) => ({
    supplierQualifications: state.supplierQualifications.map((q) => q.id === id ? { ...q, ...data } : q)
  })),
  deleteSupplierQualification: (id) => set((state) => ({
    supplierQualifications: state.supplierQualifications.filter((q) => q.id !== id)
  })),

  // 供应商变更申请
  supplierChangeRequests: [],
  setSupplierChangeRequests: (data) => set({ supplierChangeRequests: data }),
  addSupplierChangeRequest: (req) => set((state) => ({ supplierChangeRequests: [...state.supplierChangeRequests, req] })),
  updateSupplierChangeRequest: (id, data) => set((state) => ({
    supplierChangeRequests: state.supplierChangeRequests.map((r) => r.id === id ? { ...r, ...data } : r)
  })),

  // 采购计划
  procurementPlans: mockData.procurementPlans || [],
  setProcurementPlans: (data) => set({ procurementPlans: data }),
  addProcurementPlan: (plan) => set((state) => ({ procurementPlans: [...state.procurementPlans, plan] })),
  updateProcurementPlan: (id, data) => set((state) => ({
    procurementPlans: state.procurementPlans.map((p) => p.id === id ? { ...p, ...data } : p)
  })),
  deleteProcurementPlan: (id) => set((state) => ({
    procurementPlans: state.procurementPlans.filter((p) => p.id !== id)
  })),

  // 审批流程配置
  approvalFlowConfigs: mockData.approvalFlowConfigs || [],
  setApprovalFlowConfigs: (data) => set({ approvalFlowConfigs: data }),
  addApprovalFlowConfig: (config) => set((state) => ({ approvalFlowConfigs: [...state.approvalFlowConfigs, config] })),
  updateApprovalFlowConfig: (id, data) => set((state) => ({
    approvalFlowConfigs: state.approvalFlowConfigs.map((c) => c.id === id ? { ...c, ...data } : c)
  })),
  deleteApprovalFlowConfig: (id) => set((state) => ({
    approvalFlowConfigs: state.approvalFlowConfigs.filter((c) => c.id !== id)
  })),

  // 采购需求申请
  procurementDemands: mockData.procurementDemands || [],
  setProcurementDemands: (data) => set({ procurementDemands: data }),
  addProcurementDemand: (demand) => set((state) => ({ procurementDemands: [...state.procurementDemands, demand] })),
  updateProcurementDemand: (id, data) => set((state) => ({
    procurementDemands: state.procurementDemands.map((d) => d.id === id ? { ...d, ...data } : d)
  })),
  deleteProcurementDemand: (id) => set((state) => ({
    procurementDemands: state.procurementDemands.filter((d) => d.id !== id)
  })),

  // 采购需求变更
  procurementDemandChanges: [] as any[],
  setProcurementDemandChanges: (data) => set({ procurementDemandChanges: data }),
  addProcurementDemandChange: (change) => set((state) => ({ procurementDemandChanges: [...state.procurementDemandChanges, change] })),
  updateProcurementDemandChange: (id, data) => set((state) => ({
    procurementDemandChanges: state.procurementDemandChanges.map((c) => c.id === id ? { ...c, ...data } : c)
  })),

  // 合同台账
  contractLedgers: mockData.contractLedgers || [],
  setContractLedgers: (data) => set({ contractLedgers: data }),
  addContractLedger: (ledger) => set((state) => ({ contractLedgers: [...state.contractLedgers, ledger] })),
  updateContractLedger: (id, data) => set((state) => ({
    contractLedgers: state.contractLedgers.map((l) => l.id === id ? { ...l, ...data } : l)
  })),
  deleteContractLedger: (id) => set((state) => ({
    contractLedgers: state.contractLedgers.filter((l) => l.id !== id)
  })),

  // 采购订单
  procurementOrders: mockData.procurementOrders || [],
  setProcurementOrders: (data) => set({ procurementOrders: data }),
  addProcurementOrder: (order) => set((state) => ({ procurementOrders: [...state.procurementOrders, order] })),
  updateProcurementOrder: (id, data) => set((state) => ({
    procurementOrders: state.procurementOrders.map((o) => o.id === id ? { ...o, ...data } : o)
  })),
  deleteProcurementOrder: (id) => set((state) => ({
    procurementOrders: state.procurementOrders.filter((o) => o.id !== id)
  })),

  // 采购订单变更
  procurementOrderChanges: [] as any[],
  setProcurementOrderChanges: (data) => set({ procurementOrderChanges: data }),
  addProcurementOrderChange: (change) => set((state) => ({ procurementOrderChanges: [...state.procurementOrderChanges, change] })),
  updateProcurementOrderChange: (id, data) => set((state) => ({
    procurementOrderChanges: state.procurementOrderChanges.map((c) => c.id === id ? { ...c, ...data } : c)
  })),

  // 验收记录
  procurementInspections: mockData.procurementInspections || [],
  setProcurementInspections: (data) => set({ procurementInspections: data }),
  addProcurementInspection: (inspection) => set((state) => ({ procurementInspections: [...state.procurementInspections, inspection] })),
  updateProcurementInspection: (id, data) => set((state) => ({
    procurementInspections: state.procurementInspections.map((i) => i.id === id ? { ...i, ...data } : i)
  })),
  deleteProcurementInspection: (id) => set((state) => ({
    procurementInspections: state.procurementInspections.filter((i) => i.id !== id)
  })),

  // 竞价采购
  biddings: [],
  setBiddings: (data) => set({ biddings: data }),
  addBidding: (bidding) => set((state) => ({ biddings: [...state.biddings, bidding] })),
  updateBidding: (id, data) => set((state) => ({
    biddings: state.biddings.map((b) => b.id === id ? { ...b, ...data } : b)
  })),
  deleteBidding: (id) => set((state) => ({
    biddings: state.biddings.filter((b) => b.id !== id)
  })),

  // 供应商报价单
  supplierQuotes: [],
  setSupplierQuotes: (data) => set({ supplierQuotes: data }),
  addSupplierQuote: (quote) => set((state) => ({ supplierQuotes: [...state.supplierQuotes, quote] })),
  updateSupplierQuote: (id, data) => set((state) => ({
    supplierQuotes: state.supplierQuotes.map((q) => q.id === id ? { ...q, ...data } : q)
  })),
  deleteSupplierQuote: (id) => set((state) => ({
    supplierQuotes: state.supplierQuotes.filter((q) => q.id !== id)
  })),

  // 网站信息报送登记表
  websiteInfos: [],
  setWebsiteInfos: (data) => set({ websiteInfos: data }),
  addWebsiteInfo: (info) => set((state) => ({ websiteInfos: [...state.websiteInfos, info] })),
  updateWebsiteInfo: (id, data) => set((state) => ({
    websiteInfos: state.websiteInfos.map((w) => w.id === id ? { ...w, ...data } : w)
  })),
  deleteWebsiteInfo: (id) => set((state) => ({
    websiteInfos: state.websiteInfos.filter((w) => w.id !== id)
  })),

  // 合同模板
  contractTemplates: [],
  setContractTemplates: (data) => set({ contractTemplates: data }),
  addContractTemplate: (template) => set((state) => ({ contractTemplates: [...state.contractTemplates, template] })),
  updateContractTemplate: (id, data) => set((state) => ({
    contractTemplates: state.contractTemplates.map((t) => t.id === id ? { ...t, ...data } : t)
  })),
  deleteContractTemplate: (id) => set((state) => ({
    contractTemplates: state.contractTemplates.filter((t) => t.id !== id)
  })),

  // 合同预警
  contractWarnings: [],
  setContractWarnings: (data) => set({ contractWarnings: data }),
  addContractWarning: (warning) => set((state) => ({ contractWarnings: [...state.contractWarnings, warning] })),
  updateContractWarning: (id, data) => set((state) => ({
    contractWarnings: state.contractWarnings.map((w) => w.id === id ? { ...w, ...data } : w)
  })),
  markContractWarningRead: (id) => set((state) => ({
    contractWarnings: state.contractWarnings.map((w) => w.id === id ? { ...w, isRead: true } : w)
  })),
  handleContractWarning: (id, handler) => set((state) => ({
    contractWarnings: state.contractWarnings.map((w) => w.id === id ? { ...w, isHandled: true, handler, handleTime: new Date().toISOString().replace('T', ' ').slice(0, 19) } : w)
  })),

  // 合同采购订单
  contractPurchaseOrders: [],
  setContractPurchaseOrders: (data) => set({ contractPurchaseOrders: data }),
  addContractPurchaseOrder: (order) => set((state) => ({ contractPurchaseOrders: [...state.contractPurchaseOrders, order] })),
  updateContractPurchaseOrder: (id, data) => set((state) => ({
    contractPurchaseOrders: state.contractPurchaseOrders.map((o) => o.id === id ? { ...o, ...data } : o)
  })),
  deleteContractPurchaseOrder: (id) => set((state) => ({
    contractPurchaseOrders: state.contractPurchaseOrders.filter((o) => o.id !== id)
  })),
  // 采购订单变更
  contractPurchaseOrderChanges: [],
  addContractPurchaseOrderChange: (change) => set((state) => ({ contractPurchaseOrderChanges: [...state.contractPurchaseOrderChanges, change] })),
  updateContractPurchaseOrderChange: (id, data) => set((state) => ({
    contractPurchaseOrderChanges: state.contractPurchaseOrderChanges.map((c) => c.id === id ? { ...c, ...data } : c)
  })),
  // 审批通过变更：更新变更记录状态，并更新订单明细
  approveContractPurchaseOrderChange: (orderId, changeId, approver) => set((state) => {
    const change = state.contractPurchaseOrderChanges.find(c => c.id === changeId);
    if (!change) return state;
    const approveTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return {
      contractPurchaseOrderChanges: state.contractPurchaseOrderChanges.map(c =>
        c.id === changeId ? { ...c, status: 'approved', approveTime, approver } : c
      ),
      contractPurchaseOrders: state.contractPurchaseOrders.map(o =>
        o.id === orderId ? { ...o, details: change.afterDetails, changeHistory: [...(o.changeHistory || []), { ...change, status: 'approved', approveTime, approver }] } : o
      )
    };
  }),
  // 驳回变更：只更新变更记录状态
  rejectContractPurchaseOrderChange: (orderId, changeId, approver) => set((state) => {
    const approveTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return {
      contractPurchaseOrderChanges: state.contractPurchaseOrderChanges.map(c =>
        c.id === changeId ? { ...c, status: 'rejected', approveTime, approver } : c
      )
    };
  }),

  // 展会冻结
  frozenExhibitions: [],
  freezeLogs: [],
  freezeExhibitions: (exhibitionNames, operator, remark) => set((state) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newFrozen = exhibitionNames.map((name, idx) => ({
      id: `FE${Date.now()}${idx}`,
      exhibitionName: name,
      operator,
      operateTime: now,
      remark,
    }));
    const log: FreezeLog = {
      id: `FL${Date.now()}`,
      exhibitionNames,
      operateType: 'freeze',
      operator,
      operateTime: now,
      remark,
    };
    const existingNames = new Set(state.frozenExhibitions.map(f => f.exhibitionName));
    const toAdd = newFrozen.filter(f => !existingNames.has(f.exhibitionName));
    return {
      frozenExhibitions: [...state.frozenExhibitions, ...toAdd],
      freezeLogs: [log, ...state.freezeLogs],
    };
  }),
  unfreezeExhibitions: (exhibitionNames, operator, remark) => set((state) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const unfrozen = state.frozenExhibitions.filter(f => exhibitionNames.includes(f.exhibitionName));
    const log: FreezeLog = {
      id: `FL${Date.now()}`,
      exhibitionNames,
      operateType: 'unfreeze',
      operator,
      operateTime: now,
      remark,
    };
    return {
      frozenExhibitions: state.frozenExhibitions.filter(f => !exhibitionNames.includes(f.exhibitionName)),
      freezeLogs: [log, ...state.freezeLogs],
    };
  }),
  isExhibitionFrozen: (exhibitionName) => {
    const state = useStore.getState();
    return state.frozenExhibitions.some(f => f.exhibitionName === exhibitionName);
  },
  isWorkOrderFrozen: (workOrderId) => {
    const state = useStore.getState();
    const config = state.workOrderConfigs.find(c => c.workOrderId === workOrderId);
    if (!config) return false;
    return state.frozenExhibitions.some(f => f.exhibitionName === config.exhibitionName);
  },

  // 当前登录账号（默认取第一个员工）
  currentUser: { id: 'EMP001', name: '管理员', role: '系统管理员', department: '综合管理部' },
  setCurrentUser: (user) => set({ currentUser: user }),
}));
