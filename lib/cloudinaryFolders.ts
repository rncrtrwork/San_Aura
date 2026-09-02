export const CLOUDINARY_FOLDERS = {
  media: 'sun-aura/media',
  events: 'sun-aura/events',
  memberDocuments: 'sun-aura/member-documents',
  settings: 'sun-aura/settings',
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

export function isCloudinaryPublicIdInFolder(publicId: string, folder: CloudinaryFolder): boolean {
  return publicId.startsWith(`${folder}/`) && publicId.length <= 500;
}
