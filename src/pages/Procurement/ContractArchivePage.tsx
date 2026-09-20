import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Button from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import type { Attachment } from '@/types';

// 归档审批面单勾选
interface ArchiveChecklist {
  hasApprovalSheet: boolean;             // 审批面单
  hasReviewCopy: boolean;                // 呈阅件
  hasLegalReview: boolean;               // 律审稿
  hasApprovalDoc: boolean;               // 审批件
  hasSealedCopy: boolean;                // 盖章件
  hasBasisFile: 'yes' | 'no' | 'n/a';    // 合同签订依据文件
}

interface ContractArchive {
  id: string;
  archiveNo: string;
  contractIds: string[];
  contractNos: string[];
  applicant: string;
  applyTime: string;
  signingDate?: string;
  effectiveDate?: string;
  terminationDate?: string;
  attachments: Attachment[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approver?: string;
  approveTime?: string;
  approveRemark?: string;
  archiveChecklist?: ArchiveChecklist;
}

const defaultChecklist: ArchiveChecklist = {
  hasApprovalSheet: false,
  hasReviewCopy: false,
  hasLegalReview: false,
  hasApprovalDoc: false,
  hasSealedCopy: false,
  hasBasisFile: 'n/a',
};

export default function ContractArchivePage() {
  const contractLedgers = useStore((s) => s.contractLedgers);
  const currentUser = useStore((s) => s.currentUser);

  // 模拟归档记录数据
  const [archives, setArchives] = useState<ContractArchive[]>([]);

  // 筛选条件
  const [filterNo, setFilterNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({ no: '', status: '' });

  // 新增归档弹窗
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([]);
  const [signingDate, setSigningDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [terminationDate, setTerminationDate] = useState('');
  const [archiveFiles, setArchiveFiles] = useState<Attachment[]>([]);
  const [editArchiveData, setEditArchiveData] = useState<ContractArchive | null>(null);

  // ===== 审批通过弹窗 =====
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvingArchive, setApprovingArchive] = useState<ContractArchive | null>(null);
  const [checklist, setChecklist] = useState<ArchiveChecklist>(defaultChecklist);

  // ===== 驳回弹窗 =====
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingArchive, setRejectingArchive] = useState<ContractArchive | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredContracts = useMemo(() => {
    return contractLedgers.filter((c) => {
      if (applied.no && !c.contractNo.includes(applied.no)) return false;
      return true;
    });
  }, [contractLedgers, applied]);

  const filteredArchives = useMemo(() => {
    return archives.filter((a) => {
      if (applied.no && !a.archiveNo.includes(applied.no)) return false;
      if (applied.status && a.status !== applied.status) return false;
      return true;
    });
  }, [archives, applied]);

  // 文件上传处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: Attachment[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newFiles.push({
          id: 'ATT' + Date.now() + Math.random().toString(36).slice(2, 8),
          fileName: file.name,
          filePath: reader.result as string,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
        if (newFiles.length === files.length) {
          setArchiveFiles([...archiveFiles, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setArchiveFiles(archiveFiles.filter((f) => f.id !== fileId));
  };

  // 提交归档申请
  const handleSubmitArchive = () => {
    if (selectedContractIds.length === 0) {
      alert('请至少选择一份合同');
      return;
    }

    const selectedContracts = contractLedgers.filter((c) => selectedContractIds.includes(c.id));
    if (editArchiveData) {
      setArchives(
        archives.map((a) =>
          a.id === editArchiveData.id
            ? {
                ...a,
                contractIds: selectedContractIds,
                contractNos: selectedContracts.map((c) => c.contractNo),
                signingDate,
                effectiveDate,
                terminationDate,
                attachments: archiveFiles,
              }
            : a
        )
      );
      alert('归档申请已更新');
    } else {
      const newArchive: ContractArchive = {
        id: 'ARC' + Date.now(),
        archiveNo: genSerialNo(SERIAL_CONFIG.ARCHIVE, archives.map(a => a.archiveNo)),
        contractIds: selectedContractIds,
        contractNos: selectedContracts.map((c) => c.contractNo),
        applicant: currentUser.name,
        applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        signingDate,
        effectiveDate,
        terminationDate,
        attachments: archiveFiles,
        status: 'pending',
      };
      setArchives([...archives, newArchive]);
      alert('归档申请已提交');
    }
    setCreateModalOpen(false);
    setEditArchiveData(null);
    setSelectedContractIds([]);
    setSigningDate(''); setEffectiveDate(''); setTerminationDate('');
    setArchiveFiles([]);
  };

  // 重新提交归档申请（驳回后重新提交）
  const handleResubmitArchive = (archive: ContractArchive) => {
    setArchives(
      archives.map((a) =>
        a.id === archive.id
          ? { ...a, status: 'pending', approver: undefined, approveTime: undefined, approveRemark: undefined }
          : a
      )
    );
  };

  // 编辑归档申请
  const setEditArchive = (archive: ContractArchive) => {
    setEditArchiveData(archive);
    setSelectedContractIds(archive.contractIds);
    setSigningDate(archive.signingDate || '');
    setEffectiveDate(archive.effectiveDate || '');
    setTerminationDate(archive.terminationDate || '');
    setArchiveFiles(archive.attachments || []);
    setCreateModalOpen(true);
  };

  // ===== 审批通过：打开弹窗 =====
  const openApproveModal = (archive: ContractArchive) => {
    setApprovingArchive(archive);
    // 回填已有勾选（如果二次打开），否则用默认
    setChecklist(archive.archiveChecklist || defaultChecklist);
    setApproveModalOpen(true);
  };

  // ===== 审批通过：确认提交 =====
  const confirmApprove = () => {
    if (!approvingArchive) return;
    setArchives(
      archives.map((a) =>
        a.id === approvingArchive.id
          ? {
              ...a,
              status: 'approved',
              approver: currentUser.name,
              approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
              approveRemark: '审批通过（归档面单已确认）',
              archiveChecklist: { ...checklist },
            }
          : a
      )
    );
    alert('已审批通过，归档完成');
    setApproveModalOpen(false);
    setApprovingArchive(null);
    setChecklist(defaultChecklist);
  };

  // ===== 驳回：打开弹窗 =====
  const openRejectModal = (archive: ContractArchive) => {
    setRejectingArchive(archive);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // ===== 驳回：确认提交 =====
  const confirmReject = () => {
    if (!rejectingArchive) return;
    const trimmed = rejectReason.trim();
    if (trimmed.length < 5) {
      alert('请填写驳回理由（至少 5 个字）');
      return;
    }
    if (trimmed.length > 200) {
      alert('驳回理由不能超过 200 字');
      return;
    }
    setArchives(
      archives.map((a) =>
        a.id === rejectingArchive.id
          ? {
              ...a,
              status: 'rejected',
              approver: currentUser.name,
              approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
              approveRemark: `驳回原因：${trimmed}`,
            }
          : a
      )
    );
    alert('已驳回');
    setRejectModalOpen(false);
    setRejectingArchive(null);
    setRejectReason('');
  };

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: '草稿', color: 'text-[#909399]', bg: 'bg-[#f4f4f5]' },
    pending: { label: '待审批', color: 'text-[#e6a23c]', bg: 'bg-[#fdf6ec]' },
    approved: { label: '已归档', color: 'text-[#67c23a]', bg: 'bg-[#f0f9eb]' },
    rejected: { label: '已驳回', color: 'text-[#f56c6c]', bg: 'bg-[#fef0f0]' },
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#303133]">合同归档管理</h2>
        <p className="text-xs text-[#909399] mt-1">对已签订完成的合同进行归档管理，建立完整的归档记录</p>
      </div>

      {/* 工具栏 */}
      <div className="flex justify-between items-center mb-3">
        <SearchBar
          onSearch={() => setApplied({ no: filterNo, status: filterStatus })}
          onReset={() => {
            setFilterNo('');
            setFilterStatus('');
            setApplied({ no: '', status: '' });
          }}
        >
          <SearchField label="归档编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
          <SearchField
            label="审批状态"
            type="select"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: '全部' },
              { value: 'draft', label: '草稿' },
              { value: 'pending', label: '待审批' },
              { value: 'approved', label: '已归档' },
              { value: 'rejected', label: '已驳回' },
            ]}
          />
        </SearchBar>
        <PrimaryButton onClick={() => setCreateModalOpen(true)}>+ 新增归档</PrimaryButton>
      </div>

      {/* 归档记录列表 */}
      <div className="border border-[#ebeef5] rounded bg-white">
        <table className="w-full text-xs">
          <thead className="bg-[#f5f7fa]">
            <tr>
              <th className="px-3 py-2 text-left text-[#606266] font-medium">归档编号</th>
              <th className="px-3 py-2 text-left text-[#606266] font-medium">关联合同</th>
              <th className="px-3 py-2 text-left text-[#606266] font-medium">申请人</th>
              <th className="px-3 py-2 text-left text-[#606266] font-medium">申请时间</th>
              <th className="px-3 py-2 text-left text-[#606266] font-medium">签订/生效/终止日期</th>
              <th className="px-3 py-2 text-center text-[#606266] font-medium">附件</th>
              <th className="px-3 py-2 text-center text-[#606266] font-medium">状态</th>
              <th className="px-3 py-2 text-center text-[#606266] font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredArchives.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-[#909399] border-t border-[#ebeef5]">
                  暂无归档记录
                </td>
              </tr>
            )}
            {filteredArchives.map((archive) => {
              const s = statusMap[archive.status];
              return (
                <tr key={archive.id} className="border-t border-[#ebeef5] hover:bg-[#fafafa]">
                  <td className="px-3 py-2 font-medium text-[#303133]">{archive.archiveNo}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {archive.contractNos.map((no, idx) => (
                        <span key={idx} className="inline-block px-1.5 py-0.5 bg-[#ecf5ff] text-[#409eff] rounded text-[10px]">
                          {no}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">{archive.applicant}</td>
                  <td className="px-3 py-2 text-[#606266]">{archive.applyTime}</td>
                  <td className="px-3 py-2 text-[#606266]">
                    <div>签订：{archive.signingDate || '-'}</div>
                    <div>生效：{archive.effectiveDate || '-'}</div>
                    <div>终止：{archive.terminationDate || '-'}</div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {archive.attachments.length > 0 ? (
                      <span className="text-[#409eff]">{archive.attachments.length} 个文件</span>
                    ) : (
                      <span className="text-[#c0c4cc]">无</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={'px-2 py-0.5 rounded text-xs ' + s.color + ' ' + s.bg}>{s.label}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {archive.status === 'draft' ? (
                      <div className="flex items-center justify-center gap-1">
                        <TextButton onClick={() => handleResubmitArchive(archive)}>提交审批</TextButton>
                        <TextButton onClick={() => setEditArchive(archive)}>编辑</TextButton>
                      </div>
                    ) : archive.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-1">
                        <TextButton type="danger" onClick={() => openRejectModal(archive)}>驳回</TextButton>
                        <TextButton type="primary" onClick={() => openApproveModal(archive)}>审批通过</TextButton>
                      </div>
                    ) : (
                      <span className="text-[#909399]">
                        {archive.approver && <>{archive.approver} | {archive.approveTime}</>}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============ 新增归档弹窗 ============ */}
      <Modal
        open={createModalOpen}
        title="合同归档申请"
        onClose={() => { setCreateModalOpen(false); setEditArchiveData(null); setSigningDate(''); setEffectiveDate(''); setTerminationDate(''); setArchiveFiles([]); setSelectedContractIds([]); }}
        footer={
          <>
            <DefaultButton onClick={() => setCreateModalOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSubmitArchive}>提交归档申请</PrimaryButton>
          </>
        }
        width="900px"
      >
        <div className="space-y-4">
          {/* 合同日期（签订/生效/终止）— 在此节点补填 */}
          <div>
            <div className="mb-1 text-[#606266] text-xs font-semibold">合同日期（归档环节补填）</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-[#909399] text-xs">签订日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={signingDate} onChange={(e) => setSigningDate(e.target.value)} />
              </div>
              <div>
                <div className="mb-1 text-[#909399] text-xs">生效日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
              </div>
              <div>
                <div className="mb-1 text-[#909399] text-xs">终止日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={terminationDate} onChange={(e) => setTerminationDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 选择合同 */}
          <div>
            <div className="mb-2 text-[#606266] text-xs font-semibold">
              选择合同（可多选） <span className="text-[#f56c6c]">*</span>
              <span className="text-[#909399] font-normal ml-2">已选择 {selectedContractIds.length} 份合同</span>
            </div>
            <div className="border border-[#ebeef5] rounded max-h-[250px] overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left w-8"></th>
                    <th className="px-2 py-1.5 text-left">合同编号</th>
                    <th className="px-2 py-1.5 text-left">合同名称</th>
                    <th className="px-2 py-1.5 text-left">对方单位</th>
                    <th className="px-2 py-1.5 text-right">合同金额</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                      <td className="px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={selectedContractIds.includes(contract.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContractIds([...selectedContractIds, contract.id]);
                            } else {
                              setSelectedContractIds(selectedContractIds.filter((id) => id !== contract.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-[#409eff]">{contract.contractNo}</td>
                      <td className="px-2 py-1.5">{contract.contractName}</td>
                      <td className="px-2 py-1.5 text-[#606266]">{contract.counterpartyName}</td>
                      <td className="px-2 py-1.5 text-right font-medium text-[#f56c6c]">
                        ¥{(contract.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 附件上传 */}
          <div>
            <div className="mb-1 text-[#606266] text-xs font-semibold">归档附件</div>
            <div className="border border-dashed border-[#dcdfe6] rounded p-3 bg-[#fafafa]">
              {archiveFiles.length > 0 ? (
                <div className="space-y-2">
                  {archiveFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-white border border-[#e4e7ed] rounded p-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[#409eff]">📄</span>
                        <span className="text-xs text-[#606266] truncate max-w-[300px]" title={file.fileName}>
                          {file.fileName}
                        </span>
                        <span className="text-xs text-[#909399]">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                      </div>
                      <TextButton type="danger" size="small" onClick={() => removeFile(file.id)}>删除</TextButton>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[#ebeef5]">
                    <label className="inline-flex items-center gap-1 text-xs text-[#409eff] cursor-pointer hover:text-[#66b1ff]">
                      <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                      <span>+ 继续添加</span>
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-[#f5f7fa] rounded transition-colors">
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                  <span className="text-2xl text-[#c0c4cc] mb-1">+</span>
                  <span className="text-xs text-[#909399]">点击上传归档附件</span>
                  <span className="text-xs text-[#c0c4cc]">支持 JPG、PNG、PDF、DOC 格式</span>
                </label>
              )}
            </div>
          </div>

          <div className="text-xs text-[#909399]">
            申请人：{currentUser.name} &nbsp;|&nbsp; 申请时间：{new Date().toLocaleString('zh-CN')}
          </div>
        </div>
      </Modal>

      {/* ============ 审批通过弹窗 ============ */}
      <Modal
        open={approveModalOpen}
        title="归档审批通过"
        onClose={() => { setApproveModalOpen(false); setApprovingArchive(null); setChecklist(defaultChecklist); }}
        footer={
          <>
            <DefaultButton onClick={() => setApproveModalOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={confirmApprove}>确认归档通过</PrimaryButton>
          </>
        }
        width="600px"
      >
        {approvingArchive && (
          <div className="space-y-4">
            {/* 合同基本信息 */}
            <div className="bg-[#f5f7fa] border border-[#ebeef5] rounded p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-[#909399]">归档编号：</span><span className="font-medium text-[#303133]">{approvingArchive.archiveNo}</span></div>
                <div><span className="text-[#909399]">申请人：</span>{approvingArchive.applicant}</div>
                <div className="col-span-2"><span className="text-[#909399]">关联合同：</span>
                  <span className="text-[#409eff]">
                    {approvingArchive.contractNos.join('、')}
                  </span>
                </div>
                <div><span className="text-[#909399]">申请时间：</span>{approvingArchive.applyTime}</div>
                <div><span className="text-[#909399]">申请人附件：</span>
                  {approvingArchive.attachments.length > 0
                    ? <span className="text-[#409eff]">{approvingArchive.attachments.length} 个文件</span>
                    : <span className="text-[#c0c4cc]">无</span>}
                </div>
              </div>
            </div>

            {/* 审批面单勾选 */}
            <div>
              <div className="mb-2 text-sm font-semibold text-[#303133]">归档面单确认</div>
              <div className="space-y-2 border border-[#ebeef5] rounded p-3">
                <ChecklistRow label="审批面单"
                  checked={checklist.hasApprovalSheet}
                  onToggle={(v) => setChecklist({ ...checklist, hasApprovalSheet: v })} />
                <ChecklistRow label="呈阅件"
                  checked={checklist.hasReviewCopy}
                  onToggle={(v) => setChecklist({ ...checklist, hasReviewCopy: v })} />
                <ChecklistRow label="律审稿"
                  checked={checklist.hasLegalReview}
                  onToggle={(v) => setChecklist({ ...checklist, hasLegalReview: v })} />
                <ChecklistRow label="审批件"
                  checked={checklist.hasApprovalDoc}
                  onToggle={(v) => setChecklist({ ...checklist, hasApprovalDoc: v })} />
                <ChecklistRow label="盖章件"
                  checked={checklist.hasSealedCopy}
                  onToggle={(v) => setChecklist({ ...checklist, hasSealedCopy: v })} />
                {/* 合同签订依据文件：三选一 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#606266]">合同签订依据文件</span>
                  <div className="flex items-center gap-3">
                    {[
                      { v: 'yes', label: '是' },
                      { v: 'no', label: '否' },
                      { v: 'n/a', label: '不涉及' },
                    ].map((opt) => (
                      <label key={opt.v} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="basisFile"
                          checked={checklist.hasBasisFile === opt.v}
                          onChange={() => setChecklist({ ...checklist, hasBasisFile: opt.v as ArchiveChecklist['hasBasisFile'] })}
                        />
                        <span className={checklist.hasBasisFile === opt.v ? 'text-[#409eff]' : 'text-[#606266]'}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-[#909399]">
                请逐一核实归档面单资料是否齐全，确认后点击"确认归档通过"
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============ 驳回弹窗 ============ */}
      <Modal
        open={rejectModalOpen}
        title="驳回归档申请"
        onClose={() => { setRejectModalOpen(false); setRejectingArchive(null); setRejectReason(''); }}
        footer={
          <>
            <DefaultButton onClick={() => setRejectModalOpen(false)}>取消</DefaultButton>
            <Button variant="danger" onClick={confirmReject}>确认驳回</Button>
          </>
        }
        width="500px"
      >
        {rejectingArchive && (
          <div className="space-y-4">
            {/* 合同基本信息 */}
            <div className="bg-[#fef0f0] border border-[#fbc4c4] rounded p-3 text-xs">
              <div className="mb-1 text-[#f56c6c] font-medium">即将驳回以下归档申请：</div>
              <div className="grid grid-cols-2 gap-1 text-[#606266]">
                <div><span className="text-[#909399]">归档编号：</span>{rejectingArchive.archiveNo}</div>
                <div><span className="text-[#909399]">申请人：</span>{rejectingArchive.applicant}</div>
                <div className="col-span-2"><span className="text-[#909399]">关联合同：</span>
                  <span className="text-[#409eff]">{rejectingArchive.contractNos.join('、')}</span>
                </div>
                <div className="col-span-2"><span className="text-[#909399]">申请时间：</span>{rejectingArchive.applyTime}</div>
              </div>
            </div>

            {/* 驳回理由 */}
            <div>
              <label className="block text-xs font-medium text-[#606266] mb-1">
                驳回理由 <span className="text-[#f56c6c]">*</span>
                <span className="text-[#909399] font-normal ml-1">({rejectReason.trim().length}/200)</span>
              </label>
              <textarea
                className="w-full h-24 p-2 border border-[#dcdfe6] rounded text-xs resize-none focus:outline-none focus:border-[#409eff]"
                placeholder="请说明驳回原因，申请人可据此修改后重新提交（至少 5 个字）"
                value={rejectReason}
                maxLength={200}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              {rejectReason.trim().length > 0 && rejectReason.trim().length < 5 && (
                <div className="mt-1 text-[11px] text-[#f56c6c]">驳回理由至少 5 个字</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============ 审批面单 Checkbox 行组件 ============
function ChecklistRow({
  label, checked, onToggle,
}: { label: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#606266]">{label}</span>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input type="radio" checked={checked} onChange={() => onToggle(true)} />
          <span className={checked ? 'text-[#409eff]' : 'text-[#606266]'}>是</span>
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input type="radio" checked={!checked} onChange={() => onToggle(false)} />
          <span className={!checked ? 'text-[#409eff]' : 'text-[#606266]'}>否</span>
        </label>
      </div>
    </div>
  );
}
