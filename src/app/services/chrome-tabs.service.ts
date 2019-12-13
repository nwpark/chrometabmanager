import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {modifiesState, StateModifierParams} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';
import {SessionListState} from '../types/session-list-state';
import {LayoutStateUtils, SessionUtils, WindowStateUtils} from '../classes/session-utils';
import {LocalStorageService} from './local-storage.service';
import {SessionLayoutState} from '../types/session';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

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
  moveTabInWindow(chromeWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number) {
    const tabId = chromeWindow.tabs[sourceIndex].id;
    moveItemInArray(chromeWindow.tabs, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {index: targetIndex});
  }

  @modifiesState({storeResult: false})
  transferTab(sourceWindow: ChromeAPIWindowState, targetWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number) {
    const tabId = sourceWindow.tabs[sourceIndex].id;
    transferArrayItem(sourceWindow.tabs, targetWindow.tabs, sourceIndex, targetIndex);
    chrome.tabs.move(tabId, {windowId: targetWindow.id, index: targetIndex});
  }

  @modifiesState({storeResult: false})
  createTab(chromeWindow: ChromeAPIWindowState, tabIndex: number, chromeTab: ChromeAPITabState) {
    const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
    chromeWindow.tabs.splice(tabIndex, 0, activeTab);
    chrome.tabs.create({windowId: chromeWindow.id, index: tabIndex, url: chromeTab.url, active: false});
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
  removeTab(chromeWindow: ChromeAPIWindowState, tabId: any) {
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
    chrome.tabs.remove(tabId);
  }

  @modifiesState({storeResult: true})
  removeSession(sessionId: any) {
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

  @modifiesState({storeResult: false})
  insertWindow(chromeWindow: ChromeAPIWindowState, layoutState: SessionLayoutState, index: number) {
    const tempWindow = WindowStateUtils.convertToActiveWindow(chromeWindow);
    const tempSession = SessionUtils.createSessionFromWindow(tempWindow);
    const tempLayoutState = LayoutStateUtils.copyWithNewId(layoutState, tempWindow.id);
    this.sessionListState.insertSession(tempSession, tempLayoutState, index);
    MessagePassingService.requestInsertChromeWindow(tempWindow, tempLayoutState, index);
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
