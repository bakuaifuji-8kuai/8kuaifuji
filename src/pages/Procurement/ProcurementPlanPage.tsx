import { useMemo, useState, useRef } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ProcurementPlan, ProcurementPlanDetail, ProjectNature, ProcurementMethod, BidEvaluationMethod, ApprovalRecord, ApprovalFlowConfig } from '@/types';

export default function ProcurementPlanPage() {
  const procurementPlans = useStore((s) => s.procurementPlans);
  const addProcurementPlan = useStore((s) => s.addProcurementPlan);
  const updateProcurementPlan = useStore((s) => s.updateProcurementPlan);
  const deleteProcurementPlan = useStore((s) => s.deleteProcurementPlan);
  const currentUser = useStore((s) => s.currentUser);
  const approvalFlowConfigs = useStore((s) => s.approvalFlowConfigs);

  const [filterNo, setFilterNo] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({ no: '', department: '', status: '' });

  const filteredData = useMemo(() => {
    return procurementPlans.filter((p) => {
      if (applied.no && !p.planNo.includes(applied.no)) return false;
      if (applied.department && !p.department.includes(applied.department)) return false;
      if (applied.status && p.status !== applied.status) return false;
      return true;
    });
  }, [procurementPlans, applied]);

  const columns: ColumnDef<ProcurementPlan>[] = [
  { key: 'planNo', title: '计划编号' },
  {
    key: 'planMode',
    title: '计划方式',
    render: (row) => row.planMode === 'filing' ? (
      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">报备制</span>
    ) : (
      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded">审批制</span>
    ),
  },
  {
    key: 'planType',
    title: '计划类型',
    render: (row) => row.planMode === 'filing' ? '—' : (row.planType === 'monthly' ? '月度计划' : '年度计划'),
  },
    { key: 'year', title: '年份' },
    { key: 'month', title: '月份', render: (row) => row.planType === 'annual' ? '-' : (row.month || '-') },
    { key: 'department', title: '需求部门' },
    {
      key: 'status',
      title: '状态',
      render: (row) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'text-[#909399]' },
          pending: { label: '待审批', color: 'text-[#e6a23c]' },
          approved: { label: '已审批', color: 'text-[#67c23a]' },
          returned: { label: '已退回', color: 'text-[#f56c6c]' },
        };
        const status = statusMap[row.status] || statusMap.draft;
        if (row.status === 'pending' && row.currentNodeName) {
          return (
            <div>
              <span className={status.color}>{status.label}</span>
              <div className="text-xs text-[#909399]">当前节点：{row.currentNodeName}</div>
            </div>
          );
        }
        return <span className={status.color}>{status.label}</span>;
      },
    },
    { key: 'creator', title: '编制人' },
    { key: 'createTime', title: '编制时间', render: (row) => row.createTime?.split(' ')[0] || '-' },
    {
      key: 'totalBudget',
      title: '预算总额(万元)',
      render: (row) => row.details.reduce((sum, d) => sum + d.budgetAmount, 0).toFixed(2),
    },
    { key: 'remark', title: '备注', render: (row) => row.remark || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3 flex-wrap">
          <TextButton
            onClick={() => {
              setEditItem(row);
              setDetails(row.details || []);
              setIsNew(false);
            }}
          >{row.status === 'pending' ? '查看' : (row.status === 'returned' || row.status === 'rejected_by_modify' || row.isModifiedDuringApproval) ? '修改' : '编辑'}</TextButton>
          <TextButton onClick={() => handleExport(row)}>导出Excel</TextButton>
          {row.status === 'draft' && (
            <TextButton onClick={() => handleSubmit(row)}>提交审批</TextButton>
          )}
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => handleApproveNode(row)}>通过</TextButton>
              <TextButton onClick={() => openComment(row)}>意见批注</TextButton>
              <TextButton onClick={() => openReturn(row)}>退回</TextButton>
              <TextButton type="danger" onClick={() => handleReject(row)}>驳回</TextButton>
            </>
          )}
          {row.status === 'returned' && (
            <TextButton onClick={() => handleResubmit(row)}>重新提交</TextButton>
          )}
          <TextButton onClick={() => openFlowHistory(row)}>审批历史</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除计划 ${row.planNo}？`)) deleteProcurementPlan(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<ProcurementPlan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [details, setDetails] = useState<ProcurementPlanDetail[]>([]);
  const [newPlanType, setNewPlanType] = useState<'annual' | 'monthly'>('monthly');
  const [newPlanMode, setNewPlanMode] = useState<'approval' | 'filing'>('approval');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setNewPlanMode('approval');
    setNewPlanType('monthly');
    const now = new Date();
    const newPlan: ProcurementPlan = {
      id: 'PP' + Date.now(),
      planNo: `CGJH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(procurementPlans.length + 1).padStart(3, '0')}`,
      planType: 'monthly',
      planMode: 'approval',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      department: currentUser.department || '',
      status: 'draft',
      createTime: now.toISOString().replace('T', ' ').slice(0, 19),
      creator: currentUser.name,
      details: [],
    };
    setDetails([]);
    setIsNew(true);
    setEditItem(newPlan);
  };

  const handleSubmit = (plan: ProcurementPlan) => {
    updateProcurementPlan(plan.id, { status: 'pending' });
  };

  const handleApprove = (plan: ProcurementPlan) => {
    updateProcurementPlan(plan.id, { status: 'approved', approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19), approver: currentUser.name });
  };

  // 获取适用流程配置
  const getFlowConfig = (plan: ProcurementPlan | null): ApprovalFlowConfig | undefined => {
    if (!plan) return undefined;
    if (plan.flowConfigId) {
      return approvalFlowConfigs.find((c) => c.id === plan.flowConfigId && c.isActive);
    }
    return approvalFlowConfigs.find(
      (c) => c.businessType === 'procurement_plan' && c.businessSubType === plan.planType && c.isActive
    );
  };

  // 节点审批通过：流转到下一节点，最后一节点通过则置为已批准
  const handleApproveNode = (plan: ProcurementPlan) => {
    const flow = getFlowConfig(plan);
    if (!flow) {
      // 无流程配置时退回原逻辑
      handleApprove(plan);
      return;
    }
    const currentIdx = flow.nodes.findIndex((n) => n.id === plan.currentNodeId);
    const nextNode = currentIdx >= 0 ? flow.nodes[currentIdx + 1] : null;
    const record: ApprovalRecord = {
      approver: currentUser.name,
      approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      result: 'approved',
      nodeName: plan.currentNodeName,
    };
    const history = [...(plan.approvalHistory || []), record];
    if (!nextNode) {
      // 已是最后节点，审批完成
      updateProcurementPlan(plan.id, {
        status: 'approved',
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        approver: currentUser.name,
        approvalHistory: history,
        currentNodeId: undefined,
        currentNodeName: undefined,
      });
    } else {
      updateProcurementPlan(plan.id, {
        currentNodeId: nextNode.id,
        currentNodeName: nextNode.nodeName,
        approvalHistory: history,
      });
    }
  };

  // 意见批注（不流转节点）
  const [commentItem, setCommentItem] = useState<ProcurementPlan | null>(null);
  const [commentText, setCommentText] = useState('');
  const openComment = (plan: ProcurementPlan) => {
    setCommentItem(plan);
    setCommentText('');
  };
  const saveComment = () => {
    if (!commentItem || !commentText.trim()) {
      alert('请输入批注内容');
      return;
    }
    const record: ApprovalRecord = {
      approver: currentUser.name,
      approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      result: 'commented',
      comment: commentText,
      nodeName: commentItem.currentNodeName,
    };
    const history = [...(commentItem.approvalHistory || []), record];
    updateProcurementPlan(commentItem.id, { approvalHistory: history });
    setCommentItem(null);
    setCommentText('');
  };

  // 退回：退回至任一历史节点或起草人
  const [returnItem, setReturnItem] = useState<ProcurementPlan | null>(null);
  const [returnToNodeId, setReturnToNodeId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const openReturn = (plan: ProcurementPlan) => {
    setReturnItem(plan);
    setReturnToNodeId('');
    setReturnReason('');
  };
  const saveReturn = () => {
    if (!returnItem || !returnToNodeId) {
      alert('请选择退回节点');
      return;
    }
    const flow = getFlowConfig(returnItem);
    const targetNode = flow?.nodes.find((n) => n.id === returnToNodeId);
    const record: ApprovalRecord = {
      approver: currentUser.name,
      approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      result: 'returned',
      comment: returnReason || `退回至节点：${targetNode?.nodeName || '起草人'}`,
      nodeName: returnItem.currentNodeName,
      returnedToNode: targetNode?.nodeName || '起草人',
    };
    const history = [...(returnItem.approvalHistory || []), record];
    if (targetNode) {
      // 退回到指定节点
      updateProcurementPlan(returnItem.id, {
        status: 'returned',
        currentNodeId: targetNode.id,
        currentNodeName: targetNode.nodeName,
        approvalHistory: history,
        isModifiedDuringApproval: true,
      });
    } else {
      // 退回到起草人
      updateProcurementPlan(returnItem.id, {
        status: 'draft',
        currentNodeId: undefined,
        currentNodeName: undefined,
        approvalHistory: history,
        isModifiedDuringApproval: true,
        remark: `退回修改：${returnReason || '请根据审批意见修改'}`,
      });
    }
    setReturnItem(null);
  };

  // 重新提交
  const handleResubmit = (plan: ProcurementPlan) => {
    const flow = getFlowConfig(plan);
    const firstNode = flow?.nodes[0];
    const record: ApprovalRecord = {
      approver: currentUser.name,
      approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      result: 'commented',
      comment: '重新提交审批',
    };
    const history = [...(plan.approvalHistory || []), record];
    updateProcurementPlan(plan.id, {
      status: 'pending',
      currentNodeId: firstNode?.id,
      currentNodeName: firstNode?.nodeName,
      approvalHistory: history,
      isModifiedDuringApproval: false,
    });
  };

  // 审批历史
  const [historyItem, setHistoryItem] = useState<ProcurementPlan | null>(null);
  const openFlowHistory = (plan: ProcurementPlan) => {
    setHistoryItem(plan);
  };

  const handleReject = (plan: ProcurementPlan) => {
    const reason = prompt('请输入驳回原因：');
    if (reason) {
      const record: ApprovalRecord = {
        approver: currentUser.name,
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        result: 'rejected',
        comment: reason,
        nodeName: plan.currentNodeName,
      };
      const history = [...(plan.approvalHistory || []), record];
      updateProcurementPlan(plan.id, {
        status: 'draft',
        approver: currentUser.name,
        remark: `驳回原因：${reason}`,
        approvalHistory: history,
        currentNodeId: undefined,
        currentNodeName: undefined,
      });
    }
  };

  const handleSave = () => {
    if (!editItem) return;
    const isApprovalMod = editItem.status === 'pending' || editItem.status === 'returned';
    const savePlan = {
      ...editItem,
      details,
      // 审批过程中修改，自动记录
      isModifiedDuringApproval: isApprovalMod ? true : editItem.isModifiedDuringApproval,
    };
    if (isNew) {
      addProcurementPlan(savePlan);
    } else {
      updateProcurementPlan(savePlan.id, savePlan);
    }
    setEditItem(null);
    setDetails([]);
  };

  // 新增计划明细（纯手填）
  const addDetail = () => {
    const newDetail: ProcurementPlanDetail = {
      id: 'PPD' + Date.now(),
      planId: editItem?.id || '',
      seq: details.length + 1,
      projectName: '',
      projectNature: '',
      projectOverview: '',
      budgetAmount: 0,
      userRequirementDocDate: '',
      budgetApprovalDate: '',
      contractReviewDate: '',
      planProcurementStartDate: '',
      planProcurementEndDate: '',
      remark: '',
    };
    setDetails([...details, newDetail]);
  };

  const updateDetail = (index: number, field: keyof ProcurementPlanDetail, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index).map((d, i) => ({ ...d, seq: i + 1 })));
  };

  // Excel导出功能 - 年度/月度计划统一字段
  const handleExport = (plan: ProcurementPlan) => {
    const isAnnual = plan.planType === 'annual';
    const headers = [
      '序号', '需求部门', '项目名称', '项目类别', '项目概况', '项目估（预）算（万元）',
      '用户需求书编制计划完成时间', '预算编制审批计划完成时间', '合同前置审核计划完成时间',
      '计划采购启动时间', '计划采购完成时间'
    ];

    const rows = plan.details.map((d, i) => [
      i + 1, plan.department, d.projectName, d.projectNature, d.projectOverview, d.budgetAmount,
      d.userRequirementDocDate || '', d.budgetApprovalDate || '', d.contractReviewDate || '',
      d.planProcurementStartDate || '', d.planProcurementEndDate || ''
    ]);

    const csvContent = [
      [`${isAnnual ? plan.year + '年度计划' : plan.year + '年' + plan.month + '月月度计划'}`],
      headers,
      ...rows
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${plan.planNo}_${isAnnual ? '年度' : '月度'}采购计划.csv`;
    link.click();
  };

  // 下载空白导入模板
  const handleDownloadTemplate = () => {
    const isAnnual = editItem?.planType === 'annual';
    const headers = [
      '序号', '需求部门', '项目名称', '项目类别', '项目概况', '项目估（预）算（万元）',
      '用户需求书编制计划完成时间', '预算编制审批计划完成时间', '合同前置审核计划完成时间',
      '计划采购启动时间', '计划采购完成时间'
    ];
    const sampleRow = [
      1, 'XX部', '展会地毯铺设服务', '服务', 'XX展会通道地毯', 15,
      '2026-03-01', '2026-03-15', '2026-03-20',
      '2026-04-01', '2026-04-30'
    ];
    const csvContent = [
      [`${isAnnual ? editItem?.year + '年度计划' : editItem?.year + '年' + editItem?.month + '月月度计划'}`],
      headers,
      sampleRow
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${isAnnual ? '年度' : '月度'}采购计划导入模板.csv`;
    link.click();
  };

  // Excel导入功能（年度/月度计划统一解析）
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editItem) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      // 找到表头行（包含"项目名称"字样的行）
      const headerIdx = lines.findIndex(l => l.includes('项目名称') && l.includes('项目估'));
      if (headerIdx < 0) {
        alert('未识别到表头，请使用标准模板');
        return;
      }

      const headers = lines[headerIdx].split(',').map(h => h.replace(/"/g, '').trim());
      const importedDetails: ProcurementPlanDetail[] = [];
      let seq = 1;

      for (let i = headerIdx + 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        if (values.length < 6) continue;
        // 第一列序号为1表示这是示例行
        if (values[0] === '1' && values[2] === '展会地毯铺设服务') continue;

        const detail: ProcurementPlanDetail = {
          id: 'PPD' + Date.now() + '_' + i,
          planId: editItem.id,
          seq: seq++,
          projectName: values[2] || '',
          projectNature: (values[3] || '') as ProjectNature,
          projectOverview: values[4] || '',
          budgetAmount: parseFloat(values[5]) || 0,
          userRequirementDocDate: values[6] || '',
          budgetApprovalDate: values[7] || '',
          contractReviewDate: values[8] || '',
          planProcurementStartDate: values[9] || '',
          planProcurementEndDate: values[10] || '',
        };
        importedDetails.push(detail);
      }

      if (importedDetails.length > 0) {
        setDetails(importedDetails);
        alert(`成功导入 ${importedDetails.length} 条计划明细`);
      } else {
        alert('未识别到有效数据行，请检查模板');
      }
    };
    reader.readAsText(file);

    // 清空input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalBudget = details.reduce((sum, d) => sum + d.budgetAmount, 0);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">招采计划</h2>
        <div className="flex gap-2">
          <PrimaryButton onClick={openAdd}>+ 新增计划</PrimaryButton>
        </div>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, department: filterDepartment, status: filterStatus })}
        onReset={() => {
          setFilterNo('');
          setFilterDepartment('');
          setFilterStatus('');
          setApplied({ no: '', department: '', status: '' });
        }}
      >
        <SearchField label="计划编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="需求部门" placeholder="请输入" value={filterDepartment} onChange={setFilterDepartment} />
        <SearchField
          label="状态"
          type="select"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'pending', label: '待审批' },
            { value: 'approved', label: '已审批' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal
        open={!!editItem}
        title={isNew ? '新增采购计划' : '编辑采购计划'}
        onClose={() => { setEditItem(null); setDetails([]); }}
        footer={
          <>
            <DefaultButton onClick={() => { setEditItem(null); setDetails([]); }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="95vw"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <div>
              <div className="mb-1 text-[#606266]">计划编号</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem?.planNo || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, planNo: e.target.value })}
              />
            </div>
            <div>
                <div className="mb-1 text-[#606266]">计划方式</div>
                {isNew ? (
                  <select
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                    value={newPlanMode}
                    onChange={(e) => {
                      const mode = e.target.value as 'approval' | 'filing';
                      setNewPlanMode(mode);
                      if (mode === 'filing') {
                        // 报备制计划类型显示 "—"
                        setNewPlanType('monthly');
                        if (editItem) setEditItem({ ...editItem, planMode: mode, planType: 'monthly' });
                      } else {
                        if (editItem) setEditItem({ ...editItem, planMode: mode });
                      }
                    }}
                  >
                    <option value="approval">审批制</option>
                    <option value="filing">报备制</option>
                  </select>
                ) : (
                  <input
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#606266] bg-[#f5f7fa]"
                    value={editItem?.planMode === 'filing' ? '报备制' : '审批制'}
                    readOnly
                  />
                )}
              </div>
            <div>
                <div className="mb-1 text-[#606266]">计划类型</div>
                {isNew ? (
                  newPlanMode === 'filing' ? (
                    <input
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#c0c4cc] bg-[#f5f7fa]"
                      value="—"
                      readOnly
                    />
                  ) : (
                    <select
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                      value={newPlanType}
                      onChange={(e) => {
                        const val = e.target.value as 'annual' | 'monthly';
                        setNewPlanType(val);
                        if (editItem) {
                          setEditItem({ ...editItem, planType: val });
                        }
                      }}
                    >
                      <option value="annual">年度计划</option>
                      <option value="monthly">月度计划</option>
                    </select>
                  )
                ) : (
                  <input
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#c0c4cc] bg-[#f5f7fa]"
                    value={editItem?.planMode === 'filing' ? '—' : (editItem?.planType === 'annual' ? '年度计划' : '月度计划')}
                    readOnly
                  />
                )}
              </div>
            <div>
              <div className="mb-1 text-[#606266]">年份</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem?.year || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, year: e.target.value })}
              />
            </div>
            {(isNew && newPlanType === 'monthly') || (!isNew && editItem?.planType === 'monthly') ? (
            <div>
              <div className="mb-1 text-[#606266]">月份</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem?.month || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, month: e.target.value })}
              />
            </div>
          ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-[#606266]">需求部门</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem?.department || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, department: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem?.remark || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#606266]">计划明细</div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                />
                <DefaultButton size="small" onClick={handleDownloadTemplate}>下载模板</DefaultButton>
                <DefaultButton size="small" onClick={handleImportClick}>导入Excel</DefaultButton>
                <PrimaryButton size="small" onClick={addDetail}>+ 添加明细</PrimaryButton>
              </div>
            </div>
            <div className="mb-2 p-2 bg-[#fef3c7]/30 border border-[#fef3c7] rounded text-xs text-[#92400e]">
              <div className="mb-1"><span className="text-[#ef4444]">*</span> 标红字段为必填项</div>
              <div>• "项目名称、项目类别、项目概况、项目估（预）算、招标采购前置阶段"由需求部门填写</div>
              <div>• "招标采购阶段"由综合管理部填写</div>
            </div>
            <div className="border border-[#dcdfe6] rounded max-h-96 overflow-auto">
              <table className="w-full" style={{ minWidth: '2000px' }}>
                <thead className="sticky top-0 bg-[#f5f7fa]">
                  <tr>
                    <th colSpan={6} className="px-2 py-1 text-xs text-center border-r border-[#dcdfe6]">项目基本信息</th>
                    <th colSpan={3} className="px-2 py-1 text-xs text-center border-r border-[#dcdfe6] bg-[#fef3c7]">招标采购前置阶段</th>
                    <th colSpan={2} className="px-2 py-1 text-xs text-center bg-[#dbeafe]">招标采购阶段</th>
                    <th rowSpan={2} className="px-2 py-2 text-xs text-left w-20 whitespace-nowrap">操作</th>
                  </tr>
                  <tr>
                    <th className="px-2 py-2 text-xs text-left w-12 whitespace-nowrap">序号</th>
                    <th className="px-2 py-2 text-xs text-left w-32 whitespace-nowrap"><span className="text-[#ef4444]">*</span>需求部门</th>
                    <th className="px-2 py-2 text-xs text-left w-36 whitespace-nowrap"><span className="text-[#ef4444]">*</span>项目名称</th>
                    <th className="px-2 py-2 text-xs text-left w-20 whitespace-nowrap"><span className="text-[#ef4444]">*</span>项目类别</th>
                    <th className="px-2 py-2 text-xs text-left w-40 whitespace-nowrap"><span className="text-[#ef4444]">*</span>项目概况</th>
                    <th className="px-2 py-2 text-xs text-left w-28 whitespace-nowrap"><span className="text-[#ef4444]">*</span>项目估（预）算（万元）</th>
                    <th className="px-2 py-2 text-xs text-left w-36 whitespace-nowrap bg-[#fef3c7]"><span className="text-[#ef4444]">*</span>用户需求书编制计划完成时间</th>
                    <th className="px-2 py-2 text-xs text-left w-36 whitespace-nowrap bg-[#fef3c7]"><span className="text-[#ef4444]">*</span>预算编制审批计划完成时间</th>
                    <th className="px-2 py-2 text-xs text-left w-36 whitespace-nowrap bg-[#fef3c7]"><span className="text-[#ef4444]">*</span>合同前置审核计划完成时间</th>
                    <th className="px-2 py-2 text-xs text-left w-32 whitespace-nowrap bg-[#dbeafe]"><span className="text-[#ef4444]">*</span>计划采购启动时间</th>
                    <th className="px-2 py-2 text-xs text-left w-32 whitespace-nowrap bg-[#dbeafe]"><span className="text-[#ef4444]">*</span>计划采购完成时间</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail, index) => (
                    <tr key={detail.id} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-1 text-xs whitespace-nowrap">{detail.seq}</td>
                      <td className="px-2 py-1">
                        <input
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={editItem?.department || ''}
                          readOnly
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.projectName}
                          onChange={(e) => updateDetail(index, 'projectName', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <select
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.projectNature}
                          onChange={(e) => updateDetail(index, 'projectNature', e.target.value as ProjectNature)}
                        >
                          <option value="">请选择</option>
                          <option value="服务">服务</option>
                          <option value="工程">工程</option>
                          <option value="物资">物资</option>
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.projectOverview}
                          onChange={(e) => updateDetail(index, 'projectOverview', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.budgetAmount}
                          onChange={(e) => updateDetail(index, 'budgetAmount', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-2 py-1 bg-[#fef3c7]/30">
                        <input
                          type="date"
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.userRequirementDocDate || ''}
                          onChange={(e) => updateDetail(index, 'userRequirementDocDate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 bg-[#fef3c7]/30">
                        <input
                          type="date"
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.budgetApprovalDate || ''}
                          onChange={(e) => updateDetail(index, 'budgetApprovalDate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 bg-[#fef3c7]/30">
                        <input
                          type="date"
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.contractReviewDate || ''}
                          onChange={(e) => updateDetail(index, 'contractReviewDate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 bg-[#dbeafe]/30">
                        <input
                          type="date"
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.planProcurementStartDate || ''}
                          onChange={(e) => updateDetail(index, 'planProcurementStartDate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 bg-[#dbeafe]/30">
                        <input
                          type="date"
                          className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                          value={detail.planProcurementEndDate || ''}
                          onChange={(e) => updateDetail(index, 'planProcurementEndDate', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <TextButton type="danger" size="small" onClick={() => removeDetail(index)}>删除</TextButton>
                      </td>
                    </tr>
                  ))}
                  {details.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-3 py-4 text-center text-[#909399] text-sm">暂无明细，请点击"导入Excel"或"添加明细"</td>
                    </tr>
                  )}
                </tbody>
                {details.length > 0 && (
                  <tfoot className="bg-[#f5f7fa]">
                    <tr>
                      <td colSpan={5} className="px-2 py-2 text-xs text-right font-bold">合计：</td>
                      <td className="px-2 py-2 text-xs font-bold">{totalBudget.toFixed(2)} 万元</td>
                      <td colSpan={6}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* 意见批注弹窗 */}
      <Modal
        open={!!commentItem}
        title="审批意见批注"
        onClose={() => setCommentItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setCommentItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={saveComment}>保存批注</PrimaryButton>
          </>
        }
        width="500px"
      >
        <div className="space-y-3">
          <div className="text-sm text-[#606266]">
            计划编号：{commentItem?.planNo}，当前节点：{commentItem?.currentNodeName}
          </div>
          <div>
            <div className="mb-1 text-[#606266]">批注内容 <span className="text-red-500">*</span></div>
            <textarea
              className="w-full h-24 px-2 py-1 border border-[#dcdfe6] rounded text-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="请输入审批意见，批注不会流转节点"
            />
          </div>
        </div>
      </Modal>

      {/* 退回弹窗 */}
      <Modal
        open={!!returnItem}
        title="退回采购计划"
        onClose={() => setReturnItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setReturnItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={saveReturn}>确认退回</PrimaryButton>
          </>
        }
        width="500px"
      >
        <div className="space-y-3">
          <div className="text-sm text-[#606266]">
            计划编号：{returnItem?.planNo}，当前节点：{returnItem?.currentNodeName}
          </div>
          <div>
            <div className="mb-1 text-[#606266]">退回至 <span className="text-red-500">*</span></div>
            <select
              className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
              value={returnToNodeId}
              onChange={(e) => setReturnToNodeId(e.target.value)}
            >
              <option value="">请选择退回节点</option>
              <option value="__draft__">退回到起草人（待修改后重新提交）</option>
              {getFlowConfig(returnItem!)?.nodes
                .filter((n) => n.id !== returnItem?.currentNodeId)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    退回到：{n.nodeOrder}. {n.nodeName}（{n.approverName || n.approverRole}）
                  </option>
                ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[#606266]">退回原因</div>
            <textarea
              className="w-full h-24 px-2 py-1 border border-[#dcdfe6] rounded text-sm"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="请说明退回原因（可选）"
            />
          </div>
        </div>
      </Modal>

      {/* 审批历史弹窗 */}
      <Modal
        open={!!historyItem}
        title="审批历史与流程"
        onClose={() => setHistoryItem(null)}
        footer={<DefaultButton onClick={() => setHistoryItem(null)}>关闭</DefaultButton>}
        width="700px"
      >
        {historyItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm p-3 bg-gray-50 rounded">
              <div><span className="text-[#909399]">计划编号：</span>{historyItem.planNo}</div>
              <div><span className="text-[#909399]">编制人：</span>{historyItem.creator}</div>
              <div><span className="text-[#909399]">计划类型：</span>{historyItem.planType === 'monthly' ? '月度计划' : '年度计划'}</div>
              <div><span className="text-[#909399]">需求部门：</span>{historyItem.department}</div>
              <div><span className="text-[#909399]">当前状态：</span>{
                ({ draft: '草稿', pending: '待审批', approved: '已审批', returned: '已退回' } as any)[historyItem.status]
              }</div>
              {historyItem.currentNodeName && (
                <div><span className="text-[#909399]">当前节点：</span>{historyItem.currentNodeName}</div>
              )}
            </div>

            {/* 流程图 */}
            {getFlowConfig(historyItem) ? (
              <div>
                <div className="font-bold text-[#606266] mb-2">审批流程：</div>
                <div className="flex items-center gap-2 flex-wrap p-3 bg-blue-50 rounded">
                  {getFlowConfig(historyItem)!.nodes.map((n, i) => {
                    const isCurrent = n.id === historyItem.currentNodeId;
                    const isPassed = historyItem.approvalHistory?.some(
                      (r) => r.nodeName === n.nodeName && r.result === 'approved'
                    );
                    return (
                      <div key={n.id} className="flex items-center">
                        <div className={`px-3 py-2 border-2 rounded text-xs ${
                          isCurrent ? 'border-[#e6a23c] bg-orange-50' :
                          isPassed ? 'border-[#67c23a] bg-green-50' :
                          'border-[#dcdfe6] bg-white'
                        }`}>
                          <div className="font-bold">{n.nodeOrder}. {n.nodeName}</div>
                          <div className="text-[#909399]">{n.approverName || n.approverRole}</div>
                        </div>
                        {i < getFlowConfig(historyItem)!.nodes.length - 1 && (
                          <div className="mx-2 text-[#1E40AF] text-xl">→</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#909399] p-3 bg-gray-50 rounded">该计划未配置审批流程或流程已被停用</div>
            )}

            {/* 审批历史 */}
            <div>
              <div className="font-bold text-[#606266] mb-2">审批历史：</div>
              {(!historyItem.approvalHistory || historyItem.approvalHistory.length === 0) ? (
                <div className="text-sm text-[#909399] p-3 bg-gray-50 rounded text-center">暂无审批记录</div>
              ) : (
                <div className="border border-[#dcdfe6] rounded max-h-64 overflow-auto">
                  {historyItem.approvalHistory.map((r, i) => {
                    const resultMap: Record<string, { label: string; color: string; bg: string }> = {
                      approved: { label: '通过', color: 'text-[#67c23a]', bg: 'bg-green-50' },
                      rejected: { label: '驳回', color: 'text-[#f56c6c]', bg: 'bg-red-50' },
                      returned: { label: '退回', color: 'text-[#e6a23c]', bg: 'bg-orange-50' },
                      commented: { label: '批注', color: 'text-[#3b82f6]', bg: 'bg-blue-50' },
                    };
                    const info = resultMap[r.result];
                    return (
                      <div key={i} className={`p-3 border-b border-[#ebeef5] last:border-b-0 ${info.bg}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className={`font-bold ${info.color}`}>{info.label}</span>
                            {r.nodeName && <span className="ml-2 text-sm text-[#606266]">@ {r.nodeName}</span>}
                            {r.returnedToNode && <span className="ml-2 text-sm text-[#e6a23c]">→ {r.returnedToNode}</span>}
                          </div>
                          <div className="text-xs text-[#909399]">{r.approveTime}</div>
                        </div>
                        <div className="text-sm text-[#606266]">操作人：{r.approver}</div>
                        {r.comment && <div className="text-sm text-[#606266] mt-1">意见：{r.comment}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {historyItem.isModifiedDuringApproval && (
              <div className="text-sm text-[#e6a23c] p-2 bg-orange-50 rounded">
                ⚠ 该计划在审批过程中已被修改
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}