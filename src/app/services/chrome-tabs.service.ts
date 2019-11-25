import {Injectable} from '@angular/core';

import {WindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {StorageService} from './storage.service';
import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../types/chrome-api-types';
import {ChromeEventHandlerService} from './chrome-event-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor(private storageService: StorageService,
              private chromeEventHandlerService: ChromeEventHandlerService) {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    this.chromeEventHandlerService.addActiveWindowsUpdatedListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.getChromeWindowsFromAPI().then(windowList => {
      const layoutState = this.storageService.getChromeWindowsLayoutState(windowList);
      this.setWindowListState(new WindowListState(windowList, layoutState));
    });
  }

  private getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  @modifiesState()
  private setWindowListState(windowListState: WindowListState) {
    this.windowListState = windowListState;
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
    this.windowListState.removeWindow(windowId);
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

  createWindow(window: ChromeAPIWindowState) {
    const tabsUrls = window.tabs.map(tab => tab.url);
    chrome.windows.create({url: tabsUrls, focused: true});
  }

  onStateUpdated() {
    this.windowStateUpdatedSource.next(this.windowListState);
    this.storageService.setChromeWindowsLayoutState(this.windowListState.layoutState);
  }

}
