'use client';

import { useEffect } from 'react';

export function HomeVisitTracker() {
  useEffect(() => {
    void fetch('/api/visits', {
      method: 'POST',
      cache: 'no-store',
      keepalive: true,
    });
  }, []);

  return null;
}
