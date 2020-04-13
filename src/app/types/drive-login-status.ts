export interface DriveLoginStatus {
  isLoggedIn: boolean;
  userAccountInfo?: UserAccountInfo;
}

interface UserAccountInfo {
  displayName: string;
  photoLink: string;
  emailAddress: string;
}

export function createDefaultDriveLoginStatus(): DriveLoginStatus {
  return {
    isLoggedIn: false
  };
}
