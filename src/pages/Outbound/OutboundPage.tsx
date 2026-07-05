import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import WorkOrderPickerModal from '@/components/common/WorkOrderPickerModal';
import SearchableSelect from '@/components/common/SearchableSelect';
import PrintDocument from '@/components/common/PrintDocument';
import { useStore } from '@/store/useStore';
import { generateOutboundOrderNo } from '@/mock/data';
import type { ProductPickerItem } from '@/components/common/ProductPickerModal';
import type { WorkOrderPickerItem } from '@/components/common/WorkOrderPickerModal';
import type { OutboundOrder, OutboundDetail } from '@/types';
import { Printer } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface Props {
  type?: 'lowvalue' | 'exhibition';
}

const helpContentMap: Record<string, any> = {
  lowvalue: {
    title: '低值易耗领用出库 - 功能操作说明',
    description: '低值易耗领用出库用于处理日常低值易耗品的领用出库操作。',
    sections: [
      {
        heading: '新增普通领用单',
        items: [
          '点击"新增普通领用单"按钮打开新增弹窗',
          '点击"选择物资"按钮，选择需要领用的物资',
          '填写领用部门、领用人、保管人、负责人等信息',
          '填写领用数量（不可超过可用库存）',
          '点击"保存"生成领用单，状态为待提交',
          '点击"保存并提交"提交领用单，状态为已提交'
        ]
      },
      {
        heading: '确认出库',
        items: [
          '已提交状态的领用单可点击"确认出库"完成出库',
          '确认出库后库存扣减，按FIFO原则消耗批次库存',
          '同步生成库存流水记录',
          '确认出库后单据状态更新为已出库，不可修改'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看领用单详细信息及物资明细',
          '编辑：待提交状态可修改领用单信息',
          '删除：待提交状态可删除领用单',
          '打印：领用单生成后即可打印，与状态无关'
        ]
      }
    ]
  },
  exhibition: {
    title: '展会物资领用出库 - 功能操作说明',
    description: '展会物资领用出库用于处理展会相关物资的领用出库操作，支持关联工单。',
    sections: [
      {
        heading: '新增工单出库单',
        items: [
          '点击"新增工单出库单"按钮打开新增弹窗',
          '点击"选择工单"按钮，选择需要领用的工单',
          '系统自动带出工单中的物资明细',
          '可点击"选择物资"额外添加物资',
          '填写领用部门、领用人、保管人、负责人等信息',
          '填写领用数量（不可超过可用库存）',
          '点击"保存"生成领用单，状态为待提交',
          '点击"保存并提交"提交领用单，状态为已提交'
        ]
      },
      {
        heading: '确认出库',
        items: [
          '已提交状态的领用单可点击"确认出库"完成出库',
          '确认出库后库存扣减，按FIFO原则消耗批次库存',
          '同步生成库存流水记录',
          '确认出库后单据状态更新为已出库，不可修改'
        ]
      },
      {
        heading: '冻结项目限制',
        items: [
          '若项目被冻结（通过展会物资领用报表的"冻结展会物料领用"功能），该项目的出库单将受到限制',
          '已冻结项目的出库单无法编辑、删除或提交',
          '已冻结项目的出库单无法进行确认出库操作',
          '冻结状态在项目名称旁显示为"已冻结"标识',
          '如需解除限制，请在展会物资领用报表中使用"解冻项目"功能'
        ]
      },
      {
        heading: '其他操作',
        items: [
          '查看：查看领用单详细信息及物资明细',
          '编辑：待提交状态可修改领用单信息',
          '删除：待提交状态可删除领用单',
          '打印：领用单生成后即可打印，与状态无关'
        ]
      }
    ]
  }
};

export default function OutboundPage({ type = 'lowvalue' }: Props) {
  const helpContent = helpContentMap[type];
  const outboundOrders = useStore((s) => s.outboundOrders);
  const addOutboundOrder = useStore((s) => s.addOutboundOrder);
  const updateOutboundOrder = useStore((s) => s.updateOutboundOrder);
  const deleteOutboundOrder = useStore((s) => s.deleteOutboundOrder);
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const inventories = useStore((s) => s.inventories);
  const updateInventory = useStore((s) => s.updateInventory);
  const addInventory = useStore((s) => s.addInventory);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const employees = useStore((s) => s.employees);
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);
  const workOrderConfigs = useStore((s) => s.workOrderConfigs);
  const currentUser = useStore((s) => s.currentUser);
  const isWorkOrderFrozen = useStore((s) => s.isWorkOrderFrozen);
  const isExhibitionFrozen = useStore((s) => s.isExhibitionFrozen);
  const frozenExhibitions = useStore((s) => s.frozenExhibitions);

  const isExhibition = type === 'exhibition';
  const pageTitle = isExhibition ? '展会物资领用出库' : '低值易耗领用出库';
  const orderType: 'lowvalue' | 'exhibition' = type as 'lowvalue' | 'exhibition';
  const workOrderMode = isExhibition;

  const filteredWarehouses = useMemo(() => {
    const category = isExhibition ? 'exhibition' : 'consumable';
    return warehouses.filter((w) => w.category === category);
  }, [warehouses, isExhibition]);

  const getOrderExhibitionName = (order: OutboundOrder): string | null => {
    if (!isExhibition) return null;
    for (const d of order.details) {
      const workOrderId = (d as any).workOrderId;
      if (workOrderId) {
        const config = workOrderConfigs.find(c => c.workOrderId === workOrderId);
        if (config) return config.exhibitionName;
      }
    }
    return null;
  };

  const isOrderFrozen = (order: OutboundOrder): boolean => {
    const exhibitionName = getOrderExhibitionName(order);
    if (!exhibitionName) return false;
    return isExhibitionFrozen(exhibitionName);
  };

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', warehouse: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return outboundOrders
      .filter((o) => o.type === orderType)
      .filter((o) => {
        if (applied.no && !o.orderNo.includes(applied.no)) return false;
        if (applied.status && o.status !== applied.status) return false;
        if (applied.warehouse && o.warehouseId !== applied.warehouse) return false;
        if (applied.from && o.createTime < applied.from) return false;
        if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
        return true;
      });
  }, [outboundOrders, applied, orderType]);

  const statusText = (s: string) => {
    if (s === 'confirmed') return '已出库';
    if (s === 'submitted') return '已提交';
    return '待提交';
  };
  const statusColor = (s: string) => {
    if (s === 'confirmed') return 'text-[#67c23a]';
    if (s === 'submitted') return 'text-[#409eff]';
    return 'text-[#e6a23c]';
  };

  const columns: ColumnDef<OutboundOrder>[] = [
    { key: 'orderNo', title: '出库单号' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => row.details.reduce((a, b) => a + (b.quantity || 0), 0),
    },
    { key: 'operator', title: '领用人', render: (row) => row.operator || '-' },
    { key: 'creator', title: '制单人', render: (row) => (row as any).creator || '-' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'createTime', title: '创建时间' },
    {
      key: 'op',
      title: '操作',
      render: (row) => {
        const frozen = isExhibition && isOrderFrozen(row);
        return (
          <div className="flex items-center gap-3">
            <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
            <TextButton onClick={() => { setViewItem(null); setPrintItem(row); setPrintTrigger(prev => prev + 1); }}>
                <Printer size={12} /> 打印
              </TextButton>
            {frozen && (
              <span className="text-xs text-orange-500 font-medium">已冻结</span>
            )}
            {row.status === 'pending' && !frozen && (
              <>
                <TextButton
                  onClick={() => {
                    setIsNew(false);
                    const cloned = JSON.parse(JSON.stringify(row));
                    setEditItem(cloned);
                    setSelectedDetailIndices([]);
                  }}
                >
                  编辑
                </TextButton>
                <TextButton
                  type="danger"
                  onClick={() => {
                    if (confirm(`确认删除 ${row.orderNo}？`)) deleteOutboundOrder(row.id);
                  }}
                >
                  删除
                </TextButton>
              </>
            )}
            {row.status === 'submitted' && !frozen && (
              <TextButton onClick={() => handleConfirmOutbound(row.id)}>确认出库</TextButton>
            )}
          </div>
        );
      },
    },
  ];

  // 查看弹窗
  const [viewItem, setViewItem] = useState<OutboundOrder | null>(null);
  const [printItem, setPrintItem] = useState<OutboundOrder | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);

  // 编辑弹窗
  const [editItem, setEditItem] = useState<OutboundOrder | null>(null);
  const [selectedDetailIndices, setSelectedDetailIndices] = useState<number[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [workOrderPickerOpen, setWorkOrderPickerOpen] = useState(false);

  const openAdd = (mode: 'normal' | 'workorder') => {
    const newOrder: any = {
      id: 'OUT' + Date.now(),
      orderNo: generateOutboundOrderNo(orderType),
      type: orderType,
      warehouseId: filteredWarehouses[0]?.id || '',
      warehouseName: filteredWarehouses[0]?.name || '',
      custodian: '',
      personInCharge: '',
      operator: '',
      creator: currentUser.name,
      status: 'pending',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
    };
    setIsNew(true);
    setEditItem(newOrder);
    setSelectedDetailIndices([]);
  };

  // 产品选择（普通领用）
  const handlePickerConfirm = (selectedProducts: ProductPickerItem[]) => {
    if (!editItem) return;
    const newDetails: OutboundDetail[] = selectedProducts.map((p) => {
      return {
        id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
        outboundOrderId: editItem.id,
        productId: p.id,
        productCode: p.code || '',
        productName: p.name || '',
        positionId: '',
        positionName: '',
        quantity: 0,
      };
    });
    const existingIds = new Set(editItem.details.map((d) => d.productId));
    const toAdd = newDetails.filter((d) => !existingIds.has(d.productId));
    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setSelectedDetailIndices([]);
    setPickerOpen(false);
  };

  // 工单出库选择处理
  const handleWorkOrderConfirm = (selectedItems: WorkOrderPickerItem[]) => {
    if (!editItem) return;

    const newDetails: OutboundDetail[] = [];
    selectedItems.forEach((item) => {
      [...item.mainProducts, ...item.auxiliaryProducts].forEach((product) => {
        newDetails.push({
          id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
          outboundOrderId: editItem.id,
          productId: product.productId,
          productCode: product.productCode,
          productName: product.productName,
          positionId: '',
          positionName: '',
          quantity: product.quantity,
          workOrderId: item.workOrderId,
          workOrderCode: item.workOrderCode,
          workOrderName: item.workOrderName,
          isMain: item.mainProducts.some((p) => p.productId === product.productId),
        });
      });
    });

    const existingIds = new Set(editItem.details.map((d) => `${(d as any).workOrderId || ''}::${d.productId}`));
    const toAdd = newDetails.filter((d) => !existingIds.has(`${(d as any).workOrderId}::${d.productId}`));

    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setSelectedDetailIndices([]);
    setWorkOrderPickerOpen(false);
  };

  const updateDetail = (idx: number, field: string, value: any) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    (newDetails[idx] as any)[field] = value;
    if (field === 'productId') {
      const p = products.find((x) => x?.id === value);
      newDetails[idx].productCode = p?.code || '';
      newDetails[idx].productName = p?.name || '';
    }
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_, i) => i !== idx) });
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
    if (!editItem) return;
    if (selectedDetailIndices.length === editItem.details.length) {
      setSelectedDetailIndices([]);
    } else {
      setSelectedDetailIndices(editItem.details.map((_, i) => i));
    }
  };

  const handleBatchSetQuantity = () => {
    if (!editItem) return;
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
    const newDetails = [...editItem.details];
    selectedDetailIndices.forEach(function(idx) {
      (newDetails[idx] as any).quantity = qty;
    });
    setEditItem({ ...editItem, details: newDetails });
  };

  const handleBatchDelete = () => {
    if (!editItem) return;
    if (selectedDetailIndices.length === 0) {
      alert('请先勾选要删除的记录');
      return;
    }
    if (!confirm(`确定要删除选中的 ${selectedDetailIndices.length} 条记录吗？`)) {
      return;
    }
    const indicesToDelete = new Set(selectedDetailIndices);
    setEditItem({ ...editItem, details: editItem.details.filter((_, i) => !indicesToDelete.has(i)) });
    setSelectedDetailIndices([]);
  };

  const handleSaveOnly = () => {
    if (!editItem) return;
    const payload = { ...editItem, status: 'pending' as const };
    if (isNew) addOutboundOrder(payload);
    else updateOutboundOrder(editItem.id, payload);
    setEditItem(null);
  };

  const handleSubmit = () => {
    if (!editItem) return;
    if (!editItem.details.length) {
      alert('请添加至少一个产品');
      return;
    }
    for (const d of editItem.details) {
      if (!d.quantity || d.quantity <= 0) {
        alert(`产品 "${d.productName}" 的数量必须大于0`);
        return;
      }
    }

    if (isExhibition && isOrderFrozen(editItem)) {
      alert('该出库单关联的展会已被冻结，无法提交');
      return;
    }

    // 提交时只更新状态，不扣减库存
    const payload = { ...editItem, status: 'submitted' as const };
    if (isNew) addOutboundOrder(payload);
    else updateOutboundOrder(editItem.id, payload);
    setEditItem(null);
  };

  // 确认出库：真正扣减库存
  const handleConfirmOutbound = (id: string) => {
    const order = outboundOrders.find(o => o.id === id);
    if (!order) return;
    if (order.status !== 'submitted') return;
    if (isExhibition && isOrderFrozen(order)) {
      alert('该出库单关联的展会已被冻结，无法确认出库');
      return;
    }
    if (!confirm(`确认出库 ${order.orderNo}？确认后将扣减库存，不可撤销。`)) return;

    const defaultPos = positions.find((p: any) => p.warehouseId === order.warehouseId);

    const allConsumptions: { detailIndex: number; batchId: string; batchNo: string; quantity: number }[] = [];

    for (let di = 0; di < order.details.length; di++) {
      const d = order.details[di];
      const productBatches = batchInventories
        .filter((b) => b.productId === d.productId && b.quantity > 0 && (!order.warehouseId || b.warehouseId === order.warehouseId))
        .sort((a, b) => a.inboundTime.localeCompare(b.inboundTime));

      let remaining = d.quantity;
      const consumptions: { batchId: string; batchNo: string; quantity: number }[] = [];
      for (const batch of productBatches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.quantity, remaining);
        consumptions.push({ batchId: batch.id, batchNo: batch.batchNo, quantity: deduct });
        remaining -= deduct;
      }

      if (remaining > 0) {
        alert(`产品 "${d.productName}" 可用量不足，需要 ${d.quantity}，可用 ${d.quantity - remaining}`);
        return;
      }
      consumptions.forEach(c => allConsumptions.push({ detailIndex: di, ...c }));
    }

    allConsumptions.forEach(c => {
      const batch = batchInventories.find(b => b.id === c.batchId);
      if (batch) {
        updateBatchInventory(c.batchId, { quantity: batch.quantity - c.quantity });
      }
    });

    for (const d of order.details) {
      const posId = d.positionId || defaultPos?.id || '';
      const posName = d.positionName || defaultPos?.name || '';

      const existingInv = inventories.find(
        inv => inv.productId === d.productId && inv.warehouseId === order.warehouseId && inv.positionId === posId
      );
      if (existingInv) {
        updateInventory(existingInv.id, { quantity: existingInv.quantity - d.quantity });
      }

      addStockTransaction({
        id: 'TX' + Date.now() + Math.random().toString(36).slice(2, 7),
        transactionNo:
          'TX' +
          new Date().toISOString().slice(0, 10).replace(/-/g, '') +
          Math.random().toString(36).slice(2, 8).toUpperCase(),
        transactionTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        transactionType: 'outbound',
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName || '',
        positionId: posId,
        positionName: posName,
        quantity: -d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        sourceType: (d as any).workOrderId ? '工单出库' : pageTitle,
        batchNo: allConsumptions.filter(c => c.detailIndex === order.details.indexOf(d))[0]?.batchNo || '',
        operator: order.operator || '',
      });
    }

    const updatedDetails = order.details.map((d, di) => ({
      ...d,
      batchConsumptions: allConsumptions.filter(c => c.detailIndex === di).map(c => ({
        batchId: c.batchId,
        batchNo: c.batchNo,
        quantity: c.quantity
      }))
    }));

    updateOutboundOrder(id, { ...order, details: updatedDetails, status: 'confirmed' as const });
  };

  const totalQuantity = editItem?.details.reduce((s, d) => s + (d.quantity || 0), 0) || 0;

  const hasTransferOrder = editItem?.details.some((d) => !!(d as any).transferOrderId || !!(d as any).workOrderId);

  // 明细表头配置
  const detailHeaders = [
    { label: 'checkbox', w: 'w-8' },
    { label: '#', w: 'w-8' },
    { label: '物资编码', w: 'w-28' },
    { label: '物资名称', w: 'flex-1' },
    { label: '规格', w: 'w-24' },
    { label: '单位', w: 'w-16' },
    { label: '可用库存', w: 'w-20' },
    { label: '出库数量', w: 'w-24' },
    ...(workOrderMode ? [{ label: '工单', w: 'w-32' }] : []),
    { label: '操作', w: 'w-12' },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">{pageTitle}单</h2>
        <div className="flex gap-2">
          <FeatureHelpButton content={helpContent} />
          <PrimaryButton onClick={() => openAdd(isExhibition ? 'workorder' : 'normal')}>
            + 新增{isExhibition ? '工单出库单' : '普通领用单'}
          </PrimaryButton>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({ no: filterNo, status: filterStatus, warehouse: filterWarehouse, from: filterFrom, to: filterTo })
        }
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterWarehouse('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ no: '', status: '', warehouse: '', from: '', to: '' });
        }}
      >
        <SearchField label="出库单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">状态：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部</option>
            <option value="pending">待提交</option>
            <option value="submitted">已提交</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">仓库：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
          >
            <option value="">全部</option>
            {filteredWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 查看弹窗 */}
      <Modal open={!!viewItem} title={`${pageTitle}单详情`} onClose={() => setViewItem(null)}>
        {viewItem && (
          <>
            {(() => {
              const viewHasTransferOrder = viewItem.details.some((d: any) => !!(d as any).transferOrderId || !!(d as any).workOrderId);
              return (
                <>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
                    <div><span className="text-[#606266]">出库单号：</span><span className="text-[#303133]">{viewItem.orderNo}</span></div>
                    <div><span className="text-[#606266]">仓库：</span><span className="text-[#303133]">{viewItem.warehouseName}</span></div>
                    <div><span className="text-[#606266]">状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
                    <div><span className="text-[#606266]">领用人：</span><span className="text-[#303133]">{viewItem.operator || '-'}</span></div>
                    <div><span className="text-[#606266]">制单人：</span><span className="text-[#303133]">{(viewItem as any).creator || '-'}</span></div>
                    <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
                    {(viewItem as any).custodian && (
                      <div><span className="text-[#606266]">保管人：</span><span className="text-[#303133]">{(viewItem as any).custodian}</span></div>
                    )}
                    {(viewItem as any).personInCharge && (
                      <div><span className="text-[#606266]">负责人：</span><span className="text-[#303133]">{(viewItem as any).personInCharge}</span></div>
                    )}
                    {viewHasTransferOrder && (
                      <div><span className="text-[#606266]">出库类型：</span><span className="text-[#303133]">工单出库</span></div>
                    )}
                    {isExhibition && (viewItem as any).implementUnit && (
                      <div><span className="text-[#606266]">实施单位：</span><span className="text-[#303133]">{(viewItem as any).implementUnit}</span></div>
                    )}
                    {isExhibition && (() => {
                      const woDetail = viewItem.details.find((d: any) => d.workOrderId);
                      const config = woDetail ? workOrderConfigs.find((c) => c.workOrderId === (woDetail as any).workOrderId) : null;
                      return config?.exhibitionName ? (
                        <div><span className="text-[#606266]">所属展会：</span><span className="text-[#303133]">{config.exhibitionName}</span></div>
                      ) : null;
                    })()}
                  </div>
                  <div className="text-sm font-medium text-[#303133] mb-3">产品明细</div>
                  <table className="w-full text-sm border border-[#ebeef5] rounded overflow-hidden">
                    <thead>
                      <tr className="bg-[#f5f7fa] text-[#606266]">
                        <th className="px-4 py-3 text-left">物资编码</th>
                        <th className="px-4 py-3 text-left">物资名称</th>
                        <th className="px-4 py-3 text-left">规格</th>
                        <th className="px-4 py-3 text-left">单位</th>
                        {viewHasTransferOrder && <th className="px-4 py-3 text-left">关联工单号</th>}
                        <th className="px-4 py-3 text-right">数量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewItem.details.length ? (
                        viewItem.details.map((d, i) => (
                          <tr key={i} className={`border-t border-[#ebeef5] ${selectedDetailIndices.includes(i) ? 'bg-[#ecf5ff]' : ''}`}>
                            <td className="px-4 py-3 text-[#303133]">{d.productCode}</td>
                            <td className="px-4 py-3 text-[#303133]">{d.productName}</td>
                            <td className="px-4 py-3 text-[#303133]">
                              {products.find((p) => p?.id === d.productId)?.specification || '-'}
                            </td>
                            <td className="px-4 py-3 text-[#303133]">
                              {products.find((p) => p?.id === d.productId)?.unit || '-'}
                            </td>
                            {viewHasTransferOrder && (
                              <td className="px-4 py-3 text-[#2f54eb]">
                                {(d as any).workOrderCode || (d as any).transferOrderNo || '-'}
                              </td>
                            )}
                            <td className="px-4 py-3 text-right text-[#303133]">{d.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={viewHasTransferOrder ? 6 : 5} className="py-6 text-center text-[#909399]">
                            无明细
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              );
            })()}
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {/* 打印组件 */}
      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title={`${pageTitle}单`}
          orderNo={printItem.orderNo}
          orderDate={printItem.createTime.slice(0, 10)}
          orderType={printItem.details.some((d) => !!(d as any).transferOrderId) ? '工单出库' : pageTitle}
          warehouseName={printItem.warehouseName || ''}
          operator={printItem.operator || ''}
          custodian={(printItem as any).custodian || ''}
          personInCharge={(printItem as any).personInCharge || ''}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '物资编码' },
            { key: 'productName', label: '物资名称' },
            { key: 'specification', label: '规格型号' },
            { key: 'unit', label: '单位' },
            { key: 'quantity', label: '数量', align: 'right' },
          ]}
          details={printItem.details.map((d) => ({
            productCode: d.productCode,
            productName: d.productName,
            specification: products.find((p) => p?.id === d.productId)?.specification || '',
            unit: products.find((p) => p?.id === d.productId)?.unit || '',
            quantity: d.quantity,
          }))}
        />
      )}

      {/* 编辑/新增弹窗 */}
      <Modal
        open={!!editItem}
        title={`${isNew ? (isExhibition ? '新增工单出库单' : '新增普通领用单') : '编辑'}`}
        onClose={() => {
          setEditItem(null);
        }}
        width="max-w-[1200px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto">
            {/* 基本信息 */}
            <div className="flex gap-4">
              <div className={`flex-1 grid gap-3 ${isExhibition ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <div>
                  <div className="mb-1 text-[#606266]">出库单号</div>
                  <input
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.orderNo}
                    onChange={(e) => setEditItem({ ...editItem, orderNo: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">仓库</div>
                  <select
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.warehouseId}
                    onChange={(e) => {
                      const wh = filteredWarehouses.find((w) => w.id === e.target.value);
                      setEditItem({ ...editItem, warehouseId: e.target.value, warehouseName: wh?.name });
                    }}
                  >
                    {filteredWarehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                {isExhibition && (
                  <div>
                    <div className="mb-1 text-[#606266]">实施单位</div>
                    <select
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                      value={(editItem as any).implementUnit || ''}
                      onChange={(e) => setEditItem({ ...(editItem as any), implementUnit: e.target.value })}
                    >
                      <option value="">请选择</option>
                      <option value="会展服务部">会展服务部</option>
                      <option value="工程技术部">工程技术部</option>
                      <option value="物业管理部">物业管理部</option>
                      <option value="安保服务部">安保服务部</option>
                      <option value="保洁服务部">保洁服务部</option>
                      <option value="设备运维部">设备运维部</option>
                      <option value="上海锦华">上海锦华</option>
                      <option value="湖南警安">湖南警安</option>
                      <option value="中裕电力">中裕电力</option>
                    </select>
                  </div>
                )}
                <div>
                  <div className="mb-1 text-[#606266]">领用人</div>
                  <SearchableSelect
                    options={employees.map((e) => ({ id: e.id, label: e.name, role: e.role }))}
                    value={editItem.operator}
                    onChange={(val) => setEditItem({ ...editItem, operator: val })}
                    placeholder="请选择"
                    width="w-full"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">保管人</div>
                  <SearchableSelect
                    options={employees.map((e) => ({ id: e.id, label: e.name, role: e.role }))}
                    value={(editItem as any).custodian || ''}
                    onChange={(val) => setEditItem({ ...(editItem as any), custodian: val })}
                    placeholder="请选择"
                    width="w-full"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">负责人</div>
                  <SearchableSelect
                    options={employees.map((e) => ({ id: e.id, label: e.name, role: e.role }))}
                    value={(editItem as any).personInCharge || ''}
                    onChange={(val) => setEditItem({ ...(editItem as any), personInCharge: val })}
                    placeholder="请选择"
                    width="w-full"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">制单人</div>
                  <input
                    disabled
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                    value={(editItem as any).creator || currentUser.name}
                  />
                </div>
              </div>
              {isExhibition && (
                <div className="w-[260px] flex flex-col items-center justify-center p-4 border border-dashed border-[#dcdfe6] rounded bg-[#f5f7fa]">
                  <div className="text-xs text-[#606266] mb-2">工单号</div>
                  <div className="text-2xl font-bold text-[#f56c6c]">
                    {(() => {
                      const woDetail = editItem.details.find((d: any) => d.workOrderCode);
                      return woDetail ? (woDetail as any).workOrderCode : '暂无';
                    })()}
                  </div>
                  <div className="text-xs text-[#606266] mt-3 mb-1">所属展会</div>
                  <div className="text-sm font-medium text-[#303133]">
                    {(() => {
                      const woDetail = editItem.details.find((d: any) => d.workOrderId);
                      if (!woDetail) return '暂无';
                      const config = workOrderConfigs.find((c) => c.workOrderId === (woDetail as any).workOrderId);
                      return config?.exhibitionName || '暂无';
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={(editItem as any).remark || ''}
                onChange={(e) => setEditItem({ ...(editItem as any), remark: e.target.value })}
              />
            </div>

            {/* 产品明细 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-[#303133]">
                  产品明细{' '}
                  <span className="text-[#909399] font-normal">
                    （共 {editItem.details.length} 种，合计 {totalQuantity} 件）
                  </span>
                  {selectedDetailIndices.length > 0 && <span className="ml-2 text-[#2f54eb]">已选 {selectedDetailIndices.length} 条</span>}
                </div>
                <div className="flex gap-2">
                  {editItem.details.length > 0 && (
                    <>
                      <DefaultButton size="small" onClick={handleBatchSetQuantity}>
                        批量设置数量
                      </DefaultButton>
                      <DefaultButton size="small" onClick={handleBatchDelete} className="text-[#f56c6c]">
                        批量删除
                      </DefaultButton>
                    </>
                  )}
                  {workOrderMode ? (
                    <>
                      <DefaultButton onClick={() => setWorkOrderPickerOpen(true)}>+ 选择工单</DefaultButton>
                      <DefaultButton onClick={() => setPickerOpen(true)}>+ 选择物资</DefaultButton>
                    </>
                  ) : (
                    <DefaultButton onClick={() => setPickerOpen(true)}>+ 选择物资</DefaultButton>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      {detailHeaders.map((h) => (
                        <th key={h.label} className={`px-2 py-2 text-left ${h.w}`}>
                          {h.label === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={selectedDetailIndices.length === editItem.details.length && editItem.details.length > 0}
                              onChange={toggleSelectAllDetails}
                              className="w-3.5 h-3.5 cursor-pointer"
                            />
                          ) : h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.details.length ? (
                      editItem.details.map((d: any, i: number) => {
                        const p = products.find((x) => x?.id === d.productId);
                        const available = batchInventories
                          .filter(
                            (b) =>
                              b.productId === d.productId &&
                              b.quantity > 0 &&
                              (!editItem!.warehouseId || b.warehouseId === editItem!.warehouseId)
                          )
                          .reduce((s, b) => s + b.quantity, 0);
                        return (
                          <tr key={i} className="border-t border-[#ebeef5]">
                            <td className="px-2 py-1.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedDetailIndices.includes(i)}
                                onChange={() => toggleSelectDetail(i)}
                                className="w-3.5 h-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-[#909399]">{i + 1}</td>
                            <td className="px-2 py-1.5 text-[#303133]">{d.productCode}</td>
                            <td className="px-2 py-1.5 text-[#303133]">{d.productName}</td>
                            <td className="px-2 py-1.5 text-[#909399]">{p?.specification || '-'}</td>
                            <td className="px-2 py-1.5 text-[#909399]">{p?.unit || '-'}</td>
                            <td className="px-2 py-1.5 text-[#67c23a]">{available}</td>
                            <td className="px-2 py-1.5 text-right">
                              <input
                                type="number"
                                min="0"
                                className="w-20 h-7 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                                value={d.quantity || ''}
                                onChange={(e) => updateDetail(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                              />
                            </td>
                            {workOrderMode && (
                              <td className="px-2 py-1.5 text-[#2f54eb]">
                                {(d as any).workOrderCode || '-'}
                              </td>
                            )}
                            <td className="px-2 py-1.5 text-center">
                              <TextButton
                                type="danger"
                                onClick={() => {
                                  removeDetail(i);
                                }}
                              >
                                删除
                              </TextButton>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={detailHeaders.length} className="py-8 text-center text-[#909399]">
                          暂无产品，请点击「添加产品」选择物资
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton
            onClick={() => {
              setEditItem(null);
            }}
          >
            取消
          </DefaultButton>
          <DefaultButton onClick={handleSaveOnly}>保存</DefaultButton>
          <PrimaryButton onClick={handleSubmit}>保存并提交</PrimaryButton>
        </div>
      </Modal>

      {/* 物资选择弹窗 */}
      <ProductPickerModal
        open={pickerOpen}
        title="选择物资"
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        showStockQty={true}
        onlyStocked={true}
      />

      {/* 工单选择弹窗 */}
      <WorkOrderPickerModal
        open={workOrderPickerOpen}
        title="选择工单"
        onClose={() => setWorkOrderPickerOpen(false)}
        onConfirm={handleWorkOrderConfirm}
      />
    </div>
  );
}
