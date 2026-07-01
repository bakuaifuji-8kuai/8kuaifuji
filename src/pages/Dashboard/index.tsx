import { Link } from 'react-router-dom';
import {
  ArrowDownToLine, ArrowUpFromLine, FileText,
  Package, Boxes, ClipboardList
} from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/components/common/Card';
import { useStore } from '@/store/useStore';
import Badge from '@/components/common/Badge';

export default function Dashboard() {
  const { inboundOrders, outboundOrders, inventories } = useStore();

  const todayInbound = inboundOrders.filter(o => o.status === 'submitted').length;
  const todayOutbound = outboundOrders.filter(o => o.status === 'submitted').length;

  const pendingInbound = inboundOrders.filter(o => o.status === 'pending').length;
  const pendingOutbound = outboundOrders.filter(o => o.status === 'pending').length;

  const stats = [
    { title: '今日入库', value: todayInbound, icon: ArrowDownToLine, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: '今日出库', value: todayOutbound, icon: ArrowUpFromLine, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: '库存总数', value: inventories.length, icon: Boxes, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: '待处理单据', value: pendingInbound + pendingOutbound, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const quickActions = [
    { title: '入库登记', icon: ArrowDownToLine, path: '/inbound/purchase', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { title: '出库登记', icon: ArrowUpFromLine, path: '/outbound/sales', color: 'bg-blue-600 hover:bg-blue-700' },
    { title: '库存查询', icon: Boxes, path: '/stock/query', color: 'bg-purple-600 hover:bg-purple-700' },
    { title: '盘点开单', icon: ClipboardList, path: '/stock/check', color: 'bg-amber-600 hover:bg-amber-700' },
    { title: '物资档案', icon: Package, path: '/basic/product', color: 'bg-slate-600 hover:bg-slate-700' },
    { title: '库存报表', icon: FileText, path: '/report/stock', color: 'bg-cyan-600 hover:bg-cyan-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">首页概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 快捷入口 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">快捷入口</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.path}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-colors ${action.color}`}
              >
                <action.icon size={28} />
                <span className="text-sm font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 库存概览和待处理单据 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">库存概览</h2>
            <Link to="/stock/query" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {inventories.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                暂无库存数据
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {inventories.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{inv.productName}</p>
                      <p className="text-xs text-slate-500">{inv.warehouseName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {inv.quantity}
                      </p>
                      <p className="text-xs text-slate-500">库存数量</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* 待处理单据 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">待处理单据</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-200">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <ArrowDownToLine size={20} className="text-emerald-600" />
                  <span className="text-slate-700">待入库单据</span>
                </div>
                <Badge variant="warning">{pendingInbound} 单</Badge>
              </div>
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <ArrowUpFromLine size={20} className="text-blue-600" />
                  <span className="text-slate-700">待出库单据</span>
                </div>
                <Badge variant="warning">{pendingOutbound} 单</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 近期入库单 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">近期入库单</h2>
          <Link to="/inbound/purchase" className="text-sm text-blue-600 hover:underline">
            查看全部
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-slate-700">单据编号</th>
                <th className="px-6 py-3 text-left text-slate-700">类型</th>
                <th className="px-6 py-3 text-left text-slate-700">供应商</th>
                <th className="px-6 py-3 text-left text-slate-700">仓库</th>
                <th className="px-6 py-3 text-left text-slate-700">数量</th>
                <th className="px-6 py-3 text-left text-slate-700">状态</th>
                <th className="px-6 py-3 text-left text-slate-700">日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inboundOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-blue-600">{order.orderNo}</td>
                  <td className="px-6 py-3">
                    {order.type === 'purchase' ? '采购入库' : order.type === 'production' ? '生产入库' : '退货入库'}
                  </td>
                  <td className="px-6 py-3">{order.supplierName || '-'}</td>
                  <td className="px-6 py-3">{order.warehouseName}</td>
                  <td className="px-6 py-3">{order.details.reduce((sum, d) => sum + d.quantity, 0)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={
                      order.status === 'submitted' ? 'success' : 'warning'
                    }>
                      {order.status === 'submitted' ? '已提交' : '待提交'}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">{order.createTime.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
