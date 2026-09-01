import type { PublicMapSite } from '@/lib/publicMap';
import { getResortMapSites } from '@/server/sites/getResortMapSites';

export async function getPublicResortMap(): Promise<PublicMapSite[]> {
  try {
    return await getResortMapSites();
  } catch {
    return [];
  }
}
