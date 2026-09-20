import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { EvaluationRecord, EvaluationStatus, Attachment } from '@/types';
import { EVALUATION_STATUS_LABELS } from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { Send, Save, FileUp, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function ContractPerformancePage() {
  const evaluationRecords = useStore((s) => s.evaluationRecords) || [];
  const addEvaluationRecord = useStore((s) => s.addEvaluationRecord);
  const currentUser = useStore((s) => s.currentUser);
  const suppliers = useStore((s) => s.suppliers) || [];
  const contractLedgers = useStore((s) => s.contractLedgers) || [];

  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [evaluationDateStart, setEvaluationDateStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [evaluationDateEnd, setEvaluationDateEnd] = useState<string>(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const selectedContract = useMemo(() => {
    return contractLedgers.find((c) => c.id === selectedContractId);
  }, [contractLedgers, selectedContractId]);

  const selectedSupplier = useMemo(() => {
    if (selectedContract) {
      return suppliers.find((s) => s.name === selectedContract.counterpartyName);
    }
    return null;
  }, [suppliers, selectedContract]);

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

  const saveRecord = (status: EvaluationStatus) => {
    if (!selectedContractId) {
      alert('请选择合同');
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
    if (!result && status === 'pending') {
      alert('请选择考核结果（合格 / 不合格）');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newRecord: EvaluationRecord = {
      id: 'ER' + Date.now(),
      templateId: 'CP-SIMPLIFIED',
      templateName: '合约履约评估（简化版）',
      supplierId: selectedSupplier?.id || '',
      supplierName: selectedContract?.counterpartyName || '',
      contractId: selectedContractId,
      contractNo: selectedContract?.contractNo || undefined,
      projectName: projectName || selectedContract?.projectName,
      type: 'contract_performance',
      scores: [],
      totalScore: result === 'pass' ? 100 : 0,
      evaluator: currentUser.name,
      evaluationDate: evaluationDateStart,
      evaluationDateStart,
      evaluationDateEnd,
      applyDept: currentUser.department || currentUser.deptName || '',
      result: result || undefined,
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
    alert(status === 'draft' ? '草稿已保存' : '合约履约评估已提交审批');
    resetForm();
  };

  const resetForm = () => {
    setSelectedContractId('');
    setEvaluationDateStart(new Date().toISOString().slice(0, 10));
    setEvaluationDateEnd(new Date().toISOString().slice(0, 10));
    setResult(null);
    setProjectName('');
    setRemark('');
    setAttachments([]);
  };

  const recentRecords = useMemo(() => {
    return evaluationRecords
      .filter((r) => r.status === 'pending' || r.status === 'draft')
      .filter((r) => r.type === 'contract_performance')
      .slice(0, 5);
  }, [evaluationRecords]);

  return (
    <div className="p-5">
      {/* 页面标题 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">合约履约评估执行</h1>
        <p className="text-sm text-slate-500 mt-1">选择目标合同，填写评估时间区间和考核结果，提交审批</p>
      </div>

      {/* 顶部说明卡片 */}
      <Card className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <div className="text-sm text-indigo-700">
          📋 本页面用于 <b>合约履约评估</b>（简化版）— 评价合同整体履行是否合格。
          供应商绩效考核请前往「供应商管理 → 考核评价管理」。
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-5">
        {/* 左侧：基本信息 + 评估结果 */}
        <div className="col-span-2 space-y-5">
          {/* 基本信息 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">基本信息</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  合同 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => {
                    const newContractId = e.target.value;
                    setSelectedContractId(newContractId);
                    const contract = contractLedgers.find((c) => c.id === newContractId);
                    if (contract) {
                      setProjectName(contract.projectName || '');
                    }
                  }}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">请选择合同</option>
                  {contractLedgers.map((c) => (
                    <option key={c.id} value={c.id}>{c.contractNo} - {c.contractName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">供应商（合同对方）</label>
                <input
                  type="text"
                  value={selectedContract?.counterpartyName || ''}
                  disabled
                  placeholder="选择合同后自动带出"
                  className="w-full h-9 px-3 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  评估时间区间 <span className="text-red-500">*</span>
                </label>
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
              <div>
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

          {/* 考核结果（简化版） */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-700">
                考核结果 <span className="text-red-500">*</span>
              </div>
              <Badge variant="primary">合约履约评估（简化）</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* 合格 */}
              <button
                onClick={() => setResult('pass')}
                className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                  result === 'pass'
                    ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <CheckCircle className={`w-8 h-8 ${result === 'pass' ? 'text-green-600' : 'text-green-400'}`} />
                <div className="text-left">
                  <div className={`text-base font-bold ${result === 'pass' ? 'text-green-700' : 'text-slate-700'}`}>合格</div>
                  <div className="text-xs text-slate-500">合同整体履行符合约定</div>
                </div>
              </button>
              {/* 不合格 */}
              <button
                onClick={() => setResult('fail')}
                className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                  result === 'fail'
                    ? 'border-red-500 bg-red-50 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <XCircle className={`w-8 h-8 ${result === 'fail' ? 'text-red-600' : 'text-red-400'}`} />
                <div className="text-left">
                  <div className={`text-base font-bold ${result === 'fail' ? 'text-red-700' : 'text-slate-700'}`}>不合格</div>
                  <div className="text-xs text-slate-500">存在重大履约问题需整改</div>
                </div>
              </button>
            </div>
          </Card>

          {/* 备注和附件 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">备注与附件</div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full h-24 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="请输入履约评估备注（可选）..."
            />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">附件上传</span>
                <label className="cursor-pointer">
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
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
                        <button onClick={() => handleRemoveAttachment(att.id)} className="text-red-500 hover:text-red-600">
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

        {/* 右侧：结果预览 + 操作 */}
        <div className="col-span-1 space-y-5">
          {/* 结果预览 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-4">评估结果</div>
            <div className={`rounded-xl p-6 text-center border-2 ${
              result === 'pass' ? 'bg-green-50 border-green-200'
              : result === 'fail' ? 'bg-red-50 border-red-200'
              : 'bg-slate-50 border-slate-200 border-dashed'
            }`}>
              {result === 'pass' ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">合格</div>
                  <div className="text-xs text-green-600 mt-1">合约履约通过</div>
                </>
              ) : result === 'fail' ? (
                <>
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">不合格</div>
                  <div className="text-xs text-red-600 mt-1">合约履约未通过</div>
                </>
              ) : (
                <>
                  <div className="text-lg text-slate-400">待选择</div>
                  <div className="text-xs text-slate-400 mt-1">请选择考核结果</div>
                </>
              )}
            </div>
            {/* 合同信息摘要 */}
            {selectedContract && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">合同编号</span>
                  <span className="text-slate-800 font-medium">{selectedContract.contractNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">对方单位</span>
                  <span className="text-slate-800">{selectedContract.counterpartyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">评估区间</span>
                  <span className="text-slate-800">{evaluationDateStart} ~ {evaluationDateEnd}</span>
                </div>
              </div>
            )}
          </Card>

          {/* 操作按钮 */}
          <Card>
            <div className="space-y-3">
              <PrimaryButton onClick={() => saveRecord('pending')} className="w-full justify-center">
                <Send size={14} /> 提交审批
              </PrimaryButton>
              <DefaultButton onClick={() => saveRecord('draft')} className="w-full justify-center">保存草稿</DefaultButton>
              <DefaultButton onClick={resetForm} className="w-full justify-center">重置</DefaultButton>
            </div>
          </Card>

          {/* 最近待处理记录 */}
          <Card>
            <div className="text-sm font-medium text-slate-700 mb-3">履约评估待处理记录</div>
            {recentRecords.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">暂无待处理记录</div>
            ) : (
              <div className="space-y-2">
                {recentRecords.map((record) => (
                  <div key={record.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{record.contractNo || record.supplierName}</span>
                      <Badge variant={record.status === 'draft' ? 'default' : 'warning'}>
                        {EVALUATION_STATUS_LABELS[record.status]}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {record.result === 'pass' ? '✅ 合格' : record.result === 'fail' ? '❌ 不合格' : '待选择结果'}
                    </div>
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
