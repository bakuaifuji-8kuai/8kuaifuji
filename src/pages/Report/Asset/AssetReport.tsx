import { useMemo, useState } from 'react';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { DefaultButton, TextButton } from '@/components/common/Button';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { useStore } from '@/store/useStore';
import type { AssetEquipment } from '@/types';
import { Printer } from 'lucide-react';

const helpContent = {
  title: '固定资产报表 - 功能操作说明',
  description: '固定资产报表用于查询和统计固定资产的总体情况，支持按设备编码、名称、状态等条件筛选。',
  sections: [
    {
      heading: '报表说明',
      items: [
        '固定资产报表展示所有固定资产的汇总信息',
        '可按设备编码、设备名称进行模糊查询',
        '可按资产状态进行筛选',
        '报表实时反映资产档案中的最新数据'
      ]
    },
    {
      heading: '统计指标',
      items: [
        '资产总数：所有固定资产的总数量',
        '在仓资产：状态为在仓的资产数量',
        '在用资产：状态为在用的资产数量',
        '已报废：已办理报废手续的资产数量',
        '资产总额：在仓和在用资产的价值总和',
        '报废总额：已报废资产的价值总和'
      ]
    },
    {
      heading: '数据筛选',
      items: [
        '可按设备编码进行精确匹配查询',
        '可按设备名称进行模糊查询',
        '可按状态筛选特定状态的资产'
      ]
    },
    {
      heading: '其他操作',
      items: [
        '详情：查看资产详细信息',
        '打印：直接调用浏览器打印功能'
      ]
    }
  ]
};

export default function AssetReportPage() {
  const assetEquipments = useStore((s) => s.assetEquipments);

  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({
    code: '',
    name: '',
    status: '',
  });

  const filteredData = useMemo(() => {
    return assetEquipments.filter((a) => {
      if (applied.code && !a.code.includes(applied.code)) return false;
      if (applied.name && !a.name.includes(applied.name)) return false;
      if (applied.status && a.status !== applied.status) return false;
      return true;
    });
  }, [assetEquipments, applied]);

  const statusText = (s: string) => {
    if (s === 'in_use') return '在用';
    if (s === 'in_requisition') return '领用中';
    if (s === 'scrapped') return '已报废';
    if (s === 'written_off') return '已报损';
    return s;
  };
  const statusColor = (s: string) => {
    if (s === 'in_use') return 'text-[#67c23a]';
    if (s === 'in_requisition') return 'text-[#e6a23c]';
    if (s === 'scrapped') return 'text-[#f56c6c]';
    if (s === 'written_off') return 'text-[#909399]';
    return '';
  };

  const columns: ColumnDef<AssetEquipment>[] = [
    { key: 'code', title: '设备编码' },
    { key: 'name', title: '设备名称' },
    { key: 'specification', title: '规格型号' },
    { key: 'unit', title: '单位' },
    {
      key: 'amount',
      title: '金额(元)',
      align: 'right',
      render: (row) => `¥${row.amount.toLocaleString()}`,
    },
    { key: 'storageLocation', title: '存放地点' },
    {
      key: 'status',
      title: '状态',
      render: (row) => (
        <span className={statusColor(row.status)}>{statusText(row.status)}</span>
      ),
    },
    { key: 'createTime', title: '入账日期' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <TextButton onClick={() => setViewItem(row)}>详情</TextButton>
      ),
    },
  ];

  // 统计数据
  const stats = useMemo(() => {
    const total = assetEquipments.length;
    const inStorage = assetEquipments.filter((a) => a.status === 'in_storage').length;
    const inUse = assetEquipments.filter((a) => a.status === 'in_use').length;
    const scrapped = assetEquipments.filter((a) => a.status === 'scrapped').length;
    const totalAmount = assetEquipments
      .filter((a) => a.status === 'in_storage' || a.status === 'in_use')
      .reduce((sum, a) => sum + a.amount, 0);
    const scrappedAmount = assetEquipments
      .filter((a) => a.status === 'scrapped')
      .reduce((sum, a) => sum + a.amount, 0);
    return { total, inStorage, inUse, scrapped, totalAmount, scrappedAmount };
  }, [assetEquipments]);

  const [viewItem, setViewItem] = useState<AssetEquipment | null>(null);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">固定资产报表</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <div className="flex gap-2">
          <DefaultButton
            onClick={() => {
              window.print();
            }}
          >
            <Printer size={14} />
            打印
          </DefaultButton>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <div className="text-xs text-[#909399] mb-1">资产总数</div>
          <div className="text-xl font-semibold text-[#303133]">{stats.total}</div>
          <div className="text-xs text-[#909399] mt-1">台/套</div>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <div className="text-xs text-[#909399] mb-1">在仓资产</div>
          <div className="text-xl font-semibold text-[#409eff]">{stats.inStorage}</div>
          <div className="text-xs text-[#909399] mt-1">台/套</div>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <div className="text-xs text-[#909399] mb-1">领用中</div>
          <div className="text-xl font-semibold text-[#67c23a]">{stats.inUse}</div>
          <div className="text-xs text-[#909399] mt-1">台/套</div>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <div className="text-xs text-[#909399] mb-1">资产总值</div>
          <div className="text-xl font-semibold text-[#409eff]">
            ¥{stats.totalAmount.toLocaleString()}
          </div>
          <div className="text-xs text-[#909399] mt-1">在仓+领用中</div>
        </div>
        <div className="bg-white border border-[#ebeef5] rounded-lg p-4">
          <div className="text-xs text-[#909399] mb-1">已报废资产</div>
          <div className="text-xl font-semibold text-[#f56c6c]">{stats.scrapped}</div>
          <div className="text-xs text-[#909399] mt-1">
            价值 ¥{stats.scrappedAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="bg-[#fafbfc] border border-[#ebeef5] rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <input
            className="w-full h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            placeholder="设备编码"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
          />
          <input
            className="w-full h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            placeholder="设备名称"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <select
            className="w-full h-8 px-2 border border-[#dcdfe6] text-xs text-[#303133] bg-white rounded focus:outline-none focus:border-[#2f54eb]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="in_use">在用</option>
            <option value="in_requisition">领用中</option>
            <option value="scrapped">已报废</option>
            <option value="written_off">已报损</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <DefaultButton
            size="sm"
            onClick={() => {
              setFilterCode('');
              setFilterName('');
              setFilterStatus('');
              setApplied({ code: '', name: '', status: '' });
            }}
          >
            重置
          </DefaultButton>
          <button
            className="h-8 px-4 text-xs bg-[#2f54eb] text-white rounded hover:bg-[#1d3fd1] transition-colors"
            onClick={() =>
              setApplied({
                code: filterCode,
                name: filterName,
                status: filterStatus,
              })
            }
          >
            查询
          </button>
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} />

      {/* 详情弹窗 */}
      <Modal
        open={!!viewItem}
        title="固定资产详情"
        onClose={() => setViewItem(null)}
      >
        {viewItem && (
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">设备编码：</span><span className="text-[#303133]">{viewItem.code}</span></div>
              <div><span className="text-[#606266]">设备名称：</span><span className="text-[#303133]">{viewItem.name}</span></div>
              <div><span className="text-[#606266]">规格型号：</span><span className="text-[#303133]">{viewItem.specification}</span></div>
              <div><span className="text-[#606266]">单位：</span><span className="text-[#303133]">{viewItem.unit}</span></div>
              <div><span className="text-[#606266]">金额：</span><span className="text-[#303133]">¥{viewItem.amount.toLocaleString()}</span></div>
              <div><span className="text-[#606266]">存放地点：</span><span className="text-[#303133]">{viewItem.storageLocation}</span></div>
              <div><span className="text-[#606266]">状态：</span><span className={statusColor(viewItem.status)}>{statusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">入账日期：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
            </div>
            {viewItem.remark && (
              <div className="mb-3">
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
    </div>
  );
}
