import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {SessionLayoutState, SessionListLayoutState} from './window-list-state';

export class SessionListState {

  recentlyClosedSessions: ChromeAPISession[];
  layoutState: SessionListLayoutState;

  static empty(): SessionListState {
    return new this([], SessionListUtils.createEmptyListLayoutState());
  }

  constructor(recentlyClosedSessions: ChromeAPISession[],
              layoutState: SessionListLayoutState) {
    this.recentlyClosedSessions = recentlyClosedSessions;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.recentlyClosedSessions
      .find(session => session.window && session.window.id === windowId).window;
  }

  getWindowLayout(windowId: any): SessionLayoutState {
    return this.layoutState.sessionStates.find(windowState => windowState.windowId === windowId);
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
    this.layoutState.sessionStates.splice(index, 1);
  }

  removeWindow(windowId: any) {
    // todo: convert all to index
    const index = this.recentlyClosedSessions
      .findIndex(session => session.window && session.window.id === windowId);
    this.recentlyClosedSessions.splice(index, 1);
    this.layoutState.sessionStates.splice(index, 1);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: any) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }

  unshiftSession(closedSession: ChromeAPISession, windowLayoutState: SessionLayoutState) {
    this.recentlyClosedSessions.unshift(closedSession);
    this.layoutState.sessionStates.unshift(windowLayoutState);
  }

  removeExpiredSessions(maxTabCount: number) {
    // todo: needs testing
    while (this.recentlyClosedSessions.length > maxTabCount) {
      this.recentlyClosedSessions.pop();
      this.layoutState.sessionStates.pop();
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

  static createEmptyListLayoutState(): SessionListLayoutState {
    return {hidden: true, sessionStates: []};
  }

  static createClosedSessionFromWindow(chromeWindow: ChromeAPIWindowState): ChromeAPISession {
    return {lastModified: Date.now(), window: chromeWindow};
  }

  static createClosedSessionFromTab(chromeTab: ChromeAPITabState): ChromeAPISession {
    return {lastModified: Date.now(), tab: chromeTab};
  }

  static createBasicWindowLayoutState(windowId: number): SessionLayoutState {
    return {windowId, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
  }
}

