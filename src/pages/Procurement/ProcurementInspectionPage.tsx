import { useMemo, useState, useEffect } from 'react';
import { Search, Check, Package, FileText, Calendar, AlertTriangle, Building2, Hash, Plus, X, ChevronRight, FileCheck, FileX } from 'lucide-react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import type {
  ProcurementInspection,
  ProcurementDemand,
  ProcurementOrder,
  ContractLedger,
  InspectionAcceptanceType,
  InspectionPhase,
  GoodsInspectionRow,
  ServiceInspectionRow,
  ProcurementDemandType,
} from '@/types';
import type { ContractLedgerWithAccumulated } from '@/utils/contractSupplement';
import { splitContracts, attachAccumulated } from '@/utils/contractSupplement';

// ============ 需求类型 → 验收类型映射 ============
const GOODS_TYPES: ProcurementDemandType[] = ['material', 'material_non_engineering'];
const isGoodsType = (t?: ProcurementDemandType) => t ? GOODS_TYPES.includes(t) : false;
const getAcceptanceType = (demandType?: ProcurementDemandType): InspectionAcceptanceType =>
  isGoodsType(demandType) ? 'goods' : 'service';

// ============ 需求状态（已确认的才能验收） ============
const DEMAND_CONFIRMED_STATUSES = ['confirm_approved'] as const;

// ============ 状态 Badge ============
const STATUS_BADGE: Record<ProcurementInspection['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: '草稿', variant: 'default' },
  pending: { label: '待审批', variant: 'warning' },
  approved: { label: '已通过', variant: 'success' },
  rejected: { label: '已驳回', variant: 'danger' },
};

const ACCEPTANCE_TYPE_LABEL: Record<InspectionAcceptanceType, string> = {
  goods: '物资类',
  service: '服务/项目类',
};

const PHASE_LABEL: Record<InspectionPhase, string> = {
  preliminary: '初验',
  final: '终验',
};

// ============ 需求类型 label ============
const DEMAND_TYPE_LABEL: Record<ProcurementDemandType, string> = {
  material: '工程物资',
  material_non_engineering: '非工程物资',
  service_project: '服务项目',
  service_non_engineering: '非工程服务',
  implementation_project: '实施项目',
};

// =====================================================================
// 主页面
// =====================================================================
export default function ProcurementInspectionPage() {
  const procurementInspections = useStore((s) => s.procurementInspections);
  const addProcurementInspection = useStore((s) => s.addProcurementInspection);
  const updateProcurementInspection = useStore((s) => s.updateProcurementInspection);
  const deleteProcurementInspection = useStore((s) => s.deleteProcurementInspection);
  const procurementDemands = useStore((s) => s.procurementDemands);
  const procurementOrders = useStore((s) => s.procurementOrders);
  const contractLedgers = useStore((s) => s.contractLedgers);
  const inboundOrders = useStore((s) => s.inboundOrders);
  const updateProcurementOrder = useStore((s) => s.updateProcurementOrder);
  const currentUser = useStore((s) => s.currentUser);

  // ========== 列表筛选 ==========
  const [filterNo, setFilterNo] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [applied, setApplied] = useState({ no: '', type: '', status: '', phase: '' });

  const filteredData = useMemo(() => {
    return procurementInspections.filter((i) => {
      if (applied.no) {
        const kw = applied.no.toLowerCase();
        if (!i.inspectionNo.toLowerCase().includes(kw)
          && !(i.demandNo || '').toLowerCase().includes(kw)
          && !(i.orderNo || '').toLowerCase().includes(kw)) return false;
      }
      if (applied.type && i.acceptanceType !== applied.type) return false;
      if (applied.status && i.status !== applied.status) return false;
      if (applied.phase && i.phase !== applied.phase) return false;
      return true;
    }).sort((a, b) => (b.inspectionDate || '').localeCompare(a.inspectionDate || ''));
  }, [procurementInspections, applied]);

  // ========== 新建 / 编辑弹窗 ==========
  const [showDemandPicker, setShowDemandPicker] = useState(false);
  const [showPhasePicker, setShowPhasePicker] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [viewItem, setViewItem] = useState<ProcurementInspection | null>(null);

  // ========== 表单状态 ==========
  const [selectedDemand, setSelectedDemand] = useState<ProcurementDemand | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ProcurementOrder | null>(null);
  const [form, setForm] = useState<Partial<ProcurementInspection>>({});
  const [phaseChoice, setPhaseChoice] = useState<InspectionPhase | null>(null);
  const [formError, setFormError] = useState('');

  // ========== 选中需求后自动派生合同信息（带累计值） ==========
  const relatedContract = useMemo<ContractLedgerWithAccumulated | undefined>(() => {
    if (!selectedDemand?.contractId) return undefined;
    const base = contractLedgers.find((c) => c.id === selectedDemand.contractId);
    if (!base) return undefined;
    // splitContracts 分主合同+补充协议，attachAccumulated 算累计金额/终止日期
    const { primaryList, supplementMap } = splitContracts(contractLedgers);
    const withAcc = attachAccumulated(primaryList, supplementMap);
    return withAcc.find((c) => c.id === base.id);
  }, [selectedDemand, contractLedgers]);

  // ========== 选中需求后自动关联订单 ==========
  const relatedOrder = useMemo<ProcurementOrder | undefined>(() => {
    if (!selectedDemand?.id) return undefined;
    return procurementOrders.find((o) => o.demandId === selectedDemand.id);
  }, [selectedDemand, procurementOrders]);

  // ========== 同一张需求下已有的验收单 ==========
  const existingForDemand = useMemo(() => {
    if (!selectedDemand?.id) return [];
    return procurementInspections.filter((i) => i.demandId === selectedDemand.id);
  }, [selectedDemand, procurementInspections]);

  // ========== 仓库前置校验：物资类必须全部入库 ==========
  const goodsPrecheck = useMemo(() => {
    if (!selectedDemand || !relatedOrder || getAcceptanceType(selectedDemand.demandType) !== 'goods') return null;
    const unfinished = relatedOrder.details.filter((d) => (d.deliveredQuantity ?? 0) < d.quantity);
    return {
      allIn: unfinished.length === 0,
      unfinished,
      totalItems: relatedOrder.details.length,
      finishedItems: relatedOrder.details.length - unfinished.length,
    };
  }, [selectedDemand, relatedOrder]);

  // ========== 列表表格列 ==========
  const columns: ColumnDef<ProcurementInspection>[] = [
    {
      key: 'inspectionNo', title: '验收编号', width: '160px',
      render: (row) => <span className="font-mono text-indigo-600">{row.inspectionNo}</span>,
    },
    {
      key: 'demandNo', title: '需求编号', width: '140px',
      render: (row) => row.demandNo || '-',
    },
    {
      key: 'acceptanceType', title: '验收类型', width: '100px',
      render: (row) => (
        <Badge variant={row.acceptanceType === 'goods' ? 'info' : 'primary'}>
          {ACCEPTANCE_TYPE_LABEL[row.acceptanceType]}
        </Badge>
      ),
    },
    {
      key: 'phase', title: '阶段', width: '90px',
      render: (row) => row.phase ? (
        <Badge variant={row.phase === 'final' ? 'warning' : 'default'}>
          {PHASE_LABEL[row.phase]}
        </Badge>
      ) : '-',
    },
    {
      key: 'contractNo', title: '关联合同', width: '140px',
      render: (row) => row.contractNo || '-',
    },
    {
      key: 'supplierName', title: '供应商', width: '140px',
      render: (row) => row.supplierName || '-',
    },
    {
      key: 'inspectionDate', title: '验收日期', width: '110px',
      render: (row) => row.inspectionDate || '-',
    },
    {
      key: 'inspector', title: '验收人', width: '90px',
      render: (row) => row.inspector || '-',
    },
    {
      key: 'status', title: '状态', width: '90px',
      render: (row) => {
        const s = STATUS_BADGE[row.status];
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'actions', title: '操作', width: '140px',
      render: (row) => (
        <div className="flex gap-2">
          <TextButton size="sm" onClick={() => openView(row)}>查看</TextButton>
          {row.status === 'approved' && (
            <TextButton size="sm" variant="danger" onClick={() => handleDelete(row.id)}>删除</TextButton>
          )}
        </div>
      ),
    },
  ];

  // ========== 打开新建 ==========
  const handleCreate = () => {
    setShowDemandPicker(true);
  };

  // ========== 选完需求 → 决定下一步 ==========
  const confirmDemandPick = (demand: ProcurementDemand) => {
    setShowDemandPicker(false);
    setSelectedDemand(demand);
    const at = getAcceptanceType(demand.demandType);

    if (at === 'service') {
      // 服务类：检查有没有终验单 → 决定是否弹阶段选择
      const hasFinal = procurementInspections.some(
        (i) => i.demandId === demand.id && i.acceptanceType === 'service' && i.phase === 'final' && i.status === 'approved',
      );
      if (hasFinal) {
        // 已有终验单 → 直接弹提示，不让新建
        alert('本需求已完成终验，不可再创建验收单');
        setSelectedDemand(null);
        return;
      }
      setShowPhasePicker(true);
    } else {
      // 物资类：直接进表单
      openForm(demand, null);
    }
  };

  // ========== 阶段选择确认 ==========
  const confirmPhasePick = (phase: InspectionPhase) => {
    setShowPhasePicker(false);
    setPhaseChoice(phase);
    if (selectedDemand) openForm(selectedDemand, phase);
  };

  // ========== 打开表单 ==========
  const openForm = (demand: ProcurementDemand, phase: InspectionPhase | null) => {
    const order = procurementOrders.find((o) => o.demandId === demand.id);
    setSelectedOrder(order || null);

    const acceptanceType = getAcceptanceType(demand.demandType);
    const inspectionNo = genSerialNo(
      SERIAL_CONFIG.INSPECTION,
      procurementInspections.map((i) => i.inspectionNo),
    );

    // 物资类：用订单明细生成 goodsDetails（前置校验后 confirmed）
    let goodsDetails: GoodsInspectionRow[] | undefined;
    let serviceDetails: ServiceInspectionRow[] | undefined;

    if (acceptanceType === 'goods' && order) {
      // 反查入库来源：所有 orderNo === 本订单号的入库单
      const relatedInbounds = inboundOrders.filter((io) => io.orderNo === order.orderNo && io.details?.length);
      const buildInboundSources = (productId: string) => {
        const sources: { inboundOrderId: string; inboundOrderNo: string; inboundDetailId: string; positionName?: string; confirmTime?: string; confirmer?: string }[] = [];
        for (const io of relatedInbounds) {
          for (const d of io.details) {
            if (d.productId === productId) {
              sources.push({
                inboundOrderId: io.id,
                inboundOrderNo: io.orderNo,
                inboundDetailId: d.id,
                positionName: d.positionName,
                confirmTime: io.confirmTime,
                confirmer: io.confirmer,
              });
            }
          }
        }
        return sources;
      };

      goodsDetails = order.details.map((d, i) => ({
        id: `GD-${order.id}-${i}`,
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        specification: d.specification,
        unit: d.unit,
        demandQuantity: d.quantity,
        orderedQuantity: d.quantity,
        deliveredQuantity: d.deliveredQuantity ?? 0,
        verifiedQuantity: d.deliveredQuantity ?? 0,
        unitPrice: d.unitPrice,
        amount: d.amount,
        qualityConclusion: undefined,
        inboundSources: buildInboundSources(d.productId),
      }));
    } else {
      // 服务类：从需求 projectRows 生成，空行让用户填
      const rows = demand.projectRows || [];
      serviceDetails = rows.length > 0
        ? rows.map((r, i) => ({
            id: `SD-${demand.id}-${i}`,
            milestone: r.projectName || `里程碑 ${i + 1}`,
            contractRequirement: r.mainContent || r.remark || '',
            completionStatus: 'in_progress' as const,
            completionRate: 0,
            conclusion: 'pass' as const,
          }))
        : [
            {
              id: `SD-${demand.id}-0`,
              milestone: '整体交付',
              contractRequirement: demand.projectDescription || '按合同约定',
              completionStatus: 'in_progress',
              completionRate: 0,
              conclusion: 'pass',
            },
          ];
    }

    setForm({
      inspectionNo,
      demandId: demand.id,
      demandNo: demand.demandNo,
      orderId: order?.id,
      orderNo: order?.orderNo,
      contractId: demand.contractId || order?.contractId,
      contractNo: demand.contractNoSnapshot || order?.contractNo,
      contractName: relatedContract?.contractName,
      supplierId: order?.supplierId,
      supplierName: order?.supplierName,
      acceptanceType,
      demandType: demand.demandType,
      phase: phase || undefined,
      inspectionDate: new Date().toISOString().slice(0, 10),
      inspector: currentUser?.name || '当前用户',
      inspectorDept: currentUser?.department || '',
      status: 'draft',
      goodsDetails,
      serviceDetails,
    });
    setFormError('');
    setFormVisible(true);
  };

  // ========== 表单提交 ==========
  const handleSubmit = () => {
    if (!form.acceptanceType || !selectedDemand) return;

    // 物资类前置校验
    if (form.acceptanceType === 'goods' && goodsPrecheck && !goodsPrecheck.allIn) {
      setFormError(`还有 ${goodsPrecheck.unfinished.length} 项未全部入库，请先去仓库模块完成入库`);
      return;
    }

    const now = new Date().toISOString();
    const newItem: ProcurementInspection = {
      id: form.id || `INSP-${Date.now()}`,
      inspectionNo: form.inspectionNo!,
      demandId: form.demandId,
      demandNo: form.demandNo,
      orderId: form.orderId,
      orderNo: form.orderNo,
      contractId: form.contractId,
      contractNo: form.contractNo,
      contractName: form.contractName,
      supplierId: form.supplierId,
      supplierName: form.supplierName,
      acceptanceType: form.acceptanceType,
      demandType: form.demandType,
      phase: form.phase,
      inspectionDate: form.inspectionDate || now.slice(0, 10),
      inspector: form.inspector || '',
      inspectorDept: form.inspectorDept,
      status: 'approved', // 验收完成即通过（演示环境简化）
      remark: form.remark,
      goodsDetails: form.goodsDetails,
      serviceDetails: form.serviceDetails,
      approveTime: now,
      approver: form.inspector || currentUser?.name,
    };

    addProcurementInspection(newItem);

    // 验收通过后：更新订单状态
    if (form.orderId) {
      const finalReached = form.acceptanceType === 'goods'
        ? true // 物资类一次性验
        : form.phase === 'final'; // 服务类终验才算完
      if (finalReached) {
        updateProcurementOrder(form.orderId, { status: 'completed' });
      }
    }

    setFormVisible(false);
    setSelectedDemand(null);
    setSelectedOrder(null);
    setPhaseChoice(null);
    setForm({});
    alert('✅ 验收单已提交');
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除这条验收记录？')) return;
    deleteProcurementInspection(id);
  };

  const openView = (row: ProcurementInspection) => {
    setViewItem(row);
    setViewVisible(true);
  };

  // ========== 搜索 ==========
  const handleSearch = () => setApplied({ no: filterNo.trim(), type: filterType, status: filterStatus, phase: filterPhase });
  const handleReset = () => {
    setFilterNo(''); setFilterType(''); setFilterStatus(''); setFilterPhase('');
    setApplied({ no: '', type: '', status: '', phase: '' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">招采项目验收</h2>
          <p className="text-sm text-slate-500 mt-1">
            物资类须全部入库后验收；服务/项目类支持初验 / 终验两次
          </p>
        </div>
        <PrimaryButton onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-1" /> 新增验收
        </PrimaryButton>
      </div>

      {/* 搜索区 */}
      <SearchBar>
        <SearchField label="关键字" placeholder="验收编号 / 需求编号 / 订单编号" value={filterNo} onChange={setFilterNo} />
        <SearchField label="验收类型" type="select" value={filterType} onChange={setFilterType}
          options={[
            { value: '', label: '全部' },
            { value: 'goods', label: '物资类' },
            { value: 'service', label: '服务/项目类' },
          ]} />
        <SearchField label="阶段" type="select" value={filterPhase} onChange={setFilterPhase}
          options={[
            { value: '', label: '全部' },
            { value: 'preliminary', label: '初验' },
            { value: 'final', label: '终验' },
          ]} />
        <SearchField label="状态" type="select" value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'approved', label: '已通过' },
            { value: 'pending', label: '待审批' },
            { value: 'draft', label: '草稿' },
            { value: 'rejected', label: '已驳回' },
          ]} />
        <div className="flex gap-2 ml-auto">
          <DefaultButton onClick={handleReset}>重置</DefaultButton>
          <PrimaryButton onClick={handleSearch}>搜索</PrimaryButton>
        </div>
      </SearchBar>

      {/* 表格 */}
      <div className="flex-1 mt-4">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyText="暂无验收记录"
        />
      </div>

      {/* ========== 选需求弹窗 ========== */}
      {showDemandPicker && (
        <Modal open={showDemandPicker} title="选择招采需求" size="lg" onClose={() => setShowDemandPicker(false)}
          footer={null}>
          <DemandPicker
            onPick={confirmDemandPick}
            onCancel={() => setShowDemandPicker(false)}
            inspectionList={procurementInspections}
            currentOrders={procurementOrders}
          />
        </Modal>
      )}

      {/* ========== 选阶段弹窗（仅服务类） ========== */}
      {showPhasePicker && selectedDemand && (
        <Modal open={showPhasePicker} title="选择验收阶段" size="sm" onClose={() => { setShowPhasePicker(false); setSelectedDemand(null); }}
          footer={null}>
          <PhasePicker
            demand={selectedDemand}
            existing={existingForDemand}
            onPick={confirmPhasePick}
            onCancel={() => { setShowPhasePicker(false); setSelectedDemand(null); }}
          />
        </Modal>
      )}

      {/* ========== 表单弹窗 ========== */}
      {formVisible && selectedDemand && (
        <Modal
          open={formVisible}
          title={`${form.acceptanceType === 'goods' ? '物资类' : '服务/项目类'}验收单${form.phase ? ` · ${PHASE_LABEL[form.phase]}` : ''}`}
          size="xl"
          onClose={() => { setFormVisible(false); setSelectedDemand(null); setSelectedOrder(null); }}
          footer={
            <div className="flex gap-2 justify-end w-full">
              <DefaultButton onClick={() => { setFormVisible(false); setSelectedDemand(null); setSelectedOrder(null); }}>取消</DefaultButton>
              <PrimaryButton onClick={handleSubmit}>提交验收</PrimaryButton>
            </div>
          }
        >
          <FormBody
            form={form}
            setForm={setForm}
            demand={selectedDemand}
            order={selectedOrder}
            contract={relatedContract}
            goodsPrecheck={goodsPrecheck}
            error={formError}
          />
        </Modal>
      )}

      {/* ========== 详情弹窗 ========== */}
      {viewVisible && viewItem && (
        <Modal open={viewVisible} title={`验收单详情 - ${viewItem.inspectionNo}`} size="lg" onClose={() => { setViewVisible(false); setViewItem(null); }}
          footer={<DefaultButton onClick={() => { setViewVisible(false); setViewItem(null); }}>关闭</DefaultButton>}>
          <ViewBody inspection={viewItem} />
        </Modal>
      )}
    </div>
  );
}

// =====================================================================
// 子组件：需求选择器
// =====================================================================
function DemandPicker({
  onPick, onCancel, inspectionList, currentOrders,
}: {
  onPick: (d: ProcurementDemand) => void;
  onCancel: () => void;
  inspectionList: ProcurementInspection[];
  currentOrders: ProcurementOrder[];
}) {
  const [kw, setKw] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // 从 store 全局拉
  const procurementDemandsGlobal = useStore((s) => s.procurementDemands);

  const confirmedDemands = useMemo(() => {
    return (procurementDemandsGlobal as ProcurementDemand[])
      .filter((d) => DEMAND_CONFIRMED_STATUSES.includes(d.status as any))
      .filter((d) => {
        if (kw) {
          const k = kw.toLowerCase();
          if (!d.demandNo.toLowerCase().includes(k)
            && !d.projectName.toLowerCase().includes(k)
            && !(d.applicant || '').toLowerCase().includes(k)) return false;
        }
        if (typeFilter && d.demandType !== typeFilter) return false;
        return true;
      });
  }, [kw, typeFilter, procurementDemandsGlobal]);

  return (
    <div>
      {/* 筛选 */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="需求编号 / 项目名称 / 申请人"
            value={kw} onChange={(e) => setKw(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">全部类型</option>
          <option value="material">工程物资</option>
          <option value="material_non_engineering">非工程物资</option>
          <option value="service_project">服务项目</option>
          <option value="service_non_engineering">非工程服务</option>
          <option value="implementation_project">实施项目</option>
        </select>
      </div>

      {/* 列表 */}
      <div className="max-h-[420px] overflow-auto border border-slate-100 rounded-lg">
        {confirmedDemands.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            没有可验收的需求（需要已确认状态）
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2 font-medium">需求编号</th>
                <th className="text-left px-3 py-2 font-medium">项目名称</th>
                <th className="text-left px-3 py-2 font-medium">类型</th>
                <th className="text-left px-3 py-2 font-medium">申请人</th>
                <th className="text-left px-3 py-2 font-medium">关联订单</th>
                <th className="text-left px-3 py-2 font-medium">验收情况</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {confirmedDemands.map((d) => {
                const order = currentOrders.find((o) => o.demandId === d.id);
                const insps = inspectionList.filter((i) => i.demandId === d.id);
                const hasFinal = insps.some((i) => i.phase === 'final' && i.status === 'approved');
                const at = getAcceptanceType(d.demandType);
                return (
                  <tr key={d.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-indigo-600">{d.demandNo}</td>
                    <td className="px-3 py-2 truncate max-w-[200px]">{d.projectName}</td>
                    <td className="px-3 py-2">
                      <Badge variant={at === 'goods' ? 'info' : 'primary'} >
                        {at === 'goods' ? '物资' : '服务'}
                      </Badge>
                      <span className="ml-1 text-[11px] text-slate-400">{DEMAND_TYPE_LABEL[d.demandType!]}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{d.applicant}</td>
                    <td className="px-3 py-2">{order?.orderNo ? <span className="font-mono text-xs">{order.orderNo}</span> : <span className="text-slate-400 text-xs">无</span>}</td>
                    <td className="px-3 py-2">
                      {hasFinal ? (
                        <Badge variant="success" >已终验</Badge>
                      ) : insps.length > 0 ? (
                        <Badge variant="warning" >{insps.length} 次</Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">未验收</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <TextButton size="sm" disabled={hasFinal} onClick={() => onPick(d)}>
                        选择
                      </TextButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="text-xs text-slate-400 mt-3">共 {confirmedDemands.length} 条待验收需求</div>
    </div>
  );
}

// =====================================================================
// 子组件：阶段选择器（仅服务类）
// =====================================================================
function PhasePicker({
  demand, existing, onPick, onCancel,
}: {
  demand: ProcurementDemand;
  existing: ProcurementInspection[];
  onPick: (p: InspectionPhase) => void;
  onCancel: () => void;
}) {
  const hasPrelim = existing.some((i) => i.phase === 'preliminary' && i.status === 'approved');

  return (
    <div className="py-2">
      <div className="text-sm text-slate-600 mb-4">
        需求 <span className="font-mono text-indigo-600">{demand.demandNo}</span> · {demand.projectName}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-4">
        💡 请选择本次验收的阶段。初验通过后还可再验终验；终验通过后不可再创建任何验收单。
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className={`border rounded-lg p-4 text-left transition-all ${
            hasPrelim ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
              : 'border-indigo-200 bg-indigo-50 hover:border-indigo-400 hover:shadow-sm'
          }`}
          disabled={hasPrelim}
          onClick={() => !hasPrelim && onPick('preliminary')}
        >
          <FileText className="w-5 h-5 text-indigo-500 mb-2" />
          <div className="font-medium text-slate-800">初验</div>
          <div className="text-xs text-slate-500 mt-1">首次验收，检查项目基本完成情况</div>
          {hasPrelim && <div className="text-xs text-emerald-600 mt-2">✓ 已通过</div>}
        </button>

        <button
          className="border rounded-lg p-4 text-left transition-all border-amber-200 bg-amber-50 hover:border-amber-400 hover:shadow-sm"
          onClick={() => onPick('final')}
        >
          <FileCheck className="w-5 h-5 text-amber-500 mb-2" />
          <div className="font-medium text-slate-800">终验</div>
          <div className="text-xs text-slate-500 mt-1">最终验收，确认项目完整交付</div>
        </button>
      </div>

      <div className="mt-4 text-center">
        <TextButton onClick={onCancel}>取消</TextButton>
      </div>
    </div>
  );
}

// =====================================================================
// 子组件：表单主体
// =====================================================================
function FormBody({
  form, setForm, demand, order, contract, goodsPrecheck, error,
}: {
  form: Partial<ProcurementInspection>;
  setForm: (f: Partial<ProcurementInspection>) => void;
  demand: ProcurementDemand;
  order: ProcurementOrder | null;
  contract?: ContractLedgerWithAccumulated;
  goodsPrecheck: { allIn: boolean; unfinished: any[]; finishedItems: number; totalItems: number } | null;
  error: string;
}) {
  const at = form.acceptanceType!;

  // 物资类：更新指定行（patch 模式，verifiedQuantity 自动夹逼到 deliveredQuantity）
  const updateGoodsRow = (idx: number, patch: Partial<GoodsInspectionRow>) => {
    if (!form.goodsDetails) return;
    const rows = [...form.goodsDetails];
    const row = rows[idx];
    let merged = { ...row, ...patch };
    if (patch.verifiedQuantity !== undefined) {
      merged.verifiedQuantity = Math.max(0, Math.min(patch.verifiedQuantity, row.deliveredQuantity));
    }
    rows[idx] = merged;
    setForm({ ...form, goodsDetails: rows });
  };

  // 服务类：更新 serviceDetails
  const updateServiceRow = (idx: number, patch: Partial<ServiceInspectionRow>) => {
    if (!form.serviceDetails) return;
    const rows = [...form.serviceDetails];
    rows[idx] = { ...rows[idx], ...patch };
    setForm({ ...form, serviceDetails: rows });
  };

  return (
    <div className="space-y-5">
      {/* 合同摘要卡片 */}
      {contract && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-700">关联合同</span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-500">合同编号</div>
              <div className="font-mono text-indigo-600 mt-0.5">{contract.contractNo}</div>
            </div>
            <div>
              <div className="text-slate-500">合同名称</div>
              <div className="text-slate-700 mt-0.5 truncate max-w-[180px]">{contract.contractName}</div>
            </div>
            <div>
              <div className="text-slate-500">合同金额</div>
              <div className="text-slate-700 mt-0.5">
                ¥{(contract.accumulatedAmount ?? contract.amount ?? 0).toLocaleString()}
                {contract.accumulatedAmount !== undefined && contract.accumulatedAmount !== contract.amount && (
                  <span className="ml-1 text-slate-400 text-[10px]">(原始 ¥{(contract.amount ?? 0).toLocaleString()})</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-slate-500">生效 / 终止</div>
              <div className="text-slate-700 mt-0.5">
                {contract.effectiveDate || '-'} ~ {contract.accumulatedTerminationDate || contract.terminationDate || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 基础信息 */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-slate-500 mb-1">验收类型</div>
          <div className="font-medium">{ACCEPTANCE_TYPE_LABEL[at]}</div>
        </div>
        {form.phase && (
          <div>
            <div className="text-slate-500 mb-1">验收阶段</div>
            <div>
              <Badge variant={form.phase === 'final' ? 'warning' : 'default'}>{PHASE_LABEL[form.phase]}</Badge>
            </div>
          </div>
        )}
        <div>
          <div className="text-slate-500 mb-1">需求编号</div>
          <div className="font-mono text-indigo-600">{demand.demandNo}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">供应商</div>
          <div>{order?.supplierName || '-'}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">验收日期</div>
          <input
            type="date"
            className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.inspectionDate || ''}
            onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
          />
        </div>
        <div>
          <div className="text-slate-500 mb-1">验收人</div>
          <input
            className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.inspector || ''}
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-2 text-sm text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ===== 物资类表单 ===== */}
      {at === 'goods' && form.goodsDetails && (() => {
        // 质量汇总
        const qualityCount = { pass: 0, conditional_pass: 0, fail: 0, unset: 0 };
        const totalDemand = form.goodsDetails.reduce((s, r) => s + r.demandQuantity, 0);
        const totalDelivered = form.goodsDetails.reduce((s, r) => s + r.deliveredQuantity, 0);
        const totalVerified = form.goodsDetails.reduce((s, r) => s + r.verifiedQuantity, 0);
        const totalAmount = form.goodsDetails.reduce((s, r) => s + ((r.verifiedQuantity || 0) * (r.unitPrice || 0)), 0);
        form.goodsDetails.forEach((r) => {
          if (!r.qualityConclusion) qualityCount.unset++;
          else qualityCount[r.qualityConclusion]++;
        });

        // 入库来源弹窗
        const [sourcePopup, setSourcePopup] = useState<{ rowId: string; sources: NonNullable<GoodsInspectionRow['inboundSources']> } | null>(null);

        const QC_OPTIONS: { value: NonNullable<GoodsInspectionRow['qualityConclusion']> | ''; label: string }[] = [
          { value: 'pass', label: '通过' },
          { value: 'conditional_pass', label: '有条件通过' },
          { value: 'fail', label: '不通过' },
        ];

        return (
          <div>
            {/* 仓库前置校验提示 */}
            {goodsPrecheck && (
              <div className={`rounded-lg px-3 py-2 text-xs mb-3 flex items-center gap-2 ${
                goodsPrecheck.allIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {goodsPrecheck.allIn
                  ? <><Check className="w-4 h-4" /> 全部 {goodsPrecheck.totalItems} 项已入库，可直接验收</>
                  : <><AlertTriangle className="w-4 h-4" /> 还有 {goodsPrecheck.unfinished.length} 项未全部入库（{goodsPrecheck.finishedItems}/{goodsPrecheck.totalItems}），请先去仓库模块完成入库</>
                }
              </div>
            )}

            {/* 顶部汇总条 */}
            <div className="grid grid-cols-5 gap-2 mb-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <div className="text-slate-500">总项数</div>
                <div className="font-semibold text-slate-700 mt-0.5">{form.goodsDetails.length} 项</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <div className="text-slate-500">需求合计</div>
                <div className="font-semibold text-slate-700 mt-0.5">{totalDemand}</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                <div className="text-indigo-500">入库合计</div>
                <div className="font-semibold text-indigo-700 mt-0.5">{totalDelivered}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <div className="text-emerald-600">本次验收合计</div>
                <div className="font-semibold text-emerald-700 mt-0.5">{totalVerified}</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <div className="text-amber-600">验收金额（估算）</div>
                <div className="font-semibold text-amber-700 mt-0.5">¥{totalAmount.toLocaleString()}</div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">品名规格</th>
                    <th className="px-2 py-2">单位</th>
                    <th className="px-2 py-2">需求数</th>
                    <th className="px-2 py-2">下单数</th>
                    <th className="px-2 py-2 bg-indigo-50 text-indigo-600">入库来源</th>
                    <th className="px-2 py-2 bg-indigo-50 text-indigo-600">仓库已入库</th>
                    <th className="px-2 py-2 bg-indigo-50 text-indigo-600">单价 / 金额</th>
                    <th className="px-2 py-2 bg-emerald-50 text-emerald-600">本次验收确认</th>
                    <th className="px-2 py-2">验收结论</th>
                    <th className="px-2 py-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {form.goodsDetails.map((row, idx) => {
                    const notFullyIn = row.deliveredQuantity < row.orderedQuantity;
                    return (
                      <tr key={row.id} className="border-t border-slate-50 align-top">
                        <td className="px-3 py-2">
                          <div className="font-medium">{row.productName}</div>
                          {row.specification && <div className="text-xs text-slate-400">{row.specification}</div>}
                        </td>
                        <td className="text-center px-2 py-2 text-slate-500">{row.unit}</td>
                        <td className="text-center px-2 py-2">{row.demandQuantity}</td>
                        <td className="text-center px-2 py-2">{row.orderedQuantity}</td>
                        <td className="text-center px-2 py-2">
                          {row.inboundSources && row.inboundSources.length > 0 ? (
                            <button
                              onClick={() => setSourcePopup({ rowId: row.id, sources: row.inboundSources! })}
                              className="text-indigo-600 hover:text-indigo-800 text-xs underline underline-offset-2"
                            >
                              {row.inboundSources.length} 条 ↗
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>
                        <td className={`text-center px-2 py-2 font-medium ${notFullyIn ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {row.deliveredQuantity}
                          {notFullyIn && <div className="text-[10px] text-rose-400">差 {row.orderedQuantity - row.deliveredQuantity}</div>}
                        </td>
                        <td className="text-center px-2 py-2 text-slate-600">
                          {row.unitPrice !== undefined ? (
                            <>
                              <div className="text-xs">¥{row.unitPrice.toFixed(2)}</div>
                              <div className="text-[10px] text-slate-400">= ¥{(row.amount ?? row.unitPrice * row.orderedQuantity).toLocaleString()}</div>
                            </>
                          ) : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                        <td className="text-center px-2 py-2 bg-emerald-50/30">
                          <input
                            type="number"
                            min={0}
                            max={row.deliveredQuantity}
                            value={row.verifiedQuantity}
                            disabled={notFullyIn}
                            onChange={(e) => updateGoodsRow(idx, { verifiedQuantity: Number(e.target.value) })}
                            className="w-20 text-center px-2 py-1 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={row.qualityConclusion || ''}
                            disabled={notFullyIn}
                            onChange={(e) => updateGoodsRow(idx, { qualityConclusion: e.target.value as any })}
                            className="w-full min-w-[110px] px-2 py-1 border border-slate-200 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            <option value="">请判定</option>
                            {QC_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            value={row.remark || ''}
                            disabled={notFullyIn}
                            onChange={(e) => updateGoodsRow(idx, { remark: e.target.value })}
                            placeholder="如有异常..."
                            className="w-full min-w-[120px] px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {/* 汇总行 */}
                  <tr className="bg-slate-50 font-semibold text-slate-700 border-t-2 border-slate-200">
                    <td className="px-3 py-2 text-xs">合计（{form.goodsDetails.length} 项）</td>
                    <td></td>
                    <td className="text-center px-2 py-2">{totalDemand}</td>
                    <td className="text-center px-2 py-2"></td>
                    <td></td>
                    <td className="text-center px-2 py-2 text-indigo-600">{totalDelivered}</td>
                    <td className="text-center px-2 py-2 text-amber-600 text-xs">¥{totalAmount.toLocaleString()}</td>
                    <td className="text-center px-2 py-2 text-emerald-700">{totalVerified}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 入库来源小弹窗 */}
            {sourcePopup && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSourcePopup(null)} />
                <div className="relative bg-white rounded-xl shadow-xl w-[420px] border border-slate-100">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">入库来源（{sourcePopup.sources.length} 条）</div>
                    <button onClick={() => setSourcePopup(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-[300px] overflow-auto">
                    {sourcePopup.sources.map((s) => (
                      <div key={s.inboundDetailId} className="px-4 py-2 border-b border-slate-50 text-xs">
                        <div className="font-mono text-indigo-600">{s.inboundOrderNo}</div>
                        <div className="text-slate-500 mt-1 flex gap-3">
                          <span>仓位: {s.positionName || '-'}</span>
                          <span>确认人: {s.confirmer || '-'}</span>
                        </div>
                        <div className="text-slate-400 mt-0.5">入库时间: {s.confirmTime || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 质量汇总卡 */}
            <div className="mt-3 flex gap-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-emerald-700">✅ 通过 <span className="font-semibold">{qualityCount.pass}</span></div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-amber-700">⚠️ 有条件通过 <span className="font-semibold">{qualityCount.conditional_pass}</span></div>
              <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 text-rose-700">❌ 不通过 <span className="font-semibold">{qualityCount.fail}</span></div>
              {qualityCount.unset > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-slate-500">未判定 <span className="font-semibold">{qualityCount.unset}</span></div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ===== 服务类表单 ===== */}
      {at === 'service' && form.serviceDetails && (
        <div className="space-y-3">
          {form.serviceDetails.map((row, idx) => (
            <div key={row.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/30">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">里程碑 / 项目节点</div>
                  <input
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={row.milestone}
                    onChange={(e) => updateServiceRow(idx, { milestone: e.target.value })}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">合同要求</div>
                  <input
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={row.contractRequirement}
                    onChange={(e) => updateServiceRow(idx, { contractRequirement: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">完成状态</div>
                  <select
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={row.completionStatus}
                    onChange={(e) => updateServiceRow(idx, { completionStatus: e.target.value as any })}
                  >
                    <option value="not_started">未开始</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="delayed">延期</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">完成度 %</div>
                  <input
                    type="number" min={0} max={100}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={row.completionRate ?? 0}
                    onChange={(e) => updateServiceRow(idx, { completionRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">验收结论</div>
                  <select
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    value={row.conclusion}
                    onChange={(e) => updateServiceRow(idx, { conclusion: e.target.value as any })}
                  >
                    <option value="pass">通过</option>
                    <option value="conditional_pass">附条件通过</option>
                    <option value="fail">不通过</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">本次完成情况描述</div>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="详细描述本次完成了哪些工作..."
                  value={row.completionDescription || ''}
                  onChange={(e) => updateServiceRow(idx, { completionDescription: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 备注 */}
      <div>
        <div className="text-sm text-slate-500 mb-1">整体备注</div>
        <textarea
          rows={2}
          className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          placeholder="整体验收意见、异常情况说明等..."
          value={form.remark || ''}
          onChange={(e) => setForm({ ...form, remark: e.target.value })}
        />
      </div>
    </div>
  );
}

// =====================================================================
// 子组件：查看详情
// =====================================================================
function ViewBody({ inspection }: { inspection: ProcurementInspection }) {
  const at = inspection.acceptanceType;
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-4 gap-3">
        <div><span className="text-slate-400">验收编号：</span><span className="font-mono text-indigo-600">{inspection.inspectionNo}</span></div>
        <div><span className="text-slate-400">类型：</span>{ACCEPTANCE_TYPE_LABEL[at]}{inspection.phase && ` · ${PHASE_LABEL[inspection.phase]}`}</div>
        <div><span className="text-slate-400">状态：</span>{STATUS_BADGE[inspection.status].label}</div>
        <div><span className="text-slate-400">验收日期：</span>{inspection.inspectionDate}</div>
        <div><span className="text-slate-400">需求编号：</span>{inspection.demandNo || '-'}</div>
        <div><span className="text-slate-400">订单编号：</span>{inspection.orderNo || '-'}</div>
        <div><span className="text-slate-400">合同编号：</span>{inspection.contractNo || '-'}</div>
        <div><span className="text-slate-400">供应商：</span>{inspection.supplierName || '-'}</div>
      </div>

      {at === 'goods' && inspection.goodsDetails && (() => {
        const totalDemand = inspection.goodsDetails.reduce((s, r) => s + r.demandQuantity, 0);
        const totalDelivered = inspection.goodsDetails.reduce((s, r) => s + r.deliveredQuantity, 0);
        const totalVerified = inspection.goodsDetails.reduce((s, r) => s + r.verifiedQuantity, 0);
        const totalAmount = inspection.goodsDetails.reduce((s, r) => s + ((r.verifiedQuantity || 0) * (r.unitPrice || 0)), 0);
        const qcCount = inspection.goodsDetails.reduce((c, r) => {
          if (r.qualityConclusion) c[r.qualityConclusion]++;
          return c;
        }, { pass: 0, conditional_pass: 0, fail: 0 } as Record<string, number>);
        const QC_LABEL: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
          pass: { label: '✅ 通过', variant: 'success' },
          conditional_pass: { label: '⚠️ 有条件通过', variant: 'warning' },
          fail: { label: '❌ 不通过', variant: 'danger' },
        };
        return (
          <div>
            {/* 汇总条 */}
            <div className="grid grid-cols-5 gap-2 mb-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <div className="text-slate-500">总项数</div>
                <div className="font-semibold text-slate-700 mt-0.5">{inspection.goodsDetails.length} 项</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                <div className="text-indigo-500">入库合计</div>
                <div className="font-semibold text-indigo-700 mt-0.5">{totalDelivered}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <div className="text-emerald-600">验收合计</div>
                <div className="font-semibold text-emerald-700 mt-0.5">{totalVerified} / {totalDemand}</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <div className="text-amber-600">验收金额</div>
                <div className="font-semibold text-amber-700 mt-0.5">¥{totalAmount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <div className="text-slate-500">质量结论</div>
                <div className="mt-0.5 flex gap-1 flex-wrap text-[11px]">
                  {qcCount.pass > 0 && <span className="text-emerald-600">过{qcCount.pass}</span>}
                  {qcCount.conditional_pass > 0 && <span className="text-amber-600">条件{qcCount.conditional_pass}</span>}
                  {qcCount.fail > 0 && <span className="text-rose-600">不{qcCount.fail}</span>}
                  {qcCount.pass === 0 && qcCount.conditional_pass === 0 && qcCount.fail === 0 && <span className="text-slate-400">无判定</span>}
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">品名规格</th>
                    <th className="px-2 py-2">单位</th>
                    <th className="px-2 py-2">需求数</th>
                    <th className="px-2 py-2">下单数</th>
                    <th className="px-2 py-2">入库来源</th>
                    <th className="px-2 py-2">仓库已入库</th>
                    <th className="px-2 py-2">单价/金额</th>
                    <th className="px-2 py-2 text-emerald-600">本次验收确认</th>
                    <th className="px-2 py-2">验收结论</th>
                    <th className="px-2 py-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {inspection.goodsDetails.map((row) => (
                    <tr key={row.id} className="border-t border-slate-50 align-top">
                      <td className="px-3 py-2">{row.productName}{row.specification && <span className="text-slate-400 text-xs ml-1">({row.specification})</span>}</td>
                      <td className="text-center px-2 py-2">{row.unit}</td>
                      <td className="text-center px-2 py-2">{row.demandQuantity}</td>
                      <td className="text-center px-2 py-2">{row.orderedQuantity}</td>
                      <td className="text-center px-2 py-2 text-xs">
                        {row.inboundSources && row.inboundSources.length > 0
                          ? `${row.inboundSources.length} 条` : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="text-center px-2 py-2">{row.deliveredQuantity}</td>
                      <td className="text-center px-2 py-2 text-xs text-slate-600">
                        {row.unitPrice !== undefined
                          ? <><div>¥{row.unitPrice.toFixed(2)}</div><div className="text-slate-400">= ¥{(row.amount ?? row.unitPrice * row.orderedQuantity).toLocaleString()}</div></>
                          : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="text-center px-2 py-2 font-medium text-emerald-600">{row.verifiedQuantity}</td>
                      <td className="px-2 py-2">
                        {row.qualityConclusion
                          ? <Badge variant={QC_LABEL[row.qualityConclusion]?.variant || 'default'}>{QC_LABEL[row.qualityConclusion]?.label || row.qualityConclusion}</Badge>
                          : <span className="text-slate-300 text-xs">未判定</span>}
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-600 max-w-[150px]">{row.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {at === 'service' && inspection.serviceDetails && (
        <div className="space-y-2">
          {inspection.serviceDetails.map((row) => (
            <div key={row.id} className="border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{row.milestone}</span>
                <Badge variant={
                  row.conclusion === 'pass' ? 'success' :
                  row.conclusion === 'conditional_pass' ? 'warning' : 'danger'
                } >
                  {row.conclusion === 'pass' ? '通过' : row.conclusion === 'conditional_pass' ? '附条件通过' : '不通过'}
                </Badge>
              </div>
              <div className="text-xs text-slate-500">合同要求：{row.contractRequirement}</div>
              {row.completionDescription && <div className="text-xs text-slate-600 mt-1">完成情况：{row.completionDescription}</div>}
              <div className="text-xs text-slate-400 mt-1">
                状态：{row.completionStatus} | 完成度：{row.completionRate}%
              </div>
            </div>
          ))}
        </div>
      )}

      {inspection.remark && (
        <div>
          <div className="text-slate-400 mb-1 text-xs">备注</div>
          <div className="bg-slate-50 rounded-lg p-3 text-slate-700">{inspection.remark}</div>
        </div>
      )}
    </div>
  );
}

