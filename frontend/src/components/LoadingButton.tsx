import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'gold' | 'outline';
  children: ReactNode;
}

export function LoadingButton({
  loading,
  loadingText,
  icon,
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...rest
}: LoadingButtonProps) {
  const variantClass =
    variant === 'primary' ? 'btn-primary' : variant === 'gold' ? 'btn-gold' : 'border border-[var(--grey-200)] bg-white text-[var(--ink)] hover:bg-[var(--grey-50)] rounded-10';

  return (
    <button
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-[10px] disabled:opacity-60 disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
