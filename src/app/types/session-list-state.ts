import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {SessionLayoutState, SessionListLayoutState, SessionMap, SessionState, SessionStateMap} from './session';

export class SessionListState {

  private sessionStates: SessionState[];
  private hidden: boolean;

  static empty(): SessionListState {
    return new this([], false);
  }

  static fromSessionStates(sessionStates: SessionState[], hidden: boolean): SessionListState {
    return new this(sessionStates, hidden);
  }

  static fromSessionMap(
    sessionMap: SessionMap,
    listLayoutState: SessionListLayoutState
  ): SessionListState {
    const sessionStates: SessionState[] = listLayoutState.sessionLayoutStates
      .map(layoutState => {
        return {session: sessionMap[layoutState.sessionId], layoutState};
      });
    return new this(sessionStates, listLayoutState.hidden);
  }

  private constructor(sessionStates: SessionState[], hidden: boolean) {
    this.sessionStates = sessionStates;
    this.hidden = hidden;
  }

  getSessionState(sessionId: any): SessionState {
    return this.sessionStates.find(sessionState => sessionState.layoutState.sessionId === sessionId);
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.getSessionState(windowId).session.window;
  }

  getSessionAtIndex(index: number): ChromeAPISession {
    return this.sessionStates[index].session;
  }

  getSessionIdFromIndex(index: number): any {
    return this.sessionStates[index].layoutState.sessionId;
  }

  getSessionLayout(sessionId: any): SessionLayoutState {
    return this.getSessionState(sessionId).layoutState;
  }

  getTabFromWindow(windowId: any, tabId: any): ChromeAPITabState {
    return this.getWindow(windowId).tabs.find(tab => tab.id === tabId);
  }

  removeSession(index: number) {
    this.sessionStates.splice(index, 1);
  }

  markWindowAsDeleted(index: number) {
    this.sessionStates[index].layoutState.deleted = true;
  }

  moveSessionInList(sourceIndex: number, targetIndex: number) {
    moveItemInArray(this.sessionStates, sourceIndex, targetIndex);
  }

  unshiftSession(session: ChromeAPISession, layoutState: SessionLayoutState) {
    this.sessionStates.unshift({session, layoutState});
  }

  insertSession(sessionState: SessionState, index: number) {
    this.sessionStates.splice(index, 0, sessionState);
  }

  toggleDisplay() {
    this.hidden = !this.hidden;
  }

  setHidden(hidden: boolean) {
    this.hidden = hidden;
  }

  toggleSessionDisplay(sessionId: any) {
    const layoutState = this.getSessionLayout(sessionId);
    layoutState.hidden = !layoutState.hidden;
  }

  setSessionTitle(sessionId: any, title: string) {
    const layoutState = this.getSessionLayout(sessionId);
    layoutState.title = title;
  }

  removeExpiredSessions(maxSessionCount: number) {
    while (this.sessionStates.length > maxSessionCount) {
      this.sessionStates.pop();
    }
  }

  size(): number {
    return this.sessionStates.length;
  }

  getSessionIds(): string[] {
    return this.sessionStates
      .map(sessionState => sessionState.layoutState.sessionId.toString());
  }

  addAll(other: SessionListState) {
    for (const sessionState of other) {
      if (this.contains(sessionState.layoutState.sessionId)) {
        this.removeSession(sessionState.layoutState.sessionId);
      }
      this.unshiftSession(sessionState.session, sessionState.layoutState);
    }
  }

  contains(sessionId: any): boolean {
    return this.sessionStates
      .some(sessionState => sessionState.layoutState.sessionId === sessionId);
  }

  clear() {
    this.sessionStates = [];
  }

  isHidden(): boolean {
    return this.hidden;
  }

  getSessionMap(): SessionMap {
    const sessionMap: SessionMap = {};
    this.sessionStates.forEach(sessionState => {
      sessionMap[sessionState.layoutState.sessionId] = sessionState.session;
    });
    return sessionMap;
  }

  getSessionStateMap(): SessionStateMap {
    const sessionStateMap: SessionStateMap = {};
    this.sessionStates.forEach(sessionState => {
      sessionStateMap[sessionState.layoutState.sessionId] = {
        session: sessionState.session,
        layoutState: sessionState.layoutState
      };
    });
    return sessionStateMap;
  }

  getLayoutState(): SessionListLayoutState {
    return {
      sessionLayoutStates: this.sessionStates.map(sessionState => sessionState.layoutState),
      hidden: this.hidden
    };
  }

  [Symbol.iterator](): IterableIterator<SessionState> {
    return this.sessionStates[Symbol.iterator]();
  }
}

