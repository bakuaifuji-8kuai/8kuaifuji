import { useState, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';

interface TimePickerModalProps {
  open: boolean;
  onClose: () => void;
  /** 当前工单编号 + 名称（用于标题显示） */
  biddingLabel?: string;
  /** 当前已有开始/结束时间 */
  initialStart?: string;
  initialEnd?: string;
  /** 确认设置 */
  onConfirm: (startTime: string, endTime: string) => void;
}

/**
 * 招标时间设置弹框：开始/结束 datetime-local + 开始<结束校验
 */
export default function TimePickerModal({
  open,
  onClose,
  biddingLabel,
  initialStart,
  initialEnd,
  onConfirm,
}: TimePickerModalProps) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useMemo(() => {
    if (open) {
      setStart(initialStart ? initialStart.replace(' ', 'T').slice(0, 16) : '');
      setEnd(initialEnd ? initialEnd.replace(' ', 'T').slice(0, 16) : '');
    }
  }, [open, initialStart, initialEnd]);

  const error = useMemo(() => {
    if (!start) return '请选择招标开始时间';
    if (!end) return '请选择招标截止时间';
    if (start >= end) return '招标开始时间必须早于截止时间';
    return '';
  }, [start, end]);

  const handleConfirm = () => {
    if (error) return;
    onConfirm(start.replace('T', ' ') + ':00', end.replace('T', ' ') + ':00');
  };

  return (
    <Modal
      open={open}
      title={`${initialStart ? '修改' : '设置'}招标时间${biddingLabel ? ' — ' + biddingLabel : ''}`}
      onClose={onClose}
      width="480px"
      footer={
        <>
          <DefaultButton onClick={onClose}>取消</DefaultButton>
          <PrimaryButton onClick={handleConfirm} disabled={!!error}>确认设置</PrimaryButton>
        </>
      }
    >
      <div className="py-2 space-y-4">
        <div className="text-xs text-slate-500 bg-slate-50 rounded p-2">
          💡 招标时间设置后，在招标截止时间之前都可以修改。截止后将自动冻结，无法再编辑。
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-xs text-slate-600">
              招标开始时间 <span className="text-[#f56c6c]">*</span>
            </div>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full h-9 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff]"
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-600">
              招标截止时间 <span className="text-[#f56c6c]">*</span>
            </div>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full h-9 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#409eff]"
            />
          </div>
        </div>
        {error && (
          <div className="text-xs text-[#f56c6c] bg-[#fef0f0] border border-[#fde2e2] rounded p-2">
            ⚠️ {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
