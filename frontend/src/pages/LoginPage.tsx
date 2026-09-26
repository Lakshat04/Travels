import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { LoadingButton } from '../components/LoadingButton';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import loginBg from '../assets/hero/login-bg.jpg';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid username or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[var(--navy)] bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Minimal readability overlay: only darkens the top strip (behind the logo) and left/bottom edges, leaving the photo clear elsewhere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/25 via-transparent to-[var(--navy)]/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)]/18 via-transparent to-transparent" />

      {/* Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-10 flex items-center gap-3 animate-fade-in">
        <LogoMark size={44} />
        <div className="leading-tight">
          <div className="text-white font-bold tracking-wide text-base sm:text-lg drop-shadow">NARAYANA TRAVELS</div>
          <div className="text-[var(--gold)] text-[10px] font-semibold tracking-[0.25em]">TRAVEL &amp; BILLING</div>
        </div>
      </div>

      {/* Login panel */}
      <div className="relative z-10 min-h-screen flex items-center justify-center lg:justify-end px-5 sm:px-10 lg:px-20 py-24">
        <div className="w-full max-w-sm rounded-3xl border border-white/25 bg-white/10 backdrop-blur-2xl shadow-2xl p-7 sm:p-8 animate-fade-in">
          <h1 className="text-xl font-bold text-white text-center drop-shadow-sm">Admin Login</h1>
          <p className="text-sm text-white/70 text-center mt-1 mb-6">
            Sign in to manage bills and invoices
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-500/15 border border-red-400/40 text-red-100 text-sm rounded-lg px-3 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/80 mb-1 block">Username or Email</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grey-400)]" />
                <input
                  className="input-field pl-9"
                  placeholder="admin"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/80 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grey-400)]" />
                <input
                  type="password"
                  className="input-field pl-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Signing in..."
              variant="primary"
              className="w-full py-3 group hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]"
            >
              <span className="inline-flex items-center gap-2">
                Sign In <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  );
}
