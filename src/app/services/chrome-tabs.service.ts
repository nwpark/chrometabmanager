import {Injectable} from '@angular/core';

import {WindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {modifiesState, StateModifierParams} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {StorageService} from './storage.service';
import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  static getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  constructor() {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    MessagePassingService.addActiveWindowStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    StorageService.getActiveWindowsState().then(windowListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing active windows');
      this.windowListState = windowListState;
      this.windowStateUpdatedSource.next(this.windowListState);
    });
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
  }

  @modifiesState({storeResult: false})
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.windowListState.getTabId(windowId, sourceIndex);
    this.windowListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {index: targetIndex});
  }

  @modifiesState({storeResult: false})
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.windowListState.getTabId(sourceWindowId, sourceIndex);
    this.windowListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {windowId: targetWindowId, index: targetIndex});
  }

  @modifiesState({storeResult: false})
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
    this.windowListState.insertTab(windowId, tabIndex, activeTab);
    chrome.tabs.create({windowId, index: tabIndex, url: chromeTab.url, active: false});
  }

  openUrlInNewTab(url: string) {
    chrome.tabs.create({url, active: false});
  }

  updateCurrentTabUrl(url: string) {
    chrome.tabs.getCurrent(currentTab => {
      chrome.tabs.update(currentTab.id, {url});
    });
  }

  @modifiesState({storeResult: false})
  removeTab(windowId: any, tabId: any) {
    this.windowListState.removeTab(windowId, tabId);
    chrome.tabs.remove(tabId);
  }

  @modifiesState({storeResult: false})
  removeWindow(windowId: any) {
    // todo: move deleted field to component to prevent glitching
    this.windowListState.markWindowAsDeleted(windowId);
    chrome.windows.remove(windowId);
  }

  @modifiesState({storeResult: true})
  toggleWindowListDisplay() {
    this.windowListState.toggleDisplay();
  }

  @modifiesState({storeResult: true})
  toggleWindowDisplay(windowId: any) {
    this.windowListState.toggleWindowDisplay(windowId);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    chrome.tabs.update(chromeTab.id, {active: true});
    chrome.windows.update(chromeTab.windowId, {focused: true});
  }

  @modifiesState({storeResult: true})
  setWindowTitle(windowId: any, title: string) {
    this.windowListState.setWindowTitle(windowId, title);
  }

  createWindow(chromeWindow: ChromeAPIWindowState) {
    const tabsUrls = chromeWindow.tabs.map(tab => tab.url);
    chrome.windows.create({url: tabsUrls, focused: true});
  }

  @modifiesState({storeResult: false})
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const tempWindow = WindowStateUtils.convertToActiveWindow(chromeWindow);
    const tempLayoutState = WindowListUtils.createBasicWindowLayoutState(tempWindow.id);
    this.windowListState.insertWindow(tempWindow, tempLayoutState, index);
    MessagePassingService.requestInsertChromeWindow(tempWindow, index);
  }

  @modifiesState({storeResult: true})
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.windowListState.moveWindowInList(sourceIndex, targetIndex);
  }

  onStateModified(params?: StateModifierParams) {
    console.log(new Date().toTimeString().substring(0, 8), '- updating active windows');
    this.windowStateUpdatedSource.next(this.windowListState);
    if (params.storeResult) {
      StorageService.setActiveWindowsState(this.windowListState);
    }
  }

}
