import {Injectable} from '@angular/core';

import {MOCK_ACTIVE_WINDOWS} from './mock-windows';
import {environment} from '../../environments/environment';
import {
  ChromeAPITabState,
  ChromeAPIWindowState,
  WindowListLayoutState,
  WindowListState,
  WindowListUtils
} from '../types/chrome-a-p-i-window-state';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {StorageService} from './storage.service';

declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  private static readonly CHROME_WINDOW_EVENTS = environment.production && [
    chrome.tabs.onCreated,
    chrome.tabs.onUpdated,
    chrome.tabs.onMoved,
    chrome.tabs.onDetached,
    chrome.tabs.onAttached,
    chrome.tabs.onRemoved,
    chrome.tabs.onReplaced,
    chrome.windows.onCreated,
    chrome.windows.onRemoved
  ];

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor(private storageService: StorageService) {
    this.windowListState = WindowListState.createDefaultInstance();
    if (environment.production) {
      ChromeTabsService.CHROME_WINDOW_EVENTS.forEach(event => event.addListener(() => this.refreshState()));
    }
    this.refreshState();
  }

  private refreshState() {
    this.getChromeWindowsFromAPI().then(windowList => {
      const windowLayoutState = this.storageService.getChromeWindowsLayoutState();
      const windowListState = new WindowListState(windowList, windowLayoutState);
      this.setWindowListState(windowListState);
    });
  }

  private getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    if (!environment.production) {
      return Promise.resolve(MOCK_ACTIVE_WINDOWS);
    }
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows);
      });
    });
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
  }

  @modifiesState()
  private setWindowListState(windowListState: WindowListState) {
    this.windowListState = windowListState;
  }

  @modifiesState()
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.windowListState.getTabId(windowId, sourceIndex);
    this.windowListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
    if (environment.production) {
      chrome.tabs.move(tabId, {index: targetIndex});
    }
  }

  @modifiesState()
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.windowListState.getTabId(sourceWindowId, sourceIndex);
    this.windowListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
    if (environment.production) {
      chrome.tabs.move(tabId, {windowId: targetWindowId, index: targetIndex});
    }
  }

  @modifiesState()
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    this.windowListState.insertTab(windowId, tabIndex, chromeTab);
    if (environment.production) {
      chrome.tabs.create({windowId, index: tabIndex, url: chromeTab.url, active: false});
    }
  }

  updateCurrentTabUrl(chromeTab: ChromeAPITabState) {
    chrome.tabs.getCurrent(currentTab => {
      chrome.tabs.update(currentTab.id, {url: chromeTab.url});
    });
  }

  @modifiesState()
  removeTab(windowId: any, tabId: any) {
    this.windowListState.removeTab(windowId, tabId);
    if (environment.production) {
      chrome.tabs.remove(tabId);
    }
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

  onStateUpdated() {
    this.windowStateUpdatedSource.next(this.windowListState);
    this.storageService.setChromeWindowsLayoutState(this.windowListState.layoutState);
  }

}
