import {SessionId} from './chrome-api-window-state';
import {isNullOrUndefined} from 'util';
import {InvalidSessionError} from '../errors/InvalidSessionError';

export interface ChromeAPITabState {
  // todo: some of these fields are supposed to be optional
  id: SessionId;
  windowId?: SessionId;
  url: string;
  pendingUrl?: string;
  title: string;
  favIconUrl?: string;
  status: string;
  active?: boolean;
  discarded?: boolean;
  [others: string]: any; // Ignore unused API fields
}

export function hasTitle(tab: ChromeAPITabState): boolean {
  return tab.title && !(tab.title === tab.url);
}

export function getUrl(tab: ChromeAPITabState): string {
  if (!tab.url && tab.pendingUrl) {
    return tab.pendingUrl;
  }
  return tab.url;
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
    && a.title === b.title
    && a.active === b.active
    && a.discarded === b.discarded;
}

export function validateChromeAPITabState(tabState: ChromeAPITabState) {
  if (isNullOrUndefined(tabState)
    || !('id' in tabState)
    || !('url' in tabState)
    || !('title' in tabState)
    || !('status' in tabState)) {
    throw new InvalidSessionError();
  }
}
