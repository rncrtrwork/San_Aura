import type { ReactNode } from 'react';

type MemberLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function MemberLayout({ children }: MemberLayoutProps) {
  return children;
}
