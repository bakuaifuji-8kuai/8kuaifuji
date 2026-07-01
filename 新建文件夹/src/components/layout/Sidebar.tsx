import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Boxes, ArrowDownToLine, ArrowUpFromLine, Package, FileText, ChevronRight, Warehouse, RotateCcw, AlertTriangle
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  children?: { title: string; path: string }[];
  path?: string;
}

const menuItems: MenuItem[] = [
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
      { title: '退货入库', path: '/inbound/return' },
    ],
  },
  {
    title: '出库管理',
    icon: ArrowUpFromLine,
    children: [
      { title: '领用出库', path: '/outbound/requisition' },
      { title: '归还退库', path: '/outbound/return' },
      { title: '生产领料', path: '/outbound/production' },
      { title: '报废出库', path: '/outbound/scrap' },
      { title: '报损出库', path: '/outbound/damaged' },
    ],
  },
  {
    title: '基础资料',
    icon: Package,
    children: [
      { title: '仓库管理', path: '/basic/warehouse' },
      { title: '仓位管理', path: '/basic/position' },
      { title: '物资分类', path: '/basic/category' },
      { title: '供应商管理', path: '/basic/supplier' },
    ],
  },
  {
    title: '报表管理',
    icon: FileText,
    children: [
      { title: '库存报表', path: '/report/stock' },
      { title: '入库汇总', path: '/report/inbound' },
      { title: '出库汇总', path: '/report/outbound' },
      { title: '库龄分析', path: '/report/aging' },
      { title: '呆滞分析', path: '/report/sluggish' },
    ],
  },
];

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['库存管理']);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="fixed top-[56px] left-0 bottom-0 w-[208px] bg-[#001529] text-[#c8d3e0] overflow-y-auto z-40">
      <nav className="py-1">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#1f3a5f] hover:text-white transition-colors"
                >
                  <item.icon size={16} className="text-[#6b9fd4]" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      expandedMenus.includes(item.title) ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedMenus.includes(item.title) && (
                  <div className="bg-[#000c17]">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-[#2f54eb] text-white'
                              : 'text-[#c8d3e0] hover:bg-[#1f3a5f] hover:text-white'
                          }`
                        }
                      >
                        <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                        <span>{child.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path || ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-[#2f54eb] text-white' : 'hover:bg-[#1f3a5f] hover:text-white'
                  }`
                }
              >
                <item.icon size={16} />
                <span>{item.title}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
