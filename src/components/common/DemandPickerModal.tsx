import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import type { ProcurementDemand, ProcurementMode } from '@/types';

interface DemandPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** 全部采购需求 */
  demands: ProcurementDemand[];
  /** 已选中的需求 id（单选） */
  selectedId?: string;
  /** 确认选择，返回选中的完整 demand 对象；未选中返回 null */
  onConfirm: (demand: ProcurementDemand | null) => void;
  /** 弹框标题 */
  title?: string;
}

const MODE_LABEL: Record<ProcurementMode, { label: string; bg: string; text: string }> = {
  meeting: { label: '会议审批', bg: 'bg-[#ecf5ff]', text: 'text-[#409eff]' },
  sign_report: { label: '签报审批', bg: 'bg-[#fdf6ec]', text: 'text-[#e6a23c]' },
  application_form: { label: '采购项目申请表', bg: 'bg-[#f0f9eb]', text: 'text-[#67c23a]' },
};

/**
 * 采购需求单选弹框：只展示 status=approved 的，支持关键字搜索
 */
export default function DemandPickerModal({
  open,
  onClose,
  demands,
  selectedId,
  onConfirm,
  title = '选择采购需求',
}: DemandPickerModalProps) {
  const [keyword, setKeyword] = useState('');
  const [tempSelected, setTempSelected] = useState<string | undefined>(selectedId);

  useMemo(() => {
    if (open) {
      setKeyword('');
      setTempSelected(selectedId);
    }
  }, [open, selectedId]);

  const approvedDemands = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return demands
      .filter((d) => d.status === 'approved' || d.status === 'changed')
      .filter((d) => {
        if (!kw) return true;
        return (
          (d.demandNo || '').toLowerCase().includes(kw) ||
          (d.projectName || '').toLowerCase().includes(kw) ||
          (d.businessCategory || '').toLowerCase().includes(kw)
        );
      });
  }, [demands, keyword]);

  const handleConfirm = () => {
    if (!tempSelected) {
      onConfirm(null);
      return;
    }
    const found = demands.find((d) => d.id === tempSelected) || null;
    onConfirm(found);
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
            已审核通过的需求 <b className="text-indigo-600">{approvedDemands.length}</b> 条
          </span>
          <DefaultButton onClick={onClose}>取消</DefaultButton>
          <PrimaryButton onClick={handleConfirm}>确认选择</PrimaryButton>
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
          placeholder="搜索需求编号 / 项目名称 / 业务类型"
          className="w-full h-8 pl-8 pr-2 border border-[#dcdfe6] rounded text-xs focus:outline-none focus:border-[#2f54eb]"
        />
      </div>

      {/* 表格 */}
      <div className="border border-[#ebeef5] rounded max-h-[440px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f7fa] sticky top-0 z-10">
            <tr>
              <th className="w-10 py-2.5 text-center border-b border-[#ebeef5]"></th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">需求编号</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">项目名称</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">业务类型</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">立项方式</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">需求类型</th>
              <th className="py-2.5 text-left border-b border-[#ebeef5] text-slate-600">提交时间</th>
            </tr>
          </thead>
          <tbody>
            {approvedDemands.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  {keyword ? '没有匹配的已审核通过的需求' : '暂无已审核通过的采购需求'}
                </td>
              </tr>
            )}
            {approvedDemands.map((d) => {
              const checked = tempSelected === d.id;
              const mode = d.procurementMode ? MODE_LABEL[d.procurementMode] : undefined;
              const biz = d.businessCategory && d.subType
                ? `${d.businessCategory === 'engineering' ? '工程类' : '非工程类'} / ${
                    d.subType === 'construction' ? '施工' :
                    d.subType === 'service' ? '服务' : '货物'
                  }`
                : '-';
              const dt = d.demandType === 'material' ? '物资采购' :
                         d.demandType === 'service_project' ? '服务项目' :
                         d.demandType === 'implementation_project' ? '实施项目' : '-';
              return (
                <tr
                  key={d.id}
                  onClick={() => setTempSelected(d.id)}
                  className={`border-t border-[#ebeef5] cursor-pointer hover:bg-indigo-50/40 ${
                    checked ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <td className="py-2 text-center">
                    {checked ? (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500">
                        <Check size={10} className="text-white" />
                      </span>
                    ) : (
                      <span className="inline-block w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </td>
                  <td className="py-2 font-mono text-xs text-indigo-600">{d.demandNo}</td>
                  <td className="py-2 text-slate-800 font-medium">{d.projectName || '-'}</td>
                  <td className="py-2 text-slate-700 text-xs">{biz}</td>
                  <td className="py-2">
                    {mode ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${mode.bg} ${mode.text}`}>
                        {mode.label}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 text-xs text-slate-600">{dt}</td>
                  <td className="py-2 text-xs text-slate-500">
                    {(d.approveTime || d.applyDate || d.createTime || '').split(' ')[0] || '-'}
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
