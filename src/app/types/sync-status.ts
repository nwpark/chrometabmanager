import {DriveLoginStatus} from './drive-login-status';
import {Preferences} from './preferences';

export enum SyncStatus {
  Enabled,
  SyncInProgress,
  Disabled,
  SignInRequired
}

const syncStatusMetaInfoMap: SyncStatusDetailsMap = {
  [SyncStatus.Enabled]: {
    shouldUseSyncStorage: true,
    matIcon: 'sync',
    matIconTooltip: 'Sync is enabled'
  },
  [SyncStatus.SyncInProgress]: {
    shouldUseSyncStorage: true,
    matIcon: 'sync',
    matIconTooltip: 'Sync in progress'
  },
  [SyncStatus.Disabled]: {
    shouldUseSyncStorage: false,
    matIcon: 'sync_disabled',
    matIconTooltip: 'Sync is not enabled'
  },
  [SyncStatus.SignInRequired]: {
    shouldUseSyncStorage: false,
    matIcon: 'sync_problem',
    matIconTooltip: 'Sign in required'
  },
};

export function getSyncStatus(driveLoginStatus: DriveLoginStatus, preferences: Preferences, authStatus: boolean): SyncStatus {
  if (!preferences.syncSavedWindows) {
    return SyncStatus.Disabled;
  }
  if (!authStatus) {
    return SyncStatus.SignInRequired;
  }
  if (driveLoginStatus.syncInProgress) {
    return SyncStatus.SyncInProgress;
  }
  return SyncStatus.Enabled;
}

export function getSyncStatusDetails(syncStatus: SyncStatus) {
  return syncStatusMetaInfoMap[syncStatus];
}

type SyncStatusDetailsMap = {
  [syncStatus in SyncStatus]: SyncStatusDetails
};

export interface SyncStatusDetails {
  shouldUseSyncStorage: boolean;
  matIcon: string;
  matIconTooltip: string;
}
