export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  status: 'enabled' | 'disabled';
  remark?: string;
  createTime: string;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  warehouseName?: string;
  parentId?: string;
  status: 'enabled' | 'disabled';
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  sort: number;
  children?: ProductCategory[];
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  specification?: string;
  status: 'enabled' | 'disabled';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  status: 'enabled' | 'disabled';
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  status: 'enabled' | 'disabled';
}

export interface Inventory {
  id: string;
  productId: string;
  productName?: string;
  productCode?: string;
  warehouseId: string;
  warehouseName?: string;
  positionId: string;
  positionName?: string;
  quantity: number;
  frozenQuantity: number;
  availableQuantity?: number;
  inboundTime: string;
}

// 批次库存（按 FIFO 管理）
export interface BatchInventory {
  id: string;
  batchNo: string; // 批次号
  productId: string;
  productName?: string;
  productCode?: string;
  categoryId?: string;
  categoryName?: string;
  warehouseId: string;
  warehouseName?: string;
  positionId: string;
  positionName?: string;
  quantity: number; // 批次剩余数量
  originalQuantity: number; // 批次原始数量
  inboundOrderId?: string; // 关联入库单
  inboundOrderNo?: string; // 关联入库单号
  inboundTime: string; // 入库时间
  remark?: string;
}

// 批次出库记录（追踪出库时批次消耗情况）
export interface BatchOutboundDetail {
  batchId: string;
  batchNo: string;
  quantity: number; // 从该批次扣减的数量
}

export type InboundOrderType = 'purchase' | 'production' | 'return' | 'workorder';
export type InboundOrderStatus = 'pending' | 'submitted';

export interface InboundDetail {
  id: string;
  inboundOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  positionId: string;
  positionName?: string;
  quantity: number;
}

export interface InboundOrder {
  id: string;
  orderNo: string;
  type: InboundOrderType;
  supplierId?: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  custodian?: string; // 保管人
  personInCharge?: string; // 负责人
  inspector?: string; // 验收人
  salesperson?: string; // 业务员
  creator?: string; // 制单人
  status: InboundOrderStatus;
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  details: InboundDetail[];
}

// 员工（用于下拉选择：保管人、验收人、业务员等）
export interface Employee {
  id: string;
  name: string;
  role?: string; // 角色：保管人/验收人/业务员 等
  status: 'enabled' | 'disabled';
}

export type OutboundOrderType = 'requisition' | 'production' | 'workorder' | 'scrap';
export type OutboundOrderStatus = 'pending' | 'submitted';

export interface OutboundDetail {
  id: string;
  outboundOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  positionId: string;
  positionName?: string;
  quantity: number;
  batchConsumptions?: BatchOutboundDetail[]; // FIFO 批次消耗记录
  transferOrderId?: string;   // 工单出库时关联的调拨单ID
  transferOrderNo?: string;   // 工单出库时关联的调拨单号
}

export interface OutboundOrder {
  id: string;
  orderNo: string;
  type: OutboundOrderType;
  customerId?: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: OutboundOrderStatus;
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  details: OutboundDetail[];
}

export type CheckOrderStatus = 'pending' | 'submitted';
export type CheckDetailStatus = 'pending' | 'confirmed';

export interface CheckDetail {
  id: string;
  checkOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  specification?: string;
  unit?: string;
  positionId: string;
  positionName?: string;
  bookQuantity: number;
  checkQuantity: number;
  diffQuantity: number;
  status: CheckDetailStatus;
}

export interface CheckOrder {
  id: string;
  orderNo: string;
  warehouseId: string;
  warehouseName?: string;
  status: CheckOrderStatus;
  operator: string;
  createTime: string;
  completeTime?: string;
  remark?: string;
  details: CheckDetail[];
}

// 调拨单
export interface TransferDetail {
  id: string;
  transferOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  positionId: string;
  positionName?: string;
  quantity: number;
  usedQuantity?: number; // 已领用数量
}

export type TransferOrderStatus = 'pending' | 'approved' | 'partiallyUsed' | 'fullyUsed' | 'cancelled';

export interface TransferOrder {
  id: string;
  orderNo: string;
  supplierId?: string;
  supplierName?: string;
  fromWarehouseId: string;
  fromWarehouseName?: string;
  toWarehouseId: string;
  toWarehouseName?: string;
  status: TransferOrderStatus;
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  details: TransferDetail[];
}

// 退库单
export interface ReturnDetail {
  id: string;
  returnOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  positionId: string;
  positionName?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number; // 归还数量
  sourceType: 'requisition' | 'scrap'; // 来源类型
  sourceOrderId?: string; // 来源单据ID（如领用单ID）
  sourceOrderNo?: string; // 来源单据编号
}

export type ReturnOrderStatus = 'pending' | 'submitted';

export interface ReturnOrder {
  id: string;
  orderNo: string;
  type: 'return' | 'writeoff'; // 退库 或 报损
  warehouseId: string;
  warehouseName?: string;
  status: ReturnOrderStatus;
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  details: ReturnDetail[];
}

// 待归还记录（跟踪领用后的待归还数量）
export interface PendingReturn {
  id: string;
  outboundOrderId: string;
  outboundOrderNo: string;
  productId: string;
  productName?: string;
  productCode?: string;
  warehouseId: string;
  warehouseName?: string;
  positionId: string;
  positionName?: string;
  totalQuantity: number; // 领用总量
  pendingQuantity: number; // 待归还数量
  createTime: string;
}

// 资产设备档案
export interface AssetEquipment {
  id: string;
  code: string; // 设备编码
  name: string;
  categoryId: string;
  categoryName?: string;
  specification?: string;
  unit: string;
  amount: number; // 金额
  storageLocation: string; // 存放地点
  warehouseId: string;
  warehouseName?: string;
  positionId: string;
  positionName?: string;
  status: 'in_use' | 'scrapped' | 'written_off';
  remark?: string;
  createTime: string;
}

// 报废记录
export interface ScrappedRecord {
  id: string;
  recordNo: string; // 记录编号 BF20240601001
  assetEquipmentId: string;
  assetCode: string; // 设备编码
  assetName: string;
  warehouseId: string;
  warehouseName: string;
  positionId: string;
  positionName: string;
  storageLocation: string; // 存放地点
  amount: number; // 报废金额
  scrapType: 'full' | 'partial'; // 全额报废 / 部分报废
  scrapQuantity: number; // 报废数量
  originalQuantity: number; // 原库存数量
  reason: string;
  status: 'pending' | 'submitted';
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
}

// 报损记录
export interface DamagedRecord {
  id: string;
  recordNo: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  positionId: string;
  positionName: string;
  quantity: number;
  amount: number;
  reason: string;
  status: 'pending' | 'submitted';
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
}

// 库存流水记录
export type StockTransactionType = 'inbound' | 'outbound' | 'check_diff';

export interface StockTransaction {
  id: string;
  transactionNo: string; // 流水号
  transactionTime: string; // 异动时间
  transactionType: StockTransactionType; // 异动类型
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  positionId: string;
  positionName: string;
  quantity: number; // 正数=入库 负数=出库
  sourceOrderId?: string; // 来源单据id
  sourceOrderNo?: string; // 来源单据号
  sourceType?: string; // 来源单据类型（采购入库/领用出库/盘点差异 等）
  batchNo?: string; // 批次号
  operator: string;
  remark?: string;
}
