/**
 * 服务/施工类验收模板注册中心
 *
 * 设计：FieldSchema 驱动渲染，FormBody / ViewBody 共用同一套模板数据。
 * 新增模板 = 往下面数组里加一条，不用改渲染代码。
 */

// ========== 字段类型定义 ==========
export type FieldType =
  | 'text'           // 单行输入（可只读）
  | 'textarea'       // 多行文本
  | 'date'           // 日期选择
  | 'boolean_radio'; // 二选一互斥勾（如 合格/不合格）

export interface FieldSchema {
  key: string;                    // 对应 ProcurementInspection 上的字段 key
  label: string;                  // 左侧 Label 文案
  type: FieldType;
  // ===== text 专有 =====
  readOnly?: boolean;             // 只读展示（从合同自动带出，不可改）
  autoFill?: boolean;             // 新建验收时自动从合同/需求预填
  // ===== textarea 专有 =====
  rows?: number;
  placeholder?: string;
  // ===== boolean_radio 专有 =====
  labels?: [string, string];      // [正向勾文案, 反向勾文案]，正向 = true，反向 = false
}

// ========== 模板定义 ==========
export interface InspectionTemplate {
  id: string;
  name: string;
  applicableType: 'service' | 'both'; // 适用验收类型
  description: string;                // 简短说明，下拉选项副标题
  approvalFlow: string[];             // 审批流程节点（Banner 渲染用）
  fields: FieldSchema[];
  builtin: boolean;
}

// ========== 注册中心（当前 1 种，后续扩展只加这里）==========
export const INSPECTION_TEMPLATES: InspectionTemplate[] = [
  {
    id: 'generic',
    name: '通用验收表',
    applicableType: 'service',
    description: '标准供应商验收表：供应商/项目/时间/内容 + 三级审批意见',
    approvalFlow: ['部门会签意见', '综合管理部审核', '公司领导审批'],
    fields: [
      { key: 'supplierName', label: '供应商名称', type: 'text', readOnly: true },
      { key: 'acceptanceItems', label: '验收项目', type: 'text', autoFill: true },
      { key: 'acceptanceTime', label: '验收时间', type: 'date' },
      { key: 'acceptanceContent', label: '验收内容', type: 'textarea', rows: 3,
        placeholder: '请描述服务/施工的验收情况，如完成的里程碑、质量情况、存在的问题等' },
      { key: 'isQualified', label: '验收结论', type: 'boolean_radio', labels: ['合格', '不合格'] },
      { key: 'deptCountersignOpinion', label: '部门会签意见', type: 'textarea', rows: 2,
        placeholder: '需求部门负责人填写会签意见' },
      { key: 'adminDeptOpinion', label: '综合管理部意见', type: 'textarea', rows: 2,
        placeholder: '综合管理部审核意见' },
      { key: 'leaderOpinion', label: '公司领导意见', type: 'textarea', rows: 2,
        placeholder: '公司领导最终批示' },
    ],
    builtin: true,
  },
];

// ========== 工具函数 ==========
export function findTemplate(id?: string): InspectionTemplate | undefined {
  if (!id) return undefined;
  return INSPECTION_TEMPLATES.find((t) => t.id === id);
}

// 验收表底部固定备注（Word 模板里的两条）
export const TEMPLATE_FOOTER_NOTES = [
  '1. 物资采购涉及固定资产、安装服务的，由需求部门组织相关部门进行验收，验收合格的作为付款依据；',
  '2. 其他物资采购凭相关部门签字确认的入库单作为付款依据。',
];
