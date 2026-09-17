import { useEffect, useMemo, useRef, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import SupplierPickerModal from '@/components/common/SupplierPickerModal';
import DemandPickerModal from '@/components/common/DemandPickerModal';
import TimePickerModal from '@/components/common/TimePickerModal';
import { useStore } from '@/store/useStore';
import { genSerialNo, SERIAL_CONFIG } from '@/utils/serialNumber';
import { exportOfflineList, parseOfflineList } from '@/utils/excelImport';
import { MOCK_BIDDINGS, MOCK_SUPPLIER_QUOTES } from '@/mock/biddingMockData';
import type {
  Bidding, BiddingQuote, BiddingItem, BiddingQuoteDetail,
  ProcurementDemand, Attachment, BiddingProcurementMethod, ProcurementOrder,
} from '@/types';
import { BIDDING_METHOD_LABEL } from '@/types';

/** 采购方式下拉选项 */
const PROCUREMENT_OPTIONS: Array<{ value: BiddingProcurementMethod; label: string }> = [
  { value: 'inquiry', label: '询比采购' },
  { value: 'competitive_bidding', label: '竞价采购' },
  { value: 'negotiation_open', label: '谈判采购-公开' },
  { value: 'negotiation_invited', label: '谈判采购-邀请' },
  { value: 'direct', label: '直接采购' },
  { value: 'framework', label: '框架协议采购' },
  { value: 'e_mall', label: '电子商城采购' },
];

/** 是否目录内比价（线上报价模式） */
const isCatalogCompare = (m?: BiddingProcurementMethod) => m === 'framework';

export default function CompetitiveBiddingPage() {
  const biddings = useStore((s) => s.biddings || []) as Bidding[];
  const setBiddings = useStore((s) => s.setBiddings) as ((data: Bidding[]) => void) | undefined;
  const addBidding = useStore((s) => s.addBidding) as ((b: Bidding) => void) | undefined;
  const updateBidding = useStore((s) => s.updateBidding) as ((id: string, data: Partial<Bidding>) => void) | undefined;
  const deleteBidding = useStore((s) => s.deleteBidding) as ((id: string) => void) | undefined;
  const suppliers = useStore((s) => s.suppliers);
  const procurementDemands = useStore((s) => s.procurementDemands);
  const currentUser = useStore((s) => s.currentUser);

  // 同步从 store 中读取报价单数据
  const supplierQuotes = useStore((s) => s.supplierQuotes || []) as any[];
  const setSupplierQuotes = useStore((s) => s.setSupplierQuotes) as ((data: any[]) => void) | undefined;
  const addProcurementOrder = useStore((s) => s.addProcurementOrder) as ((order: ProcurementOrder) => void) | undefined;

  // 初始化测试数据：加载工单和报价单
  useEffect(() => {
    if (biddings.length === 0) {
      setBiddings?.(MOCK_BIDDINGS);
    }
    if (supplierQuotes.length === 0) {
      setSupplierQuotes?.(MOCK_SUPPLIER_QUOTES as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filterNo, setFilterNo] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({ no: '', name: '', status: '' });

  const filteredData = useMemo(() => {
    return biddings.filter((b) => {
      if (applied.no && !b.biddingNo.includes(applied.no)) return false;
      if (applied.name && !b.biddingName.includes(applied.name)) return false;
      if (applied.status && b.status !== applied.status) return false;
      return true;
    });
  }, [biddings, applied]);

  const columns: ColumnDef<Bidding>[] = [
    { key: 'biddingNo', title: '工单编号' },
    {
      key: 'projectName',
      title: '项目名称',
      render: (row) => row.projectName || row.biddingName || '-',
    },
    {
      key: 'procurementMethod',
      title: '采购方式',
      render: (row) => {
        if (row.procurementMethod) {
          let label = BIDDING_METHOD_LABEL[row.procurementMethod];
          if (row.procurementMethod === 'framework') {
            label += '(目录内比价)';
          }
          return (
            <span className="px-1.5 py-0.5 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              {label}
            </span>
          );
        }
        // 兼容旧数据
        return row.biddingType === 'market' ? '市场采购' : '库内采购';
      },
    },
    { key: 'demandNo', title: '关联需求', render: (row) => row.demandNo || '-' },
    {
      key: 'itemsCount',
      title: '明细项数',
      render: (row) => {
        const catalog = row.items?.length || 0;
        const offline = row.offlineDetails?.length || 0;
        const random = 0;
        return (catalog + offline) + ' 项';
      },
    },
    {
      key: 'totalLimit',
      title: '金额合计',
      render: (row) => {
        const amt = row.totalAmountIncludingTax || row.totalPriceLimit;
        return amt ? `¥${amt.toLocaleString()}` : '-';
      },
    },
    {
      key: 'status',
      title: '审批状态',
      render: (row) => {
        const map: Record<string, { label: string; cls: string }> = {
          draft: { label: '草稿', cls: 'bg-slate-100 text-slate-600' },
          submitted: { label: '已提交', cls: 'bg-amber-100 text-amber-700' },
          approved: { label: '已通过', cls: 'bg-green-100 text-green-700' },
          rejected: { label: '已驳回', cls: 'bg-red-100 text-red-700' },
        };
        const s = row.approvalStatus || row.status;
        const cfg = map[s as string] || map.draft;
        return <span className={`px-1.5 py-0.5 text-xs rounded border ${cfg.cls}`}>{cfg.label}</span>;
      },
    },
    {
      key: 'bizStatus',
      title: '业务状态',
      render: (row) => {
        const map: Record<string, { label: string; cls: string }> = {
          published: { label: '已发布', cls: 'bg-blue-100 text-blue-700' },
          bidding: { label: '招标中', cls: 'bg-amber-100 text-amber-700' },
          evaluated: { label: '已评审', cls: 'bg-green-100 text-green-700' },
          completed: { label: '已完成', cls: 'bg-green-100 text-green-700' },
          cancelled: { label: '已取消', cls: 'bg-slate-200 text-slate-600' },
        };
        // 如果审批还没过，显示"-"
        if (row.approvalStatus && row.approvalStatus !== 'approved') {
          return <span className="text-slate-400 text-xs">-</span>;
        }
        const cfg = map[row.status] || map.published;
        return <span className={`px-1.5 py-0.5 text-xs rounded border ${cfg.cls}`}>{cfg.label}</span>;
      },
    },
    {
      key: 'quotesCount',
      title: '报价数',
      render: (row) => row.quotes?.length || 0,
    },
    {
      key: 'lowestQuote',
      title: '最低报价',
      render: (row) => {
        const quotes = row.quotes?.filter(q => q.isQualified) || [];
        if (quotes.length === 0) return '-';
        const lowest = Math.min(...quotes.map(q => q.totalAmount));
        return `¥${lowest.toLocaleString()}`;
      },
    },
    { key: 'creator', title: '创建人' },
    { key: 'createTime', title: '创建时间', render: (row) => row.createTime?.split(' ')[0] || '-' },
    {
      key: 'timeRange',
      title: '招标时间',
      render: (row) => {
        if (!row.startTime && !row.endTime) return <span className="text-[#c0c4cc]">未设置</span>;
        const now = new Date();
        const isPast = row.endTime && new Date(row.endTime) < now;
        const cls = isPast ? 'text-red-500' : 'text-[#606266]';
        return (
          <div className={`text-xs ${cls}`}>
            <div>{row.startTime?.slice(0, 16)?.replace(' ', ' ') || '-'} ~</div>
            <div>{row.endTime?.slice(0, 16)?.replace(' ', ' ') || '-'}</div>
          </div>
        );
      },
    },
    {
      key: 'attachments',
      title: '评定结果',
      render: (row) => {
        const count = row.attachments?.length || 0;
        if (count === 0) return <span className="text-[#909399] text-xs">无附件</span>;
        return (
          <div className="flex items-center gap-1">
            <span className="text-[#67c23a] text-xs">📎 {count} 个</span>
            <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          </div>
        );
      },
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => {
        const isCatalog = isCatalogCompare(row.procurementMethod);
        const isApproved = row.approvalStatus === 'approved' || (!row.approvalStatus && row.status !== 'draft');
        return (
          <div className="flex items-center gap-3">
            <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
            <TextButton onClick={() => viewDetail(row)}>查看详情</TextButton>
            {(() => {
              // 招标时间：仅目录内比价 + 审批通过后才允许设置
              if (!isCatalog) return null;
              if (!isApproved) return null;
              const canSetTime = ['published', 'bidding'].includes(row.status) ||
                (row.status === 'draft' && (row as any).procurementMethod);
              if (!canSetTime) return null;
              if (row.status === 'bidding' && row.endTime && new Date(row.endTime) < new Date()) return null;
              const hasTime = !!(row.startTime && row.endTime);
              return (
                <TextButton onClick={() => setTimePickerTarget(row)}>
                  {hasTime ? '修改招标时间' : '设置招标时间'}
                </TextButton>
              );
            })()}
            {/* 目录内比价状态流转按钮 */}
            {isCatalog && row.status === 'draft' && (
              <TextButton onClick={() => handlePublish(row)}>发布</TextButton>
            )}
            {isCatalog && row.status === 'published' && (
              <TextButton onClick={() => handleStartBidding(row)}>开始采购</TextButton>
            )}
            {isCatalog && row.status === 'bidding' && (
              <TextButton onClick={() => handleEvaluate(row)}>评审</TextButton>
            )}
            {isCatalog && row.status === 'evaluated' && (
              <TextButton onClick={() => handleComplete(row)}>完成</TextButton>
            )}
            {isCatalog && row.status === 'completed' && (
              <TextButton
                onClick={() => handleGenerateOrder(row)}
                className="text-indigo-600"
              >
                生成采购订单
              </TextButton>
            )}
            {/* 线下录入类：提交审批按钮 */}
            {!isCatalog && row.approvalStatus === 'draft' && (
              <TextButton onClick={() => updateBidding?.(row.id, { approvalStatus: 'submitted', status: 'submitted' })}>
                提交审批
              </TextButton>
            )}
            {!isCatalog && row.approvalStatus === 'submitted' && (
              <span className="text-xs text-amber-600">审批中...</span>
            )}
            <TextButton
              type="danger"
              onClick={() => {
                if (confirm(`确认删除工单 ${row.biddingNo}？`)) deleteBidding?.(row.id);
              }}
            >删除</TextButton>
          </div>
        );
      },
    },
  ];

  const [editItem, setEditItem] = useState<Bidding | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewItem, setViewItem] = useState<Bidding | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<ProcurementDemand | null>(null);
  // 竞价小组评定结果附件
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);
  // 竞价公告附件
  const [editAnnouncement, setEditAnnouncement] = useState<Attachment[]>([]);
  // 竞价文件附件
  const [editBiddingDocs, setEditBiddingDocs] = useState<Attachment[]>([]);
  const [previewAtt, setPreviewAtt] = useState<Attachment | null>(null);
  // offline 清单导入
  const offlineFileInputRef = useRef<HTMLInputElement>(null);
  // 三个选择弹框的 open 状态
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [demandPickerOpen, setDemandPickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<Bidding | null>(null);

  // ===== 附件处理函数 =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newAttachments: Attachment[] = Array.from(e.target.files).map((file) => ({
      id: 'ATT' + Date.now().toString() + Math.random().toString(36).slice(2, 6),
      fileName: file.name,
      filePath: URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }));
    setEditAttachments([...editAttachments, ...newAttachments]);
    e.target.value = '';
  };

  const handleAnnouncementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newAttachments: Attachment[] = Array.from(e.target.files).map((file) => ({
      id: 'ANN' + Date.now().toString() + Math.random().toString(36).slice(2, 6),
      fileName: file.name,
      filePath: URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }));
    setEditAnnouncement([...editAnnouncement, ...newAttachments]);
    e.target.value = '';
  };

  const handleBiddingDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newAttachments: Attachment[] = Array.from(e.target.files).map((file) => ({
      id: 'DOC' + Date.now().toString() + Math.random().toString(36).slice(2, 6),
      fileName: file.name,
      filePath: URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }));
    setEditBiddingDocs([...editBiddingDocs, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    const att = editAttachments.find((a) => a.id === id);
    if (att && att.filePath.startsWith('blob:')) URL.revokeObjectURL(att.filePath);
    setEditAttachments(editAttachments.filter((a) => a.id !== id));
  };

  const removeAnnouncement = (id: string) => {
    const att = editAnnouncement.find((a) => a.id === id);
    if (att && att.filePath.startsWith('blob:')) URL.revokeObjectURL(att.filePath);
    setEditAnnouncement(editAnnouncement.filter((a) => a.id !== id));
  };

  const removeBiddingDoc = (id: string) => {
    const att = editBiddingDocs.find((a) => a.id === id);
    if (att && att.filePath.startsWith('blob:')) URL.revokeObjectURL(att.filePath);
    setEditBiddingDocs(editBiddingDocs.filter((a) => a.id !== id));
  };

  const downloadAttachment = (attachment: Attachment) => {
    if (attachment.filePath.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = attachment.filePath;
      link.download = attachment.fileName;
      link.click();
    } else {
      alert('暂不支持下载远程文件');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const openAdd = () => {
    const now = new Date();
    const newBidding: Bidding = {
      id: 'BID' + Date.now(),
      biddingNo: '',
      biddingName: '',
      projectName: '',
      biddingType: 'market',              // 兼容旧数据
      procurementMethod: 'framework',     // 默认框架协议采购
      approvalStatus: 'draft',
      status: 'draft',
      creator: currentUser.name,
      createTime: now.toISOString().replace('T', ' ').slice(0, 19),
      quotes: [],
      items: [],
      offlineDetails: [],
    };
    setSelectedSuppliers([]);
    setSelectedDemand(null);
    setEditAttachments([]);
    setEditAnnouncement([]);
    setEditBiddingDocs([]);
    setIsNew(true);
    setEditItem(newBidding);
  };

  const openEdit = (bidding: Bidding) => {
    setSelectedSuppliers(bidding.inviteSupplierIds || []);
    const demand = procurementDemands?.find((d) => d.id === bidding.demandId) || null;
    setSelectedDemand(demand);
    setEditAttachments([...(bidding.attachments || [])]);
    setEditAnnouncement([...(bidding.biddingAnnouncement || [])]);
    setEditBiddingDocs([...(bidding.biddingDocuments || [])]);
    setIsNew(false);
    setEditItem(bidding);
  };

  const viewDetail = (bidding: Bidding) => {
    setViewItem(bidding);
  };

  const handlePublish = (bidding: Bidding) => {
    if (!bidding.items || bidding.items.length === 0) {
      alert('请先选择物资并设置单品上限后再发布！');
      return;
    }
    updateBidding?.(bidding.id, { status: 'published', approvalStatus: 'approved' });
  };

  const handleStartBidding = (bidding: Bidding) => {
    // 只有目录内比价才自动模拟供应商报价
    if (!isCatalogCompare()) return;
    updateBidding?.(bidding.id, { status: 'bidding', approvalStatus: 'approved' });
    simulateSupplierQuotes(bidding.id);
  };

  const simulateSupplierQuotes = (biddingId: string) => {
    const bidding = biddings.find(b => b.id === biddingId);
    if (!bidding || !bidding.items || bidding.items.length === 0) return;

    const supplierList = [
      { id: 'SUP001', name: '华东钢材有限公司', contact: '张经理', phone: '13800001001' },
      { id: 'SUP002', name: '华北铝业集团', contact: '李总', phone: '13900002002' },
      { id: 'SUP003', name: '南方建材公司', contact: '王工', phone: '13700003003' },
      { id: 'SUP004', name: '西部材料科技', contact: '赵经理', phone: '13600004004' },
      { id: 'SUP005', name: '东方供应集团', contact: '孙总', phone: '13500005005' },
    ];
    const taxRates = [0.13, 0.09, 0.06, 0.13, 0.09];

    // 每个供应商对每个条目给出报价（单价），以 items 的单品上限为参考上下浮动
    const mockQuotes: BiddingQuote[] = supplierList.map((sup, idx) => {
      let overSingle = false;
      let total = 0;
      let totalTax = 0;
      const taxRate = taxRates[idx];

      const details: BiddingQuoteDetail[] = (bidding.items || []).map(item => {
        // 随机在单品上限的 80%-115% 之间给出报价
        const factor = 0.8 + Math.random() * 0.35;
        const unitPrice = Math.round(item.singlePriceLimit * factor * 100) / 100;
        const amount = Math.round(unitPrice * item.quantity * 100) / 100;
        const taxAmount = Math.round((amount / (1 + taxRate)) * taxRate * 100) / 100;
        const isOver = item.singlePriceLimit > 0 && unitPrice > item.singlePriceLimit;
        if (isOver) overSingle = true;
        total += amount;
        totalTax += taxAmount;
        return {
          productCode: item.productCode,
          productName: item.productName,
          specification: item.specification,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice,
          taxRate,
          amount,
          taxAmount,
          isOverSingleLimit: isOver,
        };
      });

      const totalLimit = bidding.totalPriceLimit || 0;
      const isOverTotal = totalLimit > 0 && total > totalLimit;
      const isQualified = !overSingle && !isOverTotal;
      let remark = '';
      if (overSingle) remark = '超出单品上限';
      else if (isOverTotal) remark = '超出整单上限';

      return {
        id: 'Q' + Date.now() + '_' + idx,
        biddingId,
        supplierId: sup.id,
        supplierName: sup.name,
        contactPerson: sup.contact,
        contactPhone: sup.phone,
        taxRate,
        taxAmount: Math.round(totalTax * 100) / 100,
        details,
        totalAmount: Math.round(total * 100) / 100,
        isOverSingleLimit: overSingle,
        isOverTotalLimit: isOverTotal,
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        isQualified,
        remark,
      };
    });

    updateBidding?.(biddingId, { quotes: mockQuotes });
  };

  const handleEvaluate = (bidding: Bidding) => {
    updateBidding?.(bidding.id, { status: 'evaluated' });
  };

  const handleComplete = (bidding: Bidding) => {
    const qualifiedQuotes = (bidding.quotes || []).filter(q => q.isQualified);
    if (qualifiedQuotes.length === 0) {
      alert('没有符合条件的供应商报价');
      return;
    }

    const lowestQuote = qualifiedQuotes.reduce((min, q) =>
      q.totalAmount < min.totalAmount ? q : min
    );

    updateBidding?.(bidding.id, {
      status: 'completed',
      winningSupplierId: lowestQuote.supplierId,
      winningSupplierName: lowestQuote.supplierName,
    });
  };

  /** framework 完成后一键生成采购订单 */
  const handleGenerateOrder = (bidding: Bidding) => {
    if (bidding.status !== 'completed') {
      alert('只有已完成的框架协议采购才能生成订单');
      return;
    }
    if ((bidding as any).generatedOrderId) {
      if (!confirm('该框架已生成过订单，确认重新生成？（将新增一条）')) return;
    }
    if (!bidding.winningSupplierId) {
      alert('成交供应商缺失，无法生成订单');
      return;
    }
    const orderId = `PO_${Date.now()}`;
    const items = (bidding.items || []).map((it: any, idx: number) => {
      const qty = it.quantity ?? 1;
      const unitPrice = it.unitPriceLimitIncludingTax ?? it.unitPriceLimitExcludingTax ?? 0;
      return {
        id: `ITEM_${orderId}_${idx}`,
        orderId,
        productId: it.productCode || it.code || '',
        productCode: it.productCode || it.code || '',
        productName: it.productName || it.materialName || it.name || '未命名物料',
        specification: it.specification || it.spec || '',
        unit: it.unit || '',
        quantity: qty,
        unitPrice,
        amount: +(unitPrice * qty).toFixed(2),
        taxRate: it.taxRate ?? 0.13,
      };
    });
    const orderNo = genSerialNo(
      SERIAL_CONFIG.CPO,
      (useStore.getState().procurementOrders as ProcurementOrder[]).map((o) => o.orderNo),
    );
    const now = new Date().toISOString();
    const order: ProcurementOrder = {
      id: orderId,
      orderNo,
      sourceType: 'framework_bidding',
      demandNo: bidding.demandNo || '',
      contractId: '',
      contractNo: '',
      supplierId: bidding.winningSupplierId,
      supplierName: bidding.winningSupplierName || '',
      status: 'pending',
      createTime: now,
      creator: currentUser?.name || '当前用户',
      deliveryDate: now.slice(0, 10),
      remark: `由框架协议采购 ${bidding.biddingNo} 自动生成，共 ${items.length} 项`,
      details: items,
    };
    addProcurementOrder?.(order);
    updateBidding?.(bidding.id, { ...bidding, ...({ generatedOrderId: order.id } as any) });
    const total = items.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2);
    alert(`✅ 采购订单已生成：${orderNo}\n共 ${items.length} 项，总金额 ¥${total}`);
  };

  const handleSave = () => {
    if (!editItem) return;
    // 采购方式默认值
    const procurementMethod = editItem.procurementMethod || 'framework';
    const isCatalog = isCatalogCompare();

    // 项目名称必填
    if (!editItem.projectName && !editItem.biddingName) {
      alert('请填写项目名称！');
      return;
    }

    if (isCatalog) {
      // === 目录内比价 ===
      if (!editItem.items || editItem.items.length === 0) {
        alert('请先选择采购需求，需求中的物资将自动带入！');
        return;
      }
      for (const item of editItem.items) {
        const limit = item.singlePriceLimit || item.unitPriceLimitIncludingTax;
        if (!limit || limit <= 0) {
          alert(`物资「${item.productName}」必须设置单品上限单价！`);
          return;
        }
      }
      if (!editItem.totalPriceLimit || editItem.totalPriceLimit <= 0) {
        alert('请输入整单含税上限总价！');
        return;
      }
    } else {
      // === 线下录入类 ===
      if (!editItem.offlineDetails || editItem.offlineDetails.length === 0) {
        alert('请先选择采购需求自动带入清单，或手动新增条目！');
        return;
      }
      for (const r of editItem.offlineDetails) {
        if (!r.itemName) { alert('清单条目名称不能为空！'); return; }
      }
    }

    // 新增时才生成编号
    if (isNew && !editItem.biddingNo) {
      editItem.biddingNo = genSerialNo(SERIAL_CONFIG.BIDDING, biddings.map(b => b.biddingNo));
    }

    // 根据方式计算金额合计（线下录入类）
    let saveBidding = { ...editItem } as Bidding;
    if (!isCatalog && editItem.offlineDetails) {
      saveBidding.totalAmountExcludingTax = offlineTotals.ex;
      saveBidding.totalAmountIncludingTax = offlineTotals.in;
      saveBidding.totalTaxAmount = offlineTotals.tax;
    }

    // 采购方式 & 项目名称同步
    saveBidding.procurementMethod = procurementMethod;
    if (!saveBidding.projectName && saveBidding.biddingName) saveBidding.projectName = saveBidding.biddingName;
    if (!saveBidding.biddingName && saveBidding.projectName) saveBidding.biddingName = saveBidding.projectName;
    // 审批状态默认值
    if (!saveBidding.approvalStatus) saveBidding.approvalStatus = 'draft';
    // 邀约供应商 + 附件
    saveBidding.inviteSupplierIds = selectedSuppliers;
    saveBidding.attachments = [...editAttachments];
    saveBidding.biddingAnnouncement = [...editAnnouncement];
    saveBidding.biddingDocuments = [...editBiddingDocs];

    if (isNew) {
      addBidding?.(saveBidding);
    } else {
      updateBidding?.(saveBidding.id, saveBidding);
    }
    setEditItem(null);
    setSelectedSuppliers([]);
    setSelectedDemand(null);
    setEditAttachments([]);
    setEditAnnouncement([]);
    setEditBiddingDocs([]);
  };

  const toggleSupplier = (supplierId: string) => {
    if (selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplierId));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
    }
  };

  // 选择采购需求时，根据当前采购方式自动带入对应的明细
  const handleSelectDemand = (demandId: string) => {
    const demand = procurementDemands.find(d => d.id === demandId);
    setSelectedDemand(demand || null);

    if (!demand || !editItem) return;

    const isCatalog = isCatalogCompare(editItem.procurementMethod);

    const basePatch: Partial<Bidding> = {
      demandId: demand.id,
      demandNo: demand.demandNo,
      projectName: demand.projectName,
      biddingName: demand.projectName,
    };

    if (isCatalog) {
      // 目录内比价 → items（CatalogCompareItem）
      const items: any[] = (demand.details || []).map(d => ({
        productCode: d.productCode,
        productName: d.productName,
        unit: d.unit,
        quantity: d.quantity,
        specification: d.specification,
        singlePriceLimit: d.unitPriceIncludingTax || d.unitPriceExcludingTax || 0,
        unitPriceLimitIncludingTax: d.unitPriceIncludingTax || d.unitPriceExcludingTax || 0,
        demandUnitPriceIncludingTax: d.unitPriceIncludingTax,
        demandUnitPriceExcludingTax: d.unitPriceExcludingTax,
        costAuditUnitPriceIncludingTax: d.costAuditUnitPriceIncludingTax,
        costAuditUnitPriceExcludingTax: d.costAuditUnitPriceExcludingTax,
      }));
      setEditItem({ ...editItem, ...basePatch, items, offlineDetails: [] });
    } else {
      // 线下录入类 → offlineDetails
      const offlineDetails: any[] = (demand.details || []).map((d, idx) => ({
        rowNo: idx + 1,
        itemName: d.productName,
        quantity: d.quantity,
        unit: d.unit,
        taxRate: 0.13,
      }));
      setEditItem({ ...editItem, ...basePatch, offlineDetails, items: [] });
    }
  };

  // ===== 三个弹框的 Confirm 回调 =====

  // 供应商多选弹框确认
  const handleConfirmSuppliers = (ids: string[]) => {
    setSelectedSuppliers(ids);
    setSupplierPickerOpen(false);
  };

  // 采购需求单选弹框确认
  const handleConfirmDemand = (demand: ProcurementDemand | null) => {
    if (!demand) {
      setDemandPickerOpen(false);
      return;
    }
    handleSelectDemand(demand.id);
    setDemandPickerOpen(false);
  };

  // 招标时间设置弹框确认
  const handleConfirmTime = (startTime: string, endTime: string) => {
    if (!timePickerTarget) return;
    updateBidding?.(timePickerTarget.id, { startTime, endTime });
    setTimePickerTarget(null);
  };

  // 更新某条目录内比价条目
  const updateItem = (index: number, patch: Record<string, any>) => {
    if (!editItem || !editItem.items) return;
    const newItems = [...editItem.items];
    // 如果改了 singlePriceLimit，同步 unitPriceLimitIncludingTax
    if ('singlePriceLimit' in patch) {
      patch = { ...patch, unitPriceLimitIncludingTax: patch.singlePriceLimit };
    }
    newItems[index] = { ...newItems[index], ...patch };
    setEditItem({ ...editItem, items: newItems });
  };

  const removeItem = (index: number) => {
    if (!editItem || !editItem.items) return;
    const newItems = editItem.items.filter((_, i) => i !== index);
    setEditItem({ ...editItem, items: newItems });
  };

  // 更新某条线下录入明细 — 含税/不含税自动联动
  const updateOfflineItem = (index: number, patch: any) => {
    if (!editItem?.offlineDetails) return;
    const list = [...editItem.offlineDetails];
    let row = { ...list[index], ...patch };
    // 自动算含税/不含税/金额/税额
    if (row.taxRate == null) row.taxRate = 0.13;
    const hasUnitEx = row.unitPriceExcludingTax != null && row.unitPriceExcludingTax !== '';
    const hasUnitIn = row.unitPriceIncludingTax != null && row.unitPriceIncludingTax !== '';
    if (hasUnitEx && !hasUnitIn) {
      row.unitPriceIncludingTax = Math.round(row.unitPriceExcludingTax * (1 + row.taxRate) * 100) / 100;
    } else if (!hasUnitEx && hasUnitIn) {
      row.unitPriceExcludingTax = Math.round(row.unitPriceIncludingTax / (1 + row.taxRate) * 100) / 100;
    }
    if (row.quantity && row.unitPriceExcludingTax != null) {
      row.amountExcludingTax = Math.round(row.unitPriceExcludingTax * row.quantity * 100) / 100;
      row.amountIncludingTax = Math.round(row.amountExcludingTax * (1 + row.taxRate) * 100) / 100;
      row.taxAmount = Math.round(row.amountIncludingTax - row.amountExcludingTax * 100) / 100;
    }
    list[index] = row;
    setEditItem({ ...editItem, offlineDetails: list });
  };

  const addOfflineItem = () => {
    if (!editItem) return;
    const list = editItem.offlineDetails || [];
    const nextNo = list.length + 1;
    setEditItem({
      ...editItem,
      offlineDetails: [...list, { rowNo: nextNo, itemName: '', quantity: 1, unit: '个', taxRate: 0.13 }],
    });
  };

  const removeOfflineItem = (index: number) => {
    if (!editItem?.offlineDetails) return;
    const list = editItem.offlineDetails.filter((_, i) => i !== index);
    setEditItem({ ...editItem, offlineDetails: list });
  };

  // ========== offline 清单导出 ==========
  const handleOfflineExport = () => {
    if (!editItem) return;
    if (!editItem.offlineDetails || editItem.offlineDetails.length === 0) {
      alert('当前清单为空，无数据可导出');
      return;
    }
    try {
      exportOfflineList(editItem.offlineDetails);
    } catch (err: any) {
      alert(err?.message || '导出失败');
    }
  };

  // ========== offline 清单导入 ==========
  const handleOfflineImportClick = () => {
    if (!editItem) return;
    offlineFileInputRef.current?.click();
  };

  const handleOfflineFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editItem) return;
    try {
      const rows = await parseOfflineList(file);
      // 计算不含税/含税/税额等自动字段
      const computed = rows.map((r) => {
        const taxRate = r.taxRate ?? 0.13;
        const unitPriceExcludingTax = r.unitPriceExcludingTax ?? 0;
        const unitPriceIncludingTax = +(unitPriceExcludingTax * (1 + taxRate)).toFixed(4);
        const amountExcludingTax = +(unitPriceExcludingTax * r.quantity).toFixed(2);
        const taxAmount = +(amountExcludingTax * taxRate).toFixed(2);
        const amountIncludingTax = +(amountExcludingTax + taxAmount).toFixed(2);
        return {
          rowNo: r.rowNo,
          itemName: r.itemName,
          quantity: r.quantity,
          unit: r.unit,
          taxRate,
          unitPriceExcludingTax,
          unitPriceIncludingTax,
          amountExcludingTax,
          taxAmount,
          amountIncludingTax,
        };
      });
      setEditItem({ ...editItem, offlineDetails: computed });
      alert(`✅ 导入成功，共 ${computed.length} 条`);
    } catch (err: any) {
      alert(err?.message || '文件解析失败');
    } finally {
      if (offlineFileInputRef.current) offlineFileInputRef.current.value = '';
    }
  };

  // 目录内比价：上限合计
  const itemsTotalLimit = useMemo(() => {
    if (!editItem?.items) return 0;
    return editItem.items.reduce((sum, item) => {
      return sum + ((item.singlePriceLimit || item.unitPriceLimitIncludingTax || 0) * (item.quantity || 0));
    }, 0);
  }, [editItem?.items]);

  // 线下录入：含税/不含税/税额合计
  const offlineTotals = useMemo(() => {
    if (!editItem?.offlineDetails) return { ex: 0, in: 0, tax: 0 };
    const ex = editItem.offlineDetails.reduce((s, r) => s + (r.amountExcludingTax || 0), 0);
    const inTax = editItem.offlineDetails.reduce((s, r) => s + (r.amountIncludingTax || 0), 0);
    const tax = editItem.offlineDetails.reduce((s, r) => s + (r.taxAmount || 0), 0);
    return { ex: Math.round(ex * 100) / 100, in: Math.round(inTax * 100) / 100, tax: Math.round(tax * 100) / 100 };
  }, [editItem?.offlineDetails]);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">招采执行</h2>
        <PrimaryButton onClick={openAdd}>+ 新增招采执行</PrimaryButton>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, name: filterName, status: filterStatus })}
        onReset={() => {
          setFilterNo('');
          setFilterName('');
          setFilterStatus('');
          setApplied({ no: '', name: '', status: '' });
        }}
      >
        <SearchField label="工单编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="工单名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField
          label="状态"
          type="select"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'published', label: '已发布' },
            { value: 'bidding', label: '招标中' },
            { value: 'evaluated', label: '已评审' },
            { value: 'completed', label: '已完成' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增招采执行' : '编辑招采执行'}
        onClose={() => { setEditItem(null); setSelectedSuppliers([]); setSelectedDemand(null); setEditAttachments([]); setEditAnnouncement([]); setEditBiddingDocs([]); }}
        footer={
          <>
            <DefaultButton onClick={() => { setEditItem(null); setSelectedSuppliers([]); setSelectedDemand(null); setEditAttachments([]); setEditAnnouncement([]); setEditBiddingDocs([]); }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="960px"
      >
        {editItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 text-xs text-[#606266]">工单编号</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-sm"
                  value={editItem.biddingNo || ''}
                  placeholder={isNew ? '保存后自动生成' : undefined}
                  disabled
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[#606266]">
                  采购方式 <span className="text-[#f56c6c]">*</span>
                </div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={editItem.procurementMethod || 'framework'}
                  onChange={(e) => {
                    const v = e.target.value as BiddingProcurementMethod;
                    const patch: Partial<Bidding> = { procurementMethod: v };
                    // 切换采购方式时清空旧明细，避免类型不匹配
                    if (v !== 'framework') {
                      patch.items = [];
                      patch.offlineDetails = [];
                    }
                    setEditItem({ ...editItem, ...patch });
                  }}
                >
                  {PROCUREMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[#606266]">
                  项目名称 <span className="text-[#f56c6c]">*</span>
                  <span className="text-slate-400 ml-1">（从需求自动带出，可编辑）</span>
                </div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={editItem.projectName || editItem.biddingName || ''}
                  onChange={(e) => setEditItem({ ...editItem, projectName: e.target.value, biddingName: e.target.value })}
                  placeholder="请输入项目名称"
                />
              </div>
            </div>

            {/* 当前采购方式提示条 */}
            {editItem.procurementMethod && (
              <div className={`text-xs px-3 py-2 rounded border ${
                isCatalogCompare(editItem.procurementMethod)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                {isCatalogCompare(editItem.procurementMethod) ? (
                  '📋 模式：目录内比价（线上报价）— 供应商在小程序报价，你只需设置单品上限和整单上限。'
                ) : (
                  '📝 模式：线下录入 — 你自己填写清单、单价、税率，走审批流程。'
                )}
              </div>
            )}

            {/* 关联采购需求 — 弹框选择 */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[#606266]">
                  关联采购需求 <span className="text-[#f56c6c]">*</span>
                  <span className="text-slate-400 ml-1">（选择后将带入需求中的物资）</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDemandPickerOpen(true)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                >
                  {editItem.demandId ? '更换' : '选择'}
                </button>
              </div>
              {editItem.demandId ? (
                <div className="border border-indigo-200 bg-indigo-50 rounded px-3 py-2 text-xs">
                  <span className="font-mono text-indigo-600 mr-2">{selectedDemand?.demandNo || editItem.demandNo}</span>
                  <span className="text-slate-700">{selectedDemand?.projectName || editItem.projectName}</span>
                </div>
              ) : (
                <div className="border border-dashed border-[#dcdfe6] rounded px-3 py-2 text-xs text-slate-400 text-center">
                  请点击上方"选择"按钮，从已审核通过的采购需求中选择
                </div>
              )}
            </div>

            {/* ============ 明细区域 - 按采购方式动态切换 ============ */}
            {isCatalogCompare() ? (
              /* ===== 模式1: 目录内比价（线上报价）— 物资明细+单品上限 ===== */
              <>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-[#606266]">
                      物资明细（{editItem.items?.length || 0}项）- 对每条物资设置「单品上限单价(含税)」
                    </span>
                    {editItem.items && editItem.items.length > 0 && (
                      <span className="text-xs text-[#909399]">
                        条目上限合计（仅供参考）：
                        <span className="text-[#303133] font-semibold"> ¥{itemsTotalLimit.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                  {!editItem.items || editItem.items.length === 0 ? (
                    <div className="border border-dashed border-[#dcdfe6] rounded p-6 text-center text-sm text-[#909399]">
                      请先在上方选择一条已通过的采购需求，需求中的物资将自动带入。
                    </div>
                  ) : (
                    <div className="border border-[#dcdfe6] rounded">
                      <table className="w-full">
                        <thead className="bg-[#f5f7fa]">
                          <tr>
                            <th className="px-3 py-2 text-xs text-left w-10">#</th>
                            <th className="px-3 py-2 text-xs text-left">物资名称</th>
                            <th className="px-3 py-2 text-xs text-left">规格</th>
                            <th className="px-3 py-2 text-xs text-left">单位</th>
                            <th className="px-3 py-2 text-xs text-left w-16">数量</th>
                            <th className="px-3 py-2 text-xs text-left w-24 text-[#409eff]">申请单价(含税)</th>
                            <th className="px-3 py-2 text-xs text-left w-24 text-[#67c23a]">成本审核(含税)</th>
                            <th className="px-3 py-2 text-xs text-left w-28">单品上限(含税) *</th>
                            <th className="px-3 py-2 text-xs text-left w-24">小计(含税)</th>
                            <th className="px-3 py-2 text-xs text-center w-14">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editItem.items.map((item, idx) => {
                            const limit = item.singlePriceLimit || item.unitPriceLimitIncludingTax || 0;
                            return (
                              <tr key={idx} className="border-t border-[#ebeef5]">
                                <td className="px-3 py-2 text-xs text-[#909399]">{idx + 1}</td>
                                <td className="px-3 py-2 text-xs">{item.productName}</td>
                                <td className="px-3 py-2 text-xs text-[#606266]">{item.specification || '-'}</td>
                                <td className="px-3 py-2 text-xs">{item.unit}</td>
                                <td className="px-3 py-2 text-xs">
                                  <input type="number" className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                                    value={item.quantity} min={1}
                                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                                </td>
                                <td className="px-3 py-2 text-xs text-[#409eff]">
                                  {item.demandUnitPriceIncludingTax ? `¥${item.demandUnitPriceIncludingTax.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-[#67c23a]">
                                  {item.costAuditUnitPriceIncludingTax ? `¥${item.costAuditUnitPriceIncludingTax.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  <input type="number" className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                                    value={limit || ''}
                                    onChange={(e) => updateItem(idx, { singlePriceLimit: Number(e.target.value) })}
                                    placeholder="含税上限" />
                                </td>
                                <td className="px-3 py-2 text-xs text-[#303133] font-semibold">¥{(limit * (item.quantity || 0)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-xs text-center">
                                  <button onClick={() => removeItem(idx)} className="text-[#f56c6c] hover:underline">移除</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 整单上限总价 */}
                <div>
                  <div className="mb-1 text-xs text-[#606266]">
                    整单上限总价(含税) <span className="text-[#f56c6c]">*</span>
                    <span className="text-[#909399] ml-2">
                      （参考：所有条目的上限×数量之和 ≈ ¥{itemsTotalLimit.toLocaleString()}）
                    </span>
                  </div>
                  <input type="number" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                    value={editItem.totalPriceLimit || ''}
                    onChange={(e) => editItem && setEditItem({ ...editItem, totalPriceLimit: Number(e.target.value) })}
                    placeholder="请输入整单含税上限" />
                </div>
              </>

            ) : (
              /* ===== 模式3: 线下录入类（询比/竞价/谈判/直接/电子商城）===== */
              <>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      清单明细
                      <span className="ml-1.5 text-xs text-slate-400 font-normal">
                        （{editItem.offlineDetails?.length || 0} 项）· 填写不含税单价和税率，含税自动计算
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={handleOfflineImportClick}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200">
                        📥 导入清单
                      </button>
                      <button type="button" onClick={handleOfflineExport}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200">
                        📤 导出清单
                      </button>
                      <button type="button" onClick={addOfflineItem}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-[0.97] transition-all duration-200">
                        + 新增条目
                      </button>
                    </div>
                  </div>
                  {!editItem.offlineDetails || editItem.offlineDetails.length === 0 ? (
                    <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-8 text-center">
                      <div className="text-slate-400 text-sm">
                        请先在上方选择采购需求自动带入，或点击右侧「+ 新增条目」手动录入
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/30">
                            <th className="px-3 py-2.5 text-left w-10 text-[13px] text-slate-600 font-semibold">#</th>
                            <th className="px-3 py-2.5 text-left text-[13px] text-slate-600 font-semibold">项目/物料名称 <span className="text-rose-500">*</span></th>
                            <th className="px-3 py-2.5 text-left w-20 text-[13px] text-slate-600 font-semibold">数量</th>
                            <th className="px-3 py-2.5 text-left w-16 text-[13px] text-slate-600 font-semibold">单位</th>
                            <th className="px-3 py-2.5 text-left w-20 text-[13px] text-slate-600 font-semibold">税率</th>
                            <th className="px-3 py-2.5 text-left w-28 text-[13px] text-slate-600 font-semibold">不含税单价</th>
                            <th className="px-3 py-2.5 text-left w-28 text-[13px] text-indigo-600 font-semibold">含税单价 (自动)</th>
                            <th className="px-3 py-2.5 text-left w-24 text-[13px] text-slate-600 font-semibold">不含税金额</th>
                            <th className="px-3 py-2.5 text-left w-24 text-[13px] text-purple-600 font-semibold">含税金额</th>
                            <th className="px-3 py-2.5 text-center w-16 text-[13px] text-slate-600 font-semibold">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editItem.offlineDetails.map((row, idx) => (
                            <tr key={idx} className="border-t border-slate-100 transition-colors hover:bg-indigo-50/20">
                              <td className="px-3 py-2.5 text-slate-400 text-[13px]">{idx + 1}</td>
                              <td className="px-3 py-2.5">
                                <input className="w-full h-8 px-2.5 border border-slate-200 rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition-all"
                                  value={row.itemName}
                                  onChange={(e) => updateOfflineItem(idx, { itemName: e.target.value })} />
                              </td>
                              <td className="px-3 py-2.5">
                                <input type="number" min={0} className="w-full h-8 px-2.5 border border-slate-200 rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition-all"
                                  value={row.quantity}
                                  onChange={(e) => updateOfflineItem(idx, { quantity: Number(e.target.value) })} />
                              </td>
                              <td className="px-3 py-2.5">
                                <input className="w-full h-8 px-2.5 border border-slate-200 rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition-all"
                                  value={row.unit}
                                  onChange={(e) => updateOfflineItem(idx, { unit: e.target.value })} />
                              </td>
                              <td className="px-3 py-2.5">
                                <select className="w-full h-8 px-2.5 border border-slate-200 rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition-all cursor-pointer"
                                  value={row.taxRate ?? 0.13}
                                  onChange={(e) => updateOfflineItem(idx, { taxRate: Number(e.target.value) })}>
                                  <option value={0.13}>13%</option>
                                  <option value={0.09}>9%</option>
                                  <option value={0.06}>6%</option>
                                  <option value={0.03}>3%</option>
                                  <option value={0}>0%</option>
                                </select>
                              </td>
                              <td className="px-3 py-2.5">
                                <input type="number" step="0.01" className="w-full h-8 px-2.5 border border-slate-200 rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition-all"
                                  value={row.unitPriceExcludingTax ?? ''}
                                  onChange={(e) => updateOfflineItem(idx, { unitPriceExcludingTax: Number(e.target.value) })} />
                              </td>
                              <td className="px-3 py-2.5 text-indigo-600 font-semibold text-[13px]">
                                ¥{(row.unitPriceIncludingTax ?? 0).toLocaleString()}
                              </td>
                              <td className="px-3 py-2.5 text-slate-700 text-[13px]">¥{(row.amountExcludingTax ?? 0).toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-purple-600 font-semibold text-[13px]">¥{(row.amountIncludingTax ?? 0).toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-center">
                                <button onClick={() => removeOfflineItem(idx)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[12px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                                  移除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gradient-to-r from-slate-100 to-indigo-50/40 border-t border-slate-200">
                            <td colSpan={7} className="px-3 py-2.5 text-right text-slate-600 font-semibold text-[13px]">合计：</td>
                            <td className="px-3 py-2.5 text-slate-700 font-semibold text-[13px]">¥{offlineTotals.ex.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-purple-700 font-bold text-[13px]">¥{offlineTotals.in.toLocaleString()}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="px-3 py-2 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-indigo-500">💡</span>
                          税额合计 <span className="font-semibold text-slate-700">¥{offlineTotals.tax.toLocaleString()}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>填写不含税单价后，含税单价 / 含税金额 / 税额自动计算</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}


            {/* 受邀供应商（仅框架协议采购） */}
            {editItem?.procurementMethod === 'framework' && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[#606266]">受邀供应商</span>
                <button
                  type="button"
                  onClick={() => setSupplierPickerOpen(true)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                >
                  {selectedSuppliers.length > 0 ? '重新选择' : '选择'}（已选 {selectedSuppliers.length} 家）
                </button>
              </div>
              {selectedSuppliers.length > 0 ? (
                <div className="border border-[#dcdfe6] rounded p-2 flex flex-wrap gap-1.5 min-h-[40px]">
                  {selectedSuppliers.map((sid) => {
                    const sup = suppliers.find((s) => s.id === sid);
                    return (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200"
                      >
                        {sup?.name || sid}
                        <button
                          type="button"
                          onClick={() => toggleSupplier(sid)}
                          className="hover:text-red-500 ml-0.5"
                        >×</button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#dcdfe6] rounded px-3 py-2 text-xs text-slate-400 text-center min-h-[40px]">
                  请点击上方"选择"按钮，从启用的供应商中选择受邀对象
                </div>
              )}
            </div>
            )}

            {/* 竞价公告附件（仅框架协议采购） */}
            {editItem?.procurementMethod === 'framework' && (
            <div className="border border-[#409eff] rounded p-3 bg-[#ecf5ff]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-[#303133]">竞价公告附件</div>
                  <div className="text-xs text-[#909399]">上传竞价公告相关文件（PDF/Word/图片等）</div>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAnnouncementUpload}
                  />
                  <PrimaryButton size="small">+ 上传附件</PrimaryButton>
                </label>
              </div>
              {editAnnouncement.length === 0 ? (
                <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#b3d8ff] rounded bg-white">暂无附件，点击上方「上传附件」选择文件</div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-auto">
                  {editAnnouncement.map((att, idx) => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-[#e4e7ed] rounded px-3 py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[#409eff] text-sm">📎</span>
                        <span className="truncate font-medium text-[#303133]" title={att.fileName}>
                          {idx + 1}. {att.fileName}
                        </span>
                        <span className="text-[#909399] flex-shrink-0">({formatFileSize(att.fileSize)})</span>
                        <span className="text-[#909399] flex-shrink-0">上传：{att.uploadTime}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => setPreviewAtt(att)}
                        >预览</button>
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => downloadAttachment(att)}
                        >下载</button>
                        <button
                          className="text-[#f56c6c] hover:underline"
                          onClick={() => removeAnnouncement(att.id)}
                        >删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* 竞价文件附件（仅框架协议采购） */}
            {editItem?.procurementMethod === 'framework' && (
            <div className="border border-[#e6a23c] rounded p-3 bg-[#fdf6ec]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-[#303133]">竞价文件附件</div>
                  <div className="text-xs text-[#909399]">上传竞价文件相关资料（PDF/Word/Excel等）</div>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleBiddingDocsUpload}
                  />
                  <PrimaryButton size="small">+ 上传附件</PrimaryButton>
                </label>
              </div>
              {editBiddingDocs.length === 0 ? (
                <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#f5dab1] rounded bg-white">暂无附件，点击上方「上传附件」选择文件</div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-auto">
                  {editBiddingDocs.map((att, idx) => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-[#e4e7ed] rounded px-3 py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[#e6a23c] text-sm">📎</span>
                        <span className="truncate font-medium text-[#303133]" title={att.fileName}>
                          {idx + 1}. {att.fileName}
                        </span>
                        <span className="text-[#909399] flex-shrink-0">({formatFileSize(att.fileSize)})</span>
                        <span className="text-[#909399] flex-shrink-0">上传：{att.uploadTime}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => setPreviewAtt(att)}
                        >预览</button>
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => downloadAttachment(att)}
                        >下载</button>
                        <button
                          className="text-[#f56c6c] hover:underline"
                          onClick={() => removeBiddingDoc(att.id)}
                        >删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* 竞价小组评定结果附件 */}
            <div className="border border-[#67c23a] rounded p-3 bg-[#f0f9eb]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-[#303133]">竞价小组评定结果附件</div>
                  <div className="text-xs text-[#909399]">可上传评审报告、比价记录等附件（PDF/Word/Excel/图片等）</div>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <PrimaryButton size="small">+ 上传附件</PrimaryButton>
                </label>
              </div>
              {editAttachments.length === 0 ? (
                <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#c2e7b0] rounded bg-white">暂无附件，点击上方「上传附件」选择文件</div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-auto">
                  {editAttachments.map((att, idx) => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-[#e4e7ed] rounded px-3 py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[#409eff] text-sm">📎</span>
                        <span className="truncate font-medium text-[#303133]" title={att.fileName}>
                          {idx + 1}. {att.fileName}
                        </span>
                        <span className="text-[#909399] flex-shrink-0">({formatFileSize(att.fileSize)})</span>
                        <span className="text-[#909399] flex-shrink-0">上传：{att.uploadTime}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => setPreviewAtt(att)}
                        >预览</button>
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => downloadAttachment(att)}
                        >下载</button>
                        <button
                          className="text-[#f56c6c] hover:underline"
                          onClick={() => removeAttachment(att.id)}
                        >删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        open={!!viewItem}
        title="招采执行详情"
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="1100px"
      >
        {viewItem && (() => {
          // 找出已确认（采纳）的供应商报价
          const confirmedQuote = (viewItem.quotes || []).find(q => q.confirmedSupplierId);
          const confirmedSupplierName = confirmedQuote?.confirmedSupplierName
            || viewItem.winningSupplierName
            || (viewItem.quotes || []).find(q => q.isQualified)?.supplierName
            || null;
          const confirmedSupplierQuote = confirmedQuote
            || (viewItem.quotes || []).find(q => q.supplierName === confirmedSupplierName);

          return (
          <div className="space-y-3">
            {/* 基础信息 */}
            <div className="grid grid-cols-4 gap-3">
              <div><span className="text-[#909399] text-xs">工单编号：</span>{viewItem.biddingNo}</div>
              <div><span className="text-[#909399] text-xs">项目名称：</span>{viewItem.projectName || viewItem.biddingName}</div>
              <div><span className="text-[#909399] text-xs">采购方式：</span>
                {viewItem.procurementMethod
                  ? (BIDDING_METHOD_LABEL as any)[viewItem.procurementMethod] +
                    (viewItem.procurementMethod === 'framework' ? '(目录内比价)' : '')
                  : (viewItem.biddingType === 'market' ? '市场采购' : '库内采购')
                }
              </div>
              <div><span className="text-[#909399] text-xs">审批状态：</span>
                {viewItem.approvalStatus || viewItem.status}
              </div>
              <div><span className="text-[#909399] text-xs">业务状态：</span>{viewItem.status}</div>
              <div><span className="text-[#909399] text-xs">关联需求：</span>{viewItem.demandNo || '-'}</div>
              <div><span className="text-[#909399] text-xs">上限/合计：</span>
                {viewItem.totalPriceLimit ? `¥${viewItem.totalPriceLimit.toLocaleString()}` :
                 viewItem.totalAmountIncludingTax ? `¥${viewItem.totalAmountIncludingTax.toLocaleString()}` : '-'}
              </div>
              <div><span className="text-[#909399] text-xs">创建人：</span>{viewItem.creator}</div>
              <div><span className="text-[#909399] text-xs">创建时间：</span>{viewItem.createTime}</div>
              {viewItem.startTime && <div><span className="text-[#909399] text-xs">招标开始：</span>{viewItem.startTime}</div>}
              {viewItem.endTime && <div><span className="text-[#909399] text-xs">招标截止：</span>{viewItem.endTime}</div>}
            </div>

            {/* ====== 确认成交供应商（核心信息）====== */}
            {confirmedSupplierQuote && (
              <div className="border-2 border-[#67c23a] rounded-lg p-4 bg-[#f0f9eb]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-[#67c23a]">✅ 确认成交供应商</span>
                </div>
                <div className="grid grid-cols-5 gap-3 text-xs">
                  <div className="bg-white rounded p-2 border border-[#c2e7b0]">
                    <div className="text-[#909399] mb-1">供应商</div>
                    <div className="font-bold text-[#303133] text-sm">{confirmedSupplierQuote.supplierName}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-[#c2e7b0]">
                    <div className="text-[#909399] mb-1">联系人</div>
                    <div className="text-[#303133]">{confirmedSupplierQuote.contactPerson || '-'}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-[#c2e7b0]">
                    <div className="text-[#909399] mb-1">联系电话</div>
                    <div className="text-[#303133]">{confirmedSupplierQuote.contactPhone || '-'}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-[#c2e7b0]">
                    <div className="text-[#909399] mb-1">税率</div>
                    <div className="text-[#303133]">
                      {confirmedSupplierQuote.taxRate != null ? (confirmedSupplierQuote.taxRate * 100).toFixed(0) + '%' : '含税'}
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-[#c2e7b0]">
                    <div className="text-[#909399] mb-1">含税报价总额</div>
                    <div className="font-bold text-[#f56c6c] text-lg">
                      ¥{confirmedSupplierQuote.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 已确认供应商的物资报价明细 */}
                {confirmedSupplierQuote.details && confirmedSupplierQuote.details.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-[#606266] mb-2">确认成交物资明细</div>
                    <div className="border border-[#c2e7b0] rounded bg-white overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#f0f9eb]">
                          <tr>
                            <th className="px-3 py-2 text-xs text-left text-[#606266]">序号</th>
                            <th className="px-3 py-2 text-xs text-left text-[#606266]">物资编码</th>
                            <th className="px-3 py-2 text-xs text-left text-[#606266]">物资名称</th>
                            <th className="px-3 py-2 text-xs text-left text-[#606266]">规格</th>
                            <th className="px-3 py-2 text-xs text-center text-[#606266]">单位</th>
                            <th className="px-3 py-2 text-xs text-right text-[#606266]">数量</th>
                            <th className="px-3 py-2 text-xs text-right text-[#606266]">含税单价</th>
                            <th className="px-3 py-2 text-xs text-right text-[#606266]">税率</th>
                            <th className="px-3 py-2 text-xs text-right text-[#606266]">含税金额</th>
                            <th className="px-3 py-2 text-xs text-right text-[#606266]">税额</th>
                            <th className="px-3 py-2 text-xs text-right text-[#606266]">单品上限</th>
                            <th className="px-3 py-2 text-xs text-center text-[#606266]">是否超限</th>
                          </tr>
                        </thead>
                        <tbody>
                          {confirmedSupplierQuote.details.map((detail, idx) => {
                            const biddingItem = viewItem.items?.find(it => it.productCode === detail.productCode);
                            return (
                              <tr key={idx} className="border-t border-[#ebeef5]">
                                <td className="px-3 py-2 text-xs text-[#909399]">{idx + 1}</td>
                                <td className="px-3 py-2 text-xs">{detail.productCode}</td>
                                <td className="px-3 py-2 text-xs font-medium">{detail.productName}</td>
                                <td className="px-3 py-2 text-xs text-[#606266]">{detail.specification || '-'}</td>
                                <td className="px-3 py-2 text-xs text-center">{detail.unit}</td>
                                <td className="px-3 py-2 text-xs text-right">{detail.quantity}</td>
                                <td className="px-3 py-2 text-xs text-right font-semibold text-[#f56c6c]">
                                  ¥{detail.unitPrice.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-xs text-center">
                                  {detail.taxRate != null ? (detail.taxRate * 100).toFixed(0) + '%' : '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-right">¥{detail.amount.toLocaleString()}</td>
                                <td className="px-3 py-2 text-xs text-right text-[#67c23a]">
                                  {detail.taxAmount != null ? '¥' + detail.taxAmount.toLocaleString() : '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-right text-[#e6a23c]">
                                  {biddingItem ? '¥' + biddingItem.singlePriceLimit.toLocaleString() : '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-center">
                                  <span className={detail.isOverSingleLimit ? 'text-[#f56c6c]' : 'text-[#67c23a]'}>
                                    {detail.isOverSingleLimit ? '⚠️ 超限' : '✅ 通过'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-[#c2e7b0] bg-[#f0f9eb]">
                            <td colSpan={8} className="px-3 py-2 text-xs text-right font-bold text-[#606266]">含税合计</td>
                            <td className="px-3 py-2 text-xs text-right font-bold text-[#f56c6c]">
                              ¥{confirmedSupplierQuote.totalAmount.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-xs text-right font-bold text-[#67c23a]">
                              {confirmedSupplierQuote.taxAmount != null
                                ? '¥' + confirmedSupplierQuote.taxAmount.toLocaleString()
                                : '-'}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                          {confirmedSupplierQuote.taxRate != null && confirmedSupplierQuote.taxAmount != null && (
                            <tr className="border-t border-[#ebeef5] bg-white">
                              <td colSpan={8} className="px-3 py-2 text-xs text-right text-[#909399]">不含税金额（差额）</td>
                              <td colSpan={1}></td>
                              <td className="px-3 py-2 text-xs text-right text-[#909399]">
                                ¥{(confirmedSupplierQuote.totalAmount - confirmedSupplierQuote.taxAmount).toLocaleString()}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          )}
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {confirmedSupplierQuote.confirmedAt && (
                  <div className="mt-2 text-xs text-[#909399] text-right">
                    确认时间：{confirmedSupplierQuote.confirmedAt}
                  </div>
                )}
              </div>
            )}

            {/* 物资明细与单品上限 */}
            {viewItem.items && viewItem.items.length > 0 && (
              <div>
                <div className="text-[#606266] text-xs font-bold mb-2">物资明细及单品上限</div>
                <div className="border border-[#dcdfe6] rounded">
                  <table className="w-full">
                    <thead className="bg-[#f5f7fa]">
                      <tr>
                        <th className="px-3 py-2 text-xs text-left">序号</th>
                        <th className="px-3 py-2 text-xs text-left">物资名称</th>
                        <th className="px-3 py-2 text-xs text-left">规格</th>
                        <th className="px-3 py-2 text-xs text-left">单位</th>
                        <th className="px-3 py-2 text-xs text-left">数量</th>
                        <th className="px-3 py-2 text-xs text-left text-[#409eff]">采购申请单价(含税)</th>
                        <th className="px-3 py-2 text-xs text-left text-[#67c23a]">成本审核单价(含税)</th>
                        <th className="px-3 py-2 text-xs text-left">单品上限单价</th>
                        <th className="px-3 py-2 text-xs text-left">上限小计</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewItem.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-[#ebeef5]">
                          <td className="px-3 py-2 text-xs text-[#909399]">{idx + 1}</td>
                          <td className="px-3 py-2 text-xs">{item.productName}</td>
                          <td className="px-3 py-2 text-xs text-[#606266]">{item.specification || '-'}</td>
                          <td className="px-3 py-2 text-xs">{item.unit}</td>
                          <td className="px-3 py-2 text-xs">{item.quantity}</td>
                          <td className="px-3 py-2 text-xs text-[#409eff]">
                            {item.demandUnitPriceIncludingTax ? `¥${item.demandUnitPriceIncludingTax.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-[#67c23a]">
                            {item.costAuditUnitPriceIncludingTax ? `¥${item.costAuditUnitPriceIncludingTax.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-[#e6a23c]">¥{item.singlePriceLimit.toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs font-semibold">¥{(item.singlePriceLimit * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 报价情况 */}
            <div>
              <div className="text-[#606266] text-xs font-bold mb-2">供应商报价（{viewItem.quotes?.length || 0}家）</div>
              <div className="border border-[#dcdfe6] rounded overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-3 py-2 text-xs text-left">供应商</th>
                      <th className="px-3 py-2 text-xs text-left">联系人</th>
                      <th className="px-3 py-2 text-xs text-left">电话</th>
                      <th className="px-3 py-2 text-xs text-right">含税总额</th>
                      <th className="px-3 py-2 text-xs text-center">税率</th>
                      <th className="px-3 py-2 text-xs text-right">税额</th>
                      <th className="px-3 py-2 text-xs text-center">是否符合</th>
                      <th className="px-3 py-2 text-xs text-center">单品检查</th>
                      <th className="px-3 py-2 text-xs text-center">整单检查</th>
                      <th className="px-3 py-2 text-xs text-left">备注</th>
                      <th className="px-3 py-2 text-xs text-left">报价时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewItem.quotes || []).map(quote => {
                      const isConfirmed = !!quote.confirmedSupplierId || quote.supplierName === confirmedSupplierName;
                      return (
                        <tr key={quote.id} className={'border-t border-[#ebeef5] ' + (isConfirmed ? 'bg-[#f0f9eb]' : '')}>
                          <td className="px-3 py-2 text-xs">
                            {quote.supplierName}
                            {isConfirmed && <span className="ml-1 text-[#67c23a]">👑</span>}
                          </td>
                          <td className="px-3 py-2 text-xs">{quote.contactPerson || '-'}</td>
                          <td className="px-3 py-2 text-xs">{quote.contactPhone || '-'}</td>
                          <td className="px-3 py-2 text-xs text-right font-bold text-[#f56c6c]">¥{quote.totalAmount.toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-center">
                            {quote.taxRate != null ? (quote.taxRate * 100).toFixed(0) + '%' : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-right text-[#67c23a]">
                            {quote.taxAmount != null ? '¥' + quote.taxAmount.toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-center">
                            <span className={quote.isQualified ? 'text-[#67c23a]' : 'text-[#f56c6c]'}>
                              {quote.isQualified ? '符合' : '不符合'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-center">
                            <span className={quote.isOverSingleLimit ? 'text-[#f56c6c]' : 'text-[#67c23a]'}>
                              {quote.isOverSingleLimit ? '超出' : '通过'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-center">
                            <span className={quote.isOverTotalLimit ? 'text-[#f56c6c]' : 'text-[#67c23a]'}>
                              {quote.isOverTotalLimit ? '超出' : '通过'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-[#909399]">{quote.remark || '-'}</td>
                          <td className="px-3 py-2 text-xs">{quote.submittedAt}</td>
                        </tr>
                      );
                    })}
                    {(!viewItem.quotes || viewItem.quotes.length === 0) && (
                      <tr>
                        <td colSpan={11} className="px-3 py-4 text-center text-[#909399]">暂无报价</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 竞价公告附件（仅框架协议采购） */}
            {viewItem.procurementMethod === 'framework' && (
              <div className="border border-[#409eff] rounded p-3 bg-[#ecf5ff]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[#303133]">📎 竞价公告附件</div>
                  <div className="text-xs text-[#909399]">共 {viewItem.biddingAnnouncement?.length || 0} 个文件</div>
                </div>
                {!viewItem.biddingAnnouncement || viewItem.biddingAnnouncement.length === 0 ? (
                  <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#b3d8ff] rounded bg-white">暂无附件</div>
                ) : (
                  <div className="space-y-1">
                    {viewItem.biddingAnnouncement.map((att, idx) => (
                      <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-[#dcdfe6] rounded px-3 py-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[#409eff] text-sm">📎</span>
                          <span className="truncate font-medium text-[#303133]" title={att.fileName}>
                            {idx + 1}. {att.fileName}
                          </span>
                          <span className="text-[#909399] flex-shrink-0">({formatFileSize(att.fileSize)})</span>
                          <span className="text-[#909399] flex-shrink-0">上传：{att.uploadTime}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button
                            className="text-[#409eff] hover:underline"
                            onClick={() => setPreviewAtt(att)}
                          >预览</button>
                          <button
                            className="text-[#409eff] hover:underline"
                            onClick={() => downloadAttachment(att)}
                          >下载</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 竞价文件附件（仅框架协议采购） */}
            {viewItem.procurementMethod === 'framework' && (
              <div className="border border-[#e6a23c] rounded p-3 bg-[#fdf6ec]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[#303133]">📎 竞价文件附件</div>
                  <div className="text-xs text-[#909399]">共 {viewItem.biddingDocuments?.length || 0} 个文件</div>
                </div>
                {!viewItem.biddingDocuments || viewItem.biddingDocuments.length === 0 ? (
                  <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#f5dab1] rounded bg-white">暂无附件</div>
                ) : (
                  <div className="space-y-1">
                    {viewItem.biddingDocuments.map((att, idx) => (
                      <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-[#dcdfe6] rounded px-3 py-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[#e6a23c] text-sm">📎</span>
                          <span className="truncate font-medium text-[#303133]" title={att.fileName}>
                            {idx + 1}. {att.fileName}
                          </span>
                          <span className="text-[#909399] flex-shrink-0">({formatFileSize(att.fileSize)})</span>
                          <span className="text-[#909399] flex-shrink-0">上传：{att.uploadTime}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button
                            className="text-[#409eff] hover:underline"
                            onClick={() => setPreviewAtt(att)}
                          >预览</button>
                          <button
                            className="text-[#409eff] hover:underline"
                            onClick={() => downloadAttachment(att)}
                          >下载</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 竞价小组评定结果附件 */}
            <div className="border border-[#67c23a] rounded p-3 bg-[#f0f9eb]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-[#303133]">📎 竞价小组评定结果附件</div>
                <div className="text-xs text-[#909399]">共 {viewItem.attachments?.length || 0} 个文件</div>
              </div>
              {!viewItem.attachments || viewItem.attachments.length === 0 ? (
                <div className="text-xs text-[#909399] text-center py-3 border border-dashed border-[#b3d8ff] rounded bg-white">暂无附件</div>
              ) : (
                <div className="space-y-1">
                  {viewItem.attachments.map((att, idx) => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-[#dcdfe6] rounded px-3 py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[#409eff] text-sm">📎</span>
                        <span className="truncate font-medium text-[#303133]" title={att.fileName}>
                          {idx + 1}. {att.fileName}
                        </span>
                        <span className="text-[#909399] flex-shrink-0">({formatFileSize(att.fileSize)})</span>
                        <span className="text-[#909399] flex-shrink-0">上传：{att.uploadTime}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => setPreviewAtt(att)}
                        >预览</button>
                        <button
                          className="text-[#409eff] hover:underline"
                          onClick={() => downloadAttachment(att)}
                        >下载</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 成交结果（库内采购） */}
            {viewItem.status === 'completed' && !confirmedQuote && (
              <div className="border border-[#dcdfe6] rounded p-3 bg-[#f5f7fa]">
                <div className="text-[#606266] text-xs font-bold mb-2">成交结果</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[#909399] text-xs">成交供应商：</span>{viewItem.winningSupplierName}</div>
                </div>
              </div>
            )}
          </div>
          );
        })()}
      </Modal>

      {/* 附件预览弹窗 */}
      <Modal
        open={!!previewAtt}
        title={previewAtt ? '附件预览 · ' + previewAtt.fileName : ''}
        onClose={() => setPreviewAtt(null)}
        footer={<DefaultButton onClick={() => setPreviewAtt(null)}>关闭</DefaultButton>}
        width="900px"
        height="600px"
      >
        {previewAtt && (
          <div className="space-y-2">
            <div className="text-xs text-[#909399] flex justify-between">
              <span>文件名：{previewAtt.fileName}</span>
              <span>大小：{formatFileSize(previewAtt.fileSize)} · 上传时间：{previewAtt.uploadTime}</span>
            </div>
            {previewAtt.fileType?.startsWith('image/') ? (
              <div className="flex justify-center items-center p-3 bg-[#f5f7fa] border border-[#dcdfe6] rounded overflow-auto" style={{ maxHeight: '480px' }}>
                <img src={previewAtt.filePath} alt={previewAtt.fileName} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center p-12 bg-[#f5f7fa] border border-[#dcdfe6] rounded text-center">
                <div className="text-6xl text-[#409eff] mb-4">📄</div>
                <div className="text-sm font-medium text-[#303133] mb-2">{previewAtt.fileName}</div>
                <div className="text-xs text-[#909399] mb-4">该文件类型暂不支持在线预览，请下载后查看</div>
                <PrimaryButton onClick={() => downloadAttachment(previewAtt)}>下载附件</PrimaryButton>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 供应商多选弹框 */}
      <SupplierPickerModal
        open={supplierPickerOpen}
        onClose={() => setSupplierPickerOpen(false)}
        suppliers={suppliers}
        selectedIds={selectedSuppliers}
        onConfirm={handleConfirmSuppliers}
      />

      {/* 采购需求单选弹框 */}
      <DemandPickerModal
        open={demandPickerOpen}
        onClose={() => setDemandPickerOpen(false)}
        demands={procurementDemands}
        selectedId={editItem?.demandId}
        onConfirm={handleConfirmDemand}
      />

      {/* 招标时间设置弹框 */}
      <TimePickerModal
        open={!!timePickerTarget}
        onClose={() => setTimePickerTarget(null)}
        biddingLabel={timePickerTarget ? `${timePickerTarget.biddingNo} ${timePickerTarget.biddingName}` : ''}
        initialStart={timePickerTarget?.startTime}
        initialEnd={timePickerTarget?.endTime}
        onConfirm={handleConfirmTime}
      />

      {/* offline 清单导入隐藏 file input */}
      <input
        ref={offlineFileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleOfflineFileChange}
      />
    </div>
  );
}
