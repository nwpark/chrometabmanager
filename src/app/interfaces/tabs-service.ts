import {ChromeAPITabState} from '../types/chrome-api-types';

export interface TabsService<T> {

  moveTabInWindow(windowId: T, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindowId: T, targetWindowId: T, sourceIndex: number, targetIndex: number);

  createTab(windowId: T, tabIndex: number, chromeTab: ChromeAPITabState<T>); // todo: make interface generic

  removeTab(windowId: T, tabId: T);

  removeWindow(windowId: T);

  toggleWindowDisplay(windowId: T);

  setWindowTitle(windowId: T, title: string);

  setTabActive(windowId: T, chromeTab: ChromeAPITabState<T>); // todo: make interface generic

}
