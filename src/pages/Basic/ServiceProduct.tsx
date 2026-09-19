import { useState, useRef, useMemo } from 'react';
import { Plus, Upload, Download, FileSpreadsheet, Eye, X, FileText } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Button from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import DataTable from '@/components/common/DataTable';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import FeatureHelpButton from '@/components/common/FeatureHelpButton';
import { useStore } from '@/store/useStore';
import { cn, generateId } from '@/utils';
import type { Service, ServiceCategory, Contract, ProductContract, ServiceApplication, ServiceApplicationDetail } from '@/types';
import * as XLSX from 'xlsx';

const helpContent = {
  title: '服务档案管理 - 功能操作说明',
  description: '服务档案是仓库管理系统的基础数据模块，用于管理所有服务的基本信息、合同关联和申请记录。服务档案支持新增、编辑、删除、导入导出等完整CRUD操作。',
  sections: [
    {
      heading: '一、服务档案概述',
      items: [
        '数据性质：服务档案是仓库管理系统的基础数据，是所有入库、出库、调拨等业务的数据基础',
        '记录内容：包含服务编码、名称、品牌、规格型号、单位、产地、材质、重量、尺寸等基本信息',
        '编码规则：服务编码由前缀（可自定义）+ 5位数字后缀组成，如 QD00001、P00002',
        '分类管理：每个服务必须归属一个分类，分类决定服务编码的前缀（如 QD 开头）',
        '状态控制：服务有启用/禁用两种状态，禁用的服务理论上不可在业务中使用'
      ]
    },
    {
      heading: '二、状态说明',
      items: [
        '启用（绿色标签）：表示该服务可用，可正常进行出入库等业务操作',
        '禁用（灰色标签）：表示该服务暂时不可用，建议禁用而非删除以保留历史数据',
        '合同清单内（蓝色标签）：表示该服务已关联有效采购合同，可享受合同价格',
        '合同清单外（灰色标签）：表示该服务暂无有效合同关联'
      ]
    },
    {
      heading: '三、数据筛选功能',
      items: [
        '关键词搜索：支持模糊匹配服务编码和服务名称，不区分大小写',
        '品牌筛选：下拉选择品牌进行精确筛选，支持动态获取已有品牌列表',
        '状态筛选：下拉选择「启用」或「禁用」进行精确筛选',
        '合同清单筛选：下拉选择「合同清单内」或「合同清单外」进行精确筛选',
        '组合筛选：多个筛选条件同时生效，取交集',
        '点击搜索：搜索区域的条件需要点击「搜索」按钮才应用到列表',
        '重置功能：点击「重置」按钮清空所有筛选条件'
      ]
    },
    {
      heading: '四、新增服务功能',
      items: [
        '操作入口：点击页面右上角「新增服务」按钮',
        '必填字段：分类（必选）、服务名称（必填）、单位（必填）',
        '分类选择：下拉选择服务分类，选择后服务编码前缀自动替换为该分类的codePrefix',
        '快速新增分类：分类下拉框旁有「+ 新增」按钮，可快速创建新分类（需填写名称和编码前缀）',
        '编码生成：前缀可自定义修改，后缀（5位数字）系统自动生成，确保全局唯一',
        '可选字段：品牌、规格型号、产地、材质、重量、尺寸等',
        '保存逻辑：验证必填项后保存，保存后弹窗关闭，列表自动刷新'
      ]
    },
    {
      heading: '五、编辑服务功能',
      items: [
        '操作入口：点击列表操作列的「编辑」按钮',
        '不可编辑字段：分类、服务编码 不可修改（以灰色只读方式显示）',
        '可编辑字段：服务名称、品牌、规格型号、单位、产地、材质、重量、尺寸、状态等均可编辑',
        '编码说明：编辑时服务编码只读显示，不可修改，这是为了保证编码的稳定性和可追溯性',
        '保存逻辑：点击「保存」后立即更新列表数据'
      ]
    },
    {
      heading: '六、从申请单添加服务',
      items: [
        '操作入口：点击页面右上角「从申请单添加」按钮',
        '申请单筛选：仅显示「已通过」的服务申请单',
        '申请单选择：点击列表中的申请单行进行选择，选中后高亮显示',
        '明细选择：选择申请单后，可选择其中的某条服务明细进行编辑',
        '明细编辑：选中的明细行的服务名称、规格、单位可修改',
        '生成新服务：点击「确定」后，将以编辑后的内容填充到新增服务表单，使用系统默认前缀生成新编码',
        '后续流程：弹出新增服务弹窗，可进一步编辑后保存'
      ]
    },
    {
      heading: '七、导入导出功能',
      items: [
        '导入操作：点击「导入」按钮，选择 Excel 文件（.xlsx 或 .xls）',
        '模板下载：点击「下载模板」获取标准导入模板，包含所有字段说明和示例行',
        '导入预览：选择文件后显示预览列表，包含数据校验结果',
        '校验规则：服务名称为必填项，状态字段支持「启用」/「禁用」两种值',
        '编码生成：导入时自动生成唯一编码，默认前缀为 P，后缀为5位数字',
        '错误处理：导入失败的数据行会显示错误原因，可修正后重新导入',
        '导出操作：点击「导出」按钮，将当前筛选后的数据导出为 Excel 文件',
        '导出内容：包含服务完整信息及关联的合同信息（如果有）'
      ]
    },
    {
      heading: '八、合同管理功能',
      items: [
        '操作入口：点击列表「合同信息」列的「查看合同」链接',
        '合同类型：显示采购合同信息，包括合同编号、名称、有效期、单价等',
        '有效合同判定：当前日期在合同有效期内且合同状态为「生效」',
        '合同单价：显示含税单价，辅助采购决策',
        '关联关系：一个服务可关联多条合同，但仅显示一条有效合同',
        '历史合同：超过有效期或已停用的合同归类为历史合同展示'
      ]
    },
    {
      heading: '九、注意事项与边界',
      items: [
        '编码稳定性：服务编码生成后不可修改，请确保编码规则合理规划',
        '分类不可改：编辑服务时分类不可修改，如需修改只能删除后重新新增',
        '禁用而非删除：不再使用的服务建议禁用而非删除，以保留历史数据关联',
        '合同重要性：建议将常用采购服务关联合同，以便享受合同价格和便于价格追溯',
        '导入建议：批量导入前请先下载模板，按照模板格式准备数据',
        '数据备份：重要数据操作前建议导出备份，防止误操作导致数据丢失'
      ]
    }
  ]
};

export default function ServiceProductPage() {
  const { services, addService, updateService, deleteService, contracts, productContracts, serviceApplications, serviceCategories, addServiceCategory } = useStore();
  const [searchText, setSearchText] = useState('');
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ServiceApplication | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ServiceApplicationDetail | null>(null);
  // 编辑中的服务信息
  const [editingDetailForm, setEditingDetailForm] = useState<{
    productName: string;
    specification: string;
    unit: string;
  }>({ productName: '', specification: '', unit: '' });
  const [statusFilter, setStatusFilter] = useState('');
  const [contractItemFilter, setContractItemFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({
    searchText: '',
    statusFilter: '',
    contractItemFilter: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractModalProduct, setContractModalProduct] = useState<Service | null>(null);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [viewingItem, setViewingItem] = useState<Service | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    code: string;
    codePrefix: string;
    codeSuffix: string;
    name: string;
    unit: string;
    specification: string;
    categoryId: string;
    categoryName: string;
    isContractItem: boolean;
    status: 'enabled' | 'disabled';
    remark: string;
  }>({
    code: '',
    codePrefix: 'S',
    codeSuffix: '',
    name: '',
    unit: '',
    specification: '',
    categoryId: '',
    categoryName: '',
    isContractItem: false,
    status: 'enabled',
    remark: '',
  });

  const getValidContract = (productId: string): Contract | null => {
    const pc = productContracts.find(pc => pc.productId === productId);
    if (!pc) return null;
    const contract = contracts.find(c => c.id === pc.contractId);
    if (!contract) return null;
    const now = new Date();
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    return contract.status === 'active' && now >= start && now <= end ? contract : null;
  };

  const getProductContract = (productId: string): ProductContract | undefined => {
    return productContracts.find(pc => pc.productId === productId);
  };

  // 获取服务关联的所有有效合同
  const getProductValidContracts = (productId: string): Contract[] => {
    return productContracts
      .filter(pc => pc.productId === productId)
      .map(pc => contracts.find(c => c.id === pc.contractId))
      .filter((c): c is Contract => {
        if (!c) return false;
        if (c.status !== 'active') return false;
        const now = new Date();
        return now >= new Date(c.startDate) && now <= new Date(c.endDate);
      });
  };

  // 获取服务关联的所有合同（不限有效）
  const getProductAllContracts = (productId: string): Contract[] => {
    return productContracts
      .filter(pc => pc.productId === productId)
      .map(pc => contracts.find(c => c.id === pc.contractId))
      .filter((c): c is Contract => !!c);
  };

  const filteredData = useMemo(() => {
    return services
      .map(p => {
        const allLinkedContracts = getProductAllContracts(p.id);
        const validInList = allLinkedContracts.filter(c => {
          if (c.status !== 'active') return false;
          const now = new Date();
          return now >= new Date(c.startDate) && now <= new Date(c.endDate);
        });
        const pc = getProductContract(p.id);
        return {
          ...p,
          validContracts: validInList,
          contractCount: allLinkedContracts.length,
          hasValidContract: validInList.length > 0,
          isContractItem: pc?.isContractItem || p.isContractItem || false,
          contractLabel: pc?.isContractItem ? '合同清单内' : '合同清单外',
        };
      })
      .filter((item) => {
        const matchSearch = !appliedFilter.searchText ||
          item.code.toLowerCase().includes(appliedFilter.searchText.toLowerCase()) ||
          item.name.toLowerCase().includes(appliedFilter.searchText.toLowerCase());
        const matchStatus = !appliedFilter.statusFilter || item.status === appliedFilter.statusFilter;
        const matchContractItem = !appliedFilter.contractItemFilter ||
          (appliedFilter.contractItemFilter === 'yes' && item.isContractItem) ||
          (appliedFilter.contractItemFilter === 'no' && !item.isContractItem);
        return matchSearch && matchStatus && matchContractItem;
      });
  }, [services, contracts, productContracts, appliedFilter]);

  const columns: ColumnDef<Service & { validContracts?: Contract[]; contractCount?: number; isContractItem?: boolean; contractLabel?: string }, unknown>[] = [
    { accessorKey: 'code', header: '服务编码' },
    { accessorKey: 'name', header: '服务名称' },
    {
      id: 'categoryName',
      header: '分类',
      cell: ({ row }) => row.original.categoryName || '-',
    },
    { accessorKey: 'specification', header: '规格型号/参数', cell: ({ row }) => row.original.specification || '-' },
    { accessorKey: 'unit', header: '单位' },
    {
      id: 'contractItem',
      header: '合同清单',
      cell: ({ row }) => (
        <Badge variant={row.original.isContractItem ? 'success' : 'default'}>
          {row.original.contractLabel}
        </Badge>
      ),
    },
    {
      id: 'contractInfo',
      header: '合同信息',
      cell: ({ row }) => {
        const count = row.original.contractCount || 0;
        const hasValid = (row.original as any).hasValidContract;
        if (count === 0) {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <TextButton
            onClick={() => openContractModal(row.original)}
          >
            查看合同（{count}）
          </TextButton>
        );
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'enabled' ? 'success' : 'default'}>
          {row.original.status === 'enabled' ? '启用' : '禁用'}
        </Badge>
      ),
    },
    { accessorKey: 'remark', header: '备注', cell: ({ row }) => row.original.remark || '-' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-wrap">
          <TextButton onClick={() => { setViewingItem(row.original); setViewModalOpen(true); }}>
            <Eye size={14} />
          </TextButton>
          <TextButton onClick={() => handleEdit(row.original)}>
            编辑
          </TextButton>
          <TextButton type="danger" onClick={() => handleDelete(row.original.id)}>
            删除
          </TextButton>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: 'enabled', label: '启用' },
    { value: 'disabled', label: '禁用' },
  ];

  const contractItemOptions = [
    { value: '', label: '全部' },
    { value: 'yes', label: '合同清单内' },
    { value: 'no', label: '合同清单外' },
  ];

  const handleSearch = () => {
    setAppliedFilter({
      searchText,
      statusFilter,
      contractItemFilter,
    });
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter('');
    setContractItemFilter('');
    setAppliedFilter({
      searchText: '',
      statusFilter: '',
      contractItemFilter: '',
    });
  };

  const handleAdd = () => {
    setEditingItem(null);
    const { prefix, suffix, code } = generateServiceCode('P', services);
    setFormData({
      code,
      codePrefix: prefix,
      codeSuffix: suffix,
      name: '',
      unit: '',
      specification: '',
      categoryId: '',
      categoryName: '',
      isContractItem: false,
      status: 'enabled',
      remark: '',
    });
    setModalOpen(true);
  };

  // 生成唯一编码：前缀（用户定义）+ 后缀（系统自动生成，全局唯一）
  const generateServiceCode = (prefix: string, existingProducts: Service[]) => {
    // 提取所有数字后缀，找出全局最大值
    const allNumericSuffixes = existingProducts
      .map(p => {
        // 提取编码中的数字部分（最后连续的数字）
        const match = p.code.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const maxNum = allNumericSuffixes.length > 0 ? Math.max(...allNumericSuffixes) : 0;
    const nextNum = maxNum + 1;

    // 使用用户定义的前缀 + 5位数字后缀
    const suffix = nextNum.toString().padStart(5, '0');
    return {
      prefix,
      suffix,
      code: prefix + suffix
    };
  };

  const handlePrefixChange = (newPrefix: string) => {
    if (!editingItem) {
      const { prefix, suffix, code } = generateServiceCode(newPrefix, services);
      setFormData({ ...formData, codePrefix: prefix, codeSuffix: suffix, code });
    } else {
      setFormData({ ...formData, codePrefix: newPrefix });
    }
  };

  const handleEdit = (item: Service) => {
    setEditingItem(item);
    const match = item.code.match(/^([A-Za-z]+)(\d+)$/);
    const codePrefix = match ? match[1] : '';
    const codeSuffix = match ? match[2] : '';
    setFormData({
      code: item.code,
      codePrefix: item.codePrefix || codePrefix,
      codeSuffix: codeSuffix,
      name: item.name,
      unit: item.unit,
      specification: item.specification || '',
      categoryId: item.categoryId || '',
      categoryName: item.categoryName || '',
      isContractItem: item.isContractItem || false,
      status: item.status,
      remark: item.remark || '',
    });
    setModalOpen(true);
  };

  const [quickCategoryModalOpen, setQuickCategoryModalOpen] = useState(false);
  const [quickCategoryForm, setQuickCategoryForm] = useState({ name: '', codePrefix: '' });

  const handleCategoryChange = (categoryId: string) => {
    const category = serviceCategories.find((c: any) => c?.id === categoryId);
    const prefix = category?.codePrefix || 'P';
    if (!editingItem) {
      const { prefix: newPrefix, suffix, code } = generateServiceCode(prefix, services);
      setFormData({
        ...formData,
        categoryId: categoryId,
        categoryName: category?.name || '',
        codePrefix: newPrefix,
        codeSuffix: suffix,
        code,
      });
    } else {
      setFormData({
        ...formData,
        categoryId: categoryId,
        categoryName: category?.name || '',
      });
    }
  };

  const handleQuickCategoryAdd = () => {
    if (!quickCategoryForm.name) {
      alert('请填写分类名称');
      return;
    }
    const newCategory = {
      id: 'CAT' + Date.now(),
      code: quickCategoryForm.codePrefix || ('CAT' + Date.now().toString().slice(-4)),
      name: quickCategoryForm.name,
      codePrefix: quickCategoryForm.codePrefix.toUpperCase(),
      sort: serviceCategories.length + 1,
    };
    addServiceCategory(newCategory);
    setQuickCategoryModalOpen(false);
    setQuickCategoryForm({ name: '', codePrefix: '' });
    handleCategoryChange(newCategory.id);
  };

  // 打开合同详情弹窗
  const openContractModal = (item: Service) => {
    setContractModalProduct(item);
    setContractModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除吗？')) {
      deleteService(id);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.unit) {
      alert('请填写必填项：服务名称、单位');
      return;
    }
    if (!formData.categoryId) {
      alert('请选择分类');
      return;
    }

    if (editingItem) {
      updateService(editingItem.id, formData);
    } else {
      addService({
        id: generateId(),
        ...formData,
      });
    }
    setModalOpen(false);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '服务名称': '',
        '品牌': '',
        '规格型号': '',
        '单位': '',
        '产地': '',
        '材质': '',
        '重量': '',
        '尺寸': '',
        '状态': '启用/禁用',
      },
      {
        '服务名称': '示例服务1',
        '品牌': '得力',
        '规格型号': '1m*2m',
        '单位': '块',
        '产地': '浙江',
        '材质': '铝合金+PVC',
        '重量': '',
        '尺寸': '',
        '状态': '启用',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '服务导入模板');
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 15 }, { wch: 10 },
    ];
    XLSX.writeFile(wb, '服务导入模板.xlsx');
  };

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

        const errors: string[] = [];
        const previewData: any[] = [];
        // 跟踪导入批次中已生成的编码，用于确保唯一性
        let lastGeneratedSuffix = 0;

        jsonData.forEach((row, index) => {
          const rowNum = index + 2;
          const name = row['服务名称'];
          const specification = row['规格型号'];
          const unit = row['单位'];
          const status = row['状态'];

          if (!name) {
            errors.push(`第${rowNum}行：服务名称不能为空`);
            return;
          }

          const productStatus = status?.includes('禁用') ? 'disabled' : 'enabled';

          // 使用默认前缀'P'生成唯一编码
          const prefix = 'P';
          const allCodes = [...services.map(p => p.code), ...previewData.map(p => p.code)];
          const allNumericSuffixes = allCodes
            .map((c: string) => {
              const match = c.match(/(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter((n: number) => n > 0);
          const maxNum = allNumericSuffixes.length > 0 ? Math.max(...allNumericSuffixes) : 0;
          const nextNum = Math.max(maxNum, lastGeneratedSuffix) + 1;
          lastGeneratedSuffix = nextNum;
          const suffix = nextNum.toString().padStart(5, '0');
          const code = prefix + suffix;

          previewData.push({
            code,
            codePrefix: prefix,
            codeSuffix: suffix,
            name,
            specification: specification || '',
            unit: unit || '',
            status: productStatus,
          });
        });

        setImportPreview(previewData);
        setImportErrors(errors);
        setImportModalOpen(true);
      } catch (error) {
        alert('文件解析失败，请检查文件格式是否正确');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    let successCount = 0;
    importPreview.forEach(item => {
      addService({
        id: generateId(),
        ...item,
      });
      successCount++;
    });

    alert(`成功导入 ${successCount} 条服务数据`);
    setImportModalOpen(false);
    setImportPreview([]);
    setImportErrors([]);
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const exportData = filteredData.map(item => ({
      '服务编码': item.code,
      '服务名称': item.name,
      '分类': item.categoryName || '-',
      '规格型号/参数': item.specification || '-',
      '单位': item.unit,
      '状态': item.status === 'enabled' ? '启用' : '禁用',
      '合同清单': item.contractLabel,
      '合同编号': item.validContracts?.[0]?.contractNo || '-',
      '合同名称': item.validContracts?.[0]?.contractName || '-',
      '合同有效期': item.validContracts?.[0] ? `${item.validContracts[0].startDate} ~ ${item.validContracts[0].endDate}` : '-',
      '合同类型': item.validContracts?.[0]?.type === 'purchase' ? '采购合同' : '-',
      '采购金额': item.validContracts?.[0]?.amount ? item.validContracts[0].amount.toLocaleString() : '-',
      '备注': item.remark || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '服务档案');
    XLSX.writeFile(wb, `服务档案导出_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#303133]">服务档案</h2>
          <FeatureHelpButton content={helpContent} />
        </div>
        <div className="flex items-center gap-2">
          <DefaultButton onClick={() => fileInputRef.current?.click()} icon={<Upload size={16} />}>
            导入
          </DefaultButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <DefaultButton onClick={handleDownloadTemplate} icon={<Download size={16} />}>
            下载模板
          </DefaultButton>
          <DefaultButton onClick={handleExport} icon={<Download size={16} />}>
            导出
          </DefaultButton>
          <DefaultButton onClick={() => setApplicationModalOpen(true)} icon={<FileText size={16} />}>
            从申请单添加
          </DefaultButton>
          <PrimaryButton onClick={handleAdd} icon={<Plus size={16} />}>
            新增服务
          </PrimaryButton>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} onReset={handleReset}>
        <SearchField
          label="关键词"
          placeholder="搜索服务编码/名称"
          value={searchText}
          onChange={setSearchText}
          type="input"
          width="w-[260px]"
        />
        <SearchField
          label="状态"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          type="select"
        />
        <SearchField
          label="合同清单"
          value={contractItemFilter}
          onChange={setContractItemFilter}
          options={contractItemOptions}
          type="select"
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} pageSize={15} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? '编辑服务' : '新增服务'}
        size="max-w-3xl"
      >
        <div className="space-y-4 min-w-[700px]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#303133] mb-1">
                分类 <span className="text-[#f56c6c]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  className={`flex-1 h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] focus:outline-none focus:border-[#2f54eb] text-sm ${editingItem ? 'bg-[#f5f7fa] text-[#909399] cursor-not-allowed' : ''}`}
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={!!editingItem}
                >
                  <option value="">请选择</option>
                  {serviceCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}{c.codePrefix ? ` (${c.codePrefix})` : ''}</option>
                  ))}
                </select>
                {!editingItem && (
                  <button
                    type="button"
                    className="h-8 px-2 border border-[#dcdfe6] rounded bg-white text-[#303133] hover:border-[#2f54eb] hover:text-[#2f54eb] text-sm whitespace-nowrap"
                    onClick={() => {
                      setQuickCategoryForm({ name: '', codePrefix: '' });
                      setQuickCategoryModalOpen(true);
                    }}
                  >
                    + 新增
                  </button>
                )}
              </div>
            </div>
            <Input
              label="服务名称 *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#303133] mb-1">
                服务编码
              </label>
              {editingItem ? (
                // 编辑模式：整体只读
                <input
                  type="text"
                  disabled
                  className="w-full h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed"
                  value={formData.code}
                />
              ) : (
                // 新增模式：前缀可编辑 + 后缀只读
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="w-20 h-8 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-blue-500"
                    value={formData.codePrefix}
                    onChange={(e) => handlePrefixChange(e.target.value)}
                    placeholder="如P"
                    maxLength={5}
                  />
                  <span className="text-[#303133]">+</span>
                  <input
                    type="text"
                    disabled
                    className="w-24 h-8 px-2 border border-[#dcdfe6] rounded bg-[#f5f7fa] text-[#909399] cursor-not-allowed text-sm"
                    value={formData.codeSuffix}
                  />
                </div>
              )}
              <div className="text-xs text-[#909399] mt-1">
                {editingItem ? '' : '前缀可修改，后缀系统自动生成'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">单位 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="如: 次、㎡、车次、套、天、人天、场"
                />
                <button
                  type="button"
                  className="h-9 px-3 text-xs text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap"
                  onClick={() => {
                    const existing = [...new Set(services.map((s: any) => s.unit).filter(Boolean))] as string[];
                    const predefined = ['次', '㎡', '车次', '套', '天', '人天', '场', '个', '台', '米'];
                    const all = [...new Set([...existing, ...predefined])];
                    const choice = window.prompt(
                      '快速选择或输入新单位（已有：' + all.join(' / ') + '）',
                      formData.unit
                    );
                    if (choice && choice.trim()) {
                      setFormData({ ...formData, unit: choice.trim() });
                    }
                  }}
                >+ 新增单位</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="规格型号/参数"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="如: 10mm*1000mm*2000mm"
            />
            <Select
              label="状态"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'enabled' | 'disabled' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              value={formData.remark || ''}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="选填，备注说明"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={quickCategoryModalOpen}
        onClose={() => setQuickCategoryModalOpen(false)}
        title="新增分类"
        size="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#303133] mb-1">
              分类名称 <span className="text-[#f56c6c]">*</span>
            </label>
            <input
              type="text"
              className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-blue-500"
              value={quickCategoryForm.name}
              onChange={(e) => setQuickCategoryForm({ ...quickCategoryForm, name: e.target.value })}
              placeholder="如：强电服务"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#303133] mb-1">
              编码前缀
            </label>
            <input
              type="text"
              className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-blue-500"
              value={quickCategoryForm.codePrefix}
              onChange={(e) => setQuickCategoryForm({ ...quickCategoryForm, codePrefix: e.target.value.toUpperCase() })}
              placeholder="如：QD（2位英文字母）"
              maxLength={10}
            />
            <div className="text-xs text-[#909399] mt-1">选择该分类时，服务编码将此前缀开头</div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setQuickCategoryModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleQuickCategoryAdd}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="服务详情"
        size="max-w-3xl"
      >
        {viewingItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">服务编码：</span>
                <span className="font-medium">{viewingItem.code}</span>
              </div>
              <div>
                <span className="text-slate-500">服务名称：</span>
                <span className="font-medium">{viewingItem.name}</span>
              </div>
              <div>
                <span className="text-slate-500">单位：</span>
                <span>{viewingItem.unit}</span>
              </div>
              <div>
                <span className="text-slate-500">规格型号/参数：</span>
                <span>{viewingItem.specification || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">状态：</span>
                <Badge variant={viewingItem.status === 'enabled' ? 'success' : 'default'}>
                  {viewingItem.status === 'enabled' ? '启用' : '禁用'}
                </Badge>
              </div>
              <div>
                <span className="text-slate-500">备注：</span>
                <span>{viewingItem.remark || '-'}</span>
              </div>
            </div>

            {(viewingItem as any).validContracts && (viewingItem as any).validContracts.length > 0 && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  合同信息
                  <Badge variant={(viewingItem as any).isContractItem ? 'success' : 'default'}>
                    {(viewingItem as any).contractLabel}
                  </Badge>
                  <span className="text-xs text-slate-500">共 {(viewingItem as any).validContracts.length} 条有效合同</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openContractModal(viewingItem)}
                >
                  查看合同详情
                </Button>
              </div>
            )}

            {!(viewingItem as any).validContracts || (viewingItem as any).validContracts.length === 0 && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-medium text-slate-700 mb-3">合同信息</h3>
                <div className="text-sm text-slate-500">
                  <span>当前服务暂无有效合同关联</span>
                  <span className="ml-2">
                    <Badge variant={((viewingItem as any).isContractItem) ? 'success' : 'default'}>
                      {(viewingItem as any).contractLabel}
                    </Badge>
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setViewModalOpen(false)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={contractModalOpen}
        onClose={() => {
          setContractModalOpen(false);
          setContractModalProduct(null);
        }}
        title={contractModalProduct ? `${contractModalProduct.name} - 合同信息` : '合同信息'}
        size="max-w-3xl"
      >
        {contractModalProduct && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <span>服务编码：</span>
                <span className="font-medium">{contractModalProduct.code}</span>
                <span className="ml-4">服务名称：</span>
                <span className="font-medium">{contractModalProduct.name}</span>
              </div>
            </div>

            {(() => {
              const allContracts = getProductAllContracts(contractModalProduct.id);
              if (allContracts.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-400">
                    暂无合同信息
                  </div>
                );
              }

              const now = new Date();
              const validContracts = allContracts.filter(c =>
                c.status === 'active' &&
                now >= new Date(c.startDate) &&
                now <= new Date(c.endDate)
              );
              const historicalContracts = allContracts.filter(c =>
                !(c.status === 'active' &&
                  now >= new Date(c.startDate) &&
                  now <= new Date(c.endDate))
              );

              // 每个服务仅关联一个有效合同：取有效合同列表中的第一个
              const validContract = validContracts.length > 0 ? validContracts[0] : null;

              // 辅助函数：获取合同关联信息
              const getProductContract = (contractId: string): ProductContract | undefined => {
                return productContracts.find(pc => pc.productId === contractModalProduct.id && pc.contractId === contractId);
              };

              const renderContractTable = (contracts: Contract[], title: string, bgClass: string) => (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">{title}（{contracts.length}）</h4>
                  <div className="border border-slate-200 rounded overflow-auto">
                    <table className="w-full text-xs" style={{ minWidth: '1000px' }}>
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left whitespace-nowrap">合同编号</th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">合同名称</th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">合同类型</th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">合同有效期</th>
                          <th className="px-3 py-2 text-right whitespace-nowrap">不含税单价（元）</th>
                          <th className="px-3 py-2 text-right whitespace-nowrap">含税单价（元）</th>
                          <th className="px-3 py-2 text-center whitespace-nowrap">税率（%）</th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">单价说明</th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map((contract) => {
                          const isValid = contract.status === 'active' &&
                            now >= new Date(contract.startDate) &&
                            now <= new Date(contract.endDate);
                          const pc = getProductContract(contract.id);
                          const unitPrice = pc?.unitPrice;
                          const taxRate = pc?.taxRate;
                          const untaxedUnitPrice = unitPrice !== undefined && taxRate !== undefined
                            ? unitPrice / (1 + taxRate / 100)
                            : undefined;
                          const contractType = contract.type === 'purchase' ? '采购合同' :
                                                contract.type === 'service' ? '服务合同' : '租赁合同';
                          return (
                            <tr key={contract.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-medium whitespace-nowrap">{contract.contractNo}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{contract.contractName}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{contractType}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{contract.startDate} ~ {contract.endDate}</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                {untaxedUnitPrice !== undefined ? `¥ ${untaxedUnitPrice.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-green-700 whitespace-nowrap">
                                {unitPrice !== undefined ? `¥ ${unitPrice.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-3 py-2 text-center whitespace-nowrap">
                                {taxRate !== undefined ? `${taxRate}%` : '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">{pc?.priceRemark || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <Badge variant={isValid ? 'success' : 'default'}>
                                  {isValid ? '有效' : (contract.status === 'expired' ? '已过期' : '已停用')}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

              return (
                <div className="space-y-5">
                  {validContract && renderContractTable([validContract], '有效合同', 'bg-blue-50')}
                  {historicalContracts.length > 0 && renderContractTable(historicalContracts, '历史合同', 'bg-slate-50')}
                </div>
              );
            })()}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => {
                setContractModalOpen(false);
                setContractModalProduct(null);
              }}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportPreview([]);
          setImportErrors([]);
        }}
        title="导入预览"
        size="max-w-[1000px]"
      >
        <div className="space-y-4">
          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-600 font-medium mb-2">以下数据存在问题：</div>
              <ul className="text-xs text-red-500 space-y-1">
                {importErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {importPreview.length > 0 ? (
            <>
              <div className="text-sm text-slate-600">
                共 <span className="font-semibold text-blue-600">{importPreview.length}</span> 条数据待导入
              </div>
              <div className="max-h-[400px] overflow-auto border border-slate-200 rounded">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">系统编码</th>
                      <th className="px-3 py-2 text-left font-medium">服务名称</th>
                      <th className="px-3 py-2 text-left font-medium">品牌</th>
                      <th className="px-3 py-2 text-left font-medium">规格型号</th>
                      <th className="px-3 py-2 text-left font-medium">单位</th>
                      <th className="px-3 py-2 text-left font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((item, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-2">{item.code}</td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.brand || '-'}</td>
                        <td className="px-3 py-2">{item.specification || '-'}</td>
                        <td className="px-3 py-2">{item.unit || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={item.status === 'enabled' ? 'text-green-600' : 'text-slate-400'}>
                            {item.status === 'enabled' ? '启用' : '禁用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileSpreadsheet size={48} className="mx-auto mb-3 opacity-50" />
              <p>没有可导入的数据</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setImportModalOpen(false);
              setImportPreview([]);
              setImportErrors([]);
            }}>
              取消
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={importPreview.length === 0}
            >
              确认导入
            </Button>
          </div>
        </div>
      </Modal>

      {/* 从申请单添加服务弹窗 */}
      <Modal
        open={applicationModalOpen}
        onClose={() => {
          setApplicationModalOpen(false);
          setSelectedApplication(null);
          setSelectedDetail(null);
        }}
        title="从申请单添加服务"
        size="max-w-4xl"
      >
        <div className="space-y-4">
          {/* 申请单选择 */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">选择申请单（仅显示已通过的申请）</label>
            <div className="border border-slate-200 rounded max-h-[200px] overflow-y-auto">
              {serviceApplications.filter(pa => pa.status === 'approved').length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  暂无已通过的申请单
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">选择</th>
                      <th className="px-3 py-2 text-left">申请单号</th>
                      <th className="px-3 py-2 text-left">申请人</th>
                      <th className="px-3 py-2 text-left">申请部门</th>
                      <th className="px-3 py-2 text-left">服务种类</th>
                      <th className="px-3 py-2 text-left">通过时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceApplications.filter(pa => pa.status === 'approved').map(app => (
                      <tr
                        key={app.id}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedApplication?.id === app.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="radio"
                            checked={selectedApplication?.id === app.id}
                            onChange={() => setSelectedApplication(app)}
                          />
                        </td>
                        <td className="px-3 py-2">{app.applicationNo}</td>
                        <td className="px-3 py-2">{app.applicant}</td>
                        <td className="px-3 py-2">{app.applicantDept || '-'}</td>
                        <td className="px-3 py-2">{app.details.length} 种</td>
                        <td className="px-3 py-2">{app.approveTime || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 服务明细选择与编辑 */}
          {selectedApplication && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">选择并编辑服务明细</label>
              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">选择</th>
                      <th className="px-3 py-2 text-left">服务名称</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">单位</th>
                      <th className="px-3 py-2 text-left">理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedApplication.details.map((detail) => (
                      <tr
                        key={detail.id}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedDetail?.id === detail.id ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedDetail(detail);
                          setEditingDetailForm({
                            productName: detail.productName,
                            specification: detail.specification || '',
                            unit: detail.unit || '',
                          });
                        }}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="radio"
                            checked={selectedDetail?.id === detail.id}
                            onChange={() => {
                              setSelectedDetail(detail);
                              setEditingDetailForm({
                                productName: detail.productName,
                                specification: detail.specification || '',
                                unit: detail.unit || '',
                              });
                            }}
                          />
                        </td>
                        {selectedDetail?.id === detail.id ? (
                          <>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                className="w-full h-7 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                value={editingDetailForm.productName}
                                onChange={(e) => setEditingDetailForm({ ...editingDetailForm, productName: e.target.value })}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                className="w-full h-7 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                value={editingDetailForm.specification}
                                onChange={(e) => setEditingDetailForm({ ...editingDetailForm, specification: e.target.value })}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                className="w-full h-7 px-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                value={editingDetailForm.unit}
                                onChange={(e) => setEditingDetailForm({ ...editingDetailForm, unit: e.target.value })}
                              />
                            </td>
                            <td className="px-2 py-1">{detail.reason || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2">{detail.productName}</td>
                            <td className="px-3 py-2">{detail.specification || '-'}</td>
                            <td className="px-3 py-2">{detail.unit || '-'}</td>
                            <td className="px-3 py-2">{detail.reason || '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setApplicationModalOpen(false);
              setSelectedApplication(null);
              setSelectedDetail(null);
              setEditingDetailForm({ productName: '', specification: '', unit: '' });
            }}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (!selectedDetail) {
                  alert('请选择服务明细');
                  return;
                }
                if (!editingDetailForm.productName.trim()) {
                  alert('请填写服务名称');
                  return;
                }
                // 根据编辑后的内容填充表单，使用默认前缀'P'生成唯一编码
                const { prefix, suffix, code } = generateServiceCode('P', services);
                setFormData({
                  code,
                  codePrefix: prefix,
                  codeSuffix: suffix,
                  name: editingDetailForm.productName,
                  unit: editingDetailForm.unit || '',
                  specification: editingDetailForm.specification || '',
                  categoryId: '',
                  categoryName: '',
                  isContractItem: false,
                  status: 'enabled',
                  remark: '',
                });
                setEditingItem(null);
                setApplicationModalOpen(false);
                setSelectedApplication(null);
                setSelectedDetail(null);
                setEditingDetailForm({ productName: '', specification: '', unit: '' });
                setModalOpen(true);
              }}
              disabled={!selectedDetail}
            >
              确定
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
