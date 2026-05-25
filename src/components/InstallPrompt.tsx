import { useEffect, useState } from 'react';
import { Download, Share, X as XIcon } from 'lucide-react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'dreamsolve:install-dismissed';

/**
 * Tiny install affordance — only shows when:
 *   - The user hasn't dismissed it before, AND
 *   - The browser fired `beforeinstallprompt` (Chromium/Android/desktop), OR
 *   - We detect iOS Safari (which never fires the event but supports Add-to-Home).
 *
 * Hidden completely once installed (display-mode: standalone).
 */
export function InstallPrompt() {
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [iosTipOpen, setIosTipOpen] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1',
  );

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  const installed =
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches;
  if (installed || dismissed) return null;

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

  // Nothing to do — neither BIP fired nor iOS Safari.
  if (!bip && !isIOS) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const onInstall = async () => {
    if (bip) {
      await bip.prompt();
      const { outcome } = await bip.userChoice;
      setBip(null);
      if (outcome === 'accepted') setDismissed(true);
    } else if (isIOS) {
      setIosTipOpen((v) => !v);
    }
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30 max-w-md w-[calc(100%-1.5rem)] rounded-2xl border border-night-700 bg-night-800/95 backdrop-blur-md p-3 shadow-xl shadow-black/50"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-full bg-moon-500/20 text-moon-300 p-2">
          {isIOS && !bip ? <Share size={16} /> : <Download size={16} />}
        </div>
        <div className="flex-1 text-sm">
          <div>Install DreamSolve</div>
          <div className="text-xs text-night-500">
            Notifications work best when installed.
          </div>
        </div>
        <button
          type="button"
          onClick={onInstall}
          className="text-xs px-3 py-1.5 rounded-full bg-moon-500 text-night-950 font-medium hover:bg-moon-400 transition"
        >
          {isIOS && !bip ? 'How' : 'Install'}
        </button>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          className="text-night-500 hover:text-night-200 p-1"
        >
          <XIcon size={14} />
        </button>
      </div>
      {iosTipOpen && (
        <div className="mt-3 text-xs text-night-300 leading-relaxed border-t border-night-700 pt-3">
          In Safari, tap <Share size={11} className="inline -mt-0.5" /> Share →
          <strong> Add to Home Screen</strong>. The app will run offline and use
          your device's local notifications.
        </div>
      )}
    </div>
  );
}
