import {v4 as uuid} from 'uuid';

export interface ChromeAPIWindowState {
  id: any;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPITabState {
  id: any;
  url: string;
  title: string;
  favIconUrl: string;
  [others: string]: any; // Ignore unused API fields
}

export class WindowStateUtils {
  static cloneWindowWithNewId(chromeWindow: ChromeAPIWindowState): ChromeAPIWindowState {
    const clonedWindow = JSON.parse(JSON.stringify(chromeWindow)) as ChromeAPIWindowState;
    const savedTabs = clonedWindow.tabs.map(tab => ({...tab, id: uuid()})) as ChromeAPITabState[];
    return {...clonedWindow, id: uuid(), tabs: savedTabs};
  }

  static cloneTabWithNewId(chromeTab: ChromeAPITabState): ChromeAPITabState {
    const clonedTab = JSON.parse(JSON.stringify(chromeTab)) as ChromeAPITabState;
    return {...clonedTab, id: uuid()};
  }
}
