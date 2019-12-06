import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {WindowLayoutState, WindowListLayoutState} from './window-list-state';

export class SessionListState {

  recentlyClosedSessions: ChromeAPISession[];
  layoutState: WindowListLayoutState;

  static empty(): SessionListState {
    return new this([], {hidden: true, windowStates: []});
  }

  constructor(recentlyClosedSessions: ChromeAPISession[],
              layoutState: WindowListLayoutState) {
    this.recentlyClosedSessions = recentlyClosedSessions;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.recentlyClosedSessions
      .find(session => session.window && session.window.id === windowId).window;
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
      .findIndex(session => session.tab && session.tab.id === tabId);
    this.recentlyClosedSessions.splice(index, 1);
    this.layoutState.windowStates.splice(index, 1);
  }

  removeWindow(windowId: any) {
    // todo: convert all to index
    const index = this.recentlyClosedSessions
      .findIndex(session => session.window && session.window.id === windowId);
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

  unshiftSession(closedSession: ChromeAPISession, windowLayoutState: WindowLayoutState) {
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
        const tabCount = session.window ? session.window.tabs.length : 1;
        return acc + tabCount;
      }, 0);
  }

  static createClosedSessionFromWindow(chromeWindow: ChromeAPIWindowState): ChromeAPISession {
    return {lastModified: Date.now(), window: chromeWindow};
  }

  static createClosedSessionFromTab(chromeTab: ChromeAPITabState): ChromeAPISession {
    return {lastModified: Date.now(), tab: chromeTab};
  }

  static createBasicWindowLayoutState(windowId: number): WindowLayoutState {
    return {windowId, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
  }
}

export interface ChromeAPISession {
  lastModified: number;
  window?: ChromeAPIWindowState;
  tab?: ChromeAPITabState;
}
