import {DriveLoginStatus} from './drive-login-status';
import {Preferences} from './preferences';

export enum SyncStatus {
  Enabled,
  SyncInProgress,
  Disabled,
  NotSignedIn
}

const syncStatusMetaInfoMap = {
  [SyncStatus.Enabled]: {
    shouldUseSyncStorage: true,
    syncStatusIcon: 'sync'
  },
  [SyncStatus.SyncInProgress]: {
    shouldUseSyncStorage: true,
    syncStatusIcon: 'sync'
  },
  [SyncStatus.Disabled]: {
    shouldUseSyncStorage: false,
    syncStatusIcon: 'sync_disabled'
  },
  [SyncStatus.NotSignedIn]: {
    shouldUseSyncStorage: false,
    syncStatusIcon: 'sync_problem'
  },
};

type SyncStatusMetaInfoMap = {
  [syncStatus in SyncStatus]: {
    shouldUseSyncStorage: boolean;
    syncStatusMatIcon: string;
  }
};

export function getSyncStatus(driveLoginStatus: DriveLoginStatus, preferences: Preferences): SyncStatus {
  if (!preferences.syncSavedWindows) {
    return SyncStatus.Disabled;
  }
  if (!driveLoginStatus.isLoggedIn) {
    return SyncStatus.NotSignedIn;
  }
  if (driveLoginStatus.syncInProgress) {
    return SyncStatus.SyncInProgress;
  }
  return SyncStatus.Enabled;
}

export function getSyncStatusMetaInfo(syncStatus: SyncStatus) {
  return syncStatusMetaInfoMap[syncStatus];
}
