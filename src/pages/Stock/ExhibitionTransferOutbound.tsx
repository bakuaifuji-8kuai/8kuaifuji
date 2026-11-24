import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import MultiSelect from '@/components/common/MultiSelect';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import PrintDocument from '@/components/common/PrintDocument';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import WorkOrderPickerModal from '@/components/common/WorkOrderPickerModal';
import type { WorkOrderPickerItem } from '@/components/common/WorkOrderPickerModal';
import { useStore } from '@/store/useStore';
import { generateTransferNo } from '@/mock/data';
import type { ProductPickerItem } from '@/components/common/ProductPickerModal';
import type { StockTransfer, StockTransferDetail } from '@/types';
import { Eye, ArrowRightLeft, Printer, ArrowUpFromLine } from 'lucide-react';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';

const helpContent = {
  title: '展会物资调拨出库 - 功能操作说明',
  description: '展会物资调拨出库用于从展会仓库调出物资，支持新增调拨单、工单带明细、父子组智能组合拆分、出库确认、逆向红冲等操作。',
  sections: [
    {
      heading: '新增调拨单（基础流程）',
      items: [
        '点击"新增调拨单"按钮打开新增弹窗',
        '选择调出仓库（仅限展会实物仓库）和调入仓库（虚拟仓库代表展会现场）',
        '选择关联的展会项目',
        '添加物资明细有两种方式：① 点"选择工单"一键带明细（推荐）；② 点"添加产品"手工逐行加',
        '填写每行的出库数量（不可超过调出仓库可用库存）',
        '可填写备注信息',
        '点击"保存"生成调拨单，状态为草稿'
      ]
    },
    {
      heading: '选择工单带明细（核心功能）',
      items: [
        '点击弹窗内的"选择工单"按钮，打开工单选择器',
        '勾选需要出库的工单后点"确定"，系统自动把工单所需的物资清单带到期初明细里',
        '工单分两类：① 独立工单（如 WX2611010001）→ 单张可选，products 各自展开；② 父子组工单（编码形如 父组-子序号，如 A001-1 / A001-2）→ 组是原子的，选一张自动全选，不能单独取消',
        '父子组工单旁会显示橙色提示"父子组（xxx）· 同组共 N 张须一起选"',
        '父子组可能触发"智能组合拆分"逻辑（见下一节）'
      ]
    },
    {
      heading: '父子组智能组合拆分（电箱 + 智能模块 → 智慧电箱）',
      items: [
        '【业务背景】会展现场有些电箱需要和智能模块组合成"智慧电箱"成套出库，但工单可能因为安装工艺拆成父子组两张',
        '【示例】父组 A001：A001-1 作业项"电箱380V/400A"数量 10，A001-2 作业项"智能模块"数量 8',
        '【组合规则】系统按 workItemName 关键词匹配：base 工单含"电箱" + addon 工单含"智慧"或"智能" → 命中组合',
        '【规格识别】base 工单的 workItemName / products.specification 里提取规格关键词（如 220V / 380V），匹配到对应规格的组合产品',
        '【数量分配公式】组合数量 = min(base 作业项数量, addon 作业项数量)；剩余数量 = base 作业项数量 − 组合数量',
        '【以智能模块数量为上限】原因：智能模块只有 8 个，最多组装 8 套智慧电箱',
        '【组合结果示例】A001 组 → ① 智慧电箱 380V/400A × 8（组合产品 PRD804）+ ② 普通电箱 380V/400A × 2（底产品 PRD785）',
        '【不命中组合的情况】父子组里没有 base/addon 关键词（如桁架 + 地毯），走常规流程：每张工单的 products 各自展开成明细，不做组合',
        '【当前支持的规格】220V/16A（PRD803）、380V/400A（PRD804）；未来新增规格只需在 COMBINE_RULES 数组加一条规则 + 在 products 表加对应产品',
        '【工单编码格式】父子组识别依赖 workOrderCode 是否匹配正则"父组号-纯数字子序号"，如 001-1 / 001-2 / A001-1 / A001-2'
      ]
    },
    {
      heading: '其他明细操作',
      items: [
        '替换物资：点击某行的"替换"按钮，打开物资选择器选新的产品（规格/数量自动继承，只换产品 ID/名称）',
        '删除明细行：点击某行的🗑️删除按钮',
        '清空所有工单：把通过"选择工单"带进来的明细全部清掉（手工加的保留）',
        '修改仓位：每行可选填出库仓位（fromPosition）和目标仓位（toPosition）'
      ]
    },
    {
      heading: '出库确认',
      items: [
        '草稿状态的调拨单可点击"保存并出库确认"（弹窗底部按钮），或在列表点"出库确认"',
        '确认后按 FIFO 原则扣减调出仓库对应批次的库存（batchInventories）',
        '同步生成调拨出库流水记录（stockTransactions）',
        '单据状态更新为"已出库确认"，下游调拨入库页面可看到这张单'
      ]
    },
    {
      heading: '逆向红冲',
      items: [
        '已出库确认的调拨单如果发现错了，用"逆向红冲"撤销',
        '系统自动复制原单所有明细，数量取负数（原 +8 → 红冲 −8）',
        '生成一张新的红字调拨单，reverseOfId 关联原单号',
        '红冲单确认后，库存反向变动（把物资放回仓库）',
        '一张调拨单只能逆向红冲一次；草稿状态直接编辑或删除即可，不用红冲'
      ]
    },
    {
      heading: '状态流转',
      items: [
        '草稿（draft）→ 可编辑、可删除、可出库确认；库存不扣减',
        '已出库确认（confirmed）→ 可查看、可打印、可逆向红冲；库存已扣减',
        '已红冲（reversed）→ 原单已被冲销，库存已反向恢复'
      ]
    },
    {
      heading: '常见问答',
      items: [
        'Q：为什么我只选了 A001-1，A001-2 也自动勾上了？A：它们是父子组，组是原子操作，必须一起选/一起取消',
        'Q：为什么 A001 组的电箱 10 个，带进来只有 8 个智慧电箱？A：智能模块只有 8 个，min(10,8)=8，剩余 2 个以"普通电箱"名义走常规出库',
        'Q：怎么新增一个 63A 规格的电箱+智能模块组合场景？A：先在产品目录加底产品和组合产品，再在 COMBINE_RULES 数组加一条 {baseKeyword:"电箱", addonKeyword:"智能", baseSpecKeyword:"63A", combinedProductId:"新ID"} 规则',
        'Q：没有关联工单的调拨单怎么做？A：直接点"添加产品"手工逐行加，数量、仓位全部手工填',
        'Q：Ctrl+Shift+R 硬刷新后才看到新的父子组工单？A：是的，新产品/新工单通过 persist 版本迁移注入，老用户需要触发一次 localStorage 版本迁移'
      ]
    }
  ]
};

export default function ExhibitionTransferOutboundPage() {
  const stockTransfers = useStore((s) => s.stockTransfers);
  const addStockTransfer = useStore((s) => s.addStockTransfer);
  const updateStockTransfer = useStore((s) => s.updateStockTransfer);
  const deleteStockTransfer = useStore((s) => s.deleteStockTransfer);
  const batchInventories = useStore((s) => s.batchInventories);
  const updateBatchInventory = useStore((s) => s.updateBatchInventory);
  const addStockTransaction = useStore((s) => s.addStockTransaction);
  const warehouses = useStore((s) => s.warehouses);
  const positions = useStore((s) => s.positions);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);
  const workOrderConfigs = useStore((s) => s.workOrderConfigs);
  const reverseStockTransfer = useStore((s) => s.reverseStockTransfer);
  const exhibitionProjects = useStore((s) => s.exhibitionProjects);

  // 调出仓库：展会物资仓 + 实物仓
  const fromWarehouses = useMemo(() => {
    return warehouses.filter(w => w.category === 'exhibition' && w.property === 'physical');
  }, [warehouses]);

  // 调入仓库：展会物资仓 + 虚拟仓（基础列表）
  const toWarehouses = useMemo(() => {
    return warehouses.filter(w => w.category === 'exhibition' && w.property === 'virtual');
  }, [warehouses]);

  const [filterNo, setFilterNo] = useState('');
  const [filterFromWarehouse, setFilterFromWarehouse] = useState<string[]>([]);
  const [filterToWarehouse, setFilterToWarehouse] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [applied, setApplied] = useState({
    no: '',
    status: '',
    fromWarehouses: [] as string[],
    toWarehouses: [] as string[],
    from: '',
    to: '',
    projectId: '',
  });

  const outboundTransfers = useMemo(() => {
    return stockTransfers.filter((t) => {
      const fromWh = warehouses.find(w => w.id === t.fromWarehouseId);
      const toWh = warehouses.find(w => w.id === t.toWarehouseId);
      return fromWh?.category === 'exhibition' && toWh?.category === 'exhibition';
    });
  }, [stockTransfers, warehouses]);

  const filteredData = useMemo(() => {
    return outboundTransfers.filter((o) => {
      if (applied.no && !o.transferNo.includes(applied.no)) return false;
      if (applied.status && o.status !== applied.status) return false;
      if (applied.fromWarehouses.length > 0 && !applied.fromWarehouses.includes(o.fromWarehouseId)) return false;
      if (applied.toWarehouses.length > 0 && !applied.toWarehouses.includes(o.toWarehouseId)) return false;
      if (applied.from && o.createTime < applied.from) return false;
      if (applied.to && o.createTime > applied.to + ' 23:59:59') return false;
      if (applied.projectId && o.projectId !== applied.projectId) return false;
      return true;
    });
  }, [outboundTransfers, applied]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待出库确认';
      case 'outbound_confirmed': return '待入库确认';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#e6a23c';
      case 'outbound_confirmed': return '#2f54eb';
      case 'completed': return '#67c23a';
      case 'cancelled': return '#909399';
      default: return '#303133';
    }
  };

  const columns: ColumnDef<StockTransfer>[] = [
    { key: 'transferNo', title: '调拨单号' },
    {
      key: 'workOrderCode',
      title: '关联工单号',
      render: (row) => {
        const woDetail = row.details.find((d) => d.workOrderCode);
        return woDetail ? <span className="text-[#2f54eb]">{woDetail.workOrderCode}</span> : '-';
      },
    },
    {
      key: 'projectId',
      title: '所属展会',
      render: (row) => row.projectName || exhibitionProjects.find((p) => p.id === row.projectId)?.projectName || '-',
    },
    { key: 'fromWarehouseName', title: '调出仓库' },
    { key: 'toWarehouseName', title: '调入仓库' },
    {
      key: 'quantity',
      title: '调拨数量',
      align: 'right',
      render: (row) => row.details.reduce((a, b) => a + (b.quantity || 0), 0),
    },
    { key: 'creator', title: '制单人' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <span style={{ color: getStatusColor(row.status) }}>{getStatusText(row.status)}</span>,
    },
    { key: 'createTime', title: '创建时间' },
    { key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => setViewItem(row)}>查看</TextButton>
          <TextButton onClick={() => { setViewItem(null); setPrintItem(row); setPrintTrigger(prev => prev + 1); }}>
              <Printer size={12} /> 打印
            </TextButton>
          {row.status === 'pending' && (
            <>
              <TextButton
                onClick={() => {
                  setIsNew(false);
                  const cloned = JSON.parse(JSON.stringify(row));
                  setEditItem(cloned);
                }}
              >
                编辑
              </TextButton>
              <TextButton
                type="danger"
                onClick={() => {
                  if (confirm(`确认删除 ${row.transferNo}？`)) deleteStockTransfer(row.id);
                }}
              >
                删除
              </TextButton>
              <TextButton onClick={() => handleOutboundConfirm(row.id)}>出库确认</TextButton>
            </>
          )}
          {row.status === 'outbound_confirmed' && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
          {row.status === 'completed' && (
            <TextButton type="warning" onClick={() => handleReverseConfirm(row.id)}>反确认</TextButton>
          )}
        </div>
      ),
    },
  ];

  const handleReverseConfirm = (id: string) => {
    const transfer = stockTransfers.find((t) => t.id === id);
    if (!transfer) return;
    const statusText = transfer.status === 'outbound_confirmed' ? '待入库确认' : '已完成';
    if (!confirm(`确认反确认调拨单 ${transfer.transferNo}（当前状态：${statusText}）？反确认后单据将回退到可编辑状态，库存将回滚，且会生成冲销流水记录。`)) return;

    const result = reverseStockTransfer(id);
    if (result.success) {
      alert(result.message);
    } else {
      alert('反确认失败：' + result.message);
    }
  };

  const [viewItem, setViewItem] = useState<StockTransfer | null>(null);
  const [printItem, setPrintItem] = useState<StockTransfer | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);

  const [editItem, setEditItem] = useState<StockTransfer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [workOrderPickerOpen, setWorkOrderPickerOpen] = useState(false);
  const [workItemExpanded, setWorkItemExpanded] = useState(false);

  // 🆕 施工单位去重列表（从虚拟仓 constructionUnit 提取 + 从工单配置提取）
  const constructionUnits = useMemo(() => {
    const fromWH = toWarehouses.map((w) => w.constructionUnit).filter(Boolean) as string[];
    const fromCfg = workOrderConfigs.map((c) => c.constructionUnit).filter(Boolean) as string[];
    return Array.from(new Set([...fromWH, ...fromCfg]));
  }, [toWarehouses, workOrderConfigs]);

  // 🆕 联动过滤：按所选展会项目 + 施工单位缩窄虚拟仓下拉
  const filteredToWarehouses = useMemo(() => {
    if (!editItem) return toWarehouses;
    return toWarehouses.filter((w) => {
      if (editItem.projectId && w.exhibitionId && w.exhibitionId !== editItem.projectId) return false;
      if (editItem.constructionUnit) {
        if (w.constructionUnit && w.constructionUnit !== editItem.constructionUnit) return false;
      }
      return true;
    });
  }, [toWarehouses, editItem?.projectId, editItem?.constructionUnit]);

  // ===== 替换物资 =====
  const [replaceTargetIdx, setReplaceTargetIdx] = useState<number | null>(null);
  const [replacePickerOpen, setReplacePickerOpen] = useState(false);

  const openAdd = () => {
    // 🆕 默认展会项目：ongoing 状态的第一个
    const defaultProject = exhibitionProjects.find((p) => p.status === 'ongoing') || exhibitionProjects[0];
    // 🆕 默认调入仓库：该展会下、第一个虚拟仓
    const defaultTo = toWarehouses.find(
      (w) => defaultProject && w.exhibitionId === defaultProject.id && !w.constructionUnit
    ) || toWarehouses[0];
    const newOrder: StockTransfer = {
      id: 'TF' + Date.now(),
      transferNo: generateTransferNo(),
      projectId: defaultProject?.id || '',
      projectName: defaultProject?.projectName || '',
      fromWarehouseId: fromWarehouses[0]?.id || '',
      fromWarehouseName: fromWarehouses[0]?.name || '',
      toWarehouseId: defaultTo?.id || '',
      toWarehouseName: defaultTo?.name || '',
      status: 'pending',
      creator: currentUser.name,
      createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      remark: '',
      details: [],
    };
    setIsNew(true);
    setEditItem(newOrder);
  };

  /** 🆕 切换展会项目 / 施工单位后，自动找匹配的虚拟仓回填调入仓库 */
  const autoMatchToWarehouse = (item: StockTransfer) => {
    const candidates = toWarehouses.filter((w) => {
      if (item.projectId && w.exhibitionId && w.exhibitionId !== item.projectId) return false;
      if (item.constructionUnit && w.constructionUnit && w.constructionUnit !== item.constructionUnit) return false;
      return true;
    });
    // 优先匹配 "展会+施工单位" 完全一致的
    const best = candidates.find(
      (w) =>
        w.exhibitionId === item.projectId &&
        (!item.constructionUnit || w.constructionUnit === item.constructionUnit)
    ) || candidates[0];
    if (best) {
      item.toWarehouseId = best.id;
      item.toWarehouseName = best.name;
    }
    return item;
  };

  const handlePickerConfirm = (selectedProducts: ProductPickerItem[]) => {
    if (!editItem) return;
    const newDetails: StockTransferDetail[] = selectedProducts.map((p) => {
      return {
        id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
        stockTransferId: editItem.id,
        productId: p.id,
        productCode: p.code || '',
        productName: p.name || '',
        fromPositionId: '',
        fromPositionName: '',
        toPositionId: '',
        toPositionName: '',
        quantity: 0,
      };
    });
    const existingIds = new Set(editItem.details.map((d) => d.productId));
    const toAdd = newDetails.filter((d) => !existingIds.has(d.productId));
    setEditItem({ ...editItem, details: [...editItem.details, ...toAdd] });
    setPickerOpen(false);
  };

  // 作业项目汇总（从 details 反算）：相同 workItemName 的 workOrderQty 累加
  const workItemSummary = useMemo(() => {
    if (!editItem) return [] as {
      workItemName: string;
      workItemQty: number;
      workOrderCodes: string[];
      workOrderIds: string[];
    }[];
    const map = new Map<string, {
      workItemName: string;
      workItemQty: number;
      workOrderCodes: string[];
      workOrderIds: string[];
    }>();
    for (const d of editItem.details) {
      const key = d.workItemName || d.workOrderName || '';
      if (!key || !d.workOrderId) continue;
      const existing = map.get(key);
      if (existing) {
        if (!existing.workOrderIds.includes(d.workOrderId)) {
          existing.workItemQty += d.workOrderQty ?? 0;
          if (d.workOrderCode && !existing.workOrderCodes.includes(d.workOrderCode)) {
            existing.workOrderCodes.push(d.workOrderCode);
          }
          existing.workOrderIds.push(d.workOrderId);
        }
      } else {
        map.set(key, {
          workItemName: key,
          workItemQty: d.workOrderQty ?? 0,
          workOrderCodes: d.workOrderCode ? [d.workOrderCode] : [],
          workOrderIds: [d.workOrderId],
        });
      }
    }
    return Array.from(map.values());
  }, [editItem?.details]);

  // 汇总：库存不足的作业项数
  const shortWorkItemCount = useMemo(() => {
    if (!editItem) return 0;
    return workItemSummary.filter((g) => {
      const details = editItem.details.filter(
        (d) => (d.workItemName || d.workOrderName) === g.workItemName
      );
      return details.some((d) => {
        const available = batchInventories
          .filter(
            (b) =>
              b.productId === d.productId &&
              b.quantity > 0 &&
              b.warehouseId === editItem.fromWarehouseId
          )
          .reduce((s, b) => s + b.quantity, 0);
        const displayQty =
          d.quantity > 0 ? d.quantity : Math.min(d.workOrderQty ?? 0, available);
        return displayQty > available;
      });
    }).length;
  }, [editItem, workItemSummary, batchInventories]);

  // 汇总：未配置物资的作业项数
  const unconfiguredCount = useMemo(() => {
    return workItemSummary.filter((g) => {
      const cfg = workOrderConfigs.find(
        (c) => c.workOrderName === g.workItemName
      );
      return !cfg || cfg.products.length === 0;
    }).length;
  }, [workItemSummary, workOrderConfigs]);

  /** 父子组正则：workOrderCode 形如 "父组-子序号"，提取父组号 */
  const getBondParent = (code: string): string | null => {
    const m = code.match(/^(.+)-\d+$/);
    return m ? m[1] : null;
  };

  /** 🆕 父子组组合规则数组 —— 电箱 + 智慧/智能模块 → 智慧电箱真产品（多规格） */
  const COMBINE_RULES = [
    {
      /** 用于在 base（电箱工单）的 workItemName/workOrderName/products.specification 里匹配规格 */
      baseSpecKeyword: '220V',
      baseKeyword: '电箱',
      addonKeyword: '智慧',
      combinedProductId: 'PRD803',
      combinedProductCode: 'QD2020',
      combinedProductName: '智慧电箱',
      combinedSpecification: '220V/16A 智慧款（含智慧模块）',
      combinedUnit: '台',
      combinedWorkItemName: '智慧电箱 220V 16A',
    },
    {
      baseSpecKeyword: '380V',
      baseKeyword: '电箱',
      addonKeyword: '智能',   // 兼容"智能模块"和"智慧模块"两种叫法
      combinedProductId: 'PRD804',
      combinedProductCode: 'QD2021',
      combinedProductName: '智慧电箱',
      combinedSpecification: '380V/400A 智慧款（含智慧模块）',
      combinedUnit: '台',
      combinedWorkItemName: '智慧电箱 380V 400A',
    },
    {
      baseSpecKeyword: '380V',
      baseKeyword: '电箱',
      addonKeyword: '智慧',   // 380V 电箱 + 智慧模块 也匹配这条
      combinedProductId: 'PRD804',
      combinedProductCode: 'QD2021',
      combinedProductName: '智慧电箱',
      combinedSpecification: '380V/400A 智慧款（含智慧模块）',
      combinedUnit: '台',
      combinedWorkItemName: '智慧电箱 380V 400A',
    },
  ] as const;

  /** 从 base 工单（电箱）里提取能匹配的规格关键词 */
  const extractBaseSpec = (base: WorkOrderPickerItem): string => {
    const haystack = [
      base.workItemName || '',
      base.workOrderName || '',
      ...(base.products || []).map((p) => p.specification || ''),
    ].join(' ');
    for (const rule of COMBINE_RULES) {
      if (rule.baseSpecKeyword && haystack.includes(rule.baseSpecKeyword)) {
        return rule.baseSpecKeyword;
      }
    }
    return '';
  };

  /** 匹配 base+addon 关键词都命中的那条规则（不区分规格，先筛 base/addon 关键词，再按规格精准匹配） */
  const resolveCombineRule = (base: WorkOrderPickerItem, addon: WorkOrderPickerItem) => {
    const baseText = [base.workItemName || '', base.workOrderName || ''].join(' ');
    const addonText = [addon.workItemName || '', addon.workOrderName || ''].join(' ');
    const baseSpec = extractBaseSpec(base);
    // 先按规格精准匹配
    const specMatch = COMBINE_RULES.find(
      (r) =>
        baseText.includes(r.baseKeyword) &&
        addonText.includes(r.addonKeyword) &&
        (baseSpec ? r.baseSpecKeyword === baseSpec : true)
    );
    if (specMatch) return specMatch;
    // 再降级：只按 base/addon 关键词匹配（不看规格），取第一条
    return COMBINE_RULES.find(
      (r) => baseText.includes(r.baseKeyword) && addonText.includes(r.addonKeyword)
    );
  };

  /** 处理单个父子组的组合逻辑，返回要加入 newDetails 的明细数组；不匹配返回 null 让外面走常规流程 */
  const tryCombineBondGroup = (
    parent: string,
    groupItems: WorkOrderPickerItem[]
  ): StockTransferDetail[] | null => {
    // 按关键词分组
    const baseItems = groupItems.filter((i) =>
      COMBINE_RULES.some((r) => (i.workItemName || i.workOrderName || '').includes(r.baseKeyword))
    );
    const addonItems = groupItems.filter((i) =>
      COMBINE_RULES.some((r) => (i.workItemName || i.workOrderName || '').includes(r.addonKeyword))
    );

    if (baseItems.length === 0 || addonItems.length === 0) return null;

    // base 和 addon 各取子序号最小的那条
    const pickLowestSeq = (arr: WorkOrderPickerItem[]) => {
      return [...arr].sort((a, b) => {
        const sa = parseInt(a.workOrderCode.match(/(\d+)$/)?.[1] || '9999', 10);
        const sb = parseInt(b.workOrderCode.match(/(\d+)$/)?.[1] || '9999', 10);
        return sa - sb;
      })[0];
    };

    const base = pickLowestSeq(baseItems);
    const addon = pickLowestSeq(addonItems);

    // 🆕 根据 base/addon 实际内容解析出对应的组合规则
    const rule = resolveCombineRule(base, addon);
    if (!rule) return null;

    const baseQty = base.workItemQty ?? 1;
    const addonQty = addon.workItemQty ?? 1;
    const combinedQty = Math.min(baseQty, addonQty);
    const remainderQty = baseQty - combinedQty;

    const out: StockTransferDetail[] = [];

    // ① 智慧电箱 × combinedQty —— 用匹配到的真产品
    out.push({
      id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
      stockTransferId: '',
      productId: rule.combinedProductId,
      productCode: rule.combinedProductCode,
      productName: rule.combinedProductName,
      fromPositionId: '',
      fromPositionName: '',
      toPositionId: '',
      toPositionName: '',
      quantity: 0,
      workOrderId: base.workOrderId,
      workOrderCode: base.workOrderCode + '+' + addon.workOrderCode,
      workOrderName: rule.combinedWorkItemName,
      workItemName: rule.combinedWorkItemName,
      workOrderQty: combinedQty,
    });

    // ② 剩余 base 作业项 × remainderQty —— 用 base 自己的 products
    if (remainderQty > 0 && base.products.length > 0) {
      const itemWorkItemName = base.workItemName || base.workOrderName;
      base.products.forEach((product) => {
        out.push({
          id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
          stockTransferId: '',
          productId: product.productId,
          productCode: product.productCode,
          productName: product.productName,
          fromPositionId: '',
          fromPositionName: '',
          toPositionId: '',
          toPositionName: '',
          quantity: 0,
          workOrderId: base.workOrderId,
          workOrderCode: base.workOrderCode,
          workOrderName: itemWorkItemName,
          workItemName: itemWorkItemName,
          workOrderQty: remainderQty,
        });
      });
    }

    return out;
  };

  const handleWorkOrderConfirm = (selectedItems: WorkOrderPickerItem[]) => {
    if (!editItem) return;

    // 先按父子组分桶
    const bondMap = new Map<string, WorkOrderPickerItem[]>();
    const standalone: WorkOrderPickerItem[] = [];
    selectedItems.forEach((item) => {
      const parent = getBondParent(item.workOrderCode);
      if (parent) {
        const arr = bondMap.get(parent) ?? [];
        arr.push(item);
        bondMap.set(parent, arr);
      } else {
        standalone.push(item);
      }
    });

    const newDetails: StockTransferDetail[] = [];

    // 1. 处理父子组（可能组合，也可能只是普通组）
    bondMap.forEach((groupItems, parent) => {
      const combined = tryCombineBondGroup(parent, groupItems);
      if (combined) {
        // 命中组合规则
        combined.forEach((d) => {
          d.stockTransferId = editItem!.id;
          newDetails.push(d);
        });
      } else {
        // 不命中组合规则 → 常规处理（同作业项合并交给 workItemSummary）
        groupItems.forEach((item) => {
          const itemQty = item.workItemQty ?? 1;
          const itemWorkItemName = item.workItemName || item.workOrderName;
          item.products.forEach((product) => {
            newDetails.push({
              id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
              stockTransferId: editItem!.id,
              productId: product.productId,
              productCode: product.productCode,
              productName: product.productName,
              fromPositionId: '',
              fromPositionName: '',
              toPositionId: '',
              toPositionName: '',
              quantity: 0,
              workOrderId: item.workOrderId,
              workOrderCode: item.workOrderCode,
              workOrderName: itemWorkItemName,
              workItemName: itemWorkItemName,
              workOrderQty: itemQty,
            });
          });
        });
      }
    });

    // 2. 处理非父子组的普通工单
    standalone.forEach((item) => {
      const itemQty = item.workItemQty ?? 1;
      const itemWorkItemName = item.workItemName || item.workOrderName;
      item.products.forEach((product) => {
        newDetails.push({
          id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7),
          stockTransferId: editItem!.id,
          productId: product.productId,
          productCode: product.productCode,
          productName: product.productName,
          fromPositionId: '',
          fromPositionName: '',
          toPositionId: '',
          toPositionName: '',
          quantity: 0,
          workOrderId: item.workOrderId,
          workOrderCode: item.workOrderCode,
          workOrderName: itemWorkItemName,
          workItemName: itemWorkItemName,
          workOrderQty: itemQty,
        });
      });
    });

    // 按 workItemName + productId 去重
    const existingIds = new Set(editItem.details.map((d) => `${d.workItemName || ''}::${d.productId}`));
    const toAdd = newDetails.filter((d) => !existingIds.has(`${d.workItemName}::${d.productId}`));

    // 🆕 从已选工单自动带出 projectId / projectName / constructionUnit（仅当当前为空时）
    const first = selectedItems[0];
    const projectId = editItem.projectId || first?.projectId || '';
    const projectName = editItem.projectName || first?.projectName || '';
    const constructionUnit =
      editItem.constructionUnit ||
      selectedItems.find((i) => i.constructionUnit)?.constructionUnit ||
      '';

    const next: StockTransfer = {
      ...editItem,
      projectId,
      projectName,
      constructionUnit,
      details: [...editItem.details, ...toAdd],
    };
    // 🆕 自动匹配调入虚拟仓（如果之前没选或选得不匹配）
    setEditItem(autoMatchToWarehouse(next));
    setWorkOrderPickerOpen(false);
  };

  // 移除某个作业项目的所有物资明细
  const removeWorkItem = (workItemName: string) => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      details: editItem.details.filter((d) => {
        const key = d.workItemName || d.workOrderName || '';
        return key !== workItemName;
      }),
    });
  };

  // 清空所有工单明细
  const clearAllWorkOrders = () => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      details: editItem.details.filter((d) => !d.workOrderId),
    });
  };

  const updateDetail = (idx: number, field: string, value: any) => {
    if (!editItem) return;
    const newDetails = [...editItem.details];
    (newDetails[idx] as any)[field] = value;
    setEditItem({ ...editItem, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, details: editItem.details.filter((_, i) => i !== idx) });
  };

  // 替换物资：点击替换按钮 → 打开物资选择弹窗
  const handleReplaceClick = (idx: number) => {
    if (!editItem) return;
    const detail = editItem.details[idx];
    if (!detail.workOrderId) {
      alert('无工单模式下不支持替换物资');
      return;
    }
    setReplaceTargetIdx(idx);
    setReplacePickerOpen(true);
  };

  // 替换物资确认：选中的物资作为新行 push 到同一作业项下
  const handleReplaceConfirm = (selectedProducts: ProductPickerItem[]) => {
    if (!editItem || replaceTargetIdx === null) return;
    const srcDetail = editItem.details[replaceTargetIdx];
    if (!srcDetail) return;

    const existingIds = new Set(editItem.details.map((d) => d.productId));
    const newDetails: StockTransferDetail[] = selectedProducts
      .filter((p) => !existingIds.has(p.id))
      .map((p, idx) => ({
        id: 'TFD' + Date.now() + Math.random().toString(36).slice(2, 7) + 'R' + idx,
        stockTransferId: editItem.id,
        productId: p.id,
        productCode: p.code || '',
        productName: p.name || '',
        workOrderId: srcDetail.workOrderId,
        workOrderCode: srcDetail.workOrderCode,
        workOrderName: srcDetail.workOrderName,
        workOrderQty: srcDetail.workOrderQty ?? 0,
        fromPositionId: '',
        fromPositionName: '',
        toPositionId: '',
        toPositionName: '',
        quantity: 0,
      }));

    if (newDetails.length === 0) {
      alert('选中的物资已存在于明细中');
      setReplacePickerOpen(false);
      setReplaceTargetIdx(null);
      return;
    }

    setEditItem({ ...editItem, details: [...editItem.details, ...newDetails] });
    setReplacePickerOpen(false);
    setReplaceTargetIdx(null);
  };

  const handleSave = () => {
    if (!editItem) return;
    if (editItem.fromWarehouseId === editItem.toWarehouseId) {
      alert('调出仓库和调入仓库不能相同');
      return;
    }
    const fromWarehouse = warehouses.find((w) => w.id === editItem.fromWarehouseId);
    const toWarehouse = warehouses.find((w) => w.id === editItem.toWarehouseId);
    if (fromWarehouse && (fromWarehouse.category !== 'exhibition' || fromWarehouse.property !== 'physical')) {
      alert(`调出仓库 "${fromWarehouse.name}" 必须是展会物资实物仓库`);
      return;
    }
    if (toWarehouse && (toWarehouse.category !== 'exhibition' || toWarehouse.property !== 'virtual')) {
      alert(`调入仓库 "${toWarehouse.name}" 必须是展会物资虚拟仓库`);
      return;
    }
    if (!editItem.details.length) {
      alert('请添加至少一个产品');
      return;
    }
    for (const d of editItem.details) {
      if (!d.quantity || d.quantity <= 0) {
        alert(`产品 "${d.productName}" 的数量必须大于0`);
        return;
      }
      const available = batchInventories
        .filter(
          (b) =>
            b.productId === d.productId &&
            b.quantity > 0 &&
            b.warehouseId === editItem.fromWarehouseId
        )
        .reduce((s, b) => s + b.quantity, 0);
      if (d.quantity > available) {
        alert(`产品 "${d.productName}" 的调拨数量(${d.quantity})超过可用库存(${available})`);
        return;
      }
    }
    if (isNew) addStockTransfer(editItem);
    else updateStockTransfer(editItem.id, editItem);
    setEditItem(null);
  };

  const handleOutboundConfirm = (id: string) => {
    const order = stockTransfers.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== 'pending') return;
    if (!confirm(`确认出库 ${order.transferNo}？确认后将扣减调出仓库库存。`)) return;

    const defaultFromPos = positions.find((p) => p.warehouseId === order.fromWarehouseId);
    const newDetails = [...order.details];
    for (let i = 0; i < newDetails.length; i++) {
      const d = newDetails[i];
      const fromPosId = d.fromPositionId || defaultFromPos?.id || '';
      const fromPosName = d.fromPositionName || defaultFromPos?.name || '';
      const productBatches = batchInventories
        .filter(
          (b) =>
            b.productId === d.productId &&
            b.quantity > 0 &&
            b.warehouseId === order.fromWarehouseId
        )
        .sort((a, b) => a.inboundTime.localeCompare(b.inboundTime));

      let remaining = d.quantity;
      const consumptions: { batchId: string; batchNo: string; quantity: number }[] = [];
      for (const batch of productBatches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.quantity, remaining);
        consumptions.push({ batchId: batch.id, batchNo: batch.batchNo, quantity: deduct });
        updateBatchInventory(batch.id, { quantity: batch.quantity - deduct });
        remaining -= deduct;
      }

      if (remaining > 0) {
        alert(`产品 "${d.productName}" 可用量不足，需要 ${d.quantity}，可用 ${d.quantity - remaining}`);
        return;
      }
      (newDetails[i] as any).batchConsumptions = consumptions;
      (newDetails[i] as any).fromPositionId = fromPosId;
      (newDetails[i] as any).fromPositionName = fromPosName;
    }

    for (const d of newDetails) {
      addStockTransaction({
        id: 'TX' + Date.now() + Math.random().toString(36).slice(2, 7),
        transactionNo:
          'TX' +
          new Date().toISOString().slice(0, 10).replace(/-/g, '') +
          Math.random().toString(36).slice(2, 8).toUpperCase(),
        transactionTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        transactionType: 'outbound',
        productId: d.productId,
        productCode: d.productCode,
        productName: d.productName,
        warehouseId: order.fromWarehouseId,
        warehouseName: order.fromWarehouseName || '',
        positionId: (d as any).fromPositionId,
        positionName: (d as any).fromPositionName || '',
        quantity: -d.quantity,
        sourceOrderId: order.id,
        sourceOrderNo: order.transferNo,
        sourceType: '调拨出库',
        batchNo: (d as any).batchConsumptions?.[0]?.batchNo || '',
        operator: currentUser.name,
      });
    }

    updateStockTransfer(id, {
      ...order,
      details: newDetails,
      status: 'outbound_confirmed',
      outboundConfirmTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      outboundConfirmer: currentUser.name,
    });
  };

  const totalQuantity = editItem?.details.reduce((s, d) => s + (d.quantity || 0), 0) || 0;

  // ===== 全屏编辑视图 =====
  if (editItem) {
    return (
      <div className="min-h-screen bg-[#f1f5f9]">
        {/* 顶部 */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PrimaryButton onClick={() => {
              if (confirm('未保存的内容将丢失，确认返回列表？')) setEditItem(null);
            }}>← 返回列表</PrimaryButton>
            <h2 className="text-lg font-semibold text-slate-800">
              📦 {isNew ? '新增调拨单' : '编辑调拨单'} · 领料
            </h2>
          </div>
          <div className="text-sm text-slate-500">
            调拨单号 <span className="font-mono text-slate-700">{editItem.transferNo}</span>
          </div>
        </div>

        <div className="p-6 max-w-[1400px] mx-auto space-y-4">
          {/* ==== 基础信息 ==== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            {/* 第一行：单号 / 展会项目 / 施工单位 / 制单人 */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">调拨单号</label>
                <input
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 focus:outline-none"
                  value={editItem.transferNo}
                  readOnly
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  <span className="text-red-500">*</span> 展会项目
                </label>
                <select
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400"
                  value={editItem.projectId || ''}
                  onChange={(e) => {
                    const proj = exhibitionProjects.find((p) => p.id === e.target.value);
                    const next: StockTransfer = {
                      ...editItem,
                      projectId: e.target.value,
                      projectName: proj?.projectName || '',
                    };
                    // 🆕 选展会后自动匹配虚拟仓
                    setEditItem(autoMatchToWarehouse(next));
                  }}
                >
                  <option value="">请选择展会项目</option>
                  {exhibitionProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.projectName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">施工单位</label>
                <select
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400"
                  value={editItem.constructionUnit || ''}
                  onChange={(e) => {
                    const next: StockTransfer = { ...editItem, constructionUnit: e.target.value };
                    // 🆕 选施工单位后自动匹配虚拟仓
                    setEditItem(autoMatchToWarehouse(next));
                  }}
                >
                  <option value="">不指定（通用仓）</option>
                  {constructionUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">制单人</label>
                <input
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 focus:outline-none"
                  value={editItem.creator}
                  readOnly
                />
              </div>
            </div>
            {/* 第二行：调出仓库 / 调入仓库（联动过滤） */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  <span className="text-red-500">*</span> 调出仓库（实物仓）
                  <span className="ml-1 text-[10px] text-slate-400">默认=展会物资仓，可修改</span>
                </label>
                <select
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400"
                  value={editItem.fromWarehouseId}
                  onChange={(e) => {
                    const wh = fromWarehouses.find((w) => w.id === e.target.value);
                    setEditItem({ ...editItem, fromWarehouseId: e.target.value, fromWarehouseName: wh?.name });
                  }}
                >
                  {fromWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  <span className="text-red-500">*</span> 调入仓库（虚拟仓）
                  <span className="ml-1 text-[10px] text-slate-400">根据所选展会+施工单位自动匹配</span>
                </label>
                <select
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400"
                  value={editItem.toWarehouseId}
                  onChange={(e) => {
                    const wh = warehouses.find((w) => w.id === e.target.value);
                    setEditItem({ ...editItem, toWarehouseId: e.target.value, toWarehouseName: wh?.name });
                  }}
                >
                  {filteredToWarehouses.length === 0 && (
                    <option value="">无匹配虚拟仓（请调整展会/施工单位）</option>
                  )}
                  {filteredToWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                      {w.exhibitionName && w.exhibitionName !== editItem.projectName
                        ? ` · ${w.exhibitionName}`
                        : ''}
                      {w.constructionUnit ? ` · ${w.constructionUnit}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div />
              <div />
            </div>
            {/* 备注 */}
            <div className="mt-4">
              <label className="text-xs text-slate-500 block mb-1">备注</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                rows={2}
                value={editItem.remark || ''}
                onChange={(e) => setEditItem({ ...editItem, remark: e.target.value })}
              />
            </div>
          </div>

          {/* ==== 作业项汇总（折叠抽屉）==== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* 抽屉头：收起时 = 统计条，展开时 = 标题 */}
            <div
              className="px-5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
              onClick={() => setWorkItemExpanded((v) => !v)}
            >
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span
                  className={`inline-block transition-transform duration-200 text-slate-400 ${
                    workItemExpanded ? 'rotate-90' : ''
                  }`}
                >
                  ▶
                </span>
                <span className="font-semibold text-slate-700">📋 作业项汇总</span>
                {workItemSummary.length === 0 ? (
                  <span className="text-slate-400 text-xs">暂无作业项</span>
                ) : (
                  <>
                    <span className="text-xs text-slate-500">
                      已选 <b className="text-indigo-600">{workItemSummary.length}</b> 项
                    </span>
                    <span className="text-xs text-slate-500">
                      · 合计 <b className="text-indigo-600">{editItem?.details.length ?? 0}</b> 种物资
                    </span>
                    {shortWorkItemCount > 0 && (
                      <span className="text-xs text-red-500">
                        · ⚠️ <b>{shortWorkItemCount}</b> 项库存不足
                      </span>
                    )}
                    {unconfiguredCount > 0 && (
                      <span className="text-xs text-amber-600">
                        · 📝 <b>{unconfiguredCount}</b> 项未配置物资
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <DefaultButton onClick={() => setWorkOrderPickerOpen(true)}>+ 工单</DefaultButton>
                {workItemSummary.length > 0 && (
                  <DefaultButton onClick={clearAllWorkOrders}>清空</DefaultButton>
                )}
              </div>
            </div>

            {/* 抽屉体 */}
            {workItemExpanded && (
              <>
                {workItemSummary.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    暂无作业项，点击右上「+ 工单」从工单配置中选择
                  </div>
                ) : (
                  <div className="max-h-[240px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr className="text-slate-500">
                          <th className="px-3 py-1.5 text-left w-6"></th>
                          <th className="px-3 py-1.5 text-left">作业项目</th>
                          <th className="px-3 py-1.5 text-center w-14">数量</th>
                          <th className="px-3 py-1.5 text-left">来源工单</th>
                          <th className="px-3 py-1.5 text-center w-16">状态</th>
                          <th className="px-3 py-1.5 text-right w-16">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workItemSummary.map((item) => {
                          // 算状态
                          const details =
                            editItem?.details.filter(
                              (d) =>
                                (d.workItemName || d.workOrderName) === item.workItemName
                            ) || [];
                          const cfg = workOrderConfigs.find(
                            (c) => c.workOrderName === item.workItemName
                          );
                          const hasConfig = !!cfg && cfg.products.length > 0;
                          const hasShort = details.some((d) => {
                            const available = batchInventories
                              .filter(
                                (b) =>
                                  b.productId === d.productId &&
                                  b.quantity > 0 &&
                                  b.warehouseId === editItem?.fromWarehouseId
                              )
                              .reduce((s, b) => s + b.quantity, 0);
                            const displayQty =
                              d.quantity > 0
                                ? d.quantity
                                : Math.min(d.workOrderQty ?? 0, available);
                            return displayQty > available;
                          });
                          const statusDot = hasShort
                            ? 'bg-red-500'
                            : !hasConfig
                            ? 'bg-amber-500'
                            : 'bg-emerald-500';
                          const statusLabel = hasShort
                            ? '缺'
                            : !hasConfig
                            ? '未配'
                            : '✓';
                          const statusClass = hasShort
                            ? 'bg-red-50 text-red-600'
                            : !hasConfig
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600';

                          // 来源工单 chip 折叠：显示前 2 个 + N
                          const codes = item.workOrderCodes;
                          const shown = codes.slice(0, 2);
                          const more = codes.length - shown.length;

                          return (
                            <tr
                              key={item.workItemName}
                              className="border-t border-slate-100 hover:bg-slate-50/60 h-6"
                            >
                              <td className="px-3 py-1">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${statusDot}`}
                                ></span>
                              </td>
                              <td className="px-3 py-1 font-medium text-slate-700 truncate max-w-[260px]">
                                {item.workItemName}
                              </td>
                              <td className="px-3 py-1 text-center font-semibold text-indigo-600">
                                {item.workItemQty}
                              </td>
                              <td className="px-3 py-1">
                                {shown.map((c) => (
                                  <span
                                    key={c}
                                    className="inline-block mr-1 text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                                  >
                                    {c}
                                  </span>
                                ))}
                                {more > 0 && (
                                  <span className="inline-block text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                                    +{more}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-1 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${statusClass}`}
                                >
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="px-3 py-1 text-right">
                                <button
                                  onClick={() => removeWorkItem(item.workItemName)}
                                  className="text-red-500 hover:text-red-600 text-xs"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 flex justify-between">
                  <span>🟢 充足 · 🟡 未配置 · 🔴 库存不足</span>
                  <span>{workItemSummary.length} 条 · 可滚动</span>
                </div>
              </>
            )}
          </div>

          {/* ==== 产品明细（按作业项分组）==== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="font-semibold text-slate-700 text-sm">
                📦 物资明细（按作业项分组）
              </div>
              <DefaultButton onClick={() => setPickerOpen(true)}>+ 追加物资（无工单）</DefaultButton>
            </div>

            {/* 没选工单 + 没手动加物资 */}
            {editItem.details.length === 0 && workItemSummary.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                <div className="mb-3">暂无物资明细</div>
                <div className="flex items-center justify-center gap-2">
                  <PrimaryButton onClick={() => setWorkOrderPickerOpen(true)}>
                    <ArrowRightLeft size={14} /> + 选择工单
                  </PrimaryButton>
                  <DefaultButton onClick={() => setPickerOpen(true)}>+ 手动选物资</DefaultButton>
                </div>
              </div>
            )}

            {/* 按作业项分组渲染 */}
            {workItemSummary.length > 0 && workItemSummary.map((group, gi) => {
              // 找这个作业项下的所有物资明细
              const groupDetails = editItem.details.filter((d) => {
                const key = d.workItemName || d.workOrderName || '';
                return key === group.workItemName;
              });

              // 找工单配置
              const config = workOrderConfigs.find((c) => group.workOrderIds.includes(c.workOrderId));
              const hasConfig = !!config && config.products.length > 0;

              return (
                <div key={group.workItemName} className="border-b border-slate-100 last:border-b-0">
                  {/* 组头 */}
                  <div className="bg-gradient-to-r from-indigo-50/80 to-slate-50 px-5 py-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-5">{gi + 1}</span>
                      <span className="font-semibold text-slate-700">{group.workItemName}</span>
                      <span className="text-xs text-slate-400">
                        工单 {group.workOrderCodes.join(', ')} · 作业数量 {group.workItemQty}
                      </span>
                      {!hasConfig && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          ⚠️ 该工单未配置物资
                        </span>
                      )}
                      {groupDetails.some((d) => {
                        const p = products.find((x) => x.id === d.productId);
                        const avail = batchInventories
                          .filter((b) => b.productId === d.productId && b.quantity > 0 && b.warehouseId === editItem.fromWarehouseId)
                          .reduce((s, b) => s + b.quantity, 0);
                        const displayQty = d.quantity > 0 ? d.quantity : (d.workOrderQty ?? 0);
                        return displayQty > avail;
                      }) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          ⚠️ 存在库存不足，建议替换
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <DefaultButton onClick={() => {
                        // 把 replaceTargetIdx 设成 -1 表示"追加物资"模式
                        setReplaceTargetIdx(-(gi + 1));
                        setReplacePickerOpen(true);
                      }}>+ 追加物资</DefaultButton>
                    </div>
                  </div>

                  {/* 组内物资 */}
                  {groupDetails.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-sm bg-amber-50/30">
                      此作业项下暂无物资，点击右上「+ 追加物资」选择
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/60 text-slate-500 text-xs">
                          <th className="px-4 py-2 text-left w-10">#</th>
                          <th className="px-4 py-2 text-left">物资名称</th>
                          <th className="px-4 py-2 text-left w-28">规格</th>
                          <th className="px-4 py-2 text-left w-14">单位</th>
                          <th className="px-4 py-2 text-right w-28">调拨数量</th>
                          <th className="px-4 py-2 text-right w-24">可用库存</th>
                          <th className="px-4 py-2 text-center w-32">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupDetails.map((d: any, ri) => {
                          const p = products.find((x) => x.id === d.productId);
                          const available = batchInventories
                            .filter((b) => b.productId === d.productId && b.quantity > 0 && b.warehouseId === editItem.fromWarehouseId)
                            .reduce((s, b) => s + b.quantity, 0);
                          const workOrderQty = d.workOrderQty ?? 0;
                          const defaultQty = Math.min(workOrderQty, available);
                          const displayQty = d.quantity > 0 ? d.quantity : defaultQty;
                          const qtyShort = displayQty > available;

                          return (
                            <tr key={ri} className="border-t border-slate-100 hover:bg-slate-50/40">
                              <td className="px-4 py-2 text-slate-400">{ri + 1}</td>
                              <td className="px-4 py-2 font-medium text-slate-700">{d.productName}</td>
                              <td className="px-4 py-2 text-slate-500">{p?.specification || '-'}</td>
                              <td className="px-4 py-2 text-slate-500">{p?.unit || '-'}</td>
                              <td className="px-4 py-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  max={available}
                                  className={`w-24 h-8 px-2 border rounded-lg text-right focus:outline-none ${
                                    qtyShort ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-300 text-slate-700 focus:border-indigo-400'
                                  }`}
                                  value={displayQty || ''}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    const realIdx = editItem.details.findIndex(
                                      (x) => x.workItemName === group.workItemName && x.productId === d.productId && x.id === d.id
                                    );
                                    if (realIdx >= 0) updateDetail(realIdx, 'quantity', isNaN(val) ? 0 : val);
                                  }}
                                />
                              </td>
                              <td className={`px-4 py-2 text-right font-medium ${qtyShort ? 'text-red-600' : 'text-emerald-600'}`}>
                                {available}{qtyShort ? ' ⚠️' : ''}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  className="text-indigo-500 hover:text-indigo-600 text-xs mr-2"
                                  onClick={() => {
                                    const realIdx = editItem.details.findIndex(
                                      (x) => x.workItemName === group.workItemName && x.productId === d.productId && x.id === d.id
                                    );
                                    if (realIdx >= 0) handleReplaceClick(realIdx);
                                  }}
                                >替换</button>
                                <button
                                  className="text-red-500 hover:text-red-600 text-xs"
                                  onClick={() => {
                                    const realIdx = editItem.details.findIndex(
                                      (x) => x.workItemName === group.workItemName && x.productId === d.productId && x.id === d.id
                                    );
                                    if (realIdx >= 0) removeDetail(realIdx);
                                  }}
                                >删除</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}

            {/* 有手动加的物资（没挂在工单下）——兜底分组 */}
            {(() => {
              const noGroupDetails = editItem.details.filter((d) => !d.workItemName && !d.workOrderName);
              if (noGroupDetails.length === 0) return null;
              return (
                <div className="border-t border-slate-100">
                  <div className="bg-slate-50 px-5 py-3 flex items-center gap-2">
                    <span className="font-semibold text-slate-600 text-sm">无工单关联（手动添加）</span>
                    <span className="text-xs text-slate-400">这些物资未关联任何工单作业项</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 text-slate-500 text-xs">
                        <th className="px-4 py-2 text-left w-10">#</th>
                        <th className="px-4 py-2 text-left">物资名称</th>
                        <th className="px-4 py-2 text-left w-28">规格</th>
                        <th className="px-4 py-2 text-left w-14">单位</th>
                        <th className="px-4 py-2 text-right w-28">调拨数量</th>
                        <th className="px-4 py-2 text-right w-24">可用库存</th>
                        <th className="px-4 py-2 text-center w-32">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {noGroupDetails.map((d: any, ri) => {
                        const p = products.find((x) => x.id === d.productId);
                        const available = batchInventories
                          .filter((b) => b.productId === d.productId && b.quantity > 0 && b.warehouseId === editItem.fromWarehouseId)
                          .reduce((s, b) => s + b.quantity, 0);
                        const qtyShort = (d.quantity || 0) > available;
                        const realIdx = editItem.details.indexOf(d);
                        return (
                          <tr key={ri} className="border-t border-slate-100 hover:bg-slate-50/40">
                            <td className="px-4 py-2 text-slate-400">{ri + 1}</td>
                            <td className="px-4 py-2 font-medium text-slate-700">{d.productName}</td>
                            <td className="px-4 py-2 text-slate-500">{p?.specification || '-'}</td>
                            <td className="px-4 py-2 text-slate-500">{p?.unit || '-'}</td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number" min="0" max={available}
                                className={`w-24 h-8 px-2 border rounded-lg text-right focus:outline-none ${qtyShort ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-300 text-slate-700 focus:border-indigo-400'}`}
                                value={d.quantity || ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (realIdx >= 0) updateDetail(realIdx, 'quantity', isNaN(val) ? 0 : val);
                                }}
                              />
                            </td>
                            <td className={`px-4 py-2 text-right font-medium ${qtyShort ? 'text-red-600' : 'text-emerald-600'}`}>
                              {available}{qtyShort ? ' ⚠️' : ''}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button className="text-red-500 hover:text-red-600 text-xs" onClick={() => removeDetail(realIdx)}>删除</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 底部固定操作栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.04)] z-30">
          <div className="text-sm text-slate-500">
            📊 共 <b className="text-slate-700">{workItemSummary.length}</b> 个作业项 ·
            <b className="text-slate-700"> {editItem.details.length}</b> 种物资 ·
            合计 <b className="text-indigo-600">{totalQuantity}</b> 件
          </div>
          <div className="flex items-center gap-2">
            <DefaultButton onClick={() => {
              if (confirm('未保存的内容将丢失，确认返回列表？')) setEditItem(null);
            }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存调拨单</PrimaryButton>
          </div>
        </div>

        {/* 底部留白防遮挡 */}
        <div className="h-16" />

        {/* 子弹窗：选择工单 */}
        <WorkOrderPickerModal
          open={workOrderPickerOpen}
          title="选择工单"
          onClose={() => setWorkOrderPickerOpen(false)}
          onConfirm={handleWorkOrderConfirm}
        />

        {/* 子弹窗：选择物资（无工单时） */}
        <ProductPickerModal
          open={pickerOpen}
          title="选择物资"
          onClose={() => setPickerOpen(false)}
          onConfirm={handlePickerConfirm}
          showStockQty={true}
          onlyStocked={true}
          warehouseId={editItem?.fromWarehouseId}
        />

        {/* 子弹窗：替换物资 / 追加物资 */}
        <ProductPickerModal
          open={replacePickerOpen}
          title={replaceTargetIdx !== null && replaceTargetIdx < 0 ? '追加物资到作业项' : '替换物资'}
          onClose={() => { setReplacePickerOpen(false); setReplaceTargetIdx(null); }}
          onConfirm={handleReplaceConfirm}
          showStockQty={true}
          onlyStocked={true}
          warehouseId={editItem?.fromWarehouseId}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">展会物资调拨出库</h2>
        <div className="flex items-center gap-2">
          <FeatureHelpButton content={helpContent} />
          <PrimaryButton onClick={openAdd}>
            <ArrowUpFromLine size={14} />
            新增调拨单
          </PrimaryButton>
        </div>
      </div>

      <SearchBar
        onSearch={() =>
          setApplied({
            no: filterNo,
            status: filterStatus,
            fromWarehouses: filterFromWarehouse,
            toWarehouses: filterToWarehouse,
            from: filterFrom,
            to: filterTo,
            projectId: filterProjectId,
          })
        }
        onReset={() => {
          setFilterNo('');
          setFilterStatus('');
          setFilterFromWarehouse([]);
          setFilterToWarehouse([]);
          setFilterFrom('');
          setFilterTo('');
          setFilterProjectId('');
          setApplied({
            no: '',
            status: '',
            fromWarehouses: [],
            toWarehouses: [],
            from: '',
            to: '',
            projectId: '',
          });
        }}
      >
        <SearchField label="调拨单号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="状态" type="select" value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'pending', label: '待出库确认' },
            { value: 'outbound_confirmed', label: '待入库确认' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
        <MultiSelect
          label="调出仓库"
          options={fromWarehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterFromWarehouse}
          onChange={setFilterFromWarehouse}
          placeholder="全部"
        />
        <MultiSelect
          label="调入仓库"
          options={toWarehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={filterToWarehouse}
          onChange={setFilterToWarehouse}
          placeholder="全部"
        />
        <SearchField label="起始日期" type="date" value={filterFrom} onChange={setFilterFrom} />
        <SearchField label="结束日期" type="date" value={filterTo} onChange={setFilterTo} />
        <SearchField label="所属展会" type="select" value={filterProjectId} onChange={setFilterProjectId}
          options={[
            { value: '', label: '全部' },
            ...exhibitionProjects.map((p) => ({ value: p.id, label: p.projectName })),
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      <Modal open={!!viewItem} title="调拨单详情" onClose={() => setViewItem(null)}>
        {viewItem && (
          <>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4 p-4 border border-[#ebeef5] rounded bg-[#f5f7fa]">
              <div><span className="text-[#606266]">调拨单号：</span><span className="text-[#303133]">{viewItem.transferNo}</span></div>
              <div><span className="text-[#606266]">调出仓库：</span><span className="text-[#303133]">{viewItem.fromWarehouseName}</span></div>
              <div><span className="text-[#606266]">调入仓库：</span><span className="text-[#303133]">{viewItem.toWarehouseName}</span></div>
              <div><span className="text-[#606266]">状态：</span><span style={{ color: getStatusColor(viewItem.status) }}>{getStatusText(viewItem.status)}</span></div>
              <div><span className="text-[#606266]">制单人：</span><span className="text-[#303133]">{viewItem.creator}</span></div>
              <div><span className="text-[#606266]">创建时间：</span><span className="text-[#303133]">{viewItem.createTime}</span></div>
              {(() => {
                const woDetail = viewItem.details.find((d) => d.workOrderCode);
                if (!woDetail) return null;
                const config = workOrderConfigs.find((c) => c.workOrderId === woDetail.workOrderId);
                return (
                  <>
                    <div><span className="text-[#606266]">关联工单号：</span><span className="text-[#2f54eb]">{woDetail.workOrderCode}</span></div>
                    <div><span className="text-[#606266]">所属展会：</span><span className="text-[#303133]">{config?.exhibitionName || '-'}</span></div>
                  </>
                );
              })()}
            </div>
            {viewItem.remark && (
              <div className="text-sm mb-3">
                <span className="text-[#606266]">备注：</span>
                <span className="text-[#303133]">{viewItem.remark}</span>
              </div>
            )}
            <div className="text-sm font-medium text-[#303133] mb-3">产品明细</div>
            <table className="w-full text-sm border border-[#ebeef5] rounded overflow-hidden">
              <thead>
                <tr className="bg-[#f5f7fa] text-[#606266]">
                  <th className="px-4 py-3 text-left">作业项</th>
                  <th className="px-4 py-3 text-left">物资名称</th>
                  <th className="px-4 py-3 text-left">规格</th>
                  <th className="px-4 py-3 text-left">单位</th>
                  <th className="px-4 py-3 text-right">数量</th>
                  <th className="px-4 py-3 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.details.length ? (
                  viewItem.details.map((d, i) => (
                    <tr key={i} className="border-t border-[#ebeef5]">
                      <td className="px-4 py-3 text-[#303133]">{d.workOrderName || '-'}</td>
                      <td className="px-4 py-3 text-[#303133]">{d.productName}</td>
                      <td className="px-4 py-3 text-[#303133]">
                        {products.find((p) => p.id === d.productId)?.specification || '-'}
                      </td>
                      <td className="px-4 py-3 text-[#303133]">
                        {products.find((p) => p.id === d.productId)?.unit || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-[#303133]">{d.quantity}</td>
                      <td className="px-4 py-3 text-[#303133]">{d.remark || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#909399]">
                      无明细
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>
        </div>
      </Modal>

      {printTrigger > 0 && printItem && (
        <PrintDocument
          key={printTrigger}
          printTrigger={printTrigger}
          onPrintComplete={() => setPrintItem(null)}
          title="展会物资调拨出库单"
          orderNo={printItem.transferNo}
          orderDate={printItem.createTime.slice(0, 10)}
          operator={printItem.creator || ''}
          warehouseName={printItem.fromWarehouseName || ''}
          details={printItem.details.map((d) => ({
            productCode: d.productCode,
            productName: d.productName,
            specification: products.find((p) => p.id === d.productId)?.specification || '',
            unit: products.find((p) => p.id === d.productId)?.unit || '',
            quantity: d.quantity,
          }))}
        />
      )}
    </div>
  );
}
