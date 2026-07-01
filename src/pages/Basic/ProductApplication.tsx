import { useState, useRef, useMemo } from 'react';
import { Plus, Upload, Download, Check, X, Eye, File, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Button from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { useStore } from '@/store/useStore';
import { generateId } from '@/utils';
import * as XLSX from 'xlsx';
import type { ProductApplication, ProductApplicationDetail, ProductApplicationStatus, Attachment } from '@/types';

const helpContent = {
  title: '物资申请审批 - 功能操作说明',
  description: '物资申请审批用于管理物资采购申请的全流程，从员工发起申请、部门审批到最终归档。系统支持新增、编辑、提交、审批、导入导出等完整操作。',
  sections: [
    {
      heading: '一、物资申请审批概述',
      items: [
        '业务定位：物资申请审批是采购管理的入口环节，员工通过此功能发起物资采购申请',
        '申请内容：每条申请包含申请人、申请部门、申请日期、期望日期、物资明细、附件等',
        '单据编号：系统自动生成以 WLSQ 开头的申请单号，如 WLSQ20250630001',
        '明细记录：一条申请可包含多条物资明细，记录每种物资的名称、规格、单位、申请理由',
        '附件支持：支持上传 PDF、Word、Excel、图片等格式的附件文件'
      ]
    },
    {
      heading: '二、申请状态与流转',
      items: [
        '草稿（灰色标签）：申请暂存状态，未正式提交，可继续编辑或删除',
        '待审批（黄色标签）：申请已提交，等待审批人审批，可查看但不可编辑',
        '已通过（绿色标签）：申请已审批通过，可查看详情但不可编辑或删除',
        '已驳回（红色标签）：申请被审批人驳回，可查看驳回原因，可编辑后重新提交或删除',
        '状态流转：草稿 → 待审批 → 已通过/已驳回（终态可重提交变更为待审批）'
      ]
    },
    {
      heading: '三、新增申请功能',
      items: [
        '操作入口：点击页面右上角「新增申请」按钮',
        '必填字段：申请人（必填）、申请日期（必填）',
        '选填字段：申请部门、期望日期、备注',
        '部门选择：下拉选择申请部门，支持会展部、生产部、运维部、采购部、财务部',
        '日期默认值：申请日期默认填充为当天日期，可手动修改',
        '期望日期：可选填，表示期望物资到位的时间'
      ]
    },
    {
      heading: '四、物资明细管理',
      items: [
        '添加明细：点击「添加」按钮新增一行空白明细',
        '明细字段：物资名称（必填）、规格（选填）、单位（选填）、理由（选填）',
        '导入明细：点击「导入」按钮可从 Excel 文件批量导入物资明细',
        '模板下载：导入前请先下载标准模板，按照模板格式准备数据',
        '删除明细：点击明细行右侧的删除按钮移除该条明细',
        '明细要求：至少需要添加一条物资明细才能提交申请'
      ]
    },
    {
      heading: '五、提交与保存草稿',
      items: [
        '保存草稿：点击「保存草稿」按钮，申请状态变为「草稿」，可继续编辑',
        '提交申请：点击「提交申请」按钮，申请状态变为「待审批」，进入审批流程',
        '校验规则：申请人、申请日期为必填，至少需要一条物资明细',
        '草稿编辑：草稿状态的申请可以编辑，编辑后仍可保存草稿或提交',
        '重新提交：已驳回的申请可以编辑后重新提交，状态变更为待审批'
      ]
    },
    {
      heading: '六、审批功能',
      items: [
        '审批入口：在列表操作列，点击绿色的 ✓ 通过按钮或红色的 ✗ 驳回按钮',
        '审批通过：点击 ✓ 按钮，弹出审批通过确认框，可填写审批意见',
        '审批驳回：点击 ✗ 按钮，弹出审批驳回确认框，需填写驳回原因',
        '审批记录：每次审批都会记录审批人、审批时间、审批结果和意见',
        '审批历史：可在申请详情中查看完整的审批历史记录',
        '审批人显示：系统自动从员工列表中获取角色为「负责人」的人员作为审批人'
      ]
    },
    {
      heading: '七、查看详情功能',
      items: [
        '操作入口：点击列表操作列的「查看」按钮',
        '详情内容：申请单号、申请人、申请部门、申请日期、期望日期、状态',
        '审批信息：显示审批人、审批时间（如已审批）',
        '物资明细：以表格形式展示所有物资明细，包含名称、规格、单位、理由',
        '附件展示：如申请包含附件，可查看附件名称和大小',
        '审批历史：以时间线形式展示完整的审批流程记录'
      ]
    },
    {
      heading: '八、导入导出功能',
      items: [
        '导入操作：点击「导入物资」按钮，选择 Excel 文件（.xlsx 或 .xls）',
        '导入范围：导入功能用于批量添加物资明细到当前申请中',
        '模板下载：点击「下载模板」获取标准导入模板，包含字段说明和示例',
        '导入预览：选择文件后显示预览列表，可确认无误后确认导入',
        '导出功能：当前列表支持导出功能，可将申请数据导出为 Excel 文件'
      ]
    },
    {
      heading: '九、注意事项与边界',
      items: [
        '单据号唯一：每条申请拥有唯一的申请单号，不可重复',
        '草稿时限：草稿状态的申请请尽快提交或处理，避免积压',
        '审批流程：提交后申请进入待审批状态，请联系审批人及时处理',
        '驳回处理：收到驳回后请查看驳回原因，及时修改后重新提交',
        '附件建议：复杂的采购需求建议上传相关需求文档或图片作为附件',
        '数据完整性：请确保填写的物资明细完整准确，便于审批人判断',
        '删除限制：已通过的申请不可删除，只能查看详情'
      ]
    }
  ]
};

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
];

const statusBadgeVariant = (status: ProductApplicationStatus) => {
  switch (status) {
    case 'draft': return 'default';
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    default: return 'default';
  }
};

export default function ProductApplicationPage() {
  const {
    productApplications,
    addProductApplication,
    updateProductApplication,
    deleteProductApplication,
    employees,
  } = useStore();

  // 筛选状态
  const [filterStatus, setFilterStatus] = useState('');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [applied, setApplied] = useState({ status: '', applicant: '' });

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [viewItem, setViewItem] = useState<ProductApplication | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ProductApplicationDetail[]>([]);

  // 表单数据
  const [formData, setFormData] = useState({
    applicant: '',
    applicantDept: '',
    applyDate: '',
    expectedDate: '',
    remark: '',
  });

  // 申请明细
  const [details, setDetails] = useState<ProductApplicationDetail[]>([]);

  // 附件
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // 审批弹窗
  const [approveModal, setApproveModal] = useState(false);
  const [approveRemark, setApproveRemark] = useState('');
  const [approveStatus, setApproveStatus] = useState<'approved' | 'rejected'>('approved');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return productApplications.filter((item) => {
      if (applied.status && item.status !== applied.status) return false;
      if (applied.applicant && !item.applicant.includes(applied.applicant)) return false;
      return true;
    });
  }, [productApplications, applied]);

  // 表格列定义
  const columns: ColumnDef<ProductApplication, unknown>[] = [
    { accessorKey: 'applicationNo', header: '申请单号' },
    { accessorKey: 'applicant', header: '申请人' },
    { accessorKey: 'applicantDept', header: '申请部门' },
    { accessorKey: 'applyDate', header: '申请日期' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)}>
          {statusOptions.find(s => s.value === row.original.status)?.label}
        </Badge>
      ),
    },
    {
      accessorKey: 'details',
      header: '物资数量',
      cell: ({ row }) => <span>{row.original.details.length} 种</span>,
    },
    { accessorKey: 'remark', header: '备注', cell: ({ row }) => row.original.remark || '-' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <TextButton onClick={() => setViewItem(item)}>
              <Eye size={14} />
            </TextButton>
            {item.status === 'pending' && (
              <>
                <TextButton onClick={() => handleApproveClick(item, 'approved')}>
                  <Check size={14} className="text-green-500" />
                </TextButton>
                <TextButton type="danger" onClick={() => handleApproveClick(item, 'rejected')}>
                  <X size={14} />
                </TextButton>
              </>
            )}
            {item.status === 'draft' && (
              <TextButton onClick={() => handleEdit(item)}>
                编辑
              </TextButton>
            )}
            {(item.status === 'draft' || item.status === 'rejected') && (
              <TextButton type="danger" onClick={() => handleDelete(item.id)}>
                删除
              </TextButton>
            )}
          </div>
        );
      },
    },
  ];

  // 新增申请
  const handleAdd = () => {
    setIsNew(true);
    setFormData({
      applicant: '',
      applicantDept: '',
      applyDate: new Date().toISOString().slice(0, 10),
      expectedDate: '',
      remark: '',
    });
    setDetails([]);
    setAttachments([]);
    setModalOpen(true);
  };

  // 编辑草稿
  const handleEdit = (item: ProductApplication) => {
    setIsNew(true);
    setFormData({
      applicant: item.applicant,
      applicantDept: item.applicantDept || '',
      applyDate: item.applyDate,
      expectedDate: item.expectedDate || '',
      remark: item.remark || '',
    });
    setDetails([...item.details]);
    setAttachments(item.attachments || []);
    setModalOpen(true);
  };

  // 提交申请
  const handleSubmit = () => {
    if (!formData.applicant || !formData.applyDate) {
      alert('请填写必填项');
      return;
    }
    if (details.length === 0) {
      alert('请添加至少一个物资');
      return;
    }

    if (isNew) {
      const newApp: ProductApplication = {
        id: 'PA' + Date.now(),
        applicationNo: generateApplicationNo(),
        applicant: formData.applicant,
        applicantDept: formData.applicantDept,
        status: 'pending',
        applyDate: formData.applyDate,
        expectedDate: formData.expectedDate,
        remark: formData.remark,
        details: details.map(d => ({ ...d, id: 'PAD' + Date.now() + Math.random().toString(36).slice(2, 6) })),
        attachments: attachments,
        createTime: new Date().toISOString().slice(0, 19),
      };
      addProductApplication(newApp);
    }

    setModalOpen(false);
  };

  // 保存草稿
  const handleSaveDraft = () => {
    if (!formData.applicant || !formData.applyDate) {
      alert('请填写必填项');
      return;
    }

    const newApp: ProductApplication = {
      id: 'PA' + Date.now(),
      applicationNo: generateApplicationNo(),
      applicant: formData.applicant,
      applicantDept: formData.applicantDept,
      status: 'draft',
      applyDate: formData.applyDate,
      expectedDate: formData.expectedDate,
      remark: formData.remark,
      details: details,
      attachments: attachments,
      createTime: new Date().toISOString().slice(0, 19),
    };
    addProductApplication(newApp);
    setModalOpen(false);
  };

  // 审批点击
  const handleApproveClick = (item: ProductApplication, status: 'approved' | 'rejected') => {
    setViewItem(item);
    setApproveStatus(status);
    setApproveRemark('');
    setApproveModal(true);
  };

  // 确认审批
  const handleApproveConfirm = () => {
    if (!viewItem) return;
    const approver = employees.find(e => e.role === '负责人')?.name || '刘十一';
    const now = new Date().toISOString().slice(0, 19);

    // 添加审批历史记录
    const newHistory = {
      approver,
      approveTime: now,
      result: approveStatus as 'approved' | 'rejected',
      comment: approveRemark,
    };

    const history = viewItem.approvalHistory ? [...viewItem.approvalHistory, newHistory] : [newHistory];

    updateProductApplication(viewItem.id, {
      status: approveStatus,
      approver,
      approveTime: now,
      approveRemark: approveRemark,
      approvalHistory: history,
    });

    setApproveModal(false);
    setViewItem(null);
    alert(approveStatus === 'approved' ? '已通过审批' : '已驳回');
  };

  // 删除
  const handleDelete = (id: string) => {
    if (confirm('确认删除此申请单？')) {
      deleteProductApplication(id);
    }
  };

  // 生成申请单号
  const generateApplicationNo = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WLSQ${dateStr}${random}`;
  };

  // 添加明细行
  const handleAddDetail = () => {
    setDetails([...details, {
      id: 'PAD' + Date.now(),
      applicationId: '',
      productName: '',
      categoryName: '',
      specification: '',
      unit: '',
      reason: '',
    }]);
  };

  // 更新明细行
  const handleUpdateDetail = (index: number, field: keyof ProductApplicationDetail, value: string | number) => {
    const newDetails = [...details];
    (newDetails[index] as any)[field] = value;
    setDetails(newDetails);
  };

  // 删除明细行
  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const templateData = [
      { '物资名称': '', '规格型号': '', '单位': '', '申请理由': '' },
      { '物资名称': 'LED显示屏', '规格型号': 'P2.5高清', '单位': '平方米', '申请理由': '展会项目需要' },
      { '物资名称': '音响设备', '规格型号': '专业级', '单位': '套', '申请理由': '展会使用' },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '物资申请导入模板');
    ws['!cols'] = [
      { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 },
    ];
    XLSX.writeFile(wb, '物资申请导入模板.xlsx');
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

        const previewData: ProductApplicationDetail[] = [];
        jsonData.forEach((row, index) => {
          const name = row['物资名称'];
          if (!name) return;

          previewData.push({
            id: 'PAD' + Date.now() + index,
            applicationId: '',
            productName: name,
            specification: row['规格型号'] || '',
            unit: row['单位'] || '',
            reason: row['申请理由'] || '',
          });
        });

        setImportPreview(previewData);
        setImportModalOpen(true);
      } catch (error) {
        alert('文件解析失败，请检查文件格式');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 确认导入
  const handleConfirmImport = () => {
    setDetails([...details, ...importPreview]);
    setImportModalOpen(false);
    setImportPreview([]);
  };

  // 处理附件上传
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: 'ATT' + Date.now() + Math.random().toString(36).slice(2, 6),
        fileName: file.name,
        filePath: URL.createObjectURL(file),
        fileSize: file.size,
        fileType: file.type,
        uploadTime: new Date().toISOString().slice(0, 19),
      };
      setAttachments(prev => [...prev, attachment]);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 删除附件
  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 员工选项
  const employeeOptions = employees.map(e => ({ value: e.name, label: e.name }));
  const deptOptions = [
    { value: '会展部', label: '会展部' },
    { value: '生产部', label: '生产部' },
    { value: '运维部', label: '运维部' },
    { value: '采购部', label: '采购部' },
    { value: '财务部', label: '财务部' },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">物资申请审批</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <div className="flex items-center gap-2">
          <DefaultButton onClick={() => fileInputRef.current?.click()} icon={<Upload size={14} />}>
            导入物资
          </DefaultButton>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          <DefaultButton onClick={handleDownloadTemplate} icon={<Download size={14} />}>
            下载模板
          </DefaultButton>
          <PrimaryButton onClick={handleAdd} icon={<Plus size={14} />}>
            新增申请
          </PrimaryButton>
        </div>
      </div>

      <SearchBar
        onSearch={() => setApplied({ status: filterStatus, applicant: filterApplicant })}
        onReset={() => {
          setFilterStatus('');
          setFilterApplicant('');
          setApplied({ status: '', applicant: '' });
        }}
      >
        <SearchField
          label="申请人"
          placeholder="输入申请人姓名"
          value={filterApplicant}
          onChange={setFilterApplicant}
        />
        <SearchField
          label="状态"
          type="select"
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} pageSize={10} />

      {/* 新增/编辑弹窗 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="物资申请" size="max-w-4xl">
        <div className="space-y-4 min-w-[700px]">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="申请人"
              value={formData.applicant}
              onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
              required
            />
            <Select
              label="申请部门"
              options={deptOptions}
              value={formData.applicantDept}
              onChange={(e) => setFormData({ ...formData, applicantDept: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="申请日期"
              type="date"
              value={formData.applyDate}
              onChange={(e) => setFormData({ ...formData, applyDate: e.target.value })}
              required
            />
            <Input
              label="期望日期"
              type="date"
              value={formData.expectedDate}
              onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
            />
          </div>
          <Input
            label="备注"
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
          />

          {/* 附件上传 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">附件</label>
              <Button variant="outline" size="sm" onClick={() => attachmentInputRef.current?.click()}>
                <Upload size={14} />
                上传附件
              </Button>
              <input
                ref={attachmentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                multiple
                onChange={handleAttachmentUpload}
                className="hidden"
              />
            </div>
            {attachments.length > 0 && (
              <div className="border border-slate-200 rounded p-3 space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                    <div className="flex items-center gap-2 text-xs">
                      <File size={14} className="text-slate-400" />
                      <span className="text-slate-700">{att.fileName}</span>
                      <span className="text-slate-400">({formatFileSize(att.fileSize)})</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveAttachment(att.id)}>
                      <Trash2 size={12} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {attachments.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded p-4 text-center text-xs text-slate-400">
                暂无附件，点击"上传附件"添加
              </div>
            )}
          </div>

          {/* 物资明细 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">申请物资明细</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} />
                  导入
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddDetail}>
                  <Plus size={14} />
                  添加
                </Button>
              </div>
            </div>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left w-24">规格</th>
                    <th className="px-3 py-2 text-left w-16">单位</th>
                    <th className="px-3 py-2 text-left">理由</th>
                    <th className="px-3 py-2 text-center w-12">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail, index) => (
                    <tr key={detail.id} className="border-t border-slate-100">
                      <td className="px-2 py-1">
                        <Input
                          value={detail.productName}
                          onChange={(e) => handleUpdateDetail(index, 'productName', e.target.value)}
                          placeholder="物资名称"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={detail.specification}
                          onChange={(e) => handleUpdateDetail(index, 'specification', e.target.value)}
                          placeholder="规格"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={detail.unit}
                          onChange={(e) => handleUpdateDetail(index, 'unit', e.target.value)}
                          placeholder="单位"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={detail.reason}
                          onChange={(e) => handleUpdateDetail(index, 'reason', e.target.value)}
                          placeholder="申请理由"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveDetail(index)}>
                          <X size={14} className="text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {details.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                        暂无物资，请点击"添加"或"导入"添加物资
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              保存草稿
            </Button>
            <Button onClick={handleSubmit}>
              提交申请
            </Button>
          </div>
        </div>
      </Modal>

      {/* 查看详情弹窗 */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="申请详情" size="max-w-4xl">
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">申请单号：</span>
                <span className="ml-2">{viewItem.applicationNo}</span>
              </div>
              <div>
                <span className="text-slate-500">申请人：</span>
                <span className="ml-2">{viewItem.applicant}</span>
              </div>
              <div>
                <span className="text-slate-500">申请部门：</span>
                <span className="ml-2">{viewItem.applicantDept || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">申请日期：</span>
                <span className="ml-2">{viewItem.applyDate}</span>
              </div>
              <div>
                <span className="text-slate-500">期望日期：</span>
                <span className="ml-2">{viewItem.expectedDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">状态：</span>
                <Badge variant={statusBadgeVariant(viewItem.status)} className="ml-2">
                  {statusOptions.find(s => s.value === viewItem.status)?.label}
                </Badge>
              </div>
              {viewItem.approver && (
                <>
                  <div>
                    <span className="text-slate-500">审批人：</span>
                    <span className="ml-2">{viewItem.approver}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">审批时间：</span>
                    <span className="ml-2">{viewItem.approveTime || '-'}</span>
                  </div>
                </>
              )}
              <div className="col-span-3">
                <span className="text-slate-500">备注：</span>
                <span className="ml-2">{viewItem.remark || '-'}</span>
              </div>
            </div>

            {/* 附件 */}
            {viewItem.attachments && viewItem.attachments.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">附件</label>
                <div className="border border-slate-200 rounded p-3 space-y-2">
                  {viewItem.attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
                      <File size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-700">{att.fileName}</span>
                      <span className="text-xs text-slate-400">({formatFileSize(att.fileSize)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 审批历史 */}
            {viewItem.approvalHistory && viewItem.approvalHistory.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">审批历史</label>
                <div className="border border-slate-200 rounded p-3 space-y-3">
                  {viewItem.approvalHistory.map((record, index) => (
                    <div key={index} className="flex items-start gap-3 text-xs">
                      <Badge variant={record.result === 'approved' ? 'success' : 'danger'}>
                        {record.result === 'approved' ? '通过' : '驳回'}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span>{record.approver}</span>
                          <span className="text-slate-400">|</span>
                          <span>{record.approveTime}</span>
                        </div>
                        {record.comment && (
                          <div className="text-slate-500 mt-1">意见：{record.comment}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">申请物资明细</label>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">物资名称</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">单位</th>
                      <th className="px-3 py-2 text-left">理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.details.map((detail) => (
                      <tr key={detail.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{detail.productName}</td>
                        <td className="px-3 py-2">{detail.specification || '-'}</td>
                        <td className="px-3 py-2">{detail.unit || '-'}</td>
                        <td className="px-3 py-2">{detail.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setViewItem(null)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 审批弹窗 */}
      <Modal open={approveModal} onClose={() => setApproveModal(false)} title={approveStatus === 'approved' ? '审批通过' : '审批驳回'} size="max-w-md">
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            确认{approveStatus === 'approved' ? '通过' : '驳回'}此物资申请单？
          </div>
          <Input
            label="审批意见"
            value={approveRemark}
            onChange={(e) => setApproveRemark(e.target.value)}
            placeholder="请输入审批意见"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setApproveModal(false)}>
              取消
            </Button>
            <Button onClick={handleApproveConfirm}>
              确认
            </Button>
          </div>
        </div>
      </Modal>

      {/* 导入预览弹窗 */}
      <Modal
        open={importModalOpen}
        onClose={() => { setImportModalOpen(false); setImportPreview([]); }}
        title="导入预览"
        size="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            共 <span className="font-semibold text-blue-600">{importPreview.length}</span> 条物资待添加
          </div>
          <div className="max-h-[400px] overflow-auto border border-slate-200 rounded">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">物资名称</th>
                  <th className="px-3 py-2 text-left">规格</th>
                  <th className="px-3 py-2 text-left">单位</th>
                  <th className="px-3 py-2 text-left">理由</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((item, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2">{item.specification || '-'}</td>
                    <td className="px-3 py-2">{item.unit || '-'}</td>
                    <td className="px-3 py-2">{item.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => { setImportModalOpen(false); setImportPreview([]); }}>
              取消
            </Button>
            <Button onClick={handleConfirmImport}>
              确认导入
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
