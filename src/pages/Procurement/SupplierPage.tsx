import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { Supplier, SupplierQualification, SupplierChangeRequest, SupplierChangeItem, QualificationType, ChangeFieldKey, Attachment } from '@/types';

// 纸质证书类型字典
const QUALIFICATION_TYPE_OPTIONS: { value: QualificationType; label: string }[] = [
  { value: 'business_license', label: '营业执照' },
  { value: 'tax_registration', label: '税务登记证' },
  { value: 'organization_code', label: '组织机构代码证' },
  { value: 'quality_certification', label: 'ISO质量管理体系认证' },
  { value: 'environmental_certification', label: 'ISO环境管理体系认证' },
  { value: 'safety_production', label: '安全生产许可证' },
  { value: 'construction_qualification', label: '建筑业企业资质证书' },
  { value: 'professional_qualification', label: '专业资质证书' },
  { value: 'bank_credit', label: '银行资信证明' },
  { value: 'other', label: '其他纸质证书' },
];

const FIELD_NAME_MAP: Record<ChangeFieldKey, string> = {
  name: '供应商名称',
  code: '供应商编码',
  contact: '联系人',
  phone: '联系电话',
  address: '地址',
  unifiedSocialCreditCode: '统一社会信用代码',
  registeredAddress: '注册地址',
  bankAccount: '银行账户',
  businessScope: '经营范围',
  managementDepartment: '归口管理部门',
  qualification: '资质证书',
};

const DEPARTMENT_OPTIONS = ['采购部', '工程部', '财务部', '综合管理部', '会展部', '招标部'];

// 计算资质预警状态
function getQualificationWarning(expiryDate?: string, isPermanent?: boolean) {
  if (isPermanent || !expiryDate) return { level: 'normal', label: '有效', color: 'text-[#67c23a]' };
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { level: 'expired', label: `已过期 ${Math.abs(diffDays)}天`, color: 'text-[#f56c6c]', diffDays };
  if (diffDays <= 30) return { level: 'danger', label: `即将到期 ${diffDays}天`, color: 'text-[#f56c6c]', diffDays };
  if (diffDays <= 60) return { level: 'warning', label: `${diffDays}天内到期`, color: 'text-[#e6a23c]', diffDays };
  return { level: 'normal', label: '有效', color: 'text-[#67c23a]', diffDays };
}

export default function SupplierPage() {
  const suppliers = useStore((s) => s.suppliers);
  const addSupplier = useStore((s) => s.addSupplier);
  const updateSupplier = useStore((s) => s.updateSupplier);
  const deleteSupplier = useStore((s) => s.deleteSupplier);
  const supplierQualifications = useStore((s) => s.supplierQualifications);
  const addSupplierQualification = useStore((s) => s.addSupplierQualification);
  const updateSupplierQualification = useStore((s) => s.updateSupplierQualification);
  const deleteSupplierQualification = useStore((s) => s.deleteSupplierQualification);
  const supplierChangeRequests = useStore((s) => s.supplierChangeRequests);
  const addSupplierChangeRequest = useStore((s) => s.addSupplierChangeRequest);
  const updateSupplierChangeRequest = useStore((s) => s.updateSupplierChangeRequest);
  const currentUser = useStore((s) => s.currentUser);

  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterWarning, setFilterWarning] = useState('');
  const [applied, setApplied] = useState({ name: '', code: '', dept: '', warning: '' });

  // 重复检测
  const [dupError, setDupError] = useState<string>('');

  const filteredData = useMemo(() => {
    return suppliers.filter((s) => {
      if (applied.name && !s.name.includes(applied.name)) return false;
      if (applied.code && !(s.code || '').includes(applied.code)) return false;
      if (applied.dept && s.managementDepartment !== applied.dept) return false;
      if (applied.warning) {
        const quals = supplierQualifications.filter(q => q.supplierId === s.id);
        if (applied.warning === 'has_warning') {
          const hasWarning = quals.some(q => {
            const w = getQualificationWarning(q.expiryDate, q.isPermanent);
            return w.level === 'danger' || w.level === 'expired';
          });
          if (!hasWarning) return false;
        }
        if (applied.warning === 'no_cert') {
          if (quals.length > 0) return false;
        }
      }
      return true;
    });
  }, [suppliers, applied, supplierQualifications]);

  // 资质预警汇总（用于顶部提示）
  const warningSummary = useMemo(() => {
    let expiredCount = 0;
    let dangerCount = 0;
    let warningCount = 0;
    supplierQualifications.forEach(q => {
      const w = getQualificationWarning(q.expiryDate, q.isPermanent);
      if (w.level === 'expired') expiredCount++;
      else if (w.level === 'danger') dangerCount++;
      else if (w.level === 'warning') warningCount++;
    });
    return { expiredCount, dangerCount, warningCount, total: supplierQualifications.length };
  }, [supplierQualifications]);

  const columns: ColumnDef<Supplier>[] = [
    { key: 'code', title: '供应商编码' },
    { key: 'name', title: '供应商名称' },
    {
      key: 'managementDepartment',
      title: '归口管理部门',
      render: (row) => <span className="text-[#606266]">{row.managementDepartment || '-'}</span>,
    },
    {
      key: 'unifiedSocialCreditCode',
      title: '统一社会信用代码',
      render: (row) => row.unifiedSocialCreditCode || '-',
    },
    { key: 'contact', title: '联系人', render: (row) => row.contact || '-' },
    { key: 'phone', title: '电话', render: (row) => row.phone || '-' },
    {
      key: 'qualification',
      title: '资质证书',
      render: (row) => {
        const quals = supplierQualifications.filter(q => q.supplierId === row.id);
        if (quals.length === 0) return <span className="text-[#e6a23c]">未上传</span>;
        const hasWarning = quals.some(q => ['danger', 'expired'].includes(getQualificationWarning(q.expiryDate, q.isPermanent).level));
        return (
          <div>
            <span>共 {quals.length} 项</span>
            {hasWarning && <span className="ml-2 text-[#f56c6c]">⚠ 有预警</span>}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => (
        <span className={row.status === 'enabled' ? 'text-[#67c23a]' : 'text-[#909399]'}>
          {row.status === 'enabled' ? '启用' : '停用'}
        </span>
      ),
    },
    {
      key: 'op',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2">
          <TextButton onClick={() => setViewItem(row)}>详情</TextButton>
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton onClick={() => openQualification(row)}>资质管理</TextButton>
          <TextButton onClick={() => openChangeRequest(row)}>变更申请</TextButton>
          <TextButton onClick={() => viewChangeHistory(row)}>变更记录</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除供应商 ${row.name}？`)) deleteSupplier(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [viewItem, setViewItem] = useState<Supplier | null>(null);
  const [editQualifications, setEditQualifications] = useState<SupplierQualification[]>([]);
  const [qualificationModalOpen, setQualificationModalOpen] = useState(false);
  const [qualificationSupplier, setQualificationSupplier] = useState<Supplier | null>(null);
  const [editQualificationItem, setEditQualificationItem] = useState<SupplierQualification | null>(null);
  const [changeRequestOpen, setChangeRequestOpen] = useState(false);
  const [changeRequestSupplier, setChangeRequestSupplier] = useState<Supplier | null>(null);
  const [changeHistoryOpen, setChangeHistoryOpen] = useState(false);
  const [changeHistorySupplier, setChangeHistorySupplier] = useState<Supplier | null>(null);

  // ============ 新增/编辑供应商 ============
  const openAdd = () => {
    const newItem: Supplier = {
      id: 'SUP' + Date.now(),
      code: '',
      name: '',
      contact: '',
      phone: '',
      address: '',
      status: 'enabled',
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      creator: currentUser.name,
    };
    setIsNew(true);
    setDupError('');
    setEditItem(newItem);
  };

  const handleSave = () => {
    if (!editItem) return;
    // 重复检测
    const dup = suppliers.find(s =>
      s.id !== editItem.id && (
        (editItem.name && s.name === editItem.name) ||
        (editItem.unifiedSocialCreditCode && s.unifiedSocialCreditCode === editItem.unifiedSocialCreditCode)
      )
    );
    if (dup) {
      let msg = '⚠ 系统检测到重复供应商：\n';
      if (editItem.name && dup.name === editItem.name) msg += `• 供应商名称"${editItem.name}"已存在\n`;
      if (editItem.unifiedSocialCreditCode && dup.unifiedSocialCreditCode === editItem.unifiedSocialCreditCode) msg += `• 统一社会信用代码"${editItem.unifiedSocialCreditCode}"已存在\n`;
      msg += '\n不允许提交，请修改后再试。';
      setDupError(msg);
      alert(msg);
      return;
    }
    setDupError('');
    if (isNew) {
      addSupplier(editItem);
    } else {
      updateSupplier(editItem.id, editItem);
    }
    setEditItem(null);
  };

  // ============ 资质证书管理 ============
  const openQualification = (supplier: Supplier) => {
    setQualificationSupplier(supplier);
    setEditQualifications(supplierQualifications.filter(q => q.supplierId === supplier.id));
    setQualificationModalOpen(true);
  };

  const addQualification = () => {
    if (!qualificationSupplier) return;
    const newQual: SupplierQualification = {
      id: 'QUAL' + Date.now(),
      supplierId: qualificationSupplier.id,
      supplierName: qualificationSupplier.name,
      type: 'business_license',
      typeName: '营业执照',
      certificateNo: '',
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setEditQualificationItem(newQual);
  };

  const editQualification = (q: SupplierQualification) => {
    setEditQualificationItem({ ...q });
    setQualificationFiles(q.attachment ? [q.attachment] : []);
  };

  // 资质证书文件上传处理
  const handleQualificationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: Attachment[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newFiles.push({
          id: 'ATT' + Date.now() + Math.random().toString(36).slice(2, 8),
          fileName: file.name,
          filePath: reader.result as string,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
        if (newFiles.length === files.length) {
          setQualificationFiles([...qualificationFiles, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeQualificationFile = (fileId: string) => {
    setQualificationFiles(qualificationFiles.filter(f => f.id !== fileId));
  };

  const [qualificationFiles, setQualificationFiles] = useState<Attachment[]>([]);

  const deleteQualification = (q: SupplierQualification) => {
    if (!confirm(`确认删除资质证书「${q.typeName}」？`)) return;
    deleteSupplierQualification(q.id);
    if (qualificationSupplier) {
      setEditQualifications(supplierQualifications.filter(qq => qq.supplierId === qualificationSupplier.id));
    }
  };

  const handleSaveQualification = () => {
    if (!editQualificationItem) return;
    // 简单校验
    if (!editQualificationItem.certificateNo) {
      alert('证书编号必填');
      return;
    }
    if (!editQualificationItem.isPermanent && !editQualificationItem.expiryDate) {
      alert('有效期至必填（或勾选"长期有效"）');
      return;
    }
    // 合并附件数据
    const itemToSave = {
      ...editQualificationItem,
      attachment: qualificationFiles.length > 0 ? qualificationFiles[0] : undefined,
    };
    const exists = supplierQualifications.some(q => q.id === editQualificationItem.id);
    if (exists) {
      updateSupplierQualification(editQualificationItem.id, itemToSave);
    } else {
      addSupplierQualification(itemToSave);
    }
    if (qualificationSupplier) {
      // 刷新列表
      setTimeout(() => {
        setEditQualifications(supplierQualifications.filter(q => q.supplierId === qualificationSupplier!.id));
      }, 0);
    }
    setEditQualificationItem(null);
    setQualificationFiles([]);
  };

  // ============ 变更申请 ============
  const [changeForm, setChangeForm] = useState<{
    reason: string;
    items: SupplierChangeItem[];
    attachments: Attachment[];
  }>({ reason: '', items: [], attachments: [] });

  const openChangeRequest = (supplier: Supplier) => {
    setChangeRequestSupplier(supplier);
    setChangeForm({
      reason: '',
      items: [],
      attachments: [],
    });
    setChangeRequestOpen(true);
  };

  const viewChangeHistory = (supplier: Supplier) => {
    setChangeHistorySupplier(supplier);
    setChangeHistoryOpen(true);
  };

  const addChangeItem = () => {
    const item: SupplierChangeItem = { field: 'name', fieldName: '供应商名称', oldValue: '', newValue: '' };
    setChangeForm({ ...changeForm, items: [...changeForm.items, item] });
  };

  const removeChangeItem = (idx: number) => {
    const newItems = changeForm.items.filter((_, i) => i !== idx);
    setChangeForm({ ...changeForm, items: newItems });
  };

  const updateChangeItemField = (idx: number, field: ChangeFieldKey, fieldName: string) => {
    const newItems = [...changeForm.items];
    newItems[idx] = { ...newItems[idx], field, fieldName };
    setChangeForm({ ...changeForm, items: newItems });
  };

  const updateChangeItemValue = (idx: number, key: 'oldValue' | 'newValue', value: string) => {
    const newItems = [...changeForm.items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setChangeForm({ ...changeForm, items: newItems });
  };

  const handleSubmitChangeRequest = () => {
    if (!changeRequestSupplier) return;
    if (!changeForm.reason.trim()) {
      alert('请填写变更原因');
      return;
    }
    if (changeForm.items.length === 0) {
      alert('请至少添加一项变更内容');
      return;
    }
    for (const item of changeForm.items) {
      if (!item.oldValue.trim() || !item.newValue.trim()) {
        alert('请完整填写每项变更的原值和新值');
        return;
      }
    }
    const req: SupplierChangeRequest = {
      id: 'SCR' + Date.now(),
      supplierId: changeRequestSupplier.id,
      supplierName: changeRequestSupplier.name,
      applicant: currentUser.name,
      applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      changes: changeForm.items,
      reason: changeForm.reason,
      attachments: changeForm.attachments,
      status: 'pending',
    };
    addSupplierChangeRequest(req);
    alert('变更申请已提交，等待审批');
    setChangeRequestOpen(false);
  };

  const handleApproveChangeRequest = (req: SupplierChangeRequest, approved: boolean) => {
    if (approved) {
      // 审批通过：更新供应商信息
      const updates: Partial<Supplier> = {};
      req.changes.forEach(c => {
        if (c.field !== 'qualification') {
          (updates as any)[c.field] = c.newValue;
        }
      });
      updateSupplier(req.supplierId, updates);
      updateSupplierChangeRequest(req.id, {
        status: 'approved',
        approver: currentUser.name,
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      });
      alert('变更审批通过，供应商信息已更新');
    } else {
      const remark = prompt('请填写驳回意见：');
      if (remark === null) return;
      updateSupplierChangeRequest(req.id, {
        status: 'rejected',
        approver: currentUser.name,
        approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        approveRemark: remark,
      });
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">供应商管理</h2>
        <PrimaryButton onClick={openAdd}>+ 新增供应商</PrimaryButton>
      </div>

      {/* 资质预警汇总 */}
      {(warningSummary.expiredCount > 0 || warningSummary.dangerCount > 0 || warningSummary.warningCount > 0) && (
        <div className="border border-[#f56c6c] rounded p-3 bg-[#fef0f0]">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#f56c6c] font-semibold">⚠ 资质证书预警：</span>
            <span>共 <b className="text-[#f56c6c]">{warningSummary.total}</b> 份证书</span>
            {warningSummary.expiredCount > 0 && <span className="text-[#f56c6c]">已过期 {warningSummary.expiredCount} 份</span>}
            {warningSummary.dangerCount > 0 && <span className="text-[#f56c6c]">30天内到期 {warningSummary.dangerCount} 份</span>}
            {warningSummary.warningCount > 0 && <span className="text-[#e6a23c]">60天内到期 {warningSummary.warningCount} 份</span>}
            <span className="text-[#909399]">（系统已自动向供应商归口管理部门发送预警通知，请及时处理）</span>
          </div>
        </div>
      )}

      <SearchBar
        onSearch={() => setApplied({ name: filterName, code: filterCode, dept: filterDept, warning: filterWarning })}
        onReset={() => {
          setFilterName('');
          setFilterCode('');
          setFilterDept('');
          setFilterWarning('');
          setApplied({ name: '', code: '', dept: '', warning: '' });
        }}
      >
        <SearchField label="供应商名称" placeholder="请输入" value={filterName} onChange={setFilterName} />
        <SearchField label="供应商编码" placeholder="请输入" value={filterCode} onChange={setFilterCode} />
        <SearchField
          label="归口管理部门"
          value={filterDept}
          onChange={setFilterDept}
          type="select"
          options={[{ value: '', label: '全部' }, ...DEPARTMENT_OPTIONS.map(d => ({ value: d, label: d }))]}
        />
        <SearchField
          label="资质状态"
          value={filterWarning}
          onChange={setFilterWarning}
          type="select"
          options={[
            { value: '', label: '全部' },
            { value: 'has_warning', label: '有预警（30天内/已过期）' },
            { value: 'no_cert', label: '未上传证书' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* ============ 新增/编辑供应商 ============ */}
      <Modal
        open={!!editItem}
        title={isNew ? '新增供应商' : '编辑供应商'}
        onClose={() => { setEditItem(null); setDupError(''); }}
        footer={
          <>
            <DefaultButton onClick={() => { setEditItem(null); setDupError(''); }}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="700px"
      >
        {editItem && (
          <div className="space-y-3">
            {dupError && (
              <div className="border border-[#f56c6c] bg-[#fef0f0] text-[#f56c6c] p-2 rounded text-xs whitespace-pre-line">
                {dupError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">供应商编码</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.code}
                  onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">供应商名称 <span className="text-[#f56c6c]">*</span></div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">联系人</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.contact || ''}
                  onChange={(e) => setEditItem({ ...editItem, contact: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">电话</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.phone || ''}
                  onChange={(e) => setEditItem({ ...editItem, phone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <div className="mb-1 text-[#606266]">统一社会信用代码</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.unifiedSocialCreditCode || ''}
                  onChange={(e) => setEditItem({ ...editItem, unifiedSocialCreditCode: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <div className="mb-1 text-[#606266]">归口管理部门</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.managementDepartment || ''}
                  onChange={(e) => setEditItem({ ...editItem, managementDepartment: e.target.value })}
                >
                  <option value="">请选择</option>
                  {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">状态</div>
                <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                >
                  <option value="enabled">启用</option>
                  <option value="disabled">停用</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[#606266]">注册地址</div>
                <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editItem.registeredAddress || ''}
                  onChange={(e) => setEditItem({ ...editItem, registeredAddress: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">经营范围</div>
              <textarea className="w-full h-16 px-2 border border-[#dcdfe6] rounded"
                value={editItem.businessScope || ''}
                onChange={(e) => setEditItem({ ...editItem, businessScope: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">地址</div>
              <textarea className="w-full h-16 px-2 border border-[#dcdfe6] rounded"
                value={editItem.address || ''}
                onChange={(e) => setEditItem({ ...editItem, address: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">银行账户</div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editItem.bankAccount || ''}
                onChange={(e) => setEditItem({ ...editItem, bankAccount: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ============ 供应商详情 ============ */}
      <Modal
        open={!!viewItem}
        title="供应商详情"
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="800px"
      >
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[#909399]">供应商编码：</span>{viewItem.code}</div>
              <div><span className="text-[#909399]">供应商名称：</span>{viewItem.name}</div>
              <div><span className="text-[#909399]">联系人：</span>{viewItem.contact || '-'}</div>
              <div><span className="text-[#909399]">电话：</span>{viewItem.phone || '-'}</div>
              <div><span className="text-[#909399]">统一社会信用代码：</span>{viewItem.unifiedSocialCreditCode || '-'}</div>
              <div><span className="text-[#909399]">归口管理部门：</span>{viewItem.managementDepartment || '-'}</div>
              <div><span className="text-[#909399]">状态：</span>{viewItem.status === 'enabled' ? '启用' : '停用'}</div>
              <div><span className="text-[#909399]">创建时间：</span>{viewItem.createTime || '-'}</div>
            </div>
            <div>
              <span className="text-[#909399]">经营范围：</span>
              <p>{viewItem.businessScope || '-'}</p>
            </div>
            <div>
              <span className="text-[#909399]">地址：</span>
              <p>{viewItem.address || '-'}</p>
            </div>
            <div>
              <span className="text-[#909399]">银行账户：</span>
              <p>{viewItem.bankAccount || '-'}</p>
            </div>
            <div className="border border-[#dcdfe6] rounded p-3">
              <div className="text-sm font-semibold text-[#303133] mb-2">资质证书</div>
              {(() => {
                const quals = supplierQualifications.filter(q => q.supplierId === viewItem.id);
                if (quals.length === 0) return <div className="text-xs text-[#909399] text-center py-3">暂无资质证书</div>;
                return (
                  <table className="w-full text-xs">
                    <thead className="bg-[#f5f7fa]">
                      <tr>
                        <th className="px-2 py-1 text-left">类型</th>
                        <th className="px-2 py-1 text-left">证书编号</th>
                        <th className="px-2 py-1 text-left">颁发机构</th>
                        <th className="px-2 py-1 text-left">颁发日期</th>
                        <th className="px-2 py-1 text-left">有效期至</th>
                        <th className="px-2 py-1 text-left">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quals.map(q => {
                        const w = getQualificationWarning(q.expiryDate, q.isPermanent);
                        return (
                          <tr key={q.id} className="border-t border-[#ebeef5]">
                            <td className="px-2 py-1">{q.typeName}</td>
                            <td className="px-2 py-1">{q.certificateNo}</td>
                            <td className="px-2 py-1">{q.issuingAuthority || '-'}</td>
                            <td className="px-2 py-1">{q.issueDate || '-'}</td>
                            <td className="px-2 py-1">{q.isPermanent ? '长期有效' : (q.expiryDate || '-')}</td>
                            <td className={'px-2 py-1 font-semibold ' + w.color}>{w.label}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* ============ 资质证书管理弹窗 ============ */}
      <Modal
        open={qualificationModalOpen}
        title={`资质证书管理 - ${qualificationSupplier?.name || ''}`}
        onClose={() => setQualificationModalOpen(false)}
        footer={<DefaultButton onClick={() => setQualificationModalOpen(false)}>关闭</DefaultButton>}
        width="1000px"
      >
        {qualificationSupplier && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#909399]">管理纸质证书，系统将根据有效期自动预警（已过期红色，30天内到期红色，60天内到期橙色）</span>
              <PrimaryButton onClick={addQualification}>+ 新增资质证书</PrimaryButton>
            </div>
            {editQualifications.length === 0 ? (
              <div className="text-center text-[#909399] text-sm py-6 border border-dashed border-[#dcdfe6] rounded bg-[#f5f7fa]">
                暂无资质证书，请点击上方按钮新增
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#f5f7fa] sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left">证书类型</th>
                    <th className="px-2 py-1 text-left">证书编号</th>
                    <th className="px-2 py-1 text-left">颁发机构</th>
                    <th className="px-2 py-1 text-left">有效期至</th>
                    <th className="px-2 py-1 text-left">状态</th>
                    <th className="px-2 py-1 text-left">证书扫描件</th>
                    <th className="px-2 py-1 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {editQualifications.map(q => {
                    const w = getQualificationWarning(q.expiryDate, q.isPermanent);
                    return (
                      <tr key={q.id} className="border-t border-[#ebeef5]">
                        <td className="px-2 py-1">{q.typeName}</td>
                        <td className="px-2 py-1">{q.certificateNo}</td>
                        <td className="px-2 py-1">{q.issuingAuthority || '-'}</td>
                        <td className="px-2 py-1">{q.isPermanent ? '长期有效' : (q.expiryDate || '-')}</td>
                        <td className={'px-2 py-1 font-semibold ' + w.color}>{w.label}</td>
                        <td className="px-2 py-1">
                          {q.attachment ? (
                            <a
                              href={q.attachment.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#409eff] hover:underline flex items-center gap-1"
                              title={q.attachment.fileName}
                            >
                              <span>📄</span>
                              <span className="truncate max-w-[100px]">{q.attachment.fileName}</span>
                            </a>
                          ) : (
                            <span className="text-[#c0c4cc]">未上传</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          <TextButton onClick={() => editQualification(q)}>编辑</TextButton>
                          <TextButton type="danger" onClick={() => deleteQualification(q)}>删除</TextButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>

      {/* ============ 新增/编辑资质证书弹窗 ============ */}
      <Modal
        open={!!editQualificationItem}
        title={editQualificationItem && supplierQualifications.some(q => q.id === editQualificationItem.id) ? '编辑资质证书' : '新增资质证书'}
        onClose={() => setEditQualificationItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setEditQualificationItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSaveQualification}>保存</PrimaryButton>
          </>
        }
        width="600px"
      >
        {editQualificationItem && (
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-[#606266]">证书类型 <span className="text-[#f56c6c]">*</span></div>
              <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editQualificationItem.type}
                onChange={(e) => {
                  const type = e.target.value as QualificationType;
                  const typeName = QUALIFICATION_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;
                  setEditQualificationItem({ ...editQualificationItem, type, typeName });
                }}
              >
                {QUALIFICATION_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">证书编号 <span className="text-[#f56c6c]">*</span></div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editQualificationItem.certificateNo}
                onChange={(e) => setEditQualificationItem({ ...editQualificationItem, certificateNo: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-[#606266]">颁发机构</div>
              <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                value={editQualificationItem.issuingAuthority || ''}
                onChange={(e) => setEditQualificationItem({ ...editQualificationItem, issuingAuthority: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-[#606266]">颁发日期</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editQualificationItem.issueDate || ''}
                  onChange={(e) => setEditQualificationItem({ ...editQualificationItem, issueDate: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-[#606266]">有效期至</div>
                <input type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded"
                  value={editQualificationItem.expiryDate || ''}
                  disabled={editQualificationItem.isPermanent}
                  onChange={(e) => setEditQualificationItem({ ...editQualificationItem, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox"
                  checked={editQualificationItem.isPermanent || false}
                  onChange={(e) => setEditQualificationItem({ ...editQualificationItem, isPermanent: e.target.checked })}
                />
                <span>该证书长期有效（无需填写有效期）</span>
              </label>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">备注</div>
              <textarea className="w-full h-16 px-2 border border-[#dcdfe6] rounded"
                value={editQualificationItem.remark || ''}
                onChange={(e) => setEditQualificationItem({ ...editQualificationItem, remark: e.target.value })}
              />
            </div>
            {/* 证书扫描件上传 */}
            <div>
              <div className="mb-1 text-[#606266]">证书扫描件</div>
              <div className="border border-dashed border-[#dcdfe6] rounded p-3 bg-[#fafafa]">
                {qualificationFiles.length > 0 ? (
                  <div className="space-y-2">
                    {qualificationFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-white border border-[#e4e7ed] rounded p-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[#409eff]">📄</span>
                          <span className="text-xs text-[#606266] truncate max-w-[280px]" title={file.fileName}>{file.fileName}</span>
                          <span className="text-xs text-[#909399]">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TextButton type="danger" size="small" onClick={() => removeQualificationFile(file.id)}>删除</TextButton>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#ebeef5]">
                      <label className="inline-flex items-center gap-1 text-xs text-[#409eff] cursor-pointer hover:text-[#66b1ff]">
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handleQualificationFileChange} />
                        <span>+ 继续添加</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-[#f5f7fa] rounded transition-colors">
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handleQualificationFileChange} />
                    <span className="text-2xl text-[#c0c4cc] mb-1">+</span>
                    <span className="text-xs text-[#909399]">点击上传证书扫描件</span>
                    <span className="text-xs text-[#c0c4cc]">支持 JPG、PNG、PDF、DOC 格式</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============ 变更申请弹窗 ============ */}
      <Modal
        open={changeRequestOpen}
        title={`供应商变更申请 - ${changeRequestSupplier?.name || ''}`}
        onClose={() => setChangeRequestOpen(false)}
        footer={
          <>
            <DefaultButton onClick={() => setChangeRequestOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSubmitChangeRequest}>提交审批</PrimaryButton>
          </>
        }
        width="900px"
      >
        {changeRequestSupplier && (
          <div className="space-y-3">
            <div className="border border-[#409eff] rounded p-3 bg-[#ecf5ff]">
              <div className="text-xs text-[#606266]">
                <span className="font-semibold">变更规则：</span>
                已存在供应商的关键信息（名称、信用代码、联系方式等）不可直接修改，需通过变更申请流程，经审批通过后系统自动更新。
              </div>
            </div>
            <div>
              <div className="mb-1 text-[#606266]">变更原因 <span className="text-[#f56c6c]">*</span></div>
              <textarea className="w-full h-16 px-2 border border-[#dcdfe6] rounded"
                placeholder="请填写变更原因（如：营业执照变更、业务调整等）"
                value={changeForm.reason}
                onChange={(e) => setChangeForm({ ...changeForm, reason: e.target.value })}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#606266] font-semibold">变更内容</span>
                <PrimaryButton onClick={addChangeItem}>+ 添加变更项</PrimaryButton>
              </div>
              {changeForm.items.length === 0 ? (
                <div className="text-center text-[#909399] text-sm py-4 border border-dashed border-[#dcdfe6] rounded bg-[#f5f7fa]">
                  请点击「+ 添加变更项」添加需要变更的内容
                </div>
              ) : (
                <div className="space-y-2">
                  {changeForm.items.map((item, idx) => (
                    <div key={idx} className="border border-[#dcdfe6] rounded p-3 bg-[#f5f7fa]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-[#303133]">变更项 {idx + 1}</span>
                        <TextButton type="danger" onClick={() => removeChangeItem(idx)}>删除</TextButton>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <div className="mb-1 text-[#606266] text-xs">变更字段</div>
                          <select className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white"
                            value={item.field}
                            onChange={(e) => updateChangeItemField(idx, e.target.value as ChangeFieldKey, FIELD_NAME_MAP[e.target.value as ChangeFieldKey])}
                          >
                            {Object.entries(FIELD_NAME_MAP).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="mb-1 text-[#606266] text-xs">原值</div>
                          <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white"
                            value={item.oldValue}
                            onChange={(e) => updateChangeItemValue(idx, 'oldValue', e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="mb-1 text-[#606266] text-xs">新值</div>
                          <input className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-white"
                            value={item.newValue}
                            onChange={(e) => updateChangeItemValue(idx, 'newValue', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-[#909399]">
              申请人：{currentUser.name} &nbsp;|&nbsp; 申请时间：{new Date().toLocaleString('zh-CN')}
            </div>
          </div>
        )}
      </Modal>

      {/* ============ 变更记录弹窗 ============ */}
      <Modal
        open={changeHistoryOpen}
        title={`变更审批记录 - ${changeHistorySupplier?.name || ''}`}
        onClose={() => setChangeHistoryOpen(false)}
        footer={<DefaultButton onClick={() => setChangeHistoryOpen(false)}>关闭</DefaultButton>}
        width="900px"
      >
        {changeHistorySupplier && (() => {
          const history = supplierChangeRequests.filter(r => r.supplierId === changeHistorySupplier.id);
          if (history.length === 0) {
            return <div className="text-center text-[#909399] text-sm py-6 border border-dashed border-[#dcdfe6] rounded bg-[#f5f7fa]">暂无变更记录</div>;
          }
          return (
            <div className="space-y-2">
              {history.map((r) => (
                <div key={r.id} className="border border-[#dcdfe6] rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-[#303133]">{r.applicant} 发起的变更申请</span>
                    <span className={
                      r.status === 'pending' ? 'text-[#e6a23c] font-semibold' :
                      r.status === 'approved' ? 'text-[#67c23a] font-semibold' :
                      'text-[#f56c6c] font-semibold'
                    }>
                      {r.status === 'pending' ? '⏳ 待审批' : r.status === 'approved' ? '✓ 已通过' : '✗ 已驳回'}
                    </span>
                  </div>
                  <div className="text-xs text-[#909399] mb-2">申请时间：{r.applyTime} &nbsp;|&nbsp; 变更原因：{r.reason}</div>
                  <table className="w-full text-xs mb-2">
                    <thead className="bg-[#f5f7fa]">
                      <tr>
                        <th className="px-2 py-1 text-left">变更字段</th>
                        <th className="px-2 py-1 text-left">原值</th>
                        <th className="px-2 py-1 text-left">新值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.changes.map((c, i) => (
                        <tr key={i} className="border-t border-[#ebeef5]">
                          <td className="px-2 py-1">{c.fieldName}</td>
                          <td className="px-2 py-1 text-[#909399]">{c.oldValue}</td>
                          <td className="px-2 py-1 text-[#67c23a]">{c.newValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.status === 'pending' ? (
                    <div className="flex justify-end gap-2 border-t border-[#ebeef5] pt-2">
                      <DefaultButton onClick={() => handleApproveChangeRequest(r, false)}>驳回</DefaultButton>
                      <PrimaryButton onClick={() => handleApproveChangeRequest(r, true)}>审批通过</PrimaryButton>
                    </div>
                  ) : (
                    <div className="text-xs text-[#909399] border-t border-[#ebeef5] pt-2">
                      审批人：{r.approver} &nbsp;|&nbsp; 审批时间：{r.approveTime}
                      {r.approveRemark && <> &nbsp;|&nbsp; 驳回意见：{r.approveRemark}</>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
