import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, ListChecks, Settings as SettingsIcon, Sunrise } from 'lucide-react';
import { InstallPrompt } from './InstallPrompt';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/editor', label: 'Routine', icon: ListChecks },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/morning', label: 'Morning', icon: Sunrise },
];

/**
 * Returns true while a text input / textarea / contenteditable has focus.
 * Used to hide the bottom chrome so the mobile virtual keyboard doesn't
 * shove the nav up over the input being typed into.
 */
function useTypingFocus() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isTextual = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.isContentEditable) return true;
      if (el instanceof HTMLTextAreaElement) return true;
      if (el instanceof HTMLInputElement) {
        const t = el.type;
        return t !== 'button' && t !== 'checkbox' && t !== 'submit' && t !== 'reset' && t !== 'radio';
      }
      return false;
    };
    const onIn = (e: FocusEvent) => {
      if (isTextual(e.target)) setTyping(true);
    };
    const onOut = (e: FocusEvent) => {
      // relatedTarget is what's getting focus next; if still textual, stay hidden.
      if (!isTextual((e as FocusEvent & { relatedTarget: EventTarget | null }).relatedTarget)) {
        setTyping(false);
      }
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}

export default function Layout() {
  const loc = useLocation();
  const typing = useTypingFocus();

  // Hide chrome during full-screen player and bedtime screens.
  const hideChrome =
    loc.pathname.startsWith('/player') || loc.pathname.startsWith('/bedtime');

  // Hide nav + install prompt while typing so the keyboard doesn't push the
  // fixed-bottom bar up over the field. Position-fixed elements anchor to the
  // *visual* viewport, which shrinks under the keyboard.
  const chromeVisible = !hideChrome && !typing;

  return (
    <div className="min-h-full flex flex-col bg-night-glow text-night-50">
      {/* dimmable wraps only the content; keeping the filter off the nav
          ensures `position: fixed` stays anchored to the viewport. */}
      <main className="dimmable flex-1 overflow-y-auto no-scrollbar pb-32">
        <Outlet />
      </main>

      {chromeVisible && <InstallPrompt />}

      {chromeVisible && (
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
