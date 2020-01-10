import {ChromeAPIWindowState, chromeAPIWindowStateEquals, validateChromeAPIWindowState} from './chrome-api-window-state';
import {ChromeAPITabState, chromeAPITabStateEquals, validateChromeAPITabState} from './chrome-api-tab-state';
import {isNullOrUndefined} from 'util';
import {InvalidSessionError} from '../errors/InvalidSessionError';

export interface ChromeAPISession {
  lastModified?: number;
  window?: ChromeAPIWindowState;
  tab?: ChromeAPITabState;
}

export function chromeAPISessionEquals(a: ChromeAPISession, b: ChromeAPISession): boolean {
  if (isNullOrUndefined(a) || isNullOrUndefined(b)) {
    return a === b;
  }
  return a.lastModified === b.lastModified
    && chromeAPIWindowStateEquals(a.window, b.window)
    && chromeAPITabStateEquals(a.tab, b.tab);
}

export function validateChromeAPISession(session: ChromeAPISession) {
  if (isNullOrUndefined(session)) {
    throw new InvalidSessionError();
  } else if (session.window) {
    validateChromeAPIWindowState(session.window);
  } else if (session.tab) {
    validateChromeAPITabState(session.tab);
  } else {
    throw new InvalidSessionError();
  }
}
