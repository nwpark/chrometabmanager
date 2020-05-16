import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {distinctUntilChanged, map, take} from 'rxjs/operators';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {MessagePassingService} from '../messaging/message-passing.service';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {createRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';
import {LocalStorageService} from '../storage/local-storage.service';
import {getAccessTokenFromAuthCode, getAccessTokenFromRefreshToken} from './o-auth-2-endpoints';
import {getAuthCodeFromWebAuthResponseUrl, getOAuth2WebAuthFlowUrl} from './o-auth-2-utils';
import {
  createDefaultOAuth2TokenState,
  createOAuth2TokenState,
  OAuth2TokenState,
  oAuth2TokenStateIsValid
} from '../../types/o-auth2-token-state';
import {Mutator} from '../../types/mutator';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  private oAuth2TokenState = new ReplaySubject<OAuth2TokenState>(1);
  oAuth2TokenState$ = this.oAuth2TokenState.asObservable();

  constructor(private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService,
              private localStorageService: LocalStorageService) {
    this.localStorageService.getOAuth2TokenState().then(oAuth2TokenState => {
      this.hydrateOAuth2TokenState(oAuth2TokenState);
    });
    this.messageReceiverService.oAuth2TokenStateUpdated$.subscribe(oAuth2TokenState => {
      this.hydrateOAuth2TokenState(oAuth2TokenState);
    });
  }

  private hydrateOAuth2TokenState(oAuth2TokenState: OAuth2TokenState) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing oAuth2TokenState');
    this.oAuth2TokenState.next(oAuth2TokenState);
  }

  getAuthStatus$(): Observable<boolean> {
    return this.oAuth2TokenState$.pipe(
      map(oAuth2TokenState => !isNullOrUndefined(oAuth2TokenState.accessToken)),
      distinctUntilChanged()
    );
  }

  getAuthStatus(): Promise<boolean> {
    return this.getAuthStatus$().pipe(take(1)).toPromise();
  }

  getAuthToken(): Promise<string> {
    return this.getOAuth2TokenState().then(oAuth2TokenState => {
      if (oAuth2TokenStateIsValid(oAuth2TokenState)) {
        return oAuth2TokenState.accessToken;
      }
      return this.acquireNewAuthToken(oAuth2TokenState.refreshToken);
    });
  }

  private getOAuth2TokenState(): Promise<OAuth2TokenState> {
    return this.oAuth2TokenState$.pipe(take(1)).toPromise();
  }

  private acquireNewAuthToken(refreshToken: string): Promise<string> {
    console.log(getCurrentTimeStringWithMillis(), '- acquiring new oauth2 access token');
    return getAccessTokenFromRefreshToken(refreshToken).then(res => {
      const oAuth2TokenState = createOAuth2TokenState(res.access_token, refreshToken, res.expires_in);
      return this.updateOAuth2TokenState(oAuth2TokenState).then(() => {
        return oAuth2TokenState.accessToken;
      });
    }).catch(error => {
      return this.updateOAuth2TokenState(createDefaultOAuth2TokenState()).then(() => {
        return Promise.reject(createRuntimeError(ErrorCode.FailedToRefreshOAuth2Token, undefined, error));
      });
    });
  }

  performInteractiveLogin(): Promise<void> {
    return this.launchWebAuthFlow().then(authCode => {
      return getAccessTokenFromAuthCode(authCode);
    }).then(res => {
      const oAuth2TokenState = createOAuth2TokenState(res.access_token, res.refresh_token, res.expires_in);
      return this.updateOAuth2TokenState(oAuth2TokenState);
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

  invalidateAuthToken(): Promise<void> {
    return this.modifyOAuth2TokenState(oAuth2TokenState => {
      oAuth2TokenState.accessToken = undefined;
      return oAuth2TokenState;
    });
  }

  private modifyOAuth2TokenState(mutate: Mutator<OAuth2TokenState>): Promise<void> {
    return this.getOAuth2TokenState().then(oAuth2TokenState => {
      return this.updateOAuth2TokenState(mutate(oAuth2TokenState));
    });
  }

  private updateOAuth2TokenState(oAuth2TokenState: OAuth2TokenState): Promise<void> {
    console.log(getCurrentTimeStringWithMillis(), '- updating oAuth2TokenState');
    this.oAuth2TokenState.next(oAuth2TokenState);
    return this.localStorageService.setOAuth2TokenState(oAuth2TokenState).then(() => {
      this.messagePassingService.broadcastOAuth2TokenState(oAuth2TokenState);
    });
  }
}
