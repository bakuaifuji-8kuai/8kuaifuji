import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Project } from '@/types';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';

interface Props {
  /** 当前页标题 */
  pageTitle?: string;
}

export default function ImplementationProjectPage({ pageTitle = '实施项目管理' }: Props) {
  const projects = useStore((s) => s.implementationProjects);
  const addProject = useStore((s) => s.addImplementationProject);
  const updateProject = useStore((s) => s.updateImplementationProject);
  const deleteProject = useStore((s) => s.deleteImplementationProject);
  const currentUser = useStore((s) => s.currentUser);

  const [filterName, setFilterName] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');

  const filteredData = useMemo(() => {
    if (!appliedFilter) return projects;
    return projects.filter((p) => p.projectName.includes(appliedFilter));
  }, [projects, appliedFilter]);

  const columns: ColumnDef<Project>[] = [
    { key: 'projectName', title: '项目名称' },
    { key: 'updater', title: '更新人', render: (r) => r.updater || '-' },
    { key: 'updateTime', title: '更新时间', render: (r) => r.updateTime || '-' },
    {
      key: 'status',
      title: '状态',
      render: (r) => (
        <span className={r.status === 'enabled' ? 'text-green-600' : 'text-slate-400'}>
          {r.status === 'enabled' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      key: 'op',
      title: '操作',
      render: (r) => (
        <div className="flex items-center gap-2">
          <TextButton onClick={() => { setViewItem(r); setViewModalOpen(true); }}>
            <Eye size={14} />
          </TextButton>
          <TextButton onClick={() => handleEdit(r)}>
            <Pencil size={14} />
          </TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除项目 "${r.projectName}"？`)) deleteProject(r.id);
            }}
          >
            <Trash2 size={14} />
          </TextButton>
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<Project | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (item: Project) => {
    setEditItem({ ...item });
    setModalOpen(true);
  };

  const handleAdd = () => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newItem: Project = {
      id: 'IMP' + Date.now(),
      projectNo: '',
      projectName: '',
      type: 'implementation',
      status: 'enabled',
      updater: '',
      updateTime: '',
      createTime: now,
      creator: currentUser.name,
      remark: '',
    };
    setEditItem(newItem);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.projectName.trim()) {
      alert('请填写项目名称');
      return;
    }
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const isNew = !projects.find((p) => p.id === editItem.id);
    if (isNew) {
      addProject({ ...editItem, createTime: now, creator: currentUser.name });
    } else {
      updateProject(editItem.id, { ...editItem, updateTime: now, updater: currentUser.name });
    }
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-[#303133]">{pageTitle}</h1>
        <PrimaryButton onClick={handleAdd}>
          <Plus size={14} /> 新增
        </PrimaryButton>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-3 bg-white p-3 rounded">
        <span className="text-sm text-[#606266]">项目名称：</span>
        <input
          type="text"
          className="h-8 px-2 border border-[#dcdfe6] rounded text-sm w-48 focus:outline-none focus:border-blue-500"
          placeholder="请输入项目名称"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setAppliedFilter(filterName)}
        />
        <DefaultButton onClick={() => setAppliedFilter(filterName)}>查询</DefaultButton>
        <TextButton onClick={() => { setFilterName(''); setAppliedFilter(''); }}>重置</TextButton>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* 查看弹窗 */}
      <Modal open={viewModalOpen} title="查看项目" onClose={() => setViewModalOpen(false)} width="max-w-[600px]">
        {viewItem && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">项目类型：</span>
              <span>实施项目</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">项目名称：</span>
              <span className="font-medium">{viewItem.projectName}</span>
            </div>
            <div>
              <span className="text-slate-500">创建人：</span>
              <span>{viewItem.creator}</span>
            </div>
            <div>
              <span className="text-slate-500">创建时间：</span>
              <span>{viewItem.createTime}</span>
            </div>
            <div>
              <span className="text-slate-500">更新人：</span>
              <span>{viewItem.updater || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500">更新时间：</span>
              <span>{viewItem.updateTime || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500">状态：</span>
              <span className={viewItem.status === 'enabled' ? 'text-green-600' : 'text-slate-400'}>
                {viewItem.status === 'enabled' ? '启用' : '禁用'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">备注：</span>
              <span>{viewItem.remark || '-'}</span>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <DefaultButton onClick={() => setViewModalOpen(false)}>关闭</DefaultButton>
        </div>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal open={modalOpen} title={projects.find((p) => p.id === editItem?.id) ? '编辑项目' : '新增项目'} onClose={() => setModalOpen(false)} width="max-w-[600px]">
        {editItem && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-[#606266]">状态</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-blue-500"
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as 'enabled' | 'disabled' })}
                >
                  <option value="enabled">启用</option>
                  <option value="disabled">禁用</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#909399] text-xs">创建人：{editItem.creator || currentUser.name}</div>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#f56c6c]">* 项目名称</div>
              <input
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-blue-500"
                placeholder="请输入项目名称"
                value={editItem.projectName}
                onChange={(e) => setEditItem({ ...editItem, projectName: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea
                className="w-full px-2 py-1 border border-[#dcdfe6] rounded text-[#303133] focus:outline-none focus:border-blue-500"
                rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setModalOpen(false)}>取消</DefaultButton>
          <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
