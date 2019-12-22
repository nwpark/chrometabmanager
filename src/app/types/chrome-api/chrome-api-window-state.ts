import {ChromeAPITabState, chromeAPITabStateEquals} from './chrome-api-tab-state';
import {isNullOrUndefined} from 'util';

export type SessionId = number | string;

export interface ChromeAPIWindowState {
  id: SessionId;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any; // Ignore unused API fields
}

export function chromeAPIWindowStateEquals(a: ChromeAPIWindowState, b: ChromeAPIWindowState): boolean {
  if (isNullOrUndefined(a) || isNullOrUndefined(b)) {
    return a === b;
  }
  return a.id === b.id
    && a.type === b.type
    && a.tabs.length === b.tabs.length
    && a.tabs.every((tab, index) => chromeAPITabStateEquals(tab, b.tabs[index]));
}
