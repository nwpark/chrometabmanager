import {SessionId} from './chrome-api-window-state';
import {isNullOrUndefined} from 'util';
import {InvalidSessionError} from '../errors/InvalidSessionError';

export interface ChromeAPITabState {
  id: SessionId;
  windowId?: SessionId;
  url: string;
  title: string;
  favIconUrl: string;
  status: string;
  [others: string]: any; // Ignore unused API fields
}

export function chromeAPITabStateEquals(a: ChromeAPITabState, b: ChromeAPITabState): boolean {
  if (isNullOrUndefined(a) || isNullOrUndefined(b)) {
    return a === b;
  }
  return a.favIconUrl === b.favIconUrl
    && a.url === b.url
    && a.id === b.id
    && a.status === b.status
    && a.windowId === b.windowId
    && a.title === b.title;
}

export function validateChromeAPITabState(tabState: ChromeAPITabState) {
  if (isNullOrUndefined(tabState)
    || !('id' in tabState)
    || !('url' in tabState)
    || !('title' in tabState)
    || !('favIconUrl' in tabState)
    || !('status' in tabState)) {
    throw new InvalidSessionError();
  }
}
