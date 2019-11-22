import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';
import {WindowLayoutState, WindowListLayoutState, WindowListUtils} from './window-list-state';

export class SessionListState {

  recentlyClosedSessions: RecentlyClosedSession[];
  layoutState: WindowListLayoutState;

  static empty(): SessionListState {
    return new this([], {hidden: true, windowStates: []});
  }

  constructor(recentlyClosedSessions: RecentlyClosedSession[],
              layoutState: WindowListLayoutState) {
    this.recentlyClosedSessions = recentlyClosedSessions;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.recentlyClosedSessions
      .filter(session => session.isWindow)
      .map(session => session.closedWindow.chromeAPIWindow)
      .find(window => window.id === windowId);
  }

  getWindowLayout(windowId: any): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  removeTab(windowId: any, tabId: any) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
  }

  removeDetachedTab(tabId: any) {
    this.recentlyClosedSessions
      .filter(session => !session.isWindow)
      .forEach(session => {
        session.closedTabs = session.closedTabs
          .filter(closedTab => closedTab.chromeAPITab.id !== tabId);
      });
  }

  removeWindow(windowId: any) {
    this.recentlyClosedSessions = this.recentlyClosedSessions
      .filter(session => !session.isWindow || session.closedWindow.chromeAPIWindow.id !== windowId);
    this.layoutState.windowStates = this.layoutState.windowStates
      .filter(windowState => windowState.windowId !== windowId);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: any) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }
}

export interface RecentlyClosedSession {
  isWindow: boolean;
  closedWindow?: RecentlyClosedWindow;
  closedTabs?: RecentlyClosedTab[];
}

export interface RecentlyClosedWindow {
  timestamp: Date;
  chromeAPIWindow: ChromeAPIWindowState;
}

export interface RecentlyClosedTab {
  timestamp: Date;
  chromeAPITab: ChromeAPITabState;
}

export class SessionListUtils {
  static getClosedWindows(closedSessions: RecentlyClosedSession[]): RecentlyClosedWindow[] {
    return closedSessions
      .filter(session => session.isWindow)
      .map(session => session.closedWindow);
  }

  static createBasicListLayoutState(closedWindows: RecentlyClosedWindow[]): WindowListLayoutState {
    const layoutState = WindowListUtils.createEmptyListLayoutState();
    SessionListUtils.fillMissingLayoutStates(layoutState, closedWindows);
    return layoutState;
  }

  static cleanupLayoutState(layoutState: WindowListLayoutState,
                            closedWindows: RecentlyClosedWindow[]): WindowListLayoutState {
    SessionListUtils.fillMissingLayoutStates(layoutState, closedWindows);
    SessionListUtils.removeRedundantLayoutStates(layoutState, closedWindows);
    return layoutState;
  }

  static fillMissingLayoutStates(layoutState: WindowListLayoutState,
                                 closedWindows: RecentlyClosedWindow[]) {
    closedWindows.forEach(closedWindow => {
      if (!layoutState.windowStates.some(windowState => windowState.windowId === closedWindow.chromeAPIWindow.id)) {
        layoutState.windowStates.push(SessionListUtils.createBasicWindowLayoutState(closedWindow));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: WindowListLayoutState,
                                     closedWindows: RecentlyClosedWindow[]) {
    layoutState.windowStates = layoutState.windowStates.filter(windowState =>
      closedWindows.some(closedWindow => closedWindow.chromeAPIWindow.id === windowState.windowId)
    );
  }

  static createBasicWindowLayoutState(closedWindow: RecentlyClosedWindow): WindowLayoutState {
    return {
      windowId: closedWindow.chromeAPIWindow.id,
      title: `${new Date(closedWindow.timestamp).toTimeString().substring(0, 5)} - Window`,
      hidden: true
    };
  }
}
