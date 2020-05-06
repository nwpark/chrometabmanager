import {Injectable} from '@angular/core';
import {ChromeRuntimeErrorMessage} from '../../types/errors/chrome-runtime-error-message';
import {BehaviorSubject, noop} from 'rxjs';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {MessagePassingService} from '../messaging/message-passing.service';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {isRuntimeError, runtimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  private authStatusSubject = new BehaviorSubject<boolean>(undefined);
  authStatus$ = this.authStatusSubject.pipe(filter(isNotNullOrUndefined), distinctUntilChanged());

  constructor(private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService) {
    this.messageReceiverService.authStatusUpdated$.subscribe(authStatus => {
      this.hydrateAuthStatus(authStatus);
    });
    this.getTokenAndUpdateStatus().catch(noop);
  }

  private hydrateAuthStatus(authenticationStatus: boolean) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing authentication status');
    this.authStatusSubject.next(authenticationStatus);
  }

  getAuthToken(): Promise<string> {
    return this.getTokenAndUpdateStatus();
  }

  performInteractiveLogin(): Promise<string> {
    return this.getTokenAndUpdateStatus({interactive: true});
  }

  private getTokenAndUpdateStatus(details = {interactive: false}): Promise<string> {
    return this.getAuthTokenSilently(details).then(authToken => {
      this.updateAuthStatus(true);
      return Promise.resolve(authToken);
    }).catch(reason => {
      this.updateAuthStatus(false);
      return Promise.reject(reason);
    });
  }

  chromeSignInRequired(): Promise<boolean> {
    return this.getAuthTokenSilently().then(() => {
      return false;
    }).catch(error => {
      return isRuntimeError(error)
        && error.details === ChromeRuntimeErrorMessage.UserNotSignedIn;
    });
  }

  removeCachedAuthToken(): Promise<void> {
    return this.getAuthTokenSilently().then(authToken => {
      return new Promise<void>(resolve => {
        chrome.identity.removeCachedAuthToken({token: authToken}, resolve);
      });
    }).finally(() => {
      return this.getTokenAndUpdateStatus();
    });
  }

  private getAuthTokenSilently(details = {interactive: false}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!chrome.identity) {
        reject(runtimeError(ErrorCode.AuthTokenNotGranted, 'Chrome identity permissions not granted.'));
        return;
      }
      chrome.identity.getAuthToken(details, token => {
        if (chrome.runtime.lastError) {
          reject(runtimeError(ErrorCode.AuthTokenNotGranted, chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      });
    });
  }

  private updateAuthStatus(authStatus: boolean) {
    if (authStatus !== this.authStatusSubject.getValue()) {
      console.log(getCurrentTimeStringWithMillis(), '- updating authentication status');
      this.authStatusSubject.next(authStatus);
      this.messagePassingService.broadcastAuthStatus(authStatus);
    }
  }
}
