import type { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

type AdminShellProps = Readonly<{
  children: ReactNode;
}>;

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="admin-page lg:pl-64">
      <AdminSidebar />
      <div className="min-w-0">
        <AdminTopbar />
        <main id="main-content" className="p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
