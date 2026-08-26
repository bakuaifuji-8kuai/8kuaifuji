import { useState } from 'react';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { getCategoryLabel } from '@/constants/contractCategories';
import type { ContractText, ContractCategory, TextSupplement } from '@/types';

interface Props {
  isNew: boolean;
  type: 'model' | 'non_model';
  initialData: ContractText | null;
  onSave: (data: {
    name: string;
    category: ContractCategory;
    content: string;
    type: 'model' | 'non_model';
    supplements?: TextSupplement[];
    remark?: string;
  }) => void;
  onCancel: () => void;
}

export function ContractTextEditor({ isNew, type, initialData, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<ContractCategory>(
    initialData?.category || 'exhibition_service'
  );
  const [content, setContent] = useState(initialData?.content || '');
  const [remark, setRemark] = useState(initialData?.remark || '');
  const [supplements, setSupplements] = useState<TextSupplement[]>(
    initialData?.supplements || []
  );

  const [supplementTitle, setSupplementTitle] = useState('');
  const [supplementContent, setSupplementContent] = useState('');
  const [editingSupplementId, setEditingSupplementId] = useState<string | null>(null);

  const handleAddSupplement = () => {
    if (!supplementTitle.trim()) {
      alert('请输入条款标题');
      return;
    }
    if (editingSupplementId) {
      setSupplements((prev) =>
        prev.map((s) =>
          s.id === editingSupplementId
            ? { ...s, title: supplementTitle, content: supplementContent }
            : s
        )
      );
      setEditingSupplementId(null);
    } else {
      const newSupplement: TextSupplement = {
        id: 'SUP' + Date.now(),
        title: supplementTitle,
        content: supplementContent,
        sort: supplements.length,
      };
      setSupplements([...supplements, newSupplement]);
    }
    setSupplementTitle('');
    setSupplementContent('');
  };

  const handleEditSupplement = (s: TextSupplement) => {
    setEditingSupplementId(s.id);
    setSupplementTitle(s.title);
    setSupplementContent(s.content);
  };

  const handleDeleteSupplement = (id: string) => {
    if (confirm('确认删除此补充条款？')) {
      setSupplements(supplements.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('请输入文本名称');
      return;
    }
    onSave({
      name,
      category,
      content,
      type,
      supplements,
      remark,
    });
  };

  return (
    <div className="p-4 max-h-[70vh] overflow-auto">
      {/* 基础信息 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#303133] mb-3">基础信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#606266] mb-1">
              <span className="text-red-500">*</span> 文本名称
            </label>
            <input
              className="w-full h-9 px-3 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff]"
              placeholder="请输入文本名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#606266] mb-1">
              <span className="text-red-500">*</span> 合同分类
            </label>
            <select
              className="w-full h-9 px-3 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff]"
              value={category}
              onChange={(e) => setCategory(e.target.value as ContractCategory)}
            >
              <option value="exhibition_service">展览服务</option>
              <option value="exhibition_display_service">展览展示服务</option>
              <option value="procurement">招采合同</option>
              <option value="investment">招商合同</option>
              <option value="other">其他类合同</option>
            </select>
          </div>
        </div>
      </div>

      {/* 文本内容 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#303133] mb-2">文本内容</h3>
        <textarea
          className="w-full h-64 px-3 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff] font-mono"
          placeholder="请输入合同文本内容..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="text-xs text-[#909399] mt-1">
          支持纯文本编辑，可复制粘贴格式化内容
        </div>
      </div>

      {/* 非示范文本：补充条款 */}
      {type === 'non_model' && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-[#303133] mb-2">
            补充条款（细则/清单）
          </h3>
          
          {/* 条款列表 */}
          {supplements.length > 0 && (
            <div className="mb-3 space-y-2">
              {supplements.map((s, idx) => (
                <div key={s.id} className="border border-[#ebeef5] rounded p-3 bg-[#fafbfc]">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs text-[#909399] mr-2">
                      第{idx + 1}条
                    </span>
                    <span className="text-sm font-medium text-[#303133]">{s.title}</span>
                    <div className="flex gap-1">
                      <button
                        className="text-xs text-[#409eff] hover:underline"
                        onClick={() => handleEditSupplement(s)}
                      >
                        编辑
                      </button>
                      <button
                        className="text-xs text-[#f56c6c] hover:underline"
                        onClick={() => handleDeleteSupplement(s.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-[#606266] whitespace-pre-wrap">
                    {s.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 添加/编辑条款表单 */}
          <div className="border border-dashed border-[#dcdfe6] rounded p-3 bg-white">
            <div className="text-xs text-[#606266] mb-2">
              {editingSupplementId ? '编辑条款' : '添加补充条款'}
            </div>
            <input
              className="w-full h-8 px-2 mb-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff]"
              placeholder="条款标题（如：补充细则、附件清单等）"
              value={supplementTitle}
              onChange={(e) => setSupplementTitle(e.target.value)}
            />
            <textarea
              className="w-full h-24 px-2 py-1 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff] mb-2"
              placeholder="条款内容"
              value={supplementContent}
              onChange={(e) => setSupplementContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              {editingSupplementId && (
                <button
                  className="text-xs text-[#909399] hover:underline"
                  onClick={() => {
                    setEditingSupplementId(null);
                    setSupplementTitle('');
                    setSupplementContent('');
                  }}
                >
                  取消编辑
                </button>
              )}
              <PrimaryButton onClick={handleAddSupplement}>
                {editingSupplementId ? '保存条款' : '+ 添加条款'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* 备注 */}
      <div className="mb-4">
        <label className="block text-xs text-[#606266] mb-1">备注</label>
        <textarea
          className="w-full h-20 px-3 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff]"
          placeholder="请输入备注说明..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2 pt-3 border-t border-[#ebeef5]">
        <DefaultButton onClick={onCancel}>取消</DefaultButton>
        <PrimaryButton onClick={handleSubmit}>
          {isNew ? '创建文本' : '保存版本'}
        </PrimaryButton>
      </div>
    </div>
  );
}
