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

const pathLabelMap: Record<string, string> = {
  '/stock/query': '库存查询',
  '/stock/check': '盘点管理',
  '/stock/transaction': '库存流水记录',
  '/stock/transfer': '库存调拨',
  '/inbound/purchase': '采购入库',
  '/inbound/production': '自制入库',
  '/inbound/return-inbound': '归还退库',
  '/outbound/lowvalue': '低值易耗领用出库',
  '/outbound/exhibition': '展会物资领用出库',
  '/outbound/scrap': '报废出库',
  '/outbound/damaged': '报损出库',
  '/basic/warehouse': '仓库管理',
  '/basic/position': '仓位管理',
  '/basic/category': '物资分类',
  '/basic/product': '物资档案',
  '/basic/product-application': '物资申请',
  '/basic/implementation-project': '实施项目',
  '/basic/service-project': '服务项目',
  '/basic/workorder-product-config': '工单物资配置',
  '/basic/supplier': '供应商管理',
  '/asset/list': '资产档案',
  '/asset/inbound': '资产入库',
  '/asset/requisition': '资产领用',
  '/asset/return': '资产归还',
  '/asset/transfer': '资产调拨',
  '/asset/scrap': '资产报废',
  '/asset/loss': '资产报损',
  '/asset/report': '资产报表',
  '/report/stock': '库存报表',
  '/report/inbound': '入库汇总',
  '/report/inbound-detail': '入库明细',
  '/report/outbound': '出库汇总',
  '/report/outbound-detail': '出库明细',
  '/report/exhibition-requisition': '展会物资领用报表',
  '/report/exhibition-requisition-detail': '展会物资领用报表详情',
  '/report/aging': '库龄分析',
  '/report/sluggish': '呆滞分析',
  '/report/business-flow': '业务流程',
  '/procurement/plan': '采购计划',
  '/procurement/plan-summary': '采购计划汇总',
  '/procurement/demand': '采购需求',
  '/procurement/contract': '合同台账',
  '/procurement/contract-archive': '合同档案',
  '/procurement/contract-purchase-order': '合同采购订单',
  '/procurement/order': '采购订单',
  '/procurement/supplier': '供应商管理',
  '/procurement/inspection': '采购检验',
  '/procurement/bidding': '招投标管理',
  '/procurement/supplier-quote': '供应商报价',
  '/procurement/website-info': '网站信息',
  '/procurement/contract-template': '合同模板',
  '/procurement/approval-flow': '审批流程配置',
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: '/stock/query', label: '库存查询', path: '/stock/query', closable: false },
  ]);
  const [activeTab, setActiveTab] = useState<string>(location.pathname);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const visibleTabs = useMemo(() => {
    const maxWidth = 1200;
    const baseTabWidth = 100;
    const moreButtonWidth = 40;
    const maxTabs = Math.floor((maxWidth - moreButtonWidth) / baseTabWidth);
    
    if (tabs.length <= maxTabs) {
      return tabs;
    }
    
    const activeIdx = tabs.findIndex(t => t.key === activeTab);
    if (activeIdx === -1) {
      return tabs.slice(0, maxTabs);
    }
    
    if (activeIdx < maxTabs) {
      return tabs.slice(0, maxTabs);
    }
    
    const result = [...tabs.slice(0, maxTabs - 1), tabs[activeIdx]];
    return result;
  }, [tabs, activeTab]);

  const hiddenTabs = useMemo(() => {
    const visibleKeys = new Set(visibleTabs.map(t => t.key));
    return tabs.filter(t => !visibleKeys.has(t.key));
  }, [tabs, visibleTabs]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#303133]">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-[208px]">
          <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-3 pt-2 flex items-center gap-1.5 min-h-[44px] overflow-hidden">
            {visibleTabs.map((tab) => (
              <div
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`group inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium cursor-pointer rounded-lg transition-all duration-300 shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 -translate-y-0.5'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80'
                }`}
              >
                <span>{tab.label}</span>
                {tab.closable !== false && (
                  <span
                    onClick={(e) => handleTabClose(tab, e)}
                    className={`opacity-60 hover:opacity-100 ml-0.5 text-[13px] leading-none w-4 h-4 flex items-center justify-center rounded-full transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'hover:bg-white/20'
                        : 'hover:bg-slate-200'
                    }`}
                  >
                    ×
                  </span>
                )}
              </div>
            ))}
            {hiddenTabs.length > 0 && (
              <div className="relative">
                <div
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium cursor-pointer rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-all duration-300 shrink-0"
                >
                  <span>...</span>
                </div>
                {showMoreMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[150px]">
                    {hiddenTabs.map((tab) => (
                      <div
                        key={tab.key}
                        onClick={() => {
                          handleTabClick(tab);
                          setShowMoreMenu(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 ${
                          activeTab === tab.key ? 'text-indigo-600 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.closable !== false && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTabClose(tab, e);
                            }}
                            className="opacity-60 hover:opacity-100 text-xs"
                          >
                            ×
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
