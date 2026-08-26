import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { TemplateEditor } from '@/components/template/TemplateEditor';
import { useStore } from '@/store/useStore';
import type { ContractTemplate, ContractTemplateVersion, ContractCategory, TemplateComponent, TemplateAnnotation, DataSourceMapping } from '@/types';
import { CONTRACT_CATEGORIES, getCategoryLabel } from '@/constants/contractCategories';
import { FileEdit, Eye, GitCompare, MessageSquare, Download, History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContractTemplatePage() {
  const contractTemplates = useStore((s) => s.contractTemplates || []) as ContractTemplate[];
  const addContractTemplate = useStore((s) => s.addContractTemplate) as ((t: ContractTemplate) => void) | undefined;
  const updateContractTemplate = useStore((s) => s.updateContractTemplate) as ((id: string, data: Partial<ContractTemplate>) => void) | undefined;
  const deleteContractTemplate = useStore((s) => s.deleteContractTemplate) as ((id: string) => void) | undefined;
  const currentUser = useStore((s) => s.currentUser);

  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [applied, setApplied] = useState({ name: '', category: '' });

  // 编辑器状态
  const [editItem, setEditItem] = useState<ContractTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState<{
    templateId?: string;
    name: string;
    category: string;
    components: TemplateComponent[];
    dataSourceMappings?: DataSourceMapping[];
  } | null>(null);

  // 版本历史弹窗
  const [viewHistoryTemplate, setViewHistoryTemplate] = useState<ContractTemplate | null>(null);

  // 版本对比弹窗
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareTemplate, setCompareTemplate] = useState<ContractTemplate | null>(null);
  const [compareLeftVersion, setCompareLeftVersion] = useState<ContractTemplateVersion | null>(null);
  const [compareRightVersion, setCompareRightVersion] = useState<ContractTemplateVersion | null>(null);

  // 批注弹窗
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [annotationTemplate, setAnnotationTemplate] = useState<ContractTemplate | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationVersion, setAnnotationVersion] = useState<number>(1);

  // 预览弹窗
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);

  // 版本详情展开
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    return contractTemplates.filter((t) => {
      if (applied.name && !t.name.includes(applied.name)) return false;
      if (applied.category && t.category !== applied.category) return false;
      return true;
    });
  }, [contractTemplates, applied]);

  const columns: ColumnDef<ContractTemplate>[] = [
    { key: 'name', title: '模板名称', width: '150' },
    {
      key: 'category',
      title: '分类',
      width: '120',
      render: (row) => getCategoryLabel(row.category),
    },
    {
      key: 'version',
      title: '版本',
      width: '60',
      render: (row) => `v${row.version}`,
    },
    {
      key: 'versions',
      title: '历史版本',
      width: '80',
      render: (row) => (row.versions?.length || 0) + ' 个',
    },
    {
      key: 'annotations',
      title: '批注数',
      width: '70',
      render: (row) => {
        const count = row.annotations?.filter((a) => !a.isResolved).length || 0;
        return count > 0 ? (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">{count}</span>
        ) : (
          <span className="text-slate-400 text-xs">0</span>
        );
      },
    },
    {
      key: 'isDefault',
      title: '默认',
      width: '50',
      render: (row) => row.isDefault ? '是' : '否',
    },
    {
      key: 'updateTime',
      title: '更新时间',
      width: '130',
      render: (row) => row.updateTime || row.createTime,
    },
    {
      key: 'op',
      title: '操作',
      width: '380',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => openEditor(row)}>
            <FileEdit size={12} className="inline mr-0.5" />编辑
          </TextButton>
          <TextButton onClick={() => openPreview(row)}>
            <Eye size={12} className="inline mr-0.5" />预览
          </TextButton>
          <TextButton onClick={() => openVersionHistory(row)}>
            <History size={12} className="inline mr-0.5" />版本历史
          </TextButton>
          <TextButton onClick={() => openCompare(row)}>
            <GitCompare size={12} className="inline mr-0.5" />版本对比
          </TextButton>
          <TextButton onClick={() => openAnnotation(row)}>
            <MessageSquare size={12} className="inline mr-0.5" />批注
          </TextButton>
          <TextButton onClick={() => handleDownload(row)}>
            <Download size={12} className="inline mr-0.5" />下载
          </TextButton>
          {!row.isDefault && (
            <TextButton type="danger" onClick={() => {
              if (confirm(`确认删除模板 ${row.name}？`)) deleteContractTemplate?.(row.id);
            }}>删除</TextButton>
          )}
        </div>
      ),
    },
  ];

  const openAdd = () => {
    setIsNew(true);
    setEditorData({
      name: '',
      category: 'exhibition_service',
      components: [],
      dataSourceMappings: [],
    });
    setShowEditor(true);
  };

  const openEditor = (template: ContractTemplate) => {
    setIsNew(false);
    setEditItem(template);
    setEditorData({
      templateId: template.id,
      name: template.name,
      category: template.category,
      components: template.structure || [],
      dataSourceMappings: template.dataSourceMappings || [],
    });
    setShowEditor(true);
  };

  const openPreview = (template: ContractTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const openVersionHistory = (template: ContractTemplate) => {
    setViewHistoryTemplate(template);
    setExpandedVersion(null);
  };

  const openCompare = (template: ContractTemplate) => {
    setCompareTemplate(template);
    const versions = template.versions || [];
    if (versions.length >= 2) {
      setCompareLeftVersion(versions[0]);
      setCompareRightVersion(versions[1]);
    } else if (versions.length === 1) {
      setCompareLeftVersion(versions[0]);
      setCompareRightVersion(null);
    } else {
      setCompareLeftVersion(null);
      setCompareRightVersion(null);
    }
    setCompareOpen(true);
  };

  const openAnnotation = (template: ContractTemplate) => {
    setAnnotationTemplate(template);
    setAnnotationText('');
    setAnnotationVersion(template.version);
    setAnnotationOpen(true);
  };

  const handleEditorSave = (data: {
    name: string;
    category: string;
    components: TemplateComponent[];
    dataSourceMappings?: DataSourceMapping[];
  }) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);

    if (isNew) {
      const newTemplate: ContractTemplate = {
        id: 'CTPL' + Date.now(),
        name: data.name,
        category: data.category as ContractCategory,
        content: '',
        structure: data.components,
        version: 1,
        isDefault: false,
        createTime: timestamp,
        creator: currentUser.name,
        versions: [{
          id: 'V' + Date.now(),
          templateId: 'CTPL' + Date.now(),
          version: 1,
          content: JSON.stringify(data.components),
          createTime: timestamp,
          creator: currentUser.name,
          changeLog: '初始版本',
        }],
        annotations: [],
        dataSourceMappings: data.dataSourceMappings || [],
      };
      addContractTemplate?.(newTemplate);
    } else if (editorData?.templateId) {
      const existing = contractTemplates.find((t) => t.id === editorData.templateId);
      const newVersion = (existing?.version || 1) + 1;
      const versions = existing?.versions || [];
      const newVersionRecord: ContractTemplateVersion = {
        id: 'V' + Date.now(),
        templateId: editorData.templateId,
        version: newVersion,
        content: JSON.stringify(data.components),
        createTime: timestamp,
        creator: currentUser.name,
        changeLog: `更新至 v${newVersion}`,
      };
      const updateData: Partial<ContractTemplate> = {
        name: data.name,
        category: data.category as ContractCategory,
        structure: data.components,
        version: newVersion,
        updateTime: timestamp,
        updater: currentUser.name,
        versions: [...versions, newVersionRecord],
        dataSourceMappings: data.dataSourceMappings || existing?.dataSourceMappings || [],
      };
      updateContractTemplate?.(editorData.templateId, updateData);
    }
    setShowEditor(false);
    setEditorData(null);
    setEditItem(null);
  };

  const handleDownload = (template: ContractTemplate) => {
    let content = template.content;
    if (template.structure && template.structure.length > 0) {
      content = JSON.stringify(template.structure, null, 2);
    }
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${template.name}_V${template.version}.json`;
    link.click();
  };

  const handleDownloadVersion = (template: ContractTemplate, version: ContractTemplateVersion) => {
    let content = version.content;
    try {
      const parsed = JSON.parse(version.content);
      content = JSON.stringify(parsed, null, 2);
    } catch {
      // 保持原内容
    }
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${template.name}_V${version.version}.json`;
    link.click();
  };

  const handleAddAnnotation = () => {
    if (!annotationTemplate || !annotationText.trim()) return;
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
    const newAnnotation: TemplateAnnotation = {
      id: 'ANN' + Date.now(),
      templateId: annotationTemplate.id,
      version: annotationVersion,
      content: annotationText,
      author: currentUser.name,
      createTime: timestamp,
      isResolved: false,
    };
    const existingAnnotations = annotationTemplate.annotations || [];
    updateContractTemplate?.(annotationTemplate.id, {
      annotations: [...existingAnnotations, newAnnotation],
    });
    setAnnotationText('');
  };

  const handleResolveAnnotation = (template: ContractTemplate, annotationId: string) => {
    const annotations = template.annotations || [];
    const updated = annotations.map((a) =>
      a.id === annotationId
        ? {
            ...a,
            isResolved: true,
            resolvedBy: currentUser.name,
            resolvedTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
          }
        : a
    );
    updateContractTemplate?.(template.id, { annotations: updated });
  };

  const handleRollbackVersion = (template: ContractTemplate, version: ContractTemplateVersion) => {
    if (!confirm(`确认回滚至版本 V${version.version}？当前版本将作为新版本保存。`)) return;
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
    const versions = template.versions || [];
    const newVersionNum = (template.version || 1) + 1;
    const newVersionRecord: ContractTemplateVersion = {
      id: 'V' + Date.now(),
      templateId: template.id,
      version: newVersionNum,
      content: version.content,
      createTime: timestamp,
      creator: currentUser.name,
      changeLog: `从 V${version.version} 回滚`,
    };
    let structure: TemplateComponent[] | undefined;
    try {
      structure = JSON.parse(version.content);
    } catch {
      structure = template.structure;
    }
    updateContractTemplate?.(template.id, {
      version: newVersionNum,
      structure,
      updateTime: timestamp,
      updater: currentUser.name,
      versions: [...versions, newVersionRecord],
    });
  };

  const renderVersionContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-1">
            <div className="text-xs text-slate-500">组件数量: {parsed.length}</div>
            {parsed.map((comp: TemplateComponent, idx: number) => (
              <div key={idx} className="text-xs text-slate-600 truncate">
                · {comp.type} {comp.props?.label || comp.props?.text || ''}
              </div>
            ))}
          </div>
        );
      }
      return <pre className="text-xs whitespace-pre-wrap">{content.slice(0, 200)}</pre>;
    } catch {
      return <pre className="text-xs whitespace-pre-wrap">{content.slice(0, 200)}</pre>;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">合同文本模板</h2>
        <PrimaryButton onClick={openAdd}>
          <FileEdit size={14} className="inline mr-1" />
          + 新增模板（拖拽设计）
        </PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ name: filterName, category: filterCategory })}
        onReset={() => {
          setFilterName('');
          setFilterCategory('');
          setApplied({ name: '', category: '' });
        }}
      >
        <SearchField label="模板名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField
          label="分类"
          type="select"
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: '', label: '全部' },
            ...CONTRACT_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 拖拽编辑器全屏 */}
      {showEditor && editorData && (
        <div className="fixed inset-0 z-50 bg-white">
          <TemplateEditor
            initialComponents={editorData.components}
            templateName={editorData.name}
            templateCategory={editorData.category}
            initialDataSourceMappings={editorData.dataSourceMappings || []}
            onSave={handleEditorSave}
          />
        </div>
      )}

      {/* 版本历史弹窗 */}
      <Modal
        open={!!viewHistoryTemplate}
        title="版本历史"
        onClose={() => setViewHistoryTemplate(null)}
        width="800px"
      >
        {viewHistoryTemplate && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[#606266]">
              <span>模板：<span className="font-medium text-[#303133]">{viewHistoryTemplate.name}</span></span>
              <span>·</span>
              <span>当前版本：<span className="font-medium text-indigo-600">v{viewHistoryTemplate.version}</span></span>
              <span>·</span>
              <span>共 {(viewHistoryTemplate.versions || []).length} 个历史版本</span>
            </div>
            
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-xs font-medium text-[#606266] border-b border-[#dcdfe6]">
                版本列表
              </div>
              <div className="max-h-96 overflow-auto">
                {(viewHistoryTemplate.versions || []).length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">暂无历史版本</div>
                ) : (
                  (viewHistoryTemplate.versions || []).slice().reverse().map((v, idx) => (
                    <div key={v.id} className="border-b border-[#ebeef5] last:border-b-0">
                      <div 
                        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                        onClick={() => setExpandedVersion(expandedVersion === v.version ? null : v.version)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${idx === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            v{v.version}
                          </span>
                          <span className="text-xs text-[#606266]">{v.changeLog}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{v.createTime}</span>
                          <span className="text-xs text-slate-400">· {v.creator}</span>
                          {expandedVersion === v.version ? (
                            <ChevronUp size={14} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={14} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                      {expandedVersion === v.version && (
                        <div className="px-3 py-2 bg-slate-50 border-t border-[#ebeef5]">
                          <div className="mb-2">
                            <div className="text-xs text-slate-500 mb-1">内容预览：</div>
                            {renderVersionContent(v.content)}
                          </div>
                          <div className="flex items-center gap-2">
                            <TextButton onClick={() => handleDownloadVersion(viewHistoryTemplate!, v)}>
                              <Download size={12} className="inline mr-0.5" />下载此版本
                            </TextButton>
                            {v.version !== viewHistoryTemplate!.version && (
                              <TextButton onClick={() => handleRollbackVersion(viewHistoryTemplate!, v)}>
                                <RotateCcw size={12} className="inline mr-0.5" />回滚到此版本
                              </TextButton>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 批注列表 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-xs font-medium text-[#606266] border-b border-[#dcdfe6] flex items-center justify-between">
                <span>批注列表</span>
                <button 
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-normal"
                  onClick={() => {
                    setAnnotationTemplate(viewHistoryTemplate);
                    setAnnotationText('');
                    setAnnotationVersion(viewHistoryTemplate.version);
                    setAnnotationOpen(true);
                  }}
                >
                  + 添加批注
                </button>
              </div>
              <div className="max-h-48 overflow-auto">
                {(viewHistoryTemplate.annotations || []).length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">暂无批注</div>
                ) : (
                  (viewHistoryTemplate.annotations || []).map((a) => (
                    <div 
                      key={a.id} 
                      className={`px-3 py-2 border-b border-[#ebeef5] last:border-b-0 ${a.isResolved ? 'bg-green-50' : 'bg-amber-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-[#303133]">{a.author}</span>
                            <span className="text-slate-400">v{a.version}</span>
                            <span className="text-slate-400">{a.createTime}</span>
                            {a.isResolved && (
                              <span className="text-green-600">✓ 已解决</span>
                            )}
                          </div>
                          <div className="text-sm text-[#606266] mt-1">{a.content}</div>
                        </div>
                        {!a.isResolved && (
                          <TextButton 
                            onClick={() => handleResolveAnnotation(viewHistoryTemplate!, a.id)}
                          >
                            解决
                          </TextButton>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 版本对比弹窗 */}
      <Modal
        open={compareOpen}
        title="版本对比"
        onClose={() => setCompareOpen(false)}
        width="1000px"
      >
        {compareTemplate && (
          <div className="space-y-3">
            <div className="text-sm text-[#606266]">
              模板：<span className="font-medium text-[#303133]">{compareTemplate.name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">左侧版本</label>
                <select 
                  className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm"
                  value={compareLeftVersion?.id || ''}
                  onChange={(e) => {
                    const v = (compareTemplate.versions || []).find(x => x.id === e.target.value);
                    setCompareLeftVersion(v || null);
                  }}
                >
                  <option value="">-- 请选择 --</option>
                  {(compareTemplate.versions || []).map(v => (
                    <option key={v.id} value={v.id}>v{v.version} ({v.createTime})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-5">
                <GitCompare size={16} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">右侧版本</label>
                <select 
                  className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm"
                  value={compareRightVersion?.id || ''}
                  onChange={(e) => {
                    const v = (compareTemplate.versions || []).find(x => x.id === e.target.value);
                    setCompareRightVersion(v || null);
                  }}
                >
                  <option value="">-- 请选择 --</option>
                  {(compareTemplate.versions || []).map(v => (
                    <option key={v.id} value={v.id}>v{v.version} ({v.createTime})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#dcdfe6] rounded">
                <div className="bg-[#f5f7fa] px-3 py-2 text-xs font-medium text-[#606266] border-b border-[#dcdfe6]">
                  {compareLeftVersion ? `v${compareLeftVersion.version}` : '未选择'}
                </div>
                <div className="p-3 max-h-72 overflow-auto">
                  {compareLeftVersion ? renderVersionContent(compareLeftVersion.content) : (
                    <div className="text-center text-sm text-slate-400 py-8">请选择左侧版本</div>
                  )}
                </div>
              </div>
              <div className="border border-[#dcdfe6] rounded">
                <div className="bg-[#f5f7fa] px-3 py-2 text-xs font-medium text-[#606266] border-b border-[#dcdfe6]">
                  {compareRightVersion ? `v${compareRightVersion.version}` : '未选择'}
                </div>
                <div className="p-3 max-h-72 overflow-auto">
                  {compareRightVersion ? renderVersionContent(compareRightVersion.content) : (
                    <div className="text-center text-sm text-slate-400 py-8">请选择右侧版本</div>
                  )}
                </div>
              </div>
            </div>

            {compareLeftVersion && compareRightVersion && (
              <div className="border border-indigo-200 bg-indigo-50 rounded p-3">
                <div className="text-xs text-indigo-600 font-medium mb-2">差异说明</div>
                <div className="text-xs text-slate-600 space-y-1">
                  {compareLeftVersion.changeLog && (
                    <div>· v{compareLeftVersion.version}：{compareLeftVersion.changeLog}</div>
                  )}
                  {compareRightVersion.changeLog && (
                    <div>· v{compareRightVersion.version}：{compareRightVersion.changeLog}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 批注弹窗 */}
      <Modal
        open={annotationOpen}
        title="添加批注"
        onClose={() => setAnnotationOpen(false)}
        width="500px"
        footer={
          <>
            <DefaultButton onClick={() => setAnnotationOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={() => { handleAddAnnotation(); setAnnotationOpen(false); }}>
              添加
            </PrimaryButton>
          </>
        }
      >
        {annotationTemplate && (
          <div className="space-y-3">
            <div className="text-sm text-[#606266]">
              模板：<span className="font-medium text-[#303133]">{annotationTemplate.name}</span>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">针对版本</label>
              <select 
                className="w-full border border-[#dcdfe6] rounded px-2 py-1.5 text-sm"
                value={annotationVersion}
                onChange={(e) => setAnnotationVersion(Number(e.target.value))}
              >
                {(annotationTemplate.versions || []).map(v => (
                  <option key={v.id} value={v.version}>v{v.version}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">批注内容</label>
              <textarea
                className="w-full h-24 border border-[#dcdfe6] rounded p-2 text-sm resize-none focus:outline-none focus:border-indigo-500"
                placeholder="请输入批注内容..."
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
              />
            </div>

            {/* 已有批注 */}
            <div>
              <div className="text-xs text-slate-500 mb-2">已有批注 ({(annotationTemplate.annotations || []).length})</div>
              <div className="max-h-40 overflow-auto space-y-2">
                {(annotationTemplate.annotations || []).length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-4">暂无批注</div>
                ) : (
                  (annotationTemplate.annotations || []).map(a => (
                    <div 
                      key={a.id} 
                      className={`border rounded p-2 text-sm ${a.isResolved ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-[#303133]">{a.author}</span>
                          <span className="text-slate-400">v{a.version}</span>
                          <span className="text-slate-400">{a.createTime}</span>
                        </div>
                        {!a.isResolved && (
                          <TextButton onClick={() => { handleResolveAnnotation(annotationTemplate, a.id); }}>
                            解决
                          </TextButton>
                        )}
                      </div>
                      <div className="text-[#606266] mt-1">{a.content}</div>
                      {a.isResolved && <div className="text-xs text-green-600 mt-1">✓ 已解决 · {a.resolvedBy}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        open={previewOpen}
        title="模板预览"
        onClose={() => setPreviewOpen(false)}
        width="700px"
      >
        {previewTemplate && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[#606266]">
              <span>版本: v{previewTemplate.version}</span>
              <span>·</span>
              <span>分类: {getCategoryLabel(previewTemplate.category)}</span>
              <span>·</span>
              <span>更新: {previewTemplate.updateTime || previewTemplate.createTime}</span>
            </div>
            
            <div className="border border-[#ebeef5] rounded p-4 bg-white max-h-96 overflow-auto">
              <div className="text-sm font-medium text-[#303133] mb-2">{previewTemplate.name}</div>
              {previewTemplate.structure && previewTemplate.structure.length > 0 ? (
                <div className="space-y-2">
                  {previewTemplate.structure.map((comp, idx) => (
                    <div key={idx} className="border border-[#ebeef5] rounded p-2 bg-[#fafbfc]">
                      <div className="text-xs text-slate-500 mb-1">组件: {comp.type}</div>
                      <div className="text-sm text-[#606266]">
                        {comp.props?.text || comp.props?.label || comp.props?.content || comp.props?.placeholder || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : previewTemplate.content ? (
                <pre className="text-sm whitespace-pre-wrap">{previewTemplate.content}</pre>
              ) : (
                <div className="text-center text-sm text-slate-400 py-8">暂无内容</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <PrimaryButton onClick={() => handleDownload(previewTemplate)}>
                <Download size={14} className="inline mr-1" />下载模板
              </PrimaryButton>
              <DefaultButton onClick={() => { openEditor(previewTemplate); setPreviewOpen(false); }}>
                <FileEdit size={14} className="inline mr-1" />编辑模板
              </DefaultButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
