export interface OAuth2TokenState {
  accessToken?: string;
  expirationTime?: Date;
  refreshToken?: string;
}

export function createDefaultOAuth2TokenState(): OAuth2TokenState {
  return {};
}
