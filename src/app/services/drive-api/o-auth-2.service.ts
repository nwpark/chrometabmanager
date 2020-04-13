import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  // This has an alternative url, https://accounts.google.com/o/oauth2/revoke?token=AUTH_TOKEN
  private readonly ACCOUNTS_API_REVOKE_TOKEN = 'https://oauth2.googleapis.com/revoke?token=AUTH_TOKEN';

  constructor() { }

  getAuthToken(details = {interactive: false}): Promise<string> {
    return new Promise<string>(resolve => {
      chrome.identity.getAuthToken(details, resolve);
    });
  }

  revokeAuthToken(): Promise<any> {
    return this.getAuthToken().then(authToken => {
      return this.removeCachedAuthToken(authToken).then(() => {
        return this.requestRevokeAuthToken(authToken);
      });
    });
  }

  hasValidAuthToken(): Promise<boolean> {
    return this.getAuthToken().then(authToken => {
      return !isNullOrUndefined(authToken);
    });
  }

  private requestRevokeAuthToken(authToken: string): Promise<any> {
    const url = this.ACCOUNTS_API_REVOKE_TOKEN.replace('AUTH_TOKEN', authToken);
    const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, url).build();

    return httpRequest.send();
  }

  private removeCachedAuthToken(authToken: string): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.identity.removeCachedAuthToken({token: authToken}, resolve);
    });
  }
}
