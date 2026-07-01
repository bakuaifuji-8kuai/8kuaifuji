import { useEffect, useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { MOCK_BIDDINGS, MOCK_SUPPLIER_QUOTES } from '@/mock/biddingMockData';
import type { Bidding, BiddingQuote, BiddingItem, BiddingQuoteDetail, ProcurementDemand, Attachment } from '@/types';

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
    { key: 'biddingName', title: '工单名称' },
    {
      key: 'biddingType',
      title: '工单类型',
      render: (row) => row.biddingType === 'market' ? '市场采购' : '库内采购',
    },
    { key: 'demandNo', title: '关联需求', render: (row) => row.demandNo || '-' },
    {
      key: 'itemsCount',
      title: '物资数量',
      render: (row) => (row.items?.length || 0) + ' 项',
    },
    {
      key: 'totalLimit',
      title: '整单上限',
      render: (row) => row.totalPriceLimit ? `¥${row.totalPriceLimit.toLocaleString()}` : '-',
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'text-[#909399]' },
          published: { label: '已发布', color: 'text-[#409eff]' },
          bidding: { label: '招标中', color: 'text-[#e6a23c]' },
          evaluated: { label: '已评审', color: 'text-[#67c23a]' },
          completed: { label: '已完成', color: 'text-[#67c23a]' },
        };
        const status = statusMap[row.status] || statusMap.draft;
        return <span className={status.color}>{status.label}</span>;
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
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
          <TextButton onClick={() => viewDetail(row)}>查看详情</TextButton>
          {row.status === 'draft' && (
            <TextButton onClick={() => handlePublish(row)}>发布</TextButton>
          )}
          {row.status === 'published' && row.biddingType === 'library' && (
            <TextButton onClick={() => handleStartBidding(row)}>开始采购</TextButton>
          )}
          {row.status === 'bidding' && (
            <TextButton onClick={() => handleEvaluate(row)}>评审</TextButton>
          )}
          {row.status === 'evaluated' && (
            <TextButton onClick={() => handleComplete(row)}>完成</TextButton>
          )}
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除工单 ${row.biddingNo}？`)) deleteBidding?.(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
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
      biddingNo: `JJ${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String((biddings?.length || 0) + 1).padStart(3, '0')}`,
      biddingName: '',
      biddingType: 'market',
      status: 'draft',
      creator: currentUser.name,
      createTime: now.toISOString().replace('T', ' ').slice(0, 19),
      quotes: [],
      items: [],
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
    updateBidding?.(bidding.id, { status: 'published' });
  };

  const handleStartBidding = (bidding: Bidding) => {
    // 只有库内采购才自动模拟供应商报价
    if (bidding.biddingType !== 'library') return;
    updateBidding?.(bidding.id, { status: 'bidding' });
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

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.items || editItem.items.length === 0) {
      alert('请先选择采购需求，并至少选择一条物资设置单品上限！');
      return;
    }
    for (const item of editItem.items) {
      if (!item.singlePriceLimit || item.singlePriceLimit <= 0) {
        alert(`物资「${item.productName}」必须设置单品上限单价！`);
        return;
      }
    }
    const saveBidding = {
      ...editItem,
      inviteSupplierIds: selectedSuppliers,
      attachments: [...editAttachments],
      biddingAnnouncement: [...editAnnouncement],
      biddingDocuments: [...editBiddingDocs],
    };
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

  // 选择采购需求时，自动带入物资明细，等待用户勾选与设置上限
  const handleSelectDemand = (demandId: string) => {
    const demand = procurementDemands.find(d => d.id === demandId);
    setSelectedDemand(demand || null);

    if (demand && demand.details && demand.details.length > 0) {
      // 默认把需求中的所有物资都加入条目，以需求的含税单价做上限初始值，用户可改
      const items: BiddingItem[] = demand.details.map(d => ({
        productCode: d.productCode,
        productName: d.productName,
        unit: d.unit,
        quantity: d.quantity,
        specification: d.specification,
        singlePriceLimit: d.unitPriceIncludingTax || d.unitPriceExcludingTax || 0,
        demandUnitPriceIncludingTax: d.unitPriceIncludingTax,
        demandUnitPriceExcludingTax: d.unitPriceExcludingTax,
        costAuditUnitPriceIncludingTax: d.costAuditUnitPriceIncludingTax,
        costAuditUnitPriceExcludingTax: d.costAuditUnitPriceExcludingTax,
      }));
      editItem && setEditItem({
        ...editItem,
        demandId: demand.id,
        demandNo: demand.demandNo,
        projectName: demand.projectName,
        items,
      });
    } else {
      editItem && setEditItem({
        ...editItem,
        demandId: demandId,
        demandNo: demand?.demandNo,
        projectName: demand?.projectName,
        items: [],
      });
    }
  };

  // 更新某条物资条目
  const updateItem = (index: number, patch: Partial<BiddingItem>) => {
    if (!editItem || !editItem.items) return;
    const newItems = [...editItem.items];
    newItems[index] = { ...newItems[index], ...patch };
    setEditItem({ ...editItem, items: newItems });
  };

  const removeItem = (index: number) => {
    if (!editItem || !editItem.items) return;
    const newItems = editItem.items.filter((_, i) => i !== index);
    setEditItem({ ...editItem, items: newItems });
  };

  // 计算当前条目的上限总价（参考）
  const itemsTotalLimit = useMemo(() => {
    if (!editItem?.items) return 0;
    return editItem.items.reduce((sum, item) => {
      return sum + (item.singlePriceLimit || 0) * (item.quantity || 0);
    }, 0);
  }, [editItem?.items]);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">采购工单</h2>
        <PrimaryButton onClick={openAdd}>+ 新增采购工单</PrimaryButton>
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
        title={isNew ? '新增采购工单' : '编辑采购工单'}
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
                  value={editItem.biddingNo}
                  disabled
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[#606266]">工单类型</div>
                <select
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={editItem.biddingType}
                  onChange={(e) => editItem && setEditItem({ ...editItem, biddingType: e.target.value as any })}
                >
                  <option value="market">市场采购</option>
                  <option value="library">供应商库内采购</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[#606266]">工单名称</div>
                <input
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={editItem.biddingName}
                  onChange={(e) => editItem && setEditItem({ ...editItem, biddingName: e.target.value })}
                />
              </div>
            </div>

            {/* 招标期时间段 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-xs text-[#606266]">
                  招标开始时间 <span className="text-[#f56c6c]">*</span>
                </div>
                <input
                  type="datetime-local"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={editItem.startTime ? editItem.startTime.replace(' ', 'T').slice(0, 16) : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      editItem && setEditItem({ ...editItem, startTime: val.replace('T', ' ') + ':00' });
                    } else {
                      editItem && setEditItem({ ...editItem, startTime: undefined });
                    }
                  }}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[#606266]">
                  招标截止时间 <span className="text-[#f56c6c]">*</span>
                </div>
                <input
                  type="datetime-local"
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                  value={editItem.endTime ? editItem.endTime.replace(' ', 'T').slice(0, 16) : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      editItem && setEditItem({ ...editItem, endTime: val.replace('T', ' ') + ':00' });
                    } else {
                      editItem && setEditItem({ ...editItem, endTime: undefined });
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-[#606266]">
                关联采购需求 <span className="text-[#f56c6c]">* 选择后将带入需求中的物资</span>
              </div>
              <select
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={editItem.demandId || ''}
                onChange={(e) => handleSelectDemand(e.target.value)}
              >
                <option value="">请选择采购需求</option>
                {procurementDemands.filter(d => d.status === 'approved' || d.status === 'changed').map(d => (
                  <option key={d.id} value={d.id}>{d.demandNo} - {d.projectName}</option>
                ))}
              </select>
            </div>

            {/* 物资明细表格 */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[#606266]">
                  物资明细（{editItem.items?.length || 0}项）- 对每条物资设置「单品上限单价」
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
                        <th className="px-3 py-2 text-xs text-left w-12"></th>
                        <th className="px-3 py-2 text-xs text-left">物资名称</th>
                        <th className="px-3 py-2 text-xs text-left">规格</th>
                        <th className="px-3 py-2 text-xs text-left">单位</th>
                        <th className="px-3 py-2 text-xs text-left w-20">数量</th>
                        <th className="px-3 py-2 text-xs text-left w-28 text-[#409eff]">
                          采购申请单价(含税)
                        </th>
                        <th className="px-3 py-2 text-xs text-left w-28 text-[#67c23a]">
                          成本审核单价(含税)
                        </th>
                        <th className="px-3 py-2 text-xs text-left w-32">
                          单品上限单价 <span className="text-[#f56c6c]">*</span>
                        </th>
                        <th className="px-3 py-2 text-xs text-left w-28">小计(上限×数量)</th>
                        <th className="px-3 py-2 text-xs text-center w-16">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editItem.items.map((item, idx) => {
                        const subtotal = (item.singlePriceLimit || 0) * (item.quantity || 0);
                        return (
                          <tr key={idx} className="border-t border-[#ebeef5]">
                            <td className="px-3 py-2 text-xs text-[#909399]">{idx + 1}</td>
                            <td className="px-3 py-2 text-xs">{item.productName}</td>
                            <td className="px-3 py-2 text-xs text-[#606266]">{item.specification || '-'}</td>
                            <td className="px-3 py-2 text-xs">{item.unit}</td>
                            <td className="px-3 py-2 text-xs">
                              <input
                                type="number"
                                className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                                value={item.quantity}
                                min={1}
                                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                              />
                            </td>
                            <td className="px-3 py-2 text-xs text-[#409eff]">
                              {item.demandUnitPriceIncludingTax ? `¥${item.demandUnitPriceIncludingTax.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-3 py-2 text-xs text-[#67c23a]">
                              {item.costAuditUnitPriceIncludingTax ? `¥${item.costAuditUnitPriceIncludingTax.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              <input
                                type="number"
                                className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm"
                                value={item.singlePriceLimit || ''}
                                onChange={(e) => updateItem(idx, { singlePriceLimit: Number(e.target.value) })}
                                placeholder="请输入上限"
                              />
                            </td>
                            <td className="px-3 py-2 text-xs text-[#303133] font-semibold">¥{subtotal.toLocaleString()}</td>
                            <td className="px-3 py-2 text-xs text-center">
                              <button
                                onClick={() => removeItem(idx)}
                                className="text-[#f56c6c] hover:underline"
                              >移除</button>
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
                整单上限总价 <span className="text-[#f56c6c]">*</span>
                <span className="text-[#909399] ml-2">
                  （参考：所有条目的上限×数量之和 ≈ ¥{itemsTotalLimit.toLocaleString()}）
                </span>
              </div>
              <input
                type="number"
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                value={editItem.totalPriceLimit || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, totalPriceLimit: Number(e.target.value) })}
                placeholder="请输入整单上限总价（超过此价格的报价将被判定为不符合）"
              />
            </div>

            <div>
              <div className="mb-1 text-xs text-[#606266]">选择受邀供应商</div>
              <div className="border border-[#dcdfe6] rounded max-h-40 overflow-auto p-2">
                {suppliers.filter(s => s.status === 'enabled').map(s => (
                  <label key={s.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(s.id)}
                      onChange={() => toggleSupplier(s.id)}
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 竞价公告附件 */}
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

            {/* 竞价文件附件 */}
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
        title="工单详情"
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
              <div><span className="text-[#909399] text-xs">工单名称：</span>{viewItem.biddingName}</div>
              <div><span className="text-[#909399] text-xs">工单类型：</span>{viewItem.biddingType === 'market' ? '市场采购' : '库内采购'}</div>
              <div><span className="text-[#909399] text-xs">状态：</span>{viewItem.status}</div>
              <div><span className="text-[#909399] text-xs">关联需求：</span>{viewItem.demandNo || '-'}</div>
              <div><span className="text-[#909399] text-xs">整单上限：</span>{viewItem.totalPriceLimit ? `¥${viewItem.totalPriceLimit.toLocaleString()}` : '-'}</div>
              <div><span className="text-[#909399] text-xs">创建人：</span>{viewItem.creator}</div>
              <div><span className="text-[#909399] text-xs">创建时间：</span>{viewItem.createTime}</div>
              <div><span className="text-[#909399] text-xs">招标开始时间：</span>{viewItem.startTime || '-'}</div>
              <div><span className="text-[#909399] text-xs">招标截止时间：</span>{viewItem.endTime || '-'}</div>
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

            {/* 竞价公告附件 */}
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

            {/* 竞价文件附件 */}
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
    </div>
  );
}
