import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import PrintDocument from '@/components/common/PrintDocument';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import { useStore } from '@/store/useStore';
import { generateStockTransactionNo, generateDamagedRecordNo } from '@/mock/data';
import type { DamagedRecord } from '@/types';
import { Printer } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface DamagedDetail {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  specification?: string;
  unit: string;
  positionId: string;
  positionName: string;
  quantity: number;
  unitPrice?: number;
  amount?: number;
}

const helpContent = {
  title: '报损出库 - 功能操作说明',
  description: '报损出库用于处理物资报损的出库操作，支持普通物资和展会物资。',
  sections: [
    {
      heading: '新增报损出库单',
      items: [
        '点击"新增报损单"按钮打开新增弹窗',
        '选择是否展会物资（是则需选择展会名称）',
        '选择仓库，填写操作员信息',
        '点击"选择物资"按钮，选择需要报损的物资',
        '填写报损数量、单价等信息',
        '填写报损原因',
        '点击"保存并提交"提交报损单，状态为已提交'
      ]
    },
    {
      heading: '确认出库',
      items: [
        '已提交状态的报损单可点击"确认出库"完成出库',
        '确认出库后库存扣减，按FIFO原则消耗批次库存',
        '同步生成库存流水记录',
        '确认出库后单据状态更新为已出库，不可修改'
      ]
    },
    {
      heading: '其他操作',
      items: [
        '查看：查看报损单详细信息及物资明细',
        '编辑：待提交状态可修改报损单信息',
        '删除：待提交状态可删除报损单',
        '打印：报损单生成后即可打印，与状态无关'
      ]
    }
  ]
};

export default function DamagedOutboundPage() {
  const damagedRecords = useStore((s) => s.damagedRecords);
  const addDamagedRecord = useStore((s) => s.addDamagedRecord);
  const updateDamagedRecord = useStore((s) => s.updateDamagedRecord);
  const deleteDamagedRecord = useStore((s) => s.deleteDamagedRecord);
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);
  const procurementPlans = useStore((s) => s.procurementPlans);
  const reverseDamagedRecord = useStore((s) => s.reverseDamagedRecord);

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return damagedRecords.filter((o) => {
      if (applied.no && !o.recordNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [damagedRecords, applied]);

  const statusText = (s: string) => (s === 'confirmed' ? '已出库' : s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) => (s === 'confirmed' ? 'text-[#67c23a]' : s === 'submitted' ? 'text-[#409eff]' : 'text-[#e6a23c]');

  const columns: ColumnDef<DamagedRecord>[] = [
    { key: 'recordNo', title: '报损单号' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => (row as any).details?.reduce((a: number, b: any) => a + (b.quantity || 0), 0) || row.quantity,
    },
    {
      key: 'amount',
      title: '金额',
      align: 'right',
      render: (row) => (row as any).details?.reduce((a: number, b: any) => a + (b.amount || 0), 0) || row.amount,
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'operator', title: '操作员' },
    { key: 'createTime', title: '创建时间' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => { setViewItem(null); setPrintItem(row); setPrintTrigger(prev => prev + 1); }}>
            <Printer size={12} /> 打印
          </TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除报损单 ${row.recordNo}？`)) deleteDamagedRecord(row.id);
                }}
              >删除</TextButton>
            </>
          )}
          {row.status === 'submitted' && (
            <TextButton onClick={() => handleConfirm(row.id)}>确认出库</TextButton>
          )}
          {['submitted', 'confirmed'].includes(row.status) && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const handleReverseConfirm = (id: string) => {
    const record = damagedRecords.find((r) => r.id === id);
    if (!record) return;
    if (!confirm(`确认反确认报损单 ${record.recordNo}？反确认后单据将回退到可编辑状态，库存将恢复，且会生成冲销流水记录。`)) return;

    const result = reverseDamagedRecord(id);
    if (result.success) {
      alert(result.message);
    } else {
      alert('反确认失败：' + result.message);
    }
  };

  const [viewItem, setViewItem] = useState<DamagedRecord | null>(null);
  const [printItem, setPrintItem] = useState<DamagedRecord | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);
  const [editItem, setEditItem] = useState<any>(null);
  const [editDetails, setEditDetails] = useState<DamagedDetail[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editWarehouseId, setEditWarehouseId] = useState('');
  const [isExhibitionGoods, setIsExhibitionGoods] = useState(false);
  const [editExhibitionId, setEditExhibitionId] = useState('');

  const openAdd = () => {
    const newItem = {
      id: 'DM' + Date.now(),
      recordNo: generateDamagedRecordNo(),
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      reason: '',
      status: 'pending' as const,
      operator: '',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setIsNew(true);
    setEditItem(newItem);
    setEditDetails([]);
    setEditWarehouseId(newItem.warehouseId);
    setIsExhibitionGoods(false);
    setEditExhibitionId('');
  };

  const openEdit = (row: DamagedRecord) => {
    setIsNew(false);
    setEditItem({ ...row });
    setEditWarehouseId(row.warehouseId);
    setIsExhibitionGoods((row as any).isExhibitionGoods || false);
    setEditExhibitionId((row as any).exhibitionId || '');
    const details = (row as any).details || [{
      id: 'DD' + Date.now(),
      productId: row.productId,
      productCode: row.productCode,
      productName: row.productName,
      positionId: row.positionId,
      positionName: row.positionName,
      quantity: row.quantity,
      unit: products.find(p => p.id === row.productId)?.unit || '件',
      amount: row.amount,
    }];
    setEditDetails(details);
  };

  const handlePickerConfirm = (selected: any[]) => {
    const existingIds = new Set(editDetails.map((d) => d.productId));
    const added = selected
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({
        id: 'DD' + Date.now() + Math.random().toString(36).slice(2, 5),
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        specification: p.specification,
        unit: p.unit,
        positionId: '',
        positionName: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      }));
    setEditDetails([...editDetails, ...added]);
    setPickerOpen(false);
  };

  const updateDetail = (idx: number, field: string, value: string | number) => {
    const newDetails = [...editDetails];
    (newDetails[idx] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = Number(newDetails[idx].quantity) || 0;
      const price = Number(newDetails[idx].unitPrice) || 0;
      newDetails[idx].amount = qty * price;
    }
    setEditDetails(newDetails);
  };

  const removeDetail = (idx: number) => {
    setEditDetails(editDetails.filter((_, i) => i !== idx));
  };

  // 确认出库：真正扣减库存
  const handleConfirm = (id: string) => {
    const record = damagedRecords.find((r) => r.id === id);
    if (!record) return;
    if (record.status !== 'submitted') return;
    if (!confirm(`确认出库 ${record.recordNo}？确认后将扣减库存，不可撤销。`)) return;

    const completeTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const details = (record as any).details || [];
    const defaultPos = positions.find((p: any) => p.warehouseId === record.warehouseId);

    details.forEach((d: DamagedDetail) => {
      const productId = d.productId;
      const warehouseId = record.warehouseId;
      const quantity = d.quantity;
      const posId = d.positionId || defaultPos?.id || '';
      const posName = d.positionName || defaultPos?.name || '';

      let remaining = quantity;
      const productBatches = batchInventories
        .filter((b) => b.productId === productId && b.warehouseId === warehouseId && b.quantity > 0)
        .sort((a: any, b: any) => a.inboundTime.localeCompare(b.inboundTime));

      for (const batch of productBatches) {
        if (remaining <= 0) break;

        const deduct = Math.min(batch.quantity, remaining);
        updateBatchInventory(batch.id, { quantity: batch.quantity - deduct });

        addStockTransaction({
          id: 'ST' + Date.now() + Math.random().toString(36).slice(2, 7),
          transactionNo: generateStockTransactionNo(),
          transactionTime: completeTime,
          transactionType: 'outbound' as any,
          productId: productId,
          productCode: d.productCode,
          productName: d.productName,
          warehouseId: warehouseId,
          warehouseName: record.warehouseName || '',
          positionId: posId,
          positionName: posName,
          quantity: -deduct,
          sourceOrderId: record.id,
          sourceOrderNo: record.recordNo,
          sourceType: '报损出库',
          batchNo: batch.batchNo,
          operator: record.operator || '',
          remark: record.reason || '报损出库',
        });

        remaining -= deduct;
      }
    });

    updateDamagedRecord(id, { ...record, status: 'confirmed' as any });
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.operator) { alert('请填写操作员'); return; }
    if (editDetails.length === 0) { alert('请添加至少一条产品明细'); return; }
    if (editDetails.some((d) => !d.quantity || d.quantity <= 0)) { alert('报损数量必须大于 0'); return; }
    if (isExhibitionGoods && !editExhibitionId) { alert('请选择展会名称'); return; }

    const totalQty = editDetails.reduce((a, b) => a + b.quantity, 0);
    const totalAmount = editDetails.reduce((a, b) => a + (b.amount || 0), 0);

    const updatedRecord = {
      ...editItem,
      warehouseId: editWarehouseId,
      warehouseName: warehouses.find((w: any) => w.id === editWarehouseId)?.name || '',
      quantity: totalQty,
      amount: totalAmount,
      details: editDetails,
      productId: editDetails[0]?.productId || '',
      productCode: editDetails[0]?.productCode || '',
      productName: editDetails[0]?.productName || '',
      positionId: editDetails[0]?.positionId || '',
      positionName: editDetails[0]?.positionName || '',
      isExhibitionGoods,
      exhibitionId: editExhibitionId,
      exhibitionName: exhibitionProjects.find((p) => p.id === editExhibitionId)?.projectName || '',
    };

    if (isNew) {
      addDamagedRecord({ ...updatedRecord, status: 'submitted' });
    } else {
      updateDamagedRecord(editItem.id, { ...updatedRecord, status: 'submitted' });
    }
    setEditItem(null);
  };

  const totalQuantity = editDetails.reduce((a, b) => a + b.quantity, 0);
  const totalAmount = editDetails.reduce((a, b) => a + (b.amount || 0), 0);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">报损出库</h2>
        <div className="flex gap-2">
          <FeatureHelpButton content={helpContent} />
          <PrimaryButton onClick={openAdd}>+ 新增报损单</PrimaryButton>
        </div>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, status: filterStatus, from: filterFrom, to: filterTo })}
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({ no: '', status: '', from: '', to: '' });
        }}
      >
        <SearchField label="报损单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
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
            <option value="confirmed">已出库</option>
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal open={!!viewItem} title="报损单详情" onClose={() => setViewItem(null)} width="max-w-[900px]">
        {viewItem && (
          <>
            <div className="grid grid-cols-3 gap-y-2 text-xs mb-3 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">报损单号：</div>
              <div className="text-[#303133]">{viewItem.recordNo}</div>
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
              <div className="text-[#606266]">是否展会物资：</div>
              <div className="text-[#303133]">{(viewItem as any).isExhibitionGoods ? '是' : '否'}</div>
              <div />
              {(viewItem as any).isExhibitionGoods && (
                <>
                  <div className="text-[#606266]">展会名称：</div>
                  <div className="text-[#303133]">{(viewItem as any).exhibitionName || '-'}</div>
                  <div />
                </>
              )}
            </div>
            <div className="text-xs font-medium text-[#303133] mb-2">产品明细</div>
            <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-2 py-2 text-left">物资编码</th>
                  <th className="px-2 py-2 text-left">物资名称</th>
                  <th className="px-2 py-2 text-left">规格型号</th>
                  <th className="px-2 py-2 text-left">单位</th>
                  <th className="px-2 py-2 text-right">数量</th>
                  <th className="px-2 py-2 text-right">单价</th>
                  <th className="px-2 py-2 text-right">金额</th>
                </tr>
              </thead>
              <tbody>
                {(viewItem as any).details?.length ? (
                  (viewItem as any).details.map((d: any, i: number) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.unit || '-'}</td>
                      <td className="px-2 py-2 text-right text-[#303133]">{d.quantity}</td>
                      <td className="px-2 py-2 text-right text-[#303133]">{d.unitPrice || 0}</td>
                      <td className="px-2 py-2 text-right text-[#303133]">{d.amount || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-2 py-2 text-[#303133]">{viewItem.productCode}</td>
                    <td className="px-2 py-2 text-[#303133]">{viewItem.productName}</td>
                    <td className="px-2 py-2 text-[#303133]">-</td>
                    <td className="px-2 py-2 text-[#303133]">件</td>
                    <td className="px-2 py-2 text-right text-[#303133]">{viewItem.quantity}</td>
                    <td className="px-2 py-2 text-right text-[#303133]">-</td>
                    <td className="px-2 py-2 text-right text-[#303133]">{viewItem.amount}</td>
                  </tr>
                )}
                <tr className="bg-[#f5f7fa] font-semibold border-t border-[#ebeef5]">
                  <td className="px-2 py-2" colSpan={4}>合计</td>
                  <td className="px-2 py-2 text-right">
                    {(viewItem as any).details?.reduce((a: number, b: any) => a + (b.quantity || 0), 0) || viewItem.quantity}
                  </td>
                  <td className="px-2 py-2" />
                  <td className="px-2 py-2 text-right">
                    {(viewItem as any).details?.reduce((a: number, b: any) => a + (b.amount || 0), 0) || viewItem.amount}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-xs">
              <div className="text-[#606266]">报损原因：</div>
              <div className="text-[#303133] mt-1">{viewItem.reason}</div>
            </div>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      <Modal
        open={!!editItem}
        title={isNew ? '新增报损单' : '编辑报损单'}
        onClose={() => setEditItem(null)}
        width="max-w-[1000px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">报损单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.recordNo}
                  onChange={(e) => setEditItem({ ...editItem, recordNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">仓库</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editWarehouseId}
                  onChange={(e) => {
                    const wh = warehouses.find((w) => w.id === e.target.value);
                    setEditWarehouseId(e.target.value);
                    setEditItem({ ...editItem, warehouseId: e.target.value, warehouseName: wh?.name });
                  }}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">操作员</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.operator}
                  onChange={(e) => setEditItem({ ...editItem, operator: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">是否展会物资</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={isExhibitionGoods ? 'yes' : 'no'}
                  onChange={(e) => {
                    const val = e.target.value === 'yes';
                    setIsExhibitionGoods(val);
                    if (!val) setEditExhibitionId('');
                  }}
                >
                  <option value="no">否</option>
                  <option value="yes">是</option>
                </select>
              </div>
              {isExhibitionGoods && (
                <div>
                  <div className="mb-1 text-[#606266]"><span className="text-[#f56c6c]">*</span>展会名称</div>
                  <select
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editExhibitionId}
                    onChange={(e) => setEditExhibitionId(e.target.value)}
                  >
                    <option value="">请选择展会</option>
                    {exhibitionProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.projectName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-[#303133]">
                  产品明细{' '}
                  <span className="text-[#909399] font-normal">
                    （共 {editDetails.length} 种，合计 {totalQuantity} 件，¥{totalAmount}）
                  </span>
                </div>
                <DefaultButton onClick={() => setPickerOpen(true)}>+ 选择物资</DefaultButton>
              </div>
              <div className="border border-[#ebeef5] rounded overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#f5f7fa] text-[#606266]">
                      <th className="px-2 py-2 text-left">物资编码</th>
                      <th className="px-2 py-2 text-left">物资名称</th>
                      <th className="px-2 py-2 text-left">规格型号</th>
                      <th className="px-2 py-2 text-left">单位</th>
                      <th className="px-2 py-2 text-right">数量</th>
                      <th className="px-2 py-2 text-right">单价</th>
                      <th className="px-2 py-2 text-right">金额</th>
                      <th className="px-2 py-2 text-center w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editDetails.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-[#909399]">
                          暂无明细，请点击"筛选物资"添加
                        </td>
                      </tr>
                    ) : (
                      editDetails.map((d, i) => (
                        <tr key={d.id} className="border-t border-[#f0f2f5]">
                          <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.specification || '-'}</td>
                          <td className="px-2 py-2 text-[#303133]">{d.unit}</td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              className="w-20 h-7 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                              value={d.quantity}
                              onChange={(e) => updateDetail(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              className="w-20 h-7 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                              value={d.unitPrice || 0}
                              onChange={(e) => updateDetail(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-2 py-2 text-right text-[#303133]">{d.amount || 0}</td>
                          <td className="px-2 py-2 text-center">
                            <TextButton type="danger" onClick={() => removeDetail(i)}>删除</TextButton>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[#606266]">报损原因</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={3}
                value={editItem.reason}
                onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSave}>保存并提交</PrimaryButton>
        </div>
      </Modal>

      <ProductPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        title="选择物资"
        showStockQty={true}
        warehouseId={editWarehouseId}
        onlyStocked={true}
      />

      {/* 打印组件 */}
      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="报损单"
          orderNo={printItem.recordNo}
          orderDate={printItem.createTime.slice(0, 10)}
          operator={printItem.operator || ''}
          warehouseName={printItem.warehouseName || ''}
          remark={printItem.reason || ''}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '物资编码' },
            { key: 'productName', label: '物资名称' },
            { key: 'specification', label: '规格型号' },
            { key: 'unit', label: '单位' },
            { key: 'quantity', label: '数量', align: 'right' },
          ]}
          details={(printItem as any).details?.map((d: DamagedDetail) => ({
            productCode: d.productCode,
            productName: d.productName,
            specification: d.specification || '',
            unit: d.unit,
            quantity: d.quantity,
          })) || [{
            productCode: printItem.productCode,
            productName: printItem.productName,
            specification: '',
            unit: products.find(p => p.id === printItem.productId)?.unit || '件',
            quantity: printItem.quantity,
          }]}
        />
      )}
    </div>
  );
}
