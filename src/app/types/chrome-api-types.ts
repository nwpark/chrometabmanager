import {v4 as uuid} from 'uuid';

export interface ChromeWindowState {
  id: number | string;
  type: string;
  tabs: ChromeTabState[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeTabState {
  id: number | string;
  index: number;
  windowId: number | string;
  url: string;
  title: string;
  favIconUrl: string;
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPIWindowState extends ChromeWindowState {
  id: number;
  tabs: ChromeAPITabState[];
}
export interface ChromeAPITabState extends ChromeTabState {
  id: number;
  windowId: number;
}

export interface SavedWindowState extends ChromeWindowState {
  id: string;
  tabs: SavedTabState[];
}
export interface SavedTabState extends ChromeTabState {
  id: string;
  windowId: string;
}

export class WindowStateUtils {
  static convertToSavedWindow(chromeWindow: ChromeWindowState): SavedWindowState {
    const clonedWindow = JSON.parse(JSON.stringify(chromeWindow)) as ChromeWindowState;
    const windowId = uuid();
    const savedTabs = clonedWindow.tabs.map(tab => ({...tab, id: uuid(), windowId}));
    return {...clonedWindow, id: windowId, tabs: savedTabs};
  }

  static convertToSavedTab(chromeTab: ChromeTabState, windowId: string): SavedTabState {
    const clonedTab = JSON.parse(JSON.stringify(chromeTab));
    return {...clonedTab, id: uuid(), windowId};
  }
}
