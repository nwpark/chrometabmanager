import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {SessionListState} from '../types/session-list-state';
import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService implements TabsService {

  private sessionListState: SessionListState;

  private sessionStateUpdatedSource = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdatedSource.asObservable();

  constructor(private localStorageService: LocalStorageService,
              private chromeTabsService: ChromeTabsService) {
    this.sessionListState = SessionListState.empty();
    MessagePassingService.addClosedSessionStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.localStorageService.getRecentlyClosedSessionsState().then(sessionListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing recently closed windows');
      this.sessionListState = sessionListState;
      this.sessionStateUpdatedSource.next(this.sessionListState);
    });
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState()
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState()
  removeTab(windowId: any, tabId: any) {
    this.sessionListState.removeTabFromWindow(windowId, tabId);
  }

  @modifiesState()
  removeSession(windowId: any) {
    this.sessionListState.removeSession(windowId);
  }

  @modifiesState()
  toggleSessionDisplay(windowId: any) {
    this.sessionListState.toggleSessionDisplay(windowId);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    if (openInNewTab) {
      this.chromeTabsService.openUrlInNewTab(chromeTab.url);
    } else {
      this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
    }
  }

  @modifiesState()
  clear() {
    this.sessionListState.chromeSessions = {};
    this.sessionListState.layoutState.sessionStates = [];
  }

  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) { /* do nothing */ }

  moveWindowInList(sourceIndex: number, targetIndex: number) { /* do nothing */ }

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) { /* do nothing */ }

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) { /* do nothing */ }

  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) { /* do nothing */ }

  setSessionTitle(windowId: any, title: string) { /* do nothing */ }

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating recently closed windows');
    this.sessionStateUpdatedSource.next(this.sessionListState);
    this.localStorageService.setRecentlyClosedSessionsState(this.sessionListState);
  }
}
