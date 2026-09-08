const fs = require('fs');
let c = fs.readFileSync('src/types/index.ts', 'utf8');

// 1. 加 ProcurementMode 类型
c = c.replace(
  /export type ProcurementDemandStatus = 'draft' \| 'pending' \| 'approved' \| 'rejected' \| 'changed';/,
  `export type ProcurementMode = 'meeting' | 'sign_report' | 'application_form';
// 会议审批 / 签报审批 / 采购项目申请表

export type ProcurementDemandStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'changed';`
);

// 2. 加 ProjectRow 类型（在 ProcurementDemandDetail 后面）
c = c.replace(
  /  procurementDescription\?: string; \/\/ 采购情况说明\n  remark\?: string;\n}\n\n\/\/ 采购需求申请/,
  `  procurementDescription?: string; // 采购情况说明
  remark?: string;
}

// 服务/工程类：项目明细行（多行）
export interface ProjectRow {
  id: string;
  dept: string;
  projectName: string;
  mainContent?: string; // 仅采购项目申请表有
  budgetAmount: number;
  budgetControlAmount: number;
  approvalMeetingName?: string; // 仅会议审批
  approvalDate: string;
  remark?: string; // 仅采购项目申请表·服务类有
}

// 采购需求申请`
);

// 3. ProcurementDemand 加字段
c = c.replace(
  /  procurementType: ProcurementType; \/\/ 采购类型：框架采购\/单次采购\/混选采购/,
  `  procurementType: ProcurementType; // 采购类型：框架采购/单次采购/混选采购
  procurementMode?: ProcurementMode; // 采购方式：会议审批/签报审批/采购项目申请表`
);

c = c.replace(
  /  details: ProcurementDemandDetail\[\];\n  attachments\?: Attachment\[\];/,
  `  details: ProcurementDemandDetail[];
  projectRows?: ProjectRow[]; // 服务/工程类：多行项目明细
  attachments?: Attachment[];`
);

fs.writeFileSync('src/types/index.ts', c);
console.log('Phase 1 types OK');
