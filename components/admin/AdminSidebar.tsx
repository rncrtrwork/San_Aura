'use client';

import {
  Activity,
  BarChart3,
  CalendarDays,
  CircleHelp,
  FileText,
  Gauge,
  GalleryHorizontalEnd,
  House,
  Map,
  Menu,
  Settings,
  Sparkles,
  TicketCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: Gauge },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Reservations', href: '/admin/reservations', icon: TicketCheck },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays },
  { label: 'Events', href: '/admin/events', icon: Sparkles },
  { label: 'Stays & Rates', href: '/admin/stays', icon: House },
  { label: 'Resort Map', href: '/admin/resort-map', icon: Map },
  { label: 'Gallery', href: '/admin/gallery', icon: GalleryHorizontalEnd },
  { label: 'FAQ & Rules', href: '/admin/faq-rules', icon: CircleHelp },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Activity Log', href: '/admin/activity', icon: Activity },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function NavigationLinks({ pathname }: { pathname: string }) {
  return navItems.map(({ label, href, icon: Icon }) => {
    const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));

    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
          active
            ? 'bg-admin-sidebar-active text-white'
            : 'text-white/85 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.7} />
        <span>{label}</span>
      </Link>
    );
  });
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto overscroll-contain bg-admin-sidebar px-4 py-6 text-white lg:flex">
        <span className="font-serif text-lg tracking-wide text-center">SUN AURA ADMIN</span>
        <nav aria-label="Admin navigation" className="space-y-1.5">
          <NavigationLinks pathname={pathname} />
        </nav>
      </aside>

      <details className="group sticky top-0 z-50 max-h-screen overflow-y-auto bg-admin-sidebar text-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
          <span className="font-serif text-lg tracking-wide text-center">Sun Aura Admin</span>
          <Menu aria-hidden="true" className="size-6" />
        </summary>
        <nav
          aria-label="Admin navigation"
          className="grid gap-1 border-t border-white/15 p-3 sm:grid-cols-2"
        >
          <NavigationLinks pathname={pathname} />
        </nav>
      </details>
    </>
  );
}
