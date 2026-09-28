import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt, CalendarDays, IndianRupee, CheckCircle2, Clock, Users, Plus, Eye, Pencil, Download,
  ChevronRight, ShieldCheck, Sofa, Timer, UserCheck, ArrowRight, Quote,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DashboardSummary, RevenuePoint } from '../types';
import { billsApi } from '../api/billsApi';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import heroBus from '../assets/dashboard/hero-bus.png';

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
function formatShortCurrency(n: number) {
  return compactCurrencyFormatter.format(n);
}

interface StatDef {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
  gradient: string;
  glow: string;
  shadow: string;
  wash: string;
  to?: string;
}

function StatCard({ icon, label, value, caption, gradient, glow, shadow, wash, to }: StatDef) {
  const navigate = useNavigate();
  return (
    <div
      className="group relative card p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer"
      style={{ overflow: 'hidden', borderRadius: 16, isolation: 'isolate' }}
      onClick={() => to && navigate(to)}
    >
      {/* subtle color wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${wash} opacity-60`} />

      {/* colored top accent */}
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />

      {/* watermark icon, fades in on hover, kept fully inside the card bounds */}
      <div className={`absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${glow}`}>
        <div className="scale-150 origin-top-right">{icon}</div>
      </div>

      <div className="relative flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} ${shadow} group-hover:scale-105 transition-transform duration-200`}
        >
          {icon}
        </div>
        {to && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--grey-400)] group-hover:bg-white group-hover:text-[var(--royal)] group-hover:shadow-sm transition-all">
            <ChevronRight size={15} />
          </div>
        )}
      </div>
      <div className="relative mt-4 text-sm font-semibold text-[var(--grey-700)]">{label}</div>
      <div className="relative text-2xl font-bold text-[var(--ink)] mt-1 tracking-tight tabular-nums">{value}</div>
      <div className="relative text-xs text-[var(--grey-500)] mt-1">{caption}</div>
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    billsApi.dashboard().then(setData).finally(() => setLoading(false));
    billsApi.billYears().then((ys) => {
      setYears(ys);
      if (ys.length > 0) setSelectedYear(ys[0]);
    });
  }, []);

  useEffect(() => {
    if (period === 'year') {
      billsApi.revenueTrend({ year: selectedYear }).then(setTrend);
    } else {
      billsApi.revenueTrend({ days: period === 'week' ? 7 : 30 }).then(setTrend);
    }
  }, [period, selectedYear]);

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

  const stats: StatDef[] = [
    { icon: <Receipt size={20} />, label: 'Total Bills', value: String(data?.totalBills ?? 0), caption: 'Total number of bills', gradient: 'from-[var(--royal)] to-[var(--navy)]', glow: 'text-blue-100', shadow: 'shadow-lg shadow-blue-900/25', wash: 'from-blue-50/70 to-transparent', to: '/bills' },
    { icon: <CalendarDays size={20} />, label: "Today's Bills", value: String(data?.todaysBills ?? 0), caption: 'Bills created today', gradient: 'from-violet-500 to-purple-700', glow: 'text-violet-100', shadow: 'shadow-lg shadow-violet-900/25', wash: 'from-violet-50/70 to-transparent', to: '/bills' },
    { icon: <IndianRupee size={20} />, label: 'Total Revenue', value: formatCurrency(data?.totalRevenue ?? 0), caption: 'Total amount', gradient: 'from-[var(--gold)] to-[var(--gold-light)]', glow: 'text-amber-100', shadow: 'shadow-lg shadow-amber-900/20', wash: 'from-amber-50/70 to-transparent' },
    { icon: <CheckCircle2 size={20} />, label: 'Paid Amount', value: formatCurrency(data?.paidAmount ?? 0), caption: 'Amount received', gradient: 'from-emerald-500 to-green-700', glow: 'text-emerald-100', shadow: 'shadow-lg shadow-emerald-900/25', wash: 'from-emerald-50/70 to-transparent', to: '/bills' },
    { icon: <Clock size={20} />, label: 'Pending Amount', value: formatCurrency(data?.pendingAmount ?? 0), caption: 'Amount pending', gradient: 'from-orange-500 to-red-600', glow: 'text-orange-100', shadow: 'shadow-lg shadow-orange-900/25', wash: 'from-orange-50/70 to-transparent', to: '/bills' },
    { icon: <Users size={20} />, label: 'Total Customers', value: String(data?.totalCustomers ?? 0), caption: 'Registered customers', gradient: 'from-teal-500 to-cyan-700', glow: 'text-teal-100', shadow: 'shadow-lg shadow-teal-900/25', wash: 'from-teal-50/70 to-transparent', to: '/customers' },
  ];

  const chartData = trend.map((p) => ({
    date: period === 'year'
      ? new Date(p.date).toLocaleDateString('en-IN', { month: 'short' })
      : new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    revenue: p.revenue,
  }));

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div
        className="relative w-full overflow-hidden shadow-lg mb-6 rounded-2xl"
        style={{ aspectRatio: '1671 / 620' }}
      >
        <img src={heroBus} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_35%]" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 max-w-lg">
          <p className="text-[var(--grey-700)] font-medium text-sm sm:text-base">Good Morning,</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight mt-1">
            Welcome to Narayana Travels
          </h1>
          <div className="w-16 h-1 bg-[var(--gold)] rounded-full mt-3 mb-3" />
          <p className="text-[var(--grey-700)] text-sm sm:text-base">Manage your bills, invoices and customers with ease.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Revenue chart + Create Bill / Quote */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-6 items-stretch">
        {/* Revenue chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-[var(--ink)]">Revenue Overview</h3>
              <p className="text-xs text-[var(--grey-600)]">
                {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : `Jan – Dec ${selectedYear}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="text-xs font-medium border border-[var(--grey-200)] rounded-lg px-2.5 py-1.5 bg-white text-[var(--ink)] cursor-pointer"
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              {period === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs font-medium border border-[var(--grey-200)] rounded-lg px-2.5 py-1.5 bg-white text-[var(--ink)] cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'area' | 'bar')}
                className="text-xs font-medium border border-[var(--grey-200)] rounded-lg px-2.5 py-1.5 bg-white text-[var(--ink)] cursor-pointer"
              >
                <option value="area">Area View</option>
                <option value="bar">Bar View</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[var(--grey-400)]">No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--royal)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--royal)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grey-100)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--grey-600)' }} axisLine={false} tickLine={false} interval={period === 'month' ? 'preserveStartEnd' : 0} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--grey-600)' }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} width={44} tickCount={5} allowDecimals={false} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--grey-200)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--royal)" strokeWidth={2.5} fill="url(#revenueFill)" dot={{ r: 3, fill: 'var(--royal)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grey-100)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--grey-600)' }} axisLine={false} tickLine={false} interval={period === 'month' ? 'preserveStartEnd' : 0} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--grey-600)' }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} width={44} tickCount={5} allowDecimals={false} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--grey-200)' }} cursor={{ fill: 'var(--grey-50)' }} />
                    <Bar dataKey="revenue" fill="var(--royal)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right column: Create Bill + quote */}
        <div className="hidden lg:flex flex-col gap-6">
          <Link
            to="/bills/new"
            className="group relative rounded-2xl p-5 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
            style={{ isolation: 'isolate' }}
          >
            {/* decorative watermark */}
            <Plus
              size={120}
              strokeWidth={1.5}
              className="absolute -right-6 -bottom-8 text-white/15 group-hover:rotate-90 group-hover:text-white/25 transition-all duration-500"
            />

            <div className="relative w-11 h-11 rounded-xl bg-white/90 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200">
              <Plus size={22} className="text-[var(--navy)]" strokeWidth={2.5} />
            </div>
            <div className="relative font-bold text-[var(--navy)] text-lg">Create New Bill</div>
            <div className="relative text-xs text-[var(--navy)]/80 mt-1">Generate a new invoice & start a new journey</div>
            <div className="relative flex items-center gap-1.5 mt-4 text-sm font-semibold text-[var(--navy)]">
              Get started
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="relative rounded-2xl overflow-hidden shadow-md flex-1 min-h-[180px]">
            <img src={heroBus} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)] via-[var(--navy)]/50 to-[var(--navy)]/10" />
            <Quote size={34} className="absolute top-4 left-4 text-[var(--gold)]/70" fill="currentColor" strokeWidth={0} />
            <div className="relative z-10 h-full flex flex-col justify-end p-5">
              <p className="text-white font-serif italic text-lg leading-snug drop-shadow-sm">More Journeys,<br />More Stories</p>
              <div className="w-10 h-0.5 bg-[var(--gold)] rounded-full mt-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[var(--grey-200)] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[var(--ink)]">Recent Bills</h2>
            <p className="text-xs text-[var(--grey-600)]">Latest invoices from your customers</p>
          </div>
          <Link to="/bills" className="text-sm font-medium text-[var(--royal)] hover:underline flex items-center gap-1 shrink-0">
            View All <ChevronRight size={14} />
          </Link>
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
                  <th className="px-4 py-2.5 whitespace-nowrap">Invoice No</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Customer</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Route</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBills.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-t border-[var(--grey-100)] hover:bg-[var(--grey-50)]">
                    <td className="px-4 py-2.5 font-medium text-[var(--royal)] whitespace-nowrap">{b.invoiceNumber}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{b.customerName}</td>
                    <td className="px-4 py-2.5 text-[var(--grey-600)] whitespace-nowrap">{b.from} → {b.to}</td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">{formatCurrency(b.grandTotal)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button title="View" onClick={() => navigate(`/bills/${b.id}`)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)]">
                          <Eye size={15} />
                        </button>
                        <button title="Edit" onClick={() => navigate(`/bills/${b.id}/edit`)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)]">
                          <Pencil size={15} />
                        </button>
                        <button title="Download" disabled={downloadingId === b.id} onClick={() => handleDownload(b.id, b.invoiceNumber)} className="p-1.5 rounded-lg hover:bg-[var(--grey-100)] text-[var(--grey-600)] disabled:opacity-50">
                          <Download size={15} />
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

      {/* Trust badges */}
      <div className="card p-5 flex flex-wrap items-center justify-around gap-6 text-center">
        {[
          { icon: <ShieldCheck size={20} />, label: 'Safe Travels' },
          { icon: <Sofa size={20} />, label: 'Comfortable Ride' },
          { icon: <Timer size={20} />, label: 'On-Time Service' },
          { icon: <UserCheck size={20} />, label: 'Trusted Customers' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 text-[var(--grey-600)]">
            <div className="text-[var(--royal)]">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
