import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-fraunces', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Sun Aura Resort | Northwest Indiana',
  description: 'A private 300-acre retreat in Northwest Indiana.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${fraunces.variable} ${inter.variable}`}><body>{children}</body></html>;
}
