import { useMemo, useState } from 'react';
import { Search, Check, Filter } from 'lucide-react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import type { ProcurementInspection, ContractPurchaseOrder } from '@/types';

export default function ProcurementInspectionPage() {
  const procurementInspections = useStore((s) => s.procurementInspections);
  const addProcurementInspection = useStore((s) => s.addProcurementInspection);
  const updateProcurementInspection = useStore((s) => s.updateProcurementInspection);
  const deleteProcurementInspection = useStore((s) => s.deleteProcurementInspection);
  const procurementOrders = useStore((s) => s.procurementOrders);
  const currentUser = useStore((s) => s.currentUser);
  const products = useStore((s) => s.products);
  const inventories = useStore((s) => s.inventories);
  const addInventory = useStore((s) => s.addInventory);
  const updateInventory = useStore((s) => s.updateInventory);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);

  const [filterNo, setFilterNo] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({ no: '', supplier: '', status: '' });

  const filteredData = useMemo(() => {
    return procurementInspections.filter((i) => {
      if (applied.no && !i.inspectionNo.includes(applied.no)) return false;
      if (applied.supplier && !(i.supplierName || '').includes(applied.supplier)) return false;
      if (applied.status && i.status !== applied.status) return false;
      return true;
    });
  }, [procurementInspections, applied]);

  const columns: ColumnDef<ProcurementInspection>[] = [
    { key: 'inspectionNo', title: '验收编号' },
    { key: 'orderNo', title: '关联订单', render: (row) => row.orderNo || '-' },
    { key: 'supplierName', title: '供应商', render: (row) => row.supplierName || '-' },
    { key: 'inspectionDate', title: '验收日期' },
    { key: 'inspector', title: '验收人' },
    {
      key: 'status',
      title: '状态',
      render: (row) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'text-[#909399]' },
          pending: { label: '待审批', color: 'text-[#e6a23c]' },
          approved: { label: '已通过', color: 'text-[#67c23a]' },
          rejected: { label: '已驳回', color: 'text-[#f56c6c]' },
        };
        const status = statusMap[row.status] || statusMap.pending;
        return <span className={status.color}>{status.label}</span>;
      },
    },
    {
      key: 'qualifiedRate',
      title: '合格率',
      render: (row) => {
        const total = row.details.reduce((sum, d) => sum + d.orderedQuantity, 0);
        const pass = row.details.reduce((sum, d) => sum + d.passQuantity, 0);
        return total > 0 ? `${((pass / total) * 100).toFixed(0)}%` : '-';
      },
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton onClick={() => viewDetail(row)}>查看详情</TextButton>
          {row.status === 'draft' && (
            <TextButton onClick={() => handleSubmit(row)}>提交审批</TextButton>
          )}
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => handleApprove(row)}>审批通过</TextButton>
              <TextButton type="danger" onClick={() => handleReject(row)}>驳回</TextButton>
            </>
          )}
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除验收记录 ${row.inspectionNo}？`)) deleteProcurementInspection(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<ProcurementInspection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewItem, setViewItem] = useState<ProcurementInspection | null>(null);
  const [orderPickerOpen, setOrderPickerOpen] = useState(false);
  const [orderPickerKeyword, setOrderPickerKeyword] = useState('');
  const [orderPickerTempId, setOrderPickerTempId] = useState<string | undefined>(undefined);

  const openAdd = () => {
    const now = new Date();
    const newInspection: ProcurementInspection = {
      id: 'PI' + Date.now(),
      inspectionNo: '',   // 保存时才生成编号
      inspectionDate: now.toISOString().slice(0, 10),
      inspector: currentUser.name,
      status: 'pending',
      details: [],
    };
    setIsNew(true);
    setEditItem(newInspection);
  };

  const viewDetail = (inspection: ProcurementInspection) => {
    setViewItem(inspection);
  };

  const handleApprove = (inspection: ProcurementInspection) => {
    // 审批通过后同步库存
    const syncToInventory = () => {
      if (inspection.details.length === 0) return;

      // 默认仓库和仓位（取第一个）
      const defaultWarehouse = warehouses[0];
      const defaultPosition = positions[0];

      inspection.details.forEach((detail) => {
        if (!detail.isQualified || detail.passQuantity <= 0) return;

        // 查找商品
        const product = products.find((p) => p.id === detail.productId);
        if (!product) return;

        // 查找是否已有库存记录
        const existingInventory = inventories.find(
          (inv) => inv.productId === detail.productId && inv.warehouseId === defaultWarehouse?.id
        );

        if (existingInventory) {
          // 更新库存数量
          updateInventory(existingInventory.id, {
            quantity: (existingInventory.quantity || 0) + detail.passQuantity,
          });
        } else {
          // 新增库存记录
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          const newInventory = {
            id: 'INV' + Date.now() + Math.random(),
            productId: product.id,
            productCode: detail.productCode,
            productName: detail.productName,
            specification: detail.specification || product.specification || '',
            unit: detail.unit,
            quantity: detail.passQuantity,
            frozenQuantity: 0,
            inboundTime: now,
            warehouseId: defaultWarehouse?.id || '',
            warehouseName: defaultWarehouse?.name || '',
            positionId: defaultPosition?.id || '',
            positionName: defaultPosition?.name || '',
            updateTime: now,
          };
          addInventory(newInventory as any);
        }
      });
    };

    if (confirm('确认审批通过？审批通过后将同步合格商品到库存。')) {
      syncToInventory();
      updateProcurementInspection(inspection.id, { status: 'approved', approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19), approver: currentUser.name });
      alert('验收审批通过，库存已同步更新');
    }
  };

  const handleReject = (inspection: ProcurementInspection) => {
    const reason = prompt('请输入驳回原因：');
    if (reason) {
      updateProcurementInspection(inspection.id, {
        status: 'draft',
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        approver: currentUser.name,
        remark: `驳回原因：${reason}`,
      });
    }
  };

  const handleSubmit = (inspection: ProcurementInspection) => {
    updateProcurementInspection(inspection.id, {
      status: 'pending',
      approveTime: undefined,
      approver: undefined,
    });
  };

  const handleSave = () => {
    if (!editItem) return;
    // 新增时才生成编号，编辑保留原编号
    if (isNew && !editItem.inspectionNo) {
      editItem.inspectionNo = genSerialNo(SERIAL_CONFIG.INSPECTION, procurementInspections.map(i => i.inspectionNo));
    }
    if (isNew) {
      addProcurementInspection(editItem);
    } else {
      updateProcurementInspection(editItem.id, editItem);
    }
    setEditItem(null);
  };

  const openOrderPicker = () => {
    setOrderPickerKeyword('');
    setOrderPickerTempId(editItem?.orderId);
    setOrderPickerOpen(true);
  };

  // 筛选可验收的订单：submitted 状态 + 关键字
  const availableOrders = useMemo(() => {
    const kw = orderPickerKeyword.trim().toLowerCase();
    return procurementOrders.filter((o) => {
      if (o.status !== 'submitted') return false;
      if (!kw) return true;
      return (
        (o.orderNo || '').toLowerCase().includes(kw) ||
        (o.contractNo || '').toLowerCase().includes(kw) ||
        (o.supplierName || '').toLowerCase().includes(kw) ||
        (o.projectName || '').toLowerCase().includes(kw)
      );
    });
  }, [procurementOrders, orderPickerKeyword]);

  const confirmPickOrder = () => {
    if (!orderPickerTempId || !editItem) {
      setOrderPickerOpen(false);
      return;
    }
    const order = procurementOrders.find((o) => o.id === orderPickerTempId);
    if (!order) {
      setOrderPickerOpen(false);
      return;
    }
    // 修正字段名：ContractPurchaseOrderDetail.orderQuantity 不是 quantity
    const details = (order.details || []).map((d) => ({
      id: 'PID' + Date.now() + Math.random(),
      productId: d.productId,
      productCode: d.productCode,
      productName: d.productName,
      specification: d.specification,
      unit: d.unit,
      orderedQuantity: d.orderQuantity,
      inspectedQuantity: d.orderQuantity,
      passQuantity: d.orderQuantity,
      failQuantity: 0,
      isQualified: true,
    }));
    setEditItem({
      ...editItem,
      orderId: order.id,
      orderNo: order.orderNo,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      details,
    });
    setOrderPickerOpen(false);
  };

  const clearOrderLink = () => {
    if (!editItem) return;
    if (!confirm('确认清除关联订单及其明细？（不影响订单本身数据）')) return;
    setEditItem({
      ...editItem,
      orderId: undefined,
      orderNo: '',
      supplierId: undefined,
      supplierName: '',
      details: [],
    });
  };

  const updateDetail = (index: number, field: string, value: any) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    const detail = newDetails[index];
    if (field === 'passQuantity' || field === 'failQuantity') {
      newDetails[index] = { ...detail, isQualified: detail.failQuantity === 0 };
    }
    setEditItem({ ...editItem, details: newDetails });
  };

  const addDetail = () => {
    if (!editItem) return;
    const newDetail = {
      id: 'PID' + Date.now(),
      productId: '',
      productCode: '',
      productName: '',
      unit: '',
      orderedQuantity: 0,
      inspectedQuantity: 0,
      passQuantity: 0,
      failQuantity: 0,
      isQualified: true,
    };
    setEditItem({ ...editItem, details: [...editItem.details, newDetail] });
  };

  const removeDetail = (index: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">验收管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增验收记录</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, supplier: filterSupplier, status: filterStatus })}
        onReset={() => {
          setFilterNo('');
          setFilterSupplier('');
          setFilterStatus('');
          setApplied({ no: '', supplier: '', status: '' });
        }}
      >
        <SearchField label="验收编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
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
            { value: 'approved', label: '已通过' },
            { value: 'rejected', label: '已驳回' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增验收记录' : '编辑验收记录'}
        onClose={() => setEditItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="900px"
      >
        {editItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">验收编号</div>
                {isNew ? (
                  <input disabled placeholder="保存后自动生成"
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#c0c4cc]"
                    value={editItem.inspectionNo || ''}
                  />
                ) : (
                  <input disabled
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]"
                    value={editItem.inspectionNo}
                  />
                )}
              </div>
              <div>
                <div className="mb-1 text-[#606266]">关联采购订单（可选）</div>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]"
                    value={editItem.orderNo || ''}
                    disabled
                    placeholder="点击「选择订单」自动带出明细，也可手工录入"
                  />
                  <DefaultButton onClick={openOrderPicker}>选择订单</DefaultButton>
                  {editItem.orderNo && (
                    <TextButton type="danger" onClick={clearOrderLink}>清空</TextButton>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">供应商</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]"
                  value={editItem.supplierName || ''}
                  disabled
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">验收日期</div>
                <input
                  type="date"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.inspectionDate}
                  onChange={(e) => setEditItem({ ...editItem, inspectionDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">验收人</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem.inspector}
                onChange={(e) => setEditItem({ ...editItem, inspector: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <DefaultButton onClick={openOrderPicker}>选订单自动带出明细</DefaultButton>
              <DefaultButton onClick={addDetail}>手工添加验收明细</DefaultButton>
              <span className="text-xs text-[#909399] self-center ml-2">两种方式并存：选订单自动回填 / 纯手工录入</span>
            </div>
            <div>
              <div className="border border-[#dcdfe6] rounded">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f5f7fa]">
                      <th className="px-2 py-2 text-xs text-left">商品编码</th>
                      <th className="px-2 py-2 text-xs text-left">产品名称</th>
                      <th className="px-2 py-2 text-xs text-left">单位</th>
                      <th className="px-2 py-2 text-xs text-left">订购数量</th>
                      <th className="px-2 py-2 text-xs text-left">验收数量</th>
                      <th className="px-2 py-2 text-xs text-left">合格数量</th>
                      <th className="px-2 py-2 text-xs text-left">不合格数量</th>
                      <th className="px-2 py-2 text-xs text-left">备注</th>
                      <th className="px-2 py-2 text-xs text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.details.map((detail, index) => (
                      <tr key={detail.id} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-2">
                          <input
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.productCode}
                            onChange={(e) => updateDetail(index, 'productCode', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.productName}
                            onChange={(e) => updateDetail(index, 'productName', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.unit || ''}
                            onChange={(e) => updateDetail(index, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.orderedQuantity}
                            onChange={(e) => updateDetail(index, 'orderedQuantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.inspectedQuantity}
                            onChange={(e) => updateDetail(index, 'inspectedQuantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.passQuantity}
                            onChange={(e) => updateDetail(index, 'passQuantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.failQuantity}
                            onChange={(e) => updateDetail(index, 'failQuantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className="w-full h-6 px-2 border border-[#dcdfe6] rounded text-xs"
                            value={detail.remark || ''}
                            onChange={(e) => updateDetail(index, 'remark', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextButton type="danger" size="small" onClick={() => removeDetail(index)}>删除</TextButton>
                        </td>
                      </tr>
                    ))}
                    {editItem.details.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-4 text-center text-[#909399] text-sm">暂无明细</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full h-20 px-2 border border-[#dcdfe6] rounded"
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!viewItem}
        title="验收详情"
        onClose={() => setViewItem(null)}
        footer={
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        }
        width="800px"
      >
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[#909399]">验收编号：</span>{viewItem.inspectionNo}</div>
              <div><span className="text-[#909399]">关联订单：</span>{viewItem.orderNo || '-'}</div>
              <div><span className="text-[#909399]">供应商：</span>{viewItem.supplierName || '-'}</div>
              <div><span className="text-[#909399]">验收日期：</span>{viewItem.inspectionDate}</div>
              <div><span className="text-[#909399]">验收人：</span>{viewItem.inspector}</div>
              <div><span className="text-[#909399]">状态：</span>{viewItem.status}</div>
            </div>
            <div>
              <div className="text-[#606266] mb-2">验收明细</div>
              <div className="border border-[#dcdfe6] rounded">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f5f7fa]">
                      <th className="px-2 py-2 text-xs text-left">商品编码</th>
                      <th className="px-2 py-2 text-xs text-left">产品名称</th>
                      <th className="px-2 py-2 text-xs text-left">单位</th>
                      <th className="px-2 py-2 text-xs text-left">订购数量</th>
                      <th className="px-2 py-2 text-xs text-left">合格数量</th>
                      <th className="px-2 py-2 text-xs text-left">不合格数量</th>
                      <th className="px-2 py-2 text-xs text-left">是否合格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((detail) => (
                      <tr key={detail.id} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-2 text-xs">{detail.productCode}</td>
                        <td className="px-2 py-2 text-xs">{detail.productName}</td>
                        <td className="px-2 py-2 text-xs">{detail.unit}</td>
                        <td className="px-2 py-2 text-xs">{detail.orderedQuantity}</td>
                        <td className="px-2 py-2 text-xs">{detail.passQuantity}</td>
                        <td className="px-2 py-2 text-xs">{detail.failQuantity}</td>
                        <td className="px-2 py-2 text-xs">
                          <span className={detail.isQualified ? 'text-[#67c23a]' : 'text-[#f56c6c]'}>
                            {detail.isQualified ? '合格' : '不合格'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 采购订单选择弹框 */}
      <Modal
        open={orderPickerOpen}
        title="选择待验收的采购订单"
        onClose={() => setOrderPickerOpen(false)}
        footer={
          <>
            <span className="text-xs text-slate-500 mr-auto">
              仅展示 <b className="text-indigo-600">已提交</b> 状态的订单，共 {availableOrders.length} 条
            </span>
            <DefaultButton onClick={() => setOrderPickerOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={confirmPickOrder}>确认选择</PrimaryButton>
          </>
        }
        width="max-w-[900px]"
      >
        {/* 搜索 */}
        <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2">
            <Search size={12} className="text-indigo-500" />
            <span className="text-xs font-medium text-slate-700">快速搜索</span>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={orderPickerKeyword}
              onChange={(e) => setOrderPickerKeyword(e.target.value)}
              placeholder="搜索订单编号 / 合同编号 / 供应商 / 项目名称"
              className="w-full h-8 pl-8 pr-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        {/* 表格 */}
        <div className="border border-slate-200 rounded max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="w-10 py-2.5 text-center border-b border-slate-200"></th>
                <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">订单编号</th>
                <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">合同编号</th>
                <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">项目名称</th>
                <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">供应商</th>
                <th className="py-2.5 text-right border-b border-slate-200 text-slate-600 text-xs">订单金额</th>
                <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">提交日期</th>
              </tr>
            </thead>
            <tbody>
              {availableOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    {orderPickerKeyword ? '没有匹配的待验收订单' : '暂无可验收的采购订单，请先在「招采订单管理」提交订单'}
                  </td>
                </tr>
              )}
              {availableOrders.map((order: ContractPurchaseOrder) => {
                const checked = orderPickerTempId === order.id;
                return (
                  <tr
                    key={order.id}
                    onClick={() => setOrderPickerTempId(order.id)}
                    className={`border-t border-slate-100 cursor-pointer hover:bg-indigo-50/40 transition-colors ${
                      checked ? 'bg-indigo-50/70' : ''
                    }`}
                  >
                    <td className="py-2 text-center">
                      {checked ? (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500">
                          <Check size={10} className="text-white" />
                        </span>
                      ) : (
                        <span className="inline-block w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </td>
                    <td className="py-2 font-mono text-xs text-indigo-600">{order.orderNo}</td>
                    <td className="py-2 font-mono text-xs text-slate-600">{order.contractNo || '-'}</td>
                    <td className="py-2 text-slate-800 font-medium text-xs">{order.projectName || '-'}</td>
                    <td className="py-2 text-slate-700 text-xs">{order.supplierName || '-'}</td>
                    <td className="py-2 text-right text-slate-700 text-xs">¥{(order.details?.reduce((s, d) => s + (d.amount || 0), 0) || 0).toLocaleString()}</td>
                    <td className="py-2 text-slate-500 text-xs">{(order.submitTime || order.createTime || '').split(' ')[0] || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}