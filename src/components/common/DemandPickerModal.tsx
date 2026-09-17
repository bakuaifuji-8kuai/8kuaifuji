import { useState, useMemo } from 'react';
import { Search, Check, Filter, RotateCcw } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import type { ProcurementDemand, ProcurementMode, ProcurementDemandType, ProcurementType } from '@/types';

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
  /** 默认过滤状态，默认 confirm_approved（立项审批通过） */
  statusFilter?: string;
}

const MODE_LABEL: Record<ProcurementMode, { label: string; bg: string; text: string }> = {
  meeting: { label: '会议审批', bg: 'bg-blue-50', text: 'text-blue-600' },
  sign_report: { label: '签报审批', bg: 'bg-amber-50', text: 'text-amber-600' },
  application_form: { label: '采购项目申请表', bg: 'bg-green-50', text: 'text-green-600' },
};

const DEMAND_TYPE_LABEL: Record<ProcurementDemandType, string> = {
  material: '物资采购',
  implementation_project: '实施项目',
  service_project: '服务项目',
};

const PROCUREMENT_TYPE_LABEL: Record<ProcurementType, string> = {
  within_framework: '清单内采购',
  outside_framework: '清单外采购',
  new_supplier: '新增供应商目录',
};

/**
 * 采购需求单选弹框：只展示已立项通过(confirm_approved)的需求，支持多维度筛选
 */
export default function DemandPickerModal({
  open,
  onClose,
  demands,
  selectedId,
  onConfirm,
  title = '选择采购需求',
  statusFilter = 'confirm_approved',
}: DemandPickerModalProps) {
  const [keyword, setKeyword] = useState('');
  const [filterDemandType, setFilterDemandType] = useState('');
  const [filterProcurementMode, setFilterProcurementMode] = useState('');
  const [filterProcurementType, setFilterProcurementType] = useState('');
  const [filterBizCategory, setFilterBizCategory] = useState('');
  const [applied, setApplied] = useState({
    demandType: '', procurementMode: '', procurementType: '', bizCategory: '',
  });
  const [tempSelected, setTempSelected] = useState<string | undefined>(selectedId);

  // 弹框打开时重置筛选
  useMemo(() => {
    if (open) {
      setKeyword('');
      setFilterDemandType('');
      setFilterProcurementMode('');
      setFilterProcurementType('');
      setFilterBizCategory('');
      setApplied({ demandType: '', procurementMode: '', procurementType: '', bizCategory: '' });
      setTempSelected(selectedId);
    }
  }, [open, selectedId]);

  const approvedDemands = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return demands
      .filter((d) => d.status === statusFilter)
      .filter((d) => {
        if (applied.demandType && d.demandType !== applied.demandType) return false;
        if (applied.procurementMode && d.procurementMode !== applied.procurementMode) return false;
        if (applied.procurementType && d.procurementType !== applied.procurementType) return false;
        if (applied.bizCategory && d.businessCategory !== applied.bizCategory) return false;
        if (!kw) return true;
        return (
          (d.demandNo || '').toLowerCase().includes(kw) ||
          (d.projectName || '').toLowerCase().includes(kw) ||
          (d.applicant || '').toLowerCase().includes(kw) ||
          (d.procurementMode ? MODE_LABEL[d.procurementMode].label : '').toLowerCase().includes(kw)
        );
      });
  }, [demands, keyword, applied, statusFilter]);

  const handleConfirm = () => {
    if (!tempSelected) {
      onConfirm(null);
      return;
    }
    const found = demands.find((d) => d.id === tempSelected) || null;
    onConfirm(found);
  };

  const handleReset = () => {
    setKeyword('');
    setFilterDemandType('');
    setFilterProcurementMode('');
    setFilterProcurementType('');
    setFilterBizCategory('');
    setApplied({ demandType: '', procurementMode: '', procurementType: '', bizCategory: '' });
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width="max-w-[1080px]"
      footer={
        <>
          <span className="text-xs text-slate-500 mr-auto">
            {statusFilter === 'confirm_approved' ? '已立项审批通过' : statusFilter === 'approved' ? '已需求审批通过' : '已审批'}的需求
            <b className="text-indigo-600 ml-1">{approvedDemands.length}</b> 条
          </span>
          <DefaultButton onClick={onClose}>取消</DefaultButton>
          <PrimaryButton onClick={handleConfirm}>确认选择</PrimaryButton>
        </>
      }
    >
      {/* ============ 筛选区 ============ */}
      <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={12} className="text-indigo-500" />
          <span className="text-xs font-medium text-slate-700">筛选条件</span>
        </div>
        {/* 关键字搜索 */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索需求编号 / 项目名称 / 申请人 / 立项方式"
            className="w-full h-8 pl-8 pr-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {/* 下拉筛选行 */}
        <div className="grid grid-cols-4 gap-2">
          <select
            value={filterDemandType}
            onChange={(e) => setFilterDemandType(e.target.value)}
            className="h-8 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">全部需求类型</option>
            <option value="material">物资采购</option>
            <option value="implementation_project">实施项目</option>
            <option value="service_project">服务项目</option>
          </select>
          <select
            value={filterProcurementMode}
            onChange={(e) => setFilterProcurementMode(e.target.value)}
            className="h-8 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">全部立项方式</option>
            <option value="meeting">会议审批</option>
            <option value="sign_report">签报审批</option>
            <option value="application_form">采购项目申请表</option>
          </select>
          <select
            value={filterProcurementType}
            onChange={(e) => setFilterProcurementType(e.target.value)}
            className="h-8 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">全部清单范围</option>
            <option value="within_framework">清单内采购</option>
            <option value="outside_framework">清单外采购</option>
            <option value="new_supplier">新增供应商目录</option>
          </select>
          <select
            value={filterBizCategory}
            onChange={(e) => setFilterBizCategory(e.target.value)}
            className="h-8 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">全部业务分类</option>
            <option value="engineering">工程类</option>
            <option value="non_engineering">非工程类</option>
          </select>
        </div>
        {/* 筛选按钮 */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 h-7 px-2 text-xs text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
          >
            <RotateCcw size={11} /> 重置
          </button>
          <button
            onClick={() => setApplied({
              demandType: filterDemandType,
              procurementMode: filterProcurementMode,
              procurementType: filterProcurementType,
              bizCategory: filterBizCategory,
            })}
            className="inline-flex items-center gap-1 h-7 px-3 text-xs text-white bg-indigo-500 rounded hover:bg-indigo-600"
          >
            应用筛选
          </button>
        </div>
      </div>

      {/* ============ 表格 ============ */}
      <div className="border border-slate-200 rounded max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="w-10 py-2.5 text-center border-b border-slate-200"></th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">需求编号</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">项目名称</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">需求类型</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">立项方式</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">清单范围</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">业务分类</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">申请人</th>
              <th className="py-2.5 text-left border-b border-slate-200 text-slate-600 text-xs">审批时间</th>
            </tr>
          </thead>
          <tbody>
            {approvedDemands.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                  {(keyword || applied.demandType || applied.procurementMode || applied.procurementType || applied.bizCategory)
                    ? '没有匹配的已立项通过的需求，请调整筛选条件'
                    : '暂无比立项审批通过的采购需求，请先在"招采需求确认管理"完成立项'}
                </td>
              </tr>
            )}
            {approvedDemands.map((d) => {
              const checked = tempSelected === d.id;
              const mode = d.procurementMode ? MODE_LABEL[d.procurementMode] : undefined;
              const dt = DEMAND_TYPE_LABEL[d.demandType];
              const pt = PROCUREMENT_TYPE_LABEL[d.procurementType];
              const biz = d.businessCategory === 'engineering' ? '工程类' : d.businessCategory === 'non_engineering' ? '非工程类' : '-';
              const bizColor = d.businessCategory === 'engineering' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600';
              const ptColor = d.procurementType === 'within_framework' ? 'bg-blue-50 text-blue-600'
                : d.procurementType === 'outside_framework' ? 'bg-violet-50 text-violet-600'
                : 'bg-emerald-50 text-emerald-600';
              const approveTime = (d.confirmApproveTime || d.approveTime || '').split(' ')[0] || '-';
              return (
                <tr
                  key={d.id}
                  onClick={() => setTempSelected(d.id)}
                  className={`border-t border-slate-100 cursor-pointer hover:bg-indigo-50/40 transition-colors ${
                    checked ? 'bg-indigo-50/70' : ''
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
                  <td className="py-2 text-slate-800 font-medium text-xs">{d.projectName || '-'}</td>
                  <td className="py-2">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">{dt}</span>
                  </td>
                  <td className="py-2">
                    {mode ? (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${mode.bg} ${mode.text}`}>
                        {mode.label}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${ptColor}`}>{pt}</span>
                  </td>
                  <td className="py-2">
                    {d.businessCategory ? (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${bizColor}`}>{biz}</span>
                    ) : '-'}
                  </td>
                  <td className="py-2 text-slate-700 text-xs">{d.applicant || '-'}</td>
                  <td className="py-2 text-slate-500 text-xs">{approveTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
