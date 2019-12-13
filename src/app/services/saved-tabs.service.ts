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
import {LayoutStateUtils, SessionUtils, WindowStateUtils} from '../classes/session-utils';
import {SessionLayoutState} from '../types/session';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

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
  moveTabInWindow(chromeWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number) {
    moveItemInArray(chromeWindow.tabs, sourceIndex, targetIndex);
  }

  @modifiesState({storeResult: true})
  transferTab(sourceWindow: ChromeAPIWindowState, targetWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number) {
    transferArrayItem(sourceWindow.tabs, targetWindow.tabs, sourceIndex, targetIndex);
  }

  @modifiesState({storeResult: true})
  createTab(chromeWindow: ChromeAPIWindowState, tabIndex: number, chromeTab: ChromeAPITabState) {
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
    chromeWindow.tabs.splice(tabIndex, 0, savedTab);
  }

  @modifiesState({storeResult: true})
  removeTab(chromeWindow: ChromeAPIWindowState, tabId: any) {
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
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
  insertWindow(chromeWindow: ChromeAPIWindowState, layoutState: SessionLayoutState, index: number) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const savedSession = SessionUtils.createSessionFromWindow(savedWindow);
    layoutState = LayoutStateUtils.copyWithNewId(layoutState, savedWindow.id);
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
