import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

export class WindowListState {

  chromeAPIWindows: ChromeAPIWindowState[];
  layoutState: WindowListLayoutState;

  constructor(chromeAPIWindows: ChromeAPIWindowState[],
              layoutState: WindowListLayoutState) {
    this.chromeAPIWindows = chromeAPIWindows;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.chromeAPIWindows.find(window => window.id === windowId);
  }

  getWindowLayout(windowId: any): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  getTabId(windowId: any, tabIndex: number): number {
    return this.getWindow(windowId).tabs[tabIndex].id;
  }

  insertTab(windowId: any, index: number, chromeTab: ChromeAPITabState) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs.splice(index, 0, chromeTab);
  }

  removeTab(windowId: any, tabId: any) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
  }

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    const targetWindow = this.getWindow(windowId);
    moveItemInArray(targetWindow.tabs, sourceIndex, targetIndex);
  }

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    const previousWindow = this.getWindow(sourceWindowId);
    const targetWindow = this.getWindow(targetWindowId);
    transferArrayItem(previousWindow.tabs, targetWindow.tabs, sourceIndex, targetIndex);
  }

  unshiftWindow(window: ChromeAPIWindowState, windowLayoutState: WindowLayoutState) {
    this.chromeAPIWindows.unshift(window);
    this.layoutState.windowStates.unshift(windowLayoutState);
  }

  removeWindow(windowId: any) {
    this.chromeAPIWindows = this.chromeAPIWindows.filter(window => window.id !== windowId);
    this.layoutState.windowStates = this.layoutState.windowStates.filter(windowState => windowState.windowId !== windowId);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: any) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }

  setHidden(hidden: boolean) {
    this.layoutState.hidden = hidden;
  }

  setWindowTitle(windowId: any, title: string) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.title = title;
  }
}

export class WindowListUtils {
  static createEmptyWindowListState(): WindowListState {
    return new WindowListState([], WindowListUtils.createEmptyListLayoutState());
  }

  static createEmptyListLayoutState(): WindowListLayoutState {
    return {hidden: false, windowStates: []};
  }

  static createBasicListLayoutState(chromeAPIWindows: ChromeAPIWindowState[]): WindowListLayoutState {
    const layoutState = WindowListUtils.createEmptyListLayoutState();
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeAPIWindows);
    return layoutState;
  }

  static cleanupLayoutState(layoutState: WindowListLayoutState,
                            chromeAPIWindows: ChromeAPIWindowState[]): WindowListLayoutState {
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeAPIWindows);
    WindowListUtils.removeRedundantLayoutStates(layoutState, chromeAPIWindows);
    return layoutState;
  }

  static fillMissingLayoutStates(layoutState: WindowListLayoutState,
                                 chromeAPIWindows: ChromeAPIWindowState[]) {
    chromeAPIWindows.forEach(window => {
      if (!layoutState.windowStates.some(windowState => windowState.windowId === window.id)) {
        layoutState.windowStates.push(WindowListUtils.createBasicWindowLayoutState(window.id));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: WindowListLayoutState,
                                     chromeAPIWindows: ChromeAPIWindowState[]) {
    layoutState.windowStates = layoutState.windowStates.filter(windowState =>
      chromeAPIWindows.some(window => window.id === windowState.windowId)
    );
  }

  static createBasicWindowLayoutState(windowId: number): WindowLayoutState {
    return {windowId, title: 'Window', hidden: false};
  }
}

export interface WindowListLayoutState {
  hidden: boolean;
  windowStates: WindowLayoutState[];
}

export interface WindowLayoutState {
  title: string;
  windowId: any;
  hidden: boolean;
}

export interface ChromeAPIWindowState {
  id: any;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPITabState {
  id: any;
  index: number;
  windowId: number;
  url: string;
  title: string;
  favIconUrl: string;
  [others: string]: any; // Ignore unused API fields
}

export interface RecentlyClosedSession {
  isWindow: boolean;
  window?: RecentlyClosedWindow;
  tabs?: RecentlyClosedTab[];
}

export interface RecentlyClosedWindow {
  timestamp: Date;
  window: ChromeAPIWindowState;
}

export interface RecentlyClosedTab {
  timestamp: Date;
  tab: ChromeAPITabState;
}
