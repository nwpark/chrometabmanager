import {Observable} from 'rxjs';

export declare interface OAuth2BrowserStrategy {

  getAuthToken(): Promise<string>;

  hasValidAuthToken(): Promise<boolean>;

  getAuthStatus$(): Observable<boolean>;

  performInteractiveLogin(): Promise<void>;

  invalidateAuthToken(): Promise<void>;
}
