import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from './chrome-api-types';
import {WindowLayoutState, WindowListLayoutState, WindowListUtils} from './window-list-state';
import {AnimationState} from '../animations';

export class SessionListState {

  recentlyClosedSessions: RecentlyClosedSession[];
  layoutState: WindowListLayoutState;
  animationState = AnimationState.Complete;
  animationStates: AnimationState[];

  static empty(): SessionListState {
    return new this([], {hidden: true, windowStates: []});
  }

  constructor(recentlyClosedSessions: RecentlyClosedSession[],
              layoutState: WindowListLayoutState) {
    this.recentlyClosedSessions = recentlyClosedSessions;
    this.layoutState = layoutState;
    this.animationStates = recentlyClosedSessions.map(() => AnimationState.Complete);
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

  removeDetachedTab(sessionIndex: number, tabIndex: number) {
    const session = this.recentlyClosedSessions[sessionIndex];
    session.closedTabs.splice(tabIndex, 1);
    if (session.closedTabs.length === 0) {
      this.recentlyClosedSessions.splice(sessionIndex, 1);
      this.layoutState.windowStates.splice(sessionIndex, 1);
      this.animationStates.splice(sessionIndex, 1);
    }
  }

  removeWindow(windowId: any) {
    // todo: convert all to index
    const index = this.recentlyClosedSessions
      .findIndex(session => session.isWindow && session.closedWindow.chromeAPIWindow.id === windowId);
    this.recentlyClosedSessions.splice(index, 1);
    this.layoutState.windowStates.splice(index, 1);
    this.animationStates.splice(index, 1);
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
    this.animationStates.unshift(AnimationState.Complete);
  }

  unshiftClosedTab(closedTab: RecentlyClosedTab) {
    if (this.recentlyClosedSessions.length === 0 || this.recentlyClosedSessions[0].isWindow) {
      const closedSession = SessionListUtils.createSessionFromClosedTab(closedTab);
      const dummyLayoutState = {} as WindowLayoutState;
      this.unshiftSession(closedSession, dummyLayoutState);
    } else {
      this.recentlyClosedSessions[0].closedTabs.unshift(closedTab);
    }
  }

  removeExpiredSessions(maxTabCount: number) {
    let size = this.size();
    while (size > maxTabCount) {
      this.pop();
      size--;
    }
  }

  private pop() {
    const tail = this.recentlyClosedSessions[this.recentlyClosedSessions.length - 1];
    if (tail.isWindow || tail.closedTabs.length <= 1) {
      // todo: check layout states are deleted
      this.recentlyClosedSessions.pop();
    } else {
      tail.closedTabs.pop();
    }
  }

  private size(): number {
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
