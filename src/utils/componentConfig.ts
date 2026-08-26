import type { ComponentMeta, ComponentType } from '@/types';

export const componentLibrary: ComponentMeta[] = [
  // 基础组件
  {
    type: 'heading',
    label: '标题',
    category: 'basic',
    icon: 'Heading',
    description: '用于章节标题，支持H1/H2/H3',
    defaultProps: {
      level: 2,
      content: '标题',
    },
  },
  {
    type: 'paragraph',
    label: '段落',
    category: 'basic',
    icon: 'AlignLeft',
    description: '普通文本描述区域',
    defaultProps: {
      content: '这是一段描述文本...',
    },
  },
  {
    type: 'text',
    label: '单行输入',
    category: 'basic',
    icon: 'TextCursor',
    description: '短文本输入框',
    defaultProps: {
      label: '字段名',
      fieldName: 'field',
      placeholder: '请输入',
      required: false,
      width: 'full',
    },
  },
  {
    type: 'textarea',
    label: '多行输入',
    category: 'basic',
    icon: 'FileText',
    description: '长文本输入框',
    defaultProps: {
      label: '字段名',
      fieldName: 'field',
      placeholder: '请输入详细内容',
      required: false,
      width: 'full',
    },
  },
  {
    type: 'number',
    label: '数字输入',
    category: 'basic',
    icon: 'Hash',
    description: '数值输入，支持小数和单位',
    defaultProps: {
      label: '金额',
      fieldName: 'amount',
      placeholder: '0.00',
      required: false,
      min: 0,
      max: 999999,
      decimal: 2,
      unit: '元',
      format: 'number',
      width: 'half',
    },
  },
  {
    type: 'date',
    label: '日期选择',
    category: 'basic',
    icon: 'Calendar',
    description: '日期选择器',
    defaultProps: {
      label: '日期',
      fieldName: 'date',
      required: false,
      dateFormat: 'YYYY-MM-DD',
      defaultToday: false,
      width: 'half',
    },
  },
  {
    type: 'select',
    label: '下拉选择',
    category: 'basic',
    icon: 'ChevronDown',
    description: '下拉选择框，支持搜索',
    defaultProps: {
      label: '选择',
      fieldName: 'select',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
      ],
      required: false,
      searchable: false,
      multiple: false,
      width: 'half',
    },
  },
  {
    type: 'checkbox',
    label: '勾选框',
    category: 'basic',
    icon: 'CheckSquare',
    description: '单个勾选框',
    defaultProps: {
      label: '是否同意',
      fieldName: 'agree',
      required: false,
    },
  },
  {
    type: 'radio',
    label: '单选组',
    category: 'basic',
    icon: 'CircleDot',
    description: '多选一',
    defaultProps: {
      label: '选择',
      fieldName: 'radio',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
      ],
      required: false,
    },
  },
  {
    type: 'checkboxGroup',
    label: '复选组',
    category: 'basic',
    icon: 'CheckCircle',
    description: '多选多',
    defaultProps: {
      label: '选择',
      fieldName: 'checkboxGroup',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
      required: false,
    },
  },
  // 高级组件
  {
    type: 'attachment',
    label: '附件上传',
    category: 'advanced',
    icon: 'Paperclip',
    description: '上传附件文件',
    defaultProps: {
      label: '附件',
      fieldName: 'attachment',
      acceptTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxFileSize: 10,
      maxFileCount: 5,
      required: false,
      width: 'full',
    },
  },
  {
    type: 'image',
    label: '图片上传',
    category: 'advanced',
    icon: 'Image',
    description: '上传图片',
    defaultProps: {
      label: '图片',
      fieldName: 'image',
      maxFileSize: 5,
      allowCrop: false,
      required: false,
      width: 'full',
    },
  },
  {
    type: 'signature',
    label: '签字板',
    category: 'advanced',
    icon: 'Pen',
    description: '手写签名',
    defaultProps: {
      label: '签名',
      fieldName: 'signature',
      penColor: '#000000',
      penWidth: 2,
      allowClear: true,
    },
  },
  {
    type: 'stamp',
    label: '印章区',
    category: 'advanced',
    icon: 'Award',
    description: '盖章位置标记',
    defaultProps: {
      label: '盖章处',
      fieldName: 'stamp',
    },
  },
  {
    type: 'table',
    label: '动态表格',
    category: 'advanced',
    icon: 'Table',
    description: '动态明细表格',
    defaultProps: {
      label: '明细清单',
      fieldName: 'table',
      columns: [
        { key: 'name', title: '名称', type: 'text', required: true },
        { key: 'qty', title: '数量', type: 'number', required: true },
        { key: 'price', title: '单价', type: 'number', required: true },
      ],
      minRows: 1,
      maxRows: 50,
      allowAddRow: true,
      allowDeleteRow: true,
      sumColumn: 'price',
      width: 'full',
    },
  },
  {
    type: 'divider',
    label: '分隔线',
    category: 'advanced',
    icon: 'Minus',
    description: '水平分隔线',
    defaultProps: {},
  },
  {
    type: 'alert',
    label: '提示框',
    category: 'advanced',
    icon: 'AlertCircle',
    description: '说明/警告提示',
    defaultProps: {
      alertType: 'info',
      content: '这是一条提示信息',
    },
  },
  // 布局组件
  {
    type: 'col2',
    label: '两列布局',
    category: 'layout',
    icon: 'Columns',
    description: '左右分栏布局，支持左右区域独立放置组件',
    defaultProps: {
      leftChildren: [],
      rightChildren: [],
      leftWidth: '50%',
      rightWidth: '50%',
      gap: '16px',
    },
  },
  {
    type: 'section',
    label: '分节卡片',
    category: 'layout',
    icon: 'LayoutList',
    description: '带标题的分组区域，内部可放置多个组件',
    defaultProps: {
      title: '章节标题',
      children: [],
    },
  },
  {
    type: 'tab',
    label: '页签切换',
    category: 'layout',
    icon: 'Layers',
    description: '多页签切换，每个页签可独立放置组件',
    defaultProps: {
      activeTab: 0,
      tabs: [
        { label: '页签1', children: [] },
        { label: '页签2', children: [] },
      ],
    },
  },
  // 合同专属组件
  {
    type: 'contractNo',
    label: '合同编号',
    category: 'contract',
    icon: 'FileSignature',
    description: '合同编号字段',
    defaultProps: {
      label: '合同编号',
      fieldName: 'contractNo',
      placeholder: '系统自动生成或手动输入',
      required: true,
      width: 'half',
    },
  },
  {
    type: 'signDate',
    label: '签订日期',
    category: 'contract',
    icon: 'CalendarCheck',
    description: '合同签订日期',
    defaultProps: {
      label: '签订日期',
      fieldName: 'signDate',
      required: true,
      dateFormat: 'YYYY-MM-DD',
      defaultToday: false,
      width: 'half',
    },
  },
  {
    type: 'partyA',
    label: '甲方信息',
    category: 'contract',
    icon: 'Building',
    description: '甲方名称/地址/联系人',
    defaultProps: {
      label: '甲方',
      fieldName: 'partyA',
      partyRole: '甲方',
      contactFields: true,
      required: true,
      width: 'full',
    },
  },
  {
    type: 'partyB',
    label: '乙方信息',
    category: 'contract',
    icon: 'User',
    description: '乙方名称/地址/联系人',
    defaultProps: {
      label: '乙方',
      fieldName: 'partyB',
      partyRole: '乙方',
      contactFields: true,
      required: true,
      width: 'full',
    },
  },
  {
    type: 'contractAmount',
    label: '合同金额',
    category: 'contract',
    icon: 'Yen',
    description: '合同总金额',
    defaultProps: {
      label: '合同金额',
      fieldName: 'contractAmount',
      unit: '元',
      format: 'currency',
      amountInWords: true,
      required: true,
      width: 'full',
    },
  },
  {
    type: 'contractPeriod',
    label: '合同期限',
    category: 'contract',
    icon: 'Clock',
    description: '合同起止日期',
    defaultProps: {
      label: '合同期限',
      fieldName: 'contractPeriod',
      required: true,
      width: 'full',
    },
  },
  {
    type: 'paymentTerms',
    label: '付款条件',
    category: 'contract',
    icon: 'CreditCard',
    description: '付款节点/比例',
    defaultProps: {
      label: '付款条件',
      fieldName: 'paymentTerms',
      paymentNodes: [
        { label: '合同签订', ratio: 30 },
        { label: '验收合格', ratio: 60 },
        { label: '质保期满', ratio: 10 },
      ],
      width: 'full',
    },
  },
  {
    type: 'liquidatedDamages',
    label: '违约责任',
    category: 'contract',
    icon: 'Shield',
    description: '违约条款描述',
    defaultProps: {
      label: '违约责任',
      fieldName: 'liquidatedDamages',
      content: '任何一方违反本合同约定的，应承担违约责任...',
      interestRate: 0.05,
      width: 'full',
    },
  },
  {
    type: 'disputeResolution',
    label: '争议解决',
    category: 'contract',
    icon: 'Scale',
    description: '仲裁/诉讼选择',
    defaultProps: {
      label: '争议解决',
      fieldName: 'disputeResolution',
      disputeType: 'litigation',
      width: 'full',
    },
  },
  {
    type: 'signArea',
    label: '签署区',
    category: 'contract',
    icon: 'Hand',
    description: '双方签字盖章区',
    defaultProps: {
      label: '签署',
      fieldName: 'signArea',
      width: 'full',
    },
  },
];

export function getComponentMeta(type: ComponentType): ComponentMeta | undefined {
  return componentLibrary.find((c) => c.type === type);
}

export function getComponentsByCategory(category: string): ComponentMeta[] {
  return componentLibrary.filter((c) => c.category === category);
}

export function generateId(): string {
  return 'comp_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

export function createComponent(type: ComponentType) {
  const meta = getComponentMeta(type);
  if (!meta) return null;
  return {
    id: generateId(),
    type,
    props: JSON.parse(JSON.stringify(meta.defaultProps)),
    order: 0,
    locked: false,
  };
}
