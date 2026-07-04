import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ProcurementInspection } from '@/types';

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
  const batchInventories = useStore((s) => s.batchInventories);
  const addBatchInventory = useStore((s) => s.addBatchInventory);
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

  const openAdd = () => {
    const now = new Date();
    const newInspection: ProcurementInspection = {
      id: 'PI' + Date.now(),
      inspectionNo: `YS${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(procurementInspections.length + 1).padStart(3, '0')}`,
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
    const syncToInventory = () => {
      if (inspection.details.length === 0) return;

      const defaultWarehouse = warehouses[0];
      const defaultPosition = positions[0];
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

      inspection.details.forEach((detail) => {
        if (!detail.isQualified || detail.passQuantity <= 0) return;

        const product = products.find((p) => p.id === detail.productId);
        if (!product) return;

        const existingInventory = inventories.find(
          (inv) => inv.productId === detail.productId && inv.warehouseId === defaultWarehouse?.id
        );

        if (existingInventory) {
          updateInventory(existingInventory.id, {
            quantity: (existingInventory.quantity || 0) + detail.passQuantity,
          });
        } else {
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

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const batchNo = `PC${dateStr}${random}`;

        addBatchInventory({
          id: 'B' + Date.now() + Math.random().toString(36).slice(2, 7),
          batchNo,
          productId: detail.productId,
          productCode: detail.productCode,
          productName: detail.productName,
          specification: detail.specification || product.specification || '',
          warehouseId: defaultWarehouse?.id || '',
          warehouseName: defaultWarehouse?.name || '',
          positionId: defaultPosition?.id || '',
          positionName: defaultPosition?.name || '',
          quantity: detail.passQuantity,
          originalQuantity: detail.passQuantity,
          inboundTime: new Date().toISOString().slice(0, 10),
        });
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
      updateProcurementInspection(inspection.id, { status: 'rejected', approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19), approver: currentUser.name });
    }
  };

  const handleSave = () => {
    if (!editItem) return;
    if (isNew) {
      addProcurementInspection(editItem);
    } else {
      updateProcurementInspection(editItem.id, editItem);
    }
    setEditItem(null);
  };

  const loadFromOrder = () => {
    const orderNo = prompt('请输入订单编号：');
    if (!orderNo) return;
    const order = procurementOrders.find((o) => o.orderNo === orderNo);
    if (!order) {
      alert('未找到该订单');
      return;
    }
    const details = order.details.map((d) => ({
      id: 'PID' + Date.now() + Math.random(),
      productId: d.productId,
      productCode: d.productCode,
      productName: d.productName,
      specification: d.specification,
      unit: d.unit,
      orderedQuantity: d.quantity,
      inspectedQuantity: d.quantity,
      passQuantity: d.quantity,
      failQuantity: 0,
      isQualified: true,
    }));
    if (editItem) {
      setEditItem({
        ...editItem,
        orderId: order.id,
        orderNo: order.orderNo,
        supplierId: order.supplierId,
        supplierName: order.supplierName,
        details,
      });
    }
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
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.inspectionNo}
                  onChange={(e) => setEditItem({ ...editItem, inspectionNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">关联订单</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.orderNo || ''}
                  onChange={(e) => setEditItem({ ...editItem, orderNo: e.target.value })}
                />
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
              <DefaultButton onClick={loadFromOrder}>从订单导入明细</DefaultButton>
              <DefaultButton onClick={addDetail}>添加验收明细</DefaultButton>
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
    </div>
  );
}