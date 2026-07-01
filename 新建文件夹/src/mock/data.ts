import type {
  Warehouse, Position, ProductCategory, Product, Supplier, Customer,
  Inventory, InboundOrder, OutboundOrder, CheckOrder, TransferOrder, ReturnOrder, PendingReturn,
  AssetEquipment, ScrappedRecord, DamagedRecord, StockTransaction, Employee
} from '@/types';

// 仓库数据
export const warehouses: Warehouse[] = [
  { id: 'WH001', code: 'CK01', name: '主仓库', address: '北京市朝阳区某某路123号', manager: '张三', status: 'enabled', createTime: '2024-01-01' },
  { id: 'WH002', code: 'CK02', name: '原材料仓库', address: '北京市朝阳区某某路456号', manager: '李四', status: 'enabled', createTime: '2024-01-02' },
  { id: 'WH003', code: 'CK03', name: '成品仓库', address: '北京市海淀区某某路789号', manager: '王五', status: 'enabled', createTime: '2024-01-03' },
  { id: 'WH004', code: 'CK04', name: '华东仓库', address: '上海市浦东新区某某街100号', manager: '赵六', status: 'disabled', createTime: '2024-02-01' },
];

// 仓位数据
export const positions: Position[] = [
  { id: 'POS001', code: 'A01', name: 'A区01号', warehouseId: 'WH001', status: 'enabled' },
  { id: 'POS002', code: 'A02', name: 'A区02号', warehouseId: 'WH001', status: 'enabled' },
  { id: 'POS003', code: 'A03', name: 'A区03号', warehouseId: 'WH001', status: 'enabled' },
  { id: 'POS004', code: 'B01', name: 'B区01号', warehouseId: 'WH001', status: 'enabled' },
  { id: 'POS005', code: 'B02', name: 'B区02号', warehouseId: 'WH001', status: 'enabled' },
  { id: 'POS006', code: 'C01', name: 'C区01号', warehouseId: 'WH002', status: 'enabled' },
  { id: 'POS007', code: 'C02', name: 'C区02号', warehouseId: 'WH002', status: 'enabled' },
  { id: 'POS008', code: 'D01', name: 'D区01号', warehouseId: 'WH003', status: 'enabled' },
  { id: 'POS009', code: 'D02', name: 'D区02号', warehouseId: 'WH003', status: 'enabled' },
];

// 货品分类数据
export const productCategories: ProductCategory[] = [
  { id: 'CAT001', code: '01', name: '会展物资', sort: 1 },
  { id: 'CAT002', code: '02', name: '固定资产物资', sort: 2 },
  { id: 'CAT003', code: '03', name: '日常维保物资', sort: 3 },
];

// 货品数据
export const products: Product[] = [
  { id: 'PRD001', code: 'P10001', name: '展板', categoryId: 'CAT001', unit: '块', specification: '1m*2m', status: 'enabled' },
  { id: 'PRD002', code: 'P10002', name: '展架', categoryId: 'CAT001', unit: '套', specification: '铝合金', status: 'enabled' },
  { id: 'PRD003', code: 'P10003', name: '地毯', categoryId: 'CAT001', unit: '平方米', specification: '加厚型', status: 'enabled' },
  { id: 'PRD004', code: 'P10004', name: '桌椅套装', categoryId: 'CAT001', unit: '套', specification: '会议用', status: 'enabled' },
  { id: 'PRD005', code: 'P10005', name: '指示牌', categoryId: 'CAT001', unit: '个', specification: '立式', status: 'enabled' },
  { id: 'PRD006', code: 'P20001', name: '空调', categoryId: 'CAT002', unit: '台', specification: '3匹', status: 'enabled' },
  { id: 'PRD007', code: 'P20002', name: '投影仪', categoryId: 'CAT002', unit: '台', specification: '高清', status: 'enabled' },
  { id: 'PRD008', code: 'P20003', name: '音响设备', categoryId: 'CAT002', unit: '套', specification: '专业级', status: 'enabled' },
  { id: 'PRD009', code: 'P20004', name: '电脑', categoryId: 'CAT002', unit: '台', specification: 'i7/16G/512G', status: 'enabled' },
  { id: 'PRD010', code: 'P30001', name: '清洁用品', categoryId: 'CAT003', unit: '箱', specification: '套装', status: 'enabled' },
  { id: 'PRD011', code: 'P30002', name: '办公用品', categoryId: 'CAT003', unit: '包', specification: 'A4纸', status: 'enabled' },
  { id: 'PRD012', code: 'P30003', name: '工具套装', categoryId: 'CAT003', unit: '套', specification: '维修用', status: 'enabled' },
];

// 供应商数据
export const suppliers: Supplier[] = [
  { id: 'SUP001', code: 'GYS001', name: '华东钢材有限公司', contact: '陈经理', phone: '021-12345678', address: '上海市宝山区某某路100号', status: 'enabled' },
  { id: 'SUP002', code: 'GYS002', name: '华北铝业集团', contact: '周经理', phone: '010-87654321', address: '北京市丰台区某某街50号', status: 'enabled' },
  { id: 'SUP003', code: 'GYS003', name: '五金配件批发中心', contact: '吴经理', phone: '0755-11112222', address: '深圳市龙岗区某某工业区', status: 'enabled' },
  { id: 'SUP004', code: 'GYS004', name: '铜业贸易公司', contact: '郑经理', phone: '020-33334444', address: '广州市黄埔区某某路200号', status: 'disabled' },
];

// 客户数据
export const customers: Customer[] = [
  { id: 'CUS001', code: 'KH001', name: '机械设备有限公司', contact: '刘总', phone: '021-55556666', address: '上海市松江区某某工业园', status: 'enabled' },
  { id: 'CUS002', code: 'KH002', name: '电子科技有限公司', contact: '孙总', phone: '010-77778888', address: '北京市海淀区某某科技园', status: 'enabled' },
  { id: 'CUS003', code: 'KH003', name: '汽车零部件厂商', contact: '曹总', phone: '020-99990000', address: '广州市南沙区某某工业区', status: 'enabled' },
  { id: 'CUS004', code: 'KH004', name: '外贸进出口公司', contact: '何总', phone: '0755-22223333', address: '深圳市福田区某某大厦', status: 'disabled' },
];

// 员工数据（用于保管人、验收人、业务员等下拉）
export const employees: Employee[] = [
  { id: 'EMP001', name: '张三', role: '保管人', status: 'enabled' },
  { id: 'EMP002', name: '李四', role: '保管人', status: 'enabled' },
  { id: 'EMP003', name: '王五', role: '保管人', status: 'enabled' },
  { id: 'EMP004', name: '赵六', role: '验收人', status: 'enabled' },
  { id: 'EMP005', name: '孙七', role: '验收人', status: 'enabled' },
  { id: 'EMP006', name: '周八', role: '验收人', status: 'enabled' },
  { id: 'EMP007', name: '吴九', role: '业务员', status: 'enabled' },
  { id: 'EMP008', name: '郑十', role: '业务员', status: 'enabled' },
  { id: 'EMP009', name: '刘十一', role: '负责人', status: 'enabled' },
  { id: 'EMP010', name: '陈十二', role: '制单人', status: 'enabled' },
];

// 库存数据
export const inventories: Inventory[] = [
  { id: 'INV001', productId: 'PRD001', productName: '钢板', productCode: 'P10001', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', quantity: 150, frozenQuantity: 0, inboundTime: '2024-01-15' },
  { id: 'INV002', productId: 'PRD002', productName: '铝板', productCode: 'P10002', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', quantity: 95, frozenQuantity: 10, inboundTime: '2024-05-20' },
  { id: 'INV003', productId: 'PRD003', productName: '铜线', productCode: 'P10003', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS006', positionName: 'C区01号', quantity: 680, frozenQuantity: 0, inboundTime: '2024-03-10' },
  { id: 'INV004', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', quantity: 45, frozenQuantity: 5, inboundTime: '2024-06-01' },
  { id: 'INV005', productId: 'PRD007', productName: '电机整机', productCode: 'P30002', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS009', positionName: 'D区02号', quantity: 28, frozenQuantity: 0, inboundTime: '2024-04-15' },
  { id: 'INV006', productId: 'PRD010', productName: '轴承', productCode: 'P50001', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号', quantity: 85, frozenQuantity: 0, inboundTime: '2023-12-20' },
  { id: 'INV007', productId: 'PRD012', productName: '塑料粒子', productCode: 'P10004', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS007', positionName: 'C区02号', quantity: 45, frozenQuantity: 20, inboundTime: '2024-02-28' },
];

// 入库单数据
export const inboundOrders: InboundOrder[] = [
  {
    id: 'IN001', orderNo: 'RK20240601001', type: 'purchase', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    custodian: '张三', personInCharge: '刘十一', inspector: '赵六', salesperson: '吴九', creator: '陈十二',
    createTime: '2024-06-01 09:30:00', approveTime: '2024-06-01 10:00:00', approver: '李四',
    details: [
      { id: 'IND001', inboundOrderId: 'IN001', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 20 },
    ]
  },
  {
    id: 'IN002', orderNo: 'RK20240602001', type: 'purchase', supplierId: 'SUP002', supplierName: '华北铝业集团',
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    custodian: '李四', personInCharge: '刘十一', inspector: '孙七', salesperson: '郑十', creator: '陈十二',
    createTime: '2024-06-02 14:20:00', approveTime: '2024-06-02 15:00:00', approver: '李四',
    details: [
      { id: 'IND002', inboundOrderId: 'IN002', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 10 },
    ]
  },
  {
    id: 'IN003', orderNo: 'RK20240603001', type: 'production', supplierId: undefined, supplierName: undefined,
    warehouseId: 'WH003', warehouseName: '成品仓库', status: 'pending', operator: '王五',
    custodian: '王五', personInCharge: '', inspector: '周八', salesperson: '', creator: '',
    createTime: '2024-06-03 08:45:00', approver: undefined,
    details: [
      { id: 'IND003', inboundOrderId: 'IN003', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', quantity: 20 },
    ]
  },
  {
    id: 'IN004', orderNo: 'RK20240605001', type: 'return', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'pending', operator: '张三',
    custodian: '张三', personInCharge: '', inspector: '赵六', salesperson: '吴九', creator: '陈十二',
    createTime: '2024-06-05 16:30:00',
    details: [
      { id: 'IND004', inboundOrderId: 'IN004', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 2 },
    ]
  },
];

// 出库单数据
export const outboundOrders: OutboundOrder[] = [
  {
    id: 'OUT001', orderNo: 'LY20240601001', type: 'requisition', customerId: undefined, customerName: undefined,
    warehouseId: 'WH003', warehouseName: '成品仓库', status: 'submitted', operator: '王五',
    createTime: '2024-06-01 10:30:00', approveTime: '2024-06-01 11:00:00', approver: '李四',
    details: [
      { id: 'OUTD001', outboundOrderId: 'OUT001', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', quantity: 20 },
    ]
  },
  {
    id: 'OUT002', orderNo: 'LY20240602001', type: 'requisition', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    createTime: '2024-06-02 09:15:00', approveTime: '2024-06-02 09:45:00', approver: '李四',
    details: [
      { id: 'OUTD002', outboundOrderId: 'OUT002', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', quantity: 400 },
    ]
  },
  {
    id: 'OUT003', orderNo: 'LL20240603001', type: 'production', customerId: undefined, customerName: undefined,
    warehouseId: 'WH002', warehouseName: '原材料仓库', status: 'pending', operator: '赵六',
    createTime: '2024-06-03 14:00:00',
    details: [
      { id: 'OUTD003', outboundOrderId: 'OUT003', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 2 },
    ]
  },
  {
    id: 'OUT004', orderNo: 'BF20240604001', type: 'scrap', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'pending', operator: '张三',
    createTime: '2024-06-04 16:45:00',
    details: [
      { id: 'OUTD004', outboundOrderId: 'OUT004', productId: 'PRD010', productName: '轴承', productCode: 'P50001', positionId: 'POS004', positionName: 'B区01号', quantity: 25 },
    ]
  },
];

// 盘点单数据
export const checkOrders: CheckOrder[] = [
  {
    id: 'CK001', orderNo: 'PD20240601001', warehouseId: 'WH001', warehouseName: '主仓库',
    status: 'submitted', operator: '张三', createTime: '2024-06-01 08:00:00', completeTime: '2024-06-01 12:00:00',
    details: [
      { id: 'CKD001', checkOrderId: 'CK001', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', bookQuantity: 150, checkQuantity: 148, diffQuantity: -2, status: 'confirmed' },
      { id: 'CKD002', checkOrderId: 'CK001', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', bookQuantity: 95, checkQuantity: 95, diffQuantity: 0, status: 'confirmed' },
    ]
  },
  {
    id: 'CK002', orderNo: 'PD20240605001', warehouseId: 'WH003', warehouseName: '成品仓库',
    status: 'pending', operator: '王五', createTime: '2024-06-05 08:30:00',
    details: [
      { id: 'CKD003', checkOrderId: 'CK002', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', bookQuantity: 45, checkQuantity: 0, diffQuantity: 0, status: 'pending' },
      { id: 'CKD004', checkOrderId: 'CK002', productId: 'PRD007', productName: '电机整机', productCode: 'P30002', positionId: 'POS009', positionName: 'D区02号', bookQuantity: 28, checkQuantity: 0, diffQuantity: 0, status: 'pending' },
    ]
  },
];

// 调拨单数据
export const transferOrders: TransferOrder[] = [
  {
    id: 'TR001', orderNo: 'DB20240601001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-01 09:00:00', approveTime: '2024-06-01 09:30:00', approver: '李四',
    details: [
      { id: 'TRD001', transferOrderId: 'TR001', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 50, usedQuantity: 20 },
    ]
  },
  {
    id: 'TR002', orderNo: 'DB20240602001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH003', toWarehouseName: '成品仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-02 10:00:00', approveTime: '2024-06-02 10:30:00', approver: '李四',
    details: [
      { id: 'TRD002', transferOrderId: 'TR002', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 30, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR003', orderNo: 'DB20240603001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '王五', createTime: '2024-06-03 08:30:00', approveTime: '2024-06-03 09:00:00', approver: '李四',
    details: [
      { id: 'TRD003', transferOrderId: 'TR003', productId: 'PRD010', productName: '轴承', productCode: 'P50001', positionId: 'POS004', positionName: 'B区01号', quantity: 80, usedQuantity: 30 },
      { id: 'TRD004', transferOrderId: 'TR003', productId: 'PRD011', productName: '螺丝套装', productCode: 'P50002', positionId: 'POS004', positionName: 'B区01号', quantity: 100, usedQuantity: 100 },
    ]
  },
  {
    id: 'TR004', orderNo: 'DB20240604001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH002', fromWarehouseName: '原材料仓库', toWarehouseId: 'WH003', toWarehouseName: '成品仓库',
    status: 'approved', operator: '赵六', createTime: '2024-06-04 11:00:00', approveTime: '2024-06-04 11:30:00', approver: '李四',
    details: [
      { id: 'TRD005', transferOrderId: 'TR004', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', quantity: 200, usedQuantity: 100 },
      { id: 'TRD006', transferOrderId: 'TR004', productId: 'PRD012', productName: '塑料粒子', productCode: 'P10004', positionId: 'POS007', positionName: 'C区02号', quantity: 25, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR005', orderNo: 'DB20240605001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-05 14:00:00', approveTime: '2024-06-05 14:30:00', approver: '李四',
    details: [
      { id: 'TRD007', transferOrderId: 'TR005', productId: 'PRD004', productName: '电机组件A', productCode: 'P20001', positionId: 'POS003', positionName: 'A区03号', quantity: 15, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR006', orderNo: 'DB20240606001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH003', fromWarehouseName: '成品仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '王五', createTime: '2024-06-06 09:30:00', approveTime: '2024-06-06 10:00:00', approver: '李四',
    details: [
      { id: 'TRD008', transferOrderId: 'TR006', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', quantity: 20, usedQuantity: 5 },
      { id: 'TRD009', transferOrderId: 'TR006', productId: 'PRD007', productName: '电机整机', productCode: 'P30002', positionId: 'POS009', positionName: 'D区02号', quantity: 10, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR007', orderNo: 'DB20240607001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-07 13:00:00', approveTime: '2024-06-07 13:30:00', approver: '李四',
    details: [
      { id: 'TRD010', transferOrderId: 'TR007', productId: 'PRD005', productName: '电机组件B', productCode: 'P20002', positionId: 'POS003', positionName: 'A区03号', quantity: 8, usedQuantity: 3 },
    ]
  },
  {
    id: 'TR008', orderNo: 'DB20240608001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH002', fromWarehouseName: '原材料仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'partiallyUsed', operator: '赵六', createTime: '2024-06-08 10:00:00', approveTime: '2024-06-08 10:30:00', approver: '李四',
    details: [
      { id: 'TRD011', transferOrderId: 'TR008', productId: 'PRD008', productName: '包装箱', productCode: 'P40001', positionId: 'POS005', positionName: 'B区02号', quantity: 200, usedQuantity: 80 },
      { id: 'TRD012', transferOrderId: 'TR008', productId: 'PRD009', productName: '说明书', productCode: 'P40002', positionId: 'POS005', positionName: 'B区02号', quantity: 500, usedQuantity: 200 },
    ]
  },
  {
    id: 'TR009', orderNo: 'DB20240609001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-09 15:00:00', approveTime: '2024-06-09 15:30:00', approver: '李四',
    details: [
      { id: 'TRD013', transferOrderId: 'TR009', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 100, usedQuantity: 100 },
      { id: 'TRD014', transferOrderId: 'TR009', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 60, usedQuantity: 40 },
    ]
  },
  {
    id: 'TR010', orderNo: 'DB20240610001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH003', fromWarehouseName: '成品仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'approved', operator: '王五', createTime: '2024-06-10 08:00:00', approveTime: '2024-06-10 08:30:00', approver: '李四',
    details: [
      { id: 'TRD015', transferOrderId: 'TR010', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', quantity: 300, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR011', orderNo: 'DB20240611001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH003', toWarehouseName: '成品仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-11 11:00:00', approveTime: '2024-06-11 11:30:00', approver: '李四',
    details: [
      { id: 'TRD016', transferOrderId: 'TR011', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', quantity: 15, usedQuantity: 10 },
      { id: 'TRD017', transferOrderId: 'TR011', productId: 'PRD004', productName: '电机组件A', productCode: 'P20001', positionId: 'POS003', positionName: 'A区03号', quantity: 10, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR012', orderNo: 'DB20240612001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH002', fromWarehouseName: '原材料仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'pending', operator: '赵六', createTime: '2024-06-12 14:00:00',
    details: [
      { id: 'TRD018', transferOrderId: 'TR012', productId: 'PRD010', productName: '轴承', productCode: 'P50001', positionId: 'POS004', positionName: 'B区01号', quantity: 50, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR013', orderNo: 'DB20240613001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-13 09:30:00', approveTime: '2024-06-13 10:00:00', approver: '李四',
    details: [
      { id: 'TRD019', transferOrderId: 'TR013', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 80, usedQuantity: 20 },
      { id: 'TRD020', transferOrderId: 'TR013', productId: 'PRD012', productName: '塑料粒子', productCode: 'P10004', positionId: 'POS007', positionName: 'C区02号', quantity: 15, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR014', orderNo: 'DB20240614001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '王五', createTime: '2024-06-14 13:30:00', approveTime: '2024-06-14 14:00:00', approver: '李四',
    details: [
      { id: 'TRD021', transferOrderId: 'TR014', productId: 'PRD008', productName: '包装箱', productCode: 'P40001', positionId: 'POS005', positionName: 'B区02号', quantity: 150, usedQuantity: 50 },
    ]
  },
  {
    id: 'TR015', orderNo: 'DB20240615001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH003', fromWarehouseName: '成品仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '赵六', createTime: '2024-06-15 10:30:00', approveTime: '2024-06-15 11:00:00', approver: '李四',
    details: [
      { id: 'TRD022', transferOrderId: 'TR015', productId: 'PRD011', productName: '螺丝套装', productCode: 'P50002', positionId: 'POS004', positionName: 'B区01号', quantity: 300, usedQuantity: 150 },
      { id: 'TRD023', transferOrderId: 'TR015', productId: 'PRD010', productName: '轴承', productCode: 'P50001', positionId: 'POS004', positionName: 'B区01号', quantity: 60, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR016', orderNo: 'DB20240616001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH002', fromWarehouseName: '原材料仓库', toWarehouseId: 'WH003', toWarehouseName: '成品仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-16 08:30:00', approveTime: '2024-06-16 09:00:00', approver: '李四',
    details: [
      { id: 'TRD024', transferOrderId: 'TR016', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', quantity: 150, usedQuantity: 80 },
      { id: 'TRD025', transferOrderId: 'TR016', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 40, usedQuantity: 20 },
    ]
  },
  {
    id: 'TR017', orderNo: 'DB20240617001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'partiallyUsed', operator: '王五', createTime: '2024-06-17 12:00:00', approveTime: '2024-06-17 12:30:00', approver: '李四',
    details: [
      { id: 'TRD026', transferOrderId: 'TR017', productId: 'PRD005', productName: '电机组件B', productCode: 'P20002', positionId: 'POS003', positionName: 'A区03号', quantity: 12, usedQuantity: 8 },
      { id: 'TRD027', transferOrderId: 'TR017', productId: 'PRD007', productName: '电机整机', productCode: 'P30002', positionId: 'POS009', positionName: 'D区02号', quantity: 18, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR018', orderNo: 'DB20240618001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH003', toWarehouseName: '成品仓库',
    status: 'approved', operator: '赵六', createTime: '2024-06-18 14:30:00', approveTime: '2024-06-18 15:00:00', approver: '李四',
    details: [
      { id: 'TRD028', transferOrderId: 'TR018', productId: 'PRD009', productName: '说明书', productCode: 'P40002', positionId: 'POS005', positionName: 'B区02号', quantity: 400, usedQuantity: 200 },
      { id: 'TRD029', transferOrderId: 'TR018', productId: 'PRD008', productName: '包装箱', productCode: 'P40001', positionId: 'POS005', positionName: 'B区02号', quantity: 100, usedQuantity: 60 },
    ]
  },
  {
    id: 'TR019', orderNo: 'DB20240619001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH002', fromWarehouseName: '原材料仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-19 09:30:00', approveTime: '2024-06-19 10:00:00', approver: '李四',
    details: [
      { id: 'TRD030', transferOrderId: 'TR019', productId: 'PRD012', productName: '塑料粒子', productCode: 'P10004', positionId: 'POS007', positionName: 'C区02号', quantity: 30, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR020', orderNo: 'DB20240620001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH003', fromWarehouseName: '成品仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'approved', operator: '王五', createTime: '2024-06-20 11:00:00', approveTime: '2024-06-20 11:30:00', approver: '李四',
    details: [
      { id: 'TRD031', transferOrderId: 'TR020', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', quantity: 25, usedQuantity: 10 },
      { id: 'TRD032', transferOrderId: 'TR020', productId: 'PRD004', productName: '电机组件A', productCode: 'P20001', positionId: 'POS003', positionName: 'A区03号', quantity: 20, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR021', orderNo: 'DB20240621001', supplierId: 'SUP003', supplierName: '五金配件批发中心',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH002', toWarehouseName: '原材料仓库',
    status: 'cancelled', operator: '赵六', createTime: '2024-06-21 15:30:00',
    details: [
      { id: 'TRD033', transferOrderId: 'TR021', productId: 'PRD010', productName: '轴承', productCode: 'P50001', positionId: 'POS004', positionName: 'B区01号', quantity: 40, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR022', orderNo: 'DB20240622001', supplierId: 'SUP001', supplierName: '华东钢材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '主仓库', toWarehouseId: 'WH003', toWarehouseName: '成品仓库',
    status: 'approved', operator: '张三', createTime: '2024-06-22 08:30:00', approveTime: '2024-06-22 09:00:00', approver: '李四',
    details: [
      { id: 'TRD034', transferOrderId: 'TR022', productId: 'PRD001', productName: '钢板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 60, usedQuantity: 15 },
      { id: 'TRD035', transferOrderId: 'TR022', productId: 'PRD002', productName: '铝板', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 50, usedQuantity: 25 },
    ]
  },
  {
    id: 'TR023', orderNo: 'DB20240623001', supplierId: 'SUP002', supplierName: '华北铝业集团',
    fromWarehouseId: 'WH002', fromWarehouseName: '原材料仓库', toWarehouseId: 'WH001', toWarehouseName: '主仓库',
    status: 'approved', operator: '王五', createTime: '2024-06-23 10:00:00', approveTime: '2024-06-23 10:30:00', approver: '李四',
    details: [
      { id: 'TRD036', transferOrderId: 'TR023', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', quantity: 250, usedQuantity: 120 },
      { id: 'TRD037', transferOrderId: 'TR023', productId: 'PRD011', productName: '螺丝套装', productCode: 'P50002', positionId: 'POS004', positionName: 'B区01号', quantity: 200, usedQuantity: 100 },
    ]
  },
];

// 退库单数据
export const returnOrders: ReturnOrder[] = [
  {
    id: 'RT001', orderNo: 'TK20240615001', type: 'return',
    warehouseId: 'WH003', warehouseName: '成品仓库', status: 'submitted', operator: '王五',
    createTime: '2024-06-15 10:00:00', approveTime: '2024-06-15 10:30:00', approver: '李四',
    details: [
      { id: 'RTD001', returnOrderId: 'RT001', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', warehouseId: 'WH003', warehouseName: '成品仓库', quantity: 5, sourceType: 'requisition', sourceOrderId: 'OUT001', sourceOrderNo: 'LY20240601001' },
    ]
  },
  {
    id: 'RT002', orderNo: 'TK20240616001', type: 'return',
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    createTime: '2024-06-16 14:00:00', approveTime: '2024-06-16 14:30:00', approver: '李四',
    details: [
      { id: 'RTD002', returnOrderId: 'RT002', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', warehouseId: 'WH001', warehouseName: '主仓库', quantity: 50, sourceType: 'requisition', sourceOrderId: 'OUT002', sourceOrderNo: 'LY20240602001' },
    ]
  },
  {
    id: 'RT003', orderNo: 'TK20240620001', type: 'writeoff',
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    createTime: '2024-06-20 09:00:00', approveTime: '2024-06-20 09:30:00', approver: '李四',
    remark: '轴承损坏无法归还',
    details: [
      { id: 'RTD003', returnOrderId: 'RT003', productId: 'PRD010', productName: '轴承', productCode: 'P50001', positionId: 'POS004', positionName: 'B区01号', warehouseId: 'WH001', warehouseName: '主仓库', quantity: 10, sourceType: 'requisition', sourceOrderId: 'OUT004', sourceOrderNo: 'BF20240604001' },
    ]
  },
];

// 待归还记录数据（基于已审核的领用单生成）
export const pendingReturns: PendingReturn[] = [
  // 从领用单生成待归还记录
  { id: 'PR001', outboundOrderId: 'OUT001', outboundOrderNo: 'LY20240601001', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', totalQuantity: 20, pendingQuantity: 15, createTime: '2024-06-01 10:30:00' },
  { id: 'PR002', outboundOrderId: 'OUT002', outboundOrderNo: 'LY20240602001', productId: 'PRD003', productName: '铜线', productCode: 'P10003', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS006', positionName: 'C区01号', totalQuantity: 400, pendingQuantity: 350, createTime: '2024-06-02 09:15:00' },
  // 生产领料也有待归还（用于生产后归还原料）
  { id: 'PR003', outboundOrderId: 'OUT003', outboundOrderNo: 'LL20240603001', productId: 'PRD002', productName: '铝板', productCode: 'P10002', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', totalQuantity: 2, pendingQuantity: 2, createTime: '2024-06-03 14:00:00' },
];

// 生成退库单号
export function generateReturnOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TK${dateStr}${random}`;
}

// 生成入库单号
export function generateInboundOrderNo(type: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'purchase' ? 'RK' : type === 'production' ? 'SC' : type === 'return' ? 'TH' : 'GD';
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${dateStr}${random}`;
}

// 生成出库单号
export function generateOutboundOrderNo(type: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'requisition' ? 'LY' : type === 'production' ? 'LL' : type === 'workorder' ? 'GD' : 'BF';
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${dateStr}${random}`;
}

// 生成调拨单号
export function generateTransferOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DB${dateStr}${random}`;
}

// 生成盘点单号
export function generateCheckOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PD${dateStr}${random}`;
}

// 资产设备档案数据
export const assetEquipments: AssetEquipment[] = [
  { id: 'AE001', code: 'SB20240001', name: '数控车床', categoryId: 'CAT002', specification: 'CJK6136', unit: '台', amount: 150000, storageLocation: '车间A区', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', status: 'in_use', createTime: '2024-01-15' },
  { id: 'AE002', code: 'SB20240002', name: '铣床', categoryId: 'CAT002', specification: 'X5032', unit: '台', amount: 85000, storageLocation: '车间A区', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS009', positionName: 'D区02号', status: 'in_use', createTime: '2024-01-20' },
  { id: 'AE003', code: 'SB20240003', name: '激光切割机', categoryId: 'CAT002', specification: 'LCT-3015', unit: '台', amount: 280000, storageLocation: '车间B区', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', status: 'in_use', createTime: '2024-02-10' },
  { id: 'AE004', code: 'SB20240004', name: '空压机', categoryId: 'CAT002', specification: 'GA37', unit: '台', amount: 42000, storageLocation: '设备房', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS006', positionName: 'C区01号', status: 'in_use', createTime: '2024-02-15' },
  { id: 'AE005', code: 'SB20240005', name: '叉车', categoryId: 'CAT002', specification: 'CPCD30', unit: '辆', amount: 68000, storageLocation: '仓库东门', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', status: 'in_use', createTime: '2024-03-01' },
  { id: 'AE006', code: 'SB20240006', name: '电焊机', categoryId: 'CAT002', specification: 'ZX7-400', unit: '台', amount: 3500, storageLocation: '车间C区', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', status: 'scrapped', createTime: '2023-06-10' },
  { id: 'AE007', code: 'SB20240007', name: '钻床', categoryId: 'CAT002', specification: 'Z516', unit: '台', amount: 12000, storageLocation: '车间A区', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS003', positionName: 'A区03号', status: 'in_use', createTime: '2024-03-15' },
  { id: 'AE008', code: 'SB20240008', name: '行车', categoryId: 'CAT002', specification: 'LH5T', unit: '台', amount: 95000, storageLocation: '车间A区', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS009', positionName: 'D区02号', status: 'in_use', createTime: '2024-04-01' },
];

// 报废记录数据
export const scrappedRecords: ScrappedRecord[] = [
  {
    id: 'SC001', recordNo: 'BF20240605001', assetEquipmentId: 'AE006', assetCode: 'SB20240006', assetName: '电焊机',
    warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', storageLocation: '车间C区',
    amount: 3500, scrapType: 'full', scrapQuantity: 1, originalQuantity: 1,
    reason: '设备老旧，无法修复，已到报废年限', status: 'submitted', operator: '张三',
    createTime: '2024-06-05 09:30:00', approveTime: '2024-06-05 10:00:00', approver: '李四'
  },
  {
    id: 'SC002', recordNo: 'BF20240615001', assetEquipmentId: 'AE003', assetCode: 'SB20240003', assetName: '激光切割机',
    warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', storageLocation: '车间B区',
    amount: 280000, scrapType: 'full', scrapQuantity: 1, originalQuantity: 1,
    reason: '设备损坏严重，维修成本过高', status: 'submitted', operator: '王五',
    createTime: '2024-06-15 14:00:00', approveTime: '2024-06-15 14:30:00', approver: '李四'
  },
];

// 报损记录数据
export const damagedRecords: DamagedRecord[] = [
  {
    id: 'DM001', recordNo: 'BSD20240610001', productId: 'PRD010', productCode: 'P50001', productName: '轴承',
    warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号',
    quantity: 25, amount: 2500, reason: '轴承损坏无法使用', status: 'submitted', operator: '张三',
    createTime: '2024-06-10 10:00:00', approveTime: '2024-06-10 10:30:00', approver: '李四'
  },
  {
    id: 'DM002', recordNo: 'BSD20240618001', productId: 'PRD001', productCode: 'P10001', productName: '钢板',
    warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号',
    quantity: 10, amount: 5000, reason: '钢板生锈报废', status: 'pending', operator: '王五',
    createTime: '2024-06-18 16:00:00'
  },
];

// 生成报废记录编号
export function generateScrappedRecordNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BF${dateStr}${random}`;
}

// 生成报损记录编号
export function generateDamagedRecordNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BSD${dateStr}${random}`;
}

// 生成资产设备编号
export function generateAssetCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SB${dateStr}${random}`;
}

// 生成批次号
export function generateBatchNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PC${dateStr}${random}`;
}

// 批次库存数据（按 FIFO 管理，模拟已有库存的批次）
export const batchInventories: Array<{
  id: string;
  batchNo: string;
  productId: string;
  productName?: string;
  productCode?: string;
  warehouseId: string;
  warehouseName?: string;
  positionId: string;
  positionName?: string;
  quantity: number;
  originalQuantity: number;
  inboundTime: string;
}> = [
  { id: 'BI001', batchNo: 'PC202401150001', productId: 'PRD001', productName: '钢板', productCode: 'P10001', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', quantity: 80, originalQuantity: 80, inboundTime: '2024-01-15 10:00:00' },
  { id: 'BI002', batchNo: 'PC202403010001', productId: 'PRD001', productName: '钢板', productCode: 'P10001', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', quantity: 70, originalQuantity: 70, inboundTime: '2024-03-01 09:30:00' },
  { id: 'BI003', batchNo: 'PC202405200001', productId: 'PRD002', productName: '铝板', productCode: 'P10002', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', quantity: 95, originalQuantity: 95, inboundTime: '2024-05-20 14:15:00' },
  { id: 'BI004', batchNo: 'PC202403100001', productId: 'PRD003', productName: '铜线', productCode: 'P10003', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS006', positionName: 'C区01号', quantity: 400, originalQuantity: 400, inboundTime: '2024-03-10 08:00:00' },
  { id: 'BI005', batchNo: 'PC202404050001', productId: 'PRD003', productName: '铜线', productCode: 'P10003', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS006', positionName: 'C区01号', quantity: 280, originalQuantity: 280, inboundTime: '2024-04-05 10:20:00' },
  { id: 'BI006', batchNo: 'PC202406010001', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', quantity: 45, originalQuantity: 45, inboundTime: '2024-06-01 15:30:00' },
  { id: 'BI007', batchNo: 'PC202404150001', productId: 'PRD007', productName: '电机整机', productCode: 'P30002', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS009', positionName: 'D区02号', quantity: 28, originalQuantity: 28, inboundTime: '2024-04-15 11:00:00' },
  { id: 'BI008', batchNo: 'PC202312200001', productId: 'PRD010', productName: '轴承', productCode: 'P50001', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号', quantity: 85, originalQuantity: 85, inboundTime: '2023-12-20 16:45:00' },
  { id: 'BI009', batchNo: 'PC202402280001', productId: 'PRD012', productName: '塑料粒子', productCode: 'P10004', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS007', positionName: 'C区02号', quantity: 45, originalQuantity: 45, inboundTime: '2024-02-28 09:00:00' },
];

// 生成流水号
export function generateStockTransactionNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LS${dateStr}${random}`;
}

// 库存流水数据（按时间倒序，新的在前）
export const stockTransactions: StockTransaction[] = [
  // 退库（入库）
  { id: 'ST025', transactionNo: 'LS202406200001', transactionTime: '2024-06-20 09:30:00', transactionType: 'inbound', productId: 'PRD010', productCode: 'P50001', productName: '轴承', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号', quantity: 10, sourceOrderId: 'RT003', sourceOrderNo: 'TK20240620001', sourceType: '归还退库', operator: '张三' },
  { id: 'ST024', transactionNo: 'LS202406160001', transactionTime: '2024-06-16 14:30:00', transactionType: 'inbound', productId: 'PRD003', productCode: 'P10003', productName: '铜线', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS006', positionName: 'C区01号', quantity: 50, sourceOrderId: 'RT002', sourceOrderNo: 'TK20240616001', sourceType: '归还退库', operator: '张三' },
  { id: 'ST023', transactionNo: 'LS202406150001', transactionTime: '2024-06-15 10:30:00', transactionType: 'inbound', productId: 'PRD006', productCode: 'P30001', productName: '电机整机', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', quantity: 5, sourceOrderId: 'RT001', sourceOrderNo: 'TK20240615001', sourceType: '归还退库', operator: '王五' },

  // 盘点差异
  { id: 'ST022', transactionNo: 'LS202406120001', transactionTime: '2024-06-12 12:00:00', transactionType: 'check_diff', productId: 'PRD001', productCode: 'P10001', productName: '钢板', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', quantity: -2, sourceOrderId: 'CK001', sourceOrderNo: 'PD20240601001', sourceType: '盘点差异', operator: '张三', remark: '盘点盘亏' },

  // 采购入库（工单入库）
  { id: 'ST021', transactionNo: 'LS202406100002', transactionTime: '2024-06-10 15:30:00', transactionType: 'inbound', productId: 'PRD009', productCode: 'P20003', productName: '螺丝套装', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS005', positionName: 'B区02号', quantity: 60, sourceOrderId: 'IN002', sourceOrderNo: 'RK20240602001', sourceType: '采购入库', operator: '王五', batchNo: 'PC202406100002' },
  { id: 'ST020', transactionNo: 'LS202406100001', transactionTime: '2024-06-10 09:30:00', transactionType: 'inbound', productId: 'PRD005', productCode: 'P20002', productName: '电机组件B', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS003', positionName: 'A区03号', quantity: 30, sourceOrderId: 'IN001', sourceOrderNo: 'RK20240601001', sourceType: '采购入库', operator: '张三', batchNo: 'PC202406100001' },

  // 领用出库
  { id: 'ST019', transactionNo: 'LS202406080002', transactionTime: '2024-06-08 11:00:00', transactionType: 'outbound', productId: 'PRD010', productCode: 'P50001', productName: '轴承', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号', quantity: -25, sourceOrderId: 'OUT004', sourceOrderNo: 'BF20240604001', sourceType: '报废出库', operator: '王五', remark: '设备报废' },
  { id: 'ST018', transactionNo: 'LS202406080001', transactionTime: '2024-06-08 10:30:00', transactionType: 'outbound', productId: 'PRD002', productCode: 'P10002', productName: '铝板', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS002', positionName: 'A区02号', quantity: -2, sourceOrderId: 'OUT003', sourceOrderNo: 'LL20240603001', sourceType: '生产领料', operator: '赵六' },
  { id: 'ST017', transactionNo: 'LS202406050001', transactionTime: '2024-06-05 11:30:00', transactionType: 'outbound', productId: 'PRD003', productCode: 'P10003', productName: '铜线', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS006', positionName: 'C区01号', quantity: -400, sourceOrderId: 'OUT002', sourceOrderNo: 'LY20240602001', sourceType: '领用出库', operator: '张三' },
  { id: 'ST016', transactionNo: 'LS202406040001', transactionTime: '2024-06-04 14:00:00', transactionType: 'outbound', productId: 'PRD006', productCode: 'P30001', productName: '电机整机', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', quantity: -20, sourceOrderId: 'OUT001', sourceOrderNo: 'LY20240601001', sourceType: '领用出库', operator: '王五' },

  // 采购入库（采购/生产/工单）
  { id: 'ST015', transactionNo: 'LS202406020002', transactionTime: '2024-06-02 15:00:00', transactionType: 'inbound', productId: 'PRD002', productCode: 'P10002', productName: '铝板', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', quantity: 10, sourceOrderId: 'IN002', sourceOrderNo: 'RK20240602001', sourceType: '采购入库', operator: '张三', batchNo: 'PC202406020001' },
  { id: 'ST014', transactionNo: 'LS202406020001', transactionTime: '2024-06-02 10:00:00', transactionType: 'inbound', productId: 'PRD001', productCode: 'P10001', productName: '钢板', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', quantity: 20, sourceOrderId: 'IN001', sourceOrderNo: 'RK20240601001', sourceType: '采购入库', operator: '张三', batchNo: 'PC202406010001' },

  // 初始入库（期初库存）
  { id: 'ST013', transactionNo: 'LS202405200001', transactionTime: '2024-05-20 10:00:00', transactionType: 'inbound', productId: 'PRD008', productCode: 'P40001', productName: '包装箱', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', quantity: 120, sourceType: '期初入库', operator: '李四', batchNo: 'PC202405200001' },
  { id: 'ST012', transactionNo: 'LS202405100001', transactionTime: '2024-05-10 14:00:00', transactionType: 'inbound', productId: 'PRD007', productCode: 'P30002', productName: '电机整机', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS009', positionName: 'D区02号', quantity: 28, sourceType: '期初入库', operator: '王五', batchNo: 'PC202404150001' },
  { id: 'ST011', transactionNo: 'LS202405050001', transactionTime: '2024-05-05 08:30:00', transactionType: 'inbound', productId: 'PRD004', productCode: 'P20001', productName: '电机组件A', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS003', positionName: 'A区03号', quantity: 50, sourceType: '期初入库', operator: '李四', batchNo: 'PC202405050001' },
  { id: 'ST010', transactionNo: 'LS202404200001', transactionTime: '2024-04-20 16:00:00', transactionType: 'inbound', productId: 'PRD009', productCode: 'P20003', productName: '螺丝套装', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS005', positionName: 'B区02号', quantity: 100, sourceType: '期初入库', operator: '张三', batchNo: 'PC202404200001' },
  { id: 'ST009', transactionNo: 'LS202404050001', transactionTime: '2024-04-05 10:00:00', transactionType: 'inbound', productId: 'PRD003', productCode: 'P10003', productName: '铜线', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS006', positionName: 'C区01号', quantity: 280, sourceType: '期初入库', operator: '李四', batchNo: 'PC202404050001' },
  { id: 'ST008', transactionNo: 'LS202403100001', transactionTime: '2024-03-10 08:00:00', transactionType: 'inbound', productId: 'PRD003', productCode: 'P10003', productName: '铜线', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS006', positionName: 'C区01号', quantity: 400, sourceType: '期初入库', operator: '张三', batchNo: 'PC202403100001' },
  { id: 'ST007', transactionNo: 'LS202402280001', transactionTime: '2024-02-28 09:00:00', transactionType: 'inbound', productId: 'PRD012', productCode: 'P10004', productName: '塑料粒子', warehouseId: 'WH002', warehouseName: '原材料仓库', positionId: 'POS007', positionName: 'C区02号', quantity: 45, sourceType: '期初入库', operator: '张三', batchNo: 'PC202402280001' },
  { id: 'ST006', transactionNo: 'LS202402150001', transactionTime: '2024-02-15 11:00:00', transactionType: 'inbound', productId: 'PRD011', productCode: 'P40002', productName: '说明书', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS009', positionName: 'D区02号', quantity: 200, sourceType: '期初入库', operator: '王五', batchNo: 'PC202402150001' },
  { id: 'ST005', transactionNo: 'LS202401200001', transactionTime: '2024-01-20 15:30:00', transactionType: 'inbound', productId: 'PRD010', productCode: 'P50001', productName: '轴承', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号', quantity: 85, sourceType: '期初入库', operator: '张三', batchNo: 'PC202312200001' },
  { id: 'ST004', transactionNo: 'LS202401150001', transactionTime: '2024-01-15 10:00:00', transactionType: 'inbound', productId: 'PRD001', productCode: 'P10001', productName: '钢板', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号', quantity: 80, sourceType: '期初入库', operator: '张三', batchNo: 'PC202401150001' },
  { id: 'ST003', transactionNo: 'LS202401100001', transactionTime: '2024-01-10 09:00:00', transactionType: 'inbound', productId: 'PRD005', productCode: 'P20002', productName: '电机组件B', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS003', positionName: 'A区03号', quantity: 60, sourceType: '期初入库', operator: '李四', batchNo: 'PC202401100001' },
  { id: 'ST002', transactionNo: 'LS202401050001', transactionTime: '2024-01-05 14:00:00', transactionType: 'inbound', productId: 'PRD002', productCode: 'P10002', productName: '铝板', warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', quantity: 95, sourceType: '期初入库', operator: '李四', batchNo: 'PC202405200001' },
  { id: 'ST001', transactionNo: 'LS202401010001', transactionTime: '2024-01-01 08:00:00', transactionType: 'inbound', productId: 'PRD006', productCode: 'P30001', productName: '电机整机', warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', quantity: 45, sourceType: '期初入库', operator: '李四', batchNo: 'PC202406010001' },
];
