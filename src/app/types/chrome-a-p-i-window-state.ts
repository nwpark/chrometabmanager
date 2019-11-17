import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

export class WindowListState {

  chromeAPIWindows: ChromeAPIWindowState[];
  layoutState: WindowListLayoutState;

  static getDefaultAPIWindows(): ChromeAPIWindowState[] {
    return [];
  }

  static getDefaultLayoutState(): WindowListLayoutState {
    return {hidden: false, windowStates: []};
  }

  static getDefaultInstance(): WindowListState {
    return new WindowListState(WindowListState.getDefaultAPIWindows(), WindowListState.getDefaultLayoutState());
  }

  constructor(chromeAPIWindows: ChromeAPIWindowState[],
              layoutState: WindowListLayoutState) {
    this.chromeAPIWindows = chromeAPIWindows;
    this.layoutState = layoutState;
    this.cleanupLayoutState();
  }

  cleanupLayoutState() {
    this.chromeAPIWindows.forEach(window => {
      if (!this.containsLayoutForWindow(window.id)) {
        const windowLayoutState = {windowId: window.id, hidden: false};
        this.layoutState.windowStates.push(windowLayoutState);
      }
    });
    this.layoutState.windowStates.filter(windowState => this.containsWindow(windowState.windowId));
  }

  containsWindow(windowId: any) {
    return this.chromeAPIWindows.some(window => window.id === windowId);
  }

  containsLayoutForWindow(windowId: any) {
    return this.layoutState.windowStates.some(windowState => windowState.windowId === windowId);
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.chromeAPIWindows.find(window => window.id === windowId);
  }

  getWindowLayout(windowId): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  getTabId(windowId: any, tabIndex: number): number {
    return this.getWindow(windowId).tabs[tabIndex].id;
  }

  insertTab(windowId: any, index: number, chromeTab: ChromeAPITabState) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs.splice(index, 0, chromeTab);
  }

  removeTab(windowId: any, tabIndex: number) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs.splice(tabIndex, 1);
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
}

export interface WindowListLayoutState {
  hidden: boolean;
  windowStates: WindowLayoutState[];
}

export interface WindowLayoutState {
  windowId: any;
  hidden: boolean;
}

export interface ChromeAPIWindowState {
  id: any;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any;
}

export interface ChromeAPITabState {
  id: any;
  index: number;
  windowId: number;
  url: string;
  title: string;
  favIconUrl: string;
  [others: string]: any;
}

export class ChromeTabUtils {
  static getWindow(windows: ChromeAPIWindowState[], windowId: number) {
    return windows.find(window => window.id === windowId);
  }
}
