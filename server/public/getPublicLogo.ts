import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';

export type PublicLogo = {
  resortName: string;
  logoUrl: string;
};

type PublicLogoLean = PublicLogo;

export async function getPublicLogo(): Promise<PublicLogo> {
  try {
    await connectToDatabase();
    const settings = await PropertySettings.findOne({ key: 'property' })
      .select('resortName logoUrl')
      .lean<PublicLogoLean | null>();

    return {
      resortName: settings?.resortName ?? DEFAULT_PROPERTY_SETTINGS.resortName,
      logoUrl: settings?.logoUrl || '/images/logo-enhanced.png',
    };
  } catch {
    return {
      resortName: DEFAULT_PROPERTY_SETTINGS.resortName,
      logoUrl: '/images/logo-enhanced.png',
    };
  }
}
