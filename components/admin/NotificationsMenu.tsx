'use client';

import { Bell, CalendarCheck, CreditCard, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  icon: LucideIcon;
};

const notifications: NotificationItem[] = [
  {
    id: 'arrival-cabin-04',
    title: 'Arrival due today',
    detail: 'Cabin 04 · check-in from 2:00 PM',
    time: '8:30 AM',
    unread: true,
    icon: CalendarCheck,
  },
  {
    id: 'payment-recorded',
    title: 'Payment recorded',
    detail: 'Manual payment applied to a member balance',
    time: '8:02 AM',
    unread: true,
    icon: CreditCard,
  },
  {
    id: 'document-expiry',
    title: 'Document renewal due',
    detail: 'Two insurance records expire this month',
    time: 'Yesterday',
    unread: false,
    icon: TriangleAlert,
  },
];

export function NotificationsMenu() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Open notifications, ${unreadCount} unread`}
        aria-expanded={open}
        aria-controls="admin-notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative grid size-11 place-items-center rounded-lg text-forest-900 transition-colors hover:bg-black/5"
      >
        <Bell aria-hidden="true" className="size-5" strokeWidth={1.7} />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-admin-accent ring-2 ring-admin-surface" />
        ) : null}
      </button>
      {open ? (
        <section
          id="admin-notifications"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-admin-border bg-white shadow-card"
        >
          <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
            <h2 className="font-serif text-xl text-forest-900">Notifications</h2>
            <span className="rounded-full bg-admin-accent/10 px-2.5 py-1 text-xs font-bold text-admin-accent">
              {unreadCount} new
            </span>
          </div>
          <div className="divide-y divide-admin-border">
            {notifications.map(({ id, title, detail, time, unread, icon: Icon }) => (
              <article
                key={id}
                className={`flex gap-3 px-4 py-3.5 ${unread ? 'bg-admin-canvas' : ''}`}
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-forest-900/8 text-admin-sidebar">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-forest-900">{title}</h3>
                    <time className="shrink-0 text-[11px] text-admin-muted">{time}</time>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-admin-muted">{detail}</p>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="w-full border-t border-admin-border px-4 py-3 text-left text-sm font-semibold text-admin-sidebar hover:bg-admin-canvas"
          >
            View all notifications
          </button>
        </section>
      ) : null}
    </div>
  );
}
