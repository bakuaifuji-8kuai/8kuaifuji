import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import PrintDocument from '@/components/common/PrintDocument';
import { useStore } from '@/store/useStore';
import type { ReturnOrder } from '@/types';
import { Printer } from 'lucide-react';

export default function ReturnPage() {
  const returnOrders = useStore((s) => s.returnOrders);
  const addReturnOrder = useStore((s) => s.addReturnOrder);
  const updateReturnOrder = useStore((s) => s.updateReturnOrder);
  const deleteReturnOrder = useStore((s) => s.deleteReturnOrder);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return returnOrders.filter((o) => {
      if (applied.no && !o.orderNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [returnOrders, applied]);

  const statusText = (s: string) => (s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) => (s === 'submitted' ? 'text-[#67c23a]' : 'text-[#e6a23c]');

  const columns: ColumnDef<ReturnOrder>[] = [
    { key: 'orderNo', title: '退库单号' },
    { key: 'warehouseName', title: '仓库' },
    {
      key: 'positions',
      title: '仓位',
      render: (row) => Array.from(new Set(row.details.map((d: any) => d.positionName).filter(Boolean))).join(',') || '-',
    },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => row.details.reduce((a: number, b: any) => a + (b.quantity || 0), 0),
    },
    { key: 'operator', title: '操作员', render: (row) => row.operator || '-' },
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
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          {row.status === 'submitted' && (
            <TextButton onClick={() => setPrintItem(row)}>
              <Printer size={12} /> 打印
            </TextButton>
          )}
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  setEditItem(JSON.parse(JSON.stringify(row)));
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
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<ReturnOrder | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [printItem, setPrintItem] = useState<ReturnOrder | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    const newOrder: any = {
      id: 'RT' + Date.now(),
      orderNo: 'TK' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '000',
      type: 'return',
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      operator: '',
      status: 'pending',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
    };
    setIsNew(true);
    setEditItem(newOrder);
  };

  const addDetail = () => {
    if (!editItem) return;
    const d = {
      id: 'D' + Date.now() + Math.random(),
      returnOrderId: editItem.id,
      productId: products[0]?.id || '',
      productCode: products[0]?.code || '',
      productName: products[0]?.name || '',
      positionId: positions[0]?.id || '',
      positionName: positions[0]?.name || '',
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      quantity: 0,
    };
    setEditItem({ ...editItem, details: [...editItem.details, d] });
  };

  const updateDetail = (idx: number, field: string, value: string | number) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    newDetails[idx][field] = value;
    if (field === 'productId') {
      const p = products.find((x) => x.id === value);
      newDetails[idx].productCode = p?.code || '';
      newDetails[idx].productName = p?.name || '';
    }
    if (field === 'positionId') {
      const p = positions.find((x) => x.id === value);
      newDetails[idx].positionName = p?.name || '';
    }
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">归还退库</h2>
        <PrimaryButton onClick={openAdd}>+ 新增退库单</PrimaryButton>
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
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal open={!!viewItem} title="退库单详情" onClose={() => setViewItem(null)} width="max-w-[900px]">
        {viewItem && (
          <>
            <div className="grid grid-cols-3 gap-y-2 text-xs mb-3 p-3 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">退库单号：</div>
              <div className="text-[#303133]">{viewItem.orderNo}</div>
              <div />
              <div className="text-[#606266]">仓库：</div>
              <div className="text-[#303133]">{viewItem.warehouseName}</div>
              <div />
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</div>
              <div />
              <div className="text-[#606266]">操作员：</div>
              <div className="text-[#303133]">{viewItem.operator || '-'}</div>
              <div />
            </div>
            <div className="text-xs font-medium text-[#303133] mb-2">产品明细</div>
            <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-2 py-2 text-left">物资编码</th>
                  <th className="px-2 py-2 text-left">物资名称</th>
                  <th className="px-2 py-2 text-left">仓位</th>
                  <th className="px-2 py-2 text-right">数量</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.details.length ? (
                  viewItem.details.map((d: any, i: number) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-2 text-[#303133]">{d.productCode}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.productName}</td>
                      <td className="px-2 py-2 text-[#303133]">{d.positionName}</td>
                      <td className="px-2 py-2 text-right text-[#303133]">{d.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-6 text-center text-[#909399]">无明细</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {/* 打印组件 */}
      {printItem && (
        <PrintDocument
          autoPrint
          title="退库单"
          orderNo={printItem.orderNo}
          orderDate={printItem.createTime}
          operator={printItem.operator || ''}
          warehouseName={printItem.warehouseName || ''}
          details={printItem.details.map((d: any) => ({
            productCode: d.productCode,
            productName: d.productName,
            positionName: d.positionName,
            quantity: d.quantity,
          }))}
        />
      )}

      <Modal
        open={!!editItem}
        title={isNew ? '新增退库单' : '编辑退库单'}
        onClose={() => setEditItem(null)}
        width="max-w-[1000px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
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
                <div className="mb-1 text-[#606266]">仓库</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.warehouseId}
                  onChange={(e) => {
                    const wh = warehouses.find((w) => w.id === e.target.value);
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
                  placeholder="请输入操作员"
                  value={editItem.operator || ''}
                  onChange={(e) => setEditItem({ ...editItem, operator: e.target.value })}
                />
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
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium text-[#303133]">产品明细</div>
              <DefaultButton onClick={addDetail}>+ 添加产品</DefaultButton>
            </div>
            <table className="w-full text-xs border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-2 py-2 text-left">物资</th>
                  <th className="px-2 py-2 text-left">仓位</th>
                  <th className="px-2 py-2 text-right">数量</th>
                  <th className="px-2 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {editItem.details.length ? (
                  editItem.details.map((d: any, i: number) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-2">
                        <select
                          className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                          value={d.productId}
                          onChange={(e) => updateDetail(i, 'productId', e.target.value)}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                          value={d.positionId}
                          onChange={(e) => updateDetail(i, 'positionId', e.target.value)}
                        >
                          {positions
                            .filter((p) => !editItem?.warehouseId || p.warehouseId === editItem.warehouseId)
                            .map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
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
                  <tr><td colSpan={4} className="py-6 text-center text-[#909399]">暂无明细</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <PrimaryButton
            onClick={() => {
              if (!editItem) return;
              if (!editItem.operator) {
                alert('请填写操作员');
                return;
              }
              if (isNew) addReturnOrder({ ...editItem, status: 'submitted' });
              else updateReturnOrder(editItem.id, { ...editItem, status: 'submitted' });
              setEditItem(null);
            }}
          >保存并提交</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
