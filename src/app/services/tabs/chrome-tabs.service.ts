import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {StateModifierParams} from '../../decorators/modifies-state';
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
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {Mutator} from '../../types/mutator';
import MoveProperties = chrome.tabs.MoveProperties;

@Injectable({
  providedIn: 'root'
})
export class ChromeTabsService implements TabsService {

  private sessionStateUpdated: BehaviorSubject<SessionListState>;
  public sessionStateUpdated$: Observable<SessionListState>;

  constructor(private localStorageService: LocalStorageService,
              private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService,
              private errorDialogService: ErrorDialogService,
              private ngZone: NgZone) {
    this.sessionStateUpdated = new BehaviorSubject(SessionListState.empty());
    this.sessionStateUpdated$ = this.sessionStateUpdated.asObservable();
    this.localStorageService.getActiveWindowsState().then(sessionListState => {
      this.setSessionListState(sessionListState);
    }, error => this.handleStorageReadError(error));
    this.messageReceiverService.activeSessionStateUpdated$.subscribe(sessionListState => {
      if (!sessionListState.equals(this.getSessionListState())) {
        ngZone.run(() => this.setSessionListState(sessionListState));
      }
    });
  }

  private setSessionListState(sessionListState: SessionListState) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing active windows');
    this.sessionStateUpdated.next(sessionListState);
  }

  getSessionListState(): SessionListState {
    return this.sessionStateUpdated.getValue();
  }

  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    this.modifySessionListState(sessionListState => {
      const tabId = sessionListState.getTabIdFromWindow(windowIndex, sourceTabIndex) as number;
      const moveProperties: MoveProperties = {index: targetTabIndex};
      sessionListState.moveTabInWindow(windowIndex, sourceTabIndex, targetTabIndex);
      chrome.tabs.move(tabId, moveProperties);
    }, {storeResult: false});
  }

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    this.modifySessionListState(sessionListState => {
      const tabId = sessionListState.getTabIdFromWindow(sourceWindowIndex, sourceTabIndex) as number;
      const windowId = sessionListState.getSessionIdFromIndex(targetWindowIndex) as number;
      const moveProperties: MoveProperties = {windowId, index: targetTabIndex};
      sessionListState.transferTab(sourceWindowIndex, targetWindowIndex, sourceTabIndex, targetTabIndex);
      chrome.tabs.move(tabId, moveProperties);
    }, {storeResult: false});
  }

  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) {
    this.modifySessionListState(sessionListState => {
      const windowId = sessionListState.getSessionIdFromIndex(windowIndex) as number;
      const activeTab = WindowStateUtils.convertToActiveTab(chromeTab);
      sessionListState.insertTabInWindow(windowIndex, tabIndex, activeTab);
      chrome.tabs.create({windowId, index: tabIndex, url: chromeTab.url, active: false});
    }, {storeResult: false});
  }

  openUrlInNewTab(url: string) {
    chrome.tabs.create({url, active: false});
  }

  updateCurrentTabUrl(url: string) {
    chrome.tabs.getCurrent(currentTab => {
      chrome.tabs.update(currentTab.id, {url});
    });
  }

  removeTab(windowIndex: number, tabId: SessionId) {
    this.modifySessionListState(sessionListState => {
      sessionListState.removeTab(windowIndex, tabId);
      chrome.tabs.remove(tabId as number);
    }, {storeResult: false});
  }

  removeSession(index: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.markWindowAsDeleted(index);
      const windowId = sessionListState.getSessionIdFromIndex(index) as number;
      chrome.windows.remove(windowId);
    }, {storeResult: true});
  }

  toggleSessionListDisplay() {
    this.modifySessionListState(sessionListState => {
      sessionListState.toggleDisplay();
    }, {storeResult: true});
  }

  toggleSessionDisplay(index: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.toggleSessionDisplay(index);
    }, {storeResult: true});
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

  setSessionTitle(index: number, title: string) {
    this.modifySessionListState(sessionListState => {
      sessionListState.setSessionTitle(index, title);
    }, {storeResult: true});
  }

  insertWindow(sessionState: SessionState, index: number) {
    this.modifySessionListState(sessionListState => {
      const tempSession = SessionStateUtils.convertToActiveWindow(sessionState);
      sessionListState.insertSession(tempSession, index);
      this.messagePassingService.requestInsertChromeWindow(sessionState, index);
    }, {storeResult: false});
  }

  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.moveSessionInList(sourceIndex, targetIndex);
    }, {storeResult: true});
  }

  sortTabsInWindow(sessionIndex: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.sortTabsInWindow(sessionIndex).forEach((chromeTab, tabIndex) => {
        const moveProperties: MoveProperties = {index: tabIndex};
        chrome.tabs.move(chromeTab.id as number, moveProperties);
      });
    }, {storeResult: false});
  }

  suspendTabsInWindow(sessionIndex: number) {
    this.getSessionListState().getSessionAtIndex(sessionIndex).window.tabs.forEach(chromeTab => {
      if (!chromeTab.active && !chromeTab.discarded) {
        chrome.tabs.discard(chromeTab.id as number);
      }
    });
  }

  setTabTitle(windowIndex: number, tabIndex: number, title: string) { /* do nothing */ }

  modifySessionListState(mutate: Mutator<SessionListState>, params: StateModifierParams) {
    console.log(getCurrentTimeStringWithMillis(), '- updating active windows');
    const sessionListState = this.sessionStateUpdated.getValue().deepCopy();
    mutate(sessionListState);
    this.sessionStateUpdated.next(sessionListState);
    if (params.storeResult) {
      this.localStorageService.setActiveWindowsState(sessionListState);
    }
  }

  handleStorageReadError(error: Error) {
    const dialogData = ErrorDialogDataFactory.couldNotRetrieveActiveSessions(error, () =>
      this.localStorageService.setActiveWindowsState(SessionListState.empty())
    );
    this.errorDialogService.showActionableError(dialogData);
  }
}
