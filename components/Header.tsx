'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { moreLinks, navLinks } from '@/lib/content';
import { ChevronDown } from './icons';

const logoMask = {
  clipPath: 'polygon(48% 0, 67% 3%, 78% 14%, 91% 20%, 98% 34%, 98% 66%, 91% 80%, 78% 85%, 68% 96%, 50% 100%, 31% 96%, 21% 85%, 9% 80%, 2% 66%, 2% 34%, 9% 20%, 22% 14%, 32% 3%)',
};

function Logo() {
  return (
    <button type="button" aria-label="Sun Aura Resort home" className="relative h-[62px] w-[94px] shrink-0 overflow-hidden sm:h-[70px] sm:w-[106px]" style={logoMask}>
      <Image src="/images/logo-enhanced.png" alt="Sun Aura Resort" fill priority sizes="106px" className="object-cover" />
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function closeMore(event: MouseEvent) {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', closeMore);
    return () => document.removeEventListener('mousedown', closeMore);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-[82px] border-b border-line bg-cream lg:h-[96px]">
      <div className="mx-auto flex h-full max-w-[1536px] items-center px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Primary navigation" className="ml-auto hidden min-w-0 items-center gap-1 pl-6 xl:flex xl:gap-2">
          {navLinks.map((label) => (
            <button key={label} type="button" className="whitespace-nowrap rounded px-3 py-3 text-[13px] text-forest-900 transition-colors hover:bg-cream-alt xl:px-4">{label}</button>
          ))}
          <div className="relative" ref={moreRef}>
            <button type="button" aria-expanded={moreOpen} onClick={() => setMoreOpen(!moreOpen)} className="flex items-center gap-1 rounded px-3 py-3 text-[13px] text-forest-900 transition-colors hover:bg-cream-alt xl:px-4">
              More <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute left-0 top-full mt-2 w-52 overflow-hidden rounded-md border border-line bg-[#fbfaf6] p-2 shadow-card transition ${moreOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}>
              {moreLinks.map((label) => <button key={label} type="button" onClick={() => setMoreOpen(false)} className="block w-full rounded px-4 py-3 text-left text-sm text-forest-900 hover:bg-cream-alt">{label}</button>)}
            </div>
          </div>
        </nav>

        <div className="ml-3 hidden shrink-0 items-center gap-3 xl:flex">
          <button type="button" className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[.06em] text-forest-900">Join Us</button>
          <button type="button" className="rounded px-7 py-4 text-[12px] bg-[#E47A3F] font-semibold uppercase tracking-[.06em] text-white transition-colors hover:bg-orange-400">Book Now</button>
        </div>

        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)} className="absolute right-5 top-[19px] z-10 flex h-11 w-11 flex-col items-center justify-center gap-[6px] sm:right-6 xl:hidden">
          <span className={`h-px w-6 bg-forest-900 transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-px w-6 bg-forest-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-px w-6 bg-forest-900 transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

      <div className={`fixed inset-0 top-[82px] overflow-y-auto bg-cream px-7 pb-10 pt-6 transition-all duration-300 xl:hidden ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-4 opacity-0'}`}>
        <nav className="flex flex-col" aria-label="Mobile navigation">
          {navLinks.map((label) => <button key={label} type="button" onClick={() => setOpen(false)} className="border-b border-line py-4 text-left font-serif text-2xl text-forest-900">{label}</button>)}
          <p className="pt-6 text-[10px] font-semibold uppercase tracking-[.1em] text-gold-700">More</p>
          {moreLinks.map((label) => <button key={label} type="button" onClick={() => setOpen(false)} className="border-b border-line py-3 text-left text-sm text-forest-900">{label}</button>)}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setOpen(false)} className="rounded border border-forest-900 px-4 py-4 text-xs font-semibold uppercase tracking-[.06em] text-forest-900">Join Us</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded bg-gold-600 px-4 py-4 text-xs font-semibold uppercase tracking-[.06em] text-white">Book Now</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
