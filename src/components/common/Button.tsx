import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GenericButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'default' | 'danger' | 'warning' | 'text' | 'ghost' | string;
  size?: 'small' | 'middle' | 'large' | string;
  icon?: ReactNode;
  [key: string]: any;
}

export default function Button({ children, onClick, variant = 'default', className = '', disabled, ...rest }: GenericButtonProps) {
  let baseClass = '';
  switch (variant) {
    case 'primary':
      baseClass = disabled
        ? 'bg-gradient-to-r from-indigo-300 to-purple-300 text-white border border-transparent cursor-not-allowed'
        : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white border border-transparent shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.98]';
      break;
    case 'secondary':
    case 'default':
      baseClass = 'bg-white border border-gray-200 hover:border-[#6366f1] hover:text-[#6366f1] text-gray-600 hover:shadow-md';
      break;
    case 'danger':
      baseClass = disabled
        ? 'bg-gradient-to-r from-red-300 to-rose-300 text-white border border-transparent cursor-not-allowed'
        : 'bg-gradient-to-r from-[#ef4444] to-[#f43f5e] hover:from-[#dc2626] hover:to-[#e11d48] text-white border border-transparent shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 active:scale-[0.98]';
      break;
    case 'warning':
      baseClass = disabled
        ? 'bg-gradient-to-r from-amber-300 to-orange-300 text-white border border-transparent cursor-not-allowed'
        : 'bg-gradient-to-r from-[#f59e0b] to-[#f97316] hover:from-[#d97706] hover:to-[#ea580c] text-white border border-transparent shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 active:scale-[0.98]';
      break;
    case 'text':
    case 'ghost':
      baseClass = 'text-[#6366f1] hover:text-[#4f46e5] border border-transparent bg-transparent hover:bg-indigo-50';
      break;
    default:
      baseClass = 'bg-white border border-gray-200 hover:border-[#6366f1] hover:text-[#6366f1] text-gray-600 hover:shadow-md';
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg transition-all duration-200 ease-in-out ${baseClass} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, onClick, icon, disabled, ...rest }: GenericButtonProps) {
  return (
    <Button onClick={disabled ? undefined : onClick} variant="primary" disabled={disabled} {...rest}>
      {icon}<span>{children}</span>
    </Button>
  );
}

export function DefaultButton({ children, onClick, icon, disabled, ...rest }: GenericButtonProps) {
  return (
    <Button onClick={disabled ? undefined : onClick} variant="default" disabled={disabled} {...rest}>
      {icon}<span>{children}</span>
    </Button>
  );
}

export function TextButton({ children, onClick, type = 'default', disabled, ...rest }: { children: ReactNode; onClick?: () => void; type?: string; disabled?: boolean; [key: string]: any }) {
  const colorClass =
    type === 'danger' ? 'text-[#ef4444] hover:text-[#dc2626] hover:bg-red-50 !border-transparent !bg-transparent' :
    type === 'warning' ? 'text-[#f59e0b] hover:text-[#d97706] hover:bg-amber-50 !border-transparent !bg-transparent' :
    'text-[#6366f1] hover:text-[#4f46e5] hover:bg-indigo-50 !border-transparent !bg-transparent';
  return (
    <Button onClick={disabled ? undefined : onClick} variant="text" className={colorClass} disabled={disabled} {...rest}>
      {children}
    </Button>
  );
}
