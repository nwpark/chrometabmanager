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
    statusMessage: 'All changes saved to Drive',
    matIcon: 'cloud_done',
    matIconTooltip: 'Sync is enabled'
  },
  [SyncStatus.SyncInProgress]: {
    shouldUseSyncStorage: true,
    statusMessage: 'Sync in progress',
    matIcon: 'sync',
    matIconTooltip: 'Sync in progress'
  },
  [SyncStatus.Disabled]: {
    shouldUseSyncStorage: false,
    statusMessage: 'Sync is not currently enabled',
    matIcon: 'cloud_off',
    matIconTooltip: 'Sync is not enabled'
  },
  [SyncStatus.SignInRequired]: {
    shouldUseSyncStorage: false,
    statusMessage: 'Sign in required',
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
  statusMessage: string;
  matIcon: string;
  matIconTooltip: string;
}
