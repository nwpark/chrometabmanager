import {v4 as uuid} from 'uuid';
import {ChromeAPISession} from '../types/chrome-api/chrome-api-session';
import {ChromeAPIWindowState, SessionId} from '../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../types/session/session-state';
import {SessionLayoutState} from '../types/session/session-layout-state';

export class SessionUtils {
  static getSessionId(chromeSession: ChromeAPISession): SessionId {
    if (chromeSession.window) {
      return chromeSession.window.id;
    } else if (chromeSession.tab) {
      return chromeSession.tab.id;
    }
  }

  static createSessionFromWindow(chromeWindow: ChromeAPIWindowState): ChromeAPISession {
    return {window: chromeWindow};
  }
}

export class SessionStateUtils {
  static convertToActiveWindow(sessionState: SessionState): SessionState {
    const window = WindowStateUtils.convertToActiveWindow(sessionState.session.window);
    const layoutState = LayoutStateUtils.copyWithNewId(sessionState.layoutState, window.id);
    return {session: {window}, layoutState};
  }

  static convertToSavedWindow(sessionState: SessionState): SessionState {
    const window = WindowStateUtils.convertToSavedWindow(sessionState.session.window);
    const layoutState = LayoutStateUtils.copyWithNewId(sessionState.layoutState, window.id);
    return {session: {window}, layoutState};
  }
}

export class WindowStateUtils {
  static convertToSavedWindow(chromeWindow: ChromeAPIWindowState): ChromeAPIWindowState {
    const {type} = chromeWindow;
    const savedTabs = chromeWindow.tabs.map(tab => this.convertToSavedTab(tab));
    return {id: uuid(), tabs: savedTabs, type};
  }

  static convertToSavedTab(chromeTab: ChromeAPITabState): ChromeAPITabState {
    const {url, title} = chromeTab;
    return {id: uuid(), status: 'complete', url, title};
  }

  static convertToActiveWindow(chromeWindow: ChromeAPIWindowState): ChromeAPIWindowState {
    const activeTabs = chromeWindow.tabs.map(tab => this.convertToActiveTab(tab));
    return {...chromeWindow, id: uuid(), tabs: activeTabs};
  }

  static convertToActiveTab(chromeTab: ChromeAPITabState): ChromeAPITabState {
    return {...chromeTab, id: undefined, status: 'loading'};
  }
}

export class LayoutStateUtils {
  static copyWithNewId(layoutState: SessionLayoutState, sessionId: SessionId): SessionLayoutState {
    return {...layoutState, sessionId};
  }
}
