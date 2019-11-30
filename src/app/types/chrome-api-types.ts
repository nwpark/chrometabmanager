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
    const {type} = chromeWindow;
    const savedTabs = chromeWindow.tabs.map(tab => this.convertToSavedTab(tab));
    return {id: uuid(), tabs: savedTabs, type};
  }

  static convertToSavedTab(chromeTab: ChromeAPITabState): ChromeAPITabState {
    const {url, title, favIconUrl} = chromeTab;
    return {id: uuid(), status: 'complete', url, title, favIconUrl};
  }

  static convertToActiveWindow(chromeWindow: ChromeAPIWindowState): ChromeAPIWindowState {
    const activeTabs = chromeWindow.tabs.map(tab => this.convertToActiveTab(tab));
    return {...chromeWindow, id: uuid(), tabs: activeTabs};
  }

  static convertToActiveTab(chromeTab: ChromeAPITabState): ChromeAPITabState {
    return {...chromeTab, id: undefined, status: 'loading'};
  }
}
