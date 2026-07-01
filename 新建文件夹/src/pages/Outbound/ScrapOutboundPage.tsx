import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ScrappedRecord } from '@/types';

export default function ScrapOutboundPage() {
  const scrappedRecords = useStore((s) => s.scrappedRecords);
  const addScrappedRecord = useStore((s) => s.addScrappedRecord);
  const updateScrappedRecord = useStore((s) => s.updateScrappedRecord);
  const deleteScrappedRecord = useStore((s) => s.deleteScrappedRecord);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);

  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '', from: '', to: '' });

  const filteredData = useMemo(() => {
    return scrappedRecords.filter((o) => {
      if (applied.no && !o.recordNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [scrappedRecords, applied]);

  const statusText = (s: string) => (s === 'submitted' ? '已提交' : '待提交');
  const statusColor = (s: string) => (s === 'submitted' ? 'text-[#67c23a]' : 'text-[#e6a23c]');

  const columns: ColumnDef<ScrappedRecord>[] = [
    { key: 'recordNo', title: '报废单号' },
    { key: 'warehouseName', title: '仓库' },
    { key: 'positionName', title: '仓位' },
    { key: 'productName', title: '产品名称', render: (row) => (row as any).productName || '-' },
    { key: 'scrapQuantity', title: '数量', align: 'right', render: (row) => row.scrapQuantity },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'operator', title: '操作员' },
    { key: 'createTime', title: '创建时间' },
    { key: 'reason', title: '原因', render: (row) => row.reason || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  setEditItem({ ...row });
                }}
              >
                编辑
              </TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除报废单 ${row.recordNo}？`)) deleteScrappedRecord(row.id);
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

  const [viewItem, setViewItem] = useState<ScrappedRecord | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  const openAdd = () => {
    const newItem = {
      id: 'SC' + Date.now(),
      recordNo: 'BF' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '000',
      assetEquipmentId: '',
      assetCode: '',
      assetName: '',
      warehouseId: warehouses[0]?.id || '',
      warehouseName: warehouses[0]?.name || '',
      positionId: positions[0]?.id || '',
      positionName: positions[0]?.name || '',
      storageLocation: '',
      amount: 0,
      scrapType: 'full' as const,
      scrapQuantity: 1,
      originalQuantity: 1,
      reason: '',
      status: 'pending' as const,
      operator: '',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setIsNew(true);
    setEditItem(newItem);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">报废出库</h2>
        <PrimaryButton onClick={openAdd}>+ 新增报废单</PrimaryButton>
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
        <SearchField label="报废单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
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

      <Modal open={!!viewItem} title="报废单详情" onClose={() => setViewItem(null)} width="max-w-[700px]">
        {viewItem && (
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="text-[#606266]">报废单号：</div>
            <div className="text-[#303133]">{viewItem.recordNo}</div>
            <div className="text-[#606266]">仓库：</div>
            <div className="text-[#303133]">{viewItem.warehouseName}</div>
            <div className="text-[#606266]">仓位：</div>
            <div className="text-[#303133]">{viewItem.positionName}</div>
            <div className="text-[#606266]">资产：</div>
            <div className="text-[#303133]">{viewItem.assetCode} - {viewItem.assetName}</div>
            <div className="text-[#606266]">数量：</div>
            <div className="text-[#303133]">{viewItem.scrapQuantity}</div>
            <div className="text-[#606266]">金额：</div>
            <div className="text-[#303133]">{viewItem.amount}</div>
            <div className="text-[#606266]">状态：</div>
            <div className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</div>
            <div className="text-[#606266]">操作员：</div>
            <div className="text-[#303133]">{viewItem.operator}</div>
            <div className="text-[#606266]">原因：</div>
            <div className="text-[#303133]">{viewItem.reason}</div>
            <div className="text-[#606266]">创建时间：</div>
            <div className="text-[#303133]">{viewItem.createTime}</div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      <Modal
        open={!!editItem}
        title={isNew ? '新增报废单' : '编辑报废单'}
        onClose={() => setEditItem(null)}
        width="max-w-[800px]"
      >
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">报废单号</div>
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
                <div className="mb-1 text-[#606266]">仓位</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.positionId}
                  onChange={(e) => {
                    const p = positions.find((x) => x.id === e.target.value);
                    setEditItem({ ...editItem, positionId: e.target.value, positionName: p?.name });
                  }}
                >
                  {positions
                    .filter((p) => !editItem?.warehouseId || p.warehouseId === editItem.warehouseId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">产品</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.assetEquipmentId || ''}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    setEditItem({
                      ...editItem,
                      assetEquipmentId: e.target.value,
                      assetCode: p?.code,
                      assetName: p?.name,
                    });
                  }}
                >
                  <option value="">请选择</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">数量</div>
                <input
                  type="number"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.scrapQuantity}
                  onChange={(e) => setEditItem({ ...editItem, scrapQuantity: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">操作员</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.operator}
                  onChange={(e) => setEditItem({ ...editItem, operator: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">报废原因</div>
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
          <PrimaryButton
            onClick={() => {
              if (!editItem) return;
              if (!editItem.operator) {
                alert('请填写操作员');
                return;
              }
              if (isNew) addScrappedRecord({ ...editItem, status: 'submitted' });
              else updateScrappedRecord(editItem.id, { ...editItem, status: 'submitted' });
              setEditItem(null);
            }}
          >保存并提交</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
