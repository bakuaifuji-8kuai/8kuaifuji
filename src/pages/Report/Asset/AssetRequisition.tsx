import { useMemo, useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { Plus, Package, Clock, CheckCircle2, Printer, Search, RotateCcw, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { AssetEquipment, Warehouse } from '@/types';
import { generateId } from '@/utils';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface AssetRequisition {
  id: string;
  requisitionNo: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  applicant: string;
  department: string;
  expectedReturnDate: string;
  status: 'pending' | 'out_confirmed' | 'returned' | 'cancelled';
  requisitionDate: string;
  purpose: string;
  remark: string;
  useAddress: string;
  warehouseId: string;
  warehouseName: string;
  outConfirmer?: string;
  outConfirmTime?: string;
}

const departments = ['展览部', '市场部', '宣传部', '活动部', '行政部', '技术部', '工程部'];

const generateRequisitionNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCLY${dateStr}${random}`;
};

const generateReturnNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCGL${dateStr}${random}`;
};

const initialData: AssetRequisition[] = [
  {
    id: 'AR001',
    requisitionNo: 'ZCLY20240601001',
    assetId: 'AE001',
    assetCode: 'SB20240001',
    assetName: '数控车床',
    specification: 'CJK6136',
    unit: '台',
    quantity: 1,
    applicant: '张三',
    department: '展览部',
    expectedReturnDate: '2024-06-15',
    status: 'out_confirmed',
    requisitionDate: '2024-06-01',
    purpose: '展会现场使用',
    remark: '需提前一天调试',
    useAddress: '会展中心A馆101展位',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
    outConfirmer: '管理员',
    outConfirmTime: '2024-06-01 10:00',
  },
  {
    id: 'AR002',
    requisitionNo: 'ZCLY20240602001',
    assetId: 'AE002',
    assetCode: 'SB20240002',
    assetName: '铣床',
    specification: 'X5032',
    unit: '台',
    quantity: 1,
    applicant: '李四',
    department: '市场部',
    expectedReturnDate: '2024-06-20',
    status: 'pending',
    requisitionDate: '2024-06-02',
    purpose: '客户演示用',
    remark: '',
    useAddress: '市场部演示厅',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
  {
    id: 'AR003',
    requisitionNo: 'ZCLY20240603001',
    assetId: 'AE003',
    assetCode: 'SB20240003',
    assetName: '激光切割机',
    specification: 'LCT-3015',
    unit: '台',
    quantity: 1,
    applicant: '王五',
    department: '宣传部',
    expectedReturnDate: '2024-06-10',
    status: 'returned',
    requisitionDate: '2024-06-03',
    purpose: '活动拍摄',
    remark: '已归还，设备完好',
    useAddress: '宣传部摄影棚',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
  {
    id: 'AR004',
    requisitionNo: 'ZCLY20240605001',
    assetId: 'AE004',
    assetCode: 'SB20240004',
    assetName: '空压机',
    specification: 'GA37',
    unit: '台',
    quantity: 1,
    applicant: '赵六',
    department: '活动部',
    expectedReturnDate: '2024-06-12',
    status: 'cancelled',
    requisitionDate: '2024-06-05',
    purpose: '新品发布会',
    remark: '活动取消',
    useAddress: '活动中心大厅',
    warehouseId: 'WH003',
    warehouseName: '固定资产仓',
  },
];

interface AssetReturn {
  id: string;
  returnNo: string;
  requisitionNo: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  applicant: string;
  department: string;
  requisitionDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  status: 'pending_in' | 'completed' | 'cancelled';
  condition: string;
  purpose: string;
  remark: string;
  useAddress: string;
  warehouseId: string;
  warehouseName: string;
  inConfirmer?: string;
  inConfirmTime?: string;
}

export default function AssetRequisition() {
  const { assetEquipments, updateAssetEquipment, employees, warehouses } = useStore();

  const [data, setData] = useState<AssetRequisition[]>(initialData);
  const [returnData, setReturnData] = useState<AssetReturn[]>([]);

  const [filterNo, setFilterNo] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    no: '',
    assetName: '',
    applicant: '',
    status: '',
    from: '',
    to: '',
  });

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (appliedFilter.no && !o.requisitionNo.includes(appliedFilter.no)) return false;
      if (appliedFilter.assetName && !o.assetName.includes(appliedFilter.assetName)) return false;
      if (appliedFilter.applicant && !o.applicant.includes(appliedFilter.applicant)) return false;
      if (appliedFilter.status && o.status !== appliedFilter.status) return false;
      if (appliedFilter.from && o.requisitionDate < appliedFilter.from) return false;
      if (appliedFilter.to && o.requisitionDate > appliedFilter.to + ' 23:59:59') return false;
      return true;
    });
  }, [data, appliedFilter]);

  const fixedAssetWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.category === 'fixed_asset' && w.status === 'enabled');
  }, [warehouses]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthCount = data.filter((d) => d.requisitionDate.startsWith(monthStr)).length;
    const pendingCount = data.filter((d) => d.status === 'pending').length;
    const outConfirmedCount = data.filter((d) => d.status === 'out_confirmed').length;
    const returnedCount = data.filter((d) => d.status === 'returned').length;
    return { monthCount, pendingCount, outConfirmedCount, returnedCount };
  }, [data]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  const inStorageAssets = useMemo(() => {
    let assets = assetEquipments.filter((a) => a.status === 'in_storage');
    if (selectedWarehouseId) {
      assets = assets.filter((a) => a.warehouseId === selectedWarehouseId);
    }
    return assets;
  }, [assetEquipments, selectedWarehouseId]);

  const isNearExpiry = (expectedDate: string): boolean => {
    if (!expectedDate) return false;
    const now = new Date();
    const expiry = new Date(expectedDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  };

  const statusText = (s: string) => {
    if (s === 'pending') return '待出库确认';
    if (s === 'out_confirmed') return '已出库（领用中）';
    if (s === 'returned') return '已归还';
    if (s === 'cancelled') return '已取消';
    return s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'text-[#e6a23c]';
    if (s === 'out_confirmed') return 'text-[#409eff]';
    if (s === 'returned') return 'text-[#67c23a]';
    if (s === 'cancelled') return 'text-[#909399]';
    return '';
  };

  const columns: ColumnDef<AssetRequisition>[] = [
    { key: 'requisitionNo', title: '领用单号' },
    { key: 'assetCode', title: '设备编码' },
    { key: 'assetName', title: '资产名称' },
    { key: 'specification', title: '规格型号' },
    { key: 'quantity', title: '数量', align: 'right' },
    { key: 'applicant', title: '领用人' },
    { key: 'department', title: '领用部门' },
    {
      key: 'expectedReturnDate',
      title: '预计归还日期',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.expectedReturnDate || '-'}
          {row.status === 'out_confirmed' && isNearExpiry(row.expectedReturnDate) && (
            <AlertTriangle size={14} className="text-[#e6a23c]" />
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'requisitionDate', title: '领用日期' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => handlePrint(row)}>
            <Printer size={12} /> 打印
          </TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.requisitionNo}？`)) {
                    setData(data.filter((d) => d.id !== row.id));
                  }
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleOutConfirm(row.id)}>确认出库</TextButton>
            </>
          )}
          {row.status === 'out_confirmed' && (
            <>
              <TextButton onClick={() => handleQuickReturn(row)}>
                <RotateCcw size={12} /> 一键归还
              </TextButton>
              <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleReverseConfirm = (id: string) => {
    const order = data.find((o) => o.id === id);
    if (!order) return;
    if (!confirm(`确认反确认领用单 ${order.requisitionNo}？反确认后单据将回退到待出库状态，资产状态将恢复为在仓。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'pending',
              outConfirmer: undefined,
              outConfirmTime: undefined,
            }
          : d
      )
    );

    updateAssetEquipment(order.assetId, {
      status: 'in_storage',
      requisitionDepartment: undefined,
      requisitionEmployee: undefined,
      requisitionDate: undefined,
    });

    alert(`反确认成功！领用单 ${order.requisitionNo} 已回退到待出库状态。`);
  };

  const [viewItem, setViewItem] = useState<AssetRequisition | null>(null);
  const [editItem, setEditItem] = useState<AssetRequisition | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const [assetFilterCode, setAssetFilterCode] = useState('');
  const [assetFilterName, setAssetFilterName] = useState('');
  const [assetFilterSpec, setAssetFilterSpec] = useState('');
  const [assetFilterFrom, setAssetFilterFrom] = useState('');
  const [assetFilterTo, setAssetFilterTo] = useState('');

  const filteredAssets = useMemo(() => {
    return inStorageAssets.filter((a) => {
      if (assetFilterCode && !a.code.toLowerCase().includes(assetFilterCode.toLowerCase())) return false;
      if (assetFilterName && !a.name.toLowerCase().includes(assetFilterName.toLowerCase())) return false;
      if (assetFilterSpec && !a.specification?.toLowerCase().includes(assetFilterSpec.toLowerCase())) return false;
      if (assetFilterFrom && a.createTime < assetFilterFrom) return false;
      if (assetFilterTo && a.createTime > assetFilterTo) return false;
      return true;
    });
  }, [inStorageAssets, assetFilterCode, assetFilterName, assetFilterSpec, assetFilterFrom, assetFilterTo]);

  useEffect(() => {
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  }, [fixedAssetWarehouses]);

  const openAdd = () => {
    const defaultWarehouse = fixedAssetWarehouses[0];
    const newItem: AssetRequisition = {
      id: 'AR' + Date.now(),
      requisitionNo: generateRequisitionNo(),
      assetId: '',
      assetCode: '',
      assetName: '',
      specification: '',
      unit: '台',
      quantity: 1,
      applicant: '',
      department: departments[0] || '',
      expectedReturnDate: '',
      status: 'pending',
      requisitionDate: new Date().toISOString().slice(0, 10),
      purpose: '',
      remark: '',
      useAddress: '',
      warehouseId: defaultWarehouse?.id || '',
      warehouseName: defaultWarehouse?.name || '',
    };
    setIsNew(true);
    setEditItem(newItem);
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
      quantity: 1,
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
    if (!editItem.applicant) {
      alert('请填写领用人');
      return;
    }
    if (!editItem.department) {
      alert('请选择领用部门');
      return;
    }
    if (!editItem.quantity || editItem.quantity <= 0) {
      alert('领用数量必须大于0');
      return;
    }
    if (!editItem.useAddress) {
      alert('请填写使用地址');
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
    if (!confirm(`确认出库 ${order.requisitionNo}？确认后资产状态将变更为领用中。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'out_confirmed',
              outConfirmer: '当前用户',
              outConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : d
      )
    );

    updateAssetEquipment(order.assetId, {
      status: 'in_use',
      requisitionDepartment: order.department,
      requisitionEmployee: order.applicant,
      requisitionDate: order.requisitionDate,
    });
  };

  const handleQuickReturn = (row: AssetRequisition) => {
    if (!confirm(`确认一键归还 ${row.requisitionNo}？系统将自动生成资产归还单（待入库确认状态）。`)) return;

    const returnOrder: AssetReturn = {
      id: 'RT' + Date.now(),
      returnNo: generateReturnNo(),
      requisitionNo: row.requisitionNo,
      assetId: row.assetId,
      assetCode: row.assetCode,
      assetName: row.assetName,
      specification: row.specification,
      unit: row.unit,
      quantity: row.quantity,
      applicant: row.applicant,
      department: row.department,
      requisitionDate: row.requisitionDate,
      expectedReturnDate: row.expectedReturnDate,
      actualReturnDate: new Date().toISOString().slice(0, 10),
      status: 'pending_in',
      condition: '完好',
      purpose: row.purpose,
      remark: '一键归还生成',
      useAddress: row.useAddress,
      warehouseId: row.warehouseId,
      warehouseName: row.warehouseName,
    };

    setReturnData([returnOrder, ...returnData]);

    setData(
      data.map((d) =>
        d.id === row.id
          ? {
              ...d,
              status: 'returned',
            }
          : d
      )
    );

    alert(`已生成归还单 ${returnOrder.returnNo}，状态为待入库确认。`);
  };

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printItem, setPrintItem] = useState<AssetRequisition | null>(null);

  const handlePrint = (row: AssetRequisition) => {
    setViewItem(null);
    setPrintItem(row);
    setPrintTrigger((prev) => prev + 1);
  };

  const employeeOptions = employees.filter((e) => e.status === 'enabled').map((e) => e.name);

  const statusOptions = [
    { value: '', label: '全部' },
    { value: 'pending', label: '待出库确认' },
    { value: 'out_confirmed', label: '已出库（领用中）' },
    { value: 'returned', label: '已归还' },
    { value: 'cancelled', label: '已取消' },
  ];

  const helpContent = {
    title: '资产领用功能说明',
    description: '资产领用用于从固定资产仓库领用资产，确认出库后资产状态变更为领用中，归还后状态变更为在仓。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增领用单"按钮',
          '选择仓库（固定资产类仓库），从资产档案中选择在仓状态的资产',
          '填写领用人、领用部门、使用地址等信息',
          '预计归还日期为非必填项，填写后到期前5天将有提醒标识',
          '保存后生成领用单（待出库确认状态）'
        ]
      },
      {
        heading: '确认出库',
        items: [
          '待出库确认状态的领用单，点击"确认出库"',
          '确认后资产状态变更为领用中',
          '同时记录领用部门、领用人、领用日期'
        ]
      },
      {
        heading: '一键归还',
        items: [
          '已出库（领用中）状态的领用单，点击"一键归还"',
          '系统自动生成资产归还单，状态为待入库确认',
          '归还单可在资产归还页面进行确认入库操作'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '领用单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印领用单'
        ]
      }
    ]
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">资产领用管理</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <PrimaryButton onClick={openAdd}>
          <Plus size={16} />
          新增领用单
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#606266] mb-1">本月领用</div>
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
                <div className="text-sm text-[#606266] mb-1">待出库确认</div>
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
                <div className="text-sm text-[#606266] mb-1">领用中</div>
                <div className="text-2xl font-bold text-[#409eff]">{stats.outConfirmedCount}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#ecf5ff] flex items-center justify-center">
                <Package className="text-[#409eff]" size={24} />
              </div>
            </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#606266] mb-1">已归还</div>
                <div className="text-2xl font-bold text-[#67c23a]">{stats.returnedCount}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#f0f9eb] flex items-center justify-center">
                <CheckCircle2 className="text-[#67c23a]" size={24} />
              </div>
            </div>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setAppliedFilter({
            no: filterNo,
            assetName: filterAssetName,
            applicant: filterApplicant,
            status: filterStatus,
            from: filterFrom,
            to: filterTo,
          })
        }
        onReset={() => {
          setFilterNo('');
          setFilterAssetName('');
          setFilterApplicant('');
          setFilterStatus('');
          setFilterFrom('');
          setFilterTo('');
          setAppliedFilter({
            no: '',
            assetName: '',
            applicant: '',
            status: '',
            from: '',
            to: '',
          });
        }}
      >
        <SearchField label="领用单号" type="input" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="资产名称" type="input" placeholder="请输入" value={filterAssetName} onChange={setFilterAssetName} />
        <SearchField label="领用人" type="input" placeholder="请输入" value={filterApplicant} onChange={setFilterApplicant} />
        <SearchField label="状态" type="select" options={statusOptions} value={filterStatus} onChange={setFilterStatus} />
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
      </SearchBar>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} />
      </div>

      <Modal open={!!viewItem} title="领用单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">领用单号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.requisitionNo}</div>
              <div className="text-[#606266]">设备编码：</div>
              <div className="text-[#303133] col-span-2">{viewItem.assetCode}</div>
              <div className="text-[#606266]">资产名称：</div>
              <div className="text-[#303133] col-span-2">{viewItem.assetName}</div>
              <div className="text-[#606266]">规格型号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.specification}</div>
              <div className="text-[#606266]">数量：</div>
              <div className="text-[#303133] col-span-2">
                {viewItem.quantity} {viewItem.unit}
              </div>
              <div className="text-[#606266]">领用人：</div>
              <div className="text-[#303133] col-span-2">{viewItem.applicant}</div>
              <div className="text-[#606266]">领用部门：</div>
              <div className="text-[#303133] col-span-2">{viewItem.department}</div>
              <div className="text-[#606266]">使用地址：</div>
              <div className="text-[#303133] col-span-2">{viewItem.useAddress || '-'}</div>
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status) + ' col-span-2'}>
                {statusText(viewItem.status)}
              </div>
              <div className="text-[#606266]">领用日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.requisitionDate}</div>
              <div className="text-[#606266]">预计归还日期：</div>
              <div className="text-[#303133] col-span-2 flex items-center gap-1">
                {viewItem.expectedReturnDate || '-'}
                {viewItem.status === 'out_confirmed' && isNearExpiry(viewItem.expectedReturnDate) && (
                  <span className="text-[#e6a23c] text-xs">（即将到期）</span>
                )}
              </div>
              <div className="text-[#606266]">用途：</div>
              <div className="text-[#303133] col-span-2">{viewItem.purpose || '-'}</div>
              <div className="text-[#606266]">仓库：</div>
              <div className="text-[#303133] col-span-2">{viewItem.warehouseName || '-'}</div>
              {viewItem.outConfirmer && (
                <>
                  <div className="text-[#606266]">出库确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmer}</div>
                  <div className="text-[#606266]">出库确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmTime}</div>
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

      <Modal
        open={!!editItem}
        title={isNew ? '新增资产领用' : '编辑资产领用'}
        onClose={() => setEditItem(null)}
        width="max-w-[700px]"
      >
        {editItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-[#606266]">领用单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.requisitionNo}
                  readOnly
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 选择资产
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133] cursor-pointer"
                    value={editItem.assetName || '请选择在仓资产'}
                    onClick={() => setAssetPickerOpen(true)}
                  />
                  <DefaultButton onClick={() => setAssetPickerOpen(true)}>选择</DefaultButton>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">设备编码</div>
                <input
                  readOnly
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133]"
                  value={editItem.assetCode}
                />
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
                  <span className="text-[#f56c6c]">*</span> 领用数量
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                    value={editItem.quantity || ''}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: parseInt(e.target.value, 10) || 1 })
                    }
                  />
                  <span className="text-[#606266]">{editItem.unit}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 领用人
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.applicant}
                  onChange={(e) => setEditItem({ ...editItem, applicant: e.target.value })}
                >
                  <option value="">请选择领用人</option>
                  {employeeOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 领用部门
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.department}
                  onChange={(e) => setEditItem({ ...editItem, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">预计归还日期</div>
                <input
                  type="date"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.expectedReturnDate}
                  onChange={(e) => setEditItem({ ...editItem, expectedReturnDate: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 使用地址
                </div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.useAddress}
                  onChange={(e) => setEditItem({ ...editItem, useAddress: e.target.value })}
                  placeholder="请输入使用地址"
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">用途</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                value={editItem.purpose}
                onChange={(e) => setEditItem({ ...editItem, purpose: e.target.value })}
                placeholder="请输入领用用途"
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

      <Modal open={assetPickerOpen} title="选择资产（在仓）" onClose={() => setAssetPickerOpen(false)} width="max-w-[900px]">
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606266] whitespace-nowrap">入库日期：</span>
              <input
                type="date"
                value={assetFilterFrom}
                onChange={(e) => setAssetFilterFrom(e.target.value)}
                className="h-8 w-32 px-2 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
              />
              <span className="text-xs text-[#909399]">至</span>
              <input
                type="date"
                value={assetFilterTo}
                onChange={(e) => setAssetFilterTo(e.target.value)}
                className="h-8 w-32 px-2 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-[#909399] text-sm">暂无符合条件的在仓资产</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">设备编码</th>
                    <th className="px-3 py-2 text-left">设备名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">金额</th>
                    <th className="px-3 py-2 text-left">所在仓库</th>
                    <th className="px-3 py-2 text-left">存放地点</th>
                    <th className="px-3 py-2 text-left">入库日期</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                      <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.specification || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.unit}</td>
                      <td className="px-3 py-2 text-right text-[#303133]">¥{asset.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.warehouseName || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.storageLocation}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.createTime}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => handleSelectAsset(asset)}
                        >
                          选择
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <DefaultButton onClick={() => setAssetPickerOpen(false)}>取消</DefaultButton>
          </div>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="资产领用单"
          orderNo={printItem.requisitionNo}
          orderType="资产领用"
          orderDate={printItem.requisitionDate}
          warehouseName={printItem.warehouseName}
          custodian={printItem.applicant}
          remark={printItem.remark}
          details={[
            {
              productCode: printItem.assetCode,
              productName: printItem.assetName,
              specification: printItem.specification,
              unit: printItem.unit,
              quantity: printItem.quantity,
              remark: `领用部门：${printItem.department}，使用地址：${printItem.useAddress}，预计归还：${printItem.expectedReturnDate || '未填写'}，用途：${printItem.purpose}`,
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
