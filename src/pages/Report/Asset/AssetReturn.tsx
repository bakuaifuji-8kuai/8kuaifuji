import { useState, useMemo } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { Plus, Eye, Package, Clock, CheckCircle2, Printer, RotateCcw, Trash2, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

interface ReturnDetail {
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
}

interface SourceOrderDetail {
  assetId: string;
  assetCode: string;
  assetName: string;
  specification: string;
  unit: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
}

interface SourceOrder {
  id: string;
  orderNo: string;
  sourceType: 'requisition' | 'scrap' | 'loss';
  sourceTypeName: string;
  applicant: string;
  department: string;
  details: SourceOrderDetail[];
  date: string;
  status: string;
}

interface AssetReturn {
  id: string;
  returnNo: string;
  sourceOrderId: string;
  sourceOrderNo: string;
  sourceType: string;
  details: ReturnDetail[];
  applicant: string;
  department: string;
  requisitionDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  status: 'pending_in' | 'completed' | 'cancelled';
  condition: string;
  purpose: string;
  remark: string;
  inConfirmer?: string;
  inConfirmTime?: string;
}

const generateReturnNo = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZCGL${dateStr}${random}`;
};

const conditionOptions = ['完好', '轻微磨损', '损坏', '丢失'];

const sourceOrdersData: SourceOrder[] = [
  {
    id: 'SO-LY-001',
    orderNo: 'ZCLY20240603001',
    sourceType: 'requisition',
    sourceTypeName: '领用单',
    applicant: '王五',
    department: '宣传部',
    date: '2024-06-03',
    status: '已出库',
    details: [
      { assetId: 'AE003', assetCode: 'SB20240003', assetName: '激光切割机', specification: 'LCT-3015', unit: '台', quantity: 1, warehouseId: 'WH001', warehouseName: '主仓库' },
      { assetId: 'AE006', assetCode: 'SB20240006', assetName: '投影仪', specification: 'CB-X05', unit: '台', quantity: 2, warehouseId: 'WH001', warehouseName: '主仓库' },
    ],
  },
  {
    id: 'SO-LY-002',
    orderNo: 'ZCLY20240605001',
    sourceType: 'requisition',
    sourceTypeName: '领用单',
    applicant: '孙七',
    department: '展览部',
    date: '2024-06-10',
    status: '已出库',
    details: [
      { assetId: 'AE005', assetCode: 'SB20240005', assetName: '叉车', specification: 'CPCD30', unit: '辆', quantity: 1, warehouseId: 'WH001', warehouseName: '主仓库' },
    ],
  },
  {
    id: 'SO-BF-001',
    orderNo: 'ZCBF20240601001',
    sourceType: 'scrap',
    sourceTypeName: '报废单',
    applicant: '管理员',
    department: '技术部',
    date: '2024-06-01',
    status: '已确认',
    details: [
      { assetId: 'AE001', assetCode: 'SB20240001', assetName: '办公桌', specification: '1.4m×0.7m', unit: '张', quantity: 3, warehouseId: 'WH001', warehouseName: '主仓库' },
      { assetId: 'AE002', assetCode: 'SB20240002', assetName: '办公椅', specification: '人体工学款', unit: '把', quantity: 5, warehouseId: 'WH001', warehouseName: '主仓库' },
    ],
  },
  {
    id: 'SO-BS-001',
    orderNo: 'ZCBS20240601001',
    sourceType: 'loss',
    sourceTypeName: '报损单',
    applicant: '管理员',
    department: '行政部',
    date: '2024-06-01',
    status: '已确认',
    details: [
      { assetId: 'AE004', assetCode: 'SB20240004', assetName: '空调', specification: '格力3匹', unit: '台', quantity: 1, warehouseId: 'WH001', warehouseName: '主仓库' },
    ],
  },
];

const initialData: AssetReturn[] = [
  {
    id: 'RT001',
    returnNo: 'ZCGL20240609001',
    sourceOrderId: 'SO-LY-001',
    sourceOrderNo: 'ZCLY20240603001',
    sourceType: 'requisition',
    details: [
      {
        assetId: 'AE003',
        assetCode: 'SB20240003',
        assetName: '激光切割机',
        specification: 'LCT-3015',
        unit: '台',
        quantity: 1,
        warehouseId: 'WH001',
        warehouseName: '主仓库',
      },
    ],
    applicant: '王五',
    department: '宣传部',
    requisitionDate: '2024-06-03',
    expectedReturnDate: '2024-06-10',
    actualReturnDate: '2024-06-09',
    status: 'completed',
    condition: '完好',
    purpose: '活动拍摄',
    remark: '设备完好无损',
    inConfirmer: '管理员',
    inConfirmTime: '2024-06-09 16:00',
  },
  {
    id: 'RT002',
    returnNo: 'ZCGL20240612001',
    sourceOrderId: 'SO-LY-002',
    sourceOrderNo: 'ZCLY20240605001',
    sourceType: 'requisition',
    details: [
      {
        assetId: 'AE005',
        assetCode: 'SB20240005',
        assetName: '叉车',
        specification: 'CPCD30',
        unit: '辆',
        quantity: 1,
        warehouseId: 'WH001',
        warehouseName: '主仓库',
      },
    ],
    applicant: '孙七',
    department: '展览部',
    requisitionDate: '2024-06-10',
    expectedReturnDate: '2024-06-25',
    actualReturnDate: '2024-06-12',
    status: 'pending_in',
    condition: '轻微磨损',
    purpose: '展会搭建',
    remark: '车身有轻微划痕',
  },
];

export default function AssetReturn() {
  const { assetEquipments, updateAssetEquipment } = useStore();

  const [data, setData] = useState<AssetReturn[]>(initialData);

  const [filterNo, setFilterNo] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState({
    no: '',
    assetName: '',
    applicant: '',
    status: '',
    from: '',
    to: '',
  });

  const filteredData = useMemo(() => {
    return data.filter((o) => {
      if (applied.no && !o.returnNo.includes(applied.no)) return false;
      if (applied.assetName && !o.details.some((d) => d.assetName.includes(applied.assetName))) return false;
      if (applied.applicant && !o.applicant.includes(applied.applicant)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.from && o.actualReturnDate < applied.from) return false;
      if (applied.to && o.actualReturnDate > applied.to + ' 23:59:59') return false;
      return true;
    });
  }, [data, applied]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthCount = data.filter((d) => d.actualReturnDate.startsWith(monthStr)).length;
    const pendingCount = data.filter((d) => d.status === 'pending_in').length;
    const completedCount = data.filter((d) => d.status === 'completed').length;
    return { monthCount, pendingCount, completedCount };
  }, [data]);

  const statusText = (s: string) => {
    if (s === 'pending_in') return '待入库确认';
    if (s === 'completed') return '已归还入库';
    if (s === 'cancelled') return '已取消';
    return s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending_in') return 'text-[#e6a23c]';
    if (s === 'completed') return 'text-[#67c23a]';
    if (s === 'cancelled') return 'text-[#909399]';
    return '';
  };

  const columns: ColumnDef<AssetReturn>[] = [
    { key: 'returnNo', title: '归还单号' },
    {
      key: 'sourceOrderNo',
      title: '来源单据',
      render: (row) => <span className="text-[#2f54eb]">{row.sourceOrderNo || '-'}</span>,
    },
    {
      key: 'itemCount',
      title: '物资数量',
      render: (row) => <span>{row.details.length} 项</span>,
    },
    { key: 'applicant', title: '领用人' },
    { key: 'department', title: '领用部门' },
    { key: 'condition', title: '完好情况' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span className={statusColor(row.status)}>{statusText(row.status)}</span>,
    },
    { key: 'actualReturnDate', title: '归还日期' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => handlePrint(row)}>
            <Printer size={12} /> 打印
          </TextButton>
          {row.status === 'pending_in' && (
            <>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.returnNo}？`)) {
                    setData(data.filter((d) => d.id !== row.id));
                  }
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleInConfirm(row.id)}>确认入库</TextButton>
            </>
          )}
          {row.status === 'completed' && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<AssetReturn | null>(null);
  const [editItem, setEditItem] = useState<AssetReturn | null>(null);
  const [editDetails, setEditDetails] = useState<ReturnDetail[]>([]);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [selectedSourceOrder, setSelectedSourceOrder] = useState<SourceOrder | null>(null);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<string[]>([]);

  const openAdd = () => {
    const newItem: AssetReturn = {
      id: 'RT' + Date.now(),
      returnNo: generateReturnNo(),
      sourceOrderId: '',
      sourceOrderNo: '',
      sourceType: '',
      details: [],
      applicant: '',
      department: '',
      requisitionDate: '',
      expectedReturnDate: '',
      actualReturnDate: new Date().toISOString().slice(0, 10),
      status: 'pending_in',
      condition: '完好',
      purpose: '',
      remark: '',
    };
    setEditItem(newItem);
    setEditDetails([]);
    setSelectedSourceOrder(null);
    setPickerSelectedIds([]);
  };

  const handleSelectSourceOrder = (order: SourceOrder) => {
    setSelectedSourceOrder(order);
    setEditItem((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        sourceType: order.sourceType,
        applicant: order.applicant,
        department: order.department,
        requisitionDate: order.date,
      };
    });
    setEditDetails([]);
    setPickerSelectedIds([]);
    setSourcePickerOpen(false);
    setAssetPickerOpen(true);
  };

  const handleConfirmPick = () => {
    if (!selectedSourceOrder) return;
    const existingIds = new Set(editDetails.map((d) => d.assetId));
    const newDetails: ReturnDetail[] = [];

    for (const id of pickerSelectedIds) {
      if (existingIds.has(id)) continue;
      const srcDetail = selectedSourceOrder.details.find((d) => d.assetId === id);
      if (!srcDetail) continue;
      newDetails.push({
        assetId: srcDetail.assetId,
        assetCode: srcDetail.assetCode,
        assetName: srcDetail.assetName,
        specification: srcDetail.specification,
        unit: srcDetail.unit,
        quantity: srcDetail.quantity,
        warehouseId: srcDetail.warehouseId,
        warehouseName: srcDetail.warehouseName,
      });
    }

    setEditDetails([...editDetails, ...newDetails]);
    setPickerSelectedIds([]);
    setAssetPickerOpen(false);
  };

  const handleRemoveDetail = (index: number) => {
    setEditDetails(editDetails.filter((_, i) => i !== index));
  };

  const handleUpdateDetailQty = (index: number, qty: number) => {
    if (qty < 1) qty = 1;
    setEditDetails(editDetails.map((d, i) => (i === index ? { ...d, quantity: qty } : d)));
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.sourceOrderId) {
      alert('请先选择来源单据');
      return;
    }
    if (editDetails.length === 0) {
      alert('请至少选择一项资产');
      return;
    }
    if (!editItem.actualReturnDate) {
      alert('请选择归还日期');
      return;
    }
    if (!editItem.condition) {
      alert('请选择完好情况');
      return;
    }
    for (const d of editDetails) {
      if (d.quantity < 1) {
        alert(`${d.assetName} 的数量必须大于等于1`);
        return;
      }
    }
    const newItem: AssetReturn = { ...editItem, details: editDetails };
    setData([newItem, ...data]);
    setEditItem(null);
    setEditDetails([]);
    setSelectedSourceOrder(null);
  };

  const handleInConfirm = (id: string) => {
    const order = data.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'pending_in') return;
    if (!confirm(`确认入库 ${order.returnNo}？确认后 ${order.details.length} 项资产状态将变更为在仓。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'completed',
              inConfirmer: '当前用户',
              inConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : d
      )
    );

    order.details.forEach((detail) => {
      updateAssetEquipment(detail.assetId, {
        status: 'in_storage',
        requisitionDepartment: '',
        requisitionEmployee: '',
        requisitionDate: '',
      });
    });
  };

  const handleReverseConfirm = (id: string) => {
    const order = data.find((o) => o.id === id);
    if (!order) return;
    if (!confirm(`确认反确认归还单 ${order.returnNo}？反确认后单据将回退到待入库状态，资产状态将恢复为领用中。`)) return;

    setData(
      data.map((d) =>
        d.id === id
          ? { ...d, status: 'pending_in' as const }
          : d
      )
    );

    order.details.forEach((detail) => {
      updateAssetEquipment(detail.assetId, {
        status: 'in_use',
        requisitionDepartment: order.department,
      });
    });

    alert(`反确认成功！归还单 ${order.returnNo} 已回退到待入库状态。`);
  };

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printItem, setPrintItem] = useState<AssetReturn | null>(null);

  const handlePrint = (row: AssetReturn) => {
    setViewItem(null);
    setPrintItem(row);
    setPrintTrigger((prev) => prev + 1);
  };

  const helpContent = {
    title: '资产归还功能说明',
    description: '资产归还用于将领用/报废/报损的固定资产归还入库。必须先选择来源单据，再从中多选资产进行归还。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"归还登记"按钮',
          '点击"选择来源单据"，选择领用单/报废单/报损单',
          '从来源单据中勾选要归还的资产（支持复选框多选）',
          '每项资产可单独设置归还数量',
          '填写完好情况、备注等信息',
          '保存后生成归还单（待入库确认状态）'
        ]
      },
      {
        heading: '确认入库',
        items: [
          '待入库确认状态的归还单，点击"确认入库"',
          '确认后所有资产状态统一变更为在仓',
          '同时清空每项资产的领用部门、领用人等信息'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '归还单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印归还单',
          '打印单会列出所有归还的资产明细'
        ]
      },
      {
        heading: '统计卡片说明',
        items: [
          '本月归还：按实际归还日期为本月统计，包含所有状态的归还单数量',
          '待入库确认：状态为 pending_in（待入库确认）的归还单数量',
          '已归还入库：状态为 completed（已入库）的归还单数量'
        ]
      },
      {
        heading: '反确认',
        items: [
          '已归还入库(completed)的归还单可执行反确认',
          '反确认操作会回退单据状态为待入库确认，并将资产状态恢复为领用中',
          '点击操作栏的"反确认"按钮，确认后即可执行'
        ]
      }
    ]
  };

  const statusOptions = [
    { value: '', label: '全部' },
    { value: 'pending_in', label: '待入库确认' },
    { value: 'completed', label: '已归还入库' },
    { value: 'cancelled', label: '已取消' },
  ];

  const [sourceFilterType, setSourceFilterType] = useState('');
  const [sourceFilterNo, setSourceFilterNo] = useState('');

  const filteredSourceOrders = useMemo(() => {
    return sourceOrdersData.filter((o) => {
      if (sourceFilterType && o.sourceType !== sourceFilterType) return false;
      if (sourceFilterNo && !o.orderNo.includes(sourceFilterNo)) return false;
      return true;
    });
  }, [sourceFilterType, sourceFilterNo]);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">资产归还管理</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <PrimaryButton onClick={openAdd}>
          <Plus size={14} /> 归还登记
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">本月归还</div>
              <div className="text-2xl font-bold text-[#303133]">{stats.monthCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f0f9eb] flex items-center justify-center">
              <RotateCcw className="text-[#67c23a]" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">待入库确认</div>
              <div className="text-2xl font-bold text-[#e6a23c]">{stats.pendingCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fdf6ec] flex items-center justify-center">
              <Clock className="text-[#e6a23c]" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">已归还入库</div>
              <div className="text-2xl font-bold text-[#67c23a]">{stats.completedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f0f9eb] flex items-center justify-center">
              <CheckCircle2 className="text-[#67c23a]" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-[#e4e7ed] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#606266] mb-1">待归还资产</div>
              <div className="text-2xl font-bold text-[#409eff]">
                {sourceOrdersData.reduce((sum, o) => sum + o.details.length, 0)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ecf5ff] flex items-center justify-center">
              <Package className="text-[#409eff]" size={20} />
            </div>
          </div>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({
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
          setApplied({
            no: '',
            assetName: '',
            applicant: '',
            status: '',
            from: '',
            to: '',
          });
        }}
      >
        <SearchField label="归还单号" type="input" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="资产名称" type="input" placeholder="请输入" value={filterAssetName} onChange={setFilterAssetName} />
        <SearchField label="领用人" type="input" placeholder="请输入" value={filterApplicant} onChange={setFilterApplicant} />
        <SearchField label="状态" type="select" options={statusOptions} value={filterStatus} onChange={setFilterStatus} placeholder="全部" />
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} />
      </SearchBar>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} />
      </div>

      <Modal open={!!viewItem} title="归还单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div className="text-[#606266]">归还单号：</div>
              <div className="text-[#303133] col-span-2">{viewItem.returnNo}</div>
              <div className="text-[#606266]">来源单据：</div>
              <div className="text-[#2f54eb] col-span-2">{viewItem.sourceOrderNo} ({viewItem.sourceType === 'requisition' ? '领用单' : viewItem.sourceType === 'scrap' ? '报废单' : '报损单'})</div>
              <div className="text-[#606266]">领用人：</div>
              <div className="text-[#303133] col-span-2">{viewItem.applicant}</div>
              <div className="text-[#606266]">领用部门：</div>
              <div className="text-[#303133] col-span-2">{viewItem.department}</div>
              <div className="text-[#606266]">状态：</div>
              <div className={statusColor(viewItem.status) + ' col-span-2'}>
                {statusText(viewItem.status)}
              </div>
              <div className="text-[#606266]">领用日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.requisitionDate || '-'}</div>
              <div className="text-[#606266]">应还日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.expectedReturnDate || '-'}</div>
              <div className="text-[#606266]">实际归还日期：</div>
              <div className="text-[#303133] col-span-2">{viewItem.actualReturnDate}</div>
              <div className="text-[#606266]">完好情况：</div>
              <div className="text-[#303133] col-span-2">{viewItem.condition}</div>
              {viewItem.inConfirmer && (
                <>
                  <div className="text-[#606266]">入库确认人：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.inConfirmer}</div>
                  <div className="text-[#606266]">入库确认时间：</div>
                  <div className="text-[#303133] col-span-2">{viewItem.inConfirmTime}</div>
                </>
              )}
            </div>

            <div className="border border-[#ebeef5] rounded">
              <div className="px-3 py-2 bg-[#f5f7fa] text-xs font-medium text-[#606266]">
                资产明细（共 {viewItem.details.length} 项）
              </div>
              <table className="w-full text-xs">
                <thead className="bg-[#fafbfc]">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">物资编码</th>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.details.map((d, i) => (
                    <tr key={i} className="border-t border-[#f0f2f5]">
                      <td className="px-3 py-2 text-[#303133]">{d.assetCode}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.assetName}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                      <td className="px-3 py-2 text-right text-[#303133]">
                        {d.quantity} {d.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
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
        title="资产归还登记"
        onClose={() => {
          setEditItem(null);
          setEditDetails([]);
          setSelectedSourceOrder(null);
        }}
        width="max-w-[700px]"
      >
        {editItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-[#606266]">归还单号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.returnNo}
                  readOnly
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 归还日期
                </div>
                <input
                  type="date"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.actualReturnDate}
                  onChange={(e) => setEditItem({ ...editItem, actualReturnDate: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">领用人</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.applicant}
                  onChange={(e) => setEditItem({ ...editItem, applicant: e.target.value })}
                  placeholder="选择来源单据后自动带出"
                  readOnly={!!editItem.sourceOrderId}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">领用部门</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.department}
                  onChange={(e) => setEditItem({ ...editItem, department: e.target.value })}
                  placeholder="选择来源单据后自动带出"
                  readOnly={!!editItem.sourceOrderId}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 完好情况
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                  value={editItem.condition}
                  onChange={(e) => setEditItem({ ...editItem, condition: e.target.value })}
                >
                  {conditionOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-[#ebeef5] rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 来源单据
                </div>
                {!editItem.sourceOrderId ? (
                  <DefaultButton onClick={() => setSourcePickerOpen(true)}>选择来源单据</DefaultButton>
                ) : (
                  <TextButton
                    onClick={() => {
                      setSelectedSourceOrder(null);
                      setEditDetails([]);
                      setEditItem({
                        ...editItem,
                        sourceOrderId: '',
                        sourceOrderNo: '',
                        sourceType: '',
                        applicant: '',
                        department: '',
                        requisitionDate: '',
                      });
                    }}
                  >
                    重新选择
                  </TextButton>
                )}
              </div>
              {editItem.sourceOrderId ? (
                <div className="text-xs p-2 bg-[#f5f7fa] rounded border border-[#ebeef5]">
                  <div className="flex gap-4">
                    <span className="text-[#606266]">单据编号：</span>
                    <span className="text-[#2f54eb]">{editItem.sourceOrderNo}</span>
                    <span className="text-[#606266]">类型：</span>
                    <span>{editItem.sourceType === 'requisition' ? '领用单' : editItem.sourceType === 'scrap' ? '报废单' : '报损单'}</span>
                    <span className="text-[#606266]">日期：</span>
                    <span>{editItem.requisitionDate}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#dcdfe6] rounded">
                  请先选择来源单据（领用单/报废单/报损单）
                </div>
              )}
            </div>

            {editItem.sourceOrderId && (
              <div className="border border-[#ebeef5] rounded">
                <div className="flex items-center justify-between px-3 py-2 bg-[#f5f7fa]">
                  <div className="text-xs font-medium text-[#606266]">
                    资产明细（共 {editDetails.length} 项）
                  </div>
                  <DefaultButton onClick={() => setAssetPickerOpen(true)}>从来源单据选择资产</DefaultButton>
                </div>
                {editDetails.length === 0 ? (
                  <div className="text-center py-6 text-[#909399] text-xs">
                    暂无资产，请点击"从来源单据选择资产"添加
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-[#fafbfc]">
                      <tr className="text-[#606266]">
                        <th className="px-3 py-2 text-left">物资编码</th>
                        <th className="px-3 py-2 text-left">物资名称</th>
                        <th className="px-3 py-2 text-left">规格</th>
                        <th className="px-3 py-2 text-left">单位</th>
                        <th className="px-3 py-2 text-center w-[100px]">
                          <span className="text-[#f56c6c]">*</span> 数量
                        </th>
                        <th className="px-3 py-2 text-center w-[60px]">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editDetails.map((d, i) => (
                        <tr key={i} className="border-t border-[#f0f2f5]">
                          <td className="px-3 py-2 text-[#303133]">{d.assetCode}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.assetName}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.specification || '-'}</td>
                          <td className="px-3 py-2 text-[#303133]">{d.unit}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              className="w-16 h-7 px-2 border border-[#dcdfe6] rounded text-center text-[#303133] focus:outline-none focus:border-[#2f54eb]"
                              value={d.quantity}
                              onChange={(e) =>
                                handleUpdateDetailQty(i, parseInt(e.target.value, 10) || 1)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              className="text-[#f56c6c] hover:inline-flex hover:items-center hover:gap-0.5"
                              onClick={() => handleRemoveDetail(i)}
                            >
                              <Trash2 size={12} /> 删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

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
          <DefaultButton
            onClick={() => {
              setEditItem(null);
              setEditDetails([]);
              setSelectedSourceOrder(null);
            }}
          >
            取消
          </DefaultButton>
          <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
        </div>
      </Modal>

      <Modal
        open={sourcePickerOpen}
        title="选择来源单据"
        onClose={() => setSourcePickerOpen(false)}
        width="max-w-[800px]"
      >
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <div className="text-xs text-[#606266]">单据类型：</div>
            <select
              className="h-7 px-2 border border-[#dcdfe6] rounded text-xs"
              value={sourceFilterType}
              onChange={(e) => setSourceFilterType(e.target.value)}
            >
              <option value="">全部</option>
              <option value="requisition">领用单</option>
              <option value="scrap">报废单</option>
              <option value="loss">报损单</option>
            </select>
            <input
              className="h-7 px-2 border border-[#dcdfe6] rounded text-xs"
              placeholder="搜索单据编号"
              value={sourceFilterNo}
              onChange={(e) => setSourceFilterNo(e.target.value)}
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            {filteredSourceOrders.length === 0 ? (
              <div className="text-center py-8 text-[#909399] text-sm">暂无符合条件的来源单据</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">单据编号</th>
                    <th className="px-3 py-2 text-left">类型</th>
                    <th className="px-3 py-2 text-left">领用人</th>
                    <th className="px-3 py-2 text-left">部门</th>
                    <th className="px-3 py-2 text-left">日期</th>
                    <th className="px-3 py-2 text-center">物资数</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSourceOrders.map((order) => (
                    <tr key={order.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                      <td className="px-3 py-2 text-[#2f54eb]">{order.orderNo}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          order.sourceType === 'requisition' ? 'bg-[#ecf5ff] text-[#409eff]' :
                          order.sourceType === 'scrap' ? 'bg-[#fef0f0] text-[#f56c6c]' :
                          'bg-[#fdf6ec] text-[#e6a23c]'
                        }`}>
                          {order.sourceTypeName}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[#303133]">{order.applicant}</td>
                      <td className="px-3 py-2 text-[#303133]">{order.department}</td>
                      <td className="px-3 py-2 text-[#303133]">{order.date}</td>
                      <td className="px-3 py-2 text-center text-[#303133]">{order.details.length}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          className="text-[#2f54eb] hover:underline"
                          onClick={() => handleSelectSourceOrder(order)}
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
        </div>
      </Modal>

      <Modal
        open={assetPickerOpen}
        title={selectedSourceOrder ? `选择资产 - ${selectedSourceOrder.orderNo}（可多选）` : '选择资产'}
        onClose={() => setAssetPickerOpen(false)}
        width="max-w-[900px]"
      >
        <div className="space-y-3">
          <div className="text-xs text-[#606266]">
            请勾选要归还的资产（已选 {pickerSelectedIds.length} 项），已添加的资产不可重复选择
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            {selectedSourceOrder && selectedSourceOrder.details.length === 0 ? (
              <div className="text-center py-8 text-[#909399] text-sm">该单据暂无资产明细</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left w-[40px]"></th>
                    <th className="px-3 py-2 text-left">设备编码</th>
                    <th className="px-3 py-2 text-left">设备名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-center">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSourceOrder?.details.map((asset) => {
                    const alreadyAdded = editDetails.some((d) => d.assetId === asset.assetId);
                    const isSelected = pickerSelectedIds.includes(asset.assetId);
                    return (
                      <tr
                        key={asset.assetId}
                        className={`border-t border-[#f0f2f5] ${
                          alreadyAdded
                            ? 'bg-[#f5f7fa] text-[#c0c4cc]'
                            : 'hover:bg-[#f5f7fa] text-[#303133]'
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={alreadyAdded}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPickerSelectedIds([...pickerSelectedIds, asset.assetId]);
                              } else {
                                setPickerSelectedIds(pickerSelectedIds.filter((id) => id !== asset.assetId));
                              }
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">{asset.assetCode}</td>
                        <td className="px-3 py-2">{asset.assetName}</td>
                        <td className="px-3 py-2">{asset.specification || '-'}</td>
                        <td className="px-3 py-2">{asset.unit}</td>
                        <td className="px-3 py-2 text-center">{asset.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#909399]">
              已添加的资产显示为灰色不可重复选择
            </div>
            <div className="flex gap-2">
              <DefaultButton onClick={() => setAssetPickerOpen(false)}>取消</DefaultButton>
              <PrimaryButton onClick={handleConfirmPick} disabled={pickerSelectedIds.length === 0}>
                确认添加 ({pickerSelectedIds.length})
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
          title="资产归还单"
          orderNo={printItem.returnNo}
          orderType="资产归还"
          orderDate={printItem.actualReturnDate}
          warehouseName={printItem.department}
          custodian={printItem.applicant}
          remark={printItem.remark}
          details={printItem.details.map((d) => ({
            productCode: d.assetCode,
            productName: d.assetName,
            specification: d.specification,
            unit: d.unit,
            quantity: d.quantity,
            remark: `完好情况：${printItem.condition}`,
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
