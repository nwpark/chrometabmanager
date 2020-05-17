import {getCurrentTimeInSeconds} from '../utils/date-utils';

export interface OAuth2TokenState {
  accessToken?: string;
  expirationTime?: number;
  refreshToken?: string;
}

export function createDefaultOAuth2TokenState(): OAuth2TokenState {
  return {};
}

export function createOAuth2TokenState(accessToken: string, refreshToken: string, expiresIn: number): OAuth2TokenState {
  return {
    accessToken,
    refreshToken,
    expirationTime: getCurrentTimeInSeconds() + expiresIn
  };
}

export function oAuth2TokenStateIsValid(oAuth2TokenState: OAuth2TokenState): boolean {
  return oAuth2TokenState.accessToken
    && oAuth2TokenState.expirationTime > getCurrentTimeInSeconds();
}
