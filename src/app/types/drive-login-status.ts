export interface DriveLoginStatus {
  isLoggedIn: boolean;
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
    isLoggedIn: false,
    syncInProgress: false
  };
}
