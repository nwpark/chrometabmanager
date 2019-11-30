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
  status: string;
  [others: string]: any; // Ignore unused API fields
}

export class WindowStateUtils {
  static convertToSavedWindow(chromeWindow: ChromeAPIWindowState): ChromeAPIWindowState {
    const clonedWindow = JSON.parse(JSON.stringify(chromeWindow)) as ChromeAPIWindowState;
    const savedTabs = clonedWindow.tabs.map(tab => this.convertToSavedTab(tab)) as ChromeAPITabState[];
    return {...clonedWindow, id: uuid(), tabs: savedTabs};
  }

  static convertToSavedTab(chromeTab: ChromeAPITabState): ChromeAPITabState {
    const clonedTab = JSON.parse(JSON.stringify(chromeTab)) as ChromeAPITabState;
    return {...clonedTab, id: uuid(), status: 'complete'};
  }

  static convertToActiveWindow(chromeWindow: ChromeAPIWindowState): ChromeAPIWindowState {
    const clonedWindow = JSON.parse(JSON.stringify(chromeWindow)) as ChromeAPIWindowState;
    const activeTabs = clonedWindow.tabs.map(tab => this.convertToActiveTab(tab)) as ChromeAPITabState[];
    return {...clonedWindow, id: uuid(), tabs: activeTabs};
  }

  static convertToActiveTab(chromeTab: ChromeAPITabState): ChromeAPITabState {
    const clonedTab = JSON.parse(JSON.stringify(chromeTab)) as ChromeAPITabState;
    return {...clonedTab, id: undefined, status: 'loading'};
  }
}
