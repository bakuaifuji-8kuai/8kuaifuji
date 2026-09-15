import { useState, useMemo } from 'react';
import { Check, AlertTriangle, XCircle, FileSpreadsheet } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import type { RowResult } from '@/utils/excelImport';

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  /** 解析后的预览数据 */
  results: RowResult[];
  /** 点击确认导入，传入所有通过校验的（非 error）且被勾选的行 */
  onConfirm: (rows: RowResult[]) => void;
}

export default function ImportPreviewModal({ open, onClose, results, onConfirm }: ImportPreviewModalProps) {
  // 默认勾选所有非 error 行
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 每次 open 时重置勾选
  useMemo(() => {
    if (open) {
      const initial = results
        .filter((r) => r.status !== 'error')
        .map((r) => String(r.rowIndex));
      setSelectedKeys(initial);
    }
  }, [open, results]);

  const stats = useMemo(() => {
    let success = 0, warning = 0, error = 0;
    results.forEach((r) => {
      if (r.status === 'success') success++;
      else if (r.status === 'warning') warning++;
      else error++;
    });
    return { success, warning, error, total: results.length };
  }, [results]);

  const handleToggleRow = (key: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleToggleAll = () => {
    const validKeys = results.filter((r) => r.status !== 'error').map((r) => String(r.rowIndex));
    if (selectedKeys.length === validKeys.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(validKeys);
    }
  };

  const handleConfirm = () => {
    const rows = results.filter(
      (r) => r.status !== 'error' && selectedKeys.includes(String(r.rowIndex)),
    );
    onConfirm(rows);
  };

  const validKeyCount = results.filter((r) => r.status !== 'error').length;

  return (
    <Modal
      open={open}
      title="导入预览"
      onClose={onClose}
      width="max-w-[1100px]"
      footer={
        <>
          <DefaultButton onClick={onClose}>取消</DefaultButton>
          <PrimaryButton onClick={handleConfirm} disabled={selectedKeys.length === 0}>
            确认导入（{selectedKeys.length} 条）
          </PrimaryButton>
        </>
      }
    >
      {/* 统计栏 */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <FileSpreadsheet size={16} className="text-slate-600" />
          <span className="text-slate-700">共 <b>{stats.total}</b> 行</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-emerald-600">
          <Check size={14} />
          <span>通过 {stats.success}</span>
        </div>
        {stats.warning > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-amber-600">
            <AlertTriangle size={14} />
            <span>警告 {stats.warning}</span>
          </div>
        )}
        {stats.error > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-red-600">
            <XCircle size={14} />
            <span>错误 {stats.error}（不可导入）</span>
          </div>
        )}
        {stats.error === 0 && (
          <span className="ml-auto text-xs text-slate-500">
            ✅ 全部通过校验，可勾选导入
          </span>
        )}
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
                  checked={validKeyCount > 0 && selectedKeys.length === validKeyCount}
                  onChange={handleToggleAll}
                  disabled={validKeyCount === 0}
                />
              </th>
              <th className="w-14 py-2.5 text-left border-b border-[#ebeef5] text-slate-600">行号</th>
              <th className="w-10 py-2.5 text-center border-b border-[#ebeef5] text-slate-600">状态</th>
              <th className="w-32 py-2.5 text-left border-b border-[#ebeef5] text-slate-600">商品编码</th>
              <th className="w-28 py-2.5 text-left border-b border-[#ebeef5] text-slate-600">商品名称</th>
              <th className="w-16 py-2.5 text-right border-b border-[#ebeef5] text-slate-600">数量</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">提示信息</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const key = String(r.rowIndex);
              const isError = r.status === 'error';
              const isChecked = selectedKeys.includes(key);
              const rowBg = isError
                ? 'bg-red-50/50'
                : r.status === 'warning'
                ? 'bg-amber-50/50'
                : '';
              return (
                <tr key={key} className={`border-t border-[#ebeef5] hover:bg-slate-50/50 ${rowBg}`}>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      className="rounded accent-indigo-500"
                      checked={isChecked}
                      onChange={() => handleToggleRow(key, isError)}
                      disabled={isError}
                    />
                  </td>
                  <td className="py-2 text-slate-500">{r.rowIndex}</td>
                  <td className="py-2 text-center">
                    {isError ? (
                      <XCircle size={16} className="inline text-red-500" />
                    ) : r.status === 'warning' ? (
                      <AlertTriangle size={16} className="inline text-amber-500" />
                    ) : (
                      <Check size={16} className="inline text-emerald-500" />
                    )}
                  </td>
                  <td className="py-2 text-slate-700 font-mono text-xs">{r.detail?.productCode || '-'}</td>
                  <td className="py-2 text-slate-700">{r.detail?.productName || '-'}</td>
                  <td className="py-2 text-right text-slate-700">{r.detail?.quantity ?? '-'}</td>
                  <td className="py-2 text-xs">
                    {r.errors.length > 0 && (
                      <div className="text-red-600 space-y-0.5">
                        {r.errors.map((e, i) => (
                          <div key={i}>❌ {e}</div>
                        ))}
                      </div>
                    )}
                    {r.warnings.length > 0 && (
                      <div className="text-amber-600 space-y-0.5">
                        {r.warnings.map((w, i) => (
                          <div key={i}>⚠️ {w}</div>
                        ))}
                      </div>
                    )}
                    {r.errors.length === 0 && r.warnings.length === 0 && (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 底部提示 */}
      <div className="mt-3 text-xs text-slate-500 flex items-center gap-4">
        <span>💡 勾选后点"确认导入"，数据将回填到明细表格</span>
        {stats.error > 0 && (
          <span className="text-red-500">错误行已自动禁止勾选</span>
        )}
      </div>
    </Modal>
  );
}
