import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Boxes, ArrowDownToLine, ArrowUpFromLine, Package, FileText, ChevronRight, Warehouse, RotateCcw, AlertTriangle,
  ClipboardList, Users, FileCheck, ShoppingCart, CheckSquare, ArrowRightLeft, LayoutGrid, Workflow, Award
} from 'lucide-react';

interface MenuChild {
  title: string;
  path: string;
  visible?: boolean;
  icon?: any;
  children?: MenuChild[];
}

interface MenuItem {
  title: string;
  icon: any;
  children?: MenuChild[];
  path?: string;
}

const menuItems: MenuItem[] = [
  {
    title: '功能说明',
    icon: FileText,
    path: '/procurement/function-docs',
  },
  {
    title: '招采合约管理',
    icon: ClipboardList,
    children: [
      { title: '招采计划管理', path: '/procurement/plan-group', children: [
        { title: '招采计划', path: '/procurement/plan' },
        { title: '招采计划汇总', path: '/procurement/plan-summary' },
      ]},
      { title: '招采需求申请管理', path: '/procurement/demand' },
      { title: '招采实施过程管理', path: '/procurement/process-group', children: [
        { title: '招采工单', path: '/procurement/bidding' },
        { title: '报价单', path: '/procurement/supplier-quote' },
      ]},
      { title: '合约管理', path: '/procurement/contract-group', children: [
        { title: '合同文本管理', path: '/procurement/contract-template' },
        { title: '合同台账', path: '/procurement/contract' },
        { title: '合同归档', path: '/procurement/contract-archive' },
      ]},
      { title: '供应商管理', path: '/procurement/supplier-group', children: [
        { title: '供应商列表', path: '/procurement/supplier' },
        { title: '履约评估管理', path: '/procurement/evaluation', icon: Award, children: [
          { title: '评估模板管理', path: '/procurement/evaluation-template' },
          { title: '评估执行', path: '/procurement/evaluation-execute' },
          { title: '评估记录', path: '/procurement/evaluation-record' },
        ]},
      ]},
      { title: '招采订单管理', path: '/procurement/contract-purchase-order' },
      { title: '招采项目验收', path: '/procurement/inspection' },
      { title: '网站信息报送审核发布', path: '/procurement/website-info', visible: false },
      { title: '审批流程配置', path: '/procurement/approval-flow', visible: false },
    ],
  },
  {
    title: '库存管理',
    icon: Boxes,
    children: [
      { title: '库存查询', path: '/stock/query' },
      { title: '盘点管理', path: '/stock/check' },
      { title: '库存流水记录', path: '/stock/transaction' },
    ],
  },
  {
    title: '入库管理',
    icon: ArrowDownToLine,
    children: [
      { title: '采购入库', path: '/inbound/purchase' },
      { title: '自制入库', path: '/inbound/production' },
      // { title: '物资归还', path: '/inbound/return-inbound' },
      { title: '退库', path: '/inbound/return-stock' },
    ],
  },
  {
    title: '出库管理',
    icon: ArrowUpFromLine,
    children: [
      { title: '低值易耗领用出库', path: '/outbound/lowvalue' },
      // { title: '展会物资领用出库', path: '/outbound/exhibition' },
      { title: '报废出库', path: '/outbound/scrap' },
      { title: '报损出库', path: '/outbound/damaged' },
    ],
  },
  {
    title: '展会物资调拨管理',
    icon: ArrowRightLeft,
    children: [
      { title: '调拨出库', path: '/stock/exhibition-transfer-outbound' },
      { title: '调拨入库', path: '/stock/exhibition-transfer-inbound' },
    ],
  },
  {
    title: '调拨管理',
    icon: ArrowRightLeft,
    children: [
      { title: '仓库调拨', path: '/stock/transfer' },
    ],
  },
  {
    title: '固定资产管理',
    icon: LayoutGrid,
    children: [
      { title: '资产档案', path: '/asset/list' },
      { title: '资产入库', path: '/asset/inbound' },
      { title: '资产领用', path: '/asset/requisition' },
      { title: '资产归还', path: '/asset/return' },
      { title: '资产调拨', path: '/asset/transfer' },
      { title: '资产报废', path: '/asset/scrap' },
      { title: '资产报损', path: '/asset/loss' },
      { title: '资产报表', path: '/asset/report' },
      { title: '会议纪要', path: '/asset/meeting-notes' },
    ],
  },
  {
    title: '基础资料',
    icon: Package,
    children: [
      { title: '仓库管理', path: '/basic/warehouse' },
      { title: '仓位管理', path: '/basic/position' },
      { title: '物资分类', path: '/basic/category' },
      { title: '物资档案', path: '/basic/product' },
      { title: '物资申请审批', path: '/basic/product-application' },
      { title: '工单物资配置', path: '/basic/workorder-product-config' },
    ],
  },
  {
    title: '报表管理',
    icon: FileText,
    children: [
      { title: '库存报表', path: '/report/stock' },
      { title: '入库汇总', path: '/report/inbound' },
      { title: '入库明细', path: '/report/inbound-detail' },
      { title: '出库汇总', path: '/report/outbound' },
      { title: '出库明细', path: '/report/outbound-detail' },
      // { title: '展会物资领用报表', path: '/report/exhibition-requisition' },
      // { title: '展会物资领用报表详情', path: '/report/exhibition-requisition-detail' },
      { title: '库龄分析', path: '/report/aging' },
      { title: '呆滞分析', path: '/report/sluggish' },
    ],
  },
  {
    title: '业务流程',
    icon: Workflow,
    path: '/report/business-flow',
  },
];

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['库存管理']);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const renderSubMenu = (child: MenuChild, depth: number = 2) => {
    const hasChildren = child.children && child.children.length > 0;
    const paddingMap: Record<number, string> = {
      2: 'pl-12',
      3: 'pl-16',
      4: 'pl-20',
    };
    const paddingLeft = paddingMap[depth] || 'pl-20';

    if (hasChildren) {
      const Icon = child.icon;
      return (
        <div key={child.path}>
          <button
            onClick={() => toggleMenu(child.title)}
            className={`w-full flex items-center gap-3 ${paddingLeft} pr-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200`}
          >
            {Icon ? <Icon size={16} className="text-indigo-300" /> : <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60"></span>}
            <span className="flex-1 text-left">{child.title}</span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-300 text-slate-400 group-hover:text-white ${
                expandedMenus.includes(child.title) ? 'rotate-90' : ''
              }`}
            />
          </button>
          {expandedMenus.includes(child.title) && (
            <div className="bg-black/20">
              {child.children!.filter(c => c.visible !== false).map((c) => renderSubMenu(c, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const childPaddingMap: Record<number, string> = {
      2: 'pl-16',
      3: 'pl-20',
      4: 'pl-24',
    };
    const childPaddingLeft = childPaddingMap[depth] || 'pl-24';

    return (
      <NavLink
        key={child.path}
        to={child.path}
        className={({ isActive }) =>
          `flex items-center gap-3 ${childPaddingLeft} pr-4 py-2.5 text-sm transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-indigo-500/90 to-purple-600/90 text-white shadow-lg shadow-indigo-900/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              isActive ? 'bg-white' : 'bg-slate-500'
            }`}></span>
            <span>{child.title}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed top-[56px] left-0 bottom-0 w-[208px] bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300 overflow-y-auto z-40 shadow-xl shadow-slate-900/20">
      <nav className="py-3">
        {menuItems.map((item) => (
          <div key={item.title} className="mb-0.5">
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                >
                  <item.icon size={18} className="text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform duration-300 text-slate-500 group-hover:text-slate-300 ${
                      expandedMenus.includes(item.title) ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedMenus.includes(item.title) && (
                  <div className="bg-black/15 py-1">
                    {item.children
                      .filter(child => child.visible !== false)
                      .map((child) => renderSubMenu(child))
                    }
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path || ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/90 to-purple-600/90 text-white shadow-lg shadow-indigo-900/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-indigo-400'} />
                    <span>{item.title}</span>
                  </>
                )}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
