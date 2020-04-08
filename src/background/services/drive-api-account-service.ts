import {HTTPMethod, HttpRequestBuilder} from '../types/http-request';
import {isNullOrUndefined} from 'util';

export class DriveApiAccountService {

  private readonly DRIVE_API_ABOUT_GET = 'https://www.googleapis.com/drive/v3/about?fields=user';

  private userAccountInfo;
  initialLoginSuccess: Promise<boolean>;

  constructor() {
    this.initialLoginSuccess = this.attemptAutomaticLogin();
  }

  private attemptAutomaticLogin(): Promise<boolean> {
    return this.getAuthToken().then(authToken => {
      if (authToken) {
        this.refreshUserAccountInfoFromDrive(authToken);
      }
      return !isNullOrUndefined(authToken);
    });
  }

  performInteractiveLogin(): Promise<void> {
    return this.getAuthToken({interactive: true}).then(authToken => {
      return this.refreshUserAccountInfoFromDrive(authToken);
    });
  }

  private refreshUserAccountInfoFromDrive(authToken: string) {
    this.fetchUserAccountInformation(authToken).then(res => {
      this.userAccountInfo = {
        displayName: res.displayName,
        photoLink: res.photoLink,
        emailAddress: res.emailAddress
      };
    });
  }

  private fetchUserAccountInformation(authToken: string): Promise<any> {
    const httpRequest = new HttpRequestBuilder(HTTPMethod.GET, this.DRIVE_API_ABOUT_GET)
      .authorizationHeader(`Bearer ${authToken}`)
      .responseTypeJSON()
      .build();

    return httpRequest.send();
  }

  getAuthToken(details = {interactive: false}): Promise<string> {
    return new Promise<string>(resolve => {
      chrome.identity.getAuthToken(details, resolve);
    });
  }
}
