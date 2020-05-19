import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {MessagePassingService} from '../messaging/message-passing.service';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {LocalStorageService} from '../storage/local-storage.service';
import {OAuth2BrowserStrategy} from './strategies/o-auth-2-browser-strategy';
import {OAuth2ChromeStrategy} from './strategies/o-auth-2-chrome-strategy';
import {OAuth2DefaultStrategy} from './strategies/o-auth-2-default-strategy';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  private readonly oAuth2ChromeStrategy = new OAuth2ChromeStrategy(this.messagePassingService, this.messageReceiverService);
  private readonly oAuth2DefaultStrategy = new OAuth2DefaultStrategy(this.messagePassingService, this.messageReceiverService, this.localStorageService);

  constructor(private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService,
              private localStorageService: LocalStorageService) { }

  private getOAuth2BrowserStrategy(): Promise<OAuth2BrowserStrategy> {
    return this.shouldUseChromeStrategy().then(shouldUseChromeStrategy => {
      return shouldUseChromeStrategy
        ? this.oAuth2ChromeStrategy
        : this.oAuth2DefaultStrategy;
    });
  }

  /*
   * Chrome is the only browser to support the `getProfileUserInfo` API
   * method, so we use this as an indicator to use the Chrome strategy.
   */
  private shouldUseChromeStrategy(): Promise<boolean> {
    if (!chrome.identity && !chrome.identity.getProfileUserInfo) {
      return Promise.resolve(false);
    }
    return new Promise<boolean>(resolve => {
      chrome.identity.getProfileUserInfo(userInfo => {
        resolve(userInfo.email !== '');
      });
    });
  }

  getAuthToken(): Promise<string> {
    return this.getOAuth2BrowserStrategy().then(browserStrategy => {
      return browserStrategy.getAuthToken();
    });
  }

  hasValidAuthToken(): Promise<boolean> {
    return this.getOAuth2BrowserStrategy().then(browserStrategy => {
      return browserStrategy.hasValidAuthToken();
    });
  }

  getAuthStatus$(): Observable<boolean> {
    // todo: optimistically begin with true
    return from(this.getOAuth2BrowserStrategy()).pipe(
      switchMap(browserStrategy => browserStrategy.getAuthStatus$())
    );
  }

  performInteractiveLogin(): Promise<void> {
    return this.getOAuth2BrowserStrategy().then(browserStrategy => {
      return browserStrategy.performInteractiveLogin();
    });
  }

  invalidateAuthToken(): Promise<void> {
    return this.getOAuth2BrowserStrategy().then(browserStrategy => {
      return browserStrategy.invalidateAuthToken();
    });
  }
}
