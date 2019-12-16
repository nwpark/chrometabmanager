import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState, StateModifierParams} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState, SessionId} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionListUtils} from '../classes/session-list-utils';
import {SessionStateUtils, SessionUtils, WindowStateUtils} from '../classes/session-utils';
import {SessionState} from '../types/session';

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
  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    this.sessionListState.moveTabInWindow(windowIndex, sourceTabIndex, targetTabIndex);
  }

  @modifiesState({storeResult: true})
  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    this.sessionListState.transferTab(sourceWindowIndex, targetWindowIndex, sourceTabIndex, targetTabIndex);
  }

  @modifiesState({storeResult: true})
  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) {
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
    this.sessionListState.insertTabInWindow(windowIndex, tabIndex, savedTab);
  }

  @modifiesState({storeResult: true})
  removeTab(windowIndex: number, tabId: SessionId) {
    this.sessionListState.removeTab(windowIndex, tabId);
  }

  @modifiesState({storeResult: false})
  removeSession(index: number) {
    const sessionId = this.sessionListState.getSessionIdFromIndex(index);
    this.sessionListState.removeSession(index);
    this.storageService.setSavedWindowsState(this.sessionListState, [sessionId]);
  }

  @modifiesState({storeResult: true})
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState({storeResult: true})
  toggleSessionDisplay(index: number) {
    this.sessionListState.toggleSessionDisplay(index);
  }

  @modifiesState({storeResult: true})
  setSessionTitle(index: number, title: string) {
    this.sessionListState.setSessionTitle(index, title);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    if (openInNewTab) {
      this.chromeTabsService.openUrlInNewTab(chromeTab.url);
    } else {
      this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
    }
  }

  @modifiesState({storeResult: true})
  insertWindow(sessionState: SessionState, index: number) {
    sessionState = SessionStateUtils.convertToSavedWindow(sessionState);
    this.sessionListState.insertSession(sessionState, index);
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
