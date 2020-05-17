import {OAuth2URLParam} from './o-auth-2-endpoints';
import {createRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';
import {environment} from '../../../environments/environment';
import {UrlBuilder} from '../../../background/types/url-builder';
import UserInfo = chrome.identity.UserInfo;

export function getOAuth2WebAuthFlowUrl(): Promise<string> {
  return getOAuth2LoginHint().then(loginHint => {
    return new UrlBuilder(environment.oAuth2WebAuthFlowUrl)
      .queryParam(OAuth2URLParam.RedirectURI, chrome.identity.getRedirectURL())
      .queryParam(OAuth2URLParam.LoginHint, loginHint)
      .build();
  });
}

function getOAuth2LoginHint(): Promise<string> {
  return getUserProfileInfo().then(userInfo => {
    return userInfo.email;
  }).catch(() => '');
}

function getUserProfileInfo(): Promise<UserInfo> {
  return new Promise<UserInfo>((resolve, reject) => {
    if (chrome.identity.getProfileUserInfo) {
      chrome.identity.getProfileUserInfo(resolve);
    } else {
      reject();
    }
  });
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
