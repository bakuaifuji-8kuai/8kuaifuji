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

interface RequisitionDetail {
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
}

interface AssetRequisition {
  id: string;
  requisitionNo: string;
  details: RequisitionDetail[];
  applicant: string;
  department: string;
  expectedReturnDate: string;
  status: 'pending' | 'out_confirmed' | 'returned' | 'cancelled';
  requisitionDate: string;
  purpose: string;
  remark: string;
  useAddress: string;
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
    details: [
      {
        assetId: 'AE001',
        assetCode: 'SB20240001',
        assetName: '数控车床',
        specification: 'CJK6136',
        unit: '台',
        quantity: 1,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    applicant: '张三',
    department: '展览部',
    expectedReturnDate: '2024-06-15',
    status: 'out_confirmed',
    requisitionDate: '2024-06-01',
    purpose: '展会现场使用',
    remark: '需提前一天调试',
    useAddress: '会展中心A馆101展位',
    outConfirmer: '管理员',
    outConfirmTime: '2024-06-01 10:00',
  },
  {
    id: 'AR002',
    requisitionNo: 'ZCLY20240602001',
    details: [
      {
        assetId: 'AE002',
        assetCode: 'SB20240002',
        assetName: '铣床',
        specification: 'X5032',
        unit: '台',
        quantity: 1,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    applicant: '李四',
    department: '市场部',
    expectedReturnDate: '2024-06-20',
    status: 'pending',
    requisitionDate: '2024-06-02',
    purpose: '客户演示用',
    remark: '',
    useAddress: '市场部演示厅',
  },
  {
    id: 'AR003',
    requisitionNo: 'ZCLY20240603001',
    details: [
      {
        assetId: 'AE003',
        assetCode: 'SB20240003',
        assetName: '激光切割机',
        specification: 'LCT-3015',
        unit: '台',
        quantity: 1,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    applicant: '王五',
    department: '宣传部',
    expectedReturnDate: '2024-06-10',
    status: 'returned',
    requisitionDate: '2024-06-03',
    purpose: '活动拍摄',
    remark: '已归还，设备完好',
    useAddress: '宣传部摄影棚',
  },
  {
    id: 'AR004',
    requisitionNo: 'ZCLY20240605001',
    details: [
      {
        assetId: 'AE004',
        assetCode: 'SB20240004',
        assetName: '空压机',
        specification: 'GA37',
        unit: '台',
        quantity: 1,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    applicant: '赵六',
    department: '活动部',
    expectedReturnDate: '2024-06-12',
    status: 'cancelled',
    requisitionDate: '2024-06-05',
    purpose: '新品发布会',
    remark: '活动取消',
    useAddress: '活动中心大厅',
  },
];

interface AssetReturn {
  id: string;
  returnNo: string;
  requisitionNo: string;
  details: RequisitionDetail[];
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
  outConfirmer?: string;
  outConfirmTime?: string;
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
      if (appliedFilter.assetName) {
        const firstDetail = o.details[0];
        const allNames = o.details.map((d) => d.assetName).join(',');
        if (!firstDetail || !allNames.includes(appliedFilter.assetName)) return false;
      }
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
    {
      key: 'itemCount',
      title: '物资项数',
      render: (row) => <span>{row.details.length}</span>,
    },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => {
        const total = row.details.reduce((sum, d) => sum + d.quantity, 0);
        return <span>{total}</span>;
      },
    },
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

    order.details.forEach((detail) => {
      updateAssetEquipment(detail.assetId, {
        status: 'in_storage',
        requisitionDepartment: undefined,
        requisitionEmployee: undefined,
        requisitionDate: undefined,
      });
    });

    alert(`反确认成功！领用单 ${order.requisitionNo} 已回退到待出库状态。`);
  };

  const [viewItem, setViewItem] = useState<AssetRequisition | null>(null);
  const [editItem, setEditItem] = useState<AssetRequisition | null>(null);
  const [editDetails, setEditDetails] = useState<RequisitionDetail[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

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
    const newItem: AssetRequisition = {
      id: 'AR' + Date.now(),
      requisitionNo: generateRequisitionNo(),
      details: [],
      applicant: '',
      department: departments[0] || '',
      expectedReturnDate: '',
      status: 'pending',
      requisitionDate: new Date().toISOString().slice(0, 10),
      purpose: '',
      remark: '',
      useAddress: '',
    };
    setIsNew(true);
    setEditItem(newItem);
    setEditDetails([]);
    setSelectedAssetIds([]);
  };

  const openAssetPicker = () => {
    if (editDetails.length > 0) {
      setSelectedAssetIds(editDetails.map((d) => d.assetId));
    } else {
      setSelectedAssetIds([]);
    }
    setAssetPickerOpen(true);
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const confirmAddSelectedAssets = () => {
    const newDetails: RequisitionDetail[] = selectedAssetIds.map((id) => {
      const asset = assetEquipments.find((a) => a.id === id);
      if (!asset) return null;
      const warehouse = warehouses.find((w) => w.id === asset.warehouseId);
      return {
        assetId: asset.id,
        assetCode: asset.code,
        assetName: asset.name,
        specification: asset.specification || '',
        unit: asset.unit,
        quantity: 1,
        warehouseId: asset.warehouseId,
        warehouseName: warehouse?.name || '',
      };
    }).filter(Boolean) as RequisitionDetail[];

    const merged = [...editDetails];
    newDetails.forEach((nd) => {
      if (!merged.find((m) => m.assetId === nd.assetId)) {
        merged.push(nd);
      }
    });

    setEditDetails(merged);
    setAssetPickerOpen(false);
    setSelectedAssetIds([]);
  };

  const removeDetail = (assetId: string) => {
    setEditDetails(editDetails.filter((d) => d.assetId !== assetId));
  };

  const updateDetailQuantity = (assetId: string, quantity: number) => {
    setEditDetails(
      editDetails.map((d) =>
        d.assetId === assetId ? { ...d, quantity: Math.max(1, quantity) } : d
      )
    );
  };

  const handleSave = () => {
    if (!editItem) return;
    if (editDetails.length === 0) {
      alert('请至少选择一个资产');
      return;
    }
    for (const d of editDetails) {
      if (!d.quantity || d.quantity < 1) {
        alert(`资产 ${d.assetName} 的数量必须大于等于1`);
        return;
      }
    }
    if (!editItem.applicant) {
      alert('请填写领用人');
      return;
    }
    if (!editItem.department) {
      alert('请选择领用部门');
      return;
    }
    if (!editItem.useAddress) {
      alert('请填写使用地址');
      return;
    }

    const toSave: AssetRequisition = {
      ...editItem,
      details: editDetails,
    };

    if (isNew) {
      setData([toSave, ...data]);
    } else {
      setData(data.map((d) => (d.id === editItem.id ? toSave : d)));
    }
    setEditItem(null);
    setEditDetails([]);
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

    order.details.forEach((detail) => {
      updateAssetEquipment(detail.assetId, {
        status: 'in_use',
        requisitionDepartment: order.department,
        requisitionEmployee: order.applicant,
        requisitionDate: order.requisitionDate,
      });
    });
  };

  const handleQuickReturn = (row: AssetRequisition) => {
    if (!confirm(`确认一键归还 ${row.requisitionNo}？系统将自动生成资产归还单（待入库确认状态）。`)) return;

    const returnOrder: AssetReturn = {
      id: 'RT' + Date.now(),
      returnNo: generateReturnNo(),
      requisitionNo: row.requisitionNo,
      details: row.details.map((d) => ({ ...d })),
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
    description: '资产领用用于从固定资产仓库领用资产，支持多物资批量领用。确认出库后资产状态变更为领用中，归还后状态变更为在仓。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增领用单"按钮',
          '选择仓库（固定资产类仓库），从资产档案中勾选多个在仓状态的资产',
          '每个物资行可独立设置领用数量',
          '填写领用人、领用部门、使用地址等公共信息',
          '预计归还日期为非必填项，填写后到期前5天将有提醒标识',
          '保存后生成领用单（待出库确认状态）'
        ]
      },
      {
        heading: '确认出库',
        items: [
          '待出库确认状态的领用单，点击"确认出库"',
          '确认后所有物资的资产状态均变更为领用中',
          '同时记录领用部门、领用人、领用日期'
        ]
      },
      {
        heading: '一键归还',
        items: [
          '已出库（领用中）状态的领用单，点击"一键归还"',
          '系统自动生成包含所有物资明细的资产归还单，状态为待入库确认',
          '归还单可在资产归还页面进行确认入库操作'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '领用单生成后即可打印，与状态无关',
          '打印内容包含所有物资明细行',
          '点击操作栏的"打印"按钮即可打印领用单'
        ]
      },
      {
        heading: '统计卡片说明',
        items: [
          '本月领用：按领用日期为本月统计，包含所有状态的领用单数量',
          '待出库确认：状态为 pending（待出库确认）的领用单数量',
          '领用中：状态为 out_confirmed（已出库）的领用单数量',
          '已归还：状态为 returned（已归还）的领用单数量'
        ]
      },
      {
        heading: '反确认',
        items: [
          '已出库(out_confirmed)的领用单可执行反确认',
          '反确认操作会回退单据状态为待出库确认，并将资产状态恢复为在仓',
          '点击操作栏的"反确认"按钮，确认后即可执行'
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
              {viewItem.outConfirmer && (
                <>
                  <div className="text-[#606266]">出库确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmer}</div>
                  <div className="text-[#606266]">出库确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.outConfirmTime}</div>
                </>
              )}
            </div>

            <div className="border border-[#ebeef5] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-sm font-medium text-[#303133]">物资明细</div>
              <table className="w-full text-xs">
                <thead className="bg-[#fafbfc]">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">序号</th>
                    <th className="px-3 py-2 text-left">物资编码</th>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">数量</th>
                    <th className="px-3 py-2 text-left">所在仓库</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.details.map((d, idx) => (
                    <tr key={d.assetId} className="border-t border-[#f0f2f5]">
                      <td className="px-3 py-2 text-[#303133]">{idx + 1}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.assetCode}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.assetName}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                      <td className="px-3 py-2 text-right text-[#303133]">{d.quantity}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.warehouseName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#ebeef5] bg-[#fafbfc]">
                    <td colSpan={5} className="px-3 py-2 text-[#606266] text-right">合计：</td>
                    <td className="px-3 py-2 text-right text-[#303133] font-medium">
                      {viewItem.details.reduce((sum, d) => sum + d.quantity, 0)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
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
        onClose={() => { setEditItem(null); setEditDetails([]); }}
        width="max-w-[800px]"
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
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 物资明细（已选 {editDetails.length} 项）
                </div>
                <DefaultButton onClick={openAssetPicker}>
                  <Search size={14} /> 选择资产
                </DefaultButton>
              </div>
              {editDetails.length === 0 ? (
                <div className="border border-dashed border-[#dcdfe6] rounded p-8 text-center text-[#909399]">
                  暂未选择资产，请点击"选择资产"添加
                </div>
              ) : (
                <div className="border border-[#ebeef5] rounded">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f5f7fa]">
                      <tr className="text-[#606266]">
                        <th className="px-3 py-2 text-left">序号</th>
                        <th className="px-3 py-2 text-left">物资编码</th>
                        <th className="px-3 py-2 text-left">物资名称</th>
                        <th className="px-3 py-2 text-left">规格</th>
                        <th className="px-3 py-2 text-left">单位</th>
                        <th className="px-3 py-2 text-right">数量</th>
                        <th className="px-3 py-2 text-left">所在仓库</th>
                        <th className="px-3 py-2 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editDetails.map((d, idx) => (
                        <tr key={d.assetId} className="border-t border-[#f0f2f5]">
                          <td className="px-3 py-2 text-[#303133]">{idx + 1}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.assetCode}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.assetName}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={d.quantity}
                              onChange={(e) => updateDetailQuantity(d.assetId, parseInt(e.target.value, 10) || 1)}
                              className="w-16 h-7 px-2 border border-[#dcdfe6] rounded text-right text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                            />
                          </td>
                          <td className="px-3 py-2 text-[#303133]">{d.warehouseName || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              className="text-[#f56c6c] hover:underline"
                              onClick={() => removeDetail(d.assetId)}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
          <DefaultButton onClick={() => { setEditItem(null); setEditDetails([]); }}>取消</DefaultButton>
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
                    <th className="px-3 py-2 text-center w-10">
                      <input
                        type="checkbox"
                        checked={filteredAssets.length > 0 && filteredAssets.every((a) => selectedAssetIds.includes(a.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newIds = filteredAssets.map((a) => a.id);
                            setSelectedAssetIds((prev) => [...new Set([...prev, ...newIds])]);
                          } else {
                            setSelectedAssetIds((prev) =>
                              prev.filter((id) => !filteredAssets.find((a) => a.id === id))
                            );
                          }
                        }}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">设备编码</th>
                    <th className="px-3 py-2 text-left">设备名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">金额</th>
                    <th className="px-3 py-2 text-left">所在仓库</th>
                    <th className="px-3 py-2 text-left">存放地点</th>
                    <th className="px-3 py-2 text-left">入库日期</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const isChecked = selectedAssetIds.includes(asset.id);
                    return (
                      <tr
                        key={asset.id}
                        className={`border-t border-[#f0f2f5] hover:bg-[#f5f7fa] ${isChecked ? 'bg-[#ecf5ff]' : ''}`}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAssetSelection(asset.id)}
                          />
                        </td>
                        <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.unit}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">¥{asset.amount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.warehouseName || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.storageLocation}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.createTime}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#606266]">已选 {selectedAssetIds.length} 项</span>
            <div className="flex items-center gap-2">
              <DefaultButton onClick={() => setAssetPickerOpen(false)}>取消</DefaultButton>
              <PrimaryButton onClick={confirmAddSelectedAssets} disabled={selectedAssetIds.length === 0}>
                确认添加
              </PrimaryButton>
            </div>
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
          warehouseName={printItem.details[0]?.warehouseName || ''}
          custodian={printItem.applicant}
          remark={printItem.remark}
          details={printItem.details.map((d) => ({
            productCode: d.assetCode,
            productName: d.assetName,
            specification: d.specification,
            unit: d.unit,
            quantity: d.quantity,
            remark: `仓库：${d.warehouseName}`,
          }))}
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
