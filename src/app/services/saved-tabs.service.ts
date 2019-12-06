import {Injectable} from '@angular/core';
import {WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {ChromeAPISession, ChromeAPITabState, ChromeAPIWindowState, SessionUtils, WindowStateUtils} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';
import {SessionListState, SessionListUtils} from '../types/session-list-state';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService {

  private sessionListState: SessionListState;

  private sessionStateUpdated = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdated.asObservable();

  constructor(private chromeTabsService: ChromeTabsService) {
    this.sessionListState = SessionListState.empty();
    MessagePassingService.addSavedWindowStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    StorageService.getSavedWindowsState().then(windowListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing saved windows');
      this.sessionListState = windowListState;
      this.sessionStateUpdated.next(this.sessionListState);
    });
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState()
  createNewWindow() {
    const newWindow: ChromeAPIWindowState = {id: uuid(), tabs: [], type: 'normal'};
    const newSession: ChromeAPISession = SessionListUtils.createClosedSessionFromWindow(newWindow);
    const newWindowLayout = WindowListUtils.createBasicWindowLayoutState(newWindow.id);
    this.sessionListState.unshiftSession(newSession, newWindowLayout);
    this.sessionListState.setHidden(false);
  }

  @modifiesState()
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
  }

  @modifiesState()
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    this.sessionListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
  }

  @modifiesState()
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
    this.sessionListState.insertTabInWindow(windowId, tabIndex, savedTab);
  }

  @modifiesState()
  removeTab(windowId: any, tabId: any) {
    this.sessionListState.removeTabFromWindow(windowId, tabId);
  }

  @modifiesState()
  removeSession(sessionId: any) {
    this.sessionListState.removeSession(sessionId);
  }

  @modifiesState()
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState()
  toggleSessionDisplay(sessionId: any) {
    this.sessionListState.toggleSessionDisplay(sessionId);
  }

  @modifiesState()
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

  @modifiesState()
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const savedSession = SessionUtils.createSessionFromWindow(savedWindow);
    const layoutState = WindowListUtils.createBasicWindowLayoutState(savedWindow.id);
    this.sessionListState.insertSession(savedSession, layoutState, index);
  }

  @modifiesState()
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveSessionInList(sourceIndex, targetIndex);
  }

  // Called by @modifiesState decorator
  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating saved windows');
    this.sessionStateUpdated.next(this.sessionListState);
    StorageService.setSavedWindowsState(this.sessionListState);
  }
}
