import {environment} from '../../../environments/environment';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';
import {UrlBuilder} from '../../../background/types/url-builder';

export function getAccessTokenFromAuthCode(authCode: string): Promise<OAuth2TokenServerResponse> {
  const urlEncodedRequestBody = new URLSearchParams(atob(environment.urlEncodedOAuth2ClientId));
  urlEncodedRequestBody.append(OAuth2URLParam.GrantType, OAuth2URLParamValue.AuthCode);
  urlEncodedRequestBody.append(OAuth2URLParam.RedirectURI, chrome.identity.getRedirectURL());
  urlEncodedRequestBody.append(OAuth2URLParam.AuthCode, authCode);

  const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, environment.oAuth2TokenUrl)
    .contentTypeFormURLEncoded()
    .responseTypeJSON()
    .build();

  return httpRequest.send(urlEncodedRequestBody.toString());
}

export function getAccessTokenFromRefreshToken(refreshToken: string): Promise<OAuth2TokenServerResponse> {
  const urlEncodedRequestBody = new URLSearchParams(atob(environment.urlEncodedOAuth2ClientId));
  urlEncodedRequestBody.append(OAuth2URLParam.GrantType, OAuth2URLParamValue.RefreshToken);
  urlEncodedRequestBody.append(OAuth2URLParam.RedirectURI, chrome.identity.getRedirectURL());
  urlEncodedRequestBody.append(OAuth2URLParam.RefreshToken, refreshToken);

  const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, environment.oAuth2TokenUrl)
    .contentTypeFormURLEncoded()
    .responseTypeJSON()
    .build();

  return httpRequest.send(urlEncodedRequestBody.toString());
}

export function getOAuth2WebAuthFlowUrl(): string {
  return new UrlBuilder(environment.oAuth2WebAuthFlowUrl)
    .queryParam('redirect_uri', chrome.identity.getRedirectURL())
    .build();
}

export enum OAuth2URLParam {
  GrantType = 'grant_type',
  RedirectURI = 'redirect_uri',
  RefreshToken = 'refresh_token',
  Scope = 'scope',
  Error = 'error',
  AuthCode = 'code'
}

enum OAuth2URLParamValue {
  AuthCode = 'authorization_code',
  RefreshToken = 'refresh_token'
}

interface OAuth2TokenServerResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}
