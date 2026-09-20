// 仓库类别
export type WarehouseCategory = 'exhibition' | 'consumable' | 'fixed_asset';

// 仓库属性
export type WarehouseProperty = 'physical' | 'virtual';

// 仓库
export interface Warehouse {
  id: string;
  code: string; // 仓库编码（系统自动生成）
  warehouseNo: string; // 仓库编号（可编辑）
  name: string;
  category: WarehouseCategory; // 仓库类别
  categoryName?: string; // 类别名称（用于显示）
  property: WarehouseProperty; // 仓库属性
  propertyName?: string; // 属性名称（用于显示）
  address: string;
  manager: string; // 管理人员
  contactPhone?: string; // 联系电话
  status: 'enabled' | 'disabled';
  remark?: string;
  createTime: string;
  allowNegativeInventory?: boolean; // 是否允许库存为负
}

export interface Position {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  warehouseName?: string;
  parentId?: string;
  address?: string;
  status: 'enabled' | 'disabled';
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  sort: number;
  codePrefix?: string;
  children?: ProductCategory[];
}

export interface Product {
  id: string;
  code: string;
  codePrefix?: string; // 用户自定义前缀，如"P"
  name: string;
  categoryId?: string;
  categoryName?: string;
  unit: string;
  specification?: string;
  brand?: string;
  imageUrl?: string;
  origin?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  stockQuantity?: number; // 库存数量（从库存查询中取）
  isContractItem?: boolean;
  status: 'enabled' | 'disabled';
}

// ============ 非工程类-服务 独立类型（物理隔离，B 方案） ============

export interface ServiceCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  sort: number;
  codePrefix?: string;
  children?: ServiceCategory[];
}

export interface Service {
  id: string;
  code: string;
  codePrefix?: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  unit: string;
  specification?: string;       // 规格型号/参数
  isContractItem?: boolean;     // 是否合同清单内
  status: 'enabled' | 'disabled';
  remark?: string;              // 备注
}

// 采购合同类型（采购订单模块用：买/服务/租）
export type PurchaseContractType = 'purchase' | 'service' | 'lease';

// 采购合同
export interface Contract {
  id: string;
  contractNo: string;
  contractName: string;
  supplierId?: string;
  supplierName?: string;
  type: PurchaseContractType;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'terminated';
  operator: string;
  createTime: string;
}

// 物资合同关联
export interface ProductContract {
  id: string;
  productId: string;
  contractId: string;
  contractNo?: string;
  contractName?: string;
  unitPrice?: number; // 合同含税单价
  taxRate?: number; // 税率（%），如 13
  quantity?: number;
  isContractItem: boolean;
  priceRemark?: string; // 单价说明
}
// 供应商
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  status: 'enabled' | 'disabled';
  // 扩展字段（采购管理）
  unifiedSocialCreditCode?: string; // 统一社会信用代码
  registeredAddress?: string; // 注册地址
  bankAccount?: string; // 银行账户
  businessScope?: string; // 经营范围
  qualificationExpiryDate?: string; // 资质到期日期
  createTime?: string;
  creator?: string;
  // 新增：供应商资质管理
  qualifications?: SupplierQualification[]; // 资质证书列表
}

// 供应商考核记录
export interface SupplierAssessment {
  id: string;
  supplierId: string;
  supplierName?: string;
  assessmentType: 'quarterly' | 'project' | 'warranty'; // 季度考核/单次项目/质保履约
  projectName?: string;
  assessmentTime: string;
  assessor: string;
  scores: {
    internalManagement?: number; // 内部管理 15%
    qualityManagement?: number; // 质量管理 20%
    scheduleManagement?: number; // 进度管理 15%
    costManagement?: number; // 成本管理 15%
    safetyConstruction?: number; // 安全文明施工 20%
    constructionCooperation?: number; // 施工配合 15%
  };
  totalScore: number;
  comments?: string;
  hasSafetyAccident?: boolean; // 一票否决：安全生产事故
  hasUnreasonableWageClaim?: boolean; // 一票否决：无故讨薪
  attachments?: Attachment[];
  status: 'pending' | 'approved';
}

// 供应商资质证书
export type QualificationType =
  | 'business_license' // 营业执照（纸质）
  | 'tax_registration' // 税务登记证（纸质）
  | 'organization_code' // 组织机构代码证（纸质）
  | 'quality_certification' // ISO质量管理体系认证（纸质）
  | 'environmental_certification' // ISO环境管理体系认证（纸质）
  | 'safety_production' // 安全生产许可证（纸质）
  | 'construction_qualification' // 建筑业企业资质证书（纸质）
  | 'professional_qualification' // 专业资质证书（纸质）
  | 'bank_credit' // 银行资信证明（纸质）
  | 'other'; // 其他纸质证书

export interface SupplierQualification {
  id: string;
  supplierId: string;
  supplierName?: string;
  type: QualificationType; // 证书类型
  typeName: string; // 类型名称（显示用）
  certificateNo: string; // 证书编号
  issuingAuthority?: string; // 颁发机构
  issueDate?: string; // 颁发日期
  expiryDate?: string; // 有效期至（必填，用于预警）
  isPermanent?: boolean; // 是否长期有效（true时忽略expiryDate）
  attachment?: Attachment; // 证书扫描件
  remark?: string;
  createTime?: string;
}

// 供应商变更申请
export type ChangeFieldKey =
  | 'name' | 'code' | 'contact' | 'phone' | 'address'
  | 'unifiedSocialCreditCode' | 'registeredAddress' | 'bankAccount'
  | 'businessScope' | 'qualification';

export interface SupplierChangeRequest {
  id: string;
  supplierId: string;
  supplierName: string;
  applicant: string; // 申请人
  applyTime: string; // 申请时间
  changes: SupplierChangeItem[]; // 变更项列表
  reason: string; // 变更原因
  attachments?: Attachment[]; // 附件（变更证明材料）
  status: 'pending' | 'approved' | 'rejected'; // 审批状态
  approver?: string; // 审批人
  approveTime?: string; // 审批时间
  approveRemark?: string; // 审批意见
}

export interface SupplierChangeItem {
  field: ChangeFieldKey; // 变更字段
  fieldName: string; // 字段名称
  oldValue: string; // 原值
  newValue: string; // 新值
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
  specification?: string;
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
  projectId?: string; // 所属项目ID
  projectName?: string; // 所属项目名称
}

// 批次出库记录（追踪出库时批次消耗情况）
export interface BatchOutboundDetail {
  batchId: string;
  batchNo: string;
  quantity: number; // 从该批次扣减的数量
}

export type InboundOrderType = 'purchase' | 'production' | 'return' | 'workorder';
export type InboundOrderStatus = 'pending' | 'submitted' | 'confirmed';

export interface InboundDetail {
  id: string;
  inboundOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  specification?: string;
  unit?: string;
  positionId?: string;
  positionName?: string;
  quantity: number;
}

// ==================== 合同采购订单类型 ====================

// 合同采购订单明细（锁定字段：单价、规格、物料编码；可编辑：本次交付数量、交货日期）
export interface ContractPurchaseOrderDetail {
  id: string;
  orderId: string;
  productId: string;
  productCode: string;       // 锁定只读
  productName: string;
  specification?: string;    // 锁定只读
  unit: string;
  contractQuantity: number; // 合同约定总数量（锁定只读）
  deliveredQuantity: number; // 历史已交付数量（锁定只读）
  orderQuantity: number;     // 本次订单采购数量（可编辑）
  unitPrice: number;         // 合同约定单价（锁定只读）
  amount: number;            // 金额（锁定只读）
  deliveryDate?: string;     // 交货日期（可编辑）
  remark?: string;
}

// 合同采购订单状态
export type ContractPurchaseOrderStatus = 'draft' | 'submitted' | 'cancelled';

// 采购订单变更记录
export interface ContractPurchaseOrderChangeRecord {
  id: string;
  changeNo: string;           // 变更单号
  orderId: string;            // 关联订单ID
  orderNo: string;            // 关联订单编号
  changeReason: string;       // 变更原因
  changeTime: string;         // 变更时间
  changer: string;            // 变更人
  beforeDetails: ContractPurchaseOrderDetail[];  // 变更前明细
  afterDetails: ContractPurchaseOrderDetail[];   // 变更后明细
  status: 'pending' | 'approved' | 'rejected';   // 变更状态
  approveTime?: string;       // 审批时间
  approver?: string;          // 审批人
  remark?: string;
}

// 合同采购订单（基于合同生成）
export interface ContractPurchaseOrder {
  id: string;
  orderNo: string; // 采购订单编号 CPO+日期+序号
  // 合同信息（锁定只读）
  contractId: string;
  contractNo: string;
  contractName: string;
  supplierId: string;
  supplierName: string;
  totalDuration?: string;   // 总工期
  acceptanceStandard?: string; // 验收标准
  paymentTerms?: string;    // 付款条款
  // 采购需求关联（多对1关系）
  procurementDemandId?: string;   // 关联的采购需求ID
  procurementDemandNo?: string;   // 关联的采购需求编号
  // 项目关联
  projectId?: string;       // 项目ID（实施项目或服务项目）
  projectName?: string;     // 项目名称
  projectType?: 'implementation_project' | 'service_project'; // 项目类型
  // 订单基础信息
  status: ContractPurchaseOrderStatus;
  createTime: string;
  creator: string;
  submitTime?: string;
  remark?: string;
  details: ContractPurchaseOrderDetail[];
  // 变更历史
  changeHistory?: ContractPurchaseOrderChangeRecord[];
}

// 入库单关联采购订单
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
  confirmTime?: string;
  confirmer?: string;
  remark?: string;
  details: InboundDetail[];
  attachments?: Attachment[];
  // 项目关联
  projectId?: string;      // 所属项目ID
  projectName?: string;    // 所属项目名称
  // 关联采购订单
  purchaseOrderId?: string;   // 关联合同采购订单ID
  purchaseOrderNo?: string;   // 关联合同采购订单编号
  // 归还退库关联出库单
  sourceOutboundId?: string;     // 来源出库单ID
  sourceOutboundNo?: string;     // 来源出库单号
  sourceOutboundType?: string;   // 来源出库单类型（领用/报废/报损）
}

// 入库申请单状态
export type InboundApplicationStatus = 'pending' | 'approved' | 'rejected';

// 入库申请明细
export interface InboundApplicationDetail {
  id: string;
  productId: string;
  productName?: string;
  productCode?: string;
  specification?: string;
  unit?: string;
  quantity: number; // 申请入库数量
  remark?: string;
}

// 入库申请单
export interface InboundApplication {
  id: string;
  applicationNo: string; // 申请单号
  applicant: string; // 申请人
  applicantDept?: string; // 申请部门
  warehouseId?: string; // 目标仓库
  warehouseName?: string;
  status: InboundApplicationStatus;
  createTime: string;
  approveTime?: string;
  approver?: string; // 审核人
  rejectReason?: string; // 拒绝原因
  remark?: string;
  details: InboundApplicationDetail[];
}

export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
}

// 采购单
export interface PurchaseOrderDetail {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  specification?: string;
  unit?: string;
  quantity: number; // 采购数量
  receivedQuantity?: number; // 已入库数量
  unitPrice?: number; // 单价
  totalPrice?: number; // 总价
  remark?: string;
}

export type PurchaseOrderStatus = 'pending' | 'partial' | 'completed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  orderNo: string; // 采购单号 PO+日期+序号
  supplierId?: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  totalAmount?: number; // 总金额
  operator: string;
  createTime: string;
  expectedDate?: string; // 预计到货日期
  remark?: string;
  relatedDemandId?: string; // 关联的需求申请ID
  details: PurchaseOrderDetail[];
}

// 员工（用于下拉选择：保管人、验收人、业务员等）
export interface Employee {
  id: string;
  name: string;
  role?: string; // 角色：保管人/验收人/业务员 等
  department?: string; // 所属部门
  status: 'enabled' | 'disabled';
}

export type OutboundOrderType = 'lowvalue' | 'exhibition' | 'requisition' | 'production' | 'workorder' | 'scrap';
export type OutboundOrderStatus = 'pending' | 'submitted' | 'confirmed';

// 展会项目
export type ProjectStatus = 'planning' | 'preparing' | 'ongoing' | 'completed';

export interface ExhibitionProject {
  id: string;
  projectNo: string;
  projectName: string;
  startDate: string;
  endDate: string;
  location: string;
  manager: string;
  status: ProjectStatus;
  remark?: string;
}

export interface OutboundDetail {
  id: string;
  outboundOrderId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  positionId?: string;
  positionName?: string;
  quantity: number;
  batchConsumptions?: BatchOutboundDetail[]; // FIFO 批次消耗记录
  transferOrderId?: string;   // 工单出库时关联的调拨单ID
  transferOrderNo?: string;   // 工单出库时关联的调拨单号
  workOrderId?: string;       // 工单出库时关联的工单ID
  workOrderCode?: string;     // 工单出库时关联的工单号
  workOrderName?: string;     // 工单出库时关联的工单名称
  isMain?: boolean;           // 是否为主料
}

export interface OutboundOrder {
  id: string;
  orderNo: string;
  type: OutboundOrderType;
  customerId?: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  projectId?: string;
  projectName?: string;
  implementUnit?: string;
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

// 仓库调拨单（同项目内仓库间调拨）
export interface StockTransferDetail {
  id: string;
  stockTransferId: string;
  productId: string;
  productName?: string;
  productCode?: string;
  fromPositionId?: string;
  fromPositionName?: string;
  toPositionId?: string;
  toPositionName?: string;
  quantity: number;
  batchConsumptions?: BatchOutboundDetail[]; // 出库时的批次消耗记录
  workOrderId?: string; // 关联工单ID
  workOrderCode?: string; // 关联工单号
  workOrderName?: string; // 关联工单名称
  isMain?: boolean; // 是否主料
}

export type StockTransferStatus = 'pending' | 'outbound_confirmed' | 'completed' | 'cancelled';

export interface StockTransfer {
  id: string;
  transferNo: string; // 调拨单号
  projectId?: string; // 所属项目
  projectName?: string;
  fromWarehouseId: string; // 调出仓库
  fromWarehouseName?: string;
  toWarehouseId: string; // 调入仓库
  toWarehouseName?: string;
  status: StockTransferStatus;
  creator: string; // 制单人
  createTime: string;
  outboundConfirmTime?: string; // 出库确认时间
  outboundConfirmer?: string; // 出库确认人
  inboundConfirmTime?: string; // 入库确认时间
  inboundConfirmer?: string; // 入库确认人
  remark?: string;
  details: StockTransferDetail[];
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
  quantity: number;
  sourceType: 'requisition' | 'scrap';
  sourceOrderId?: string;
  sourceOrderNo?: string;
  workOrderId?: string;
  workOrderCode?: string;
  workOrderName?: string;
}

export type ReturnOrderStatus = 'pending' | 'submitted' | 'confirmed';

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
  projectId?: string;
  projectName?: string;
  sourceType?: 'requisition' | 'scrap' | 'damaged';
  sourceOrderId?: string;
  sourceOrderNo?: string;
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

// 资产变更日志
export interface AssetChangeLog {
  id: string;
  assetId: string;
  changeTime: string;
  changeType: 'create' | 'requisition' | 'return' | 'transfer' | 'scrap' | 'damaged';
  changeTypeName: string;
  operator: string;
  remark?: string;
  // 领用相关
  department?: string;
  employee?: string;
  // 调拨相关
  fromWarehouse?: string;
  toWarehouse?: string;
}

// 资产设备档案
export interface AssetEquipment {
  id: string;
  code: string;
  name: string;
  specification?: string;
  unit: string;
  amount: number;
  warehouseId: string;
  warehouseName?: string;
  positionId?: string;
  positionName?: string;
  storageLocation: string;
  // 状态：在仓/领用中/已报废/已报损
  status: 'in_storage' | 'in_use' | 'scrapped' | 'written_off';
  // 领用信息
  requisitionDepartment?: string;
  requisitionEmployee?: string;
  requisitionDate?: string;
  // 变更日志
  changeLogs?: AssetChangeLog[];
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
  status: 'pending' | 'submitted' | 'confirmed';
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  projectId?: string;
  projectName?: string;
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
  status: 'pending' | 'submitted' | 'confirmed';
  operator: string;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  projectId?: string;
  projectName?: string;
}

// 库存流水记录
export type StockTransactionType = 'inbound' | 'outbound' | 'check_diff' | 'reversal';

export interface StockTransaction {
  id: string;
  transactionNo: string; // 流水号
  transactionTime: string; // 异动时间
  transactionType: StockTransactionType; // 异动类型
  productId: string;
  productCode: string;
  productName: string;
  specification?: string;
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
  projectId?: string; // 所属项目ID
  projectName?: string; // 所属项目名称
  reverseTransactionId?: string; // 被冲销的原流水ID（反确认时记录）
}

// 物资申请单明细
export interface ProductApplicationDetail {
  id: string;
  applicationId: string;
  productName: string; // 物资名称
  categoryName?: string; // 物资分类
  specification?: string; // 规格型号
  unit?: string; // 单位
  reason?: string; // 申请理由
}

// 审批记录
export interface ApprovalRecord {
  approver: string;
  approveTime: string;
  result: 'approved' | 'rejected' | 'returned' | 'commented';
  comment?: string;
  nodeName?: string; // 审批节点名称
  returnedToNode?: string; // 退回至哪个节点
}

// 审批流程配置节点
export interface ApprovalFlowNode {
  id: string;
  nodeName: string; // 节点名称
  nodeOrder: number; // 节点顺序
  approverRole: string; // 审批角色
  approverName?: string; // 具体审批人
  description?: string; // 节点说明
  isRequired: boolean; // 是否必经节点
  // 可选：审批人字段（支持指定具体人或角色）
}

// 审批流程配置
export interface ApprovalFlowConfig {
  id: string;
  flowName: string; // 流程名称
  businessType: 'procurement_plan' | 'procurement_demand' | 'procurement_order' | 'procurement_contract' | 'other'; // 业务类型
  businessSubType?: string; // 业务子类型（月度/年度）
  applicableDepartment?: string; // 适用部门（为空表示全部）
  nodes: ApprovalFlowNode[]; // 流程节点
  isActive: boolean; // 是否启用
  description?: string;
  createTime: string;
  creator: string;
  updateTime?: string;
  updater?: string;
}

// 物资申请单状态
export type ProductApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// 物资申请单
export interface ProductApplication {
  id: string;
  applicationNo: string; // 申请单号
  applicant: string; // 申请人
  applicantDept?: string; // 申请部门
  status: ProductApplicationStatus;
  applyDate: string; // 申请日期
  expectedDate?: string; // 期望日期
  remark?: string;
  createTime: string;
  details: ProductApplicationDetail[];
  // 附件
  attachments?: Attachment[];
  // 审批信息
  approver?: string; // 当前审批人
  approveTime?: string; // 审批时间
  approveRemark?: string; // 审批意见
  approvalHistory?: ApprovalRecord[]; // 审批历史
}

// 服务申请单明细（独立）
export interface ServiceApplicationDetail {
  id: string;
  applicationId: string;
  productName: string;
  serviceName?: string;
  categoryName?: string;
  specification?: string;
  unit?: string;
  reason?: string;
}

// 服务申请单状态（独立）
export type ServiceApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// 服务申请单（独立）
export interface ServiceApplication {
  id: string;
  applicationNo: string;
  applicant: string;
  applicantDept?: string;
  status: ServiceApplicationStatus;
  applyDate: string;
  expectedDate?: string;
  remark?: string;
  createTime: string;
  details: ServiceApplicationDetail[];
  attachments?: Attachment[];
  approver?: string;
  approveTime?: string;
  approveRemark?: string;
  approvalHistory?: ApprovalRecord[];
}

// 作业项目
export interface WorkOrderItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'enabled' | 'disabled';
  createTime: string;
}

// 工单物资配置明细
export interface WorkOrderProductItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  categoryName: string;
  specification?: string;
  unit: string;
  quantity: number;
}

// 工单物资配置
export interface WorkOrderProductConfig {
  id: string;
  workOrderId: string;
  workOrderCode: string;
  workOrderName: string;
  projectId: string;
  projectName: string;
  exhibitionName: string;
  category: string;
  mainProducts: WorkOrderProductItem[];
  auxiliaryProducts: WorkOrderProductItem[];
  remark?: string;
  createTime: string;
  updateTime?: string;
}

// ==================== 采购管理系统类型 ====================

// 采购计划类型
export type ProcurementPlanType = 'monthly' | 'annual';

// 采购计划状态
export type ProcurementPlanStatus = 'draft' | 'pending' | 'approved' | 'archived' | 'returned' | 'rejected_by_modify';

// 项目性质
export type ProjectNature = '服务' | '工程' | '物资';

// 采购方式
export type ProcurementMethod = '公开招标' | '邀请招标' | '竞争性谈判' | '单一来源采购' | '询价采购' | '框架协议采购';

// 评标办法
export type BidEvaluationMethod = '综合评分法' | '最低价法' | '性价比法';

// 采购计划明细
export interface ProcurementPlanDetail {
  id: string;
  planId: string;
  seq: number; // 序号
  projectName: string; // 项目名称
  projectNature: ProjectNature | ''; // 项目类别（服务/工程/物资）
  projectOverview: string; // 项目概况
  budgetAmount: number; // 项目估（预）算（万元）
  // ==================== 招标采购前置阶段 ====================
  userRequirementDocDate?: string; // 用户需求书编制计划完成时间
  budgetApprovalDate?: string; // 预算编制审批计划完成时间
  contractReviewDate?: string; // 合同前置审核计划完成时间
  // ==================== 招标采购阶段 ====================
  planProcurementStartDate?: string; // 计划采购启动时间
  planProcurementEndDate?: string; // 计划采购完成时间
  // ==================== 原有保留字段 ====================
  estimatedCost?: number; // 项目控制价（万元）
  plannedStartDate?: string; // 计划启动时间
  approvalDate?: string; // 立项时间
  approvalFileNo?: string; // 立项文件号
  plannedCompletionDate?: string; // 计划完成时间
  procurementMethod?: ProcurementMethod | ''; // 采购方式
  bidEvaluationMethod?: BidEvaluationMethod | ''; // 评标办法
  expertComposition?: string; // 专家组成
  isOwnerMainJudge?: boolean; // 是否委托业主主评委
  ownerJudge?: string; // 业主评委
  ownerCategory?: string; // 业主类别
  directEntrustUnit?: string; // 直接委托单位
  invitedSupplierUnits?: string; // 邀请供应商单位
  supplierCategory?: string; // 供应商目录类别
  isEntrustAgent?: boolean; // 是否委托招标代理
  tenderStartDate?: string; // 招选启动时间
  bidOpeningDate?: string; // 开标时间（预计）
  estimatedEntryDate?: string; // 预计进场时间
  remark?: string;
  approvalResult?: string; // 立项批复
  requirementDocument?: string; // 用户需求书/方案
  contractAndTechStandard?: string; // 合同及技术标准
  controlPrice?: number; // 项目控制价（万元）
}

// 采购计划
export interface ProcurementPlan {
  id: string;
  planNo: string; // 计划编号
  planType: ProcurementPlanType; // 月度/年度
  planMode?: 'approval' | 'filing'; // 审批制 / 报备制
  year: string; // 年份
  month?: string; // 月份（月度计划）
  department: string; // 需求部门
  status: ProcurementPlanStatus;
  createTime: string;
  creator: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  details: ProcurementPlanDetail[];
  attachments?: Attachment[];
  approvalHistory?: ApprovalRecord[];
  // 节点流程相关
  currentNodeId?: string; // 当前审批节点ID
  currentNodeName?: string; // 当前节点名称
  flowConfigId?: string; // 关联的审批流程配置ID
  isModifiedDuringApproval?: boolean; // 审批过程中是否被修改过
}

// 采购需求申请类型
export type ProcurementDemandType =
  | 'material'
  | 'implementation_project'
  | 'service_project'
  | 'service_non_engineering'     // 非工程类-服务（渲染服务清单内/外两张表）
  | 'material_non_engineering';   // 非工程类-货物（渲染货物明细，从 products 取数据）
// 物资采购 / 实施项目 / 服务项目 / 非工程类-服务 / 非工程类-货物

// ====================================================================
// 采购需求申请 — 框架合同清单内/外采购类型
// ====================================================================
// 需求背景：采购需求申请表单的核心选择，决定了"选择物资"弹窗里能看到哪些商品
// - within_framework（清单内）：只能选有有效框架合同的物资 → 后续走 framework 采购链路
// - outside_framework（清单外）：只能选无有效框架合同的物资 → 后续走完整招采流程
// - new_supplier（新增供应商目录）：清单内+清单外全部可选
//
// ⚠️ 重要业务规则：framework（框架合同清单内/外）的采购，在合约管理模块只与【合同台账】
//   关联（自动生成一条轻量台账记录记账），不跟【合同审批、归档、履约评估】流程关联。
//   非 framework 采购维持完整链路：手工建合同 → 审批 → 归档 → 履约 → 评估。
// ====================================================================
export type ProcurementType = 'within_framework' | 'outside_framework' | 'new_supplier';
// within_framework：清单内，只能选有有效框架合同的物资
// outside_framework：清单外，只能选无有效框架合同的物资
// new_supplier：新增供应商目录，清单内+清单外物资全部可选

// 采购需求申请状态
export type ProcurementMode = 'meeting' | 'sign_report' | 'application_form';
// 会议审批 / 签报审批 / 采购项目申请表

// 服务/工程类采购需求：多行项目明细行
export interface ProjectRow {
  id: string;
  dept: string;              // 需求部门
  projectName: string;      // 项目名称
  mainContent?: string;     // 主要内容（仅采购项目申请表）
  budgetAmount: number;      // 不含税预算总金额（全场景统一口径）
  budgetControlAmount: number; // 不含税预算审定总金额（预算审核后审定值）
  approvalMeetingName?: string; // 立项审批会议名称（仅会议审批）
  approvalDate: string;     // 立项审批日期
  remark?: string;          // 备注（采购项目申请表 + 服务类）
  // 附件占位（后续如需 per-row 附件管理可扩展）
  meetingMinutes?: string;   // 会议纪要及上会材料
  userRequirementDoc?: string; // 用户需求书 / 施工方案
  budgetAuditDoc?: string;   // 预算审核文件
  signReportDoc?: string;    // 签报审批相关文件
  // 合资公司字段（仅 物资类 material + 会议审批 meeting 组合才显示）
  jointMeetingMinutes?: string;   // 合资公司会议纪要及上会材料
  jointMeetingName?: string;      // 合资公司立项审批会议名称
  jointApprovalDate?: string;     // 合资公司立项审批日期
}

export type ProcurementDemandStatus =
  | 'draft'               // 申请草稿
  | 'pending'             // 申请审批中
  | 'approved'            // 申请审批通过（等待立项确认）
  | 'rejected'            // 申请审批驳回
  | 'changed'             // 变更发起后状态
  | 'confirm_pending'     // 立项审批中
  | 'confirm_approved'    // 立项审批通过（下游可见，可生成订单）
  | 'confirm_rejected';   // 立项审批驳回（可重提）

// 采购需求明细
export interface ProcurementDemandDetail {
  id: string;
  demandId: string;
  productId?: string; // 产品ID
  projectId?: string; // 项目ID（实施项目/服务项目）
  projectNo?: string; // 项目编号
  projectName?: string; // 项目名称
  projectType?: 'implementation' | 'service'; // 项目类型
  productCode: string; // 商品编码
  productName: string; // 产品名称
  productType?: string; // 产品类型
  productAttribute?: string; // 产品属性
  specification?: string; // 规格型号/参数
  unit: string; // 单位
  isInContractList?: boolean; // 是否在合同清单内
  isContractItem?: boolean; // 是否合同物料
  unitPriceExcludingTax?: number; // 单价（不含税）
  unitPriceIncludingTax?: number; // 单价（含税）
  taxRate?: number; // 税率
  unitPriceRemark?: string; // 单价备注
  quantity: number; // 采购数量
  amountExcludingTax?: number; // 不含税金额
  taxAmount?: number; // 税额
  amountIncludingTax?: number; // 含税金额
  stockQuantity?: number; // 库存数量
  costAuditUnitPriceExcludingTax?: number; // 成本审核-单价（不含税）
  costAuditUnitPriceIncludingTax?: number; // 成本审核-单价（含税）
  costAuditAmountIncludingTax?: number; // 成本审核-含税金额
  contractId?: string; // 合同编号
  contractNo?: string; // 合同编号
  contractExpiryDate?: string; // 合同有效期
  procurementDescription?: string; // 采购情况说明
  remark?: string;
}

// 采购需求申请
export interface ProcurementDemand {
  id: string;
  demandNo: string; // 采购编号
  demandType: ProcurementDemandType;
  businessCategory?: 'engineering' | 'non_engineering'; // 业务分类：工程类 / 非工程类
  subType?: 'construction' | 'service' | 'goods'; // 细分：施工 / 服务 / 货物
  procurementType: ProcurementType; // 框架合同清单内/外采购：清单内/清单外/新增供应商目录
  procurementMode?: ProcurementMode; // 需求立项方式：会议审批/签报审批/采购项目申请表
  applicant: string; // 申请人
  applicantDept: string; // 申请部门
  applyDate: string; // 申请日期
  projectName: string; // 采购项目名称
  projectDescription?: string; // 型号/描述
  technicalRequirements?: string; // 技术要求
  estimatedAmount?: number; // 预估金额
  requiredDeliveryDate?: string; // 要求到货日期
  reason: string; // 申请事由
  status: ProcurementDemandStatus;
  createTime: string;
  approveTime?: string;
  approver?: string;
  remark?: string;
  details: ProcurementDemandDetail[];
  projectRows?: ProjectRow[]; // 服务/工程类采购需求的多行项目明细
  attachments?: Attachment[];
  approvalHistory?: ApprovalRecord[];
  changeHistory?: DemandChangeRecord[]; // 变更历史记录
  relatedOrderId?: string; // 关联的采购工单ID
  budgetAudit?: {
    budgetAmount: number;
    auditAmount: number;
    auditDepartment?: string;
    auditTime?: string;
  };
  // 立项确认阶段字段（两阶段拆分后，procurementMode/projectRows 移至此阶段填写）
  confirmSubmitter?: string;    // 立项提交人
  confirmSubmitTime?: string;   // 立项提交时间
  confirmApprover?: string;     // 立项审批人
  confirmApproveTime?: string;  // 立项审批通过时间
  confirmRejectReason?: string; // 立项驳回原因
  confirmRejectTime?: string;   // 立项驳回时间
  // 立项阶段全局字段
  isThreeImportant?: boolean;   // 是否属于"三重一大"（三种立项方式都需勾选）
  // ============== 立项确认阶段 — 合同关联 ==============
  /** 是否需签订合同：yes=走标准链路（建工单→建合同→审批→归档）；no=挂已有执行中合同（需求金额自动计入合同已支付） */
  needContract?: 'yes' | 'no' | null;
  /** needContract='no' 时：关联的已有合同台账 ID（必须 status='active' 执行中） */
  contractId?: string;
  /** 合同编号快照（防合同删除后找不到，UI 自动带出合同名用） */
  contractNoSnapshot?: string;
}

// 采购需求变更记录
export interface ProcurementDemandChange {
  id: string;
  demandId: string;
  demandType?: ProcurementDemandType;
  changeNo: string;
  changeReason: string;
  changeTime: string;
  changer: string;
  beforeDetails: ProcurementDemandDetail[];
  afterDetails: ProcurementDemandDetail[];
  beforeProjectRows?: ProjectRow[];
  afterProjectRows?: ProjectRow[];
  status: 'pending' | 'approved' | 'rejected';
  approveTime?: string;
  approver?: string;
}

// 采购需求变更历史记录（存储在需求主表）
export interface DemandChangeRecord {
  id: string;
  changeNo: string;
  changeReason: string;
  changeTime: string;
  changer: string;
  beforeDetails: ProcurementDemandDetail[];
  afterDetails: ProcurementDemandDetail[];
  beforeProjectRows?: ProjectRow[];
  afterProjectRows?: ProjectRow[];
  status: 'pending' | 'approved' | 'rejected';
  approveTime?: string;
  approver?: string;
}

// ==================== 采购实施过程类型 ====================

/**
 * 招采执行-采购方式（9 种，对齐 916 文档《招采管理系统表盘模版》L18）
 *
 * 分两大体系：
 *   【国企采购 7 种】— 有对应表盘模板
 *     inquiry/competitive_bidding/negotiation_open/negotiation_invited/direct/framework/e_mall
 *   【招标 2 种】— 无专属表盘，走线下录入模式
 *     legal_bidding（法定招标）/ voluntary_bidding（自愿招标）
 *
 * 线上 vs 线下：
 *   ✅ framework 是唯一"目录内比价（线上报价）"模式，其他 8 种全是线下录入
 *
 * 需求背景：916 文档 L18 列了 9 种采购方式枚举，项目初始版本只有 7 种国企采购
 *          → 2026-09-17 补齐法定招标+自愿招标，用户反馈下拉要做全但选不中
 */
export type BiddingProcurementMethod =
  | 'inquiry'               // 询比采购（线下录入）
  | 'competitive_bidding'   // 竞价采购（线下录入）
  | 'negotiation_open'      // 谈判采购-公开（线下录入）
  | 'negotiation_invited'   // 谈判采购-邀请（线下录入）
  | 'direct'                // 直接采购（线下录入，最简单）
  | 'framework'             // 框架协议采购（目录内比价，唯一线上报价模式）
  | 'e_mall'                // 电子商城采购（线下录入）
  | 'legal_bidding'         // 法定招标（线下录入，无专属表盘）
  | 'voluntary_bidding';    // 自愿招标（线下录入，无专属表盘）

/** 采购方式中文名 */
export const BIDDING_METHOD_LABEL: Record<BiddingProcurementMethod, string> = {
  inquiry: '询比采购',
  competitive_bidding: '竞价采购',
  negotiation_open: '谈判采购-公开',
  negotiation_invited: '谈判采购-邀请',
  direct: '直接采购',
  framework: '框架协议采购',
  e_mall: '电子商城采购',
  legal_bidding: '法定招标',
  voluntary_bidding: '自愿招标',
};

/**
 * 旧竞价类型（已废弃，兼容历史数据）
 * @deprecated 请使用 procurementMethod
 */
export type BiddingType = 'market' | 'library';

/**
 * 工单审批状态
 * draft → submitted → approved/rejected → 后续业务状态
 */
export type BiddingApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/**
 * 工单完整状态 = 审批状态 + 业务推进状态
 * 线下录入类（询比/竞价/谈判/直接/电子商城）走审批状态
 * 目录内比价（线上报价）走完整业务状态
 */
export type BiddingStatus =
  | BiddingApprovalStatus
  | 'published'   // 审核通过后发布（仅目录内比价）
  | 'bidding'     // 招标进行中
  | 'evaluated'   // 已评审
  | 'completed'   // 已完成
  | 'cancelled';  // 已取消

// ============== 明细结构 ==============

/**
 * 明细类型枚举
 * 一个工单只会填其中一种明细
 */
export type BiddingDetailKind =
  | 'catalog_compare'  // 目录内比价-线上报价（旧 BiddingItem 扩展版）
  | 'offline';         // 线下录入明细（询比/竞价/谈判/直接/电子商城）

/**
 * 目录内比价-线上报价明细
 * 字段同旧 BiddingItem，加含税/不含税双线
 */
export interface CatalogCompareItem {
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  specification?: string;
  contractScope?: 'in' | 'out';       // 合同清单内/外
  priceDesc?: string;                 // 单价说明（固定单价/上限单价）
  // 上限（不含税/含税双线）
  unitPriceLimitExcludingTax?: number;
  unitPriceLimitIncludingTax?: number;
  taxRate?: number;                   // 税率（如 0.13）
  demandUnitPriceIncludingTax?: number;
  demandUnitPriceExcludingTax?: number;
  costAuditUnitPriceIncludingTax?: number;
  costAuditUnitPriceExcludingTax?: number;
  /** @deprecated 旧字段，等同 unitPriceLimitIncludingTax，兼容历史数据 */
  singlePriceLimit?: number;
}

/**
 * 线下录入明细（询比/竞价/谈判/直接/电子商城）
 * 采购方自己填单价，含税/不含税双线
 */
export interface OfflineDetailItem {
  rowNo: number;
  itemName: string;                   // 项目名称/物料名称
  description?: string;               // 项目概况
  quantity: number;
  unit: string;
  taxRate?: number;                   // 税率
  unitPriceExcludingTax?: number;     // 不含税单价
  unitPriceIncludingTax?: number;     // 含税单价（自动算或手填）
  amountExcludingTax?: number;        // 不含税金额
  amountIncludingTax?: number;         // 含税金额
  taxAmount?: number;                 // 税额
  supplierName?: string;              // 供应商（直接采购/电子商城必填）
}

// ============== 旧报价结构（兼容） ==============

/** 目录内比价-供应商报价明细（按物资） */
export interface BiddingQuoteDetail {
  productCode: string;
  productName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice: number;              // 供应商报的含税单价
  unitPriceExcludingTax?: number;
  taxRate?: number;
  amount: number;                 // 含税金额
  taxAmount?: number;
  amountExcludingTax?: number;
  isOverSingleLimit: boolean;
}

/** 目录内比价-供应商报价单 */
export interface BiddingQuote {
  id: string;
  biddingId: string;
  supplierId: string;
  supplierName: string;
  contactPerson?: string;
  contactPhone?: string;
  taxRate?: number;
  taxAmount?: number;
  details: BiddingQuoteDetail[];
  totalAmount: number;
  totalAmountExcludingTax?: number;
  isOverSingleLimit: boolean;
  isOverTotalLimit: boolean;
  submittedAt: string;
  isQualified: boolean;
  remark?: string;
  attachments?: Attachment[];
  confirmedSupplierId?: string;
  confirmedSupplierName?: string;
  confirmedAt?: string;
}

/**
 * 旧 BiddingItem（@deprecated，用 CatalogCompareItem 替代）
 */
export interface BiddingItem {
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  specification?: string;
  singlePriceLimit: number;
  demandUnitPriceIncludingTax?: number;
  demandUnitPriceExcludingTax?: number;
  costAuditUnitPriceIncludingTax?: number;
  costAuditUnitPriceExcludingTax?: number;
}

// ============== 主工单接口 ==============

/** 采购实施工单（招采执行） */
export interface Bidding {
  id: string;
  biddingNo: string;                 // 工单编号（保存时生成）
  projectName?: string;               // 项目名称（从需求带出，可编辑）
  biddingName?: string;              // @deprecated 同 projectName，兼容旧数据
  /** 采购方式（6 种国企采购） */
  procurementMethod?: BiddingProcurementMethod;
  /** @deprecated 旧的 market/library，兼容历史数据 */
  biddingType?: BiddingType;

  // ====== 关联采购需求 ======
  demandId?: string;
  demandNo?: string;

  // ====== 两种明细（根据采购方式只填一种）======
  /** 目录内比价-线上报价明细（原 BiddingItem 扩展） */
  items?: CatalogCompareItem[];
  /** 线下录入明细（询比/竞价/谈判/直接/电子商城） */
  offlineDetails?: OfflineDetailItem[];

  // ====== 金额汇总（不含税/含税双线） ======
  totalAmountExcludingTax?: number;  // 不含税金额合计
  totalAmountIncludingTax?: number;   // 含税金额合计
  totalTaxAmount?: number;            // 税额合计
  /** @deprecated 旧字段，含税上限 */
  totalPriceLimit?: number;

  // ====== 目录内比价特有 ======
  startTime?: string;
  endTime?: string;
  inviteSupplierIds?: string[];       // 受邀供应商（目录内比价才需要）
  quotes?: BiddingQuote[];            // 供应商线上报价

  // ====== 审批状态 & 业务状态 ======
  approvalStatus?: BiddingApprovalStatus; // 审批状态（draft/submitted/approved/rejected）
  status: BiddingStatus;                 // 展示用完整状态

  // ====== 非目录内比价-审批材料（Excel Row 13/25/38/42 附加字段）======
  procurementApprovalMethod?: string;   // 采购方式审批方式
  procurementApprovalDate?: string;    // 采购方式审批日期
  meetingMinutes?: Attachment[];        // 会议纪要（询比必须）
  onMeetingMaterials?: Attachment[];   // 上会材料（询比必须）
  demandMaterial?: Attachment[];       // 需求立项材料（竞价/谈判/直接）
  preContractReview?: Attachment[];    // 前置审核合同文本
  jointMeetingMinutes?: Attachment[];  // 合资公司会议纪要（可选）
  jointOnMeetingMaterials?: Attachment[]; // 合资公司上会材料（可选）
  tenderer?: string;                    // 招标人
  implementationUnit?: string;         // 招采实施单位
  projectImplementationUnit?: string;  // 项目实施单位
  procurementHandler?: string;          // 招采经办人
  agentName?: string;                   // 招标代理机构名称（询比/竞价/谈判）
  agentDrawResult?: Attachment[];      // 招标代理抽取结果表（询比/竞价/谈判）
  ownerRepresentative?: string;        // 业主代表（询比）
  hasDispute?: '是' | '否';            // 是否存在答疑/质疑/投诉
  hasOwnerJudge?: boolean;             // 是否委派业主评委（询比）
  judgeMethod?: string;                 // 评标办法
  winningSupplierId?: string;           // 中标供应商
  winningSupplierName?: string;
  winningSupplierLegalPerson?: string; // 中标单位法人名字
  winningSupplierScore?: number;        // 中标单位得分
  losingSupplier1Name?: string;         // 未中标单位1
  losingSupplier1LegalPerson?: string;
  losingSupplier1Score?: number;
  losingSupplier2Name?: string;         // 未中标单位2
  losingSupplier2LegalPerson?: string;
  losingSupplier2Score?: number;
  announcementPublishTime?: string;     // 招采公告发布时间
  bidOpeningTime?: string;              // 开标时间
  awardTime?: string;                   // 中标时间
  contractAmount?: number;              // 中标/合同金额（元）
  processArchive?: Attachment[];        // 招采过程备案/资料
  awardNotice?: Attachment[];            // 成交通知书文件
  remark?: string;

  // ====== 其他 ======
  creator: string;
  createTime: string;
  attachments?: Attachment[];           // 评定结果附件
  biddingAnnouncement?: Attachment[];   // 竞价公告附件（目录内比价）
  biddingDocuments?: Attachment[];      // 竞价文件附件（目录内比价）
}

// ==================== 供应商报价单类型 ====================

// 供应商报价单明细（按物料）
export interface SupplierQuoteDetail {
  productCode: string;
  productName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice: number; // 供应商报的含税单价
  taxRate?: number; // 税率（如 0.13 表示 13%，不填默认含税）
  amount: number; // 金额 = 单价 × 数量（含税）
  taxAmount?: number; // 税额 = 含税金额 / (1 + 税率) × 税率
  deliveryDate?: string; // 交货日期
  remark?: string;
}

// 供应商报价单（APP端上传）
export interface SupplierQuote {
  id: string;
  quoteNo: string; // 报价单编号
  biddingId: string; // 关联采购工单ID
  biddingNo: string; // 采购工单编号
  biddingName: string; // 采购工单名称
  supplierId: string;
  supplierName: string;
  contactPerson?: string; // 联系人
  contactPhone?: string; // 联系电话
  totalAmount: number; // 报价总金额（含税）
  taxRate?: number; // 税率（如 0.13 表示 13%，不填默认含税）
  taxAmount?: number; // 税额合计
  quoteDate: string; // 报价日期
  submittedAt: string; // 提交时间
  status: 'submitted' | 'accepted' | 'rejected'; // 报价状态
  details: SupplierQuoteDetail[]; // 物料明细
  attachments?: Attachment[]; // 附件（可上传扫描件等）
  remark?: string;
}

// ==================== 实施项目与服务项目类型 ====================

// 实施项目/服务项目
export interface Project {
  id: string;
  projectNo: string; // 项目编号
  projectName: string; // 项目名称
  type: 'implementation' | 'service'; // 项目类型：实施项目/服务项目
  status: 'enabled' | 'disabled'; // 状态
  updater?: string; // 更新人
  updateTime?: string; // 更新时间
  createTime: string; // 创建时间
  creator: string; // 创建人
  remark?: string; // 备注
}

// ==================== 合同模板类型 ====================

// 组件类型枚举
export type ComponentType =
  | 'heading' | 'paragraph' | 'text' | 'textarea' | 'number'
  | 'date' | 'select' | 'checkbox' | 'radio' | 'checkboxGroup'
  | 'attachment' | 'image' | 'signature' | 'stamp' | 'table'
  | 'divider' | 'alert'
  | 'col2' | 'section' | 'tab'
  | 'contractNo' | 'signDate' | 'partyA' | 'partyB'
  | 'contractAmount' | 'contractPeriod' | 'paymentTerms'
  | 'liquidatedDamages' | 'disputeResolution' | 'signArea';

// 组件分类
export type ComponentCategory = 'basic' | 'advanced' | 'layout' | 'contract';

// 组件元数据（用于组件库展示）
export interface ComponentMeta {
  type: ComponentType;
  label: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
}

// 校验规则
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' |
        'pattern' | 'email' | 'phone' | 'idCard' | 'fileType' | 'fileSize';
  value?: any;
  message: string;
}

// 模板组件
export interface TemplateComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  validation?: ValidationRule[];
  children?: TemplateComponent[];
  order: number;
  locked?: boolean;
}

// 表格列配置
export interface TableColumnConfig {
  key: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

// 条件显示规则
export interface VisibleWhenRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains';
  value: any;
}

// 模板结构
export interface TemplateStructure {
  components: TemplateComponent[];
  styles: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    themeColor: string;
  };
}

// 组件属性接口
export interface ComponentProps {
  // 通用属性
  label: string;
  fieldName: string;
  placeholder: string;
  description: string;
  required: boolean;
  requiredMessage: string;
  width: 'full' | 'half' | 'third';
  visible: boolean;
  disabled: boolean;
  readOnly: boolean;
  defaultValue: any;
  visibleWhen?: VisibleWhenRule;
  
  // 数字框
  min?: number;
  max?: number;
  decimal?: number;
  unit?: string;
  allowNegative?: boolean;
  format?: 'number' | 'currency' | 'percent';
  
  // 日期框
  dateFormat?: 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'YYYY年MM月DD日';
  minDate?: string;
  maxDate?: string;
  defaultToday?: boolean;
  
  // 选择框
  options?: { label: string; value: string }[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  
  // 附件
  acceptTypes?: string[];
  maxFileSize?: number;
  maxFileCount?: number;
  minFileCount?: number;
  autoUpload?: boolean;
  requireAllTypes?: boolean;
  
  // 图片
  maxWidth?: number;
  maxHeight?: number;
  allowCrop?: boolean;
  
  // 签字板
  penColor?: string;
  penWidth?: number;
  allowClear?: boolean;
  
  // 表格
  columns?: TableColumnConfig[];
  minRows?: number;
  maxRows?: number;
  allowAddRow?: boolean;
  allowDeleteRow?: boolean;
  sumColumn?: string;
  
  // 提示框
  alertType?: 'info' | 'warning' | 'success' | 'error';
  
  // 标题
  level?: 1 | 2 | 3;
  
  // 段落
  content?: string;
  
  // 合同专属
  partyRole?: '甲方' | '乙方';
  contactFields?: boolean;
  amountInWords?: boolean;
  interestRate?: number;
  paymentNodes?: { label: string; ratio: number }[];
  disputeType?: 'arbitration' | 'litigation';
}

// 合同模板批注
export interface TemplateAnnotation {
  id: string;
  templateId: string;
  version: number;
  position?: string;
  content: string;
  author: string;
  createTime: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedTime?: string;
}

// ==================== 数据源映射类型 ====================

// 数据源类型
export type DataSourceType = 'bidding' | 'demand' | 'supplier' | 'custom';

// 数据源字段映射配置
export interface DataSourceMapping {
  id: string;
  componentId: string; // 模板组件ID
  dataSource: DataSourceType; // 数据源类型
  sourceField: string; // 数据源字段名
  sourceFieldLabel: string; // 数据源字段标签（显示用）
  targetField: string; // 目标字段（组件的fieldName）
  transform?: string; // 转换函数名（可选）
  defaultValue?: string; // 默认值（数据源无值时使用）
}

// 采购工单可映射字段配置
export const BIDDING_FIELDS = [
  { key: 'biddingNo', label: '竞价编号' },
  { key: 'biddingName', label: '竞价名称' },
  { key: 'projectName', label: '项目名称' },
  { key: 'creator', label: '创建人' },
  { key: 'winningSupplierName', label: '成交供应商' },
  { key: 'totalPriceLimit', label: '整单上限总价' },
  { key: 'createTime', label: '创建时间' },
  { key: 'status', label: '工单状态' },
  { key: 'procurementMethod', label: '采购方式' },
  { key: 'bidEvaluationMethod', label: '评标办法' },
];

// 需求单可映射字段配置
export const DEMAND_FIELDS = [
  { key: 'demandNo', label: '需求编号' },
  { key: 'title', label: '需求标题' },
  { key: 'demandType', label: '需求类型' },
  { key: 'department', label: '需求部门' },
  { key: 'creator', label: '创建人' },
  { key: 'budget', label: '预算金额' },
  { key: 'createTime', label: '创建时间' },
];

// 供应商可映射字段配置
export const SUPPLIER_FIELDS = [
  { key: 'supplierCode', label: '供应商编码' },
  { key: 'supplierName', label: '供应商名称' },
  { key: 'contactPerson', label: '联系人' },
  { key: 'contactPhone', label: '联系电话' },
  { key: 'contactEmail', label: '联系邮箱' },
  { key: 'address', label: '地址' },
  { key: 'bankAccount', label: '银行账号' },
  { key: 'taxNumber', label: '税号' },
];

// 合同模板（扩展支持拖拽结构和数据源映射）
export interface ContractTemplate {
  id: string;
  name: string;
  category: ContractCategory;
  content: string;
  structure?: TemplateComponent[];
  version: number;
  isDefault: boolean;
  createTime: string;
  creator: string;
  updateTime?: string;
  updater?: string;
  remark?: string;
  versions?: ContractTemplateVersion[];
  annotations?: TemplateAnnotation[];
  dataSourceMappings?: DataSourceMapping[]; // 数据源映射配置
}

// 历史记录状态
export interface HistoryState {
  past: TemplateComponent[][];
  present: TemplateComponent[];
  future: TemplateComponent[][];
}

// 合同模板版本记录
export interface ContractTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  content: string;
  createTime: string;
  creator: string;
  changeLog?: string; // 变更说明
}

// 合同预警
export interface ContractWarning {
  id: string;
  contractId: string;
  contractNo: string;
  contractName: string;
  warningType: 'expiring' | 'amount_reached' | 'expired'; // 即将到期 / 金额封顶 / 已到期
  warningDate: string;
  content: string;
  isRead: boolean;
  isHandled: boolean;
  handler?: string;
  handleTime?: string;
}

// ==================== 网站（宣传）信息报送审核发布登记表 ====================

// 审批节点
export interface WebsiteApprovalNode {
  nodeName: string; // 节点名称（如: 部门负责人、分管领导、部门审核等）
  approver: string; // 审批人
  approvalDate?: string; // 审批日期
  opinion: string; // 审批意见
  result: 'approved' | 'rejected' | 'pending'; // 审批结果
}

// 网站信息报送登记表
export interface WebsiteInfo {
  id: string;
  infoNo: string; // 登记编号
  // 第一区块：信息报送单位填写
  submitTime: string; // 报送时间
  submitUnit: string; // 报送单位
  submitDepartment: string; // 报送部门
  submitColumn: string; // 报送栏目
  infoCategory: string; // 信息类别
  applicant: string; // 申请人
  contactPhone: string; // 联系电话
  title: string; // 标题
  provideForm: string; // 提供形式
  validityType: 'short' | 'long'; // 有效期类型：1.短期 / 2.长期
  validityStartDate?: string; // 短期开始日期
  validityEndDate?: string; // 短期结束日期
  // 第二区块：审核单位填写（各节点审批意见）
  approvalNodes?: WebsiteApprovalNode[];
  // 第三区块：签收与发布单位填写
  receiveTime?: string; // 接收时间
  receiver: string; // 接收人
  publishTime?: string; // 上网时间
  publishColumn?: string; // 上网栏目
  archived: 'yes' | 'no'; // 是否存档
  publisherConfirm: string; // 信息发布人确认
  // 通用
  status: 'draft' | 'submitted' | 'in_approval' | 'approved' | 'rejected' | 'published';
  creator: string;
  createTime: string;
}

// 合同类型
export type ContractCategory = 
  | 'exhibition_service'
  | 'exhibition_display' 
  | 'procurement' 
  | 'investment' 
  | 'other';

// 招采类合同形成方式（Excel 合约管理备注3）
export type ProcurementFormation =
  | 'legal_bidding'          // 法定招标
  | 'voluntary_bidding'      // 自愿招标
  | 'state_owned_xunbi'      // 国企采购-询比采购
  | 'state_owned_jingjia'    // 国企采购-竞价采购
  | 'state_owned_tanpan'     // 国企采购-谈判采购
  | 'state_owned_direct'     // 国企采购-直接采购
  | 'state_owned_framework'  // 国企采购-框架协议采购
  | 'state_owned_mall';      // 国企采购-电子商城采购

// 非招采类合同形成方式（Excel 非招采类备注2）
export type NonProcurementFormation =
  | 'exhibition_host'        // 展览服务-主办合同
  | 'exhibition_venue'       // 展览服务-主场合同
  | 'exhibition_display'     // 展览展示服务
  | 'investment_contract'    // 招商合同
  | 'other';                 // 其他

// 合同形成方式（联合类型，根据 contractNature 动态取对应枚举）
export type ContractFormation = ProcurementFormation | NonProcurementFormation;

// 招采类合同类型（Excel 招采类备注2：从前期需求自动带入）
export type ProcurementContractType =
  | 'engineering'            // 工程类
  | 'non_engineering';       // 非工程类

// 非招采类合同类型（Excel 非招采类备注1）
export type NonProcurementContractType =
  | 'engineering_construction'   // 工程类-施工
  | 'engineering_service'        // 工程类-服务
  | 'engineering_goods'          // 工程类-货物（含材料设备）
  | 'non_engineering_service'    // 非工程类-服务
  | 'non_engineering_goods';     // 非工程类-货物（含材料设备）

// 合同类型（联合类型）
export type ContractType = ProcurementContractType | NonProcurementContractType;

// 合同性质（顶层区分：招采类 vs 非招采类）
export type ContractNature = 'procurement' | 'non_procurement';

// 合同状态
export type ContractStatus = 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'terminated' | 'completed' | 'invalid' | 'suspended';

// ====================================================================
// 合同台账记录
// ====================================================================
// 需求背景：
//   1. 列顺序严格对齐 916 文档 L50-52（26 列），其中"合同性质(contractNature)"为本项目自增区分列
//      （916L50 无但实际业务需要区分招采类 vs 非招采类合同）
//   2. "合同主要内容(mainContent)"和"合同履约评估情况(contractEvaluations)"为 916L50 有但原项目缺失的字段
//      → 2026-09-17 台账列对齐时补齐
//   3. 合同编号(contractNo) 改为手工输入，不再自动生成（commit 9d1d88b 初次改，7d88379 清理残留死函数）
//
// ⚠️ framework 采购隔离规则（重要）：
//   framework（框架协议/清单内比价）来源的采购数据，在合约管理只与"合同台账"关联（自动生成轻量记账台账），
//   不进入合同审批流、不走归档、不走履约评估。只有非 framework 采购维持完整链路：
//     招采工单 → 手工建合同 → 合同审批 → 合同台账 → 归档 → 履约评估 → 供应商考核
// ====================================================================
export interface ContractLedger {
  id: string;
  contractId: string;
  contractNo: string; // 合同编码 —— ⚠️ 手工输入，不自动生成
  contractName: string; // 合同名称
  /** 合同性质（顶层区分：招采类 vs 非招采类） */
  contractNature: ContractNature;
  // ====== 关联招采数据 ======
  demandId?: string;        // 关联采购需求 ID（合同表单"关联采购需求"下拉自动带）
  demandNo?: string;        // 关联采购需求编号
  category: ContractCategory; // 分类
  /** 合同类型（根据 contractNature 动态取对应枚举） */
  contractType: ProcurementContractType | NonProcurementContractType;
  /** 合同形成方式（根据 contractNature 动态取对应枚举） */
  formation: ContractFormation;
  winningDate?: string;          // 中标时间（招采类有效）
  isModelText?: boolean;         // 示范文本（是/否）
  demandDepartment?: string;     // 我方-需求部门
  handlingDepartment?: string;   // 我方-经办部门
  handler?: string;              // 我方-经办人
  handlerContact?: string;       // 我方单位-联系方式 🆕
  counterpartyName?: string;     // 对方单位-单位名称
  counterpartyContact?: string;  // 对方单位-负责人
  mainContent?: string;          // 合同主要内容
  signingDate?: string;          // 合同签订日期
  effectiveDate?: string;        // 合同约定生效日期
  terminationDate?: string;      // 合同约定终止日期
  endDate?: string;              // 合同结束日期
  expireDate?: string;           // 合同到期日期
  amount?: number;               // 合同金额（万元）
  /** 合同已支付金额（万元）— ⚠️ 展示值 = paidAmountBase + Σ(linkedDemandIds 需求预估金额)，聚合函数在 utils/contractAggregate.ts */
  paidAmount?: number;
  /** paidAmount 的手动基础值（万元），needContract='no' 挂账需求会自动累加 */
  paidAmountBase?: number;
  settlementAmount?: number;     // 合同结算金额（万元）
  performanceStatus?: string;    // 合同履行情况
  requisitionAmount?: number;    // 采购申请金额（元）🆕 预留，无采购申请模块时为空
  paymentDescription?: string;   // 付款情况说明
  approvalMethod?: string;       // 立项方式
  approvalRemark?: string;       // 立项方式备注
  isSettlementAudited?: boolean; // 结算审核（是/否）
  businessCategory?: 'expense' | 'income' | 'other'; // 资金流向分类
  subType?: 'exhibition_display' | 'procurement' | 'investment'; // 细分类型
  subRemark?: string;            // 细分备注
  isOriginalSigned?: boolean;    // 原件是否签收
  archivedAttachments?: string;  // 存档附件资料
  archiveStatus?: 'not_started' | 'in_progress' | 'archived'; // 合同归档情况 🆕
  remark?: string;
  status: ContractStatus;
  // 关联采购工单（招采类合同常用）
  biddingId?: string;            // 关联采购工单ID
  biddingNo?: string;            // 关联采购工单编号
  projectName?: string;          // 项目名称（从工单带入）
  /** 合同考核绑定（一个合同可加多种考核，招采类合同常用） */
  contractEvaluations?: ContractEvaluationBinding[];
  // ===== 招采类合同独有字段（contractNature='procurement' 时有效） =====
  /** 履约评价（保证金/质保金）：是则自动关联履约评价流程 */
  guaranteeEvaluation?: { isOpen: boolean; guaranteeType?: string };
  /** 考核管理：单个项目考核 / 月度 / 季度 — 自动关联供应商考核流程 */
  assessmentManagement?: 'single_project' | 'monthly' | 'quarterly' | null;
  /** 年度评价：是则自动关联供应商年度评价流程 */
  yearlyEvaluation?: boolean;
  // ===== 非招采类合同独有字段（contractNature='non_procurement' 时有效） =====
  /** 履约保证金（Excel 非招采类备注3：只有合同形成方式='exhibition_service' 时此门控才生效） */
  performanceBond?: {
    /** 门控：合同形成方式是否为展览服务（由非招采类表单自动控制） */
    gateByFormation: boolean;
    /** 开关：是否收取履约保证金 */
    isEnabled: boolean;
    amount?: number;       // 保证金金额（万元）
    receiveDate?: string;  // 收款时间
  };
  /**
   * 反查：needContract='no' 且挂在本合同上的采购需求 ID 列表
   * 立项确认 needContract='no' + 选合同时自动追加；解绑时移除
   * 用于 paidAmount 自动聚合 + 合同详情 tab 展示关联需求
   */
  linkedDemandIds?: string[];
}

// ===== 合约管理 label 常量（Excel 原始选项）=====
export const PROCUREMENT_FORMATION_LABELS: Record<ProcurementFormation, string> = {
  legal_bidding: '法定招标',
  voluntary_bidding: '自愿招标',
  state_owned_xunbi: '国企采购-询比采购',
  state_owned_jingjia: '国企采购-竞价采购',
  state_owned_tanpan: '国企采购-谈判采购',
  state_owned_direct: '国企采购-直接采购',
  state_owned_framework: '国企采购-框架协议采购',
  state_owned_mall: '国企采购-电子商城采购',
};

export const NON_PROCUREMENT_FORMATION_LABELS: Record<NonProcurementFormation, string> = {
  exhibition_host: '展览服务-主办合同',
  exhibition_venue: '展览服务-主场合同',
  exhibition_display: '展览展示服务',
  investment_contract: '招商合同',
  other: '其他',
};

export const PROCUREMENT_CONTRACT_TYPE_LABELS: Record<ProcurementContractType, string> = {
  engineering: '工程类',
  non_engineering: '非工程类',
};

export const NON_PROCUREMENT_CONTRACT_TYPE_LABELS: Record<NonProcurementContractType, string> = {
  engineering_construction: '工程类-施工',
  engineering_service: '工程类-服务',
  engineering_goods: '工程类-货物（含材料设备）',
  non_engineering_service: '非工程类-服务',
  non_engineering_goods: '非工程类-货物（含材料设备）',
};

export const ARCHIVE_STATUS_LABELS: Record<'not_started' | 'in_progress' | 'archived', string> = {
  not_started: '未开始',
  in_progress: '进行中',
  archived: '已归档',
};

export const BUSINESS_CATEGORY_LABELS: Record<'expense' | 'income' | 'other', string> = {
  expense: '支出合同',
  income: '收入合同',
  other: '其他合同',
};

// ==================== 合同考核绑定 ====================

export type ContractEvaluationFrequency =
  | 'once'         // 单次（如项目结束后考核）
  | 'monthly'      // 月度
  | 'quarterly'    // 季度
  | 'yearly'       // 年度
  | 'contract_end'; // 合同到期前 N 天

/** 合同-考核绑定（一个合同可绑定多种考核） */
export interface ContractEvaluationBinding {
  id: string;
  /** 考核类型 */
  kind: EvaluationType;
  /** 绑定的模板 ID */
  templateId: string;
  templateName?: string;
  /** 提醒频率 */
  frequency: ContractEvaluationFrequency;
  /** 下次提醒时间 */
  nextRemindDate?: string;
  /** 最后一次考核日期 */
  lastEvaluatedDate?: string;
  /** 下次提醒前提前天数（默认 7） */
  advanceDays?: number;
  /** 备注 */
  remark?: string;
  createTime: string;
  creator?: string;
}

// 采购订单状态
export type ProcurementOrderStatus = 'draft' | 'pending' | 'approved' | 'sent' | 'completed' | 'cancelled';

// 采购订单明细
export interface ProcurementOrderDetail {
  id: string;
  orderId: string;
  productId: string;
  productCode: string;
  productName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice?: number;
  amount?: number;
  deliveryDate?: string;
  remark?: string;
  // 公开招聘字段
  winningSupplierId?: string; // 中标供应商ID
  winningSupplierName?: string; // 中标供应商名称
  taxRate?: number; // 税率（如 0.13 表示13%）
  unitPriceIncludingTax?: number; // 含税单价
  taxAmount?: number; // 税额
}

// 采购订单
export interface ProcurementOrder {
  id: string;
  orderNo: string;
  sourceType?: 'framework' | 'one_time' | 'public_recruit' | 'framework_bidding'; // 订单来源
  demandId?: string; // 关联采购需求
  demandNo?: string;
  contractId?: string; // 关联合同
  contractNo?: string;
  supplierId?: string;
  supplierName?: string;
  status: ProcurementOrderStatus;
  createTime: string;
  creator: string;
  creatorDept?: string; // 创建人部门
  handler?: string; // 经办人
  handlingDepartment?: string; // 经办部门
  approveTime?: string;
  approver?: string;
  deliveryDate?: string; // 整体要求交货日期
  deliveryAddress?: string; // 交付地址
  contactPerson?: string; // 联系人
  contactPhone?: string; // 联系电话
  sender?: string; // 订单发送人
  senderContact?: string; // 订单发送人联系方式
  sentTime?: string; // 发送时间
  completionTime?: string; // 完成时间
  remark?: string;
  details: ProcurementOrderDetail[];
  attachments?: Attachment[];
  approvalHistory?: ApprovalRecord[];
}

// 采购订单变更记录
export interface ProcurementOrderChange {
  id: string;
  orderId: string;
  changeNo: string;
  changeReason: string;
  changeTime: string;
  changer: string;
  beforeDetails: ProcurementOrderDetail[];
  afterDetails: ProcurementOrderDetail[];
  status: 'pending' | 'approved' | 'rejected';
  approveTime?: string;
  approver?: string;
}

// 验收记录
export interface ProcurementInspection {
  id: string;
  inspectionNo: string;
  orderId?: string; // 关联订单
  orderNo?: string;
  supplierId?: string;
  supplierName?: string;
  inspectionDate: string;
  inspector: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  remark?: string;
  details: {
    id: string;
    productId: string;
    productCode: string;
    productName: string;
    specification?: string;
    unit: string;
    orderedQuantity: number;
    inspectedQuantity: number;
    passQuantity: number;
    failQuantity: number;
    isQualified: boolean;
    remark?: string;
  }[];
  attachments?: Attachment[];
  approveTime?: string;
  approver?: string;
  approvalHistory?: ApprovalRecord[];
}

export interface FrozenExhibition {
  id: string;
  exhibitionName: string;
  operator: string;
  operateTime: string;
  remark?: string;
}

export interface FreezeLog {
  id: string;
  exhibitionNames: string[];
  operateType: 'freeze' | 'unfreeze';
  operator: string;
  operateTime: string;
  remark?: string;
}

// ==================== 会议纪要类型 ====================

export interface MeetingNoteItem {
  id: string;
  content: string;
}

export interface MeetingNote {
  id: string;
  meetingDate: string;
  title?: string;
  items: MeetingNoteItem[];
  images: string[]; // base64
  createdAt: string;
  updatedAt: string;
}

// ==================== 合同文本管理类型 ====================

export type ContractTextType = 'model' | 'non_model';
export type ContractTextStatus = 'draft' | 'active' | 'archived';

export interface ContractText {
  id: string;
  name: string;
  type: ContractTextType;
  category: ContractCategory;
  content: string;
  structure?: TemplateComponent[];
  version: number;
  status: ContractTextStatus;
  isModel?: boolean;
  baseTemplateId?: string;
  supplements: TextSupplement[];
  attachments: Attachment[];
  annotations: TextAnnotation[];
  creator: string;
  createTime: string;
  updater?: string;
  updateTime?: string;
  remark?: string;
}

export interface TextSupplement {
  id: string;
  title: string;
  content: string;
  sort: number;
}

export interface TextAnnotation {
  id: string;
  textId: string;
  version: number;
  position?: string;
  content: string;
  author: string;
  createTime: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedTime?: string;
}

export interface ContractTextVersion {
  id: string;
  textId: string;
  version: number;
  content: string;
  structure?: TemplateComponent[];
  supplements: TextSupplement[];
  changeLog: string;
  createTime: string;
  creator: string;
}

// ==================== 考核评价类型 ====================

/** 考核/评价类型（按评价表模版文件夹结构组织） */
export type EvaluationType =
  | 'project_single'      // 单个项目考核（考核管理）
  | 'monthly'             // 月度考核（考核管理）
  | 'quarterly'           // 季度考核（考核管理）
  | 'yearly'              // 年度评价
  | 'contract_performance' // 合同履约评价
  | 'warranty'            // 质保履约（兼容旧数据）
  | 'single';             // 兼容旧数据（同 project_single）

export type EvaluationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

export interface EvaluationIndicator {
  id: string;
  name: string;
  category: string;
  weight: number;
  maxScore: number;
  description?: string;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  type: EvaluationType;
  indicators: EvaluationIndicator[];
  totalWeight: number;
  description?: string;
  creator: string;
  createTime: string;
  updateTime?: string;
  isDefault?: boolean;
  /** 是否系统内置（不可删除、不可直接编辑指标） */
  isBuiltin?: boolean;
  /** 从哪个内置模板克隆而来（可追溯） */
  clonedFrom?: string;
}

export interface EvaluationScoreItem {
  indicatorId: string;
  indicatorName: string;
  score: number;
  weight: number;
  weightedScore: number;
  comment?: string;
}

export interface EvaluationRecord {
  id: string;
  templateId: string;
  templateName: string;
  supplierId: string;
  supplierName: string;
  contractId?: string;
  contractNo?: string;
  projectName?: string;
  type: EvaluationType;
  scores: EvaluationScoreItem[];
  totalScore: number;
  evaluator: string;
  evaluationDate: string;
  status: EvaluationStatus;
  attachments?: Attachment[];
  approvalHistory?: Array<{
    approver: string;
    action: 'approved' | 'rejected' | 'pending';
    time: string;
    comment?: string;
  }>;
  remark?: string;
}

export const EVALUATION_TYPE_LABELS: Record<EvaluationType, string> = {
  project_single: '单个项目考核',
  single: '单个项目考核',        // 兼容旧数据
  monthly: '月度考核',
  quarterly: '季度考核',
  yearly: '年度评价',
  contract_performance: '合同履约评价',
  warranty: '质保履约考核',
};

/** 考核大类分组（用于模板管理 tab） */
export const EVALUATION_TYPE_GROUPS: Record<string, { label: string; types: EvaluationType[] }> = {
  assessment: {
    label: '考核管理',
    types: ['project_single', 'single', 'monthly', 'quarterly'],
  },
  yearly: {
    label: '年度评价',
    types: ['yearly'],
  },
  contract: {
    label: '合同履约评价',
    types: ['contract_performance'],
  },
  other: {
    label: '其他',
    types: ['warranty'],
  },
};

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  completed: '已完成',
};
