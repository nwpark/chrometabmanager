import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionLayoutState} from '../types/session';

export interface TabsService {

  sessionStateUpdated$;

  getSessionListState(): SessionListState;

  moveWindowInList(sourceIndex: number, targetIndex: number);

  moveTabInWindow(chromeWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number);

  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(windowId: any, tabId: any);

  removeSession(sessionId: any);

  toggleSessionListDisplay();

  toggleSessionDisplay(sessionId: any);

  setSessionTitle(windowId: any, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(chromeWindow: ChromeAPIWindowState, layoutState: SessionLayoutState, index: number);
}
