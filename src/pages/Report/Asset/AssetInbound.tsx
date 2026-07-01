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

interface AssetInboundOrder {
  id: string;
  orderNo: string;
  purchaseOrderId: string;
  purchaseOrderNo: string;
  supplierName: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  amount: number;
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
    assetId: 'AE001',
    assetCode: 'SB20240001',
    assetName: '数控车床',
    specification: 'CJK6136',
    unit: '台',
    quantity: 1,
    amount: 150000,
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
    assetId: 'AE005',
    assetCode: 'SB20240005',
    assetName: '叉车',
    specification: 'CPCD30',
    unit: '辆',
    quantity: 1,
    amount: 68000,
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
  const [editProductId, setEditProductId] = useState('');
  const [editAssetName, setEditAssetName] = useState('');
  const [editSpecification, setEditSpecification] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editAmount, setEditAmount] = useState(0);
  const [editInboundDate, setEditInboundDate] = useState('');
  const [editOperator, setEditOperator] = useState('');
  const [editRemark, setEditRemark] = useState('');

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
      if (applied.assetName && !o.assetName.includes(applied.assetName)) return false;
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
    { key: 'assetName', title: '物资名称' },
    { key: 'specification', title: '规格型号' },
    { key: 'unit', title: '单位' },
    { key: 'quantity', title: '数量', align: 'right' },
    {
      key: 'amount',
      title: '金额',
      align: 'right',
      render: (row) => `¥${row.amount.toLocaleString()}`,
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
          </div>
        ),
      },
  ];

  const openAdd = () => {
    const newOrder: AssetInboundOrder = {
      id: 'ZCRK' + Date.now(),
      orderNo: generateAssetInboundNo(),
      purchaseOrderId: '',
      purchaseOrderNo: '',
      supplierName: '',
      assetId: '',
      assetCode: '',
      assetName: '',
      specification: '',
      unit: '',
      quantity: 1,
      amount: 0,
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
    setEditProductId('');
    setEditAssetName('');
    setEditSpecification('');
    setEditUnit('');
    setEditQuantity(1);
    setEditAmount(0);
    setEditInboundDate(newOrder.inboundDate);
    setEditOperator(currentUser.name);
    setEditRemark('');
  };

  const handleSelectPurchaseOrder = (order: ContractPurchaseOrder) => {
    setEditPurchaseOrderId(order.id);
    setEditPurchaseOrderNo(order.orderNo);
    setEditSupplierName(order.supplierName);
    setPickerOpen(false);
  };

  const handleSelectProduct = (detail: ContractPurchaseOrderDetail) => {
    const remainingQty = detail.contractQuantity - detail.deliveredQuantity;
    setEditProductId(detail.productId);
    setEditAssetName(detail.productName);
    setEditSpecification(detail.specification || '');
    setEditUnit(detail.unit);
    setEditAmount(detail.unitPrice);
    setEditQuantity(Math.min(1, remainingQty));
  };

  const selectedOrder = useMemo(() => {
    return contractPurchaseOrders.find(o => o.id === editPurchaseOrderId);
  }, [contractPurchaseOrders, editPurchaseOrderId]);

  const handleSave = () => {
    if (!editItem) return;
    if (!editPurchaseOrderId) { alert('请选择采购订单'); return; }
    if (!editProductId) { alert('请选择物资'); return; }
    if (!editQuantity || editQuantity <= 0) { alert('数量必须大于0'); return; }

    const order = contractPurchaseOrders.find(o => o.id === editPurchaseOrderId);
    const detail = order?.details.find(d => d.productId === editProductId);
    if (detail) {
      const remainingQty = detail.contractQuantity - detail.deliveredQuantity;
      if (editQuantity > remainingQty) {
        alert(`该物资剩余可入库数量为 ${remainingQty} ${detail.unit}`);
        return;
      }
    }

    const newAssetCode = generateAssetCode();
    const newAssetId = generateId();

    const updatedOrder: AssetInboundOrder = {
      ...editItem,
      purchaseOrderId: editPurchaseOrderId,
      purchaseOrderNo: editPurchaseOrderNo,
      supplierName: editSupplierName,
      assetId: newAssetId,
      assetCode: newAssetCode,
      assetName: editAssetName,
      specification: editSpecification,
      unit: editUnit,
      quantity: editQuantity,
      amount: editAmount * editQuantity,
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

    const existingAsset = assetEquipments.find((a) => a.id === order.assetId);
    if (existingAsset) {
      updateAssetEquipment(order.assetId, {
        status: 'in_storage',
        warehouseId: faWarehouse?.id,
        warehouseName: faWarehouse?.name,
      });
    } else {
      addAssetEquipment({
        id: order.assetId,
        code: order.assetCode,
        name: order.assetName,
        specification: order.specification,
        unit: order.unit,
        amount: order.amount,
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
            assetId: order.assetId,
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

    if (order.purchaseOrderId) {
      const po = contractPurchaseOrders.find(o => o.id === order.purchaseOrderId);
      if (po) {
        const newDetails = po.details.map(d => {
          if (d.productId === order.purchaseOrderId) {
            return { ...d, deliveredQuantity: d.deliveredQuantity + order.quantity };
          }
          return d;
        });
        const targetDetail = po.details.find(d => d.productId === order.assetId);
        if (targetDetail) {
          updateContractPurchaseOrder(po.id, {
            details: po.details.map(d => 
              d.productId === targetDetail.productId 
                ? { ...d, deliveredQuantity: d.deliveredQuantity + order.quantity }
                : d
            )
          });
        }
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
    description: '资产入库用于将采购的物资入库到固定资产仓库，入库后物资状态为"在仓"，待领用时生成固定资产档案。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增入库单"按钮',
          '选择关联的采购订单',
          '从订单明细中选择要入库的物资',
          '填写入库数量等信息后保存'
        ]
      },
      {
        heading: '确认入库',
        items: [
          '待入库状态的入库单，点击"确认入库"',
          '物资将进入固定资产仓库，状态变为"在仓"',
          '同时更新采购订单的已交付数量'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看入库单详细信息',
          '删除：仅待入库状态的单据可以删除'
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
              <div><span className="text-[#606266]">物资编码：</span><span className="text-[#303133]">{viewItem.assetCode}</span></div>
              <div><span className="text-[#606266]">物资名称：</span><span className="text-[#303133]">{viewItem.assetName}</span></div>
              <div><span className="text-[#606266]">规格型号：</span><span className="text-[#303133]">{viewItem.specification || '-'}</span></div>
              <div><span className="text-[#606266]">单位：</span><span className="text-[#303133]">{viewItem.unit}</span></div>
              <div><span className="text-[#606266]">数量：</span><span className="text-[#303133]">{viewItem.quantity}</span></div>
              <div><span className="text-[#606266]">金额：</span><span className="text-[#303133]">¥{viewItem.amount.toLocaleString()}</span></div>
              <div><span className="text-[#606266]">入库日期：</span><span className="text-[#303133]">{viewItem.inboundDate}</span></div>
              <div><span className="text-[#606266]">经办人：</span><span className="text-[#303133]">{viewItem.operator}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              <div className="col-span-2"><span className="text-[#606266]">备注：</span><span className="text-[#303133]">{viewItem.remark || '-'}</span></div>
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
        width="max-w-[900px]"
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
              <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">选择物资</div>
              <div className="max-h-[200px] overflow-y-auto border border-[#ebeef5] rounded">
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
                      const isSelected = editProductId === detail.productId;
                      return (
                        <tr 
                          key={detail.id} 
                          className={`border-t border-[#f0f2f5] cursor-pointer ${isSelected ? 'bg-[#ecf5ff]' : 'hover:bg-[#f5f7fa]'}`}
                          onClick={() => remaining > 0 && handleSelectProduct(detail)}
                        >
                          <td className="px-3 py-2">
                            <input 
                              type="radio" 
                              checked={isSelected} 
                              onChange={() => {}}
                              disabled={remaining <= 0}
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

          {editProductId && (
            <div>
              <div className="text-xs font-medium text-[#303133] mb-2 border-l-2 border-[#2f54eb] pl-2">入库信息</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-3 border border-[#ebeef5] rounded bg-[#fafbfc]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-24">物资名称：</span>
                  <input
                    type="text"
                    disabled
                    value={editAssetName}
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#909399] bg-[#f5f7fa] rounded cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-24">规格型号：</span>
                  <input
                    type="text"
                    disabled
                    value={editSpecification}
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#909399] bg-[#f5f7fa] rounded cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-24">单位：</span>
                  <input
                    type="text"
                    disabled
                    value={editUnit}
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#909399] bg-[#f5f7fa] rounded cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-24"><span className="text-[#f56c6c]">*</span>入库数量：</span>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    min={1}
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-24">单价：</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    min={0}
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266] whitespace-nowrap w-24">总金额：</span>
                  <span className="text-xs text-[#303133] font-medium">¥{(editAmount * editQuantity).toLocaleString()}</span>
                </div>
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
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f2f5]">
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
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
          details={[
            {
              productCode: printItem.assetCode,
              productName: printItem.assetName,
              specification: printItem.specification,
              unit: printItem.unit,
              quantity: printItem.quantity,
              unitPrice: printItem.amount / printItem.quantity,
              amount: printItem.amount,
              remark: `入库仓库：${fixedAssetWarehouses[0]?.name || '固定资产仓'}，采购订单：${printItem.purchaseOrderNo}，供应商：${printItem.supplierName}`,
            },
          ]}
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
