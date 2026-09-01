import type { PublicContactInfo } from '@/lib/publicContact';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';

type PublicContactLean = PublicContactInfo;

function defaultPublicContactInfo(): PublicContactInfo {
  return {
    resortName: DEFAULT_PROPERTY_SETTINGS.resortName,
    address: DEFAULT_PROPERTY_SETTINGS.address,
    phone: DEFAULT_PROPERTY_SETTINGS.phone,
    email: DEFAULT_PROPERTY_SETTINGS.email,
    checkInTime: DEFAULT_PROPERTY_SETTINGS.checkInTime,
    checkOutTime: DEFAULT_PROPERTY_SETTINGS.checkOutTime,
    keyReturnTime: DEFAULT_PROPERTY_SETTINGS.keyReturnTime,
  };
}

export async function getPublicContactInfo(): Promise<PublicContactInfo> {
  try {
    await connectToDatabase();
    const settings = await PropertySettings.findOne({ key: 'property' })
      .select('resortName address phone email checkInTime checkOutTime keyReturnTime')
      .lean<PublicContactLean | null>();

    return settings ?? defaultPublicContactInfo();
  } catch {
    return defaultPublicContactInfo();
  }
}
