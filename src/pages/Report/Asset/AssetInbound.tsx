import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { AssetEquipment, ContractPurchaseOrder, ContractPurchaseOrderDetail } from '@/types';
import { generateAssetCode } from '@/mock/data';
import { generateId } from '@/utils';
import { Eye, Check, Trash2, Plus, Package, Printer } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import PrintDocument from '@/components/common/PrintDocument';

interface InboundDetail {
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  remainingQty: number;
  assetId?: string;
  assetCode?: string;
}

interface AssetInboundOrder {
  id: string;
  orderNo: string;
  purchaseOrderId: string;
  purchaseOrderNo: string;
  supplierName: string;
  details: InboundDetail[];
  status: 'pending' | 'completed' | 'cancelled';
  inboundDate: string;
  operator: string;
  remark: string;
  createTime: string;
}

const generateAssetInboundNo = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCRK${dateStr}${random}`;
};

const mockInboundOrders: AssetInboundOrder[] = [
  {
    id: 'ZCRK001',
    orderNo: 'ZCRK20240601001',
    purchaseOrderId: 'CPO001',
    purchaseOrderNo: 'CPO20260601001',
    supplierName: '晨光办公用品有限公司',
    details: [
      {
        productId: 'AE001',
        productCode: 'SB20240001',
        productName: '数控车床',
        specification: 'CJK6136',
        unit: '台',
        quantity: 1,
        unitPrice: 150000,
        remainingQty: 0,
        assetId: 'AE001',
        assetCode: 'SB20240001',
      },
    ],
    status: 'completed',
    inboundDate: '2024-06-01',
    operator: '张三',
    remark: '新购置设备入库',
    createTime: '2024-06-01 09:30:00',
  },
  {
    id: 'ZCRK002',
    orderNo: 'ZCRK20240615001',
    purchaseOrderId: 'CPO001',
    purchaseOrderNo: 'CPO20260601001',
    supplierName: '晨光办公用品有限公司',
    details: [
      {
        productId: 'AE005',
        productCode: 'SB20240005',
        productName: '叉车',
        specification: 'CPCD30',
        unit: '辆',
        quantity: 1,
        unitPrice: 68000,
        remainingQty: 2,
        assetId: 'AE005',
        assetCode: 'SB20240005',
      },
    ],
    status: 'pending',
    inboundDate: '2024-06-15',
    operator: '李四',
    remark: '待审核',
    createTime: '2024-06-15 14:20:00',
  },
];

export default function AssetInbound() {
  const assetEquipments = useStore((s) => s.assetEquipments);
  const employees = useStore((s) => s.employees);
  const contractPurchaseOrders = useStore((s) => s.contractPurchaseOrders);
  const updateContractPurchaseOrder = useStore((s) => s.updateContractPurchaseOrder);
  const updateAssetEquipment = useStore((s) => s.updateAssetEquipment);
  const addAssetEquipment = useStore((s) => s.addAssetEquipment);
  const warehouses = useStore((s) => s.warehouses);
  const currentUser = useStore((s) => s.currentUser);

  const [inboundOrders, setInboundOrders] = useState<AssetInboundOrder[]>(mockInboundOrders);

  const [filterOrderNo, setFilterOrderNo] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ orderNo: '', assetName: '', status: '', from: '', to: '' });

  const [viewItem, setViewItem] = useState<AssetInboundOrder | null>(null);
  const [editItem, setEditItem] = useState<AssetInboundOrder | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [editPurchaseOrderId, setEditPurchaseOrderId] = useState('');
  const [editPurchaseOrderNo, setEditPurchaseOrderNo] = useState('');
  const [editSupplierName, setEditSupplierName] = useState('');
  const [editDetails, setEditDetails] = useState<InboundDetail[]>([]);
  const [editInboundDate, setEditInboundDate] = useState('');
  const [editOperator, setEditOperator] = useState('');
  const [editRemark, setEditRemark] = useState('');

  const editTotalAmount = useMemo(() =>
    editDetails.reduce((sum, d) => sum + d.unitPrice * d.quantity, 0),
    [editDetails]);

  const statusText = (s: string) => {
    if (s === 'pending') return '待入库';
    if (s === 'completed') return '已入库';
    if (s === 'cancelled') return '已取消';
    return s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-[#e6a23c]';
    if (s === 'completed') return 'text-[#67c23a]';
    if (s === 'cancelled') return 'text-[#909399]';
    return 'text-[#606266]';
  };

  const fixedAssetWarehouses = warehouses.filter(w => w.category === 'fixed_asset');

  const availablePurchaseOrders = useMemo(() => {
    return contractPurchaseOrders.filter(o =>
      o.status === 'submitted' &&
      o.details.some(d => (d.contractQuantity - d.deliveredQuantity) > 0)
    );
  }, [contractPurchaseOrders]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const todayCount = inboundOrders.filter(o => o.inboundDate === today).length;
    const monthCount = inboundOrders.filter(o => o.inboundDate.startsWith(thisMonth)).length;
    const pendingCount = inboundOrders.filter(o => o.status === 'pending').length;
    const completedCount = inboundOrders.filter(o => o.status === 'completed').length;
    return { todayCount, monthCount, pendingCount, completedCount };
  }, [inboundOrders]);

  const filteredData = useMemo(() => {
    return inboundOrders.filter((o) => {
      if (applied.orderNo && !o.orderNo.includes(applied.orderNo)) return false;
      if (applied.assetName && !o.details.some(d => d.productName.includes(applied.assetName))) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.inboundDate < applied.from) return false;
      if (applied.to && o.inboundDate > applied.to) return false;
      return true;
    });
  }, [inboundOrders, applied]);

  const columns: ColumnDef<AssetInboundOrder>[] = [
    { key: 'orderNo', title: '入库单号' },
    { key: 'purchaseOrderNo', title: '采购订单号' },
    { key: 'supplierName', title: '供应商' },
    {
      key: 'itemCount',
      title: '物资明细',
      render: (row) => `${row.details.length} 项`,
    },
    {
      key: 'totalAmount',
      title: '总金额',
      align: 'right',
      render: (row) => `¥${row.details.reduce((s, d) => s + d.unitPrice * d.quantity, 0).toLocaleString()}`,
    },
    {
      key: 'status',
      title: '入库状态',
      render: (row) => (
        <span className={statusColor(row.status)}>{statusText(row.status)}</span>
      ),
    },
    { key: 'inboundDate', title: '入库日期' },
    {
        key: 'op',
        title: '操作',
        render: (row) => (
          <div className="flex items-center gap-2 flex-wrap">
            <TextButton onClick={() => setViewItem(row)}>
              <Eye size={12} /> 查看
            </TextButton>
            <TextButton onClick={() => handlePrint(row)}>
              <Printer size={12} /> 打印
            </TextButton>
            {row.status === 'pending' && (
              <>
                <TextButton onClick={() => handleApprove(row.id)}>
                  <Check size={12} /> 确认入库
                </TextButton>
                <TextButton type="danger" onClick={() => handleDelete(row.id)}>
                  <Trash2 size={12} /> 删除
                </TextButton>
              </>
            )}
            {row.status === 'completed' && (
              <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
            )}
          </div>
        ),
      },
  ];

  const handleReverseConfirm = (id: string) => {
    const order = inboundOrders.find((o) => o.id === id);
    if (!order) return;
    if (!confirm(`确认反确认入库单 ${order.orderNo}？反确认后单据将回退到待入库状态，资产状态将恢复为未入库。`)) return;

    setInboundOrders(inboundOrders.map((o) =>
      o.id === id ? { ...o, status: 'pending' as const } : o
    ));

    order.details.forEach((detail) => {
      if (detail.assetId) {
        updateAssetEquipment(detail.assetId, {
          status: 'pending',
          warehouseId: undefined,
          warehouseName: undefined,
        });
      }
    });

    alert(`反确认成功！入库单 ${order.orderNo} 已回退到待入库状态。`);
  };

  const openAdd = () => {
    const newOrder: AssetInboundOrder = {
      id: 'ZCRK' + Date.now(),
      orderNo: generateAssetInboundNo(),
      purchaseOrderId: '',
      purchaseOrderNo: '',
      supplierName: '',
      details: [],
      status: 'pending',
      inboundDate: new Date().toISOString().slice(0, 10),
      operator: currentUser.name,
      remark: '',
      createTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5),
    };
    setEditItem(newOrder);
    setEditPurchaseOrderId('');
    setEditPurchaseOrderNo('');
    setEditSupplierName('');
    setEditDetails([]);
    setEditInboundDate(newOrder.inboundDate);
    setEditOperator(currentUser.name);
    setEditRemark('');
  };

  const handleSelectPurchaseOrder = (order: ContractPurchaseOrder) => {
    setEditPurchaseOrderId(order.id);
    setEditPurchaseOrderNo(order.orderNo);
    setEditSupplierName(order.supplierName);
    setEditDetails([]);
    setPickerOpen(false);
  };

  const handleToggleProduct = (detail: ContractPurchaseOrderDetail) => {
    const remainingQty = detail.contractQuantity - detail.deliveredQuantity;
    const existing = editDetails.find(d => d.productId === detail.productId);
    if (existing) {
      setEditDetails(editDetails.filter(d => d.productId !== detail.productId));
    } else {
      setEditDetails([
        ...editDetails,
        {
          productId: detail.productId,
          productCode: detail.productCode,
          productName: detail.productName,
          specification: detail.specification || '',
          unit: detail.unit,
          quantity: Math.min(1, remainingQty),
          unitPrice: detail.unitPrice,
          remainingQty,
        },
      ]);
    }
  };

  const handleRemoveDetail = (productId: string) => {
    setEditDetails(editDetails.filter(d => d.productId !== productId));
  };

  const handleUpdateDetailQuantity = (productId: string, quantity: number) => {
    setEditDetails(editDetails.map(d =>
      d.productId === productId
        ? { ...d, quantity: Math.min(quantity, d.remainingQty) }
        : d
    ));
  };

  const selectedOrder = useMemo(() => {
    return contractPurchaseOrders.find(o => o.id === editPurchaseOrderId);
  }, [contractPurchaseOrders, editPurchaseOrderId]);

  const handleSave = () => {
    if (!editItem) return;
    if (!editPurchaseOrderId) { alert('请选择采购订单'); return; }
    if (editDetails.length === 0) { alert('请至少选择一项物资'); return; }
    for (const d of editDetails) {
      if (!d.quantity || d.quantity <= 0) { alert(`物资"${d.productName}"的入库数量必须大于0`); return; }
      if (d.quantity > d.remainingQty) { alert(`物资"${d.productName}"剩余可入库数量为 ${d.remainingQty} ${d.unit}`); return; }
    }

    const newDetails = editDetails.map(d => ({
      ...d,
      assetId: generateId(),
      assetCode: generateAssetCode(),
    }));

    const updatedOrder: AssetInboundOrder = {
      ...editItem,
      purchaseOrderId: editPurchaseOrderId,
      purchaseOrderNo: editPurchaseOrderNo,
      supplierName: editSupplierName,
      details: newDetails,
      inboundDate: editInboundDate,
      operator: editOperator,
      remark: editRemark,
    };

    if (inboundOrders.find((o) => o.id === editItem.id)) {
      setInboundOrders(inboundOrders.map((o) => o.id === editItem.id ? updatedOrder : o));
    } else {
      setInboundOrders([updatedOrder, ...inboundOrders]);
    }
    setEditItem(null);
  };

  const handleApprove = (id: string) => {
    const order = inboundOrders.find((o) => o.id === id);
    if (!order || order.status !== 'pending') return;
    if (!confirm(`确认入库单 ${order.orderNo}？确认后物资将进入固定资产仓库，状态为在仓。`)) return;

    setInboundOrders(inboundOrders.map((o) =>
      o.id === id ? { ...o, status: 'completed' as const } : o
    ));

    const faWarehouse = fixedAssetWarehouses[0];

    order.details.forEach((detail) => {
      if (!detail.assetId) return;

      const existingAsset = assetEquipments.find((a) => a.id === detail.assetId);
      if (existingAsset) {
        updateAssetEquipment(detail.assetId, {
          status: 'in_storage',
          warehouseId: faWarehouse?.id,
          warehouseName: faWarehouse?.name,
        });
      } else {
        addAssetEquipment({
          id: detail.assetId,
          code: detail.assetCode || generateAssetCode(),
          name: detail.productName,
          specification: detail.specification,
          unit: detail.unit,
          amount: detail.unitPrice * detail.quantity,
          warehouseId: faWarehouse?.id || '',
          warehouseName: faWarehouse?.name || '',
          positionId: '',
          positionName: '',
          storageLocation: faWarehouse?.name || '',
          status: 'in_storage',
          remark: order.remark,
          createTime: order.inboundDate,
          changeLogs: [
            {
              id: generateId(),
              assetId: detail.assetId,
              changeTime: order.inboundDate + ' ' + new Date().toTimeString().slice(0, 5),
              changeType: 'create',
              changeTypeName: '入库',
              operator: order.operator,
              remark: '采购入库，物资进入固定资产仓库',
              fromWarehouse: '',
              toWarehouse: faWarehouse?.name || '',
            }
          ],
        });
      }
    });

    if (order.purchaseOrderId) {
      const po = contractPurchaseOrders.find(o => o.id === order.purchaseOrderId);
      if (po) {
        order.details.forEach((detail) => {
          const targetDetail = po.details.find(d => d.productId === detail.productId);
          if (targetDetail) {
            updateContractPurchaseOrder(po.id, {
              details: po.details.map(d =>
                d.productId === targetDetail.productId
                  ? { ...d, deliveredQuantity: d.deliveredQuantity + detail.quantity }
                  : d
              )
            });
          }
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    const order = inboundOrders.find((o) => o.id === id);
    if (!order) return;
    if (!confirm(`确认删除入库单 ${order.orderNo}？`)) return;
    setInboundOrders(inboundOrders.filter((o) => o.id !== id));
  };

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printItem, setPrintItem] = useState<AssetInboundOrder | null>(null);

  const handlePrint = (row: AssetInboundOrder) => {
    setViewItem(null);
    setPrintItem(row);
    setPrintTrigger((prev) => prev + 1);
  };

  const helpContent = {
    title: '资产入库功能说明',
    description: '资产入库用于将采购的物资入库到固定资产仓库，支持一次性选择多种物资批量入库，入库后物资状态为"在仓"，待领用时生成固定资产档案。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增入库单"按钮',
          '选择关联的采购订单',
          '从订单明细中勾选多项要入库的物资（支持多选）',
          '在下方明细表格中调整每项物资的入库数量',
          '确认信息后保存'
        ]
      },
      {
        heading: '确认入库',
        items: [
          '待入库状态的入库单，点击"确认入库"',
          '所有物资明细将进入固定资产仓库，状态变为"在仓"',
          '同时更新采购订单的已交付数量'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看入库单详细信息及物资明细',
          '删除：仅待入库状态的单据可以删除',
          '打印：打印入库单，包含所有物资明细'
        ]
      },
      {
        heading: '统计卡片说明',
        items: [
          '今日入库单：按入库日期为今日统计，包含所有状态的入库单数量',
          '本月入库单：按入库日期为本月统计，包含所有状态的入库单数量',
          '待入库：状态为 pending（待入库）的入库单数量',
          '已完成：状态为 completed（已入库）的入库单数量'
        ]
      },
      {
        heading: '反确认',
        items: [
          '已完成(completed)的入库单可执行反确认',
          '反确认操作会回退单据状态为待入库，并将资产状态恢复为未入库',
          '点击操作栏的"反确认"按钮，确认后即可执行'
        ]
      }
    ]
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">资产入库管理</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <PrimaryButton onClick={openAdd}>
            <Plus size={14} /> 新增入库单
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="text-xs text-[#606266] mb-1">今日入库单</div>
          <div className="text-2xl font-bold text-[#303133]">{stats.todayCount}</div>
          <div className="text-xs text-[#909399] mt-1">单</div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="text-xs text-[#606266] mb-1">本月入库单</div>
          <div className="text-2xl font-bold text-[#409eff]">{stats.monthCount}</div>
          <div className="text-xs text-[#909399] mt-1">单</div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="text-xs text-[#606266] mb-1">待入库</div>
          <div className="text-2xl font-bold text-[#e6a23c]">{stats.pendingCount}</div>
          <div className="text-xs text-[#909399] mt-1">单</div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="text-xs text-[#606266] mb-1">已完成</div>
          <div className="text-2xl font-bold text-[#67c23a]">{stats.completedCount}</div>
          <div className="text-xs text-[#909399] mt-1">单</div>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({ orderNo: filterOrderNo, assetName: filterAssetName, status: filterStatus, from: filterFrom, to: filterTo })
        }
        onReset={() => {
          setFilterOrderNo('');
          setFilterAssetName('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ orderNo: '', assetName: '', status: '', from: '', to: '' });
        }}
      >
        <SearchField label="入库单号" placeholder="请输入" value={filterOrderNo} onChange={setFilterOrderNo} />
        <SearchField label="物资名称" placeholder="请输入" value={filterAssetName} onChange={setFilterAssetName} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">入库状态：</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
          >
            <option value="">全部</option>
            <option value="pending">待入库</option>
            <option value="completed">已入库</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
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

      <Modal
        open={!!viewItem}
        title={`资产入库单详情 - ${viewItem?.orderNo}`}
        onClose={() => setViewItem(null)}
      >
        {viewItem && (
          <div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">入库单号：</span><span className="text-[#303133]">{viewItem.orderNo}</span></div>
              <div><span className="text-[#606266]">入库状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">采购订单号：</span><span className="text-[#303133]">{viewItem.purchaseOrderNo || '-'}</span></div>
              <div><span className="text-[#606266]">供应商：</span><span className="text-[#303133]">{viewItem.supplierName || '-'}</span></div>
              <div><span className="text-[#606266]">物资明细：</span><span className="text-[#303133]">{viewItem.details.length} 项</span></div>
              <div><span className="text-[#606266]">总金额：</span><span className="text-[#303133]">¥{viewItem.details.reduce((s, d) => s + d.unitPrice * d.quantity, 0).toLocaleString()}</span></div>
              <div><span className="text-[#606266]">入库日期：</span><span className="text-[#303133]">{viewItem.inboundDate}</span></div>
              <div><span className="text-[#606266]">经办人：</span><span className="text-[#303133]">{viewItem.operator}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              <div className="col-span-2"><span className="text-[#606266]">备注：</span><span className="text-[#303133]">{viewItem.remark || '-'}</span></div>
            </div>
            <div className="mb-4">
              <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">入库明细</div>
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa]">
                    <tr className="text-[#606266]">
                      <th className="px-3 py-2 text-left">序号</th>
                      <th className="px-3 py-2 text-left">物资编码</th>
                      <th className="px-3 py-2 text-left">物资名称</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">单位</th>
                      <th className="px-3 py-2 text-right">入库数量</th>
                      <th className="px-3 py-2 text-right">单价</th>
                      <th className="px-3 py-2 text-right">金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((d, idx) => (
                      <tr key={d.productId} className="border-t border-[#f0f2f5]">
                        <td className="px-3 py-2 text-[#303133]">{idx + 1}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.assetCode || d.productCode}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.productName}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">{d.quantity}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">¥{d.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">¥{(d.unitPrice * d.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#ebeef5] bg-[#fafbfc]">
                      <td colSpan={7} className="px-3 py-2 text-right text-[#606266] font-medium">合计：</td>
                      <td className="px-3 py-2 text-right text-[#303133] font-medium">
                        ¥{viewItem.details.reduce((s, d) => s + d.unitPrice * d.quantity, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0f2f5]">
              <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editItem}
        title={`新增资产入库单`}
        onClose={() => setEditItem(null)}
        width="max-w-[1000px]"
      >
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">基本信息</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-3 border border-[#ebeef5] rounded bg-[#fafbfc]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-24">入库单号：</span>
                <span className="text-xs text-[#303133]">{editItem?.orderNo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-24">创建时间：</span>
                <span className="text-xs text-[#303133]">{editItem?.createTime}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-24"><span className="text-[#f56c6c]">*</span>采购订单：</span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    value={editPurchaseOrderNo || ''}
                    placeholder="请选择采购订单"
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#909399] bg-[#f5f7fa] rounded cursor-not-allowed"
                  />
                  <DefaultButton size="small" onClick={() => setPickerOpen(true)}>
                    <Package size={12} /> 选择订单
                  </DefaultButton>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-24">供应商：</span>
                <span className="text-xs text-[#303133]">{editSupplierName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-24">入库仓库：</span>
                <span className="text-xs text-[#303133]">{fixedAssetWarehouses[0]?.name || '固定资产仓'}</span>
              </div>
            </div>
          </div>

          {selectedOrder && (
            <div>
              <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">
                选择物资
                <span className="text-[#909399] font-normal ml-2">（支持多选，勾选后加入入库明细）</span>
              </div>
              <div className="max-h-[240px] overflow-y-auto border border-[#ebeef5] rounded">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa] sticky top-0">
                    <tr className="text-[#606266]">
                      <th className="px-3 py-2 text-left">选择</th>
                      <th className="px-3 py-2 text-left">物资编码</th>
                      <th className="px-3 py-2 text-left">物资名称</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">单位</th>
                      <th className="px-3 py-2 text-right">合同数量</th>
                      <th className="px-3 py-2 text-right">已交付</th>
                      <th className="px-3 py-2 text-right">剩余</th>
                      <th className="px-3 py-2 text-right">单价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.details.map((detail) => {
                      const remaining = detail.contractQuantity - detail.deliveredQuantity;
                      const isSelected = editDetails.some(d => d.productId === detail.productId);
                      const disabled = remaining <= 0;
                      return (
                        <tr
                          key={detail.id}
                          className={`border-t border-[#f0f2f5] ${isSelected ? 'bg-[#ecf5ff]' : disabled ? 'opacity-50' : 'hover:bg-[#f5f7fa]'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => !disabled && handleToggleProduct(detail)}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              disabled={disabled}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2 text-[#303133]">{detail.productCode}</td>
                          <td className="px-3 py-2 text-[#303133]">{detail.productName}</td>
                          <td className="px-3 py-2 text-[#303133]">{detail.specification || '-'}</td>
                          <td className="px-3 py-2 text-[#303133]">{detail.unit}</td>
                          <td className="px-3 py-2 text-right text-[#303133]">{detail.contractQuantity}</td>
                          <td className="px-3 py-2 text-right text-[#303133]">{detail.deliveredQuantity}</td>
                          <td className="px-3 py-2 text-right text-[#67c23a]">{remaining}</td>
                          <td className="px-3 py-2 text-right text-[#303133]">¥{detail.unitPrice.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {editDetails.length > 0 && (
            <div>
              <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">
                入库明细
                <span className="text-[#909399] font-normal ml-2">（共 {editDetails.length} 项，可调整入库数量）</span>
              </div>
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa]">
                    <tr className="text-[#606266]">
                      <th className="px-3 py-2 text-left">序号</th>
                      <th className="px-3 py-2 text-left">物资编码</th>
                      <th className="px-3 py-2 text-left">物资名称</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">单位</th>
                      <th className="px-3 py-2 text-right">入库数量</th>
                      <th className="px-3 py-2 text-right">单价</th>
                      <th className="px-3 py-2 text-right">金额</th>
                      <th className="px-3 py-2 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editDetails.map((d, idx) => (
                      <tr key={d.productId} className="border-t border-[#f0f2f5] hover:bg-[#fafbfc]">
                        <td className="px-3 py-2 text-[#303133]">{idx + 1}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.productCode}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.productName}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            value={d.quantity}
                            onChange={(e) => handleUpdateDetailQuantity(d.productId, Number(e.target.value))}
                            min={1}
                            max={d.remainingQty}
                            className="w-20 h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded text-right focus:outline-none focus:border-[#2f54eb]"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-[#606266] bg-[#f5f7fa]">¥{d.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">¥{(d.unitPrice * d.quantity).toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                          <TextButton type="danger" onClick={() => handleRemoveDetail(d.productId)}>
                            <Trash2 size={12} /> 移除
                          </TextButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#ebeef5] bg-[#fafbfc]">
                      <td colSpan={7} className="px-3 py-2 text-right text-[#606266] font-medium">合计：</td>
                      <td className="px-3 py-2 text-right text-[#303133] font-medium">¥{editTotalAmount.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-3 border border-[#ebeef5] rounded bg-[#fafbfc]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606266] whitespace-nowrap w-24">入库日期：</span>
              <input
                type="date"
                value={editInboundDate}
                onChange={(e) => setEditInboundDate(e.target.value)}
                className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606266] whitespace-nowrap w-24">经办人：</span>
              <input
                type="text"
                value={editOperator}
                onChange={(e) => setEditOperator(e.target.value)}
                placeholder="请输入经办人"
                className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <span className="text-xs text-[#606266] whitespace-nowrap w-24 pt-1">备注：</span>
              <textarea
                value={editRemark}
                onChange={(e) => setEditRemark(e.target.value)}
                placeholder="请输入备注"
                rows={2}
                className="flex-1 px-2 py-1 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#f0f2f5]">
            <div className="text-xs text-[#606266]">
              已选 <span className="text-[#303133] font-medium">{editDetails.length}</span> 项物资，
              合计金额：<span className="text-[#f56c6c] font-medium">¥{editTotalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
              <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={pickerOpen}
        title="选择采购订单"
        onClose={() => setPickerOpen(false)}
        width="max-w-[900px]"
      >
        <div className="space-y-3">
          {availablePurchaseOrders.length === 0 ? (
            <div className="text-center py-8 text-[#909399] text-sm">暂无可用的采购订单</div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">订单编号</th>
                    <th className="px-3 py-2 text-left">合同编号</th>
                    <th className="px-3 py-2 text-left">供应商</th>
                    <th className="px-3 py-2 text-left">创建时间</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {availablePurchaseOrders.map((order) => (
                    <tr key={order.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                      <td className="px-3 py-2 text-[#303133]">{order.orderNo}</td>
                      <td className="px-3 py-2 text-[#303133]">{order.contractNo}</td>
                      <td className="px-3 py-2 text-[#303133]">{order.supplierName}</td>
                      <td className="px-3 py-2 text-[#303133]">{order.createTime}</td>
                      <td className="px-3 py-2 text-center">
                        <TextButton onClick={() => handleSelectPurchaseOrder(order)}>选择</TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <DefaultButton onClick={() => setPickerOpen(false)}>取消</DefaultButton>
          </div>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="资产入库单"
          orderNo={printItem.orderNo}
          orderType="资产入库"
          orderDate={printItem.inboundDate}
          warehouseName={fixedAssetWarehouses[0]?.name || '固定资产仓'}
          custodian={printItem.operator}
          remark={printItem.remark}
          details={printItem.details.map((d) => ({
            productCode: d.assetCode || d.productCode,
            productName: d.productName,
            specification: d.specification,
            unit: d.unit,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            amount: d.unitPrice * d.quantity,
            remark: `入库仓库：${fixedAssetWarehouses[0]?.name || '固定资产仓'}，采购订单：${printItem.purchaseOrderNo}，供应商：${printItem.supplierName}`,
          }))}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '设备编码' },
            { key: 'productName', label: '设备名称' },
            { key: 'specification', label: '规格型号' },
            { key: 'unit', label: '单位' },
            { key: 'quantity', label: '数量', align: 'right' },
            { key: 'unitPrice', label: '单价', align: 'right' },
            { key: 'amount', label: '金额', align: 'right' },
            { key: 'remark', label: '备注' },
          ]}
        />
      )}
    </div>
  );
}