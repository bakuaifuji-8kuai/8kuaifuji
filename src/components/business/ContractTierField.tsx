/**
 * 合同层级字段组（主合同 / 补充协议 切换）
 *
 * 放在 ContractProcurementPage 和 ContractNonProcurementPage 的"基本信息"区块最前面。
 * - 选主合同：隐藏关联主合同 / 补充金额字段
 * - 选补充协议：关联主合同下拉 + 补充金额（可正可负）+ 补充序号 必填
 *
 * props 全部回调式：调用方管 state，本组件只负责渲染和事件分发。
 */
import React from 'react';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';

type SupplementType = 'price_change' | 'date_change' | 'scope_change' | 'other';

interface Props {
  tier: 'primary' | 'supplement';
  onChangeTier: (tier: 'primary' | 'supplement') => void;

  contractNature: 'procurement' | 'non_procurement';

  primaryOptions: Array<{ value: string; label: string }>;
  parentContractId?: string;
  onChangeParent: (id: string) => void;

  supplementAmount?: number;
  onChangeSupplementAmount: (v: number) => void;
  supplementType?: string;
  onChangeSupplementType: (v: SupplementType) => void;
  supplementIndex?: number;
  onChangeSupplementIndex: (v: number) => void;

  disabled?: boolean;
}

const SUPPLEMENT_TYPE_OPTIONS = [
  { value: 'price_change', label: '💰 价格变更（加钱/减钱）' },
  { value: 'date_change', label: '📅 期限变更（延期/提前终止）' },
  { value: 'scope_change', label: '📦 范围变更（增删服务内容）' },
  { value: 'other', label: '📝 其他' },
];

const ContractTierField: React.FC<Props> = ({
  tier, onChangeTier,
  contractNature,
  primaryOptions, parentContractId, onChangeParent,
  supplementAmount, onChangeSupplementAmount,
  supplementType, onChangeSupplementType,
  supplementIndex, onChangeSupplementIndex,
  disabled,
}) => {
  const isSupplement = tier === 'supplement';

  return (
    <div className="col-span-2 space-y-4 rounded-xl border border-slate-200 bg-indigo-50/40 p-4">
      {/* 标题行 + 层级 Radio */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">
          合同层级
          <span className="ml-1 text-rose-500">*</span>
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChangeTier('primary')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              !isSupplement
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-300 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            🏢 主合同
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChangeTier('supplement')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isSupplement
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-300 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            📎 补充协议
          </button>
        </div>
      </div>

      {/* 补充协议专属字段 */}
      {isSupplement && (
        <div className="grid grid-cols-2 gap-4 border-t border-indigo-200 pt-4">
          {/* 关联主合同 */}
          <Select
            label="关联主合同 *"
            required
            options={primaryOptions}
            value={parentContractId || ''}
            onChange={(e) => onChangeParent(e.target.value)}
            placeholder={`请选择一份${contractNature === 'procurement' ? '招采类' : '非招采类'}主合同`}
          />

          {/* 补充类型 */}
          <Select
            label="补充类型 *"
            required
            options={SUPPLEMENT_TYPE_OPTIONS}
            value={supplementType || 'price_change'}
            onChange={(e) => onChangeSupplementType(e.target.value as SupplementType)}
            placeholder="选择补充协议的变更性质"
          />

          {/* 补充金额（可正可负） */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              补充金额（可正可负）
              <span className="ml-1 text-rose-500">*</span>
              <span className="ml-2 text-xs font-normal text-slate-400">
                正数=加钱 / 负数=减钱
              </span>
            </label>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => onChangeSupplementAmount(-Math.abs(supplementAmount || 0))}
                className="w-10 rounded-lg border border-slate-300 bg-white text-red-500 hover:bg-red-50 transition-colors"
                title="切换为负数（减钱）"
              >
                −
              </button>
              <Input
                type="number"
                value={supplementAmount ?? ''}
                onChange={(e) => onChangeSupplementAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="如 +2000000 或 -500000"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => onChangeSupplementAmount(Math.abs(supplementAmount || 0))}
                className="w-10 rounded-lg border border-slate-300 bg-white text-green-500 hover:bg-green-50 transition-colors"
                title="切换为正数（加钱）"
              >
                +
              </button>
              <span className="flex items-center text-sm text-slate-400">元</span>
            </div>
          </div>

          {/* 补充序号 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              补充序号 *
              <span className="ml-2 text-xs font-normal text-slate-400">
                自动：同主合同下已有补充数 +1
              </span>
            </label>
            <Input
              type="number"
              min={1}
              value={supplementIndex ?? 1}
              onChange={(e) => onChangeSupplementIndex(Number(e.target.value) || 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTierField;
