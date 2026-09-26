import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="mb-4 text-[var(--grey-400)]">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--ink)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[var(--grey-600)] max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-5 px-5 py-2.5 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
