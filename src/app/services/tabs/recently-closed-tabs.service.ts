import {Injectable, NgZone} from '@angular/core';
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
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {Mutator} from '../../types/mutator';

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService implements TabsService {

  private sessionStateUpdated: BehaviorSubject<SessionListState>;
  public sessionStateUpdated$: Observable<SessionListState>;

  constructor(private localStorageService: LocalStorageService,
              private chromeTabsService: ChromeTabsService,
              private messageReceiverService: MessageReceiverService,
              private errorDialogService: ErrorDialogService,
              private ngZone: NgZone) {
    this.sessionStateUpdated = new BehaviorSubject(SessionListState.empty());
    this.sessionStateUpdated$ = this.sessionStateUpdated.asObservable();
    this.localStorageService.getRecentlyClosedSessionsState().then(sessionListState => {
      this.setSessionListState(sessionListState);
    }, error => this.handleStorageReadError(error));
    this.messageReceiverService.closedSessionStateUpdated$.subscribe(sessionListState => {
      ngZone.run(() => this.setSessionListState(sessionListState));
    });
  }

  private setSessionListState(sessionListState: SessionListState) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing recently closed windows');
    this.sessionStateUpdated.next(sessionListState);
  }

  getSessionListState(): SessionListState {
    return this.sessionStateUpdated.getValue();
  }

  toggleSessionListDisplay() {
    this.modifySessionListState(sessionListState => {
      sessionListState.toggleDisplay();
    });
  }

  removeTab(windowIndex: number, tabId: SessionId) {
    this.modifySessionListState(sessionListState => {
      sessionListState.removeTab(windowIndex, tabId);
    });
  }

  removeSession(index: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.removeSession(index);
    });
  }

  toggleSessionDisplay(index: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.toggleSessionDisplay(index);
    });
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    if (openInNewTab) {
      this.chromeTabsService.openUrlInNewTab(chromeTab.url);
    } else {
      this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
    }
  }

  clear() {
    this.modifySessionListState(sessionListState => {
      sessionListState.clear();
    });
  }

  insertWindow(sessionState: SessionState, index: number) { /* do nothing */ }

  moveWindowInList(sourceIndex: number, targetIndex: number) { /* do nothing */ }

  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) { /* do nothing */ }

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) { /* do nothing */ }

  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) { /* do nothing */ }

  setSessionTitle(index: number, title: string) { /* do nothing */ }

  setTabTitle(windowIndex: number, tabIndex: number, title: string) { /* do nothing */ }

  modifySessionListState(mutate: Mutator<SessionListState>) {
    console.log(getCurrentTimeStringWithMillis(), '- updating recently closed windows');
    const sessionListState = this.sessionStateUpdated.getValue().deepCopy();
    mutate(sessionListState);
    this.sessionStateUpdated.next(sessionListState);
    this.localStorageService.setRecentlyClosedSessionsState(sessionListState);
  }

  handleStorageReadError(error: Error) {
    const dialogData = ErrorDialogDataFactory.couldNotRetrieveClosedSessions(error, () =>
      this.localStorageService.setRecentlyClosedSessionsState(SessionListState.empty())
    );
    this.errorDialogService.showActionableError(dialogData);
  }
}
