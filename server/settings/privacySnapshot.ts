import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { PrivacySettings } from '@/models/PropertySettings';

export function privacySettingsSnapshot(privacy: PrivacySettings): ActivitySnapshot {
  return {
    photographyProhibited: privacy.photographyProhibited,
    videoProhibited: privacy.videoProhibited,
    showPrivacyNoticeAtBooking: privacy.showPrivacyNoticeAtBooking,
  };
}
