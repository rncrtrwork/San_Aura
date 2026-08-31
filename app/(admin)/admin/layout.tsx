import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
