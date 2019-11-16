import {Injectable} from '@angular/core';

import {MOCK_ACTIVE_WINDOWS} from './mock-windows';
import {environment} from '../../environments/environment';
import {ChromeAPITabState, ChromeAPIWindowState, WindowListLayoutState, WindowListState} from '../types/chrome-a-p-i-window-state';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';

declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  private readonly CHROME_TAB_EVENTS = [
    chrome.tabs.onCreated,
    chrome.tabs.onUpdated,
    chrome.tabs.onMoved,
    chrome.tabs.onDetached, // potentially unnecessary
    chrome.tabs.onAttached, // potentially unnecessary
    chrome.tabs.onRemoved,
    chrome.tabs.onReplaced,
    chrome.windows.onCreated,
    chrome.windows.onRemoved
  ];

  constructor() {
    if (environment.production) {
      this.CHROME_TAB_EVENTS.forEach(tabEvent => tabEvent.addListener(() => this.refreshState()));
    }
  }

  refreshState() {
    const windowList: Promise<ChromeAPIWindowState[]> = this.getChromeWindowsFromAPI();
    const windowLayoutState: Promise<WindowListLayoutState> = this.getLayoutStateFromStorage();
    Promise.all([windowList, windowLayoutState]).then(result => {
      const windowListState = new WindowListState(result[0], result[1]);
      this.setState(windowListState);
    });
  }

  getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    if (!environment.production) {
      return Promise.resolve(MOCK_ACTIVE_WINDOWS);
    }
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows);
      });
    });
  }

  getLayoutStateFromStorage(): Promise<WindowListLayoutState> {
    if (!environment.production) {
      return Promise.resolve(WindowListState.getDefaultLayoutState());
    }
    return new Promise<WindowListLayoutState>(resolve => {
      const storageKey = { activeWindowsLayoutState: WindowListState.getDefaultLayoutState() };
      chrome.storage.sync.get(storageKey, data => {
        resolve(data.activeWindowsLayoutState);
      });
    });
  }

  @modifiesState()
  setState(windowListState: WindowListState) {
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
    // todo: update tab in callback
    this.windowListState.insertTab(windowId, tabIndex, chromeTab);
    if (environment.production) {
      chrome.tabs.create({windowId, index: tabIndex, url: chromeTab.url, active: false});
    }
  }

  replaceCurrentTab(chromeTab: ChromeAPITabState) {
    chrome.tabs.getCurrent(currentTab => {
      chrome.tabs.update(currentTab.id, {url: chromeTab.url});
    });
  }

  @modifiesState()
  removeTab(windowId: any, tabIndex: number) {
    const tabId = this.windowListState.getTabId(windowId, tabIndex);
    this.windowListState.removeTab(windowId, tabIndex);
    if (environment.production) {
      chrome.tabs.remove(tabId);
    }
  }

  @modifiesState()
  removeWindow(windowId: any) {
    this.windowListState.removeWindow(windowId);
    // todo: call api
  }

  @modifiesState()
  toggleDisplay() {
    this.windowListState.toggleDisplay();
  }

  @modifiesState()
  toggleWindowDisplay(windowId: any) {
    this.windowListState.toggleWindowDisplay(windowId);
  }

  setTabActive(windowId: any, tabId: any) {
    chrome.tabs.update(tabId, {active: true});
    chrome.windows.update(windowId, {focused: true});
  }

  onStateUpdated() {
    this.windowStateUpdatedSource.next(this.windowListState);
    if (environment.production) {
      chrome.storage.sync.set({
        activeWindowsLayoutState: this.windowListState.layoutState
      });
    }
  }

}
