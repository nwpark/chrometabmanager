export interface DriveLoginStatus {
  syncInProgress: boolean;
  savedSessionsFileId?: string;
  userAccountInfo?: UserAccountInfo;
}

interface UserAccountInfo {
  displayName: string;
  photoLink: string;
  emailAddress: string;
}

export function createDefaultDriveLoginStatus(): DriveLoginStatus {
  return {
    syncInProgress: false
  };
}
