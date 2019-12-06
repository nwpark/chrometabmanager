import {Injectable} from '@angular/core';

import {WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {modifiesState, StateModifierParams} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {StorageService} from './storage.service';
import {ChromeAPITabState, ChromeAPIWindowState, SessionUtils, WindowStateUtils} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';
import {SessionListState} from '../types/session-list-state';

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  private sessionListState: SessionListState;

  private sessionStateUpdated = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdated.asObservable();

  constructor() {
    this.sessionListState = SessionListState.empty();
    MessagePassingService.addActiveWindowStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    StorageService.getActiveWindowsState().then(windowListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing active windows');
      this.sessionListState = windowListState;
      this.sessionStateUpdated.next(this.sessionListState);
    });
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState({storeResult: false})
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.sessionListState.getTabIdFromWindow(windowId, sourceIndex);
    this.sessionListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {index: targetIndex});
  }

  @modifiesState({storeResult: false})
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    const tabId = this.sessionListState.getTabIdFromWindow(sourceWindowId, sourceIndex);
    this.sessionListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {windowId: targetWindowId, index: targetIndex});
  }

  @modifiesState({storeResult: false})
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
    this.sessionListState.insertTabInWindow(windowId, tabIndex, activeTab);
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
    this.sessionListState.removeTabFromWindow(windowId, tabId);
    chrome.tabs.remove(tabId);
  }

  @modifiesState({storeResult: false})
  removeSession(sessionId: any) {
    // todo: move deleted field to component to prevent glitching
    this.sessionListState.markWindowAsDeleted(sessionId);
    chrome.windows.remove(sessionId);
  }

  @modifiesState({storeResult: true})
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState({storeResult: true})
  toggleSessionDisplay(sessionId: any) {
    this.sessionListState.toggleSessionDisplay(sessionId);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    chrome.tabs.update(chromeTab.id, {active: true});
    chrome.windows.update(chromeTab.windowId, {focused: true});
  }

  @modifiesState({storeResult: true})
  setSessionTitle(sessionId: any, title: string) {
    this.sessionListState.setSessionTitle(sessionId, title);
  }

  createWindow(chromeWindow: ChromeAPIWindowState) {
    const tabsUrls = chromeWindow.tabs.map(tab => tab.url);
    chrome.windows.create({url: tabsUrls, focused: true});
  }

  @modifiesState({storeResult: false})
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const tempWindow = WindowStateUtils.convertToActiveWindow(chromeWindow);
    const tempSession = SessionUtils.createSessionFromWindow(tempWindow);
    const tempLayoutState = WindowListUtils.createBasicWindowLayoutState(tempWindow.id);
    this.sessionListState.insertSession(tempSession, tempLayoutState, index);
    MessagePassingService.requestInsertChromeWindow(tempWindow, index);
  }

  @modifiesState({storeResult: true})
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveSessionInList(sourceIndex, targetIndex);
  }

  onStateModified(params?: StateModifierParams) {
    console.log(new Date().toTimeString().substring(0, 8), '- updating active windows');
    this.sessionStateUpdated.next(this.sessionListState);
    if (params.storeResult) {
      StorageService.setActiveWindowsState(this.sessionListState);
    }
  }

}
