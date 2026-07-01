import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton } from '@/components/common/Button';
import { useStore } from '@/store/useStore';

export default function StatisticsPage() {
  const inventories = useStore((s) => s.inventories);
  const inboundOrders = useStore((s) => s.inboundOrders);
  const outboundOrders = useStore((s) => s.outboundOrders);
  const procurementOrders = useStore((s) => s.procurementOrders);
  const procurementInspections = useStore((s) => s.procurementInspections);
  const contractLedgers = useStore((s) => s.contractLedgers);
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const warehouses = useStore((s) => s.warehouses);

  const [reportType, setReportType] = useState<'inventory' | 'inbound' | 'outbound' | 'procurement'>('inventory');

  // 库存统计
  const inventoryStats = useMemo(() => {
    const totalProducts = products.length;
    const totalInventory = inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    const totalValue = inventories.reduce((sum, inv) => {
      const product = products.find((p) => p.id === inv.productId);
      return sum + (inv.quantity || 0) * ((product as any)?.price || 0);
    }, 0);
    const lowStockItems = inventories.filter((inv) => {
      const product = products.find((p) => p.id === inv.productId);
      return product && (inv.quantity || 0) < ((product as any).minStock || 0);
    });
    const warehouseData = warehouses.map((wh) => ({
      name: wh.name,
      count: inventories.filter((inv) => inv.warehouseId === wh.id).length,
      quantity: inventories.filter((inv) => inv.warehouseId === wh.id).reduce((sum, inv) => sum + (inv.quantity || 0), 0),
    }));

    return { totalProducts, totalInventory, totalValue, lowStockItems, warehouseData };
  }, [inventories, products, warehouses]);

  // 入库统计
  const inboundStats = useMemo(() => {
    const totalOrders = inboundOrders.length;
    const totalAmount = inboundOrders.reduce((sum, o) => sum + ((o as any).totalAmount || 0), 0);
    const todayCount = inboundOrders.filter((o) => o.createTime?.startsWith(new Date().toISOString().slice(0, 10))).length;
    const pendingCount = inboundOrders.filter((o) => o.status === 'pending').length;
    return { totalOrders, totalAmount, todayCount, pendingCount };
  }, [inboundOrders]);

  // 出库统计
  const outboundStats = useMemo(() => {
    const totalOrders = outboundOrders.length;
    const totalAmount = outboundOrders.reduce((sum, o) => sum + ((o as any).totalAmount || 0), 0);
    const todayCount = outboundOrders.filter((o) => o.createTime?.startsWith(new Date().toISOString().slice(0, 10))).length;
    return { totalOrders, totalAmount, todayCount };
  }, [outboundOrders]);

  // 采购统计
  const procurementStats = useMemo(() => {
    const totalOrders = procurementOrders.length;
    const totalAmount = procurementOrders.reduce((sum, o) => sum + o.details.reduce((s, d) => s + (d.amount || 0), 0), 0);
    const approvedOrders = procurementOrders.filter((o) => o.status === 'approved' || o.status === 'sent').length;
    const completedInspections = procurementInspections.filter((i) => i.status === 'approved').length;
    const totalContracts = contractLedgers.length;
    const contractAmount = contractLedgers.reduce((sum, c) => sum + ((c as any).contractAmount || 0), 0);
    return { totalOrders, totalAmount, approvedOrders, completedInspections, totalContracts, contractAmount };
  }, [procurementOrders, procurementInspections, contractLedgers]);

  const handleExport = () => {
    let data: any[][] = [];
    let headers: string[] = [];

    if (reportType === 'inventory') {
      headers = ['商品编码', '商品名称', '规格', '单位', '库存数量', '仓库', '单价', '库存价值'];
      data = inventories.map((inv) => {
        const product = products.find((p) => p.id === inv.productId);
        return [
          (inv as any).productCode || '-',
          inv.productName,
          (inv as any).specification || '-',
          (inv as any).unit || '-',
          inv.quantity || 0,
          inv.warehouseName || '-',
          (product as any)?.price || 0,
          ((inv.quantity || 0) * ((product as any)?.price || 0)).toFixed(2),
        ];
      });
    } else if (reportType === 'inbound') {
      headers = ['入库单号', '关联单据', '供应商', '总金额', '状态', '创建时间'];
      data = inboundOrders.map((o) => [
        (o as any).inboundNo || o.orderNo,
        (o as any).sourceNo || '-',
        o.supplierName || '-',
        ((o as any).totalAmount?.toFixed(2) || '0.00'),
        o.status,
        o.createTime || '-',
      ]);
    } else if (reportType === 'outbound') {
      headers = ['出库单号', '关联单据', '客户', '总金额', '状态', '创建时间'];
      data = outboundOrders.map((o) => [
        (o as any).outboundNo || o.orderNo,
        (o as any).sourceNo || '-',
        o.customerName || '-',
        ((o as any).totalAmount?.toFixed(2) || '0.00'),
        o.status,
        o.createTime || '-',
      ]);
    } else if (reportType === 'procurement') {
      headers = ['订单编号', '供应商', '总金额', '状态', '创建时间'];
      data = procurementOrders.map((o) => [
        o.orderNo,
        o.supplierName || '-',
        o.details.reduce((sum, d) => sum + (d.amount || 0), 0).toFixed(2),
        o.status,
        o.createTime || '-',
      ]);
    }

    const csvContent = [
      headers,
      ...data.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = reportType + '_report_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.download = fileName;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">数据统计报表</h2>
        <div className="flex gap-2">
          <PrimaryButton onClick={handleExport}>导出CSV</PrimaryButton>
          <DefaultButton onClick={handlePrint}>打印</DefaultButton>
        </div>
      </div>

      {/* 报表类型切换 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'inventory', label: '库存统计' },
          { key: 'inbound', label: '入库统计' },
          { key: 'outbound', label: '出库统计' },
          { key: 'procurement', label: '采购统计' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key as any)}
            className={`px-4 py-2 text-sm rounded ${
              reportType === tab.key
                ? 'bg-[#409eff] text-white'
                : 'bg-[#f5f7fa] text-[#606266] hover:bg-[#e4e8ed]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {reportType === 'inventory' && (
          <>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">商品种类</div>
              <div className="text-2xl font-bold text-[#303133]">{inventoryStats.totalProducts}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">库存总量</div>
              <div className="text-2xl font-bold text-[#303133]">{inventoryStats.totalInventory}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">库存总值</div>
              <div className="text-2xl font-bold text-[#f56c6c]">¥{inventoryStats.totalValue.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">低库存预警</div>
              <div className="text-2xl font-bold text-[#e6a23c]">{inventoryStats.lowStockItems.length}</div>
            </div>
          </>
        )}
        {reportType === 'inbound' && (
          <>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">入库单总数</div>
              <div className="text-2xl font-bold text-[#303133]">{inboundStats.totalOrders}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">入库总金额</div>
              <div className="text-2xl font-bold text-[#67c23a]">¥{inboundStats.totalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">今日入库</div>
              <div className="text-2xl font-bold text-[#303133]">{inboundStats.todayCount}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">待处理</div>
              <div className="text-2xl font-bold text-[#e6a23c]">{inboundStats.pendingCount}</div>
            </div>
          </>
        )}
        {reportType === 'outbound' && (
          <>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">出库单总数</div>
              <div className="text-2xl font-bold text-[#303133]">{outboundStats.totalOrders}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">出库总金额</div>
              <div className="text-2xl font-bold text-[#409eff]">¥{outboundStats.totalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">今日出库</div>
              <div className="text-2xl font-bold text-[#303133]">{outboundStats.todayCount}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">供应商数</div>
              <div className="text-2xl font-bold text-[#303133]">{suppliers.length}</div>
            </div>
          </>
        )}
        {reportType === 'procurement' && (
          <>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">采购订单</div>
              <div className="text-2xl font-bold text-[#303133]">{procurementStats.totalOrders}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">采购金额</div>
              <div className="text-2xl font-bold text-[#f56c6c]">¥{procurementStats.totalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">合同总数</div>
              <div className="text-2xl font-bold text-[#303133]">{procurementStats.totalContracts}</div>
            </div>
            <div className="bg-white p-4 rounded border border-[#dcdfe6]">
              <div className="text-[#909399] text-xs mb-1">合同金额</div>
              <div className="text-2xl font-bold text-[#67c23a]">¥{procurementStats.contractAmount.toLocaleString()}</div>
            </div>
          </>
        )}
      </div>

      {/* 报表表格 */}
      <div className="bg-white rounded border border-[#dcdfe6]">
        <div className="px-4 py-3 border-b border-[#dcdfe6]">
          <h3 className="text-sm font-medium text-[#303133]">
            {reportType === 'inventory' && '库存明细表'}
            {reportType === 'inbound' && '入库记录表'}
            {reportType === 'outbound' && '出库记录表'}
            {reportType === 'procurement' && '采购订单表'}
          </h3>
        </div>
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full">
            <thead className="bg-[#f5f7fa] sticky top-0">
              {reportType === 'inventory' && (
                <tr>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">商品编码</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">商品名称</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">规格</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">单位</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">库存数量</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">仓库</th>
                  <th className="px-4 py-2 text-xs text-right text-[#606266]">单价</th>
                  <th className="px-4 py-2 text-xs text-right text-[#606266]">库存价值</th>
                </tr>
              )}
              {reportType === 'inbound' && (
                <tr>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">入库单号</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">关联单据</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">供应商</th>
                  <th className="px-4 py-2 text-xs text-right text-[#606266]">总金额</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">状态</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">创建时间</th>
                </tr>
              )}
              {reportType === 'outbound' && (
                <tr>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">出库单号</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">关联单据</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">客户</th>
                  <th className="px-4 py-2 text-xs text-right text-[#606266]">总金额</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">状态</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">创建时间</th>
                </tr>
              )}
              {reportType === 'procurement' && (
                <tr>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">订单编号</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">供应商</th>
                  <th className="px-4 py-2 text-xs text-right text-[#606266]">总金额</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">状态</th>
                  <th className="px-4 py-2 text-xs text-left text-[#606266]">创建时间</th>
                </tr>
              )}
            </thead>
            <tbody>
              {reportType === 'inventory' &&
                inventories.map((inv) => {
                  const product = products.find((p) => p.id === inv.productId);
                  return (
                    <tr key={inv.id} className="border-t border-[#ebeef5]">
                      <td className="px-4 py-2 text-xs">{(inv as any).productCode || '-'}</td>
                      <td className="px-4 py-2 text-xs">{inv.productName}</td>
                      <td className="px-4 py-2 text-xs">{(inv as any).specification || '-'}</td>
                      <td className="px-4 py-2 text-xs">{(inv as any).unit || '-'}</td>
                      <td className="px-4 py-2 text-xs">{inv.quantity || 0}</td>
                      <td className="px-4 py-2 text-xs">{inv.warehouseName || '-'}</td>
                      <td className="px-4 py-2 text-xs text-right">¥{((product as any)?.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-2 text-xs text-right">¥{((inv.quantity || 0) * ((product as any)?.price || 0)).toFixed(2)}</td>
                    </tr>
                  );
                })}
              {reportType === 'inbound' &&
                inboundOrders.map((o) => (
                  <tr key={o.id} className="border-t border-[#ebeef5]">
                    <td className="px-4 py-2 text-xs">{(o as any).inboundNo || o.orderNo}</td>
                    <td className="px-4 py-2 text-xs">{(o as any).sourceNo || '-'}</td>
                    <td className="px-4 py-2 text-xs">{o.supplierName || '-'}</td>
                    <td className="px-4 py-2 text-xs text-right">¥{((o as any).totalAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-xs">{o.status}</td>
                    <td className="px-4 py-2 text-xs">{o.createTime || '-'}</td>
                  </tr>
                ))}
              {reportType === 'outbound' &&
                outboundOrders.map((o) => (
                  <tr key={o.id} className="border-t border-[#ebeef5]">
                    <td className="px-4 py-2 text-xs">{(o as any).outboundNo || o.orderNo}</td>
                    <td className="px-4 py-2 text-xs">{(o as any).sourceNo || '-'}</td>
                    <td className="px-4 py-2 text-xs">{o.customerName || '-'}</td>
                    <td className="px-4 py-2 text-xs text-right">¥{((o as any).totalAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-xs">{o.status}</td>
                    <td className="px-4 py-2 text-xs">{o.createTime || '-'}</td>
                  </tr>
                ))}
              {reportType === 'procurement' &&
                procurementOrders.map((o) => (
                  <tr key={o.id} className="border-t border-[#ebeef5]">
                    <td className="px-4 py-2 text-xs">{o.orderNo}</td>
                    <td className="px-4 py-2 text-xs">{o.supplierName || '-'}</td>
                    <td className="px-4 py-2 text-xs text-right">
                      ¥{o.details.reduce((sum, d) => sum + (d.amount || 0), 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-xs">{o.status}</td>
                    <td className="px-4 py-2 text-xs">{o.createTime || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#dcdfe6] text-xs text-[#909399]">
          共 {reportType === 'inventory' ? inventories.length : reportType === 'inbound' ? inboundOrders.length : reportType === 'outbound' ? outboundOrders.length : procurementOrders.length} 条记录
        </div>
      </div>
    </div>
  );
}
