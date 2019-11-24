import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {StorageService} from './storage.service';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {SessionListState} from '../types/closed-session-list-state';
import {ActiveTabState, ChromeAPITabState, SavedTabState} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService implements TabsService<number> {

  private sessionListState: SessionListState;

  private sessionStateUpdatedSource = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdatedSource.asObservable();

  constructor(private storageService: StorageService,
              private chromeTabsService: ChromeTabsService) {
    this.sessionListState = SessionListState.empty();
    this.storageService.getRecentlyClosedSessionsState().then(sessionListState => {
      this.setSessionListState(sessionListState);
    });
    this.storageService.addClosedSessionStateListener(sessionListState => {
      this.setSessionListState(sessionListState);
    });
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState()
  private setSessionListState(sessionListState: SessionListState) {
    this.sessionListState = sessionListState;
  }

  @modifiesState()
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState()
  removeTab(windowId: number, tabId: number) {
    this.sessionListState.removeTab(windowId, tabId);
  }

  @modifiesState()
  removeDetachedTab(tabId: number) {
    this.sessionListState.removeDetachedTab(tabId);
  }

  @modifiesState()
  removeWindow(windowId: number) {
    this.sessionListState.removeWindow(windowId);
  }

  @modifiesState()
  toggleWindowDisplay(windowId: number) {
    this.sessionListState.toggleWindowDisplay(windowId);
  }

  setTabActive(windowId: number, chromeTab: ActiveTabState) {
    this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
  }

  @modifiesState()
  clear() {
    this.sessionListState.recentlyClosedSessions = [];
    this.sessionListState.layoutState.windowStates = [];
  }

  moveTabInWindow(windowId: number, sourceIndex: number, targetIndex: number) { /* Recently closed tabs are immutable */ }

  transferTab(sourceWindowId: number, targetWindowId: number, sourceIndex: number, targetIndex: number) { /* Recently closed tabs are immutable */ }

  createTab(windowId: number, tabIndex: number, chromeTab: ChromeAPITabState<any>) { /* Recently closed tabs are immutable */ }

  setWindowTitle(windowId: number, title: string) { /* Recently closed tabs are immutable */ }

  onStateUpdated() {
    this.sessionStateUpdatedSource.next(this.sessionListState);
    this.storageService.setRecentlyClosedSessionsState(this.sessionListState);
  }
}
