import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Settings</h1>
        <p className="text-sm text-[var(--grey-600)]">Account and company information</p>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <label className="label">Signed in as</label>
          <div className="text-sm font-medium text-[var(--ink)]">{user?.fullName} ({user?.username})</div>
        </div>
        <div>
          <label className="label">Company Name</label>
          <div className="text-sm font-medium text-[var(--ink)]">Narayana Travels</div>
        </div>
        <div>
          <label className="label">Invoice Number Format</label>
          <div className="text-sm font-medium text-[var(--ink)]">NT-YYYY-0001 (auto-generated)</div>
        </div>
      </div>
    </div>
  );
}
