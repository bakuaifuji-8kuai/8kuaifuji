import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import type { ContractPurchaseOrder, ContractPurchaseOrderDetail, ContractPurchaseOrderStatus, ContractPurchaseOrderChangeRecord } from '@/types';

// 测试数据：执行中的合同
const MOCK_CONTRACTS = [
  {
    id: 'C001', contractNo: 'HT-2026-001', contractName: '办公设备采购框架合同',
    supplierId: 'SUP001', supplierName: '晨光办公用品有限公司',
    totalDuration: '12个月', acceptanceStandard: '按合同附件技术标准验收',
    paymentTerms: '货到验收合格后30日内付款',
    products: [
      { productId: 'P001', productCode: 'BG-001', productName: '办公桌', specification: '1.4m×0.6m×0.75m', unit: '张', contractQuantity: 50, deliveredQuantity: 10, unitPrice: 800 },
      { productId: 'P002', productCode: 'BG-002', productName: '办公椅', specification: '人体工学款', unit: '把', contractQuantity: 100, deliveredQuantity: 20, unitPrice: 350 },
      { productId: 'P003', productCode: 'BG-003', productName: '文件柜', specification: '四门铁皮柜', unit: '个', contractQuantity: 20, deliveredQuantity: 5, unitPrice: 1200 },
    ]
  },
  {
    id: 'C002', contractNo: 'HT-2026-002', contractName: '会展展具租赁合同',
    supplierId: 'SUP002', supplierName: '华展展览服务有限公司',
    totalDuration: '6个月', acceptanceStandard: '展具无损坏、功能正常',
    paymentTerms: '租赁期满后15日内结算',
    products: [
      { productId: 'P010', productCode: 'HZ-001', productName: '标准展位展板', specification: '1m×2.5m', unit: '块', contractQuantity: 200, deliveredQuantity: 50, unitPrice: 150 },
      { productId: 'P011', productCode: 'HZ-002', productName: '展位灯光', specification: 'LED射灯', unit: '盏', contractQuantity: 100, deliveredQuantity: 0, unitPrice: 80 },
    ]
  },
  {
    id: 'C003', contractNo: 'HT-2026-003', contractName: '展会物资采购合同',
    supplierId: 'SUP001', supplierName: '华东物资供应有限公司',
    totalDuration: '3个月', acceptanceStandard: '按合同附件技术标准验收',
    paymentTerms: '货到验收合格后30日内付款',
    products: [
      { productId: 'PRD770', productCode: 'QD2001', productName: '电缆', specification: '6㎡（单线63A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 150 },
      { productId: 'PRD771', productCode: 'QD2002', productName: '电缆', specification: '6㎡（单线125A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 180 },
      { productId: 'PRD772', productCode: 'QD2003', productName: '电缆', specification: '4㎡（单线32A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 120 },
      { productId: 'PRD773', productCode: 'QD2004', productName: '电缆', specification: '16㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 250 },
      { productId: 'PRD774', productCode: 'QD2005', productName: '电缆', specification: '25㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 350 },
      { productId: 'PRD775', productCode: 'QD2006', productName: '电缆', specification: '35㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 480 },
      { productId: 'PRD776', productCode: 'QD2007', productName: '电缆', specification: '50㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 650 },
      { productId: 'PRD777', productCode: 'QD2008', productName: '电缆', specification: '70㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 850 },
      { productId: 'PRD778', productCode: 'QD2009', productName: '电缆', specification: '95㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 1100 },
      { productId: 'PRD779', productCode: 'QD2010', productName: '电缆', specification: '120㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 1350 },
      { productId: 'PRD780', productCode: 'QD2011', productName: '电缆', specification: '150㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 1650 },
      { productId: 'PRD781', productCode: 'QD2012', productName: '电缆', specification: '185㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 2000 },
      { productId: 'PRD782', productCode: 'QD2013', productName: '电缆', specification: '240㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 2500 },
      { productId: 'PRD783', productCode: 'QD2014', productName: '电缆', specification: '300㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 3000 },
      { productId: 'PRD784', productCode: 'QD2015', productName: '电缆', specification: '400㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 3800 },
      { productId: 'PRD785', productCode: 'XS1001', productName: '线鼻子', specification: '10-400㎡', unit: '个', contractQuantity: 500, deliveredQuantity: 0, unitPrice: 15 },
      { productId: 'PRD786', productCode: 'XS1002', productName: '热缩管', specification: 'Φ20-Φ100', unit: '米', contractQuantity: 500, deliveredQuantity: 0, unitPrice: 12 },
      { productId: 'PRD787', productCode: 'XS1003', productName: '电缆桥架', specification: '200*100', unit: '米', contractQuantity: 200, deliveredQuantity: 0, unitPrice: 85 },
      { productId: 'PRD788', productCode: 'XS1004', productName: '接地铜线', specification: '16㎡多股', unit: '米', contractQuantity: 500, deliveredQuantity: 0, unitPrice: 28 },
    ]
  },

];

const MOCK_INITIAL_ORDERS: ContractPurchaseOrder[] = [
  {
    id: 'CPO001', orderNo: 'CPO20260601001',
    contractId: 'C001', contractNo: 'HT-2026-001', contractName: '办公设备采购框架合同',
    supplierId: 'SUP001', supplierName: '晨光办公用品有限公司',
    totalDuration: '12个月', acceptanceStandard: '按合同附件技术标准验收', paymentTerms: '货到验收合格后30日内付款',
    procurementDemandId: 'PD001', procurementDemandNo: 'CGXQ-20260601-001',
    projectId: 'PRJ001', projectName: '2026年办公室升级项目', projectType: 'implementation_project',
    status: 'submitted', createTime: '2026-06-01 09:00:00', creator: '管理员',
    submitTime: '2026-06-01 10:30:00',
    details: [
      { id: 'D001', orderId: 'CPO001', productId: 'P001', productCode: 'BG-001', productName: '办公桌', specification: '1.4m×0.6m×0.75m', unit: '张', contractQuantity: 50, deliveredQuantity: 5, orderQuantity: 10, unitPrice: 800, amount: 8000, deliveryDate: '2026-06-15', remark: '' },
      { id: 'D002', orderId: 'CPO001', productId: 'P002', productCode: 'BG-002', productName: '办公椅', specification: '人体工学款', unit: '把', contractQuantity: 100, deliveredQuantity: 8, orderQuantity: 15, unitPrice: 350, amount: 5250, deliveryDate: '2026-06-15', remark: '' },
    ]
  },
  {
    id: 'CPO002', orderNo: 'CPO20260605001',
    contractId: 'C002', contractNo: 'HT-2026-002', contractName: '会展展具租赁合同',
    supplierId: 'SUP002', supplierName: '华展展览服务有限公司',
    totalDuration: '6个月', acceptanceStandard: '展具无损坏、功能正常', paymentTerms: '租赁期满后15日内结算',
    procurementDemandId: 'PD002', procurementDemandNo: 'CGXQ-20260605-001',
    projectId: 'PRJ002', projectName: '国际会展中心展台搭建', projectType: 'service_project',
    status: 'draft', createTime: '2026-06-05 14:20:00', creator: '管理员',
    details: [
      { id: 'D003', orderId: 'CPO002', productId: 'P010', productCode: 'HZ-001', productName: '标准展位展板', specification: '1m×2.5m', unit: '块', contractQuantity: 200, deliveredQuantity: 10, orderQuantity: 30, unitPrice: 150, amount: 4500, deliveryDate: '2026-06-20', remark: '' },
    ]
  },
  {
    id: 'CPO003', orderNo: 'CPO20260626001',
    contractId: 'C003', contractNo: 'HT-2026-003', contractName: '展会物资采购合同',
    supplierId: 'SUP001', supplierName: '华东物资供应有限公司',
    totalDuration: '3个月', acceptanceStandard: '按合同附件技术标准验收', paymentTerms: '货到验收合格后30日内付款',
    procurementDemandId: 'PD003', procurementDemandNo: 'CGQQ20240626001',
    projectId: 'PRJ003', projectName: '新物资采购测试', projectType: 'implementation_project',
    status: 'submitted', createTime: '2026-06-26 10:00:00', creator: '孙七',
    details: [
      { id: 'D004', orderId: 'CPO003', productId: 'PRD770', productCode: 'QD2001', productName: '电缆', specification: '6㎡（单线63A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 150, amount: 15000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D005', orderId: 'CPO003', productId: 'PRD771', productCode: 'QD2002', productName: '电缆', specification: '6㎡（单线125A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 180, amount: 18000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D006', orderId: 'CPO003', productId: 'PRD772', productCode: 'QD2003', productName: '电缆', specification: '4㎡（单线32A头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 120, amount: 12000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D007', orderId: 'CPO003', productId: 'PRD773', productCode: 'QD2004', productName: '电缆', specification: '16㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 250, amount: 25000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D008', orderId: 'CPO003', productId: 'PRD774', productCode: 'QD2005', productName: '电缆', specification: '25㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 350, amount: 35000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D009', orderId: 'CPO003', productId: 'PRD775', productCode: 'QD2006', productName: '电缆', specification: '35㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 480, amount: 48000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D010', orderId: 'CPO003', productId: 'PRD776', productCode: 'QD2007', productName: '电缆', specification: '50㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 650, amount: 65000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D011', orderId: 'CPO003', productId: 'PRD777', productCode: 'QD2008', productName: '电缆', specification: '70㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 850, amount: 85000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D012', orderId: 'CPO003', productId: 'PRD778', productCode: 'QD2009', productName: '电缆', specification: '95㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 1100, amount: 110000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D013', orderId: 'CPO003', productId: 'PRD779', productCode: 'QD2010', productName: '电缆', specification: '120㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 1350, amount: 135000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D014', orderId: 'CPO003', productId: 'PRD780', productCode: 'QD2011', productName: '电缆', specification: '150㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 1650, amount: 165000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D015', orderId: 'CPO003', productId: 'PRD781', productCode: 'QD2012', productName: '电缆', specification: '185㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 2000, amount: 200000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D016', orderId: 'CPO003', productId: 'PRD782', productCode: 'QD2013', productName: '电缆', specification: '240㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 2500, amount: 250000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D017', orderId: 'CPO003', productId: 'PRD783', productCode: 'QD2014', productName: '电缆', specification: '300㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 3000, amount: 300000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D018', orderId: 'CPO003', productId: 'PRD784', productCode: 'QD2015', productName: '电缆', specification: '400㎡（无头/15米长）', unit: '根', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 3800, amount: 380000, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D019', orderId: 'CPO003', productId: 'PRD785', productCode: 'XS1001', productName: '线鼻子', specification: '10-400㎡', unit: '个', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 15, amount: 1500, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D020', orderId: 'CPO003', productId: 'PRD786', productCode: 'XS1002', productName: '热缩管', specification: 'Φ20-Φ100', unit: '米', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 12, amount: 1200, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D021', orderId: 'CPO003', productId: 'PRD787', productCode: 'XS1003', productName: '电缆桥架', specification: '200*100', unit: '米', contractQuantity: 200, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 85, amount: 8500, deliveryDate: '2026-07-10', remark: '' },
      { id: 'D022', orderId: 'CPO003', productId: 'PRD788', productCode: 'XS1004', productName: '接地铜线', specification: '16㎡多股', unit: '米', contractQuantity: 500, deliveredQuantity: 0, orderQuantity: 100, unitPrice: 28, amount: 2800, deliveryDate: '2026-07-10', remark: '' },
    ]
  },

];

export default function ContractPurchaseOrderPage() {
  const contractPurchaseOrders = useStore((s) => s.contractPurchaseOrders);
  const addContractPurchaseOrder = useStore((s) => s.addContractPurchaseOrder);
  const updateContractPurchaseOrder = useStore((s) => s.updateContractPurchaseOrder);
  const deleteContractPurchaseOrder = useStore((s) => s.deleteContractPurchaseOrder);
  const procurementDemands = useStore((s) => s.procurementDemands);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);
  // 变更相关
  const contractPurchaseOrderChanges = useStore((s) => s.contractPurchaseOrderChanges);
  const addContractPurchaseOrderChange = useStore((s) => s.addContractPurchaseOrderChange);
  const approveContractPurchaseOrderChange = useStore((s) => s.approveContractPurchaseOrderChange);
  const rejectContractPurchaseOrderChange = useStore((s) => s.rejectContractPurchaseOrderChange);

  const [filterNo, setFilterNo] = useState('');
  const [filterContractNo, setFilterContractNo] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({ no: '', contractNo: '', supplier: '', status: '' });

  const filteredData = useMemo(() => {
    return contractPurchaseOrders.filter(o => {
      if (applied.no && !o.orderNo.includes(applied.no)) return false;
      if (applied.contractNo && !o.contractNo.includes(applied.contractNo)) return false;
      if (applied.supplier && !o.supplierName.includes(applied.supplier)) return false;
      if (applied.status && o.status !== applied.status) return false;
      return true;
    });
  }, [contractPurchaseOrders, applied]);

  const statusMap: Record<ContractPurchaseOrderStatus, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'text-[#909399]' },
    submitted: { label: '已提交', color: 'text-[#67c23a]' },
    cancelled: { label: '已取消', color: 'text-[#f56c6c]' },
  };

  const columns: ColumnDef<ContractPurchaseOrder>[] = [
    { key: 'orderNo', title: '采购订单编号' },
    { key: 'procurementDemandNo', title: '关联需求', render: (row) => row.procurementDemandNo || '-' },
    { key: 'projectName', title: '关联项目', render: (row) => row.projectName || '-' },
    { key: 'contractNo', title: '合同编号' },
    { key: 'supplierName', title: '供应商' },
    { key: 'createTime', title: '创建时间' },
    {
      key: 'totalAmount', title: '订单总金额', align: 'right',
      render: (row) => {
        const total = row.details.reduce((sum, d) => sum + d.amount, 0);
        return `¥${total.toLocaleString()}`;
      }
    },
    {
      key: 'status', title: '状态',
      render: (row) => {
        const s = statusMap[row.status] || statusMap.draft;
        return <span className={s.color}>{s.label}</span>;
      }
    },
    {
      key: 'op', title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          {row.status === 'draft' && (
            <>
              <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
              <TextButton onClick={() => handleSubmit(row.id)}>提交</TextButton>
              <TextButton type="danger" onClick={() => {
                if (confirm(`确认删除采购订单 ${row.orderNo}？`)) deleteContractPurchaseOrder?.(row.id);
              }}>删除</TextButton>
            </>
          )}
          {row.status === 'submitted' && (
            <>
              <TextButton onClick={() => openChange(row)}>发起变更</TextButton>
              <TextButton onClick={() => setViewChangeHistory(row)}>变更记录</TextButton>
            </>
          )}
        </div>
      )
    }
  ];

  // 编辑 / 新增
  const [editItem, setEditItem] = useState<ContractPurchaseOrder | null>(null);
  const [editDetails, setEditDetails] = useState<ContractPurchaseOrderDetail[]>([]);
  const [editRemark, setEditRemark] = useState('');
  const [viewItem, setViewItem] = useState<ContractPurchaseOrder | null>(null);
  const [contractPickerOpen, setContractPickerOpen] = useState(false);
  // 变更相关状态
  const [changeItem, setChangeItem] = useState<ContractPurchaseOrderChangeRecord | null>(null);
  const [changeHistoryItem, setChangeHistoryItem] = useState<ContractPurchaseOrder | null>(null);

  const openAdd = () => {
    const now = new Date();
    setEditItem({
      id: 'CPO_' + Date.now(),
      orderNo: '',   // 保存时才生成编号
      contractId: '', contractNo: '', contractName: '',
      supplierId: '', supplierName: '',
      totalDuration: '', acceptanceStandard: '', paymentTerms: '',
      status: 'draft',
      createTime: now.toISOString().slice(0, 19).replace('T', ' '),
      creator: currentUser?.name || '管理员',
      details: [],
    });
    setEditDetails([]);
    setEditRemark('');
    setContractPickerOpen(true);
  };

  const handleSelectDemand = (demand: any) => {
    const newDetails: ContractPurchaseOrderDetail[] = demand.details.map((d: any, idx: number) => {
      const matchedProduct = products.find(
        (p) => p.name === d.productName && p.specification === d.specification
      );
      return {
        id: 'D_' + Date.now() + idx,
        orderId: editItem.id,
        productId: d.productId || matchedProduct?.id || '',
        productCode: d.productCode || matchedProduct?.code || '',
        productName: d.productName,
        specification: d.specification,
        unit: d.unit,
        contractQuantity: d.quantity,
        deliveredQuantity: 0,
        orderQuantity: d.quantity,
        unitPrice: d.unitPriceIncludingTax || 0,
        amount: d.amountIncludingTax || 0,
        deliveryDate: demand.requiredDeliveryDate || '',
        remark: '',
      };
    });
    setEditItem({
      ...editItem,
      procurementDemandId: demand.id,
      procurementDemandNo: demand.demandNo,
      projectId: demand.projectId,
      projectName: demand.projectName,
      projectType: demand.projectType,
    });
    setEditDetails(newDetails);
    setContractPickerOpen(false);
  };

  const openEdit = (row: ContractPurchaseOrder) => {
    setEditItem(row);
    setEditDetails(row.details.map(d => ({ ...d })));
    setEditRemark(row.remark || '');
    setContractPickerOpen(false);
  };

  const updateDetail = (idx: number, field: keyof ContractPurchaseOrderDetail, value: any) => {
    const newDetails = [...editDetails] as any;
    newDetails[idx] = { ...newDetails[idx] };
    newDetails[idx][field] = value;
    // 金额自动计算
    if (field === 'orderQuantity') {
      newDetails[idx].amount = Number(value) * newDetails[idx].unitPrice;
    }
    setEditDetails(newDetails);
  };

  const doValidate = (): boolean => {
    if (!editItem?.procurementDemandId) { alert('请选择采购需求'); return false; }
    if (editDetails.length === 0) { alert('请选择采购需求后添加明细'); return false; }
    if (editDetails.some(d => !d.orderQuantity || d.orderQuantity <= 0)) {
      alert('本次订单采购数量必须大于 0');
      return false;
    }
    // 数量强校验：本次订单采购总数量不可超过合同约定总数量
    for (const d of editDetails) {
      const totalAfterOrder = d.deliveredQuantity + d.orderQuantity;
      if (totalAfterOrder > d.contractQuantity) {
        alert(`物料 [${d.productName}] 的本次订单数量 + 历史已交付数量（${totalAfterOrder}）超过合同约定总数量（${d.contractQuantity}），请调整！`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!doValidate()) return;
    // 新增时才生成编号，编辑保留原编号
    const existing = contractPurchaseOrders.find(o => o.id === editItem.id);
    const isNew = !existing;
    if (isNew && !editItem.orderNo) {
      editItem.orderNo = genSerialNo(SERIAL_CONFIG.CPO, contractPurchaseOrders.map(o => o.orderNo));
    }
    const updated: ContractPurchaseOrder = {
      ...editItem,
      remark: editRemark,
      details: editDetails.map(d => ({ ...d })),
    };
    if (existing) updateContractPurchaseOrder?.(editItem.id, updated);
    else addContractPurchaseOrder?.(updated);
    setEditItem(null);
  };

  const handleSubmit = (id: string) => {
    const order = contractPurchaseOrders.find(o => o.id === id);
    if (!order || order.status !== 'draft') return;
    if (!confirm(`确认提交采购订单 ${order.orderNo}？提交后将无法再修改。`)) return;
    updateContractPurchaseOrder?.(id, {
      status: 'submitted',
      submitTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
  };

  // 发起变更
  const openChange = (order: ContractPurchaseOrder) => {
    const change: ContractPurchaseOrderChangeRecord = {
      id: 'CPOC_' + Date.now(),
      changeNo: `BG${order.orderNo}`,
      orderId: order.id,
      orderNo: order.orderNo,
      changeReason: '',
      changeTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      changer: currentUser?.name || '管理员',
      beforeDetails: [...order.details],
      afterDetails: [...order.details.map(d => ({ ...d }))],
      status: 'pending',
    };
    setChangeItem(change);
  };

  // 查看变更历史
  const setViewChangeHistory = (order: ContractPurchaseOrder) => {
    setChangeHistoryItem(order);
  };

  // 更新变更明细
  const updateChangeDetail = (idx: number, field: keyof ContractPurchaseOrderDetail, value: any) => {
    if (!changeItem) return;
    const newDetails = [...changeItem.afterDetails];
    newDetails[idx] = { ...newDetails[idx], [field]: value };
    // 金额自动计算
    if (field === 'orderQuantity') {
      newDetails[idx].amount = Number(value) * newDetails[idx].unitPrice;
    }
    setChangeItem({ ...changeItem, afterDetails: newDetails });
  };

  // 提交变更申请
  const submitChange = () => {
    if (!changeItem) return;
    if (!changeItem.changeReason.trim()) {
      alert('请填写变更原因');
      return;
    }
    // 添加变更记录
    addContractPurchaseOrderChange?.(changeItem);
    alert('变更申请已提交，等待审批');
    setChangeItem(null);
  };

  // 审批变更
  const handleApproveChange = (change: ContractPurchaseOrderChangeRecord) => {
    approveContractPurchaseOrderChange?.(change.orderId, change.id, currentUser?.name || '管理员');
    alert('变更已审批通过，订单明细已更新');
  };

  const handleRejectChange = (change: ContractPurchaseOrderChangeRecord) => {
    const reason = prompt('请输入驳回原因：');
    if (reason) {
      rejectContractPurchaseOrderChange?.(change.orderId, change.id, currentUser?.name || '管理员');
      alert('变更已驳回');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">采购订单管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增采购订单</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, contractNo: filterContractNo, supplier: filterSupplier, status: filterStatus })}
        onReset={() => {
          setFilterNo(''); setFilterContractNo(''); setFilterSupplier(''); setFilterStatus('');
          setApplied({ no: '', contractNo: '', supplier: '', status: '' });
        }}
      >
        <SearchField label="订单编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="合同编号" placeholder="请输入" value={filterContractNo} onChange={setFilterContractNo} />
        <SearchField label="供应商" placeholder="请输入" value={filterSupplier} onChange={setFilterSupplier} />
        <SearchField
          label="状态" type="select" value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'submitted', label: '已提交' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 详情弹窗 */}
      <Modal
        open={!!viewItem}
        title={`采购订单详情 - ${viewItem?.orderNo}`}
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
      >
        {viewItem && (
          <div className="space-y-4 text-sm">
            {/* 采购需求信息 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-4 py-3 text-[#303133] font-bold text-sm border-b border-[#dcdfe6]">采购需求信息（锁定）</div>
              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><span className="text-[#909399]">需求编号：</span>{viewItem.procurementDemandNo || '-'}</div>
                <div><span className="text-[#909399]">项目名称：</span>{viewItem.projectName || '-'}</div>
                <div><span className="text-[#909399]">项目类型：</span>
                  {viewItem.projectType === 'implementation_project' ? '实施项目'
                    : viewItem.projectType === 'service_project' ? '服务项目' : '-'}
                </div>
                <div><span className="text-[#909399]">供应商：</span>{viewItem.supplierName}</div>
                <div><span className="text-[#909399]">总工期：</span>{viewItem.totalDuration || '-'}</div>
                <div><span className="text-[#909399]">验收标准：</span>{viewItem.acceptanceStandard || '-'}</div>
                <div className="col-span-2"><span className="text-[#909399]">付款条款：</span>{viewItem.paymentTerms || '-'}</div>
              </div>
            </div>
            {/* 订单信息 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-4 py-3 text-[#303133] font-bold text-sm border-b border-[#dcdfe6]">订单信息</div>
              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><span className="text-[#909399]">订单编号：</span>{viewItem.orderNo}</div>
                <div><span className="text-[#909399]">创建时间：</span>{viewItem.createTime}</div>
                <div><span className="text-[#909399]">制单人：</span>{viewItem.creator}</div>
                <div><span className="text-[#909399]">提交时间：</span>{viewItem.submitTime || '-'}</div>
                <div>
                  <span className="text-[#909399]">状态：</span>
                  <span className={statusMap[viewItem.status]?.color}>{statusMap[viewItem.status]?.label}</span>
                </div>
                <div><span className="text-[#909399]">备注：</span>{viewItem.remark || '-'}</div>
              </div>
            </div>
            {/* 明细表 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-4 py-3 text-[#303133] font-bold text-sm border-b border-[#dcdfe6]">物料明细（{viewItem.details.length} 条）</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#fafafa] text-[#606266]">
                      <th className="px-4 py-3 text-left">序号</th>
                      <th className="px-4 py-3 text-left">物料编码</th>
                      <th className="px-4 py-3 text-left">物料名称</th>
                      <th className="px-4 py-3 text-left">规格型号</th>
                      <th className="px-4 py-3 text-center">单位</th>
                      <th className="px-4 py-3 text-right">合同约定总量</th>
                      <th className="px-4 py-3 text-right">历史已交付</th>
                      <th className="px-4 py-3 text-right">本次订单量</th>
                      <th className="px-4 py-3 text-right">单价</th>
                      <th className="px-4 py-3 text-right">金额</th>
                      <th className="px-4 py-3 text-center">交货日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((d, i) => (
                      <tr key={d.id} className="border-t border-[#ebeef5]">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3">{d.productCode}</td>
                        <td className="px-4 py-3">{d.productName}</td>
                        <td className="px-4 py-3">{d.specification || '-'}</td>
                        <td className="px-4 py-3 text-center">{d.unit}</td>
                        <td className="px-4 py-3 text-right">{d.contractQuantity}</td>
                        <td className="px-4 py-3 text-right">{d.deliveredQuantity}</td>
                        <td className="px-4 py-3 text-right text-[#e6a23c] font-medium">{d.orderQuantity}</td>
                        <td className="px-4 py-3 text-right">¥{d.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">¥{d.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">{d.deliveryDate || '-'}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#f5f7fa] font-semibold border-t border-[#ebeef5]">
                      <td className="px-4 py-3" colSpan={7}>合计</td>
                      <td className="px-4 py-3 text-right">{viewItem.details.reduce((s, d) => s + d.orderQuantity, 0)}</td>
                      <td className="px-4 py-3 text-right" colSpan={2}>¥{viewItem.details.reduce((s, d) => s + d.amount, 0).toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 新增/编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={editItem && contractPurchaseOrders.find(o => o.id === editItem?.id) ? `编辑采购订单 - ${editItem.orderNo}` : '新增采购订单'}
        onClose={() => setEditItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <DefaultButton onClick={handleSave}>保存</DefaultButton>
            <PrimaryButton onClick={() => {
              if (!editItem) return;
              if (!doValidate()) return;
              const updated: ContractPurchaseOrder = {
                ...editItem,
                remark: editRemark,
                details: editDetails.map(d => ({ ...d })),
                status: 'submitted',
                submitTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
              };
              const existing = contractPurchaseOrders.find(o => o.id === editItem.id);
              if (existing) updateContractPurchaseOrder?.(editItem.id, updated);
              else addContractPurchaseOrder?.(updated);
              setEditItem(null);
              alert('采购订单已提交');
            }}>保存并提交</PrimaryButton>
          </>
        }
        width="1100px"
      >
        {editItem && (
          <div className="space-y-4">
            {/* 采购需求信息 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-[#303133] font-bold text-xs border-b border-[#dcdfe6]">采购需求信息（锁定只读）</div>
              <div className="p-4">
                {editItem.procurementDemandId ? (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><span className="text-[#909399]">需求编号：</span>{editItem.procurementDemandNo}</div>
                    <div><span className="text-[#909399]">项目名称：</span>{editItem.projectName}</div>
                    <div><span className="text-[#909399]">项目类型：</span>
                      {editItem.projectType === 'implementation_project' ? '实施项目'
                        : editItem.projectType === 'service_project' ? '服务项目' : '-'}
                    </div>
                    <div><span className="text-[#909399]">供应商：</span>{editItem.supplierName || '-'}</div>
                    <div className="col-span-3"><span className="text-[#909399]">验收标准：</span>{editItem.acceptanceStandard || '-'}</div>
                    <div className="col-span-3"><span className="text-[#909399]">付款条款：</span>{editItem.paymentTerms || '-'}</div>
                  </div>
                ) : (
                  <div className="text-xs text-[#909399] text-center py-4">
                    请点击上方"选择采购需求"按钮，系统将自动携带需求全部基础信息
                  </div>
                )}
              </div>
            </div>
            {/* 订单信息 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-[#303133] font-bold text-xs border-b border-[#dcdfe6]">订单信息</div>
              <div className="p-4 grid grid-cols-3 gap-3 text-xs">
                <div><span className="text-[#909399]">订单编号：</span>{editItem.orderNo || <span className="text-[#c0c4cc]">保存后自动生成</span>}</div>
                <div><span className="text-[#909399]">创建时间：</span>{editItem.createTime}</div>
                <div><span className="text-[#909399]">制单人：</span>{editItem.creator}</div>
                <div className="col-span-3">
                  <span className="text-[#909399]">备注：</span>
                  <input
                    type="text" className="ml-2 px-2 py-1 border border-[#dcdfe6] rounded text-xs w-96"
                    value={editRemark}
                    onChange={e => setEditRemark(e.target.value)}
                    placeholder="请输入备注"
                  />
                </div>
              </div>
            </div>
            {/* 明细 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-[#303133] border-l-2 border-[#2f54eb] pl-2">
                  物料明细（{editDetails.length} 条）
                </div>
                {editItem.status === 'draft' && (
                  <PrimaryButton size="small" onClick={() => setContractPickerOpen(true)}>
                    选择采购需求
                  </PrimaryButton>
                )}
              </div>
              <div className="border border-[#ebeef5] rounded overflow-x-auto">
                <table className="w-full text-xs min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      <th className="px-2 py-2 text-left w-10">序号</th>
                      <th className="px-2 py-2 text-left">物料编码</th>
                      <th className="px-2 py-2 text-left">物料名称</th>
                      <th className="px-2 py-2 text-left">规格型号</th>
                      <th className="px-2 py-2 text-center">单位</th>
                      <th className="px-2 py-2 text-right">合同约定总量</th>
                      <th className="px-2 py-2 text-right">历史已交付</th>
                      <th className="px-2 py-2 text-right">本次订单量 <span className="text-[#f56c6c]">*</span></th>
                      <th className="px-2 py-2 text-right">单价</th>
                      <th className="px-2 py-2 text-right">金额</th>
                      <th className="px-2 py-2 text-center">交货日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editDetails.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-3 py-8 text-center text-[#909399]">
                          暂无物料明细，请点击上方"选择采购需求"按钮选择已审批的需求
                        </td>
                      </tr>
                    ) : (
                      editDetails.map((d, idx) => (
                        <tr key={d.id} className="border-t border-[#f0f2f5]">
                          <td className="px-2 py-2">{idx + 1}</td>
                          <td className="px-2 py-2 text-[#909399] bg-[#fafafa]">{d.productCode}</td>
                          <td className="px-2 py-2">{d.productName}</td>
                          <td className="px-2 py-2 text-[#909399] bg-[#fafafa]">{d.specification || '-'}</td>
                          <td className="px-2 py-2 text-center">{d.unit}</td>
                          <td className="px-2 py-2 text-right text-[#909399]">{d.contractQuantity}</td>
                          <td className="px-2 py-2 text-right text-[#67c23a]">{d.deliveredQuantity}</td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={d.orderQuantity}
                              min={1}
                              onChange={e => updateDetail(idx, 'orderQuantity', Number(e.target.value))}
                              className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-xs text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                            />
                          </td>
                          <td className="px-2 py-2 text-right text-[#909399] bg-[#fafafa]">¥{d.unitPrice.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right text-[#909399] bg-[#fafafa]">¥{d.amount.toLocaleString()}</td>
                          <td className="px-2 py-2">
                            <input
                              type="date"
                              value={d.deliveryDate || ''}
                              onChange={e => updateDetail(idx, 'deliveryDate', e.target.value)}
                              className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-xs focus:outline-none focus:border-[#2f54eb]"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                    {editDetails.length > 0 && (
                      <tr className="bg-[#f5f7fa] font-semibold border-t border-[#ebeef5]">
                        <td className="px-2 py-2" colSpan={6}>合计</td>
                        <td className="px-2 py-2 text-right">{editDetails.reduce((s, d) => s + d.deliveredQuantity, 0)}</td>
                        <td className="px-2 py-2 text-right">{editDetails.reduce((s, d) => s + d.orderQuantity, 0)}</td>
                        <td className="px-2 py-2 text-right" colSpan={2}>¥{editDetails.reduce((s, d) => s + d.amount, 0).toLocaleString()}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {editDetails.length > 0 && (
                <div className="mt-2 text-xs text-[#e6a23c]">
                  提示：本次订单采购总数量 = 历史已交付 + 本次订单量，不可超过合同约定总数量
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 采购需求选择弹窗 */}
      <Modal
        open={contractPickerOpen}
        title="选择采购需求"
        onClose={() => setContractPickerOpen(false)}
        footer={<DefaultButton onClick={() => setContractPickerOpen(false)}>关闭</DefaultButton>}
        width="900px"
      >
        <div>
          <div className="text-xs text-[#909399] mb-3">请选择已审批通过的采购需求，系统将自动携带项目信息、物料明细、预算价格。</div>
          <div className="border border-[#ebeef5] rounded overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-3 py-2 text-left">需求编号</th>
                  <th className="px-3 py-2 text-left">项目名称</th>
                  <th className="px-3 py-2 text-left">申请人</th>
                  <th className="px-3 py-2 text-center">物料数</th>
                  <th className="px-3 py-2 text-right">预估金额</th>
                  <th className="px-3 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {procurementDemands.filter(d => d.status === 'approved').map(d => (
                  <tr key={d.id} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                    <td className="px-3 py-2">{d.demandNo}</td>
                    <td className="px-3 py-2">{d.projectName}</td>
                    <td className="px-3 py-2">{d.applicant}</td>
                    <td className="px-3 py-2 text-center">{d.details.length}</td>
                    <td className="px-3 py-2 text-right">¥{(d.estimatedAmount || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
                      <PrimaryButton size="small" onClick={() => handleSelectDemand(d)}>选择</PrimaryButton>
                    </td>
                  </tr>
                ))}
                {procurementDemands.filter(d => d.status === 'approved').length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[#909399]">暂无已审批通过的采购需求</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 变更申请弹窗 */}
      <Modal
        open={!!changeItem}
        title="采购订单变更申请"
        onClose={() => setChangeItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setChangeItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={submitChange}>提交变更</PrimaryButton>
          </>
        }
        width="1100px"
      >
        {changeItem && (
          <div className="space-y-4">
            {/* 变更基础信息 */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>
                <div className="mb-1 text-[#606266]">变更单号</div>
                <input className="w-full h-7 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]" value={changeItem.changeNo} disabled />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">订单编号</div>
                <input className="w-full h-7 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]" value={changeItem.orderNo} disabled />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">变更人</div>
                <input className="w-full h-7 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]" value={changeItem.changer} disabled />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">变更时间</div>
                <input className="w-full h-7 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]" value={changeItem.changeTime} disabled />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">变更原因 <span className="text-[#f56c6c]">*</span></div>
              <textarea
                className="w-full h-20 px-2 border border-[#dcdfe6] rounded text-xs resize-none"
                value={changeItem.changeReason}
                onChange={(e) => setChangeItem({ ...changeItem, changeReason: e.target.value })}
                placeholder="请输入变更原因（如：交货日期调整、数量调整等）"
              />
            </div>
            <div className="text-xs text-[#e6a23c] mb-2">
              提示：可修改的字段包括【本次订单量】和【交货日期】，其他字段为锁定状态
            </div>
            {/* 变更明细对比 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 变更前 */}
              <div>
                <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#909399] pl-2">变更前明细</div>
                <div className="border border-[#ebeef5] rounded overflow-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f5f7fa] sticky top-0">
                      <tr className="text-[#606266]">
                        <th className="px-2 py-2 text-left">物料编码</th>
                        <th className="px-2 py-2 text-left">物料名称</th>
                        <th className="px-2 py-2 text-right">本次订单量</th>
                        <th className="px-2 py-2 text-right">单价</th>
                        <th className="px-2 py-2 text-right">金额</th>
                        <th className="px-2 py-2 text-center">交货日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeItem.beforeDetails.map((d, i) => (
                        <tr key={i} className="border-t border-[#ebeef5]">
                          <td className="px-2 py-1">{d.productCode}</td>
                          <td className="px-2 py-1">{d.productName}</td>
                          <td className="px-2 py-1 text-right">{d.orderQuantity}</td>
                          <td className="px-2 py-1 text-right">¥{d.unitPrice.toLocaleString()}</td>
                          <td className="px-2 py-1 text-right">¥{d.amount.toLocaleString()}</td>
                          <td className="px-2 py-1 text-center">{d.deliveryDate || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* 变更后 */}
              <div>
                <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">变更后明细（可编辑）</div>
                <div className="border border-[#ebeef5] rounded overflow-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f5f7fa] sticky top-0">
                      <tr className="text-[#606266]">
                        <th className="px-2 py-2 text-left">物料编码</th>
                        <th className="px-2 py-2 text-left">物料名称</th>
                        <th className="px-2 py-2 text-right">本次订单量</th>
                        <th className="px-2 py-2 text-right">单价</th>
                        <th className="px-2 py-2 text-right">金额</th>
                        <th className="px-2 py-2 text-center">交货日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeItem.afterDetails.map((d, i) => {
                        const before = changeItem.beforeDetails[i];
                        const qtyChanged = before.orderQuantity !== d.orderQuantity;
                        const dateChanged = before.deliveryDate !== d.deliveryDate;
                        return (
                          <tr key={i} className={`border-t border-[#ebeef5] ${qtyChanged || dateChanged ? 'bg-[#fff9c4]' : ''}`}>
                            <td className="px-2 py-1 text-[#909399]">{d.productCode}</td>
                            <td className="px-2 py-1">{d.productName}</td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs text-right"
                                value={d.orderQuantity}
                                min={1}
                                onChange={(e) => updateChangeDetail(i, 'orderQuantity', Number(e.target.value))}
                              />
                            </td>
                            <td className="px-2 py-1 text-right text-[#909399]">¥{d.unitPrice.toLocaleString()}</td>
                            <td className="px-2 py-1 text-right">¥{d.amount.toLocaleString()}</td>
                            <td className="px-2 py-1">
                              <input
                                type="date"
                                className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                                value={d.deliveryDate || ''}
                                onChange={(e) => updateChangeDetail(i, 'deliveryDate', e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 变更历史弹窗 */}
      <Modal
        open={!!changeHistoryItem}
        title={`变更记录 - ${changeHistoryItem?.orderNo}`}
        onClose={() => setChangeHistoryItem(null)}
        footer={<DefaultButton onClick={() => setChangeHistoryItem(null)}>关闭</DefaultButton>}
        width="900px"
      >
        {changeHistoryItem && (
          <div className="space-y-4">
            {/* 待审批的变更 */}
            {contractPurchaseOrderChanges.filter(c => c.orderId === changeHistoryItem.id && c.status === 'pending').length > 0 && (
              <div>
                <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#e6a23c] pl-2">待审批变更</div>
                {contractPurchaseOrderChanges.filter(c => c.orderId === changeHistoryItem.id && c.status === 'pending').map(change => (
                  <div key={change.id} className="border border-[#e6a23c] rounded p-3 mb-2 bg-[#fdf6ec]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#909399]">变更单号：{change.changeNo}</span>
                        <span className="text-[#909399]">变更人：{change.changer}</span>
                        <span className="text-[#909399]">变更时间：{change.changeTime}</span>
                      </div>
                      <div className="flex gap-2">
                        <PrimaryButton size="small" onClick={() => handleApproveChange(change)}>审批通过</PrimaryButton>
                        <DefaultButton size="small" onClick={() => handleRejectChange(change)}>驳回</DefaultButton>
                      </div>
                    </div>
                    <div className="text-xs text-[#606266] mb-2">变更原因：{change.changeReason}</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white rounded p-2 border border-[#e4e7ed]">
                        <div className="text-[#909399] mb-1">变更前：</div>
                        <table className="w-full">
                          <thead className="bg-[#f5f7fa]">
                            <tr>
                              <th className="px-1 py-1 text-left text-[10px]">品名</th>
                              <th className="px-1 py-1 text-left text-[10px]">数量</th>
                              <th className="px-1 py-1 text-left text-[10px]">交货日期</th>
                            </tr>
                          </thead>
                          <tbody>
                            {change.beforeDetails.map(d => (
                              <tr key={d.id} className="border-t border-[#ebeef5]">
                                <td className="px-1 py-1">{d.productName}</td>
                                <td className="px-1 py-1">{d.orderQuantity}</td>
                                <td className="px-1 py-1">{d.deliveryDate || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-white rounded p-2 border border-[#e4e7ed]">
                        <div className="text-[#909399] mb-1">变更后：</div>
                        <table className="w-full">
                          <thead className="bg-[#f5f7fa]">
                            <tr>
                              <th className="px-1 py-1 text-left text-[10px]">品名</th>
                              <th className="px-1 py-1 text-left text-[10px]">数量</th>
                              <th className="px-1 py-1 text-left text-[10px]">交货日期</th>
                            </tr>
                          </thead>
                          <tbody>
                            {change.afterDetails.map(d => {
                              const before = change.beforeDetails.find(b => b.id === d.id);
                              const qtyChanged = before?.orderQuantity !== d.orderQuantity;
                              const dateChanged = before?.deliveryDate !== d.deliveryDate;
                              return (
                                <tr key={d.id} className={`border-t border-[#ebeef5] ${qtyChanged || dateChanged ? 'bg-[#fff9c4]' : ''}`}>
                                  <td className="px-1 py-1">{d.productName}</td>
                                  <td className="px-1 py-1">{d.orderQuantity}</td>
                                  <td className="px-1 py-1">{d.deliveryDate || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* 已审批的变更历史 */}
            {(changeHistoryItem.changeHistory || []).length > 0 && (
              <div>
                <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#67c23a] pl-2">已审批变更历史</div>
                {changeHistoryItem.changeHistory!.map((record) => (
                  <div key={record.id} className="border border-[#dcdfe6] rounded p-3 mb-2 bg-[#f5f7fa]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#909399]">变更单号：{record.changeNo}</span>
                        <span className="text-[#909399]">变更人：{record.changer}</span>
                        <span className="text-[#909399]">变更时间：{record.changeTime}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        record.status === 'approved' ? 'bg-[#67c23a] text-white' :
                        record.status === 'rejected' ? 'bg-[#f56c6c] text-white' :
                        'bg-[#e6a23c] text-white'
                      }`}>
                        {record.status === 'approved' ? '已通过' : record.status === 'rejected' ? '已驳回' : '待审批'}
                      </span>
                    </div>
                    <div className="text-xs text-[#606266] mb-2">变更原因：{record.changeReason || '无'}</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white rounded p-2 border border-[#e4e7ed]">
                        <div className="text-[#909399] mb-1">变更前：</div>
                        <table className="w-full">
                          <thead className="bg-[#f5f7fa]">
                            <tr>
                              <th className="px-1 py-1 text-left text-[10px]">品名</th>
                              <th className="px-1 py-1 text-left text-[10px]">数量</th>
                              <th className="px-1 py-1 text-left text-[10px]">交货日期</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.beforeDetails.map(d => (
                              <tr key={d.id} className="border-t border-[#ebeef5]">
                                <td className="px-1 py-1">{d.productName}</td>
                                <td className="px-1 py-1">{d.orderQuantity}</td>
                                <td className="px-1 py-1">{d.deliveryDate || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-white rounded p-2 border border-[#e4e7ed]">
                        <div className="text-[#909399] mb-1">变更后：</div>
                        <table className="w-full">
                          <thead className="bg-[#f5f7fa]">
                            <tr>
                              <th className="px-1 py-1 text-left text-[10px]">品名</th>
                              <th className="px-1 py-1 text-left text-[10px]">数量</th>
                              <th className="px-1 py-1 text-left text-[10px]">交货日期</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.afterDetails.map(d => {
                              const before = record.beforeDetails.find(b => b.id === d.id);
                              const qtyChanged = before?.orderQuantity !== d.orderQuantity;
                              const dateChanged = before?.deliveryDate !== d.deliveryDate;
                              return (
                                <tr key={d.id} className={`border-t border-[#ebeef5] ${qtyChanged || dateChanged ? 'bg-[#fff9c4]' : ''}`}>
                                  <td className="px-1 py-1">{d.productName}</td>
                                  <td className="px-1 py-1">{d.orderQuantity}</td>
                                  <td className="px-1 py-1">{d.deliveryDate || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {record.approver && (
                      <div className="text-xs text-[#909399] mt-2">
                        审批人：{record.approver}，审批时间：{record.approveTime}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* 无变更记录 */}
            {contractPurchaseOrderChanges.filter(c => c.orderId === changeHistoryItem.id && c.status === 'pending').length === 0 &&
              (changeHistoryItem.changeHistory || []).length === 0 && (
              <div className="text-center text-[#909399] py-8">暂无变更记录</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
