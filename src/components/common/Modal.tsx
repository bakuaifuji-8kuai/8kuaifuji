import { ReactNode, useEffect, useState } from 'react';

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
  width = 'max-w-[1200px]',
  size,
  footer,
  maskClosable = true,
  ..._rest
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => maskClosable && onClose?.()}
      />
      <div
        className={`relative bg-white rounded-xl shadow-2xl border border-slate-100 w-full ${effectiveWidth} max-h-[90vh] flex flex-col transition-all duration-200 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
