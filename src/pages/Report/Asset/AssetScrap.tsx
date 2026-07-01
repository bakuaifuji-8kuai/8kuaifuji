import { useMemo, useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { Plus, Trash2, Clock, CheckCircle2, DollarSign, Printer, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { AssetEquipment } from '@/types';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface AssetScrap {
  id: string;
  scrapNo: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  originalValue: number;
  scrapType: 'full' | 'partial';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  remark: string;
  applicant: string;
  applyDate: string;
  approver?: string;
  approveTime?: string;
  approveRemark?: string;
  outConfirmer?: string;
  outConfirmTime?: string;
  warehouseId: string;
  warehouseName: string;
}

const generateScrapNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCBF${dateStr}${random}`;
};

const initialData: AssetScrap[] = [
  {
    id: 'AS001',
    scrapNo: 'ZCBF20240601001',
    assetId: 'AE001',
    assetCode: 'SB20240001',
    assetName: '数控车床',
    specification: 'CJK6136',
    unit: '台',
    quantity: 1,
    originalValue: 150000,
    scrapType: 'full',
    status: 'pending',
    reason: '设备老化，无法正常使用',
    remark: '使用年限已达8年',
    applicant: '张三',
    applyDate: '2024-06-01 09:30',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
  {
    id: 'AS002',
    scrapNo: 'ZCBF20240602001',
    assetId: 'AE002',
    assetCode: 'SB20240002',
    assetName: '铣床',
    specification: 'X5032',
    unit: '台',
    quantity: 1,
    originalValue: 85000,
    scrapType: 'partial',
    status: 'approved',
    reason: '损坏严重，无法修复',
    remark: '运输途中损坏',
    applicant: '李四',
    applyDate: '2024-06-02 14:20',
    approver: '王经理',
    approveTime: '2024-06-03 10:00',
    approveRemark: '同意报废',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
  {
    id: 'AS003',
    scrapNo: 'ZCBF20240603001',
    assetId: 'AE005',
    assetCode: 'SB20240005',
    assetName: '叉车',
    specification: 'CPCD30',
    unit: '辆',
    quantity: 1,
    originalValue: 68000,
    scrapType: 'full',
    status: 'rejected',
    reason: '外观老旧',
    remark: '想更换新的',
    applicant: '王五',
    applyDate: '2024-06-03 10:00',
    approver: '王经理',
    approveTime: '2024-06-03 15:30',
    approveRemark: '可以继续使用，不同意报废',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
  {
    id: 'AS004',
    scrapNo: 'ZCBF20240605001',
    assetId: 'AE007',
    assetCode: 'SB20240007',
    assetName: '钻床',
    specification: 'Z516',
    unit: '台',
    quantity: 1,
    originalValue: 12000,
    scrapType: 'full',
    status: 'approved',
    reason: '主轴损坏，维修成本过高',
    remark: '维修需要8000元，建议报废',
    applicant: '张三',
    applyDate: '2024-06-05 11:00',
    approver: '李总监',
    approveTime: '2024-06-06 09:00',
    approveRemark: '同意报废处理',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
];

export default function AssetScrap() {
  const { assetEquipments, updateAssetEquipment, warehouses } = useStore();
  const [data, setData] = useState<AssetScrap[]>(initialData);

  const [filterNo, setFilterNo] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({
    no: '',
    assetName: '',
    status: '',
    from: '',
    to: '',
  });

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (applied.no && !o.scrapNo.includes(applied.no)) return false;
      if (applied.assetName && !o.assetName.includes(applied.assetName)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.applyDate < applied.from) return false;
      if (applied.to && o.applyDate > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [data, applied]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthCount = data.filter((d) => d.applyDate.startsWith(monthStr)).length;
    const pendingCount = data.filter((d) => d.status === 'pending').length;
    const approvedCount = data.filter((d) => d.status === 'approved').length;
    const totalAmount = data
      .filter((d) => d.status === 'approved')
      .reduce((sum, d) => sum + d.originalValue, 0);
    return { monthCount, pendingCount, approvedCount, totalAmount };
  }, [data]);

  const fixedAssetWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.category === 'fixed_asset' && w.status === 'enabled');
  }, [warehouses]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const inUseAssets = useMemo(() => {
    return assetEquipments.filter((a) => {
      if (a.status !== 'in_use') return false;
      if (selectedWarehouseId && a.warehouseId !== selectedWarehouseId) return false;
      return true;
    });
  }, [assetEquipments, selectedWarehouseId]);

  const [assetFilterCode, setAssetFilterCode] = useState('');
  const [assetFilterName, setAssetFilterName] = useState('');
  const [assetFilterSpec, setAssetFilterSpec] = useState('');

  const filteredAssets = useMemo(() => {
    return inUseAssets.filter((a) => {
      if (assetFilterCode && !a.code.toLowerCase().includes(assetFilterCode.toLowerCase())) return false;
      if (assetFilterName && !a.name.toLowerCase().includes(assetFilterName)) return false;
      if (assetFilterSpec && !a.specification.toLowerCase().includes(assetFilterSpec.toLowerCase())) return false;
      return true;
    });
  }, [inUseAssets, assetFilterCode, assetFilterName, assetFilterSpec]);

  useEffect(() => {
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  }, [fixedAssetWarehouses]);

  const statusText = (s: string) => {
    if (s === 'pending') return '待出库';
    if (s === 'approved') return '已出库';
    if (s === 'rejected') return '已驳回';
    return s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-[#e6a23c]';
    if (s === 'approved') return 'text-[#67c23a]';
    if (s === 'rejected') return 'text-[#f56c6c]';
    return '';
  };

  const scrapTypeText = (t: string) => {
    return t === 'full' ? '全部报废' : '部分报废';
  };

  const columns: ColumnDef<AssetScrap>[] = [
    { key: 'scrapNo', title: '报废单号' },
    { key: 'assetName', title: '资产名称' },
    { key: 'specification', title: '规格型号' },
    { key: 'quantity', title: '数量', align: 'right' },
    {
      key: 'originalValue',
      title: '原值',
      align: 'right',
      render: (row) => `¥${row.originalValue.toLocaleString()}`,
    },
    {
      key: 'scrapType',
      title: '报废类型',
      render: (row) => scrapTypeText(row.scrapType),
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'applyDate', title: '申请日期' },
    { key: 'warehouseName', title: '所在仓库' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => handlePrint(row)}>
            <Printer size={12} /> 打印
          </TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  const cloned = JSON.parse(JSON.stringify(row));
                  setEditItem(cloned);
                }}
              >
                编辑
              </TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.scrapNo}？`)) {
                    setData(data.filter((d) => d.id !== row.id));
                  }
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleOutConfirm(row.id)}>确认出库</TextButton>
              <TextButton type="danger" onClick={() => handleReject(row.id)}>
                驳回
              </TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<AssetScrap | null>(null);

  const [editItem, setEditItem] = useState<AssetScrap | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const openAdd = () => {
    const defaultWarehouseId = fixedAssetWarehouses.length === 1 ? fixedAssetWarehouses[0].id : '';
    const defaultWarehouseName = fixedAssetWarehouses.length === 1 ? fixedAssetWarehouses[0].name : '';
    const newItem: AssetScrap = {
      id: 'AS' + Date.now(),
      scrapNo: generateScrapNo(),
      assetId: '',
      assetCode: '',
      assetName: '',
      specification: '',
      unit: '台',
      quantity: 1,
      originalValue: 0,
      scrapType: 'full',
      status: 'pending',
      reason: '',
      remark: '',
      applicant: '当前用户',
      applyDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      warehouseId: defaultWarehouseId,
      warehouseName: defaultWarehouseName,
    };
    setIsNew(true);
    setEditItem(newItem);
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  };

  const handleSelectAsset = (asset: AssetEquipment) => {
    if (!editItem) return;
    const assetWarehouse = warehouses.find((w) => w.id === asset.warehouseId);
    setEditItem({
      ...editItem,
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      specification: asset.specification,
      unit: asset.unit,
      originalValue: asset.amount,
      warehouseId: asset.warehouseId || '',
      warehouseName: assetWarehouse?.name || '',
    });
    setAssetPickerOpen(false);
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.assetId) {
      alert('请选择资产');
      return;
    }
    if (!editItem.quantity || editItem.quantity <= 0) {
      alert('报废数量必须大于0');
      return;
    }
    if (!editItem.reason) {
      alert('请填写报废原因');
      return;
    }
    if (isNew) {
      setData([editItem, ...data]);
    } else {
      setData(data.map((d) => (d.id === editItem.id ? editItem : d)));
    }
    setEditItem(null);
  };

  const handleOutConfirm = (id: string) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (item.status !== 'pending') return;
    if (!confirm(`确认出库 ${item.scrapNo}？确认后单据状态将变更为已出库，资产状态将变更为已报废。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'approved',
              outConfirmer: '当前用户',
              outConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : d
      )
    );

    if (item.scrapType === 'full') {
      updateAssetEquipment(item.assetId, { status: 'scrapped' });
    }
  };

  const handleReject = (id: string) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (item.status !== 'pending') return;
    const remark = prompt('请输入驳回原因：');
    if (remark === null) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'rejected',
              approver: '当前用户',
              approveTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              approveRemark: remark,
            }
          : d
      )
    );
  };

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printItem, setPrintItem] = useState<AssetScrap | null>(null);

  const handlePrint = (row: AssetScrap) => {
    setViewItem(null);
    setPrintItem(row);
    setPrintTrigger((prev) => prev + 1);
  };

  const helpContent = {
    title: '资产报废功能说明',
    description: '资产报废用于对达到使用年限或无法修复的固定资产进行报废处理，确认出库后单据状态变更为已出库，资产状态变更为已报废。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增报废单"按钮',
          '选择要报废的资产（领用中的资产）',
          '选择报废类型（全部报废/部分报废）',
          '填写报废原因和备注后保存'
        ]
      },
      {
        heading: '出库流程',
        items: [
          '待出库状态的报废单，点击"确认出库"',
          '确认出库后单据状态变更为已出库，资产状态变更为已报废',
          '点击"驳回"可驳回报废申请，需填写驳回原因'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '报废单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印报废单'
        ]
      }
    ]
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">资产报废管理</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <PrimaryButton onClick={openAdd}>
          <Plus size={14} />
          新增报废单
        </PrimaryButton>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">本月报废</div>
              <div className="text-2xl font-bold text-[#303133]">{stats.monthCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fef0f0] flex items-center justify-center">
              <Trash2 className="text-[#f56c6c]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">待审核</div>
              <div className="text-2xl font-bold text-[#e6a23c]">{stats.pendingCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fdf6ec] flex items-center justify-center">
              <Clock className="text-[#e6a23c]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">已报废</div>
              <div className="text-2xl font-bold text-[#67c23a]">{stats.approvedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f0f9eb] flex items-center justify-center">
              <CheckCircle2 className="text-[#67c23a]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">报废金额</div>
              <div className="text-2xl font-bold text-[#409eff]">
                ¥{stats.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ecf5ff] flex items-center justify-center">
              <DollarSign className="text-[#409eff]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <SearchBar
        onSearch={() =>
          setApplied({
            no: filterNo,
            assetName: filterAssetName,
            status: filterStatus,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterNo('');
          setFilterAssetName('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setApplied({
            no: '',
            assetName: '',
            status: '',
            from: '',
            to: '',
          });
        }}
      >
        <SearchField label="报废单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="资产名称" placeholder="请输入" value={filterAssetName} onChange={setFilterAssetName} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#606266] whitespace-nowrap">状态：</span>
          <select
            className="w-[220px] h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部</option>
            <option value="pending">待出库</option>
            <option value="approved">已出库</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      {/* 数据表格 */}
      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* 查看弹窗 */}
      <Modal open={!!viewItem} title="报废单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">报废单号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.scrapNo}</div>
              <div className="text-[#606266]">资产名称：</div>
              <div className="text-[#303133] col-span-2">{viewItem.assetName}</div>
              <div className="text-[#606266]">规格型号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.specification}</div>
              <div className="text-[#606266]">数量：</div>
              <div className="text-[#303133] col-span-2">
                {viewItem.quantity} {viewItem.unit}
              </div>
              <div className="text-[#606266]">原值：</div>
              <div className="text-[#303133] col-span-2">¥{viewItem.originalValue.toLocaleString()}</div>
              <div className="text-[#606266]">报废类型：</div>
              <div className="text-[#303133] col-span-2">{scrapTypeText(viewItem.scrapType)}</div>
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status) + ' col-span-2'}>
                {statusText(viewItem.status)}
              </div>
              <div className="text-[#606266]">申请人：</div>
              <div className="text-[#303133] col-span-2">{viewItem.applicant}</div>
              <div className="text-[#606266]">申请日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.applyDate}</div>
              <div className="text-[#606266]">所在仓库：</div>
              <div className="text-[#303133] col-span-2">{viewItem.warehouseName || '-'}</div>
              {viewItem.outConfirmer && (
                <>
                  <div className="text-[#606266]">出库确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmer}</div>
                  <div className="text-[#606266]">出库确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmTime}</div>
                </>
              )}
              {viewItem.approver && (
                <>
                  <div className="text-[#606266]">审核人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.approver}</div>
                  <div className="text-[#606266]">审核时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.approveTime}</div>
                </>
              )}
            </div>
            <div className="text-sm">
              <div className="text-[#606266] mb-1">报废原因：</div>
              <div className="text-[#303133] p-3 bg-[#f5f7fa] rounded">{viewItem.reason}</div>
            </div>
            {viewItem.approveRemark && (
              <div className="text-sm">
                <div className="text-[#606266] mb-1">审核意见：</div>
                <div className="text-[#303133] p-3 bg-[#f5f7fa] rounded">{viewItem.approveRemark}</div>
              </div>
            )}
            {viewItem.remark && (
              <div className="text-sm">
                <span className="text-[#606266]">备注：</span>
                <span className="text-[#303133]">{viewItem.remark}</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {/* 编辑/新增弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增报废单' : '编辑报废单'}
        onClose={() => setEditItem(null)}
        width="max-w-[700px]"
      >
        {editItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-[#606266]">报废单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.scrapNo}
                  onChange={(e) => setEditItem({ ...editItem, scrapNo: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 资产名称
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133] cursor-pointer"
                    value={editItem.assetName || '请选择资产'}
                    onClick={() => setAssetPickerOpen(true)}
                  />
                  <DefaultButton onClick={() => setAssetPickerOpen(true)}>选择</DefaultButton>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">规格型号</div>
                <input
                  readOnly
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133]"
                  value={editItem.specification}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">原值</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#303133]">¥</span>
                  <input
                    readOnly
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133]"
                    value={editItem.originalValue.toLocaleString()}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 报废类型
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.scrapType}
                  onChange={(e) =>
                    setEditItem({ ...editItem, scrapType: e.target.value as 'full' | 'partial' })
                  }
                >
                  <option value="full">全部报废</option>
                  <option value="partial">部分报废</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 数量
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.quantity || ''}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                  <span className="text-[#606266]">{editItem.unit}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">
                <span className="text-[#f56c6c]">*</span> 报废原因
              </div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={3}
                value={editItem.reason}
                onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
                placeholder="请输入报废原因"
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={2}
                value={editItem.remark}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
                placeholder="请输入备注信息"
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
        </div>
      </Modal>

      {/* 资产选择弹窗 */}
      <Modal open={assetPickerOpen} title="选择资产" onClose={() => setAssetPickerOpen(false)} width="max-w-[900px]">
        <div className="space-y-3">
          {fixedAssetWarehouses.length > 1 && (
            <div className="flex items-center gap-2 pb-2 border-b border-[#ebeef5]">
              <span className="text-sm text-[#606266] whitespace-nowrap">所在仓库：</span>
              <select
                className="w-[200px] h-8 px-2 border border-[#dcdfe6] text-sm text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
              >
                <option value="">全部仓库</option>
                {fixedAssetWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" size={14} />
              <input
                className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-sm text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                placeholder="设备编码"
                value={assetFilterCode}
                onChange={(e) => setAssetFilterCode(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" size={14} />
              <input
                className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-sm text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                placeholder="设备名称"
                value={assetFilterName}
                onChange={(e) => setAssetFilterName(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c0c4cc]" size={14} />
              <input
                className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] text-sm text-[#303133] rounded focus:outline-none focus:border-[#2f54eb]"
                placeholder="规格型号"
                value={assetFilterSpec}
                onChange={(e) => setAssetFilterSpec(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f7fa] text-[#606266]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">设备编码</th>
                  <th className="px-3 py-2 text-left font-medium">设备名称</th>
                  <th className="px-3 py-2 text-left font-medium">规格型号</th>
                  <th className="px-3 py-2 text-left font-medium">单位</th>
                  <th className="px-3 py-2 text-right font-medium">原值</th>
                  <th className="px-3 py-2 text-left font-medium">所在仓库</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const assetWarehouse = warehouses.find((w) => w.id === asset.warehouseId);
                  return (
                    <tr
                      key={asset.id}
                      className="border-t border-[#ebeef5] cursor-pointer hover:bg-[#ecf5ff]"
                      onClick={() => handleSelectAsset(asset)}
                    >
                      <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                      <td className="px-3 py-2 text-[#606266]">{asset.specification}</td>
                      <td className="px-3 py-2 text-[#606266]">{asset.unit}</td>
                      <td className="px-3 py-2 text-right text-[#303133]">¥{asset.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[#606266]">{assetWarehouse?.name || '-'}</td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[#909399]">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="资产报废单"
          orderNo={printItem.scrapNo}
          orderType="资产报废"
          orderDate={printItem.applyDate.slice(0, 10)}
          warehouseName=""
          custodian={printItem.applicant}
          remark={printItem.remark}
          details={[
            {
              productCode: printItem.assetCode,
              productName: printItem.assetName,
              specification: printItem.specification,
              unit: printItem.unit,
              quantity: printItem.quantity,
              unitPrice: printItem.originalValue,
              amount: printItem.originalValue,
              remark: `报废类型：${scrapTypeText(printItem.scrapType)}，报废原因：${printItem.reason}`,
            },
          ]}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '设备编码' },
            { key: 'productName', label: '设备名称' },
            { key: 'specification', label: '规格型号' },
            { key: 'unit', label: '单位' },
            { key: 'quantity', label: '数量', align: 'right' },
            { key: 'unitPrice', label: '原值', align: 'right' },
            { key: 'remark', label: '备注' },
          ]}
        />
      )}
    </div>
  );
}
