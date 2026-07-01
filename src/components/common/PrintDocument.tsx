import { useEffect, useRef } from 'react';

export interface PrintDetailRow {
  productCode?: string;
  productName?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  positionName?: string;
  batchNo?: string;
  transferOrderNo?: string;
  remark?: string;
  [key: string]: any;
}

export interface PrintDocumentProps {
  title: string;
  orderNo: string;
  orderType?: string;
  orderDate?: string;
  operator?: string;
  warehouseName?: string;
  custodian?: string;
  personInCharge?: string;
  inspector?: string;
  salesperson?: string;
  creator?: string;
  remark?: string;
  details: PrintDetailRow[];
  detailColumns?: { key: string; label: string; align?: 'left' | 'center' | 'right' }[];
  batchInfo?: { batchNo: string; quantity: number; remainingQuantity: number }[];
  printTrigger?: number; // 用于触发打印的计数器，每次递增触发一次打印
  onPrintComplete?: () => void; // 打印完成回调
}

function buildPrintHTML(props: PrintDocumentProps): string {
  const {
    title, orderNo, orderType, orderDate, operator, warehouseName,
    custodian, personInCharge, inspector, salesperson, creator,
    remark, details, batchInfo,
    detailColumns = [
      { key: 'index', label: '序号', align: 'center' },
      { key: 'productCode', label: '物资编码' },
      { key: 'productName', label: '物资名称' },
      { key: 'specification', label: '规格型号' },
      { key: 'unit', label: '单位' },
      { key: 'quantity', label: '数量', align: 'right' },
      { key: 'batchNo', label: '批次号' },
    ],
  } = props;

  const totalQty = details.reduce((a, b) => a + (Number(b.quantity) || 0), 0);
  const quantityIndex = detailColumns.findIndex(c => c.key === 'quantity');

  const now = new Date();
  const printTime = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // 构建单据信息区
  let infoRows = '';
  const items: { label: string; value: string }[] = [];
  if (orderType !== undefined) items.push({ label: '单据类型', value: orderType || '-' });
  if (warehouseName !== undefined) items.push({ label: '仓库', value: warehouseName || '-' });
  if (operator !== undefined) items.push({ label: '操作员', value: operator || '-' });
  if (custodian !== undefined) items.push({ label: '保管人', value: custodian || '-' });
  if (personInCharge !== undefined) items.push({ label: '负责人', value: personInCharge || '-' });
  if (inspector !== undefined) items.push({ label: '验收人', value: inspector || '-' });
  if (salesperson !== undefined) items.push({ label: '业务员', value: salesperson || '-' });
  if (creator !== undefined) items.push({ label: '制单人', value: creator || '-' });

  // 每行3列
  for (let i = 0; i < items.length; i += 3) {
    infoRows += `
      <tr>
        ${[0, 1, 2].map(offset => {
          const item = items[i + offset];
          if (!item) return '<td style="padding:8px 12px;border:none;"></td>';
          return `
            <td style="padding:8px 12px;border:none;white-space:nowrap;">
              <span style="color:#555;">${item.label}：</span>
              <span style="color:#333;font-weight:500;">${item.value}</span>
            </td>
          `;
        }).join('')}
      </tr>
    `;
  }

  if (remark !== undefined) {
    infoRows += `
      <tr>
        <td colspan="3" style="padding:8px 12px;border:none;">
          <span style="color:#555;">备注：</span>
          <span style="color:#333;">${remark || '-'}</span>
        </td>
      </tr>
    `;
  }

  // 构建明细表格
  let detailRows = '';
  details.forEach((d, idx) => {
    detailRows += '<tr>';
    detailColumns.forEach((c) => {
      let v: any;
      if (c.key === 'index') v = idx + 1;
      else v = d[c.key] ?? '';
      const align = c.align === 'right' ? 'right' : c.align === 'center' ? 'center' : 'left';
      detailRows += `<td style="border:1px solid #666;padding:8px;text-align:${align};font-size:12px;">${typeof v === 'number' ? v : (v ?? '')}</td>`;
    });
    detailRows += '</tr>';
  });

  // 合计行
  const qtyIdx = quantityIndex >= 0 ? quantityIndex : detailColumns.length - 1;
  const totalCellCount = detailColumns.length - qtyIdx - 1;
  let totalRow = `<tr>
    <td colspan="${qtyIdx}" style="border:1px solid #666;padding:8px;background:#f5f5f5;font-weight:600;text-align:center;">合计</td>
    <td style="border:1px solid #666;padding:8px;text-align:right;background:#f5f5f5;font-weight:600;">${totalQty}</td>`;
  for (let i = 0; i < totalCellCount; i++) {
    totalRow += `<td style="border:1px solid #666;padding:8px;background:#f5f5f5;"></td>`;
  }
  totalRow += '</tr>';
  detailRows += totalRow;

  // 批次信息
  let batchTable = '';
  if (batchInfo && batchInfo.length > 0) {
    const batchRows = batchInfo.map(b => `
      <tr>
        <td style="border:1px solid #666;padding:8px;font-size:12px;">${b.batchNo}</td>
        <td style="border:1px solid #666;padding:8px;text-align:right;font-size:12px;">${b.quantity}</td>
        <td style="border:1px solid #666;padding:8px;text-align:right;font-size:12px;">${b.remainingQuantity}</td>
      </tr>
    `).join('');

    batchTable = `
      <div style="margin-top:20px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:6px;">批次信息</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="border:1px solid #666;padding:8px;text-align:center;font-size:12px;">批次号</th>
              <th style="border:1px solid #666;padding:8px;text-align:right;font-size:12px;">入库数量</th>
              <th style="border:1px solid #666;padding:8px;text-align:right;font-size:12px;">剩余数量</th>
            </tr>
          </thead>
          <tbody>${batchRows}</tbody>
        </table>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${orderNo}</title>
      <style>
        @page {
          size: A4;
          margin: 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
          padding: 0;
          color: #333;
          font-size: 12px;
        }
        .print-header {
          text-align: center;
          margin-bottom: 15px;
        }
        .print-header h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: 4px;
        }
        .print-header .meta {
          font-size: 13px;
          color: #555;
          display: flex;
          justify-content: center;
          gap: 40px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #666;
          margin-bottom: 15px;
          font-size: 12px;
        }
        .detail-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .detail-table thead tr {
          background-color: #f0f0f0;
        }
        .detail-table th {
          border: 1px solid #666;
          padding: 8px;
          font-weight: 600;
          font-size: 12px;
          text-align: center;
        }
        .signatures {
          margin-top: 50px;
          padding-top: 20px;
          font-size: 12px;
        }
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .signature-item {
          display: flex;
          align-items: center;
          min-width: 180px;
        }
        .signature-label {
          color: #555;
          white-space: nowrap;
        }
        .signature-line {
          display: inline-block;
          min-width: 120px;
          border-bottom: 1px solid #333;
          margin-left: 6px;
          height: 20px;
        }
        .print-time {
          text-align: right;
          margin-top: 15px;
          font-size: 11px;
          color: #888;
        }
        @media print {
          body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div style="max-width:900px;margin:0 auto;">
        <div class="print-header">
          <h1>${title}</h1>
          <div class="meta">
            <span>${orderNo}</span>
            <span>开单日期：${orderDate || '-'}</span>
          </div>
        </div>

        <table class="info-table">
          <tbody>${infoRows}</tbody>
        </table>

        <table class="detail-table">
          <thead>
            <tr>
              ${detailColumns.map(c => `
                <th style="text-align:${c.align === 'right' ? 'right' : c.align === 'center' ? 'center' : 'left'};">${c.label}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>${detailRows}</tbody>
        </table>

        ${batchTable}

        <div class="signatures">
          <div class="signature-row">
            <div class="signature-item">
              <span class="signature-label">制单人：</span>
              <span class="signature-line">${creator || ''}</span>
            </div>
            <div class="signature-item">
              <span class="signature-label">保管人：</span>
              <span class="signature-line">${custodian || ''}</span>
            </div>
            <div class="signature-item">
              <span class="signature-label">验收人：</span>
              <span class="signature-line">${inspector || ''}</span>
            </div>
            <div class="signature-item">
              <span class="signature-label">负责人：</span>
              <span class="signature-line">${personInCharge || ''}</span>
            </div>
          </div>
        </div>

        <div class="print-time">打印时间：${printTime}</div>
      </div>
    </body>
    </html>
  `;
}

const PrintDocument = (props: PrintDocumentProps) => {
  const lastPrintTriggerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // 只在 printTrigger 变化时触发打印
    const { printTrigger, onPrintComplete } = props;
    
    // 如果 printTrigger 没有变化，不打印
    if (printTrigger === undefined || printTrigger === lastPrintTriggerRef.current) {
      return;
    }
    
    // 记录本次打印触发值
    lastPrintTriggerRef.current = printTrigger;
    
    const printHTML = buildPrintHTML(props);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('无法打开打印窗口，请检查浏览器弹窗设置');
      return;
    }
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.addEventListener('load', () => {
      printWindow.focus();
      printWindow.print();
    });
    
    // 打印窗口关闭后，调用回调清除 printItem
    printWindow.addEventListener('beforeunload', () => {
      if (onPrintComplete) {
        onPrintComplete();
      }
    });
  }, [props.printTrigger]);

  return null;
};

export default PrintDocument;
