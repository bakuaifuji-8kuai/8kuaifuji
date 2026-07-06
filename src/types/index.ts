// 仓库类别
export type WarehouseCategory = 'raw_material' | 'finished_product' | 'exhibition' | 'general' | 'consumable' | 'fixed_asset';

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

// 采购合同类型
export type ContractType = 'purchase' | 'service' | 'lease';

// 采购合同
export interface Contract {
  id: string;
  contractNo: string;
  contractName: string;
  supplierId?: string;
  supplierName?: string;
  type: ContractType;
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
  // 新增：供应商归口管理部门与资质管理
  managementDepartment?: string; // 归口管理部门
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
  | 'businessScope' | 'managementDepartment' | 'qualification';

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
export type BidEvaluationMethod = '综合评分法' | '最低价法' | '性价比法' | '随机抽取法';

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
export type ProcurementDemandType = 'material' | 'implementation_project' | 'service_project';
// 物资采购 / 实施项目 / 服务项目

// 采购类型
export type ProcurementType = 'framework' | 'once' | 'mixed';
// 框架采购：只能选择有有效合同的物资
// 单次采购：只能选择无有效合同的物资
// 混选采购：可选全部物资

// 采购需求申请状态
export type ProcurementDemandStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'changed';

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
  procurementType: ProcurementType; // 采购类型：框架采购/单次采购/混选采购
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
}

// 采购需求变更记录
export interface ProcurementDemandChange {
  id: string;
  demandId: string;
  changeNo: string;
  changeReason: string;
  changeTime: string;
  changer: string;
  beforeDetails: ProcurementDemandDetail[];
  afterDetails: ProcurementDemandDetail[];
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
  status: 'pending' | 'approved' | 'rejected';
  approveTime?: string;
  approver?: string;
}

// ==================== 竞价采购类型 ====================

// 竞价类型
export type BiddingType = 'market' | 'library'; // 市场竞价 / 供应商库内竞价

// 竞价状态
export type BiddingStatus = 'draft' | 'published' | 'bidding' | 'evaluated' | 'completed' | 'cancelled';

// 竞价供应商报价明细（按物资）
export interface BiddingQuoteDetail {
  productCode: string;
  productName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice: number; // 供应商报的含税单价
  taxRate?: number; // 税率
  amount: number; // 含税金额 = 数量 * 含税单价
  taxAmount?: number; // 税额 = 含税金额 / (1+税率) × 税率
  isOverSingleLimit: boolean; // 是否超出单品上限
}

// 竞价供应商报价
export interface BiddingQuote {
  id: string;
  biddingId: string;
  supplierId: string;
  supplierName: string;
  contactPerson?: string; // 联系人
  contactPhone?: string; // 联系电话
  taxRate?: number; // 税率
  taxAmount?: number; // 税额合计
  details: BiddingQuoteDetail[]; // 按物资明细报价
  totalAmount: number; // 含税总报价
  isOverSingleLimit: boolean; // 是否超出单品上限
  isOverTotalLimit: boolean; // 是否超出整单上限
  submittedAt: string; // 报价时间
  isQualified: boolean; // 是否符合条件
  remark?: string;
  attachments?: Attachment[];
  // 市场采购：回写后确认的成交供应商
  confirmedSupplierId?: string;
  confirmedSupplierName?: string;
  confirmedAt?: string; // 确认时间
}

// 采购工物资明细条目
export interface BiddingItem {
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  specification?: string;
  singlePriceLimit: number; // 单品上限单价（用户填写）
  demandUnitPriceIncludingTax?: number; // 采购申请单价（含税，来自需求）
  demandUnitPriceExcludingTax?: number; // 采购申请单价（不含税）
  costAuditUnitPriceIncludingTax?: number; // 成本审核单价（含税）
  costAuditUnitPriceExcludingTax?: number; // 成本审核单价（不含税）
}

// 竞价采购
export interface Bidding {
  id: string;
  biddingNo: string; // 竞价编号
  biddingName: string; // 竞价名称
  biddingType: BiddingType;
  demandId?: string; // 关联需求
  demandNo?: string;
  projectName?: string;
  procurementMethod?: string; // 采购方式
  bidEvaluationMethod?: string; // 评标办法
  items?: BiddingItem[]; // 物资明细（含单品上限）
  totalPriceLimit?: number; // 整单上限总价
  startTime?: string; // 招标开始时间
  endTime?: string; // 招标截止时间
  status: BiddingStatus;
  creator: string;
  createTime: string;
  inviteSupplierIds?: string[]; // 受邀供应商ID列表
  quotes: BiddingQuote[]; // 供应商报价
  winningSupplierId?: string; // 成交供应商
  winningSupplierName?: string;
  resultRemark?: string; // 评审结果说明
  attachments?: Attachment[]; // 竞价小组评定结果附件
  biddingAnnouncement?: Attachment[]; // 竞价公告附件
  biddingDocuments?: Attachment[]; // 竞价文件附件
  // 兼容性保留字段（已废弃，以 items 为准）
  singlePriceLimit?: number; // 单品上限单价（已废弃，以 items 为准）
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

// 合同模板
export interface ContractTemplate {
  id: string;
  name: string;
  category: ContractCategory;
  content: string; // 模板内容
  version: number; // 版本号
  isDefault: boolean; // 是否默认模板
  createTime: string;
  creator: string;
  updateTime?: string;
  updater?: string;
  remark?: string;
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
export type ContractCategory = 'exhibition_service' | 'exhibition_display' | 'procurement' | 'investment' | 'other';

// 合同形成方式
export type ContractFormation = 'online' | 'offline';

// 合同状态
export type ContractStatus = 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'terminated' | 'completed' | 'invalid' | 'suspended';

// 合同台账记录
export interface ContractLedger {
  id: string;
  contractId: string;
  contractNo: string; // 合同编码
  contractName: string; // 合同名称
  category: ContractCategory; // 分类
  contractType: 'engineering' | 'non_engineering'; // 工程类/非工程类
  formation: ContractFormation; // 合同形成方式
  demandDepartment?: string; // 我方-需求部门
  handlingDepartment?: string; // 我方-经办部门
  handler?: string; // 我方-经办人
  counterpartyName?: string; // 对方单位-单位名称
  counterpartyContact?: string; // 对方单位-负责人
  mainContent?: string; // 合同主要内容
  signingDate?: string; // 合同签订日期
  effectiveDate?: string; // 合同约定生效日期
  terminationDate?: string; // 合同约定终止日期
  endDate?: string; // 合同结束日期
  expireDate?: string; // 合同到期日期
  amount?: number; // 合同金额（万元）
  paidAmount?: number; // 合同已支付金额（万元）
  settlementAmount?: number; // 合同结算金额（万元）
  performanceStatus?: string; // 合同履行情况
  paymentDescription?: string; // 付款情况说明
  approvalMethod?: string; // 立项方式
  approvalRemark?: string; // 立项方式备注
  isSettlementAudited?: boolean; // 结算审核（是/否）
  businessCategory?: 'expense' | 'income' | 'other'; // 业务大类
  subType?: 'exhibition_display' | 'procurement' | 'investment'; // 细分类型
  subRemark?: string; // 细分备注
  isOriginalSigned?: boolean; // 原件是否签收
  archivedAttachments?: string; // 存档附件资料
  remark?: string;
  status: ContractStatus;
  // 关联采购工单
  biddingId?: string; // 关联采购工单ID
  biddingNo?: string; // 关联采购工单编号
  projectName?: string; // 项目名称（从工单带入）
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
  sourceType?: 'framework' | 'one_time' | 'public_recruit'; // 订单来源：framework=框架合同（含需求申请/清单外同类），one_time=无框架合同（单次采购），public_recruit=公开招聘
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
  status: 'pending' | 'approved' | 'rejected';
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
