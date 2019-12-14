import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {SessionLayoutState, SessionListLayoutState, SessionMap, SessionState} from './session';

export class SessionListState {

  private sessionStates: SessionState[];
  private hidden: boolean;

  static empty(): SessionListState {
    return new this([], false);
  }

  static fromSessionMap(
    chromeSessions: SessionMap,
    listLayoutState: SessionListLayoutState
  ): SessionListState {
    const sessionStates: SessionState[] = listLayoutState.sessionStates
      .map(layoutState => {
        return {session: chromeSessions[layoutState.sessionId], layoutState};
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

  getSessionLayout(sessionId: any): SessionLayoutState {
    return this.getSessionState(sessionId).layoutState;
  }

  getTabFromWindow(windowId: any, tabId: any): ChromeAPITabState {
    return this.getWindow(windowId).tabs.find(tab => tab.id === tabId);
  }

  removeSession(sessionId: any) {
    this.sessionStates = this.sessionStates.filter(sessionState => sessionState.layoutState.sessionId !== sessionId);
  }

  moveSessionInList(sourceIndex: number, targetIndex: number) {
    moveItemInArray(this.sessionStates, sourceIndex, targetIndex);
  }

  unshiftSession(session: ChromeAPISession, layoutState: SessionLayoutState) {
    this.sessionStates.unshift({session, layoutState});
  }

  markWindowAsDeleted(windowId: any) {
    this.getSessionLayout(windowId).deleted = true;
  }

  // todo: pass session state directly
  insertSession(session: ChromeAPISession, layoutState: SessionLayoutState, index: number) {
    this.sessionStates.splice(index, 0, {session, layoutState});
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
    // todo: create a [session.window.type === 'normal'] predicate
    return this.sessionStates.filter(sessionState => {
      return !sessionState.session.window || sessionState.session.window.type === 'normal';
    }).length;
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
    this.sessionStates
      .forEach(sessionState => {
        sessionMap[sessionState.layoutState.sessionId] = sessionState.session;
      });
    return sessionMap;
  }

  getLayoutState(): SessionListLayoutState {
    return {
      sessionStates: this.sessionStates.map(sessionState => sessionState.layoutState),
      hidden: this.hidden
    };
  }

  *[Symbol.iterator](): IterableIterator<SessionState> {
    for (const sessionState of this.sessionStates) {
      yield sessionState;
    }
  }
}

