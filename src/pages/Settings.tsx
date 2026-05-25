import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { requestNotificationPermission } from '@/hooks/useNotifications';

export default function Settings() {
  const settings = useAppStore((s) => s.settings);
  const setBedtime = useAppStore((s) => s.setBedtime);
  const setWeekendsDifferent = useAppStore((s) => s.setWeekendsDifferent);
  const setWeekendBedtime = useAppStore((s) => s.setWeekendBedtime);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    () =>
      typeof Notification === 'undefined'
        ? 'unsupported'
        : Notification.permission,
  );

  // Keep the local state fresh if the user changes the OS-level permission.
  useEffect(() => {
    const onFocus = () => {
      if (typeof Notification !== 'undefined') setPermission(Notification.permission);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const onRequest = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') setNotificationsEnabled(true);
  };

  return (
    <section className="px-6 pt-12 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-light">Bedtime</h1>

      <label className="block">
        <span className="text-sm text-night-500">Default bedtime</span>
        <input
          type="time"
          value={settings.defaultBedtime}
          onChange={(e) => setBedtime(e.target.value)}
          className="mt-2 w-full bg-night-800 border border-night-700 rounded-xl px-4 py-3 text-2xl tabular-nums"
        />
      </label>

      <div className="rounded-2xl bg-night-800/70 border border-night-700 p-4 space-y-4">
        <label className="flex items-center justify-between">
          <span>Weekends different</span>
          <input
            type="checkbox"
            checked={settings.weekendsDifferent}
            onChange={(e) => setWeekendsDifferent(e.target.checked)}
            className="w-5 h-5 accent-moon-500"
          />
        </label>
        {settings.weekendsDifferent && (
          <label className="block">
            <span className="text-sm text-night-500">Weekend bedtime</span>
            <input
              type="time"
              value={settings.weekendBedtime}
              onChange={(e) => setWeekendBedtime(e.target.value)}
              className="mt-2 w-full bg-night-900 border border-night-700 rounded-xl px-4 py-3 text-xl tabular-nums"
            />
          </label>
        )}
      </div>

      <div className="rounded-2xl bg-night-800/70 border border-night-700 p-4 space-y-3">
        <label className="flex items-center justify-between">
          <div>
            <div>Bedtime notification</div>
            <div className="text-xs text-night-500">
              Pings at T-60 (wind-down) and T-0 (lights out).
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 accent-moon-500"
          />
        </label>
        <PermissionRow permission={permission} onRequest={onRequest} />
      </div>

      <div className="rounded-2xl bg-night-800/70 border border-night-700 p-4">
        <div className="text-sm text-night-500">Wind-down lead</div>
        <div className="text-lg">{settings.windDownMinutes} min</div>
        <div className="text-xs text-night-500 mt-1">
          Locked at 60 in v1. Adjustable slider arrives in v2.
        </div>
      </div>
    </section>
  );
}

function PermissionRow({
  permission,
  onRequest,
}: {
  permission: NotificationPermission | 'unsupported';
  onRequest: () => void;
}) {
  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 text-xs text-moon-300">
        <Bell size={12} />
        Notifications allowed
      </div>
    );
  }
  if (permission === 'denied') {
    return (
      <div className="flex items-start gap-2 text-xs text-ember-400">
        <BellOff size={12} className="mt-0.5 shrink-0" />
        <span>
          Notifications blocked. Enable in your browser's site settings to get
          the T-60 and T-0 pings.
        </span>
      </div>
    );
  }
  if (permission === 'unsupported') {
    return (
      <div className="text-xs text-night-500">
        Notifications aren't supported in this browser.
      </div>
    );
  }
  // 'default' — never asked
  return (
    <button
      type="button"
      onClick={onRequest}
      className="text-xs text-moon-300 underline underline-offset-2 hover:text-moon-200"
    >
      Allow notifications
    </button>
  );
}
