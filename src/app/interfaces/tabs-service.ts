import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';

export interface TabsService {

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number);

  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(windowId: any, tabId: any);

  removeWindow(windowId: any);

  toggleWindowDisplay(windowId: any);

  setWindowTitle(windowId: any, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(chromeWindow: ChromeAPIWindowState, index: number);

}
