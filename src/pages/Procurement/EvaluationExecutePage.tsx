import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { EvaluationTemplate, EvaluationRecord, EvaluationScoreItem, EvaluationStatus, Attachment } from '@/types';
import { EVALUATION_TYPE_LABELS, EVALUATION_STATUS_LABELS } from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { Plus, Save, Send, FileUp, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export default function EvaluationExecutePage() {
  const evaluationTemplates = useStore((s) => s.evaluationTemplates) || [];
  const evaluationRecords = useStore((s) => s.evaluationRecords) || [];
  const addEvaluationRecord = useStore((s) => s.addEvaluationRecord);
  const updateEvaluationRecord = useStore((s) => s.updateEvaluationRecord);
  const currentUser = useStore((s) => s.currentUser);
  const suppliers = useStore((s) => s.suppliers) || [];
  const contractLedgers = useStore((s) => s.contractLedgers) || [];

  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [evaluationDate, setEvaluationDate] = useState<string>(new Date().toISOString().slice(0, 10));
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

  const selectedSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === selectedSupplierId);
  }, [suppliers, selectedSupplierId]);

  const selectedContract = useMemo(() => {
    return contractLedgers.find((c) => c.id === selectedContractId);
  }, [contractLedgers, selectedContractId]);

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
    if (!selectedTemplate) {
      alert('请先选择评估模板');
      return;
    }
    if (!selectedSupplierId) {
      alert('请选择供应商');
      return;
    }
    saveRecord('draft');
  };

  const handleSubmit = () => {
    if (!selectedTemplate) {
      alert('请先选择评估模板');
      return;
    }
    if (!selectedSupplierId) {
      alert('请选择供应商');
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
      evaluationDate,
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
    setEvaluationDate(new Date().toISOString().slice(0, 10));
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
        <h1 className="text-xl font-bold text-slate-800">评估执行</h1>
        <p className="text-sm text-slate-500 mt-1">选择模板和供应商，完成在线评分并提交审批</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* 左侧：基本信息和评分表单 */}
        <div className="col-span-2 space-y-5">
          {/* 基本信息 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">基本信息</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  评估模板 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = evaluationTemplates.find((t) => t.id === e.target.value);
                    setSelectedTemplate(template || null);
                    setScores({});
                  }}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">请选择评估模板</option>
                  {evaluationTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  供应商 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">请选择供应商</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">关联合同（可选）</label>
                <select
                  value={selectedContractId}
                  onChange={(e) => {
                    setSelectedContractId(e.target.value);
                    const contract = contractLedgers.find((c) => c.id === e.target.value);
                    if (contract) {
                      setProjectName(contract.projectName || '');
                    }
                  }}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">请选择关联合同</option>
                  {contractLedgers.map((c) => (
                    <option key={c.id} value={c.id}>{c.contractNo} - {c.contractName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">评估日期</label>
                <input
                  type="date"
                  value={evaluationDate}
                  onChange={(e) => setEvaluationDate(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="请输入项目名称"
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
