import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { ContractTemplate, ContractTemplateVersion, ContractCategory } from '@/types';

export default function ContractTemplatePage() {
  const contractTemplates = useStore((s) => s.contractTemplates || []) as ContractTemplate[];
  const addContractTemplate = useStore((s) => s.addContractTemplate) as ((t: ContractTemplate) => void) | undefined;
  const updateContractTemplate = useStore((s) => s.updateContractTemplate) as ((id: string, data: Partial<ContractTemplate>) => void) | undefined;
  const deleteContractTemplate = useStore((s) => s.deleteContractTemplate) as ((id: string) => void) | undefined;
  const currentUser = useStore((s) => s.currentUser);

  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [applied, setApplied] = useState({ name: '', category: '' });

  const filteredData = useMemo(() => {
    return contractTemplates.filter((t) => {
      if (applied.name && !t.name.includes(applied.name)) return false;
      if (applied.category && t.category !== applied.category) return false;
      return true;
    });
  }, [contractTemplates, applied]);

  const columns: ColumnDef<ContractTemplate>[] = [
    { key: 'name', title: '模板名称' },
    {
      key: 'category',
      title: '分类',
      render: (row) => {
        const categoryMap: Record<string, string> = {
          exhibition_service: '展览服务',
          exhibition_display: '展览展示',
          procurement: '采购类',
          investment: '招商类',
          other: '其他',
        };
        return categoryMap[row.category] || row.category;
      },
    },
    { key: 'version', title: '版本号' },
    {
      key: 'isDefault',
      title: '默认模板',
      render: (row) => row.isDefault ? '是' : '否',
    },
    { key: 'creator', title: '创建人' },
    { key: 'createTime', title: '创建时间', render: (row) => row.createTime?.split(' ')[0] || '-' },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton onClick={() => viewVersionHistory(row)}>版本历史</TextButton>
          <TextButton onClick={() => handleDownload(row)}>下载</TextButton>
          {!row.isDefault && (
            <TextButton type="danger" onClick={() => {
              if (confirm(`确认删除模板 ${row.name}？`)) deleteContractTemplate?.(row.id);
            }}>删除</TextButton>
          )}
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<ContractTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewHistory, setViewHistory] = useState<ContractTemplate | null>(null);
  const [versionHistory, setVersionHistory] = useState<ContractTemplateVersion[]>([]);

  const openAdd = () => {
    const now = new Date();
    const newTemplate: ContractTemplate = {
      id: 'CTPL' + Date.now(),
      name: '',
      category: 'procurement',
      content: '',
      version: 1,
      isDefault: false,
      createTime: now.toISOString().replace('T', ' ').slice(0, 19),
      creator: currentUser.name,
    };
    setIsNew(true);
    setEditItem(newTemplate);
  };

  const handleSave = () => {
    if (!editItem) return;
    if (isNew) {
      addContractTemplate?.(editItem);
    } else {
      updateContractTemplate?.(editItem.id, editItem);
    }
    setEditItem(null);
  };

  const handleDownload = (template: ContractTemplate) => {
    const blob = new Blob([template.content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${template.name}_V${template.version}.txt`;
    link.click();
  };

  const viewVersionHistory = (template: ContractTemplate) => {
    setViewHistory(template);
    // 模拟版本历史
    setVersionHistory([
      {
        id: 'V' + Date.now(),
        templateId: template.id,
        version: template.version,
        content: template.content,
        createTime: template.createTime,
        creator: template.creator,
        changeLog: '初始版本',
      },
    ]);
  };

  const handleUpdate = () => {
    if (!editItem) return;
    const newVersion: ContractTemplate = {
      ...editItem,
      version: editItem.version + 1,
      updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updater: currentUser.name,
    };
    updateContractTemplate?.(editItem.id, newVersion);
    setEditItem(null);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">合同文本模板</h2>
        <PrimaryButton onClick={openAdd}>+ 新增模板</PrimaryButton>
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
            { value: 'exhibition_service', label: '展览服务' },
            { value: 'exhibition_display', label: '展览展示' },
            { value: 'procurement', label: '采购类' },
            { value: 'investment', label: '招商类' },
            { value: 'other', label: '其他' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增合同模板' : '编辑合同模板'}
        onClose={() => setEditItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            {isNew ? (
              <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleUpdate}>更新版本</PrimaryButton>
            )}
          </>
        }
        width="800px"
      >
        {editItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">模板名称</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.name}
                  onChange={(e) => editItem && setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">分类</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.category}
                  onChange={(e) => editItem && setEditItem({ ...editItem, category: e.target.value as ContractCategory })}
                >
                  <option value="exhibition_service">展览服务</option>
                  <option value="exhibition_display">展览展示</option>
                  <option value="procurement">采购类</option>
                  <option value="investment">招商类</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">模板内容</div>
              <textarea
                className="w-full h-64 px-2 border border-[#dcdfe6] rounded font-mono text-sm"
                value={editItem.content}
                onChange={(e) => editItem && setEditItem({ ...editItem, content: e.target.value })}
                placeholder="请输入合同模板内容..."
              />
            </div>
            {!isNew && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-[#606266]">版本号</div>
                  <input
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]"
                    value={`V${editItem.version} -> V${editItem.version + 1}`}
                    disabled
                  />
                </div>
                <div>
                  <div className="mb-1 text-[#606266]">变更说明</div>
                  <input
                    className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                    value={editItem.remark || ''}
                    onChange={(e) => editItem && setEditItem({ ...editItem, remark: e.target.value })}
                    placeholder="简要说明本次修改内容"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 版本历史弹窗 */}
      <Modal
        open={!!viewHistory}
        title="版本历史"
        onClose={() => setViewHistory(null)}
        footer={<DefaultButton onClick={() => setViewHistory(null)}>关闭</DefaultButton>}
        width="700px"
      >
        {viewHistory && (
          <div className="space-y-3">
            <div className="text-sm text-[#909399]">模板：{viewHistory.name}</div>
            <div className="border border-[#dcdfe6] rounded max-h-96 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#f5f7fa]">
                  <tr>
                    <th className="px-3 py-2 text-xs text-left">版本</th>
                    <th className="px-3 py-2 text-xs text-left">变更说明</th>
                    <th className="px-3 py-2 text-xs text-left">更新时间</th>
                    <th className="px-3 py-2 text-xs text-left">操作人</th>
                  </tr>
                </thead>
                <tbody>
                  {versionHistory.map(v => (
                    <tr key={v.id} className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-xs">V{v.version}</td>
                      <td className="px-3 py-2 text-xs">{v.changeLog || '-'}</td>
                      <td className="px-3 py-2 text-xs">{v.createTime}</td>
                      <td className="px-3 py-2 text-xs">{v.creator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}