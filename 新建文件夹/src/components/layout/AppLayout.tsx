import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface TabItem {
  key: string;
  label: string;
  path: string;
  closable?: boolean;
}

// 路由到页面标题映射
const pathLabelMap: Record<string, string> = {
  '/stock/query': '库存查询',
  '/stock/check': '盘点管理',
  '/stock/transaction': '库存流水记录',
  '/inbound/purchase': '采购入库',
  '/inbound/production': '生产入库',
  '/inbound/return': '退货入库',
  '/outbound/requisition': '领用出库',
  '/outbound/return': '归还退库',
  '/outbound/production': '生产领料',
  '/outbound/scrap': '报废出库',
  '/outbound/damaged': '报损出库',
  '/basic/warehouse': '仓库管理',
  '/basic/position': '仓位管理',
  '/basic/category': '物资分类',
  '/basic/supplier': '供应商管理',
  '/report/stock': '库存报表',
  '/report/inbound': '入库汇总',
  '/report/outbound': '出库汇总',
  '/report/aging': '库龄分析',
  '/report/sluggish': '呆滞分析',
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: '/stock/query', label: '库存查询', path: '/stock/query', closable: false },
  ]);
  const [activeTab, setActiveTab] = useState<string>(location.pathname);

  // 路由变化时更新/添加tab
  useMemo(() => {
    const path = location.pathname;
    const label = pathLabelMap[path] || '首页';
    setActiveTab(path);
    setTabs((prev) => {
      if (prev.some((t) => t.key === path)) return prev;
      return [...prev, { key: path, label, path, closable: path !== '/stock/query' }];
    });
  }, [location.pathname]);

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  const handleTabClose = (tab: TabItem, event: React.MouseEvent) => {
    event.stopPropagation();
    const idx = tabs.findIndex((t) => t.key === tab.key);
    const newTabs = tabs.filter((t) => t.key !== tab.key);
    setTabs(newTabs);
    if (activeTab === tab.key) {
      const fallback = newTabs[idx] || newTabs[newTabs.length - 1];
      if (fallback) {
        navigate(fallback.path);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#303133]">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-[208px]">
          {/* Tab 区 */}
          <div className="bg-white border-b border-[#e4e7ed] px-2 pt-2 flex items-center gap-1 flex-wrap min-h-[40px]">
            {tabs.map((tab) => (
              <div
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`group inline-flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer border-b-2 ${
                  activeTab === tab.key
                    ? 'border-[#2f54eb] text-[#2f54eb] bg-[#f0f4ff]'
                    : 'border-transparent text-[#606266] hover:text-[#2f54eb]'
                } rounded-t`}
              >
                <span>{tab.label}</span>
                {tab.closable !== false && (
                  <span
                    onClick={(e) => handleTabClose(tab, e)}
                    className="opacity-60 hover:opacity-100 ml-1 text-[11px]"
                  >
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* 内容区 */}
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
