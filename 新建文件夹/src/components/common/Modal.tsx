import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  width?: string;
  size?: string;
  footer?: ReactNode;
  maskClosable?: boolean;
  [key: string]: any;
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  width = 'max-w-[900px]',
  size,
  footer,
  maskClosable = true,
  ..._rest
}: ModalProps) {
  // size 兼容：支持 "sm" | "md" | "lg" | "xl" | "full" 或自定义字符串如 "500px"
  const sizeToWidth: Record<string, string> = {
    sm: 'max-w-[420px]',
    md: 'max-w-[600px]',
    lg: 'max-w-[900px]',
    xl: 'max-w-[1200px]',
    full: 'max-w-full mx-4',
  };
  const effectiveWidth = size ? (sizeToWidth[size] || `max-w-[${size}]`) : width;
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => maskClosable && onClose?.()}
      />
      <div className={`relative bg-white rounded shadow-lg w-full ${effectiveWidth} max-h-[85vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e4e7ed]">
            <h3 className="text-sm font-semibold text-[#303133]">{title}</h3>
            <button onClick={onClose} className="text-[#909399] hover:text-[#303133] text-xl leading-none">
              ×
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#e4e7ed]">{footer}</div>}
      </div>
    </div>
  );
}
