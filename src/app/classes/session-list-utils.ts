import {SessionLayoutState, SessionListLayoutState, SessionMap} from '../types/session';
import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionUtils} from './session-utils';

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

  static createClosedWindowLayoutState(windowId: any): SessionLayoutState {
    return {sessionId: windowId, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
  }

  static createBasicTabLayoutState(tabId: any): SessionLayoutState {
    return {sessionId: tabId};
  }

  static createBasicWindowLayoutState(windowId: number): SessionLayoutState {
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
