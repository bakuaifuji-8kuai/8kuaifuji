import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { ApprovalFlowConfig, ApprovalFlowNode } from '@/types';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import { Plus, ArrowUp, ArrowDown, Trash2, Edit2, Eye, Power } from 'lucide-react';

const businessTypeOptions = [
  { value: '', label: '全部业务类型' },
  { value: 'procurement_plan', label: '采购计划' },
  { value: 'procurement_demand', label: '采购需求申请' },
  { value: 'procurement_order', label: '采购订单' },
  { value: 'procurement_contract', label: '合同' },
  { value: 'other', label: '其他' },
];

const businessSubTypeOptions = [
  { value: '', label: '全部子类型' },
  { value: 'monthly', label: '月度' },
  { value: 'annual', label: '年度' },
];

const roleOptions = [
  { value: '部门负责人', label: '部门负责人' },
  { value: '采购管理员', label: '采购管理员' },
  { value: '财务', label: '财务' },
  { value: '分管领导', label: '分管领导' },
  { value: '总经理', label: '总经理' },
  { value: '董事长', label: '董事长' },
  { value: '董事会', label: '董事会' },
];

export default function ApprovalFlowConfigPage() {
  const {
    approvalFlowConfigs,
    addApprovalFlowConfig,
    updateApprovalFlowConfig,
    deleteApprovalFlowConfig,
    currentUser,
  } = useStore();

  const [filters, setFilters] = useState({ businessType: '', businessSubType: '', keyword: '' });
  const [editItem, setEditItem] = useState<ApprovalFlowConfig | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewItem, setViewItem] = useState<ApprovalFlowConfig | null>(null);

  const filteredData = useMemo(() => {
    return approvalFlowConfigs.filter((c) => {
      if (filters.businessType && c.businessType !== filters.businessType) return false;
      if (filters.businessSubType && c.businessSubType !== filters.businessSubType) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!c.flowName.toLowerCase().includes(kw) && !(c.description || '').toLowerCase().includes(kw)) {
          return false;
        }
      }
      return true;
    });
  }, [approvalFlowConfigs, filters]);

  const columns = [
    { key: 'flowName', title: '流程名称', render: (row: ApprovalFlowConfig) => row.flowName },
    {
      key: 'businessType',
      title: '业务类型',
      render: (row: ApprovalFlowConfig) => {
        const map: Record<string, string> = {
          procurement_plan: '采购计划',
          procurement_demand: '采购需求申请',
          procurement_order: '采购订单',
          procurement_contract: '合同',
          other: '其他',
        };
        return map[row.businessType] || row.businessType;
      },
    },
    {
      key: 'businessSubType',
      title: '业务子类型',
      render: (row: ApprovalFlowConfig) => {
        if (!row.businessSubType) return '-';
        return row.businessSubType === 'monthly' ? '月度' : row.businessSubType === 'annual' ? '年度' : row.businessSubType;
      },
    },
    {
      key: 'nodeCount',
      title: '节点数',
      render: (row: ApprovalFlowConfig) => row.nodes.length,
    },
    {
      key: 'isActive',
      title: '状态',
      render: (row: ApprovalFlowConfig) =>
        row.isActive ? (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">启用</span>
        ) : (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">停用</span>
        ),
    },
    { key: 'description', title: '说明', render: (row: ApprovalFlowConfig) => row.description || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row: ApprovalFlowConfig) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setViewItem(row)}><Eye size={14} className="inline mr-1" />查看</TextButton>
          <TextButton onClick={() => openEdit(row)}><Edit2 size={14} className="inline mr-1" />编辑</TextButton>
          <TextButton onClick={() => toggleActive(row)}>
            <Power size={14} className="inline mr-1" />
            {row.isActive ? '停用' : '启用'}
          </TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除流程"${row.flowName}"？`)) deleteApprovalFlowConfig(row.id);
            }}
          >
            <Trash2 size={14} className="inline mr-1" />删除
          </TextButton>
        </div>
      ),
    },
  ];

  const openAdd = () => {
    setIsNew(true);
    setEditItem({
      id: 'AFC' + Date.now(),
      flowName: '',
      businessType: 'procurement_plan',
      businessSubType: 'monthly',
      nodes: [
        {
          id: 'NODE1_' + Date.now(),
          nodeName: '部门负责人审批',
          nodeOrder: 1,
          approverRole: '部门负责人',
          isRequired: true,
        },
      ],
      isActive: true,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      creator: currentUser.name,
    });
  };

  const openEdit = (row: ApprovalFlowConfig) => {
    setIsNew(false);
    setEditItem({ ...row });
  };

  const toggleActive = (row: ApprovalFlowConfig) => {
    updateApprovalFlowConfig(row.id, { isActive: !row.isActive });
  };

  const addNode = () => {
    if (!editItem) return;
    const newNode: ApprovalFlowNode = {
      id: 'NODE' + (editItem.nodes.length + 1) + '_' + Date.now(),
      nodeName: '',
      nodeOrder: editItem.nodes.length + 1,
      approverRole: '',
      isRequired: true,
    };
    setEditItem({ ...editItem, nodes: [...editItem.nodes, newNode] });
  };

  const updateNode = (idx: number, field: keyof ApprovalFlowNode, value: any) => {
    if (!editItem) return;
    const newNodes = [...editItem.nodes];
    newNodes[idx] = { ...newNodes[idx], [field]: value };
    setEditItem({ ...editItem, nodes: newNodes });
  };

  const removeNode = (idx: number) => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      nodes: editItem.nodes.filter((_, i) => i !== idx).map((n, i) => ({ ...n, nodeOrder: i + 1 })),
    });
  };

  const moveNode = (idx: number, direction: 'up' | 'down') => {
    if (!editItem) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editItem.nodes.length) return;
    const newNodes = [...editItem.nodes];
    [newNodes[idx], newNodes[targetIdx]] = [newNodes[targetIdx], newNodes[idx]];
    newNodes.forEach((n, i) => (n.nodeOrder = i + 1));
    setEditItem({ ...editItem, nodes: newNodes });
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.flowName.trim()) {
      alert('请填写流程名称');
      return;
    }
    if (editItem.nodes.length === 0) {
      alert('请至少配置一个审批节点');
      return;
    }
    if (editItem.nodes.some((n) => !n.nodeName.trim())) {
      alert('请填写所有节点的名称');
      return;
    }
    const saveData = {
      ...editItem,
      updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updater: currentUser.name,
    };
    if (isNew) {
      addApprovalFlowConfig(saveData);
    } else {
      updateApprovalFlowConfig(saveData.id, saveData);
    }
    setEditItem(null);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#1E40AF]">审批流程配置</h1>
        <p className="text-xs text-[#909399] mt-1">按制度规定配置各业务类型的审批节点流程，支持启用/停用、节点顺序调整</p>
      </div>

      <SearchBar
        onSearch={() => {}}
        onReset={() => setFilters({ businessType: '', businessSubType: '', keyword: '' })}
      >
        <SearchField
          label="业务类型"
          value={filters.businessType}
          onChange={(v) => setFilters({ ...filters, businessType: v })}
          options={businessTypeOptions}
        />
        <SearchField
          label="业务子类型"
          value={filters.businessSubType}
          onChange={(v) => setFilters({ ...filters, businessSubType: v })}
          options={businessSubTypeOptions}
        />
        <SearchField
          label="关键词"
          value={filters.keyword}
          onChange={(v) => setFilters({ ...filters, keyword: v })}
          placeholder="流程名称/说明"
        />
      </SearchBar>

      <div className="mb-3 flex justify-end">
        <PrimaryButton onClick={openAdd}><Plus size={14} className="inline mr-1" />新增审批流程</PrimaryButton>
      </div>

      <DataTable data={filteredData} columns={columns} />

      {/* 编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增审批流程' : '编辑审批流程'}
        onClose={() => setEditItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="80vw"
      >
        {editItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">流程名称 <span className="text-red-500">*</span></div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.flowName}
                  onChange={(e) => setEditItem({ ...editItem, flowName: e.target.value })}
                  placeholder="如：采购计划-月度标准审批流程"
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">业务类型 <span className="text-red-500">*</span></div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.businessType}
                  onChange={(e) => setEditItem({ ...editItem, businessType: e.target.value as any })}
                >
                  {businessTypeOptions.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">业务子类型</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.businessSubType || ''}
                  onChange={(e) => setEditItem({ ...editItem, businessSubType: e.target.value || undefined })}
                >
                  <option value="">不指定</option>
                  <option value="monthly">月度</option>
                  <option value="annual">年度</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">适用部门</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.applicableDepartment || ''}
                  onChange={(e) => setEditItem({ ...editItem, applicableDepartment: e.target.value })}
                  placeholder="留空表示全部"
                />
              </div>
              <div className="col-span-2">
                <div className="mb-1 text-[#606266]">流程说明</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.description || ''}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">启用状态</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.isActive ? '是' : '否'}
                  onChange={(e) => setEditItem({ ...editItem, isActive: e.target.value === '是' })}
                >
                  <option value="是">启用</option>
                  <option value="否">停用</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#606266] font-bold">审批节点（按顺序配置）</div>
                <PrimaryButton size="small" onClick={addNode}><Plus size={12} className="inline mr-1" />添加节点</PrimaryButton>
              </div>
              <div className="border border-[#dcdfe6] rounded">
                <table className="w-full">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-2 py-2 text-xs w-12">顺序</th>
                      <th className="px-2 py-2 text-xs text-left">节点名称</th>
                      <th className="px-2 py-2 text-xs text-left w-32">审批角色</th>
                      <th className="px-2 py-2 text-xs text-left w-32">审批人</th>
                      <th className="px-2 py-2 text-xs text-left">节点说明</th>
                      <th className="px-2 py-2 text-xs w-32">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.nodes.map((node, idx) => (
                      <tr key={node.id} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-1 text-center text-xs">{node.nodeOrder}</td>
                        <td className="px-2 py-1">
                          <input
                            className="w-full h-7 px-1 border border-[#dcdfe6] rounded text-xs"
                            value={node.nodeName}
                            onChange={(e) => updateNode(idx, 'nodeName', e.target.value)}
                            placeholder="如：部门负责人审批"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <select
                            className="w-full h-7 px-1 border border-[#dcdfe6] rounded text-xs"
                            value={node.approverRole}
                            onChange={(e) => updateNode(idx, 'approverRole', e.target.value)}
                          >
                            <option value="">请选择</option>
                            {roleOptions.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <input
                            className="w-full h-7 px-1 border border-[#dcdfe6] rounded text-xs"
                            value={node.approverName || ''}
                            onChange={(e) => updateNode(idx, 'approverName', e.target.value)}
                            placeholder="具体审批人"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            className="w-full h-7 px-1 border border-[#dcdfe6] rounded text-xs"
                            value={node.description || ''}
                            onChange={(e) => updateNode(idx, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-100 rounded"
                              onClick={() => moveNode(idx, 'up')}
                              disabled={idx === 0}
                              title="上移"
                            >
                              <ArrowUp size={14} className={idx === 0 ? 'text-gray-300' : 'text-gray-600'} />
                            </button>
                            <button
                              type="button"
                              className="p-1 hover:bg-gray-100 rounded"
                              onClick={() => moveNode(idx, 'down')}
                              disabled={idx === editItem.nodes.length - 1}
                              title="下移"
                            >
                              <ArrowDown size={14} className={idx === editItem.nodes.length - 1 ? 'text-gray-300' : 'text-gray-600'} />
                            </button>
                            <button
                              type="button"
                              className="p-1 hover:bg-red-50 rounded"
                              onClick={() => removeNode(idx)}
                              title="删除"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {editItem.nodes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-[#909399] text-sm">
                          暂无节点，请点击"添加节点"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 查看弹窗 */}
      <Modal
        open={!!viewItem}
        title="查看审批流程"
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="60vw"
      >
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#909399]">流程名称：</span>{viewItem.flowName}</div>
              <div><span className="text-[#909399]">业务类型：</span>{
                businessTypeOptions.find((o) => o.value === viewItem.businessType)?.label
              }</div>
              <div><span className="text-[#909399]">业务子类型：</span>{viewItem.businessSubType === 'monthly' ? '月度' : viewItem.businessSubType === 'annual' ? '年度' : '-'}</div>
              <div><span className="text-[#909399]">状态：</span>{viewItem.isActive ? '启用' : '停用'}</div>
              <div className="col-span-2"><span className="text-[#909399]">说明：</span>{viewItem.description || '-'}</div>
            </div>
            <div>
              <div className="font-bold text-[#606266] mb-2">审批流程图：</div>
              <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded">
                {viewItem.nodes.map((n, i) => (
                  <div key={n.id} className="flex items-center">
                    <div className="px-3 py-2 bg-white border-2 border-[#1E40AF] rounded text-xs">
                      <div className="font-bold text-[#1E40AF]">{n.nodeOrder}. {n.nodeName}</div>
                      <div className="text-[#909399]">{n.approverRole}: {n.approverName || '-'}</div>
                      {n.description && <div className="text-[#909399] text-xs mt-1">{n.description}</div>}
                    </div>
                    {i < viewItem.nodes.length - 1 && (
                      <div className="mx-2 text-[#1E40AF] text-xl">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
