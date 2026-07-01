import { ReactNode } from 'react';
import { cn } from '@/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700 shadow-sm',
    primary: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/25',
    secondary: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-sm shadow-slate-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm shadow-green-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-red-500/25',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/25',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
