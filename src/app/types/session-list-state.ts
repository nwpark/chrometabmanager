import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from './chrome-api-types';
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

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.recentlyClosedSessions
      .filter(session => session.isWindow)
      .map(session => session.closedWindow.chromeAPIWindow)
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
    this.recentlyClosedSessions
      .filter(session => !session.isWindow)
      .forEach(session => {
        session.closedTabs = session.closedTabs
          .filter(closedTab => closedTab.chromeAPITab.id !== tabId);
      });
    this.removeEmptySessions();
  }

  private removeEmptySessions() {
    this.recentlyClosedSessions = this.recentlyClosedSessions.filter(session => {
      return (session.isWindow && session.closedWindow.chromeAPIWindow.tabs.length > 0)
        || (!session.isWindow && session.closedTabs.length > 0);
    });
  }

  removeWindow(windowId: any) {
    this.recentlyClosedSessions = this.recentlyClosedSessions
      .filter(session => !session.isWindow || session.closedWindow.chromeAPIWindow.id !== windowId);
    this.layoutState.windowStates = this.layoutState.windowStates
      .filter(windowState => windowState.windowId !== windowId);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: any) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }

  unshiftSession(closedSession: RecentlyClosedSession) {
    this.recentlyClosedSessions.unshift(closedSession);
  }

  unshiftLayoutState(windowLayoutState: WindowLayoutState) {
    this.layoutState.windowStates.unshift(windowLayoutState);
  }

  unshiftClosedTab(closedTab: RecentlyClosedTab) {
    if (this.recentlyClosedSessions.length === 0 || this.recentlyClosedSessions[0].isWindow) {
      const closedSession = SessionListUtils.createSessionFromClosedTab(closedTab);
      this.unshiftSession(closedSession);
    } else {
      this.recentlyClosedSessions[0].closedTabs.unshift(closedTab);
    }
  }

  removeExpiredSessions(maxTabCount: number) {
    let size = this.getSize();
    while (size > maxTabCount) {
      this.pop();
      size--;
    }
  }

  private pop() {
    const tail = this.recentlyClosedSessions[this.recentlyClosedSessions.length - 1];
    if (tail.isWindow || tail.closedTabs.length <= 1) {
      this.recentlyClosedSessions.pop();
    } else {
      tail.closedTabs.pop();
    }
  }

  private getSize(): number {
    return this.recentlyClosedSessions.reduce((acc, session) => {
      return acc + (session.isWindow ? 1 : session.closedTabs.length);
    }, 0);
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

  static createClosedSessionFromWindow(chromeWindow: ChromeAPIWindowState): RecentlyClosedSession {
    const closedWindow = {timestamp: Date.now(), chromeAPIWindow: chromeWindow} as RecentlyClosedWindow;
    return {isWindow: true, closedWindow};
  }

  static createSessionFromClosedTab(closedTab: RecentlyClosedTab): RecentlyClosedSession {
    return {isWindow: false, closedTabs: [closedTab]};
  }

  static createClosedTab(chromeTab: ChromeAPITabState): RecentlyClosedTab {
    return {timestamp: Date.now(), chromeAPITab: chromeTab};
  }

  static createBasicWindowLayoutState(windowId: number): WindowLayoutState {
    return {windowId, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
  }
}

export interface RecentlyClosedSession {
  isWindow: boolean;
  closedWindow?: RecentlyClosedWindow;
  closedTabs?: RecentlyClosedTab[];
}

export interface RecentlyClosedWindow {
  timestamp: number;
  chromeAPIWindow: ChromeAPIWindowState;
}

export interface RecentlyClosedTab {
  timestamp: number;
  chromeAPITab: ChromeAPITabState;
}
