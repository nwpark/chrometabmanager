import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {WindowLayoutState, WindowListLayoutState, WindowListUtils} from './window-list-state';

export class SessionListState {

  recentlyClosedSessions: RecentlyClosedSession[];
  layoutState: WindowListLayoutState;

  static empty(): SessionListState {
    return new this([], {hidden: true, windowStates: []});
  }

  constructor(recentlyClosedSessions: RecentlyClosedSession[],
              layoutState: WindowListLayoutState) {
    this.recentlyClosedSessions = recentlyClosedSessions;
    this.layoutState = layoutState;
  }

  getWindow(windowId: number): ChromeAPIWindowState<number> {
    return this.recentlyClosedSessions
      .filter(session => session.isWindow)
      .map(session => session.closedWindow.chromeAPIWindow)
      .find(window => window.id === windowId);
  }

  getWindowLayout(windowId: number): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  removeTab(windowId: number, tabId: number) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
  }

  removeDetachedTab(tabId: number) {
    this.recentlyClosedSessions
      .filter(session => !session.isWindow)
      .forEach(session => {
        session.closedTabs = session.closedTabs
          .filter(closedTab => closedTab.chromeAPITab.id !== tabId);
      });
  }

  removeWindow(windowId: number) {
    this.recentlyClosedSessions = this.recentlyClosedSessions
      .filter(session => !session.isWindow || session.closedWindow.chromeAPIWindow.id !== windowId);
    this.layoutState.windowStates = this.layoutState.windowStates
      .filter(windowState => windowState.windowId !== windowId);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: number) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }
}

export class SessionListUtils {
  static getTabCount(sessionListState: SessionListState): number {
    return sessionListState.recentlyClosedSessions
      .map(session => session.isWindow
        ? session.closedWindow.chromeAPIWindow.tabs.length
        : session.closedTabs.length)
      .reduce((a, b) => a + b, 0);
  }
}

export interface RecentlyClosedSession {
  isWindow: boolean;
  closedWindow?: RecentlyClosedWindow;
  closedTabs?: RecentlyClosedTab[];
}

export interface RecentlyClosedWindow {
  timestamp: number;
  chromeAPIWindow: ChromeAPIWindowState<number>; // todo: convert to string
}

export interface RecentlyClosedTab {
  timestamp: number;
  chromeAPITab: ChromeAPITabState<number>; // todo: convert to string
}
