import {WindowListUtils} from './window-list-state';
import {v4 as uuid} from 'uuid';

export interface ChromeAPIWindowState<T> {
  id: T;
  type: string;
  tabs: ChromeAPITabState<T>[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPITabState<T> {
  id: T;
  index: number;
  windowId: T;
  url: string;
  title: string;
  favIconUrl: string;
  [others: string]: any; // Ignore unused API fields
}

export type ActiveWindowState = ChromeAPIWindowState<number>;
export type ActiveTabState = ChromeAPITabState<number>;
export type SavedWindowState = ChromeAPIWindowState<string>;
export type SavedTabState = ChromeAPITabState<string>;

export class WindowStateUtils {
  static convertToSavedWindow(chromeWindow: ChromeAPIWindowState<any>): SavedWindowState {
    const clonedWindow = JSON.parse(JSON.stringify(chromeWindow)) as ActiveWindowState;
    const windowId = uuid();
    const savedTabs = clonedWindow.tabs.map(tab => ({...tab, id: uuid(), windowId}));
    return {...clonedWindow, id: windowId, tabs: savedTabs};
  }

  static convertToSavedTab(chromeTab: ChromeAPITabState<any>, windowId: string): SavedTabState {
    const clonedTab = JSON.parse(JSON.stringify(chromeTab));
    return {...clonedTab, id: uuid(), windowId};
  }
}
