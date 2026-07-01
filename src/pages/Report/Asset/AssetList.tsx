import { useState, useMemo } from 'react';
import { Printer, Edit } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DefaultButton, TextButton, PrimaryButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { useStore } from '@/store/useStore';
import type { AssetEquipment } from '@/types';

const helpContent = {
  title: '资产档案管理 - 功能操作说明',
  description: '资产档案用于管理固定资产设备信息，记录固定资产从入账、领用、归还到报废、报损的全生命周期。资产档案由资产领用流程自动生成，不可手工新增。',
  sections: [
    {
      heading: '一、资产档案概述',
      items: [
        '数据来源：资产档案不可手工新增，只能通过【固定资产领用出库】流程自动生成',
        '生成规则：每领用一台/套固定资产，系统自动创建一条对应的资产档案记录',
        '设备编码：每条资产档案拥有唯一的设备编码，用于标识单台/套固定资产',
        '记录内容：包含设备基本信息、金额、存放地点、状态、领用信息、备注等',
        '生命周期：入账 → 在仓 → 领用中 → 归还（在仓）→ 报废/报损（终态）'
      ]
    },
    {
      heading: '二、状态说明与流转逻辑',
      items: [
        '在仓（灰色）：固定资产在仓库中，尚未被领用，可被领用出库',
        '领用中（绿色）：固定资产已被领用出库，当前正在使用中，不可再次领用',
        '已报废（红色）：固定资产已通过资产报废流程处理，为终态，不可再操作',
        '已报损（橙色）：固定资产已通过资产报损流程处理，为终态，不可再操作',
        '状态流转：初始状态为「在仓」→ 领用后变「领用中」→ 归还后变回「在仓」→ 报废/报损后为终态',
        '边界规则：已报废/已报损的资产不可进行领用、归还、编辑等任何操作'
      ]
    },
    {
      heading: '三、统计指标说明',
      items: [
        '资产总数：当前所有状态的资产档案总条数（含报废、报损）',
        '在仓资产：状态为「在仓」的资产数量，即可用资产数量',
        '在用资产：状态为「领用中」的资产数量，即当前借出使用的资产数量',
        '已报废：状态为「已报废」的资产数量',
        '资产总值：所有资产的金额合计（含所有状态，含报废报损）'
      ]
    },
    {
      heading: '四、数据筛选功能',
      items: [
        '设备编码筛选：支持模糊匹配，输入编码的部分内容即可查询，不区分大小写',
        '设备名称筛选：支持模糊匹配，输入名称的部分内容即可查询，不区分大小写',
        '状态筛选：下拉选择某一状态进行精确筛选，默认显示全部状态',
        '组合筛选：多个筛选条件同时生效，取交集（同时满足所有条件）',
        '重置按钮：一键清空所有筛选条件，恢复显示全部数据',
        '边界规则：筛选条件为空时，显示全部资产档案数据'
      ]
    },
    {
      heading: '五、查看详情功能',
      items: [
        '操作入口：点击列表操作列的「查看」按钮，打开详情弹窗',
        '基本信息：设备编码、设备名称、规格型号、计量单位、金额、存放地点',
        '状态信息：显示当前资产状态，带状态标签颜色标识',
        '时间信息：入账日期（资产档案创建时间）',
        '领用信息：领用部门、领用人、领用日期 — 仅在「领用中」状态时显示，其他状态不显示',
        '备注信息：显示资产备注内容，无备注时显示「-」',
        '弹窗操作：可点击「关闭」关闭弹窗，或点击「打印标签」直接跳转到打印预览'
      ]
    },
    {
      heading: '六、编辑功能',
      items: [
        '操作入口：点击列表操作列的「编辑」按钮，打开编辑弹窗',
        '可编辑字段：仅支持编辑「金额」和「备注」两个字段',
        '不可编辑字段：设备编码、名称、规格、单位、存放地点、状态等均不可编辑，以灰色只读方式显示',
        '金额字段：必须为数字，支持小数，单位为元，不可为负数',
        '备注字段：文本输入，支持中英文、数字、特殊字符，长度无严格限制',
        '保存逻辑：点击「保存」后立即更新列表数据，编辑弹窗自动关闭',
        '取消操作：点击「取消」或关闭弹窗，不保存修改，直接关闭',
        '边界说明：已报废、已报损状态的资产仍可编辑金额和备注（实际业务中建议限制，当前版本未限制）'
      ]
    },
    {
      heading: '七、标签打印功能',
      items: [
        '操作入口：点击列表操作列的「打印」按钮，或在详情弹窗中点击「打印标签」按钮',
        '触发逻辑：点击打印后会先关闭详情弹窗（如果已打开），再打开打印预览页面',
        '标签内容：设备名称（标题）、设备编码、规格型号、领用部门、领用人、领用日期',
        '标签布局：A4纸（210mm × 297mm），每页8张标签，2列 × 4行排列',
        '分页规则：超过8张时自动分页，每页固定8张，不足8张时用空白格补齐排版',
        '打印预览：全屏预览模式，顶部工具栏显示总标签数和总页数',
        '打印操作：点击工具栏「打印」按钮，调用浏览器打印功能，仅打印标签区域',
        '关闭预览：点击工具栏「关闭」按钮，返回资产档案列表页面',
        '边界说明：领用部门、领用人为空时显示「-」，领用日期为空时显示入账日期',
        '打印样式：打印时自动隐藏工具栏和页面其他元素，只输出标签内容'
      ]
    },
    {
      heading: '八、列表字段说明',
      items: [
        '设备编码：资产的唯一标识编码，系统自动生成',
        '设备名称：固定资产的名称',
        '规格型号：固定资产的规格型号信息',
        '单位：计量单位，如台、套、个等',
        '金额：固定资产的入账金额，以人民币元为单位，显示千分位格式',
        '存放地点：资产所在的仓库或具体存放位置',
        '状态：资产当前状态，带颜色标签：在仓（灰）、领用中（绿）、已报废（红）、已报损（橙）',
        '入账日期：资产档案创建的日期',
        '操作列：查看、编辑、打印三个操作按钮'
      ]
    },
    {
      heading: '九、注意事项与边界',
      items: [
        '资产档案不可删除，只能通过报废或报损流程标记为终态',
        '资产编码一旦生成不可修改，作为唯一标识使用',
        '同一资产可多次领用归还，但每次领用对应一条领用记录',
        '编辑功能仅修改金额和备注，不影响库存数量和状态',
        '打印标签功能依赖浏览器打印设置，请确保打印机已正确配置',
        '建议定期核对资产档案与实际库存，确保账实相符'
      ]
    }
  ]
};

// 标签打印组件 - A4纸每页8张标签
function AssetLabelPrint({ assets, onClose }: { assets: AssetEquipment[]; onClose: () => void }) {
  // 每页8张标签，2列4行
  const pageSize = 8;
  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < assets.length; i += pageSize) {
      result.push(assets.slice(i, i + pageSize));
    }
    return result;
  }, [assets]);

  const statusLabels: Record<string, string> = {
    in_storage: '在仓',
    in_use: '领用中',
    scrapped: '已报废',
    written_off: '已报损',
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-auto">
      {/* 工具栏 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <h3 className="font-semibold">资产标签打印预览</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">共 {assets.length} 张标签，{pages.length} 页</span>
          <DefaultButton onClick={() => window.print()}>
            <Printer size={16} />
            打印
          </DefaultButton>
          <DefaultButton onClick={onClose}>关闭</DefaultButton>
        </div>
      </div>

      {/* 打印区域 */}
      <div className="p-4 print:p-0">
        {pages.map((pageAssets, pageIndex) => (
          <div
            key={pageIndex}
            className="print-page mb-4 print:mb-0 print:break-after-page"
            style={{
              width: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {/* 2列4行布局 */}
            <div
              className="grid grid-cols-2 grid-rows-4 gap-2 p-2"
              style={{ height: '297mm' }}
            >
              {pageAssets.map((asset, idx) => (
                <div
                  key={idx}
                  className="border-2 border-slate-300 p-3 flex flex-col"
                  style={{ height: 'calc(297mm / 4 - 4px)' }}
                >
                  {/* 标签内容 */}
                  <div className="flex-1 text-sm leading-relaxed">
                    <div className="font-bold text-base mb-2 border-b pb-1">{asset.name}</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div><span className="text-slate-500">编码：</span><span className="font-medium">{asset.code}</span></div>
                      <div><span className="text-slate-500">型号：</span>{asset.specification || '-'}</div>
                      <div><span className="text-slate-500">部门：</span>{asset.requisitionDepartment || '-'}</div>
                      <div><span className="text-slate-500">领用人：</span>{asset.requisitionEmployee || '-'}</div>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">领用日期：</span>{asset.requisitionDate || asset.createTime}
                    </div>
                  </div>
                </div>
              ))}
              {/* 补空白格，保证每页8格 */}
              {pageAssets.length < pageSize && Array.from({ length: pageSize - pageAssets.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="border-2 border-dashed border-slate-200"
                  style={{ height: 'calc(297mm / 4 - 4px)' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 打印样式 */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-page, .print-page * { visibility: visible; }
          .print-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function AssetList() {
  const { assetEquipments, updateAssetEquipment } = useStore();
  const [codeFilter, setCodeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    code: '',
    name: '',
    status: '',
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<AssetEquipment | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetEquipment | null>(null);
  const [printAssets, setPrintAssets] = useState<AssetEquipment[]>([]);
  const [editFormData, setEditFormData] = useState({ amount: 0, remark: '' });

  const stats = useMemo(() => {
    const total = assetEquipments.length;
    const inStorage = assetEquipments.filter(a => a.status === 'in_storage').length;
    const inUse = assetEquipments.filter(a => a.status === 'in_use').length;
    const scrapped = assetEquipments.filter(a => a.status === 'scrapped').length;
    const totalValue = assetEquipments.reduce((sum, a) => sum + a.amount, 0);
    return { total, inStorage, inUse, scrapped, totalValue };
  }, [assetEquipments]);

  const filteredData = assetEquipments
    .filter(a => !appliedFilter.code || a.code.toLowerCase().includes(appliedFilter.code.toLowerCase()))
    .filter(a => !appliedFilter.name || a.name.toLowerCase().includes(appliedFilter.name.toLowerCase()))
    .filter(a => !appliedFilter.status || a.status === appliedFilter.status);

  const columns: ColumnDef<AssetEquipment, unknown>[] = [
    { accessorKey: 'code', header: '设备编码' },
    { accessorKey: 'name', header: '设备名称' },
    { accessorKey: 'specification', header: '规格型号' },
    { accessorKey: 'unit', header: '单位' },
    {
      accessorKey: 'amount',
      header: '金额',
      cell: ({ row }) => `¥${row.original.amount.toLocaleString()}`,
    },
    { accessorKey: 'storageLocation', header: '存放地点' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
          in_storage: 'default',
          in_use: 'success',
          scrapped: 'danger',
          written_off: 'warning',
        };
        const labels: Record<string, string> = {
          in_storage: '在仓',
          in_use: '领用中',
          scrapped: '已报废',
          written_off: '已报损',
        };
        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
      },
    },
    { accessorKey: 'createTime', header: '入账日期' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => handleView(row.original)}>查看</TextButton>
          <TextButton onClick={() => handleEdit(row.original)}>
            <Edit size={14} />
            编辑
          </TextButton>
          <TextButton onClick={() => handlePrint(row.original)}>
            <Printer size={14} />
            打印
          </TextButton>
        </div>
      ),
    },
  ];

  const handleView = (asset: AssetEquipment) => {
    setViewingAsset(asset);
    setDetailModalOpen(true);
  };

  const handleEdit = (asset: AssetEquipment) => {
    setEditingAsset(asset);
    setEditFormData({
      amount: asset.amount,
      remark: asset.remark || '',
    });
    setEditModalOpen(true);
  };

  const handlePrint = (asset: AssetEquipment) => {
    // 关闭详情弹窗（如果有打开的话）
    setDetailModalOpen(false);
    // 设置要打印的资产
    setPrintAssets([asset]);
    setPrintModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingAsset) {
      updateAssetEquipment(editingAsset.id, {
        amount: editFormData.amount,
        remark: editFormData.remark,
      });
      setEditModalOpen(false);
    }
  };

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'in_storage', label: '在仓' },
    { value: 'in_use', label: '领用中' },
    { value: 'scrapped', label: '已报废' },
    { value: 'written_off', label: '已报损' },
  ];

  const statusBadgeVariants: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
    in_storage: 'default',
    in_use: 'success',
    scrapped: 'danger',
    written_off: 'warning',
  };

  const statusLabels: Record<string, string> = {
    in_storage: '在仓',
    in_use: '领用中',
    scrapped: '已报废',
    written_off: '已报损',
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">资产档案管理</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setAppliedFilter({
            code: codeFilter,
            name: nameFilter,
            status: statusFilter,
          })
        }
        onReset={() => {
          setCodeFilter('');
          setNameFilter('');
          setStatusFilter('');
          setAppliedFilter({
            code: '',
            name: '',
            status: '',
          });
        }}
      >
        <SearchField
          label="设备编码"
          type="input"
          value={codeFilter}
          onChange={setCodeFilter}
          placeholder="请输入设备编码"
        />
        <SearchField
          label="设备名称"
          type="input"
          value={nameFilter}
          onChange={setNameFilter}
          placeholder="请输入设备名称"
        />
        <SearchField
          label="状态"
          type="select"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="全部状态"
        />
      </SearchBar>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">资产总数</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1">台/套</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">在仓资产</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inStorage}</div>
          <div className="text-xs text-slate-400 mt-1">台/套</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">在用资产</div>
          <div className="text-2xl font-bold text-green-600">{stats.inUse}</div>
          <div className="text-xs text-slate-400 mt-1">台/套</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">已报废</div>
          <div className="text-2xl font-bold text-red-600">{stats.scrapped}</div>
          <div className="text-xs text-slate-400 mt-1">台/套</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">资产总值</div>
          <div className="text-2xl font-bold text-blue-600">¥{stats.totalValue.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">全部资产</div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-[#e4e7ed]">
        <DataTable data={filteredData} columns={columns} pageSize={10} />
      </div>

      {/* 查看详情模态框 */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="资产详情"
        size="lg"
      >
        {viewingAsset && (
          <div className="space-y-4 min-w-[600px]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">设备编码：</span>{viewingAsset.code}</div>
              <div><span className="text-slate-500">设备名称：</span>{viewingAsset.name}</div>
              <div><span className="text-slate-500">规格型号：</span>{viewingAsset.specification || '-'}</div>
              <div><span className="text-slate-500">计量单位：</span>{viewingAsset.unit}</div>
              <div><span className="text-slate-500">金额：</span>¥{viewingAsset.amount.toLocaleString()}</div>
              <div><span className="text-slate-500">存放地点：</span>{viewingAsset.storageLocation}</div>
              <div><span className="text-slate-500">状态：</span>
                <Badge variant={statusBadgeVariants[viewingAsset.status]}>
                  {statusLabels[viewingAsset.status]}
                </Badge>
              </div>
              <div><span className="text-slate-500">入账日期：</span>{viewingAsset.createTime}</div>
              {viewingAsset.requisitionDepartment && (
                <div><span className="text-slate-500">领用部门：</span>{viewingAsset.requisitionDepartment}</div>
              )}
              {viewingAsset.requisitionEmployee && (
                <div><span className="text-slate-500">领用人：</span>{viewingAsset.requisitionEmployee}</div>
              )}
              {viewingAsset.requisitionDate && (
                <div><span className="text-slate-500">领用日期：</span>{viewingAsset.requisitionDate}</div>
              )}
              <div className="col-span-2"><span className="text-slate-500">备注：</span>{viewingAsset.remark || '-'}</div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <DefaultButton onClick={() => setDetailModalOpen(false)}>
                关闭
              </DefaultButton>
              <DefaultButton onClick={() => {
                setDetailModalOpen(false);
                setPrintAssets([viewingAsset]);
                setPrintModalOpen(true);
              }}>
                <Printer size={14} />
                打印标签
              </DefaultButton>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑模态框 - 只能编辑金额和备注 */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="编辑资产信息"
        size="md"
      >
        {editingAsset && (
          <div className="space-y-4 min-w-[400px]">
            <div className="text-sm text-slate-500 mb-4">
              设备编码：<span className="font-medium text-slate-900">{editingAsset.code}</span>
              <span className="mx-2">|</span>
              设备名称：<span className="font-medium text-slate-900">{editingAsset.name}</span>
            </div>
            <Input
              label="金额"
              type="number"
              value={editFormData.amount || ''}
              onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="请输入金额"
            />
            <Input
              label="备注"
              value={editFormData.remark}
              onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
              placeholder="请输入备注信息"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleEditSubmit}>
                保存
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 标签打印预览 */}
      {printModalOpen && (
        <AssetLabelPrint
          assets={printAssets}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </div>
  );
}