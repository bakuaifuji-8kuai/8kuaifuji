import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/common/Card';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import type { SupplierAgent } from '@/types';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { PROCUREMENT_HELP } from '@/constants/procurementHelp';

/**
 * 代理商管理（供应商管理分组下）
 * 业务背景：展会业务通过代理商签订代理合同（NonProcurementFormation='agency_contract'），
 * 代理商档案是代理合同「对方单位」下拉与付款申请「收款账户」的数据来源。
 * 独立于供应商档案（供应商=货物服务提供方，代理商=招展/招商代理合作方）。
 */
export default function SupplierAgentPage() {
  const supplierAgents = useStore((s) => s.supplierAgents);
  const addSupplierAgent = useStore((s) => s.addSupplierAgent);
  const updateSupplierAgent = useStore((s) => s.updateSupplierAgent);
  const deleteSupplierAgent = useStore((s) => s.deleteSupplierAgent);
  const contractLedgers = useStore((s) => s.contractLedgers);
  const currentUser = useStore((s) => s.currentUser);

  // ========== 搜索筛选（应用式：点搜索才生效） ==========
  const [kw, setKw] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applied, setApplied] = useState({ kw: '', status: '' });

  const filteredData = useMemo(() => {
    return supplierAgents.filter((a) => {
      if (applied.kw) {
        const hit =
          a.name.includes(applied.kw) ||
          (a.code || '').toLowerCase().includes(applied.kw.toLowerCase()) ||
          (a.contact || '').includes(applied.kw) ||
          (a.address || '').includes(applied.kw);
        if (!hit) return false;
      }
      if (applied.status && a.status !== applied.status) return false;
      return true;
    });
  }, [supplierAgents, applied]);

  // ========== 弹窗 ==========
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierAgent | null>(null);
  const [form, setForm] = useState<Partial<SupplierAgent>>({});

  const update = (patch: Partial<SupplierAgent>) => setForm((p) => ({ ...p, ...patch }));

  const openAdd = () => {
    setEditing(null);
    setForm({ status: 'enabled' });
    setModalOpen(true);
  };

  const openEdit = (row: SupplierAgent) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name?.trim()) { alert('请填写代理商名称！'); return; }
    if (!form.contact?.trim()) { alert('请填写联系人！'); return; }
    if (!form.phone?.trim()) { alert('请填写联系电话！'); return; }
    if (editing) {
      updateSupplierAgent(editing.id, form);
    } else {
      const existingCodes = supplierAgents.map((a) => a.code).filter(Boolean);
      const autoCode = form.code?.trim() || `DLS-${String(supplierAgents.length + 1).padStart(3, '0')}`;
      void existingCodes;
      addSupplierAgent({
        id: 'AG' + Date.now() + Math.random().toString(36).slice(2, 6),
        code: autoCode,
        name: form.name,
        contact: form.contact,
        phone: form.phone,
        address: form.address || '',
        bankName: form.bankName,
        bankAccountNo: form.bankAccountNo,
        businessScope: form.businessScope,
        status: form.status || 'enabled',
        remark: form.remark,
        createTime: new Date().toISOString().slice(0, 19),
        creator: currentUser?.name || '系统',
      } as SupplierAgent);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: SupplierAgent) => {
    // 引用校验：被代理合同引用的代理商不允许删除（一切数据皆有源）
    const used = contractLedgers.some((c) => (c as any).supplierId === row.id && c.contractNature === 'non_procurement');
    if (used) {
      alert(`代理商「${row.name}」已被代理合同引用，不能删除！如需停用可将状态改为“禁用”。`);
      return;
    }
    if (confirm(`确定删除代理商「${row.name}」吗？`)) {
      deleteSupplierAgent(row.id);
    }
  };

  // ========== 表格列 ==========
  const columns: ColumnDef<SupplierAgent>[] = [
    { key: 'code', title: '代理商编号', width: '110px' },
    {
      key: 'name',
      title: '代理商名称',
      render: (row) => <span className="font-medium text-slate-800">{row.name}</span>,
    },
    { key: 'contact', title: '联系人', width: '90px' },
    { key: 'phone', title: '联系电话', width: '130px' },
    {
      key: 'address',
      title: '地址',
      render: (row) => <span className="block max-w-[180px] truncate text-slate-600" title={row.address}>{row.address || '-'}</span>,
    },
    {
      key: 'bankName',
      title: '开户行',
      render: (row) => <span className="block max-w-[160px] truncate text-slate-600" title={row.bankName}>{row.bankName || '-'}</span>,
    },
    { key: 'bankAccountNo', title: '银行账号', width: '180px' },
    {
      key: 'businessScope',
      title: '代理范围',
      render: (row) => <span className="block max-w-[150px] truncate text-slate-600" title={row.businessScope}>{row.businessScope || '-'}</span>,
    },
    {
      key: 'status',
      title: '状态',
      width: '80px',
      render: (row) => (
        <Badge variant={row.status === 'enabled' ? 'success' : 'default'}>
          {row.status === 'enabled' ? '启用' : '禁用'}
        </Badge>
      ),
    },
    { key: 'createTime', title: '创建时间', width: '110px', render: (row) => row.createTime?.slice(0, 10) || '-' },
    {
      key: 'action',
      title: '操作',
      width: '120px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <TextButton onClick={() => openEdit(row)}>编辑</TextButton>
          <TextButton onClick={() => handleDelete(row)} className="text-red-500 hover:text-red-600">删除</TextButton>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="p-5">
        {/* 搜索筛选区 */}
        <SearchBar
          onSearch={() => setApplied({ kw, status: statusFilter })}
          onReset={() => { setKw(''); setStatusFilter(''); setApplied({ kw: '', status: '' }); }}
        >
          <SearchField label="关键字" placeholder="名称/编号/联系人/地址" value={kw} onChange={setKw} />
          <SearchField
            label="状态"
            type="select"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'enabled', label: '启用' },
              { value: 'disabled', label: '禁用' },
            ]}
          />
        </SearchBar>

        {/* 操作按钮区 */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <span>共 {filteredData.length} 家代理商（代理合同的对方单位与付款申请收款账户的数据来源）</span>
            <FeatureHelpButton content={PROCUREMENT_HELP.supplierAgent} />
          </div>
          <PrimaryButton onClick={openAdd}>+ 新增代理商</PrimaryButton>
        </div>

        {/* 数据表格 */}
        <DataTable data={filteredData} columns={columns} pageSize={10} showPageSizeSelect striped />
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '编辑代理商' : '新增代理商'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <DefaultButton onClick={() => setModalOpen(false)}>取消</DefaultButton>
            <PrimaryButton onClick={save}>保存</PrimaryButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="代理商编号" value={form.code || ''} onChange={(e) => update({ code: e.target.value })} placeholder="留空自动生成（DLS-XXX）" />
          <Select
            label="状态"
            value={form.status || 'enabled'}
            onChange={(e) => update({ status: e.target.value as SupplierAgent['status'] })}
            options={[
              { value: 'enabled', label: '启用' },
              { value: 'disabled', label: '禁用' },
            ]}
          />
          <div className="col-span-2">
            <Input label="代理商名称 *" required value={form.name || ''} onChange={(e) => update({ name: e.target.value })} placeholder="代理商全称" />
          </div>
          <Input label="联系人 *" required value={form.contact || ''} onChange={(e) => update({ contact: e.target.value })} />
          <Input label="联系电话 *" required value={form.phone || ''} onChange={(e) => update({ phone: e.target.value })} />
          <div className="col-span-2">
            <Input label="地址 *" required value={form.address || ''} onChange={(e) => update({ address: e.target.value })} />
          </div>
          <Input label="开户行" value={form.bankName || ''} onChange={(e) => update({ bankName: e.target.value })} placeholder="付款申请收款账户带出用" />
          <Input label="银行账号" value={form.bankAccountNo || ''} onChange={(e) => update({ bankAccountNo: e.target.value })} />
          <div className="col-span-2">
            <Input label="代理范围" value={form.businessScope || ''} onChange={(e) => update({ businessScope: e.target.value })} placeholder="如：展会招展代理、招商代理" />
          </div>
          <div className="col-span-2">
            <Input label="备注" value={form.remark || ''} onChange={(e) => update({ remark: e.target.value })} />
          </div>
        </div>
      </Modal>
    </Card>
  );
}
