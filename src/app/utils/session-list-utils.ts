import {SessionUtils} from './session-utils';
import {ChromeAPISession} from '../types/chrome-api/chrome-api-session';
import {ChromeAPIWindowState, SessionId} from '../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../types/chrome-api/chrome-api-tab-state';
import {SessionLayoutState} from '../types/session/session-layout-state';
import {SessionMap} from '../types/session/session-map';
import {SessionListLayoutState} from '../types/session/session-list-layout-state';

export class SessionListUtils {
  static createEmptyListLayoutState(): SessionListLayoutState {
    return {hidden: false, sessionLayoutStates: []};
  }

  static createClosedSessionFromWindow(chromeWindow: ChromeAPIWindowState): ChromeAPISession {
    return {lastModified: Date.now(), window: chromeWindow};
  }

  static createClosedSessionFromTab(chromeTab: ChromeAPITabState): ChromeAPISession {
    return {lastModified: Date.now(), tab: chromeTab};
  }

  static createClosedSessionLayoutState(sessionId: SessionId): SessionLayoutState {
    return {sessionId, hidden: true};
  }

  static createBasicTabLayoutState(tabId: SessionId): SessionLayoutState {
    return {sessionId: tabId};
  }

  static createBasicWindowLayoutState(windowId: SessionId): SessionLayoutState {
    return {sessionId: windowId, title: 'Window', hidden: false};
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
      if (!layoutState.sessionLayoutStates.some(sessionState => sessionState.sessionId === chromeWindow.id)) {
        layoutState.sessionLayoutStates.push(SessionListUtils.createBasicWindowLayoutState(chromeWindow.id));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: SessionListLayoutState,
                                     chromeWindows: ChromeAPIWindowState[]) {
    layoutState.sessionLayoutStates = layoutState.sessionLayoutStates.filter(sessionState =>
      chromeWindows.some(chromeWindow => chromeWindow.id === sessionState.sessionId)
    );
  }
}
