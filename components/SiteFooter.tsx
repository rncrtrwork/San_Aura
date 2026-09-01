import Link from 'next/link';
import type { PublicNavigationItem } from '@/lib/publicWebsite';
import { Facebook, Mail } from './icons';

type SiteFooterProps = {
  navigation: PublicNavigationItem[];
};

export function SiteFooter({ navigation }: SiteFooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-transparent px-6 py-10 md:px-10 lg:px-12 lg:py-8">
      <div className="relative z-10 mx-auto grid max-w-[1360px] gap-9 pr-20 text-white  md:grid-cols-4 md:gap-12 md:pr-32">
        <div>
          <p className="font-serif text-2xl">SUN AURA RESORT</p>
          <address className="mt-3 text-xs not-italic leading-5 text-white">
            3148 W 700 N<br />
            La Porte, IN 46350
            <br />
            United States
          </address>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.08em]">Contact</p>
          <p className="mt-4 text-xs leading-5 text-white ">
            (219) 405-SUN1 (7861)
            <br />
            <span>hello@sunauraresort.com</span>
            <br />
            <span>sunauraresort.com</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.08em]">Explore</p>
          <nav aria-label="Footer navigation" className="mt-4 grid gap-2">
            {navigation.slice(0, 6).map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-white hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.08em]">Connect</p>
          <div className="mt-4 flex items-center gap-5">
            <button type="button" aria-label="Facebook">
              <Facebook className="h-6 w-6" />
            </button>
            <button type="button" aria-label="Email">
              <Mail className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
