import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';
import {ChromeRuntimeErrorMessage} from '../../types/errors/chrome-runtime-error-message';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  constructor() { }

  getAuthToken(details = {interactive: false}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken(details, token => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(token);
        }
      });
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
    }).catch(() => {
      return false;
    });
  }

  chromeSignInRequired(): Promise<boolean> {
    return this.getAuthToken().then(() => {
      return false;
    }).catch(errorMessage => {
      return errorMessage === ChromeRuntimeErrorMessage.UserNotSignedIn;
    });
  }

  private requestRevokeAuthToken(authToken: string): Promise<any> {
    const url = environment.accountsApiRevokeTokenUrl.replace('AUTH_TOKEN', authToken);
    const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, url).build();

    return httpRequest.send();
  }

  private removeCachedAuthToken(authToken: string): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.identity.removeCachedAuthToken({token: authToken}, resolve);
    });
  }
}
