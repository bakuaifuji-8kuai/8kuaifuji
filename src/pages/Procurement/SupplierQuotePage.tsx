import { useEffect, useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import { MOCK_BIDDINGS, MOCK_SUPPLIER_QUOTES } from '@/mock/biddingMockData';
import type { Bidding, BiddingItem, Supplier, SupplierQuote, SupplierQuoteDetail, BiddingQuote } from '@/types';

// ======== 测试数据已抽离到 @/mock/biddingMockData ========

export default function SupplierQuotePage() {
  const supplierQuotes = useStore((s) => s.supplierQuotes) as SupplierQuote[];
  const setSupplierQuotes = useStore((s) => s.setSupplierQuotes) as ((data: SupplierQuote[]) => void) | undefined;
  const updateSupplierQuote = useStore((s) => s.updateSupplierQuote) as ((id: string, data: Partial<SupplierQuote>) => void) | undefined;
  const deleteSupplierQuote = useStore((s) => s.deleteSupplierQuote) as ((id: string) => void) | undefined;
  const biddings = useStore((s) => s.biddings || []) as Bidding[];
  const setBiddings = useStore((s) => s.setBiddings) as ((data: Bidding[]) => void) | undefined;
  const updateBidding = useStore((s) => s.updateBidding) as ((id: string, data: any) => void) | undefined;
  const suppliers = useStore((s) => s.suppliers || []) as Supplier[];

  // 初始化：注入 15 条市场采购工单 + 30+5 条供应商报价单（仅首次）
  useEffect(() => {
    if (biddings.length === 0) setBiddings?.(MOCK_BIDDINGS);
    if (supplierQuotes.length === 0) setSupplierQuotes?.(MOCK_SUPPLIER_QUOTES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filterNo, setFilterNo] = useState('');
  const [filterBiddingId, setFilterBiddingId] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProductKeyword, setFilterProductKeyword] = useState('');
  const [applied, setApplied] = useState({ no: '', biddingId: '', supplier: '', status: '' });
  const [selectModal, setSelectModal] = useState<{ biddingId: string; biddingNo: string; candidates: SupplierQuote[]; selectedId: string | null } | null>(null);

  // 新增报价单弹窗状态
  const [newQuoteModal, setNewQuoteModal] = useState(false);
  const [newQuoteBiddingId, setNewQuoteBiddingId] = useState('');
  const [newQuoteSupplierIds, setNewQuoteSupplierIds] = useState<string[]>([]);
  const [newQuoteSupplierSearch, setNewQuoteSupplierSearch] = useState('');

  // 视图模式：quote=按报价单 / material=按物资 / order=按工单
  const [viewMode, setViewMode] = useState<'quote' | 'material' | 'order'>('material');
  // 物资报价对比弹窗：展示某个 (biddingId, productCode) 的所有供应商横向对比
  const [compareModal, setCompareModal] = useState<{
    key: string;
    biddingId: string;
    biddingNo: string;
    productCode: string;
    productName: string;
    specification?: string;
    unit: string;
    quantity: number;
  } | null>(null);

  const filteredData = useMemo(() => {
    return supplierQuotes.filter((q) => {
      if (applied.no && !q.quoteNo.includes(applied.no)) return false;
      if (applied.biddingId && q.biddingId !== applied.biddingId) return false;
      if (applied.supplier && !q.supplierName.includes(applied.supplier)) return false;
      if (applied.status && q.status !== applied.status) return false;
      return true;
    });
  }, [supplierQuotes, applied]);

  // ==== 按物资维度聚合 ====
  // 以 (biddingId + productCode) 为主键，收集所有供应商对该物资的报价
  interface MaterialQuoteRow {
    key: string;
    biddingId: string;
    biddingNo: string;
    biddingName: string;
    productCode: string;
    productName: string;
    specification?: string;
    unit: string;
    quantity: number;
    quotes: {
      quoteId: string;
      quoteNo: string;
      supplierId: string;
      supplierName: string;
      unitPrice: number;
      taxRate?: number;
      amount: number;
      taxAmount?: number;
      deliveryDate?: string;
      status: SupplierQuote['status'];
      contactPhone?: string;
      submittedAt?: string;
    }[];
    quoteCount: number;
    lowestPrice: number | null;
    highestPrice: number | null;
    avgPrice: number | null;
  }

  const materialRows = useMemo<MaterialQuoteRow[]>(() => {
    const map = new Map<string, MaterialQuoteRow>();
    supplierQuotes.forEach((q) => {
      if (applied.biddingId && q.biddingId !== applied.biddingId) return;
      if (applied.supplier && !q.supplierName.includes(applied.supplier)) return;
      if (applied.status && q.status !== applied.status) return;
      q.details.forEach((d) => {
        if (filterProductKeyword) {
          const kw = filterProductKeyword.trim().toLowerCase();
          if (!d.productCode.toLowerCase().includes(kw) &&
              !d.productName.toLowerCase().includes(kw)) return;
        }
        const key = `${q.biddingId}__${d.productCode}`;
        let row = map.get(key);
        if (!row) {
          row = {
            key,
            biddingId: q.biddingId,
            biddingNo: q.biddingNo,
            biddingName: q.biddingName,
            productCode: d.productCode,
            productName: d.productName,
            specification: d.specification,
            unit: d.unit,
            quantity: d.quantity,
            quotes: [],
            quoteCount: 0,
            lowestPrice: null,
            highestPrice: null,
            avgPrice: null,
          };
          map.set(key, row);
        }
        row.quotes.push({
          quoteId: q.id,
          quoteNo: q.quoteNo,
          supplierId: q.supplierId,
          supplierName: q.supplierName,
          unitPrice: d.unitPrice,
          taxRate: d.taxRate,
          amount: d.amount,
          taxAmount: d.taxAmount,
          deliveryDate: d.deliveryDate,
          status: q.status,
          contactPhone: q.contactPhone,
          submittedAt: q.submittedAt,
        });
      });
    });
    // 计算聚合值
    map.forEach((row) => {
      row.quoteCount = row.quotes.length;
      if (row.quoteCount > 0) {
        const prices = row.quotes.map((q) => q.unitPrice);
        row.lowestPrice = Math.min(...prices);
        row.highestPrice = Math.max(...prices);
        row.avgPrice = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.biddingNo !== b.biddingNo) return a.biddingNo.localeCompare(b.biddingNo);
      return a.productCode.localeCompare(b.productCode);
    });
  }, [supplierQuotes, applied.biddingId, applied.supplier, applied.status, filterProductKeyword]);

  // ==== 按工单汇总聚合 ====
  interface OrderQuoteRow {
    key: string;
    biddingId: string;
    biddingNo: string;
    biddingName: string;
    quoteCount: number;
    totalAmount: number;
    lowestTaxRate?: number;
    suppliers: {
      supplierId: string;
      supplierName: string;
      quoteNo?: string;
      quoteStatus?: string;
      detailCount: number;
      amount: number;
      submittedAt?: string;
    }[];
    latestSubmittedAt?: string;
  }

  const orderRows = useMemo<OrderQuoteRow[]>(() => {
    const map = new Map<string, OrderQuoteRow>();
    supplierQuotes.forEach((q) => {
      if (applied.biddingId && q.biddingId !== applied.biddingId) return;
      if (applied.supplier && !q.supplierName.includes(applied.supplier)) return;
      if (applied.status && q.status !== applied.status) return;
      const key = q.biddingId;
      let row = map.get(key);
      if (!row) {
        row = {
          key,
          biddingId: q.biddingId,
          biddingNo: q.biddingNo,
          biddingName: q.biddingName,
          quoteCount: 0,
          totalAmount: 0,
          suppliers: [],
        };
        map.set(key, row);
      }
      const supplierAmount = q.details.reduce((s, d) => s + (d.amount || 0), 0);
      const taxRates = q.details.map(d => d.taxRate).filter(r => r !== undefined) as number[];
      const minTaxRate = taxRates.length > 0 ? Math.min(...taxRates) : undefined;
      row.suppliers.push({
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        quoteNo: q.quoteNo,
        quoteStatus: q.status,
        detailCount: q.details.length,
        amount: supplierAmount,
        submittedAt: q.submittedAt,
      });
      row.quoteCount += 1;
      row.totalAmount += supplierAmount;
      if (minTaxRate !== undefined && (row.lowestTaxRate === undefined || minTaxRate < row.lowestTaxRate)) {
        row.lowestTaxRate = minTaxRate;
      }
      if (q.submittedAt && (!row.latestSubmittedAt || q.submittedAt > row.latestSubmittedAt)) {
        row.latestSubmittedAt = q.submittedAt;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.biddingNo.localeCompare(b.biddingNo));
  }, [supplierQuotes, applied.biddingId, applied.supplier, applied.status]);

  const columns: ColumnDef<SupplierQuote>[] = [
    { key: 'quoteNo', title: '报价单号' },
    { key: 'biddingNo', title: '关联工单号' },
    { key: 'biddingName', title: '工单名称' },
    { key: 'supplierName', title: '供应商' },
    { key: 'contactPerson', title: '联系人', render: (row) => row.contactPerson || '-' },
    { key: 'contactPhone', title: '联系电话', render: (row) => row.contactPhone || '-' },
    {
      key: 'totalAmount',
      title: '报价总额',
      render: (row) => {
        const bidding = biddings.find(b => b.id === row.biddingId);
        const now = new Date();
        const start = bidding?.startTime ? new Date(bidding.startTime) : null;
        const end = bidding?.endTime ? new Date(bidding.endTime) : null;
        const isInPeriod = start && end && now >= start && now <= end;
        if (isInPeriod) return '***';
        return `¥${row.totalAmount.toLocaleString()}`;
      },
    },
    {
      key: 'taxRate',
      title: '税率',
      render: (row) => {
        const bidding = biddings.find(b => b.id === row.biddingId);
        const now = new Date();
        const start = bidding?.startTime ? new Date(bidding.startTime) : null;
        const end = bidding?.endTime ? new Date(bidding.endTime) : null;
        const isInPeriod = start && end && now >= start && now <= end;
        if (isInPeriod) return '***';
        return row.taxRate != null ? (row.taxRate * 100).toFixed(0) + '%' : '-';
      },
    },
    {
      key: 'taxAmount',
      title: '税额',
      render: (row) => {
        const bidding = biddings.find(b => b.id === row.biddingId);
        const now = new Date();
        const start = bidding?.startTime ? new Date(bidding.startTime) : null;
        const end = bidding?.endTime ? new Date(bidding.endTime) : null;
        const isInPeriod = start && end && now >= start && now <= end;
        if (isInPeriod) return '***';
        return row.taxAmount != null ? '¥' + row.taxAmount.toLocaleString() : '-';
      },
    },
    { key: 'quoteDate', title: '报价日期' },
    { key: 'submittedAt', title: '提交时间', render: (row) => row.submittedAt?.split(' ')[0] || '-' },
    {
      key: 'status',
      title: '状态',
      render: (row) => {
        const map: Record<string, { label: string; color: string }> = {
          submitted: { label: '已提交', color: 'text-[#e6a23c]' },
          accepted: { label: '已采纳', color: 'text-[#67c23a]' },
          rejected: { label: '已驳回', color: 'text-[#f56c6c]' },
        };
        return <span className={map[row.status]?.color}>{map[row.status]?.label}</span>;
      },
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看详情</TextButton>
          {row.status === 'submitted' && (
            <>
              <TextButton type="primary" onClick={() => handleAccept(row)}>采纳</TextButton>
              <TextButton type="danger" onClick={() => handleReject(row)}>驳回</TextButton>
            </>
          )}
          {row.status === 'accepted' && (
            <TextButton type="primary" onClick={() => handleSyncToBidding(row)}>回写工单</TextButton>
          )}
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除报价单 ${row.quoteNo}？`)) deleteSupplierQuote?.(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [viewItem, setViewItem] = useState<SupplierQuote | null>(null);
  const [orderDetailBiddingId, setOrderDetailBiddingId] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // 物资视图：详情弹窗
  const [materialDetailRow, setMaterialDetailRow] = useState<MaterialQuoteRow | null>(null);

  // 物资视图：操作处理函数
  // 查看详情（该工单+该物资下所有供应商报价）
  const handleMaterialViewDetail = (row: MaterialQuoteRow) => {
    setMaterialDetailRow(row);
  };

  // 采纳：对该工单+该物资，按总金额最低采纳（同一报价单内可能有多条明细，取报价单维度最低总价）
  const handleMaterialAccept = (row: MaterialQuoteRow) => {
    // 找出所有报价该物资的报价单（submitted 状态）
    const productQuotes = supplierQuotes.filter(
      (q) => q.biddingId === row.biddingId && q.status === 'submitted'
    );
    if (productQuotes.length === 0) {
      alert('没有可采纳的报价！');
      return;
    }

    // 在每份报价中找出该物资的单价
    const getUnitPrice = (quote: SupplierQuote) => {
      const detail = quote.details.find((d) => d.productCode === row.productCode);
      return detail?.unitPrice ?? Infinity;
    };

    const prices = productQuotes.map((q) => ({ quote: q, price: getUnitPrice(q) }));
    const minPrice = Math.min(...prices.map((p) => p.price));
    const lowest = prices.filter((p) => p.price === minPrice);

    if (lowest.length >= 2) {
      // 最低价相同，弹出手动选择窗口
      setSelectModal({
        biddingId: row.biddingId,
        biddingNo: row.biddingNo,
        candidates: lowest.map((p) => p.quote),
        selectedId: null,
      });
    } else {
      // 只有一个最低价，直接采纳该报价单
      updateSupplierQuote?.(lowest[0].quote.id, { status: 'accepted' });
    }
  };

  // 驳回：该工单+该物资，驳回所有 submitted 状态的报价
  const handleMaterialReject = (row: MaterialQuoteRow) => {
    if (!confirm(`确认驳回工单 ${row.biddingNo} 下「${row.productName}」的所有报价？`)) return;
    const productQuotes = supplierQuotes.filter(
      (q) => q.biddingId === row.biddingId && q.status === 'submitted'
    );
    productQuotes.forEach((q) => {
      updateSupplierQuote?.(q.id, { status: 'rejected' });
    });
    alert(`已驳回 ${productQuotes.length} 份报价`);
  };

  // 回写工单：该工单+该物资，如有已采纳报价则回写
  const handleMaterialSync = (row: MaterialQuoteRow) => {
    const acceptedQuote = supplierQuotes.find(
      (q) => q.biddingId === row.biddingId && q.status === 'accepted'
    );
    if (!acceptedQuote) {
      alert('没有已采纳的报价！');
      return;
    }
    handleSyncToBidding(acceptedQuote);
  };

  // 删除：该工单+该物资，删除所有报价
  const handleMaterialDelete = (row: MaterialQuoteRow) => {
    if (!confirm(`确认删除工单 ${row.biddingNo} 下「${row.productName}」的所有报价？`)) return;
    const productQuotes = supplierQuotes.filter((q) => q.biddingId === row.biddingId);
    productQuotes.forEach((q) => deleteSupplierQuote?.(q.id));
    alert(`已删除 ${productQuotes.length} 份报价`);
  };

  const handleAccept = (quote: SupplierQuote) => {
    // 找出该工单下所有已提交的报价
    const biddingQuotes = supplierQuotes.filter(
      (q) => q.biddingId === quote.biddingId && q.status === 'submitted'
    );
    if (biddingQuotes.length === 0) {
      updateSupplierQuote?.(quote.id, { status: 'accepted' });
      return;
    }

    // 找出最低价
    const minPrice = Math.min(...biddingQuotes.map((q) => q.totalAmount));
    // 所有等于最低价的报价
    const lowestQuotes = biddingQuotes.filter((q) => q.totalAmount === minPrice);

    if (lowestQuotes.length >= 2) {
      // 有两个及以上相同最低价，弹出手动选择窗口
      setSelectModal({
        biddingId: quote.biddingId,
        biddingNo: quote.biddingNo,
        candidates: lowestQuotes,
        selectedId: null,
      });
    } else {
      // 只有一个最低价，直接采纳
      updateSupplierQuote?.(quote.id, { status: 'accepted' });
    }
  };

  const handleReject = (quote: SupplierQuote) => {
    updateSupplierQuote?.(quote.id, { status: 'rejected' });
  };

  const handleConfirmSelect = () => {
    if (!selectModal || !selectModal.selectedId) {
      alert('请先选择一家供应商！');
      return;
    }
    const selected = selectModal.candidates.find(q => q.id === selectModal.selectedId);
    if (!selected) return;
    
    // 选中的标记为已采纳，其余驳回
    selectModal.candidates.forEach((q) => {
      updateSupplierQuote?.(q.id, {
        status: q.id === selected.id ? 'accepted' : 'rejected',
        remark: q.id === selected.id ? '最低价人工选择确认' : `最低价相同未选中（报价${q.totalAmount.toLocaleString()}）`,
      });
    });
    setSelectModal(null);
  };

  // 将已采纳报价回写到采购工单（BiddingQuote 列表）
  const handleSyncToBidding = (quote: SupplierQuote) => {
    const bidding = biddings.find((b) => b.id === quote.biddingId);
    if (!bidding) {
      alert('未找到对应的采购工单！');
      return;
    }
    if (!bidding.items || bidding.items.length === 0) {
      alert('该采购工单没有物资明细，无法回写！');
      return;
    }

    const details = quote.details.map((qd) => {
      const item = bidding.items?.find((it) => it.productCode === qd.productCode);
      return {
        productCode: qd.productCode,
        productName: qd.productName,
        specification: qd.specification,
        unit: qd.unit,
        quantity: qd.quantity,
        unitPrice: qd.unitPrice,
        taxRate: qd.taxRate,
        amount: qd.amount,
        taxAmount: qd.taxAmount,
        isOverSingleLimit: item ? (item.singlePriceLimit > 0 && qd.unitPrice > item.singlePriceLimit) : false,
      };
    });

    const total = details.reduce((sum, d) => sum + d.amount, 0);
    const totalLimit = bidding.totalPriceLimit || 0;
    const totalTax = details.reduce((sum, d) => sum + (d.taxAmount || 0), 0);
    const isOverSingle = details.some((d) => d.isOverSingleLimit);
    const isOverTotal = totalLimit > 0 && total > totalLimit;

    const biddingQuote = {
      id: 'SQ_' + quote.id,
      biddingId: quote.biddingId,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      contactPerson: quote.contactPerson,
      contactPhone: quote.contactPhone,
      taxRate: quote.taxRate,
      taxAmount: totalTax,
      details,
      totalAmount: Math.round(total * 100) / 100,
      isOverSingleLimit: isOverSingle,
      isOverTotalLimit: isOverTotal,
      submittedAt: quote.submittedAt,
      isQualified: !isOverSingle && !isOverTotal,
      remark: isOverSingle ? '超出单品上限' : isOverTotal ? '超出整单上限' : '',
      confirmedSupplierId: quote.supplierId,
      confirmedSupplierName: quote.supplierName,
      confirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    const existing = bidding.quotes || [];
    if (existing.some((q: any) => q.id === biddingQuote.id)) {
      alert('该报价已回写过，无需重复操作！');
      return;
    }
    updateBidding?.(bidding.id, {
      quotes: [...existing, biddingQuote],
      status: (bidding.status === 'draft' || bidding.status === 'published') ? 'bidding' : bidding.status,
    });
    alert(`报价已成功回写到工单「${bidding.biddingNo}」！`);
  };

  // ======== 新增报价单相关逻辑 ========
  // 已启用的供应商（可搜索）
  const enabledSuppliers = useMemo(() => {
    const base = suppliers.filter((s) => s.status === 'enabled');
    const kw = newQuoteSupplierSearch.trim().toLowerCase();
    if (!kw) return base;
    return base.filter((s) =>
      s.name.toLowerCase().includes(kw) ||
      s.code.toLowerCase().includes(kw) ||
      (s.contact || '').toLowerCase().includes(kw) ||
      (s.phone || '').toLowerCase().includes(kw)
    );
  }, [suppliers, newQuoteSupplierSearch]);

  // 新增报价单：为每个选中的供应商创建一条报价单
  const handleCreateNewQuotes = () => {
    if (!newQuoteBiddingId) {
      alert('请先选择采购工单！');
      return;
    }
    if (newQuoteSupplierIds.length === 0) {
      alert('请至少选择一家供应商！');
      return;
    }
    const bidding = biddings.find((b) => b.id === newQuoteBiddingId);
    if (!bidding) {
      alert('未找到对应的采购工单！');
      return;
    }
    const items = bidding.items || [];
    if (items.length === 0) {
      alert('该采购工单没有物资明细，无法创建报价单！');
      return;
    }

    // 报价日期
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const ds = `${y}-${m}-${d}`;
    const dt = `${ds} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    // 基于现有报价单总数生成新编号，避免冲突
    const existingCount = supplierQuotes.length;

    const newQuotes: SupplierQuote[] = newQuoteSupplierIds.map((supId, idx) => {
      const sup = suppliers.find((s) => s.id === supId);
      // 为每项物资生成报价明细（默认单价 = 工单单品上限单价，可后续修改）
      const details = items.map((it) => ({
        productCode: it.productCode,
        productName: it.productName,
        specification: it.specification,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.singlePriceLimit, // 默认使用工单设置的单品上限单价
        amount: Math.round(it.singlePriceLimit * it.quantity * 100) / 100,
        deliveryDate: ds,
      }));
      const totalAmount = Math.round(
        details.reduce((sum, d) => sum + d.amount, 0) * 100
      ) / 100;

      const seq = existingCount + idx + 1;
      return {
        id: `SQ${String(seq).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
        quoteNo: `BJS${y}${m}${d}${String(seq).padStart(3, '0')}`,
        biddingId: bidding.id,
        biddingNo: bidding.biddingNo,
        biddingName: bidding.biddingName,
        supplierId: supId,
        supplierName: sup?.name || '未知供应商',
        contactPerson: sup?.contact,
        contactPhone: sup?.phone,
        totalAmount,
        quoteDate: ds,
        submittedAt: dt,
        status: 'submitted',
        details,
      };
    });

    setSupplierQuotes?.([...newQuotes, ...supplierQuotes]);
    alert(`成功为 ${newQuotes.length} 家供应商创建报价单（关联工单：${bidding.biddingNo}）！`);
    // 关闭弹窗并重置
    setNewQuoteModal(false);
    setNewQuoteBiddingId('');
    setNewQuoteSupplierIds([]);
    setNewQuoteSupplierSearch('');
  };

  const toggleNewQuoteSupplier = (supId: string) => {
    if (newQuoteSupplierIds.includes(supId)) {
      setNewQuoteSupplierIds(newQuoteSupplierIds.filter((id) => id !== supId));
    } else {
      setNewQuoteSupplierIds([...newQuoteSupplierIds, supId]);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#303133]">报价单管理</h2>
          <span className="text-xs text-[#909399] ml-3">供应商通过 APP 上传报价单</span>
        </div>
        <div>
          <PrimaryButton
            onClick={() => {
              setNewQuoteModal(true);
              setNewQuoteBiddingId('');
              setNewQuoteSupplierIds([]);
              setNewQuoteSupplierSearch('');
            }}
          >
            + 新增报价单
          </PrimaryButton>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="mb-3 inline-flex rounded border border-[#dcdfe6] overflow-hidden text-xs">
        <button
          className={`px-4 py-2 ${
            viewMode === 'quote'
              ? 'bg-[#409eff] text-white'
              : 'bg-white text-[#606266] hover:bg-[#f5f7fa]'
          }`}
          onClick={() => setViewMode('quote')}
        >
          按报价单
        </button>
        <button
          className={`px-4 py-2 ${
            viewMode === 'material'
              ? 'bg-[#409eff] text-white'
              : 'bg-white text-[#606266] hover:bg-[#f5f7fa]'
          }`}
          onClick={() => setViewMode('material')}
        >
          按物资（推荐）
        </button>
        <button
          className={`px-4 py-2 ${
            viewMode === 'order'
              ? 'bg-[#409eff] text-white'
              : 'bg-white text-[#606266] hover:bg-[#f5f7fa]'
          }`}
          onClick={() => setViewMode('order')}
        >
          按工单汇总
        </button>
      </div>

      {/* 搜索区：按物资时显示物资关键词筛选 */}
      <SearchBar
        onSearch={() =>
          setApplied({ no: filterNo, biddingId: filterBiddingId, supplier: filterSupplier, status: filterStatus })
        }
        onReset={() => {
          setFilterNo('');
          setFilterBiddingId('');
          setFilterSupplier('');
          setFilterStatus('');
          setFilterProductKeyword('');
          setApplied({ no: '', biddingId: '', supplier: '', status: '' });
        }}
      >
        {viewMode === 'quote' && (
          <SearchField label="报价单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        )}
        <SearchField
          label="采购工单"
          type="select"
          value={filterBiddingId}
          onChange={setFilterBiddingId}
          options={[
            { value: '', label: '全部' },
            ...biddings.map((b) => ({ value: b.id, label: `${b.biddingNo} - ${b.biddingName}` })),
          ]}
        />
        {viewMode === 'material' && (
          <SearchField
            label="物资名称/编码"
            placeholder="请输入"
            value={filterProductKeyword}
            onChange={setFilterProductKeyword}
          />
        )}
        <SearchField label="供应商" placeholder="请输入" value={filterSupplier} onChange={setFilterSupplier} />
        <SearchField
          label="状态"
          type="select"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'submitted', label: '已提交' },
            { value: 'accepted', label: '已采纳' },
            { value: 'rejected', label: '已驳回' },
          ]}
        />
      </SearchBar>

      {/* ======== 视图：按报价单 ======== */}
      {viewMode === 'quote' && <DataTable data={filteredData} columns={columns} />}

      {/* ======== 视图：按物资 ======== */}
      {viewMode === 'material' && (
        <div className="border border-[#ebeef5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-[#f5f7fa] text-[#606266]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">工单号</th>
                  <th className="px-3 py-2 text-left font-medium">物资编码</th>
                  <th className="px-3 py-2 text-left font-medium">物资名称</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">规格</th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">单位</th>
                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">数量</th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">报价供应商数</th>
                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">最低单价</th>
                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">最高单价</th>
                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">平均单价</th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {materialRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-3 py-8 text-center text-[#909399] border-t border-[#ebeef5]">
                      暂无匹配的报价数据
                    </td>
                  </tr>
                )}
                {materialRows.map((row) => {
                  const minSupplierName = row.quotes
                    .filter((q) => q.unitPrice === row.lowestPrice)
                    .map((q) => q.supplierName)
                    .join('、');
                  const bidding = biddings.find(b => b.id === row.biddingId);
                  const now = new Date();
                  const start = bidding?.startTime ? new Date(bidding.startTime) : null;
                  const end = bidding?.endTime ? new Date(bidding.endTime) : null;
                  const isInPeriod = start && end && now >= start && now <= end;
                  return (
                    <tr key={row.key} className="border-t border-[#ebeef5] hover:bg-[#fafc]">
                      <td className="px-3 py-2 text-[#606266] whitespace-nowrap">{row.biddingNo}</td>
                      <td className="px-3 py-2 text-[#606266] whitespace-nowrap">{row.productCode}</td>
                      <td className="px-3 py-2 font-medium text-[#303133]">{row.productName}</td>
                      <td className="px-3 py-2 text-[#606266] whitespace-nowrap">{row.specification || '-'}</td>
                      <td className="px-3 py-2 text-center text-[#606266] whitespace-nowrap">{row.unit}</td>
                      <td className="px-3 py-2 text-right text-[#606266] whitespace-nowrap">{row.quantity}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            row.quoteCount >= 2
                              ? 'bg-[#f0f9eb] text-[#67c23a]'
                              : 'bg-[#fdf6ec] text-[#e6a23c]'
                          }`}
                        >
                          {row.quoteCount} 家
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {isInPeriod ? (
                          <div className="font-bold text-[#909399] whitespace-nowrap">***</div>
                        ) : (
                          row.lowestPrice != null ? (
                            <div className="font-bold text-[#67c23a] whitespace-nowrap">
                              ¥{row.lowestPrice.toLocaleString()}
                            </div>
                          ) : (
                            '-'
                          )
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-[#f56c6c] whitespace-nowrap">
                        {isInPeriod ? '***' : (row.highestPrice != null ? `¥${row.highestPrice.toLocaleString()}` : '-')}
                      </td>
                      <td className="px-3 py-2 text-right text-[#606266] whitespace-nowrap">
                        {isInPeriod ? '***' : (row.avgPrice != null ? `¥${row.avgPrice.toLocaleString()}` : '-')}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <TextButton type="primary" onClick={() => handleMaterialViewDetail(row)}>查看详情</TextButton>
                          {row.quotes.some((q) => q.status === 'submitted') && (
                            <>
                              <TextButton onClick={() => handleMaterialAccept(row)}>采纳</TextButton>
                              <TextButton type="danger" onClick={() => handleMaterialReject(row)}>驳回</TextButton>
                            </>
                          )}
                          {row.quotes.some((q) => q.status === 'accepted') && (
                            <TextButton onClick={() => handleMaterialSync(row)}>回写工单</TextButton>
                          )}
                          <TextButton
                            type="danger"
                            onClick={() => handleMaterialDelete(row)}
                          >删除</TextButton>
                          <TextButton
                            onClick={() => setCompareModal({
                              key: row.key,
                              biddingId: row.biddingId,
                              biddingNo: row.biddingNo,
                              productCode: row.productCode,
                              productName: row.productName,
                              specification: row.specification,
                              unit: row.unit,
                              quantity: row.quantity,
                            })}
                          >
                            报价对比
                          </TextButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======== 视图：按工单汇总 ======== */}
      {viewMode === 'order' && (
        <div className="border border-[#ebeef5] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-[#f5f7fa] text-[#606266]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">工单号</th>
                  <th className="px-3 py-2 text-left font-medium">工单名称</th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">报价供应商数</th>
                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">报价总额</th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">最低税率</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">最新提交</th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[#909399] border-t border-[#ebeef5]">
                      暂无匹配的报价数据
                    </td>
                  </tr>
                )}
                {orderRows.map((row) => {
                  const bidding = biddings.find(b => b.id === row.biddingId);
                  const now = new Date();
                  const start = bidding?.startTime ? new Date(bidding.startTime) : null;
                  const end = bidding?.endTime ? new Date(bidding.endTime) : null;
                  const isInPeriod = start && end && now >= start && now <= end;
                  return (
                  <tr key={row.key} className="border-t border-[#ebeef5] hover:bg-[#fafc]">
                    <td className="px-3 py-2 text-[#606266] whitespace-nowrap font-medium">{row.biddingNo}</td>
                    <td className="px-3 py-2 text-[#303133]">{row.biddingName}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#ecf5ff] text-[#409eff]">
                        {row.quoteCount} 家
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold text-[#f56c6c] whitespace-nowrap">
                        {isInPeriod ? '***' : `¥${row.totalAmount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {isInPeriod ? '***' : (row.lowestTaxRate != null ? (row.lowestTaxRate * 100).toFixed(0) + '%' : '-')}
                    </td>
                    <td className="px-3 py-2 text-[#606266] whitespace-nowrap">{row.latestSubmittedAt || '-'}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <TextButton
                        type="primary"
                        onClick={() => setOrderDetailBiddingId(row.biddingId)}
                      >查看</TextButton>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======== 按工单汇总详情弹窗（按物资维度展示） ======== */}
      <Modal
        open={!!orderDetailBiddingId}
        title="按工单汇总报价明细"
        onClose={() => setOrderDetailBiddingId(null)}
        footer={<DefaultButton onClick={() => setOrderDetailBiddingId(null)}>关闭</DefaultButton>}
        width="1100px"
      >
        {orderDetailBiddingId && (() => {
          const orderQuotes = supplierQuotes.filter(q => q.biddingId === orderDetailBiddingId);
          const firstQuote = orderQuotes[0];
          if (!firstQuote) return <div className="text-center text-[#909399] py-4">暂无报价数据</div>;
          // 收集所有物资
          const productMap = new Map<string, {
            productCode: string;
            productName: string;
            specification?: string;
            unit: string;
            quantity: number;
            quotes: { quoteId: string; supplierId: string; supplierName: string; unitPrice: number; taxRate?: number; amount: number; taxAmount?: number; deliveryDate?: string; status: string; }[];
          }>();
          orderQuotes.forEach((q) => {
            q.details.forEach((d) => {
              if (!productMap.has(d.productCode)) {
                productMap.set(d.productCode, {
                  productCode: d.productCode,
                  productName: d.productName,
                  specification: d.specification,
                  unit: d.unit,
                  quantity: d.quantity,
                  quotes: [],
                });
              }
              productMap.get(d.productCode)!.quotes.push({
                quoteId: q.id,
                supplierId: q.supplierId,
                supplierName: q.supplierName,
                unitPrice: d.unitPrice,
                taxRate: d.taxRate,
                amount: d.amount,
                taxAmount: d.taxAmount,
                deliveryDate: d.deliveryDate,
                status: q.status,
              });
            });
          });
          const products = Array.from(productMap.values());
          return (
            <div className="space-y-3">
              <div className="border border-[#ebeef5] rounded p-2 bg-[#fafafa] text-xs">
                <span className="text-[#909399]">工单号：</span>
                <span className="text-[#303133] font-medium">{firstQuote.biddingNo}</span>
                <span className="ml-4 text-[#909399]">工单名称：</span>
                <span className="text-[#303133]">{firstQuote.biddingName}</span>
                <span className="ml-4 text-[#909399]">报价供应商：</span>
                <span className="text-[#409eff] font-medium">{orderQuotes.length} 家</span>
              </div>

              {/* 操作区 */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#606266]">按物资维度展示，如同一物资有多个供应商报价，展开后可看到多家报价对比</div>
              </div>

              {/* 物料列表 */}
              <div className="border border-[#ebeef5] rounded">
                <table className="w-full text-xs">
                  <thead className="bg-[#f5f7fa] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium w-24">物料编码</th>
                      <th className="px-3 py-2 text-left font-medium">物料名称</th>
                      <th className="px-3 py-2 text-left font-medium w-20">规格</th>
                      <th className="px-3 py-2 text-center font-medium w-12">单位</th>
                      <th className="px-3 py-2 text-right font-medium w-16">数量</th>
                      <th className="px-3 py-2 text-center font-medium w-24">报价数</th>
                      <th className="px-3 py-2 text-right font-medium w-24">最低单价</th>
                      <th className="px-3 py-2 text-right font-medium w-24">最高单价</th>
                      <th className="px-3 py-2 text-center font-medium w-12">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const prices = p.quotes.map(q => q.unitPrice);
                      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                      return (
                        <>
                          <tr key={p.productCode} className="border-t border-[#ebeef5] hover:bg-[#fafafa]">
                            <td className="px-3 py-2 text-[#606266]">{p.productCode}</td>
                            <td className="px-3 py-2 text-[#303133] font-medium">{p.productName}</td>
                            <td className="px-3 py-2 text-[#606266]">{p.specification || '-'}</td>
                            <td className="px-3 py-2 text-center text-[#606266]">{p.unit}</td>
                            <td className="px-3 py-2 text-right text-[#606266]">{p.quantity}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#ecf5ff] text-[#409eff]">
                                {p.quotes.length} 家
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-[#67c23a]">¥{minPrice.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-[#f56c6c]">¥{maxPrice.toLocaleString()}</td>
                            <td className="px-3 py-2 text-center">
                              <TextButton
                                onClick={() => {
                                  const key = p.productCode;
                                  setExpandedProducts(prev => ({ ...prev, [key]: !prev[key] }));
                                }}
                              >
                                {expandedProducts[p.productCode] ? '收起' : '展开'}
                              </TextButton>
                            </td>
                          </tr>
                          {expandedProducts[p.productCode] && (
                            <tr key={p.productCode + '_detail'} className="border-t border-[#ebeef5] bg-[#f5f7fa]">
                              <td colSpan={9} className="px-3 py-2">
                                <div className="text-[10px] text-[#909399] mb-1">▼ 该物资的供应商报价横向对比：</div>
                                <table className="w-full bg-white border border-[#e4e7ed] rounded">
                                  <thead className="bg-[#fafafa]">
                                    <tr>
                                      <th className="px-2 py-1.5 text-left text-[10px] font-medium w-32">供应商</th>
                                      <th className="px-2 py-1.5 text-center text-[10px] font-medium w-20">状态</th>
                                      <th className="px-2 py-1.5 text-right text-[10px] font-medium w-20">单价</th>
                                      <th className="px-2 py-1.5 text-center text-[10px] font-medium w-16">税率</th>
                                      <th className="px-2 py-1.5 text-right text-[10px] font-medium w-20">金额</th>
                                      <th className="px-2 py-1.5 text-right text-[10px] font-medium w-20">税额</th>
                                      <th className="px-2 py-1.5 text-center text-[10px] font-medium w-20">交货日期</th>
                                      <th className="px-2 py-1.5 text-center text-[10px] font-medium w-32">操作</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {p.quotes.map((q, idx) => {
                                      const isLowest = q.unitPrice === minPrice;
                                      const statusInfo: Record<string, { label: string; color: string }> = {
                                        submitted: { label: '已提交', color: 'text-[#e6a23c]' },
                                        accepted: { label: '已采纳', color: 'text-[#67c23a]' },
                                        rejected: { label: '已驳回', color: 'text-[#f56c6c]' },
                                      };
                                      const st = statusInfo[q.status] || statusInfo.submitted;
                                      return (
                                        <tr key={idx} className={'border-t border-[#ebeef5] ' + (isLowest ? 'bg-[#f0f9eb]' : '')}>
                                          <td className="px-2 py-1.5 text-[10px] text-[#303133] font-medium">
                                            {q.supplierName}
                                            {isLowest && <span className="ml-1 text-[#67c23a]">★最低</span>}
                                          </td>
                                          <td className={'px-2 py-1.5 text-center text-[10px] ' + st.color}>[{st.label}]</td>
                                          <td className="px-2 py-1.5 text-right text-[10px] text-[#f56c6c] font-semibold">¥{q.unitPrice.toLocaleString()}</td>
                                          <td className="px-2 py-1.5 text-center text-[10px]">{q.taxRate != null ? (q.taxRate * 100).toFixed(0) + '%' : '-'}</td>
                                          <td className="px-2 py-1.5 text-right text-[10px]">¥{q.amount.toLocaleString()}</td>
                                          <td className="px-2 py-1.5 text-right text-[10px] text-[#67c23a]">{q.taxAmount != null ? '¥' + q.taxAmount.toLocaleString() : '-'}</td>
                                          <td className="px-2 py-1.5 text-center text-[10px]">{q.deliveryDate || '-'}</td>
                                          <td className="px-2 py-1.5 text-center text-[10px]">
                                            <TextButton
                                              onClick={() => {
                                                const quote = orderQuotes.find(oq => oq.id === q.quoteId);
                                                if (quote) {
                                                  updateSupplierQuote(quote.id, { status: 'accepted' });
                                                  alert('已采纳该报价');
                                                }
                                              }}
                                              disabled={q.status !== 'submitted'}
                                            >采纳</TextButton>
                                            <TextButton
                                              type="danger"
                                              onClick={() => {
                                                const quote = orderQuotes.find(oq => oq.id === q.quoteId);
                                                if (quote) {
                                                  updateSupplierQuote(quote.id, { status: 'rejected' });
                                                  alert('已驳回该报价');
                                                }
                                              }}
                                              disabled={q.status !== 'submitted'}
                                            >驳回</TextButton>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        open={!!viewItem}
        title={`报价单详情 - ${viewItem?.quoteNo}`}
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="900px"
      >
        {viewItem && (() => {
          const bidding = biddings.find(b => b.id === viewItem.biddingId);
          const now = new Date();
          const start = bidding?.startTime ? new Date(bidding.startTime) : null;
          const end = bidding?.endTime ? new Date(bidding.endTime) : null;
          const isInPeriod = start && end && now >= start && now <= end;
          return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div><span className="text-[#909399]">报价单号：</span>{viewItem.quoteNo}</div>
              <div><span className="text-[#909399]">关联工单：</span>{viewItem.biddingNo} {viewItem.biddingName}</div>
              <div>
                <span className="text-[#909399]">报价总额：</span>
                <span className="font-bold text-[#f56c6c]">
                  {isInPeriod ? '***' : `¥${viewItem.totalAmount.toLocaleString()}`}
                </span>
              </div>
              <div><span className="text-[#909399]">供应商：</span>{viewItem.supplierName}</div>
              <div><span className="text-[#909399]">联系人：</span>{viewItem.contactPerson || '-'}</div>
              <div><span className="text-[#909399]">联系电话：</span>{viewItem.contactPhone || '-'}</div>
              <div><span className="text-[#909399]">报价日期：</span>{viewItem.quoteDate}</div>
              <div><span className="text-[#909399]">提交时间：</span>{viewItem.submittedAt}</div>
              <div><span className="text-[#909399]">税率：</span>
                {isInPeriod ? '***' : (viewItem.taxRate != null ? (viewItem.taxRate * 100).toFixed(0) + '%' : '含税（未单独标识）')}
              </div>
              <div><span className="text-[#909399]">税额：</span>
                {isInPeriod ? '***' : (viewItem.taxAmount != null ? '¥' + viewItem.taxAmount.toLocaleString() : '-')}
              </div>
              <div><span className="text-[#909399]">不含税金额：</span>
                {isInPeriod ? '***' : (viewItem.taxRate != null && viewItem.taxAmount != null ? '¥' + (viewItem.totalAmount - viewItem.taxAmount).toLocaleString() : '-')}
              </div>
              <div>
                <span className="text-[#909399]">状态：</span>
                <span
                  className={{
                    submitted: 'text-[#e6a23c]',
                    accepted: 'text-[#67c23a]',
                    rejected: 'text-[#f56c6c]',
                  }[viewItem.status]}
                >
                  {{ submitted: '已提交', accepted: '已采纳', rejected: '已驳回' }[viewItem.status]}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[#606266] text-xs font-bold mb-2">物料报价明细</div>
              <div className="border border-[#dcdfe6] rounded">
                <table className="w-full">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-3 py-2 text-xs text-left">序号</th>
                      <th className="px-3 py-2 text-xs text-left">物料编码</th>
                      <th className="px-3 py-2 text-xs text-left">物料名称</th>
                      <th className="px-3 py-2 text-xs text-left">规格</th>
                      <th className="px-3 py-2 text-xs text-left">单位</th>
                      <th className="px-3 py-2 text-xs text-right">数量</th>
                      <th className="px-3 py-2 text-xs text-right">报价单价</th>
                      <th className="px-3 py-2 text-xs text-center">税率</th>
                      <th className="px-3 py-2 text-xs text-right">金额</th>
                      <th className="px-3 py-2 text-xs text-right">税额</th>
                      <th className="px-3 py-2 text-xs text-left">交货日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((d, idx) => (
                      <tr key={idx} className="border-t border-[#ebeef5]">
                        <td className="px-3 py-2 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 text-xs">{d.productCode}</td>
                        <td className="px-3 py-2 text-xs">{d.productName}</td>
                        <td className="px-3 py-2 text-xs text-[#606266]">{d.specification || '-'}</td>
                        <td className="px-3 py-2 text-xs">{d.unit}</td>
                        <td className="px-3 py-2 text-xs text-right">{d.quantity}</td>
                        <td className="px-3 py-2 text-xs text-right font-semibold text-[#f56c6c]">
                          {isInPeriod ? '***' : `¥${d.unitPrice.toLocaleString()}`}
                        </td>
                        <td className="px-3 py-2 text-xs text-center">
                          {isInPeriod ? '***' : (d.taxRate != null ? (d.taxRate * 100).toFixed(0) + '%' : '含税')}
                        </td>
                        <td className="px-3 py-2 text-xs text-right">
                          {isInPeriod ? '***' : `¥${d.amount.toLocaleString()}`}
                        </td>
                        <td className="px-3 py-2 text-xs text-right text-[#67c23a]">
                          {isInPeriod ? '***' : (d.taxAmount != null ? '¥' + d.taxAmount.toLocaleString() : '-')}
                        </td>
                        <td className="px-3 py-2 text-xs">{d.deliveryDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#dcdfe6] bg-[#f5f7fa]">
                      <td colSpan={5} className="px-3 py-2 text-xs text-right font-bold">含税合计</td>
                      <td className="px-3 py-2 text-xs text-right font-bold text-[#f56c6c]">
                        {isInPeriod ? '***' : `¥${viewItem.totalAmount.toLocaleString()}`}
                      </td>
                      <td className="px-3 py-2 text-xs text-center text-[#909399]">
                        {isInPeriod ? '***' : (viewItem.taxRate != null ? (viewItem.taxRate * 100).toFixed(0) + '%' : '-')}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-bold text-[#67c23a]">
                        {isInPeriod ? '***' : (viewItem.taxAmount != null ? '¥' + viewItem.taxAmount.toLocaleString() : '-')}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {viewItem.remark && <div className="text-[#909399] text-xs">备注：{viewItem.remark}</div>}
          </div>
        );})()}
      </Modal>
      {/* 最低价相同·人工选择弹窗 */}
      <Modal
        open={!!selectModal}
        title="最低价相同 · 人工选择确认"
        onClose={() => setSelectModal(null)}
        footer={
          <>
            <DefaultButton onClick={() => setSelectModal(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleConfirmSelect}>确认选择</PrimaryButton>
          </>
        }
        width="600px"
      >
        {selectModal && (
          <div className="space-y-4">
            <div className="text-sm text-[#606266]">
              <span className="text-[#909399]">采购工单：</span>{selectModal.biddingNo}
            </div>
            <div className="bg-[#fffbe6] border border-[#e6a23c] rounded p-3 text-xs text-[#e6a23c]">
              检测到 <strong>{selectModal.candidates.length} 家</strong> 供应商报价相同（均为最低价
              ¥{selectModal.candidates[0]?.totalAmount.toLocaleString()}），请人工选择一家作为成交单位。
            </div>

            <div className="border border-[#dcdfe6] rounded">
              <table className="w-full">
                <thead className="bg-[#f5f7fa]">
                  <tr>
                    <th className="px-3 py-2 text-xs text-left w-12">选择</th>
                    <th className="px-3 py-2 text-xs text-left">供应商</th>
                    <th className="px-3 py-2 text-xs text-left">联系人</th>
                    <th className="px-3 py-2 text-xs text-right">报价总额</th>
                  </tr>
                </thead>
                <tbody>
                  {selectModal.candidates.map((q) => {
                    const isSelected = selectModal.selectedId === q.id;
                    return (
                      <tr key={q.id} className={'border-t border-[#ebeef5] cursor-pointer ' + (isSelected ? 'bg-[#ecf5ff]' : 'hover:bg-[#fafc]')}
                        onClick={() => setSelectModal({ ...selectModal, selectedId: q.id })}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectModal({ ...selectModal, selectedId: q.id })}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs font-medium">{q.supplierName}</td>
                        <td className="px-3 py-2 text-xs text-[#909399]">{q.contactPerson || '-'}</td>
                        <td className="px-3 py-2 text-xs text-right font-bold text-[#f56c6c]">
                          ¥{q.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* 物资报价对比弹窗：横向对比各供应商 */}
      <Modal
        open={!!compareModal}
        title={
          compareModal
            ? `报价对比 · ${compareModal.productName}${compareModal.specification ? '（' + compareModal.specification + '）' : ''}`
            : ''
        }
        onClose={() => setCompareModal(null)}
        footer={<DefaultButton onClick={() => setCompareModal(null)}>关闭</DefaultButton>}
        width="1000px"
      >
        {compareModal && (() => {
          const row = materialRows.find((r) => r.key === compareModal.key);
          if (!row || row.quotes.length === 0) {
            return <div className="text-sm text-[#909399] py-4">暂无报价数据</div>;
          }
          // 按单价升序
          const sorted = [...row.quotes].sort((a, b) => a.unitPrice - b.unitPrice);
          const lowest = sorted[0]?.unitPrice;
          const statusMap: Record<string, { label: string; color: string }> = {
            submitted: { label: '已提交', color: 'text-[#e6a23c]' },
            accepted: { label: '已采纳', color: 'text-[#67c23a]' },
            rejected: { label: '已驳回', color: 'text-[#f56c6c]' },
          };

          return (
            <div className="space-y-3">
              {/* 物资信息 */}
              <div className="grid grid-cols-4 gap-3 text-xs p-3 bg-[#f5f7fa] rounded">
                <div><span className="text-[#909399]">工单：</span>{row.biddingNo}</div>
                <div><span className="text-[#909399]">物资编码：</span>{row.productCode}</div>
                <div><span className="text-[#909399]">单位：</span>{row.unit}</div>
                <div><span className="text-[#909399]">数量：</span>{row.quantity}</div>
                <div className="col-span-4"><span className="text-[#909399]">物资名称：</span>{row.productName}</div>
              </div>

              {/* 提示 */}
              {sorted.length >= 2 && (
                <div className="bg-[#ecf5ff] border border-[#b3d8ff] rounded p-2 text-xs text-[#409eff]">
                  共 <strong>{sorted.length}</strong> 家供应商报价 · 最低价
                  <strong className="text-[#67c23a] ml-1">¥{lowest?.toLocaleString()}</strong>
                  · 差价范围 <strong className="text-[#f56c6c] ml-1">
                    ¥{(sorted[sorted.length - 1].unitPrice - (lowest ?? 0)).toLocaleString()}
                  </strong>
                </div>
              )}

              {/* 横向对比表：行=维度，列=供应商 */}
              <div className="border border-[#ebeef5] rounded overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[#606266] border-r border-[#ebeef5] whitespace-nowrap">
                        对比项 \ 供应商
                      </th>
                      {sorted.map((q) => {
                        const isLowest = q.unitPrice === lowest;
                        return (
                          <th
                            key={q.quoteId}
                            className={`px-3 py-2 text-center font-medium whitespace-nowrap border-l border-[#ebeef5] ${
                              isLowest ? 'bg-[#f0f9eb] text-[#67c23a]' : 'text-[#606266]'
                            }`}
                          >
                            <div>{q.supplierName}</div>
                            {isLowest && <div className="text-xs mt-0.5">👑 最低价</div>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        报价单号
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb]' : ''
                          }`}
                        >
                          {q.quoteNo}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        报价单价
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] font-bold ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb] text-[#67c23a]' : 'text-[#303133]'
                          }`}
                        >
                          ¥{q.unitPrice.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        税率
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className="px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] text-[#909399]"
                        >
                          {q.taxRate != null ? (q.taxRate * 100).toFixed(0) + '%' : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        报价金额（单价 × {row.quantity}）
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb] text-[#67c23a]' : 'text-[#303133]'
                          }`}
                        >
                          ¥{(q.unitPrice * row.quantity).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        与最低价差额
                      </td>
                      {sorted.map((q) => {
                        const diff = q.unitPrice - (lowest ?? 0);
                        const pct = lowest ? Math.round((diff / lowest) * 10000) / 100 : 0;
                        return (
                          <td
                            key={q.quoteId}
                            className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                              q.unitPrice === lowest ? 'bg-[#f0f9eb] text-[#67c23a]' : 'text-[#f56c6c]'
                            }`}
                          >
                            {diff === 0 ? '— 最低价 —' : `+¥${diff.toLocaleString()} (+${pct}%)`}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        交货日期
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb]' : ''
                          }`}
                        >
                          {q.deliveryDate || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        状态
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb]' : ''
                          }`}
                        >
                          <span className={statusMap[q.status]?.color}>
                            {statusMap[q.status]?.label}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        联系电话
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb]' : ''
                          }`}
                        >
                          {q.contactPhone || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#ebeef5]">
                      <td className="px-3 py-2 text-[#909399] border-r border-[#ebeef5] whitespace-nowrap">
                        提交时间
                      </td>
                      {sorted.map((q) => (
                        <td
                          key={q.quoteId}
                          className={`px-3 py-2 text-center whitespace-nowrap border-l border-[#ebeef5] ${
                            q.unitPrice === lowest ? 'bg-[#f0f9eb]' : ''
                          }`}
                        >
                          {q.submittedAt?.split(' ')[0] || '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ======== 物资视图：查看详情弹窗 ======== */}
      <Modal
        open={!!materialDetailRow}
        title={
          materialDetailRow
            ? `物资报价详情 · ${materialDetailRow.biddingNo} - ${materialDetailRow.productName}`
            : ''
        }
        onClose={() => setMaterialDetailRow(null)}
        footer={<DefaultButton onClick={() => setMaterialDetailRow(null)}>关闭</DefaultButton>}
        width="900px"
      >
        {materialDetailRow && (
          <div className="space-y-3">
            {/* 基础信息 */}
            <div className="grid grid-cols-4 gap-3 text-xs p-3 bg-[#f5f7fa] rounded">
              <div><span className="text-[#909399]">工单号：</span>{materialDetailRow.biddingNo}</div>
              <div><span className="text-[#909399]">工单名称：</span>{materialDetailRow.biddingName}</div>
              <div><span className="text-[#909399]">物资编码：</span>{materialDetailRow.productCode}</div>
              <div><span className="text-[#909399]">单位：</span>{materialDetailRow.unit}</div>
              <div className="col-span-2"><span className="text-[#909399]">物资名称：</span>{materialDetailRow.productName}</div>
              <div><span className="text-[#909399]">数量：</span>{materialDetailRow.quantity}</div>
              <div><span className="text-[#909399]">规格：</span>{materialDetailRow.specification || '-'}</div>
            </div>

            {/* 统计 */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="px-3 py-2 bg-[#f0f9eb] rounded border border-[#c2e7b0]">
                <div className="text-[#909399]">报价供应商数</div>
                <div className="text-lg font-bold text-[#67c23a]">{materialDetailRow.quoteCount} 家</div>
              </div>
              <div className="px-3 py-2 bg-[#f0f9eb] rounded border border-[#c2e7b0]">
                <div className="text-[#909399]">最低单价</div>
                <div className="text-lg font-bold text-[#67c23a]">
                  {materialDetailRow.lowestPrice != null ? '¥' + materialDetailRow.lowestPrice.toLocaleString() : '-'}
                </div>
              </div>
              <div className="px-3 py-2 bg-[#fdf6ec] rounded border border-[#f5dab1]">
                <div className="text-[#909399]">最高单价</div>
                <div className="text-lg font-bold text-[#f56c6c]">
                  {materialDetailRow.highestPrice != null ? '¥' + materialDetailRow.highestPrice.toLocaleString() : '-'}
                </div>
              </div>
              <div className="px-3 py-2 bg-[#ecf5ff] rounded border border-[#b3d8ff]">
                <div className="text-[#909399]">平均单价</div>
                <div className="text-lg font-bold text-[#409eff]">
                  {materialDetailRow.avgPrice != null ? '¥' + materialDetailRow.avgPrice.toLocaleString() : '-'}
                </div>
              </div>
            </div>

            {/* 供应商报价明细表 */}
            <div className="border border-[#dcdfe6] rounded overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-[#f5f7fa]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-[#606266] whitespace-nowrap">报价单号</th>
                    <th className="px-3 py-2 text-left font-medium text-[#606266] whitespace-nowrap">供应商</th>
                    <th className="px-3 py-2 text-center font-medium text-[#606266] whitespace-nowrap">联系人</th>
                    <th className="px-3 py-2 text-center font-medium text-[#606266] whitespace-nowrap">电话</th>
                    <th className="px-3 py-2 text-right font-medium text-[#606266] whitespace-nowrap">单价</th>
                    <th className="px-3 py-2 text-right font-medium text-[#606266] whitespace-nowrap">税率</th>
                    <th className="px-3 py-2 text-right font-medium text-[#606266] whitespace-nowrap">含税金额</th>
                    <th className="px-3 py-2 text-right font-medium text-[#606266] whitespace-nowrap">税额</th>
                    <th className="px-3 py-2 text-center font-medium text-[#606266] whitespace-nowrap">交货日期</th>
                    <th className="px-3 py-2 text-center font-medium text-[#606266] whitespace-nowrap">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {materialDetailRow.quotes.map((q, idx) => {
                    const isLowest = q.unitPrice === materialDetailRow.lowestPrice;
                    return (
                      <tr key={q.quoteId} className={'border-t border-[#ebeef5] ' + (isLowest ? 'bg-[#f0f9eb]' : '')}>
                        <td className="px-3 py-2 whitespace-nowrap">{q.quoteNo}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {q.supplierName}
                          {isLowest && <span className="ml-1 text-[#67c23a]">👑</span>}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{q.supplierName.split('（')[0].split('】')[1] || '-'}</td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{q.contactPhone || '-'}</td>
                        <td className={'px-3 py-2 text-right font-semibold whitespace-nowrap ' + (isLowest ? 'text-[#67c23a]' : 'text-[#303133]')}>
                          ¥{q.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {q.taxRate != null ? (q.taxRate * 100).toFixed(0) + '%' : '-'}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          ¥{q.amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right text-[#67c23a] whitespace-nowrap">
                          {q.taxAmount != null ? '¥' + q.taxAmount.toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{q.deliveryDate || '-'}</td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          <span className={{
                            submitted: 'text-[#e6a23c]',
                            accepted: 'text-[#67c23a]',
                            rejected: 'text-[#f56c6c]',
                          }[q.status]}>
                            {{ submitted: '已提交', accepted: '已采纳', rejected: '已驳回' }[q.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              {materialDetailRow.quotes.some((q) => q.status === 'submitted') && (
                <>
                  <PrimaryButton onClick={() => { setMaterialDetailRow(null); handleMaterialAccept(materialDetailRow); }}>采纳最低价</PrimaryButton>
                  <DefaultButton onClick={() => { setMaterialDetailRow(null); handleMaterialReject(materialDetailRow); }}>驳回全部</DefaultButton>
                </>
              )}
              {materialDetailRow.quotes.some((q) => q.status === 'accepted') && (
                <PrimaryButton onClick={() => { setMaterialDetailRow(null); handleMaterialSync(materialDetailRow); }}>回写工单</PrimaryButton>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======== 新增报价单弹窗 ======== */}
      <Modal
        open={newQuoteModal}
        title="新增报价单"
        onClose={() => setNewQuoteModal(false)}
        footer={
          <>
            <DefaultButton onClick={() => setNewQuoteModal(false)}>取消</DefaultButton>
            <PrimaryButton onClick={handleCreateNewQuotes}>创建报价单</PrimaryButton>
          </>
        }
        width="720px"
      >
        <div className="space-y-4">
          {/* 采购工单选择 */}
          <div>
            <div className="text-xs text-[#606266] mb-1 font-semibold">采购工单 <span className="text-[#f56c6c]">*</span></div>
            <select
              className="w-full h-9 px-2 border border-[#dcdfe6] rounded text-sm"
              value={newQuoteBiddingId}
              onChange={(e) => {
                setNewQuoteBiddingId(e.target.value);
                setNewQuoteSupplierIds([]); // 切换工单清空已选供应商
              }}
            >
              <option value="">请选择采购工单</option>
              {biddings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.biddingNo} - {b.biddingName}（{b.items?.length || 0} 项物资）
                </option>
              ))}
            </select>
          </div>

          {/* 供应商多选区域 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[#606266] font-semibold">
                选择供应商 <span className="text-[#f56c6c]">*</span>
                <span className="text-[#909399] ml-2 font-normal">
                  （已选 {newQuoteSupplierIds.length} 家 / 可多选）
                </span>
              </div>
              {newQuoteSupplierIds.length > 0 && (
                <button
                  className="text-xs text-[#409eff] hover:underline"
                  onClick={() => setNewQuoteSupplierIds([])}
                >
                  清空选择
                </button>
              )}
            </div>

            {/* 搜索框 */}
            <div className="mb-2">
              <input
                type="text"
                className="w-full h-9 px-3 border border-[#dcdfe6] rounded text-sm"
                placeholder="搜索：供应商名称 / 编码 / 联系人 / 联系电话"
                value={newQuoteSupplierSearch}
                onChange={(e) => setNewQuoteSupplierSearch(e.target.value)}
              />
            </div>

            {/* 已启用供应商复选列表 */}
            <div className="border border-[#dcdfe6] rounded max-h-80 overflow-auto">
              {enabledSuppliers.length === 0 && (
                <div className="p-4 text-xs text-[#909399] text-center">
                  {newQuoteSupplierSearch ? '没有匹配的供应商' : '暂无已启用的供应商，请先在供应商管理中维护'}
                </div>
              )}
              {enabledSuppliers.map((s) => {
                const checked = newQuoteSupplierIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-start gap-2 p-3 cursor-pointer border-b border-[#ebeef5] last:border-b-0 hover:bg-[#fafc] ${
                      checked ? 'bg-[#ecf5ff]' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => toggleNewQuoteSupplier(s.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#303133]">{s.name}</span>
                        <span className="text-xs text-[#909399]">编码：{s.code}</span>
                      </div>
                      <div className="text-xs text-[#909399] mt-1">
                        联系人：{s.contact || '-'}　电话：{s.phone || '-'}
                      </div>
                    </div>
                    {checked && (
                      <span className="text-xs text-[#409eff] font-medium flex-shrink-0">已选</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* 操作提示 */}
            {newQuoteBiddingId && newQuoteSupplierIds.length > 0 && (
              <div className="mt-2 bg-[#f0f9eb] border border-[#67c23a] rounded p-2 text-xs text-[#67c23a]">
                即将为 <strong>{newQuoteSupplierIds.length}</strong> 家供应商，针对工单「
                {biddings.find((b) => b.id === newQuoteBiddingId)?.biddingNo}
                」创建报价单（默认按工单单品上限单价填报，可在报价单详情中调整）。
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
