'use client';

import { useEffect } from 'react';

const homeVisitStorageKey = 'sun-aura-home-visit-tracked';

function shouldTrackHomeVisit(): boolean {
  try {
    if (window.sessionStorage.getItem(homeVisitStorageKey)) return false;
    window.sessionStorage.setItem(homeVisitStorageKey, 'true');
    return true;
  } catch {
    return true;
  }
}

export function HomeVisitTracker() {
  useEffect(() => {
    if (!shouldTrackHomeVisit()) return;

    void fetch('/api/visits', {
      method: 'POST',
      cache: 'no-store',
      keepalive: true,
    });
  }, []);

  return null;
}
