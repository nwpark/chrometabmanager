import {Injectable} from '@angular/core';
import {BehaviorSubject, noop} from 'rxjs';
import {distinctUntilChanged, filter, take} from 'rxjs/operators';
import {getCurrentTimeInSeconds, getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {MessagePassingService} from '../messaging/message-passing.service';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {createRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';
import {LocalStorageService} from '../storage/local-storage.service';
import {getAccessTokenFromAuthCode} from './o-auth-2-endpoints';
import {getAuthCodeFromWebAuthResponseUrl, getOAuth2WebAuthFlowUrl} from './o-auth-2-utils';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  private authStatusSubject = new BehaviorSubject<boolean>(undefined);
  authStatus$ = this.authStatusSubject.pipe(filter(isNotNullOrUndefined), distinctUntilChanged());

  constructor(private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService,
              private localStorageService: LocalStorageService) {
    this.messageReceiverService.authStatusUpdated$.subscribe(authStatus => {
      this.hydrateAuthStatus(authStatus);
    });
    this.refreshAuthStatus();
  }

  private hydrateAuthStatus(authenticationStatus: boolean) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing authentication status');
    this.authStatusSubject.next(authenticationStatus);
  }

  getAuthStatus(): Promise<boolean> {
    return this.authStatus$.pipe(take(1)).toPromise();
  }

  refreshAuthStatus(): Promise<any> {
    return this.getTokenAndUpdateStatus().catch(noop);
  }

  getAuthToken(): Promise<string> {
    return this.getTokenAndUpdateStatus();
  }

  performInteractiveLogin(): Promise<void> {
    return this.launchWebAuthFlow().then(authCode => {
      return getAccessTokenFromAuthCode(authCode);
    }).then(res => {
      return this.localStorageService.setOAuth2TokenState({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        expirationTime: getCurrentTimeInSeconds() + res.expires_in
      });
    });
  }

  private launchWebAuthFlow(): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({url: getOAuth2WebAuthFlowUrl(), interactive: true}, responseUrl => {
        if (chrome.runtime.lastError) {
          reject(createRuntimeError(ErrorCode.AuthTokenNotGranted, chrome.runtime.lastError.message));
        } else {
          resolve(getAuthCodeFromWebAuthResponseUrl(responseUrl));
        }
      });
    });
  }

  private getTokenAndUpdateStatus(): Promise<string> {
    return this.localStorageService.getOAuth2TokenState().then(oAuth2TokenState => {
      if (oAuth2TokenState.accessToken) {
        this.updateAuthStatus(true);
        return oAuth2TokenState.accessToken;
      }
      this.updateAuthStatus(false);
      return Promise.reject(createRuntimeError(ErrorCode.AuthTokenNotGranted));
    });
  }

  // todo
  removeCachedAuthToken(): Promise<void> {
    return Promise.resolve();
  }

  private updateAuthStatus(authStatus: boolean) {
    if (authStatus !== this.authStatusSubject.getValue()) {
      console.log(getCurrentTimeStringWithMillis(), '- updating authentication status');
      this.authStatusSubject.next(authStatus);
      this.messagePassingService.broadcastAuthStatus(authStatus);
    }
  }
}
