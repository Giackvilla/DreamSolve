import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, ListChecks, Moon, Settings as SettingsIcon } from 'lucide-react';
import { InstallPrompt } from './InstallPrompt';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/editor', label: 'Routine', icon: ListChecks },
  { to: '/settings', label: 'Bedtime', icon: Moon },
  { to: '/morning', label: 'Morning', icon: SettingsIcon },
];

export default function Layout() {
  const loc = useLocation();
  // Hide chrome during full-screen player and bedtime screens.
  const hideChrome =
    loc.pathname.startsWith('/player') || loc.pathname.startsWith('/bedtime');

  return (
    <div className="min-h-full flex flex-col bg-night-glow text-night-50">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <Outlet />
      </main>

      {!hideChrome && <InstallPrompt />}

      {!hideChrome && (
        <nav
          className="fixed bottom-0 inset-x-0 z-20 border-t border-night-700/70 bg-night-900/80 backdrop-blur-md"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ul className="grid grid-cols-4 max-w-md mx-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                      isActive ? 'text-moon-300' : 'text-night-500 hover:text-night-50'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.6} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
