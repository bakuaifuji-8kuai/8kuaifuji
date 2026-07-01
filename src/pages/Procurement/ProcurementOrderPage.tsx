import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ProcurementOrder, ProcurementOrderDetail, ProcurementOrderChange } from '@/types';

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'text-[#909399]', bg: 'bg-[#f4f4f5]' },
  pending: { label: '待审批', color: 'text-[#e6a23c]', bg: 'bg-[#fdf6ec]' },
  approved: { label: '已审批', color: 'text-[#409eff]', bg: 'bg-[#ecf5ff]' },
  sent: { label: '已发送', color: 'text-[#67c23a]', bg: 'bg-[#f0f9eb]' },
  completed: { label: '已完成', color: 'text-[#67c23a]', bg: 'bg-[#f0f9eb]' },
  cancelled: { label: '已取消', color: 'text-[#f56c6c]', bg: 'bg-[#fef0f0]' },
};

const sourceTypeMap: Record<string, string> = {
  framework: '框架合同',
  one_time: '单次采购',
  public_recruit: '公开招聘',
};

const changeStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'text-[#e6a23c]' },
  approved: { label: '已审批', color: 'text-[#67c23a]' },
  rejected: { label: '已驳回', color: 'text-[#f56c6c]' },
};

export default function ProcurementOrderPage() {
  const procurementOrders = useStore((s) => s.procurementOrders);
  const addProcurementOrder = useStore((s) => s.addProcurementOrder);
  const updateProcurementOrder = useStore((s) => s.updateProcurementOrder);
  const deleteProcurementOrder = useStore((s) => s.deleteProcurementOrder);
  const procurementOrderChanges = useStore((s) => s.procurementOrderChanges || []);
  const addProcurementOrderChange = useStore((s) => s.addProcurementOrderChange) as ((c: ProcurementOrderChange) => void) | undefined;
  const updateProcurementOrderChange = useStore((s) => s.updateProcurementOrderChange) as ((id: string, data: Partial<ProcurementOrderChange>) => void) | undefined;
  const procurementDemands = useStore((s) => s.procurementDemands);
  const contractLedgers = useStore((s) => s.contractLedgers);
  const suppliers = useStore((s) => s.suppliers);
  const currentUser = useStore((s) => s.currentUser);

  // =============== 筛选条件 ===============
  const [filterNo, setFilterNo] = useState('');
  const [filterDemand, setFilterDemand] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterHandler, setFilterHandler] = useState('');
  const [applied, setApplied] = useState({
    no: '', demand: '', supplier: '', status: '',
    source: '', dateFrom: '', dateTo: '', handler: '',
  });

  const filteredData = useMemo(() => {
    return procurementOrders.filter((o) => {
      if (applied.no && !o.orderNo.includes(applied.no)) return false;
      if (applied.demand && !o.demandNo && !o.demandNo.includes(applied.demand)) return false;
      if (applied.supplier && !(o.supplierName || '').includes(applied.supplier)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.source && o.sourceType !== applied.source) return false;
      if (applied.handler && !(o.handler || '').includes(applied.handler) && !(o.creator || '').includes(applied.handler)) return false;
      if (applied.dateFrom && o.createTime < applied.dateFrom) return false;
      if (applied.dateTo && o.createTime > applied.dateTo + ' 23:59:59') return false;
      return true;
    });
  }, [procurementOrders, applied]);

  // 统计
  const stats = useMemo(() => {
    return {
      total: filteredData.length,
      totalAmount: filteredData.reduce((s, o) => s + o.details.reduce((ds, d) => ds + (d.amount || 0), 0), 0),
      pending: filteredData.filter((o) => o.status === 'pending').length,
      active: filteredData.filter((o) => ['pending', 'approved', 'sent'].includes(o.status)).length,
      completed: filteredData.filter((o) => o.status === 'completed').length,
    };
  }, [filteredData]);

  // =============== 弹窗状态 ===============
  const [editItem, setEditItem] = useState<ProcurementOrder | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [details, setDetails] = useState<ProcurementOrderDetail[]>([]);
  const [viewItem, setViewItem] = useState<ProcurementOrder | null>(null);
  const [changeItem, setChangeItem] = useState<ProcurementOrderChange | null>(null);
  const [showDemandPicker, setShowDemandPicker] = useState(false);
  const [showContractPicker, setShowContractPicker] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveItem, setApproveItem] = useState<ProcurementOrder | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendItem, setSendItem] = useState<ProcurementOrder | null>(null);
  const [showChangeHistory, setShowChangeHistory] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);

  // 选择的需求（用于订单明细回写）
  const [pickedDemandId, setPickedDemandId] = useState<string | null>(null);

  // =============== 主列表列定义 ===============
  const columns: ColumnDef<ProcurementOrder>[] = [
    {
      key: 'orderNo',
      title: '订单编号',
      render: (row) => <span className="font-medium text-[#303133]">{row.orderNo}</span>,
    },
    {
      key: 'sourceType',
      title: '来源类型',
      render: (row) => row.sourceType ? (
        <span className="px-2 py-0.5 rounded text-xs bg-[#ecf5ff] text-[#409eff]">
          {sourceTypeMap[row.sourceType]}
        </span>
      ) : <span className="text-[#c0c4cc]">-</span>,
    },
    { key: 'demandNo', title: '关联需求', render: (row) => row.demandNo || '-' },
    { key: 'supplierName', title: '供应商', render: (row) => row.supplierName || '-' },
    {
      key: 'totalAmount',
      title: '订单金额(元)',
      align: 'right',
      render: (row) => {
        const total = row.details.reduce((s, d) => s + (d.amount || 0), 0);
        return total > 0 ? '¥' + total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
      },
    },
    {
      key: 'detailCount',
      title: '明细项数',
      align: 'center',
      render: (row) => row.details.length,
    },
    {
      key: 'deliveryDate',
      title: '要求交货',
      render: (row) => row.deliveryDate || '-',
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => {
        const s = statusMap[row.status] || statusMap.draft;
        return <span className={'px-2 py-0.5 rounded text-xs ' + s.color + ' ' + s.bg}>{s.label}</span>;
      },
    },
    { key: 'handler', title: '经办人', render: (row) => row.handler || row.creator },
    { key: 'createTime', title: '创建时间', render: (row) => row.createTime?.slice(0, 16) },
    { key: 'sentTime', title: '发送时间', render: (row) => row.sentTime?.slice(0, 16) || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          {row.status === 'draft' && (
            <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
          )}
          {row.status === 'draft' && row.details.length > 0 && (
            <TextButton onClick={() => handleSubmitApproval(row)}>提交审批</TextButton>
          )}
          {row.status === 'pending' && (
            <TextButton onClick={() => { setApproveItem(row); setShowApproveModal(true); }}>审批</TextButton>
          )}
          {row.status === 'approved' && (
            <TextButton onClick={() => { setSendItem(row); setShowSendModal(true); }}>发送给供应商</TextButton>
          )}
          {['approved', 'sent'].includes(row.status) && (
            <TextButton onClick={() => openChange(row)}>发起变更</TextButton>
          )}
          {row.status === 'sent' && (
            <TextButton onClick={() => handleComplete(row)}>标记完成</TextButton>
          )}
          {['draft', 'pending'].includes(row.status) && (
            <TextButton onClick={() => handleCancel(row)}>取消</TextButton>
          )}
          {procurementOrderChanges.filter((c) => c.orderId === row.id).length > 0 && (
            <TextButton onClick={() => { setHistoryOrderId(row.id); setShowChangeHistory(true); }}>变更历史</TextButton>
          )}
          {['draft', 'pending', 'cancelled'].includes(row.status) && (
            <TextButton
              type="danger"
              onClick={() => {
                if (confirm('确认删除订单 ' + row.orderNo + '?')) deleteProcurementOrder(row.id);
              }}
            >删除</TextButton>
          )}
        </div>
      ),
    },
  ];

  // =============== 操作函数 ===============
  const openAdd = () => {
    const now = new Date();
    const newOrder: ProcurementOrder = {
      id: 'PO' + Date.now(),
      orderNo: 'CGDD' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + String(procurementOrders.length + 1).padStart(3, '0'),
      status: 'draft',
      createTime: now.toISOString().replace('T', ' ').slice(0, 19),
      creator: currentUser.name,
      creatorDept: currentUser.department || '',
      handler: currentUser.name,
      details: [],
    };
    setDetails([]);
    setPickedDemandId(null);
    setIsNew(true);
    setEditItem(newOrder);
  };

  const openEdit = (order: ProcurementOrder) => {
    setIsNew(false);
    setEditItem(order);
    setDetails([...order.details]);
    setPickedDemandId(order.demandId || null);
  };

  const handleSubmitApproval = (order: ProcurementOrder) => {
    if (!order.details || order.details.length === 0) {
      alert('请先添加订单明细');
      return;
    }
    if (!order.supplierId) {
      alert('请选择供应商');
      return;
    }
    if (!confirm('确认提交订单 ' + order.orderNo + ' 审批?')) return;
    updateProcurementOrder(order.id, { status: 'pending' });
    alert('已提交审批');
  };

  const handleCancel = (order: ProcurementOrder) => {
    if (!confirm('确认取消订单 ' + order.orderNo + '?')) return;
    updateProcurementOrder(order.id, { status: 'cancelled' });
  };

  const handleComplete = (order: ProcurementOrder) => {
    if (!confirm('确认将订单 ' + order.orderNo + ' 标记为已完成?')) return;
    updateProcurementOrder(order.id, {
      status: 'completed',
      completionTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
  };

  // 处理保存
  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.supplierId && details.length > 0) {
      alert('请选择供应商');
      return;
    }
    const saveOrder = { ...editItem, details };
    if (isNew) {
      addProcurementOrder(saveOrder);
    } else {
      updateProcurementOrder(saveOrder.id, saveOrder);
    }
    setEditItem(null);
    setDetails([]);
    setPickedDemandId(null);
  };

  // 明细管理
  const addDetail = () => {
    const newDetail: ProcurementOrderDetail = {
      id: 'POD' + Date.now() + Math.random().toString(36).slice(2, 7),
      orderId: editItem?.id || '',
      productId: '',
      productCode: '',
      productName: '',
      unit: '',
      quantity: 1,
    };
    setDetails([...details, newDetail]);
  };

  const updateDetail = (index: number, field: keyof ProcurementOrderDetail, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    const detail = newDetails[index];
    if (field === 'unitPrice' || field === 'quantity') {
      newDetails[index] = { ...detail, amount: (detail.unitPrice || 0) * (detail.quantity || 0) };
    }
    setDetails(newDetails);
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // ========== 从采购需求选择 ==========
  const confirmPickedDemand = () => {
    if (!pickedDemandId) {
      alert('请选择一条需求');
      return;
    }
    const demand = procurementDemands.find((d) => d.id === pickedDemandId);
    if (!demand) return;
    const newDetails: ProcurementOrderDetail[] = [];
    demand.details.forEach((d: any) => {
      newDetails.push({
        id: 'POD' + Date.now() + Math.random().toString(36).slice(2, 7),
        orderId: editItem?.id || '',
        productId: d.productId || '',
        productCode: d.productCode,
        productName: d.productName,
        specification: d.specification,
        unit: d.unit,
        quantity: d.quantity,
        unitPrice: d.unitPriceIncludingTax,
        amount: d.amountIncludingTax,
        remark: '来自需求：' + (d.remark || ''),
      });
    });
    setDetails(newDetails);
    if (editItem) {
      setEditItem({
        ...editItem,
        demandId: demand.id,
        demandNo: demand.demandNo,
        sourceType: editItem.sourceType || 'framework',
        deliveryDate: editItem.deliveryDate || demand.requiredDeliveryDate,
        deliveryAddress: editItem.deliveryAddress || '',
        contactPerson: editItem.contactPerson || currentUser.name,
        contactPhone: editItem.contactPhone || '',
      });
    }
    setShowDemandPicker(false);
    setPickedDemandId(null);
  };

  // ========== 发起订单变更 ==========
  const openChange = (order: ProcurementOrder) => {
    if (order.details.length === 0) {
      alert('该订单无明细，无法发起变更');
      return;
    }
    const change: ProcurementOrderChange = {
      id: 'POC' + Date.now(),
      orderId: order.id,
      changeNo: 'BG' + order.orderNo + '-' + String(procurementOrderChanges.filter((c) => c.orderId === order.id).length + 1).padStart(2, '0'),
      changeReason: '',
      changeTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      changer: currentUser.name,
      beforeDetails: JSON.parse(JSON.stringify(order.details)),
      afterDetails: JSON.parse(JSON.stringify(order.details)),
      status: 'pending',
    };
    setChangeItem(change);
  };

  const updateChangeDetail = (index: number, field: keyof ProcurementOrderDetail, value: any) => {
    if (!changeItem) return;
    const newDetails = [...changeItem.afterDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    const detail = newDetails[index];
    if (field === 'unitPrice' || field === 'quantity') {
      newDetails[index] = { ...detail, amount: (Number(detail.unitPrice) || 0) * (Number(detail.quantity) || 0) };
    }
    setChangeItem({ ...changeItem, afterDetails: newDetails });
  };

  const removeChangeDetail = (index: number) => {
    if (!changeItem) return;
    setChangeItem({ ...changeItem, afterDetails: changeItem.afterDetails.filter((_, i) => i !== index) });
  };

  const handleSaveChange = () => {
    if (!changeItem) return;
    if (!changeItem.changeReason.trim()) {
      alert('请填写变更原因');
      return;
    }
    addProcurementOrderChange?.(changeItem);
    setChangeItem(null);
    alert('变更申请已提交，请等待审批');
  };

  // ========== 审批变更单 ==========
  const approveChange = (change: ProcurementOrderChange, approved: boolean) => {
    if (!approved) {
      if (!confirm('确认驳回该变更申请？')) return;
      updateProcurementOrderChange?.(change.id, { status: 'rejected', approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19), approver: currentUser.name });
      return;
    }
    if (!confirm('确认审批通过该变更申请？确认后将自动更新原订单。')) return;
    // 回写到原订单
    const order = procurementOrders.find((o) => o.id === change.orderId);
    if (order) {
      updateProcurementOrder(order.id, { details: change.afterDetails });
    }
    updateProcurementOrderChange?.(change.id, { status: 'approved', approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19), approver: currentUser.name });
    alert('变更审批通过，订单数据已更新');
  };

  // ========== 审批订单 ==========
  const handleApprove = (approved: boolean, reason: string) => {
    if (!approveItem) return;
    if (approved) {
      updateProcurementOrder(approveItem.id, {
        status: 'approved',
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        approver: currentUser.name,
      });
      alert('审批通过');
    } else {
      updateProcurementOrder(approveItem.id, { status: 'draft' });
      alert('已驳回，订单状态改为草稿');
    }
    setApproveItem(null);
    setShowApproveModal(false);
  };

  // ========== 发送订单 ==========
  const handleSend = () => {
    if (!sendItem) return;
    const total = sendItem.details.reduce((s, d) => s + (d.amount || 0), 0);
    const detailsHtml = sendItem.details.map((d, i) =>
      (i + 1) + '. ' + d.productName + ' (' + d.productCode + ') x ' + d.quantity + ' ' + d.unit + '  Y' + (d.amount || 0).toLocaleString()).join('\n');
    alert(
      'Email Mockup\n\nTo: ' + sendItem.supplierName + '\nFrom: ' + currentUser.name + ' (' + (currentUser.phone || currentUser.email || '') + ')\nOrder No: ' + sendItem.orderNo + '\nOrder Amount: Y' + total.toLocaleString() + '\n\nDetails:\n' + detailsHtml + '\n\n---\n\nSent successfully!'
    );
    updateProcurementOrder(sendItem.id, {
      status: 'sent',
      sentTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      sender: currentUser.name,
      senderContact: currentUser.phone || currentUser.email || '',
    });
    setSendItem(null);
    setShowSendModal(false);
  };

  // ========== 获取变更历史 ==========
  const orderChanges = useMemo(() => {
    if (!historyOrderId) return [];
    return procurementOrderChanges.filter((c) => c.orderId === historyOrderId);
  }, [historyOrderId, procurementOrderChanges]);

  return (
    <div className="p-4">
      {/* 页面标题区 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-[#303133]">采购订单管理</h2>
          <span className="text-xs text-[#909399]">共 {stats.total} 份，总金额 ¥{stats.totalAmount.toLocaleString()} 元</span>
          {stats.pending > 0 && <span className="text-xs text-[#e6a23c] px-2 py-0.5 bg-[#fdf6ec] rounded">⚠ {stats.pending} 份待审批</span>}
        </div>
        <PrimaryButton onClick={openAdd}>+ 新增订单</PrimaryButton>
      </div>

      {/* 搜索筛选区 */}
      <SearchBar
        onSearch={() => setApplied({
          no: filterNo, demand: filterDemand, supplier: filterSupplier,
          status: filterStatus, source: filterSource, dateFrom: filterDateFrom, dateTo: filterDateTo,
          handler: filterHandler,
        })}
        onReset={() => {
          setFilterNo(''); setFilterDemand(''); setFilterSupplier('');
          setFilterStatus(''); setFilterSource(''); setFilterDateFrom(''); setFilterDateTo('');
          setFilterHandler('');
          setApplied({ no: '', demand: '', supplier: '', status: '', source: '', dateFrom: '', dateTo: '', handler: '' });
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          <SearchField label="订单编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
          <SearchField label="需求编号" placeholder="请输入" value={filterDemand} onChange={setFilterDemand} />
          <SearchField label="供应商" placeholder="请输入" value={filterSupplier} onChange={setFilterSupplier} />
          <SearchField
            label="状态"
            type="select"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: '全部' },
              { value: 'draft', label: '草稿' },
              { value: 'pending', label: '待审批' },
              { value: 'approved', label: '已审批' },
              { value: 'sent', label: '已发送' },
              { value: 'completed', label: '已完成' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
          <SearchField
            label="来源类型"
            type="select"
            value={filterSource}
            onChange={setFilterSource}
            options={[
              { value: '', label: '全部' },
              { value: 'framework', label: '框架合同' },
              { value: 'one_time', label: '单次采购' },
            ]}
          />
          <SearchField label="经办人/申请人" placeholder="请输入" value={filterHandler} onChange={setFilterHandler} />
          <SearchField label="创建日期起" type="date" value={filterDateFrom} onChange={setFilterDateFrom} />
          <SearchField label="创建日期止" type="date" value={filterDateTo} onChange={setFilterDateTo} />
        </div>
      </SearchBar>

      {/* 主数据表格 */}
      <DataTable data={filteredData} columns={columns} rowKey={(row: any) => row.id} />

      {/* ============ 新增/编辑弹窗 ============ */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增采购订单' : '编辑订单 - ' + (editItem?.orderNo || '')}
        onClose={() => { setEditItem(null); setDetails([]); }}
        footer={
          <>
            <DefaultButton onClick={() => { setEditItem(null); setDetails([]); }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="1100px"
      >
        {editItem && (
          <div className="space-y-3">
            {/* 基本信息 */}
            <div className="p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
          <div className="text-xs font-medium text-[#303133] mb-2">📋 基本信息</div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="mb-1 text-[#606266]">订单编号</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
                value={editItem.orderNo}
                onChange={(e) => setEditItem({ ...editItem, orderNo: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">订单来源类型 <span className="text-[#f56c6c]">*</span></div>
              <select
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
                value={editItem.sourceType || ''}
                onChange={(e) => setEditItem({ ...editItem, sourceType: e.target.value as any })}
              >
                <option value="">请选择</option>
                <option value="framework">框架合同（从需求/合同生成）</option>
                <option value="one_time">单次采购（无框架合同）</option>
                <option value="public_recruit">公开招聘（由采购部门手工填写中标供应商单价和税率）</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">供应商 <span className="text-[#f56c6c]">*</span></div>
              <select
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
                value={editItem.supplierId || ''}
                onChange={(e) => {
                  const supplier = suppliers.find((s) => s.id === e.target.value);
                  setEditItem({ ...editItem, supplierId: e.target.value, supplierName: supplier?.name });
                }}
              >
                <option value="">请选择供应商</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">经办人</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
                value={editItem.handler || ''}
                onChange={(e) => setEditItem({ ...editItem, handler: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">经办部门</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
                value={editItem.handlingDepartment || ''}
                onChange={(e) => setEditItem({ ...editItem, handlingDepartment: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">要求交货日期</div>
              <input
                type="date"
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
                value={editItem.deliveryDate || ''}
                onChange={(e) => setEditItem({ ...editItem, deliveryDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 关联信息 */}
        <div className="p-3 border border-[#ebeef5] rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-[#303133]">🔗 关联信息</div>
            <DefaultButton size="small" onClick={() => setShowDemandPicker(true)}>选择采购需求</DefaultButton>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#909399]">关联需求：</span>
              <span className="text-[#303133] font-medium">{editItem.demandNo || '未关联'}</span>
            </div>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="mb-1 text-[#606266]">交付地址</div>
            <input
              className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
              value={editItem.deliveryAddress || ''}
              onChange={(e) => setEditItem({ ...editItem, deliveryAddress: e.target.value })}
              placeholder="请输入交付地址"
            />
          </div>
          <div>
            <div className="mb-1 text-[#606266]">联系人</div>
            <input
              className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
              value={editItem.contactPerson || ''}
              onChange={(e) => setEditItem({ ...editItem, contactPerson: e.target.value })}
              placeholder="请输入联系人"
            />
          </div>
          <div>
            <div className="mb-1 text-[#606266]">联系电话</div>
            <input
              className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-xs"
              value={editItem.contactPhone || ''}
              onChange={(e) => setEditItem({ ...editItem, contactPhone: e.target.value })}
              placeholder="请输入联系电话"
            />
          </div>
        </div>

        {/* 订单明细 */}
        <div className="border border-[#ebeef5] rounded overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[#f5f7fa]">
            <div className="text-xs font-medium text-[#303133]">
              📦 订单明细
              {editItem.sourceType === 'public_recruit' && (
                <span className="ml-2 text-[#e6a23c] text-[10px]">【公开招聘模式：需填写中标供应商、税率】</span>
              )}
            </div>
            <PrimaryButton size="small" onClick={addDetail}>+ 添加明细</PrimaryButton>
          </div>
          <div className="max-h-[400px overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#f5f7fa] sticky top-0">
                <tr>
                  {editItem.sourceType === 'public_recruit' ? (
                    <>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-24">商品编码</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium">产品名称</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-16">单位</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-16">数量</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-28">中标供应商</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-20">税率(%)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">含税单价(元)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">金额(元)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-16">操作</th>
                    </>
                  ) : (
                    <>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-32">商品编码</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium">产品名称</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-20">规格</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-16">单位</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-20">数量</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">单价(元)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">金额(元)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-28">交货日期</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-16">操作</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {details.map((detail, index) => (
                  <tr key={detail.id} className="border-t border-[#ebeef5] hover:bg-[#fafafa]">
                    {editItem.sourceType === 'public_recruit' ? (
                      <>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.productCode}
                            onChange={(e) => updateDetail(index, 'productCode', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.productName}
                            onChange={(e) => updateDetail(index, 'productName', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.unit}
                            onChange={(e) => updateDetail(index, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs text-right"
                            value={detail.quantity}
                            onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            className="w-full h-7 px-1 border border-[#dcdfe6] rounded text-xs bg-white"
                            value={detail.winningSupplierId || ''}
                            onChange={(e) => {
                              const sup = suppliers.find(s => s.id === e.target.value);
                              updateDetail(index, 'winningSupplierId', e.target.value);
                              updateDetail(index, 'winningSupplierName', sup?.name || '');
                            }}
                          >
                            <option value="">选择供应商</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs text-right"
                            value={detail.taxRate !== undefined ? (detail.taxRate * 100) : ''}
                            placeholder="如:13"
                            onChange={(e) => {
                              const rate = Number(e.target.value) / 100;
                              updateDetail(index, 'taxRate', rate);
                            }}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs text-right"
                            value={detail.unitPriceIncludingTax || ''}
                            onChange={(e) => {
                              const priceIncTax = Number(e.target.value);
                              const rate = detail.taxRate || 0;
                              const priceExTax = rate > 0 ? priceIncTax / (1 + rate) : priceIncTax;
                              const taxAmount = priceIncTax - priceExTax;
                              updateDetail(index, 'unitPriceIncludingTax', priceIncTax);
                              updateDetail(index, 'unitPrice', priceExTax);
                              updateDetail(index, 'taxAmount', taxAmount);
                              updateDetail(index, 'amount', priceIncTax * detail.quantity);
                            }}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right text-[#303133] font-medium">
                          ¥{(detail.unitPriceIncludingTax ? detail.unitPriceIncludingTax * detail.quantity : 0).toLocaleString()}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <TextButton type="danger" size="small" onClick={() => removeDetail(index)}>删除</TextButton>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.productCode}
                            onChange={(e) => updateDetail(index, 'productCode', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.productName}
                            onChange={(e) => updateDetail(index, 'productName', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.specification || ''}
                            onChange={(e) => updateDetail(index, 'specification', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.unit}
                            onChange={(e) => updateDetail(index, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs text-right"
                            value={detail.quantity}
                            onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs text-right"
                            value={detail.unitPrice || ''}
                            onChange={(e) => updateDetail(index, 'unitPrice', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right text-[#303133] font-medium">
                          ¥{(detail.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="date"
                            className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs"
                            value={detail.deliveryDate || ''}
                            onChange={(e) => updateDetail(index, 'deliveryDate', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <TextButton type="danger" size="small" onClick={() => removeDetail(index)}>删除</TextButton>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {details.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-[#909399] text-sm">暂无明细，请点击右上角添加订单明细，或从需求申请导入</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {details.length > 0 && (
            <div className="flex justify-end items-center gap-4 px-3 py-2 border-t border-[#ebeef5] bg-[#f5f7fa]">
              <span className="text-xs text-[#606266]">合计：</span>
              <span className="text-sm font-bold text-[#f56c6c]">
                ¥{details.reduce((s, d) => s + (d.unitPriceIncludingTax ? d.unitPriceIncludingTax * d.quantity : (d.amount || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

          {/* 备注 */}
          <div>
            <div className="mb-1 text-xs text-[#606266]">备注</div>
            <textarea
              className="w-full px-2 py-1.5 border border-[#dcdfe6] rounded text-xs" rows={2}
              value={editItem.remark || ''}
              onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              placeholder="其他说明或特殊要求..."
            />
          </div>
        </div>
      )}
    </Modal>

      {/* ============ 选择采购需求弹窗 ============ */}
      <Modal
        open={showDemandPicker}
        title="选择采购需求"
        onClose={() => { setShowDemandPicker(false); }}
        footer={
          <>
            <DefaultButton onClick={() => setShowDemandPicker(false)}>取消</DefaultButton>
            <PrimaryButton onClick={confirmPickedDemand}>确认导入</PrimaryButton>
          </>
        }
        width="900px"
      >
        <div className="space-y-2 max-h-[500px] overflow-auto">
          <div className="text-xs text-[#606266] mb-2">
          选择要导入的采购需求，系统将自动带入物资信息及价格</div>
          <table className="w-full text-xs">
            <thead className="bg-[#f5f7fa] sticky top-0">
              <tr>
                <th className="px-2 py-2 text-left text-[#606266] font-medium w-10"></th>
                <th className="px-2 py-2 text-left text-[#606266] font-medium w-32">需求编号</th>
                <th className="px-2 py-2 text-left text-[#606266] font-medium">项目名称</th>
                <th className="px-2 py-2 text-left text-[#606266] font-medium w-20">申请人</th>
                <th className="px-2 py-2 text-left text-[#606266] font-medium w-24">申请日期</th>
                <th className="px-2 py-2 text-left text-[#606266] font-medium w-20">状态</th>
                <th className="px-2 py-2 text-center text-[#606266] font-medium w-20">明细项</th>
                <th className="px-2 py-2 text-right text-[#606266] font-medium w-24">预估金额</th>
              </tr>
            </thead>
            <tbody>
              {procurementDemands.filter((d) => d.status === 'approved').map((demand) => (
                <tr key={demand.id} className="border-b border-[#ebeef5] hover:bg-[#fafafa]">
                  <td className="px-2 py-2 text-center">
                    <input
                      type="radio"
                      name="demand"
                      checked={pickedDemandId === demand.id}
                      onChange={() => setPickedDemandId(demand.id)}
                    />
                  </td>
                  <td className="px-2 py-2 font-medium">{demand.demandNo}</td>
                  <td className="px-2 py-2">{demand.projectName}</td>
                  <td className="px-2 py-2">{demand.applicant}</td>
                  <td className="px-2 py-2">{demand.applyDate}</td>
                  <td className="px-2 py-2 text-[#67c23a]">已审批</td>
                  <td className="px-2 py-2 text-center">{demand.details.length}</td>
                  <td className="px-2 py-2 text-right">¥{(demand.estimatedAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
              {procurementDemands.filter((d) => d.status === 'approved').length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-[#909399]">暂无已审批通过的采购需求</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* ============ 查看详情弹窗 ============ */}
      <Modal
        open={!!viewItem}
        title={'订单详情 - ' + (viewItem?.orderNo || '')}
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="1000px"
      >
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#909399]">订单编号：</span><span className="font-medium">{viewItem.orderNo}</span></div>
              <div><span className="text-[#909399]">来源类型：</span><span>{sourceTypeMap[viewItem.sourceType || ''] || '-'}</span></div>
              <div><span className="text-[#909399]">状态：</span>
                <span className={'px-2 py-0.5 rounded text-xs ' + (statusMap[viewItem.status]?.color || 'text-[#909399]') + ' ' + (statusMap[viewItem.status]?.bg || 'bg-[#f4f4f5]')}>{statusMap[viewItem.status]?.label}</span>
              </div>
              <div><span className="text-[#909399]">供应商：</span>{viewItem.supplierName || '-'}</div>
              <div><span className="text-[#909399]">关联需求：</span>{viewItem.demandNo || '-'}</div>
              <div><span className="text-[#909399]">创建人：</span>{viewItem.creator}</div>
              <div><span className="text-[#909399]">经办人：</span>{viewItem.handler || viewItem.creator}</div>
              <div><span className="text-[#909399]">创建时间：</span>{viewItem.createTime}</div>
              <div><span className="text-[#909399]">要求交货：</span>{viewItem.deliveryDate || '-'}</div>
              {viewItem.approveTime && <div><span className="text-[#909399]">审批时间：</span>{viewItem.approveTime}</div>}
              {viewItem.sentTime && <div><span className="text-[#909399]">发送时间：</span>{viewItem.sentTime}</div>}
            </div>
            <div>
              <div className="text-xs font-medium text-[#303133] mb-1.5">📦 订单明细</div>
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-32">商品编码</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium">产品名称</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-20">规格</th>
                      <th className="px-2 py-2 text-left text-[#606266] font-medium w-16">单位</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-20">数量</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">单价(元)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">金额(元)</th>
                      <th className="px-2 py-2 text-center text-[#606266] font-medium w-28">交货日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((d) => (
                      <tr key={d.id} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-2">{d.productCode}</td>
                        <td className="px-2 py-2">{d.productName}</td>
                        <td className="px-2 py-2">{d.specification || '-'}</td>
                        <td className="px-2 py-2">{d.unit}</td>
                        <td className="px-2 py-2 text-center">{d.quantity}</td>
                        <td className="px-2 py-2 text-right">{d.unitPrice?.toLocaleString() || '-'}</td>
                        <td className="px-2 py-2 text-right font-medium">¥{(d.amount || 0).toLocaleString()}</td>
                        <td className="px-2 py-2 text-center text-[#909399]">{d.deliveryDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  {viewItem.details.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-[#909399]">暂无明细</td></tr>
                  )}
                </table>
              </div>
            </div>
            {viewItem.remark && (
              <div>
                <div className="text-xs font-medium text-[#303133] mb-1">备注</div>
                <div className="p-2 border border-[#ebeef5] rounded text-xs text-[#606266] bg-[#fafafa]">{viewItem.remark}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ============ 审批弹窗 ============ */}
      <Modal
        open={showApproveModal && !!approveItem}
        title="订单审批"
        onClose={() => setShowApproveModal(false)}
        footer={
          <>
            <DefaultButton onClick={() => handleApprove(false, '')}>驳回</DefaultButton>
            <PrimaryButton onClick={() => handleApprove(true, '')}>审批通过</PrimaryButton>
          </>
        }
        width="600px"
      >
        {approveItem && (
          <div className="space-y-2 text-xs">
            <div className="p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-[#909399]">订单编号：</span><span className="font-medium">{approveItem.orderNo}</span></div>
                <div><span className="text-[#909399]">供应商：</span>{approveItem.supplierName}</div>
                <div><span className="text-[#909399]">创建人：</span>{approveItem.creator}</div>
                <div><span className="text-[#909399]">创建时间：</span>{approveItem.createTime}</div>
                <div className="col-span-2"><span className="text-[#909399]">明细项数：</span>{approveItem.details.length} 项，<span className="text-[#909399]">总金额：</span><span className="font-medium text-[#f56c6c]">¥{approveItem.details.reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="text-[#606266] mt-2">请确认是否审批通过该订单？</div>
          </div>
        )}
      </Modal>

      {/* ============ 发送订单弹窗 ============ */}
      <Modal
        open={showSendModal && !!sendItem}
        title="发送订单给供应商"
        onClose={() => setShowSendModal(false)}
        footer={
          <>
            <DefaultButton onClick={() => setShowSendModal(false)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSend}>确认发送</PrimaryButton>
          </>
        }
        width="600px"
      >
          {sendItem && (
            <div className="space-y-2 text-xs">
              <div className="p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[#909399]">订单编号：</span><span className="font-medium">{sendItem.orderNo}</span></div>
                  <div><span className="text-[#909399]">供应商：</span>{sendItem.supplierName}</div>
                  <div><span className="text-[#909399]">发送人：</span>{currentUser.name}</div>
                  <div><span className="text-[#909399]">发送时间：</span>{new Date().toLocaleString('zh-CN')}</div>
                </div>
              </div>
              <div className="text-[#606266]">
                <div className="mb-1 text-[#303133] font-medium mb-2">📝 邮件预览：</div>
                <div className="p-3 border border-[#ebeef5] rounded bg-white text-xs leading-relaxed">
                  <div className="font-medium mb-2">主题：采购订单 {sendItem.orderNo}</div>
                  <div className="text-[#606266]">尊敬的 {sendItem.supplierName}：</div>
                  <div className="mt-2">您好！请查收我司采购订单，订单明细如下：</div>
                  <div className="mt-2 border-t border-[#ebeef5] pt-2">
                    {sendItem.details.map((d, i) => (
                      <div key={d.id} className="flex justify-between py-1">
                        <span>{i + 1}. {d.productName} ({d.productCode}) × {d.quantity} {d.unit}</span>
                        <span>¥{(d.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#ebeef5] text-right font-medium">
                    合计：¥{sendItem.details.reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()} 元
                  </div>
                  {sendItem.deliveryDate && <div className="mt-2">要求交货日期：{sendItem.deliveryDate}</div>}
                  {sendItem.deliveryAddress && <div>交付地址：{sendItem.deliveryAddress}</div>}
                  {sendItem.contactPerson && <div>联系人：{sendItem.contactPerson}，{sendItem.contactPhone || ''}</div>}
                  <div className="mt-3 text-[#909399]">
                    发送人：{currentUser.name}<br />
                    联系电话：{currentUser.phone || currentUser.email || '未设置'}
                  </div>
                </div>
              </div>
            </div>
          )}
      </Modal>

      {/* ============ 变更申请弹窗 ============ */}
      <Modal
        open={!!changeItem}
        title="订单变更申请"
        onClose={() => setChangeItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setChangeItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSaveChange}>提交变更申请</PrimaryButton>
          </>
        }
        width="1100px"
      >
        {changeItem && (
          <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa] text-xs">
            <div><span className="text-[#909399]">变更单号：</span><span className="font-medium">{changeItem.changeNo}</span></div>
            <div><span className="text-[#909399]">变更人：</span>{changeItem.changer}</div>
            <div><span className="text-[#909399]">变更时间：</span>{changeItem.changeTime}</div>
          </div>
          <div>
            <div className="mb-1 text-xs text-[#606266]">变更原因 <span className="text-[#f56c6c]">*</span></div>
            <textarea
              className="w-full px-2 py-1.5 border border-[#dcdfe6] rounded text-xs"
              rows={2}
              value={changeItem.changeReason}
              onChange={(e) => setChangeItem({ ...changeItem, changeReason: e.target.value })}
              placeholder="请说明变更原因..."
            />
          </div>
          <div className="text-xs text-[#606266] mt-2">修改订单明细（仅允许调减数量或删减商品，不可新增或涨价）：</div>
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#f5f7fa] sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-8">#</th>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium">产品名称</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-16">单位</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-20">原数量</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-20">新数量</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">原金额</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-24">新金额</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {changeItem.afterDetails.map((detail, index) => {
                  const before = changeItem.beforeDetails[index];
                  const beforeQty = before?.quantity || 0;
                  const beforeAmt = before?.amount || 0;
                  const newAmt = (Number(detail.unitPrice) || 0) * (Number(detail.quantity) || 0);
                  return (
                    <tr key={detail.id} className="border-b border-[#ebeef5]">
                      <td className="px-2 py-1.5 text-center">{index + 1}</td>
                      <td className="px-2 py-1.5">{detail.productName}</td>
                      <td className="px-2 py-1.5 text-center">{detail.unit}</td>
                      <td className="px-2 py-1.5 text-center">{beforeQty}</td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={beforeQty}
                          className="w-full h-7 px-1.5 border border-[#dcdfe6] rounded text-xs text-right"
                          value={detail.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val <= beforeQty) updateChangeDetail(index, 'quantity', val);
                          }}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">{beforeAmt.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-right text-[#f56c6c] font-medium">{newAmt.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-center">
                        <TextButton type="danger" size="small" onClick={() => removeChangeDetail(index)}>删除</TextButton>
                      </td>
                    </tr>
                  );
                })}
                {changeItem.afterDetails.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-[#909399]">暂无明细</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center gap-6 text-xs pt-2 border-t border-[#ebeef5] bg-[#f5f7fa] px-3 py-2 rounded">
              <span>原总金额：<span className="font-medium">¥{changeItem.beforeDetails.reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}</span></span>
              <span>新总金额：<span className="text-[#f56c6c] font-bold">¥{changeItem.afterDetails.reduce((s, d) => s + ((Number(d.unitPrice) || 0) * (Number(d.quantity) || 0)), 0).toLocaleString()}</span></span>
            </div>
          </div>
        )}
      </Modal>

      {/* ============ 变更历史列表弹窗 ============ */}
      <Modal
        open={showChangeHistory}
        title={'订单变更历史 - ' + (historyOrderId ? (procurementOrders.find(o => o.id === historyOrderId)?.orderNo || '') : '')}
        onClose={() => setShowChangeHistory(false)}
        footer={<DefaultButton onClick={() => setShowChangeHistory(false)}>关闭</DefaultButton>}
        width="1100px"
      >
        <div className="space-y-3">
          <div className="text-xs text-[#606266]">以下为该订单的所有变更申请记录，可对"待审批"状态的变更进行审批操作。</div>
          {orderChanges.length === 0 ? (
            <div className="text-center text-[#909399] py-8 text-sm">暂无变更记录</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-[#f5f7fa]">
                <tr>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-32">变更单号</th>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-20">变更人</th>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-40">变更时间</th>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-20">状态</th>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-24">审批人</th>
                  <th className="px-2 py-2 text-left text-[#606266] font-medium w-24">审批时间</th>
                  <th className="px-2 py-2 text-right text-[#606266] font-medium w-24">原金额</th>
                  <th className="px-2 py-2 text-right text-[#606266] font-medium w-24">新金额</th>
                  <th className="px-2 py-2 text-center text-[#606266] font-medium w-32">操作</th>
                </tr>
              </thead>
              <tbody>
                {orderChanges.map((c) => (
                  <tr key={c.id} className="border-b border-[#ebeef5] hover:bg-[#fafafa]">
                    <td className="px-2 py-2 font-medium">{c.changeNo}</td>
                    <td className="px-2 py-2">{c.changer}</td>
                    <td className="px-2 py-2">{c.changeTime}</td>
                    <td className="px-2 py-2">
                      <span className={'px-2 py-0.5 rounded text-xs ' + (changeStatusMap[c.status]?.color || 'text-[#909399]')}>{changeStatusMap[c.status]?.label || c.status}</span>
                    </td>
                    <td className="px-2 py-2">{c.approver || '-'}</td>
                    <td className="px-2 py-2">{c.approveTime || '-'}</td>
                    <td className="px-2 py-2 text-right">¥{c.beforeDetails.reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}</td>
                    <td className="px-2 py-2 text-right">¥{c.afterDetails.reduce((s, d) => s + ((Number(d.unitPrice) || 0) * (Number(d.quantity) || 0)), 0).toLocaleString()}</td>
                    <td className="px-2 py-2 text-center">
                      {c.status === 'pending' && (
                        <div className="flex items-center justify-center gap-1">
                          <TextButton onClick={() => approveChange(c, true)}>通过</TextButton>
                          <TextButton type="danger" onClick={() => approveChange(c, false)}>驳回</TextButton>
                        </div>
                      )}
                      {c.status !== 'pending' && <span className="text-[#909399]">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </div>
  );
}