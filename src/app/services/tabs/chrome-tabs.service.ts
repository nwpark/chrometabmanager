import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {modifiesState, StateModifierParams} from '../../decorators/modifies-state';
import {TabsService} from './tabs-service';
import {MessagePassingService} from '../messaging/message-passing.service';
import {SessionListState} from '../../types/session/session-list-state';
import {SessionStateUtils, WindowStateUtils} from '../../utils/session-utils';
import {LocalStorageService} from '../storage/local-storage.service';
import {SessionId} from '../../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../../types/session/session-state';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {ErrorDialogService} from '../error-dialog.service';
import {ErrorDialogDataFactory} from '../../utils/error-dialog-data-factory';
import MoveProperties = chrome.tabs.MoveProperties;
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  sessionListState: SessionListState;

  private sessionStateUpdated: BehaviorSubject<SessionListState>;
  public sessionStateUpdated$: Observable<SessionListState>;

  constructor(private localStorageService: LocalStorageService,
              private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService,
              private errorDialogService: ErrorDialogService,
              private ngZone: NgZone) {
    this.sessionStateUpdated = new BehaviorSubject(SessionListState.empty());
    this.sessionStateUpdated$ = this.sessionStateUpdated.asObservable();
    this.sessionListState = this.sessionStateUpdated.getValue();
    this.localStorageService.getActiveWindowsState().then(sessionListState => {
      this.setSessionListState(sessionListState);
    }, error => this.handleStorageReadError(error));
    this.messageReceiverService.activeSessionStateUpdated$.subscribe(sessionListState => {
      if (!sessionListState.equals(this.sessionListState)) {
        ngZone.run(() => this.setSessionListState(sessionListState));
      }
    });
  }

  private setSessionListState(sessionListState: SessionListState) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing active windows');
    this.sessionListState = sessionListState;
    this.sessionStateUpdated.next(this.sessionListState);
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  @modifiesState({storeResult: false})
  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    const tabId = this.sessionListState.getTabIdFromWindow(windowIndex, sourceTabIndex) as number;
    const moveProperties: MoveProperties = {index: targetTabIndex};
    this.sessionListState.moveTabInWindow(windowIndex, sourceTabIndex, targetTabIndex);
    chrome.tabs.move(tabId, moveProperties);
  }

  @modifiesState({storeResult: false})
  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    const tabId = this.sessionListState.getTabIdFromWindow(sourceWindowIndex, sourceTabIndex) as number;
    const windowId = this.sessionListState.getSessionIdFromIndex(targetWindowIndex) as number;
    const moveProperties: MoveProperties = {windowId, index: targetTabIndex};
    this.sessionListState.transferTab(sourceWindowIndex, targetWindowIndex, sourceTabIndex, targetTabIndex);
    chrome.tabs.move(tabId, moveProperties);
  }

  @modifiesState({storeResult: false})
  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) {
    const windowId = this.sessionListState.getSessionIdFromIndex(windowIndex) as number;
    const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
    this.sessionListState.insertTabInWindow(windowIndex, tabIndex, activeTab);
    chrome.tabs.create({windowId, index: tabIndex, url: chromeTab.url, active: false});
  }

  openUrlInNewTab(url: string) {
    chrome.tabs.create({url, active: false});
  }

  updateCurrentTabUrl(url: string) {
    chrome.tabs.getCurrent(currentTab => {
      chrome.tabs.update(currentTab.id, {url});
    });
  }

  @modifiesState({storeResult: false})
  removeTab(windowIndex: number, tabId: SessionId) {
    this.sessionListState.removeTab(windowIndex, tabId);
    chrome.tabs.remove(tabId as number);
  }

  @modifiesState({storeResult: true})
  removeSession(index: number) {
    this.sessionListState.markWindowAsDeleted(index);
    const windowId = this.sessionListState.getSessionIdFromIndex(index) as number;
    chrome.windows.remove(windowId);
  }

  @modifiesState({storeResult: true})
  toggleSessionListDisplay() {
    this.sessionListState.toggleDisplay();
  }

  @modifiesState({storeResult: true})
  toggleSessionDisplay(index: number) {
    this.sessionListState.toggleSessionDisplay(index);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    chrome.tabs.getCurrent(currentTab => {
      if (chromeTab.id !== currentTab.id) {
        chrome.tabs.update(chromeTab.id as number, {active: true});
        chrome.windows.update(chromeTab.windowId as number, {focused: true});
        chrome.tabs.remove(currentTab.id);
      }
    });
  }

  @modifiesState({storeResult: true})
  setSessionTitle(index: number, title: string) {
    this.sessionListState.setSessionTitle(index, title);
  }

  @modifiesState({storeResult: false})
  insertWindow(sessionState: SessionState, index: number) {
    const tempSession = SessionStateUtils.convertToActiveWindow(sessionState);
    this.sessionListState.insertSession(tempSession, index);
    this.messagePassingService.requestInsertChromeWindow(sessionState, index);
  }

  @modifiesState({storeResult: true})
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.sessionListState.moveSessionInList(sourceIndex, targetIndex);
  }

  @modifiesState({storeResult: false})
  sortTabsInWindow(sessionIndex: number) {
    this.sessionListState.sortTabsInWindow(sessionIndex).forEach((chromeTab, tabIndex) => {
      const moveProperties: MoveProperties = {index: tabIndex};
      chrome.tabs.move(chromeTab.id as number, moveProperties);
    });
  }

  suspendTabsInWindow(sessionIndex: number) {
    this.sessionListState.getSessionAtIndex(sessionIndex).window.tabs.forEach(chromeTab => {
      if (!chromeTab.active && !chromeTab.discarded) {
        chrome.tabs.discard(chromeTab.id as number);
      }
    });
  }

  setTabTitle(windowIndex: number, tabIndex: number, title: string) { /* do nothing */ }

  onStateModified(params?: StateModifierParams) {
    console.log(getCurrentTimeStringWithMillis(), '- updating active windows');
    this.sessionStateUpdated.next(this.sessionListState);
    if (params.storeResult) {
      this.localStorageService.setActiveWindowsState(this.sessionListState);
    }
  }

  handleStorageReadError(error: Error) {
    const dialogData = ErrorDialogDataFactory.couldNotRetrieveActiveSessions(error, () =>
      this.localStorageService.setActiveWindowsState(SessionListState.empty())
    );
    this.errorDialogService.showActionableError(dialogData);
  }
}
