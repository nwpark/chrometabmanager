import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {WindowListState} from '../types/window-list-state';
import {SessionListState} from '../types/session-list-state';

type ListState = WindowListState | SessionListState;

export interface TabsService {

  windowStateUpdated$?;

  getWindowListState?(): ListState;

  moveWindowInList(sourceIndex: number, targetIndex: number);

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number);

  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(windowId: any, tabId: any);

  removeWindow(windowId: any);

  toggleWindowListDisplay();

  toggleWindowDisplay(windowId: any);

  setWindowTitle(windowId: any, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(chromeWindow: ChromeAPIWindowState, index: number);

}
