import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { History, ArrowRight, RefreshCw } from 'lucide-react';
import type { ContractText, ContractTextVersion } from '@/types';

interface Props {
  text: ContractText;
  onClose: () => void;
}

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
}

export function ContractTextVersionCompare({ text, onClose }: Props) {
  const getContractTextVersions = useStore((s) => s.getContractTextVersions);
  const addContractTextVersion = useStore((s) => s.addContractTextVersion);
  const updateContractText = useStore((s) => s.updateContractText);
  const currentUser = useStore((s) => s.currentUser);

  const [versions, setVersions] = useState<ContractTextVersion[]>([]);
  const [oldVersion, setOldVersion] = useState<number | null>(null);
  const [newVersion, setNewVersion] = useState<number | null>(null);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const hist = getContractTextVersions(text.id);
    setVersions([
      ...hist,
      {
        id: 'current',
        textId: text.id,
        version: text.version,
        content: text.content,
        structure: text.structure,
        supplements: text.supplements,
        changeLog: '当前版本',
        createTime: text.updateTime || text.createTime,
        creator: text.updater || text.creator,
      } as any,
    ]);
  }, [text.id, text.version]);

  const computeDiff = (oldContent: string, newContent: string): DiffLine[] => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const result: DiffLine[] = [];

    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      if (oldLine === newLine) {
        if (oldLine.trim()) {
          result.push({ type: 'unchanged', content: oldLine });
        }
      } else {
        if (oldLine.trim()) {
          result.push({ type: 'removed', content: oldLine });
        }
        if (newLine.trim()) {
          result.push({ type: 'added', content: newLine });
        }
      }
    }
    return result;
  };

  const handleCompare = () => {
    if (oldVersion === null || newVersion === null) {
      alert('请选择要对比的两个版本');
      return;
    }
    if (oldVersion === newVersion) {
      alert('请选择不同的版本进行对比');
      return;
    }
    setComparing(true);
    const oldVer = versions.find((v) => v.version === oldVersion);
    const newVer = versions.find((v) => v.version === newVersion);
    if (oldVer && newVer) {
      const lines = computeDiff(oldVer.content, newVer.content);
      setDiffLines(lines);
    }
  };

  const handleRollback = (targetVersion: number) => {
    if (!confirm(`确认回滚到版本 v${targetVersion}？回滚后将创建新版本记录。`)) return;
    const targetVer = versions.find((v) => v.version === targetVersion);
    if (!targetVer) return;
    
    const newVersionNum = text.version + 1;
    updateContractText(text.id, {
      content: targetVer.content,
      version: newVersionNum,
      updater: currentUser.name,
      updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    addContractTextVersion({
      id: 'CTV' + Date.now(),
      textId: text.id,
      version: newVersionNum,
      content: targetVer.content,
      supplements: targetVer.supplements || [],
      changeLog: `回滚到 v${targetVersion}`,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      creator: currentUser.name,
    });
    alert(`已回滚到 v${targetVersion}，新版本为 v${newVersionNum}`);
    onClose();
  };

  const getStats = () => {
    const added = diffLines.filter((l) => l.type === 'added').length;
    const removed = diffLines.filter((l) => l.type === 'removed').length;
    return { added, removed };
  };

  return (
    <div className="p-4">
      {/* 版本选择 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-[#303133] mb-2 flex items-center gap-2">
          <History size={16} />
          选择版本进行对比
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <label className="text-xs text-[#606266]">旧版本:</label>
            <select
              className="h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              value={oldVersion ?? ''}
              onChange={(e) => setOldVersion(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">请选择</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version}>
                  v{v.version} - {v.createTime.slice(0, 10)}
                </option>
              ))}
            </select>
          </div>
          <ArrowRight size={16} className="text-[#909399]" />
          <div className="flex items-center gap-1">
            <label className="text-xs text-[#606266]">新版本:</label>
            <select
              className="h-8 px-2 border border-[#dcdfe6] rounded text-sm"
              value={newVersion ?? ''}
              onChange={(e) => setNewVersion(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">请选择</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version}>
                  v{v.version} - {v.createTime.slice(0, 10)}
                </option>
              ))}
            </select>
          </div>
          <button
            className="h-8 px-3 bg-[#409eff] text-white text-sm rounded hover:bg-[#66b1ff] transition-colors"
            onClick={handleCompare}
          >
            对比
          </button>
        </div>
      </div>

      {/* 版本历史时间线 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-[#303133] mb-2">版本历史</div>
        <div className="border border-[#ebeef5] rounded p-3 max-h-48 overflow-auto">
          {versions.length === 0 ? (
            <div className="text-xs text-[#909399] text-center py-4">暂无历史版本</div>
          ) : (
            <div className="space-y-2">
              {versions.map((v, idx) => (
                <div key={v.id} className="flex items-center gap-3 text-xs">
                  <span className="w-20 text-[#606266]">v{v.version}</span>
                  <span className="w-32 text-[#909399]">{v.createTime}</span>
                  <span className="flex-1 text-[#606266]">{v.changeLog}</span>
                  <span className="w-20 text-[#909399]">{v.creator}</span>
                  {idx < versions.length - 1 && (
                    <button
                      className="text-[#409eff] hover:underline flex items-center gap-1"
                      onClick={() => handleRollback(v.version)}
                    >
                      <RefreshCw size={12} />回滚
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 对比结果 */}
      {comparing && diffLines.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-2 text-xs">
            <span className="text-[#606266]">变更摘要:</span>
            <span className="text-green-600">+{getStats().added} 行新增</span>
            <span className="text-red-600">-{getStats().removed} 行删除</span>
          </div>
          <div className="border border-[#ebeef5] rounded overflow-auto max-h-96">
            <table className="w-full text-xs font-mono">
              <tbody>
                {diffLines.map((line, idx) => (
                  <tr
                    key={idx}
                    className={
                      line.type === 'added'
                        ? 'bg-green-50'
                        : line.type === 'removed'
                        ? 'bg-red-50'
                        : ''
                    }
                  >
                    <td className="w-6 px-2 py-0.5 text-center border-r border-[#ebeef5]">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </td>
                    <td
                      className={`px-2 py-0.5 whitespace-pre-wrap ${
                        line.type === 'added'
                          ? 'text-green-700'
                          : line.type === 'removed'
                          ? 'text-red-700 line-through'
                          : 'text-[#606266]'
                      }`}
                    >
                      {line.content || '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-end pt-3 border-t border-[#ebeef5]">
        <button
          className="h-9 px-4 bg-[#f5f7fa] text-[#606266] rounded text-sm hover:bg-[#ebeef5] transition-colors"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
}
