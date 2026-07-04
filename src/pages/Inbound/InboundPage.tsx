import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import PrintDocument from '@/components/common/PrintDocument';
import SearchableSelect from '@/components/common/SearchableSelect';
import { useStore } from '@/store/useStore';
import { generateInboundOrderNo, generateBatchNo, generateStockTransactionNo } from '@/mock/data';
import type { InboundOrder, InboundDetail, InboundOrderType, Attachment, PurchaseOrder, ContractPurchaseOrder } from '@/types';
import { Printer, Upload, X, FileText, Download } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface Props {
  type?: 'purchase' | 'production' | 'return';
}

interface FormDetail extends InboundDetail {
  batchNo: string;
  specification?: string;
  unit?: string;
}

const helpContentMap: Record<string, any> = {
  purchase: {
    title: '采购入库 - 功能操作说明',
    description: '采购入库用于关联采购订单进行物资入库操作，支持关联合同采购订单。',
    sections: [
      {
        heading: '新增采购入库单',
        items: [
          '点击"新增采购订单入库"按钮打开新增弹窗',
          '点击"选择采购订单"按钮，选择已审批的采购订单',
          '系统自动带出采购订单中的物资明细及入库仓库',
          '可修改实际入库数量（不可超过采购订单剩余数量）',
          '填写保管员、验收员等信息，可上传附件',
          '点击"保存"生成采购入库单，状态为待确认'
        ]
      },
      {
        heading: '入库确认',
        items: [
          '待确认状态的入库单可点击"确认入库"完成入库',
          '确认入库后库存增加，按FIFO原则生成批次记录',
          '同步生成库存流水记录',
          '确认入库后单据状态更新为已入库，不可修改'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看入库单详细信息及物资明细',
          '编辑：待确认状态可修改入库单信息',
          '删除：待确认状态可删除入库单',
          '打印：入库单生成后即可打印，与状态无关'
        ]
      }
    ]
  },
  production: {
    title: '自制入库 - 功能操作说明',
    description: '自制入库用于登记自行生产加工完成的物资入库。',
    sections: [
      {
        heading: '新增自制入库单',
        items: [
          '点击"新增自制入库单"按钮打开新增弹窗',
          '选择入库仓库，填写保管员、验收员、供应商等信息',
          '点击"选择物资"按钮添加入库物资明细',
          '填写入库数量、单价等信息',
          '可上传相关附件',
          '点击"保存"生成自制入库单，状态为待确认'
        ]
      },
      {
        heading: '入库确认',
        items: [
          '待确认状态的入库单可点击"确认入库"完成入库',
          '确认入库后库存增加，按FIFO原则生成批次记录',
          '同步生成库存流水记录',
          '确认入库后单据状态更新为已入库，不可修改'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看入库单详细信息及物资明细',
          '编辑：待确认状态可修改入库单信息',
          '删除：待确认状态可删除入库单',
          '打印：入库单生成后即可打印，与状态无关'
        ]
      }
    ]
  },
  return: {
    title: '归还退库 - 功能操作说明',
    description: '归还退库用于处理领用物资的退回入库操作。',
    sections: [
      {
        heading: '新增归还退库单',
        items: [
          '点击"新增归还退库单"按钮打开新增弹窗',
          '点击"选择出库单"按钮，选择需要退回的出库单',
          '系统自动带出库单中的物资明细',
          '填写实际归还数量（不可超过原出库数量）',
          '选择退库仓库，填写保管员、验收员等信息',
          '点击"保存"生成归还退库单，状态为待确认'
        ]
      },
      {
        heading: '入库确认',
        items: [
          '待确认状态的入库单可点击"确认入库"完成入库',
          '确认入库后对应仓库库存增加',
          '同步生成库存流水记录',
          '确认入库后单据状态更新为已入库，不可修改'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看入库单详细信息及物资明细',
          '编辑：待确认状态可修改入库单信息',
          '删除：待确认状态可删除入库单',
          '打印：入库单生成后即可打印，与状态无关'
        ]
      }
    ]
  }
};

export default function InboundPage({ type = 'purchase' }: Props) {
  const helpContent = helpContentMap[type];
  const inboundOrders = useStore((s) => s.inboundOrders);
  const addInboundOrder = useStore((s) => s.addInboundOrder);
  const updateInboundOrder = useStore((s) => s.updateInboundOrder);
  const deleteInboundOrder = useStore((s) => s.deleteInboundOrder);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const employees = useStore((s) => s.employees);
  const batchInventories = useStore((s) => s.batchInventories);
  const addBatchInventory = useStore((s) => s.addBatchInventory);
  const inventories = useStore((s) => s.inventories);
  const addInventory = useStore((s) => s.addInventory);
  const updateInventory = useStore((s) => s.updateInventory);
  const stockTransactions = useStore((s) => s.stockTransactions);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const purchaseOrders = useStore((s) => s.purchaseOrders);
  const updatePurchaseOrder = useStore((s) => s.updatePurchaseOrder);
  const contractPurchaseOrders = useStore((s) => s.contractPurchaseOrders);
  const updateContractPurchaseOrder = useStore((s) => s.updateContractPurchaseOrder);
  const procurementPlans = useStore((s) => s.procurementPlans);
  const outboundOrders = useStore((s) => s.outboundOrders);
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);
  const currentUser = useStore((s) => s.currentUser);

  // 搜索状态
  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterCustodian, setFilterCustodian] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', from: '', to: '', custodian: '' });

  // 弹窗状态
  const [viewItem, setViewItem] = useState<InboundOrder | null>(null);
  const [editItem, setEditItem] = useState<InboundOrder | null>(null);
  const [printItem, setPrintItem] = useState<InboundOrder | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);
  const [editDetails, setEditDetails] = useState<FormDetail[]>([]);
  const [selectedDetailIndices, setSelectedDetailIndices] = useState<number[]>([]);
  const [batchQtyModalOpen, setBatchQtyModalOpen] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [editWarehouseId, setEditWarehouseId] = useState('');
  const [editCustodian, setEditCustodian] = useState<string>('');
  const [editInspector, setEditInspector] = useState<string>('');
  const [editPersonInCharge, setEditPersonInCharge] = useState('');
  const [editSalesperson, setEditSalesperson] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editCreator, setEditCreator] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);
  const [previewAtt, setPreviewAtt] = useState<Attachment | null>(null);
  const [purchasePickerOpen, setPurchasePickerOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<ContractPurchaseOrder | null>(null);
  // 入库申请单模式 vs 普通入库模式
  const [poMode, setPoMode] = useState(false);
  // 归还退库 - 出库单选择弹窗
  const [outboundPickerOpen, setOutboundPickerOpen] = useState(false);
  const [outboundFilterNo, setOutboundFilterNo] = useState('');
  const [outboundFilterType, setOutboundFilterType] = useState('');
  const [selectedOutboundOrder, setSelectedOutboundOrder] = useState<any>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: 'ATT' + Date.now() + Math.random().toString(36).slice(2, 7),
      fileName: file.name,
      filePath: URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }));

    setEditAttachments([...editAttachments, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    const att = editAttachments.find(a => a.id === id);
    if (att && att.filePath.startsWith('blob:')) {
      URL.revokeObjectURL(att.filePath);
    }
    setEditAttachments(editAttachments.filter(a => a.id !== id));
  };

  const downloadAttachment = (attachment: Attachment) => {
    if (attachment.filePath.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = attachment.filePath;
      link.download = attachment.fileName;
      link.click();
    } else {
      alert('暂不支持下载远程文件');
    }
  };

  const previewAttachment = (attachment: Attachment) => {
    if (attachment.filePath.startsWith('blob:')) {
      setPreviewAtt(attachment);
    } else {
      alert('暂不支持预览远程文件');
    }
  };

  const typeLabel =
    type === 'purchase' ? '采购入库' : type === 'production' ? '生产入库' : '退货入库';

  const statusText = (s: string) => {
    if (s === 'confirmed') return '已入库';
    if (s === 'submitted') return '已提交';
    return '待提交';
  };
  const statusColor = (s: string) => {
    if (s === 'confirmed') return 'text-[#67c23a]';
    if (s === 'submitted') return 'text-[#409eff]';
    return 'text-[#e6a23c]';
  };

  const empOptions = employees
    .filter((e: any) => e.status === 'enabled')
    .map((e: any) => ({ id: e.id, label: e.name, role: e.role }));

  const employeeNameById = (id: string) => {
    const e = employees.find((x: any) => x.id === id);
    return e ? (e as any).name : '';
  };

  const filteredData = useMemo(() => {
    return inboundOrders.filter((o) => o.type === type).filter((o) => {
      if (applied.no && !o.orderNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.custodian && (o as any).custodian !== employeeNameById(applied.custodian)) {
        // fallback: check direct name match (existing mock stores name)
        if ((o as any).custodianId !== applied.custodian &&
            (o as any).custodian !== employeeNameById(applied.custodian)) {
          // Support both id based and name based filter
          if ((o as any).custodian !== applied.custodian) {
            const filteredEmp = employees.find((e: any) => e.id === applied.custodian);
            if (!filteredEmp || (filteredEmp as any).name !== (o as any).custodian) return false;
          }
        }
      }
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [inboundOrders, applied, type, employees]);

  const columns: ColumnDef<InboundOrder>[] = [
    { key: 'orderNo', title: '入库单号' },
    { key: 'warehouseName', title: '仓库', render: (row) => row.warehouseName || '-' },
    { key: 'custodian', title: '保管人', render: (row) => (row as any).custodian || '-' },
    { key: 'personInCharge', title: '负责人', render: (row) => (row as any).personInCharge || '-' },
    { key: 'inspector', title: '验收人', render: (row) => (row as any).inspector || '-' },
    { key: 'salesperson', title: '业务员', render: (row) => (row as any).salesperson || '-' },
    { key: 'creator', title: '制单人', render: (row) => (row as any).creator || '-' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => row.details.reduce((a, b) => a + (b.quantity || 0), 0),
    },
    {
      key: 'attachmentCount',
      title: '附件',
      align: 'center',
      render: (row) => {
        const count = (row as any).attachments?.length || 0;
        if (count === 0) return '-';
        return (
          <span className="text-[#2f54eb] cursor-pointer hover:underline">
            <FileText size={14} /> {count}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => (
        <span className={statusColor(row.status)}>{statusText(row.status)}</span>
      ),
    },
    { key: 'createTime', title: '创建时间' },
    { key: 'remark', title: '备注', render: (row) => (row as any).remark || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => { setViewItem(null); setPrintItem(row); setPrintTrigger(prev => prev + 1); }}>
              <Printer size={12} /> 打印
            </TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
              <TextButton onClick={() => handleSubmit(row.id)}>提交</TextButton>
              <TextButton type="danger" onClick={() => {
                if (confirm(`确认删除入库单 ${row.orderNo}？`)) deleteInboundOrder(row.id);
              }}>删除</TextButton>
            </>
          )}
          {row.status === 'submitted' && (
            <>
              <TextButton onClick={() => handleConfirm(row.id)}>确认入库</TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const openAdd = (mode: 'po' | 'normal') => {
    const newOrder: InboundOrder = {
      id: 'IN' + Date.now(),
      orderNo: generateInboundOrderNo(type),
      type: type as InboundOrderType,
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      custodian: '',
      personInCharge: '',
      inspector: '',
      salesperson: '',
      creator: currentUser.name,
      status: 'pending',
      operator: '',
      createTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5),
      remark: '',
      details: [],
    };
    setEditItem(newOrder);
    setEditDetails([]);
    setSelectedDetailIndices([]);
    setEditWarehouseId(newOrder.warehouseId);
    setEditCustodian('');
    setEditInspector('');
    setEditPersonInCharge('');
    setEditSalesperson('');
    setEditSupplier('');
    setEditCreator(currentUser.name);
    setEditRemark('');
    setEditAttachments([]);
    setSelectedPurchaseOrder(null);
    setSelectedOutboundOrder(null);
    setPoMode(mode === 'po');
  };

  // 选择采购订单后填充明细（使用待入库数量 orderQuantity - deliveredQuantity）
  const handleSelectPurchaseOrder = (po: ContractPurchaseOrder) => {
    setSelectedPurchaseOrder(po);
    const batchNo = generateBatchNo();
    const newDetails: FormDetail[] = po.details
      .filter(d => (d.orderQuantity - d.deliveredQuantity) > 0)
      .map(d => ({
        id: 'IND' + Date.now() + Math.random().toString(36).slice(2, 5),
        inboundOrderId: editItem?.id || '',
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        quantity: d.orderQuantity - d.deliveredQuantity,
        batchNo,
        specification: d.specification || '',
        unit: d.unit,
      }));
    setEditDetails(newDetails);
    setSelectedDetailIndices([]);
    if (editItem) {
      setEditItem({
        ...editItem,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        purchaseOrderId: po.id,
        purchaseOrderNo: po.orderNo,
        remark: `采购订单：${po.orderNo} | 合同：${po.contractNo}`,
      });
    }
    setPurchasePickerOpen(false);
  };

  // 计算采购订单的剩余可入库数量
  const getRemainingQuantity = (po: ContractPurchaseOrder) => {
    return po.details.reduce((sum, d) => {
      const remaining = d.orderQuantity - d.deliveredQuantity;
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);
  };

  // 检查采购订单是否还有可入库的物料
  const hasRemainingInventory = (po: ContractPurchaseOrder) => {
    return po.details.some(d => (d.orderQuantity - d.deliveredQuantity) > 0);
  };

  // 归还退库 - 选择出库单后填充明细和项目
  const handleSelectOutboundOrder = (order: any) => {
    setSelectedOutboundOrder(order);
    const batchNo = generateBatchNo();
    const newDetails: FormDetail[] = order.details.map((d: any) => ({
      id: 'IND' + Date.now() + Math.random().toString(36).slice(2, 5),
      inboundOrderId: editItem?.id || '',
      productId: d.productId,
      productCode: d.productCode,
      productName: d.productName,
      quantity: d.quantity,
      batchNo,
      specification: products.find((p: any) => p.id === d.productId)?.specification || '',
      unit: products.find((p: any) => p.id === d.productId)?.unit || '',
    }));
    setEditDetails(newDetails);
    setOutboundPickerOpen(false);
  };

  const openEdit = (row: InboundOrder) => {
    setEditItem(row);
    setEditWarehouseId(row.warehouseId);
    setEditCustodian((row as any).custodianId || employees.find((e: any) => e.name === row.custodian)?.id || '');
    setEditInspector((row as any).inspectorId || employees.find((e: any) => e.name === row.inspector)?.id || '');
    setEditPersonInCharge(row.personInCharge || '');
    setEditSalesperson(row.salesperson || '');
    setEditCreator(row.creator || currentUser.name);
    setEditRemark(row.remark || '');
    setEditAttachments((row as any).attachments || []);
    setSelectedOutboundOrder((row as any).sourceOutboundId ? {
      id: (row as any).sourceOutboundId,
      orderNo: (row as any).sourceOutboundNo,
      type: (row as any).sourceOutboundType,
    } : null);
    // Load contract purchase order if linked
    const linkedPoId = (row as any).purchaseOrderId;
    if (linkedPoId) {
      const cpo = contractPurchaseOrders.find(p => p.id === linkedPoId);
      setSelectedPurchaseOrder(cpo || null);
    } else {
      setSelectedPurchaseOrder(null);
    }
    setPoMode(!!linkedPoId && type === 'purchase');
    // Load details from existing order
    const existingDetails: FormDetail[] = row.details.map((d) => ({
      ...d,
      batchNo: (d as any).batchNo || generateBatchNo(),
      specification: products.find((p: any) => p.id === d.productId)?.specification || '',
      unit: products.find((p: any) => p.id === d.productId)?.unit || '',
    }));
    setEditDetails(existingDetails);
  };

  const handlePickerConfirm = (selected: any[]) => {
    const existingIds = new Set(editDetails.map((d) => d.productId));
    const added = selected
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({
        id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
        inboundOrderId: editItem?.id || '',
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        quantity: 1,
        batchNo: generateBatchNo(),
        specification: p.specification,
        unit: p.unit,
      }));
    setEditDetails([...editDetails, ...added]);
    setPickerOpen(false);
  };

  const updateDetailField = (idx: number, field: string, value: string | number) => {
    const newDetails = [...editDetails];
    (newDetails[idx] as any)[field] = value;
    setEditDetails(newDetails);
  };

  const removeDetail = (idx: number) => {
    setEditDetails(editDetails.filter((_, i) => i !== idx));
    setSelectedDetailIndices(selectedDetailIndices.filter((i) => i !== idx).map((i) => i > idx ? i - 1 : i));
  };

  const toggleSelectDetail = (idx: number) => {
    if (selectedDetailIndices.includes(idx)) {
      setSelectedDetailIndices(selectedDetailIndices.filter((i) => i !== idx));
    } else {
      setSelectedDetailIndices([...selectedDetailIndices, idx]);
    }
  };

  const toggleSelectAllDetails = () => {
    if (selectedDetailIndices.length === editDetails.length) {
      setSelectedDetailIndices([]);
    } else {
      setSelectedDetailIndices(editDetails.map((_, i) => i));
    }
  };

    const handleBatchSetQuantity = () => {
    if (selectedDetailIndices.length === 0) {
      alert('请先勾选要批量设置数量的记录');
      return;
    }
    var input = prompt('请输入要设置的数量：', '1');
    if (input === null) return;
    var qty = Number(input);
    if (!qty || qty <= 0) {
      alert('请输入有效的数量');
      return;
    }
    var newDetails = [...editDetails];
    selectedDetailIndices.forEach(function(idx) {
      (newDetails[idx] as any).quantity = qty;
    });
    setEditDetails(newDetails);
  };

  const handleBatchDelete = () => {
    if (selectedDetailIndices.length === 0) {
      alert('请先勾选要删除的记录');
      return;
    }
    if (!confirm(`确定要删除选中的 ${selectedDetailIndices.length} 条记录吗？`)) {
      return;
    }
    const indicesToDelete = new Set(selectedDetailIndices);
    setEditDetails(editDetails.filter((_, i) => !indicesToDelete.has(i)));
    setSelectedDetailIndices([]);
  };

  const doValidate = (): boolean => {
    if (!editWarehouseId) { alert('请选择仓库'); return false; }
    if (!editCustodian) { alert('请选择保管人（必填）'); return false; }
    if (!editInspector) { alert('请选择验收人（必填）'); return false; }
    if (type === 'return' && !selectedOutboundOrder) { alert('请选择来源出库单'); return false; }
    if (editDetails.length === 0) { alert('请添加至少一条产品明细'); return false; }
    if (editDetails.some((d) => !d.quantity || d.quantity <= 0)) {
      alert('产品数量必须大于 0');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!doValidate()) return;

    const warehouseName = warehouses.find((w: any) => w.id === editWarehouseId)?.name || '';
    const custodianName = employeeNameById(editCustodian);
    const inspectorName = employeeNameById(editInspector);

    const updatedOrder: InboundOrder = {
      ...editItem,
      warehouseId: editWarehouseId,
      warehouseName,
      custodian: custodianName,
      personInCharge: editPersonInCharge,
      inspector: inspectorName,
      salesperson: editSalesperson,
      supplierName: type === 'production' ? editSupplier : undefined,
      creator: editCreator,
      remark: editRemark,
      details: editDetails.map((d) => ({
        id: d.id,
        inboundOrderId: d.inboundOrderId,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        specification: (d as any).specification || '',
        unit: (d as any).unit || '',
        positionId: d.positionId,
        positionName: d.positionName,
        quantity: Number(d.quantity) || 0,
        ...((d as any).batchNo ? { batchNo: (d as any).batchNo } : {}),
      } as any)),
      attachments: editAttachments,
    };

    // Persist the personnel IDs for edit round-trip
    (updatedOrder as any).custodianId = editCustodian;
    (updatedOrder as any).inspectorId = editInspector;
    // Store purchase order ID for later reference
    if (selectedPurchaseOrder) {
      (updatedOrder as any).purchaseOrderId = selectedPurchaseOrder.id;
    }
    // Store source outbound order for return type
    if (type === 'return' && selectedOutboundOrder) {
      (updatedOrder as any).sourceOutboundId = selectedOutboundOrder.id;
      (updatedOrder as any).sourceOutboundNo = selectedOutboundOrder.orderNo;
      (updatedOrder as any).sourceOutboundType = selectedOutboundOrder.type;
    }

    if (inboundOrders.find((o) => o.id === editItem.id)) {
      updateInboundOrder(editItem.id, updatedOrder);
    } else {
      addInboundOrder(updatedOrder);
    }
    setEditItem(null);
  };

  const handleSubmit = (id: string) => {
    const order = inboundOrders.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'pending') return;
    if (!confirm(`确认提交入库单 ${order.orderNo}？提交后可进行确认入库操作。`)) return;

    updateInboundOrder(id, { ...order, status: 'submitted', operator: (order as any).operator || (order as any).custodian || '' });
  };

  // 确认入库：真正增加库存
  const handleConfirm = (id: string) => {
    const order = inboundOrders.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'submitted') return;
    if (!confirm(`确认入库 ${order.orderNo}？确认后将增加库存，不可撤销。`)) return;

    order.details.forEach((d) => {
      const batchNo = (d as any).batchNo || generateBatchNo();
      const defaultPos = positions.find((p: any) => p.warehouseId === order.warehouseId);
      const posId = (d as any).positionId || defaultPos?.id || '';
      const posName = (d as any).positionName || defaultPos?.name || '';
      const existing = batchInventories.find(
        (b) => b.batchNo === batchNo && b.productId === d.productId
      );
      if (!existing) {
        const product = products.find((p) => p.id === d.productId);
        addBatchInventory({
          id: 'B' + Date.now() + Math.random().toString(36).slice(2, 7),
          batchNo,
          productId: d.productId,
          productCode: d.productCode,
          productName: d.productName,
          specification: (d as any).specification || product?.specification || '',
          warehouseId: order.warehouseId,
          warehouseName: order.warehouseName,
          positionId: posId,
          positionName: posName,
          quantity: d.quantity,
          originalQuantity: d.quantity,
          inboundTime: new Date().toISOString().slice(0, 10),
          inboundOrderNo: order.orderNo,
        });
      }

      const existingInventory = inventories.find(
        (inv) => inv.productId === d.productId && inv.warehouseId === order.warehouseId
      );
      if (existingInventory) {
        updateInventory(existingInventory.id, {
          quantity: (existingInventory.quantity || 0) + d.quantity,
        });
      } else {
        const product = products.find((p) => p.id === d.productId);
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        addInventory({
          id: 'INV' + Date.now() + Math.random(),
          productId: d.productId,
          productCode: d.productCode,
          productName: d.productName,
          specification: (d as any).specification || product?.specification || '',
          unit: (d as any).unit || '',
          quantity: d.quantity,
          frozenQuantity: 0,
          inboundTime: now,
          warehouseId: order.warehouseId,
          warehouseName: order.warehouseName || '',
          positionId: posId,
          positionName: posName,
        } as any);
      }

      addStockTransaction({
        id: 'T' + Date.now() + Math.random().toString(36).slice(2, 7),
        transactionNo: generateStockTransactionNo(),
        transactionTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5),
        transactionType: 'inbound' as any,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        positionId: posId,
        positionName: posName,
        quantity: d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        sourceType: typeLabel,
        batchNo,
        operator: (order as any).custodian || '',
        remark: order.remark,
      });
    });

    // Update purchase order received quantity if linked
    const poId = (order as any).purchaseOrderId;
    if (poId) {
      const cpo = contractPurchaseOrders.find(p => p.id === poId);
      if (cpo) {
        // Update received quantities
        const updatedDetails = cpo.details.map(d => {
          const inboundDetail = order.details.find(od => od.productId === d.productId);
          if (inboundDetail) {
            const newDelivered = d.deliveredQuantity + inboundDetail.quantity;
            return { ...d, deliveredQuantity: newDelivered };
          }
          return d;
        });
        updateContractPurchaseOrder?.(poId, { details: updatedDetails });
      }
    }

    updateInboundOrder(id, { ...order, status: 'confirmed' });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">{typeLabel}管理</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          {type === 'purchase' ? (
            <PrimaryButton onClick={() => openAdd('po')}>+ 新增采购订单入库</PrimaryButton>
          ) : type === 'return' ? (
            <PrimaryButton onClick={() => openAdd('normal')}>+ 新增归还退库单</PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => openAdd('normal')}>+ 新增{typeLabel}单</PrimaryButton>
          )}
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({ no: filterNo, status: filterStatus, from: filterFrom, to: filterTo, custodian: filterCustodian })
        }
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setFilterCustodian('');
          setApplied({ no: '', status: '', from: '', to: '', custodian: '' });
        }}
      >
        <SearchField label="入库单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">状态：</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
          >
            <option value="">全部</option>
            <option value="pending">待提交</option>
            <option value="submitted">已提交</option>
          </select>
        </div>
        <SearchableSelect
          label="保管人"
          value={filterCustodian}
          onChange={setFilterCustodian}
          options={empOptions}
          placeholder="请选择"
          filter="保管人"
        />
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable
          data={filteredData}
          columns={columns}
          rowKey={(row: any) => row.id}
        />
      </div>

      {/* 查看弹窗 */}
      <Modal
        open={!!viewItem}
        title={`${typeLabel}单详情 - ${viewItem?.orderNo}`}
        onClose={() => setViewItem(null)}
      >
        {viewItem && (
          <div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">入库单号：</span><span className="text-[#303133]">{viewItem.orderNo}</span></div>
              <div><span className="text-[#606266]">仓库：</span><span className="text-[#303133]">{viewItem.warehouseName}</span></div>
              <div><span className="text-[#606266]">状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              {(viewItem as any).sourceOutboundNo && (
                <div><span className="text-[#606266]">来源出库单：</span><span className="text-[#303133]">
                  {(viewItem as any).sourceOutboundNo}
                  {(viewItem as any).sourceOutboundType && ` (${{
                    requisition: '领用出库',
                    scrap: '报废出库',
                    damaged: '报损出库',
                  }[(viewItem as any).sourceOutboundType] || (viewItem as any).sourceOutboundType})`}
                </span></div>
              )}
              <div><span className="text-[#606266]">保管人：</span><span className="text-[#303133]">{viewItem.custodian || '-'}</span></div>
              <div><span className="text-[#606266]">负责人：</span><span className="text-[#303133]">{viewItem.personInCharge || '-'}</span></div>
              <div><span className="text-[#606266]">验收人：</span><span className="text-[#303133]">{viewItem.inspector || '-'}</span></div>
              <div><span className="text-[#606266]">业务员：</span><span className="text-[#303133]">{viewItem.salesperson || '-'}</span></div>
              <div><span className="text-[#606266]">制单人：</span><span className="text-[#303133]">{viewItem.creator || '-'}</span></div>
              <div className="col-span-2"><span className="text-[#606266]">备注：</span><span className="text-[#303133]">{viewItem.remark || '-'}</span></div>
            </div>

            <div className="text-sm text-[#606266] mb-3">产品明细（{viewItem.details.length} 条）</div>
            <div className="border border-[#ebeef5] rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f7fa] text-[#606266]">
                    <th className="px-4 py-3 text-left">序号</th>
                    <th className="px-4 py-3 text-left">物资编码</th>
                    <th className="px-4 py-3 text-left">物资名称</th>
                    <th className="px-4 py-3 text-left">规格型号</th>
                    <th className="px-4 py-3 text-left">单位</th>
                    <th className="px-4 py-3 text-right">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.details.map((d, i) => {
                    const prod = products.find((p: any) => p.id === d.productId);
                    return (
                      <tr key={d.id} className="border-t border-[#f0f2f5]">
                        <td className="px-4 py-3 text-[#303133]">{i + 1}</td>
                        <td className="px-4 py-3 text-[#303133]">{d.productCode}</td>
                        <td className="px-4 py-3 text-[#303133]">{d.productName}</td>
                        <td className="px-4 py-3 text-[#303133]">{(d as any).specification || prod?.specification || '-'}</td>
                        <td className="px-4 py-3 text-[#303133]">{(d as any).unit || prod?.unit || '-'}</td>
                        <td className="px-4 py-3 text-right text-[#303133]">{d.quantity}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#f5f7fa] font-semibold border-t border-[#ebeef5]">
                    <td className="px-4 py-3" colSpan={5}>合计</td>
                    <td className="px-4 py-3 text-right">
                      {viewItem.details.reduce((a, b) => a + (b.quantity || 0), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {((viewItem as any).attachments && (viewItem as any).attachments.length > 0) && (
              <div className="mt-4">
                <div className="text-xs text-[#606266] mb-2">附件（{((viewItem as any).attachments).length} 个）</div>
                <div className="border border-[#ebeef5] rounded overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#f5f7fa] text-[#606266]">
                        <th className="px-3 py-2 text-left">序号</th>
                        <th className="px-3 py-2 text-left">文件名</th>
                        <th className="px-3 py-2 text-left">文件大小</th>
                        <th className="px-3 py-2 text-left">上传时间</th>
                        <th className="px-3 py-2 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((viewItem as any).attachments || []).map((att: Attachment, i: number) => (
                        <tr key={att.id} className="border-t border-[#f0f2f5]">
                          <td className="px-3 py-2 text-[#303133]">{i + 1}</td>
                          <td className="px-3 py-2 text-[#303133]">{att.fileName}</td>
                          <td className="px-3 py-2 text-[#303133]">{formatFileSize(att.fileSize)}</td>
                          <td className="px-3 py-2 text-[#303133]">{att.uploadTime}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <TextButton onClick={() => previewAttachment(att)}>
                                <FileText size={12} /> 预览
                              </TextButton>
                              <TextButton onClick={() => downloadAttachment(att)}>
                                <Download size={12} /> 下载
                              </TextButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0f2f5]">
              <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
            </div>
          </div>
        )}
      </Modal>

      {/* 附件预览弹窗 - 放在最外层 */}
      <Modal
        open={!!previewAtt}
        title={`预览 - ${previewAtt?.fileName}`}
        onClose={() => setPreviewAtt(null)}
        width="max-w-[900px]"
      >
        {previewAtt && (
          <div className="min-h-[500px] flex items-center justify-center bg-[#f5f7fa] rounded">
            {previewAtt.fileType.startsWith('image/') ? (
              <img
                src={previewAtt.filePath}
                alt={previewAtt.fileName}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : previewAtt.fileType === 'application/pdf' ? (
              <iframe
                src={previewAtt.filePath}
                className="w-full h-[70vh] border-0"
                title={previewAtt.fileName}
              />
            ) : (
              <div className="text-center text-[#909399]">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <p>该文件类型暂不支持预览，请下载后查看</p>
                <DefaultButton className="mt-4" onClick={() => downloadAttachment(previewAtt)}>
                  <Download size={14} /> 下载文件
                </DefaultButton>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 打印组件 */}
      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title={`${typeLabel}单`}
          orderNo={printItem.orderNo}
          orderDate={printItem.createTime}
          operator={printItem.operator}
          warehouseName={printItem.warehouseName}
          custodian={printItem.custodian}
          personInCharge={printItem.personInCharge}
          inspector={printItem.inspector}
          salesperson={printItem.salesperson}
          creator={printItem.creator}
          remark={printItem.remark}
          details={printItem.details.map((d) => ({
            productCode: d.productCode,
            productName: d.productName,
            specification: products.find((p: any) => p.id === d.productId)?.specification || '',
            unit: products.find((p: any) => p.id === d.productId)?.unit || '',
            quantity: d.quantity,
            batchNo: (d as any).batchNo || '',
          }))}
        />
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={`${editItem && inboundOrders.find((o) => o.id === editItem.id) ? '编辑' : (type === 'purchase' ? (poMode ? '新增采购订单入库' : '新增普通入库') : '新增')}${type === 'purchase' ? '' : typeLabel}单`}
        onClose={() => setEditItem(null)}
        width="max-w-[1100px]"
      >
        <div className="space-y-4">
          {/* 基本信息 */}
          <div>
            <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">基本信息</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border border-[#ebeef5] rounded bg-[#fafbfc]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">入库单号：</span>
                <span className="text-xs text-[#303133]">{editItem?.orderNo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">单据类型：</span>
                <span className="text-xs text-[#303133]">{typeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20"><span className="text-[#f56c6c]">*</span>仓库：</span>
                <select
                  value={editWarehouseId}
                  onChange={(e) => setEditWarehouseId(e.target.value)}
                  className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                >
                  <option value="">请选择</option>
                  {warehouses.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">创建时间：</span>
                <span className="text-xs text-[#303133]">{editItem?.createTime}</span>
              </div>
              <SearchableSelect
                label="保管人"
                required
                value={editCustodian}
                onChange={setEditCustodian}
                options={empOptions}
                placeholder="请选择保管人"
                filter="保管人"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">负责人：</span>
                <input
                  type="text"
                  value={editPersonInCharge}
                  onChange={(e) => setEditPersonInCharge(e.target.value)}
                  placeholder="请输入"
                  className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                />
              </div>
              <SearchableSelect
                label="验收人"
                required
                value={editInspector}
                onChange={setEditInspector}
                options={empOptions}
                placeholder="请选择验收人"
                filter="验收人"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">业务员：</span>
                <input
                  type="text"
                  value={editSalesperson}
                  onChange={(e) => setEditSalesperson(e.target.value)}
                  placeholder="请输入"
                  className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                />
              </div>
              {type === 'production' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-20">供应商：</span>
                  <input
                    type="text"
                    value={editSupplier}
                    onChange={(e) => setEditSupplier(e.target.value)}
                    placeholder="手工输入（非必填）"
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">制单人：</span>
                <input
                  type="text"
                  disabled
                  value={editCreator || currentUser.name}
                  placeholder="请输入"
                  className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#909399] bg-[#f5f7fa] rounded cursor-not-allowed"
                />
              </div>
              {type === 'return' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-20"><span className="text-[#f56c6c]">*</span>来源出库单：</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      value={selectedOutboundOrder ? `${selectedOutboundOrder.orderNo} (${{
                        requisition: '领用出库',
                        scrap: '报废出库',
                        damaged: '报损出库',
                      }[selectedOutboundOrder.type as string] || selectedOutboundOrder.type})` : ''}
                      placeholder="请选择出库单"
                      className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#909399] bg-[#f5f7fa] rounded cursor-not-allowed"
                    />
                    <DefaultButton size="small" onClick={() => setOutboundPickerOpen(true)}>
                      选择
                    </DefaultButton>
                  </div>
                </div>
              )}
              <div className="col-span-2 flex items-start gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20 pt-1">备注：</span>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="请输入备注"
                  rows={2}
                  className="flex-1 px-2 py-1 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb] resize-none"
                />
              </div>
            </div>
          </div>

          {/* 产品明细 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-[#303133] border-l-2 border-[#2f54eb] pl-2">
                产品明细（{editDetails.length} 条）{selectedPurchaseOrder && ` - 采购订单：${selectedPurchaseOrder.orderNo}`}
                {selectedDetailIndices.length > 0 && <span className="ml-2 text-[#2f54eb]">已选 {selectedDetailIndices.length} 条</span>}
              </div>
              <div className="flex items-center gap-2">
                {editDetails.length > 0 && (
                  <>
                    <DefaultButton size="small" onClick={handleBatchSetQuantity}>
                      批量设置数量
                    </DefaultButton>
                    <DefaultButton size="small" onClick={handleBatchDelete} className="text-[#f56c6c]">
                      批量删除
                    </DefaultButton>
                  </>
                )}
                {/* 采购入库 - 采购订单入库模式：显示采购订单选择按钮 */}
                {type === 'purchase' && poMode && (
                  <PrimaryButton onClick={() => setPurchasePickerOpen(true)}>
                    选择采购订单
                  </PrimaryButton>
                )}
                {/* 普通入库模式（非采购订单入库）：显示从物资档案选择按钮 */}
                {!(type === 'purchase' && poMode) && (
                  <PrimaryButton onClick={() => setPickerOpen(true)}>
                    从物资档案选择（可多选）
                  </PrimaryButton>
                )}
              </div>
            </div>
            <div className="border border-[#ebeef5] rounded overflow-x-auto">
              <table className="w-full text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-[#f5f7fa] text-[#606266]">
                    <th className="px-2 py-2 text-center w-10">
                      {editDetails.length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedDetailIndices.length === editDetails.length}
                          onChange={toggleSelectAllDetails}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      )}
                    </th>
                    <th className="px-2 py-2 text-left w-10">序号</th>
                    <th className="px-2 py-2 text-left">物资编码</th>
                    <th className="px-2 py-2 text-left">物资名称</th>
                    <th className="px-2 py-2 text-left">规格型号</th>
                    <th className="px-2 py-2 text-left">单位</th>
                    <th className="px-2 py-2 text-right w-24">数量</th>
                    <th className="px-2 py-2 text-center w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {editDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-[#909399]">
                        {type === 'purchase' && poMode
                          ? '暂无产品明细，请点击右上角"选择采购订单"按钮添加'
                          : '暂无产品明细，请点击右上角"从物资档案选择（可多选）"按钮添加'}
                      </td>
                    </tr>
                  ) : (
                    editDetails.map((d, idx) => (
                      <tr key={d.id} className={`border-t border-[#f0f2f5] ${selectedDetailIndices.includes(idx) ? 'bg-[#ecf5ff]' : ''}`}>
                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedDetailIndices.includes(idx)}
                            onChange={() => toggleSelectDetail(idx)}
                            className="w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-2 text-[#303133]">{idx + 1}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.unit || '-'}</td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={d.quantity}
                            onChange={(e) => updateDetailField(idx, 'quantity', Number(e.target.value))}
                            min={1}
                            className="w-full h-7 px-2 border border-[#dcdfe6] text-xs text-right text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() => removeDetail(idx)}
                            className="text-xs text-[#f56c6c] hover:underline"
                          >删除</button>
                        </td>
                      </tr>
                    ))
                  )}
                  {editDetails.length > 0 && (
                    <tr className="bg-[#f5f7fa] font-semibold border-t border-[#ebeef5]">
                      <td className="px-2 py-2" colSpan={7}>合计</td>
                      <td className="px-2 py-2 text-right">
                        {editDetails.reduce((a, b) => a + (Number(b.quantity) || 0), 0)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">
              附件管理（{editAttachments.length} 个）
            </div>
            <div className="border border-[#ebeef5] rounded p-3 bg-[#fafbfc]">
              <div className="flex items-center gap-2 mb-3">
                <PrimaryButton size="small" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload size={14} /> 上传附件
                </PrimaryButton>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <span className="text-xs text-[#909399]">支持 PDF, Word, Excel, 图片等格式</span>
              </div>
              {editAttachments.length > 0 && (
                <ul className="space-y-2">
                  {editAttachments.map((att) => (
                    <li key={att.id} className="flex items-center justify-between p-2 bg-white rounded border border-[#f0f2f5]">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-[#4096ff]" />
                        <div>
                          <div className="text-xs text-[#303133] truncate max-w-[300px]">{att.fileName}</div>
                          <div className="text-xs text-[#909399]">
                            {formatFileSize(att.fileSize)} · {att.uploadTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => downloadAttachment(att)} className="text-[#4096ff] hover:text-[#165dff]">
                          <Download size={14} />
                        </button>
                        <button onClick={() => removeAttachment(att.id)} className="text-[#f56c6c] hover:text-[#f5222d]">
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f2f5]">
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* 物资选择弹窗 */}
      <ProductPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        title="选择物资（可多选）"
      />

      {/* 采购订单选择弹窗 - 从采购订单管理获取已提交的采购订单 */}
      <Modal
        open={purchasePickerOpen}
        title="选择采购订单（从采购订单管理获取）"
        onClose={() => setPurchasePickerOpen(false)}
        width="max-w-[1000px]"
      >
        <div>
          <div className="text-xs text-[#909399] mb-3">
            仅显示"采购订单管理"中状态为"已提交"且还有剩余可入库物料的采购订单。
            点击"选择"按钮将自动填充采购订单明细到入库单中。
          </div>

          {/* 已选订单快速信息 */}
          {selectedPurchaseOrder && (
            <div className="mb-3 p-3 bg-[#f0f7ff] border border-[#91caff] rounded text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#606266]">当前已选：</span>
                  <span className="font-medium text-[#303133] ml-2">
                    {selectedPurchaseOrder.orderNo}
                  </span>
                  <span className="text-[#606266] ml-4">
                    供应商：{selectedPurchaseOrder.supplierName}
                  </span>
                  <span className="text-[#606266] ml-4">
                    剩余可入库：<span className="text-[#f56c6c] font-medium">{getRemainingQuantity(selectedPurchaseOrder)}</span> 件
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPurchaseOrder(null)}
                  className="text-[#909399] hover:text-[#f56c6c]"
                >清除选择</button>
              </div>
            </div>
          )}

          <div className="border border-[#ebeef5] rounded overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-3 py-2 text-left">采购订单编号</th>
                  <th className="px-3 py-2 text-left">合同编号</th>
                  <th className="px-3 py-2 text-left">供应商</th>
                  <th className="px-3 py-2 text-center">物料数</th>
                  <th className="px-3 py-2 text-right">剩余可入库</th>
                  <th className="px-3 py-2 text-right">订单总金额</th>
                  <th className="px-3 py-2 text-left">创建时间</th>
                  <th className="px-3 py-2 text-center w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {contractPurchaseOrders
                  .filter(po => po.status === 'submitted' && hasRemainingInventory(po))
                  .map(po => {
                    const total = po.details.reduce((s, d) => s + d.amount, 0);
                    const remaining = getRemainingQuantity(po);
                    return (
                      <tr
                        key={po.id}
                        className={`border-t border-[#f0f2f5] hover:bg-[#f5f7fa] ${selectedPurchaseOrder?.id === po.id ? 'bg-[#e6f4ff]' : ''}`}
                      >
                        <td className="px-3 py-2 text-[#303133]">{po.orderNo}</td>
                        <td className="px-3 py-2 text-[#303133]">{po.contractNo}</td>
                        <td className="px-3 py-2 text-[#303133]">{po.supplierName}</td>
                        <td className="px-3 py-2 text-center text-[#303133]">{po.details.length}</td>
                        <td className="px-3 py-2 text-right">
                          <span className="text-[#f56c6c] font-medium">{remaining}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-[#303133]">
                          ¥{total.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-[#303133]">{po.createTime}</td>
                        <td className="px-3 py-2 text-center">
                          <TextButton onClick={() => handleSelectPurchaseOrder(po)}>选择</TextButton>
                        </td>
                      </tr>
                    );
                  })}
                {contractPurchaseOrders.filter(po => po.status === 'submitted' && hasRemainingInventory(po)).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">
                      暂无可用的采购订单。请先在&quot;采购管理 &gt; 采购订单管理&quot;中创建并提交采购订单。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 采购订单明细预览 */}
          {selectedPurchaseOrder && (
            <div className="mt-4">
              <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">
                采购订单明细（{selectedPurchaseOrder.orderNo}）
              </div>
              <div className="border border-[#ebeef5] rounded overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      <th className="px-2 py-2 text-left">物料编码</th>
                      <th className="px-2 py-2 text-left">物料名称</th>
                      <th className="px-2 py-2 text-left">规格型号</th>
                      <th className="px-2 py-2 text-center w-16">单位</th>
                      <th className="px-2 py-2 text-right w-20">合同约定总量</th>
                      <th className="px-2 py-2 text-right w-20">历史已交付</th>
                      <th className="px-2 py-2 text-right w-20">本次订单量</th>
                      <th className="px-2 py-2 text-right w-20">
                        <span className="text-[#f56c6c]">剩余可入库</span>
                      </th>
                      <th className="px-2 py-2 text-right w-20">单价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchaseOrder.details.map(d => {
                      const remaining = d.orderQuantity - d.deliveredQuantity;
                      return (
                        <tr key={d.id} className="border-t border-[#f0f2f5]">
                          <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                          <td className="px-2 py-2 text-center">{d.unit}</td>
                          <td className="px-2 py-2 text-right text-[#606266]">{d.contractQuantity}</td>
                          <td className="px-2 py-2 text-right text-[#67c23a]">{d.deliveredQuantity}</td>
                          <td className="px-2 py-2 text-right text-[#303133]">{d.orderQuantity}</td>
                          <td className="px-2 py-2 text-right font-medium">
                            <span className={remaining > 0 ? 'text-[#f56c6c]' : 'text-[#909399]'}>
                              {remaining}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right text-[#303133]">
                            ¥{d.unitPrice.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0f2f5]">
            <DefaultButton onClick={() => setPurchasePickerOpen(false)}>关闭</DefaultButton>
          </div>
        </div>
      </Modal>

      {/* 归还退库 - 出库单选择弹窗 */}
      <Modal
        open={outboundPickerOpen}
        title="选择出库单"
        onClose={() => setOutboundPickerOpen(false)}
        width="max-w-[1100px]"
      >
        <div>
          <div className="text-xs text-[#909399] mb-3">
            选择领用出库单/报废出库单/报损出库单进行归还退库操作，系统将自动带出项目和明细信息。
          </div>

          {/* 筛选条件 */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606266] whitespace-nowrap">单号：</span>
              <input
                type="text"
                value={outboundFilterNo}
                onChange={(e) => setOutboundFilterNo(e.target.value)}
                placeholder="请输入单号"
                className="w-[180px] h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606266] whitespace-nowrap">类型：</span>
              <select
                value={outboundFilterType}
                onChange={(e) => setOutboundFilterType(e.target.value)}
                className="w-[140px] h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
              >
                <option value="">全部类型</option>
                <option value="requisition">领用出库</option>
                <option value="scrap">报废出库</option>
                <option value="damaged">报损出库</option>
              </select>
            </div>
            <DefaultButton size="small" onClick={() => {
              setOutboundFilterNo('');
              setOutboundFilterType('');
            }}>重置</DefaultButton>
          </div>

          {/* 已选订单快速信息 */}
          {selectedOutboundOrder && (
            <div className="mb-3 p-3 bg-[#f0f7ff] border border-[#91caff] rounded text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#606266]">当前已选：</span>
                  <span className="font-medium text-[#303133] ml-2">
                    {selectedOutboundOrder.orderNo}
                  </span>
                  <span className="text-[#606266] ml-4">
                    类型：{{
                      requisition: '领用出库',
                      scrap: '报废出库',
                      damaged: '报损出库',
                    }[selectedOutboundOrder.type as string] || selectedOutboundOrder.type}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedOutboundOrder(null);
                  }}
                  className="text-[#909399] hover:text-[#f56c6c]"
                >清除选择</button>
              </div>
            </div>
          )}

          <div className="border border-[#ebeef5] rounded overflow-x-auto max-h-[350px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-3 py-2 text-left">出库单号</th>
                  <th className="px-3 py-2 text-left">类型</th>
                  <th className="px-3 py-2 text-left">仓库</th>
                  <th className="px-3 py-2 text-left">领用人</th>
                  <th className="px-3 py-2 text-center">物料数</th>
                  <th className="px-3 py-2 text-right">数量</th>
                  <th className="px-3 py-2 text-left">创建时间</th>
                  <th className="px-3 py-2 text-center w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {outboundOrders
                  .filter(o => ['requisition', 'scrap', 'damaged'].includes(o.type as string))
                  .filter(o => o.status === 'confirmed')
                  .filter(o => {
                    if (outboundFilterNo && !o.orderNo.includes(outboundFilterNo)) return false;
                    if (outboundFilterType && o.type !== outboundFilterType) return false;
                    return true;
                  })
                  .map(order => {
                    const totalQty = order.details.reduce((a, b) => a + (b.quantity || 0), 0);
                    return (
                      <tr
                        key={order.id}
                        className={`border-t border-[#f0f2f5] hover:bg-[#f5f7fa] ${selectedOutboundOrder?.id === order.id ? 'bg-[#e6f4ff]' : ''}`}
                      >
                        <td className="px-3 py-2 text-[#303133]">{order.orderNo}</td>
                        <td className="px-3 py-2 text-[#303133]">
                          {{
                            requisition: '领用出库',
                            scrap: '报废出库',
                            damaged: '报损出库',
                          }[order.type as string] || order.type}
                        </td>
                        <td className="px-3 py-2 text-[#303133]">{order.warehouseName || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{order.operator || '-'}</td>
                        <td className="px-3 py-2 text-center text-[#303133]">{order.details.length}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">{totalQty}</td>
                        <td className="px-3 py-2 text-[#303133]">{order.createTime}</td>
                        <td className="px-3 py-2 text-center">
                          <TextButton onClick={() => handleSelectOutboundOrder(order)}>选择</TextButton>
                        </td>
                      </tr>
                    );
                  })}
                {outboundOrders
                  .filter(o => ['requisition', 'scrap', 'damaged'].includes(o.type as string))
                  .filter(o => o.status === 'confirmed')
                  .filter(o => {
                    if (outboundFilterNo && !o.orderNo.includes(outboundFilterNo)) return false;
                    if (outboundFilterType && o.type !== outboundFilterType) return false;
                    return true;
                  }).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">
                      暂无符合条件的出库单
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0f2f5]">
            <DefaultButton onClick={() => setOutboundPickerOpen(false)}>关闭</DefaultButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
