import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { BarChart3, Download, FileText, Building2, Calendar, Package } from 'lucide-react';
import type { ProcurementPlan, ProcurementPlanDetail } from '@/types';

type GroupBy = 'department' | 'category' | 'period';

export default function ProcurementPlanSummaryPage() {
  const procurementPlans = useStore((s) => s.procurementPlans);

  // 筛选条件
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('department');
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');

  // 收集所有部门
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    procurementPlans.forEach((p) => p.department && set.add(p.department));
    return Array.from(set);
  }, [procurementPlans]);

  // 应用筛选后的计划
  const filteredPlans = useMemo(() => {
    return procurementPlans.filter((p) => {
      if (filterYear && p.year !== filterYear) return false;
      if (filterMonth && p.month !== filterMonth) return false;
      if (filterType && p.planType !== filterType) return false;
      if (filterMode && (p.planMode || 'approval') !== filterMode) return false;
      if (filterDepartment && p.department !== filterDepartment) return false;
      return true;
    });
  }, [procurementPlans, filterYear, filterMonth, filterType, filterMode, filterDepartment]);

  // 汇总统计数据
  const summary = useMemo(() => {
    const allDetails: (ProcurementPlanDetail & { _planNo: string; _department: string; _planType: string; _planMode: string; _year: string; _month: string })[] = [];
    filteredPlans.forEach((p) => {
      p.details.forEach((d) => {
        allDetails.push({
          ...d,
          _planNo: p.planNo,
          _department: p.department,
          _planType: p.planType,
          _planMode: p.planMode || 'approval',
          _year: p.year,
          _month: p.month || '',
        });
      });
    });

    const totalBudget = filteredPlans.reduce((sum, p) => sum + p.details.reduce((s, d) => s + d.budgetAmount, 0), 0);
    const totalCount = allDetails.length;
    const categoryStats: Record<string, { count: number; budget: number }> = {};
    allDetails.forEach((d) => {
      const category = d.projectNature || '未分类';
      if (!categoryStats[category]) categoryStats[category] = { count: 0, budget: 0 };
      categoryStats[category].count++;
      categoryStats[category].budget += d.budgetAmount;
    });

    return {
      planCount: filteredPlans.length,
      detailCount: totalCount,
      totalBudget,
      categoryStats,
      allDetails,
    };
  }, [filteredPlans]);

  // 按维度分组
  const groupedData = useMemo(() => {
    const groups: Record<string, {
      key: string;
      label: string;
      planCount: number;
      detailCount: number;
      totalBudget: number;
      categories: Record<string, number>;
      details: typeof summary.allDetails;
    }> = {};

    summary.allDetails.forEach((d) => {
      let key = '';
      let label = '';
      if (groupBy === 'department') {
        key = d._department;
        label = d._department || '未指定部门';
      } else if (groupBy === 'category') {
        key = d.projectNature || '未分类';
        label = key;
      } else if (groupBy === 'period') {
        if (d._planMode === 'filing') {
          key = `${d._year}-filing`;
          label = `${d._year}年 · 报备制`;
        } else {
          key = d._planType === 'annual' ? `${d._year}年-approval` : `${d._year}-${d._month}-approval`;
          label = d._planType === 'annual' ? `${d._year}年度计划` : `${d._year}年${d._month}月`;
        }
      }
      if (!groups[key]) {
        groups[key] = {
          key,
          label,
          planCount: 0,
          detailCount: 0,
          totalBudget: 0,
          categories: {},
          details: [],
        };
      }
      const g = groups[key];
      g.detailCount++;
      g.totalBudget += d.budgetAmount;
      const category = d.projectNature || '未分类';
      g.categories[category] = (g.categories[category] || 0) + 1;
      g.details.push(d);
    });

    // 计划数去重
    filteredPlans.forEach((p) => {
      let key = '';
      if (groupBy === 'department') key = p.department;
      else if (groupBy === 'period') {
        const mode = p.planMode || 'approval';
        if (mode === 'filing') key = `${p.year}-filing`;
        else key = p.planType === 'annual' ? `${p.year}年-approval` : `${p.year}-${p.month}-approval`;
      } else if (groupBy === 'category') return; // 明细维度
      if (groups[key]) groups[key].planCount++;
    });

    return Object.values(groups).sort((a, b) => b.totalBudget - a.totalBudget);
  }, [summary, groupBy, filteredPlans]);

  // 导出汇总Excel
  const handleExportSummary = () => {
    const groupLabel = { department: '部门', category: '项目类别', period: '期间' }[groupBy];
    const headers = [
      groupLabel, '计划数', '项目数', '预算总额(万元)', '占比'
    ];
    const total = groupedData.reduce((s, g) => s + g.totalBudget, 0) || 1;
    const rows = groupedData.map((g) => [
      g.label, g.planCount, g.detailCount, g.totalBudget.toFixed(2),
      `${((g.totalBudget / total) * 100).toFixed(1)}%`
    ]);
    // 合计
    rows.push([
      '合计', groupedData.reduce((s, g) => s + g.planCount, 0),
      summary.detailCount, summary.totalBudget.toFixed(2), '100.0%'
    ]);
    const remark = '备注：项目预算为概算金额，实际以立项批复后金额为准。';
    const csv = [
      ['长沙国际会展中心管理有限责任公司'],
      ['采购计划汇总表'],
      [`统计期间：${filterYear || '全部'}年${filterMonth ? filterMonth + '月' : ''}，按${groupLabel}汇总`],
      [remark],
      headers,
      ...rows
    ].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `采购计划汇总_${groupBy}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // 导出明细
  const handleExportDetail = () => {
    const headers = [
      '序号', '计划方式', '计划类型', '时间', '需求部门', '项目名称', '项目类别', '项目概况', '项目估（预）算（万元）',
      '用户需求书编制计划完成时间', '预算编制审批计划完成时间', '合同前置审核计划完成时间',
      '计划采购启动时间', '计划采购完成时间'
    ];
    const rows = summary.allDetails.map((d) => {
      const period = d._planType === 'annual' ? `${d._year}年` : `${d._year}年${d._month}月`;
      const planModeLabel = d._planMode === 'filing' ? '报备制' : '审批制';
      const planTypeLabel = d._planMode === 'filing' ? '—' : (d._planType === 'annual' ? '年度计划' : '月度计划');
      return [
        d.seq, planModeLabel, planTypeLabel, period, d._department, d.projectName, d.projectNature || '', d.projectOverview || '',
        d.budgetAmount.toFixed(2), d.userRequirementDocDate || '', d.budgetApprovalDate || '',
        d.contractReviewDate || '', d.planProcurementStartDate || '', d.planProcurementEndDate || ''
      ];
    });
    const csv = [
      ['长沙国际会展中心管理有限责任公司采购项目年度计划表'],
      [`生成时间：${new Date().toLocaleString('zh-CN')}`],
      ['备注：项目预算为概算金额，实际以立项批复后金额为准。'],
      headers,
      ...rows
    ].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `采购计划明细_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const groupOptions = [
    { value: 'department', label: '按部门汇总' },
    { value: 'category', label: '按项目类别汇总' },
    { value: 'period', label: '按时间期间汇总' },
  ];

  return (
    <div className="p-4">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-[#1E40AF] flex items-center gap-2">
          <BarChart3 size={20} />
          采购计划汇总
        </h1>
        <p className="text-xs text-[#909399] mt-1">按部门、采购类型、时间等维度对采购计划进行汇总统计和导出</p>
      </div>

      <SearchBar
        onSearch={() => {}}
        onReset={() => {
          setFilterYear('');
          setFilterMonth('');
          setFilterType('');
          setFilterMode('');
          setFilterDepartment('');
        }}
      >
        <SearchField label="年份" placeholder="如 2026" value={filterYear} onChange={setFilterYear} />
        <SearchField label="月份" placeholder="如 06" value={filterMonth} onChange={setFilterMonth} />
        <SearchField
          label="计划方式"
          value={filterMode}
          onChange={setFilterMode}
          type="select"
          options={[
            { value: '', label: '全部' },
            { value: 'approval', label: '审批制' },
            { value: 'filing', label: '报备制' },
          ]}
        />
        <SearchField
          label="计划类型"
          value={filterType}
          onChange={setFilterType}
          type="select"
          options={[
            { value: '', label: '全部' },
            { value: 'monthly', label: '月度计划' },
            { value: 'annual', label: '年度计划' },
          ]}
        />
        <SearchField
          label="部门"
          value={filterDepartment}
          onChange={setFilterDepartment}
          type="select"
          options={[{ value: '', label: '全部' }, ...allDepartments.map((d) => ({ value: d, label: d }))]}
        />
      </SearchBar>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white border border-[#e4e7ed] rounded p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#909399] mb-1">
            <FileText size={14} /> 计划数
          </div>
          <div className="text-2xl font-bold text-[#1E40AF]">{summary.planCount}</div>
        </div>
        <div className="bg-white border border-[#e4e7ed] rounded p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#909399] mb-1">
            <Package size={14} /> 项目数
          </div>
          <div className="text-2xl font-bold text-[#67c23a]">{summary.detailCount}</div>
        </div>
        <div className="bg-white border border-[#e4e7ed] rounded p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#909399] mb-1">
            <Building2 size={14} /> 预算总额（万元）
          </div>
          <div className="text-2xl font-bold text-[#e6a23c]">{summary.totalBudget.toFixed(2)}</div>
        </div>
      </div>

      {/* 维度切换 + 视图切换 + 导出 */}
      <div className="bg-white border border-[#e4e7ed] rounded p-3 mb-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-[#606266]">汇总维度：</span>
          {groupOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => setGroupBy(o.value as GroupBy)}
              className={`px-3 py-1 text-xs rounded border ${
                groupBy === o.value
                  ? 'bg-[#2f54eb] text-white border-[#2f54eb]'
                  : 'bg-white text-[#606266] border-[#dcdfe6] hover:border-[#2f54eb]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#dcdfe6] rounded overflow-hidden">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 text-xs ${viewMode === 'summary' ? 'bg-[#1E40AF] text-white' : 'bg-white text-[#606266]'}`}
            >
              分组汇总
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`px-3 py-1 text-xs ${viewMode === 'detail' ? 'bg-[#1E40AF] text-white' : 'bg-white text-[#606266]'}`}
            >
              明细列表
            </button>
          </div>
          <PrimaryButton size="small" onClick={handleExportSummary}>
            <Download size={12} className="inline mr-1" />导出汇总
          </PrimaryButton>
          <DefaultButton size="small" onClick={handleExportDetail}>
            <Download size={12} className="inline mr-1" />导出明细
          </DefaultButton>
        </div>
      </div>

      {/* 汇总视图 */}
      {viewMode === 'summary' && (
        <div className="bg-white border border-[#e4e7ed] rounded shadow-sm">
          {groupedData.length === 0 ? (
            <div className="p-8 text-center text-[#909399] text-sm">暂无数据</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f5f7fa]">
                <tr>
                  <th className="px-3 py-2 text-xs text-left">
                    {groupBy === 'department' ? '部门' : groupBy === 'category' ? '项目类别' : '期间'}
                  </th>
                  <th className="px-3 py-2 text-xs text-right">计划数</th>
                  <th className="px-3 py-2 text-xs text-right">项目数</th>
                  <th className="px-3 py-2 text-xs text-right">预算总额(万元)</th>
                  <th className="px-3 py-2 text-xs text-right">预算占比</th>
                  <th className="px-3 py-2 text-xs text-left">预算分布</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((g) => {
                  const total = groupedData.reduce((s, x) => s + x.totalBudget, 0) || 1;
                  const ratio = g.totalBudget / total;
                  return (
                    <tr key={g.key} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                      <td className="px-3 py-2 text-sm font-medium text-[#303133]">{g.label}</td>
                      <td className="px-3 py-2 text-sm text-right">{g.planCount}</td>
                      <td className="px-3 py-2 text-sm text-right">{g.detailCount}</td>
                      <td className="px-3 py-2 text-sm text-right text-[#e6a23c] font-medium">{g.totalBudget.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-right">{`${(ratio * 100).toFixed(1)}%`}</td>
                      <td className="px-3 py-2">
                        <div className="h-2 bg-[#f0f2f5] rounded overflow-hidden">
                          <div
                            className="h-full bg-[#2f54eb]"
                            style={{ width: `${ratio * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#f5f7fa] font-bold">
                <tr>
                  <td className="px-3 py-2 text-sm">合计</td>
                  <td className="px-3 py-2 text-sm text-right">{groupedData.reduce((s, g) => s + g.planCount, 0)}</td>
                  <td className="px-3 py-2 text-sm text-right">{summary.detailCount}</td>
                  <td className="px-3 py-2 text-sm text-right text-[#e6a23c]">{summary.totalBudget.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-right">100.0%</td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* 明细视图 */}
      {viewMode === 'detail' && (
        <div className="bg-white border border-[#e4e7ed] rounded shadow-sm">
          {summary.allDetails.length === 0 ? (
            <div className="p-8 text-center text-[#909399] text-sm">暂无明细数据</div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-xs text-center">序号</th>
                    <th className="px-2 py-2 text-xs text-center">计划方式</th>
                    <th className="px-2 py-2 text-xs text-center">计划类型</th>
                    <th className="px-2 py-2 text-xs text-center">时间</th>
                    <th className="px-2 py-2 text-xs text-left">需求部门</th>
                    <th className="px-2 py-2 text-xs text-left">项目名称</th>
                    <th className="px-2 py-2 text-xs text-left">项目类别</th>
                    <th className="px-2 py-2 text-xs text-left">项目概况</th>
                    <th className="px-2 py-2 text-xs text-right">项目估（预）算（万元）</th>
                    <th className="px-2 py-2 text-xs text-center bg-[#fef3c7]">用户需求书编制计划完成时间</th>
                    <th className="px-2 py-2 text-xs text-center bg-[#fef3c7]">预算编制审批计划完成时间</th>
                    <th className="px-2 py-2 text-xs text-center bg-[#fef3c7]">合同前置审核计划完成时间</th>
                    <th className="px-2 py-2 text-xs text-center bg-[#dbeafe]">计划采购启动时间</th>
                    <th className="px-2 py-2 text-xs text-center bg-[#dbeafe]">计划采购完成时间</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.allDetails.map((d, i) => {
                    const period = d._planType === 'annual' ? `${d._year}年` : `${d._year}年${d._month}月`;
                    const planModeLabel = d._planMode === 'filing' ? '报备制' : '审批制';
                    const planModeColor = d._planMode === 'filing' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-600';
                    const planTypeLabel = d._planMode === 'filing' ? '—' : (d._planType === 'annual' ? '年度计划' : '月度计划');
                    return (
                      <tr key={i} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                        <td className="px-2 py-1.5 text-xs text-center">{d.seq || i + 1}</td>
                        <td className="px-2 py-1.5 text-xs text-center"><span className={`px-1.5 py-0.5 rounded ${planModeColor}`}>{planModeLabel}</span></td>
                        <td className="px-2 py-1.5 text-xs text-center">{planTypeLabel}</td>
                        <td className="px-2 py-1.5 text-xs text-center">{period}</td>
                        <td className="px-2 py-1.5 text-xs">{d._department || '-'}</td>
                        <td className="px-2 py-1.5 text-xs">{d.projectName}</td>
                        <td className="px-2 py-1.5 text-xs">{d.projectNature || '-'}</td>
                        <td className="px-2 py-1.5 text-xs max-w-[150px] truncate" title={d.projectOverview || ''}>{d.projectOverview || '-'}</td>
                        <td className="px-2 py-1.5 text-xs text-right text-[#e6a23c] font-medium">{d.budgetAmount.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-xs text-center bg-[#fef3c7]/30">{d.userRequirementDocDate || '-'}</td>
                        <td className="px-2 py-1.5 text-xs text-center bg-[#fef3c7]/30">{d.budgetApprovalDate || '-'}</td>
                        <td className="px-2 py-1.5 text-xs text-center bg-[#fef3c7]/30">{d.contractReviewDate || '-'}</td>
                        <td className="px-2 py-1.5 text-xs text-center bg-[#dbeafe]/30">{d.planProcurementStartDate || '-'}</td>
                        <td className="px-2 py-1.5 text-xs text-center bg-[#dbeafe]/30">{d.planProcurementEndDate || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
