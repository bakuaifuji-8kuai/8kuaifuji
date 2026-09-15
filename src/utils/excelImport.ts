import * as XLSX from 'xlsx';
import type { Product, ProductContract, Contract, ProcurementDemandDetail } from '@/types';

type TemplateType = 'within_framework' | 'outside_framework' | 'new_supplier';

// ============ 模板定义 ============

/** 清单内采购模板列（用户只填商品编码 + 采购数量，其余系统自动回填） */
export const IN_TEMPLATE_COLUMNS = [
  '商品编码',
  '采购数量',
];

/** 清单外采购模板列（用户填商品编码 + 数量 + 单价 + 税率） */
export const OUT_TEMPLATE_COLUMNS = [
  '商品编码',
  '采购数量',
  '单价(含税)',
  '税率(%)',
];

// ============ 类型 ============

export type RowStatus = 'success' | 'warning' | 'error';

export interface RowResult {
  /** Excel 中的行号（从 2 开始，第 1 行是表头） */
  rowIndex: number;
  status: RowStatus;
  /** 错误（阻断导入） */
  errors: string[];
  /** 警告（不阻断，自动修正） */
  warnings: string[];
  /** 解析后的明细数据 — 只有 status !== 'error' 才有 */
  detail?: Partial<ProcurementDemandDetail>;
}

// ============ 导出模板 ============

/**
 * 导出采购需求明细 Excel 模板
 */
export function exportDemandTemplate(procurementType: TemplateType) {
  // new_supplier 等同于清单外：用户自己填单价
  const isWithin = procurementType === 'within_framework';
  const columns = isWithin ? IN_TEMPLATE_COLUMNS : OUT_TEMPLATE_COLUMNS;

  // 1 行示例数据
  const exampleRow: Record<string, any> = isWithin
    ? { '商品编码': 'PRD001', '采购数量': 5 }
    : { '商品编码': 'PRD001', '采购数量': 5, '单价(含税)': 100, '税率(%)': 13 };

  // 数据 sheet
  const dataRows: Record<string, any>[] = [exampleRow];
  const wsData = XLSX.utils.json_to_sheet(dataRows, { header: columns });

  // 说明 sheet
  const notes = isWithin
    ? [
        ['采购需求明细导入说明（清单内采购）'],
        [''],
        ['字段说明：'],
        ['商品编码（必填）：物资档案中的商品编码，精确匹配'],
        ['采购数量（必填）：必须大于 0'],
        [''],
        ['自动回填：产品名称、规格型号、单位、合同编码、单价(不含税)、单价(含税)、税率均由系统根据合同自动回填，以系统最新数据为准'],
        [''],
        ['校验规则：'],
        ['1. 商品编码必须在物资档案中存在'],
        ['2. 商品必须有有效框架合同（清单内采购要求）'],
        ['3. 同一批次 Excel 中不允许重复商品编码'],
        ['4. 与当前表单已选商品不能重复'],
      ]
    : [
        ['采购需求明细导入说明（清单外采购）'],
        [''],
        ['字段说明：'],
        ['商品编码（必填）：物资档案中的商品编码，精确匹配'],
        ['采购数量（必填）：必须大于 0'],
        ['单价(含税)（必填）：清单外采购需手动填写含税单价'],
        ['税率(%)(必填)：如 13、6、9'],
        [''],
        ['自动回填：产品名称、规格型号、单位由物资档案自动回填'],
        [''],
        ['校验规则：'],
        ['1. 商品编码必须在物资档案中存在'],
        ['2. 同一批次 Excel 中不允许重复商品编码'],
        ['3. 与当前表单已选商品不能重复'],
      ];

  const wsNotes = XLSX.utils.aoa_to_sheet(notes);
  wsNotes['!cols'] = [{ wch: 60 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsData, '采购明细');
  XLSX.utils.book_append_sheet(wb, wsNotes, '填写说明');

  // 列宽
  wsData['!cols'] = isWithin
    ? [{ wch: 18 }, { wch: 12 }]
    : [{ wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];

  const fileName = isWithin
    ? '采购需求明细模板_清单内.xlsx'
    : procurementType === 'new_supplier'
    ? '采购需求明细模板_新增供应商.xlsx'
    : '采购需求明细模板_清单外.xlsx';
  XLSX.writeFile(wb, fileName);
}

// ============ 解析 + 校验 ============

export interface ImportContext {
  products: Product[];
  productContracts: ProductContract[];
  contracts: Contract[];
  /** 当前表单已有明细的商品编码，检查重复 */
  existingDetailProductCodes: string[];
}

/**
 * 解析 Excel 文件并逐行校验
 */
export async function parseAndValidateExcel(
  file: File,
  procurementType: TemplateType,
  ctx: ImportContext,
): Promise<RowResult[]> {
  const isWithin = procurementType === 'within_framework';
  const requiredCols = isWithin ? IN_TEMPLATE_COLUMNS : OUT_TEMPLATE_COLUMNS;

  // 读取文件
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' }) as any[];

  // 表头校验
  if (jsonData.length === 0) {
    throw new Error('Excel 中无有效数据行');
  }
  const headers = Object.keys(jsonData[0]);
  const missingCols = requiredCols.filter((c) => !headers.includes(c));
  if (missingCols.length > 0) {
    throw new Error(`模板缺少必要列：${missingCols.join('、')}，请使用最新模板`);
  }

  // 逐行校验
  const results: RowResult[] = [];
  const seenCodesInBatch = new Set<string>();

  // 合同有效期判断辅助
  const getValidContractForProduct = (productId: string): { pc: ProductContract; contract: Contract } | null => {
    const now = new Date();
    const pcs = ctx.productContracts.filter((pc) => pc.productId === productId);
    for (const pc of pcs) {
      const c = ctx.contracts.find((ct) => ct.id === pc.contractId);
      if (!c) continue;
      if (c.status !== 'active') continue;
      if (c.startDate && new Date(c.startDate) > now) continue;
      if (c.endDate && new Date(c.endDate) < now) continue;
      return { pc, contract: c };
    }
    return null;
  };

  jsonData.forEach((row, idx) => {
    const rowNum = idx + 2; // Excel 行号（1-based，第 1 行表头）
    const errors: string[] = [];
    const warnings: string[] = [];

    const productCode = String(row['商品编码'] ?? '').trim();
    const qtyRaw = row['采购数量'];
    const quantity = Number(qtyRaw);

    // L2 行级必填校验
    if (!productCode) {
      errors.push('商品编码不能为空');
    }
    if (!qtyRaw && qtyRaw !== 0) {
      errors.push('采购数量不能为空');
    } else if (quantity <= 0) {
      errors.push('采购数量必须大于 0');
    }

    // 清单外：单价(含税) + 税率 必填
    let unitPriceIncludingTax = 0;
    let taxRate = 13;
    if (!isWithin) {
      const priceRaw = row['单价(含税)'];
      const rateRaw = row['税率(%)'];
      if (!priceRaw && priceRaw !== 0) {
        errors.push('单价(含税)不能为空');
      } else {
        unitPriceIncludingTax = Number(priceRaw);
        if (unitPriceIncludingTax < 0) errors.push('单价(含税)不能为负数');
      }
      if (!rateRaw && rateRaw !== 0) {
        errors.push('税率(%)不能为空');
      } else {
        taxRate = Number(rateRaw);
        if (taxRate < 0 || taxRate > 100) errors.push('税率(%)必须在 0-100 之间');
      }
    }

    // L3 业务匹配校验（如果必填项都 OK 了）
    let product: Product | undefined;
    if (productCode) {
      product = ctx.products.find((p) => p.code === productCode);
      if (!product) {
        errors.push(`商品编码 ${productCode} 在物资档案中不存在`);
      } else {
        // 同批次 Excel 内重复
        if (seenCodesInBatch.has(productCode)) {
          errors.push(`商品编码 ${productCode} 在本次 Excel 中已存在（重复行）`);
        } else {
          seenCodesInBatch.add(productCode);
        }
        // 与当前表单已有明细重复
        if (ctx.existingDetailProductCodes.includes(productCode)) {
          errors.push(`商品 ${productCode} 已存在于当前明细中，请删除后再导入`);
        }

        // 清单内：必须有有效合同
        if (isWithin) {
          const validContract = getValidContractForProduct(product.id);
          if (!validContract) {
            errors.push(`商品 ${productCode} 无有效框架合同，不能用于清单内采购`);
          }
        }
      }
    }

    // 计算状态
    const status: RowResult['status'] = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success';

    // 构建 detail（只有非 error 才构建）
    let detail: Partial<ProcurementDemandDetail> | undefined;
    if (status !== 'error' && product) {
      if (isWithin) {
        const valid = getValidContractForProduct(product.id);
        const pc = valid?.pc;
        const c = valid?.contract;
        const unitPriceExcludingTax = pc?.unitPrice
          ? +(pc.unitPrice / (1 + (pc.taxRate ?? 13) / 100)).toFixed(4)
          : 0;
        const rate = pc?.taxRate ?? 13;
        const amountExcludingTax = +(unitPriceExcludingTax * quantity).toFixed(2);
        const taxAmt = +(amountExcludingTax * (rate / 100)).toFixed(2);
        const amountInc = +(amountExcludingTax + taxAmt).toFixed(2);
        detail = {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          productType: (product as any).categoryName || '',
          specification: (product as any).specification || '',
          unit: product.unit,
          isContractItem: true,
          isInContractList: true,
          contractId: c?.id,
          contractNo: c?.contractNo,
          contractExpiryDate: c ? `${c.startDate} ~ ${c.endDate}` : '',
          unitPriceExcludingTax,
          unitPriceIncludingTax: pc?.unitPrice ?? 0,
          taxRate: rate,
          unitPriceRemark: '合同固定单价',
          quantity,
          amountExcludingTax,
          taxAmount: taxAmt,
          amountIncludingTax: amountInc,
        };
      } else {
        // 清单外
        const unitPriceExcludingTax = +(unitPriceIncludingTax / (1 + taxRate / 100)).toFixed(4);
        const amountExcludingTax = +(unitPriceExcludingTax * quantity).toFixed(2);
        const taxAmt = +(amountExcludingTax * (taxRate / 100)).toFixed(2);
        const amountInc = +(amountExcludingTax + taxAmt).toFixed(2);
        detail = {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          productType: (product as any).categoryName || '',
          specification: (product as any).specification || '',
          unit: product.unit,
          isContractItem: false,
          isInContractList: false,
          unitPriceExcludingTax,
          unitPriceIncludingTax,
          taxRate,
          quantity,
          amountExcludingTax,
          taxAmount: taxAmt,
          amountIncludingTax: amountInc,
        };
      }
    }

    results.push({ rowIndex: rowNum, status, errors, warnings, detail });
  });

  return results;
}
