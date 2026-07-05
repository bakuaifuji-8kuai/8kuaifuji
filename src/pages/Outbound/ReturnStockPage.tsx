import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { useStore } from '@/store/useStore';
import { generateBatchNo, generateStockTransactionNo } from '@/mock/data';
import type { ProductPickerItem } from '@/components/common/ProductPickerModal';
import type { ReturnOrder, OutboundOrder, OutboundDetail, ScrappedRecord, DamagedRecord } from '@/types';
import { Printer } from 'lucide-react';

type SourceOrderType = 'requisition' | 'scrap' | 'damaged';

interface UnifiedSourceOrder {
  id: string;
  orderNo: string;
  type: SourceOrderType;
  typeLabel: string;
  warehouseId: string;
  warehouseName: string;
  projectId?: string;
  projectName?: string;
  exhibitionName?: string;
  implementUnit?: string;
  itemCount: number;
  totalQuantity: number;
  operator: string;
  createTime: string;
  status: string;
  original: OutboundOrder | ScrappedRecord | DamagedRecord;
}

const helpContent = {
  title: '退库 - 功能操作说明',
  description: '退库用于处理已出库物资的退回入库操作。',
  sections: [
    {
      heading: '新增退库单',
      items: [
        '点击"新增退库单"按钮打开新增弹窗',
        '支持两种退库方式：选择来源单出库退货、直接选择物资退库',
        '选择来源单出库退货：选择已出库的物资（领用出库、报废出库、报损出库）',
        '选择来源单据后，系统自动带出物资明细',
        '可修改实际归还数量（不能超过原出库数量）',
        '直接选择物资退库：从物资档案中直接选择物资进行退库',
        '直接选择物资时需先选择仓库，再选择物资',
        '点击"保存"生成退库单，状态为待提交',
        '点击"保存并提交"提交退库单，状态为已提交'
      ]
    },
    {
      heading: '确认入库',
      items: [
        '已提交状态的退库单可点击"确认入库"完成入库',
        '确认入库后库存增加，按FIFO原则增加批次库存',
        '同步生成库存流水记录',
        '确认入库后单据状态更新为已入库，不可修改'
      ]
    },
    {
      heading: '冻结项目限制',
      items: [
        '若来源单据关联的项目被冻结，该来源单据不会显示在可选列表中',
        '已冻结项目的退库单无法编辑、删除或提交',
        '已冻结项目的退库单无法进行确认入库操作',
        '冻结状态在退库单旁显示为"已冻结"标识',
        '如需解除限制，请在展会物资领用报表中使用"解冻项目"功能'
      ]
    },
    {
      heading: '其他操作',
      items: [
        '查看：查看退库单详细信息及物资明细',
        '编辑：待提交状态可修改退库单信息',
        '删除：待提交状态可删除退库单',
        '打印：退库单生成后即可打印，与状态无关'
      ]
    }
  ]
};

export default function ReturnStockPage() {
  const returnOrders = useStore((s) => s.returnOrders);
  const addReturnOrder = useStore((s) => s.addReturnOrder);
  const updateReturnOrder = useStore((s) => s.updateReturnOrder);
  const deleteReturnOrder = useStore((s) => s.deleteReturnOrder);
  const addBatchInventory = useStore((s) => s.addBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const inventories = useStore((s) => s.inventories);
  const addInventory = useStore((s) => s.addInventory);
  const updateInventory = useStore((s) => s.updateInventory);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const outboundOrders = useStore((s) => s.outboundOrders);
  const scrappedRecords = useStore((s) => s.scrappedRecords);
  const damagedRecords = useStore((s) => s.damagedRecords);
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);
  const products = useStore((s) => s.products);
  const workOrderConfigs = useStore((s) => s.workOrderConfigs);
  const isExhibitionFrozen = useStore((s) => s.isExhibitionFrozen);
  const frozenExhibitions = useStore((s) => s.frozenExhibitions);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => w.category !== 'exhibition');
  }, [warehouses]);

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', warehouse: '', from: '', to: '' });

  const [sourceFilterNo, setSourceFilterNo] = useState('');
  const [sourceFilterType, setSourceFilterType] = useState<SourceOrderType | ''>('');
  const [sourceFilterProject, setSourceFilterProject] = useState('');

  const getOutboundExhibitionName = (order: OutboundOrder): string | null => {
    for (const d of order.details) {
      const workOrderId = (d as any).workOrderId;
      if (workOrderId) {
        const config = workOrderConfigs.find(c => c.workOrderId === workOrderId);
        if (config) return config.exhibitionName;
      }
    }
    return null;
  };

  const isReturnOrderFrozen = (order: ReturnOrder): boolean => {
    const exhibitionName = (order as any).exhibitionName;
    if (!exhibitionName) return false;
    return isExhibitionFrozen(exhibitionName);
  };

  const allSourceOrders = useMemo((): UnifiedSourceOrder[] => {
    const result: UnifiedSourceOrder[] = [];

    outboundOrders
      .filter(o => (o.type === 'requisition' || o.type === 'lowvalue') && o.status === 'confirmed')
      .filter(o => {
        const wh = warehouses.find(w => w.id === o.warehouseId);
        return wh && wh.category !== 'exhibition';
      })
      .forEach(o => {
        result.push({
          id: o.id,
          orderNo: o.orderNo,
          type: 'requisition',
          typeLabel: '领用出库',
          warehouseId: o.warehouseId,
          warehouseName: o.warehouseName || '',
          projectId: o.projectId || '',
          projectName: o.projectName || '',
          exhibitionName: '',
          implementUnit: '',
          itemCount: o.details.length,
          totalQuantity: o.details.reduce((a, b) => a + (b.quantity || 0), 0),
          operator: o.operator,
          createTime: o.createTime,
          status: o.status,
          original: o,
        });
      });

    scrappedRecords
      .filter(r => r.status === 'submitted')
      .filter(r => {
        const wh = warehouses.find(w => w.id === r.warehouseId);
        return wh && wh.category !== 'exhibition';
      })
      .forEach(r => {
        result.push({
          id: r.id,
          orderNo: r.recordNo,
          type: 'scrap',
          typeLabel: '报废出库',
          warehouseId: r.warehouseId,
          warehouseName: r.warehouseName,
          projectId: r.projectId,
          projectName: r.projectName,
          itemCount: 1,
          totalQuantity: r.scrapQuantity,
          operator: r.operator,
          createTime: r.createTime,
          status: r.status,
          original: r,
        });
      });

    damagedRecords
      .filter(r => r.status === 'submitted')
      .filter(r => {
        const wh = warehouses.find(w => w.id === r.warehouseId);
        return wh && wh.category !== 'exhibition';
      })
      .forEach(r => {
        result.push({
          id: r.id,
          orderNo: r.recordNo,
          type: 'damaged',
          typeLabel: '报损出库',
          warehouseId: r.warehouseId,
          warehouseName: r.warehouseName,
          projectId: r.projectId,
          projectName: r.projectName,
          itemCount: 1,
          totalQuantity: r.quantity,
          operator: r.operator,
          createTime: r.createTime,
          status: r.status,
          original: r,
        });
      });

    return result;
  }, [outboundOrders, scrappedRecords, damagedRecords, workOrderConfigs, isExhibitionFrozen]);

  const filteredSourceOrders = useMemo(() => {
    return allSourceOrders.filter(o => {
      if (sourceFilterNo && !o.orderNo.includes(sourceFilterNo)) return false;
      if (sourceFilterType && o.type !== sourceFilterType) return false;
      if (sourceFilterProject && o.projectId !== sourceFilterProject) return false;
      return true;
    });
  }, [allSourceOrders, sourceFilterNo, sourceFilterType, sourceFilterProject]);

  const filteredData = useMemo(() => {
    return returnOrders.filter((o) => {
      if (applied.no && !o.orderNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.warehouse && o.warehouseId !== applied.warehouse) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      const wh = warehouses.find(w => w.id === o.warehouseId);
      if (wh && wh.category === 'exhibition') return false;
      return true;
    });
  }, [returnOrders, applied, warehouses]);

  const statusText = (s: string) => (s === 'confirmed' ? '已入库' : s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) => (s === 'confirmed' ? 'text-[#67c23a]' : s === 'submitted' ? 'text-[#409eff]' : 'text-[#e6a23c]');

  const columns: ColumnDef<ReturnOrder>[] = [
    { key: 'orderNo', title: '退库单号' },
    { key: 'projectName', title: '所属展会', render: (row) => (row as any).exhibitionName || (row as any).projectName || '-' },
    { key: 'implementUnit', title: '实施单位', render: (row) => (row as any).implementUnit || '-' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => row.details.reduce((a: number, b: any) => a + (b.quantity || 0), 0),
    },
    { key: 'operator', title: '操作员', render: (row) => row.operator || '-' },
    {
      key: 'sourceType',
      title: '来源类型',
      render: (row) => {
        const t = (row as any).sourceType;
        return t === 'requisition' ? '领用出库' : t === 'scrap' ? '报废出库' : t === 'damaged' ? '报损出库' : t === 'direct' ? '直接退库' : '-';
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'createTime', title: '创建时间' },
    { key: 'remark', title: '备注', render: (row) => (row as any).remark || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => {
        const frozen = isReturnOrderFrozen(row);
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
                    setEditItem(JSON.parse(JSON.stringify(row)));
                    setSelectedSourceOrder(null);
                  }}
                >
                  编辑
                </TextButton>
                <TextButton
                  type="danger"
                  onClick={() => {
                    if (confirm(`确认删除退库单 ${row.orderNo}？`)) deleteReturnOrder(row.id);
                  }}
                >
                  删除
                </TextButton>
              </>
            )}
            {row.status === 'submitted' && !frozen && (
              <TextButton onClick={() => handleConfirm(row.id)}>确认入库</TextButton>
            )}
          </div>
        );
      },
    },
  ];

  const [viewItem, setViewItem] = useState<ReturnOrder | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [printItem, setPrintItem] = useState<ReturnOrder | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [selectedSourceOrder, setSelectedSourceOrder] = useState<UnifiedSourceOrder | null>(null);
  const [returnMode, setReturnMode] = useState<'source' | 'direct'>('source');
  const [pickerOpen, setPickerOpen] = useState(false);

  const generateReturnOrderNo = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TK${dateStr}${random}`;
  };

  const openAdd = () => {
    const newOrder: any = {
      id: 'TK' + Date.now(),
      orderNo: generateReturnOrderNo(),
      type: 'return',
      warehouseId: filteredWarehouses[0]?.id || '',
      warehouseName: filteredWarehouses[0]?.name || '',
      operator: '',
      status: 'pending',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
      sourceOrderId: '',
      sourceOrderNo: '',
      sourceType: '',
      projectId: '',
      projectName: '',
    };
    setIsNew(true);
    setSelectedSourceOrder(null);
    setReturnMode('source');
    setSourceFilterNo('');
    setSourceFilterType('');
    setSourceFilterProject('');
    setEditItem(newOrder);
  };

  const handlePickerConfirm = (selectedProducts: ProductPickerItem[]) => {
    if (!editItem) return;
    const newDetails: any[] = selectedProducts.map((p) => {
      return {
        id: 'D' + Date.now() + Math.random().toString(36).slice(2, 7),
        returnOrderId: editItem.id,
        productId: p.id,
        productCode: p.code || '',
        productName: p.name || '',
        positionId: '',
        positionName: '',
        warehouseId: editItem.warehouseId,
        warehouseName: editItem.warehouseName,
        quantity: 0,
        maxQuantity: 999999,
        sourceType: 'direct',
        sourceOrderId: '',
        sourceOrderNo: '',
        specification: p.specification || '',
        unit: p.unit || '',
      };
    });
    const existingIds = new Set(editItem.details.map((d: any) => d.productId));
    const toAdd = newDetails.filter((d) => !existingIds.has(d.productId));
    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setPickerOpen(false);
  };

  const handleSelectSourceOrder = (order: UnifiedSourceOrder) => {
    setSelectedSourceOrder(order);

    let details: any[] = [];

    if (order.type === 'requisition') {
      const o = order.original as OutboundOrder;
      details = o.details.map((d: OutboundDetail) => ({
        id: 'D' + Date.now() + Math.random(),
        returnOrderId: editItem.id,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        positionId: d.positionId,
        positionName: d.positionName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        quantity: 0,
        maxQuantity: d.quantity,
        sourceType: 'requisition',
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
      }));
    } else if (order.type === 'scrap') {
      const r = order.original as ScrappedRecord;
      const prod = products.find(p => p.id === r.assetEquipmentId);
      details = [{
        id: 'D' + Date.now() + Math.random(),
        returnOrderId: editItem.id,
        productId: r.assetEquipmentId,
        productCode: r.assetCode,
        productName: r.assetName,
        positionId: r.positionId,
        positionName: r.positionName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        quantity: 0,
        maxQuantity: r.scrapQuantity,
        sourceType: 'scrap',
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        specification: prod?.specification || '',
        unit: prod?.unit || '台',
      }];
    } else if (order.type === 'damaged') {
      const r = order.original as DamagedRecord;
      details = [{
        id: 'D' + Date.now() + Math.random(),
        returnOrderId: editItem.id,
        productId: r.productId,
        productCode: r.productCode,
        productName: r.productName,
        positionId: r.positionId,
        positionName: r.positionName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        quantity: 0,
        maxQuantity: r.quantity,
        sourceType: 'damaged',
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
      }];
    }

    setEditItem({
      ...editItem,
      warehouseId: order.warehouseId,
      warehouseName: order.warehouseName,
      sourceOrderId: order.id,
      sourceOrderNo: order.orderNo,
      sourceType: order.type,
      projectId: order.projectId || '',
      projectName: order.projectName || '',
      exhibitionName: order.exhibitionName || '',
      implementUnit: order.implementUnit || '',
      details,
    });
  };

  const updateDetail = (idx: number, field: string, value: string | number) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];

    if (field === 'quantity') {
      const sourceType = newDetails[idx].sourceType;
      if (sourceType !== 'direct') {
        const maxQty = newDetails[idx].maxQuantity || 0;
        if (value > maxQty) {
          alert(`归还数量不可超过出库数量 ${maxQty}`);
          return;
        }
      }
    }

    newDetails[idx][field] = value;
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_: any, i: number) => i !== idx) });
  };

  const handleConfirm = (id: string) => {
    const order = returnOrders.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'submitted') return;
    if (isReturnOrderFrozen(order)) {
      alert('该退库单关联的项目已被冻结，无法确认入库');
      return;
    }
    if (!confirm(`确认入库 ${order.orderNo}？确认后将增加库存，不可撤销。`)) return;

    const completeTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const defaultPos = positions.find((p: any) => p.warehouseId === order.warehouseId);

    (order.details as any[]).forEach((d) => {
      const batchNo = generateBatchNo();
      const posId = d.positionId || defaultPos?.id || '';
      const posName = d.positionName || defaultPos?.name || '';
      const product = products.find((p) => p.id === d.productId);
      addBatchInventory({
        id: 'B' + Date.now() + Math.random().toString(36).slice(2, 7),
        batchNo,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        specification: (d as any).specification || product?.specification || '',
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName || '',
        positionId: posId,
        positionName: posName,
        quantity: d.quantity,
        originalQuantity: d.quantity,
        inboundTime: completeTime,
        inboundOrderNo: order.orderNo,
      });

      const existingInv = inventories.find(
        inv => inv.productId === d.productId && inv.warehouseId === order.warehouseId && inv.positionId === posId
      );
      if (existingInv) {
        updateInventory(existingInv.id, { quantity: existingInv.quantity + d.quantity });
      } else {
        addInventory({
          id: 'INV' + Date.now() + Math.random().toString(36).slice(2, 7),
          productId: d.productId,
          productCode: d.productCode,
          productName: d.productName,
          warehouseId: order.warehouseId,
          warehouseName: order.warehouseName || '',
          positionId: posId,
          positionName: posName,
          quantity: d.quantity,
          frozenQuantity: 0,
          inboundTime: completeTime.slice(0, 10),
        });
      }

      addStockTransaction({
        id: 'ST' + Date.now() + Math.random().toString(36).slice(2, 7),
        transactionNo: generateStockTransactionNo(),
        transactionTime: completeTime,
        transactionType: 'inbound' as any,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName || '',
        positionId: posId,
        positionName: posName,
        quantity: d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        sourceType: '退库',
        batchNo,
        operator: order.operator || '',
        remark: (order as any).remark || '退库',
      });
    });

    updateReturnOrder(id, { ...order, status: 'confirmed' as any });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">退库</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <PrimaryButton onClick={openAdd}>+ 新增退库单</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, status: filterStatus, warehouse: filterWarehouse, from: filterFrom, to: filterTo })}
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterWarehouse('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ no: '', status: '', warehouse: '', from: '', to: '' });
        }}
      >
        <SearchField label="退库单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
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
            <option value="confirmed">已入库</option>
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

      <Modal open={!!viewItem} title="退库单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">退库单号：</span><span className="text-[#303133]">{viewItem.orderNo}</span></div>
              <div><span className="text-[#606266]">所属展会：</span><span className="text-[#303133]">{(viewItem as any).exhibitionName || (viewItem as any).projectName || '-'}</span></div>
              {(viewItem as any).implementUnit && (
                <div><span className="text-[#606266]">实施单位：</span><span className="text-[#303133]">{(viewItem as any).implementUnit}</span></div>
              )}
              <div><span className="text-[#606266]">仓库：</span><span className="text-[#303133]">{viewItem.warehouseName}</span></div>
              <div><span className="text-[#606266]">来源类型：</span><span className="text-[#303133]">
                {((viewItem as any).sourceType === 'requisition') && '领用出库'}
                {((viewItem as any).sourceType === 'scrap') && '报废出库'}
                {((viewItem as any).sourceType === 'damaged') && '报损出库'}
                {((viewItem as any).sourceType === 'direct') && '直接退库'}
                {!(viewItem as any).sourceType && '-'}
              </span></div>
              <div><span className="text-[#606266]">来源单号：</span><span className="text-[#303133]">{(viewItem as any).sourceOrderNo || '-'}</span></div>
              <div><span className="text-[#606266]">状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">操作员：</span><span className="text-[#303133]">{viewItem.operator || '-'}</span></div>
            </div>
            <div className="text-sm font-medium text-[#303133] mb-3">产品明细</div>
            <table className="w-full text-sm border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-4 py-3 text-left">物资编码</th>
                  <th className="px-4 py-3 text-left">物资名称</th>
                  <th className="px-4 py-3 text-right">数量</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.details.length ? (
                  viewItem.details.map((d: any, i: number) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-4 py-3 text-[#303133]">{d.productCode}</td>
                      <td className="px-4 py-3 text-[#303133]">{d.productName}</td>
                      <td className="px-4 py-3 text-right text-[#303133]">{d.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="py-6 text-center text-[#909399]">无明细</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="退库单"
          orderNo={printItem.orderNo}
          orderDate={printItem.createTime}
          operator={printItem.operator || ''}
          warehouseName={printItem.warehouseName || ''}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '物资编码' },
            { key: 'productName', label: '物资名称' },
            { key: 'quantity', label: '数量', align: 'right' },
          ]}
          details={printItem.details.map((d: any) => ({
            productCode: d.productCode,
            productName: d.productName,
            quantity: d.quantity,
          }))}
        />
      )}

      <Modal
        open={!!editItem}
        title={isNew ? '新增退库单' : '编辑退库单'}
        onClose={() => setEditItem(null)}
        width="max-w-[1100px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            {isNew && (
              <div className="border border-[#ebeef5] rounded p-3 bg-[#f5f7fa]">
                <div className="mb-3 font-medium text-[#303133]">请选择退库方式</div>
                <div className="flex gap-2 mb-3">
                  <button
                    className={`px-4 py-2 text-xs rounded border ${returnMode === 'source' ? 'bg-[#2f54eb] text-white border-[#2f54eb]' : 'bg-white text-[#303133] border-[#dcdfe6] hover:border-[#2f54eb]'}`}
                    onClick={() => {
                      setReturnMode('source');
                      setSelectedSourceOrder(null);
                      setEditItem({ ...editItem, details: [], sourceType: '', sourceOrderId: '', sourceOrderNo: '' });
                    }}
                  >
                    选择来源单出库退货
                  </button>
                  <button
                    className={`px-4 py-2 text-xs rounded border ${returnMode === 'direct' ? 'bg-[#2f54eb] text-white border-[#2f54eb]' : 'bg-white text-[#303133] border-[#dcdfe6] hover:border-[#2f54eb]'}`}
                    onClick={() => {
                      setReturnMode('direct');
                      setSelectedSourceOrder(null);
                      setEditItem({ ...editItem, details: [], sourceType: 'direct', sourceOrderId: '', sourceOrderNo: '' });
                    }}
                  >
                    直接选择物资退库
                  </button>
                </div>

                {returnMode === 'source' && !selectedSourceOrder && (
                  <>
                    <div className="mb-3 font-medium text-[#303133]">请选择出库单（领用/报废/报损）</div>

                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#606266] whitespace-nowrap">单号：</span>
                    <input
                      type="text"
                      value={sourceFilterNo}
                      onChange={(e) => setSourceFilterNo(e.target.value)}
                      placeholder="请输入单号"
                      className="w-[180px] h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#606266] whitespace-nowrap">类型：</span>
                    <select
                      value={sourceFilterType}
                      onChange={(e) => setSourceFilterType(e.target.value as SourceOrderType | '')}
                      className="w-[140px] h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                    >
                      <option value="">全部类型</option>
                      <option value="requisition">领用出库</option>
                      <option value="scrap">报废出库</option>
                      <option value="damaged">报损出库</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#606266] whitespace-nowrap">项目：</span>
                    <select
                      value={sourceFilterProject}
                      onChange={(e) => setSourceFilterProject(e.target.value)}
                      className="w-[200px] h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                    >
                      <option value="">全部项目</option>
                      {exhibitionProjects.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.projectName}</option>
                      ))}
                    </select>
                  </div>
                  <DefaultButton size="small" onClick={() => {
                    setSourceFilterNo('');
                    setSourceFilterType('');
                    setSourceFilterProject('');
                  }}>重置</DefaultButton>
                </div>

                <div className="max-h-[350px] overflow-y-auto border border-[#ebeef5] rounded">
                  {filteredSourceOrders.length === 0 ? (
                    <div className="text-center py-8 text-[#909399]">暂无符合条件的出库单</div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-[#ebeef5] sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">出库单号</th>
                          <th className="px-3 py-2 text-left">类型</th>
                          <th className="px-3 py-2 text-left">仓库</th>
                          <th className="px-3 py-2 text-left">所属展会</th>
                          <th className="px-3 py-2 text-left">实施单位</th>
                          <th className="px-3 py-2 text-center">物资数</th>
                          <th className="px-3 py-2 text-right">数量</th>
                          <th className="px-3 py-2 text-left">操作员</th>
                          <th className="px-3 py-2 text-left">创建时间</th>
                          <th className="px-3 py-2 text-center w-20">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSourceOrders.map((order) => (
                          <tr key={`${order.type}-${order.id}`} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                            <td className="px-3 py-2 text-[#303133]">{order.orderNo}</td>
                            <td className="px-3 py-2 text-[#303133]">{order.typeLabel}</td>
                            <td className="px-3 py-2 text-[#303133]">{order.warehouseName}</td>
                            <td className="px-3 py-2 text-[#303133]">{order.exhibitionName || order.projectName || '-'}</td>
                            <td className="px-3 py-2 text-[#303133]">{order.implementUnit || '-'}</td>
                            <td className="px-3 py-2 text-center text-[#303133]">{order.itemCount} 种</td>
                            <td className="px-3 py-2 text-right text-[#303133]">{order.totalQuantity}</td>
                            <td className="px-3 py-2 text-[#303133]">{order.operator}</td>
                            <td className="px-3 py-2 text-[#303133]">{order.createTime}</td>
                            <td className="px-3 py-2 text-center">
                              <PrimaryButton
                                size="sm"
                                onClick={() => handleSelectSourceOrder(order)}
                              >
                                选择
                              </PrimaryButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                  </>
                )}

                {returnMode === 'direct' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="mb-1 text-[#606266]">仓库</div>
                        <select
                          className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                          value={editItem.warehouseId}
                          onChange={(e) => {
                            const wh = filteredWarehouses.find((w) => w.id === e.target.value);
                            setEditItem({
                              ...editItem,
                              warehouseId: e.target.value,
                              warehouseName: wh?.name || '',
                              details: editItem.details.map((d: any) => ({
                                ...d,
                                warehouseId: e.target.value,
                                warehouseName: wh?.name || '',
                              })),
                            });
                          }}
                        >
                          {filteredWarehouses.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <DefaultButton onClick={() => setPickerOpen(true)}>+ 选择物资</DefaultButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(selectedSourceOrder || returnMode === 'direct' || !isNew) && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-[#606266]">退库单号</div>
                    <input
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                      value={editItem.orderNo}
                      onChange={(e) => setEditItem({ ...editItem, orderNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[#606266]">来源类型</div>
                    <input
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                      value={editItem.sourceType === 'requisition' ? '领用出库' : editItem.sourceType === 'scrap' ? '报废出库' : editItem.sourceType === 'damaged' ? '报损出库' : editItem.sourceType === 'direct' ? '直接退库' : ''}
                      disabled
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[#606266]">来源单号</div>
                    <input
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                      value={editItem.sourceOrderNo || ''}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-[#606266]">所属展会</div>
                    <input
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                      value={(editItem as any).exhibitionName || editItem.projectName || ''}
                      disabled
                    />
                  </div>
                  {(editItem as any).implementUnit && (
                    <div>
                      <div className="mb-1 text-[#606266]">实施单位</div>
                      <input
                        className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                        value={(editItem as any).implementUnit || ''}
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <div className="mb-1 text-[#606266]">操作员</div>
                    <input
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                      placeholder="请输入操作员"
                      value={editItem.operator || ''}
                      onChange={(e) => setEditItem({ ...editItem, operator: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">备注</div>
                  <input
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.remark || ''}
                    onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-[#303133]">
                    产品明细{editItem.sourceType === 'direct' ? '（直接选择物资）' : '（来源于出库单）'}
                  </div>
                  {editItem.sourceType === 'direct' && isNew && (
                    <DefaultButton size="small" onClick={() => setPickerOpen(true)}>+ 添加物资</DefaultButton>
                  )}
                </div>
                <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      <th className="px-2 py-2 text-left">物资编码</th>
                      <th className="px-2 py-2 text-left">物资名称</th>
                      {editItem.sourceType !== 'direct' && (
                        <th className="px-2 py-2 text-right">出库数量</th>
                      )}
                      <th className="px-2 py-2 text-right">归还数量</th>
                      <th className="px-2 py-2 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.details.length ? (
                      editItem.details.map((d: any, i: number) => (
                        <tr key={i} className="border-t border-[#ebeef5]">
                          <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                          {d.sourceType !== 'direct' && (
                            <td className="px-2 py-2 text-right text-[#606266]">{d.maxQuantity}</td>
                          )}
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              max={d.sourceType === 'direct' ? undefined : d.maxQuantity}
                              className="w-24 h-8 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                              value={d.quantity}
                              onChange={(e) => updateDetail(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <TextButton type="danger" onClick={() => removeDetail(i)}>删除</TextButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={editItem.sourceType === 'direct' ? 4 : 5} className="py-6 text-center text-[#909399]">暂无明细</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          {(selectedSourceOrder || returnMode === 'direct' || !isNew) && (
            <PrimaryButton
              onClick={() => {
                if (!editItem) return;
                if (!editItem.operator) {
                  alert('请填写操作员');
                  return;
                }
                if (editItem.details.length === 0) {
                  alert('请添加至少一条产品明细');
                  return;
                }
                if (editItem.details.some((d: any) => !d.quantity || d.quantity <= 0)) {
                  alert('归还数量必须大于 0');
                  return;
                }

                if (isReturnOrderFrozen(editItem)) {
                  alert('该退库单关联的项目已被冻结，无法提交');
                  return;
                }

                if (isNew) addReturnOrder({ ...editItem, status: 'submitted' });
                else updateReturnOrder(editItem.id, { ...editItem, status: 'submitted' });
                setEditItem(null);
              }}
            >保存并提交</PrimaryButton>
          )}
        </div>
      </Modal>

      <ProductPickerModal
        open={pickerOpen}
        title="选择物资"
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        showStockQty={true}
        onlyStocked={false}
      />
    </div>
  );
}
