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

  getSessionLayout(sessionId: any): SessionLayoutState {
    return this.layoutState.sessionStates.find(layoutState => layoutState.sessionId === sessionId);
  }

  getTabFromWindow(windowId: any, tabId: any): ChromeAPITabState {
    return this.getWindow(windowId).tabs.find(tab => tab.id === tabId);
  }

  getTabIdFromWindow(windowId: any, tabIndex: number): number {
    return this.getWindow(windowId).tabs[tabIndex].id;
  }

  insertTabInWindow(windowId: any, index: number, chromeTab: ChromeAPITabState) {
    this.getWindow(windowId).tabs.splice(index, 0, chromeTab);
  }

  removeTabFromWindow(windowId: any, tabId: any) {
    const chromeWindow = this.getWindow(windowId);
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
    if (chromeWindow.tabs.length === 0) {
      this.removeSession(windowId);
    }
  }

  removeSession(windowId: any) {
    this.chromeAPIWindows = this.chromeAPIWindows.filter(window => window.id !== windowId);
    this.layoutState.sessionStates = this.layoutState.sessionStates.filter(windowState => windowState.sessionId !== windowId);
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

  moveSessionInList(sourceIndex: number, targetIndex: number) {
    moveItemInArray(this.layoutState.sessionStates, sourceIndex, targetIndex);
  }

  unshiftSession(window: ChromeAPIWindowState, windowLayoutState: SessionLayoutState) {
    this.chromeAPIWindows.unshift(window);
    this.layoutState.sessionStates.unshift(windowLayoutState);
  }

  markWindowAsDeleted(windowId: any) {
    this.getSessionLayout(windowId).deleted = true;
  }

  insertSession(window: ChromeAPIWindowState, layoutState: SessionLayoutState, index: number) {
    this.chromeAPIWindows.splice(index, 0, window);
    this.layoutState.sessionStates.splice(index, 0, layoutState);
  }

  toggleDisplay() {
    this.layoutState.hidden = !this.layoutState.hidden;
  }

  setHidden(hidden: boolean) {
    this.layoutState.hidden = hidden;
  }

  toggleSessionDisplay(windowId: any) {
    const windowLayout = this.getSessionLayout(windowId);
    windowLayout.hidden = !windowLayout.hidden;
  }

  setSessionTitle(windowId: any, title: string) {
    const windowLayout = this.getSessionLayout(windowId);
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

