import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState, SessionUtils} from './chrome-api-types';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

export class SessionListState {

  chromeSessions: ChromeAPISession[];
  layoutState: SessionListLayoutState;

  static empty(): SessionListState {
    return new this([], SessionListUtils.createEmptyListLayoutState());
  }

  constructor(chromeSessions: ChromeAPISession[],
              layoutState: SessionListLayoutState) {
    // todo: create lookup table from id to sessions
    this.chromeSessions = chromeSessions;
    this.layoutState = layoutState;
  }

  private getWindows(): ChromeAPIWindowState[] {
    return this.chromeSessions
      .filter(session => session.window)
      .map(session => session.window);
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.getWindows().find(window => window.id === windowId);
  }

  getSession(sessionId: any): ChromeAPISession {
    return this.chromeSessions.find(session => SessionUtils.getSessionId(session) === sessionId);
  }

  getSessionAtIndex(index: number): ChromeAPISession {
    return this.getSession(this.layoutState.sessionStates[index].sessionId);
  }

  getSessionLayout(sessionId: any): SessionLayoutState {
    return this.layoutState.sessionStates.find(layoutState => layoutState.sessionId === sessionId);
  }

  getTabFromWindow(windowId: any, tabId: any): ChromeAPITabState {
    return this.getWindow(windowId).tabs.find(tab => tab.id === tabId);
  }

  getTabIdFromWindow(windowId: any, tabIndex: number): number {
    return this.getWindow(windowId).tabs[tabIndex].id;
  }

  insertTabInWindow(windowId: any, index: number, chromeTab: ChromeAPITabState) {
    this.getWindow(windowId).tabs.splice(index, 0, chromeTab);
  }

  removeTabFromWindow(windowId: any, tabId: any) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
    // todo: look into what this is doing with animation, perhaps do this check in the component (close window instead of tab)
    if (chromeWindow.tabs.length === 0) {
      this.removeSession(windowId);
    }
  }

  removeSession(sessionId: any) {
    this.chromeSessions = this.chromeSessions.filter(session => SessionUtils.getSessionId(session) !== sessionId);
    this.layoutState.sessionStates = this.layoutState.sessionStates.filter(layoutState => layoutState.sessionId !== sessionId);
  }

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    const targetWindow = this.getWindow(windowId);
    moveItemInArray(targetWindow.tabs, sourceIndex, targetIndex);
  }

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    const previousWindow = this.getWindow(sourceWindowId);
    const targetWindow = this.getWindow(targetWindowId);
    transferArrayItem(previousWindow.tabs, targetWindow.tabs, sourceIndex, targetIndex);
  }

  moveSessionInList(sourceIndex: number, targetIndex: number) {
    moveItemInArray(this.layoutState.sessionStates, sourceIndex, targetIndex);
  }

  unshiftSession(session: ChromeAPISession, windowLayoutState: SessionLayoutState) {
    this.chromeSessions.unshift(session);
    this.layoutState.sessionStates.unshift(windowLayoutState);
  }

  markWindowAsDeleted(windowId: any) {
    this.getSessionLayout(windowId).deleted = true;
  }

  insertSession(session: ChromeAPISession, layoutState: SessionLayoutState, index: number) {
    this.chromeSessions.splice(index, 0, session);
    this.layoutState.sessionStates.splice(index, 0, layoutState);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  setHidden(hidden: boolean) {
    this.layoutState.hidden = hidden;
  }

  toggleSessionDisplay(sessionId: any) {
    const layoutState = this.getSessionLayout(sessionId);
    layoutState.hidden = !layoutState.hidden;
  }

  setSessionTitle(sessionId: any, title: string) {
    const layoutState = this.getSessionLayout(sessionId);
    layoutState.title = title;
  }

  removeExpiredSessions(maxTabCount: number) {
    // todo: needs testing
    while (this.chromeSessions.length > maxTabCount) {
      this.chromeSessions.pop();
      this.layoutState.sessionStates.pop();
    }
  }
}

export class SessionListUtils {
  static getTabCount(sessionListState: SessionListState): number {
    return sessionListState.chromeSessions
      .reduce((acc, session) => {
        const tabCount = session.window ? session.window.tabs.length : 1;
        return acc + tabCount;
      }, 0);
  }

  static createEmptyListLayoutState(): SessionListLayoutState {
    return {hidden: false, sessionStates: []};
  }

  static createClosedSessionFromWindow(chromeWindow: ChromeAPIWindowState): ChromeAPISession {
    return {lastModified: Date.now(), window: chromeWindow};
  }

  static createClosedSessionFromTab(chromeTab: ChromeAPITabState): ChromeAPISession {
    return {lastModified: Date.now(), tab: chromeTab};
  }

  static createClosedWindowLayoutState(windowId: any): SessionLayoutState {
    return {sessionId: windowId, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
  }

  static createBasicTabLayoutState(tabId: any): SessionLayoutState {
    return {sessionId: tabId};
  }

  static createBasicWindowLayoutState(windowId: number): SessionLayoutState {
    return {sessionId: windowId, title: 'Window', hidden: false};
  }

  static cleanupLayoutState(layoutState: SessionListLayoutState,
                            sessions: ChromeAPISession[]): SessionListLayoutState {
    SessionListUtils.fillMissingLayoutStates(layoutState, sessions);
    SessionListUtils.removeRedundantLayoutStates(layoutState, sessions);
    return layoutState;
  }

  static fillMissingLayoutStates(layoutState: SessionListLayoutState,
                                 sessions: ChromeAPISession[]) {
    sessions.forEach(session => {
      const sessionId = SessionUtils.getSessionId(session);
      if (!layoutState.sessionStates.some(sessionState => sessionState.sessionId === sessionId)) {
        layoutState.sessionStates.push(SessionListUtils.createBasicWindowLayoutState(sessionId));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: SessionListLayoutState,
                                     sessions: ChromeAPISession[]) {
    layoutState.sessionStates = layoutState.sessionStates.filter(sessionState =>
      sessions.some(session => SessionUtils.getSessionId(session) === sessionState.sessionId)
    );
  }
}

export interface SessionListLayoutState {
  hidden: boolean;
  sessionStates: SessionLayoutState[];
}

export interface SessionLayoutState {
  title?: string;
  sessionId: any;
  hidden?: boolean;
  // todo: dont put this field in storage
  deleted?: boolean;
}
