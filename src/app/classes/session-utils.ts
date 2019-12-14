import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {v4 as uuid} from 'uuid';
import {SessionLayoutState, SessionState} from '../types/session';

export class SessionUtils {
  static getSessionId(chromeSession: ChromeAPISession): any {
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
    const {url, title, favIconUrl} = chromeTab;
    return {id: uuid(), status: 'complete', url, title, favIconUrl};
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
  static copyWithNewId(layoutState: SessionLayoutState, sessionId: any): SessionLayoutState {
    return {...layoutState, sessionId};
  }
}
