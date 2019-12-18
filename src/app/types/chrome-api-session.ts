import {ChromeAPIWindowState, chromeAPIWindowStateEquals} from './chrome-api-window-state';
import {ChromeAPITabState, chromeAPITabStateEquals} from './chrome-api-tab-state';
import {isNullOrUndefined} from 'util';

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
