import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { EvaluationTemplate, EvaluationIndicator, EvaluationType } from '@/types';
import { EVALUATION_TYPE_LABELS } from '@/types';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { Plus, Edit2, Trash2, Eye, GripVertical, Save } from 'lucide-react';

export default function EvaluationTemplatePage() {
  const evaluationTemplates = useStore((s) => s.evaluationTemplates) || [];
  const addEvaluationTemplate = useStore((s) => s.addEvaluationTemplate);
  const updateEvaluationTemplate = useStore((s) => s.updateEvaluationTemplate);
  const deleteEvaluationTemplate = useStore((s) => s.deleteEvaluationTemplate);
  const currentUser = useStore((s) => s.currentUser);

  const [filterType, setFilterType] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [applied, setApplied] = useState({ type: '', text: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EvaluationTemplate | null>(null);
  const [viewItem, setViewItem] = useState<EvaluationTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);

  // 编辑表单状态
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<EvaluationType>('quarterly');
  const [formDesc, setFormDesc] = useState('');
  const [indicators, setIndicators] = useState<EvaluationIndicator[]>([]);

  const filteredData = useMemo(() => {
    return evaluationTemplates.filter((t) => {
      if (applied.type && t.type !== applied.type) return false;
      if (applied.text && !t.name.includes(applied.text)) return false;
      return true;
    });
  }, [evaluationTemplates, applied]);

  const stats = useMemo(() => {
    const total = evaluationTemplates.length;
    const byType: Record<string, number> = {};
    evaluationTemplates.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
    });
    return { total, byType };
  }, [evaluationTemplates]);

  const openAdd = () => {
    setIsNew(true);
    setEditItem(null);
    setFormName('');
    setFormType('quarterly');
    setFormDesc('');
    setIndicators([]);
    setEditModalOpen(true);
  };

  const openEdit = (template: EvaluationTemplate) => {
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

  const handleSave = () => {
    if (!formName.trim()) {
      alert('请输入模板名称');
      return;
    }
    if (indicators.length === 0) {
      alert('请至少添加一个考核指标');
      return;
    }
    if (totalWeight !== 100) {
      alert(`指标权重总和必须为100%，当前为${totalWeight}%`);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (isNew) {
      const newTemplate: EvaluationTemplate = {
        id: 'ET' + Date.now(),
        name: formName,
        type: formType,
        description: formDesc,
        indicators,
        totalWeight: 100,
        creator: currentUser.name,
        createTime: now,
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

  const handleDelete = (template: EvaluationTemplate) => {
    if (confirm(`确定删除模板「${template.name}」吗？`)) {
      deleteEvaluationTemplate?.(template.id);
    }
  };

  const columns: ColumnDef<EvaluationTemplate>[] = [
    {
      header: '模板名称',
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="font-medium text-slate-800">{row.original.name}</span>
      ),
    },
    {
      header: '考核类型',
      accessorKey: 'type',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'quarterly' ? 'primary' : row.original.type === 'single' ? 'success' : 'warning'}>
          {EVALUATION_TYPE_LABELS[row.original.type]}
        </Badge>
      ),
    },
    {
      header: '指标数量',
      accessorKey: 'indicators',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.indicators.length} 项</span>
      ),
    },
    {
      header: '创建人',
      accessorKey: 'creator',
      cell: ({ row }) => <span className="text-slate-600">{row.original.creator}</span>,
    },
    {
      header: '创建时间',
      accessorKey: 'createTime',
      cell: ({ row }) => <span className="text-slate-600">{row.original.createTime}</span>,
    },
    {
      header: '操作',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <TextButton onClick={() => openView(row.original)}><Eye size={14} /> 查看</TextButton>
          <TextButton onClick={() => openEdit(row.original)}><Edit2 size={14} /> 编辑</TextButton>
          <TextButton type="danger" onClick={() => handleDelete(row.original)}><Trash2 size={14} /> 删除</TextButton>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      {/* 页面标题 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">评估模板管理</h1>
        <p className="text-sm text-slate-500 mt-1">管理供应商履约考核模板，支持自定义考核指标和权重</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">模板总数</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">季度考核模板</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats.byType.quarterly || 0}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">单次考核模板</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.byType.single || 0}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500">质保考核模板</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.byType.warranty || 0}</div>
        </div>
      </div>

      <Card>
        {/* 筛选区域 */}
        <div className="flex items-center gap-4 mb-4">
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
            placeholder="搜索模板名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-9 px-3 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <DefaultButton onClick={() => setApplied({ type: filterType, text: searchText })}>搜索</DefaultButton>
          <DefaultButton onClick={() => { setFilterType(''); setSearchText(''); setApplied({ type: '', text: '' }); }}>重置</DefaultButton>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end mb-4">
          <PrimaryButton onClick={openAdd}><Plus size={14} /> 新增模板</PrimaryButton>
        </div>

        {/* 数据表格 */}
        <DataTable data={filteredData} columns={columns} />
      </Card>

      {/* 编辑/新增弹窗 */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={isNew ? '新增评估模板' : '编辑评估模板'}
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
                <option value="quarterly">季度考核</option>
                <option value="single">项目单次考核</option>
                <option value="warranty">质保履约考核</option>
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
              <div>
                <span className="text-slate-500">模板名称：</span>
                <span className="text-slate-800 font-medium">{viewItem.name}</span>
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
            </div>
            {viewItem.description && (
              <div>
                <span className="text-slate-500 text-sm">模板描述：</span>
                <p className="text-slate-800 mt-1">{viewItem.description}</p>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
