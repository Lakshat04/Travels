import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import type { Customer } from '../types';
import { customersApi } from '../api/customersApi';
import { EmptyState } from '../components/EmptyState';

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      customersApi.list(search || undefined).then(setCustomers).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Customers</h1>
        <p className="text-sm text-[var(--grey-600)]">All customers who have booked travel with Narayana Travels</p>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grey-400)]" />
          <input className="input-field pl-9" placeholder="Search by name, mobile, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--grey-600)]">Loading customers...</div>
        ) : customers.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="No customers found" description="Customers are created automatically when you save a bill." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-[var(--grey-600)] bg-[var(--grey-50)]">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Mobile</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Total Bills</th>
                  <th className="px-5 py-3">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--grey-100)] hover:bg-[var(--grey-50)]">
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-5 py-3 text-[var(--grey-600)]">{c.mobileNumber}</td>
                    <td className="px-5 py-3 text-[var(--grey-600)]">{c.email || '—'}</td>
                    <td className="px-5 py-3">{c.totalBills}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(c.totalSpent)}</td>
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
