import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ChromeAPISession} from '../chrome-api/chrome-api-session';
import {ChromeAPIWindowState, SessionId} from '../chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../chrome-api/chrome-api-tab-state';
import {SessionState, sessionStateEquals} from './session-state';
import {SessionLayoutState} from './session-layout-state';
import {isNullOrUndefined} from 'util';
import {SessionMap} from './session-map';
import {SessionStateMap} from './session-state-map';
import {SessionListLayoutState} from './session-list-layout-state';

export class SessionListState {

  private sessionStates: SessionState[];
  private hidden: boolean;

  static empty(): SessionListState {
    return new SessionListState([], false);
  }

  static fromSessionStates(sessionStates: SessionState[], hidden: boolean): SessionListState {
    return new SessionListState(sessionStates, hidden);
  }

  static fromSessionListState(sessionListState: SessionListState): SessionListState {
    return new SessionListState(sessionListState.sessionStates, sessionListState.hidden);
  }

  static fromSessionMap(
    sessionMap: SessionMap,
    listLayoutState: SessionListLayoutState
  ): SessionListState {
    const sessionStates: SessionState[] = listLayoutState.sessionLayoutStates
      .map(layoutState => {
        return {session: sessionMap[layoutState.sessionId], layoutState};
      });
    return new SessionListState(sessionStates, listLayoutState.hidden);
  }

  private constructor(sessionStates: SessionState[], hidden: boolean) {
    this.sessionStates = sessionStates;
    this.hidden = hidden;
  }

  getWindow(windowId: SessionId): ChromeAPIWindowState {
    return this.sessionStates.find(sessionState => sessionState.layoutState.sessionId === windowId).session.window;
  }

  getTabFromWindow(windowId: SessionId, tabId: SessionId): ChromeAPITabState {
    return this.getWindow(windowId).tabs.find(tab => tab.id === tabId);
  }

  getSessionState(index: number): SessionState {
    return this.sessionStates[index];
  }

  getSessionAtIndex(index: number): ChromeAPISession {
    return this.sessionStates[index].session;
  }

  getSessionIdFromIndex(index: number): SessionId {
    return this.sessionStates[index].layoutState.sessionId;
  }

  getTabIdFromWindow(windowIndex: number, tabIndex: number): SessionId {
    return this.sessionStates[windowIndex].session.window.tabs[tabIndex].id;
  }

  removeSession(index: number) {
    this.sessionStates.splice(index, 1);
  }

  markWindowAsDeleted(index: number) {
    this.sessionStates[index].layoutState.deleted = true;
  }

  removeTab(windowIndex: number, tabId: SessionId) {
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

  setTabTitle(windowIndex: number, tabIndex: number, title: string) {
    this.sessionStates[windowIndex].session.window.tabs[tabIndex].title = title;
  }

  setTabSuspended(windowIndex: number, tabIndex: number) {
    this.sessionStates[windowIndex].session.window.tabs[tabIndex].discarded = true;
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
    other.removeAll(this);
    this.sessionStates.push(...other);
  }

  private removeAll(other: SessionListState) {
    const otherSessionIds = new Set(other.getSessionIds());
    this.sessionStates = this.sessionStates
      .filter(sessionState => !otherSessionIds.has(sessionState.layoutState.sessionId.toString()));
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

  sortTabsInWindow(sessionIndex: number): ChromeAPITabState[] {
    this.sessionStates[sessionIndex].session.window.tabs.sort((a, b) => {
      return a.url.localeCompare(b.url);
    });
    return this.sessionStates[sessionIndex].session.window.tabs;
  }

  removeDuplicateTabs(windowIndex: number): ChromeAPITabState[] {
    const chromeWindow = this.getSessionAtIndex(windowIndex).window;
    const urlSet = new Set(chromeWindow.tabs.map(chromeTab => chromeTab.url));
    const duplicateTabs = chromeWindow.tabs.filter(chromeTab => {
      return !urlSet.delete(chromeTab.url);
    });
    chromeWindow.tabs = chromeWindow.tabs.filter(chromeTab => {
      return !duplicateTabs.find(duplicateTab => duplicateTab.id === chromeTab.id);
    });
    return duplicateTabs;
  }

  deepCopy(): SessionListState {
    return SessionListState.fromSessionListState(JSON.parse(JSON.stringify(this)));
  }

  equals(other: SessionListState): boolean {
    if (isNullOrUndefined(other)) {
      return false;
    }
    const sessionStates = [...this];
    const otherSessionStates = [...other];
    return (this === other)
      || (sessionStates.length === otherSessionStates.length
        && sessionStates.every((sessionState, index) => sessionStateEquals(sessionState, otherSessionStates[index])));
  }

  [Symbol.iterator](): IterableIterator<SessionState> {
    return this.sessionStates[Symbol.iterator]();
  }
}
