import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-api-types';

export class WindowListState {

  chromeAPIWindows: ChromeAPIWindowState[];
  layoutState: SessionListLayoutState;

  static empty(): WindowListState {
    return new this([], WindowListUtils.createEmptyListLayoutState());
  }

  constructor(chromeAPIWindows: ChromeAPIWindowState[],
              layoutState: SessionListLayoutState) {
    this.chromeAPIWindows = chromeAPIWindows;
    this.layoutState = layoutState;
  }

  getWindow(windowId: any): ChromeAPIWindowState {
    return this.chromeAPIWindows.find(window => window.id === windowId);
  }

  getWindowLayout(windowId: any): SessionLayoutState {
    return this.layoutState.sessionStates.find(windowState => windowState.sessionId === windowId);
  }

  getTab(windowId: any, tabId: any): ChromeAPITabState {
    const chromeWindow = this.getWindow(windowId);
    return chromeWindow.tabs.find(tab => tab.id === tabId);
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

  moveWindowInList(sourceIndex: number, targetIndex: number) {
    moveItemInArray(this.layoutState.sessionStates, sourceIndex, targetIndex);
  }

  unshiftWindow(window: ChromeAPIWindowState, windowLayoutState: SessionLayoutState) {
    this.chromeAPIWindows.unshift(window);
    this.layoutState.sessionStates.unshift(windowLayoutState);
  }

  removeWindow(windowId: any) {
    this.chromeAPIWindows = this.chromeAPIWindows.filter(window => window.id !== windowId);
    this.layoutState.sessionStates = this.layoutState.sessionStates.filter(windowState => windowState.sessionId !== windowId);
  }

  markWindowAsDeleted(windowId: any) {
    this.getWindowLayout(windowId).deleted = true;
  }

  insertWindow(window: ChromeAPIWindowState, layoutState: SessionLayoutState, index: number) {
    this.chromeAPIWindows.splice(index, 0, window);
    this.layoutState.sessionStates.splice(index, 0, layoutState);
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
  static createEmptyListLayoutState(): SessionListLayoutState {
    return {hidden: false, sessionStates: []};
  }

  static cleanupLayoutState(layoutState: SessionListLayoutState,
                            chromeAPIWindows: ChromeAPIWindowState[]): SessionListLayoutState {
    WindowListUtils.fillMissingLayoutStates(layoutState, chromeAPIWindows);
    WindowListUtils.removeRedundantLayoutStates(layoutState, chromeAPIWindows);
    return layoutState;
  }

  static fillMissingLayoutStates(layoutState: SessionListLayoutState,
                                 chromeAPIWindows: ChromeAPIWindowState[]) {
    chromeAPIWindows.forEach(window => {
      if (!layoutState.sessionStates.some(windowState => windowState.sessionId === window.id)) {
        layoutState.sessionStates.push(WindowListUtils.createBasicWindowLayoutState(window.id));
      }
    });
  }

  static removeRedundantLayoutStates(layoutState: SessionListLayoutState,
                                     chromeAPIWindows: ChromeAPIWindowState[]) {
    layoutState.sessionStates = layoutState.sessionStates.filter(windowState =>
      chromeAPIWindows.some(window => window.id === windowState.sessionId)
    );
  }

  static createBasicWindowLayoutState(windowId: number): SessionLayoutState {
    return {sessionId: windowId, title: 'Window', hidden: false};
  }
}

export interface SessionListLayoutState {
  hidden: boolean;
  sessionStates: SessionLayoutState[];
}

export interface SessionLayoutState {
  title?: string;
  sessionId: any;
  hidden?: boolean;
  // todo: dont put this field in storage
  deleted?: boolean;
}

