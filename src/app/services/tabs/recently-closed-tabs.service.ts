import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {modifiesState} from '../../decorators/modifies-state';
import {TabsService} from './tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {SessionListState} from '../../types/session/session-list-state';
import {LocalStorageService} from '../storage/local-storage.service';
import {SessionId} from '../../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../../types/session/session-state';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {ErrorDialogService} from '../error-dialog.service';
import {ErrorDialogDataFactory} from '../../utils/error-dialog-data-factory';

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService implements TabsService {

  sessionListState: SessionListState;

  private sessionStateUpdated: BehaviorSubject<SessionListState>;
  public sessionStateUpdated$: Observable<SessionListState>;

  constructor(private localStorageService: LocalStorageService,
              private chromeTabsService: ChromeTabsService,
              private messageReceiverService: MessageReceiverService,
              private errorDialogService: ErrorDialogService) {
    this.sessionStateUpdated = new BehaviorSubject(SessionListState.empty());
    this.sessionStateUpdated$ = this.sessionStateUpdated.asObservable();
    this.sessionListState = this.sessionStateUpdated.getValue();
    this.localStorageService.getRecentlyClosedSessionsState().then(sessionListState => {
      this.setSessionListState(sessionListState);
    }, error => this.handleStorageReadError(error));
    this.messageReceiverService.closedSessionStateUpdated$.subscribe(sessionListState => {
      this.setSessionListState(sessionListState);
    });
  }

  private setSessionListState(sessionListState: SessionListState) {
    console.log(new Date().toTimeString().substring(0, 8), '- refreshing recently closed windows');
    this.sessionListState = sessionListState;
    this.sessionStateUpdated.next(this.sessionListState);
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState()
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState()
  removeTab(windowIndex: number, tabId: SessionId) {
    this.sessionListState.removeTab(windowIndex, tabId);
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

  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) { /* do nothing */ }

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) { /* do nothing */ }

  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) { /* do nothing */ }

  setSessionTitle(index: number, title: string) { /* do nothing */ }

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating recently closed windows');
    this.sessionStateUpdated.next(this.sessionListState);
    this.localStorageService.setRecentlyClosedSessionsState(this.sessionListState);
  }

  handleStorageReadError(error: Error) {
    const dialogData = ErrorDialogDataFactory.couldNotRetrieveClosedSessions(error, () =>
      this.localStorageService.setRecentlyClosedSessionsState(SessionListState.empty())
    );
    this.errorDialogService.showActionableError(dialogData);
  }
}
