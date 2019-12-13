import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {SessionLayoutState, SessionListLayoutState, SessionMap, SessionState} from './session';
import {SessionListUtils} from '../classes/session-list-utils';
import {SessionUtils} from '../classes/session-utils';
import {SyncStorageUtils} from '../classes/sync-storage-utils';

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

  removeSession(sessionId: any) {
    delete this.chromeSessions[sessionId];
    this.layoutState.sessionStates = this.layoutState.sessionStates.filter(layoutState => layoutState.sessionId !== sessionId);
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

  getSessionIds(): string[] {
    return this.layoutState.sessionStates
      .map(sessionState => sessionState.sessionId.toString());
  }

  addAll(other: SessionListState) {
    for (const sessionState of other) {
      if (!this.chromeSessions[sessionState.layoutState.sessionId]) {
        this.unshiftSession(sessionState.session, sessionState.layoutState);
      }
    }
  }

  clear() {
    this.chromeSessions = {};
    this.layoutState.sessionStates = [];
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

  static fromSessionStates(sessionStates: SessionState[], layoutState: SessionListLayoutState): SessionListState {
    const sessionMap: SessionMap = {};
    sessionStates.forEach(sessionState => {
      sessionMap[SessionUtils.getSessionId(sessionState.session)] = sessionState.session;
    });
    SyncStorageUtils.mergeLayoutStates(layoutState, sessionStates);
    return new SessionListState(sessionMap, layoutState);
  }

  getSessionStates(): SessionState[] {
    return Array.from(this);
  }
}

