'use client';

import { FormEvent } from 'react';
import { Calendar, ChevronDown } from './icons';

export function BookingSearchCard() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      onSubmit={submit}
      className="grid w-full gap-0 overflow-hidden rounded-xl bg-[#fbfaf6] p-4 text-forest-900 shadow-booking md:grid-cols-[1fr_1fr_1fr_168px] md:p-0"
      aria-label="Search resort availability"
    >
      <label className="relative border-b border-line px-4 py-4 md:border-b-0 md:border-r md:px-7 md:py-6">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.09em]">
          Check In
        </span>
        <span className="flex items-center justify-between gap-3 text-sm text-ink-700">
          <span>Select date</span>
          <Calendar className="h-5 w-5" />
        </span>
        <input
          type="date"
          className="absolute inset-x-4 bottom-3 h-9 cursor-pointer opacity-0"
          aria-label="Check in date"
        />
      </label>
      <label className="relative border-b border-line px-4 py-4 md:border-b-0 md:border-r md:px-7 md:py-6">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.09em]">
          Check Out
        </span>
        <span className="flex items-center justify-between gap-3 text-sm text-ink-700">
          <span>Select date</span>
          <Calendar className="h-5 w-5" />
        </span>
        <input
          type="date"
          className="absolute inset-x-4 bottom-3 h-9 cursor-pointer opacity-0"
          aria-label="Check out date"
        />
      </label>
      <label className="relative px-4 py-4 md:px-7 md:py-6">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.09em]">
          Stay Type
        </span>
        <span className="flex items-center justify-between gap-3 text-sm text-ink-700">
          <span>All Stay Types</span>
          <ChevronDown className="h-5 w-5" />
        </span>
        <select
          className="absolute inset-x-4 bottom-3 h-9 cursor-pointer opacity-0"
          aria-label="Stay type"
          defaultValue="all"
        >
          <option value="all">All Stay Types</option>
          <option>Cabin</option>
          <option>RV</option>
          <option>Tent</option>
        </select>
      </label>
      <div className="flex items-center p-1 pt-3 md:p-4">
        <button
          className="h-14 w-full rounded bg-[#E47A3F] text-xs font-semibold uppercase tracking-[.06em] text-white transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="submit"
        >
          Search
        </button>
      </div>
    </form>
  );
}
