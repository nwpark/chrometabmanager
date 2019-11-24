import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {
  ChromeWindowState,
  ChromeAPITabState,
  ChromeAPIWindowState,
  SavedWindowState,
  ChromeTabState,
  SavedTabState
} from './chrome-api-types';

export type ActiveWindowListState = WindowListState<ChromeAPIWindowState, ChromeAPITabState>;
export type SavedWindowListState = WindowListState<SavedWindowState, SavedTabState>;

export class WindowListState<T extends ChromeWindowState, V extends ChromeTabState> {

  chromeWindows: T[];
  layoutState: WindowListLayoutState;

  // todo: make constructor private
  constructor(chromeWindows: T[],
              layoutState: WindowListLayoutState) {
    this.chromeWindows = chromeWindows;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): T {
    return this.chromeWindows.find(window => window.id === windowId);
  }

  getWindowLayout(windowId: any): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  getTabId(windowId: any, tabIndex: number): any {
    return this.getWindow(windowId).tabs[tabIndex].id;
  }

  insertTab(windowId: any, index: number, chromeTab: V) {
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

  unshiftWindow(window: T, windowLayoutState: WindowLayoutState) {
    this.chromeWindows.unshift(window);
    this.layoutState.windowStates.unshift(windowLayoutState);
  }

  removeWindow(windowId: any) {
    this.chromeWindows = this.chromeWindows.filter(window => window.id !== windowId);
    this.layoutState.windowStates = this.layoutState.windowStates.filter(windowState => windowState.windowId !== windowId);
  }

  addWindow(window: T, layoutState: WindowLayoutState) {
    this.chromeWindows.push(window);
    this.layoutState.windowStates.push(layoutState);
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
  static createEmptyWindowListState<T extends ChromeWindowState, V extends ChromeTabState>(): WindowListState<T, V> {
    return new WindowListState([], WindowListUtils.createEmptyListLayoutState());
  }

  static createEmptyListLayoutState(): WindowListLayoutState {
    return {hidden: false, windowStates: []};
  }

  static createBasicListLayoutState(chromeWindows: ChromeWindowState[]): WindowListLayoutState {
    const layoutState = WindowListUtils.createEmptyListLayoutState();
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeWindows);
    return layoutState;
  }

  static cleanupLayoutState(layoutState: WindowListLayoutState,
                            chromeWindows: ChromeWindowState[]): WindowListLayoutState {
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeWindows);
    WindowListUtils.removeRedundantLayoutStates(layoutState, chromeWindows);
    return layoutState;
  }

  static fillMissingLayoutStates(layoutState: WindowListLayoutState,
                                 chromeWindows: ChromeWindowState[]) {
    chromeWindows.forEach(window => {
      if (!layoutState.windowStates.some(windowState => windowState.windowId === window.id)) {
        layoutState.windowStates.push(WindowListUtils.createBasicWindowLayoutState(window.id));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: WindowListLayoutState,
                                     chromeWindows: ChromeWindowState[]) {
    layoutState.windowStates = layoutState.windowStates.filter(windowState =>
      chromeWindows.some(window => window.id === windowState.windowId)
    );
  }

  static createBasicWindowLayoutState(windowId: number | string): WindowLayoutState {
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

