import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';

export type ActiveWindowListState = WindowListState<number>;
export type SavedWindowListState = WindowListState<string>;

export class WindowListState<T> {

  chromeAPIWindows: ChromeAPIWindowState<T>[];
  layoutState: WindowListLayoutState;

  // todo: make constructor private
  constructor(chromeAPIWindows: ChromeAPIWindowState<T>[],
              layoutState: WindowListLayoutState) {
    this.chromeAPIWindows = chromeAPIWindows;
    this.layoutState = layoutState;
  }

  // todo: make all windowId types T
  getWindow(windowId: T): ChromeAPIWindowState<T> {
    return this.chromeAPIWindows.find(window => window.id === windowId);
  }

  getWindowLayout(windowId: T): WindowLayoutState {
    return this.layoutState.windowStates.find(windowState => windowState.windowId === windowId);
  }

  getTabId(windowId: T, tabIndex: number): T {
    return this.getWindow(windowId).tabs[tabIndex].id;
  }

  insertTab(windowId: T, index: number, chromeTab: ChromeAPITabState<T>) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs.splice(index, 0, chromeTab);
  }

  removeTab(windowId: T, tabId: T) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
  }

  moveTabInWindow(windowId: T, sourceIndex: number, targetIndex: number) {
    const targetWindow = this.getWindow(windowId);
    moveItemInArray(targetWindow.tabs, sourceIndex, targetIndex);
  }

  transferTab(sourceWindowId: T, targetWindowId: T, sourceIndex: number, targetIndex: number) {
    const previousWindow = this.getWindow(sourceWindowId);
    const targetWindow = this.getWindow(targetWindowId);
    transferArrayItem(previousWindow.tabs, targetWindow.tabs, sourceIndex, targetIndex);
  }

  unshiftWindow(window: ChromeAPIWindowState<T>, windowLayoutState: WindowLayoutState) {
    this.chromeAPIWindows.unshift(window);
    this.layoutState.windowStates.unshift(windowLayoutState);
  }

  removeWindow(windowId: T) {
    this.chromeAPIWindows = this.chromeAPIWindows.filter(window => window.id !== windowId);
    this.layoutState.windowStates = this.layoutState.windowStates.filter(windowState => windowState.windowId !== windowId);
  }

  addWindow(window: ChromeAPIWindowState<T>, layoutState: WindowLayoutState) {
    this.chromeAPIWindows.push(window);
    this.layoutState.windowStates.push(layoutState);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  toggleWindowDisplay(windowId: T) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }

  setHidden(hidden: boolean) {
    this.layoutState.hidden = hidden;
  }

  setWindowTitle(windowId: T, title: string) {
    const windowLayout = this.getWindowLayout(windowId);
    windowLayout.title = title;
  }
}

export class WindowListUtils {
  static createEmptyWindowListState<T>(): WindowListState<T> {
    return new WindowListState([], WindowListUtils.createEmptyListLayoutState());
  }

  static createEmptyListLayoutState(): WindowListLayoutState {
    return {hidden: false, windowStates: []};
  }

  static createBasicListLayoutState<T>(chromeAPIWindows: ChromeAPIWindowState<T>[]): WindowListLayoutState {
    const layoutState = WindowListUtils.createEmptyListLayoutState();
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeAPIWindows);
    return layoutState;
  }

  static cleanupLayoutState<T>(layoutState: WindowListLayoutState,
                               chromeAPIWindows: ChromeAPIWindowState<T>[]): WindowListLayoutState {
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeAPIWindows);
    WindowListUtils.removeRedundantLayoutStates(layoutState, chromeAPIWindows);
    return layoutState;
  }

  static fillMissingLayoutStates<T>(layoutState: WindowListLayoutState,
                                    chromeAPIWindows: ChromeAPIWindowState<T>[]) {
    chromeAPIWindows.forEach(window => {
      if (!layoutState.windowStates.some(windowState => windowState.windowId === window.id)) {
        layoutState.windowStates.push(WindowListUtils.createBasicWindowLayoutState(window.id));
      }
    });
  }

  static removeRedundantLayoutStates<T>(layoutState: WindowListLayoutState,
                                        chromeAPIWindows: ChromeAPIWindowState<T>[]) {
    layoutState.windowStates = layoutState.windowStates.filter(windowState =>
      chromeAPIWindows.some(window => window.id === windowState.windowId)
    );
  }

  static createBasicWindowLayoutState<T>(windowId: T): WindowLayoutState {
    return {windowId, title: 'Window', hidden: false};
  }
}

export interface WindowListLayoutState {
  hidden: boolean;
  windowStates: WindowLayoutState[];
}

export interface WindowLayoutState {
  title: string;
  windowId: any; // todo
  hidden: boolean;
}
