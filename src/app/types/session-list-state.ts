import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {SessionLayoutState, SessionListLayoutState, SessionMap} from './session';
import {SessionListUtils} from '../classes/session-list-utils';
import {SessionUtils} from '../classes/session-utils';

export class SessionListState {

  private iteratorCache = {};

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
    // todo: create a [session.window.type === 'normal'] predicate
    return Object.values(this.chromeSessions)
      .filter(session => !session.window || session.window.type === 'normal')
      .length;
  }

  *[Symbol.iterator](): IterableIterator<SessionState> {
    for (const layoutState of this.layoutState.sessionStates) {
      if (!this.iteratorCache[layoutState.sessionId]) {
        this.iteratorCache[layoutState.sessionId] = {
          session: this.chromeSessions[layoutState.sessionId],
          layoutState
        };
      }
      yield this.iteratorCache[layoutState.sessionId];
    }
  }
}

// todo: move elsewhere
export interface SessionState {
  session: ChromeAPISession;
  layoutState: SessionLayoutState;
}
