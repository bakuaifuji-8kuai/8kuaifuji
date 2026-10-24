import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { ApprovalFlowInstance, ApprovalFlowInstanceNodeRecord, ApprovalFlowConfig } from '@/types';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import { Plus, Eye, Trash2, FileText, User, Clock, CheckCircle2, XCircle, ArrowRight, Circle, Loader2 } from 'lucide-react';

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '审批中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'returned', label: '已退回' },
];

const businessTypeMap: Record<string, string> = {
  procurement_plan: '采购计划',
  procurement_demand: '采购需求申请',
  procurement_order: '采购订单',
  procurement_contract: '合同',
  other: '其他',
};

// ============ 状态 Badge ============
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { text: string; cls: string }> = {
    draft: { text: '草稿', cls: 'bg-slate-100 text-slate-600' },
    pending: { text: '审批中', cls: 'bg-amber-100 text-amber-700' },
    approved: { text: '已通过', cls: 'bg-green-100 text-green-700' },
    rejected: { text: '已驳回', cls: 'bg-red-100 text-red-700' },
    returned: { text: '已退回', cls: 'bg-orange-100 text-orange-700' },
  };
  const cfg = map[status] || { text: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2 py-0.5 rounded text-xs ${cfg.cls}`}>{cfg.text}</span>;
};

// ============ 节点状态图标 ============
const NodeStatusIcon = ({ s }: { s: string }) => {
  if (s === 'approved') return <CheckCircle2 size={16} className="text-green-500" />;
  if (s === 'rejected') return <XCircle size={16} className="text-red-500" />;
  if (s === 'returned') return <XCircle size={16} className="text-orange-500" />;
  if (s === 'skipped') return <Circle size={16} className="text-slate-300" />;
  return <Loader2 size={16} className="text-amber-500 animate-pulse" />;
};

export default function ApprovalFlowInstancePage() {
  const {
    approvalFlowInstances,
    approvalFlowConfigs,
    addApprovalFlowInstance,
    deleteApprovalFlowInstance,
    currentUser,
  } = useStore();

  const [filters, setFilters] = useState({ status: '', keyword: '' });
  const [openForm, setOpenForm] = useState(false);
  const [viewItem, setViewItem] = useState<ApprovalFlowInstance | null>(null);

  // 表单状态
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 筛选后的列表
  const filteredData = useMemo(() => {
    return approvalFlowInstances.filter((inst) => {
      if (filters.status && inst.status !== filters.status) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!inst.title.toLowerCase().includes(kw)
          && !inst.instanceNo.toLowerCase().includes(kw)
          && !inst.applicant.toLowerCase().includes(kw)
          && !inst.flowName.toLowerCase().includes(kw)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => (a.applyTime < b.applyTime ? 1 : -1));
  }, [approvalFlowInstances, filters]);

  // 可用的流程模板（只显示启用的）
  const availableConfigs = useMemo(() =>
    approvalFlowConfigs.filter((c) => c.isActive),
  [approvalFlowConfigs]);

  const columns = [
    { key: 'instanceNo', title: '实例编号', width: '160', render: (row: ApprovalFlowInstance) => row.instanceNo },
    {
      key: 'title',
      title: '标题',
      width: '240',
      render: (row: ApprovalFlowInstance) => (
        <div className="truncate max-w-[220px]" title={row.title}>{row.title}</div>
      ),
    },
    { key: 'flowName', title: '流程名称', width: '180', render: (row: ApprovalFlowInstance) => row.flowName },
    { key: 'applicant', title: '申请人', width: '100', render: (row: ApprovalFlowInstance) => row.applicant },
    { key: 'applicantDept', title: '申请部门', width: '120', render: (row: ApprovalFlowInstance) => row.applicantDept || '-' },
    {
      key: 'status',
      title: '状态',
      width: '100',
      render: (row: ApprovalFlowInstance) => <StatusBadge status={row.status} />,
    },
    {
      key: 'currentNode',
      title: '当前节点',
      width: '200',
      render: (row: ApprovalFlowInstance) => {
        if (row.status === 'approved') return '— 全部通过 —';
        if (row.status === 'rejected') return '— 已驳回 —';
        if (row.status === 'returned') return '— 已退回 —';
        const pending = row.nodeRecords.find((n) => n.status === 'pending');
        return pending ? `${pending.nodeOrder}. ${pending.nodeName}` : '-';
      },
    },
    { key: 'applyTime', title: '申请时间', width: '180', render: (row: ApprovalFlowInstance) => row.applyTime },
    {
      key: 'op',
      title: '操作',
      width: '160',
      render: (row: ApprovalFlowInstance) => (
        <div className="flex items-center gap-2">
          <TextButton onClick={() => setViewItem(row)}><Eye size={14} className="inline mr-1" />详情</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除审批 "${row.title}"？此操作不可撤销`)) {
                deleteApprovalFlowInstance(row.id);
              }
            }}
          >
            <Trash2 size={14} className="inline mr-1" />删除
          </TextButton>
        </div>
      ),
    },
  ];

  // ============ 发起审批 ============
  const openAdd = () => {
    setSelectedConfigId(availableConfigs.length > 0 ? availableConfigs[0].id : '');
    setTitle('');
    setContent('');
    setAttachments('');
    setFormErrors({});
    setOpenForm(true);
  };

  const generateInstanceNo = () => {
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const todayInstances = approvalFlowInstances.filter((i) => i.instanceNo.startsWith(`LC${ymd}`));
    const seq = String(todayInstances.length + 1).padStart(3, '0');
    return `LC${ymd}${seq}`;
  };

  const handleSubmit = () => {
    setFormErrors({});
    const errs: Record<string, string> = {};
    if (!selectedConfigId) errs.config = '请选择审批流程模板';
    if (!title.trim()) errs.title = '请填写审批标题';
    if (!content.trim()) errs.content = '请填写申请内容';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const cfg = approvalFlowConfigs.find((c) => c.id === selectedConfigId);
    if (!cfg) return;

    // 根据配置模板生成节点记录
    const nodeRecords: ApprovalFlowInstanceNodeRecord[] = cfg.nodes.map((n, i) => {
      // Mock 流转：发起后前 1~2 个节点自动通过（根据模板节点数），当前节点 pending
      const total = cfg.nodes.length;
      const autoPassCount = total >= 5 ? 2 : 1;
      let nodeStatus: ApprovalFlowInstanceNodeRecord['status'];
      let approveTime: string | undefined;
      let comment: string | undefined;
      if (i < autoPassCount) {
        nodeStatus = 'approved';
        const d = new Date(Date.now() - (autoPassCount - i) * 3600000);
        approveTime = d.toISOString().replace('T', ' ').slice(0, 19);
        comment = '同意';
      } else if (i === autoPassCount) {
        nodeStatus = 'pending';
      } else {
        nodeStatus = 'pending';
      }
      return {
        nodeId: n.id,
        nodeName: n.nodeName,
        nodeOrder: n.nodeOrder,
        approverRole: n.approverRole,
        approverName: n.approverName,
        status: nodeStatus,
        approveTime,
        comment,
      };
    });

    const attachmentsArr = attachments
      .split(/[,，;；\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const currentPendingOrder = nodeRecords.findIndex((n) => n.status === 'pending') + 1 || cfg.nodes.length;

    const inst: ApprovalFlowInstance = {
      id: 'AFI' + Date.now(),
      instanceNo: generateInstanceNo(),
      flowConfigId: cfg.id,
      flowName: cfg.flowName,
      businessType: cfg.businessType,
      title: title.trim(),
      content: content.trim(),
      attachments: attachmentsArr.length > 0 ? attachmentsArr : undefined,
      applicant: currentUser.name,
      applicantDept: currentUser.department,
      applyTime: nowStr,
      status: 'pending',
      currentNodeOrder: currentPendingOrder,
      nodeRecords,
    };

    addApprovalFlowInstance(inst);
    setOpenForm(false);
  };

  // ============ 详情弹窗内的流程图 ============
  const renderFlowDiagram = (inst: ApprovalFlowInstance) => {
    return (
      <div className="p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2 flex-wrap">
          {inst.nodeRecords.map((n, i) => (
            <div key={n.nodeId} className="flex items-center">
              <div
                className={`px-3 py-2 rounded-lg border-2 min-w-[140px] ${
                  n.status === 'approved'
                    ? 'bg-green-50 border-green-400'
                    : n.status === 'pending'
                    ? 'bg-amber-50 border-amber-400'
                    : n.status === 'rejected' || n.status === 'returned'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <NodeStatusIcon s={n.status} />
                  <span className={
                    n.status === 'approved' ? 'text-green-700' :
                    n.status === 'pending' ? 'text-amber-700' :
                    (n.status === 'rejected' || n.status === 'returned') ? 'text-red-700' : 'text-slate-600'
                  }>
                    {n.nodeOrder}. {n.nodeName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {n.approverRole}{n.approverName ? `: ${n.approverName}` : ''}
                </div>
                {n.approveTime && (
                  <div className="text-[11px] text-slate-400 mt-0.5">{n.approveTime.slice(5, 16)}</div>
                )}
              </div>
              {i < inst.nodeRecords.length - 1 && (
                <ArrowRight size={20} className="mx-1.5 text-slate-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============ 详情弹窗 ============
  const renderDetailModal = () => {
    if (!viewItem) return null;
    return (
      <Modal
        open={!!viewItem}
        title="审批详情"
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="80vw"
      >
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">实例编号：</span>{viewItem.instanceNo}</div>
            <div><span className="text-slate-500">审批状态：</span><StatusBadge status={viewItem.status} /></div>
            <div><span className="text-slate-500">审批流程：</span>{viewItem.flowName}</div>
            <div><span className="text-slate-500">业务类型：</span>{businessTypeMap[viewItem.businessType] || viewItem.businessType}</div>
            <div><span className="text-slate-500">申请人：</span>{viewItem.applicant}</div>
            <div><span className="text-slate-500">申请部门：</span>{viewItem.applicantDept || '-'}</div>
            <div className="col-span-2"><span className="text-slate-500">申请时间：</span>{viewItem.applyTime}</div>
          </div>

          {/* 标题 */}
          <div>
            <div className="text-xs text-slate-500 mb-1">审批标题</div>
            <div className="px-3 py-2 bg-slate-50 rounded text-sm font-medium">{viewItem.title}</div>
          </div>

          {/* 申请内容 */}
          <div>
            <div className="text-xs text-slate-500 mb-1">申请内容</div>
            <div className="px-3 py-2 bg-slate-50 rounded text-sm whitespace-pre-wrap">{viewItem.content}</div>
          </div>

          {/* 附件 */}
          <div>
            <div className="text-xs text-slate-500 mb-1">附件</div>
            {viewItem.attachments && viewItem.attachments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {viewItem.attachments.map((att, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded text-xs border border-indigo-200">
                    <FileText size={12} />{att}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">无</div>
            )}
          </div>

          {/* 流程图 */}
          <div>
            <div className="text-sm font-bold text-slate-700 mb-2">审批流程</div>
            {renderFlowDiagram(viewItem)}
          </div>

          {/* 审批历史 */}
          <div>
            <div className="text-sm font-bold text-slate-700 mb-2">审批历史</div>
            <div className="border border-slate-200 rounded">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left w-12">序号</th>
                    <th className="px-3 py-2 text-left">节点名称</th>
                    <th className="px-3 py-2 text-left w-28">审批角色</th>
                    <th className="px-3 py-2 text-left w-24">审批人</th>
                    <th className="px-3 py-2 text-left w-24">结果</th>
                    <th className="px-3 py-2 text-left w-36">审批时间</th>
                    <th className="px-3 py-2 text-left">批注意见</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.nodeRecords.map((n) => (
                    <tr key={n.nodeId} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-500">{n.nodeOrder}</td>
                      <td className="px-3 py-2 font-medium">{n.nodeName}</td>
                      <td className="px-3 py-2">{n.approverRole}</td>
                      <td className="px-3 py-2">{n.approverName || '-'}</td>
                      <td className="px-3 py-2">
                        <NodeStatusIcon s={n.status} />
                      </td>
                      <td className="px-3 py-2 text-slate-500">{n.approveTime || '-'}</td>
                      <td className="px-3 py-2 text-slate-600">{n.comment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 驳回/退回原因 */}
          {viewItem.rejectReason && (
            <div>
              <div className="text-xs text-slate-500 mb-1">驳回原因</div>
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {viewItem.rejectReason}
              </div>
            </div>
          )}
          {viewItem.returnReason && (
            <div>
              <div className="text-xs text-slate-500 mb-1">退回原因</div>
              <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                {viewItem.returnReason}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  // ============ 发起审批弹窗 ============
  const renderFormModal = () => {
    return (
      <Modal
        open={openForm}
        title="发起审批"
        onClose={() => setOpenForm(false)}
        footer={
          <>
            <DefaultButton onClick={() => setOpenForm(false)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSubmit}><Plus size={14} className="inline mr-1" />提交审批</PrimaryButton>
          </>
        }
        width="700"
      >
        <div className="space-y-4">
          {/* 流程模板选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              审批流程模板 <span className="text-red-500">*</span>
            </label>
            {availableConfigs.length === 0 ? (
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                当前没有启用的审批流程模板。请先在「审批流程配置」中添加并启用。
              </div>
            ) : (
              <select
                className={`w-full h-9 px-2 border rounded-lg text-sm ${
                  formErrors.config ? 'border-red-400' : 'border-slate-300'
                }`}
                value={selectedConfigId}
                onChange={(e) => setSelectedConfigId(e.target.value)}
              >
                {availableConfigs.map((cfg) => (
                  <option key={cfg.id} value={cfg.id}>
                    {cfg.flowName}（{cfg.nodes.length} 个节点）
                  </option>
                ))}
              </select>
            )}
            {formErrors.config && <div className="text-xs text-red-500 mt-1">{formErrors.config}</div>}
          </div>

          {/* 选中模板预览 */}
          {availableConfigs.length > 0 && selectedConfigId && (() => {
            const cfg = availableConfigs.find((c) => c.id === selectedConfigId);
            if (!cfg) return null;
            return (
              <div className="px-3 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                <div className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1">
                  <User size={12} />流程预览
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  {cfg.nodes.map((n, i) => (
                    <span key={n.id} className="flex items-center">
                      <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                        {n.nodeOrder}. {n.nodeName}
                        {n.approverName && <span className="text-slate-400">({n.approverName})</span>}
                      </span>
                      {i < cfg.nodes.length - 1 && <ArrowRight size={12} className="mx-0.5 text-slate-400" />}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              审批标题 <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full h-9 px-3 border rounded-lg text-sm ${
                formErrors.title ? 'border-red-400' : 'border-slate-300'
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简明扼要描述本次审批事项，如：11月展会物资采购计划审批"
              maxLength={80}
            />
            <div className="flex justify-between mt-1">
              {formErrors.title
                ? <span className="text-xs text-red-500">{formErrors.title}</span>
                : <span />}
              <span className="text-xs text-slate-400">{title.length}/80</span>
            </div>
          </div>

          {/* 申请内容 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              申请内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              className={`w-full px-3 py-2 border rounded-lg text-sm resize-y ${
                formErrors.content ? 'border-red-400' : 'border-slate-300'
              }`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述审批事项、理由、预算等信息"
            />
            <div className="flex justify-between mt-1">
              {formErrors.content
                ? <span className="text-xs text-red-500">{formErrors.content}</span>
                : <span />}
              <span className="text-xs text-slate-400">{content.length} 字</span>
            </div>
          </div>

          {/* 附件（演示版简化处理：手动输入文件名） */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">附件（演示）</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-y"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              placeholder="演示版：手动输入附件文件名，多个用逗号分隔，如：采购计划明细.xlsx, 预算方案.pdf"
            />
            <div className="text-xs text-slate-400 mt-1">生产版将对接真实文件上传接口</div>
          </div>

          {/* 申请人信息只读 */}
          <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <div className="flex items-center gap-1 mb-1 font-medium text-slate-700">
              <Clock size={12} />申请人信息（自动带入）
            </div>
            申请人：{currentUser.name}
            {currentUser.department && <span className="ml-3">部门：{currentUser.department}</span>}
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="p-4">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#1E40AF]">自定义内容区</h1>
        <p className="text-xs text-[#909399] mt-1">
          按已配置的审批流程模板，发起自由审批申请。流程节点、审批人由基础系统配置，发起后自动流转。
        </p>
      </div>

      {/* 筛选 */}
      <SearchBar
        onSearch={() => {}}
        onReset={() => setFilters({ status: '', keyword: '' })}
      >
        <SearchField
          label="审批状态"
          value={filters.status}
          onChange={(v) => setFilters({ ...filters, status: v })}
          options={statusOptions}
        />
        <SearchField
          label="关键词"
          value={filters.keyword}
          onChange={(v) => setFilters({ ...filters, keyword: v })}
          placeholder="标题/编号/申请人/流程名"
        />
      </SearchBar>

      {/* 操作按钮区 */}
      <div className="mb-3 flex justify-between items-center">
        <div className="text-xs text-slate-500">
          共 <span className="text-slate-700 font-medium">{filteredData.length}</span> 条记录
        </div>
        <PrimaryButton onClick={openAdd} disabled={availableConfigs.length === 0}>
          <Plus size={14} className="inline mr-1" />发起审批
        </PrimaryButton>
      </div>

      {/* 表格 */}
      <DataTable data={filteredData} columns={columns} />

      {/* 详情弹窗 */}
      {renderDetailModal()}

      {/* 发起审批弹窗 */}
      {renderFormModal()}
    </div>
  );
}
