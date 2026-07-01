import { useState, useMemo } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { Plus, Eye, Package, Clock, CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import PrintDocument from '@/components/common/PrintDocument';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

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

const initialData: AssetReturn[] = [
  {
    id: 'RT001',
    returnNo: 'ZCGL20240609001',
    requisitionNo: 'ZCLY20240603001',
    assetId: 'AE003',
    assetCode: 'SB20240003',
    assetName: '激光切割机',
    specification: 'LCT-3015',
    unit: '台',
    quantity: 1,
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
    requisitionNo: 'ZCLY20240605001',
    assetId: 'AE005',
    assetCode: 'SB20240005',
    assetName: '叉车',
    specification: 'CPCD30',
    unit: '辆',
    quantity: 1,
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
  const { assetEquipments, updateAssetEquipment, employees } = useStore();

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
      if (applied.assetName && !o.assetName.includes(applied.assetName)) return false;
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

  const inUseAssets = useMemo(() => {
    return assetEquipments.filter((a) => a.status === 'in_use');
  }, [assetEquipments]);

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
    { key: 'assetCode', title: '设备编码' },
    { key: 'assetName', title: '资产名称' },
    { key: 'specification', title: '规格型号' },
    { key: 'quantity', title: '数量', align: 'right' },
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
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<AssetReturn | null>(null);
  const [editItem, setEditItem] = useState<AssetReturn | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const handleSelectAsset = (asset: typeof assetEquipments[0]) => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      specification: asset.specification || '',
      unit: asset.unit,
      quantity: 1,
      applicant: asset.requisitionEmployee || '',
      department: asset.requisitionDepartment || '',
      requisitionDate: asset.requisitionDate || '',
      expectedReturnDate: '',
    });
    setAssetPickerOpen(false);
  };

  const openAdd = () => {
    const newItem: AssetReturn = {
      id: 'RT' + Date.now(),
      returnNo: generateReturnNo(),
      requisitionNo: '',
      assetId: '',
      assetCode: '',
      assetName: '',
      specification: '',
      unit: '台',
      quantity: 1,
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
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.assetId) {
      alert('请选择领用中的资产');
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
    setData([editItem, ...data]);
    setEditItem(null);
  };

  const handleInConfirm = (id: string) => {
    const order = data.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'pending_in') return;
    if (!confirm(`确认入库 ${order.returnNo}？确认后资产状态将变更为在仓。`)) return;

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

    updateAssetEquipment(order.assetId, {
      status: 'in_storage',
      requisitionDepartment: '',
      requisitionEmployee: '',
      requisitionDate: '',
    });
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
    description: '资产归还用于将领用的固定资产归还入库，确认入库后资产状态变更为在仓。',
    sections: [
      {
        heading: '新增操作',
        items: [
          '点击"归还登记"按钮',
          '从领用中的资产列表选择要归还的资产',
          '填写完好情况、备注等信息',
          '保存后生成归还单（待入库确认状态）'
        ]
      },
      {
        heading: '确认入库',
        items: [
          '待入库确认状态的归还单，点击"确认入库"',
          '确认后资产状态变更为在仓',
          '同时清空领用部门、领用人等信息'
        ]
      },
      {
        heading: '打印功能',
        items: [
          '归还单生成后即可打印，与状态无关',
          '点击操作栏的"打印"按钮即可打印归还单'
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
              <div className="text-xs text-[#606266] mb-1">领用中</div>
              <div className="text-2xl font-bold text-[#409eff]">{inUseAssets.length}</div>
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
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
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
        onClose={() => setEditItem(null)}
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
                  <span className="text-[#f56c6c]">*</span> 选择资产（领用中）
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    className="flex-1 h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133] cursor-pointer"
                    value={editItem.assetName || '请选择领用中的资产'}
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
                <div className="mb-1 text-[#606266]">领用人</div>
                <input
                  readOnly
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133]"
                  value={editItem.applicant}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">领用部门</div>
                <input
                  readOnly
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#303133]"
                  value={editItem.department}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">
                  <span className="text-[#f56c6c]">*</span> 归还数量
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

      <Modal open={assetPickerOpen} title="选择资产（领用中）" onClose={() => setAssetPickerOpen(false)} width="max-w-[900px]">
        <div className="space-y-3">
          <div className="max-h-[400px] overflow-y-auto border border-[#ebeef5] rounded">
            {inUseAssets.length === 0 ? (
              <div className="text-center py-8 text-[#909399] text-sm">暂无领用中的资产</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">设备编码</th>
                    <th className="px-3 py-2 text-left">设备名称</th>
                    <th className="px-3 py-2 text-left">规格型号</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-left">领用部门</th>
                    <th className="px-3 py-2 text-left">领用人</th>
                    <th className="px-3 py-2 text-left">领用日期</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {inUseAssets.map((asset) => (
                    <tr key={asset.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                      <td className="px-3 py-2 text-[#303133]">{asset.code}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.name}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.specification || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.unit}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.requisitionDepartment || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.requisitionEmployee || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{asset.requisitionDate || '-'}</td>
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
          title="资产归还单"
          orderNo={printItem.returnNo}
          orderType="资产归还"
          orderDate={printItem.actualReturnDate}
          warehouseName={printItem.department}
          custodian={printItem.applicant}
          remark={printItem.remark}
          details={[
            {
              productCode: printItem.assetCode,
              productName: printItem.assetName,
              specification: printItem.specification,
              unit: printItem.unit,
              quantity: printItem.quantity,
              remark: `领用部门：${printItem.department}，完好情况：${printItem.condition}`,
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
