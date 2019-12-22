import {ChromeAPISession, chromeAPISessionEquals} from '../chrome-api/chrome-api-session';
import {isNullOrUndefined} from 'util';
import {sessionLayoutStateEquals, SessionLayoutState} from './session-layout-state';

export interface SessionState {
  session: ChromeAPISession;
  layoutState: SessionLayoutState;
}

export function sessionStateEquals(a: SessionState, b: SessionState): boolean {
  if (isNullOrUndefined(a) || isNullOrUndefined(b)) {
    return a === b;
  }
  return chromeAPISessionEquals(a.session, b.session)
    && sessionLayoutStateEquals(a.layoutState, b.layoutState);
}
