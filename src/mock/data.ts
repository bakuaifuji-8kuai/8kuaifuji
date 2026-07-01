import type {
  Warehouse, Position, ProductCategory, Product, Supplier, SupplierAssessment, Customer,
  Inventory, InboundOrder, InboundApplication, OutboundOrder, CheckOrder, TransferOrder, ReturnOrder, PendingReturn,
  AssetEquipment, ScrappedRecord, DamagedRecord, StockTransaction, Employee, PurchaseOrder,
  ProductApplication, Contract, ProductContract, ExhibitionProject,
  WorkOrderProductConfig, Project, StockTransfer,
  // 采购管理类型
  ProcurementPlan, ProcurementDemand, ContractLedger, ProcurementOrder, ProcurementInspection,
  ApprovalFlowConfig, ApprovalFlowNode
} from '@/types';

// 仓库数据
export const warehouses: Warehouse[] = [
  { id: 'WH001', code: 'WH20240101001', warehouseNo: 'ZHWZ001', name: '展会物资仓', category: 'exhibition', categoryName: '会展物资', address: '会展中心A区101号', manager: '张三', contactPhone: '13800138001', status: 'enabled', createTime: '2024-01-01' },
  { id: 'WH002', code: 'WH20240102001', warehouseNo: 'DZYH002', name: '低值易耗仓', category: 'consumable', categoryName: '低值易耗', address: '会展中心B区203号', manager: '李四', contactPhone: '13800138002', status: 'enabled', createTime: '2024-01-02' },
  { id: 'WH003', code: 'WH20240103001', warehouseNo: 'GDZC003', name: '固定资产仓', category: 'fixed_asset', categoryName: '固定资产', address: '会展中心C区305号', manager: '王五', contactPhone: '13800138003', status: 'enabled', createTime: '2024-01-03' },
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
  { id: 'POS008', code: 'D01', name: 'D区01号', warehouseId: 'WH002', status: 'enabled' },
  { id: 'POS009', code: 'D02', name: 'D区02号', warehouseId: 'WH002', status: 'enabled' },
  { id: 'POS010', code: 'E01', name: 'E区01号', warehouseId: 'WH003', status: 'enabled' },
  { id: 'POS011', code: 'E02', name: 'E区02号', warehouseId: 'WH003', status: 'enabled' },
  { id: 'POS012', code: 'E03', name: 'E区03号', warehouseId: 'WH003', status: 'enabled' },
];

// 货品分类数据
export const productCategories: ProductCategory[] = [
  { id: 'CAT001', code: '01', name: '展会物资', codePrefix: 'HY', sort: 1 },
  { id: 'CAT002', code: '02', name: '低值易耗', codePrefix: 'DZ', sort: 2 },
];

// 货品数据
export const products: Product[] = [
  { id: 'PRD001', code: 'P10001', name: '展板', categoryId: 'CAT001', unit: '块', specification: '1m*2m', brand: '得力', origin: '浙江', material: '铝合金+PVC', stockQuantity: 120, isContractItem: true, status: 'enabled' },
  { id: 'PRD002', code: 'P10002', name: '展架', categoryId: 'CAT001', unit: '套', specification: '铝合金', brand: '得力', origin: '浙江', material: '铝合金', stockQuantity: 85, isContractItem: true, status: 'enabled' },
  { id: 'PRD003', code: 'P10003', name: '地毯', categoryId: 'CAT001', unit: '平方米', specification: '加厚型', brand: '恒源祥', origin: '上海', material: '化纤', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD004', code: 'P10004', name: '桌椅套装', categoryId: 'CAT001', unit: '套', specification: '会议用', brand: '宜家', origin: '江苏', material: '实木+布艺', stockQuantity: 42, isContractItem: true, status: 'enabled' },
  { id: 'PRD005', code: 'P10005', name: '指示牌', categoryId: 'CAT001', unit: '个', specification: '立式', brand: '得力', origin: '浙江', material: '亚克力', stockQuantity: 30, isContractItem: false, status: 'enabled' },
  { id: 'PRD006', code: 'P20001', name: '空调', categoryId: 'CAT002', unit: '台', specification: '3匹', brand: '格力', origin: '广东', material: '金属+塑料', stockQuantity: 8, isContractItem: true, status: 'enabled' },
  { id: 'PRD007', code: 'P20002', name: '投影仪', categoryId: 'CAT002', unit: '台', specification: '高清', brand: '爱普生', origin: '日本', material: '塑料+金属', stockQuantity: 15, isContractItem: true, status: 'enabled' },
  { id: 'PRD008', code: 'P20003', name: '音响设备', categoryId: 'CAT002', unit: '套', specification: '专业级', brand: 'JBL', origin: '美国', material: '木质+金属', stockQuantity: 6, isContractItem: false, status: 'enabled' },
  { id: 'PRD009', code: 'P20004', name: '电脑', categoryId: 'CAT002', unit: '台', specification: 'i7/16G/512G', brand: '联想', origin: '中国', material: '金属+塑料', stockQuantity: 25, isContractItem: true, status: 'enabled' },
  { id: 'PRD010', code: 'P30001', name: '清洁用品', categoryId: 'CAT002', unit: '箱', specification: '套装', brand: '威猛先生', origin: '上海', material: '化学制剂', stockQuantity: 60, isContractItem: false, status: 'enabled' },
  { id: 'PRD011', code: 'P30002', name: '办公用品', categoryId: 'CAT002', unit: '包', specification: 'A4纸', brand: '得力', origin: '浙江', material: '纸浆', stockQuantity: 240, isContractItem: true, status: 'enabled' },
  { id: 'PRD012', code: 'P30003', name: '工具套装', categoryId: 'CAT002', unit: '套', specification: '维修用', brand: '博世', origin: '德国', material: '钢材+塑料', stockQuantity: 18, isContractItem: false, status: 'enabled' },
  { id: 'PRD101', code: 'JJ1012', name: '圆形井盖', categoryId: 'CAT002', unit: '个', specification: '700mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD102', code: 'JJ1013', name: '圆形井盖', categoryId: 'CAT002', unit: '个', specification: '740mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD103', code: 'JJ1016', name: '方形井盖', categoryId: 'CAT002', unit: '个', specification: '600*800', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD104', code: 'JJ1017', name: '碳钢地沟盖板', categoryId: 'CAT002', unit: '块', specification: '708*100*80', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD105', code: 'JJ1018', name: '碳钢地沟盖板', categoryId: 'CAT002', unit: '块', specification: '708*150*80', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD106', code: 'JJ1019', name: '碳钢地沟盖板', categoryId: 'CAT002', unit: '块', specification: '708*200*80', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD107', code: 'JJ1029', name: '石材干挂配件单钩', categoryId: 'CAT002', unit: '个', specification: '40*60*4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD108', code: 'JJ1030', name: '石材干挂配件平板', categoryId: 'CAT002', unit: '个', specification: '40*60*4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD109', code: 'JJ1031', name: '石材干挂配件双钩', categoryId: 'CAT002', unit: '个', specification: '40*60*4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD110', code: 'JJ1032', name: '石材干挂配件挑件', categoryId: 'CAT002', unit: '个', specification: '40*60*4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD111', code: 'JJ1035', name: '瓷砖', categoryId: 'CAT002', unit: '块', specification: '0.3*0.18墙/0.6*0.6地', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD112', code: 'JJ1036', name: '切割片', categoryId: 'CAT002', unit: '盒', specification: 'Ф/400mm，25片/盒', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD113', code: 'QD1037', name: '航空插头', categoryId: 'CAT002', unit: '个', specification: '63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD114', code: 'JJ1043', name: '木门拉手', categoryId: 'CAT002', unit: '把', specification: '两个螺栓孔距/13cm（无锁舌3.5cm）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD115', code: 'JJ1055', name: '清洁剂', categoryId: 'CAT002', unit: '桶', specification: '风雨连廊清洁用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD116', code: 'JJ1060', name: '混凝土路面修补剂', categoryId: 'CAT002', unit: '包', specification: '高强道路修补料（25kg/包）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD117', code: 'JJ1062', name: '门锁', categoryId: 'CAT002', unit: '把', specification: '北登3楼会议室', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD118', code: 'JJ1063', name: '物流门地面导轨', categoryId: 'CAT002', unit: '米', specification: '304不锈钢材质，厚度2mm，宽度28cm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD119', code: 'JJ1065', name: '轴承', categoryId: 'CAT002', unit: '个', specification: 'NU202', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD120', code: 'JJ1071', name: '瓷砖胶泥', categoryId: 'CAT002', unit: '包', specification: '25kg/一包（强力粘合）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD121', code: 'JJ1082', name: '抗风化耐温塑料膜', categoryId: 'CAT002', unit: '㎡', specification: '400mm宽幅面', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD122', code: 'JJ1084', name: '不锈钢螺丝', categoryId: 'CAT002', unit: '套', specification: '5*80', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD123', code: 'JJ1092', name: '螺纹钢', categoryId: 'CAT002', unit: '根', specification: 'φ18，9米/根', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD124', code: 'JJ1099', name: 'AB胶', categoryId: 'CAT002', unit: '组', specification: 'A胶10L/桶+B胶10L/桶', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD125', code: 'JJ1105', name: '双开门不锈钢暗插销', categoryId: 'CAT002', unit: '个', specification: '6寸/长171mm*宽25mm*杆长150mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD126', code: 'JJ1106', name: '地弹簧上下轴', categoryId: 'CAT002', unit: '套', specification: '地弹簧门上下轴可调支架', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD127', code: 'JJ1113', name: '环氧结构胶', categoryId: 'CAT002', unit: '支', specification: '3MDP460防水耐腐蚀', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD128', code: 'JJ1114', name: '传动链条', categoryId: 'CAT002', unit: '根', specification: '5分/90cm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD129', code: 'JJ1115', name: '排轮', categoryId: 'CAT002', unit: '个', specification: '红门', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD130', code: 'JJ1116', name: '防锈润滑油', categoryId: 'CAT002', unit: '瓶', specification: 'WD-40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD131', code: 'JJ1117', name: '拉手', categoryId: 'CAT002', unit: '只', specification: '铝合金推拉门（孔距19.5cm）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD132', code: 'JJ1118', name: '锁芯', categoryId: 'CAT002', unit: '个', specification: '推拉门用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD133', code: 'JJ1126', name: '免钉胶', categoryId: 'CAT002', unit: '支', specification: '300ml', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD134', code: 'JJ1135', name: '镀锌角钢', categoryId: 'CAT002', unit: '根', specification: '50mm*50mm*厚5mm*长6000mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD135', code: 'JJ1136', name: '镀锌角钢', categoryId: 'CAT002', unit: '根', specification: '40mm*40mm*厚4mm*长6000mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD136', code: 'JJ1137', name: '镀锌角钢', categoryId: 'CAT002', unit: '根', specification: '30mm*30mm*厚3mm*长6000mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD137', code: 'JJ1141', name: '防水补漏聚酯纤维无纺布', categoryId: 'CAT002', unit: '卷', specification: '"宽0.1米*长100米/1卷（80克重）加厚款"', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD138', code: 'JJ1142', name: '放倒金属链', categoryId: 'CAT002', unit: '套', specification: '304#/350mm/300kg', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD139', code: 'JJ1143', name: '金属合页', categoryId: 'CAT002', unit: '个', specification: '镀锌/焊接100*83*4.2mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD140', code: 'JJ1158', name: '水泥路面快速补材料', categoryId: 'CAT002', unit: '袋', specification: '25KG/袋', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD141', code: 'QD1038', name: '航空插头', categoryId: 'CAT002', unit: '个', specification: '125A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD142', code: 'QD1041', name: '航空插头', categoryId: 'CAT002', unit: '个', specification: '63A（组合）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD143', code: 'QD1040', name: '航空插座', categoryId: 'CAT002', unit: '个', specification: '63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD144', code: 'NT1067', name: '支架幕布', categoryId: 'CAT002', unit: '个', specification: '120寸', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD145', code: 'NT1083', name: '球型摄像头', categoryId: 'CAT002', unit: '个', specification: 'DS-2CD(带支架)', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD146', code: 'NT1089', name: '硬盘录像机', categoryId: 'CAT002', unit: '台', specification: '大华DH-NVR', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD147', code: 'NT1090', name: '监控交换机', categoryId: 'CAT002', unit: '台', specification: 'H3C', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD148', code: 'NT1093', name: '机柜', categoryId: 'CAT002', unit: '个', specification: '600*600*600', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD149', code: 'NT1110', name: '蒸馏水', categoryId: 'CAT002', unit: '桶', specification: '25KG/桶', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD150', code: 'NT1112', name: '铁架床', categoryId: 'CAT002', unit: '张', specification: '双层', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD151', code: 'QD1002', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '4㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD152', code: 'QD1003', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '6㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD153', code: 'NT1164', name: '垃圾桶', categoryId: 'CAT002', unit: '个', specification: '24*28', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD154', code: 'NT1166', name: '地毯', categoryId: 'CAT002', unit: '块', specification: 'SM841002', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD155', code: 'NT1167', name: '地毯', categoryId: 'CAT002', unit: '块', specification: 'SM842008', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD156', code: 'NT1192', name: '地弹簧拉手', categoryId: 'CAT002', unit: '个', specification: '27.5孔距', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD157', code: 'NT1193', name: '地弹簧拉手', categoryId: 'CAT002', unit: '个', specification: '147孔距', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD158', code: 'NT1196', name: '平基螺钉', categoryId: 'CAT002', unit: '粒', specification: '8*80', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD159', code: 'NT1202', name: '不锈钢螺钉', categoryId: 'CAT002', unit: '个', specification: '3*10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD160', code: 'NT1203', name: '不锈钢螺钉', categoryId: 'CAT002', unit: '个', specification: '3*25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD161', code: 'NT1207', name: '螺钉', categoryId: 'CAT002', unit: '个', specification: '4*20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD162', code: 'NT1211', name: '螺母', categoryId: 'CAT002', unit: '个', specification: '3#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD163', code: 'NT1215', name: '螺钉', categoryId: 'CAT002', unit: '个', specification: '5*40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD164', code: 'NT1219', name: '螺钉', categoryId: 'CAT002', unit: '个', specification: '6*10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD165', code: 'NT1220', name: '螺钉', categoryId: 'CAT002', unit: '个', specification: '6*30/40/50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD166', code: 'QD1005', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '16㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD167', code: 'QD1006', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '25㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD168', code: 'NT1243', name: '砂轮机', categoryId: 'CAT002', unit: '台', specification: '35-15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD169', code: 'NT1258', name: '盖板', categoryId: 'CAT002', unit: '块', specification: '700MM*500MM（铁）馆内次管沟', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD170', code: 'QD1007', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '35㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD171', code: 'NT1353', name: '次管沟金属沟盖板（填缝）', categoryId: 'CAT002', unit: '块', specification: '700mm*80mm*4mm(铁)', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD172', code: 'NT1357', name: '地弹簧拉手', categoryId: 'CAT002', unit: '个', specification: '18.5孔距', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD173', code: 'NT1362', name: '消防门合页', categoryId: 'CAT002', unit: '个', specification: '5*4*3', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD174', code: 'QD1009', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '70㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD175', code: 'QD1010', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '95㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD176', code: 'NT1493', name: '艾力克斯探测器（接收器）', categoryId: 'CAT002', unit: '台', specification: 'OSI-10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD177', code: 'NT1666', name: '烟饼', categoryId: 'CAT002', unit: '个', specification: '单块烟饼宽度7CM，厚度1.5CM', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD178', code: 'NT1714', name: '室外消火栓箱卡盒', categoryId: 'CAT002', unit: '个', specification: '亚克力插卡盒', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD179', code: 'PS1001', name: '感应龙头电池盒', categoryId: 'CAT002', unit: '个', specification: 'TOTO', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD180', code: 'PS1002', name: '蹲便器冲水箱', categoryId: 'CAT002', unit: '个', specification: '九牧/ 尺寸360*125*355mm，顶按式', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD181', code: 'QD1376', name: '电缆', categoryId: 'CAT002', unit: '米', specification: 'RVV4㎡（展具三芯软线）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD182', code: 'QD1636', name: '钢板线槽', categoryId: 'CAT002', unit: '个', specification: '长宽高2270mm *1500mm*80mm 钢板厚10mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD183', code: 'NT1065', name: '自喷漆', categoryId: 'CAT002', unit: '瓶', specification: '350ml', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD184', code: 'QD10021', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '4㎡（三芯软线）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD185', code: 'QD1011', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '2.5㎡（三芯软线）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD186', code: 'QD1026', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD187', code: 'QD1027', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT16', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD188', code: 'QD1028', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD189', code: 'QD1029', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT35', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD190', code: 'QD1030', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD191', code: 'QD1031', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT70', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD192', code: 'QD1032', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT95', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD193', code: 'QD1036', name: '航空插头', categoryId: 'CAT002', unit: '个', specification: '16A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD194', code: 'QD1039', name: '航空插头', categoryId: 'CAT002', unit: '个', specification: '32A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD195', code: 'QD1044', name: '插头', categoryId: 'CAT002', unit: '个', specification: '16A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD196', code: 'QD1049', name: '汉斯内六角扳手', categoryId: 'CAT002', unit: '套', specification: '9件套公制', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD197', code: 'QD1050', name: '钢卷尺', categoryId: 'CAT002', unit: '个', specification: '5m锁定功能钢卷尺', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD198', code: 'QD1068', name: '手电钻', categoryId: 'CAT002', unit: '台', specification: 'GBM 350', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD199', code: 'QD1069', name: '直流手电钻', categoryId: 'CAT002', unit: '台', specification: 'GSR14', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD200', code: 'QD1070', name: '电锤', categoryId: 'CAT002', unit: '台', specification: 'GBH2-26', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD201', code: 'QD1071', name: '活动扳手', categoryId: 'CAT002', unit: '个', specification: '6寸', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD202', code: 'QD1072', name: '活动扳手', categoryId: 'CAT002', unit: '个', specification: '10寸', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD203', code: 'QD1073', name: '呆板手组套', categoryId: 'CAT002', unit: '套', specification: '93-1613', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD204', code: 'QD1074', name: '套筒扳手', categoryId: 'CAT002', unit: '套', specification: '89-507', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD205', code: 'QD1075', name: '撬棍', categoryId: 'CAT002', unit: '根', specification: '0.8m', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD206', code: 'QD1063', name: '南孚电池', categoryId: 'CAT002', unit: '个', specification: '5#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD207', code: 'QD1065', name: '南孚电池', categoryId: 'CAT002', unit: '个', specification: '9V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD208', code: 'QD1076', name: '撬棍', categoryId: 'CAT002', unit: '根', specification: '1.5m', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD209', code: 'QD1083', name: '电工绝缘防水胶带', categoryId: 'CAT002', unit: '卷', specification: 'J20,黑色,25MM宽*5M长*0.7MM厚', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD210', code: 'QD1084', name: 'C型开关', categoryId: 'CAT002', unit: '个', specification: '16A/3P', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD211', code: 'QD1085', name: 'C型开关', categoryId: 'CAT002', unit: '个', specification: '40A/3P', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD212', code: 'QD1090', name: '灯头', categoryId: 'CAT002', unit: '个', specification: '螺口', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD213', code: 'QD1095', name: '阻燃热缩管（5色）', categoryId: 'CAT002', unit: '米', specification: '10#（10平米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD214', code: 'QD1096', name: '阻燃热缩管（5色）', categoryId: 'CAT002', unit: '米', specification: '12#（16&25平米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD215', code: 'QD1097', name: '阻燃热缩管（5色）', categoryId: 'CAT002', unit: '米', specification: '14#（35平米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD216', code: 'QD1098', name: '阻燃热缩管（5色）', categoryId: 'CAT002', unit: '米', specification: '20#（70平米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD217', code: 'QD1099', name: '阻燃热缩管（5色）', categoryId: 'CAT002', unit: '米', specification: '22#（95平米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD218', code: 'QD1077', name: '卸扣', categoryId: 'CAT002', unit: '个', specification: '1吨', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD219', code: 'QD1079', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '8#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD220', code: 'QD1080', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '10#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD221', code: 'QD1081', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '12#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD222', code: 'QD1082', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '14#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD223', code: 'QD1100', name: '电源线盘', categoryId: 'CAT002', unit: '卷', specification: '3*2.5㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD224', code: 'QD1101', name: '阻燃热缩管（5色）', categoryId: 'CAT002', unit: '米', specification: '16#（50平米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD225', code: 'QD1102', name: '博世角磨机', categoryId: 'CAT002', unit: '台', specification: '含磨片、切片', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD226', code: 'QD1086', name: '开路先锋钻头', categoryId: 'CAT002', unit: '个', specification: '6#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD227', code: 'QD1087', name: '开路先锋钻头', categoryId: 'CAT002', unit: '个', specification: '8#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD228', code: 'QD1088', name: '开路先锋钻头', categoryId: 'CAT002', unit: '个', specification: '10#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD229', code: 'QD1089', name: '开路先锋钻头', categoryId: 'CAT002', unit: '个', specification: '12#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD230', code: 'QD1103', name: '灯泡', categoryId: 'CAT002', unit: '个', specification: '40W螺口', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD231', code: 'QD1104', name: '两用螺批', categoryId: 'CAT002', unit: '个', specification: '6*3', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD232', code: 'QD1110', name: '钳形表', categoryId: 'CAT002', unit: '个', specification: '胜利', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD233', code: 'QD1116', name: '活动扳手', categoryId: 'CAT002', unit: '个', specification: '8寸', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD234', code: 'QD1134', name: '大锤', categoryId: 'CAT002', unit: '个', specification: '16磅', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD235', code: 'QD1148', name: '博世热风枪', categoryId: 'CAT002', unit: '个', specification: '1800W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD236', code: 'QD1156', name: '12件套英制内六角', categoryId: 'CAT002', unit: '套', specification: '汉斯', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD237', code: 'QD1157', name: '大力钳', categoryId: 'CAT002', unit: '个', specification: '10#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD238', code: 'QD1158', name: '欧式梅花扳手', categoryId: 'CAT002', unit: '套', specification: '14件套公制', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD239', code: 'QD1160', name: '活动梅花扳手', categoryId: 'CAT002', unit: '个', specification: '10#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD240', code: 'QD1161', name: '活动梅花扳手', categoryId: 'CAT002', unit: '个', specification: '12#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD241', code: 'QD1162', name: '五件套锉刀', categoryId: 'CAT002', unit: '套', specification: '汉斯', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD242', code: 'QD1164', name: '电烙铁', categoryId: 'CAT002', unit: '个', specification: '80~100W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD243', code: 'QD1119', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '18#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD244', code: 'QD1120', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '24#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD245', code: 'QD1121', name: '管子钳', categoryId: 'CAT002', unit: '个', specification: '36#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD246', code: 'QD1166', name: '史丹利一字螺批', categoryId: 'CAT002', unit: '个', specification: '2*75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD247', code: 'QD1167', name: '史丹利十字螺批', categoryId: 'CAT002', unit: '个', specification: '2*75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD248', code: 'QD1168', name: '史丹利棘轮电缆剪', categoryId: 'CAT002', unit: '个', specification: '400mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD249', code: 'QD1176', name: '液压压线钳', categoryId: 'CAT002', unit: '个', specification: 'YGK-300', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD250', code: 'QD1177', name: '丝锥扳手套装', categoryId: 'CAT002', unit: '个', specification: '40件', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD251', code: 'QD1139', name: '手提电焊机', categoryId: 'CAT002', unit: '台', specification: '380V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD252', code: 'QD1140', name: '氧割组套', categoryId: 'CAT002', unit: '套', specification: '割枪、割枪嘴、气管、氧气/乙炔表', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD253', code: 'QD1187', name: 'pvc弯管器', categoryId: 'CAT002', unit: '个', specification: '25mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD254', code: 'QD1188', name: '铜棒', categoryId: 'CAT002', unit: '根', specification: '50*300mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD255', code: 'QD1147', name: '吸锡器', categoryId: 'CAT002', unit: '个', specification: '宝工 DP-366D', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD256', code: 'QD1192', name: 'Y型外六角扳手', categoryId: 'CAT002', unit: '个', specification: '12-14-17', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD257', code: 'QD1205', name: 'D型开关', categoryId: 'CAT002', unit: '个', specification: '3P/16A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD258', code: 'QD1206', name: 'D型开关', categoryId: 'CAT002', unit: '个', specification: '3P/32A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD259', code: 'QD1207', name: 'D型开关', categoryId: 'CAT002', unit: '个', specification: '3P/40A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD260', code: 'QD1208', name: 'D型开关', categoryId: 'CAT002', unit: '个', specification: '3P/63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD261', code: 'QD1209', name: '电工胶布', categoryId: 'CAT002', unit: '卷', specification: '3M 1600# 18MM*20M*0.15MM', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD262', code: 'QD1210', name: '液压开孔器', categoryId: 'CAT002', unit: '把', specification: 'SYK15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD263', code: 'QD1212', name: '滑轨', categoryId: 'CAT002', unit: '米', specification: '1米/根', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD264', code: 'QD1213', name: '电流互感器', categoryId: 'CAT002', unit: '个', specification: '电流比100/5A 400/5A 500/5A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD265', code: 'QD1221', name: 'PVC三通接线盒', categoryId: 'CAT002', unit: '个', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD266', code: 'QD1224', name: '三孔插座', categoryId: 'CAT002', unit: '个', specification: '86型(工程款白)，16A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD267', code: 'QD1169', name: '挂锁', categoryId: 'CAT002', unit: '把', specification: '通用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD268', code: 'QD1171', name: '铆钉', categoryId: 'CAT002', unit: '盒', specification: '1包100个', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD269', code: 'QD1172', name: '玻璃胶枪', categoryId: 'CAT002', unit: '个', specification: '汉斯', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD270', code: 'QD1173', name: '鱼嘴钳', categoryId: 'CAT002', unit: '个', specification: '汉斯', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD271', code: 'QD1174', name: '水泵钳', categoryId: 'CAT002', unit: '个', specification: '汉斯', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD272', code: 'QD1239', name: '动力用D型开关', categoryId: 'CAT002', unit: '个', specification: '16A/1P', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD273', code: 'QD1245', name: 'C型开关', categoryId: 'CAT002', unit: '个', specification: '3P/32A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD274', code: 'QD1246', name: 'C型开关', categoryId: 'CAT002', unit: '个', specification: '3P/63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD275', code: 'QD1263', name: '32#锁（带反扣）', categoryId: 'CAT002', unit: '套', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD276', code: 'QD1269', name: '半圆线槽', categoryId: 'CAT002', unit: '个', specification: '大号', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD277', code: 'QD1277', name: '杯索', categoryId: 'CAT002', unit: '个', specification: '20#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD278', code: 'QD1191', name: '胶塞', categoryId: 'CAT002', unit: '包', specification: '6#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD279', code: 'QD1281', name: '漏保开关', categoryId: 'CAT002', unit: '个', specification: '4P/25A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD280', code: 'QD1282', name: '漏保开关', categoryId: 'CAT002', unit: '个', specification: '4P/63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD281', code: 'QD1283', name: '液压撑杆', categoryId: 'CAT002', unit: '个', specification: '展位箱用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD282', code: 'QD1285', name: '熔断器', categoryId: 'CAT002', unit: '个', specification: '80A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD283', code: 'QD1286', name: 'C型开关', categoryId: 'CAT002', unit: '个', specification: '16A/220v 2p', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD284', code: 'QD1203', name: '棉绳', categoryId: 'CAT002', unit: 'KG', specification: '5mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD285', code: 'QD1290', name: '面板开关', categoryId: 'CAT002', unit: '个', specification: '86型 单开/双开/三开', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD286', code: 'QD1294', name: '单股铜芯线', categoryId: 'CAT002', unit: '米', specification: '6㎡（黄绿红色）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD287', code: 'QD1296', name: '筒灯', categoryId: 'CAT002', unit: '个', specification: '15W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD288', code: 'QD1305', name: '液压千斤顶', categoryId: 'CAT002', unit: '个', specification: '3T', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD289', code: 'QD1311', name: '电洛铁', categoryId: 'CAT002', unit: '个', specification: '150W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD290', code: 'QD1312', name: '电洛铁', categoryId: 'CAT002', unit: '个', specification: '200W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD291', code: 'QD1315', name: '温湿度计', categoryId: 'CAT002', unit: '个', specification: '得力9013', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD292', code: 'QD1316', name: 'PVC三通接线盒', categoryId: 'CAT002', unit: '个', specification: '20#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD293', code: 'QD1318', name: '游标卡尺', categoryId: 'CAT002', unit: '把', specification: '150*0.01mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD294', code: 'QD1319', name: 'T5一体化灯管', categoryId: 'CAT002', unit: '个', specification: 'T5 LED 13w 6500K 含支架灯电源延长线公母插2孔 通用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD295', code: 'QD1328', name: '移动电箱门插销', categoryId: 'CAT002', unit: '个', specification: '铝合金 ，Φ4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD296', code: 'QD1330', name: '移动电箱零地排螺丝', categoryId: 'CAT002', unit: '包', specification: 'M6*8/10/25圆头十字', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD297', code: 'QD1225', name: '开孔钻头', categoryId: 'CAT002', unit: '个', specification: '20#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD298', code: 'QD1226', name: '开孔钻头', categoryId: 'CAT002', unit: '个', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD299', code: 'QD1227', name: '麻花钻头', categoryId: 'CAT002', unit: '盒', specification: '4.2#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD300', code: 'QD1229', name: '麻花钻头', categoryId: 'CAT002', unit: '盒', specification: '5.2#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD301', code: 'QD1331', name: '筒灯', categoryId: 'CAT002', unit: '个', specification: '8W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD302', code: 'QD1332', name: '射灯', categoryId: 'CAT002', unit: '个', specification: '6W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD303', code: 'QD1336', name: '单股铜芯线', categoryId: 'CAT002', unit: '米', specification: 'BRV4  4㎡电缆', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD304', code: 'QD1360', name: '声控面板开关', categoryId: 'CAT002', unit: '个', specification: '86型声光控感应开关面板', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD305', code: 'QD1361', name: '继电器', categoryId: 'CAT002', unit: '个', specification: '220v/36V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD306', code: 'QD1362', name: '热缩管', categoryId: 'CAT002', unit: '米', specification: '3#、5#、8#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD307', code: 'QD1364', name: 'LED防水电源', categoryId: 'CAT002', unit: '个', specification: '75-36A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD308', code: 'QD1367', name: '锁扣锁母', categoryId: 'CAT002', unit: '个', specification: '20#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD309', code: 'QD1266', name: '葫芦袋', categoryId: 'CAT002', unit: '个', specification: '3T/18米用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD310', code: 'QD1384', name: '熔断器', categoryId: 'CAT002', unit: '个', specification: '6A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD311', code: 'QD1386', name: '熔断器', categoryId: 'CAT002', unit: '个', specification: '32A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD312', code: 'QD1387', name: '继电器', categoryId: 'CAT002', unit: '个', specification: '24V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD313', code: 'QD1388', name: '三孔插座', categoryId: 'CAT002', unit: '个', specification: 'AC30-108/10A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD314', code: 'QD1392', name: '指示灯', categoryId: 'CAT002', unit: '个', specification: '红色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD315', code: 'QD1393', name: '指示灯', categoryId: 'CAT002', unit: '个', specification: '绿色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD316', code: 'QD1394', name: '指示灯', categoryId: 'CAT002', unit: '个', specification: '黄色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD317', code: 'QD1406', name: '指示灯', categoryId: 'CAT002', unit: '个', specification: '白色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD318', code: 'QD1418', name: '行程开关', categoryId: 'CAT002', unit: '个', specification: '5A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD319', code: 'QD1421', name: 'ABB开关熔断器组', categoryId: 'CAT002', unit: '个', specification: '125A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD320', code: 'QD1422', name: '手柄', categoryId: 'CAT002', unit: '个', specification: '配电柜用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD321', code: 'QD1424', name: '电能表', categoryId: 'CAT002', unit: '台', specification: 'DTSU666', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD322', code: 'QD1307', name: '割枪', categoryId: 'CAT002', unit: '把', specification: '30#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD323', code: 'QD1425', name: '铜鼻子', categoryId: 'CAT002', unit: '个', specification: 'DT120', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD324', code: 'QD1429', name: '三孔插座', categoryId: 'CAT002', unit: '个', specification: 'AC30-108/16A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD325', code: 'QD1433', name: '温度控制器', categoryId: 'CAT002', unit: '个', specification: '大创', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD326', code: 'QD1434', name: '传感器', categoryId: 'CAT002', unit: '个', specification: 'PT100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD327', code: 'QD1436', name: '熔断器', categoryId: 'CAT002', unit: '个', specification: '63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD328', code: 'QD1437', name: 'LED导轨射灯', categoryId: 'CAT002', unit: '个', specification: '30W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD329', code: 'QD1438', name: 'LED灯带', categoryId: 'CAT002', unit: '米', specification: '5050', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD330', code: 'QD1440', name: '漏保开关', categoryId: 'CAT002', unit: '个', specification: '2P 16A带漏保', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD331', code: 'QD1441', name: '熔断器', categoryId: 'CAT002', unit: '个', specification: '630A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD332', code: 'QD1456', name: '监测仪', categoryId: 'CAT002', unit: '个', specification: 'YD2202', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD333', code: 'QD1464', name: '吸顶灯', categoryId: 'CAT002', unit: '个', specification: '13W 6500K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD334', code: 'QD1471', name: '明纬电源（西广场高杆灯）', categoryId: 'CAT002', unit: '个', specification: 'ELG-200-36A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD335', code: 'QD1337', name: '膨胀螺栓', categoryId: 'CAT002', unit: '个', specification: '6/8/10/12/14/16', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD336', code: 'QD1339', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '6*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD337', code: 'QD1340', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '8*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD338', code: 'QD1341', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '10*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD339', code: 'QD1342', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '12*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD340', code: 'QD1343', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '12*150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD341', code: 'QD1344', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '16*80', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD342', code: 'QD1345', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '16*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD343', code: 'QD1346', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '20*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD344', code: 'QD1347', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '个', specification: '20*150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD345', code: 'QD1348', name: '双头螺丝', categoryId: 'CAT002', unit: '个', specification: '20*200', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD346', code: 'QD1349', name: '双头螺丝', categoryId: 'CAT002', unit: '个', specification: '12*100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD347', code: 'QD1350', name: '双头螺丝', categoryId: 'CAT002', unit: '个', specification: '16*200', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD348', code: 'QD1355', name: '交流接触器', categoryId: 'CAT002', unit: '个', specification: '18M7C220V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD349', code: 'QD1356', name: '辅助触头', categoryId: 'CAT002', unit: '个', specification: '开叉角', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD350', code: 'QD1357', name: '过热继电器', categoryId: 'CAT002', unit: '个', specification: 'LRD14C', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD351', code: 'QD1473', name: '明纬电源（泛光灯带）', categoryId: 'CAT002', unit: '个', specification: 'ERP-350-12', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD352', code: 'QD1474', name: '中心广场高杆灯电源', categoryId: 'CAT002', unit: '个', specification: '80W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD353', code: 'QD1475', name: '电源三雄极光（射灯电源）', categoryId: 'CAT002', unit: '个', specification: '32W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD354', code: 'QD1476', name: '灯珠', categoryId: 'CAT002', unit: '个', specification: '30W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD355', code: 'QD1477', name: '格栅灯', categoryId: 'CAT002', unit: '个', specification: '2*20W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD356', code: 'QD1478', name: '格栅灯镇流器', categoryId: 'CAT002', unit: '个', specification: '2*20W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD357', code: 'QD1480', name: '单股铜芯线', categoryId: 'CAT002', unit: '米', specification: '10㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD358', code: 'QD1481', name: '熔断器', categoryId: 'CAT002', unit: '个', specification: '40A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD359', code: 'QD1375', name: '开关电源', categoryId: 'CAT002', unit: '个', specification: '5V/40A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD360', code: 'QD1483', name: 'OT接线端子', categoryId: 'CAT002', unit: '包', specification: '500个/包', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD361', code: 'QD1484', name: '冷压接线端子', categoryId: 'CAT002', unit: '包', specification: '1000个/包', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD362', code: 'QD1489', name: '明装航空插座5芯', categoryId: 'CAT002', unit: '个', specification: '63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD363', code: 'QD1493', name: '温控器', categoryId: 'CAT002', unit: '个', specification: 'LX-BW10-3207C', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD364', code: 'QD1495', name: 'LED开关电源', categoryId: 'CAT002', unit: '个', specification: '36W/12V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD365', code: 'QD1496', name: 'LED投射灯', categoryId: 'CAT002', unit: '个', specification: '能士400W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD366', code: 'QD1408', name: '麻花钻头', categoryId: 'CAT002', unit: '个', specification: '6#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD367', code: 'QD1411', name: '钢排钉', categoryId: 'CAT002', unit: '盒', specification: 'ST18', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD368', code: 'QD1414', name: '麻花钻头', categoryId: 'CAT002', unit: '盒', specification: '4.5#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD369', code: 'QD1416', name: '电池', categoryId: 'CAT002', unit: '个', specification: '6V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD370', code: 'QD1497', name: '无极灯', categoryId: 'CAT002', unit: '个', specification: '300W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD371', code: 'QD1498', name: '无极灯镇流器', categoryId: 'CAT002', unit: '个', specification: '300W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD372', code: 'QD1506', name: 'LED投光灯', categoryId: 'CAT002', unit: '个', specification: '防爆灯400W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD373', code: 'QD1508', name: 'LED投光灯', categoryId: 'CAT002', unit: '个', specification: '150W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD374', code: 'QD1509', name: '连接线', categoryId: 'CAT002', unit: '根', specification: '10*30㎜', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD375', code: 'QD1512', name: '重型套筒扳手', categoryId: 'CAT002', unit: '个', specification: '30#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD376', code: 'QD1513', name: '重型套筒扳手', categoryId: 'CAT002', unit: '个', specification: '38#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD377', code: 'QD1514', name: '套筒转接头', categoryId: 'CAT002', unit: '个', specification: '1/2转3/4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD378', code: 'QD1515', name: '面板', categoryId: 'CAT002', unit: '个', specification: '黑色 625-W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD379', code: 'QD1516', name: '电源', categoryId: 'CAT002', unit: '个', specification: '48-58W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD380', code: 'QD1517', name: '扭力扳手', categoryId: 'CAT002', unit: '个', specification: '96311', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD381', code: 'QD1539', name: '继电器', categoryId: 'CAT002', unit: '个', specification: 'DZ52-40 110V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD382', code: 'QD1540', name: 'LED超薄筒灯', categoryId: 'CAT002', unit: '个', specification: '10W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD383', code: 'QD1541', name: 'LED明装筒灯', categoryId: 'CAT002', unit: '个', specification: '9W 5700K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD384', code: 'QD1543', name: 'LED平板灯电源', categoryId: 'CAT002', unit: '个', specification: '180-240V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD385', code: 'QD1544', name: 'E馆连廊灯电源', categoryId: 'CAT002', unit: '个', specification: 'LED防水20-38V 105W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD386', code: 'QD1545', name: 'E馆路灯电源', categoryId: 'CAT002', unit: '个', specification: '36-52V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD387', code: 'QD1546', name: '卸货通道电源', categoryId: 'CAT002', unit: '个', specification: 'LED防水34-54V 200W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD388', code: 'QD1547', name: '泛光照明灯带电源', categoryId: 'CAT002', unit: '个', specification: 'ERP-350-24', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD389', code: 'QD1548', name: 'ABB塑壳开关', categoryId: 'CAT002', unit: '个', specification: '250A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD390', code: 'QD1562', name: 'Tc接线端子', categoryId: 'CAT002', unit: '个', specification: 'Tc100-4P', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD391', code: 'QD1566', name: '指示灯', categoryId: 'CAT002', unit: '个', specification: '红绿双色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD392', code: 'QD1568', name: '电容', categoryId: 'CAT002', unit: '个', specification: '20-25UF', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD393', code: 'QD1570', name: '盖板拉手', categoryId: 'CAT002', unit: '个', specification: '80A地面展位箱拉手', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD394', code: 'QD1573', name: '隔板', categoryId: 'CAT002', unit: '个', specification: '100E/160E', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD395', code: 'QD1577', name: '绝缘子', categoryId: 'CAT002', unit: '个', specification: '85*140 M6', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD396', code: 'QD1587', name: '插针式铜鼻子', categoryId: 'CAT002', unit: '包', specification: 'C45-16', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD397', code: 'QD1588', name: '断路器', categoryId: 'CAT002', unit: '个', specification: '100A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD398', code: 'QD1590', name: '电池充电模块', categoryId: 'CAT002', unit: '块', specification: 'DC190-260V 3A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD399', code: 'QD1592', name: '声光模块', categoryId: 'CAT002', unit: '个', specification: 'TCZ3701', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD400', code: 'QD1596', name: '电源（门牌灯）', categoryId: 'CAT002', unit: '个', specification: 'LRS-100-12', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD401', code: 'QD1597', name: '电源', categoryId: 'CAT002', unit: '个', specification: 'LRS-75-24', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD402', code: 'QD1610', name: '管道式换气扇', categoryId: 'CAT002', unit: '个', specification: 'XC1306A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD403', code: 'QD1621', name: '玻璃保险丝', categoryId: 'CAT002', unit: '盒', specification: '6*30mm  250V  5A 100只一盒', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD404', code: 'QD1626', name: '圆形端子', categoryId: 'CAT002', unit: '包', specification: '伊莱科（ELECALL） OT16-8 30只/包', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD405', code: 'QD1627', name: '钢丝绳剪', categoryId: 'CAT002', unit: '把', specification: '8寸', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD406', code: 'QD1635', name: 'LED灯管', categoryId: 'CAT002', unit: '根', specification: '雷达感应6500K 18W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD407', code: 'QD1637', name: '保险丝底座', categoryId: 'CAT002', unit: '个', specification: 'FS-10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD408', code: 'QD1640', name: 'LED灯泡', categoryId: 'CAT002', unit: '个', specification: '3W/6500K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD409', code: 'QD1645', name: 'LED超薄筒灯', categoryId: 'CAT002', unit: '个', specification: '16W 6500K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD410', code: 'QD1646', name: 'T8灯管', categoryId: 'CAT002', unit: '根', specification: 'LED 0.6米 6500K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD411', code: 'QD1647', name: '干式变压器冷却风机', categoryId: 'CAT002', unit: '个', specification: '220V/60W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD412', code: 'QD1649', name: '卡槽', categoryId: 'CAT002', unit: '个', specification: '亚克力A4', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD413', code: 'QD1650', name: '泡沫双面胶', categoryId: 'CAT002', unit: '个', specification: '白色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD414', code: 'QD1652', name: 'LEDT8灯管', categoryId: 'CAT002', unit: '个', specification: 'T8灯管加支架  4000K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD415', code: 'QD1656', name: '冷缩电缆终端', categoryId: 'CAT002', unit: '套', specification: '70-120平方', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD416', code: 'QD1657', name: '扩展铜排', categoryId: 'CAT002', unit: '米', specification: '4*20mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD417', code: 'SN1223', name: '砂纸', categoryId: 'CAT002', unit: '张', specification: '粗', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD418', code: 'SN1472', name: '纽扣电池', categoryId: 'CAT002', unit: '个', specification: '1.5V，LR44 10粒/卡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD419', code: 'QD1004', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '10㎡', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD420', code: 'NT1480', name: '已送电标识', categoryId: 'CAT002', unit: '块', specification: '0.14M*0.2M', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD421', code: 'QD1190', name: '大功率吸尘器', categoryId: 'CAT002', unit: '台', specification: '70L', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD422', code: 'SN1360', name: '正泰电流表', categoryId: 'CAT002', unit: '个', specification: '150A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD423', code: 'SN1361', name: '正泰电流表', categoryId: 'CAT002', unit: '个', specification: '300A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD424', code: 'SN1437', name: '穿线管', categoryId: 'CAT002', unit: '捆', specification: 'A32/A40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD425', code: 'SN1017', name: '人字梯', categoryId: 'CAT002', unit: '个', specification: '2.5m', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD426', code: 'NT1059', name: '水粉颜料', categoryId: 'CAT002', unit: '袋', specification: '500ml', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD427', code: 'NT1113', name: '警示灯', categoryId: 'CAT002', unit: '个', specification: '黄色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD428', code: 'NT1114', name: '报警灯', categoryId: 'CAT002', unit: '个', specification: '12V带磁铁', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD429', code: 'NT1232', name: '标识牌', categoryId: 'CAT002', unit: '块', specification: '机房重地闲人免进', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD430', code: 'NT1233', name: '标识牌', categoryId: 'CAT002', unit: '块', specification: '配电重地闲人免进', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD431', code: 'QD1108', name: '兆欧表', categoryId: 'CAT002', unit: '个', specification: '500V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD432', code: 'QD1109', name: '兆欧表', categoryId: 'CAT002', unit: '个', specification: '1000V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD433', code: 'QD1135', name: '三爪拉马', categoryId: 'CAT002', unit: '套', specification: '75#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD434', code: 'QD1136', name: '三爪拉马', categoryId: 'CAT002', unit: '套', specification: '250#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD435', code: 'QD1137', name: '三爪拉马', categoryId: 'CAT002', unit: '套', specification: '300#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD436', code: 'QD1138', name: '三爪拉马', categoryId: 'CAT002', unit: '套', specification: '500#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD437', code: 'QD1143', name: '兆欧表', categoryId: 'CAT002', unit: '台', specification: '5000V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD438', code: 'QD1150', name: '博世电动吹风机', categoryId: 'CAT002', unit: '台', specification: 'GBL800', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD439', code: 'QD1165', name: '热胶枪', categoryId: 'CAT002', unit: '个', specification: '长寿', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD440', code: 'QD1204', name: '地毯胶（银灰色）', categoryId: 'CAT002', unit: '卷', specification: '布基胶带,80mm宽*20m长', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD441', code: 'QD1217', name: '针型线鼻子', categoryId: 'CAT002', unit: '包', specification: '1.5#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD442', code: 'QD1218', name: 'O型线鼻子', categoryId: 'CAT002', unit: '包', specification: '1.5#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD443', code: 'QD1244', name: '纤维卷尺', categoryId: 'CAT002', unit: '个', specification: '50M/100M', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD444', code: 'QD1247', name: '放线架', categoryId: 'CAT002', unit: '台', specification: '定做', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD445', code: 'QD1510', name: '放线器', categoryId: 'CAT002', unit: '个', specification: '8*100米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD446', code: 'QD1511', name: '滑轮', categoryId: 'CAT002', unit: '个', specification: '30*30*57', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD447', code: 'QD1320', name: 'T8灯管', categoryId: 'CAT002', unit: '个', specification: 'T8 LED 16W 6500K 双端进线  加强版 长约为1.2m', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD448', code: 'QD1333', name: '柱形灯', categoryId: 'CAT002', unit: '个', specification: '5W', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD449', code: 'QD1638', name: '电机综合保护器', categoryId: 'CAT002', unit: '个', specification: 'JD-5 AC380V 1-80A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD450', code: 'QD1644', name: '地毯胶（黑黄色）', categoryId: 'CAT002', unit: '卷', specification: '布基胶带,80mm宽*20m长', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD451', code: 'QD1655', name: '发泡胶', categoryId: 'CAT002', unit: '组', specification: '高强度防火防水发泡胶 1组450ML', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD452', code: 'QD1664', name: 'T5一体化灯管', categoryId: 'CAT002', unit: '个', specification: '长30CM 4W  5700K', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD453', code: 'QD1665', name: '温湿度自动控制器', categoryId: 'CAT002', unit: '个', specification: 'DC2602-2 含两路温湿度传感器', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD454', code: 'QD1666', name: '阻燃热缩管', categoryId: 'CAT002', unit: '卷', specification: 'φ25.4MM 25米/卷', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD455', code: 'RD1001', name: '网络测试仪', categoryId: 'CAT002', unit: '台', specification: 'NF-622', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD456', code: 'RD1003', name: '金士顿U盘', categoryId: 'CAT002', unit: '个', specification: '32GUSB3.2', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD457', code: 'RD1007', name: '电话水晶头', categoryId: 'CAT002', unit: '包', specification: '50个/盒', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD458', code: 'RD1013', name: '网线钳', categoryId: 'CAT002', unit: '个', specification: 'RKY-338', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD459', code: 'RD1019', name: '电脑主板诊断卡', categoryId: 'CAT002', unit: '个', specification: '4位', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD460', code: 'RD1025', name: '光纤', categoryId: 'CAT002', unit: '卷', specification: '单模/4芯/150米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD461', code: 'RD1026', name: '光纤', categoryId: 'CAT002', unit: '卷', specification: '单模/4芯/300米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD462', code: 'RD1029', name: '无线路由器', categoryId: 'CAT002', unit: '个', specification: 'AC1900', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD463', code: 'RD1030', name: 'TP光纤收发器', categoryId: 'CAT002', unit: '对', specification: 'TL-FC311', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD464', code: 'RD1034', name: '光模块', categoryId: 'CAT002', unit: '个', specification: 'H3C 千兆 SM1310-A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD465', code: 'RD1038', name: '六类室外网线', categoryId: 'CAT002', unit: '米', specification: '六类屏蔽国标每箱（300米）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD466', code: 'RD1041', name: 'vga连接线', categoryId: 'CAT002', unit: '条', specification: '5米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD467', code: 'RD1047', name: '电池', categoryId: 'CAT002', unit: '节', specification: '9V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD468', code: 'RD1051', name: 'HDMI高清线', categoryId: 'CAT002', unit: '条', specification: '5米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD469', code: 'RD1054', name: '音频线', categoryId: 'CAT002', unit: '根', specification: '15米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD470', code: 'RD1055', name: 'HDMI放大器', categoryId: 'CAT002', unit: '个', specification: '60米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD471', code: 'RD1058', name: 'LC-SC 3米单模光纤跳线', categoryId: 'CAT002', unit: '对', specification: '（大方转小方）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD472', code: 'RD1059', name: 'FC-SC 3米单模光纤跳线', categoryId: 'CAT002', unit: '个', specification: '（大方转圆）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD473', code: 'RD1060', name: '网口对接头', categoryId: 'CAT002', unit: '个', specification: '国标RJ45转RJ45', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD474', code: 'RD1062', name: '监控设备机箱', categoryId: 'CAT002', unit: '个', specification: '规格28OmmX200mmX100mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD475', code: 'RD1067', name: '摄像头支架', categoryId: 'CAT002', unit: '副', specification: '枪机/投影仪/球机', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD476', code: 'RD1068', name: '48口交换机', categoryId: 'CAT002', unit: '台', specification: 'H3C 5048PV3-E418', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD477', code: 'RD1077', name: '半球摄像机', categoryId: 'CAT002', unit: '台', specification: 'HDBW1230R', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD478', code: 'RD1079', name: '企业级硬盘', categoryId: 'CAT002', unit: '个', specification: '4TB', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD479', code: 'RD1080', name: '光模块', categoryId: 'CAT002', unit: '对', specification: 'XG光讯光电 千兆', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD480', code: 'RD1081', name: '千兆交换机', categoryId: 'CAT002', unit: '台', specification: '24口', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD481', code: 'RD1085', name: '屏蔽电源线', categoryId: 'CAT002', unit: '米', specification: '3*1.0', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD482', code: 'RD1086', name: '球机电源', categoryId: 'CAT002', unit: '个', specification: 'AC24V/3A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD483', code: 'RD1087', name: '纽扣电池', categoryId: 'CAT002', unit: '个', specification: '3VCR2032', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD484', code: 'RD1090', name: '监控电源适配器', categoryId: 'CAT002', unit: '个', specification: 'AZX-P07 12V/4A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD485', code: 'RD1092', name: '兄弟标签色带', categoryId: 'CAT002', unit: '个', specification: '12mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD486', code: 'RD1093', name: 'HDMI高清线', categoryId: 'CAT002', unit: '根', specification: '15米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD487', code: 'RD1094', name: '音频线', categoryId: 'CAT002', unit: '根', specification: '3.5mm公对公3米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD488', code: 'RD1095', name: '音频转接头', categoryId: 'CAT002', unit: '个', specification: '6.5mm公转3.5mm母', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD489', code: 'RD1096', name: '音频线', categoryId: 'CAT002', unit: '根', specification: '3.5mm转6.5mm5米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD490', code: 'RD1097', name: 'HDMI高清线', categoryId: 'CAT002', unit: '根', specification: '3米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD491', code: 'RD1098', name: 'HDMI高清线', categoryId: 'CAT002', unit: '根', specification: '1.5米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD492', code: 'RD1100', name: '音频线', categoryId: 'CAT002', unit: '根', specification: '公对母10米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD493', code: 'RD1104', name: '固态硬盘', categoryId: 'CAT002', unit: '个', specification: '128G', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD494', code: 'RD1107', name: '防雷器监控', categoryId: 'CAT002', unit: '个', specification: 'HL-POE1000E', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD495', code: 'RD1108', name: '无线插座', categoryId: 'CAT002', unit: '个', specification: '4插位总控', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD496', code: 'RD1109', name: '单模光纤跳线', categoryId: 'CAT002', unit: '根', specification: 'SC-LC15米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD497', code: 'RD1118', name: '音频线', categoryId: 'CAT002', unit: '根', specification: '3.5mm转6.5mm  10米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD498', code: 'RD1119', name: '音频线', categoryId: 'CAT002', unit: '根', specification: '3.5mm公对公  5米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD499', code: 'RD1125', name: '光纤', categoryId: 'CAT002', unit: '根', specification: '单模/4芯/400米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD500', code: 'RD1126', name: '光纤', categoryId: 'CAT002', unit: '根', specification: '单模/4芯/600米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD501', code: 'RD1127', name: '光纤', categoryId: 'CAT002', unit: '根', specification: '单模/4芯/1000米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD502', code: 'RD1130', name: 'SC-SC 3米光纤跳线', categoryId: 'CAT002', unit: '对', specification: '大方转大方', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD503', code: 'RD1136', name: '发送卡', categoryId: 'CAT002', unit: '张', specification: 'MSD300', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD504', code: 'RD1137', name: '接收卡', categoryId: 'CAT002', unit: '张', specification: 'LYD-R16', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD505', code: 'RD1144', name: '大井电源适配器', categoryId: 'CAT002', unit: '个', specification: '12V-5A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD506', code: 'RD1151', name: '服务器硬盘', categoryId: 'CAT002', unit: '个', specification: '600GB', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD507', code: 'RD1153', name: '踩地铝合金线槽', categoryId: 'CAT002', unit: '根', specification: '100CM/根', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD508', code: 'RD1157', name: '音柱', categoryId: 'CAT002', unit: '个', specification: '迪士普308', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD509', code: 'RD1159', name: '话筒端子', categoryId: 'CAT002', unit: '个', specification: '卡农公母接头', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD510', code: 'RD1172', name: '打光笔', categoryId: 'CAT002', unit: '支', specification: 'FB-101（5公里通光）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD511', code: 'RD1173', name: '吸顶喇叭', categoryId: 'CAT002', unit: '个', specification: '迪士普DSP804', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD512', code: 'RD1179', name: 'LC-SC 3米单模光纤跳线', categoryId: 'CAT002', unit: '对', specification: '小方转小方', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD513', code: 'RD1181', name: '监控服务器电源', categoryId: 'CAT002', unit: '个', specification: 'YM-2681H', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD514', code: 'RD1183', name: '出门开关', categoryId: 'CAT002', unit: '个', specification: '门禁开关用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD515', code: 'RD1184', name: '服务器电源线', categoryId: 'CAT002', unit: '根', specification: '1.8m', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD516', code: 'RD1187', name: '剥线钳', categoryId: 'CAT002', unit: '把', specification: '8PK-3161', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD517', code: 'RD1188', name: '小耳朵圆头电源', categoryId: 'CAT002', unit: '个', specification: '小耳朵DC5V1A圆头或方头', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD518', code: 'RD1189', name: '光纤收发器架式双电源', categoryId: 'CAT002', unit: '个', specification: '14槽/16槽', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD519', code: 'RD1191', name: '门禁电源', categoryId: 'CAT002', unit: '个', specification: 'DS-KTM-AW50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD520', code: 'RD1194', name: '万兆光模块', categoryId: 'CAT002', unit: '个', specification: 'H3C 万兆 SM1310-D', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD521', code: 'RD1195', name: '万兆交换机', categoryId: 'CAT002', unit: '个', specification: 'LINKKP-9000-6XH-X2', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD522', code: 'RD1205', name: '开关电源', categoryId: 'CAT002', unit: '个', specification: '24v/16.6A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD523', code: 'RD1206', name: '门禁控制箱', categoryId: 'CAT002', unit: '个', specification: '2门', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD524', code: 'RD1210', name: '四路音频分配器', categoryId: 'CAT002', unit: '台', specification: '1进4出', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD525', code: 'RD1212', name: '监控硬盘', categoryId: 'CAT002', unit: '个', specification: '4T', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD526', code: 'RD1215', name: '电缆', categoryId: 'CAT002', unit: '米', specification: '2*1.0', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD527', code: 'RD1216', name: '公网对讲机', categoryId: 'CAT002', unit: '台', specification: 'HYT-P30', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD528', code: 'SN1001', name: '生料带', categoryId: 'CAT002', unit: '卷', specification: '密封防水胶带16mm宽*15m长*0.1mm厚', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD529', code: 'SN1002', name: '高压气管', categoryId: 'CAT002', unit: '米', specification: '10*6.5mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD530', code: 'SN1005', name: '不锈钢喉箍', categoryId: 'CAT002', unit: '个', specification: '8-12', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD531', code: 'SN1006', name: '不锈钢喉箍', categoryId: 'CAT002', unit: '个', specification: '13-19', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD532', code: 'SN1007', name: '不锈钢喉箍', categoryId: 'CAT002', unit: '个', specification: '21-38', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD533', code: 'SN1008', name: '铜球阀', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD534', code: 'SN1011', name: '气管快速公接头', categoryId: 'CAT002', unit: '个', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD535', code: 'SN1012', name: '气管快速母接头', categoryId: 'CAT002', unit: '个', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD536', code: 'QD1667', name: '热缩管', categoryId: 'CAT002', unit: '卷', specification: 'φ52MM 25米/卷', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD537', code: 'SN1019', name: '不锈钢喉箍', categoryId: 'CAT002', unit: '个', specification: '8-14', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD538', code: 'SN1020', name: '不锈钢喉箍', categoryId: 'CAT002', unit: '个', specification: '18-32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD539', code: 'SN1021', name: '不锈钢喉箍', categoryId: 'CAT002', unit: '包', specification: '2#/40-63#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD540', code: 'SN1030', name: '气管', categoryId: 'CAT002', unit: '米', specification: '16*12mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD541', code: 'SN1031', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'SM（2）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD542', code: 'SN1032', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'PH（1）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD543', code: 'SN1033', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'SH', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD544', code: 'SN1052', name: '水管', categoryId: 'CAT002', unit: '卷', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD545', code: 'SN1054', name: 'PPR管', categoryId: 'CAT002', unit: '米', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD546', code: 'SN1055', name: 'PPR三通', categoryId: 'CAT002', unit: '个', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD547', code: 'SN1056', name: 'PPR弯头', categoryId: 'CAT002', unit: '个', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD548', code: 'SN1057', name: 'PPR直接', categoryId: 'CAT002', unit: '个', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD549', code: 'SN1058', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '32*25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD550', code: 'SN1060', name: 'PPR大小头', categoryId: 'CAT002', unit: '个', specification: 'PPR 40*32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD551', code: 'SN1063', name: 'PPR直接内丝', categoryId: 'CAT002', unit: '个', specification: '25*1/2', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD552', code: 'SN1065', name: '水表', categoryId: 'CAT002', unit: '个', specification: 'DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD553', code: 'SN1068', name: 'PPR抱卡', categoryId: 'CAT002', unit: '个', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD554', code: 'SN1070', name: 'PPR抱卡', categoryId: 'CAT002', unit: '个', specification: '50#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD555', code: 'SN1071', name: 'PPR抱卡', categoryId: 'CAT002', unit: '个', specification: '75#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD556', code: 'SN1072', name: 'PVC管', categoryId: 'CAT002', unit: '米', specification: '50#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD557', code: 'SN1073', name: 'PVC管', categoryId: 'CAT002', unit: '米', specification: '75#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD558', code: 'SN1074', name: 'PVC三通', categoryId: 'CAT002', unit: '个', specification: '75#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD559', code: 'SN1075', name: 'PVC直接', categoryId: 'CAT002', unit: '个', specification: '75#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD560', code: 'SN1076', name: 'PVC弯头', categoryId: 'CAT002', unit: '个', specification: '75#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD561', code: 'SN1078', name: 'PVC直接', categoryId: 'CAT002', unit: '个', specification: '50#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD562', code: 'SN1079', name: 'PVC弯头', categoryId: 'CAT002', unit: '个', specification: '50#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD563', code: 'SN1080', name: '大小头', categoryId: 'CAT002', unit: '个', specification: '75*50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD564', code: 'SN1084', name: '大小头', categoryId: 'CAT002', unit: '个', specification: '110*75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD565', code: 'SN1085', name: '截业阀', categoryId: 'CAT002', unit: '个', specification: '50#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD566', code: 'SN1086', name: '坐便器', categoryId: 'CAT002', unit: '个', specification: '坑距400MM', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD567', code: 'SN1087', name: '台下盆', categoryId: 'CAT002', unit: '个', specification: '300mm*500mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD568', code: 'SN1089', name: '蹲便器', categoryId: 'CAT002', unit: '个', specification: '530*410mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD569', code: 'SN1109', name: '压力表', categoryId: 'CAT002', unit: '个', specification: 'DN15/PN16', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD570', code: 'SN1110', name: '压力表缓冲管', categoryId: 'CAT002', unit: '个', specification: 'DN15/PN16', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD571', code: 'SN1112', name: '铜球阀', categoryId: 'CAT002', unit: '个', specification: 'DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD572', code: 'SN1116', name: '卫生间隔断门合页', categoryId: 'CAT002', unit: '个', specification: '304#不锈钢合页（左开/右开）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD573', code: 'SN1117', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'SH14', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD574', code: 'SN1118', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'PH14', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD575', code: 'SN1119', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'SH10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD576', code: 'SN1120', name: '快速接头', categoryId: 'CAT002', unit: '个', specification: 'PH10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD577', code: 'SN1121', name: '气管', categoryId: 'CAT002', unit: '米', specification: '10*6.5mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD578', code: 'SN1122', name: '气管', categoryId: 'CAT002', unit: '米', specification: '14*10mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD579', code: 'SN1124', name: '电热水龙头', categoryId: 'CAT002', unit: '个', specification: '全铜', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD580', code: 'SN1127', name: '下水软管', categoryId: 'CAT002', unit: '根', specification: '波纹管', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD581', code: 'SN1128', name: '下水软管', categoryId: 'CAT002', unit: '根', specification: '带金属头', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD582', code: 'SN1129', name: '不锈钢弯头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD583', code: 'SN1130', name: '不锈钢弯头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD584', code: 'SN1131', name: '不锈钢弯头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD585', code: 'SN1132', name: '不锈钢外丝直接', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD586', code: 'SN1134', name: '不锈钢内丝直接', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD587', code: 'SN1136', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '套', specification: 'M10*40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD588', code: 'SN1137', name: '不锈钢螺丝套装', categoryId: 'CAT002', unit: '套', specification: 'M12*40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD589', code: 'SN1139', name: '不锈钢补芯', categoryId: 'CAT002', unit: '个', specification: '32-25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD590', code: 'SN1140', name: '不锈钢补芯', categoryId: 'CAT002', unit: '个', specification: '50-25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD591', code: 'SN1141', name: '不锈钢补芯', categoryId: 'CAT002', unit: '个', specification: '40-25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD592', code: 'SN1144', name: '不锈钢外丝堵头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD593', code: 'SN1145', name: '不锈钢外丝堵头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD594', code: 'SN1146', name: '不锈钢外丝堵头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD595', code: 'SN1147', name: '不锈钢内丝堵头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD596', code: 'SN1148', name: '不锈钢内丝堵头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD597', code: 'SN1149', name: '不锈钢内丝堵头', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD598', code: 'SN1150', name: '软管对接头', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD599', code: 'SN1151', name: '活接', categoryId: 'CAT002', unit: '个', specification: '63#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD600', code: 'SN1152', name: '液体生料带', categoryId: 'CAT002', unit: '支', specification: '第三代耐高温液态生料带  200g', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD601', code: 'SN1172', name: '快开单冷角阀', categoryId: 'CAT002', unit: '个', specification: 'G1/2', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD602', code: 'SN1173', name: '不锈钢编织管', categoryId: 'CAT002', unit: '个', specification: '13#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD603', code: 'SN1174', name: '不锈钢外丝直接', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD604', code: 'SN1175', name: '不锈钢内丝三通', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD605', code: 'SN1176', name: '不锈钢内丝三通', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD606', code: 'SN1178', name: '连接软管', categoryId: 'CAT002', unit: '个', specification: 'SHXBP08', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD607', code: 'SN1182', name: '铜球阀', categoryId: 'CAT002', unit: '个', specification: 'DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD608', code: 'SN1183', name: '闸阀', categoryId: 'CAT002', unit: '个', specification: 'DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD609', code: 'SN1184', name: '闸阀', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD610', code: 'SN1185', name: '闸阀', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD611', code: 'SN1186', name: '闸阀', categoryId: 'CAT002', unit: '个', specification: 'DN50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD612', code: 'SN1187', name: '闸阀', categoryId: 'CAT002', unit: '个', specification: 'DN65', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD613', code: 'SN1188', name: '压力表排气三通阀', categoryId: 'CAT002', unit: '个', specification: 'DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD614', code: 'SN1190', name: '卫生间指示锁', categoryId: 'CAT002', unit: '个', specification: '两个螺栓孔距4cm-5.5cm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD615', code: 'SN1192', name: '不锈钢内丝直接', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD616', code: 'SN1193', name: '不锈钢外丝三通', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD617', code: 'SN1194', name: '不锈钢外丝三通', categoryId: 'CAT002', unit: '个', specification: '不锈钢DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD618', code: 'SN1198', name: '钢头', categoryId: 'CAT002', unit: '个', specification: '60#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD619', code: 'SN1199', name: '钢头', categoryId: 'CAT002', unit: '个', specification: '90#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD620', code: 'SN1204', name: '稀释剂', categoryId: 'CAT002', unit: '桶', specification: '10KG', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD621', code: 'SN1207', name: '滚筒刷', categoryId: 'CAT002', unit: '个', specification: '9#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD622', code: 'SN1219', name: 'PPR弯头', categoryId: 'CAT002', unit: '个', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD623', code: 'SN1220', name: 'PPR弯头', categoryId: 'CAT002', unit: '个', specification: '20#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD624', code: 'SN1221', name: 'PE弯头', categoryId: 'CAT002', unit: '个', specification: '黑32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD625', code: 'QD1668', name: '热缩管', categoryId: 'CAT002', unit: '卷', specification: 'φ100MM 25米/卷', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD626', code: 'SN1230', name: '夹持扳手', categoryId: 'CAT002', unit: '个', specification: '30-60', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD627', code: 'SN1237', name: 'PPR管', categoryId: 'CAT002', unit: '根', specification: 'DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD628', code: 'SN1239', name: 'PPR直接', categoryId: 'CAT002', unit: '个', specification: 'DN40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD629', code: 'SN1240', name: 'PPR直接', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD630', code: 'SN1241', name: 'PPR直接', categoryId: 'CAT002', unit: '个', specification: 'DN20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD631', code: 'SN1242', name: 'PPR大小头', categoryId: 'CAT002', unit: '个', specification: 'PPR 63*50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD632', code: 'SN1243', name: 'PPR大小头', categoryId: 'CAT002', unit: '个', specification: 'PPR 50*32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD633', code: 'SN1244', name: 'PE直接', categoryId: 'CAT002', unit: '个', specification: '黑DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD634', code: 'SN1245', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '63*25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD635', code: 'SN1246', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '50*20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD636', code: 'SN1247', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '40*32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD637', code: 'SN1248', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '32*25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD638', code: 'SN1249', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '32*20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD639', code: 'SN1250', name: 'PPR异径三通', categoryId: 'CAT002', unit: '个', specification: '25*20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD640', code: 'SN1252', name: 'PPR三通', categoryId: 'CAT002', unit: '个', specification: '63#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD641', code: 'SN1253', name: 'PPR三通', categoryId: 'CAT002', unit: '个', specification: '50#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD642', code: 'SN1254', name: 'PPR三通', categoryId: 'CAT002', unit: '个', specification: '40#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD643', code: 'SN1255', name: 'PPR三通', categoryId: 'CAT002', unit: '个', specification: '25#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD644', code: 'SN1256', name: 'PPR三通', categoryId: 'CAT002', unit: '个', specification: '20#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD645', code: 'SN1259', name: '手柄盖', categoryId: 'CAT002', unit: '个', specification: 'DHZ06V6', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD646', code: 'SN1260', name: '套筒', categoryId: 'CAT002', unit: '个', specification: 'D9B019Y', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD647', code: 'SN1261', name: '固定夹', categoryId: 'CAT002', unit: '个', specification: 'SHXBK35', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD648', code: 'SN1262', name: '止回轮', categoryId: 'CAT002', unit: '个', specification: 'SHXBP19', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD649', code: 'SN1263', name: '感应式小便冲洗阀', categoryId: 'CAT002', unit: '个', specification: 'DUE114VPK', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD650', code: 'SN1265', name: '止回阀', categoryId: 'CAT002', unit: '个', specification: 'H44T-100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD651', code: 'SN1266', name: '橡胶软接头', categoryId: 'CAT002', unit: '个', specification: 'H44T-100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD652', code: 'SN1267', name: '电子浮球阀', categoryId: 'CAT002', unit: '个', specification: '8米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD653', code: 'SN1268', name: '电子浮球阀', categoryId: 'CAT002', unit: '个', specification: '10米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD654', code: 'SN1269', name: '电子浮球阀', categoryId: 'CAT002', unit: '个', specification: '15米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD655', code: 'SN1272', name: '金属编织下水软管', categoryId: 'CAT002', unit: '根', specification: '1米/根', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD656', code: 'SN1274', name: '圆规', categoryId: 'CAT002', unit: '个', specification: '75CM', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD657', code: 'SN1275', name: '卡箍', categoryId: 'CAT002', unit: '个', specification: 'DN100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD658', code: 'SN1280', name: '大便冲洗阀', categoryId: 'CAT002', unit: '个', specification: 'DC603VFR', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD659', code: 'SN1281', name: '座便盖', categoryId: 'CAT002', unit: '个', specification: 'TC388CVK', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD660', code: 'SN1282', name: '七字弯管', categoryId: 'CAT002', unit: '个', specification: 'D4A038SY', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD661', code: 'SN1283', name: '坐便器排水阀', categoryId: 'CAT002', unit: '个', specification: 'BH324', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD662', code: 'SN1284', name: '连杆', categoryId: 'CAT002', unit: '个', specification: 'B3401P', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD663', code: 'SN1285', name: '马桶按钮', categoryId: 'CAT002', unit: '个', specification: 'BH417', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD664', code: 'SN1286', name: 'Z-密封圈', categoryId: 'CAT002', unit: '个', specification: '座便器用', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD665', code: 'SN1287', name: '水箱盖板', categoryId: 'CAT002', unit: '个', specification: 'SW781CRB', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD666', code: 'SN1288', name: 'PPR内丝直接', categoryId: 'CAT002', unit: '个', specification: '32#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD667', code: 'SN1289', name: '拖把池下水', categoryId: 'CAT002', unit: '个', specification: 'DN60含排水管', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD668', code: 'SN1290', name: '拖把池下水', categoryId: 'CAT002', unit: '个', specification: 'DN90含排水管', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD669', code: 'SN1296', name: 'PPR弯头', categoryId: 'CAT002', unit: '个', specification: '63#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD670', code: 'SN1302', name: '排气扇', categoryId: 'CAT002', unit: '个', specification: '12寸', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD671', code: 'SN1303', name: '电熔法兰头', categoryId: 'CAT002', unit: '个', specification: 'DN100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD672', code: 'SN1304', name: '电熔法兰头', categoryId: 'CAT002', unit: '个', specification: 'DN150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD673', code: 'SN1305', name: '水表', categoryId: 'CAT002', unit: '个', specification: 'DN100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD674', code: 'SN1306', name: '水表', categoryId: 'CAT002', unit: '个', specification: 'DN150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD675', code: 'SN1307', name: '线管', categoryId: 'CAT002', unit: '根', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD676', code: 'SN1308', name: 'PVC弯头', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD677', code: 'SN1309', name: 'PVC直接', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD678', code: 'SN1310', name: 'PVC管卡', categoryId: 'CAT002', unit: '包', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD679', code: 'SN1311', name: '杯索', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD680', code: 'SN1312', name: 'PVC管', categoryId: 'CAT002', unit: '根', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD681', code: 'SN1318', name: 'PVC大小头', categoryId: 'CAT002', unit: '个', specification: 'PVC 50*25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD682', code: 'SN1319', name: 'PVC大小头', categoryId: 'CAT002', unit: '个', specification: 'PVC 50*32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD683', code: 'SN1320', name: '伸缩节', categoryId: 'CAT002', unit: '个', specification: 'DN50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD684', code: 'SN1321', name: '伸缩节', categoryId: 'CAT002', unit: '个', specification: 'DN75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD685', code: 'SN1322', name: '伸缩节', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD686', code: 'SN1323', name: 'PVC堵头', categoryId: 'CAT002', unit: '个', specification: 'PVC DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD687', code: 'SN1324', name: 'PVC堵头', categoryId: 'CAT002', unit: '个', specification: 'PVC DN50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD688', code: 'SN1325', name: 'PVC堵头', categoryId: 'CAT002', unit: '个', specification: 'DN75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD689', code: 'SN1326', name: 'PVC堵头', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD690', code: 'SN1327', name: 'PVC管清扫口', categoryId: 'CAT002', unit: '个', specification: 'DN50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD691', code: 'SN1328', name: 'PVC管清扫口', categoryId: 'CAT002', unit: '个', specification: 'DN75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD692', code: 'SN1329', name: 'PVC管清扫口', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD693', code: 'SN1330', name: '管卡', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD694', code: 'SN1331', name: '闸阀', categoryId: 'CAT002', unit: '个', specification: 'DN100', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD695', code: 'SN1332', name: 'PPR堵头', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD696', code: 'SN1333', name: 'PPR堵头', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD697', code: 'SN1334', name: 'PPR堵头', categoryId: 'CAT002', unit: '个', specification: 'DN40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD698', code: 'SN1335', name: 'PPR堵头', categoryId: 'CAT002', unit: '个', specification: 'DN50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD699', code: 'SN1336', name: 'PPR堵头', categoryId: 'CAT002', unit: '个', specification: 'DN63', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD700', code: 'SN1337', name: 'PPR阀门', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD701', code: 'SN1338', name: 'PPR阀门', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD702', code: 'SN1339', name: 'PPR阀门', categoryId: 'CAT002', unit: '个', specification: 'DN40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD703', code: 'SN1341', name: 'PPR阀门', categoryId: 'CAT002', unit: '个', specification: 'DN63', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD704', code: 'SN1342', name: 'PPR直接', categoryId: 'CAT002', unit: '个', specification: 'DN32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD705', code: 'SN1343', name: 'PPR内丝直接', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD706', code: 'SN1344', name: 'PPR内丝弯头', categoryId: 'CAT002', unit: '个', specification: 'DN25', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD707', code: 'SN1353', name: '复位开关', categoryId: 'CAT002', unit: '个', specification: '红色/绿色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD708', code: 'SN1354', name: '急停开关', categoryId: 'CAT002', unit: '个', specification: '红色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD709', code: 'SN1355', name: '复位开关带灯', categoryId: 'CAT002', unit: '个', specification: '红色/绿色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD710', code: 'SN1357', name: '蝶阀', categoryId: 'CAT002', unit: '个', specification: 'DN125', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD711', code: 'SN1358', name: '蝶阀', categoryId: 'CAT002', unit: '个', specification: 'DN150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD712', code: 'SN1359', name: '蝶阀', categoryId: 'CAT002', unit: '个', specification: 'DN200', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD713', code: 'QD1669', name: '热缩管', categoryId: 'CAT002', unit: '卷', specification: 'φ120MM 25米/卷', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD714', code: 'QD1674', name: 'D型开关', categoryId: 'CAT002', unit: '个', specification: '1P/40A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD715', code: 'SN1363', name: '橡胶软接头', categoryId: 'CAT002', unit: '个', specification: 'DN65', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD716', code: 'SN1365', name: '盲板', categoryId: 'CAT002', unit: '块', specification: 'DN100卡箍含堵头', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD717', code: 'SN1368', name: '望远镜', categoryId: 'CAT002', unit: '个', specification: '千里鹰', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD718', code: 'SN1369', name: '防爆开关', categoryId: 'CAT002', unit: '个', specification: '220V/10A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD719', code: 'SN1370', name: '小体球阀', categoryId: 'CAT002', unit: '个', specification: '黄铜DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD720', code: 'SN1373', name: '镀锌管', categoryId: 'CAT002', unit: '根', specification: 'DN15', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD721', code: 'SN1383', name: '热保护器', categoryId: 'CAT002', unit: '个', specification: '380V-LRF08N', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD722', code: 'SN1384', name: '交流接触器', categoryId: 'CAT002', unit: '个', specification: '施耐德LADN22C', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD723', code: 'SN1385', name: '开关', categoryId: 'CAT002', unit: '个', specification: '施耐德380V D10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD724', code: 'SN1386', name: '保险', categoryId: 'CAT002', unit: '个', specification: 'RT28AI-32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD725', code: 'SN1388', name: '管束卡箍', categoryId: 'CAT002', unit: '个', specification: 'DN100/DN110/DN160', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD726', code: 'SN1396', name: 'PE焊丝', categoryId: 'CAT002', unit: '包', specification: '黑色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD727', code: 'SN1397', name: 'PE焊丝', categoryId: 'CAT002', unit: '包', specification: '白色', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD728', code: 'SN1398', name: 'PVC排水管', categoryId: 'CAT002', unit: '根', specification: '110mm*4m*2.8mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD729', code: 'SN1400', name: 'PVC弯头', categoryId: 'CAT002', unit: '个', specification: '40#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD730', code: 'SN1402', name: 'PVC直接', categoryId: 'CAT002', unit: '个', specification: '40*32', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD731', code: 'SN1403', name: 'PVC管', categoryId: 'CAT002', unit: '米', specification: '40#', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD732', code: 'SN1404', name: 'PVC大小头', categoryId: 'CAT002', unit: '个', specification: '50*40', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD733', code: 'SN1408', name: '热熔焊机', categoryId: 'CAT002', unit: '台', specification: '20*400', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD734', code: 'SN1409', name: '变压器', categoryId: 'CAT002', unit: '个', specification: '220V/24V得力西', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD735', code: 'SN1414', name: 'PE管卡', categoryId: 'CAT002', unit: '个', specification: 'DN75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD736', code: 'SN1415', name: 'PE管卡', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD737', code: 'SN1416', name: 'PE堵头', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD738', code: 'SN1418', name: '洗手盆下水器', categoryId: 'CAT002', unit: '个', specification: '弹跳式面盆下水器', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD739', code: 'SN1420', name: '法兰波纹管', categoryId: 'CAT002', unit: '个', specification: 'DN65', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD740', code: 'SN1421', name: '空气开关', categoryId: 'CAT002', unit: '个', specification: 'D10', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD741', code: 'SN1422', name: '热保护器', categoryId: 'CAT002', unit: '个', specification: '2.5-4A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD742', code: 'SN1423', name: '交流接触器', categoryId: 'CAT002', unit: '个', specification: 'LCIE0910', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD743', code: 'SN1424', name: '继电器底座', categoryId: 'CAT002', unit: '个', specification: '14脚', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD744', code: 'SN1425', name: '变压器控制器', categoryId: 'CAT002', unit: '个', specification: '正泰220转36V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD745', code: 'SN1426', name: 'PE管抱箍', categoryId: 'CAT002', unit: '个', specification: '160*300', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD746', code: 'SN1429', name: '编织袋', categoryId: 'CAT002', unit: '个', specification: '90*110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD747', code: 'SN1431', name: '交流接触器', categoryId: 'CAT002', unit: '个', specification: '正泰380V/CJW2-2510', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD748', code: 'SN1434', name: '接触器', categoryId: 'CAT002', unit: '个', specification: '正泰NCX-09', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD749', code: 'SN1435', name: '电流互感器', categoryId: 'CAT002', unit: '个', specification: '100/5A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD750', code: 'QD1676', name: '郁金香触头', categoryId: 'CAT002', unit: '个', specification: '10KV/630A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD751', code: 'SN1438', name: 'PVC变径直接', categoryId: 'CAT002', unit: '个', specification: '110*50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD752', code: 'SN1439', name: 'PVC变径直接', categoryId: 'CAT002', unit: '个', specification: '110*75', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD753', code: 'SN1440', name: 'PVC弯头', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD754', code: 'SN1441', name: 'PVC三通', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD755', code: 'SN1442', name: 'PVC管卡', categoryId: 'CAT002', unit: '个', specification: 'DN110', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD756', code: 'SN1448', name: '面板总成', categoryId: 'CAT002', unit: '个', specification: 'DELLE114', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD757', code: 'SN1452', name: 'PE直接', categoryId: 'CAT002', unit: '个', specification: 'DN63', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD758', code: 'SN1453', name: 'PE弯头', categoryId: 'CAT002', unit: '个', specification: 'DN63', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD759', code: 'SN1463', name: '哈夫节抱箍', categoryId: 'CAT002', unit: '个', specification: '160*20', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD760', code: 'SN1464', name: 'PE管卡', categoryId: 'CAT002', unit: '个', specification: 'DN50', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD761', code: 'SN1469', name: '下水管组件', categoryId: 'CAT002', unit: '套', specification: '304不锈钢，单槽60cm下水管，110下水器', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD762', code: 'QD1681', name: '配电柜锁', categoryId: 'CAT002', unit: '个', specification: 'MS308-3锌合金', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD763', code: 'SN1480', name: '不锈钢哈夫节管道修补器', categoryId: 'CAT002', unit: '个', specification: 'DN65', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD764', code: 'SN1491', name: '马桶进水阀', categoryId: 'CAT002', unit: '个', specification: '通用型，4分接口', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD765', code: 'SN1503', name: '闸阀阀板', categoryId: 'CAT002', unit: '个', specification: 'DN300/DN200/DN150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD766', code: 'SN1510', name: '消防栓转接变径', categoryId: 'CAT002', unit: '个', specification: '异径接口 50转25MM', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD767', code: 'SN1519', name: '金属软连接', categoryId: 'CAT002', unit: '个', specification: 'DN150', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD768', code: 'SN1521', name: 'pvc直接', categoryId: 'CAT002', unit: '个', specification: '110mm*4.8mm', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD769', code: 'XF1003', name: '室外消火栓', categoryId: 'CAT002', unit: '个', specification: 'DN100室外栓', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  // 新增展会物资（电缆类）
  { id: 'PRD770', code: 'QD2001', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '6㎡（单线63A头/15米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD771', code: 'QD2002', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '6㎡（单线125A头/15米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD772', code: 'QD2003', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '4㎡（单线32A头/15米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD773', code: 'QD2004', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '16㎡（无头/15米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD774', code: 'QD2005', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '4㎡3芯/16A/10米（16A电箱）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD775', code: 'QD2006', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '4㎡3芯（无头/20米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD776', code: 'QD2007', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '25㎡（无头带铜鼻子/20米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD777', code: 'QD2008', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '16㎡（无头带铜鼻子/20米长）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD778', code: 'QD2009', name: '电缆', categoryId: 'CAT002', unit: '根', specification: '4㎡（无头/85米长）（3芯）', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  // 新增展会物资（配电箱类）
  { id: 'PRD779', code: 'QD2010', name: '配电箱', categoryId: 'CAT002', unit: '个', specification: '16A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD780', code: 'QD2011', name: '配电箱', categoryId: 'CAT002', unit: '个', specification: '32A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD781', code: 'QD2012', name: '配电箱', categoryId: 'CAT002', unit: '个', specification: '63A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD782', code: 'QD2013', name: '配电箱', categoryId: 'CAT002', unit: '个', specification: '40A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD783', code: 'QD2014', name: '配电箱', categoryId: 'CAT002', unit: '个', specification: '16A/220V', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD784', code: 'QD2015', name: '配电箱', categoryId: 'CAT002', unit: '个', specification: '100A', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  // 新增展会物资（吊装类）
  { id: 'PRD785', code: 'QD2016', name: '手拉吊葫芦', categoryId: 'CAT002', unit: '个', specification: '1T/12米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD786', code: 'QD2017', name: '黑色吊带（蓝色头）', categoryId: 'CAT002', unit: '根', specification: '2T/2米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD787', code: 'QD2018', name: '黑色吊带（红色头）', categoryId: 'CAT002', unit: '根', specification: '2T/4米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' },
  { id: 'PRD788', code: 'QD2019', name: '黑色吊带（绿色头）', categoryId: 'CAT002', unit: '根', specification: '2T/8米', brand: '', origin: '', material: '', stockQuantity: 0, isContractItem: false, status: 'enabled' }
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

// 实施项目数据
export const implementationProjects: Project[] = [
  { id: 'IMP001', projectNo: 'SSXM2024001', projectName: '深圳国际会展中心展厅搭建项目', type: 'implementation', status: 'enabled', updater: '张三', updateTime: '2024-06-15 10:30:00', createTime: '2024-06-01 09:00:00', creator: '张三', remark: '2024年度重点实施项目' },
  { id: 'IMP002', projectNo: 'SSXM2024002', projectName: '广州广交会展览设备安装项目', type: 'implementation', status: 'enabled', updater: '李四', updateTime: '2024-06-10 14:20:00', createTime: '2024-05-20 08:30:00', creator: '李四', remark: '' },
  { id: 'IMP003', projectNo: 'SSXM2024003', projectName: '上海进博会临时展台搭建项目', type: 'implementation', status: 'enabled', updater: '王五', updateTime: '2024-06-18 16:45:00', createTime: '2024-06-05 11:00:00', creator: '王五', remark: '紧急项目' },
  { id: 'IMP004', projectNo: 'SSXM2024004', projectName: '北京国际汽车展展台搭建项目', type: 'implementation', status: 'disabled', updater: '赵六', updateTime: '2024-05-28 09:15:00', createTime: '2024-04-15 10:00:00', creator: '赵六', remark: '已完成' },
];

// 服务项目数据
export const serviceProjects: Project[] = [
  { id: 'SVC001', projectNo: 'FWXM2024001', projectName: '展会设备年度维护服务', type: 'service', status: 'enabled', updater: '张三', updateTime: '2024-06-12 11:20:00', createTime: '2024-01-05 09:30:00', creator: '张三', remark: '年度服务合同' },
  { id: 'SVC002', projectNo: 'FWXM2024002', projectName: '展具租赁及安装拆卸服务', type: 'service', status: 'enabled', updater: '李四', updateTime: '2024-06-08 15:40:00', createTime: '2024-03-10 14:00:00', creator: '李四', remark: '' },
  { id: 'SVC003', projectNo: 'FWXM2024003', projectName: '展览展示设计咨询服务', type: 'service', status: 'enabled', updater: '王五', updateTime: '2024-06-16 10:00:00', createTime: '2024-05-25 08:00:00', creator: '王五', remark: '新签约客户' },
  { id: 'SVC004', projectNo: 'FWXM2024004', projectName: '展台物流运输服务', type: 'service', status: 'disabled', updater: '孙七', updateTime: '2024-05-30 17:30:00', createTime: '2024-02-20 10:30:00', creator: '孙七', remark: '服务终止' },
];

// 所有项目（实施+服务）
export const projects: Project[] = [...implementationProjects, ...serviceProjects];

// 采购合同数据
export const contracts: Contract[] = [
  { id: 'CT001', contractNo: 'HT20240101001', contractName: '2024年度会展物资采购合同', supplierId: 'SUP001', supplierName: '华东钢材有限公司', type: 'purchase', amount: 500000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', operator: '张三', createTime: '2024-01-01 09:00:00' },
  { id: 'CT002', contractNo: 'HT20240301001', contractName: '固定资产设备采购合同', supplierId: 'SUP002', supplierName: '华北铝业集团', type: 'purchase', amount: 800000, startDate: '2024-03-01', endDate: '2024-09-30', status: 'active', operator: '李四', createTime: '2024-03-01 10:00:00' },
  { id: 'CT003', contractNo: 'HT20230601001', contractName: '2023年度办公用品采购合同', supplierId: 'SUP003', supplierName: '五金配件批发中心', type: 'purchase', amount: 150000, startDate: '2023-06-01', endDate: '2024-05-31', status: 'expired', operator: '王五', createTime: '2023-06-01 08:30:00' },
  { id: 'CT004', contractNo: 'HT20240501001', contractName: '2024年下半年办公耗材采购合同', supplierId: 'SUP004', supplierName: '南方办公设备有限公司', type: 'purchase', amount: 200000, startDate: '2024-05-01', endDate: '2025-04-30', status: 'active', operator: '王五', createTime: '2024-05-01 09:30:00' },
  { id: 'CT005', contractNo: 'HT20240615001', contractName: '2024年第三季度音响设备维护服务合同', supplierId: 'SUP005', supplierName: '东方电子科技', type: 'service', amount: 120000, startDate: '2024-06-15', endDate: '2024-12-15', status: 'active', operator: '赵六', createTime: '2024-06-15 10:00:00' },
  { id: 'CT006', contractNo: 'HT20240701001', contractName: '2024年展具租赁合同', supplierId: 'SUP006', supplierName: '展艺文化传媒', type: 'lease', amount: 350000, startDate: '2024-07-01', endDate: '2024-12-31', status: 'active', operator: '孙七', createTime: '2024-07-01 08:00:00' },
  { id: 'CT007', contractNo: 'HT20240801001', contractName: '清洁用品年度采购协议', supplierId: 'SUP007', supplierName: '洁安环保科技有限公司', type: 'purchase', amount: 80000, startDate: '2024-08-01', endDate: '2025-07-31', status: 'active', operator: '周八', createTime: '2024-08-01 11:00:00' },
  { id: 'CT008', contractNo: 'HT20241001001', contractName: '工具设备采购合同', supplierId: 'SUP008', supplierName: '德国博世授权经销商', type: 'purchase', amount: 180000, startDate: '2024-10-01', endDate: '2025-09-30', status: 'active', operator: '吴九', createTime: '2024-10-01 14:00:00' },
  { id: 'CT009', contractNo: 'HT20241101001', contractName: '灯具及照明设备采购合同', supplierId: 'SUP009', supplierName: '欧普照明股份有限公司', type: 'purchase', amount: 250000, startDate: '2024-11-01', endDate: '2025-10-31', status: 'active', operator: '郑十', createTime: '2024-11-01 09:00:00' },
  { id: 'CT010', contractNo: 'HT20250101001', contractName: '2025年度展板展架采购合同', supplierId: 'SUP001', supplierName: '华东钢材有限公司', type: 'purchase', amount: 600000, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', operator: '张三', createTime: '2025-01-01 09:00:00' },
  { id: 'CT011', contractNo: 'HT20250601001', contractName: '2025年电脑及办公设备采购合同', supplierId: 'SUP010', supplierName: '联想集团华东区代理', type: 'purchase', amount: 450000, startDate: '2025-06-01', endDate: '2026-05-31', status: 'active', operator: '李四', createTime: '2025-06-01 10:00:00' },
  { id: 'CT012', contractNo: 'HT20260101001', contractName: '2026年度空调系统采购合同', supplierId: 'SUP011', supplierName: '格力电器股份有限公司', type: 'purchase', amount: 380000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', operator: '王五', createTime: '2026-01-01 09:00:00' },
  { id: 'CT013', contractNo: 'HT20260301001', contractName: '2026年投影设备维保服务合同', supplierId: 'SUP012', supplierName: '爱普生中国授权服务商', type: 'service', amount: 80000, startDate: '2026-03-01', endDate: '2027-02-28', status: 'active', operator: '赵六', createTime: '2026-03-01 14:00:00' },
  { id: 'CT014', contractNo: 'HT20260501001', contractName: '2026年办公耗材集中采购合同', supplierId: 'SUP004', supplierName: '南方办公设备有限公司', type: 'purchase', amount: 180000, startDate: '2026-05-01', endDate: '2027-04-30', status: 'active', operator: '孙七', createTime: '2026-05-01 11:00:00' },
  { id: 'CT015', contractNo: 'HT20260601001', contractName: '2026年下半年清洁用品采购合同', supplierId: 'SUP007', supplierName: '洁安环保科技有限公司', type: 'purchase', amount: 60000, startDate: '2026-06-01', endDate: '2026-12-31', status: 'active', operator: '周八', createTime: '2026-06-01 10:00:00' },
];

// 物料合同关联数据
export const productContracts: ProductContract[] = [
  { id: 'PC001', productId: 'PRD001', contractId: 'CT010', contractNo: 'HT20250101001', contractName: '2025年度展板展架采购合同', unitPrice: 248.6, taxRate: 13, quantity: 500, isContractItem: true },
  { id: 'PC002', productId: 'PRD002', contractId: 'CT010', contractNo: 'HT20250101001', contractName: '2025年度展板展架采购合同', unitPrice: 734.5, taxRate: 13, quantity: 200, isContractItem: true },
  { id: 'PC003', productId: 'PRD004', contractId: 'CT010', contractNo: 'HT20250101001', contractName: '2025年度展板展架采购合同', unitPrice: 1830, taxRate: 13, quantity: 100, isContractItem: true },
  { id: 'PC004', productId: 'PRD006', contractId: 'CT012', contractNo: 'HT20260101001', contractName: '2026年度空调系统采购合同', unitPrice: 5876, taxRate: 13, quantity: 25, isContractItem: true },
  { id: 'PC005', productId: 'PRD007', contractId: 'CT013', contractNo: 'HT20260301001', contractName: '2026年投影设备维保服务合同', unitPrice: 6215, taxRate: 6, quantity: 12, isContractItem: true },
  { id: 'PC006', productId: 'PRD009', contractId: 'CT011', contractNo: 'HT20250601001', contractName: '2025年电脑及办公设备采购合同', unitPrice: 9605, taxRate: 13, quantity: 30, isContractItem: true },
  { id: 'PC007', productId: 'PRD011', contractId: 'CT014', contractNo: 'HT20260501001', contractName: '2026年办公耗材集中采购合同', unitPrice: 54.24, taxRate: 13, quantity: 1000, isContractItem: true },
];

// 采购单数据
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO001',
    orderNo: 'PO20240601001',
    supplierId: 'SUP001',
    supplierName: '华东钢材有限公司',
    status: 'pending',
    totalAmount: 50000,
    operator: '张三',
    createTime: '2024-06-01 08:00:00',
    expectedDate: '2024-06-15',
    remark: '会展项目首批采购',
    details: [
      { id: 'POD001', purchaseOrderId: 'PO001', productId: 'PRD001', productName: '展板', productCode: 'P10001', specification: '1m*2m', unit: '块', quantity: 100, receivedQuantity: 0, unitPrice: 200, totalPrice: 20000 },
      { id: 'POD002', purchaseOrderId: 'PO001', productId: 'PRD002', productName: '展架', productCode: 'P10002', specification: '铝合金', unit: '套', quantity: 50, receivedQuantity: 0, unitPrice: 600, totalPrice: 30000 },
    ]
  },
  {
    id: 'PO002',
    orderNo: 'PO20240602001',
    supplierId: 'SUP002',
    supplierName: '华北铝业集团',
    status: 'partial',
    totalAmount: 80000,
    operator: '李四',
    createTime: '2024-06-02 09:00:00',
    expectedDate: '2024-06-20',
    remark: '固定资产采购',
    details: [
      { id: 'POD003', purchaseOrderId: 'PO002', productId: 'PRD006', productName: '空调', productCode: 'P20001', specification: '3匹', unit: '台', quantity: 10, receivedQuantity: 5, unitPrice: 5000, totalPrice: 50000 },
      { id: 'POD004', purchaseOrderId: 'PO002', productId: 'PRD007', productName: '投影仪', productCode: 'P20002', specification: '高清', unit: '台', quantity: 6, receivedQuantity: 0, unitPrice: 5000, totalPrice: 30000 },
    ]
  },
  {
    id: 'PO003',
    orderNo: 'PO20240603001',
    supplierId: 'SUP003',
    supplierName: '五金配件批发中心',
    status: 'completed',
    totalAmount: 15000,
    operator: '王五',
    createTime: '2024-06-03 10:00:00',
    expectedDate: '2024-06-10',
    remark: '低值易耗采购',
    details: [
      { id: 'POD005', purchaseOrderId: 'PO003', productId: 'PRD010', productName: '清洁用品', productCode: 'P30001', specification: '套装', unit: '箱', quantity: 50, receivedQuantity: 50, unitPrice: 100, totalPrice: 5000 },
      { id: 'POD006', purchaseOrderId: 'PO003', productId: 'PRD011', productName: '办公用品', productCode: 'P30002', specification: 'A4纸', unit: '包', quantity: 100, receivedQuantity: 100, unitPrice: 50, totalPrice: 5000 },
      { id: 'POD007', purchaseOrderId: 'PO003', productId: 'PRD012', productName: '工具套装', productCode: 'P30003', specification: '维修用', unit: '套', quantity: 10, receivedQuantity: 10, unitPrice: 500, totalPrice: 5000 },
    ]
  },
  {
    id: 'PO007',
    orderNo: 'PO20240625001',
    supplierId: 'SUP001',
    supplierName: '华东钢材有限公司',
    status: 'pending',
    totalAmount: 570000,
    operator: '张三',
    createTime: '2024-06-25 10:00:00',
    expectedDate: '2024-07-10',
    remark: '展会物资采购订单（新物资测试）',
    relatedDemandId: 'PA005',
    details: [
      { id: 'POD027', purchaseOrderId: 'PO007', productId: 'PRD770', productName: '电缆', productCode: 'QD2001', specification: '6㎡（单线63A头/15米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 150, totalPrice: 15000 },
      { id: 'POD028', purchaseOrderId: 'PO007', productId: 'PRD771', productName: '电缆', productCode: 'QD2002', specification: '6㎡（单线125A头/15米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 180, totalPrice: 18000 },
      { id: 'POD029', purchaseOrderId: 'PO007', productId: 'PRD772', productName: '电缆', productCode: 'QD2003', specification: '4㎡（单线32A头/15米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 120, totalPrice: 12000 },
      { id: 'POD030', purchaseOrderId: 'PO007', productId: 'PRD773', productName: '电缆', productCode: 'QD2004', specification: '16㎡（无头/15米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 300, totalPrice: 30000 },
      { id: 'POD031', purchaseOrderId: 'PO007', productId: 'PRD774', productName: '电缆', productCode: 'QD2005', specification: '4㎡3芯/16A/10米（16A电箱）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 200, totalPrice: 20000 },
      { id: 'POD032', purchaseOrderId: 'PO007', productId: 'PRD775', productName: '电缆', productCode: 'QD2006', specification: '4㎡3芯（无头/20米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 220, totalPrice: 22000 },
      { id: 'POD033', purchaseOrderId: 'PO007', productId: 'PRD776', productName: '电缆', productCode: 'QD2007', specification: '25㎡（无头带铜鼻子/20米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 400, totalPrice: 40000 },
      { id: 'POD034', purchaseOrderId: 'PO007', productId: 'PRD777', productName: '电缆', productCode: 'QD2008', specification: '16㎡（无头带铜鼻子/20米长）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 350, totalPrice: 35000 },
      { id: 'POD035', purchaseOrderId: 'PO007', productId: 'PRD778', productName: '电缆', productCode: 'QD2009', specification: '4㎡（无头/85米长）（3芯）', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 280, totalPrice: 28000 },
      { id: 'POD036', purchaseOrderId: 'PO007', productId: 'PRD779', productName: '配电箱', productCode: 'QD2010', specification: '16A', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 200, totalPrice: 20000 },
      { id: 'POD037', purchaseOrderId: 'PO007', productId: 'PRD780', productName: '配电箱', productCode: 'QD2011', specification: '32A', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 250, totalPrice: 25000 },
      { id: 'POD038', purchaseOrderId: 'PO007', productId: 'PRD781', productName: '配电箱', productCode: 'QD2012', specification: '63A', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 400, totalPrice: 40000 },
      { id: 'POD039', purchaseOrderId: 'PO007', productId: 'PRD782', productName: '配电箱', productCode: 'QD2013', specification: '40A', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 280, totalPrice: 28000 },
      { id: 'POD040', purchaseOrderId: 'PO007', productId: 'PRD783', productName: '配电箱', productCode: 'QD2014', specification: '16A/220V', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 220, totalPrice: 22000 },
      { id: 'POD041', purchaseOrderId: 'PO007', productId: 'PRD784', productName: '配电箱', productCode: 'QD2015', specification: '100A', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 500, totalPrice: 50000 },
      { id: 'POD042', purchaseOrderId: 'PO007', productId: 'PRD785', productName: '手拉吊葫芦', productCode: 'QD2016', specification: '1T/12米', unit: '个', quantity: 100, receivedQuantity: 0, unitPrice: 800, totalPrice: 80000 },
      { id: 'POD043', purchaseOrderId: 'PO007', productId: 'PRD786', productName: '黑色吊带（蓝色头）', productCode: 'QD2017', specification: '2T/2米', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 50, totalPrice: 5000 },
      { id: 'POD044', purchaseOrderId: 'PO007', productId: 'PRD787', productName: '黑色吊带（红色头）', productCode: 'QD2018', specification: '2T/4米', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 60, totalPrice: 6000 },
      { id: 'POD045', purchaseOrderId: 'PO007', productId: 'PRD788', productName: '黑色吊带（绿色头）', productCode: 'QD2019', specification: '2T/8米', unit: '根', quantity: 100, receivedQuantity: 0, unitPrice: 80, totalPrice: 8000 },
    ]
  },
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
  // ===== 测试数据开始 =====
  {
    id: 'IN_TEST_1', orderNo: 'RK20260620001', type: 'purchase', supplierId: 'SUP001', supplierName: '华东建材有限公司',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '张三',
    custodian: '张三', personInCharge: '李四', inspector: '王五', salesperson: '赵六', creator: '孙七',
    createTime: '2026-06-20 08:10:00', approveTime: '2026-06-20 09:20:00', approver: '周八',
    remark: '测试入库单1-采购入库',
    details: [
      { id: 'IND_TEST_1_1', inboundOrderId: 'IN_TEST_1', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS001', positionName: 'A区01号', quantity: 50 },
      { id: 'IND_TEST_1_2', inboundOrderId: 'IN_TEST_1', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS001', positionName: 'A区01号', quantity: 25 },
    ]
  },
  {
    id: 'IN_TEST_2', orderNo: 'RK20260621002', type: 'purchase', supplierId: 'SUP002', supplierName: '华北石材集团',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'submitted', operator: '李四',
    custodian: '李四', personInCharge: '王五', inspector: '赵六', salesperson: '孙七', creator: '周八',
    createTime: '2026-06-21 09:15:00', approveTime: '2026-06-21 10:25:00', approver: '张三',
    remark: '测试入库单2-采购入库',
    details: [
      { id: 'IND_TEST_2_1', inboundOrderId: 'IN_TEST_2', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS007', positionName: 'C区02号', quantity: 60 },
      { id: 'IND_TEST_2_2', inboundOrderId: 'IN_TEST_2', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS007', positionName: 'C区02号', quantity: 30 },
    ]
  },
  {
    id: 'IN_TEST_3', orderNo: 'RK20260622003', type: 'purchase', supplierId: 'SUP003', supplierName: '南方五金制品厂',
    warehouseId: 'WH003', warehouseName: '固定资产仓', status: 'pending', operator: '王五',
    custodian: '王五', personInCharge: '赵六', inspector: '孙七', salesperson: '周八', creator: '张三',
    createTime: '2026-06-22 10:20:00',
    remark: '测试入库单3-待审核',
    details: [
      { id: 'IND_TEST_3_1', inboundOrderId: 'IN_TEST_3', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS010', positionName: 'E区01号', quantity: 70 },
      { id: 'IND_TEST_3_2', inboundOrderId: 'IN_TEST_3', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS010', positionName: 'E区01号', quantity: 35 },
    ]
  },
  {
    id: 'IN_TEST_4', orderNo: 'RK20260623004', type: 'production',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '赵六',
    custodian: '赵六', personInCharge: '孙七', inspector: '周八', salesperson: '', creator: '李四',
    createTime: '2026-06-23 11:25:00', approveTime: '2026-06-23 12:35:00', approver: '王五',
    remark: '测试入库单4-生产入库',
    details: [
      { id: 'IND_TEST_4_1', inboundOrderId: 'IN_TEST_4', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS002', positionName: 'A区02号', quantity: 80 },
      { id: 'IND_TEST_4_2', inboundOrderId: 'IN_TEST_4', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS002', positionName: 'A区02号', quantity: 40 },
    ]
  },
  {
    id: 'IN_TEST_5', orderNo: 'RK20260624005', type: 'return', supplierId: 'SUP001', supplierName: '华东建材有限公司',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'pending', operator: '孙七',
    custodian: '孙七', personInCharge: '周八', inspector: '张三', salesperson: '李四', creator: '王五',
    createTime: '2026-06-24 12:30:00',
    remark: '测试入库单5-退货入库',
    details: [
      { id: 'IND_TEST_5_1', inboundOrderId: 'IN_TEST_5', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS008', positionName: 'D区01号', quantity: 90 },
      { id: 'IND_TEST_5_2', inboundOrderId: 'IN_TEST_5', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS008', positionName: 'D区01号', quantity: 45 },
    ]
  },
  {
    id: 'IN_TEST_6', orderNo: 'RK20260625006', type: 'purchase', supplierId: 'SUP002', supplierName: '华北石材集团',
    warehouseId: 'WH003', warehouseName: '固定资产仓', status: 'submitted', operator: '周八',
    custodian: '周八', personInCharge: '张三', inspector: '李四', salesperson: '王五', creator: '赵六',
    createTime: '2026-06-25 13:35:00', approveTime: '2026-06-25 14:45:00', approver: '孙七',
    remark: '测试入库单6-采购入库',
    details: [
      { id: 'IND_TEST_6_1', inboundOrderId: 'IN_TEST_6', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS011', positionName: 'E区02号', quantity: 100 },
      { id: 'IND_TEST_6_2', inboundOrderId: 'IN_TEST_6', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS011', positionName: 'E区02号', quantity: 50 },
    ]
  },
  {
    id: 'IN_TEST_7', orderNo: 'RK20260626007', type: 'workorder',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '张三',
    custodian: '张三', personInCharge: '李四', inspector: '王五', salesperson: '', creator: '赵六',
    createTime: '2026-06-26 14:40:00', approveTime: '2026-06-26 15:50:00', approver: '周八',
    remark: '测试入库单7-工单入库',
    details: [
      { id: 'IND_TEST_7_1', inboundOrderId: 'IN_TEST_7', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS003', positionName: 'A区03号', quantity: 110 },
      { id: 'IND_TEST_7_2', inboundOrderId: 'IN_TEST_7', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS003', positionName: 'A区03号', quantity: 55 },
    ]
  },
  {
    id: 'IN_TEST_8', orderNo: 'RK20260627008', type: 'purchase', supplierId: 'SUP003', supplierName: '南方五金制品厂',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'submitted', operator: '李四',
    custodian: '李四', personInCharge: '王五', inspector: '赵六', salesperson: '孙七', creator: '周八',
    createTime: '2026-06-27 15:45:00', approveTime: '2026-06-27 16:55:00', approver: '张三',
    remark: '测试入库单8-采购入库',
    details: [
      { id: 'IND_TEST_8_1', inboundOrderId: 'IN_TEST_8', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS009', positionName: 'D区02号', quantity: 120 },
      { id: 'IND_TEST_8_2', inboundOrderId: 'IN_TEST_8', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS009', positionName: 'D区02号', quantity: 60 },
    ]
  },
  // ===== 测试数据结束 =====
];

// 入库申请单数据
export const inboundApplications: InboundApplication[] = [
  {
    id: 'INA001',
    applicationNo: 'RKSQ20240620001',
    applicant: '业务经理-王',
    applicantDept: '销售部',
    warehouseId: 'WH001',
    warehouseName: '主仓库',
    status: 'approved',
    createTime: '2024-06-20 09:00:00',
    approveTime: '2024-06-20 14:30:00',
    approver: '仓库主管-李',
    remark: '补充库存不足物资',
    details: [
      { id: 'INAD001', productId: 'PRD001', productName: '展板', productCode: 'P10001', specification: '1m*2m', unit: '块', quantity: 50 },
      { id: 'INAD002', productId: 'PRD002', productName: '展架', productCode: 'P10002', specification: '铝合金', unit: '套', quantity: 30 },
    ]
  },
  {
    id: 'INA002',
    applicationNo: 'RKSQ20240621001',
    applicant: '业务经理-赵',
    applicantDept: '采购部',
    warehouseId: 'WH002',
    warehouseName: '原材料仓库',
    status: 'pending',
    createTime: '2024-06-21 10:00:00',
    remark: '原材料急需补充',
    details: [
      { id: 'INAD003', productId: 'PRD003', productName: '铜线', productCode: 'P10003', specification: '加厚型', unit: '平方米', quantity: 200 },
    ]
  },
];

// 出库单数据
export const outboundOrders: OutboundOrder[] = [
  {
    id: 'OUT001', orderNo: 'LY20240601001', type: 'lowvalue', customerId: undefined, customerName: undefined,
    warehouseId: 'WH003', warehouseName: '成品仓库', status: 'submitted', operator: '王五',
    createTime: '2024-06-01 10:30:00', approveTime: '2024-06-01 11:00:00', approver: '李四',
    details: [
      { id: 'OUTD001', outboundOrderId: 'OUT001', productId: 'PRD006', productName: '电机整机', productCode: 'P30001', positionId: 'POS008', positionName: 'D区01号', quantity: 20 },
    ]
  },
  {
    id: 'OUT002', orderNo: 'LY20240602001', type: 'lowvalue', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    createTime: '2024-06-02 09:15:00', approveTime: '2024-06-02 09:45:00', approver: '李四',
    details: [
      { id: 'OUTD002', outboundOrderId: 'OUT002', productId: 'PRD003', productName: '铜线', productCode: 'P10003', positionId: 'POS006', positionName: 'C区01号', quantity: 400 },
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
  {
    id: 'OUT005', orderNo: 'LY20240605001', type: 'lowvalue', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    createTime: '2024-06-05 10:00:00', approveTime: '2024-06-05 10:30:00', approver: '李四',
    details: [
      { id: 'OUTD005', outboundOrderId: 'OUT005', productId: 'PRD001', productName: '展板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 30 },
      { id: 'OUTD006', outboundOrderId: 'OUT005', productId: 'PRD002', productName: '展架', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 20 },
    ]
  },
  {
    id: 'OUT006', orderNo: 'GD20240606001', type: 'exhibition', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '王五',
    createTime: '2024-06-06 11:00:00', approveTime: '2024-06-06 11:30:00', approver: '李四',
    details: [
      { id: 'OUTD007', outboundOrderId: 'OUT006', productId: 'PRD004', productName: '桌椅套装', productCode: 'P10004', positionId: 'POS003', positionName: 'A区03号', quantity: 50, workOrderId: 'WI2606010001', workOrderCode: 'WI2606010001', workOrderName: '电箱220V室内', isMain: true },
    ]
  },
  {
    id: 'OUT007', orderNo: 'LY20240607001', type: 'lowvalue', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '孙七',
    createTime: '2024-06-07 14:00:00', approveTime: '2024-06-07 14:30:00', approver: '李四',
    details: [
      { id: 'OUTD008', outboundOrderId: 'OUT007', productId: 'PRD001', productName: '展板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 25 },
      { id: 'OUTD009', outboundOrderId: 'OUT007', productId: 'PRD005', productName: '指示牌', productCode: 'P10005', positionId: 'POS005', positionName: 'B区02号', quantity: 40 },
    ]
  },
  {
    id: 'OUT008', orderNo: 'GD20240608001', type: 'exhibition', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '王五',
    createTime: '2024-06-08 09:00:00', approveTime: '2024-06-08 09:30:00', approver: '李四',
    details: [
      { id: 'OUTD010', outboundOrderId: 'OUT008', productId: 'PRD001', productName: '展板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 15, workOrderId: 'WI2606010002', workOrderCode: 'WI2606010002', workOrderName: '电箱220V室外', isMain: true },
      { id: 'OUTD011', outboundOrderId: 'OUT008', productId: 'PRD005', productName: '指示牌', productCode: 'P10005', positionId: 'POS005', positionName: 'B区02号', quantity: 20, workOrderId: 'WI2606010002', workOrderCode: 'WI2606010002', workOrderName: '电箱220V室外', isMain: false },
    ]
  },
  {
    id: 'OUT009', orderNo: 'LY20260615001', type: 'lowvalue', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '张三',
    createTime: '2026-06-15 10:00:00', approveTime: '2026-06-15 10:30:00', approver: '李四',
    details: [
      { id: 'OUTD012', outboundOrderId: 'OUT009', productId: 'PRD001', productName: '展板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 50 },
      { id: 'OUTD013', outboundOrderId: 'OUT009', productId: 'PRD002', productName: '展架', productCode: 'P10002', positionId: 'POS002', positionName: 'A区02号', quantity: 30 },
      { id: 'OUTD014', outboundOrderId: 'OUT009', productId: 'PRD004', productName: '桌椅套装', productCode: 'P10004', positionId: 'POS003', positionName: 'A区03号', quantity: 40 },
    ]
  },
  {
    id: 'OUT010', orderNo: 'GD20260616001', type: 'exhibition', customerId: undefined, customerName: undefined,
    warehouseId: 'WH001', warehouseName: '主仓库', status: 'submitted', operator: '王五',
    createTime: '2026-06-16 11:00:00', approveTime: '2026-06-16 11:30:00', approver: '李四',
    details: [
      { id: 'OUTD015', outboundOrderId: 'OUT010', productId: 'PRD001', productName: '展板', productCode: 'P10001', positionId: 'POS001', positionName: 'A区01号', quantity: 50, workOrderId: 'WI2606110003', workOrderCode: 'WI2606110003', workOrderName: '停车作业项', isMain: true },
      { id: 'OUTD016', outboundOrderId: 'OUT010', productId: 'PRD005', productName: '指示牌', productCode: 'P10005', positionId: 'POS005', positionName: 'B区02号', quantity: 30, workOrderId: 'WI2606110003', workOrderCode: 'WI2606110003', workOrderName: '停车作业项', isMain: false },
    ]
  },
  // ===== 测试数据开始 =====
  {
    id: 'OUT_TEST_1', orderNo: 'LY20260621001', type: 'lowvalue',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '张三',
    createTime: '2026-06-21 09:15:00', approveTime: '2026-06-21 10:30:00', approver: '李四',
    remark: '测试出库单1-低值易耗品领用',
    details: [
      { id: 'OUTD_TEST_1_1', outboundOrderId: 'OUT_TEST_1', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS001', positionName: 'A区01号', quantity: 20 },
      { id: 'OUTD_TEST_1_2', outboundOrderId: 'OUT_TEST_1', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS001', positionName: 'A区01号', quantity: 10 },
    ]
  },
  {
    id: 'OUT_TEST_2', orderNo: 'LY20260622002', type: 'lowvalue',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'pending', operator: '李四',
    createTime: '2026-06-22 10:20:00',
    remark: '测试出库单2-待审核',
    details: [
      { id: 'OUTD_TEST_2_1', outboundOrderId: 'OUT_TEST_2', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS007', positionName: 'C区02号', quantity: 25 },
      { id: 'OUTD_TEST_2_2', outboundOrderId: 'OUT_TEST_2', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS007', positionName: 'C区02号', quantity: 12 },
    ]
  },
  {
    id: 'OUT_TEST_3', orderNo: 'GD20260623003', type: 'exhibition',
    warehouseId: 'WH003', warehouseName: '固定资产仓', projectId: 'PRJ_TEST_001', projectName: '测试展会项目', status: 'submitted', operator: '王五',
    createTime: '2026-06-23 11:25:00', approveTime: '2026-06-23 12:40:00', approver: '赵六',
    remark: '测试出库单3-展会物资领用',
    details: [
      { id: 'OUTD_TEST_3_1', outboundOrderId: 'OUT_TEST_3', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS010', positionName: 'E区01号', quantity: 30, workOrderId: 'WI2606110002', workOrderCode: 'WI2606110002', workOrderName: '会议室-会议室延时业项', isMain: true },
      { id: 'OUTD_TEST_3_2', outboundOrderId: 'OUT_TEST_3', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS010', positionName: 'E区01号', quantity: 15, workOrderId: 'WI2606110002', workOrderCode: 'WI2606110002', workOrderName: '会议室-会议室延时业项', isMain: false },
    ]
  },
  {
    id: 'OUT_TEST_4', orderNo: 'CK20260624004', type: 'requisition',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '赵六',
    createTime: '2026-06-24 12:30:00', approveTime: '2026-06-24 13:50:00', approver: '孙七',
    remark: '测试出库单4-普通领料',
    details: [
      { id: 'OUTD_TEST_4_1', outboundOrderId: 'OUT_TEST_4', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS002', positionName: 'A区02号', quantity: 35 },
      { id: 'OUTD_TEST_4_2', outboundOrderId: 'OUT_TEST_4', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS002', positionName: 'A区02号', quantity: 17 },
    ]
  },
  {
    id: 'OUT_TEST_5', orderNo: 'BF20260625005', type: 'scrap',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'pending', operator: '孙七',
    createTime: '2026-06-25 13:35:00',
    remark: '测试出库单5-报废出库',
    details: [
      { id: 'OUTD_TEST_5_1', outboundOrderId: 'OUT_TEST_5', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS008', positionName: 'D区01号', quantity: 40 },
      { id: 'OUTD_TEST_5_2', outboundOrderId: 'OUT_TEST_5', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS008', positionName: 'D区01号', quantity: 20 },
    ]
  },
  {
    id: 'OUT_TEST_6', orderNo: 'LY20260626006', type: 'lowvalue',
    warehouseId: 'WH003', warehouseName: '固定资产仓', status: 'submitted', operator: '周八',
    createTime: '2026-06-26 14:40:00', approveTime: '2026-06-26 15:55:00', approver: '张三',
    remark: '测试出库单6-低值易耗品领用',
    details: [
      { id: 'OUTD_TEST_6_1', outboundOrderId: 'OUT_TEST_6', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS011', positionName: 'E区02号', quantity: 45 },
      { id: 'OUTD_TEST_6_2', outboundOrderId: 'OUT_TEST_6', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS011', positionName: 'E区02号', quantity: 22 },
    ]
  },
  {
    id: 'OUT_TEST_7', orderNo: 'GD20260627007', type: 'exhibition',
    warehouseId: 'WH001', warehouseName: '展会物资仓', projectId: 'PRJ_TEST_002', projectName: '测试展会项目2', status: 'submitted', operator: '张三',
    createTime: '2026-06-27 15:45:00', approveTime: '2026-06-27 16:50:00', approver: '李四',
    remark: '测试出库单7-展会物资领用',
    details: [
      { id: 'OUTD_TEST_7_1', outboundOrderId: 'OUT_TEST_7', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS003', positionName: 'A区03号', quantity: 50, workOrderId: 'WI2606110001', workOrderCode: 'WI2606110001', workOrderName: '会议室-场租作业项', isMain: true },
      { id: 'OUTD_TEST_7_2', outboundOrderId: 'OUT_TEST_7', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS003', positionName: 'A区03号', quantity: 25, workOrderId: 'WI2606110001', workOrderCode: 'WI2606110001', workOrderName: '会议室-场租作业项', isMain: false },
    ]
  },
  {
    id: 'OUT_TEST_8', orderNo: 'CK20260628008', type: 'workorder',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'submitted', operator: '李四',
    createTime: '2026-06-28 16:50:00', approveTime: '2026-06-28 17:45:00', approver: '王五',
    remark: '测试出库单8-工单出库',
    details: [
      { id: 'OUTD_TEST_8_1', outboundOrderId: 'OUT_TEST_8', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS009', positionName: 'D区02号', quantity: 55, workOrderId: 'WO_TEST_3', workOrderCode: 'GD20260625003', workOrderName: '测试维修工单3', isMain: true },
      { id: 'OUTD_TEST_8_2', outboundOrderId: 'OUT_TEST_8', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS009', positionName: 'D区02号', quantity: 27, workOrderId: 'WO_TEST_3', workOrderCode: 'GD20260625003', workOrderName: '测试维修工单3', isMain: false },
    ]
  },
  // ===== 测试数据结束 =====
];

// 展会项目数据
export const exhibitionProjects: ExhibitionProject[] = [
  { id: 'PRJ001', projectNo: 'PRJ202406001', projectName: '2024北京国际科技展', startDate: '2024-06-01', endDate: '2024-06-10', location: '北京国家会议中心', manager: '张三', status: 'completed', remark: '已圆满完成' },
  { id: 'PRJ002', projectNo: 'PRJ202406002', projectName: '2024上海工业博览会', startDate: '2024-06-15', endDate: '2024-06-20', location: '上海国家会展中心', manager: '李四', status: 'completed', remark: '' },
  { id: 'PRJ003', projectNo: 'PRJ202406003', projectName: '2024广州文创展', startDate: '2024-06-25', endDate: '2024-06-30', location: '广州琶洲展馆', manager: '王五', status: 'completed', remark: '' },
  { id: 'PRJ004', projectNo: 'PRJ202606001', projectName: '2026北京科技博览会', startDate: '2026-06-15', endDate: '2026-06-25', location: '北京国家会议中心', manager: '张三', status: 'ongoing', remark: '当前进行中' },
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
  // ===== 测试数据开始 =====
  {
    id: 'CK_TEST_1', orderNo: 'PD20260620001', warehouseId: 'WH001', warehouseName: '展会物资仓',
    status: 'submitted', operator: '张三', createTime: '2026-06-20 08:00:00', completeTime: '2026-06-20 11:30:00',
    details: [
      { id: 'CKD_TEST_1_1', checkOrderId: 'CK_TEST_1', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS001', positionName: 'A区01号', bookQuantity: 50, checkQuantity: 48, diffQuantity: -2, status: 'confirmed' },
      { id: 'CKD_TEST_1_2', checkOrderId: 'CK_TEST_1', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS002', positionName: 'A区02号', bookQuantity: 80, checkQuantity: 80, diffQuantity: 0, status: 'confirmed' },
    ]
  },
  {
    id: 'CK_TEST_2', orderNo: 'PD20260621002', warehouseId: 'WH002', warehouseName: '低值易耗仓',
    status: 'submitted', operator: '李四', createTime: '2026-06-21 08:30:00', completeTime: '2026-06-21 12:00:00',
    details: [
      { id: 'CKD_TEST_2_1', checkOrderId: 'CK_TEST_2', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS007', positionName: 'C区02号', bookQuantity: 60, checkQuantity: 58, diffQuantity: -2, status: 'confirmed' },
      { id: 'CKD_TEST_2_2', checkOrderId: 'CK_TEST_2', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS008', positionName: 'D区01号', bookQuantity: 90, checkQuantity: 92, diffQuantity: 2, status: 'confirmed' },
    ]
  },
  {
    id: 'CK_TEST_3', orderNo: 'PD20260622003', warehouseId: 'WH003', warehouseName: '固定资产仓',
    status: 'submitted', operator: '王五', createTime: '2026-06-22 09:00:00', completeTime: '2026-06-22 13:00:00',
    details: [
      { id: 'CKD_TEST_3_1', checkOrderId: 'CK_TEST_3', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS010', positionName: 'E区01号', bookQuantity: 70, checkQuantity: 70, diffQuantity: 0, status: 'confirmed' },
      { id: 'CKD_TEST_3_2', checkOrderId: 'CK_TEST_3', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS011', positionName: 'E区02号', bookQuantity: 100, checkQuantity: 98, diffQuantity: -2, status: 'confirmed' },
    ]
  },
  {
    id: 'CK_TEST_4', orderNo: 'PD20260623004', warehouseId: 'WH001', warehouseName: '展会物资仓',
    status: 'submitted', operator: '赵六', createTime: '2026-06-23 08:15:00',
    details: [
      { id: 'CKD_TEST_4_1', checkOrderId: 'CK_TEST_4', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS003', positionName: 'A区03号', bookQuantity: 110, checkQuantity: 110, diffQuantity: 0, status: 'pending' },
    ]
  },
  {
    id: 'CK_TEST_5', orderNo: 'PD20260624005', warehouseId: 'WH002', warehouseName: '低值易耗仓',
    status: 'submitted', operator: '孙七', createTime: '2026-06-24 09:30:00',
    details: [
      { id: 'CKD_TEST_5_1', checkOrderId: 'CK_TEST_5', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS009', positionName: 'D区02号', bookQuantity: 120, checkQuantity: 0, diffQuantity: 0, status: 'pending' },
    ]
  },
  {
    id: 'CK_TEST_6', orderNo: 'PD20260625006', warehouseId: 'WH003', warehouseName: '固定资产仓',
    status: 'pending', operator: '周八', createTime: '2026-06-25 10:00:00',
    details: [
      { id: 'CKD_TEST_6_1', checkOrderId: 'CK_TEST_6', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS010', positionName: 'E区01号', bookQuantity: 70, checkQuantity: 0, diffQuantity: 0, status: 'pending' },
      { id: 'CKD_TEST_6_2', checkOrderId: 'CK_TEST_6', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS011', positionName: 'E区02号', bookQuantity: 100, checkQuantity: 0, diffQuantity: 0, status: 'pending' },
    ]
  },
  {
    id: 'CK_TEST_7', orderNo: 'PD20260626007', warehouseId: 'WH001', warehouseName: '展会物资仓',
    status: 'submitted', operator: '张三', createTime: '2026-06-26 07:45:00', completeTime: '2026-06-26 11:00:00',
    details: [
      { id: 'CKD_TEST_7_1', checkOrderId: 'CK_TEST_7', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS001', positionName: 'A区01号', bookQuantity: 30, checkQuantity: 30, diffQuantity: 0, status: 'confirmed' },
      { id: 'CKD_TEST_7_2', checkOrderId: 'CK_TEST_7', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS002', positionName: 'A区02号', bookQuantity: 45, checkQuantity: 44, diffQuantity: -1, status: 'confirmed' },
    ],
    remark: '月度盘点'
  },
  {
    id: 'CK_TEST_8', orderNo: 'PD20260627008', warehouseId: 'WH002', warehouseName: '低值易耗仓',
    status: 'submitted', operator: '李四', createTime: '2026-06-27 08:00:00', completeTime: '2026-06-27 11:45:00',
    details: [
      { id: 'CKD_TEST_8_1', checkOrderId: 'CK_TEST_8', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS007', positionName: 'C区02号', bookQuantity: 35, checkQuantity: 35, diffQuantity: 0, status: 'confirmed' },
      { id: 'CKD_TEST_8_2', checkOrderId: 'CK_TEST_8', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS009', positionName: 'D区02号', bookQuantity: 65, checkQuantity: 63, diffQuantity: -2, status: 'confirmed' },
    ],
    remark: '季度大盘点'
  },
  // ===== 测试数据结束 =====
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
  // ===== 测试数据开始 =====
  {
    id: 'TR_TEST_1', orderNo: 'DB20260620001', supplierId: 'SUP001', supplierName: '华东建材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '展会物资仓', toWarehouseId: 'WH002', toWarehouseName: '低值易耗仓',
    status: 'approved', operator: '张三', createTime: '2026-06-20 10:00:00', approveTime: '2026-06-20 10:30:00', approver: '李四',
    remark: '测试调拨单1-已审批',
    details: [
      { id: 'TRD_TEST_1_1', transferOrderId: 'TR_TEST_1', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS001', positionName: 'A区01号', quantity: 30, usedQuantity: 0 },
      { id: 'TRD_TEST_1_2', transferOrderId: 'TR_TEST_1', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS001', positionName: 'A区01号', quantity: 20, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR_TEST_2', orderNo: 'DB20260621002', supplierId: 'SUP002', supplierName: '华北石材集团',
    fromWarehouseId: 'WH002', fromWarehouseName: '低值易耗仓', toWarehouseId: 'WH003', toWarehouseName: '固定资产仓',
    status: 'pending', operator: '李四', createTime: '2026-06-21 11:00:00',
    remark: '测试调拨单2-待审批',
    details: [
      { id: 'TRD_TEST_2_1', transferOrderId: 'TR_TEST_2', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS007', positionName: 'C区02号', quantity: 40, usedQuantity: 0 },
      { id: 'TRD_TEST_2_2', transferOrderId: 'TR_TEST_2', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS007', positionName: 'C区02号', quantity: 25, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR_TEST_3', orderNo: 'DB20260622003', supplierId: 'SUP003', supplierName: '南方五金制品厂',
    fromWarehouseId: 'WH003', fromWarehouseName: '固定资产仓', toWarehouseId: 'WH001', toWarehouseName: '展会物资仓',
    status: 'partiallyUsed', operator: '王五', createTime: '2026-06-22 09:00:00', approveTime: '2026-06-22 09:30:00', approver: '赵六',
    remark: '测试调拨单3-部分领用',
    details: [
      { id: 'TRD_TEST_3_1', transferOrderId: 'TR_TEST_3', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS010', positionName: 'E区01号', quantity: 50, usedQuantity: 25 },
      { id: 'TRD_TEST_3_2', transferOrderId: 'TR_TEST_3', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS010', positionName: 'E区01号', quantity: 35, usedQuantity: 15 },
    ]
  },
  {
    id: 'TR_TEST_4', orderNo: 'DB20260623004', supplierId: 'SUP001', supplierName: '华东建材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '展会物资仓', toWarehouseId: 'WH003', toWarehouseName: '固定资产仓',
    status: 'approved', operator: '赵六', createTime: '2026-06-23 14:00:00', approveTime: '2026-06-23 14:30:00', approver: '孙七',
    remark: '测试调拨单4-已审批',
    details: [
      { id: 'TRD_TEST_4_1', transferOrderId: 'TR_TEST_4', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS002', positionName: 'A区02号', quantity: 60, usedQuantity: 0 },
      { id: 'TRD_TEST_4_2', transferOrderId: 'TR_TEST_4', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS002', positionName: 'A区02号', quantity: 40, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR_TEST_5', orderNo: 'DB20260624005', supplierId: 'SUP002', supplierName: '华北石材集团',
    fromWarehouseId: 'WH002', fromWarehouseName: '低值易耗仓', toWarehouseId: 'WH001', toWarehouseName: '展会物资仓',
    status: 'fullyUsed', operator: '孙七', createTime: '2026-06-24 13:00:00', approveTime: '2026-06-24 13:30:00', approver: '周八',
    remark: '测试调拨单5-全部领用',
    details: [
      { id: 'TRD_TEST_5_1', transferOrderId: 'TR_TEST_5', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS008', positionName: 'D区01号', quantity: 70, usedQuantity: 70 },
      { id: 'TRD_TEST_5_2', transferOrderId: 'TR_TEST_5', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS008', positionName: 'D区01号', quantity: 45, usedQuantity: 45 },
    ]
  },
  {
    id: 'TR_TEST_6', orderNo: 'DB20260625006', supplierId: 'SUP003', supplierName: '南方五金制品厂',
    fromWarehouseId: 'WH003', fromWarehouseName: '固定资产仓', toWarehouseId: 'WH002', toWarehouseName: '低值易耗仓',
    status: 'approved', operator: '周八', createTime: '2026-06-25 15:00:00', approveTime: '2026-06-25 15:30:00', approver: '张三',
    remark: '测试调拨单6-已审批',
    details: [
      { id: 'TRD_TEST_6_1', transferOrderId: 'TR_TEST_6', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS011', positionName: 'E区02号', quantity: 80, usedQuantity: 0 },
      { id: 'TRD_TEST_6_2', transferOrderId: 'TR_TEST_6', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS011', positionName: 'E区02号', quantity: 55, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR_TEST_7', orderNo: 'DB20260626007', supplierId: 'SUP001', supplierName: '华东建材有限公司',
    fromWarehouseId: 'WH001', fromWarehouseName: '展会物资仓', toWarehouseId: 'WH002', toWarehouseName: '低值易耗仓',
    status: 'cancelled', operator: '张三', createTime: '2026-06-26 12:00:00',
    remark: '测试调拨单7-已取消',
    details: [
      { id: 'TRD_TEST_7_1', transferOrderId: 'TR_TEST_7', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS003', positionName: 'A区03号', quantity: 90, usedQuantity: 0 },
      { id: 'TRD_TEST_7_2', transferOrderId: 'TR_TEST_7', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS003', positionName: 'A区03号', quantity: 60, usedQuantity: 0 },
    ]
  },
  {
    id: 'TR_TEST_8', orderNo: 'DB20260627008', supplierId: 'SUP002', supplierName: '华北石材集团',
    fromWarehouseId: 'WH002', fromWarehouseName: '低值易耗仓', toWarehouseId: 'WH003', toWarehouseName: '固定资产仓',
    status: 'approved', operator: '李四', createTime: '2026-06-27 16:00:00', approveTime: '2026-06-27 16:30:00', approver: '王五',
    remark: '测试调拨单8-已审批',
    details: [
      { id: 'TRD_TEST_8_1', transferOrderId: 'TR_TEST_8', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS009', positionName: 'D区02号', quantity: 100, usedQuantity: 0 },
      { id: 'TRD_TEST_8_2', transferOrderId: 'TR_TEST_8', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS009', positionName: 'D区02号', quantity: 70, usedQuantity: 0 },
    ]
  },
  // ===== 测试数据结束 =====
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
  // ===== 测试数据开始 =====
  {
    id: 'RT_TEST_1', orderNo: 'TK20260621001', type: 'return',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '张三',
    createTime: '2026-06-21 14:00:00', approveTime: '2026-06-21 14:30:00', approver: '李四',
    details: [
      { id: 'RTD_TEST_1_1', returnOrderId: 'RT_TEST_1', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', positionId: 'POS001', positionName: 'A区01号', warehouseId: 'WH001', warehouseName: '展会物资仓', quantity: 5, sourceType: 'requisition', sourceOrderId: 'OUT_TEST_1', sourceOrderNo: 'LY20260621001' },
    ]
  },
  {
    id: 'RT_TEST_2', orderNo: 'TK20260622002', type: 'return',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'submitted', operator: '李四',
    createTime: '2026-06-22 10:00:00', approveTime: '2026-06-22 10:30:00', approver: '王五',
    details: [
      { id: 'RTD_TEST_2_1', returnOrderId: 'RT_TEST_2', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', positionId: 'POS007', positionName: 'C区02号', warehouseId: 'WH002', warehouseName: '低值易耗仓', quantity: 8, sourceType: 'requisition', sourceOrderId: 'OUT_TEST_2', sourceOrderNo: 'LY20260622002' },
    ]
  },
  {
    id: 'RT_TEST_3', orderNo: 'TK20260623003', type: 'writeoff',
    warehouseId: 'WH003', warehouseName: '固定资产仓', status: 'submitted', operator: '王五',
    createTime: '2026-06-23 11:00:00', approveTime: '2026-06-23 11:30:00', approver: '赵六',
    remark: '展会使用后损坏，无法归还',
    details: [
      { id: 'RTD_TEST_3_1', returnOrderId: 'RT_TEST_3', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', positionId: 'POS010', positionName: 'E区01号', warehouseId: 'WH003', warehouseName: '固定资产仓', quantity: 3, sourceType: 'scrap', sourceOrderId: 'OUT_TEST_3', sourceOrderNo: 'GD20260623003', workOrderId: 'WI2606110002', workOrderCode: 'WI2606110002', workOrderName: '会议室-会议室延时业项' },
    ]
  },
  {
    id: 'RT_TEST_4', orderNo: 'TK20260624004', type: 'return',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '赵六',
    createTime: '2026-06-24 09:30:00', approveTime: '2026-06-24 10:00:00', approver: '孙七',
    details: [
      { id: 'RTD_TEST_4_1', returnOrderId: 'RT_TEST_4', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', positionId: 'POS002', positionName: 'A区02号', warehouseId: 'WH001', warehouseName: '展会物资仓', quantity: 10, sourceType: 'requisition', sourceOrderId: 'OUT_TEST_4', sourceOrderNo: 'CK20260624004' },
    ]
  },
  {
    id: 'RT_TEST_5', orderNo: 'TK20260625005', type: 'writeoff',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'submitted', operator: '孙七',
    createTime: '2026-06-25 15:00:00', approveTime: '2026-06-25 15:30:00', approver: '周八',
    remark: '自然老化报废，无法继续使用',
    details: [
      { id: 'RTD_TEST_5_1', returnOrderId: 'RT_TEST_5', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', positionId: 'POS008', positionName: 'D区01号', warehouseId: 'WH002', warehouseName: '低值易耗仓', quantity: 5, sourceType: 'scrap', sourceOrderId: 'OUT_TEST_5', sourceOrderNo: 'BF20260625005' },
    ]
  },
  {
    id: 'RT_TEST_6', orderNo: 'TK20260626006', type: 'return',
    warehouseId: 'WH003', warehouseName: '固定资产仓', status: 'submitted', operator: '周八',
    createTime: '2026-06-26 10:30:00', approveTime: '2026-06-26 11:00:00', approver: '张三',
    details: [
      { id: 'RTD_TEST_6_1', returnOrderId: 'RT_TEST_6', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', positionId: 'POS011', positionName: 'E区02号', warehouseId: 'WH003', warehouseName: '固定资产仓', quantity: 15, sourceType: 'requisition', sourceOrderId: 'OUT_TEST_6', sourceOrderNo: 'LY20260626006' },
    ]
  },
  {
    id: 'RT_TEST_7', orderNo: 'TK20260627007', type: 'return',
    warehouseId: 'WH001', warehouseName: '展会物资仓', status: 'submitted', operator: '张三',
    createTime: '2026-06-27 14:30:00', approveTime: '2026-06-27 15:00:00', approver: '李四',
    details: [
      { id: 'RTD_TEST_7_1', returnOrderId: 'RT_TEST_7', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', positionId: 'POS003', positionName: 'A区03号', warehouseId: 'WH001', warehouseName: '展会物资仓', quantity: 12, sourceType: 'requisition', sourceOrderId: 'OUT_TEST_7', sourceOrderNo: 'GD20260627007', workOrderId: 'WI2606110001', workOrderCode: 'WI2606110001', workOrderName: '会议室-场租作业项' },
    ]
  },
  {
    id: 'RT_TEST_8', orderNo: 'TK20260628008', type: 'writeoff',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', status: 'submitted', operator: '李四',
    createTime: '2026-06-28 09:00:00', approveTime: '2026-06-28 09:30:00', approver: '王五',
    remark: '工单使用后损坏，报损处理',
    details: [
      { id: 'RTD_TEST_8_1', returnOrderId: 'RT_TEST_8', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', positionId: 'POS009', positionName: 'D区02号', warehouseId: 'WH002', warehouseName: '低值易耗仓', quantity: 7, sourceType: 'scrap', sourceOrderId: 'OUT_TEST_8', sourceOrderNo: 'CK20260628008' },
    ]
  },
  // ===== 测试数据结束 =====
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
  const prefix = type === 'purchase' ? 'PR' : type === 'production' ? 'GR' : type === 'return' ? 'TR' : 'GD';
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${dateStr}${random}`;
}

// 生成出库单号
export function generateOutboundOrderNo(type: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = type === 'lowvalue' ? 'LY' : type === 'exhibition' ? 'GD' : type === 'workorder' ? 'GD' : type === 'production' ? 'LL' : 'BF';
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
  { id: 'AE001', code: 'SB20240001', name: '数控车床', specification: 'CJK6136', unit: '台', amount: 150000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '车间A区', status: 'in_use', requisitionDepartment: '展览部', requisitionEmployee: '张三', requisitionDate: '2024-01-15', createTime: '2024-01-15', changeLogs: [{ id: 'LOG001', assetId: 'AE001', changeTime: '2024-01-15 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '首次领用', department: '展览部', employee: '张三' }] },
  { id: 'AE002', code: 'SB20240002', name: '铣床', specification: 'X5032', unit: '台', amount: 85000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '车间A区', status: 'in_use', requisitionDepartment: '市场部', requisitionEmployee: '李四', requisitionDate: '2024-01-20', createTime: '2024-01-20', changeLogs: [{ id: 'LOG002', assetId: 'AE002', changeTime: '2024-01-20 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '首次领用', department: '市场部', employee: '李四' }] },
  { id: 'AE003', code: 'SB20240003', name: '激光切割机', specification: 'LCT-3015', unit: '台', amount: 280000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '车间B区', status: 'in_use', requisitionDepartment: '技术部', requisitionEmployee: '王五', requisitionDate: '2024-02-10', createTime: '2024-02-10', changeLogs: [{ id: 'LOG003', assetId: 'AE003', changeTime: '2024-02-10 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '首次领用', department: '技术部', employee: '王五' }] },
  { id: 'AE004', code: 'SB20240004', name: '空压机', specification: 'GA37', unit: '台', amount: 42000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '设备房', status: 'in_storage', createTime: '2024-02-15', changeLogs: [] },
  { id: 'AE005', code: 'SB20240005', name: '叉车', specification: 'CPCD30', unit: '辆', amount: 68000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '仓库东门', status: 'in_use', requisitionDepartment: '物流部', requisitionEmployee: '赵六', requisitionDate: '2024-03-01', createTime: '2024-03-01', changeLogs: [{ id: 'LOG005', assetId: 'AE005', changeTime: '2024-03-01 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '首次领用', department: '物流部', employee: '赵六' }] },
  { id: 'AE006', code: 'SB20240006', name: '电焊机', specification: 'ZX7-400', unit: '台', amount: 3500, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '车间C区', status: 'scrapped', createTime: '2023-06-10', changeLogs: [{ id: 'LOG006', assetId: 'AE006', changeTime: '2023-06-10 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', department: '车间', employee: '工人A' }, { id: 'LOG006-2', assetId: 'AE006', changeTime: '2024-05-15 14:30:00', changeType: 'scrap', changeTypeName: '报废', operator: '管理员', remark: '设备老化报废' }] },
  { id: 'AE007', code: 'SB20240007', name: '钻床', specification: 'Z516', unit: '台', amount: 12000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '车间A区', status: 'in_use', requisitionDepartment: '生产部', requisitionEmployee: '孙七', requisitionDate: '2024-03-15', createTime: '2024-03-15', changeLogs: [{ id: 'LOG007', assetId: 'AE007', changeTime: '2024-03-15 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '首次领用', department: '生产部', employee: '孙七' }] },
  { id: 'AE008', code: 'SB20240008', name: '行车', specification: 'LH5T', unit: '台', amount: 95000, warehouseId: 'WH001', warehouseName: '固定资产仓', storageLocation: '车间A区', status: 'in_storage', createTime: '2024-04-01', changeLogs: [] },
  // ===== 测试数据开始 =====
  // 展会物资仓 (WH001) 资产设备
  { id: 'AE_TEST_1', code: 'SB20260601', name: '展会专用运输车', specification: 'EQ1060', unit: '辆', amount: 120000, warehouseId: 'WH001', warehouseName: '展会物资仓', storageLocation: '仓库北门', status: 'in_use', requisitionDepartment: '物流部', requisitionEmployee: '张三', requisitionDate: '2026-06-10', createTime: '2026-06-01', changeLogs: [{ id: 'LOG_TEST_1', assetId: 'AE_TEST_1', changeTime: '2026-06-10 09:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '展会物资运输领用', department: '物流部', employee: '张三' }] },
  { id: 'AE_TEST_2', code: 'SB20260602', name: '大型投影仪', specification: 'Epson-L1505', unit: '台', amount: 35000, warehouseId: 'WH001', warehouseName: '展会物资仓', storageLocation: '设备区A', status: 'in_storage', createTime: '2026-06-05', changeLogs: [] },
  // 低值易耗仓 (WH002) 资产设备
  { id: 'AE_TEST_3', code: 'SB20260603', name: '条码扫描枪', specification: 'Honeywell-1900', unit: '把', amount: 2800, warehouseId: 'WH002', warehouseName: '低值易耗仓', storageLocation: '办公区B', status: 'in_use', requisitionDepartment: '仓储部', requisitionEmployee: '李四', requisitionDate: '2026-06-12', createTime: '2026-06-08', changeLogs: [{ id: 'LOG_TEST_3', assetId: 'AE_TEST_3', changeTime: '2026-06-12 10:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '仓库盘点领用', department: '仓储部', employee: '李四' }] },
  { id: 'AE_TEST_4', code: 'SB20260604', name: '标签打印机', specification: 'Zebra-ZT410', unit: '台', amount: 8500, warehouseId: 'WH002', warehouseName: '低值易耗仓', storageLocation: '办公区B', status: 'in_use', requisitionDepartment: '采购部', requisitionEmployee: '王五', requisitionDate: '2026-06-15', createTime: '2026-06-10', changeLogs: [{ id: 'LOG_TEST_4', assetId: 'AE_TEST_4', changeTime: '2026-06-15 14:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '物资标签打印领用', department: '采购部', employee: '王五' }] },
  { id: 'AE_TEST_5', code: 'SB20260605', name: '手动液压叉车', specification: 'CBD20', unit: '台', amount: 4500, warehouseId: 'WH002', warehouseName: '低值易耗仓', storageLocation: '仓库西区', status: 'in_storage', createTime: '2026-06-12', changeLogs: [] },
  // 固定资产仓 (WH003) 资产设备
  { id: 'AE_TEST_6', code: 'SB20260606', name: '智能仓储货架', specification: 'HL-2024-A', unit: '组', amount: 55000, warehouseId: 'WH003', warehouseName: '固定资产仓', storageLocation: 'E区01号', status: 'in_use', requisitionDepartment: '仓储部', requisitionEmployee: '赵六', requisitionDate: '2026-06-18', createTime: '2026-06-15', changeLogs: [{ id: 'LOG_TEST_6', assetId: 'AE_TEST_6', changeTime: '2026-06-18 08:30:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '固定资产仓储使用', department: '仓储部', employee: '赵六' }] },
  { id: 'AE_TEST_7', code: 'SB20260607', name: '温湿度监控系统', specification: 'TH-3000', unit: '套', amount: 22000, warehouseId: 'WH003', warehouseName: '固定资产仓', storageLocation: 'E区02号', status: 'in_use', requisitionDepartment: '运维部', requisitionEmployee: '孙七', requisitionDate: '2026-06-20', createTime: '2026-06-18', changeLogs: [{ id: 'LOG_TEST_7', assetId: 'AE_TEST_7', changeTime: '2026-06-20 11:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', remark: '仓库环境监控', department: '运维部', employee: '孙七' }] },
  { id: 'AE_TEST_8', code: 'SB20260608', name: '工业吸尘器', specification: 'VC-5500', unit: '台', amount: 6800, warehouseId: 'WH003', warehouseName: '固定资产仓', storageLocation: 'E区03号', status: 'scrapped', createTime: '2026-01-10', changeLogs: [{ id: 'LOG_TEST_8_1', assetId: 'AE_TEST_8', changeTime: '2026-01-15 09:00:00', changeType: 'requisition', changeTypeName: '领用', operator: '系统', department: '保洁部', employee: '周八' }, { id: 'LOG_TEST_8_2', assetId: 'AE_TEST_8', changeTime: '2026-06-22 15:00:00', changeType: 'scrap', changeTypeName: '报废', operator: '管理员', remark: '电机烧毁，无法修复' }] },
  // ===== 测试数据结束 =====
];

// 报废记录数据
export const scrappedRecords: ScrappedRecord[] = [
  {
    id: 'SC001', recordNo: 'BF20240605001', assetEquipmentId: 'AE006', assetCode: 'SB20240006', assetName: '电焊机',
    warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS002', positionName: 'A区02号', storageLocation: '车间C区',
    amount: 3500, scrapType: 'full', scrapQuantity: 1, originalQuantity: 1,
    reason: '设备老旧，无法修复，已到报废年限', status: 'submitted', operator: '张三',
    createTime: '2024-06-05 09:30:00', approveTime: '2024-06-05 10:00:00', approver: '李四',
    projectId: 'PRJ001', projectName: '2024北京国际科技展'
  },
  {
    id: 'SC002', recordNo: 'BF20240615001', assetEquipmentId: 'AE003', assetCode: 'SB20240003', assetName: '激光切割机',
    warehouseId: 'WH003', warehouseName: '成品仓库', positionId: 'POS008', positionName: 'D区01号', storageLocation: '车间B区',
    amount: 280000, scrapType: 'full', scrapQuantity: 1, originalQuantity: 1,
    reason: '设备损坏严重，维修成本过高', status: 'submitted', operator: '王五',
    createTime: '2024-06-15 14:00:00', approveTime: '2024-06-15 14:30:00', approver: '李四',
    projectId: 'PRJ002', projectName: '2024上海工业博览会'
  },
  // ===== 测试数据开始 =====
  {
    id: 'SC_TEST_1', recordNo: 'BF20260620001', assetEquipmentId: 'AE_TEST_8', assetCode: 'SB20260608', assetName: '工业吸尘器',
    warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS012', positionName: 'E区03号', storageLocation: 'E区03号',
    amount: 6800, scrapType: 'full', scrapQuantity: 1, originalQuantity: 1,
    reason: '电机烧毁，无法修复', status: 'submitted', operator: '周八',
    createTime: '2026-06-22 09:00:00', approveTime: '2026-06-22 09:30:00', approver: '张三',
  },
  {
    id: 'SC_TEST_2', recordNo: 'BF20260621002', assetEquipmentId: 'AE_TEST_3', assetCode: 'SB20260603', assetName: '条码扫描枪',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号', storageLocation: '办公区B',
    amount: 2800, scrapType: 'full', scrapQuantity: 1, originalQuantity: 1,
    reason: '扫描头损坏，无法识别条码', status: 'pending', operator: '李四',
    createTime: '2026-06-23 14:00:00',
  },
  {
    id: 'SC_TEST_3', recordNo: 'BF20260622003', assetEquipmentId: 'AE_TEST_5', assetCode: 'SB20260605', assetName: '手动液压叉车',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号', storageLocation: '仓库西区',
    amount: 4500, scrapType: 'partial', scrapQuantity: 1, originalQuantity: 2,
    reason: '液压系统漏油', status: 'submitted', operator: '王五',
    createTime: '2026-06-24 10:00:00', approveTime: '2026-06-24 10:30:00', approver: '赵六',
  },
  // ===== 测试数据结束 =====
];

// 报损记录数据
export const damagedRecords: DamagedRecord[] = [
  {
    id: 'DM001', recordNo: 'BSD20240610001', productId: 'PRD010', productCode: 'P50001', productName: '轴承',
    warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS004', positionName: 'B区01号',
    quantity: 25, amount: 2500, reason: '轴承损坏无法使用', status: 'submitted', operator: '张三',
    createTime: '2024-06-10 10:00:00', approveTime: '2024-06-10 10:30:00', approver: '李四',
    projectId: 'PRJ001', projectName: '2024北京国际科技展'
  },
  {
    id: 'DM002', recordNo: 'BSD20240618001', productId: 'PRD001', productCode: 'P10001', productName: '钢板',
    warehouseId: 'WH001', warehouseName: '主仓库', positionId: 'POS001', positionName: 'A区01号',
    quantity: 10, amount: 5000, reason: '钢板生锈报废', status: 'pending', operator: '王五',
    createTime: '2024-06-18 16:00:00',
    projectId: 'PRJ003', projectName: '2024广州文创展'
  },
  // ===== 测试数据开始 =====
  {
    id: 'DM_TEST_1', recordNo: 'BSD20260620001', productId: 'PRD101', productCode: 'JJ1012', productName: '圆形井盖',
    warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号',
    quantity: 5, amount: 750, reason: '运输途中磕碰损坏', status: 'submitted', operator: '张三',
    createTime: '2026-06-20 10:00:00', approveTime: '2026-06-20 10:30:00', approver: '李四',
  },
  {
    id: 'DM_TEST_2', recordNo: 'BSD20260621002', productId: 'PRD102', productCode: 'JJ1013', productName: '圆形井盖',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号',
    quantity: 8, amount: 1200, reason: '存放不当导致变形', status: 'submitted', operator: '李四',
    createTime: '2026-06-21 11:00:00', approveTime: '2026-06-21 11:30:00', approver: '王五',
  },
  {
    id: 'DM_TEST_3', recordNo: 'BSD20260622003', productId: 'PRD103', productCode: 'JJ1016', productName: '方形井盖',
    warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS010', positionName: 'E区01号',
    quantity: 3, amount: 540, reason: '展会搭建时磕碰损坏', status: 'pending', operator: '王五',
    createTime: '2026-06-22 14:00:00',
    projectId: 'PRJ_TEST_001', projectName: '测试展会项目'
  },
  {
    id: 'DM_TEST_4', recordNo: 'BSD20260623004', productId: 'PRD104', productCode: 'JJ1017', productName: '碳钢地沟盖板',
    warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号',
    quantity: 6, amount: 900, reason: '长期使用磨损严重', status: 'submitted', operator: '赵六',
    createTime: '2026-06-23 09:30:00', approveTime: '2026-06-23 10:00:00', approver: '孙七',
  },
  {
    id: 'DM_TEST_5', recordNo: 'BSD20260624005', productId: 'PRD105', productCode: 'JJ1018', productName: '碳钢地沟盖板',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号',
    quantity: 10, amount: 1500, reason: '腐蚀严重无法使用', status: 'submitted', operator: '孙七',
    createTime: '2026-06-24 15:00:00', approveTime: '2026-06-24 15:30:00', approver: '周八',
  },
  {
    id: 'DM_TEST_6', recordNo: 'BSD20260625006', productId: 'PRD107', productCode: 'JJ1029', productName: '石材干挂配件单钩',
    warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS011', positionName: 'E区02号',
    quantity: 15, amount: 450, reason: '受力变形无法使用', status: 'pending', operator: '周八',
    createTime: '2026-06-25 10:30:00',
  },
  {
    id: 'DM_TEST_7', recordNo: 'BSD20260626007', productId: 'PRD108', productCode: 'JJ1030', productName: '石材干挂配件平板',
    warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS003', positionName: 'A区03号',
    quantity: 12, amount: 360, reason: '表面划痕严重', status: 'submitted', operator: '张三',
    createTime: '2026-06-26 13:00:00', approveTime: '2026-06-26 13:30:00', approver: '李四',
  },
  {
    id: 'DM_TEST_8', recordNo: 'BSD20260627008', productId: 'PRD111', productCode: 'JJ1035', productName: '瓷砖',
    warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS009', positionName: 'D区02号',
    quantity: 20, amount: 600, reason: '碎裂无法使用', status: 'submitted', operator: '李四',
    createTime: '2026-06-27 16:00:00', approveTime: '2026-06-27 16:30:00', approver: '王五',
  },
  // ===== 测试数据结束 =====
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
  return `BS${dateStr}${random}`;
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
  projectId?: string;
  projectName?: string;
}> = [
  { id: 'BI001', batchNo: 'PC202401150001', productId: 'PRD001', productName: '展板', productCode: 'P10001', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号', quantity: 80, originalQuantity: 80, inboundTime: '2024-01-15 10:00:00', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'BI002', batchNo: 'PC202403010001', productId: 'PRD002', productName: '展架', productCode: 'P10002', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号', quantity: 95, originalQuantity: 95, inboundTime: '2024-03-01 09:30:00', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'BI003', batchNo: 'PC202404050001', productId: 'PRD004', productName: '桌椅套装', productCode: 'P10004', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS003', positionName: 'A区03号', quantity: 42, originalQuantity: 42, inboundTime: '2024-04-05 10:20:00', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  { id: 'BI004', batchNo: 'PC202405200001', productId: 'PRD005', productName: '指示牌', productCode: 'P10005', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS004', positionName: 'B区01号', quantity: 30, originalQuantity: 30, inboundTime: '2024-05-20 14:15:00', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  { id: 'BI005', batchNo: 'PC202402280001', productId: 'PRD003', productName: '地毯', productCode: 'P10003', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS005', positionName: 'B区02号', quantity: 0, originalQuantity: 100, inboundTime: '2024-02-28 09:00:00', projectId: 'PRJ003', projectName: '2024广州文创展' },
  { id: 'BI006', batchNo: 'PC202406010001', productId: 'PRD006', productName: '空调', productCode: 'P20001', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS006', positionName: 'C区01号', quantity: 8, originalQuantity: 8, inboundTime: '2024-06-01 15:30:00', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'BI007', batchNo: 'PC202404150001', productId: 'PRD007', productName: '投影仪', productCode: 'P20002', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号', quantity: 15, originalQuantity: 15, inboundTime: '2024-04-15 11:00:00', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  { id: 'BI008', batchNo: 'PC202312200001', productId: 'PRD009', productName: '电脑', productCode: 'P20004', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号', quantity: 25, originalQuantity: 25, inboundTime: '2023-12-20 16:45:00', projectId: 'PRJ003', projectName: '2024广州文创展' },
  { id: 'BI009', batchNo: 'PC202403100001', productId: 'PRD010', productName: '清洁用品', productCode: 'P30001', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS009', positionName: 'D区02号', quantity: 60, originalQuantity: 60, inboundTime: '2024-03-10 08:00:00', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'BI010', batchNo: 'PC202405100001', productId: 'PRD008', productName: '音响设备', productCode: 'P20003', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS006', positionName: 'C区01号', quantity: 6, originalQuantity: 6, inboundTime: '2024-05-10 13:00:00', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  // ===== 测试数据开始 =====
  // 展会物资仓 (WH001) 批次库存
  { id: 'BI_TEST_1', batchNo: 'BATCH2026062001', productId: 'PRD101', productName: '圆形井盖', productCode: 'JJ1012', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号', quantity: 50, originalQuantity: 50, inboundTime: '2026-06-20 09:20:00' },
  { id: 'BI_TEST_2', batchNo: 'BATCH2026062304', productId: 'PRD104', productName: '碳钢地沟盖板', productCode: 'JJ1017', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号', quantity: 80, originalQuantity: 80, inboundTime: '2026-06-23 12:35:00' },
  { id: 'BI_TEST_3', batchNo: 'BATCH2026062607', productId: 'PRD108', productName: '石材干挂配件平板', productCode: 'JJ1030', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS003', positionName: 'A区03号', quantity: 110, originalQuantity: 110, inboundTime: '2026-06-26 15:50:00' },
  // 低值易耗仓 (WH002) 批次库存
  { id: 'BI_TEST_4', batchNo: 'BATCH2026062102', productId: 'PRD102', productName: '圆形井盖', productCode: 'JJ1013', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号', quantity: 60, originalQuantity: 60, inboundTime: '2026-06-21 10:25:00' },
  { id: 'BI_TEST_5', batchNo: 'BATCH2026062405', productId: 'PRD105', productName: '碳钢地沟盖板', productCode: 'JJ1018', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号', quantity: 90, originalQuantity: 90, inboundTime: '2026-06-24 13:30:00' },
  { id: 'BI_TEST_6', batchNo: 'BATCH2026062708', productId: 'PRD111', productName: '瓷砖', productCode: 'JJ1035', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS009', positionName: 'D区02号', quantity: 120, originalQuantity: 120, inboundTime: '2026-06-27 16:50:00' },
  // 固定资产仓 (WH003) 批次库存
  { id: 'BI_TEST_7', batchNo: 'BATCH2026062203', productId: 'PRD103', productName: '方形井盖', productCode: 'JJ1016', warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS010', positionName: 'E区01号', quantity: 70, originalQuantity: 70, inboundTime: '2026-06-22 11:20:00' },
  { id: 'BI_TEST_8', batchNo: 'BATCH2026062506', productId: 'PRD107', productName: '石材干挂配件单钩', productCode: 'JJ1029', warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS011', positionName: 'E区02号', quantity: 100, originalQuantity: 100, inboundTime: '2026-06-25 14:45:00' },
  // ===== 测试数据结束 =====
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
  // 领用出库
  { id: 'ST012', transactionNo: 'LS202406200001', transactionTime: '2024-06-20 09:30:00', transactionType: 'outbound', productId: 'PRD001', productCode: 'P10001', productName: '展板', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号', quantity: -10, sourceOrderId: 'OUT003', sourceOrderNo: 'LY20240620001', sourceType: '领用出库', operator: '张三', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'ST011', transactionNo: 'LS202406180001', transactionTime: '2024-06-18 14:00:00', transactionType: 'outbound', productId: 'PRD006', productCode: 'P20001', productName: '空调', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS006', positionName: 'C区01号', quantity: -2, sourceOrderId: 'OUT002', sourceOrderNo: 'LY20240618001', sourceType: '领用出库', operator: '王五', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  { id: 'ST010', transactionNo: 'LS202406150001', transactionTime: '2024-06-15 10:30:00', transactionType: 'outbound', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS003', positionName: 'A区03号', quantity: -5, sourceOrderId: 'OUT001', sourceOrderNo: 'LY20240615001', sourceType: '领用出库', operator: '张三', projectId: 'PRJ003', projectName: '2024广州文创展' },

  // 采购入库
  { id: 'ST009', transactionNo: 'LS202406100001', transactionTime: '2024-06-10 15:30:00', transactionType: 'inbound', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS004', positionName: 'B区01号', quantity: 30, sourceOrderId: 'IN002', sourceOrderNo: 'PR20240610001', sourceType: '采购入库', operator: '王五', batchNo: 'PC202406100001', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  { id: 'ST008', transactionNo: 'LS202406050001', transactionTime: '2024-06-05 09:30:00', transactionType: 'inbound', productId: 'PRD007', productCode: 'P20002', productName: '投影仪', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号', quantity: 15, sourceOrderId: 'IN001', sourceOrderNo: 'PR20240605001', sourceType: '采购入库', operator: '张三', batchNo: 'PC202406050001', projectId: 'PRJ001', projectName: '2024北京国际科技展' },

  // 生产入库
  { id: 'ST007', transactionNo: 'LS202406010001', transactionTime: '2024-06-01 10:00:00', transactionType: 'inbound', productId: 'PRD008', productCode: 'P20003', productName: '音响设备', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS006', positionName: 'C区01号', quantity: 6, sourceOrderId: 'IN003', sourceOrderNo: 'GR20240601001', sourceType: '生产入库', operator: '李四', batchNo: 'PC202406010001', projectId: 'PRJ003', projectName: '2024广州文创展' },

  // 归还退库
  { id: 'ST006', transactionNo: 'LS202405280001', transactionTime: '2024-05-28 11:00:00', transactionType: 'inbound', productId: 'PRD002', productCode: 'P10002', productName: '展架', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号', quantity: 10, sourceOrderId: 'RT001', sourceOrderNo: 'TR20240528001', sourceType: '归还退库', operator: '张三', projectId: 'PRJ001', projectName: '2024北京国际科技展' },

  // 报废出库
  { id: 'ST005', transactionNo: 'LS202405200001', transactionTime: '2024-05-20 14:00:00', transactionType: 'outbound', productId: 'PRD009', productCode: 'P20004', productName: '电脑', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号', quantity: -1, sourceOrderId: 'SC001', sourceOrderNo: 'BF20240520001', sourceType: '报废出库', operator: '王五', remark: '设备老旧报废', projectId: 'PRJ002', projectName: '2024上海工业博览会' },

  // 报损出库
  { id: 'ST004', transactionNo: 'LS202405150001', transactionTime: '2024-05-15 10:30:00', transactionType: 'outbound', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS009', positionName: 'D区02号', quantity: -5, sourceOrderId: 'DM001', sourceOrderNo: 'BS20240515001', sourceType: '报损出库', operator: '张三', remark: '包装破损报损', projectId: 'PRJ003', projectName: '2024广州文创展' },

  // 期初入库
  { id: 'ST003', transactionNo: 'LS202401150001', transactionTime: '2024-01-15 10:00:00', transactionType: 'inbound', productId: 'PRD001', productCode: 'P10001', productName: '展板', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号', quantity: 80, sourceType: '期初入库', operator: '张三', batchNo: 'PC202401150001', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'ST002', transactionNo: 'LS202403010001', transactionTime: '2024-03-01 09:30:00', transactionType: 'inbound', productId: 'PRD002', productCode: 'P10002', productName: '展架', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号', quantity: 95, sourceType: '期初入库', operator: '李四', batchNo: 'PC202403010001', projectId: 'PRJ001', projectName: '2024北京国际科技展' },
  { id: 'ST001', transactionNo: 'LS202406010002', transactionTime: '2024-06-01 15:30:00', transactionType: 'inbound', productId: 'PRD006', productCode: 'P20001', productName: '空调', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS006', positionName: 'C区01号', quantity: 8, sourceType: '期初入库', operator: '王五', batchNo: 'PC202406010002', projectId: 'PRJ002', projectName: '2024上海工业博览会' },
  // ===== 测试数据开始 =====
  { id: 'ST_TEST_16', transactionNo: 'LS202606280016', transactionTime: '2026-06-28 17:30:00', transactionType: 'outbound', productId: 'PRD111', productCode: 'JJ1035', productName: '瓷砖', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS009', positionName: 'D区02号', quantity: -55, sourceOrderId: 'OUT_TEST_8', sourceOrderNo: 'CK20260628008', sourceType: '工单出库', operator: '李四' },
  { id: 'ST_TEST_15', transactionNo: 'LS202606270015', transactionTime: '2026-06-27 16:30:00', transactionType: 'outbound', productId: 'PRD108', productCode: 'JJ1030', productName: '石材干挂配件平板', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS003', positionName: 'A区03号', quantity: -50, sourceOrderId: 'OUT_TEST_7', sourceOrderNo: 'GD20260627007', sourceType: '展会领用', operator: '张三' },
  { id: 'ST_TEST_14', transactionNo: 'LS202606260014', transactionTime: '2026-06-26 15:30:00', transactionType: 'outbound', productId: 'PRD107', productCode: 'JJ1029', productName: '石材干挂配件单钩', warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS011', positionName: 'E区02号', quantity: -45, sourceOrderId: 'OUT_TEST_6', sourceOrderNo: 'LY20260626006', sourceType: '领用出库', operator: '周八' },
  { id: 'ST_TEST_13', transactionNo: 'LS202606250013', transactionTime: '2026-06-25 14:30:00', transactionType: 'outbound', productId: 'PRD105', productCode: 'JJ1018', productName: '碳钢地沟盖板', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号', quantity: -40, sourceOrderId: 'OUT_TEST_5', sourceOrderNo: 'BF20260625005', sourceType: '报废出库', operator: '孙七', remark: '老化报废' },
  { id: 'ST_TEST_12', transactionNo: 'LS202606240012', transactionTime: '2026-06-24 13:30:00', transactionType: 'outbound', productId: 'PRD104', productCode: 'JJ1017', productName: '碳钢地沟盖板', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号', quantity: -35, sourceOrderId: 'OUT_TEST_4', sourceOrderNo: 'CK20260624004', sourceType: '领料出库', operator: '赵六' },
  { id: 'ST_TEST_11', transactionNo: 'LS202606230011', transactionTime: '2026-06-23 12:30:00', transactionType: 'outbound', productId: 'PRD103', productCode: 'JJ1016', productName: '方形井盖', warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS010', positionName: 'E区01号', quantity: -30, sourceOrderId: 'OUT_TEST_3', sourceOrderNo: 'GD20260623003', sourceType: '展会领用', operator: '王五', projectId: 'PRJ_TEST_001', projectName: '测试展会项目' },
  { id: 'ST_TEST_10', transactionNo: 'LS202606220010', transactionTime: '2026-06-22 11:30:00', transactionType: 'outbound', productId: 'PRD102', productCode: 'JJ1013', productName: '圆形井盖', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号', quantity: -25, sourceOrderId: 'OUT_TEST_2', sourceOrderNo: 'LY20260622002', sourceType: '领用出库', operator: '李四' },
  { id: 'ST_TEST_9', transactionNo: 'LS202606210009', transactionTime: '2026-06-21 10:30:00', transactionType: 'outbound', productId: 'PRD101', productCode: 'JJ1012', productName: '圆形井盖', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号', quantity: -20, sourceOrderId: 'OUT_TEST_1', sourceOrderNo: 'LY20260621001', sourceType: '领用出库', operator: '张三' },
  { id: 'ST_TEST_8', transactionNo: 'LS202606270008', transactionTime: '2026-06-27 16:50:00', transactionType: 'inbound', productId: 'PRD111', productCode: 'JJ1035', productName: '瓷砖', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS009', positionName: 'D区02号', quantity: 120, sourceOrderId: 'IN_TEST_8', sourceOrderNo: 'RK20260627008', sourceType: '采购入库', operator: '李四', batchNo: 'BATCH2026062708' },
  { id: 'ST_TEST_7', transactionNo: 'LS202606260007', transactionTime: '2026-06-26 15:50:00', transactionType: 'inbound', productId: 'PRD108', productCode: 'JJ1030', productName: '石材干挂配件平板', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS003', positionName: 'A区03号', quantity: 110, sourceOrderId: 'IN_TEST_7', sourceOrderNo: 'RK20260626007', sourceType: '工单入库', operator: '张三', batchNo: 'BATCH2026062607' },
  { id: 'ST_TEST_6', transactionNo: 'LS202606250006', transactionTime: '2026-06-25 14:45:00', transactionType: 'inbound', productId: 'PRD107', productCode: 'JJ1029', productName: '石材干挂配件单钩', warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS011', positionName: 'E区02号', quantity: 100, sourceOrderId: 'IN_TEST_6', sourceOrderNo: 'RK20260625006', sourceType: '采购入库', operator: '周八', batchNo: 'BATCH2026062506' },
  { id: 'ST_TEST_5', transactionNo: 'LS202606240005', transactionTime: '2026-06-24 13:30:00', transactionType: 'inbound', productId: 'PRD105', productCode: 'JJ1018', productName: '碳钢地沟盖板', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS008', positionName: 'D区01号', quantity: 90, sourceOrderId: 'IN_TEST_5', sourceOrderNo: 'RK20260624005', sourceType: '退货入库', operator: '孙七', batchNo: 'BATCH2026062405' },
  { id: 'ST_TEST_4', transactionNo: 'LS202606230004', transactionTime: '2026-06-23 12:35:00', transactionType: 'inbound', productId: 'PRD104', productCode: 'JJ1017', productName: '碳钢地沟盖板', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS002', positionName: 'A区02号', quantity: 80, sourceOrderId: 'IN_TEST_4', sourceOrderNo: 'RK20260623004', sourceType: '生产入库', operator: '赵六', batchNo: 'BATCH2026062304' },
  { id: 'ST_TEST_3', transactionNo: 'LS202606220003', transactionTime: '2026-06-22 11:20:00', transactionType: 'inbound', productId: 'PRD103', productCode: 'JJ1016', productName: '方形井盖', warehouseId: 'WH003', warehouseName: '固定资产仓', positionId: 'POS010', positionName: 'E区01号', quantity: 70, sourceOrderId: 'IN_TEST_3', sourceOrderNo: 'RK20260622003', sourceType: '采购入库', operator: '王五', batchNo: 'BATCH2026062203' },
  { id: 'ST_TEST_2', transactionNo: 'LS202606210002', transactionTime: '2026-06-21 10:25:00', transactionType: 'inbound', productId: 'PRD102', productCode: 'JJ1013', productName: '圆形井盖', warehouseId: 'WH002', warehouseName: '低值易耗仓', positionId: 'POS007', positionName: 'C区02号', quantity: 60, sourceOrderId: 'IN_TEST_2', sourceOrderNo: 'RK20260621002', sourceType: '采购入库', operator: '李四', batchNo: 'BATCH2026062102' },
  { id: 'ST_TEST_1', transactionNo: 'LS20260620001', transactionTime: '2026-06-20 09:20:00', transactionType: 'inbound', productId: 'PRD101', productCode: 'JJ1012', productName: '圆形井盖', warehouseId: 'WH001', warehouseName: '展会物资仓', positionId: 'POS001', positionName: 'A区01号', quantity: 50, sourceOrderId: 'IN_TEST_1', sourceOrderNo: 'RK20260620001', sourceType: '采购入库', operator: '张三', batchNo: 'BATCH2026062001' },
  // ===== 测试数据结束 =====
];

// 生成调拨单号
export const generateTransferNo = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DB${dateStr}${random}`;
};

// 仓库调拨单数据
export const stockTransfers: StockTransfer[] = [
  {
    id: 'TF001',
    transferNo: 'DB202406150001',
    projectId: 'PRJ001',
    projectName: '2024北京国际科技展',
    fromWarehouseId: 'WH001',
    fromWarehouseName: '展会物资仓',
    toWarehouseId: 'WH002',
    toWarehouseName: '低值易耗仓',
    status: 'completed',
    creator: '张三',
    createTime: '2024-06-15 09:00:00',
    outboundConfirmTime: '2024-06-15 10:00:00',
    outboundConfirmer: '李四',
    inboundConfirmTime: '2024-06-15 14:00:00',
    inboundConfirmer: '王五',
    remark: '展会物资调拨到低值易耗仓备用',
    details: [
      { id: 'TFD001', stockTransferId: 'TF001', productId: 'PRD001', productCode: 'P10001', productName: '展板', fromPositionId: 'POS001', fromPositionName: 'A区01号', toPositionId: 'POS006', toPositionName: 'C区01号', quantity: 20 },
      { id: 'TFD002', stockTransferId: 'TF001', productId: 'PRD002', productCode: 'P10002', productName: '展架', fromPositionId: 'POS002', fromPositionName: 'A区02号', toPositionId: 'POS007', toPositionName: 'C区02号', quantity: 15 },
    ],
  },
  {
    id: 'TF002',
    transferNo: 'DB202406180001',
    projectId: 'PRJ002',
    projectName: '2024上海工业博览会',
    fromWarehouseId: 'WH002',
    fromWarehouseName: '低值易耗仓',
    toWarehouseId: 'WH001',
    toWarehouseName: '展会物资仓',
    status: 'outbound_confirmed',
    creator: '李四',
    createTime: '2024-06-18 11:00:00',
    outboundConfirmTime: '2024-06-18 13:00:00',
    outboundConfirmer: '张三',
    remark: '投影仪调拨到展会物资仓用于展会',
    details: [
      { id: 'TFD003', stockTransferId: 'TF002', productId: 'PRD007', productCode: 'P20002', productName: '投影仪', fromPositionId: 'POS007', fromPositionName: 'C区02号', toPositionId: 'POS004', toPositionName: 'B区01号', quantity: 5 },
    ],
  },
  {
    id: 'TF003',
    transferNo: 'DB202406200001',
    projectId: 'PRJ003',
    projectName: '2024广州文创展',
    fromWarehouseId: 'WH001',
    fromWarehouseName: '展会物资仓',
    toWarehouseId: 'WH002',
    toWarehouseName: '低值易耗仓',
    status: 'pending',
    creator: '王五',
    createTime: '2024-06-20 15:00:00',
    remark: '桌椅套装调拨维修',
    details: [
      { id: 'TFD004', stockTransferId: 'TF003', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', fromPositionId: 'POS003', fromPositionName: 'A区03号', toPositionId: 'POS008', toPositionName: 'D区01号', quantity: 3 },
    ],
  },
];

// 物料申请单数据
export const productApplications: ProductApplication[] = [
  {
    id: 'PA001',
    applicationNo: 'WLSQ20240601001',
    applicant: '孙七',
    applicantDept: '会展部',
    status: 'pending',
    applyDate: '2024-06-01',
    expectedDate: '2024-06-15',
    remark: '会展项目急需物料',
    details: [
      { id: 'PAD001', applicationId: 'PA001', productName: 'LED显示屏', categoryName: '低值易耗', specification: 'P2.5高清', unit: '平方米', reason: '新会展项目需要' },
      { id: 'PAD002', applicationId: 'PA001', productName: '音响设备', categoryName: '低值易耗', specification: '专业级', unit: '套', reason: '展会使用' },
    ],
    createTime: '2024-06-01 09:00:00',
  },
  {
    id: 'PA002',
    applicationNo: 'WLSQ20240605001',
    applicant: '赵六',
    applicantDept: '运维部',
    status: 'approved',
    applyDate: '2024-06-05',
    expectedDate: '2024-06-20',
    remark: '设备维保所需',
    details: [
      { id: 'PAD003', applicationId: 'PA002', productName: '工具套装', categoryName: '低值易耗', specification: '维修用', unit: '套', reason: '日常维修备用' },
      { id: 'PAD004', applicationId: 'PA002', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', reason: '设备清洁保养' },
    ],
    approver: '刘十一',
    approveTime: '2024-06-05 14:30:00',
    approveRemark: '同意采购',
    createTime: '2024-06-05 10:00:00',
  },
  {
    id: 'PA003',
    applicationNo: 'WLSQ20240610001',
    applicant: '王五',
    applicantDept: '生产部',
    status: 'draft',
    applyDate: '2024-06-10',
    expectedDate: '2024-06-25',
    remark: '',
    details: [
      { id: 'PAD005', applicationId: 'PA003', productName: '展板', categoryName: '展会物资', specification: '2m*3m', unit: '块', reason: '展会搭建使用' },
    ],
    createTime: '2024-06-10 08:30:00',
  },
  {
    id: 'PA004',
    applicationNo: 'WLSQ20240615001',
    applicant: '郑十',
    applicantDept: '采购部',
    status: 'rejected',
    applyDate: '2024-06-15',
    expectedDate: '2024-06-30',
    remark: '库存充足，暂不采购',
    details: [
      { id: 'PAD006', applicationId: 'PA004', productName: '办公用品', categoryName: '低值易耗', specification: 'A4纸', unit: '包', reason: '办公日常需要' },
    ],
    approver: '刘十一',
    approveTime: '2024-06-15 16:00:00',
    approveRemark: '库存充足，暂不采购',
    createTime: '2024-06-15 09:00:00',
  },
  {
    id: 'PA005',
    applicationNo: 'WLSQ20240620001',
    applicant: '孙七',
    applicantDept: '会展部',
    status: 'approved',
    applyDate: '2024-06-20',
    expectedDate: '2024-07-05',
    remark: '展会物资采购需求',
    details: [
      { id: 'PAD007', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '6㎡（单线63A头/15米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD008', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '6㎡（单线125A头/15米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD009', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '4㎡（单线32A头/15米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD010', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '16㎡（无头/15米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD011', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '4㎡3芯/16A/10米（16A电箱）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD012', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '4㎡3芯（无头/20米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD013', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '25㎡（无头带铜鼻子/20米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD014', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '16㎡（无头带铜鼻子/20米长）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD015', applicationId: 'PA005', productName: '电缆', categoryName: '展会物资', specification: '4㎡（无头/85米长）（3芯）', unit: '根', reason: '展会电力布线' },
      { id: 'PAD016', applicationId: 'PA005', productName: '配电箱', categoryName: '展会物资', specification: '16A', unit: '个', reason: '展会电力分配' },
      { id: 'PAD017', applicationId: 'PA005', productName: '配电箱', categoryName: '展会物资', specification: '32A', unit: '个', reason: '展会电力分配' },
      { id: 'PAD018', applicationId: 'PA005', productName: '配电箱', categoryName: '展会物资', specification: '63A', unit: '个', reason: '展会电力分配' },
      { id: 'PAD019', applicationId: 'PA005', productName: '配电箱', categoryName: '展会物资', specification: '40A', unit: '个', reason: '展会电力分配' },
      { id: 'PAD020', applicationId: 'PA005', productName: '配电箱', categoryName: '展会物资', specification: '16A/220V', unit: '个', reason: '展会电力分配' },
      { id: 'PAD021', applicationId: 'PA005', productName: '配电箱', categoryName: '展会物资', specification: '100A', unit: '个', reason: '展会电力分配' },
      { id: 'PAD022', applicationId: 'PA005', productName: '手拉吊葫芦', categoryName: '展会物资', specification: '1T/12米', unit: '个', reason: '展会搭建吊装' },
      { id: 'PAD023', applicationId: 'PA005', productName: '黑色吊带（蓝色头）', categoryName: '展会物资', specification: '2T/2米', unit: '根', reason: '展会搭建吊装' },
      { id: 'PAD024', applicationId: 'PA005', productName: '黑色吊带（红色头）', categoryName: '展会物资', specification: '2T/4米', unit: '根', reason: '展会搭建吊装' },
      { id: 'PAD025', applicationId: 'PA005', productName: '黑色吊带（绿色头）', categoryName: '展会物资', specification: '2T/8米', unit: '根', reason: '展会搭建吊装' },
    ],
    approver: '刘十一',
    approveTime: '2024-06-20 14:00:00',
    approveRemark: '同意采购',
    createTime: '2024-06-20 10:00:00',
  },
];

// 生成物料申请单号
export function generateProductApplicationNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WLSQ${dateStr}${random}`;
}

// 工单物资配置数据
export const workOrderConfigs: WorkOrderProductConfig[] = [
  {
    id: 'WPC000',
    workOrderId: 'WI2606010001',
    workOrderCode: 'WI2606010001',
    workOrderName: '电箱220V室内',
    projectId: 'PROJ001',
    projectName: '会展电力配套项目',
    exhibitionName: '2026上海国际会展',
    category: '电力/电箱/室内',
    mainProducts: [
      { id: 'WP0001', productId: 'PRD779', productCode: 'QD2010', productName: '配电箱', categoryName: '低值易耗', specification: '16A', unit: '个', quantity: 1 },
      { id: 'WP0002', productId: 'PRD780', productCode: 'QD2011', productName: '配电箱', categoryName: '低值易耗', specification: '32A', unit: '个', quantity: 1 },
      { id: 'WP0003', productId: 'PRD781', productCode: 'QD2012', productName: '配电箱', categoryName: '低值易耗', specification: '63A', unit: '个', quantity: 1 },
      { id: 'WP0004', productId: 'PRD782', productCode: 'QD2013', productName: '配电箱', categoryName: '低值易耗', specification: '40A', unit: '个', quantity: 1 },
      { id: 'WP0005', productId: 'PRD783', productCode: 'QD2014', productName: '配电箱', categoryName: '低值易耗', specification: '16A/220V', unit: '个', quantity: 1 },
      { id: 'WP0006', productId: 'PRD784', productCode: 'QD2015', productName: '配电箱', categoryName: '低值易耗', specification: '100A', unit: '个', quantity: 1 },
    ],
    auxiliaryProducts: [
      { id: 'WP0011', productId: 'PRD770', productCode: 'QD2001', productName: '电缆', categoryName: '低值易耗', specification: '6㎡（单线63A头/15米长）', unit: '根', quantity: 1 },
      { id: 'WP0012', productId: 'PRD771', productCode: 'QD2002', productName: '电缆', categoryName: '低值易耗', specification: '6㎡（单线125A头/15米长）', unit: '根', quantity: 1 },
      { id: 'WP0013', productId: 'PRD772', productCode: 'QD2003', productName: '电缆', categoryName: '低值易耗', specification: '4㎡（单线32A头/15米长）', unit: '根', quantity: 1 },
      { id: 'WP0014', productId: 'PRD773', productCode: 'QD2004', productName: '电缆', categoryName: '低值易耗', specification: '16㎡（无头/15米长）', unit: '根', quantity: 1 },
      { id: 'WP0015', productId: 'PRD774', productCode: 'QD2005', productName: '电缆', categoryName: '低值易耗', specification: '4㎡3芯/16A/10米（16A电箱）', unit: '根', quantity: 1 },
      { id: 'WP0016', productId: 'PRD775', productCode: 'QD2006', productName: '电缆', categoryName: '低值易耗', specification: '4㎡3芯（无头/20米长）', unit: '根', quantity: 1 },
      { id: 'WP0017', productId: 'PRD776', productCode: 'QD2007', productName: '电缆', categoryName: '低值易耗', specification: '25㎡（无头带铜鼻子/20米长）', unit: '根', quantity: 1 },
    ],
    createTime: '2026-06-01T08:00:00Z',
  },
  {
    id: 'WPC001',
    workOrderId: 'WI2606010002',
    workOrderCode: 'WI2606010002',
    workOrderName: '电箱220V室外',
    projectId: 'PROJ001',
    projectName: '会展电力配套项目',
    exhibitionName: '2026上海国际会展',
    category: '电力/电箱/室外',
    mainProducts: [
      { id: 'WP0003', productId: 'PRD014', productCode: 'P20006', productName: '电箱220V室外', categoryName: '低值易耗', specification: '220V/16A 室外防水款', unit: '台', quantity: 15 },
    ],
    auxiliaryProducts: [
      { id: 'WP0004', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 1 },
    ],
    createTime: '2026-06-01T08:05:00Z',
  },
  {
    id: 'WPC002',
    workOrderId: 'WI2606110003',
    workOrderCode: 'WI2606110003',
    workOrderName: '停车作业项',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '其他/停车/停车',
    mainProducts: [
      { id: 'WP001', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 5 },
    ],
    auxiliaryProducts: [
      { id: 'WP002', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 2 },
    ],
    createTime: '2026-06-11T11:24:06Z',
  },
  {
    id: 'WPC002',
    workOrderId: 'WI2606110002',
    workOrderCode: 'WI2606110002',
    workOrderName: '会议室-会议室延时业项',
    projectId: 'PROJ003',
    projectName: '会议中心配套项目',
    exhibitionName: '2026上海国际会展',
    category: '会议室/会议室/会议室延时',
    mainProducts: [
      { id: 'WP003', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 10 },
    ],
    auxiliaryProducts: [
      { id: 'WP004', productId: 'PRD012', productCode: 'P30003', productName: '工具套装', categoryName: '低值易耗', specification: '维修用', unit: '套', quantity: 3 },
    ],
    createTime: '2026-06-11T11:23:31Z',
  },
  {
    id: 'WPC003',
    workOrderId: 'WI2606110001',
    workOrderCode: 'WI2606110001',
    workOrderName: '会议室-场租作业项',
    projectId: 'PROJ003',
    projectName: '会议中心配套项目',
    exhibitionName: '2026上海国际会展',
    category: '会议室/会议室/场租',
    mainProducts: [
      { id: 'WP005', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 20 },
    ],
    auxiliaryProducts: [
      { id: 'WP006', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 8 },
    ],
    createTime: '2026-06-11T11:21:38Z',
  },
  {
    id: 'WPC004',
    workOrderId: 'WI2606100001',
    workOrderCode: 'WI2606100001',
    workOrderName: '给排水作业',
    projectId: 'PROJ001',
    projectName: '会展电力配套项目',
    exhibitionName: '2026上海国际会展',
    category: '水/气/水气作业/给排水',
    mainProducts: [
      { id: 'WP007', productId: 'PRD008', productCode: 'P40001', productName: '水管接头', categoryName: '低值易耗', specification: 'DN50', unit: '个', quantity: 30 },
    ],
    auxiliaryProducts: [
      { id: 'WP008', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 2 },
    ],
    createTime: '2026-06-10T16:54:18Z',
  },
  {
    id: 'WPC005',
    workOrderId: 'WI2606040001',
    workOrderCode: 'WI2606040001',
    workOrderName: '作业项_设备押金',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '设备押金/设备押金/设备押金',
    mainProducts: [
      { id: 'WP009', productId: 'PRD007', productCode: 'P50002', productName: '设备押金条', categoryName: '其他物资', specification: '标准', unit: '张', quantity: 50 },
    ],
    auxiliaryProducts: [
      { id: 'WP010', productId: 'PRD011', productCode: 'P40002', productName: '说明书', categoryName: '低值易耗', specification: '标准', unit: '本', quantity: 20 },
    ],
    createTime: '2026-06-04T09:53:37Z',
  },
  {
    id: 'WPC006',
    workOrderId: 'WI2605270021',
    workOrderCode: 'WI2605270021',
    workOrderName: '搭建押金/搭建押金/搭建押金',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '搭建押金/搭建押金/搭建押金',
    mainProducts: [
      { id: 'WP011', productId: 'PRD001', productCode: 'P10001', productName: '钢板', categoryName: '会展物资', specification: '1m*2m', unit: '块', quantity: 15 },
      { id: 'WP012', productId: 'PRD002', productCode: 'P10002', productName: '铝板', categoryName: '会展物资', specification: '铝合金', unit: '套', quantity: 10 },
    ],
    auxiliaryProducts: [
      { id: 'WP013', productId: 'PRD009', productCode: 'P20003', productName: '螺丝套装', categoryName: '低值易耗', specification: '标准', unit: '盒', quantity: 20 },
    ],
    createTime: '2026-05-27T15:49:05Z',
  },
  {
    id: 'WPC007',
    workOrderId: 'WI2605270020',
    workOrderCode: 'WI2605270020',
    workOrderName: '搭建押金/搭建押金/安全清洁押金',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '搭建押金/搭建押金/安全清洁押金',
    mainProducts: [
      { id: 'WP014', productId: 'PRD001', productCode: 'P10001', productName: '钢板', categoryName: '会展物资', specification: '1m*2m', unit: '块', quantity: 10 },
    ],
    auxiliaryProducts: [
      { id: 'WP015', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 5 },
    ],
    createTime: '2026-05-27T15:46:34Z',
  },
  {
    id: 'WPC008',
    workOrderId: 'WI2605270019',
    workOrderCode: 'WI2605270019',
    workOrderName: '管理费/管理费/地毯管理费',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '管理费/管理费/地毯管理费',
    mainProducts: [
      { id: 'WP016', productId: 'PRD003', productCode: 'P10003', productName: '地毯', categoryName: '会展物资', specification: '加厚型', unit: '平方米', quantity: 200 },
    ],
    auxiliaryProducts: [
      { id: 'WP017', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 10 },
    ],
    createTime: '2026-05-27T15:46:33Z',
  },
  {
    id: 'WPC009',
    workOrderId: 'WI2605270018',
    workOrderCode: 'WI2605270018',
    workOrderName: '管理费/管理费/特装管理费',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '管理费/管理费/特装管理费',
    mainProducts: [
      { id: 'WP018', productId: 'PRD001', productCode: 'P10001', productName: '钢板', categoryName: '会展物资', specification: '1m*2m', unit: '块', quantity: 25 },
      { id: 'WP019', productId: 'PRD002', productCode: 'P10002', productName: '铝板', categoryName: '会展物资', specification: '铝合金', unit: '套', quantity: 15 },
    ],
    auxiliaryProducts: [
      { id: 'WP020', productId: 'PRD012', productCode: 'P30003', productName: '工具套装', categoryName: '低值易耗', specification: '维修用', unit: '套', quantity: 4 },
    ],
    createTime: '2026-05-27T15:46:33Z',
  },
  {
    id: 'WPC010',
    workOrderId: 'WI2605270017',
    workOrderCode: 'WI2605270017',
    workOrderName: '管理费/管理费/管理费',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '管理费/管理费/管理费',
    mainProducts: [
      { id: 'WP021', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 30 },
    ],
    auxiliaryProducts: [
      { id: 'WP022', productId: 'PRD011', productCode: 'P40002', productName: '说明书', categoryName: '低值易耗', specification: '标准', unit: '本', quantity: 15 },
    ],
    createTime: '2026-05-27T15:46:30Z',
  },
  {
    id: 'WPC011',
    workOrderId: 'WI2605270016',
    workOrderCode: 'WI2605270016',
    workOrderName: '保洁/物业安保/布撤展-保洁加班',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '保洁/物业安保/布撤展-保洁加班',
    mainProducts: [
      { id: 'WP023', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 15 },
    ],
    auxiliaryProducts: [
      { id: 'WP024', productId: 'PRD012', productCode: 'P30003', productName: '工具套装', categoryName: '低值易耗', specification: '保洁用', unit: '套', quantity: 5 },
    ],
    createTime: '2026-05-27T15:40:38Z',
  },
  {
    id: 'WPC012',
    workOrderId: 'WI2605270015',
    workOrderCode: 'WI2605270015',
    workOrderName: '保洁/物业安保/布撤展-保洁',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '保洁/物业安保/布撤展-保洁',
    mainProducts: [
      { id: 'WP025', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 12 },
    ],
    auxiliaryProducts: [
      { id: 'WP026', productId: 'PRD012', productCode: 'P30003', productName: '工具套装', categoryName: '低值易耗', specification: '保洁用', unit: '套', quantity: 4 },
    ],
    createTime: '2026-05-27T15:40:35Z',
  },
  {
    id: 'WPC013',
    workOrderId: 'WI2605270014',
    workOrderCode: 'WI2605270014',
    workOrderName: '保洁/物业安保/展期-保洁加班',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '保洁/物业安保/展期-保洁加班',
    mainProducts: [
      { id: 'WP027', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 10 },
    ],
    auxiliaryProducts: [
      { id: 'WP028', productId: 'PRD012', productCode: 'P30003', productName: '工具套装', categoryName: '低值易耗', specification: '保洁用', unit: '套', quantity: 3 },
    ],
    createTime: '2026-05-27T15:40:33Z',
  },
  {
    id: 'WPC014',
    workOrderId: 'WI2605270013',
    workOrderCode: 'WI2605270013',
    workOrderName: '保洁/物业安保/展期-保洁',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '保洁/物业安保/展期-保洁',
    mainProducts: [
      { id: 'WP029', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 8 },
    ],
    auxiliaryProducts: [
      { id: 'WP030', productId: 'PRD012', productCode: 'P30003', productName: '工具套装', categoryName: '低值易耗', specification: '保洁用', unit: '套', quantity: 2 },
    ],
    createTime: '2026-05-27T15:39:38Z',
  },
  {
    id: 'WPC015',
    workOrderId: 'WI2605270012',
    workOrderCode: 'WI2605270012',
    workOrderName: '安保/物业安保/展期-安保加班',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '安保/物业安保/展期-安保加班',
    mainProducts: [
      { id: 'WP031', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 20 },
    ],
    auxiliaryProducts: [
      { id: 'WP032', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 6 },
    ],
    createTime: '2026-05-27T15:39:34Z',
  },
  {
    id: 'WPC016',
    workOrderId: 'WI2605270011',
    workOrderCode: 'WI2605270011',
    workOrderName: '安保/物业安保/布撤展--安保加班',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '安保/物业安保/布撤展--安保加班',
    mainProducts: [
      { id: 'WP033', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 15 },
    ],
    auxiliaryProducts: [
      { id: 'WP034', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 4 },
    ],
    createTime: '2026-05-27T15:39:31Z',
  },
  {
    id: 'WPC017',
    workOrderId: 'WI2605270010',
    workOrderCode: 'WI2605270010',
    workOrderName: '安保/物业安保/展期-物业安保',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '安保/物业安保/展期-物业安保',
    mainProducts: [
      { id: 'WP035', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 12 },
    ],
    auxiliaryProducts: [
      { id: 'WP036', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 3 },
    ],
    createTime: '2026-05-27T15:39:29Z',
  },
  {
    id: 'WPC018',
    workOrderId: 'WI2605270009',
    workOrderCode: 'WI2605270009',
    workOrderName: '安保/物业安保/布撤展-物业安保',
    projectId: 'PROJ002',
    projectName: '展会现场服务项目',
    exhibitionName: '2026上海国际会展',
    category: '安保/物业安保/布撤展-物业安保',
    mainProducts: [
      { id: 'WP037', productId: 'PRD005', productCode: 'P10005', productName: '指示牌', categoryName: '会展物资', specification: '立式', unit: '个', quantity: 10 },
    ],
    auxiliaryProducts: [
      { id: 'WP038', productId: 'PRD004', productCode: 'P10004', productName: '桌椅套装', categoryName: '会展物资', specification: '会议用', unit: '套', quantity: 2 },
    ],
    createTime: '2026-05-27T15:39:28Z',
  },
  {
    id: 'WPC019',
    workOrderId: 'WI2605270008',
    workOrderCode: 'WI2605270008',
    workOrderName: '水/气/水气作业/给排水',
    projectId: 'PROJ001',
    projectName: '会展电力配套项目',
    exhibitionName: '2026上海国际会展',
    category: '水/气/水气作业/给排水',
    mainProducts: [
      { id: 'WP039', productId: 'PRD008', productCode: 'P40001', productName: '水管接头', categoryName: '低值易耗', specification: 'DN50', unit: '个', quantity: 20 },
    ],
    auxiliaryProducts: [
      { id: 'WP040', productId: 'PRD010', productCode: 'P30001', productName: '清洁用品', categoryName: '低值易耗', specification: '套装', unit: '箱', quantity: 1 },
    ],
    createTime: '2026-05-27T15:39:27Z',
  },
];

// ==================== 采购管理系统数据 ====================

// 供应商考核评估数据
export const supplierAssessments: SupplierAssessment[] = [
  {
    id: 'SA001',
    supplierId: 'SUP001',
    supplierName: '华东钢材有限公司',
    assessmentType: 'quarterly',
    projectName: '2024年度第二季度考核',
    assessmentTime: '2024-06-30 15:00:00',
    assessor: '张三',
    scores: {
      internalManagement: 13,
      qualityManagement: 18,
      scheduleManagement: 14,
      costManagement: 14,
      safetyConstruction: 19,
      constructionCooperation: 14,
    },
    totalScore: 92,
    comments: '整体表现良好，建议在成本控制方面继续优化',
    hasSafetyAccident: false,
    hasUnreasonableWageClaim: false,
    status: 'approved',
  },
];

// 采购计划数据
export const procurementPlans: ProcurementPlan[] = [
  {
    id: 'PP001',
    planNo: 'CGJH202406001',
    planType: 'monthly',
    year: '2024',
    month: '06',
    department: '会展部',
    status: 'approved',
    createTime: '2024-06-01 09:00:00',
    creator: '业务经理-王',
    approveTime: '2024-06-03 14:00:00',
    approver: '总经理',
    remark: '6月份展会物资采购计划',
    details: [
      {
        id: 'PPD001',
        planId: 'PP001',
        seq: 1,
        projectName: '展会地毯铺设服务',
        projectNature: '服务',
        projectOverview: 'XX展会通道地毯',
        budgetAmount: 15,
        plannedStartDate: '2024-06-15',
        approvalDate: '2024-06-01',
        approvalFileNo: 'XX会议纪要',
        plannedCompletionDate: '2024-06-20',
      },
      {
        id: 'PPD002',
        planId: 'PP001',
        seq: 2,
        projectName: '展会灯光设备租赁',
        projectNature: '服务',
        projectOverview: '主会场灯光系统',
        budgetAmount: 30,
        plannedStartDate: '2024-06-10',
        approvalDate: '2024-06-01',
        approvalFileNo: 'XX会议纪要',
        plannedCompletionDate: '2024-06-25',
      },
    ],
  },
  {
    id: 'PP002',
    planNo: 'CGJH2024001',
    planType: 'annual',
    year: '2024',
    department: '采购部',
    status: 'pending',
    createTime: '2024-01-10 10:00:00',
    creator: '采购主管-赵',
    remark: '2024年度采购计划',
    currentNodeId: 'NODE3_1700000000000',
    currentNodeName: '财务部审核',
    flowConfigId: 'AFC002',
    details: [
      {
        id: 'PPD003',
        planId: 'PP002',
        seq: 1,
        projectName: '年度设备维护服务',
        projectNature: '服务',
        projectOverview: '全年设备定期维护',
        budgetAmount: 50,
        estimatedCost: 48,
        approvalDate: '2024-01-05',
        approvalFileNo: '2024年度预算会议纪要',
      },
    ],
  },
  // ===== 测试数据开始 =====
  {
    id: 'PP_TEST_1', planNo: 'YJD202606001', planType: 'monthly', year: '2026', month: '06',
    department: '采购部', status: 'approved', createTime: '2026-06-10 09:00:00', creator: '张三',
    remark: '测试采购计划1-月度采购', currentNodeId: '', currentNodeName: '', flowConfigId: 'AFC001',
    details: [
      {
        id: 'PPD_TEST_1_1', planId: 'PP_TEST_1', seq: 1,
        projectName: '市政设施维护项目', projectNature: '工程', projectOverview: '城市井盖及盖板更换维护',
        budgetAmount: 50, estimatedCost: 48, approvalDate: '2026-06-08', approvalFileNo: '2026月度采购审批001',
      }
    ],
  },
  {
    id: 'PP_TEST_2', planNo: 'NJD2026002', planType: 'annual', year: '2026', month: '',
    department: '工程部', status: 'approved', createTime: '2026-06-11 10:00:00', creator: '李四',
    remark: '测试采购计划2-年度采购', currentNodeId: '', currentNodeName: '', flowConfigId: 'AFC002',
    details: [
      {
        id: 'PPD_TEST_2_1', planId: 'PP_TEST_2', seq: 1,
        projectName: '石材干挂工程', projectNature: '工程', projectOverview: '外墙石材干挂配件采购',
        budgetAmount: 80, estimatedCost: 75, approvalDate: '2026-06-09', approvalFileNo: '2026年度采购审批002',
      }
    ],
  },
  {
    id: 'PP_TEST_3', planNo: 'YJD202606003', planType: 'monthly', year: '2026', month: '06',
    department: '运维部', status: 'pending', createTime: '2026-06-12 11:00:00', creator: '王五',
    remark: '测试采购计划3-待审批', currentNodeId: 'NODE1_1700000000000', currentNodeName: '采购部审核', flowConfigId: 'AFC001',
    details: [
      {
        id: 'PPD_TEST_3_1', planId: 'PP_TEST_3', seq: 1,
        projectName: '地砖维修项目', projectNature: '工程', projectOverview: '公共区域地砖更换',
        budgetAmount: 30, estimatedCost: 28, approvalDate: '', approvalFileNo: '',
      }
    ],
  },
  {
    id: 'PP_TEST_4', planNo: 'NJD2026004', planType: 'annual', year: '2026', month: '',
    department: '市场部', status: 'approved', createTime: '2026-06-13 14:00:00', creator: '赵六',
    remark: '测试采购计划4-年度采购', currentNodeId: '', currentNodeName: '', flowConfigId: 'AFC002',
    details: [
      {
        id: 'PPD_TEST_4_1', planId: 'PP_TEST_4', seq: 1,
        projectName: '展会搭建服务', projectNature: '服务', projectOverview: '展会展台搭建物资采购',
        budgetAmount: 120, estimatedCost: 115, approvalDate: '2026-06-10', approvalFileNo: '2026年度采购审批004',
      }
    ],
  },
  {
    id: 'PP_TEST_5', planNo: 'YJD202606005', planType: 'monthly', year: '2026', month: '06',
    department: '采购部', status: 'approved', createTime: '2026-06-14 09:30:00', creator: '孙七',
    remark: '测试采购计划5-月度采购', currentNodeId: '', currentNodeName: '', flowConfigId: 'AFC001',
    details: [
      {
        id: 'PPD_TEST_5_1', planId: 'PP_TEST_5', seq: 1,
        projectName: '地沟维修工程', projectNature: '工程', projectOverview: '地下通道地沟盖板更换',
        budgetAmount: 45, estimatedCost: 42, approvalDate: '2026-06-12', approvalFileNo: '2026月度采购审批005',
      }
    ],
  },
  {
    id: 'PP_TEST_6', planNo: 'NJD2026006', planType: 'annual', year: '2026', month: '',
    department: '工程部', status: 'pending', createTime: '2026-06-15 10:30:00', creator: '周八',
    remark: '测试采购计划6-待审批', currentNodeId: 'NODE2_1700000000000', currentNodeName: '工程部审核', flowConfigId: 'AFC002',
    details: [
      {
        id: 'PPD_TEST_6_1', planId: 'PP_TEST_6', seq: 1,
        projectName: '石材配件补充', projectNature: '工程', projectOverview: '石材干挂配件批量采购',
        budgetAmount: 60, estimatedCost: 58, approvalDate: '', approvalFileNo: '',
      }
    ],
  },
  {
    id: 'PP_TEST_7', planNo: 'YJD202606007', planType: 'monthly', year: '2026', month: '06',
    department: '运维部', status: 'approved', createTime: '2026-06-16 13:00:00', creator: '张三',
    remark: '测试采购计划7-月度采购', currentNodeId: '', currentNodeName: '', flowConfigId: 'AFC001',
    details: [
      {
        id: 'PPD_TEST_7_1', planId: 'PP_TEST_7', seq: 1,
        projectName: '井盖维护项目', projectNature: '工程', projectOverview: '各类井盖规格补充采购',
        budgetAmount: 35, estimatedCost: 33, approvalDate: '2026-06-14', approvalFileNo: '2026月度采购审批007',
      }
    ],
  },
  {
    id: 'PP_TEST_8', planNo: 'NJD2026008', planType: 'annual', year: '2026', month: '',
    department: '市场部', status: 'approved', createTime: '2026-06-17 15:00:00', creator: '李四',
    remark: '测试采购计划8-年度采购', currentNodeId: '', currentNodeName: '', flowConfigId: 'AFC002',
    details: [
      {
        id: 'PPD_TEST_8_1', planId: 'PP_TEST_8', seq: 1,
        projectName: '展会物资筹备', projectNature: '服务', projectOverview: '年度展会物资储备采购',
        budgetAmount: 90, estimatedCost: 85, approvalDate: '2026-06-15', approvalFileNo: '2026年度采购审批008',
      }
    ],
  },
  // ===== 测试数据结束 =====
];

// 审批流程配置数据
const buildNodes = (nodes: Array<{ name: string; role: string; approver?: string; desc?: string }>): ApprovalFlowNode[] => {
  return nodes.map((n, i) => ({
    id: 'NODE' + (i + 1) + '_' + Date.now(),
    nodeName: n.name,
    nodeOrder: i + 1,
    approverRole: n.role,
    approverName: n.approver,
    description: n.desc,
    isRequired: true,
  }));
};

export const approvalFlowConfigs: ApprovalFlowConfig[] = [
  {
    id: 'AFC001',
    flowName: '采购计划-月度标准审批流程',
    businessType: 'procurement_plan',
    businessSubType: 'monthly',
    nodes: buildNodes([
      { name: '部门负责人审批', role: '部门负责人', approver: '业务经理-王', desc: '部门负责人初审' },
      { name: '采购管理部审核', role: '采购管理员', approver: '采购主管-李', desc: '采购部门审核计划合理性' },
      { name: '分管领导审批', role: '分管领导', approver: '副总经理-陈', desc: '分管领导审批' },
      { name: '总经理审批', role: '总经理', approver: '总经理', desc: '总经理最终审批' },
    ]),
    isActive: true,
    description: '月度采购计划标准审批流程',
    createTime: '2024-01-01 09:00:00',
    creator: '系统管理员',
  },
  {
    id: 'AFC002',
    flowName: '采购计划-年度标准审批流程',
    businessType: 'procurement_plan',
    businessSubType: 'annual',
    nodes: buildNodes([
      { name: '部门负责人编制', role: '部门负责人', approver: '业务经理-王', desc: '部门编制年度计划' },
      { name: '采购管理部审核', role: '采购管理员', approver: '采购主管-李', desc: '采购部门审核' },
      { name: '财务部审核', role: '财务', approver: '财务经理-刘', desc: '财务部预算审核' },
      { name: '分管领导审批', role: '分管领导', approver: '副总经理-陈', desc: '分管领导审批' },
      { name: '总经理审批', role: '总经理', approver: '总经理', desc: '总经理最终审批' },
      { name: '董事会审批', role: '董事会', approver: '董事长', desc: '董事会备案审批' },
    ]),
    isActive: true,
    description: '年度采购计划标准审批流程（多层级）',
    createTime: '2024-01-01 09:00:00',
    creator: '系统管理员',
  },
  {
    id: 'AFC003',
    flowName: '采购计划-简化审批流程',
    businessType: 'procurement_plan',
    businessSubType: 'monthly',
    nodes: buildNodes([
      { name: '采购管理员审核', role: '采购管理员', approver: '采购主管-李', desc: '采购部门审核' },
      { name: '总经理审批', role: '总经理', approver: '总经理', desc: '总经理审批' },
    ]),
    isActive: false,
    description: '简化版审批流程（用于小额月度计划）',
    createTime: '2024-01-01 09:00:00',
    creator: '系统管理员',
  },
];

// 采购需求申请数据
export const procurementDemands: ProcurementDemand[] = [
  {
    id: 'PD001',
    demandNo: 'CGQQ20240620001',
    demandType: 'material',
    procurementType: 'framework',
    applicant: '业务经理-王',
    applicantDept: '会展部',
    applyDate: '2024-06-20',
    projectName: '展会物资采购',
    reason: '为6月展会储备物资',
    status: 'approved',
    createTime: '2024-06-20 09:00:00',
    approveTime: '2024-06-21 10:00:00',
    approver: '总经理',
    details: [
      {
        id: 'PDD001',
        demandId: 'PD001',
        productCode: 'P10001',
        productName: '展板',
        unit: '块',
        quantity: 50,
        unitPriceExcludingTax: 180,
        unitPriceIncludingTax: 203.4,
        taxRate: 13,
        amountExcludingTax: 9000,
        taxAmount: 1170,
        amountIncludingTax: 10170,
        stockQuantity: 150,
      },
      {
        id: 'PDD002',
        demandId: 'PD001',
        productCode: 'P10002',
        productName: '展架',
        unit: '套',
        quantity: 30,
        unitPriceExcludingTax: 550,
        unitPriceIncludingTax: 621.5,
        taxRate: 13,
        amountExcludingTax: 16500,
        taxAmount: 2145,
        amountIncludingTax: 18645,
        stockQuantity: 95,
      },
    ],
    budgetAudit: {
      budgetAmount: 28815,
      auditAmount: 28815,
    },
  },
  {
    id: 'PD002',
    demandNo: 'CGQQ20240625001',
    demandType: 'service_project',
    procurementType: 'mixed',
    applicant: '采购主管-赵',
    applicantDept: '采购部',
    applyDate: '2024-06-25',
    projectName: '设备维修服务',
    reason: '紧急维修需求',
    status: 'pending',
    createTime: '2024-06-25 14:00:00',
    details: [],
  },
  {
    id: 'PD003',
    demandNo: 'CGQQ20240626001',
    demandType: 'material',
    procurementType: 'once',
    applicant: '孙七',
    applicantDept: '会展部',
    applyDate: '2024-06-26',
    projectName: '新物资采购测试',
    reason: '展会新物资采购需求',
    status: 'approved',
    createTime: '2024-06-26 09:00:00',
    approveTime: '2024-06-26 14:00:00',
    approver: '总经理',
    estimatedAmount: 570000,
    requiredDeliveryDate: '2024-07-10',
    budgetAudit: {
      budgetAmount: 570000,
      auditAmount: 570000,
    },
    details: [
      {
        id: 'PDD007',
        demandId: 'PD003',
        productCode: 'QD2001',
        productName: '电缆',
        specification: '6㎡（单线63A头/15米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 132.74,
        unitPriceIncludingTax: 150,
        taxRate: 13,
        amountExcludingTax: 13274,
        taxAmount: 1726,
        amountIncludingTax: 15000,
        stockQuantity: 0,
      },
      {
        id: 'PDD008',
        demandId: 'PD003',
        productCode: 'QD2002',
        productName: '电缆',
        specification: '6㎡（单线125A头/15米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 159.29,
        unitPriceIncludingTax: 180,
        taxRate: 13,
        amountExcludingTax: 15929,
        taxAmount: 2071,
        amountIncludingTax: 18000,
        stockQuantity: 0,
      },
      {
        id: 'PDD009',
        demandId: 'PD003',
        productCode: 'QD2003',
        productName: '电缆',
        specification: '4㎡（单线32A头/15米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 106.19,
        unitPriceIncludingTax: 120,
        taxRate: 13,
        amountExcludingTax: 10619,
        taxAmount: 1381,
        amountIncludingTax: 12000,
        stockQuantity: 0,
      },
      {
        id: 'PDD010',
        demandId: 'PD003',
        productCode: 'QD2004',
        productName: '电缆',
        specification: '16㎡（无头/15米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 265.49,
        unitPriceIncludingTax: 300,
        taxRate: 13,
        amountExcludingTax: 26549,
        taxAmount: 3451,
        amountIncludingTax: 30000,
        stockQuantity: 0,
      },
      {
        id: 'PDD011',
        demandId: 'PD003',
        productCode: 'QD2005',
        productName: '电缆',
        specification: '4㎡3芯/16A/10米（16A电箱）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 176.99,
        unitPriceIncludingTax: 200,
        taxRate: 13,
        amountExcludingTax: 17699,
        taxAmount: 2301,
        amountIncludingTax: 20000,
        stockQuantity: 0,
      },
      {
        id: 'PDD012',
        demandId: 'PD003',
        productCode: 'QD2006',
        productName: '电缆',
        specification: '4㎡3芯（无头/20米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 194.69,
        unitPriceIncludingTax: 220,
        taxRate: 13,
        amountExcludingTax: 19469,
        taxAmount: 2531,
        amountIncludingTax: 22000,
        stockQuantity: 0,
      },
      {
        id: 'PDD013',
        demandId: 'PD003',
        productCode: 'QD2007',
        productName: '电缆',
        specification: '25㎡（无头带铜鼻子/20米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 353.98,
        unitPriceIncludingTax: 400,
        taxRate: 13,
        amountExcludingTax: 35398,
        taxAmount: 4602,
        amountIncludingTax: 40000,
        stockQuantity: 0,
      },
      {
        id: 'PDD014',
        demandId: 'PD003',
        productCode: 'QD2008',
        productName: '电缆',
        specification: '16㎡（无头带铜鼻子/20米长）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 309.73,
        unitPriceIncludingTax: 350,
        taxRate: 13,
        amountExcludingTax: 30973,
        taxAmount: 4027,
        amountIncludingTax: 35000,
        stockQuantity: 0,
      },
      {
        id: 'PDD015',
        demandId: 'PD003',
        productCode: 'QD2009',
        productName: '电缆',
        specification: '4㎡（无头/85米长）（3芯）',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 247.79,
        unitPriceIncludingTax: 280,
        taxRate: 13,
        amountExcludingTax: 24779,
        taxAmount: 3221,
        amountIncludingTax: 28000,
        stockQuantity: 0,
      },
      {
        id: 'PDD016',
        demandId: 'PD003',
        productCode: 'QD2010',
        productName: '配电箱',
        specification: '16A',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 176.99,
        unitPriceIncludingTax: 200,
        taxRate: 13,
        amountExcludingTax: 17699,
        taxAmount: 2301,
        amountIncludingTax: 20000,
        stockQuantity: 0,
      },
      {
        id: 'PDD017',
        demandId: 'PD003',
        productCode: 'QD2011',
        productName: '配电箱',
        specification: '32A',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 221.24,
        unitPriceIncludingTax: 250,
        taxRate: 13,
        amountExcludingTax: 22124,
        taxAmount: 2876,
        amountIncludingTax: 25000,
        stockQuantity: 0,
      },
      {
        id: 'PDD018',
        demandId: 'PD003',
        productCode: 'QD2012',
        productName: '配电箱',
        specification: '63A',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 353.98,
        unitPriceIncludingTax: 400,
        taxRate: 13,
        amountExcludingTax: 35398,
        taxAmount: 4602,
        amountIncludingTax: 40000,
        stockQuantity: 0,
      },
      {
        id: 'PDD019',
        demandId: 'PD003',
        productCode: 'QD2013',
        productName: '配电箱',
        specification: '40A',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 247.79,
        unitPriceIncludingTax: 280,
        taxRate: 13,
        amountExcludingTax: 24779,
        taxAmount: 3221,
        amountIncludingTax: 28000,
        stockQuantity: 0,
      },
      {
        id: 'PDD020',
        demandId: 'PD003',
        productCode: 'QD2014',
        productName: '配电箱',
        specification: '16A/220V',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 194.69,
        unitPriceIncludingTax: 220,
        taxRate: 13,
        amountExcludingTax: 19469,
        taxAmount: 2531,
        amountIncludingTax: 22000,
        stockQuantity: 0,
      },
      {
        id: 'PDD021',
        demandId: 'PD003',
        productCode: 'QD2015',
        productName: '配电箱',
        specification: '100A',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 442.48,
        unitPriceIncludingTax: 500,
        taxRate: 13,
        amountExcludingTax: 44248,
        taxAmount: 5752,
        amountIncludingTax: 50000,
        stockQuantity: 0,
      },
      {
        id: 'PDD022',
        demandId: 'PD003',
        productCode: 'QD2016',
        productName: '手拉吊葫芦',
        specification: '1T/12米',
        unit: '个',
        quantity: 100,
        unitPriceExcludingTax: 707.96,
        unitPriceIncludingTax: 800,
        taxRate: 13,
        amountExcludingTax: 70796,
        taxAmount: 9204,
        amountIncludingTax: 80000,
        stockQuantity: 0,
      },
      {
        id: 'PDD023',
        demandId: 'PD003',
        productCode: 'QD2017',
        productName: '黑色吊带（蓝色头）',
        specification: '2T/2米',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 44.25,
        unitPriceIncludingTax: 50,
        taxRate: 13,
        amountExcludingTax: 4425,
        taxAmount: 575,
        amountIncludingTax: 5000,
        stockQuantity: 0,
      },
      {
        id: 'PDD024',
        demandId: 'PD003',
        productCode: 'QD2018',
        productName: '黑色吊带（红色头）',
        specification: '2T/4米',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 53.1,
        unitPriceIncludingTax: 60,
        taxRate: 13,
        amountExcludingTax: 5310,
        taxAmount: 690,
        amountIncludingTax: 6000,
        stockQuantity: 0,
      },
      {
        id: 'PDD025',
        demandId: 'PD003',
        productCode: 'QD2019',
        productName: '黑色吊带（绿色头）',
        specification: '2T/8米',
        unit: '根',
        quantity: 100,
        unitPriceExcludingTax: 70.8,
        unitPriceIncludingTax: 80,
        taxRate: 13,
        amountExcludingTax: 7080,
        taxAmount: 920,
        amountIncludingTax: 8000,
        stockQuantity: 0,
      },
    ],
  },
];

// 合同台账数据
export const contractLedgers: ContractLedger[] = [
  {
    id: 'CL001',
    contractId: 'CT001',
    contractNo: 'HT20240101001',
    contractName: '2024年度会展物资采购合同',
    category: 'procurement',
    contractType: 'non_engineering',
    formation: 'online',
    demandDepartment: '会展部',
    handlingDepartment: '采购部',
    handler: '张三',
    counterpartyName: '华东钢材有限公司',
    signingDate: '2024-01-01',
    effectiveDate: '2024-01-01',
    terminationDate: '2024-12-31',
    amount: 500,
    paidAmount: 300,
    settlementAmount: 500,
    performanceStatus: '进行中',
    businessCategory: 'expense',
    subType: 'procurement',
    status: 'active',
  },
  {
    id: 'CL002',
    contractId: 'CT002',
    contractNo: 'HT20240301001',
    contractName: '固定资产设备采购合同',
    category: 'procurement',
    contractType: 'engineering',
    formation: 'online',
    demandDepartment: '工程部',
    handlingDepartment: '采购部',
    handler: '李四',
    counterpartyName: '华北铝业集团',
    signingDate: '2024-03-01',
    effectiveDate: '2024-03-01',
    terminationDate: '2024-09-30',
    amount: 800,
    paidAmount: 800,
    settlementAmount: 800,
    performanceStatus: '已完成',
    businessCategory: 'expense',
    subType: 'procurement',
    status: 'expired',
  },
];

// 采购订单数据
export const procurementOrders: ProcurementOrder[] = [
  {
    id: 'PO001',
    orderNo: 'CGDD20240620001',
    demandId: 'PD001',
    demandNo: 'CGQQ20240620001',
    contractId: 'CT001',
    contractNo: 'HT20240101001',
    supplierId: 'SUP001',
    supplierName: '华东钢材有限公司',
    status: 'completed',
    createTime: '2024-06-20 15:00:00',
    creator: '仓库主管-李',
    approveTime: '2024-06-20 16:00:00',
    approver: '采购主管-赵',
    sentTime: '2024-06-20 17:00:00',
    details: [
      {
        id: 'POD001',
        orderId: 'PO001',
        productId: 'PRD001',
        productCode: 'P10001',
        productName: '展板',
        unit: '块',
        quantity: 50,
        unitPrice: 203.4,
        amount: 10170,
      },
      {
        id: 'POD002',
        orderId: 'PO001',
        productId: 'PRD002',
        productCode: 'P10002',
        productName: '展架',
        unit: '套',
        quantity: 30,
        unitPrice: 621.5,
        amount: 18645,
      },
    ],
  },
  {
    id: 'PO002',
    orderNo: 'CGDD20240627001',
    sourceType: 'one_time',
    demandId: 'PD003',
    demandNo: 'CGQQ20240626001',
    supplierId: 'SUP001',
    supplierName: '华东钢材有限公司',
    status: 'pending',
    createTime: '2024-06-27 10:00:00',
    creator: '仓库主管-李',
    creatorDept: '仓储部',
    handler: '张三',
    handlingDepartment: '采购部',
    deliveryDate: '2024-07-10',
    deliveryAddress: '会展仓库',
    contactPerson: '张三',
    details: [
      {
        id: 'POD003',
        orderId: 'PO002',
        productId: 'PRD770',
        productCode: 'QD2001',
        productName: '电缆',
        specification: '6㎡（单线63A头/15米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 150,
        amount: 15000,
      },
      {
        id: 'POD004',
        orderId: 'PO002',
        productId: 'PRD771',
        productCode: 'QD2002',
        productName: '电缆',
        specification: '6㎡（单线125A头/15米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 180,
        amount: 18000,
      },
      {
        id: 'POD005',
        orderId: 'PO002',
        productId: 'PRD772',
        productCode: 'QD2003',
        productName: '电缆',
        specification: '4㎡（单线32A头/15米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 120,
        amount: 12000,
      },
      {
        id: 'POD006',
        orderId: 'PO002',
        productId: 'PRD773',
        productCode: 'QD2004',
        productName: '电缆',
        specification: '16㎡（无头/15米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 300,
        amount: 30000,
      },
      {
        id: 'POD007',
        orderId: 'PO002',
        productId: 'PRD774',
        productCode: 'QD2005',
        productName: '电缆',
        specification: '4㎡3芯/16A/10米（16A电箱）',
        unit: '根',
        quantity: 100,
        unitPrice: 200,
        amount: 20000,
      },
      {
        id: 'POD008',
        orderId: 'PO002',
        productId: 'PRD775',
        productCode: 'QD2006',
        productName: '电缆',
        specification: '4㎡3芯（无头/20米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 220,
        amount: 22000,
      },
      {
        id: 'POD009',
        orderId: 'PO002',
        productId: 'PRD776',
        productCode: 'QD2007',
        productName: '电缆',
        specification: '25㎡（无头带铜鼻子/20米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 400,
        amount: 40000,
      },
      {
        id: 'POD010',
        orderId: 'PO002',
        productId: 'PRD777',
        productCode: 'QD2008',
        productName: '电缆',
        specification: '16㎡（无头带铜鼻子/20米长）',
        unit: '根',
        quantity: 100,
        unitPrice: 350,
        amount: 35000,
      },
      {
        id: 'POD011',
        orderId: 'PO002',
        productId: 'PRD778',
        productCode: 'QD2009',
        productName: '电缆',
        specification: '4㎡（无头/85米长）（3芯）',
        unit: '根',
        quantity: 100,
        unitPrice: 280,
        amount: 28000,
      },
      {
        id: 'POD012',
        orderId: 'PO002',
        productId: 'PRD779',
        productCode: 'QD2010',
        productName: '配电箱',
        specification: '16A',
        unit: '个',
        quantity: 100,
        unitPrice: 200,
        amount: 20000,
      },
      {
        id: 'POD013',
        orderId: 'PO002',
        productId: 'PRD780',
        productCode: 'QD2011',
        productName: '配电箱',
        specification: '32A',
        unit: '个',
        quantity: 100,
        unitPrice: 250,
        amount: 25000,
      },
      {
        id: 'POD014',
        orderId: 'PO002',
        productId: 'PRD781',
        productCode: 'QD2012',
        productName: '配电箱',
        specification: '63A',
        unit: '个',
        quantity: 100,
        unitPrice: 400,
        amount: 40000,
      },
      {
        id: 'POD015',
        orderId: 'PO002',
        productId: 'PRD782',
        productCode: 'QD2013',
        productName: '配电箱',
        specification: '40A',
        unit: '个',
        quantity: 100,
        unitPrice: 280,
        amount: 28000,
      },
      {
        id: 'POD016',
        orderId: 'PO002',
        productId: 'PRD783',
        productCode: 'QD2014',
        productName: '配电箱',
        specification: '16A/220V',
        unit: '个',
        quantity: 100,
        unitPrice: 220,
        amount: 22000,
      },
      {
        id: 'POD017',
        orderId: 'PO002',
        productId: 'PRD784',
        productCode: 'QD2015',
        productName: '配电箱',
        specification: '100A',
        unit: '个',
        quantity: 100,
        unitPrice: 500,
        amount: 50000,
      },
      {
        id: 'POD018',
        orderId: 'PO002',
        productId: 'PRD785',
        productCode: 'QD2016',
        productName: '手拉吊葫芦',
        specification: '1T/12米',
        unit: '个',
        quantity: 100,
        unitPrice: 800,
        amount: 80000,
      },
      {
        id: 'POD019',
        orderId: 'PO002',
        productId: 'PRD786',
        productCode: 'QD2017',
        productName: '黑色吊带（蓝色头）',
        specification: '2T/2米',
        unit: '根',
        quantity: 100,
        unitPrice: 50,
        amount: 5000,
      },
      {
        id: 'POD020',
        orderId: 'PO002',
        productId: 'PRD787',
        productCode: 'QD2018',
        productName: '黑色吊带（红色头）',
        specification: '2T/4米',
        unit: '根',
        quantity: 100,
        unitPrice: 60,
        amount: 6000,
      },
      {
        id: 'POD021',
        orderId: 'PO002',
        productId: 'PRD788',
        productCode: 'QD2019',
        productName: '黑色吊带（绿色头）',
        specification: '2T/8米',
        unit: '根',
        quantity: 100,
        unitPrice: 80,
        amount: 8000,
      },
    ],
  },
];

// 验收记录数据
export const procurementInspections: ProcurementInspection[] = [
  {
    id: 'PI001',
    inspectionNo: 'YS20240625001',
    orderId: 'PO001',
    orderNo: 'CGDD20240620001',
    supplierId: 'SUP001',
    supplierName: '华东钢材有限公司',
    inspectionDate: '2024-06-25',
    inspector: '仓库主管-李',
    status: 'approved',
    approveTime: '2024-06-25 10:00:00',
    approver: '采购主管-赵',
    details: [
      {
        id: 'PID001',
        productId: 'PRD001',
        productCode: 'P10001',
        productName: '展板',
        unit: '块',
        orderedQuantity: 50,
        inspectedQuantity: 50,
        passQuantity: 50,
        failQuantity: 0,
        isQualified: true,
      },
      {
        id: 'PID002',
        productId: 'PRD002',
        productCode: 'P10002',
        productName: '展架',
        unit: '套',
        orderedQuantity: 30,
        inspectedQuantity: 30,
        passQuantity: 28,
        failQuantity: 2,
        isQualified: false,
        remark: '2套有轻微划痕',
      },
    ],
  },
];
