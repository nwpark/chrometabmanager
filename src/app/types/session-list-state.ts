import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
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

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.sessionStates.find(sessionState => sessionState.layoutState.sessionId === windowId).session.window;
  }

  getTabFromWindow(windowId: any, tabId: any): ChromeAPITabState {
    return this.getWindow(windowId).tabs.find(tab => tab.id === tabId);
  }

  getSessionAtIndex(index: number): ChromeAPISession {
    return this.sessionStates[index].session;
  }

  getSessionIdFromIndex(index: number): any {
    return this.sessionStates[index].layoutState.sessionId;
  }

  getTabIdFromWindow(windowIndex: number, tabIndex: number) {
    return this.sessionStates[windowIndex].session.window.tabs[tabIndex].id;
  }

  removeSession(index: number) {
    this.sessionStates.splice(index, 1);
  }

  markWindowAsDeleted(index: number) {
    this.sessionStates[index].layoutState.deleted = true;
  }

  removeTab(windowIndex: number, tabId: any) {
    const session = this.getSessionAtIndex(windowIndex);
    session.window.tabs = session.window.tabs.filter(tab => tab.id !== tabId);
  }

  insertTabInWindow(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) {
    this.sessionStates[windowIndex].session.window.tabs.splice(tabIndex, 0, chromeTab);
  }

  moveTabInWindow(windowIndex: number, sourceIndex: number, targetIndex: number) {
    moveItemInArray(this.sessionStates[windowIndex].session.window.tabs, sourceIndex, targetIndex);
  }

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    transferArrayItem(
      this.sessionStates[sourceWindowIndex].session.window.tabs,
      this.sessionStates[targetWindowIndex].session.window.tabs,
      sourceTabIndex,
      targetTabIndex
    );
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

  toggleSessionDisplay(index: number) {
    const layoutState = this.sessionStates[index].layoutState;
    layoutState.hidden = !layoutState.hidden;
  }

  setSessionTitle(index: number, title: string) {
    this.sessionStates[index].layoutState.title = title;
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
    this.removeAll(other);
    this.sessionStates.push(...other);
  }

  private removeAll(other: SessionListState) {
    const otherSessionIds = new Set(other.getSessionIds());
    this.sessionStates = this.sessionStates
      .filter(sessionState => !otherSessionIds.has(sessionState.layoutState.sessionId));
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

