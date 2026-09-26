import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt, CalendarDays, IndianRupee, CheckCircle2, Clock, Users, Plus, Eye, Pencil, Download,
} from 'lucide-react';
import type { DashboardSummary } from '../types';
import { billsApi } from '../api/billsApi';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';

function SummaryCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="group relative card p-4 sm:p-5 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      {/* oversized watermark icon */}
      <div className="absolute -right-3 -top-3 text-[var(--grey-100)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="scale-[2.6]">{icon}</div>
      </div>

      <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 text-white shadow-sm bg-gradient-to-br ${gradient}`}>
        {icon}
      </div>
      <div className="relative text-xs font-semibold text-[var(--grey-600)] uppercase tracking-wide">{label}</div>
      <div className="relative text-lg sm:text-xl font-bold text-[var(--ink)] mt-1 leading-tight break-words">{value}</div>
    </div>
  );
}

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    billsApi.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id: number, invoiceNumber: string) => {
    setDownloadingId(id);
    try {
      await billsApi.downloadPdf(id, invoiceNumber);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-[var(--grey-600)]">Loading dashboard...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Dashboard</h1>
          <p className="text-sm text-[var(--grey-600)]">Overview of your billing activity</p>
        </div>
        <Link to="/bills/new" className="btn-gold flex items-center gap-2 px-5 py-3 text-sm font-semibold shadow-sm">
          <Plus size={18} />
          Create New Bill
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <SummaryCard icon={<Receipt size={20} />} label="Total Bills" value={String(data?.totalBills ?? 0)} gradient="from-[var(--royal)] to-[var(--navy)]" />
        <SummaryCard icon={<CalendarDays size={20} />} label="Today's Bills" value={String(data?.todaysBills ?? 0)} gradient="from-violet-500 to-purple-700" />
        <SummaryCard icon={<IndianRupee size={20} />} label="Total Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} gradient="from-[var(--gold)] to-[var(--gold-light)]" />
        <SummaryCard icon={<CheckCircle2 size={20} />} label="Paid Amount" value={formatCurrency(data?.paidAmount ?? 0)} gradient="from-emerald-500 to-green-700" />
        <SummaryCard icon={<Clock size={20} />} label="Pending Amount" value={formatCurrency(data?.pendingAmount ?? 0)} gradient="from-orange-500 to-red-600" />
        <SummaryCard icon={<Users size={20} />} label="Total Customers" value={String(data?.totalCustomers ?? 0)} gradient="from-teal-500 to-cyan-700" />
      </div>

      {!!data && data.totalRevenue > 0 && (
        <div className="card p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--ink)]">Payment Collection</h3>
            <span className="text-xs text-[var(--grey-600)]">
              {Math.round((data.paidAmount / data.totalRevenue) * 100)}% collected
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--grey-100)] overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
              style={{ width: `${(data.paidAmount / data.totalRevenue) * 100}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
              style={{ width: `${(data.pendingAmount / data.totalRevenue) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-[var(--grey-600)]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Paid — {formatCurrency(data.paidAmount)}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Pending — {formatCurrency(data.pendingAmount)}</span>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--grey-200)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--ink)]">Recent Bills</h2>
          <Link to="/bills" className="text-sm font-medium text-[var(--royal)] hover:underline">View all</Link>
        </div>

        {!data?.recentBills.length ? (
          <EmptyState
            icon={<Receipt size={40} />}
            title="No invoices found"
            description="Create your first travel bill to get started."
            actionLabel="Create Your First Bill"
            onAction={() => navigate('/bills/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-[var(--grey-600)] bg-[var(--grey-50)]">
                  <th className="px-5 py-3">Invoice No</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Travel Date</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBills.map((b) => (
                  <tr key={b.id} className="border-t border-[var(--grey-100)] hover:bg-[var(--grey-50)]">
                    <td className="px-5 py-3 font-medium text-[var(--royal)]">{b.invoiceNumber}</td>
                    <td className="px-5 py-3">{b.customerName}</td>
                    <td className="px-5 py-3 text-[var(--grey-600)]">{new Date(b.travelDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-[var(--grey-600)]">{b.from} → {b.to}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(b.grandTotal)}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button title="View" onClick={() => navigate(`/bills/${b.id}`)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)]">
                          <Eye size={16} />
                        </button>
                        <button title="Edit" onClick={() => navigate(`/bills/${b.id}/edit`)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)]">
                          <Pencil size={16} />
                        </button>
                        <button title="Download" disabled={downloadingId === b.id} onClick={() => handleDownload(b.id, b.invoiceNumber)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)] disabled:opacity-50">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
