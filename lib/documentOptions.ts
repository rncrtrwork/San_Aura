export const DOCUMENT_TYPES = [
  'photoId',
  'insurance',
  'petRabies',
  'waiverGeneral',
  'waiverPet',
  'vehicleProof',
] as const;

export const DOCUMENT_OWNER_TYPES = ['Member', 'Guest'] as const;
export const EXPIRING_DOCUMENT_TYPES = ['insurance', 'petRabies'] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type DocumentOwnerType = (typeof DOCUMENT_OWNER_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  photoId: 'Photo ID',
  insurance: 'Insurance',
  petRabies: 'Pet rabies record',
  waiverGeneral: 'General waiver',
  waiverPet: 'Pet waiver',
  vehicleProof: 'Vehicle proof',
};

export function documentTracksExpiry(type: DocumentType): boolean {
  return EXPIRING_DOCUMENT_TYPES.some((expiringType) => expiringType === type);
}
