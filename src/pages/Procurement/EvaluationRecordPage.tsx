import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { EvaluationRecord, EvaluationStatus } from '@/types';
import { EVALUATION_TYPE_LABELS, EVALUATION_STATUS_LABELS } from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { Eye, Check, X, Download, Trash2, BarChart3 } from 'lucide-react';

export default function EvaluationRecordPage() {
  const evaluationRecords = useStore((s) => s.evaluationRecords) || [];
  const updateEvaluationRecord = useStore((s) => s.updateEvaluationRecord);
  const deleteEvaluationRecord = useStore((s) => s.deleteEvaluationRecord);
  const currentUser = useStore((s) => s.currentUser);

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [applied, setApplied] = useState({ status: '', type: '', text: '', dateFrom: '', dateTo: '' });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<EvaluationRecord | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalItem, setApprovalItem] = useState<EvaluationRecord | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  const filteredData = useMemo(() => {
    return evaluationRecords.filter((r) => {
      if (applied.status && r.status !== applied.status) return false;
      if (applied.type && r.type !== applied.type) return false;
      if (applied.text && !r.supplierName.includes(applied.text) && !r.templateName.includes(applied.text)) return false;
      if (applied.dateFrom && r.evaluationDate < applied.dateFrom) return false;
      if (applied.dateTo && r.evaluationDate > applied.dateTo) return false;
      return true;
    });
  }, [evaluationRecords, applied]);

  const stats = useMemo(() => {
    const total = evaluationRecords.length;
    const approvedCount = evaluationRecords.filter((r) => r.status === 'approved').length;
    const pendingCount = evaluationRecords.filter((r) => r.status === 'pending').length;
    const rejectedCount = evaluationRecords.filter((r) => r.status === 'rejected').length;
    const completedCount = evaluationRecords.filter((r) => r.status === 'completed').length;
    const avgScore = evaluationRecords
      .filter((r) => r.totalScore > 0)
      .reduce((sum, r) => sum + r.totalScore, 0) / (evaluationRecords.filter((r) => r.totalScore > 0).length || 1);
    
    // 按供应商统计
    const bySupplier: Record<string, { count: number; totalScore: number }> = {};
    evaluationRecords.forEach((r) => {
      if (!bySupplier[r.supplierName]) {
        bySupplier[r.supplierName] = { count: 0, totalScore: 0 };
      }
      bySupplier[r.supplierName].count++;
      bySupplier[r.supplierName].totalScore += r.totalScore;
    });

    // 按类型统计
    const byType: Record<string, number> = {};
    evaluationRecords.forEach((r) => {
      byType[r.type] = (byType[r.type] || 0) + 1;
    });

    return {
      total,
      approvedCount,
      pendingCount,
      rejectedCount,
      completedCount,
      avgScore: Math.round(avgScore * 10) / 10,
      bySupplier,
      byType,
    };
  }, [evaluationRecords]);

  const scoreLevel = (score: number) => {
    if (score >= 90) return { label: '优秀', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { label: '合格', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: '不合格', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const statusBadgeVariant = (status: EvaluationStatus) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const openView = (record: EvaluationRecord) => {
    setViewItem(record);
    setViewModalOpen(true);
  };

  const openApproval = (record: EvaluationRecord) => {
    setApprovalItem(record);
    setApprovalComment('');
    setApprovalModalOpen(true);
  };

  const handleApproval = (action: 'approved' | 'rejected') => {
    if (!approvalItem) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newHistory = [
      ...(approvalItem.approvalHistory || []),
      {
        approver: currentUser.name,
        action,
        time: now,
        comment: approvalComment || undefined,
      },
    ];

    const newStatus: EvaluationStatus = action === 'approved' ? 'approved' : 'rejected';
    updateEvaluationRecord?.(approvalItem.id, {
      status: newStatus,
      approvalHistory: newHistory,
    });

    setApprovalModalOpen(false);
    setApprovalItem(null);
    alert(action === 'approved' ? '已通过评估审批' : '已驳回评估审批');
  };

  const handleResubmit = (record: EvaluationRecord) => {
    updateEvaluationRecord?.(record.id, {
      status: 'pending',
      approvalHistory: [{
        approver: currentUser.name,
        action: 'pending',
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }],
    });
  };

  const handleDelete = (record: EvaluationRecord) => {
    if (confirm(`确定删除评估记录「${record.supplierName} - ${record.templateName}」吗？`)) {
      deleteEvaluationRecord?.(record.id);
    }
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('暂无数据可导出');
      return;
    }
    const headers = ['供应商', '模板名称', '考核类型', '总分', '状态', '评估人', '评估日期', '项目名称'];
    const rows = filteredData.map((r) => [
      r.supplierName,
      r.templateName,
      EVALUATION_TYPE_LABELS[r.type],
      r.totalScore,
      EVALUATION_STATUS_LABELS[r.status],
      r.evaluator,
      r.evaluationDate,
      r.projectName || '',
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `评估记录_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<EvaluationRecord>[] = [
    {
      header: '供应商',
      accessorKey: 'supplierName',
      cell: ({ row }) => (
        <span className="font-medium text-slate-800">{row.original.supplierName}</span>
      ),
    },
    {
      header: '模板',
      accessorKey: 'templateName',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.templateName}</span>
      ),
    },
    {
      header: '类型',
      accessorKey: 'type',
      cell: ({ row }) => (
        <Badge variant="default">{EVALUATION_TYPE_LABELS[row.original.type]}</Badge>
      ),
    },
    {
      header: '总分',
      accessorKey: 'totalScore',
      cell: ({ row }) => {
        const level = scoreLevel(row.original.totalScore);
        return (
          <span className={`font-bold ${level.color}`}>
            {row.original.totalScore || '-'}
          </span>
        );
      },
    },
    {
      header: '状态',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)}>
          {EVALUATION_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      header: '评估人',
      accessorKey: 'evaluator',
      cell: ({ row }) => <span className="text-slate-600">{row.original.evaluator}</span>,
    },
    {
      header: '评估日期',
      accessorKey: 'evaluationDate',
      cell: ({ row }) => <span className="text-slate-600">{row.original.evaluationDate}</span>,
    },
    {
      header: '操作',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <TextButton onClick={() => openView(row.original)}><Eye size={14} /> 查看</TextButton>
          {row.original.status === 'pending' && (
            <TextButton type="primary" onClick={() => openApproval(row.original)}><Check size={14} /> 审批</TextButton>
          )}
          {row.original.status === 'rejected' && (
            <TextButton onClick={() => handleResubmit(row.original)}>重新提交</TextButton>
          )}
          <TextButton type="danger" onClick={() => handleDelete(row.original)}><Trash2 size={14} /></TextButton>
        </div>
      ),
    },
  ];

  // 供应商排行榜
  const supplierRanking = useMemo(() => {
    return Object.entries(stats.bySupplier)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: Math.round((data.totalScore / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }, [stats.bySupplier]);

  return (
    <div className="p-5">
      {/* 页面标题 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">评估记录</h1>
        <p className="text-sm text-slate-500 mt-1">查看所有供应商履约评估记录，支持筛选、审批和统计分析</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">评估总数</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">待审批</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">已通过</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.approvedCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">已驳回</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.rejectedCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">平均分</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats.avgScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* 左侧筛选和列表 */}
        <div className="col-span-3">
          <Card>
            {/* 筛选区域 */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="pending">待审批</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
                <option value="completed">已完成</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">全部类型</option>
                <option value="quarterly">季度考核</option>
                <option value="single">项目单次考核</option>
                <option value="warranty">质保履约考核</option>
              </select>
              <input
                type="text"
                placeholder="搜索供应商/模板"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-9 px-3 border border-slate-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-slate-400">至</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <DefaultButton onClick={() => setApplied({ status: filterStatus, type: filterType, text: searchText, dateFrom: filterDateFrom, dateTo: filterDateTo })}>搜索</DefaultButton>
              <DefaultButton onClick={() => { setFilterStatus(''); setFilterType(''); setSearchText(''); setFilterDateFrom(''); setFilterDateTo(''); setApplied({ status: '', type: '', text: '', dateFrom: '', dateTo: '' }); }}>重置</DefaultButton>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end mb-4">
              <DefaultButton onClick={handleExport}><Download size={14} /> 导出</DefaultButton>
            </div>

            {/* 数据表格 */}
            <DataTable data={filteredData} columns={columns} />
          </Card>
        </div>

        {/* 右侧统计分析 */}
        <div className="col-span-1 space-y-5">
          {/* 供应商排行榜 */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">供应商评分排行</span>
            </div>
            {supplierRanking.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {supplierRanking.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-700 truncate">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.count} 次评估</div>
                    </div>
                    <span className={`text-lg font-bold ${scoreLevel(item.avgScore).color}`}>
                      {item.avgScore}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 类型分布 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">考核类型分布</div>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{EVALUATION_TYPE_LABELS[type as keyof typeof EVALUATION_TYPE_LABELS]}</span>
                  <span className="text-sm font-medium text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 查看详情弹窗 */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="评估详情"
        size="lg"
      >
        {viewItem && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-slate-200 pb-4">
              <div>
                <span className="text-slate-500">供应商：</span>
                <span className="text-slate-800 font-medium">{viewItem.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500">模板：</span>
                <span className="text-slate-800">{viewItem.templateName}</span>
              </div>
              <div>
                <span className="text-slate-500">考核类型：</span>
                <Badge variant="default">{EVALUATION_TYPE_LABELS[viewItem.type]}</Badge>
              </div>
              <div>
                <span className="text-slate-500">状态：</span>
                <Badge variant={statusBadgeVariant(viewItem.status)}>
                  {EVALUATION_STATUS_LABELS[viewItem.status]}
                </Badge>
              </div>
              <div>
                <span className="text-slate-500">评估人：</span>
                <span className="text-slate-800">{viewItem.evaluator}</span>
              </div>
              <div>
                <span className="text-slate-500">评估日期：</span>
                <span className="text-slate-800">{viewItem.evaluationDate}</span>
              </div>
              {viewItem.projectName && (
                <div className="col-span-2">
                  <span className="text-slate-500">项目名称：</span>
                  <span className="text-slate-800">{viewItem.projectName}</span>
                </div>
              )}
            </div>

            {/* 总分展示 */}
            <div className="flex items-center justify-center py-4">
              <div className={`rounded-xl p-4 text-center ${scoreLevel(viewItem.totalScore).bg}`}>
                <div className={`text-4xl font-bold ${scoreLevel(viewItem.totalScore).color}`}>
                  {viewItem.totalScore}
                </div>
                <div className={`text-sm ${scoreLevel(viewItem.totalScore).color}`}>
                  {scoreLevel(viewItem.totalScore).label}
                </div>
              </div>
            </div>

            {/* 各指标得分 */}
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">各项指标得分</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-600">指标名称</th>
                    <th className="text-center py-2 text-slate-600">权重</th>
                    <th className="text-center py-2 text-slate-600">得分</th>
                    <th className="text-center py-2 text-slate-600">加权分</th>
                    <th className="text-left py-2 text-slate-600">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.scores.map((score) => (
                    <tr key={score.indicatorId} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{score.indicatorName}</td>
                      <td className="py-2 text-center text-slate-600">{score.weight}%</td>
                      <td className="py-2 text-center text-slate-800 font-medium">{score.score}</td>
                      <td className="py-2 text-center text-indigo-600 font-medium">{score.weightedScore}</td>
                      <td className="py-2 text-slate-500 text-xs">{score.comment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 审批流程 */}
            {viewItem.approvalHistory && viewItem.approvalHistory.length > 0 && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">审批流程</div>
                <div className="space-y-2">
                  {viewItem.approvalHistory.map((history, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        history.action === 'approved' ? 'bg-green-100 text-green-600' :
                        history.action === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {history.action === 'approved' ? <Check size={12} /> : history.action === 'rejected' ? <X size={12} /> : '...'}
                      </div>
                      <div>
                        <span className="text-slate-800">{history.approver}</span>
                        <span className="text-slate-500 ml-2">
                          {history.action === 'approved' ? '已通过' : history.action === 'rejected' ? '已驳回' : '待审批'}
                        </span>
                        <span className="text-slate-400 ml-2 text-xs">{history.time}</span>
                        {history.comment && (
                          <div className="text-slate-500 text-xs mt-1">{history.comment}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 备注 */}
            {viewItem.remark && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">评估备注</div>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">{viewItem.remark}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 审批弹窗 */}
      <Modal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="评估审批"
        size="sm"
      >
        {approvalItem && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded">
              <div className="text-sm text-slate-500">供应商</div>
              <div className="text-slate-800 font-medium">{approvalItem.supplierName}</div>
              <div className="text-sm text-slate-500 mt-2">模板</div>
              <div className="text-slate-800">{approvalItem.templateName}</div>
              <div className="text-sm text-slate-500 mt-2">总分</div>
              <div className={`text-lg font-bold ${scoreLevel(approvalItem.totalScore).color}`}>
                {approvalItem.totalScore} ({scoreLevel(approvalItem.totalScore).label})
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">审批意见</label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="w-full h-20 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="请输入审批意见（可选）"
              />
            </div>
            <div className="flex justify-end gap-2">
              <DefaultButton onClick={() => setApprovalModalOpen(false)}>取消</DefaultButton>
              <DefaultButton onClick={() => handleApproval('rejected')}><X size={14} /> 驳回</DefaultButton>
              <PrimaryButton onClick={() => handleApproval('approved')}><Check size={14} /> 通过</PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
