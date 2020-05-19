import {promiseResolvedWithoutErrors} from '../../../utils/error-utils';
import {BehaviorSubject, noop, Observable} from 'rxjs';
import {createRuntimeError} from '../../../types/errors/runtime-error';
import {ErrorCode} from '../../../types/errors/error-code';
import {MessagePassingService} from '../../messaging/message-passing.service';
import {MessageReceiverService} from '../../messaging/message-receiver.service';
import {getCurrentTimeStringWithMillis} from '../../../utils/date-utils';
import {distinctUntilChanged} from 'rxjs/operators';
import {OAuth2BrowserStrategy} from './o-auth-2-browser-strategy';

export class OAuth2ChromeStrategy implements OAuth2BrowserStrategy {

  private authStatusSubject$ = new BehaviorSubject<boolean>(true);

  constructor(private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService) {
    this.messageReceiverService.authStatusUpdated$.subscribe(authStatus => {
      console.log(getCurrentTimeStringWithMillis(), '- refreshing authentication status');
      this.authStatusSubject$.next(authStatus);
    });
    if (chrome.identity.getAuthToken) {
      this.getAuthTokenAndUpdateStatus().catch(noop);
    }
  }

  getAuthToken(): Promise<string> {
    return this.getAuthTokenAndUpdateStatus();
  }

  private getAuthTokenAndUpdateStatus(details = {interactive: false}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken(details, token => {
        if (chrome.runtime.lastError) {
          this.updateAuthStatus(false);
          reject(createRuntimeError(ErrorCode.GoogleOAuth2AccessTokenNotGranted, chrome.runtime.lastError.message));
        } else {
          this.updateAuthStatus(true);
          resolve(token);
        }
      });
    });
  }

  hasValidAuthToken(): Promise<boolean> {
    return promiseResolvedWithoutErrors(this.getAuthToken());
  }

  getAuthStatus$(): Observable<boolean> {
    return this.authStatusSubject$.pipe(distinctUntilChanged());
  }

  performInteractiveLogin(): Promise<any> {
    return this.getAuthTokenAndUpdateStatus({interactive: true});
  }

  invalidateAuthToken(): Promise<void> {
    return this.removeCachedAuthToken().then(() => {
      this.updateAuthStatus(false);
    });
  }

  private removeCachedAuthToken(): Promise<void> {
    return new Promise(resolve => {
      return this.getAuthToken().then(authToken => {
        chrome.identity.removeCachedAuthToken({token: authToken}, resolve);
      }).catch(() => {
        resolve();
      });
    });
  }

  private updateAuthStatus(authStatus: boolean) {
    if (authStatus !== this.authStatusSubject$.getValue()) {
      console.log(getCurrentTimeStringWithMillis(), '- updating authStatus');
      this.authStatusSubject$.next(authStatus);
      this.messagePassingService.broadcastAuthStatus(authStatus);
    }
  }
}
