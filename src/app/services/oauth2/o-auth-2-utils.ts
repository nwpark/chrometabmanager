import {OAuth2URLParam} from './o-auth-2-endpoints';
import {createRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';
import {environment} from '../../../environments/environment';
import {UrlBuilder} from '../../../background/types/url-builder';

export function getOAuth2WebAuthFlowUrl(): string {
  return new UrlBuilder(environment.oAuth2WebAuthFlowUrl)
    .queryParam(OAuth2URLParam.RedirectURI, chrome.identity.getRedirectURL())
    .build();
}

export function getAuthCodeFromWebAuthResponseUrl(responseUrl: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const responseUrlParams = new URL(responseUrl).searchParams;
    if (responseUrlParams.get(OAuth2URLParam.Error)) {
      reject(createRuntimeError(ErrorCode.GoogleOAuth2AccessTokenNotGranted, responseUrlParams.get(OAuth2URLParam.Error)));
    } else if (responseUrlParams.get(OAuth2URLParam.Scope) !== environment.driveAPIScopes) {
      reject(createRuntimeError(ErrorCode.GoogleOAuth2RequiredScopeNotGranted));
    } else {
      resolve(responseUrlParams.get(OAuth2URLParam.AuthCode));
    }
  });
}
