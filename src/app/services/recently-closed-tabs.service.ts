import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {StorageService} from './storage.service';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {SessionListState} from '../types/session-list-state';
import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {ChromeEventHandlerService} from './chrome-event-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService implements TabsService {

  private sessionListState: SessionListState;

  private sessionStateUpdatedSource = new Subject<SessionListState>();
  public sessionStateUpdated$ = this.sessionStateUpdatedSource.asObservable();

  constructor(private storageService: StorageService,
              private chromeTabsService: ChromeTabsService,
              private chromeEventHandlerService: ChromeEventHandlerService) {
    this.sessionListState = SessionListState.empty();
    this.chromeEventHandlerService.addClosedSessionStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.storageService.getRecentlyClosedSessionsState().then(sessionListState => {
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
    this.sessionListState.removeTab(windowId, tabId);
  }

  @modifiesState()
  removeDetachedTab(tabId: any) {
    this.sessionListState.removeDetachedTab(tabId);
  }

  @modifiesState()
  removeWindow(windowId: any) {
    this.sessionListState.removeWindow(windowId);
  }

  @modifiesState()
  toggleWindowDisplay(windowId: any) {
    this.sessionListState.toggleWindowDisplay(windowId);
  }

  setTabActive(windowId: any, chromeTab: ChromeAPITabState) {
    this.chromeTabsService.updateCurrentTabUrl(chromeTab);
  }

  @modifiesState()
  clear() {
    this.sessionListState.recentlyClosedSessions = [];
    this.sessionListState.layoutState.windowStates = [];
  }

  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) { /* do nothing */ }

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) { /* do nothing */ }

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) { /* do nothing */ }

  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) { /* do nothing */ }

  setWindowTitle(windowId: any, title: string) { /* do nothing */ }

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating recently closed windows');
    this.sessionStateUpdatedSource.next(this.sessionListState);
    this.storageService.setRecentlyClosedSessionsState(this.sessionListState);
  }
}
