import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import type { ContractLedger, Attachment } from '@/types';

interface ContractArchive {
  id: string;
  archiveNo: string;
  contractIds: string[];
  contractNos: string[];
  applicant: string;
  applyTime: string;
  reason: string;
  attachments: Attachment[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approver?: string;
  approveTime?: string;
  approveRemark?: string;
}

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
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveFiles, setArchiveFiles] = useState<Attachment[]>([]);
  const [editArchiveData, setEditArchiveData] = useState<ContractArchive | null>(null);

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
    if (!archiveReason.trim()) {
      alert('请填写归档原因');
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
                reason: archiveReason,
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
        reason: archiveReason,
        attachments: archiveFiles,
        status: 'pending',
      };
      setArchives([...archives, newArchive]);
      alert('归档申请已提交');
    }
    setCreateModalOpen(false);
    setEditArchiveData(null);
    setSelectedContractIds([]);
    setArchiveReason('');
    setArchiveFiles([]);
  };

  // 重新提交归档申请（驳回后重新提交）
  const handleResubmitArchive = (archive: ContractArchive) => {
    setArchives(
      archives.map((a) =>
        a.id === archive.id
          ? { ...a, status: 'pending', approver: undefined, approveTime: undefined }
          : a
      )
    );
  };

  // 编辑归档申请
  const setEditArchive = (archive: ContractArchive) => {
    setEditArchiveData(archive);
    setSelectedContractIds(archive.contractIds);
    setArchiveReason(archive.reason);
    setArchiveFiles(archive.attachments || []);
    setCreateModalOpen(true);
  };

  // 审批归档申请
  const handleApprove = (archive: ContractArchive, approved: boolean) => {
    if (!confirm(approved ? '确认审批通过此归档申请？' : '确认驳回此归档申请？')) return;
    setArchives(
      archives.map((a) =>
        a.id === archive.id
          ? {
              ...a,
              status: approved ? 'approved' : 'draft',
              approver: currentUser.name,
              approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
              approveRemark: approved ? '审批通过' : `驳回原因：${archive.approveRemark || '驳回后可编辑重新提交'}`,
            }
          : a
      )
    );
    alert(approved ? '已审批通过' : '已驳回');
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
              <th className="px-3 py-2 text-left text-[#606266] font-medium">归档原因</th>
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
                  <td className="px-3 py-2 text-[#606266] max-w-[200px] truncate" title={archive.reason}>
                    {archive.reason}
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
                        <TextButton type="danger" onClick={() => handleApprove(archive, false)}>驳回</TextButton>
                        <TextButton type="primary" onClick={() => handleApprove(archive, true)}>审批通过</TextButton>
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

      {/* 新增归档弹窗 */}
      <Modal
        open={createModalOpen}
        title="合同归档申请"
        onClose={() => { setCreateModalOpen(false); setEditArchiveData(null); }}
        footer={
          <>
            <DefaultButton onClick={() => setCreateModalOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSubmitArchive}>提交归档申请</PrimaryButton>
          </>
        }
        width="900px"
      >
        <div className="space-y-4">
          {/* 归档原因 */}
          <div>
            <div className="mb-1 text-[#606266] text-xs font-semibold">归档原因 <span className="text-[#f56c6c]">*</span></div>
            <textarea
              className="w-full h-16 px-2 border border-[#dcdfe6] rounded text-xs"
              placeholder="请填写归档原因（如：合同执行完毕、项目验收完成等）"
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
            />
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
    </div>
  );
}
