import { useMemo, useState } from 'react';
import { PrimaryButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ContractText, ContractCategory, TextAnnotation } from '@/types';
import { CONTRACT_CATEGORIES, getCategoryLabel } from '@/constants/contractCategories';
import { FileEdit, Eye, History, Download, Trash2, Upload, Plus } from 'lucide-react';
import { ContractTextEditor } from './ContractTextEditor';
import { ContractTextVersionCompare } from './ContractTextVersionCompare';

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  active: { label: '生效', color: 'bg-green-100 text-green-600' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-600' },
};

export default function ContractTextPage() {
  const contractTexts = useStore((s) => s.contractTexts) as ContractText[];
  const addContractText = useStore((s) => s.addContractText);
  const updateContractText = useStore((s) => s.updateContractText);
  const deleteContractText = useStore((s) => s.deleteContractText);
  const addContractTextVersion = useStore((s) => s.addContractTextVersion);
  const addTextAnnotation = useStore((s) => s.addTextAnnotation);
  const currentUser = useStore((s) => s.currentUser);

  const [activeTab, setActiveTab] = useState<'model' | 'non_model'>('model');
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [applied, setApplied] = useState({ name: '', category: '' });

  const filteredData = useMemo(() => {
    return contractTexts
      .filter((t) => t.type === activeTab)
      .filter((t) => {
        if (applied.name && !t.name.includes(applied.name)) return false;
        if (applied.category && t.category !== applied.category) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }, [contractTexts, activeTab, applied]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContractText | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [versionCompareOpen, setVersionCompareOpen] = useState(false);
  const [compareText, setCompareText] = useState<ContractText | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState<ContractText | null>(null);
  const [annotationModalOpen, setAnnotationModalOpen] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationTarget, setAnnotationTarget] = useState<ContractText | null>(null);

  const columns: ColumnDef<ContractText>[] = [
    { key: 'name', title: '文本名称', width: '200' },
    {
      key: 'category',
      title: '分类',
      width: '120',
      render: (row) => getCategoryLabel(row.category),
    },
    {
      key: 'version',
      title: '版本',
      width: '80',
      render: (row) => `v${row.version}`,
    },
    {
      key: 'status',
      title: '状态',
      width: '80',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs ${statusMap[row.status]?.color || 'bg-slate-100'}`}>
          {statusMap[row.status]?.label || row.status}
        </span>
      ),
    },
    {
      key: 'updater',
      title: '更新人',
      width: '80',
      render: (row) => row.updater || row.creator,
    },
    {
      key: 'updateTime',
      title: '更新时间',
      width: '150',
      render: (row) => row.updateTime || row.createTime,
    },
    {
      key: 'op',
      title: '操作',
      width: '280',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => openEditor(row)}>
            <FileEdit size={12} className="inline mr-0.5" />编辑
          </TextButton>
          <TextButton onClick={() => openPreview(row)}>
            <Eye size={12} className="inline mr-0.5" />预览
          </TextButton>
          <TextButton onClick={() => openVersionCompare(row)}>
            <History size={12} className="inline mr-0.5" />版本
          </TextButton>
          <TextButton onClick={() => openAnnotation(row)}>批注</TextButton>
          <TextButton onClick={() => handleDownload(row)}>
            <Download size={12} className="inline mr-0.5" />下载
          </TextButton>
          {row.status === 'draft' && (
            <TextButton
              type="danger"
              onClick={() => {
                if (confirm(`确认删除 ${row.name}？`)) deleteContractText(row.id);
              }}
            >
              <Trash2 size={12} className="inline mr-0.5" />删除
            </TextButton>
          )}
        </div>
      ),
    },
  ];

  const openNew = () => {
    setIsNew(true);
    setEditItem(null);
    setEditorOpen(true);
  };

  const openEditor = (text: ContractText) => {
    setIsNew(false);
    setEditItem(text);
    setEditorOpen(true);
  };

  const openPreview = (text: ContractText) => {
    setPreviewText(text);
    setPreviewOpen(true);
  };

  const openVersionCompare = (text: ContractText) => {
    setCompareText(text);
    setVersionCompareOpen(true);
  };

  const openAnnotation = (text: ContractText) => {
    setAnnotationTarget(text);
    setAnnotationText('');
    setAnnotationModalOpen(true);
  };

  const handleAnnotationSubmit = () => {
    if (!annotationTarget || !annotationText.trim()) return;
    const annotation: TextAnnotation = {
      id: 'ANN' + Date.now(),
      textId: annotationTarget.id,
      version: annotationTarget.version,
      content: annotationText,
      author: currentUser.name,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isResolved: false,
    };
    addTextAnnotation(annotationTarget.id, annotation);
    alert('批注已添加');
    setAnnotationModalOpen(false);
  };

  const handleDownload = (text: ContractText) => {
    const blob = new Blob([text.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${text.name}_v${text.version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorSave = (data: {
    name: string;
    category: ContractCategory;
    content: string;
    type: 'model' | 'non_model';
    supplements?: any[];
    remark?: string;
  }) => {
    if (isNew) {
      const newText: ContractText = {
        id: 'CT' + Date.now(),
        name: data.name,
        type: data.type,
        category: data.category,
        content: data.content,
        version: 1,
        status: 'draft',
        supplements: data.supplements || [],
        attachments: [],
        annotations: [],
        creator: currentUser.name,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        remark: data.remark,
      };
      addContractText(newText);
      alert('文本已创建');
    } else if (editItem) {
      const newVersion = editItem.version + 1;
      updateContractText(editItem.id, {
        name: data.name,
        category: data.category,
        content: data.content,
        version: newVersion,
        updater: currentUser.name,
        updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        remark: data.remark,
      });
      const versionRecord = {
        id: 'CTV' + Date.now(),
        textId: editItem.id,
        version: newVersion,
        content: data.content,
        supplements: data.supplements || [],
        changeLog: `v${newVersion} 版本更新`,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        creator: currentUser.name,
      };
      addContractTextVersion(versionRecord);
      alert(`已保存为 v${newVersion}`);
    }
    setEditorOpen(false);
    setEditItem(null);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 标题栏 */}
      <div className="px-5 py-3 border-b border-[#ebeef5] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[#303133]">合同文本管理</h2>
          <div className="flex gap-1 bg-[#f5f7fa] rounded p-0.5">
            <button
              className={`px-3 py-1 text-sm rounded transition-all ${
                activeTab === 'model' ? 'bg-white text-[#409eff] shadow-sm' : 'text-[#606266]'
              }`}
              onClick={() => { setActiveTab('model'); setApplied({ name: '', category: '' }); }}
            >
              示范合同文本
            </button>
            <button
              className={`px-3 py-1 text-sm rounded transition-all ${
                activeTab === 'non_model' ? 'bg-white text-[#409eff] shadow-sm' : 'text-[#606266]'
              }`}
              onClick={() => { setActiveTab('non_model'); setApplied({ name: '', category: '' }); }}
            >
              非示范合同文本
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PrimaryButton onClick={openNew}>
            <Plus size={14} className="inline mr-1" />新增文本
          </PrimaryButton>
        </div>
      </div>

      {/* 搜索筛选区 */}
      <div className="px-5 py-3 bg-[#fafbfc] border-b border-[#ebeef5]">
        <SearchBar
          onSearch={() => setApplied({ name: filterName, category: filterCategory })}
          onReset={() => {
            setFilterName('');
            setFilterCategory('');
            setApplied({ name: '', category: '' });
          }}
        >
          <SearchField
            label="文本名称"
            placeholder="请输入"
            value={filterName}
            onChange={(v) => setFilterName(v)}
          />
          <SearchField
            label="分类"
            type="select"
            value={filterCategory}
            onChange={(v) => setFilterCategory(v)}
            options={CONTRACT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
        </SearchBar>
      </div>

      {/* 数据表格 */}
      <div className="flex-1 px-5 py-3 overflow-auto">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* 编辑器弹窗 */}
      <Modal
        open={editorOpen}
        title={isNew ? `新增${activeTab === 'model' ? '示范' : '非示范'}合同文本` : '编辑合同文本'}
        onClose={() => { setEditorOpen(false); setEditItem(null); }}
        width="900px"
      >
        <ContractTextEditor
          isNew={isNew}
          type={activeTab}
          initialData={editItem}
          onSave={handleEditorSave}
          onCancel={() => { setEditorOpen(false); setEditItem(null); }}
        />
      </Modal>

      {/* 版本对比弹窗 */}
      <Modal
        open={versionCompareOpen}
        title="版本对比"
        onClose={() => setVersionCompareOpen(false)}
        width="1100px"
      >
        {compareText && (
          <ContractTextVersionCompare
            text={compareText}
            onClose={() => setVersionCompareOpen(false)}
          />
        )}
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        open={previewOpen}
        title={previewText?.name || '文本预览'}
        onClose={() => setPreviewOpen(false)}
        width="700px"
      >
        {previewText && (
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2 text-sm text-[#606266]">
              <span>版本: v{previewText.version}</span>
              <span>·</span>
              <span>分类: {getCategoryLabel(previewText.category)}</span>
              <span>·</span>
              <span>更新: {previewText.updateTime || previewText.createTime}</span>
            </div>
            <div className="border border-[#ebeef5] rounded p-4 bg-white max-h-96 overflow-auto whitespace-pre-wrap text-sm">
              {previewText.content || '暂无内容'}
            </div>
            {previewText.supplements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-[#303133] mb-2">补充条款</h4>
                {previewText.supplements.map((s) => (
                  <div key={s.id} className="border border-[#ebeef5] rounded p-3 mb-2 bg-[#fafbfc]">
                    <div className="text-sm font-medium text-[#303133] mb-1">{s.title}</div>
                    <div className="text-sm text-[#606266] whitespace-pre-wrap">{s.content}</div>
                  </div>
                ))}
              </div>
            )}
            {previewText.annotations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-[#303133] mb-2">
                  批注 ({previewText.annotations.filter((a) => !a.isResolved).length} 条待处理)
                </h4>
                {previewText.annotations.map((a) => (
                  <div
                    key={a.id}
                    className={`border rounded p-2 mb-2 text-sm ${
                      a.isResolved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#303133]">{a.author}</span>
                      <span className="text-xs text-[#909399]">{a.createTime}</span>
                    </div>
                    <div className="text-[#606266] mt-1">{a.content}</div>
                    {a.isResolved && <div className="text-xs text-green-600 mt-1">✓ 已解决</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 批注弹窗 */}
      <Modal
        open={annotationModalOpen}
        title="添加批注"
        onClose={() => setAnnotationModalOpen(false)}
        width="400px"
      >
        <div className="p-4">
          <textarea
            className="w-full h-32 border border-[#dcdfe6] rounded p-2 text-sm resize-none focus:outline-none focus:border-[#409eff]"
            placeholder="请输入批注内容..."
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
          />
          <div className="mt-3 flex justify-end gap-2">
            <TextButton onClick={() => setAnnotationModalOpen(false)}>取消</TextButton>
            <PrimaryButton onClick={handleAnnotationSubmit}>
              <Upload size={14} className="inline mr-1" />提交批注
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
