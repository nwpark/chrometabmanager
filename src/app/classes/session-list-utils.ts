import {SessionLayoutState, SessionListLayoutState, SessionMap} from '../types/session';
import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionUtils} from './session-utils';

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
