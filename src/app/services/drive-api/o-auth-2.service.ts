import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {ChromeRuntimeErrorMessage} from '../../types/errors/chrome-runtime-error-message';

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

  refreshAuthToken(): Promise<string> {
    return this.getAuthToken().then(authToken => {
      return this.removeCachedAuthToken(authToken).then(() => {
        // todo: update login status if this fails
        return this.getAuthToken();
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

  private removeCachedAuthToken(authToken: string): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.identity.removeCachedAuthToken({token: authToken}, resolve);
    });
  }
}
