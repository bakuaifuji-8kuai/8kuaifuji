import { useMemo, useState, useRef } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ProductPickerModal, { ProductPickerItem } from '@/components/common/ProductPickerModal';
import ImportPreviewModal from '@/components/common/ImportPreviewModal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import { exportDetailList, parseAndValidateExcel, type RowResult } from '@/utils/excelImport';
import type { ProcurementDemand, ProcurementDemandDetail, ProcurementDemandChange, Contract, ProductContract, ProcurementType, ProcurementMode, ProjectRow, DemandChangeRecord, Project, ContractPurchaseOrder, ContractPurchaseOrderDetail } from '@/types';

// ============ 业务分类 <-> 底层 demandType 映射 ============
// 业务分类 + 细分 → 底层模板类型
function subTypeToDemandType(
  bc: 'engineering' | 'non_engineering',
  st: 'construction' | 'service' | 'goods'
): 'implementation_project' | 'service_project' | 'material' {
  if (st === 'construction') return 'implementation_project';
  if (st === 'service') return 'service_project';
  return 'material'; // goods
}

// 反向：底层 demandType → 业务分类 + 细分（老数据兜底）
// 返回字段名必须是 businessCategory / subType，才能直接 spread 进 ProcurementDemand 对象
function demandTypeToCategory(dt: string): { businessCategory: 'engineering' | 'non_engineering'; subType: 'construction' | 'service' | 'goods' } {
  if (dt === 'implementation_project') return { businessCategory: 'engineering', subType: 'construction' };
  if (dt === 'service_project') return { businessCategory: 'engineering', subType: 'service' };
  return { businessCategory: 'engineering', subType: 'goods' }; // material 兜底为 工程类-货物
}

// bc+st 组合成 select 的 value（用双下划线分隔，避免和值里的斜杠冲突）
function makeCategoryKey(bc: string, st: string): string {
  return `${bc}__${st}`;
}

// 从 select value 解析出 bc + st
function parseCategoryKey(key: string): { bc: 'engineering' | 'non_engineering'; st: 'construction' | 'service' | 'goods' } | null {
  const [bc, st] = key.split('__');
  if (bc === 'engineering' || bc === 'non_engineering') {
    if (st === 'construction' || st === 'service' || st === 'goods') {
      return { bc, st };
    }
  }
  return null;
}

// 组合展示标签
function getCategoryLabel(bc?: string, st?: string, dt?: string): string {
  if (bc && st) {
    const bcLabel = bc === 'engineering' ? '工程类' : '非工程类';
    const stLabel = st === 'construction' ? '施工' : st === 'service' ? '服务' : '货物';
    return `${bcLabel} / ${stLabel}`;
  }
  // 兜底：老数据没有 bc/st，根据 demandType 反推
  if (dt) {
    const bc2 = dt === 'implementation_project' ? '工程类' : dt === 'service_project' ? '工程类' : '工程类';
    const st2 = dt === 'implementation_project' ? '施工' : dt === 'service_project' ? '服务' : '货物';
    return `${bc2} / ${st2}`;
  }
  return '-';
}

export default function ProcurementDemandPage() {
  const procurementDemands = useStore((s) => s.procurementDemands);
  const addProcurementDemand = useStore((s) => s.addProcurementDemand);
  const updateProcurementDemand = useStore((s) => s.updateProcurementDemand);
  const deleteProcurementDemand = useStore((s) => s.deleteProcurementDemand);
  const procurementDemandChanges = useStore((s) => s.procurementDemandChanges);
  const addProcurementDemandChange = useStore((s) => s.addProcurementDemandChange);
  const contracts = useStore((s) => s.contracts);
  const productContracts = useStore((s) => s.productContracts);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);
  const implementationProjects = useStore((s) => s.implementationProjects);
  const serviceProjects = useStore((s) => s.serviceProjects);
  // 月度采购计划
  const procurementPlans = useStore((s) => s.procurementPlans);
  // 下游单据：用于变更时校验是否被引用
  const biddings = useStore((s) => s.biddings);
  const procurementOrders = useStore((s) => s.procurementOrders);
  const contractPurchaseOrders = useStore((s) => s.contractPurchaseOrders);

  /** 检查某需求是否已被下游单据引用，返回引用单据列表（空数组=未被引用） */
  const getDownstreamRefs = (demandId: string, demandNo: string) => {
    const refs: { type: string; no: string; name: string }[] = [];
    // 招采工单
    biddings.forEach((b) => {
      if (b.demandId === demandId || b.demandNo === demandNo) {
        refs.push({ type: '招采工单', no: b.biddingNo, name: b.biddingName || '-' });
      }
    });
    // 采购订单
    procurementOrders.forEach((o) => {
      if (o.demandId === demandId || o.demandNo === demandNo) {
        refs.push({ type: '采购订单', no: o.orderNo, name: '-' });
      }
    });
    // 合同采购订单
    contractPurchaseOrders.forEach((o) => {
      if (o.procurementDemandId === demandId || o.procurementDemandNo === demandNo) {
        refs.push({ type: '合同采购订单', no: o.orderNo, name: o.productContractNo || '-' });
      }
    });
    return refs;
  };

  // 从已审批的月度采购计划中提取项目列表（去重）
  const availableProjects = useMemo(() => {
    const projectMap = new Map<string, { planId: string; planNo: string; projectName: string }>();
    procurementPlans
      .filter(p => p.planType === 'monthly' && p.status === 'approved')
      .forEach(plan => {
        plan.details?.forEach(detail => {
          if (detail.projectName && !projectMap.has(detail.projectName)) {
            projectMap.set(detail.projectName, {
              planId: plan.id,
              planNo: plan.planNo,
              projectName: detail.projectName,
            });
          }
        });
      });
    return Array.from(projectMap.values());
  }, [procurementPlans]);

  const [filterNo, setFilterNo] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProcurementType, setFilterProcurementType] = useState('');
  const [applied, setApplied] = useState({ no: '', department: '', status: '', procurementType: '' });

  const filteredData = useMemo(() => {
    return procurementDemands
      .filter((d) => {
        if (applied.no && !d.demandNo.includes(applied.no)) return false;
        if (applied.department && !d.applicantDept.includes(applied.department)) return false;
        if (applied.status && d.status !== applied.status) return false;
        if (applied.procurementType && d.procurementType !== applied.procurementType) return false;
        return true;
      })
      // 按创建时间倒序：最新的在最前面，确保新增后在第 1 页可见
      .sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  }, [procurementDemands, applied]);

  const columns: ColumnDef<ProcurementDemand>[] = [
    { key: 'demandNo', title: '采购编号' },
    {
      key: 'demandType',
      title: '业务分类',
      render: (row) => {
        return getCategoryLabel(row.businessCategory, row.subType, row.demandType);
      },
    },
    {
      key: 'procurementType',
      title: '框架合同清单内/外采购',
      render: (row) => {
        const map: Record<string, { label: string; color: string }> = {
          within_framework: { label: '清单内采购', color: 'text-[#409eff]' },
          outside_framework: { label: '清单外采购', color: 'text-[#e6a23c]' },
          new_supplier: { label: '新增供应商', color: 'text-[#67c23a]' },
        };
        const item = map[row.procurementType] || { label: '-', color: '' };
        return <span className={item.color}>{item.label}</span>;
      },
    },
    { key: 'projectName', title: '项目名称' },
    { key: 'applicant', title: '申请人' },
    { key: 'applicantDept', title: '申请部门' },
    {
      key: 'status',
      title: '状态',
      render: (row) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'text-[#909399]' },
          pending: { label: '待审批', color: 'text-[#e6a23c]' },
          approved: { label: '已通过（待立项）', color: 'text-[#409eff]' },
          rejected: { label: '已驳回', color: 'text-[#f56c6c]' },
          changed: { label: '已变更', color: 'text-[#409eff]' },
          confirm_pending: { label: '立项审批中', color: 'text-[#e6a23c]' },
          confirm_approved: { label: '立项已通过', color: 'text-[#67c23a]' },
          confirm_rejected: { label: '立项已驳回', color: 'text-[#f56c6c]' },
        };
        const status = statusMap[row.status] || statusMap.draft;
        return <span className={status.color}>{status.label}</span>;
      },
    },
    { key: 'applyDate', title: '申请日期' },
    {
      key: 'totalAmount',
      title: '预估金额',
      render: (row) => {
        const total = row.details.reduce((sum, d) => sum + (d.amountIncludingTax || 0), 0);
        return total > 0 ? `¥${total.toLocaleString()}` : '-';
      },
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <TextButton onClick={() => {
            // 老数据兜底：如果没有 businessCategory/subType，从 demandType 反推
            const r = row.businessCategory && row.subType
              ? row
              : { ...row, ...demandTypeToCategory(row.demandType) };
            setEditItem(r); setProjectRows(row.projectRows || []); setDetails(row.details || []);
            setIsNew(false);
          }}>编辑</TextButton>
          <TextButton onClick={() => viewDetail(row)}>查看详情</TextButton>
          {row.status === 'approved' && (() => {
            const downstreamRefs = getDownstreamRefs(row.id, row.demandNo);
            if (downstreamRefs.length > 0) {
              return (
                <span
                  className="text-slate-300 cursor-not-allowed text-[13px]"
                  title={`已被下游引用，无法变更：\n${downstreamRefs.map(r => `- ${r.type} ${r.no}`).join('\n')}`}
                >发起变更</span>
              );
            }
            return <TextButton onClick={() => openChange(row)}>发起变更</TextButton>;
          })()}
          {row.status === 'draft' && (
            <TextButton onClick={() => handleSubmit(row)}>提交审批</TextButton>
          )}
          {row.status === 'pending' && (
            <>
              <TextButton onClick={() => handleApprove(row)}>审批通过</TextButton>
              <TextButton type="danger" onClick={() => handleReject(row)}>驳回</TextButton>
            </>
          )}
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除需求申请 ${row.demandNo}？`)) deleteProcurementDemand(row.id);
            }}
          >
            删除
          </TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<ProcurementDemand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [details, setDetails] = useState<ProcurementDemandDetail[]>([]);
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([]);
  const [viewItem, setViewItem] = useState<ProcurementDemand | null>(null);
  const [changeItem, setChangeItem] = useState<ProcurementDemandChange | null>(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPickerItem[]>([]);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false); // 项目选择弹窗
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // 选中的项目
  // 导入相关
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importResults, setImportResults] = useState<RowResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 查询某物资是否有有效合同
  const findActiveContractForProduct = (productId: string): { contract: Contract; productContract: ProductContract } | null => {
    const now = new Date();
    const pcs = productContracts.filter((pc) => pc.productId === productId);
    for (const pc of pcs) {
      const c = contracts.find((ct) => ct.id === pc.contractId);
      if (!c) continue;
      if (c.status !== 'active') continue;
      if (c.startDate && new Date(c.startDate) > now) continue;
      if (c.endDate && new Date(c.endDate) < now) continue;
      return { contract: c, productContract: pc };
    }
    return null;
  };

  // 选择物资后填充明细
  const handleProductsSelected = (products: ProductPickerItem[]) => {
    const existingProductIds = new Set(
      details.map((d) => (d as any).productId).filter(Boolean)
    );
    const newDetails: ProcurementDemandDetail[] = products
      .filter((p) => !existingProductIds.has(p.id))
      .map((p) => {
        const contractInfo = findActiveContractForProduct(p.id);
        const taxRate = contractInfo?.productContract.taxRate ?? 13;
        const unitPriceIncludingTax = contractInfo?.productContract.unitPrice ?? 0;
        const unitPriceExcludingTax = unitPriceIncludingTax > 0
          ? +(unitPriceIncludingTax / (1 + taxRate / 100)).toFixed(4)
          : 0;
        const quantity = 1;
        const amountExcludingTax = +(unitPriceExcludingTax * quantity).toFixed(2);
        const taxAmount = +(amountExcludingTax * (taxRate / 100)).toFixed(2);
        const amountIncludingTax = +(amountExcludingTax + taxAmount).toFixed(2);

        const detail: ProcurementDemandDetail = {
          id: 'PDD' + Date.now() + '_' + p.id,
          demandId: editItem?.id || '',
          projectId: selectedProject?.id,
          projectNo: selectedProject?.projectNo,
          projectName: selectedProject?.projectName,
          projectType: editItem?.demandType === 'implementation_project' ? 'implementation' : editItem?.demandType === 'service_project' ? 'service' : undefined,
          productId: p.id,
          productCode: p.code || '',
          productName: p.name,
          productType: p.categoryName || '',
          productAttribute: (p as any).productAttribute || '',
          specification: p.specification || '',
          unit: p.unit || '',
          isInContractList: !!contractInfo,
          isContractItem: !!contractInfo,
          taxRate,
          unitPriceIncludingTax,
          unitPriceExcludingTax,
          unitPriceRemark: contractInfo ? `合同固定单价(${contractInfo.contract.contractNo})` : '',
          quantity,
          amountExcludingTax,
          taxAmount,
          amountIncludingTax,
          stockQuantity: (p as any).stockQuantity ?? 0,
          costAuditUnitPriceExcludingTax: unitPriceExcludingTax,
          costAuditUnitPriceIncludingTax: unitPriceIncludingTax,
          costAuditAmountIncludingTax: amountIncludingTax,
          remark: contractInfo ? `来自合同：${contractInfo.contract.contractName}` : '',
          contractId: contractInfo?.contract.id,
          contractNo: contractInfo?.contract.contractNo,
          contractExpiryDate: contractInfo
            ? `${contractInfo.contract.startDate} ~ ${contractInfo.contract.endDate}`
            : '',
          procurementDescription: '',
        };
        return detail;
      });

    if (newDetails.length === 0) {
      setProductPickerOpen(false);
      setSelectedProject(null);
      return;
    }
    setDetails([...details, ...newDetails]);
    setProductPickerOpen(false);
    setSelectedProject(null);
  };

  const openAdd = () => {
    const now = new Date();
    const newDemand: ProcurementDemand = {
      id: 'PD' + Date.now(),
      demandNo: '',   // 保存时才生成编号
      demandType: 'material',
      businessCategory: 'engineering',
      subType: 'goods',
      procurementType: 'outside_framework',
      applicant: currentUser.name,
      applicantDept: '采购部门',
      applyDate: now.toISOString().slice(0, 10),
      projectName: '',
      reason: '',
      status: 'draft',
      createTime: now.toISOString().replace('T', ' ').slice(0, 19),
      details: [],
      budgetAudit: undefined,
    };
    setDetails([]); setProjectRows([]);
    setAttachments([]);
    setIsNew(true);
    setEditItem(newDemand);
  };

  const viewDetail = (demand: ProcurementDemand) => {
    setViewItem(demand);
  };

  // 提交审批：draft → pending（立项方式在"招采需求确认管理"环节选择）
  const handleSubmit = (demand: ProcurementDemand) => {
    updateProcurementDemand(demand.id, { status: 'pending' });
  };

  // 审批通过：pending → approved（不再自动生成下游订单，立项确认通过后才生成）
  const handleApprove = (demand: ProcurementDemand) => {
    updateProcurementDemand(demand.id, {
      status: 'approved',
      approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      approver: currentUser.name,
    });
  };

  const handleReject = (demand: ProcurementDemand) => {
    const reason = prompt('请输入驳回原因：');
    if (reason) {
      updateProcurementDemand(demand.id, {
        status: 'draft',
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        approver: currentUser.name,
        remark: `驳回原因：${reason}`,
      });
    }
  };

  // 发起变更
  const openChange = (demand: ProcurementDemand) => {
    // 1. 只有审批通过的才可发起变更
    if (demand.status !== 'approved') {
      alert('只有审批通过的需求申请才可发起变更');
      return;
    }
    // 2. 校验是否已被下游单据引用
    const refs = getDownstreamRefs(demand.id, demand.demandNo);
    if (refs.length > 0) {
      const refText = refs.map((r) => `- ${r.type} ${r.no}（${r.name}）`).join('\n');
      alert(`该需求已被下游使用，无法发起变更：\n\n${refText}\n\n请先处理下游单据后再操作。`);
      return;
    }
    const isProjectType = demand.demandType === 'implementation_project' || demand.demandType === 'service_project';
    const change: ProcurementDemandChange = {
      id: 'PDC' + Date.now(),
      demandId: demand.id,
      demandType: demand.demandType,
      changeNo: `BG${demand.demandNo}`,
      changeReason: '',
      changeTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      changer: currentUser.name,
      beforeDetails: isProjectType ? [] : [...demand.details],
      afterDetails: isProjectType ? [] : [...demand.details],
      beforeProjectRows: isProjectType ? (demand.projectRows ?? []).map(r => ({ ...r })) : undefined,
      afterProjectRows: isProjectType ? (demand.projectRows ?? []).map(r => ({ ...r })) : undefined,
      status: 'pending',
    };
    setChangeItem(change);
  };

  const handleSave = () => {
    console.log('[handleSave] START isNew=', isNew, 'editItem=', JSON.stringify(editItem).substring(0, 300));
    if (!editItem) return;
    // 新增时才生成编号，编辑保留原编号
    if (isNew && !editItem.demandNo) {
      editItem.demandNo = genSerialNo(SERIAL_CONFIG.DEMAND, procurementDemands.map(d => d.demandNo));
      console.log('[handleSave] generated demandNo=', editItem.demandNo);
    }
    const saveDemand = { ...editItem, details, projectRows };
    console.log('[handleSave] saveDemand=', JSON.stringify(saveDemand).substring(0, 400));
    console.log('[handleSave] BEFORE store has', procurementDemands.length, 'items');
    if (isNew) {
      addProcurementDemand(saveDemand);
    } else {
      updateProcurementDemand(saveDemand.id, saveDemand);
    }
    // 用 setTimeout 确保 state 已更新后再读
    setTimeout(() => {
      const cur = useStore.getState();
      console.log('[handleSave] AFTER store has', cur.procurementDemands.length, 'items');
    }, 50);
    setEditItem(null);
    setDetails([]); setProjectRows([]);
  };

  // ========== 导出清单（当前明细完整数据） ==========
  const handleExportList = () => {
    if (!editItem) return;
    if (details.length === 0) {
      alert('当前明细为空，无数据可导出');
      return;
    }
    exportDetailList(details, editItem.procurementType);
  };

  // ========== 导入清单 ==========
  const handleImportClick = () => {
    if (!editItem) return;
    if (editItem.demandType !== 'material') {
      alert('仅物资采购类型支持导入清单');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!editItem) return;

    try {
      const results = await parseAndValidateExcel(
        file,
        editItem.procurementType,
        {
          products,
          productContracts,
          contracts,
        },
      );
      setImportResults(results);
      setImportPreviewOpen(true);
    } catch (err: any) {
      alert(err?.message || '文件解析失败');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = (rows: RowResult[]) => {
    // 整体替换：以 Excel 为准
    const newDetails: ProcurementDemandDetail[] = rows
      .filter((r) => r.detail)
      .map((r, i) => ({
        id: `IMPORT_${Date.now()}_${i}`,
        ...r.detail,
      } as ProcurementDemandDetail));
    setDetails(newDetails);
    setImportPreviewOpen(false);
    setImportResults([]);
  };

  // 优先从物资档案选择（按采购类型过滤）
  const addDetail = () => {
    if (!editItem) return;

    // 服务项目和实施项目类型：先选择项目，再选择物资
    if (editItem.demandType === 'implementation_project' || editItem.demandType === 'service_project') {
      setProjectPickerOpen(true);
      return;
    }

    // 物资采购类型：直接进入物资档案选择
    // 物资采购类型：按采购类型过滤物资（框架采购/单次采购）
    const now = new Date();
    const hasContract = (pid: string) => {
      return productContracts.some((pc) => {
        if (pc.productId !== pid) return false;
        const c = contracts.find((ct) => ct.id === pc.contractId);
        if (!c || c.status !== 'active') return false;
        if (c.startDate && new Date(c.startDate) > now) return false;
        if (c.endDate && new Date(c.endDate) < now) return false;
        return true;
      });
    };
    let filtered: any[] = products;
    if (editItem.procurementType === 'within_framework') {
      // 清单内：有有效合同的物资 + 注入 contractNo 供弹窗筛选
      filtered = products
        .filter((p) => hasContract(p.id))
        .map((p) => {
          const pc = productContracts.find((x) => x.productId === p.id);
          const c = pc ? contracts.find((ct) => ct.id === pc.contractId) : null;
          return { ...p, contractNo: c?.contractNo || pc?.contractNo || '' };
        });
    } else if (editItem.procurementType === 'outside_framework') {
      filtered = products.filter((p) => !hasContract(p.id));
    } else {
      // new_supplier：不过滤，清单内+清单外全部可选
      filtered = products;
    }
    setFilteredProducts(filtered as any);
    setProductPickerOpen(true);
  };

  // 选择项目后打开物资选择弹窗
  const handleProjectSelected = (project: Project) => {
    setSelectedProject(project);
    setProjectPickerOpen(false);
    setFilteredProducts([]);
    setProductPickerOpen(true);
  };

  // 手动添加空行（非物资类）
  const addEmptyDetail = () => {
    if (!editItem) return;
    // 手动添加时，如果是项目类型，需要选择项目
    if (editItem.demandType === 'implementation_project' || editItem.demandType === 'service_project') {
      setProjectPickerOpen(true);
      return;
    }

    const newDetail: ProcurementDemandDetail = {
      id: 'PDD' + Date.now(),
      demandId: editItem.id || '',
      productCode: '',
      productName: '',
      productType: '',
      productAttribute: '',
      specification: '',
      unit: '',
      isInContractList: false,
      isContractItem: false,
      unitPriceExcludingTax: 0,
      unitPriceIncludingTax: 0,
      taxRate: 13,
      unitPriceRemark: '',
      quantity: 1,
      amountExcludingTax: 0,
      taxAmount: 0,
      amountIncludingTax: 0,
      stockQuantity: 0,
      costAuditUnitPriceExcludingTax: 0,
      costAuditUnitPriceIncludingTax: 0,
      costAuditAmountIncludingTax: 0,
      contractNo: '',
      contractExpiryDate: '',
      procurementDescription: '',
      remark: '',
    };
    setDetails([...details, newDetail]);
  };

  const updateDetail = (index: number, field: keyof ProcurementDemandDetail, value: any) => {
    const newDetails = [...details];
    const detail = { ...newDetails[index] } as any;

    // 锁定规则：清单内场景 + 有合同物资 → 物料信息字段全部只读
    const isLocked = editItem?.procurementType === 'within_framework' && (detail.isContractItem || detail.productId);

    // 合同物资 / 清单内锁定的字段：物料信息 + 价格 + 合同信息
    const lockedFields: (keyof ProcurementDemandDetail)[] = [
      'productCode', 'productType', 'productName', 'specification', 'unit',
      'unitPriceExcludingTax', 'unitPriceIncludingTax', 'taxRate',
      'contractNo', 'contractExpiryDate',
    ];
    if (isLocked && lockedFields.includes(field)) {
      return;
    }

    detail[field] = value;

    // 采购侧：数量 / 不含税单价 / 税率 变化 → 自动计算金额
    const purchaseFields = ['quantity', 'unitPriceExcludingTax', 'taxRate'] as (keyof ProcurementDemandDetail)[];
    if (purchaseFields.includes(field)) {
      const unitPriceEx = Number(detail.unitPriceExcludingTax) || 0;
      const rate = Number(detail.taxRate) || 0;
      const qty = Number(detail.quantity) || 0;
      const amountEx = +(unitPriceEx * qty).toFixed(2);
      const taxAmt = +(amountEx * (rate / 100)).toFixed(2);
      const amountInc = +(amountEx + taxAmt).toFixed(2);
      const unitPriceInc = +(unitPriceEx * (1 + rate / 100)).toFixed(4);
      detail.unitPriceIncludingTax = unitPriceInc;
      detail.amountExcludingTax = amountEx;
      detail.taxAmount = taxAmt;
      detail.amountIncludingTax = amountInc;

      // 同步到成本审核侧（以采购金额为基础）
      const auditUnitPriceEx = Number(detail.costAuditUnitPriceExcludingTax) || unitPriceEx;
      detail.costAuditUnitPriceExcludingTax = auditUnitPriceEx;
      detail.costAuditUnitPriceIncludingTax = +(auditUnitPriceEx * (1 + rate / 100)).toFixed(4);
      detail.costAuditAmountIncludingTax = +(detail.costAuditUnitPriceIncludingTax * qty).toFixed(2);
    }

    // 成本审核：单价(不含税) 变化 → 自动计算含税单价、含税金额
    if (field === 'costAuditUnitPriceExcludingTax') {
      const auditUnitEx = Number(value) || 0;
      const rate = Number(detail.taxRate) || 0;
      const qty = Number(detail.quantity) || 0;
      detail.costAuditUnitPriceIncludingTax = +(auditUnitEx * (1 + rate / 100)).toFixed(4);
      detail.costAuditAmountIncludingTax = +(detail.costAuditUnitPriceIncludingTax * qty).toFixed(2);
    }

    newDetails[index] = detail;
    setDetails(newDetails);
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // ========== 服务/工程类：多行项目明细操作 ==========
  const addProjectRow = () => {
    setProjectRows([
      ...projectRows,
      {
        id: 'PR' + Date.now() + Math.random().toString(36).slice(2, 6),
        dept: editItem?.applicantDept || '',
        projectName: '',
        mainContent: '',
        budgetAmount: 0,
        budgetControlAmount: 0,
        approvalMeetingName: '',
        approvalDate: '',
        remark: '',
      },
    ]);
  };

  const removeProjectRow = (index: number) => {
    setProjectRows(projectRows.filter((_, i) => i !== index));
  };

  const updateProjectRow = (index: number, field: keyof ProjectRow, value: any) => {
    const newRows = [...projectRows];
    (newRows[index] as any)[field] = value;
    setProjectRows(newRows);
  };

  const totalAmount = details.reduce((sum, d) => sum + (d.amountIncludingTax || 0), 0);

  // 变更操作
  const updateChangeDetail = (index: number, field: keyof ProcurementDemandDetail, value: any) => {
    if (!changeItem) return;
    const newDetails = [...changeItem.afterDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setChangeItem({ ...changeItem, afterDetails: newDetails });
  };

  const removeChangeDetail = (index: number) => {
    if (!changeItem) return;
    setChangeItem({
      ...changeItem,
      afterDetails: changeItem.afterDetails.filter((_, i) => i !== index),
    });
  };

  const submitChange = () => {
    if (!changeItem) return;
    const isProjectType = changeItem.beforeProjectRows !== undefined;
    // 创建变更历史记录
    const changeRecord: DemandChangeRecord = {
      id: changeItem.id,
      changeNo: changeItem.changeNo,
      changeReason: changeItem.changeReason,
      changeTime: changeItem.changeTime,
      changer: changeItem.changer,
      beforeDetails: changeItem.beforeDetails,
      afterDetails: changeItem.afterDetails,
      beforeProjectRows: changeItem.beforeProjectRows,
      afterProjectRows: changeItem.afterProjectRows,
      status: 'pending',
    };
    // 查找原需求
    const originalDemand = procurementDemands.find((d) => d.id === changeItem.demandId);
    if (!originalDemand) return;
    // 更新需求状态为待审核，并追加变更历史
    const updatedHistory = [...(originalDemand.changeHistory || []), changeRecord];
    const updateData: Partial<ProcurementDemand> = {
      status: 'pending',
      changeHistory: updatedHistory,
    };
    if (isProjectType) {
      updateData.projectRows = changeItem.afterProjectRows;
    } else {
      updateData.details = changeItem.afterDetails;
    }
    updateProcurementDemand(changeItem.demandId, updateData);
    // 同时记录到变更申请台账
    addProcurementDemandChange(changeItem);
    setChangeItem(null);
    alert('变更申请已提交，需重新审核');
  };


  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">采购需求申请</h2>
        <PrimaryButton onClick={openAdd}>+ 新增需求申请</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, department: filterDepartment, status: filterStatus, procurementType: filterProcurementType })}
        onReset={() => {
          setFilterNo('');
          setFilterDepartment('');
          setFilterStatus('');
          setFilterProcurementType('');
          setApplied({ no: '', department: '', status: '', procurementType: '' });
        }}
      >
        <SearchField label="采购编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="申请部门" placeholder="请输入" value={filterDepartment} onChange={setFilterDepartment} />
        <SearchField
          label="状态"
          type="select"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'pending', label: '待审批' },
            { value: 'approved', label: '已通过' },
            { value: 'rejected', label: '已驳回' },
            { value: 'changed', label: '已变更' },
          ]}
        />
        <SearchField
          label="框架合同清单内/外采购"
          type="select"
          value={filterProcurementType}
          onChange={setFilterProcurementType}
          options={[
            { value: '', label: '全部' },
            { value: 'within_framework', label: '清单内采购' },
            { value: 'outside_framework', label: '清单外采购' },
            { value: 'new_supplier', label: '新增供应商' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增采购需求申请' : '编辑采购需求申请'}
        onClose={() => { setEditItem(null); setDetails([]); setProjectRows([]); setAttachments([]); setIsNew(false); }}
        footer={
          <>
            <DefaultButton onClick={() => { setEditItem(null); setDetails([]); setProjectRows([]); setAttachments([]); setIsNew(false); }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="100vw"
      >
        {editItem && (
          <div className="space-y-4" style={{ minHeight: '560px' }}>
            {/* 上方：基础信息 */}
            <div className="space-y-3">
              {/* 业务决策维度：业务类型* + 框架合同清单内/外采购*  — 两连（需求立项方式在"提交审批"时弹框选择） */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">业务类型<span className="text-[#f56c6c] ml-0.5">*</span></div>
                  <select
                    className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                    value={(editItem.businessCategory && editItem.subType)
                      ? makeCategoryKey(editItem.businessCategory, editItem.subType)
                      : ''}
                    onChange={(e) => {
                      const parsed = parseCategoryKey(e.target.value);
                      if (!parsed) return;
                      const dt = subTypeToDemandType(parsed.bc, parsed.st);
                      setEditItem({ ...editItem, businessCategory: parsed.bc, subType: parsed.st, demandType: dt });
                    }}
                  >
                    <option value="" disabled>请选择</option>
                    <option value={makeCategoryKey('engineering', 'construction')}>工程类 / 施工</option>
                    <option value={makeCategoryKey('engineering', 'service')}>工程类 / 服务</option>
                    <option value={makeCategoryKey('engineering', 'goods')}>工程类 / 货物（含材料和设备）</option>
                    <option value={makeCategoryKey('non_engineering', 'service')}>非工程类 / 服务</option>
                    <option value={makeCategoryKey('non_engineering', 'goods')}>非工程类 / 货物（含材料和设备）</option>
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">框架合同清单内/外采购<span className="text-[#f56c6c] ml-0.5">*</span></div>
                  <select
                    className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                    value={editItem.procurementType}
                    onChange={(e) => setEditItem({ ...editItem, procurementType: e.target.value as ProcurementType })}
                  >
                    <option value="within_framework">框架合同清单内</option>
                    <option value="outside_framework">框架合同清单外</option>
                    <option value="new_supplier">新增供应商目录</option>
                  </select>
                </div>
              </div>

              {/* 第二排：采购编号 | 申请人 | 申请部门 | 项目名称* — 4 列等宽，项目名称稍宽 */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 2fr' }}>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">采购编号</div>
                  {isNew ? (
                    <input
                      disabled
                      placeholder="保存后自动生成"
                      className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm bg-[#f5f7fa] text-[#c0c4cc]"
                      value={editItem.demandNo || ''}
                    />
                  ) : (
                    <input
                      disabled
                      className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm bg-[#f5f7fa]"
                      value={editItem.demandNo}
                    />
                  )}
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">申请人</div>
                  <input
                    className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                    value={editItem.applicant}
                    onChange={(e) => setEditItem({ ...editItem, applicant: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">申请部门</div>
                  <input
                    className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                    value={editItem.applicantDept}
                    onChange={(e) => setEditItem({ ...editItem, applicantDept: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">项目名称 <span className="text-[#f56c6c]">*</span></div>
                  <input
                    className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                    placeholder="请输入项目名称"
                    value={editItem.projectName}
                    onChange={(e) => setEditItem({ ...editItem, projectName: e.target.value })}
                  />
                </div>
              </div>

              {/* 第三排：申请事由（占 70%） + 附件上传（占 30%） */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '7fr 3fr' }}>
                <div>
                  <div className="mb-1 text-xs text-[#606266]">申请事由</div>
                  <textarea
                    className="w-full h-16 px-2 border border-[#dcdfe6] rounded text-sm resize-none"
                    value={editItem.reason}
                    onChange={(e) => setEditItem({ ...editItem, reason: e.target.value })}
                  />
                </div>
                <div className="border border-dashed border-[#dcdfe6] rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#606266] font-semibold">附件上传</span>
                      <span className="relative group cursor-help">
                        <svg className="w-3.5 h-3.5 text-[#909399]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#303133] text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          支持会议纪要及上会材料、签呈审批相关文件、预算审核文件、用户需求书/施工方案等多种附件上传。支持上传多个附件。
                        </div>
                      </span>
                    </div>
                    <label className="cursor-pointer text-xs text-[#409eff] hover:underline">
                      + 上传附件
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            setAttachments([...attachments, ...Array.from(e.target.files)]);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  {attachments.length === 0 ? (
                    <div className="text-xs text-[#c0c4cc] text-center py-2">暂未上传附件</div>
                  ) : (
                    <ul className="space-y-1 max-h-16 overflow-auto">
                      {attachments.map((f, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs text-[#606266] bg-[#f5f7fa] px-2 py-1 rounded">
                          <span className="truncate" style={{ maxWidth: 160 }}>📎 {f.name}</span>
                          <button
                            className="text-[#f56c6c] hover:underline flex-shrink-0"
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                          >
                            删除
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 下方：根据需求类型切换 — 物资类显示明细表，服务/工程类显示项目明细多行表 */}
            {editItem.demandType === 'material' ? (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-6">
                  <span className="text-[#606266] font-semibold">采购申请需求明细清单表</span>
                  <span className="text-xs text-[#909399]">
                    明细数量：<span className="text-[#606266]">{details.length} 条</span>
                    <span className="mx-3 text-[#dcdfe6]">|</span>
                    含税总金额：<span className="text-[#f56c6c] font-semibold">¥{details.reduce((s, d) => s + (d.amountIncludingTax || 0), 0).toFixed(2)}</span>
                    <span className="mx-3 text-[#dcdfe6]">|</span>
                    不含税：<span className="text-[#606266]">¥{details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0).toFixed(2)}</span>
                    <span className="mx-3 text-[#dcdfe6]">|</span>
                    税额：<span className="text-[#606266]">¥{details.reduce((s, d) => s + (d.taxAmount || 0), 0).toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <DefaultButton size="small" onClick={handleExportList}>导出清单</DefaultButton>
                  <DefaultButton size="small" onClick={handleImportClick}>导入清单</DefaultButton>
                  <PrimaryButton size="small" onClick={addDetail}>+ 选择物资</PrimaryButton>
                </div>
              </div>
              <div className="border border-[#dcdfe6] rounded overflow-auto" style={{ maxHeight: 'calc(100vh - 440px)', minHeight: '360px' }}>
                <table className="text-xs" style={{ minWidth: 2800 }}>
                  <thead className="sticky top-0 bg-[#f5f7fa]">
                    {/* 第一层：分组表头 */}
                    <tr>
                      <th colSpan={2} className="px-2 py-2 text-left border border-[#dcdfe6]">项目信息</th>
                      <th colSpan={6} className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
                      <th colSpan={9} className="px-2 py-2 text-center border border-[#dcdfe6] font-semibold">采购申请</th>
                      <th colSpan={4} className="px-2 py-2 text-center border border-[#dcdfe6] font-semibold">成本审核</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6]"></th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-20">操作</th>
                    </tr>
                    {/* 第二层：列名 */}
                    <tr>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">项目编号</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-32">项目名称</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-20">产品属性</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-20">商品编码</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">产品类型</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-32">产品名称</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-28">规格型号/参数</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-14">单位</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">是否在合同清单内</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">单价(不含税)</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">单价(含税)</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-16">税率</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-28">单价备注</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-20">采购数量</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">不含税金额</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-20">税额</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">含税金额</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] bg-[#fff9c4] w-20">库存数量</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">单价(不含税)</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">单价(含税)</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">含税金额</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-24">备注</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-20">合同编号</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-32">合同有效期</th>
                      <th className="px-2 py-2 text-left border border-[#dcdfe6] w-36">采购情况说明</th>
                      <th className="px-2 py-2 text-center border border-[#dcdfe6] w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => {
                      // 清单内 + 有物资 → 物料信息只读
                      const rowLocked: boolean = editItem?.procurementType === 'within_framework' && !!(detail.isContractItem || detail.productId);
                      const lockedCls = rowLocked ? 'bg-[#f0f0f0] text-[#909399] cursor-not-allowed' : '';
                      return (
                      <tr
                        key={detail.id}
                        className={`border-t border-[#dcdfe6] ${detail.isContractItem ? 'bg-[#fffbeb]' : ''}`}
                      >
                        {/* 项目编号 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          {detail.projectNo ? (
                            <span className="text-[#606266]">{detail.projectNo}</span>
                          ) : (
                            <span className="text-[#c0c4cc]">-</span>
                          )}
                        </td>
                        {/* 项目名称 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          {detail.projectName ? (
                            <span className="text-[#606266]">{detail.projectName}</span>
                          ) : (
                            <span className="text-[#c0c4cc]">-</span>
                          )}
                        </td>
                        {/* 产品属性 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className="w-full h-6 px-1 border border-[#dcdfe6] rounded"
                            value={detail.productAttribute || ''}
                            onChange={(e) => updateDetail(index, 'productAttribute', e.target.value)}
                          />
                        </td>
                        {/* 商品编码 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.productCode}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'productCode', e.target.value)}
                          />
                        </td>
                        {/* 产品类型 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.productType || ''}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'productType', e.target.value)}
                          />
                        </td>
                        {/* 产品名称 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.productName}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'productName', e.target.value)}
                          />
                        </td>
                        {/* 规格型号 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.specification || ''}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'specification', e.target.value)}
                          />
                        </td>
                        {/* 单位 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.unit}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'unit', e.target.value)}
                          />
                        </td>
                        {/* 是否在合同清单内 */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-center">
                          <span className={`${detail.isInContractList ? 'text-[#059669] font-semibold' : 'text-[#909399]'}`}>
                            {detail.isInContractList ? '是' : '否'}
                          </span>
                        </td>
                        {/* 单价(不含税) */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            type="number" step="0.0001"
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.unitPriceExcludingTax ?? 0}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'unitPriceExcludingTax', Number(e.target.value))}
                          />
                        </td>
                        {/* 单价(含税) */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <span className="text-[#606266]">{(detail.unitPriceIncludingTax ?? 0).toFixed(4)}</span>
                        </td>
                        {/* 税率 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            type="number" step="0.01"
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.taxRate ?? 0}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'taxRate', Number(e.target.value))}
                          />
                        </td>
                        {/* 单价备注 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className="w-full h-6 px-1 border border-[#dcdfe6] rounded"
                            value={detail.unitPriceRemark || ''}
                            onChange={(e) => updateDetail(index, 'unitPriceRemark', e.target.value)}
                            placeholder="如：合同固定单价"
                          />
                        </td>
                        {/* 采购数量 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            type="number"
                            className="w-full h-6 px-1 border border-[#dcdfe6] rounded"
                            value={detail.quantity}
                            onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                          />
                        </td>
                        {/* 不含税金额 */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-[#606266] text-right pr-2">
                          {(detail.amountExcludingTax || 0).toFixed(2)}
                        </td>
                        {/* 税额 */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-[#606266] text-right pr-2">
                          {(detail.taxAmount || 0).toFixed(2)}
                        </td>
                        {/* 含税金额 */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-[#606266] text-right pr-2">
                          {(detail.amountIncludingTax || 0).toFixed(2)}
                        </td>
                        {/* 库存数量（黄色高亮） */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-right pr-2" style={{ backgroundColor: '#fff9c4' }}>
                          <span className="text-[#ef4444] font-medium">{detail.stockQuantity ?? 0}</span>
                        </td>
                        {/* 成本审核-单价(不含税) */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            type="number" step="0.0001"
                            className="w-full h-6 px-1 border border-[#dcdfe6] rounded"
                            value={detail.costAuditUnitPriceExcludingTax ?? 0}
                            onChange={(e) => updateDetail(index, 'costAuditUnitPriceExcludingTax', Number(e.target.value))}
                          />
                        </td>
                        {/* 成本审核-单价(含税) */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <span className="text-[#606266]">{(detail.costAuditUnitPriceIncludingTax ?? 0).toFixed(4)}</span>
                        </td>
                        {/* 成本审核-含税金额 */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-[#606266] text-right pr-2">
                          {(detail.costAuditAmountIncludingTax || 0).toFixed(2)}
                        </td>
                        {/* 成本审核-备注 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className="w-full h-6 px-1 border border-[#dcdfe6] rounded"
                            value={detail.remark || ''}
                            onChange={(e) => updateDetail(index, 'remark', e.target.value)}
                          />
                        </td>
                        {/* 合同编号 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.contractNo || ''}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'contractNo', e.target.value)}
                          />
                        </td>
                        {/* 合同有效期 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className={`w-full h-6 px-1 border border-[#dcdfe6] rounded ${lockedCls}`}
                            value={detail.contractExpiryDate || ''}
                            readOnly={rowLocked}
                            onChange={(e) => updateDetail(index, 'contractExpiryDate', e.target.value)}
                            placeholder="YYYY-MM-DD"
                          />
                        </td>
                        {/* 采购情况说明 */}
                        <td className="px-2 py-1 border border-[#ebeef5]">
                          <input
                            className="w-full h-6 px-1 border border-[#dcdfe6] rounded"
                            value={detail.procurementDescription || ''}
                            onChange={(e) => updateDetail(index, 'procurementDescription', e.target.value)}
                          />
                        </td>
                        {/* 操作 */}
                        <td className="px-2 py-1 border border-[#ebeef5] text-center">
                          <TextButton type="danger" size="small" onClick={() => removeDetail(index)}>删除</TextButton>
                        </td>
                      </tr>
                      );
                    })}
                    {details.length === 0 && (
                      <tr>
                        <td colSpan={24} className="px-3 py-6 text-center text-[#909399]">暂无明细，请点击"+ 选择物资"</td>
                      </tr>
                    )}
                  </tbody>
                  {/* 总计行 */}
                  <tfoot className="bg-[#f5f7fa] font-semibold">
                    <tr>
                      <td colSpan={12} className="px-2 py-2 border border-[#dcdfe6] text-right text-[#303133]">
                        总计（元）
                      </td>
                      <td className="px-2 py-2 border border-[#dcdfe6] text-right text-[#303133]">
                        {details.reduce((s, d) => s + (d.amountExcludingTax || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 border border-[#dcdfe6] text-right text-[#303133]">
                        {details.reduce((s, d) => s + (d.taxAmount || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 border border-[#dcdfe6] text-right text-[#f56c6c]">
                        {details.reduce((s, d) => s + (d.amountIncludingTax || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 border border-[#dcdfe6]"></td>
                      <td colSpan={2} className="px-2 py-2 border border-[#dcdfe6]"></td>
                      <td className="px-2 py-2 border border-[#dcdfe6] text-right text-[#f56c6c]">
                        {details.reduce((s, d) => s + (d.costAuditAmountIncludingTax || 0), 0).toFixed(2)}
                      </td>
                      <td colSpan={4} className="px-2 py-2 border border-[#dcdfe6]"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            ) : (
            <div className="flex flex-col overflow-hidden" style={{ border: '1px solid #dcdfe6', borderRadius: '6px' }}>
              <div className="px-3 py-2 flex items-center justify-between bg-[#fafafa] border-b border-[#dcdfe6]">
                <div className="flex items-center gap-3">
                  <span className="text-[#606266] font-semibold text-sm">
                    {editItem.demandType === 'implementation_project' ? '工程类' : '服务类'}采购需求清单
                  </span>
                  <span className="text-xs text-[#606266]">共 {projectRows.length} 条</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606266]">
                    合计：<span className="text-[#f56c6c] font-semibold">¥{projectRows.reduce((s,r)=>s+(r.budgetAmount||0),0).toFixed(2)}</span>
                  </span>
                  <button className="px-2 py-0.5 text-xs text-[#409eff] border border-[#409eff] rounded hover:bg-[#ecf5ff]" onClick={addProjectRow}>+ 添加行</button>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: '800px' }}>
                <thead>
                  <tr className="bg-[#f5f7fa]">
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-10">#</th>
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-32">需求部门<span className="text-[#f56c6c] ml-0.5">*</span></th>
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-40">项目名称<span className="text-[#f56c6c] ml-0.5">*</span></th>
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-56">主要内容</th>
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-32">预算总金额(元)<span className="text-[#f56c6c] ml-0.5">*</span></th>
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-36">备注</th>
                    <th className="px-2 py-2 text-center border border-[#ebeef5] w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.map((row, index) => (
                    <tr key={row.id} className="border-t border-[#ebeef5]">
                      <td className="px-2 py-1 text-center border border-[#ebeef5]">{index + 1}</td>
                      <td className="px-2 py-1 border border-[#ebeef5]">
                        <input
                          className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-xs"
                          value={row.dept}
                          onChange={(e) => updateProjectRow(index, 'dept', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 border border-[#ebeef5]">
                        <input
                          className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-xs"
                          value={row.projectName}
                          onChange={(e) => updateProjectRow(index, 'projectName', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 border border-[#ebeef5]">
                        <textarea
                          className="w-full px-2 py-1 border border-[#dcdfe6] rounded text-xs"
                          rows={2}
                          value={row.mainContent || ''}
                          onChange={(e) => updateProjectRow(index, 'mainContent', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 border border-[#ebeef5]">
                        <input
                          type="number"
                          className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-xs"
                          value={row.budgetAmount || ''}
                          onChange={(e) => updateProjectRow(index, 'budgetAmount', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-2 py-1 border border-[#ebeef5]">
                        <input
                          className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-xs"
                          value={row.remark || ''}
                          onChange={(e) => updateProjectRow(index, 'remark', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1 text-center border border-[#ebeef5]">
                        <button className="text-[#f56c6c] hover:underline text-xs" onClick={() => removeProjectRow(index)}>删除</button>
                      </td>
                    </tr>
                  ))}
                  {projectRows.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-[#909399]">暂无数据，点击"+ 添加行"开始录入</td></tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
            )}
          </div>
        )}
      </Modal>

      {/* 物资选择弹窗 */}
      <Modal
        open={!!changeItem}
        title="需求变更申请"
        onClose={() => setChangeItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setChangeItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={submitChange}>提交变更</PrimaryButton>
          </>
        }
        width="1000px"
      >
        {changeItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">变更单号</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]" value={changeItem.changeNo} disabled />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">变更人</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa]" value={changeItem.changer} disabled />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">变更原因</div>
              <textarea
                className="w-full h-16 px-2 border border-[#dcdfe6] rounded"
                value={changeItem.changeReason}
                onChange={(e) => setChangeItem({ ...changeItem, changeReason: e.target.value })}
                placeholder="请输入变更原因（只能调减数量或删减项目，禁止新增）"
              />
            </div>
            <div className="text-[#e6a23c] text-sm">提示：变更仅允许调减采购数量/预算或删减项目，禁止新增</div>
            <div>
              <div className="text-[#606266] mb-2">变更后明细</div>
              {changeItem.beforeProjectRows !== undefined ? (
                // ======== 实施/服务项目：渲染 ProjectRow 表格 ========
                <div className="border border-[#dcdfe6] rounded max-h-80 overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#f5f7fa]">
                      <tr>
                        <th className="px-2 py-2 text-xs text-left w-20">需求部门</th>
                        <th className="px-2 py-2 text-xs text-left w-28">项目名称</th>
                        <th className="px-2 py-2 text-xs text-left">主要内容</th>
                        <th className="px-2 py-2 text-xs text-left w-24">原预算</th>
                        <th className="px-2 py-2 text-xs text-left w-28">新预算（不得超原）</th>
                        <th className="px-2 py-2 text-xs text-left w-24">预算控制金额</th>
                        <th className="px-2 py-2 text-xs text-left w-16">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(changeItem.afterProjectRows ?? []).map((row, idx) => {
                        const orig = changeItem.beforeProjectRows?.find(r => r.id === row.id);
                        return (
                          <tr key={row.id} className="border-t border-[#ebeef5]">
                            <td className="px-2 py-1 text-xs">{row.dept}</td>
                            <td className="px-2 py-1 text-xs">{row.projectName}</td>
                            <td className="px-2 py-1 text-xs max-w-[220px]">
                              <textarea
                                className="w-full h-8 px-1 border border-[#dcdfe6] rounded text-xs resize-none"
                                value={row.mainContent ?? ''}
                                onChange={(e) => {
                                  const list = [...(changeItem.afterProjectRows ?? [])];
                                  list[idx] = { ...list[idx], mainContent: e.target.value };
                                  setChangeItem({ ...changeItem, afterProjectRows: list });
                                }}
                              />
                            </td>
                            <td className="px-2 py-1 text-xs text-[#909399]">¥{(orig?.budgetAmount ?? 0).toLocaleString()}</td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min={0}
                                max={orig?.budgetAmount ?? 0}
                                className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                                value={row.budgetAmount}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  if (v <= (orig?.budgetAmount ?? 0)) {
                                    const list = [...(changeItem.afterProjectRows ?? [])];
                                    list[idx] = { ...list[idx], budgetAmount: v };
                                    setChangeItem({ ...changeItem, afterProjectRows: list });
                                  }
                                }}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min={0}
                                className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                                value={row.budgetControlAmount}
                                onChange={(e) => {
                                  const list = [...(changeItem.afterProjectRows ?? [])];
                                  list[idx] = { ...list[idx], budgetControlAmount: Number(e.target.value) };
                                  setChangeItem({ ...changeItem, afterProjectRows: list });
                                }}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <TextButton
                                type="danger"
                                size="small"
                                onClick={() => {
                                  const list = (changeItem.afterProjectRows ?? []).filter((_, i) => i !== idx);
                                  setChangeItem({ ...changeItem, afterProjectRows: list });
                                }}
                              >删除</TextButton>
                            </td>
                          </tr>
                        );
                      })}
                      {(!changeItem.afterProjectRows || changeItem.afterProjectRows.length === 0) && (
                        <tr><td colSpan={7} className="px-2 py-4 text-center text-xs text-[#909399]">暂无明细</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                // ======== 物资采购：渲染 Details 表格 ========
                <div className="border border-[#dcdfe6] rounded max-h-64 overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#f5f7fa]">
                      <tr>
                        <th className="px-2 py-2 text-xs text-left">商品编码</th>
                        <th className="px-2 py-2 text-xs text-left">产品名称</th>
                        <th className="px-2 py-2 text-xs text-left w-20">单位</th>
                        <th className="px-2 py-2 text-xs text-left w-20">原数量</th>
                        <th className="px-2 py-2 text-xs text-left w-20">新数量</th>
                        <th className="px-2 py-2 text-xs text-left w-20">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeItem.afterDetails.map((detail, index) => {
                        const originalDetail = changeItem.beforeDetails.find(d => d.id === detail.id);
                        return (
                          <tr key={detail.id} className="border-t border-[#ebeef5]">
                            <td className="px-2 py-1 text-xs">{detail.productCode}</td>
                            <td className="px-2 py-1 text-xs">{detail.productName}</td>
                            <td className="px-2 py-1 text-xs">{detail.unit}</td>
                            <td className="px-2 py-1 text-xs text-[#909399]">{originalDetail?.quantity}</td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                max={originalDetail?.quantity}
                                min={0}
                                className="w-full h-6 px-1 border border-[#dcdfe6] rounded text-xs"
                                value={detail.quantity}
                                onChange={(e) => {
                                  const newQty = Number(e.target.value);
                                  if (newQty <= (originalDetail?.quantity || 0)) {
                                    updateChangeDetail(index, 'quantity', newQty);
                                  }
                                }}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <TextButton type="danger" size="small" onClick={() => removeChangeDetail(index)}>删除</TextButton>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        open={!!viewItem}
        title="需求详情"
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
      >
        {viewItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div><span className="text-[#909399]">采购编号：</span>{viewItem.demandNo}</div>
              <div><span className="text-[#909399]">业务分类：</span>{getCategoryLabel(viewItem.businessCategory, viewItem.subType, viewItem.demandType)}</div>
              <div><span className="text-[#909399]">项目名称：</span>{viewItem.projectName}</div>
              <div><span className="text-[#909399]">申请人：</span>{viewItem.applicant}</div>
              <div><span className="text-[#909399]">申请部门：</span>{viewItem.applicantDept}</div>
              <div><span className="text-[#909399]">申请日期：</span>{viewItem.applyDate}</div>
              <div><span className="text-[#909399]">状态：</span>{viewItem.status}</div>
              {viewItem.budgetAudit && (
                <>
                  <div><span className="text-[#909399]">预算审核金额：</span>¥{viewItem.budgetAudit.auditAmount.toLocaleString()}</div>
                  <div><span className="text-[#909399]">审核时间：</span>{viewItem.budgetAudit.auditTime}</div>
                </>
              )}
            </div>
            <div>
              <span className="text-[#909399]">申请事由：</span>
              <p className="text-[#303133]">{viewItem.reason}</p>
            </div>
            <div>
              <div className="text-[#606266] mb-3">需求明细</div>
              <div className="border border-[#dcdfe6] rounded">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-4 py-3 text-left">商品编码</th>
                      <th className="px-4 py-3 text-left">产品名称</th>
                      <th className="px-4 py-3 text-left">规格</th>
                      <th className="px-4 py-3 text-left">单位</th>
                      <th className="px-4 py-3 text-left">数量</th>
                      <th className="px-4 py-3 text-left">含税金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((detail) => (
                      <tr key={detail.id} className="border-t border-[#ebeef5]">
                        <td className="px-4 py-3">{detail.productCode}</td>
                        <td className="px-4 py-3">{detail.productName}</td>
                        <td className="px-4 py-3">{detail.specification || '-'}</td>
                        <td className="px-4 py-3">{detail.unit}</td>
                        <td className="px-4 py-3">{detail.quantity}</td>
                        <td className="px-4 py-3">{(detail.amountIncludingTax || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 变更历史记录 */}
            {viewItem.changeHistory && viewItem.changeHistory.length > 0 && (
              <div>
                <div className="text-[#606266] mb-2 font-semibold">变更历史记录</div>
                <div className="space-y-3">
                  {viewItem.changeHistory.map((record) => (
                    <div key={record.id} className="border border-[#dcdfe6] rounded p-3 bg-[#f5f7fa]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#909399]">变更单号：{record.changeNo}</span>
                          <span className="text-xs text-[#909399]">变更人：{record.changer}</span>
                          <span className="text-xs text-[#909399]">变更时间：{record.changeTime}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          record.status === 'pending' ? 'bg-[#e6a23c] text-white' :
                          record.status === 'approved' ? 'bg-[#67c23a] text-white' :
                          'bg-[#f56c6c] text-white'
                        }`}>
                          {record.status === 'pending' ? '待审核' : record.status === 'approved' ? '已审核' : '已驳回'}
                        </span>
                      </div>
                      <div className="text-xs text-[#606266] mb-2">变更原因：{record.changeReason || '无'}</div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[#909399] mb-1">变更前：</div>
                          <div className="bg-white rounded p-2 border border-[#e4e7ed]">
                            {record.beforeDetails.length === 0 ? '（空）' : (
                              <table className="w-full">
                                <thead className="bg-[#f5f7fa]">
                                  <tr>
                                    <th className="px-1 py-1 text-left text-[10px]">品名</th>
                                    <th className="px-1 py-1 text-left text-[10px]">数量</th>
                                    <th className="px-1 py-1 text-left text-[10px]">含税金额</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.beforeDetails.map((d) => (
                                    <tr key={d.id} className="border-t border-[#ebeef5]">
                                      <td className="px-1 py-1">{d.productName}</td>
                                      <td className="px-1 py-1">{d.quantity}</td>
                                      <td className="px-1 py-1">¥{(d.amountIncludingTax || 0).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#909399] mb-1">变更后：</div>
                          <div className="bg-white rounded p-2 border border-[#e4e7ed]">
                            {record.afterDetails.length === 0 ? '（空）' : (
                              <table className="w-full">
                                <thead className="bg-[#f5f7fa]">
                                  <tr>
                                    <th className="px-1 py-1 text-left text-[10px]">品名</th>
                                    <th className="px-1 py-1 text-left text-[10px]">数量</th>
                                    <th className="px-1 py-1 text-left text-[10px]">含税金额</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.afterDetails.map((d) => (
                                    <tr key={d.id} className="border-t border-[#ebeef5]">
                                      <td className="px-1 py-1">{d.productName}</td>
                                      <td className="px-1 py-1">{d.quantity}</td>
                                      <td className="px-1 py-1">¥{(d.amountIncludingTax || 0).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </div>
                      {record.approver && (
                        <div className="text-xs text-[#909399] mt-2">
                          审核人：{record.approver}，审核时间：{record.approveTime}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      <ProductPickerModal
        open={productPickerOpen}
        onClose={() => setProductPickerOpen(false)}
        onConfirm={handleProductsSelected}
        title={(() => {
          if (editItem?.procurementType === 'within_framework') return '框架合同清单内 — 只能选择有有效合同的物资';
          if (editItem?.procurementType === 'outside_framework') return '框架合同清单外 — 只能选择无有效合同的物资';
          if (editItem?.procurementType === 'new_supplier') return '新增供应商目录 — 清单内+清单外物资全部可选';
          return '从物资档案选择（支持多选）';
        })()}
        selectedIds={details.map((d) => (d as any).productId).filter(Boolean)}
        products={filteredProducts.length > 0 ? filteredProducts : undefined}
        showContractNoFilter={editItem?.procurementType === 'within_framework'}
        defaultAttributeFilter={(() => {
          // 根据需求类型自动设置属性筛选
          if (editItem?.demandType === 'implementation_project') return '实施项目类';
          if (editItem?.demandType === 'service_project') return '服务项目类';
          return ''; // 物资采购默认不筛选
        })()}
      />

      {/* 导入预览弹窗 */}
      <ImportPreviewModal
        open={importPreviewOpen}
        onClose={() => setImportPreviewOpen(false)}
        results={importResults}
        onConfirm={handleImportConfirm}
      />

      {/* 隐藏的 Excel 文件选择 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 项目选择弹窗 */}
      <Modal
        open={projectPickerOpen}
        title={editItem?.demandType === 'implementation_project' ? '选择实施项目' : '选择服务项目'}
        onClose={() => setProjectPickerOpen(false)}
        width="800px"
      >
        {editItem && (
          <div className="space-y-3">
            <div className="text-sm text-[#909399] mb-2">
              {editItem.demandType === 'implementation_project'
                ? '请从以下实施项目中选择，或点击"添加"创建新项目'
                : '请从以下服务项目中选择，或点击"添加"创建新项目'}
            </div>
            <div className="max-h-[400px] overflow-auto border border-[#dcdfe6] rounded">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">项目编号</th>
                    <th className="px-3 py-2 text-left">项目名称</th>
                    <th className="px-3 py-2 text-left">状态</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {(editItem.demandType === 'implementation_project' ? implementationProjects : serviceProjects)
                    .filter(p => p.status === 'enabled')
                    .map((project) => (
                    <tr key={project.id} className="border-t border-[#ebeef5] hover:bg-[#f5f7fa]">
                      <td className="px-3 py-2">{project.projectNo}</td>
                      <td className="px-3 py-2">{project.projectName}</td>
                      <td className="px-3 py-2">
                        <span className="text-green-600">启用</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <PrimaryButton
                          size="small"
                          onClick={() => handleProjectSelected(project)}
                        >
                          选择
                        </PrimaryButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(editItem.demandType === 'implementation_project' ? implementationProjects : serviceProjects).filter(p => p.status === 'enabled').length === 0 && (
                <div className="py-8 text-center text-[#909399]">暂无可用项目</div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-[#909399]">
                如未找到对应项目，可在「基础资料 - {editItem.demandType === 'implementation_project' ? '实施项目管理' : '服务项目管理'}」中新增
              </div>
              <DefaultButton onClick={() => setProjectPickerOpen(false)}>关闭</DefaultButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
