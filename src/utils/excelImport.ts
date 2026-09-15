import * as XLSX from 'xlsx';
import type { Product, ProductContract, Contract, ProcurementDemandDetail } from '@/types';

// ============ 导出列定义 ============

/** 清单内采购导出列（单价/税率/合同号锁定，Excel 里灰色标注，导入时被改了会被系统自动覆盖） */
export const IN_COLUMNS = [
  '项目编号',
  '项目名称',
  '产品属性',
  '商品编码',
  '产品类型',
  '产品名称',
  '规格型号',
  '单位',
  '是否在合同清单内',
  '单价(不含税)',
  '单价(含税)',
  '税率(%)',
  '单价备注',
  '采购数量',
];

/** 清单外/新增供应商导出列（所有列用户可改） */
export const OUT_COLUMNS = [
  '项目编号',
  '项目名称',
  '产品属性',
  '商品编码',
  '产品类型',
  '产品名称',
  '规格型号',
  '单位',
  '单价(不含税)',
  '单价(含税)',
  '税率(%)',
  '单价备注',
  '采购数量',
];

// ============ 类型 ============

export type TemplateType = 'within_framework' | 'outside_framework' | 'new_supplier';

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

// ============ 字段映射（双向） ============

/** JS detail 对象 → Excel 行对象 */
function detailToRow(d: ProcurementDemandDetail, isWithin: boolean): Record<string, any> {
  const base: Record<string, any> = {
    '项目编号': d.projectNo || '',
    '项目名称': d.projectName || '',
    '产品属性': d.productAttribute || '',
    '商品编码': d.productCode || '',
    '产品类型': d.productType || '',
    '产品名称': d.productName || '',
    '规格型号': d.specification || '',
    '单位': d.unit || '',
  };
  if (isWithin) {
    base['是否在合同清单内'] = d.isInContractList ? '是' : '否';
  }
  base['单价(不含税)'] = d.unitPriceExcludingTax ?? 0;
  base['单价(含税)'] = d.unitPriceIncludingTax ?? 0;
  base['税率(%)'] = d.taxRate ?? 0;
  base['单价备注'] = d.unitPriceRemark || '';
  base['采购数量'] = d.quantity ?? 0;
  return base;
}

/** Excel 行 → 字段值提取（兼容不同空格/大小写） */
function val(row: any, ...keys: string[]): any {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
    // 尝试 trim 后的 key
    const found = Object.keys(row).find((rk) => rk.trim() === k);
    if (found && row[found] !== undefined && row[found] !== '') return row[found];
  }
  return undefined;
}

// ============ 导出清单 ============

/**
 * 导出需求明细清单（用户已选好的完整数据）
 */
export function exportDetailList(
  details: ProcurementDemandDetail[],
  procurementType: TemplateType,
) {
  const isWithin = procurementType === 'within_framework';
  const columns = isWithin ? IN_COLUMNS : OUT_COLUMNS;

  const rows = details.map((d) => detailToRow(d, isWithin));
  const ws = XLSX.utils.json_to_sheet(rows, { header: columns });

  // 列宽
  ws['!cols'] = columns.map((c) => ({
    wch: c.includes('单价') ? 14 : c.includes('项目') ? 14 : c.includes('名称') ? 18 : c.includes('备注') ? 18 : 12,
  }));

  // 清单内：锁定列加灰色背景（用户改了会被系统覆盖）
  if (isWithin && rows.length > 0) {
    // 锁定列索引：H=单价(不含税) I=单价(含税) J=税率(%)
    // Excel 字母映射：0=A, 7=H, 8=I, 9=J
    const lockedColIdx = [7, 8, 9];
    for (let r = 1; r <= rows.length; r++) {
      lockedColIdx.forEach((ci) => {
        const addr = XLSX.utils.encode_cell({ r, c: ci });
        const cell = ws[addr];
        if (cell) {
          cell.s = {
            fill: { patternType: 'solid', fgColor: { rgb: 'F0F0F0' } },
            font: { color: { rgb: '999999' } },
          };
        }
      });
    }
    ws['!cols'][7].wch = 14;
    ws['!cols'][8].wch = 14;
    ws['!cols'][9].wch = 12;
  }

  // 说明 sheet
  const notes = isWithin
    ? [
        ['采购需求明细清单 - 清单内采购'],
        [''],
        ['使用说明：'],
        ['1. 本表为系统导出的已选物资清单，修改后可通过"导入清单"回填'],
        ['2. ✅ 可修改字段：项目编号、项目名称、产品属性、单价备注、采购数量'],
        ['3. 🔒 锁定列（灰色）：单价(不含税)、单价(含税)、税率  — 由系统合同价自动回填，Excel 里改了也会被覆盖'],
        ['4. ✏️ 可新增行：在末尾追加新行，商品编码填系统存在的编码 + 填采购数量'],
        ['5. 🗑️ 可删除行：Excel 里删掉的行，导入后明细也去掉'],
        [''],
        ['校验规则：'],
        ['- 商品编码必须在物资档案中存在'],
        ['- 采购数量必须大于 0'],
        ['- 清单内采购商品必须有有效框架合同'],
        ['- 同一批次 Excel 中不允许重复商品编码'],
      ]
    : [
        ['采购需求明细清单 - 清单外/新增供应商采购'],
        [''],
        ['使用说明：'],
        ['1. 本表为系统导出的已选物资清单，修改后可通过"导入清单"回填'],
        ['2. ✅ 可修改字段：项目编号、项目名称、产品属性、单价(不含税)、单价(含税)、税率、单价备注、采购数量（全部可改）'],
        ['3. ✏️ 可新增行：在末尾追加新行，商品编码填系统存在的编码 + 填数量/单价/税率'],
        ['4. 🗑️ 可删除行：Excel 里删掉的行，导入后明细也去掉'],
        [''],
        ['校验规则：'],
        ['- 商品编码必须在物资档案中存在'],
        ['- 采购数量必须大于 0'],
        ['- 清单外/新增供应商场景单价和税率必填'],
        ['- 同一批次 Excel 中不允许重复商品编码'],
      ];

  const wsNotes = XLSX.utils.aoa_to_sheet(notes);
  wsNotes['!cols'] = [{ wch: 70 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '采购明细');
  XLSX.utils.book_append_sheet(wb, wsNotes, '填写说明');

  const typeLabel = isWithin
    ? '清单内'
    : procurementType === 'new_supplier'
    ? '新增供应商'
    : '清单外';
  const time = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
  const fileName = `需求明细清单_${typeLabel}_${time}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ============ 解析 + 校验（导入） ============

export interface ImportContext {
  products: Product[];
  productContracts: ProductContract[];
  contracts: Contract[];
}

/**
 * 解析 Excel 文件并逐行校验
 * （整体替换模式：不需要与当前表单已有明细对比重复）
 */
export async function parseAndValidateExcel(
  file: File,
  procurementType: TemplateType,
  ctx: ImportContext,
): Promise<RowResult[]> {
  const isWithin = procurementType === 'within_framework';
  const requiredCols = isWithin ? IN_COLUMNS : OUT_COLUMNS;

  // 读取文件
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellStyles: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' }) as any[];

  // L1 文件级校验
  if (jsonData.length === 0) {
    throw new Error('Excel 中无有效数据行（只有表头或全空白）');
  }
  const headers = Object.keys(jsonData[0]);
  const missingCols = requiredCols.filter((c) => !headers.includes(c) && !headers.find((h) => h.trim() === c));
  if (missingCols.length > 0) {
    throw new Error(`Excel 缺少必要列：${missingCols.join('、')}，请使用从本系统导出的清单文件`);
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
    const rowNum = idx + 2;
    const errors: string[] = [];
    const warnings: string[] = [];

    const productCodeRaw = val(row, '商品编码');
    const productCode = productCodeRaw ? String(productCodeRaw).trim() : '';
    const qtyRaw = val(row, '采购数量');
    const quantity = Number(qtyRaw);

    // L2 行级必填校验
    if (!productCode) {
      errors.push('商品编码不能为空');
    }
    if (qtyRaw === '' || qtyRaw === undefined || qtyRaw === null) {
      errors.push('采购数量不能为空');
    } else if (quantity <= 0) {
      errors.push('采购数量必须大于 0');
    }

    // 清单外：单价(含税) + 税率 必填
    let unitPriceExcludingTax = 0;
    let unitPriceIncludingTax = 0;
    let taxRate = 13;
    if (!isWithin) {
      const priceRaw = val(row, '单价(含税)');
      const rateRaw = val(row, '税率(%)');
      const exclRaw = val(row, '单价(不含税)');

      if ((priceRaw === '' || priceRaw === undefined) && (exclRaw === '' || exclRaw === undefined)) {
        errors.push('单价(不含税)和单价(含税)至少填一个');
      } else {
        // 有含税单价 → 倒推不含税
        if (priceRaw !== '' && priceRaw !== undefined) {
          unitPriceIncludingTax = Number(priceRaw);
          if (unitPriceIncludingTax < 0) errors.push('单价(含税)不能为负数');
        }
      }
      if (rateRaw === '' || rateRaw === undefined) {
        errors.push('税率(%)不能为空');
      } else {
        taxRate = Number(rateRaw);
        if (taxRate < 0 || taxRate > 100) errors.push('税率(%)必须在 0-100 之间');
      }
      // 不含税单价：如果 Excel 里给了，用给的；否则从含税倒推
      if (exclRaw !== '' && exclRaw !== undefined) {
        unitPriceExcludingTax = Number(exclRaw);
      } else if (unitPriceIncludingTax > 0) {
        unitPriceExcludingTax = +(unitPriceIncludingTax / (1 + taxRate / 100)).toFixed(4);
      }
    }

    // L3 业务匹配校验
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
      // 先解析 Excel 里用户填的单价（可能被改了）
      if (isWithin) {
        // ============ 清单内：锁定列处理 ============
        const valid = getValidContractForProduct(product.id);
        const pc = valid?.pc;
        const c = valid?.contract;
        const systemRate = pc?.taxRate ?? 13;
        const systemIncPrice = pc?.unitPrice ?? 0;
        const systemExclPrice = systemIncPrice > 0 ? +(systemIncPrice / (1 + systemRate / 100)).toFixed(4) : 0;

        // 读取 Excel 里用户可能改了的值
        const userExclRaw = val(row, '单价(不含税)');
        const userIncRaw = val(row, '单价(含税)');
        const userRateRaw = val(row, '税率(%)');

        // 对比：如果用户改了（且系统有合同价）→ 警告 + 自动覆盖
        if (systemIncPrice > 0) {
          if (userExclRaw !== '' && userExclRaw !== undefined && Number(userExclRaw) !== systemExclPrice) {
            warnings.push(`单价(不含税)已被系统合同价覆盖（Excel 填 ${Number(userExclRaw).toFixed(2)} → 系统合同价 ${systemExclPrice.toFixed(2)}）`);
          }
          if (userIncRaw !== '' && userIncRaw !== undefined && Number(userIncRaw) !== systemIncPrice) {
            warnings.push(`单价(含税)已被系统合同价覆盖（Excel 填 ${Number(userIncRaw).toFixed(2)} → 系统合同价 ${systemIncPrice.toFixed(2)}）`);
          }
          if (userRateRaw !== '' && userRateRaw !== undefined && Number(userRateRaw) !== systemRate) {
            warnings.push(`税率已被系统合同价覆盖（Excel 填 ${userRateRaw}% → 系统合同价 ${systemRate}%）`);
          }
        }

        // 自动回填物资档案字段（加新行场景 / 用户删了字段）
        const autoFilled: string[] = [];
        if (!val(row, '产品名称')) autoFilled.push('产品名称');
        if (!val(row, '规格型号')) autoFilled.push('规格型号');
        if (!val(row, '单位')) autoFilled.push('单位');
        if (!val(row, '产品类型')) autoFilled.push('产品类型');
        if (autoFilled.length > 0) {
          warnings.push(`已自动从物资档案回填：${autoFilled.join('、')}`);
        }

        // 项目信息：用户改了就用用户的，没改就空着让用户继续填
        const projectNo = String(val(row, '项目编号') || '');
        const projectName = String(val(row, '项目名称') || '');
        const productAttribute = String(val(row, '产品属性') || '');
        const unitPriceRemark = String(val(row, '单价备注') || '合同固定单价');

        const amountExcludingTax = +(systemExclPrice * quantity).toFixed(2);
        const taxAmt = +(amountExcludingTax * (systemRate / 100)).toFixed(2);
        const amountInc = +(amountExcludingTax + taxAmt).toFixed(2);

        detail = {
          productId: product.id,
          productCode: product.code,
          projectNo,
          projectName,
          productAttribute: productAttribute || undefined,
          productName: product.name,
          productType: (product as any).categoryName || '',
          specification: (product as any).specification || '',
          unit: product.unit,
          isContractItem: true,
          isInContractList: true,
          contractId: c?.id,
          contractNo: c?.contractNo,
          contractExpiryDate: c ? `${c.startDate} ~ ${c.endDate}` : '',
          unitPriceExcludingTax: systemExclPrice,
          unitPriceIncludingTax: systemIncPrice,
          taxRate: systemRate,
          unitPriceRemark,
          quantity,
          amountExcludingTax,
          taxAmount: taxAmt,
          amountIncludingTax: amountInc,
        };
      } else {
        // ============ 清单外 / 新增供应商 ============
        // 自动回填物资档案字段（加新行场景 / 用户删了字段）
        const autoFilled: string[] = [];
        if (!val(row, '产品名称')) autoFilled.push('产品名称');
        if (!val(row, '规格型号')) autoFilled.push('规格型号');
        if (!val(row, '单位')) autoFilled.push('单位');
        if (!val(row, '产品类型')) autoFilled.push('产品类型');
        if (autoFilled.length > 0) {
          warnings.push(`已自动从物资档案回填：${autoFilled.join('、')}`);
        }

        const projectNo = String(val(row, '项目编号') || '');
        const projectName = String(val(row, '项目名称') || '');
        const productAttribute = String(val(row, '产品属性') || '');
        const unitPriceRemark = String(val(row, '单价备注') || '');

        // 如果只给了含税单价，倒推不含税；如果都给了，优先不含税
        const exclRaw = val(row, '单价(不含税)');
        const incRaw = val(row, '单价(含税)');
        let finalExcl: number;
        let finalInc: number;
        if (exclRaw !== '' && exclRaw !== undefined) {
          finalExcl = Number(exclRaw);
          finalInc = +(finalExcl * (1 + taxRate / 100)).toFixed(4);
        } else {
          finalInc = Number(incRaw);
          finalExcl = +(finalInc / (1 + taxRate / 100)).toFixed(4);
        }

        const amountExcludingTax = +(finalExcl * quantity).toFixed(2);
        const taxAmt = +(amountExcludingTax * (taxRate / 100)).toFixed(2);
        const amountInc = +(amountExcludingTax + taxAmt).toFixed(2);

        detail = {
          productId: product.id,
          productCode: product.code,
          projectNo,
          projectName,
          productAttribute: productAttribute || undefined,
          productName: product.name,
          productType: (product as any).categoryName || '',
          specification: (product as any).specification || '',
          unit: product.unit,
          isContractItem: false,
          isInContractList: false,
          unitPriceExcludingTax: finalExcl,
          unitPriceIncludingTax: finalInc,
          taxRate,
          unitPriceRemark,
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
