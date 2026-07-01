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
import type { InboundOrder, InboundDetail, InboundOrderType } from '@/types';
import { Printer } from 'lucide-react';

interface Props {
  type?: 'purchase' | 'production' | 'return';
}

interface FormDetail extends InboundDetail {
  batchNo: string;
  specification?: string;
  unit?: string;
}

export default function InboundPage({ type = 'purchase' }: Props) {
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
  const stockTransactions = useStore((s) => s.stockTransactions);
  const addStockTransaction = useStore((s) => s.addStockTransaction);

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
  const [editDetails, setEditDetails] = useState<FormDetail[]>([]);
  const [editWarehouseId, setEditWarehouseId] = useState('');
  const [editCustodian, setEditCustodian] = useState<string>('');
  const [editInspector, setEditInspector] = useState<string>('');
  const [editPersonInCharge, setEditPersonInCharge] = useState('');
  const [editSalesperson, setEditSalesperson] = useState('');
  const [editCreator, setEditCreator] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const typeLabel =
    type === 'purchase' ? '采购入库' : type === 'production' ? '生产入库' : '退货入库';

  const statusText = (s: string) => (s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) => (s === 'submitted' ? 'text-[#67c23a]' : 'text-[#e6a23c]');

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
    {
      key: 'positions',
      title: '仓位',
      render: (row) => Array.from(new Set(row.details.map((d) => d.positionName).filter(Boolean))).join(', ') || '-',
    },
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
          {row.status === 'submitted' && (
            <TextButton onClick={() => setPrintItem(row)}>
              <Printer size={12} /> 打印
            </TextButton>
          )}
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
              <TextButton onClick={() => handleSubmit(row.id)}>提交</TextButton>
              <TextButton type="danger" onClick={() => {
                if (confirm(`确认删除入库单 ${row.orderNo}？`)) deleteInboundOrder(row.id);
              }}>删除</TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const openAdd = () => {
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
      creator: '',
      status: 'pending',
      operator: '',
      createTime: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5),
      remark: '',
      details: [],
    };
    setEditItem(newOrder);
    setEditDetails([]);
    setEditWarehouseId(newOrder.warehouseId);
    setEditCustodian('');
    setEditInspector('');
    setEditPersonInCharge('');
    setEditSalesperson('');
    setEditCreator('');
    setEditRemark('');
  };

  const openEdit = (row: InboundOrder) => {
    setEditItem(row);
    setEditWarehouseId(row.warehouseId);
    setEditCustodian((row as any).custodianId || employees.find((e: any) => e.name === row.custodian)?.id || '');
    setEditInspector((row as any).inspectorId || employees.find((e: any) => e.name === row.inspector)?.id || '');
    setEditPersonInCharge(row.personInCharge || '');
    setEditSalesperson(row.salesperson || '');
    setEditCreator(row.creator || '');
    setEditRemark(row.remark || '');
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
        positionId: positions[0]?.id || '',
        positionName: positions[0]?.name || '',
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

  const updateDetailPosition = (idx: number, positionId: string) => {
    const pos = positions.find((p: any) => p.id === positionId);
    updateDetailField(idx, 'positionId', positionId);
    updateDetailField(idx, 'positionName', pos?.name || '');
  };

  const removeDetail = (idx: number) => {
    setEditDetails(editDetails.filter((_, i) => i !== idx));
  };

  const doValidate = (): boolean => {
    if (!editWarehouseId) { alert('请选择仓库'); return false; }
    if (!editCustodian) { alert('请选择保管人（必填）'); return false; }
    if (!editInspector) { alert('请选择验收人（必填）'); return false; }
    if (editDetails.length === 0) { alert('请添加至少一条产品明细'); return false; }
    if (editDetails.some((d) => !d.quantity || d.quantity <= 0)) {
      alert('产品数量必须大于 0');
      return false;
    }
    if (editDetails.some((d) => !d.positionId)) {
      alert('请为每条明细选择仓位');
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
      creator: editCreator,
      remark: editRemark,
      details: editDetails.map((d) => ({
        id: d.id,
        inboundOrderId: d.inboundOrderId,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        positionId: d.positionId,
        positionName: d.positionName,
        quantity: Number(d.quantity) || 0,
        ...((d as any).batchNo ? { batchNo: (d as any).batchNo } : {}),
      } as any)),
    };

    // Persist the personnel IDs for edit round-trip
    (updatedOrder as any).custodianId = editCustodian;
    (updatedOrder as any).inspectorId = editInspector;

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
    if (!confirm(`确认提交入库单 ${order.orderNo}？提交后将生成批次库存，不可再修改。`)) return;

    // Create batch inventory records
    order.details.forEach((d) => {
      const batchNo = (d as any).batchNo || generateBatchNo();
      const existing = batchInventories.find(
        (b) => b.batchNo === batchNo && b.productId === d.productId
      );
      if (!existing) {
        addBatchInventory({
          id: 'B' + Date.now() + Math.random().toString(36).slice(2, 7),
          batchNo,
          productId: d.productId,
          productCode: d.productCode,
          productName: d.productName,
          warehouseId: order.warehouseId,
          warehouseName: order.warehouseName,
          positionId: d.positionId,
          positionName: d.positionName,
          quantity: d.quantity,
          originalQuantity: d.quantity,
          inboundTime: new Date().toISOString().slice(0, 10),
          inboundOrderNo: order.orderNo,
        });
      }
      // Add stock transaction
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
        positionId: d.positionId,
        positionName: d.positionName,
        quantity: d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        sourceType: typeLabel,
        batchNo,
        operator: (order as any).custodian || '',
        remark: order.remark,
      });
    });

    updateInboundOrder(id, { ...order, status: 'submitted', operator: (order as any).operator || (order as any).custodian || '' });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">{typeLabel}管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增{typeLabel}单</PrimaryButton>
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
        width="max-w-[1000px]"
      >
        {viewItem && (
          <div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mb-4 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">入库单号：</span><span className="text-[#303133]">{viewItem.orderNo}</span></div>
              <div><span className="text-[#606266]">仓库：</span><span className="text-[#303133]">{viewItem.warehouseName}</span></div>
              <div><span className="text-[#606266]">状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              <div><span className="text-[#606266]">保管人：</span><span className="text-[#303133]">{viewItem.custodian || '-'}</span></div>
              <div><span className="text-[#606266]">负责人：</span><span className="text-[#303133]">{viewItem.personInCharge || '-'}</span></div>
              <div><span className="text-[#606266]">验收人：</span><span className="text-[#303133]">{viewItem.inspector || '-'}</span></div>
              <div><span className="text-[#606266]">业务员：</span><span className="text-[#303133]">{viewItem.salesperson || '-'}</span></div>
              <div><span className="text-[#606266]">制单人：</span><span className="text-[#303133]">{viewItem.creator || '-'}</span></div>
              <div className="col-span-2"><span className="text-[#606266]">备注：</span><span className="text-[#303133]">{viewItem.remark || '-'}</span></div>
            </div>

            <div className="text-xs text-[#606266] mb-2">产品明细（{viewItem.details.length} 条）</div>
            <div className="border border-[#ebeef5] rounded overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#f5f7fa] text-[#606266]">
                    <th className="px-3 py-2 text-left">序号</th>
                    <th className="px-3 py-2 text-left">物资编码</th>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-left">仓位</th>
                    <th className="px-3 py-2 text-left">批次号</th>
                    <th className="px-3 py-2 text-right">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.details.map((d, i) => {
                    const prod = products.find((p: any) => p.id === d.productId);
                    return (
                      <tr key={d.id} className="border-t border-[#f0f2f5]">
                        <td className="px-3 py-2 text-[#303133]">{i + 1}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.productCode}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.productName}</td>
                        <td className="px-3 py-2 text-[#303133]">{prod?.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{prod?.unit || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.positionName}</td>
                        <td className="px-3 py-2 text-[#303133]">{(d as any).batchNo || '-'}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">{d.quantity}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#f5f7fa] font-semibold border-t border-[#ebeef5]">
                    <td className="px-3 py-2" colSpan={7}>合计</td>
                    <td className="px-3 py-2 text-right">
                      {viewItem.details.reduce((a, b) => a + (b.quantity || 0), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f0f2f5]">
              <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
            </div>
          </div>
        )}
      </Modal>

      {/* 打印组件 */}
      {printItem && (
        <PrintDocument
          autoPrint
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
            positionName: d.positionName,
            batchNo: (d as any).batchNo || '',
          }))}
        />
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={`${editItem && inboundOrders.find((o) => o.id === editItem.id) ? '编辑' : '新增'}${typeLabel}单`}
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap w-20">制单人：</span>
                <input
                  type="text"
                  value={editCreator}
                  onChange={(e) => setEditCreator(e.target.value)}
                  placeholder="请输入"
                  className="flex-1 h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                />
              </div>
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
                产品明细（{editDetails.length} 条）
              </div>
              <PrimaryButton onClick={() => setPickerOpen(true)}>+ 添加产品</PrimaryButton>
            </div>
            <div className="border border-[#ebeef5] rounded overflow-x-auto">
              <table className="w-full text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-[#f5f7fa] text-[#606266]">
                    <th className="px-2 py-2 text-left w-10">序号</th>
                    <th className="px-2 py-2 text-left">物资编码</th>
                    <th className="px-2 py-2 text-left">物资名称</th>
                    <th className="px-2 py-2 text-left">规格型号</th>
                    <th className="px-2 py-2 text-left">单位</th>
                    <th className="px-2 py-2 text-left w-40">仓位</th>
                    <th className="px-2 py-2 text-left w-40">批次号</th>
                    <th className="px-2 py-2 text-right w-24">数量</th>
                    <th className="px-2 py-2 text-center w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {editDetails.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-[#909399]">
                        暂无产品明细，请点击右上方"添加产品"按钮选择
                      </td>
                    </tr>
                  ) : (
                    editDetails.map((d, idx) => (
                      <tr key={d.id} className="border-t border-[#f0f2f5]">
                        <td className="px-2 py-2 text-[#303133]">{idx + 1}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                        <td className="px-2 py-2 text-[#303133]">{d.unit || '-'}</td>
                        <td className="px-2 py-2">
                          <select
                            value={d.positionId}
                            onChange={(e) => updateDetailPosition(idx, e.target.value)}
                            className="w-full h-7 px-1 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                          >
                            <option value="">请选择</option>
                            {positions.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={(d as any).batchNo || ''}
                            onChange={(e) => updateDetailField(idx, 'batchNo', e.target.value)}
                            className="w-full h-7 px-2 border border-[#dcdfe6] text-xs text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                          />
                        </td>
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

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f2f5]">
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* 产品选择弹窗 */}
      <ProductPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        title="选择产品（可多选）"
      />
    </div>
  );
}
