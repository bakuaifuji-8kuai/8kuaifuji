import { useMemo, useState } from 'react';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { Plus, Search, Check, X, Eye, FileText } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import ProductPickerModal from '@/components/common/ProductPickerModal';
import SearchableSelect from '@/components/common/SearchableSelect';
import { useStore } from '@/store/useStore';
import { generateId } from '@/utils';
import type { InboundApplication, InboundApplicationDetail } from '@/types';

export default function InboundApplicationPage() {
  const inboundApplications = useStore((s) => s.inboundApplications);
  const addInboundApplication = useStore((s) => s.addInboundApplication);
  const updateInboundApplication = useStore((s) => s.updateInboundApplication);
  const deleteInboundApplication = useStore((s) => s.deleteInboundApplication);
  const warehouses = useStore((s) => s.warehouses);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);

  // 搜索和筛选
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  // 编辑中的数据
  const [editingApp, setEditingApp] = useState<InboundApplication | null>(null);
  const [viewingApp, setViewingApp] = useState<InboundApplication | null>(null);
  const [applyingApp, setApplyingApp] = useState<InboundApplication | null>(null);
  const [rejectingApp, setRejectingApp] = useState<InboundApplication | null>(null);
  const [editDetails, setEditDetails] = useState<InboundApplicationDetail[]>([]);
  const [editWarehouseId, setEditWarehouseId] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // 生成申请单号
  const generateApplicationNo = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(inboundApplications.length + 1).padStart(3, '0');
    return `RKSQ${dateStr}${seq}`;
  };

  // 状态文本和颜色
  const statusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-[#e6a23c]';
      case 'approved': return 'text-[#67c23a]';
      case 'rejected': return 'text-[#f56c6c]';
      default: return '';
    }
  };

  const statusBadgeVariant = (status: string): 'warning' | 'success' | 'danger' | 'default' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  // 仓库选项
  const warehouseOptions = warehouses
    .filter((w: any) => w.status === 'enabled')
    .map((w: any) => ({ id: w.id, label: w.name }));

  // 筛选数据
  const filteredData = useMemo(() => {
    return inboundApplications.filter((app) => {
      const matchSearch = !searchText ||
        app.applicationNo.toLowerCase().includes(searchText.toLowerCase()) ||
        app.applicant.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || app.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [inboundApplications, searchText, filterStatus]);

  // 列表列定义
  const columns: ColumnDef<InboundApplication>[] = [
    { accessorKey: 'applicationNo', header: '申请单号' },
    { accessorKey: 'applicant', header: '申请人' },
    { accessorKey: 'applicantDept', header: '申请部门', render: (row) => row.applicantDept || '-' },
    { accessorKey: 'warehouseName', header: '目标仓库', render: (row) => row.warehouseName || '-' },
    {
      accessorKey: 'details',
      header: '物资种类',
      align: 'center',
      render: (row) => row.details.length + ' 种',
    },
    {
      accessorKey: 'totalQuantity',
      header: '总数量',
      align: 'right',
      render: (row) => row.details.reduce((sum, d) => sum + d.quantity, 0),
    },
    {
      accessorKey: 'status',
      header: '状态',
      render: (row) => (
        <Badge variant={statusBadgeVariant(row.status)}>{statusText(row.status)}</Badge>
      ),
    },
    { accessorKey: 'createTime', header: '申请时间' },
    { accessorKey: 'approver', header: '审核人', render: (row) => row.approver || '-' },
    { accessorKey: 'approveTime', header: '审核时间', render: (row) => row.approveTime || '-' },
    {
      accessorKey: 'op',
      header: '操作',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openView(row)}>
            <Eye size={14} />
          </Button>
          {row.status === 'pending' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                编辑
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openApprove(row)}>
                <Check size={14} className="text-green-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openReject(row)}>
                <X size={14} className="text-red-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
                <span className="text-red-500">删除</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // 打开新增
  const openAdd = () => {
    setEditingApp(null);
    setEditDetails([]);
    setEditWarehouseId(warehouses[0]?.id || '');
    setEditRemark('');
    setModalOpen(true);
  };

  // 打开编辑
  const openEdit = (app: InboundApplication) => {
    setEditingApp(app);
    setEditDetails([...app.details]);
    setEditWarehouseId(app.warehouseId || '');
    setEditRemark(app.remark || '');
    setModalOpen(true);
  };

  // 打开查看
  const openView = (app: InboundApplication) => {
    setViewingApp(app);
    setViewModalOpen(true);
  };

  // 打开审核通过
  const openApprove = (app: InboundApplication) => {
    setApplyingApp(app);
    setApproveModalOpen(true);
  };

  // 打开拒绝
  const openReject = (app: InboundApplication) => {
    setRejectingApp(app);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // 处理产品选择
  const handlePickerConfirm = (selected: any[]) => {
    const existingIds = new Set(editDetails.map((d) => d.productId));
    const added = selected
      .filter((p: any) => !existingIds.has(p.id))
      .map((p: any) => ({
        id: generateId(),
        productId: p.id,
        productName: p.name,
        productCode: p.code,
        specification: p.specification || '',
        unit: p.unit || '',
        quantity: 1,
      }));
    setEditDetails([...editDetails, ...added]);
    setProductPickerOpen(false);
  };

  // 更新明细字段
  const updateDetailField = (idx: number, field: keyof InboundApplicationDetail, value: string | number) => {
    const newDetails = [...editDetails];
    (newDetails[idx] as any)[field] = value;
    setEditDetails(newDetails);
  };

  // 删除明细
  const removeDetail = (idx: number) => {
    setEditDetails(editDetails.filter((_, i) => i !== idx));
  };

  // 保存
  const handleSave = () => {
    if (!editWarehouseId) {
      alert('请选择目标仓库');
      return;
    }
    if (editDetails.length === 0) {
      alert('请添加至少一条物资');
      return;
    }
    if (editDetails.some((d) => !d.quantity || d.quantity <= 0)) {
      alert('数量必须大于0');
      return;
    }

    const warehouseName = warehouses.find((w: any) => w.id === editWarehouseId)?.name || '';

    if (editingApp) {
      // 更新
      updateInboundApplication(editingApp.id, {
        warehouseId: editWarehouseId,
        warehouseName,
        remark: editRemark,
        details: editDetails,
      });
    } else {
      // 新增
      const newApp: InboundApplication = {
        id: generateId(),
        applicationNo: generateApplicationNo(),
        applicant: currentUser.name,
        applicantDept: '',
        warehouseId: editWarehouseId,
        warehouseName,
        status: 'pending',
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        remark: editRemark,
        details: editDetails,
      };
      addInboundApplication(newApp);
    }

    setModalOpen(false);
  };

  // 审核通过
  const handleApprove = () => {
    if (!applyingApp) return;

    updateInboundApplication(applyingApp.id, {
      status: 'approved',
      approver: currentUser.name,
      approveTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });

    setApproveModalOpen(false);
    setApplyingApp(null);
  };

  // 拒绝
  const handleReject = () => {
    if (!rejectingApp) return;
    if (!rejectReason.trim()) {
      alert('请输入拒绝原因');
      return;
    }

    updateInboundApplication(rejectingApp.id, {
      status: 'rejected',
      approver: currentUser.name,
      approveTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      rejectReason: rejectReason.trim(),
    });

    setRejectModalOpen(false);
    setRejectingApp(null);
    setRejectReason('');
  };

  // 删除
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条申请吗？')) {
      deleteInboundApplication(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">入库申请</h1>
        <Button onClick={openAdd}>
          <Plus size={16} />
          新增入库申请
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索申请单号/申请人..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 w-64 h-8 px-3 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-[140px] h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-white focus:outline-none focus:border-[#2f54eb]"
            >
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable data={filteredData} columns={columns} pageSize={15} />
        </CardBody>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApp ? '编辑入库申请' : '新增入库申请'}
        size="max-w-4xl"
      >
        <div className="space-y-4 min-w-[700px]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-[#303133] mb-1">申请单号</div>
              <input
                type="text"
                disabled
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399]"
                value={editingApp?.applicationNo || generateApplicationNo()}
              />
            </div>
            <div>
              <div className="text-sm font-medium text-[#303133] mb-1">申请人</div>
              <input
                type="text"
                disabled
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399]"
                value={editingApp?.applicant || currentUser.name}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-[#303133] mb-1">目标仓库 *</div>
              <SearchableSelect
                options={warehouseOptions}
                value={editWarehouseId}
                onChange={(val, opt) => {
                  setEditWarehouseId(val);
                }}
                placeholder="请选择仓库"
                width="w-full"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-[#303133] mb-1">备注</div>
              <input
                type="text"
                className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
                value={editRemark}
                onChange={(e) => setEditRemark(e.target.value)}
                placeholder="请输入备注"
              />
            </div>
          </div>

          {/* 物资明细 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-[#303133]">物资明细 *</div>
              <Button size="sm" onClick={() => setProductPickerOpen(true)}>
                <Plus size={14} />
                添加物资
              </Button>
            </div>

            {editDetails.length === 0 ? (
              <div className="text-center py-8 text-[#909399] border border-dashed border-[#dcdfe6] rounded">
                暂无物资，请点击"添加物资"按钮添加
              </div>
            ) : (
              <div className="border border-[#dcdfe6] rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">物资编码</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">物资名称</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">规格</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">单位</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266] w-24">申请数量</th>
                      <th className="px-3 py-2 text-center font-medium text-[#606266] w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editDetails.map((detail, idx) => (
                      <tr key={detail.id} className="border-t border-[#dcdfe6]">
                        <td className="px-3 py-2">{detail.productCode}</td>
                        <td className="px-3 py-2">{detail.productName}</td>
                        <td className="px-3 py-2">{detail.specification || '-'}</td>
                        <td className="px-3 py-2">{detail.unit || '-'}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            className="w-full h-7 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
                            value={detail.quantity}
                            onChange={(e) => updateDetailField(idx, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeDetail(idx)}
                            className="text-[#f56c6c] hover:text-[#f78989]"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      {/* 查看弹窗 */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="入库申请详情"
        size="max-w-4xl"
      >
        {viewingApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[#909399]">申请单号：</span>
                <span className="font-medium">{viewingApp.applicationNo}</span>
              </div>
              <div>
                <span className="text-[#909399]">申请人：</span>
                <span className="font-medium">{viewingApp.applicant}</span>
              </div>
              <div>
                <span className="text-[#909399]">申请部门：</span>
                <span>{viewingApp.applicantDept || '-'}</span>
              </div>
              <div>
                <span className="text-[#909399]">目标仓库：</span>
                <span>{viewingApp.warehouseName || '-'}</span>
              </div>
              <div>
                <span className="text-[#909399]">申请时间：</span>
                <span>{viewingApp.createTime}</span>
              </div>
              <div>
                <span className="text-[#909399]">状态：</span>
                <Badge variant={statusBadgeVariant(viewingApp.status)}>{statusText(viewingApp.status)}</Badge>
              </div>
              {viewingApp.approver && (
                <>
                  <div>
                    <span className="text-[#909399]">审核人：</span>
                    <span>{viewingApp.approver}</span>
                  </div>
                  <div>
                    <span className="text-[#909399]">审核时间：</span>
                    <span>{viewingApp.approveTime}</span>
                  </div>
                </>
              )}
              {viewingApp.rejectReason && (
                <div className="col-span-3">
                  <span className="text-[#909399]">拒绝原因：</span>
                  <span className="text-[#f56c6c]">{viewingApp.rejectReason}</span>
                </div>
              )}
              {viewingApp.remark && (
                <div className="col-span-3">
                  <span className="text-[#909399]">备注：</span>
                  <span>{viewingApp.remark}</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-[#303133] mb-2">物资明细</div>
              <div className="border border-[#dcdfe6] rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f7fa]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">物资编码</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">物资名称</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">规格</th>
                      <th className="px-3 py-2 text-left font-medium text-[#606266]">单位</th>
                      <th className="px-3 py-2 text-right font-medium text-[#606266]">申请数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingApp.details.map((detail) => (
                      <tr key={detail.id} className="border-t border-[#dcdfe6]">
                        <td className="px-3 py-2">{detail.productCode}</td>
                        <td className="px-3 py-2">{detail.productName}</td>
                        <td className="px-3 py-2">{detail.specification || '-'}</td>
                        <td className="px-3 py-2">{detail.unit || '-'}</td>
                        <td className="px-3 py-2 text-right">{detail.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setViewModalOpen(false)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 审核通过弹窗 */}
      <Modal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="审核入库申请"
        size="max-w-md"
      >
        {applyingApp && (
          <div className="space-y-4">
            <div className="text-sm text-[#606266]">
              <p>确认通过入库申请 <span className="font-medium text-[#303133]">{applyingApp.applicationNo}</span>？</p>
              <p className="mt-2">通过后可在采购入库的"新增入库申请入库"中选择此申请单进行入库操作。</p>
            </div>

            <div className="bg-[#f5f7fa] p-3 rounded text-sm">
              <div className="text-[#909399] mb-1">申请信息</div>
              <div>申请人：{applyingApp.applicant}</div>
              <div>目标仓库：{applyingApp.warehouseName}</div>
              <div>物资种类：{applyingApp.details.length} 种</div>
              <div>总数量：{applyingApp.details.reduce((sum, d) => sum + d.quantity, 0)}</div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleApprove}>
                <Check size={14} />
                确认通过
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 拒绝弹窗 */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="拒绝入库申请"
        size="max-w-md"
      >
        {rejectingApp && (
          <div className="space-y-4">
            <div className="text-sm text-[#606266]">
              <p>请输入拒绝原因：</p>
            </div>

            <div>
              <textarea
                className="w-full h-24 px-2 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb] resize-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleReject}>
                <X size={14} />
                确认拒绝
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 产品选择弹窗 */}
      <ProductPickerModal
        open={productPickerOpen}
        onClose={() => setProductPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        products={products}
      />
    </div>
  );
}
