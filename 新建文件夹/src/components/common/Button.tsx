import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GenericButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'default' | 'danger' | 'warning' | 'text' | 'ghost' | string;
  size?: 'small' | 'middle' | 'large' | string;
  icon?: ReactNode;
  [key: string]: any;
}

// 通用 Button 组件（兼容 variant 写法，供 Report 等页面使用）
export default function Button({ children, onClick, variant = 'default', className = '', disabled, ...rest }: GenericButtonProps) {
  let baseClass = '';
  switch (variant) {
    case 'primary':
      baseClass = disabled
        ? 'bg-[#a0bbef] text-white border border-[#a0bbef] cursor-not-allowed'
        : 'bg-[#2f54eb] hover:bg-[#4465ee] text-white border border-[#2f54eb]';
      break;
    case 'secondary':
    case 'default':
      baseClass = 'bg-white border border-[#dcdfe6] hover:border-[#2f54eb] hover:text-[#2f54eb] text-[#606266]';
      break;
    case 'danger':
      baseClass = disabled
        ? 'bg-[#f9a8a8] text-white border border-[#f9a8a8] cursor-not-allowed'
        : 'bg-[#f56c6c] hover:bg-[#f78989] text-white border border-[#f56c6c]';
      break;
    case 'warning':
      baseClass = 'bg-[#e6a23c] hover:bg-[#ebb563] text-white border border-[#e6a23c]';
      break;
    case 'text':
    case 'ghost':
      baseClass = 'text-[#2f54eb] hover:text-[#4465ee] border border-transparent bg-transparent hover:underline';
      break;
    default:
      baseClass = 'bg-white border border-[#dcdfe6] hover:border-[#2f54eb] hover:text-[#2f54eb] text-[#606266]';
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs rounded transition-colors ${baseClass} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

// 主按钮（蓝色填充）
export function PrimaryButton({ children, onClick, icon, disabled, ...rest }: GenericButtonProps) {
  return (
    <Button onClick={disabled ? undefined : onClick} variant="primary" disabled={disabled} {...rest}>
      {icon}<span>{children}</span>
    </Button>
  );
}

// 次按钮（灰色边框）
export function DefaultButton({ children, onClick, icon, disabled, ...rest }: GenericButtonProps) {
  return (
    <Button onClick={disabled ? undefined : onClick} variant="default" disabled={disabled} {...rest}>
      {icon}<span>{children}</span>
    </Button>
  );
}

// 文字按钮（用于表格操作列）
export function TextButton({ children, onClick, type = 'default', disabled, ...rest }: { children: ReactNode; onClick?: () => void; type?: string; disabled?: boolean; [key: string]: any }) {
  const colorClass =
    type === 'danger' ? 'text-[#f56c6c] hover:text-[#f78989] !border-transparent !bg-transparent' :
    type === 'warning' ? 'text-[#e6a23c] hover:text-[#ebb563] !border-transparent !bg-transparent' :
    'text-[#2f54eb] hover:text-[#4465ee] !border-transparent !bg-transparent';
  return (
    <Button onClick={disabled ? undefined : onClick} variant="text" className={colorClass} disabled={disabled} {...rest}>
      {children}
    </Button>
  );
}
