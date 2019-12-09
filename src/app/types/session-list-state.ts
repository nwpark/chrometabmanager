import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState, SessionUtils} from './chrome-api-types';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

export class SessionListState {

  chromeSessions: SessionMap;
  layoutState: SessionListLayoutState;

  static empty(): SessionListState {
    return new this({}, SessionListUtils.createEmptyListLayoutState());
  }

  constructor(chromeSessions: SessionMap,
              layoutState: SessionListLayoutState) {
    this.chromeSessions = chromeSessions;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.chromeSessions[windowId].window;
  }

  getSession(sessionId: any): ChromeAPISession {
    return this.chromeSessions[sessionId];
  }

  getSessionAtIndex(index: number): ChromeAPISession {
    const sessionId = this.layoutState.sessionStates[index].sessionId;
    return this.chromeSessions[sessionId];
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
    delete this.chromeSessions[sessionId];
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
    this.chromeSessions[SessionUtils.getSessionId(session)] = session;
    this.layoutState.sessionStates.unshift(windowLayoutState);
  }

  markWindowAsDeleted(windowId: any) {
    this.getSessionLayout(windowId).deleted = true;
  }

  insertSession(session: ChromeAPISession, layoutState: SessionLayoutState, index: number) {
    this.chromeSessions[SessionUtils.getSessionId(session)] = session;
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
    while (this.layoutState.sessionStates.length > maxTabCount) {
      const layoutState = this.layoutState.sessionStates.pop();
      delete this.chromeSessions[layoutState.sessionId];
    }
  }

  size(): number {
    return this.layoutState.sessionStates.length;
  }
}

export class SessionListUtils {
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

  static mergeSessionLists(primary: SessionListState, secondary: SessionListState): SessionListState {
    secondary.layoutState.sessionStates.forEach(layoutState => {
      if (!primary.chromeSessions[layoutState.sessionId]) {
        const session = secondary.chromeSessions[layoutState.sessionId];
        primary.unshiftSession(session, layoutState);
      }
    });
    return primary;
  }

  static filterSessionMap(sessionMap: SessionMap, layoutState: SessionListLayoutState): SessionMap {
    const filteredSessionMap: SessionMap = {};
    layoutState.sessionStates
      .map(sessionState => sessionState.sessionId)
      .forEach(sessionId => filteredSessionMap[sessionId] = sessionMap[sessionId]);
    return filteredSessionMap;
  }

  static createSessionMapFromWindowList(chromeWindows: ChromeAPIWindowState[]): SessionMap {
    const sessionMap: SessionMap = {};
    chromeWindows.forEach(chromeWindow => {
      sessionMap[chromeWindow.id] = SessionUtils.createSessionFromWindow(chromeWindow);
    });
    return sessionMap;
  }

  static cleanupLayoutState(layoutState: SessionListLayoutState,
                            chromeWindows: ChromeAPIWindowState[]): SessionListLayoutState {
    SessionListUtils.fillMissingLayoutStates(layoutState, chromeWindows);
    SessionListUtils.removeRedundantLayoutStates(layoutState, chromeWindows);
    return layoutState;
  }

  static fillMissingLayoutStates(layoutState: SessionListLayoutState,
                                 chromeWindows: ChromeAPIWindowState[]) {
    chromeWindows.forEach(chromeWindow => {
      if (!layoutState.sessionStates.some(sessionState => sessionState.sessionId === chromeWindow.id)) {
        layoutState.sessionStates.push(SessionListUtils.createBasicWindowLayoutState(chromeWindow.id));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: SessionListLayoutState,
                                     chromeWindows: ChromeAPIWindowState[]) {
    layoutState.sessionStates = layoutState.sessionStates.filter(sessionState =>
      chromeWindows.some(chromeWindow => chromeWindow.id === sessionState.sessionId)
    );
  }
}

export interface SessionMap {
  [sessionId: string]: ChromeAPISession;
}

export interface SessionListLayoutState {
  hidden: boolean;
  sessionStates: SessionLayoutState[];
}

export interface SessionLayoutState {
  title?: string;
  sessionId: any;
  hidden?: boolean;
  deleted?: boolean;
}
