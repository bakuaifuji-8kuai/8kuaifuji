import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import { useStore } from '@/store/useStore';
import { generateCheckOrderNo, generateBatchNo, generateStockTransactionNo } from '@/mock/data';
import type { CheckOrder, Product, CheckDetail } from '@/types';

export default function StockCheckPage() {
  const checkOrders = useStore((s) => s.checkOrders);
  const updateCheckOrder = useStore((s) => s.updateCheckOrder);
  const addCheckOrder = useStore((s) => s.addCheckOrder);
  const deleteCheckOrder = useStore((s) => s.deleteCheckOrder);
  const warehouses = useStore((s) => s.warehouses);
  const products = useStore((s) => s.products);
  const employees = useStore((s) => s.employees);
  const batchInventories = useStore((s) => s.batchInventories);
  const addBatchInventory = useStore((s) => s.addBatchInventory);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return checkOrders.filter((c) => {
      if (applied.no && !c.orderNo.includes(applied.no)) return false;
      if (applied.status && c.status !== applied.status) return false;
      if (applied.from && c.createTime < applied.from) return false;
      if (applied.to && c.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [checkOrders, applied]);

  const statusText = (s: string) => (s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) =>
    s === 'submitted' ? 'text-[#67c23a]' : 'text-[#e6a23c]';

  const [viewItem, setViewItem] = useState<CheckOrder | null>(null);
  const [editItem, setEditItem] = useState<CheckOrder | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerProducts, setPickerProducts] = useState<Product[]>([]);

  const getBookQuantity = (productId: string, warehouseId: string) => {
    return batchInventories
      .filter(b => b.productId === productId && b.warehouseId === warehouseId)
      .reduce((sum, b) => sum + b.quantity, 0);
  };

  const openAdd = () => {
    setIsNew(true);
    setEditItem({
      id: '',
      orderNo: generateCheckOrderNo(),
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      status: 'pending',
      operator: '',
      createTime: new Date().toISOString().slice(0, 10) + ' 09:00:00',
      remark: '',
      details: [],
    });
  };

  const openProductPicker = () => {
    if (!editItem) return;
    const selectedIds = editItem.details.map(d => d.productId);
    const availableProducts = products.filter(p => 
      !selectedIds.includes(p.id)
    );
    setPickerProducts(availableProducts);
    setShowProductPicker(true);
  };

  const handleProductSelect = (selectedProducts: Product[]) => {
    if (!editItem) return;
    const newDetails: CheckDetail[] = selectedProducts.map(p => ({
      id: '',
      checkOrderId: editItem.id,
      productId: p.id,
      productCode: p.code,
      productName: p.name,
      specification: p.specification,
      unit: p.unit,
      positionId: '',
      bookQuantity: getBookQuantity(p.id, editItem.warehouseId),
      checkQuantity: 0,
      diffQuantity: -getBookQuantity(p.id, editItem.warehouseId),
      status: 'pending',
    }));
    setEditItem({
      ...editItem,
      details: [...editItem.details, ...newDetails],
    });
    setShowProductPicker(false);
  };

  const updateDetailQuantity = (index: number, value: number) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    const detail = newDetails[index];
    const diff = value - detail.bookQuantity;
    newDetails[index] = {
      ...detail,
      checkQuantity: value,
      diffQuantity: diff,
    };
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (index: number) => {
    if (!editItem) return;
    const newDetails = editItem.details.filter((_, i) => i !== index);
    setEditItem({ ...editItem, details: newDetails });
  };

  const handleSubmitFromList = (order: CheckOrder) => {
    if (!confirm(`确认提交盘点单 ${order.orderNo}？提交后将自动处理盘盈盘亏。`)) {
      return;
    }
    
    const completeTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    
    order.details?.forEach((detail) => {
      const diff = detail.diffQuantity;
      if (diff === 0) return;
      
      const product = products.find(p => p.id === detail.productId);
      const category = product?.categoryId;
      
      if (diff > 0) {
        const batchNo = generateBatchNo();
        addBatchInventory({
          id: 'B' + Date.now() + Math.random().toString(36).slice(2, 7),
          batchNo,
          productId: detail.productId,
          productCode: detail.productCode,
          productName: detail.productName,
          categoryId: category || '',
          categoryName: '',
          warehouseId: order.warehouseId,
          warehouseName: order.warehouseName || '',
          positionId: '',
          positionName: '',
          quantity: diff,
          originalQuantity: diff,
          inboundTime: completeTime,
          inboundOrderNo: order.orderNo,
        });
        
        addStockTransaction({
          id: 'ST' + Date.now() + Math.random().toString(36).slice(2, 7),
          transactionNo: generateStockTransactionNo(),
          transactionTime: completeTime,
          transactionType: 'inbound',
          productId: detail.productId,
          productCode: detail.productCode,
          productName: detail.productName,
          warehouseId: order.warehouseId,
          warehouseName: order.warehouseName || '',
          positionId: '',
          positionName: '',
          quantity: diff,
          sourceOrderId: order.id,
          sourceOrderNo: order.orderNo,
          sourceType: '盘点盘盈',
          batchNo,
          operator: order.operator,
          remark: `盘点盘盈，账面${detail.bookQuantity}，实盘${detail.checkQuantity}`,
        });
      } else {
        const absDiff = Math.abs(diff);
        let remaining = absDiff;
        
        const productBatches = batchInventories
          .filter(b => b.productId === detail.productId && b.warehouseId === order.warehouseId && b.quantity > 0)
          .sort((a, b) => a.inboundTime.localeCompare(b.inboundTime));
        
        for (const batch of productBatches) {
          if (remaining <= 0) break;
          
          const deduct = Math.min(batch.quantity, remaining);
          updateBatchInventory(batch.id, {
            quantity: batch.quantity - deduct,
          });
          
          addStockTransaction({
            id: 'ST' + Date.now() + Math.random().toString(36).slice(2, 7),
            transactionNo: generateStockTransactionNo(),
            transactionTime: completeTime,
            transactionType: 'outbound',
            productId: detail.productId,
            productCode: detail.productCode,
            productName: detail.productName,
            warehouseId: order.warehouseId,
            warehouseName: order.warehouseName || '',
            positionId: batch.positionId || '',
            positionName: batch.positionName || '',
            quantity: -deduct,
            sourceOrderId: order.id,
            sourceOrderNo: order.orderNo,
            sourceType: '盘点盘亏',
            batchNo: batch.batchNo,
            operator: order.operator,
            remark: `盘点盘亏，账面${detail.bookQuantity}，实盘${detail.checkQuantity}`,
          });
          
          remaining -= deduct;
        }
      }
    });
    
    updateCheckOrder(order.id, {
      status: 'submitted',
      completeTime,
    });
  };

  const columns: ColumnDef<CheckOrder>[] = [
    { key: 'orderNo', title: '盘点单号' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'positions',
      title: '关联仓位',
      render: (row) => (row.details?.length ? `共${row.details.length}条` : '-'),
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'completeTime', title: '盘点时间', render: (row) => row.completeTime || '-' },
    { key: 'operator', title: '操作员' },
    { key: 'remark', title: '备注', render: (row) => row.remark || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => { setIsNew(false); setEditItem({ ...row }); }}>编辑</TextButton>
              <TextButton onClick={() => handleSubmitFromList(row)}>提交</TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除盘点单 ${row.orderNo}？`)) deleteCheckOrder(row.id);
                }}
              >
                删除
              </TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">盘点管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增盘点单</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, status: filterStatus, from: filterDateFrom, to: filterDateTo })}
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterDateFrom('');
          setFilterDateTo('');
          setApplied({ no: '', status: '', from: '', to: '' });
        }}
      >
        <SearchField label="盘点单号" placeholder="请输入盘点单号" value={filterNo} onChange={setFilterNo} />
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
        <SearchField label="起始日期" type="date" value={filterDateFrom} onChange={setFilterDateFrom} />
        <SearchField label="结束日期" type="date" value={filterDateTo} onChange={setFilterDateTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!viewItem}
        title="盘点单详情"
        onClose={() => setViewItem(null)}
        width="max-w-[800px]"
      >
        {viewItem && (
          <>
            <div className="grid grid-cols-3 gap-y-2 text-xs mb-3 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">盘点单号：</div>
              <div className="text-[#303133]">{viewItem.orderNo}</div>
              <div />
              <div className="text-[#606266]">仓库：</div>
              <div className="text-[#303133]">{viewItem.warehouseName}</div>
              <div />
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</div>
              <div />
              <div className="text-[#606266]">操作员：</div>
              <div className="text-[#303133]">{viewItem.operator}</div>
              <div />
              <div className="text-[#606266]">创建时间：</div>
              <div className="text-[#303133]">{viewItem.createTime}</div>
              <div />
              <div className="text-[#606266]">完成时间：</div>
              <div className="text-[#303133]">{viewItem.completeTime || '-'}</div>
              <div />
            </div>
            <div className="text-xs font-medium text-[#303133] mb-2">盘点明细</div>
            <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-2 py-2 text-left">物资编码</th>
                  <th className="px-2 py-2 text-left">物资名称</th>
                  <th className="px-2 py-2 text-left">规格</th>
                  <th className="px-2 py-2 text-left">单位</th>
                  <th className="px-2 py-2 text-left">账面数量</th>
                  <th className="px-2 py-2 text-left">实盘数量</th>
                  <th className="px-2 py-2 text-left">差异</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.details?.length ? (
                  viewItem.details.map((d, i) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.unit}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.bookQuantity}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.checkQuantity}</td>
                      <td className={`px-2 py-2 ${d.diffQuantity !== 0 ? 'text-[#f56c6c]' : 'text-[#303133]'}`}>
                        {d.diffQuantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#909399]">
                      无明细
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="text-xs text-[#606266] mt-2">备注：{viewItem.remark || '-'}</div>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      <Modal
        open={!!editItem && isNew !== undefined}
        title={isNew ? '新增盘点单' : '编辑盘点单'}
        onClose={() => setEditItem(null)}
        width="max-w-[900px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">盘点单号</div>
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
                    const wh = warehouses.find((w) => w.id === e.target.value);
                    const newWarehouseId = e.target.value;
                    const newDetails = editItem.details.map(d => ({
                      ...d,
                      bookQuantity: getBookQuantity(d.productId, newWarehouseId),
                      diffQuantity: d.checkQuantity - getBookQuantity(d.productId, newWarehouseId),
                    }));
                    setEditItem({ 
                      ...editItem, 
                      warehouseId: newWarehouseId, 
                      warehouseName: wh?.name,
                      details: newDetails,
                    });
                  }}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">操作员</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.operator}
                  onChange={(e) => setEditItem({ ...editItem, operator: e.target.value })}
                >
                  <option value="">请选择</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
              <div className="flex items-center justify-between">
              <div className="text-[#606266]">盘点明细（共 {editItem.details.length} 条）</div>
              <PrimaryButton size="small" onClick={openProductPicker}>
                <Plus size={14} /> 添加物资
              </PrimaryButton>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {editItem.details.length > 0 ? (
                <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      <th className="px-2 py-2 text-left">物资编码</th>
                      <th className="px-2 py-2 text-left">物资名称</th>
                      <th className="px-2 py-2 text-left">规格</th>
                      <th className="px-2 py-2 text-left">单位</th>
                      <th className="px-2 py-2 text-left">账面数量</th>
                      <th className="px-2 py-2 text-left">实盘数量</th>
                      <th className="px-2 py-2 text-left">差异</th>
                      <th className="px-2 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.details.map((d, i) => (
                      <tr key={i} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.unit}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.bookQuantity}</td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            className="w-20 h-6 px-2 border border-[#dcdfe6] rounded text-xs text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                            value={d.checkQuantity}
                            onChange={(e) => updateDetailQuantity(i, parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className={`px-2 py-2 ${d.diffQuantity !== 0 ? 'text-[#f56c6c]' : 'text-[#303133]'}`}>
                          {d.diffQuantity}
                        </td>
                        <td className="px-2 py-2">
                          <TextButton type="danger" size="small" onClick={() => removeDetail(i)}>删除</TextButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-[#909399] border border-dashed border-[#dcdfe6] rounded">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  <p>暂无盘点物资，请点击上方按钮添加</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <DefaultButton
            onClick={() => {
              if (!editItem) return;
              if (editItem.details.length === 0) {
                alert('请至少添加一条盘点物资');
                return;
              }
              if (!editItem.operator) {
                alert('请选择操作员');
                return;
              }
              
              if (isNew) {
                addCheckOrder({ 
                  ...editItem, 
                  id: 'CK' + Date.now(), 
                  status: 'pending', 
                  createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
                });
              } else {
                updateCheckOrder(editItem.id, { 
                  ...editItem,
                });
              }
              
              setEditItem(null);
            }}
          >
            保存
          </DefaultButton>
        </div>
      </Modal>

      <ProductPickerModal
        open={showProductPicker}
        title="选择盘点物资"
        onClose={() => setShowProductPicker(false)}
        products={pickerProducts}
        selectedIds={editItem?.details.map(d => d.productId) || []}
        onConfirm={handleProductSelect}
        showStockQty={true}
        warehouseId={editItem?.warehouseId}
      />
    </div>
  );
}
