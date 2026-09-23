import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type {
  EvaluationTemplate,
  EvaluationRecord,
  EvaluationScoreItem,
  EvaluationStatus,
  Attachment,
  ContractLedger,
  EvaluationType,
} from '@/types';
import { EVALUATION_TYPE_LABELS, EVALUATION_STATUS_LABELS } from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { Plus, Save, Send, FileUp, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

// ===== 招采类合同 assessmentManagement → 模板 type 映射 =====
const ASSESSMENT_TO_TEMPLATE_TYPE: Record<'single_project' | 'monthly' | 'quarterly', EvaluationType> = {
  single_project: 'project_single',
  monthly: 'monthly',
  quarterly: 'quarterly',
};

// ===== 模板 type → 招采类合同 assessmentManagement 反向标签 =====
const ASSESSMENT_LABEL_MAP: Record<string, string> = {
  single_project: '单个项目考核',
  monthly: '月度考核',
  quarterly: '季度考核',
};

export default function EvaluationExecutePage() {
  const evaluationTemplates = (useStore((s) => s.evaluationTemplates) || []).filter((t) => t.type !== 'contract_performance');
  const evaluationRecords = useStore((s) => s.evaluationRecords) || [];
  const addEvaluationRecord = useStore((s) => s.addEvaluationRecord);
  const updateEvaluationRecord = useStore((s) => s.updateEvaluationRecord);
  const currentUser = useStore((s) => s.currentUser);
  const suppliers = useStore((s) => s.suppliers) || [];
  const contractLedgers = useStore((s) => s.contractLedgers) || [];

  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [evaluationDateStart, setEvaluationDateStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [evaluationDateEnd, setEvaluationDateEnd] = useState<string>(new Date().toISOString().slice(0, 10));
  const [projectName, setProjectName] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [scores, setScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewScore, setPreviewScore] = useState<{ score: number; item: EvaluationScoreItem } | null>(null);

  // 当选择模板时初始化评分
  useEffect(() => {
    if (selectedTemplate) {
      const initialScores: Record<string, { score: number; comment: string }> = {};
      selectedTemplate.indicators.forEach((ind) => {
        initialScores[ind.id] = { score: 0, comment: '' };
      });
      setScores(initialScores);
    }
  }, [selectedTemplate]);

  // 合同 / 供应商 lookup（必须放在 useEffect 之前，否则 TS 报 block-scoped before declaration）
  const selectedContract = useMemo(() => {
    return contractLedgers.find((c) => c.id === selectedContractId);
  }, [contractLedgers, selectedContractId]);

  const selectedSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === selectedSupplierId);
  }, [suppliers, selectedSupplierId]);

  // 当合同变化时自动联动供应商、考核方式、模板过滤
  useEffect(() => {
    const contract = selectedContract;
    if (!contract) {
      setSelectedSupplierId('');
      setProjectName('');
      return;
    }
    // 自动带 supplierId
    if (contract.supplierId) {
      setSelectedSupplierId(contract.supplierId);
    } else {
      // 老数据没 supplierId 的，尝试从 counterpartyName 模糊匹配
      const matched = suppliers.find((s) => s.name === contract.counterpartyName);
      setSelectedSupplierId(matched?.id || '');
    }
    // 自动带项目名称
    setProjectName(contract.projectName || contract.contractName || '');
    // 如果当前模板 type 不匹配合同考核方式，清空模板让用户重新选
    if (contract.assessmentManagement) {
      const expectedType = ASSESSMENT_TO_TEMPLATE_TYPE[contract.assessmentManagement];
      if (selectedTemplate && selectedTemplate.type !== expectedType) {
        setSelectedTemplate(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContractId]);

  // 【核心过滤】合同下拉只显示：招采类 + 有考核设置 + 非草稿
  const availableContracts = useMemo(() => {
    return contractLedgers.filter((c: ContractLedger) =>
      c.contractNature === 'procurement' &&
      c.assessmentManagement &&
      ['single_project', 'monthly', 'quarterly'].includes(c.assessmentManagement) &&
      c.status !== 'draft'
    );
  }, [contractLedgers]);

  // 从合同推导出来的考核方式（模板 type）
  const derivedTemplateType: EvaluationType | null = useMemo(() => {
    const am = selectedContract?.assessmentManagement;
    if (!am) return null;
    return ASSESSMENT_TO_TEMPLATE_TYPE[am as keyof typeof ASSESSMENT_TO_TEMPLATE_TYPE] || null;
  }, [selectedContract]);

  // 关联合同选了之后，模板下拉只显示匹配 type 的（或全部合同考核类型）
  const availableTemplates = useMemo(() => {
    if (derivedTemplateType) {
      return evaluationTemplates.filter((t) => t.type === derivedTemplateType);
    }
    return evaluationTemplates;
  }, [evaluationTemplates, derivedTemplateType]);

  const totalScore = useMemo(() => {
    if (!selectedTemplate) return 0;
    let total = 0;
    selectedTemplate.indicators.forEach((ind) => {
      const scoreData = scores[ind.id];
      if (scoreData) {
        const weightedScore = (scoreData.score / ind.maxScore) * ind.weight;
        total += weightedScore;
      }
    });
    return Math.round(total * 10) / 10;
  }, [selectedTemplate, scores]);

  const scoreLevel = useMemo(() => {
    if (totalScore >= 90) return { label: '优秀', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (totalScore >= 80) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (totalScore >= 70) return { label: '合格', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: '不合格', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  }, [totalScore]);

  const handleScoreChange = (indicatorId: string, field: 'score' | 'comment', value: any) => {
    setScores((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        [field]: value,
      },
    }));
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: 'ATT' + Date.now() + Math.random(),
      fileName: file.name,
      filePath: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString(),
      uploadedBy: currentUser.name,
    }));
    setAttachments([...attachments, ...newAttachments]);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSaveDraft = () => {
    if (!selectedContractId) {
      alert('请先选择招采类合同');
      return;
    }
    if (!selectedTemplate) {
      alert('请先选择关联考核模板');
      return;
    }
    if (!selectedSupplierId) {
      alert('请选择供应商');
      return;
    }
    saveRecord('draft');
  };

  const handleSubmit = () => {
    if (!selectedContractId) {
      alert('请先选择招采类合同');
      return;
    }
    if (!selectedTemplate) {
      alert('请先选择关联考核模板');
      return;
    }
    if (!selectedSupplierId) {
      alert('请选择供应商');
      return;
    }
    if (!evaluationDateStart || !evaluationDateEnd) {
      alert('请填写评估时间区间（开始和结束日期）');
      return;
    }
    if (evaluationDateStart > evaluationDateEnd) {
      alert('开始日期不能晚于结束日期');
      return;
    }
    // 校验所有指标是否已评分
    const unscored = selectedTemplate.indicators.filter((ind) => !scores[ind.id] || scores[ind.id].score === 0);
    if (unscored.length > 0) {
      if (!confirm(`还有 ${unscored.length} 个指标未评分，是否继续提交？`)) {
        return;
      }
    }
    saveRecord('pending');
  };

  const saveRecord = (status: EvaluationStatus) => {
    if (!selectedTemplate || !selectedSupplierId) return;

    const scoreItems: EvaluationScoreItem[] = selectedTemplate.indicators.map((ind) => {
      const scoreData = scores[ind.id] || { score: 0, comment: '' };
      return {
        indicatorId: ind.id,
        indicatorName: ind.name,
        score: scoreData.score,
        weight: ind.weight,
        weightedScore: Math.round((scoreData.score / ind.maxScore) * ind.weight * 10) / 10,
        comment: scoreData.comment,
      };
    });

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newRecord: EvaluationRecord = {
      id: 'ER' + Date.now(),
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      supplierId: selectedSupplierId,
      supplierName: selectedSupplier?.name || '',
      contractId: selectedContractId || undefined,
      contractNo: selectedContract?.contractNo || undefined,
      projectName: projectName || selectedContract?.projectName,
      type: selectedTemplate.type,
      scores: scoreItems,
      totalScore,
      evaluator: currentUser.name,
      evaluationDate: evaluationDateStart, // 兼容保留
      evaluationDateStart,
      evaluationDateEnd,
      applyDept: currentUser.department || currentUser.deptName || '',
      status,
      attachments: attachments.length > 0 ? attachments : undefined,
      remark: remark || undefined,
      approvalHistory: status === 'pending' ? [{
        approver: currentUser.name,
        action: 'pending',
        time: now,
      }] : undefined,
    };

    addEvaluationRecord?.(newRecord);
    alert(status === 'draft' ? '草稿已保存' : '评估已提交审批');

    // 重置表单
    resetForm();
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedSupplierId('');
    setSelectedContractId('');
    setProjectName('');
    setEvaluationDateStart(new Date().toISOString().slice(0, 10));
    setEvaluationDateEnd(new Date().toISOString().slice(0, 10));
    setRemark('');
    setScores({});
    setAttachments([]);
  };

  const openPreview = () => {
    setPreviewOpen(true);
  };

  // 获取最近的评估记录
  const recentRecords = useMemo(() => {
    return evaluationRecords
      .filter((r) => r.status === 'pending' || r.status === 'draft')
      .slice(0, 5);
  }, [evaluationRecords]);

  return (
    <div className="p-5">
      {/* 页面标题 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">考核评价执行</h1>
        <p className="text-sm text-slate-500 mt-1">选择招采类合同，从合同自动带出供应商和考核方式，在线评分并提交审批</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* 左侧：基本信息和评分表单 */}
        <div className="col-span-2 space-y-5">
          {/* 基本信息 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">基本信息</div>
            <div className="grid grid-cols-2 gap-4">
              {/* ===== 招采类合同（下拉只显示有考核设置的招采类合同）===== */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  招采类合同 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => {
                    setSelectedContractId(e.target.value);
                    setSelectedTemplate(null); // 换合同 → 模板重置（让用户重新从过滤后的列表选）
                    setScores({});
                  }}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">请选择招采类合同</option>
                  {availableContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNo || c.id.slice(-6)} - {c.contractName || '(未命名)'}
                    </option>
                  ))}
                </select>
                {availableContracts.length === 0 && (
                  <div className="text-[11px] text-amber-600 mt-1">
                    ⚠️ 当前没有"招采类+已设置考核方式+非草稿"的合同，请先在招采类合同表单里设置考核管理
                  </div>
                )}
              </div>

              {/* ===== 供应商（从合同自动带出，disabled）===== */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  供应商 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSupplierId}
                  disabled={!!selectedContractId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    {selectedContractId ? '合同未关联供应商档案' : '请先选择合同'}
                  </option>
                  {selectedSupplier && (
                    <option value={selectedSupplier.id}>{selectedSupplier.name}</option>
                  )}
                </select>
                {selectedContractId && !selectedSupplierId && (
                  <div className="text-[11px] text-amber-600 mt-1">
                    ⚠️ 该合同未关联供应商档案（supplierId），请在合同台账编辑中补充关联
                  </div>
                )}
              </div>

              {/* ===== 考核方式（从合同 assessmentManagement 自动带出，disabled）===== */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">考核方式 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedContract?.assessmentManagement
                      ? ASSESSMENT_LABEL_MAP[selectedContract.assessmentManagement] || selectedContract.assessmentManagement
                      : ''
                  }
                  placeholder="选择合同后自动带出"
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-500 outline-none"
                />
              </div>

              {/* ===== 关联考核模板（按合同考核方式过滤）===== */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  关联考核模板 <span className="text-red-500">*</span>
                  {derivedTemplateType && (
                    <span className="text-[11px] text-indigo-500 ml-2">
                      （已按合同考核方式过滤：仅显示 {EVALUATION_TYPE_LABELS[derivedTemplateType] || derivedTemplateType} 类型）
                    </span>
                  )}
                </label>
                <select
                  value={selectedTemplate?.id || ''}
                  disabled={!selectedContractId}
                  onChange={(e) => {
                    const template = evaluationTemplates.find((t) => t.id === e.target.value);
                    setSelectedTemplate(template || null);
                    setScores({});
                  }}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    {selectedContractId ? '请选择关联考核模板' : '请先选择合同'}
                  </option>
                  {availableTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* ===== 评估时间区间 ===== */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">评估时间区间</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={evaluationDateStart}
                    onChange={(e) => setEvaluationDateStart(e.target.value)}
                    className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-slate-400 text-sm">至</span>
                  <input
                    type="date"
                    value={evaluationDateEnd}
                    onChange={(e) => setEvaluationDateEnd(e.target.value)}
                    className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* ===== 项目名称（从合同自动带）===== */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="选择合同后自动带出，可手动修改"
                />
              </div>
            </div>
          </Card>

          {/* 评分表单 */}
          {selectedTemplate && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-slate-700">考核评分</div>
                <Badge variant={selectedTemplate.type === 'quarterly' ? 'primary' : selectedTemplate.type === 'single' ? 'success' : 'warning'}>
                  {EVALUATION_TYPE_LABELS[selectedTemplate.type]}
                </Badge>
              </div>
              <div className="space-y-3">
                {selectedTemplate.indicators.map((ind, index) => {
                  const scoreData = scores[ind.id] || { score: 0, comment: '' };
                  const percentage = (scoreData.score / ind.maxScore) * 100;
                  return (
                    <div key={ind.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{ind.name}</span>
                          <Badge variant="default">{ind.category}</Badge>
                          <span className="text-xs text-slate-500">权重 {ind.weight}%</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getScoreColor(scoreData.score, ind.maxScore)}`}>
                            {scoreData.score}
                          </span>
                          <span className="text-sm text-slate-400"> / {ind.maxScore}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="range"
                            min="0"
                            max={ind.maxScore}
                            value={scoreData.score}
                            onChange={(e) => handleScoreChange(ind.id, 'score', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>0</span>
                            <span>{Math.round(ind.maxScore / 2)}</span>
                            <span>{ind.maxScore}</span>
                          </div>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            min="0"
                            max={ind.maxScore}
                            value={scoreData.score}
                            onChange={(e) => handleScoreChange(ind.id, 'score', Number(e.target.value))}
                            className="w-full h-8 px-2 border border-slate-300 rounded text-sm text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={scoreData.comment}
                        onChange={(e) => handleScoreChange(ind.id, 'comment', e.target.value)}
                        className="w-full h-8 mt-3 px-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="评分说明（可选）"
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 备注和附件 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">评估备注</div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full h-24 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="请输入评估备注..."
            />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">附件上传</span>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <FileUp size={14} /> 上传附件
                  </span>
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm text-slate-700">{att.fileName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{(att.fileSize / 1024).toFixed(1)} KB</span>
                        <button
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 右侧：总分预览和操作 */}
        <div className="col-span-1 space-y-5">
          {/* 总分卡片 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">评估得分</div>
            <div className={`rounded-xl p-6 text-center ${scoreLevel.bg} ${scoreLevel.border} border-2`}>
              <div className={`text-5xl font-bold ${scoreLevel.color}`}>
                {totalScore}
              </div>
              <div className={`text-sm mt-2 ${scoreLevel.color} font-medium`}>
                {scoreLevel.label}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {selectedTemplate?.indicators.map((ind) => {
                const scoreData = scores[ind.id];
                const weightedScore = scoreData ? (scoreData.score / ind.maxScore) * ind.weight : 0;
                return (
                  <div key={ind.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{ind.name}</span>
                    <span className="text-slate-800 font-medium">
                      {weightedScore.toFixed(1)} / {ind.weight}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 操作按钮 */}
          <Card>
            <div className="space-y-3">
              <PrimaryButton onClick={handleSubmit} className="w-full justify-center">
                <Send size={14} /> 提交审批
              </PrimaryButton>
              <DefaultButton onClick={handleSaveDraft} className="w-full justify-center">
                保存草稿
              </DefaultButton>
              <DefaultButton onClick={resetForm} className="w-full justify-center">
                重置
              </DefaultButton>
            </div>
          </Card>

          {/* 最近待处理记录 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-3">待处理记录</div>
            {recentRecords.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">暂无待处理记录</div>
            ) : (
              <div className="space-y-2">
                {recentRecords.map((record) => (
                  <div key={record.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{record.supplierName}</span>
                      <Badge variant={record.status === 'draft' ? 'default' : 'warning'}>
                        {EVALUATION_STATUS_LABELS[record.status]}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{record.templateName}</div>
                    <div className="text-xs text-slate-400 mt-1">评估日期: {record.evaluationDate}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
