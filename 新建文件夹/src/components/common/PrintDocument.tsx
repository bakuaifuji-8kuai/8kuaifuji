import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

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
  buttonLabel?: string;
  autoPrint?: boolean; // 是否自动触发打印
}

export interface PrintDocumentHandle {
  triggerPrint: () => void;
}

const PrintContent = forwardRef<HTMLDivElement, PrintDocumentProps>((props, ref) => {
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
      { key: 'positionName', label: '仓位' },
      { key: 'batchNo', label: '批次号' },
    ],
  } = props;

  const totalQty = details.reduce((a, b) => a + (Number(b.quantity) || 0), 0);

  return (
    <div ref={ref} className="bg-white p-8 text-[13px] text-slate-800" style={{ minWidth: '800px' }}>
      <h1 className="text-center text-xl font-bold mb-1">{title}</h1>
      <div className="text-center text-sm text-slate-500 mb-4">
        {orderNo} {orderDate ? `　开单日期：${orderDate}` : ''}
      </div>

      <div className="grid grid-cols-3 gap-y-2 mb-4 p-3 border border-slate-300 rounded">
        <div><span className="text-slate-500">单据类型：</span>{orderType || '-'}</div>
        <div><span className="text-slate-500">仓库：</span>{warehouseName || '-'}</div>
        <div><span className="text-slate-500">操作员：</span>{operator || '-'}</div>
        {custodian !== undefined && <div><span className="text-slate-500">保管人：</span>{custodian || '-'}</div>}
        {personInCharge !== undefined && <div><span className="text-slate-500">负责人：</span>{personInCharge || '-'}</div>}
        {inspector !== undefined && <div><span className="text-slate-500">验收人：</span>{inspector || '-'}</div>}
        {salesperson !== undefined && <div><span className="text-slate-500">业务员：</span>{salesperson || '-'}</div>}
        {creator !== undefined && <div><span className="text-slate-500">制单人：</span>{creator || '-'}</div>}
        {remark !== undefined && <div className="col-span-3"><span className="text-slate-500">备注：</span>{remark || '-'}</div>}
      </div>

      <table className="w-full border-collapse border border-slate-400 text-sm">
        <thead>
          <tr className="bg-slate-100">
            {detailColumns.map((c) => (
              <th key={c.key} className={`border border-slate-400 px-2 py-1.5 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {details.map((d, idx) => (
            <tr key={idx}>
              {detailColumns.map((c) => {
                let v: any;
                if (c.key === 'index') v = idx + 1;
                else v = d[c.key] ?? '';
                return (
                  <td key={c.key} className={`border border-slate-400 px-2 py-1.5 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {typeof v === 'number' ? v : (v ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="bg-slate-50 font-semibold">
            <td className="border border-slate-400 px-2 py-1.5 text-center" colSpan={detailColumns.findIndex(c => c.key === 'quantity')}>
              合计
            </td>
            <td className="border border-slate-400 px-2 py-1.5 text-right">{totalQty}</td>
            {detailColumns.slice(detailColumns.findIndex(c => c.key === 'quantity') + 1).map((c) => (
              <td key={c.key} className="border border-slate-400 px-2 py-1.5">&nbsp;</td>
            ))}
          </tr>
        </tbody>
      </table>

      {batchInfo && batchInfo.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-1">批次信息</div>
          <table className="w-full border-collapse border border-slate-400 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-400 px-2 py-1.5 text-center">批次号</th>
                <th className="border border-slate-400 px-2 py-1.5 text-right">入库数量</th>
                <th className="border border-slate-400 px-2 py-1.5 text-right">剩余数量</th>
              </tr>
            </thead>
            <tbody>
              {batchInfo.map((b, i) => (
                <tr key={i}>
                  <td className="border border-slate-400 px-2 py-1.5">{b.batchNo}</td>
                  <td className="border border-slate-400 px-2 py-1.5 text-right">{b.quantity}</td>
                  <td className="border border-slate-400 px-2 py-1.5 text-right">{b.remainingQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 mt-10 pt-6 text-sm">
        <div>制单人：<span className="inline-block w-20 border-b border-slate-400">{creator || ''}</span></div>
        <div>保管人：<span className="inline-block w-20 border-b border-slate-400">{custodian || ''}</span></div>
        <div>验收人：<span className="inline-block w-20 border-b border-slate-400">{inspector || ''}</span></div>
        <div>负责人：<span className="inline-block w-20 border-b border-slate-400">{personInCharge || ''}</span></div>
      </div>

      <div className="text-right text-xs text-slate-400 mt-4">
        打印时间：{new Date().toLocaleString('zh-CN')}
      </div>
    </div>
  );
});

PrintContent.displayName = 'PrintContent';

const PrintDocument = forwardRef<PrintDocumentHandle, PrintDocumentProps>((props, ref) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: props.title + '-' + props.orderNo,
    pageStyle: '@page { size: A4; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }',
  } as any);

  useImperativeHandle(ref, () => ({
    triggerPrint: handlePrint,
  }));

  // 自动触发打印
  useEffect(() => {
    if (props.autoPrint && componentRef.current) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [props.autoPrint]);

  // 如果是自动打印模式，不显示按钮
  if (props.autoPrint) {
    return (
      <div style={{ display: 'none' }}>
        <PrintContent ref={componentRef} {...props} />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2f54eb] hover:bg-[#4465ee] text-white text-xs rounded transition-colors"
      >
        <Printer size={14} />
        <span>{props.buttonLabel || '打印'}</span>
      </button>
      <div style={{ display: 'none' }}>
        <PrintContent ref={componentRef} {...props} />
      </div>
    </>
  );
});

PrintDocument.displayName = 'PrintDocument';

export default PrintDocument;
