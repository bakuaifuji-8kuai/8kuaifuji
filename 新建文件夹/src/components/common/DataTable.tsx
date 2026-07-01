import { ReactNode, useState } from 'react';

// 宽松的列定义：同时支持自定义 key/title/render 和 tanstack 的 accessorKey/header/cell 两种风格
export interface ColumnDef<T = any> {
  key?: string;
  title?: string;
  header?: string | ((context: any) => any) | any;
  accessorKey?: string;
  accessorFn?: (row: T) => any;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => any;
  cell?: any;
  footer?: string | ((data: T[]) => any) | any;
  [key: string]: any;
}

interface DataTableProps<T> {
  data: T[];
  columns: any[];
  pageSize?: number;
  showPageSizeSelect?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectChange?: (keys: string[]) => void;
  rowKey?: (row: T) => string;
  emptyText?: string;
  totalText?: string;
  operationSlot?: any;
  showFooter?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showPagination?: boolean;
  striped?: boolean;
  compact?: boolean;
}

// 从 ColumnDef 中提取唯一 key（优先用显式 key，其次 accessorKey，最后 fallback）
function getColKey<T>(col: ColumnDef<T>, idx: number): string {
  return col.key || col.accessorKey || `col_${idx}`;
}

// 从 ColumnDef 中提取标题文本
function getColTitle<T>(col: ColumnDef<T>): string {
  if (col.title) return String(col.title);
  if (typeof col.header === 'string') return col.header;
  if (col.accessorKey) return col.accessorKey;
  return '';
}

// 从 ColumnDef 中提取单元格值（兼容 render / cell / accessorKey / accessorFn）
function renderCell<T>(col: ColumnDef<T>, row: T): ReactNode {
  // 优先用自定义 render
  if (col.render) return col.render(row);
  // tanstack 的 cell(context) 格式
  if (col.cell) {
    const getValue = () => {
      if (col.accessorKey) return (row as any)?.[col.accessorKey];
      if (col.accessorFn) return col.accessorFn(row);
      return undefined;
    };
    return col.cell({ row: { original: row, getValue } });
  }
  // 按 key/accessorKey 取值
  if (col.accessorKey) return (row as any)?.[col.accessorKey] ?? '';
  if (col.accessorFn) return col.accessorFn(row);
  if (col.key) return (row as any)?.[col.key] ?? '';
  return '';
}

export function DataTable<T>({
  data,
  columns,
  pageSize: defaultPageSize = 10,
  showPageSizeSelect = true,
  onPageChange,
  selectable = false,
  selectedKeys = [],
  onSelectChange,
  rowKey,
  emptyText = '暂无数据',
  totalText,
  operationSlot,
  showFooter = false,
  showSearch = false,
  searchPlaceholder = '搜索...',
  showPagination = true,
  striped = false,
  compact = false,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [keyword, setKeyword] = useState('');

  const filteredData = keyword
    ? data.filter((row) =>
        columns.some((col) => {
          const val = col.accessorKey ? (row as any)?.[col.accessorKey] : col.key ? (row as any)?.[col.key] : col.accessorFn ? col.accessorFn(row) : undefined;
          return val !== undefined && String(val).toLowerCase().includes(keyword.toLowerCase());
        })
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pageStart = showPagination ? (currentPage - 1) * pageSize : 0;
  const pageData = showPagination ? filteredData.slice(pageStart, pageStart + pageSize) : filteredData;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange?.(page, pageSize);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
    onPageChange?.(1, newSize);
  };

  const allSelected =
    selectable && pageData.length > 0 && pageData.every((row) => {
      const key = rowKey ? rowKey(row) : String((row as any)?.id);
      return selectedKeys.includes(key);
    });

  const toggleSelectAll = () => {
    if (!onSelectChange) return;
    const pageKeys = pageData.map((row) => (rowKey ? rowKey(row) : String((row as any)?.id)));
    if (allSelected) {
      onSelectChange(selectedKeys.filter((k) => !pageKeys.includes(k)));
    } else {
      const merged = Array.from(new Set([...selectedKeys, ...pageKeys]));
      onSelectChange(merged);
    }
  };

  const toggleRow = (row: T) => {
    if (!onSelectChange) return;
    const key = rowKey ? rowKey(row) : String((row as any)?.id);
    if (selectedKeys.includes(key)) {
      onSelectChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectChange([...selectedKeys, key]);
    }
  };

  const py = compact ? 'py-1.5' : 'py-2.5';
  const pyBody = compact ? 'py-1.5' : 'py-2';

  return (
    <div className="bg-white border border-[#e4e7ed] rounded shadow-sm">
      {(operationSlot || showSearch) && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[#e4e7ed]">
          {showSearch && (
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-8 px-2 border border-[#dcdfe6] text-xs rounded focus:outline-none focus:border-[#2f54eb] w-64"
            />
          )}
          {operationSlot && <div className="flex items-center gap-2 ml-auto">{operationSlot}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#f5f7fa] text-[#606266]">
              {selectable && (
                <th className={`w-10 px-3 ${py} text-left font-medium border-b border-[#e4e7ed]`}>
                  <input type="checkbox" checked={!!allSelected} onChange={toggleSelectAll} className="accent-[#2f54eb] cursor-pointer" />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={getColKey(col, idx)}
                  className={`px-3 ${py} font-medium border-b border-[#e4e7ed] whitespace-nowrap ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {getColTitle(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-[#909399]">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIdx) => {
                const key = rowKey ? rowKey(row) : String((row as any)?.id || rowIdx);
                const isSelected = selectable && selectedKeys.includes(key);
                const stripeClass = striped && rowIdx % 2 === 1 ? 'bg-[#fafbfc]' : '';
                return (
                  <tr key={key} className={`hover:bg-[#f5f7fa] transition-colors ${isSelected ? 'bg-[#ecf5ff]' : stripeClass}`}>
                    {selectable && (
                      <td className={`px-3 ${pyBody} border-b border-[#ebeef5]`}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row)} className="accent-[#2f54eb] cursor-pointer" />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td
                        key={getColKey(col, idx)}
                        className={`px-3 ${pyBody} border-b border-[#ebeef5] text-[#303133] ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                      >
                        {renderCell(col, row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
          {showFooter && (
            <tfoot>
              <tr className="bg-[#f5f7fa] text-[#606266]">
                {selectable && <td className={`px-3 ${py} border-t border-[#e4e7ed]`}></td>}
                {columns.map((col, idx) => (
                  <td key={getColKey(col, idx)} className={`px-3 ${py} border-t border-[#e4e7ed] font-medium ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {typeof col.footer === 'function' ? col.footer(data) : col.footer || ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#e4e7ed]">
          <div className="text-xs text-[#606266]">{totalText || `共 ${filteredData.length} 条`}</div>
          <div className="flex items-center gap-2">
            {showPageSizeSelect && (
              <select value={pageSize} onChange={handlePageSizeChange} className="h-7 px-2 border border-[#dcdfe6] text-xs rounded bg-white focus:outline-none focus:border-[#2f54eb]">
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}条/页</option>
                ))}
              </select>
            )}
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-7 px-2 border border-[#dcdfe6] text-xs rounded disabled:opacity-50 hover:border-[#2f54eb] hover:text-[#2f54eb]">上一页</button>
            <span className="text-xs text-[#606266]">{currentPage} / {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-7 px-2 border border-[#dcdfe6] text-xs rounded disabled:opacity-50 hover:border-[#2f54eb] hover:text-[#2f54eb]">下一页</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
