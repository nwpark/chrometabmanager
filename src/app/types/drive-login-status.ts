export interface DriveLoginStatus {
  isLoggedIn: boolean;
  syncEnabled: boolean;
  syncInProgress: boolean;
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
    syncEnabled: false,
    syncInProgress: false
  };
}
