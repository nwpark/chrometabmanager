import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState, StateModifierParams} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionListUtils} from '../classes/session-list-utils';
import {SessionUtils, WindowStateUtils} from '../classes/session-utils';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService {

  private sessionListState: SessionListState;

  private sessionStateUpdated = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdated.asObservable();

  constructor(private chromeTabsService: ChromeTabsService,
              private storageService: StorageService) {
    this.sessionListState = SessionListState.empty();
    this.storageService.addSavedSessionsChangedListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.storageService.getSavedWindowsState().then(windowListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing saved windows');
      this.sessionListState = windowListState;
      this.sessionStateUpdated.next(this.sessionListState);
    });
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState({storeResult: true})
  createNewWindow() {
    const newWindow: ChromeAPIWindowState = {id: uuid(), tabs: [], type: 'normal'};
    const newSession: ChromeAPISession = SessionUtils.createSessionFromWindow(newWindow);
    const newWindowLayout = SessionListUtils.createBasicWindowLayoutState(newWindow.id);
    this.sessionListState.unshiftSession(newSession, newWindowLayout);
    this.sessionListState.setHidden(false);
  }

  @modifiesState({storeResult: true})
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
  }

  @modifiesState({storeResult: true})
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    this.sessionListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
  }

  @modifiesState({storeResult: true})
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
    this.sessionListState.insertTabInWindow(windowId, tabIndex, savedTab);
  }

  @modifiesState({storeResult: true})
  removeTab(windowId: any, tabId: any) {
    this.sessionListState.removeTabFromWindow(windowId, tabId);
  }

  @modifiesState({storeResult: false})
  removeSession(sessionId: any) {
    this.sessionListState.removeSession(sessionId);
    this.storageService.setSavedWindowsState(this.sessionListState, [sessionId]);
  }

  @modifiesState({storeResult: true})
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState({storeResult: true})
  toggleSessionDisplay(sessionId: any) {
    this.sessionListState.toggleSessionDisplay(sessionId);
  }

  @modifiesState({storeResult: true})
  setSessionTitle(sessionId: any, title: string) {
    this.sessionListState.setSessionTitle(sessionId, title);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    if (openInNewTab) {
      this.chromeTabsService.openUrlInNewTab(chromeTab.url);
    } else {
      this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
    }
  }

  @modifiesState({storeResult: true})
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const savedSession = SessionUtils.createSessionFromWindow(savedWindow);
    const layoutState = SessionListUtils.createBasicWindowLayoutState(savedWindow.id);
    this.sessionListState.insertSession(savedSession, layoutState, index);
  }

  @modifiesState({storeResult: true})
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveSessionInList(sourceIndex, targetIndex);
  }

  // Called by @modifiesState decorator
  onStateModified(params?: StateModifierParams) {
    console.log(new Date().toTimeString().substring(0, 8), '- updating saved windows');
    this.sessionStateUpdated.next(this.sessionListState);
    if (params.storeResult) {
      this.storageService.setSavedWindowsState(this.sessionListState);
    }
  }
}
