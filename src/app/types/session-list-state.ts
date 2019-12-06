import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {WindowLayoutState, WindowListLayoutState} from './window-list-state';
import {v4 as uuid} from 'uuid';

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

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.recentlyClosedSessions
      .filter(session => session.isWindow)
      .map(session => session.window.chromeAPIWindow)
      .find(window => window.id === windowId);
  }

  getWindowLayout(windowId: any): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  removeTab(windowId: any, tabId: any) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
    if (chromeWindow.tabs.length === 0) {
      this.removeWindow(windowId);
    }
  }

  removeDetachedTab(tabId: any) {
    const index = this.recentlyClosedSessions
      .findIndex(session => !session.isWindow && session.tab.chromeAPITab.id === tabId);
    this.recentlyClosedSessions.splice(index, 1);
    this.layoutState.windowStates.splice(index, 1);
  }

  removeWindow(windowId: any) {
    // todo: convert all to index
    const index = this.recentlyClosedSessions
      .findIndex(session => session.isWindow && session.window.chromeAPIWindow.id === windowId);
    this.recentlyClosedSessions.splice(index, 1);
    this.layoutState.windowStates.splice(index, 1);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: any) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }

  unshiftSession(closedSession: RecentlyClosedSession, windowLayoutState: WindowLayoutState) {
    this.recentlyClosedSessions.unshift(closedSession);
    this.layoutState.windowStates.unshift(windowLayoutState);
  }

  removeExpiredSessions(maxTabCount: number) {
    // todo: needs testing
    while (this.recentlyClosedSessions.length > maxTabCount) {
      this.recentlyClosedSessions.pop();
      this.layoutState.windowStates.pop();
    }
  }
}

export class SessionListUtils {
  static getTabCount(sessionListState: SessionListState): number {
    return sessionListState.recentlyClosedSessions
      .reduce((acc, session) => {
        const tabCount = session.isWindow ? session.window.chromeAPIWindow.tabs.length : 1;
        return acc + tabCount;
      }, 0);
  }

  static createClosedSessionFromWindow(chromeWindow: ChromeAPIWindowState): RecentlyClosedSession {
    const closedWindow: RecentlyClosedWindow = {timestamp: Date.now(), chromeAPIWindow: chromeWindow};
    return {isWindow: true, window: closedWindow};
  }

  static createClosedSessionFromTab(chromeTab: ChromeAPITabState): RecentlyClosedSession {
    const closedTab: RecentlyClosedTab = {timestamp: Date.now(), chromeAPITab: chromeTab};
    return {isWindow: false, tab: closedTab};
  }

  static createBasicWindowLayoutState(windowId: number): WindowLayoutState {
    return {windowId, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
  }
}

export interface RecentlyClosedSession {
  isWindow: boolean;
  window?: RecentlyClosedWindow;
  tab?: RecentlyClosedTab;
}

export interface RecentlyClosedWindow {
  timestamp: number;
  chromeAPIWindow: ChromeAPIWindowState;
}

export interface RecentlyClosedTab {
  timestamp: number;
  chromeAPITab: ChromeAPITabState;
}
