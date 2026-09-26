import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Pencil, Download, Printer, Receipt, Plus } from 'lucide-react';
import type { BillListItem, PaymentStatus } from '../types';
import { billsApi } from '../api/billsApi';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BillsPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<BillListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchBills = () => {
    setLoading(true);
    billsApi
      .list({
        search: search || undefined,
        invoiceNumber: invoiceNumber || undefined,
        paymentStatus: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      })
      .then(setBills)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchBills, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, invoiceNumber, status, fromDate, toDate]);

  const handleDownload = async (id: number, invoiceNo: string) => {
    setDownloadingId(id);
    try {
      await billsApi.downloadPdf(id, invoiceNo);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Bills</h1>
          <p className="text-sm text-[var(--grey-600)]">Search, filter, and manage all invoices</p>
        </div>
        <button onClick={() => navigate('/bills/new')} className="btn-gold flex items-center gap-2 px-5 py-3 text-sm font-semibold">
          <Plus size={18} /> Create New Bill
        </button>
      </div>

      <div className="card p-4 mb-5 grid md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grey-400)]" />
          <input className="input-field pl-9" placeholder="Search customer, mobile, invoice..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <input className="input-field" placeholder="Invoice No." value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | '')}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="PartiallyPaid">Partially Paid</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <div className="flex gap-2">
          <input type="date" className="input-field" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" className="input-field" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--grey-600)]">Loading bills...</div>
        ) : bills.length === 0 ? (
          <EmptyState
            icon={<Receipt size={40} />}
            title="No invoices found"
            description="Try adjusting your filters, or create your first travel bill."
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
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-t border-[var(--grey-100)] hover:bg-[var(--grey-50)]">
                    <td className="px-5 py-3 font-medium text-[var(--royal)]">{b.invoiceNumber}</td>
                    <td className="px-5 py-3">{b.customerName}</td>
                    <td className="px-5 py-3 text-[var(--grey-600)]">{new Date(b.travelDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-[var(--grey-600)]">{b.from} → {b.to}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(b.grandTotal)}</td>
                    <td className="px-5 py-3">{formatCurrency(b.amountPaid)}</td>
                    <td className="px-5 py-3">{formatCurrency(b.balanceAmount)}</td>
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
                        <button title="Print" onClick={() => navigate(`/bills/${b.id}?print=1`)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)]">
                          <Printer size={16} />
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
