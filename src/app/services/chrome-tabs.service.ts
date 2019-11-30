import {Injectable} from '@angular/core';

import {WindowLayoutState, WindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
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

  constructor() {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    MessagePassingService.addActiveWindowStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.getChromeWindowsFromAPI().then(windowList => {
      StorageService.getChromeWindowsLayoutState(windowList).then(layoutState => {
        console.log(new Date().toTimeString().substring(0, 8), '- refreshing active windows');
        this.windowListState = new WindowListState(windowList, layoutState);
        this.windowStateUpdatedSource.next(this.windowListState);
      });
    });
  }

  private getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
  }

  @modifiesState()
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.windowListState.getTabId(windowId, sourceIndex);
    this.windowListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {index: targetIndex});
  }

  @modifiesState()
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.windowListState.getTabId(sourceWindowId, sourceIndex);
    this.windowListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {windowId: targetWindowId, index: targetIndex});
  }

  @modifiesState()
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
    this.windowListState.insertTab(windowId, tabIndex, activeTab);
    chrome.tabs.create({windowId, index: tabIndex, url: chromeTab.url, active: false});
  }

  updateCurrentTabUrl(chromeTab: ChromeAPITabState) {
    chrome.tabs.getCurrent(currentTab => {
      chrome.tabs.update(currentTab.id, {url: chromeTab.url});
    });
  }

  @modifiesState()
  removeTab(windowId: any, tabId: any) {
    this.windowListState.removeTab(windowId, tabId);
    chrome.tabs.remove(tabId);
  }

  @modifiesState()
  removeWindow(windowId: any) {
    this.windowListState.markWindowAsDeleted(windowId);
    chrome.windows.remove(windowId);
  }

  @modifiesState()
  toggleWindowListDisplay() {
    this.windowListState.toggleDisplay();
  }

  @modifiesState()
  toggleWindowDisplay(windowId: any) {
    this.windowListState.toggleWindowDisplay(windowId);
  }

  setTabActive(windowId: any, chromeTab: ChromeAPITabState) {
    chrome.tabs.update(chromeTab.id, {active: true});
    chrome.windows.update(windowId, {focused: true});
  }

  @modifiesState()
  setWindowTitle(windowId: any, title: string) {
    this.windowListState.setWindowTitle(windowId, title);
  }

  createWindow(chromeWindow: ChromeAPIWindowState) {
    const tabsUrls = chromeWindow.tabs.map(tab => tab.url);
    chrome.windows.create({url: tabsUrls, focused: true});
  }

  @modifiesState()
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const tempWindow = WindowStateUtils.convertToActiveWindow(chromeWindow);
    const tempLayoutState = WindowListUtils.createBasicWindowLayoutState(tempWindow.id);
    this.windowListState.insertWindow(tempWindow, tempLayoutState, index);

    const tabsUrls = chromeWindow.tabs.map(tab => tab.url);
    chrome.windows.create({url: tabsUrls, focused: false}, window => {
      const newWindow = window as ChromeAPIWindowState;
      const layoutState = WindowListUtils.createBasicWindowLayoutState(newWindow.id);
      this.replaceTempWindow(tempWindow.id, newWindow, layoutState, index);
      chrome.windows.update(newWindow.id, { focused: false });
    });
  }

  @modifiesState()
  private replaceTempWindow(tempWindowId: any, chromeWindow: ChromeAPIWindowState,
                            layoutState: WindowLayoutState, index: number) {
    this.windowListState.removeWindow(tempWindowId);
    this.windowListState.insertWindow(chromeWindow, layoutState, index);
  }

  @modifiesState()
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.windowListState.moveWindowInList(sourceIndex, targetIndex);
  }

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating active windows');
    this.windowStateUpdatedSource.next(this.windowListState);
    StorageService.setChromeWindowsLayoutState(this.windowListState.layoutState);
  }

}
