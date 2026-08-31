import { connectToDatabase } from '@/lib/db';
import type { AdminAddon } from '@/lib/addons';
import { Addon } from '@/models/Addon';

export async function getAddons(): Promise<AdminAddon[]> {
  await connectToDatabase();
  const addons = await Addon.find()
    .select('name description type price partnerUrl active updatedAt')
    .sort({ active: -1, name: 1 })
    .lean();

  return addons.map((addon) => ({
    id: addon._id.toString(),
    name: addon.name,
    description: addon.description,
    type: addon.type,
    price: addon.price,
    partnerUrl: addon.partnerUrl,
    active: addon.active,
    updatedAt: addon.updatedAt.toISOString(),
  }));
}
