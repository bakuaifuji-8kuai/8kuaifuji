import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { EvaluationTemplate, EvaluationIndicator, EvaluationType } from '@/types';
import { EVALUATION_TYPE_LABELS, EVALUATION_TYPE_GROUPS } from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { Plus, Edit2, Trash2, Eye, GripVertical, Save, Copy, Lock, Unlock } from 'lucide-react';

type TabKey = 'all' | 'assessment' | 'yearly';

const TAB_CONFIG: { key: TabKey; label: string; desc: string }[] = [
  { key: 'assessment', label: '考核管理', desc: '单个项目考核 / 月度考核 / 季度考核' },
  { key: 'yearly', label: '年度评价', desc: '年度综合评价模板' },
  { key: 'all', label: '全部模板', desc: '查看所有类型模板' },
];

export default function EvaluationTemplatePage() {
  const evaluationTemplates = useStore((s) => s.evaluationTemplates) || [];
  const addEvaluationTemplate = useStore((s) => s.addEvaluationTemplate);
  const updateEvaluationTemplate = useStore((s) => s.updateEvaluationTemplate);
  const deleteEvaluationTemplate = useStore((s) => s.deleteEvaluationTemplate);
  const currentUser = useStore((s) => s.currentUser);

  const [activeTab, setActiveTab] = useState<TabKey>('assessment');
  const [filterBuiltin, setFilterBuiltin] = useState<'all' | 'builtin' | 'custom'>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [applied, setApplied] = useState({ builtin: 'all' as 'all' | 'builtin' | 'custom', text: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EvaluationTemplate | null>(null);
  const [viewItem, setViewItem] = useState<EvaluationTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);

  // 编辑表单状态
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<EvaluationType>('project_single');
  const [formDesc, setFormDesc] = useState('');
  const [indicators, setIndicators] = useState<EvaluationIndicator[]>([]);

  // 根据 tab 筛选类型
  const tabTypeFilter = useMemo<EvaluationType[]>(() => {
    if (activeTab === 'all') return [];
    const group = EVALUATION_TYPE_GROUPS[activeTab];
    return group ? group.types : [];
  }, [activeTab]);

  const filteredData = useMemo(() => {
    return evaluationTemplates.filter((t) => {
      // tab 类型筛选
      if (tabTypeFilter.length > 0 && !tabTypeFilter.includes(t.type)) return false;
      // 内置/自定义筛选
      if (applied.builtin === 'builtin' && !t.isBuiltin) return false;
      if (applied.builtin === 'custom' && t.isBuiltin) return false;
      // 文字搜索
      if (applied.text && !t.name.includes(applied.text)) return false;
      return true;
    });
  }, [evaluationTemplates, tabTypeFilter, applied]);

  const stats = useMemo(() => {
    const total = evaluationTemplates.length;
    const builtin = evaluationTemplates.filter((t) => t.isBuiltin).length;
    const custom = total - builtin;
    return { total, builtin, custom };
  }, [evaluationTemplates]);

  // ==================== CRUD ====================

  const openAdd = () => {
    setIsNew(true);
    setEditItem(null);
    setFormName('');
    setFormType('project_single');
    setFormDesc('');
    setIndicators([]);
    setEditModalOpen(true);
  };

  const openEdit = (template: EvaluationTemplate) => {
    if (template.isBuiltin) {
      alert('系统内置模板不可直接编辑，请先点击「克隆为自定义」生成副本后再修改');
      return;
    }
    setIsNew(false);
    setEditItem(template);
    setFormName(template.name);
    setFormType(template.type);
    setFormDesc(template.description || '');
    setIndicators([...template.indicators]);
    setEditModalOpen(true);
  };

  const openView = (template: EvaluationTemplate) => {
    setViewItem(template);
    setViewModalOpen(true);
  };

  /** 克隆模板：内置 → 自定义副本（可编辑）；自定义 → 另一份副本 */
  const handleClone = (template: EvaluationTemplate) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const cloned: EvaluationTemplate = {
      id: 'CLONE_' + Date.now(),
      name: template.isBuiltin ? `${template.name}（自定义副本）` : `${template.name} - 副本`,
      type: template.type,
      description: template.isBuiltin
        ? `克隆自系统内置模板「${template.name}」\n${template.description || ''}`
        : template.description,
      indicators: template.indicators.map((ind) => ({ ...ind, id: ind.id + '_C' + Date.now() })),
      totalWeight: template.totalWeight,
      creator: currentUser.name,
      createTime: now,
      isBuiltin: false,
      clonedFrom: template.id,
    };
    addEvaluationTemplate?.(cloned);
    alert(`✅ 已克隆为自定义模板：${cloned.name}\n现在可以编辑了`);
  };

  const handleDelete = (template: EvaluationTemplate) => {
    if (template.isBuiltin) {
      alert('系统内置模板不可删除');
      return;
    }
    if (confirm(`确定删除自定义模板「${template.name}」吗？此操作不可恢复。`)) {
      deleteEvaluationTemplate?.(template.id);
    }
  };

  // ==================== 指标编辑 ====================

  const handleAddIndicator = () => {
    const newIndicator: EvaluationIndicator = {
      id: 'IND' + Date.now(),
      name: '',
      category: '',
      weight: 0,
      maxScore: 100,
      description: '',
    };
    setIndicators([...indicators, newIndicator]);
  };

  const handleUpdateIndicator = (id: string, field: keyof EvaluationIndicator, value: any) => {
    setIndicators(indicators.map((ind) => ind.id === id ? { ...ind, [field]: value } : ind));
  };

  const handleDeleteIndicator = (id: string) => {
    setIndicators(indicators.filter((ind) => ind.id !== id));
  };

  const totalWeight = useMemo(() => {
    return indicators.reduce((sum, ind) => sum + (Number(ind.weight) || 0), 0);
  }, [indicators]);

  // ==================== 保存 ====================

  const handleSave = () => {
    if (!formName.trim()) { alert('请输入模板名称'); return; }
    if (indicators.length === 0) { alert('请至少添加一个考核指标'); return; }
    if (totalWeight !== 100) { alert(`指标权重总和必须为100%，当前为${totalWeight}%`); return; }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (isNew) {
      const newTemplate: EvaluationTemplate = {
        id: 'CUS_' + Date.now(),
        name: formName,
        type: formType,
        description: formDesc,
        indicators,
        totalWeight: 100,
        creator: currentUser.name,
        createTime: now,
        isBuiltin: false,
      };
      addEvaluationTemplate?.(newTemplate);
    } else if (editItem) {
      const updateData: Partial<EvaluationTemplate> = {
        name: formName,
        type: formType,
        description: formDesc,
        indicators,
        totalWeight: 100,
        updateTime: now,
      };
      updateEvaluationTemplate?.(editItem.id, updateData);
    }
    setEditModalOpen(false);
  };

  // ==================== 表格列 ====================

  const columns: ColumnDef<EvaluationTemplate>[] = [
    {
      header: '模板名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isBuiltin ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Lock size={10} /> 内置
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Unlock size={10} /> 自定义
            </span>
          )}
          <span className="font-medium text-slate-800">{row.original.name}</span>
        </div>
      ),
    },
    {
      header: '考核类型',
      cell: ({ row }) => (
        <Badge variant={
          row.original.type === 'yearly' ? 'success' :
          row.original.type === 'monthly' ? 'info' :
          row.original.type === 'quarterly' ? 'primary' : 'default'
        }>
          {EVALUATION_TYPE_LABELS[row.original.type] || row.original.type}
        </Badge>
      ),
    },
    {
      header: '指标数量',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.indicators.length} 项</span>
      ),
    },
    {
      header: '创建人',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.creator}{row.original.isBuiltin && '（系统）'}</span>
      ),
    },
    {
      header: '创建时间',
      cell: ({ row }) => <span className="text-slate-600">{row.original.createTime}</span>,
    },
    {
      header: '操作',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex gap-2">
            <TextButton onClick={() => openView(t)}><Eye size={14} /> 查看</TextButton>
            <TextButton onClick={() => handleClone(t)} title="克隆为自定义模板（可编辑）">
              <Copy size={14} /> 克隆
            </TextButton>
            {!t.isBuiltin && (
              <>
                <TextButton onClick={() => openEdit(t)}><Edit2 size={14} /> 编辑</TextButton>
                <TextButton type="danger" onClick={() => handleDelete(t)}><Trash2 size={14} /> 删除</TextButton>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div className="p-5">
      {/* 页面标题 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">考核评价模版管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          系统内置模板不可直接编辑，可「克隆为自定义」后调整；自定义模板支持自由增删改
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">模板总数</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <div className="text-sm text-slate-500">系统内置（不可改）</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.builtin}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <div className="text-sm text-slate-500">自定义（可编辑）</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats.custom}</div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-4">
        <div className="flex border-b border-slate-200">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span>{tab.label}</span>
                <span className="text-[11px] text-slate-400 font-normal mt-0.5">{tab.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        {/* 筛选区域 */}
        <div className="flex items-center gap-4 mb-4">
          <select
            value={applied.builtin}
            onChange={(e) => setApplied({ ...applied, builtin: e.target.value as 'all' | 'builtin' | 'custom' })}
            className="h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">全部来源</option>
            <option value="builtin">仅系统内置</option>
            <option value="custom">仅自定义</option>
          </select>
          <input
            type="text"
            placeholder="搜索模板名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-9 px-3 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <DefaultButton onClick={() => setApplied({ ...applied, text: searchText })}>搜索</DefaultButton>
          <DefaultButton onClick={() => { setSearchText(''); setApplied({ builtin: 'all', text: '' }); }}>重置</DefaultButton>

          <div className="flex-1"></div>

          <PrimaryButton onClick={openAdd}><Plus size={14} /> 新增自定义模板</PrimaryButton>
        </div>

        {/* 数据表格 */}
        <DataTable data={filteredData} columns={columns} />
      </Card>

      {/* 编辑/新增弹窗 */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={isNew ? '新增自定义模板' : `编辑模板${editItem?.isBuiltin ? '（内置 · 只读）' : ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">模板名称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="请输入模板名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">考核类型 <span className="text-red-500">*</span></label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as EvaluationType)}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.entries(EVALUATION_TYPE_LABELS).filter(([k]) => k !== 'single' && k !== 'contract_performance' && k !== 'warranty').map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">模板描述</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full h-20 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="请输入模板描述"
            />
          </div>

          {/* 考核指标 */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-sm font-medium text-slate-700">考核指标 <span className="text-red-500">*</span></span>
                <span className={`ml-2 text-xs ${totalWeight === 100 ? 'text-green-600' : 'text-red-500'}`}>
                  权重总和: {totalWeight}% {totalWeight === 100 ? '✓' : '（必须为100%）'}
                </span>
              </div>
              <DefaultButton onClick={handleAddIndicator}><Plus size={14} /> 添加指标</DefaultButton>
            </div>

            {indicators.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">暂无考核指标，点击"添加指标"按钮添加</div>
            ) : (
              <div className="space-y-3">
                {indicators.map((ind, index) => (
                  <div key={ind.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-slate-400"><GripVertical size={14} /></span>
                      <span className="text-sm text-slate-600">指标 {index + 1}</span>
                      <div className="flex-1"></div>
                      <button
                        onClick={() => handleDeleteIndicator(ind.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">指标名称</label>
                        <input
                          type="text"
                          value={ind.name}
                          onChange={(e) => handleUpdateIndicator(ind.id, 'name', e.target.value)}
                          className="w-full h-8 px-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="如：质量合格率"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">指标分类</label>
                        <input
                          type="text"
                          value={ind.category}
                          onChange={(e) => handleUpdateIndicator(ind.id, 'category', e.target.value)}
                          className="w-full h-8 px-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="如：质量"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">权重 (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={ind.weight}
                          onChange={(e) => handleUpdateIndicator(ind.id, 'weight', Number(e.target.value))}
                          className="w-full h-8 px-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">满分</label>
                        <input
                          type="number"
                          min="1"
                          value={ind.maxScore}
                          onChange={(e) => handleUpdateIndicator(ind.id, 'maxScore', Number(e.target.value))}
                          className="w-full h-8 px-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-slate-500">指标说明</label>
                      <input
                        type="text"
                        value={ind.description || ''}
                        onChange={(e) => handleUpdateIndicator(ind.id, 'description', e.target.value)}
                        className="w-full h-8 px-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="指标的详细说明"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <DefaultButton onClick={() => setEditModalOpen(false)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSave}><Save size={14} /> 保存</PrimaryButton>
        </div>
      </Modal>

      {/* 查看详情弹窗 */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="模板详情"
        size="md"
      >
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 flex items-center gap-2">
                <span className="font-medium text-slate-800 text-base">{viewItem.name}</span>
                {viewItem.isBuiltin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-700 border border-amber-200">
                    <Lock size={11} /> 系统内置（不可直接编辑）
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Unlock size={11} /> 自定义
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-500">考核类型：</span>
                <Badge variant="primary">{EVALUATION_TYPE_LABELS[viewItem.type]}</Badge>
              </div>
              <div>
                <span className="text-slate-500">创建人：</span>
                <span className="text-slate-800">{viewItem.creator}</span>
              </div>
              <div>
                <span className="text-slate-500">创建时间：</span>
                <span className="text-slate-800">{viewItem.createTime}</span>
              </div>
              {viewItem.isBuiltin && (
                <div>
                  <span className="text-slate-500">使用提示：</span>
                  <span className="text-amber-600">请点击「克隆为自定义」后再调整</span>
                </div>
              )}
            </div>
            {viewItem.description && (
              <div>
                <span className="text-slate-500 text-sm">模板描述：</span>
                <p className="text-slate-800 mt-1 whitespace-pre-line">{viewItem.description}</p>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3">
              <span className="text-sm font-medium text-slate-700">考核指标（{viewItem.indicators.length}项）</span>
              <div className="mt-3 space-y-2">
                {viewItem.indicators.map((ind) => (
                  <div key={ind.id} className="flex items-center gap-3 text-sm bg-slate-50 px-3 py-2 rounded">
                    <span className="text-slate-700">{ind.name}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">{ind.category}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-indigo-600 font-medium">权重 {ind.weight}%</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">满分 {ind.maxScore}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right">
                <span className={`text-sm font-medium ${viewItem.totalWeight === 100 ? 'text-green-600' : 'text-red-500'}`}>
                  权重总和: {viewItem.totalWeight}%
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {viewItem.isBuiltin && (
                <PrimaryButton onClick={() => { setViewModalOpen(false); handleClone(viewItem); }}>
                  <Copy size={14} /> 克隆为自定义模板
                </PrimaryButton>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
