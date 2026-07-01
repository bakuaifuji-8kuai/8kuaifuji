import { create } from 'zustand';
import type {
  Warehouse, Position, ProductCategory, Product, Supplier, Customer,
  Inventory, InboundOrder, OutboundOrder, CheckOrder, TransferOrder, ReturnOrder, PendingReturn,
  AssetEquipment, ScrappedRecord, DamagedRecord,
  BatchInventory, BatchOutboundDetail, StockTransaction, Employee
} from '@/types';
import * as mockData from '@/mock/data';

interface WarehouseState {
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

  // 客户
  customers: Customer[];
  setCustomers: (data: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // 员工（保管人、验收人、业务员等下拉数据源）
  employees: Employee[];
  setEmployees: (data: Employee[]) => void;

  // 库存
  inventories: Inventory[];
  setInventories: (data: Inventory[]) => void;
  updateInventory: (id: string, inventory: Partial<Inventory>) => void;

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

  // 库存
  inventories: mockData.inventories,
  setInventories: (data) => set({ inventories: data }),
  updateInventory: (id, inventory) => set((state) => ({
    inventories: state.inventories.map((i) => i.id === id ? { ...i, ...inventory } : i)
  })),

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
}));
