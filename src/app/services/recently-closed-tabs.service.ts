import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {SessionListState} from '../types/session-list-state';
import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';
import {LocalStorageService} from './local-storage.service';
import {SessionState} from '../types/session';

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
  removeTab(chromeWindow: ChromeAPIWindowState, tabId: any) {
    chromeWindow.tabs = chromeWindow.tabs.filter(tab => tab.id !== tabId);
  }

  @modifiesState()
  removeSession(index: number) {
    this.sessionListState.removeSession(index);
  }

  @modifiesState()
  toggleSessionDisplay(index: number) {
    this.sessionListState.toggleSessionDisplay(index);
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
    this.sessionListState.clear();
  }

  insertWindow(sessionState: SessionState, index: number) { /* do nothing */ }

  moveWindowInList(sourceIndex: number, targetIndex: number) { /* do nothing */ }

  moveTabInWindow(chromeWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number) { /* do nothing */ }

  transferTab(sourceWindow: ChromeAPIWindowState, targetWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number) { /* do nothing */ }

  createTab(chromeWindow: ChromeAPIWindowState, tabIndex: number, chromeTab: ChromeAPITabState) { /* do nothing */ }

  setSessionTitle(index: number, title: string) { /* do nothing */ }

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating recently closed windows');
    this.sessionStateUpdatedSource.next(this.sessionListState);
    this.localStorageService.setRecentlyClosedSessionsState(this.sessionListState);
  }
}
