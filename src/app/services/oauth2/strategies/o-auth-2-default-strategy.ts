import {getCurrentTimeStringWithMillis} from '../../../utils/date-utils';
import {getAccessTokenFromAuthCode, getAccessTokenFromRefreshToken} from '../o-auth-2-endpoints';
import {
  createDefaultOAuth2TokenState,
  createOAuth2TokenState,
  OAuth2TokenState,
  oAuth2TokenStateIsValid
} from '../../../types/o-auth2-token-state';
import {createRuntimeError} from '../../../types/errors/runtime-error';
import {ErrorCode} from '../../../types/errors/error-code';
import {getAuthCodeFromWebAuthResponseUrl, getOAuth2WebAuthFlowUrl} from '../o-auth-2-utils';
import {Observable, ReplaySubject} from 'rxjs';
import {MessagePassingService} from '../../messaging/message-passing.service';
import {MessageReceiverService} from '../../messaging/message-receiver.service';
import {LocalStorageService} from '../../storage/local-storage.service';
import {distinctUntilChanged, map, take} from 'rxjs/operators';
import {promiseResolvedWithoutErrors} from '../../../utils/error-utils';
import {isNullOrUndefined} from 'util';
import {Mutator} from '../../../types/mutator';
import {OAuth2BrowserStrategy} from './o-auth-2-browser-strategy';

export class OAuth2DefaultStrategy implements OAuth2BrowserStrategy {

  private oAuth2TokenState$ = new ReplaySubject<OAuth2TokenState>(1);

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
    this.oAuth2TokenState$.next(oAuth2TokenState);
  }

  private getOAuth2TokenState(): Promise<OAuth2TokenState> {
    return this.oAuth2TokenState$.pipe(take(1)).toPromise();
  }

  getAuthToken(): Promise<string> {
    return this.getOAuth2TokenState().then(oAuth2TokenState => {
      if (oAuth2TokenStateIsValid(oAuth2TokenState)) {
        return oAuth2TokenState.accessToken;
      } else if (oAuth2TokenState.refreshToken) {
        return this.acquireNewAuthToken(oAuth2TokenState.refreshToken);
      }
      // todo: invalidate auth token
      return Promise.reject(createRuntimeError(ErrorCode.GoogleOAuth2AccessTokenNotPresent));
    });
  }

  hasValidAuthToken(): Promise<boolean> {
    return promiseResolvedWithoutErrors(this.getAuthToken());
  }

  getAuthStatus$(): Observable<boolean> {
    return this.oAuth2TokenState$.pipe(
      map(oAuth2TokenState => !isNullOrUndefined(oAuth2TokenState.accessToken)),
      distinctUntilChanged()
    );
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
        return Promise.reject(createRuntimeError(ErrorCode.GoogleOAuth2RefreshTokenFailure, undefined, error));
      });
    });
  }

  performInteractiveLogin(): Promise<void> {
    return getOAuth2WebAuthFlowUrl().then(url => {
      return this.launchWebAuthFlow(url);
    }).then(authCode => {
      return getAccessTokenFromAuthCode(authCode);
    }).then(res => {
      const oAuth2TokenState = createOAuth2TokenState(res.access_token, res.refresh_token, res.expires_in);
      return this.updateOAuth2TokenState(oAuth2TokenState);
    });
  }

  private launchWebAuthFlow(url: string): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({url, interactive: true}, responseUrl => {
        if (chrome.runtime.lastError) {
          reject(createRuntimeError(ErrorCode.GoogleOAuth2AccessTokenNotGranted, chrome.runtime.lastError.message));
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
    this.oAuth2TokenState$.next(oAuth2TokenState);
    return this.localStorageService.setOAuth2TokenState(oAuth2TokenState).then(() => {
      this.messagePassingService.broadcastOAuth2TokenState(oAuth2TokenState);
    });
  }
}
