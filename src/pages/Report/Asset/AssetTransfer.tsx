import { useMemo, useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { ArrowRightLeft, Plus, Package, Clock, CheckCircle2, Printer, Search, Trash2 } from 'lucide-react';
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
  warehouseId?: string;
  warehouseName?: string;
}

interface AssetTransfer {
  id: string;
  transferNo: string;
  details: AssetTransferDetail[];
  fromDepartment: string;
  toDepartment: string;
  status: 'pending' | 'out_confirmed' | 'completed' | 'cancelled';
  reason: string;
  remark: string;
  creator: string;
  createTime: string;
  outConfirmTime?: string;
  outConfirmer?: string;
  inConfirmTime?: string;
  inConfirmer?: string;
  requisitionDepartment?: string;
  requisitionEmployee?: string;
  requisitionDate?: string;
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
    details: [
      {
        id: 'AT001-D1',
        assetTransferId: 'AT001',
        assetId: 'AE005',
        assetCode: 'SB20240005',
        assetName: '叉车',
        specification: 'CPCD30',
        unit: '辆',
        quantity: 1,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    fromDepartment: '展览部',
    toDepartment: '市场部',
    status: 'pending',
    reason: '展会使用',
    remark: '6月10日展会需要',
    creator: '张三',
    createTime: '2024-06-01 09:30',
  },
  {
    id: 'AT002',
    transferNo: 'ZCZY20240602001',
    details: [
      {
        id: 'AT002-D1',
        assetTransferId: 'AT002',
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
    fromDepartment: '市场部',
    toDepartment: '技术部',
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
    details: [
      {
        id: 'AT003-D1',
        assetTransferId: 'AT003',
        assetId: 'AE007',
        assetCode: 'SB20240007',
        assetName: '钻床',
        specification: 'Z516',
        unit: '台',
        quantity: 1,
        warehouseId: 'WH003',
        warehouseName: '固定资产仓',
      },
    ],
    fromDepartment: '生产部',
    toDepartment: '技术部',
    status: 'completed',
    reason: '设备维修',
    remark: '',
    creator: '张三',
    createTime: '2024-06-03 10:00',
    outConfirmTime: '2024-06-03 11:00',
    outConfirmer: '王五',
    inConfirmTime: '2024-06-03 14:30',
    inConfirmer: '赵六',
    requisitionDepartment: '技术部',
    requisitionEmployee: '孙七',
    requisitionDate: '2024-06-03',
  },
  {
    id: 'AT004',
    transferNo: 'ZCZY20240604001',
    details: [
      {
        id: 'AT004-D1',
        assetTransferId: 'AT004',
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
    fromDepartment: '生产部',
    toDepartment: '行政部',
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

  const fixedAssetWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.category === 'fixed_asset' && w.status === 'enabled');
  }, [warehouses]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  const inUseAssets = useMemo(() => {
    let assets = assetEquipments.filter((a) => a.status === 'in_use');
    if (selectedWarehouseId) {
      assets = assets.filter((a) => a.warehouseId === selectedWarehouseId);
    }
    return assets;
  }, [assetEquipments, selectedWarehouseId]);

  const [assetFilterCode, setAssetFilterCode] = useState('');
  const [assetFilterName, setAssetFilterName] = useState('');
  const [assetFilterSpec, setAssetFilterSpec] = useState('');

  const filteredAssets = useMemo(() => {
    return inUseAssets.filter((a) => {
      if (assetFilterCode && !a.code.toLowerCase().includes(assetFilterCode.toLowerCase())) return false;
      if (assetFilterName && !a.name.toLowerCase().includes(assetFilterName.toLowerCase())) return false;
      if (assetFilterSpec && !a.specification?.toLowerCase().includes(assetFilterSpec.toLowerCase())) return false;
      return true;
    });
  }, [inUseAssets, assetFilterCode, assetFilterName, assetFilterSpec]);

  useEffect(() => {
    if (fixedAssetWarehouses.length === 1) {
      setSelectedWarehouseId(fixedAssetWarehouses[0].id);
    }
  }, [fixedAssetWarehouses]);

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (appliedFilter.no && !o.transferNo.includes(appliedFilter.no)) return false;
      if (appliedFilter.assetName) {
        const name = appliedFilter.assetName;
        const match = o.details.some((d) => d.assetName.includes(name));
        if (!match) return false;
      }
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
    {
      key: 'itemCount',
      title: '物资项数',
      render: (row) => <span>{row.details.length} 项</span>,
    },
    {
      key: 'quantity',
      title: '数量',
      align: 'right',
      render: (row) => {
        if (!row.details || row.details.length === 0) return '-';
        const total = row.details.reduce((sum, d) => sum + d.quantity, 0);
        return <span>{total}</span>;
      },
    },
    { key: 'fromDepartment', title: '调出部门' },
    { key: 'toDepartment', title: '调入部门' },
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

    if (order.status === 'completed' && order.requisitionEmployee) {
      order.details.forEach((detail) => {
        updateAssetEquipment(detail.assetId, {
          requisitionDepartment: undefined,
          requisitionEmployee: undefined,
          requisitionDate: undefined,
        });
      });
    }

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
              requisitionDepartment: undefined,
              requisitionEmployee: undefined,
              requisitionDate: undefined,
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
    const defaultWarehouse = fixedAssetWarehouses.find((w) => w.id === selectedWarehouseId) || fixedAssetWarehouses[0];
    const newOrder: AssetTransfer = {
      id: 'AT' + Date.now(),
      transferNo: generateTransferNo(),
      details: [],
      fromDepartment: departments[0] || '',
      toDepartment: departments[1] || '',
      status: 'pending',
      reason: '',
      remark: '',
      creator: '当前用户',
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setIsNew(true);
    setEditItem(newOrder);
  };

  const handleToggleAsset = (asset: AssetEquipment) => {
    if (!editItem) return;
    const warehouse = warehouses.find((w) => w.id === asset.warehouseId);
    const existingIndex = editItem.details.findIndex((d) => d.assetId === asset.id);

    if (existingIndex >= 0) {
      const newDetails = editItem.details.filter((d) => d.assetId !== asset.id);
      setEditItem({ ...editItem, details: newDetails });
    } else {
      const newDetail: AssetTransferDetail = {
        id: `DET-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        assetTransferId: editItem.id,
        assetId: asset.id,
        assetCode: asset.code,
        assetName: asset.name,
        specification: asset.specification || '',
        unit: asset.unit,
        quantity: 1,
        warehouseId: asset.warehouseId,
        warehouseName: warehouse?.name || '',
      };
      setEditItem({ ...editItem, details: [...editItem.details, newDetail] });
    }
  };

  const handleRemoveDetail = (detailId: string) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((d) => d.id !== detailId) });
  };

  const handleDetailQuantityChange = (detailId: string, quantity: number) => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      details: editItem.details.map((d) =>
        d.id === detailId ? { ...d, quantity: Math.max(1, quantity) } : d
      ),
    });
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.details || editItem.details.length === 0) {
      alert('请至少选择一项资产');
      return;
    }
    if (editItem.fromDepartment === editItem.toDepartment) {
      alert('调出部门和调入部门不能相同');
      return;
    }
    const invalidDetail = editItem.details.find((d) => !d.quantity || d.quantity < 1);
    if (invalidDetail) {
      alert(`资产「${invalidDetail.assetName}」的调拨数量必须大于0`);
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
              requisitionDepartment: inConfirmOrder.toDepartment,
              requisitionEmployee: employee?.name || '',
              requisitionDate: now.slice(0, 10),
            }
          : d
      )
    );

    inConfirmOrder.details.forEach((detail) => {
      updateAssetEquipment(detail.assetId, {
        requisitionDepartment: inConfirmOrder.toDepartment,
        requisitionEmployee: employee?.name || '',
        requisitionDate: now.slice(0, 10),
      });
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
    description: '资产调拨用于在不同部门之间调拨固定资产，支持一次选择多项资产进行调拨，需要调出方和调入方分别确认后完成。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"新增调拨单"按钮',
          '在资产选择弹窗中勾选多项资产（支持多选）',
          '选择调出部门和调入部门',
          '每项资产可单独修改调拨数量',
          '填写调拨原因和备注后保存'
        ]
      },
      {
        heading: '确认流程',
        items: [
          '待调出确认状态的调拨单，点击"调出确认"',
          '调出确认后状态变为"已调出待调入"',
          '待调入确认状态的调拨单，点击"调入确认"',
          '调入确认弹框显示调入部门及资产明细，需选择该部门的领用人（必填）',
          '确认后所有资产的领用部门和领用人自动更新为调入部门及所选人员'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '调拨单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印调拨单',
          '打印明细将包含所有调拨资产'
        ]
      },
      {
        heading: '统计卡片说明',
        items: [
          '本月调拨单：按制单日期为本月统计，包含所有状态的调拨单数量',
          '待调出部门确认：状态为 pending 的调拨单数量',
          '待调入确认：状态为 out_confirmed 的调拨单数量',
          '已完成：状态为 completed 的调拨单数量'
        ]
      },
      {
        heading: '反确认',
        items: [
          '待调入确认(out_confirmed)或已完成(completed)的调拨单可执行反确认',
          '反确认操作会回退单据状态为待调出部门确认，并清除调入部门和领用人信息',
          '点击操作栏的"反确认"按钮，确认后即可执行'
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

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} />
      </div>

      <Modal open={!!viewItem} title="调拨单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">调拨单号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.transferNo}</div>
              <div className="text-[#606266]">调出部门：</div>
              <div className="text-[#303133] col-span-2">{viewItem.fromDepartment}</div>
              <div className="text-[#606266]">调入部门：</div>
              <div className="text-[#303133] col-span-2">{viewItem.toDepartment}</div>
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
                  {viewItem.requisitionEmployee && (
                    <>
                      <div className="text-[#606266]">调入部门领用人：</div>
                      <div className="text-[#303133] col-span-2">
                        {viewItem.requisitionEmployee}（{viewItem.requisitionDepartment}）
                      </div>
                    </>
                  )}
                  <div className="text-[#606266]">调入确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.inConfirmTime}</div>
                </>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-[#303133] mb-2">资产明细（共 {viewItem.details.length} 项）</div>
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa]">
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
                      <tr key={d.id} className="border-t border-[#f0f2f5]">
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
                </table>
              </div>
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
        title={isNew ? '新增调拨单' : '编辑调拨单'}
        onClose={() => setEditItem(null)}
        width="max-w-[800px]"
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
              <div>
                <div className="mb-1 text-[#606266]">调拨原因</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.reason}
                  onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
                  placeholder="请输入调拨原因"
                />
              </div>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 资产明细
                  {editItem.details.length > 0 && (
                    <span className="ml-2 text-xs text-[#909399]">（共 {editItem.details.length} 项）</span>
                  )}
                </div>
                <DefaultButton onClick={() => setAssetPickerOpen(true)}>
                  <Search size={14} />
                  选择资产
                </DefaultButton>
              </div>

              {editItem.details.length === 0 ? (
                <div
                  className="border border-dashed border-[#dcdfe6] rounded py-8 text-center text-[#909399] cursor-pointer hover:border-[#2f54eb] hover:text-[#2f54eb] transition-colors"
                  onClick={() => setAssetPickerOpen(true)}
                >
                  点击选择资产或从资产列表勾选
                </div>
              ) : (
                <div className="border border-[#ebeef5] rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f5f7fa]">
                      <tr className="text-[#606266]">
                        <th className="px-3 py-2 text-left">物资编码</th>
                        <th className="px-3 py-2 text-left">物资名称</th>
                        <th className="px-3 py-2 text-left">规格</th>
                        <th className="px-3 py-2 text-left">单位</th>
                        <th className="px-3 py-2 text-center w-[100px]">数量</th>
                        <th className="px-3 py-2 text-left">所在仓库</th>
                        <th className="px-3 py-2 text-center w-[60px]">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editItem.details.map((d) => (
                        <tr key={d.id} className="border-t border-[#f0f2f5]">
                          <td className="px-3 py-2 text-[#303133]">{d.assetCode}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.assetName}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              className="w-16 h-6 px-1 border border-[#dcdfe6] rounded text-center text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                              value={d.quantity}
                              onChange={(e) =>
                                handleDetailQuantityChange(d.id, parseInt(e.target.value, 10) || 1)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-[#303133]">{d.warehouseName || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              className="text-[#f56c6c] hover:inline-flex hover:items-center"
                              onClick={() => handleRemoveDetail(d.id)}
                              title="移除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
        </div>
      </Modal>

      <Modal open={assetPickerOpen} title="选择资产（领用中，可多选）" onClose={() => setAssetPickerOpen(false)} width="max-w-[900px]">
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
            {editItem && editItem.details.length > 0 && (
              <div className="ml-auto text-xs text-[#409eff]">
                已选 {editItem.details.length} 项
              </div>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-[#909399] text-sm">暂无符合条件的领用中资产</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-center w-[40px]">
                      {editItem && editItem.details.length > 0 && (
                        <input
                          type="checkbox"
                          checked={editItem.details.length === filteredAssets.filter((a) => !selectedWarehouseId || a.warehouseId === selectedWarehouseId).length}
                          onChange={(e) => {
                            if (!editItem) return;
                            if (e.target.checked) {
                              const warehouse = warehouses.find((w) => w.id === selectedWarehouseId);
                              const newDetails = filteredAssets
                                .filter((a) => !editItem.details.some((d) => d.assetId === a.id))
                                .map((asset) => ({
                                  id: `DET-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                  assetTransferId: editItem.id,
                                  assetId: asset.id,
                                  assetCode: asset.code,
                                  assetName: asset.name,
                                  specification: asset.specification || '',
                                  unit: asset.unit,
                                  quantity: 1,
                                  warehouseId: asset.warehouseId,
                                  warehouseName: warehouses.find((w) => w.id === asset.warehouseId)?.name || '',
                                }));
                              setEditItem({ ...editItem, details: [...editItem.details, ...newDetails] });
                            } else {
                              const visibleIds = new Set(filteredAssets.map((a) => a.id));
                              setEditItem({ ...editItem, details: editItem.details.filter((d) => !visibleIds.has(d.assetId)) });
                            }
                          }}
                        />
                      )}
                    </th>
                    <th className="px-3 py-2 text-left">设备编码</th>
                    <th className="px-3 py-2 text-left">设备名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-left">所在仓库</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const warehouse = warehouses.find(w => w.id === asset.warehouseId);
                    const isChecked = editItem?.details.some((d) => d.assetId === asset.id) || false;
                    return (
                      <tr key={asset.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAsset(asset)}
                          />
                        </td>
                        <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{asset.unit}</td>
                        <td className="px-3 py-2 text-[#303133]">{warehouse?.name || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={inConfirmModalOpen}
        title="调入确认"
        onClose={() => {
          setInConfirmModalOpen(false);
          setInConfirmOrder(null);
          setInConfirmEmployee('');
        }}
        width="max-w-[600px]"
      >
        {inConfirmOrder && (
          <div className="space-y-4 text-sm">
            <div className="p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-[#606266]">调拨单号：</div>
                <div className="text-[#303133]">{inConfirmOrder.transferNo}</div>
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

            <div>
              <div className="text-[#606266] mb-2">资产明细（共 {inConfirmOrder.details.length} 项）</div>
              <div className="border border-[#ebeef5] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa]">
                    <tr className="text-[#606266]">
                      <th className="px-3 py-2 text-left">序号</th>
                      <th className="px-3 py-2 text-left">物资编码</th>
                      <th className="px-3 py-2 text-left">物资名称</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">单位</th>
                      <th className="px-3 py-2 text-right">数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inConfirmOrder.details.map((d, idx) => (
                      <tr key={d.id} className="border-t border-[#f0f2f5]">
                        <td className="px-3 py-2 text-[#303133]">{idx + 1}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.assetCode}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.assetName}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                        <td className="px-3 py-2 text-right text-[#303133]">{d.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border border-[#ebeef5] rounded bg-[#ecf5ff] text-xs text-[#409eff]">
              确认后，所有资产的领用部门将变更为「{inConfirmOrder.toDepartment}」，领用人将变更为所选人员，领用日期为今日。
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
          details={printItem.details.map((d) => ({
            productCode: d.assetCode,
            productName: d.assetName,
            specification: d.specification,
            unit: d.unit,
            quantity: d.quantity,
            remark: `调出→调入：${printItem.fromDepartment} → ${printItem.toDepartment}，调拨原因：${printItem.reason}`,
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