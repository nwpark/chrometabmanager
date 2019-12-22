import {SessionId} from './chrome-api-window-state';
import {isNullOrUndefined} from 'util';

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
