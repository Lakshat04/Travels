import type { PaymentStatus } from '../types';

const styles: Record<PaymentStatus, string> = {
  Paid: 'bg-green-100 text-green-700 border-green-200',
  PartiallyPaid: 'bg-amber-100 text-amber-700 border-amber-200',
  Pending: 'bg-orange-100 text-orange-700 border-orange-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const labels: Record<PaymentStatus, string> = {
  Paid: 'Paid',
  PartiallyPaid: 'Partially Paid',
  Pending: 'Pending',
  Cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
