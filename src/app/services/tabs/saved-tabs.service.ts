import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {TabsService} from './tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from '../storage/storage.service';
import {SessionListState} from '../../types/session/session-list-state';
import {SessionListUtils} from '../../utils/session-list-utils';
import {SessionStateUtils, SessionUtils, WindowStateUtils} from '../../utils/session-utils';
import {ChromeAPISession} from '../../types/chrome-api/chrome-api-session';
import {ChromeAPIWindowState, SessionId} from '../../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../../types/session/session-state';
import {ErrorDialogService} from '../error-dialog.service';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {Mutator} from '../../types/mutator';
import {md5Checksum} from '../../utils/hash-utils';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService {

  sessionListState: SessionListState;

  private sessionStateUpdated: BehaviorSubject<SessionListState>;
  public sessionStateUpdated$: Observable<SessionListState>;

  constructor(private chromeTabsService: ChromeTabsService,
              private storageService: StorageService,
              private errorDialogService: ErrorDialogService,
              private ngZone: NgZone) {
    this.sessionStateUpdated = new BehaviorSubject(SessionListState.empty());
    this.sessionStateUpdated$ = this.sessionStateUpdated.asObservable();
    this.sessionListState = this.sessionStateUpdated.getValue();
    this.storageService.savedSessionListState$().subscribe(sessionListState => {
      if (!sessionListState.equals(this.sessionListState)) {
        ngZone.run(() => this.setSessionListState(sessionListState));
      }
    });
  }

  private setSessionListState(sessionListState: SessionListState) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing saved windows');
    this.sessionListState = sessionListState;
    this.sessionStateUpdated.next(this.sessionListState);
  }

  getSessionListState(): SessionListState {
    return this.sessionListState;
  }

  createNewWindow() {
    this.modifySessionListState(sessionListState => {
      const newWindow: ChromeAPIWindowState = {id: uuid(), tabs: [], type: 'normal'};
      const newSession: ChromeAPISession = SessionUtils.createSessionFromWindow(newWindow);
      const newWindowLayout = SessionListUtils.createBasicWindowLayoutState(newWindow.id);
      sessionListState.unshiftSession(newSession, newWindowLayout);
      sessionListState.setHidden(false);
    });
  }

  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.moveTabInWindow(windowIndex, sourceTabIndex, targetTabIndex);
    });
  }

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.transferTab(sourceWindowIndex, targetWindowIndex, sourceTabIndex, targetTabIndex);
    });
  }

  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState) {
    this.modifySessionListState(sessionListState => {
      const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
      sessionListState.insertTabInWindow(windowIndex, tabIndex, savedTab);
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

  toggleSessionListDisplay() {
    this.modifySessionListState(sessionListState => {
      sessionListState.toggleDisplay();
    });
  }

  toggleSessionDisplay(index: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.toggleSessionDisplay(index);
    });
  }

  setSessionTitle(index: number, title: string) {
    this.modifySessionListState(sessionListState => {
      sessionListState.setSessionTitle(index, title);
    });
  }

  setTabTitle(windowIndex: number, tabIndex: number, title: string) {
    this.modifySessionListState(sessionListState => {
      sessionListState.setTabTitle(windowIndex, tabIndex, title);
    });
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    if (openInNewTab) {
      this.chromeTabsService.openUrlInNewTab(chromeTab.url);
    } else {
      this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
    }
  }

  insertWindow(sessionState: SessionState, index: number) {
    this.modifySessionListState(sessionListState => {
      sessionState = SessionStateUtils.convertToSavedWindow(sessionState);
      sessionListState.insertSession(sessionState, index);
    });
  }

  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.moveSessionInList(sourceIndex, targetIndex);
    });
  }

  sortTabsInWindow(sessionIndex: number) {
    this.modifySessionListState(sessionListState => {
      sessionListState.sortTabsInWindow(sessionIndex);
    });
  }

  modifySessionListState(mutate: Mutator<SessionListState>) {
    const previousValueChecksum = md5Checksum(this.sessionListState);
    mutate(this.sessionListState);
    this.sessionStateUpdated.next(this.sessionListState);
    this.storageService.setSavedWindowsState(this.sessionListState, previousValueChecksum);
  }
}
