import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, Receipt, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LogoMark } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bills/new', label: 'Create Bill', icon: FilePlus2 },
  { to: '/bills', label: 'Bills', icon: Receipt },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--grey-50)]">
      <header className="bg-[var(--navy)] text-white shrink-0 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-8 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <LogoMark size={32} />
              <div className="leading-tight hidden sm:block">
                <div className="font-bold text-sm tracking-wide">NARAYANA</div>
                <div className="text-[9px] text-[var(--gold)] tracking-[0.2em]">TRAVELS</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <div className="text-sm font-semibold">{user?.fullName}</div>
              <div className="text-xs text-white/60">Administrator</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--gold)] text-[var(--navy)] flex items-center justify-center font-bold text-sm shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut size={16} />
            </button>
            <button className="md:hidden text-white/80" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-[var(--navy)] text-white flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <LogoMark size={30} />
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} className="text-white/70" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/70'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-white/10">
              <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden max-w-[1600px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
