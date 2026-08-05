import { useMemo, useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { ArrowRightLeft, Plus, Package, Clock, CheckCircle2, Printer, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { AssetEquipment, Employee } from '@/types';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { employees as allEmployees } from '@/mock/data';

interface AssetTransferDetail {
  id: string;
  assetTransferId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
}

interface AssetTransfer {
  id: string;
  transferNo: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  fromDepartment: string;
  toDepartment: string;
  warehouseId: string;
  warehouseName: string;
  status: 'pending' | 'out_confirmed' | 'completed' | 'cancelled';
  reason: string;
  remark: string;
  creator: string;
  createTime: string;
  outConfirmTime?: string;
  outConfirmer?: string;
  inConfirmTime?: string;
  inConfirmer?: string;
  inConfirmerEmployee?: string;
}

const departments = [
  '展览部',
  '市场部',
  '技术部',
  '行政部',
  '财务部',
  '生产部',
  '宣传部',
  '活动部',
];

const generateTransferNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCZY${dateStr}${random}`;
};

const initialData: AssetTransfer[] = [
  {
    id: 'AT001',
    transferNo: 'ZCZY20240601001',
    assetId: 'AE005',
    assetCode: 'SB20240005',
    assetName: '叉车',
    specification: 'CPCD30',
    unit: '辆',
    quantity: 1,
    fromDepartment: '展览部',
    toDepartment: '市场部',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
    status: 'pending',
    reason: '展会使用',
    remark: '6月10日展会需要',
    creator: '张三',
    createTime: '2024-06-01 09:30',
  },
  {
    id: 'AT002',
    transferNo: 'ZCZY20240602001',
    assetId: 'AE004',
    assetCode: 'SB20240004',
    assetName: '空压机',
    specification: 'GA37',
    unit: '台',
    quantity: 1,
    fromDepartment: '市场部',
    toDepartment: '技术部',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
    status: 'out_confirmed',
    reason: '项目借用',
    remark: '技术部项目需要',
    creator: '李四',
    createTime: '2024-06-02 14:20',
    outConfirmTime: '2024-06-02 15:00',
    outConfirmer: '王五',
  },
  {
    id: 'AT003',
    transferNo: 'ZCZY20240603001',
    assetId: 'AE007',
    assetCode: 'SB20240007',
    assetName: '钻床',
    specification: 'Z516',
    unit: '台',
    quantity: 1,
    fromDepartment: '生产部',
    toDepartment: '技术部',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
    status: 'completed',
    reason: '设备维修',
    remark: '',
    creator: '张三',
    createTime: '2024-06-03 10:00',
    outConfirmTime: '2024-06-03 11:00',
    outConfirmer: '王五',
    inConfirmTime: '2024-06-03 14:30',
    inConfirmer: '赵六',
  },
  {
    id: 'AT004',
    transferNo: 'ZCZY20240604001',
    assetId: 'AE001',
    assetCode: 'SB20240001',
    assetName: '数控车床',
    specification: 'CJK6136',
    unit: '台',
    quantity: 1,
    fromDepartment: '生产部',
    toDepartment: '行政部',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
    status: 'cancelled',
    reason: '维修',
    remark: '已安排维修，取消调拨',
    creator: '李四',
    createTime: '2024-06-04 08:45',
  },
];

export default function AssetTransfer() {
  const { assetEquipments, warehouses, updateAssetEquipment } = useStore();

  const [data, setData] = useState<AssetTransfer[]>(initialData);

  const [filterNo, setFilterNo] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterFromDepartment, setFilterFromDepartment] = useState('');
  const [filterToDepartment, setFilterToDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    no: '',
    assetName: '',
    fromDepartment: '',
    toDepartment: '',
    status: '',
    from: '',
    to: '',
  });

  // 固定资产仓库列表
  const fixedAssetWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.category === 'fixed_asset' && w.status === 'enabled');
  }, [warehouses]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  // 在仓资产列表
  const inUseAssets = useMemo(() => {
    let assets = assetEquipments.filter((a) => a.status === 'in_use');
    if (selectedWarehouseId) {
      assets = assets.filter((a) => a.warehouseId === selectedWarehouseId);
    }
    return assets;
  }, [assetEquipments, selectedWarehouseId]);

  // 资产筛选状态
  const [assetFilterCode, setAssetFilterCode] = useState('');
  const [assetFilterName, setAssetFilterName] = useState('');
  const [assetFilterSpec, setAssetFilterSpec] = useState('');

  // 筛选后的资产列表
  const filteredAssets = useMemo(() => {
    return inUseAssets.filter((a) => {
      if (assetFilterCode && !a.code.toLowerCase().includes(assetFilterCode.toLowerCase())) return false;
      if (assetFilterName && !a.name.toLowerCase().includes(assetFilterName.toLowerCase())) return false;
      if (assetFilterSpec && !a.specification?.toLowerCase().includes(assetFilterSpec.toLowerCase())) return false;
      return true;
    });
  }, [inUseAssets, assetFilterCode, assetFilterName, assetFilterSpec]);

  // 当只有一个固定资产仓库时，默认选中
  useEffect(() => {
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  }, [fixedAssetWarehouses]);

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (appliedFilter.no && !o.transferNo.includes(appliedFilter.no)) return false;
      if (appliedFilter.assetName && !o.assetName.includes(appliedFilter.assetName)) return false;
      if (appliedFilter.fromDepartment && o.fromDepartment !== appliedFilter.fromDepartment) return false;
      if (appliedFilter.toDepartment && o.toDepartment !== appliedFilter.toDepartment) return false;
      if (appliedFilter.status && o.status !== appliedFilter.status) return false;
      if (appliedFilter.from && o.createTime < appliedFilter.from) return false;
      if (appliedFilter.to && o.createTime > appliedFilter.to + ' 23:59:59') return false;
      return true;
    });
  }, [data, appliedFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthCount = data.filter((d) => d.createTime.startsWith(monthStr)).length;
    const pendingCount = data.filter((d) => d.status === 'pending').length;
    const outConfirmedCount = data.filter((d) => d.status === 'out_confirmed').length;
    const completedCount = data.filter((d) => d.status === 'completed').length;
    return { monthCount, pendingCount, outConfirmedCount, completedCount };
  }, [data]);

  const statusText = (s: string) => {
    if (s === 'pending') return '待调出部门确认';
    if (s === 'out_confirmed') return '已调出待调入';
    if (s === 'completed') return '已完成';
    if (s === 'cancelled') return '已取消';
    return s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-[#e6a23c]';
    if (s === 'out_confirmed') return 'text-[#409eff]';
    if (s === 'completed') return 'text-[#67c23a]';
    if (s === 'cancelled') return 'text-[#909399]';
    return '';
  };

  const columns: ColumnDef<AssetTransfer>[] = [
    { key: 'transferNo', title: '调拨单号' },
    { key: 'assetName', title: '资产名称' },
    { key: 'specification', title: '规格型号' },
    { key: 'quantity', title: '数量', align: 'right' },
    { key: 'fromDepartment', title: '调出部门' },
    { key: 'toDepartment', title: '调入部门' },
    { key: 'warehouseName', title: '所在仓库' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'createTime', title: '制单日期' },
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
                  if (confirm(`确认删除 ${row.transferNo}？`)) {
                    setData(data.filter((d) => d.id !== row.id));
                  }
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleOutConfirm(row.id)}>调出确认</TextButton>
            </>
          )}
          {row.status === 'out_confirmed' && (
            <>
              <TextButton onClick={() => handleInConfirm(row.id)}>调入确认</TextButton>
              <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
            </>
          )}
          {row.status === 'completed' && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const handleReverseConfirm = (id: string) => {
    const order = data.find((o) => o.id === id);
    if (!order) return;
    const statusText = order.status === 'out_confirmed' ? '调出确认' : '已完成';
    if (!confirm(`确认反确认调拨单 ${order.transferNo}（当前状态：${statusText}）？反确认后单据将回退到待调出状态。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'pending',
              outConfirmer: undefined,
              outConfirmTime: undefined,
              inConfirmer: undefined,
              inConfirmTime: undefined,
            }
          : d
      )
    );

    alert(`反确认成功！调拨单 ${order.transferNo} 已回退到待调出状态。`);
  };

  const [viewItem, setViewItem] = useState<AssetTransfer | null>(null);

  const [editItem, setEditItem] = useState<AssetTransfer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const openAdd = () => {
    const defaultWarehouse = fixedAssetWarehouses.find(w => w.id === selectedWarehouseId) || fixedAssetWarehouses[0];
    const newOrder: AssetTransfer = {
      id: 'AT' + Date.now(),
      transferNo: generateTransferNo(),
      assetId: '',
      assetCode: '',
      assetName: '',
      specification: '',
      unit: '台',
      quantity: 0,
      fromDepartment: departments[0] || '',
      toDepartment: departments[1] || '',
      warehouseId: defaultWarehouse?.id || '',
      warehouseName: defaultWarehouse?.name || '',
      status: 'pending',
      reason: '',
      remark: '',
      creator: '当前用户',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setIsNew(true);
    setEditItem(newOrder);
  };

  const handleSelectAsset = (asset: AssetEquipment) => {
    if (!editItem) return;
    const warehouse = warehouses.find((w) => w.id === asset.warehouseId);
    setEditItem({
      ...editItem,
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      specification: asset.specification || '',
      unit: asset.unit,
      warehouseId: asset.warehouseId,
      warehouseName: warehouse?.name || '',
    });
    setAssetPickerOpen(false);
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.assetId) {
      alert('请选择资产');
      return;
    }
    if (editItem.fromDepartment === editItem.toDepartment) {
      alert('调出部门和调入部门不能相同');
      return;
    }
    if (!editItem.quantity || editItem.quantity <= 0) {
      alert('调拨数量必须大于0');
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
    const order = data.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'pending') return;
    if (!confirm(`确认调出 ${order.transferNo}？`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'out_confirmed',
              outConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              outConfirmer: '当前用户',
            }
          : d
      )
    );
  };

  const handleInConfirm = (id: string) => {
    const order = data.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'out_confirmed') return;
    setInConfirmOrder(order);
    setInConfirmEmployee('');
    setInConfirmModalOpen(true);
  };

  const [inConfirmModalOpen, setInConfirmModalOpen] = useState(false);
  const [inConfirmOrder, setInConfirmOrder] = useState<AssetTransfer | null>(null);
  const [inConfirmEmployee, setInConfirmEmployee] = useState('');

  const filteredInConfirmEmployees = useMemo(() => {
    if (!inConfirmOrder) return [];
    return allEmployees.filter(
      (e) => e.department === inConfirmOrder.toDepartment && e.status === 'enabled'
    );
  }, [inConfirmOrder]);

  const confirmInConfirm = () => {
    if (!inConfirmOrder) return;
    if (!inConfirmEmployee) {
      alert('请选择调入部门的领用人');
      return;
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const employee = allEmployees.find((e) => e.id === inConfirmEmployee);

    setData(
      data.map((d) =>
        d.id === inConfirmOrder.id
          ? {
              ...d,
              status: 'completed',
              inConfirmTime: now,
              inConfirmer: '当前用户',
              inConfirmerEmployee: employee?.name || '',
            }
          : d
      )
    );

    // 更新资产的领用人信息
    updateAssetEquipment(inConfirmOrder.assetId, {
      requisitionDepartment: inConfirmOrder.toDepartment,
      requisitionEmployee: employee?.name || '',
      requisitionDate: now.slice(0, 10),
    });

    setInConfirmModalOpen(false);
    setInConfirmOrder(null);
    setInConfirmEmployee('');
  };

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printItem, setPrintItem] = useState<AssetTransfer | null>(null);

  const handlePrint = (row: AssetTransfer) => {
    setViewItem(null);
    setPrintItem(row);
    setPrintTrigger((prev) => prev + 1);
  };

  const helpContent = {
    title: '资产调拨功能说明',
    description: '资产调拨用于在不同部门之间调拨固定资产，需要调出方和调入方分别确认后完成。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增调拨单"按钮',
          '选择要调拨的资产（领用中的资产）',
          '选择调出部门和调入部门',
          '填写调拨原因和备注后保存'
        ]
      },
      {
        heading: '确认流程',
        items: [
          '待调出确认状态的调拨单，点击"调出确认"',
          '调出确认后状态变为"已调出待调入"',
          '待调入确认状态的调拨单，点击"调入确认"',
          '调入确认弹框显示调入部门，需选择该部门的领用人（必填）',
          '确认后资产的领用部门和领用人自动更新为调入部门及所选人员'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '调拨单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印调拨单'
        ]
      }
    ]
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">资产调拨管理</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <PrimaryButton onClick={openAdd}>
          <Plus size={16} />
          新增调拨单
        </PrimaryButton>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#606266] mb-1">本月调拨单</div>
              <div className="text-2xl font-bold text-[#303133]">{stats.monthCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ecf5ff] flex items-center justify-center">
              <Package className="text-[#409eff]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#606266] mb-1">待调出部门确认</div>
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
              <div className="text-sm text-[#606266] mb-1">待调入确认</div>
              <div className="text-2xl font-bold text-[#409eff]">{stats.outConfirmedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ecf5ff] flex items-center justify-center">
              <ArrowRightLeft className="text-[#409eff]" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#606266] mb-1">已完成</div>
              <div className="text-2xl font-bold text-[#67c23a]">{stats.completedCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f0f9eb] flex items-center justify-center">
              <CheckCircle2 className="text-[#67c23a]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <SearchBar
        onSearch={() =>
          setAppliedFilter({
            no: filterNo,
            assetName: filterAssetName,
            fromDepartment: filterFromDepartment,
            toDepartment: filterToDepartment,
            status: filterStatus,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterNo('');
          setFilterAssetName('');
          setFilterFromDepartment('');
          setFilterToDepartment('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setAppliedFilter({
            no: '',
            assetName: '',
            fromDepartment: '',
            toDepartment: '',
            status: '',
            from: '',
            to: '',
          });
        }}
      >
        <SearchField label="调拨单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="资产名称" placeholder="请输入" value={filterAssetName} onChange={setFilterAssetName} />
        <SearchField label="调出部门" type="select" options={departments} value={filterFromDepartment} onChange={setFilterFromDepartment} />
        <SearchField label="调入部门" type="select" options={departments} value={filterToDepartment} onChange={setFilterToDepartment} />
        <SearchField
          label="状态"
          type="select"
          options={[
            { value: 'pending', label: '待调出部门确认' },
            { value: 'out_confirmed', label: '已调出待调入' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
        />
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      {/* 数据表格 */}
      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} />
      </div>

      {/* 查看弹窗 */}
      <Modal open={!!viewItem} title="调拨单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">调拨单号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.transferNo}</div>
              <div className="text-[#606266]">资产名称：</div>
              <div className="text-[#303133] col-span-2">{viewItem.assetName}</div>
              <div className="text-[#606266]">规格型号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.specification}</div>
              <div className="text-[#606266]">数量：</div>
              <div className="text-[#303133] col-span-2">
                {viewItem.quantity} {viewItem.unit}
              </div>
              <div className="text-[#606266]">调出部门：</div>
              <div className="text-[#303133] col-span-2">{viewItem.fromDepartment}</div>
              <div className="text-[#606266]">调入部门：</div>
              <div className="text-[#303133] col-span-2">{viewItem.toDepartment}</div>
              <div className="text-[#606266]">所在仓库：</div>
              <div className="text-[#303133] col-span-2">{viewItem.warehouseName || '-'}</div>
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status) + ' col-span-2'}>
                {statusText(viewItem.status)}
              </div>
              <div className="text-[#606266]">调拨原因：</div>
              <div className="text-[#303133] col-span-2">{viewItem.reason || '-'}</div>
              <div className="text-[#606266]">制单人：</div>
              <div className="text-[#303133] col-span-2">{viewItem.creator}</div>
              <div className="text-[#606266]">制单日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.createTime}</div>
              {viewItem.outConfirmer && (
                <>
                  <div className="text-[#606266]">调出确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmer}</div>
                  <div className="text-[#606266]">调出确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmTime}</div>
                </>
              )}
              {viewItem.inConfirmer && (
                <>
                  <div className="text-[#606266]">调入确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.inConfirmer}</div>
                  {viewItem.inConfirmerEmployee && (
                    <>
                      <div className="text-[#606266]">调入部门领用人：</div>
                      <div className="text-[#303133] col-span-2">{viewItem.inConfirmerEmployee}</div>
                    </>
                  )}
                  <div className="text-[#606266]">调入确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.inConfirmTime}</div>
                </>
              )}
            </div>
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
        title={isNew ? '新增调拨单' : '编辑调拨单'}
        onClose={() => setEditItem(null)}
        width="max-w-[700px]"
      >
        {editItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-[#606266]">调拨单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.transferNo}
                  onChange={(e) => setEditItem({ ...editItem, transferNo: e.target.value })}
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
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 调出部门
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.fromDepartment}
                  onChange={(e) => {
                    setEditItem({
                      ...editItem,
                      fromDepartment: e.target.value,
                    });
                  }}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 调入部门
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.toDepartment}
                  onChange={(e) => {
                    setEditItem({
                      ...editItem,
                      toDepartment: e.target.value,
                    });
                  }}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">调拨原因</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                value={editItem.reason}
                onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
                placeholder="请输入调拨原因"
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                rows={3}
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
      <Modal open={assetPickerOpen} title="选择资产（领用中）" onClose={() => setAssetPickerOpen(false)} width="max-w-[900px]">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap p-3 border border-[#ebeef5] rounded bg-[#fafbfc]">
            {fixedAssetWarehouses.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606266] whitespace-nowrap">仓库：</span>
                <select
                  className="h-8 px-2 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                >
                  <option value="">全部仓库</option>
                  {fixedAssetWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="设备编码..."
                value={assetFilterCode}
                onChange={(e) => setAssetFilterCode(e.target.value)}
                className="pl-7 pr-3 h-8 w-40 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="设备名称..."
                value={assetFilterName}
                onChange={(e) => setAssetFilterName(e.target.value)}
                className="pl-7 pr-3 h-8 w-40 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="规格型号..."
                value={assetFilterSpec}
                onChange={(e) => setAssetFilterSpec(e.target.value)}
                className="pl-7 pr-3 h-8 w-40 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-[#909399] text-sm">暂无符合条件的领用中资产</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">设备编码</th>
                    <th className="px-3 py-2 text-left">设备名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-left">所在仓库</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const warehouse = warehouses.find(w => w.id === asset.warehouseId);
                    return (
                      <tr key={asset.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                        <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.unit}</td>
                        <td className="px-3 py-2 text-[#303133]">{warehouse?.name || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            className="text-[#409eff] hover:underline"
                            onClick={() => handleSelectAsset(asset)}
                          >
                            选择
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>

      {/* 调入确认弹框 */}
      <Modal
        open={inConfirmModalOpen}
        title="调入确认"
        onClose={() => {
          setInConfirmModalOpen(false);
          setInConfirmOrder(null);
          setInConfirmEmployee('');
        }}
        width="max-w-[500px]"
      >
        {inConfirmOrder && (
          <div className="space-y-4 text-sm">
            <div className="p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-[#606266]">调拨单号：</div>
                <div className="text-[#303133]">{inConfirmOrder.transferNo}</div>
                <div className="text-[#606266]">资产名称：</div>
                <div className="text-[#303133]">
                  {inConfirmOrder.assetName} {inConfirmOrder.specification && `（${inConfirmOrder.specification}）`}
                </div>
                <div className="text-[#606266]">调出部门：</div>
                <div className="text-[#303133]">{inConfirmOrder.fromDepartment}</div>
                <div className="text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 调入部门：
                </div>
                <div className="text-[#303133] font-medium">{inConfirmOrder.toDepartment}</div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[#606266]">
                <span className="text-[#f56c6c]">*</span> 调入部门领用人
                <span className="text-[#909399] text-xs ml-1">（必须选择）</span>
              </div>
              <select
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                value={inConfirmEmployee}
                onChange={(e) => setInConfirmEmployee(e.target.value)}
              >
                <option value="">请选择领用人</option>
                {filteredInConfirmEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              {filteredInConfirmEmployees.length === 0 && (
                <div className="text-xs text-[#e6a23c] mt-1">
                  该部门暂无员工，请先在员工档案中添加
                </div>
              )}
            </div>

            <div className="p-3 border border-[#ebeef5] rounded bg-[#ecf5ff] text-xs text-[#409eff]">
              确认后，资产的领用部门将变更为「{inConfirmOrder.toDepartment}」，领用人将变更为所选人员，领用日期为今日。
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton
            onClick={() => {
              setInConfirmModalOpen(false);
              setInConfirmOrder(null);
              setInConfirmEmployee('');
            }}
          >
            取消
          </DefaultButton>
          <PrimaryButton onClick={confirmInConfirm}>确认调入</PrimaryButton>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="资产调拨单"
          orderNo={printItem.transferNo}
          orderType="资产调拨"
          orderDate={printItem.createTime.slice(0, 10)}
          warehouseName={printItem.fromDepartment}
          custodian={printItem.creator}
          remark={printItem.remark}
          details={[
            {
              productCode: printItem.assetCode,
              productName: printItem.assetName,
              specification: printItem.specification,
              unit: printItem.unit,
              quantity: printItem.quantity,
              remark: `调出→调入：${printItem.fromDepartment} → ${printItem.toDepartment}，调拨原因：${printItem.reason}`,
            },
          ]}
          detailColumns={[
            { key: 'index', label: '序号', align: 'center' },
            { key: 'productCode', label: '设备编码' },
            { key: 'productName', label: '设备名称' },
            { key: 'specification', label: '规格型号' },
            { key: 'unit', label: '单位' },
            { key: 'quantity', label: '数量', align: 'right' },
            { key: 'remark', label: '备注' },
          ]}
        />
      )}
    </div>
  );
}
