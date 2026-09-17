import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import type { Supplier } from '@/types';

interface SupplierPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** 全部供应商（外部传入，组件内只过滤 enabled 的） */
  suppliers: Supplier[];
  /** 已经选中的供应商 id 列表 */
  selectedIds: string[];
  /** 确认选择，返回选中的 id 列表 */
  onConfirm: (ids: string[]) => void;
  /** 弹框标题 */
  title?: string;
}

/**
 * 供应商多选弹框：只展示 status=enabled 的，支持关键字搜索，表格列表，勾选多选
 */
export default function SupplierPickerModal({
  open,
  onClose,
  suppliers,
  selectedIds,
  onConfirm,
  title = '选择受邀供应商',
}: SupplierPickerModalProps) {
  const [keyword, setKeyword] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

  // 每次 open 时重置勾选
  useMemo(() => {
    if (open) {
      setKeyword('');
      setTempSelected(selectedIds);
    }
  }, [open, selectedIds]);

  const enabledSuppliers = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return suppliers
      .filter((s) => s.status === 'enabled')
      .filter((s) => {
        if (!kw) return true;
        return (
          s.name.toLowerCase().includes(kw) ||
          (s.contact || '').toLowerCase().includes(kw) ||
          (s.phone || '').toLowerCase().includes(kw) ||
          (s.code || '').toLowerCase().includes(kw)
        );
      });
  }, [suppliers, keyword]);

  const toggle = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
  };

  const allIds = enabledSuppliers.map((s) => s.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => tempSelected.includes(id));

  const handleToggleAll = () => {
    if (allSelected) {
      setTempSelected((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setTempSelected((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width="max-w-[880px]"
      footer={
        <>
          <span className="text-xs text-slate-500 mr-auto">
            已选 <b className="text-indigo-600">{tempSelected.length}</b> 家供应商
            <span className="ml-3">共 {suppliers.filter((s) => s.status === 'enabled').length} 家启用的供应商</span>
          </span>
          <DefaultButton onClick={onClose}>取消</DefaultButton>
          <PrimaryButton onClick={handleConfirm}>确认选择（{tempSelected.length}）</PrimaryButton>
        </>
      }
    >
      {/* 搜索 */}
      <div className="mb-3 relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索供应商名称 / 联系人 / 电话 / 编码"
          className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] rounded text-xs focus:outline-none focus:border-[#2f54eb]"
        />
      </div>

      {/* 表格 */}
      <div className="border border-[#ebeef5] rounded max-h-[440px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f7fa] sticky top-0 z-10">
            <tr>
              <th className="w-10 py-2.5 text-center border-b border-[#ebeef5]">
                <input
                  type="checkbox"
                  className="rounded accent-indigo-500"
                  checked={allSelected}
                  onChange={handleToggleAll}
                />
              </th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">供应商编码</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">供应商名称</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">联系人</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">联系电话</th>
                  <th className="py-2.5 text-center border-b border-[#ebeef5] text-slate-600">状态</th>
            </tr>
          </thead>
          <tbody>
            {enabledSuppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  {keyword ? '没有匹配的供应商' : '没有启用的供应商'}
                </td>
              </tr>
            )}
            {enabledSuppliers.map((s) => {
              const checked = tempSelected.includes(s.id);
              return (
                <tr
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`border-t border-[#ebeef5] cursor-pointer hover:bg-indigo-50/40 ${
                    checked ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      className="rounded accent-indigo-500"
                      checked={checked}
                      onChange={() => toggle(s.id)}
                    />
                  </td>
                  <td className="py-2 font-mono text-xs text-slate-600">{s.code}</td>
                  <td className="py-2 text-slate-800 font-medium">{s.name}</td>
                  <td className="py-2 text-slate-700">{s.contact || '-'}</td>
                  <td className="py-2 text-slate-600">{s.phone || '-'}</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600">
                      启用
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
