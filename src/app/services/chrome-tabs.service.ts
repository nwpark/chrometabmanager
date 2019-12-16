import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {modifiesState, StateModifierParams} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeAPITabState, SessionId} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';
import {SessionListState} from '../types/session-list-state';
import {SessionStateUtils, WindowStateUtils} from '../classes/session-utils';
import {LocalStorageService} from './local-storage.service';
import {SessionState} from '../types/session';
import MoveProperties = chrome.tabs.MoveProperties;

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  private sessionListState: SessionListState;

  private sessionStateUpdated = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdated.asObservable();

  constructor(private localStorageService: LocalStorageService) {
    this.sessionListState = SessionListState.empty();
    MessagePassingService.addActiveWindowStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.localStorageService.getActiveWindowsState().then(windowListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing active windows');
      this.sessionListState = windowListState;
      this.sessionStateUpdated.next(this.sessionListState);
    });
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState({storeResult: false})
  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    const tabId = this.sessionListState.getTabIdFromWindow(windowIndex, sourceTabIndex) as number;
    const moveProperties: MoveProperties = {index: targetTabIndex};
    this.sessionListState.moveTabInWindow(windowIndex, sourceTabIndex, targetTabIndex);
    chrome.tabs.move(tabId, moveProperties);
  }

  @modifiesState({storeResult: false})
  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    const tabId = this.sessionListState.getTabIdFromWindow(sourceWindowIndex, sourceTabIndex) as number;
    const windowId = this.sessionListState.getSessionIdFromIndex(targetWindowIndex) as number;
    const moveProperties: MoveProperties = {windowId, index: targetTabIndex};
    this.sessionListState.transferTab(sourceWindowIndex, targetWindowIndex, sourceTabIndex, targetTabIndex);
    chrome.tabs.move(tabId, moveProperties);
  }

  @modifiesState({storeResult: false})
  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) {
    const windowId = this.sessionListState.getSessionIdFromIndex(windowIndex) as number;
    const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
    this.sessionListState.insertTabInWindow(windowIndex, tabIndex, activeTab);
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
  removeTab(windowIndex: number, tabId: SessionId) {
    this.sessionListState.removeTab(windowIndex, tabId);
    chrome.tabs.remove(tabId as number);
  }

  @modifiesState({storeResult: true})
  removeSession(index: number) {
    this.sessionListState.markWindowAsDeleted(index);
    const windowId = this.sessionListState.getSessionIdFromIndex(index) as number;
    chrome.windows.remove(windowId);
  }

  @modifiesState({storeResult: true})
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState({storeResult: true})
  toggleSessionDisplay(index: number) {
    this.sessionListState.toggleSessionDisplay(index);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    chrome.tabs.update(chromeTab.id as number, {active: true});
    chrome.windows.update(chromeTab.windowId as number, {focused: true});
  }

  @modifiesState({storeResult: true})
  setSessionTitle(index: number, title: string) {
    this.sessionListState.setSessionTitle(index, title);
  }

  @modifiesState({storeResult: false})
  insertWindow(sessionState: SessionState, index: number) {
    const tempSession = SessionStateUtils.convertToActiveWindow(sessionState);
    this.sessionListState.insertSession(tempSession, index);
    MessagePassingService.requestInsertChromeWindow(sessionState, index);
  }

  @modifiesState({storeResult: true})
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveSessionInList(sourceIndex, targetIndex);
  }

  onStateModified(params?: StateModifierParams) {
    console.log(new Date().toTimeString().substring(0, 8), '- updating active windows');
    this.sessionStateUpdated.next(this.sessionListState);
    if (params.storeResult) {
      this.localStorageService.setActiveWindowsState(this.sessionListState);
    }
  }
}
