import {environment} from '../../../environments/environment';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';

export function getAccessTokenFromAuthCode(authCode: string): Promise<any> {
  const urlEncodedRequestBody = new URLSearchParams(atob(environment.urlEncodedOAuth2ClientId));
  urlEncodedRequestBody.append('grant_type', 'authorization_code');
  urlEncodedRequestBody.append('redirect_uri', chrome.identity.getRedirectURL());
  urlEncodedRequestBody.append('code', authCode);

  const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, environment.oAuth2TokenUrl)
    .contentTypeFormURLEncoded()
    .responseTypeJSON()
    .build();

  return httpRequest.send(urlEncodedRequestBody.toString());
}

export function getAccessTokenFromRefreshToken(refreshToken: string): Promise<any> {
  const urlEncodedRequestBody = new URLSearchParams(atob(environment.urlEncodedOAuth2ClientId));
  urlEncodedRequestBody.append('grant_type', 'refresh_token');
  urlEncodedRequestBody.append('redirect_uri', chrome.identity.getRedirectURL());
  urlEncodedRequestBody.append('refresh_token', refreshToken);

  const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, environment.oAuth2TokenUrl)
    .contentTypeFormURLEncoded()
    .responseTypeJSON()
    .build();

  return httpRequest.send(urlEncodedRequestBody.toString());
}
