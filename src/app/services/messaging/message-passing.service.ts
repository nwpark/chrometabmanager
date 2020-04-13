import {Injectable} from '@angular/core';
import {SessionState} from '../../types/session/session-state';
import {SessionListState} from '../../types/session/session-list-state';
import {WebpageTitleCache} from '../../types/webpage-title-cache';
import {DebouncedMessageSender, RespondableMessageSender, SimpleMessageSender} from './message-sender';
import {DriveLoginStatus} from '../../types/drive-login-status';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  static readonly ACTIVE_SESSION_MESSAGE = 'activeWindowsUpdated_71f38bbe';
  static readonly SAVED_SESSION_MESSAGE = 'savedWindowsUpdated_0656e252';
  static readonly SAVED_SESSION_SYNC_MESSAGE = 'savedWindowsSyncUpdated_392ee83d';
  static readonly CLOSED_SESSION_MESSAGE = 'closedSessionsUpdated_7d763bba';
  static readonly PREFERENCES_UPDATED = 'preferencesUpdated_8c6d0f54';
  static readonly WEBPAGE_TITLE_CACHE_UPDATED = 'webpageTitleCacheUpdated_b79e54ea';
  static readonly DRIVE_LOGIN_STATUS_UPDATED = 'driveLoginStatusUpdated_6e910629';
  static readonly INSERT_WINDOW_REQUEST = 'insertWindowRequest_de10f744';
  static readonly INSTANCE_ID_REQUEST = 'instanceIdRequest_7f5604d5';
  static readonly UPDATE_DRIVE_SAVED_SESSIONS_REQUEST = 'updateDriveSavedSessionsRequest_46c18270';
  static readonly LOAD_DRIVE_FILE_DATA_REQUEST = 'loadDriveFileDataRequest_31e2491f';
  static readonly MESSAGE_DEBOUNCE_TIME = 400;

  private preferencesMessageSender = new SimpleMessageSender<void>(MessagePassingService.PREFERENCES_UPDATED);
  private webpageTitleCacheMessageSender = new SimpleMessageSender<WebpageTitleCache>(MessagePassingService.WEBPAGE_TITLE_CACHE_UPDATED);
  private driveLoginStatusSender = new SimpleMessageSender<DriveLoginStatus>(MessagePassingService.DRIVE_LOGIN_STATUS_UPDATED);
  private activeSessionMessageSender = new DebouncedMessageSender(MessagePassingService.ACTIVE_SESSION_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private savedSessionMessageSender = new DebouncedMessageSender(MessagePassingService.SAVED_SESSION_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private savedSessionSyncMessageSender = new DebouncedMessageSender(MessagePassingService.SAVED_SESSION_SYNC_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private closedSessionMessageSender = new DebouncedMessageSender(MessagePassingService.CLOSED_SESSION_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private instanceIdRequestSender = new RespondableMessageSender<void, string>(MessagePassingService.INSTANCE_ID_REQUEST);
  private updateDriveSavedSessionsRequestSender = new RespondableMessageSender<SessionListState, any>(MessagePassingService.UPDATE_DRIVE_SAVED_SESSIONS_REQUEST);
  private loadDriveFileDataRequestSender = new RespondableMessageSender<void, void>(MessagePassingService.LOAD_DRIVE_FILE_DATA_REQUEST);
  private insertChromeWindowRequestSender = new SimpleMessageSender<InsertWindowMessageData>(MessagePassingService.INSERT_WINDOW_REQUEST);

  constructor() {}

  broadcastActiveSessions(sessionListState: SessionListState) {
    this.activeSessionMessageSender.broadcast(sessionListState);
  }

  broadcastSavedSessions(sessionListState: SessionListState) {
    this.savedSessionMessageSender.broadcast(sessionListState);
  }

  broadcastSavedSessionsSync(sessionListState: SessionListState) {
    this.savedSessionSyncMessageSender.broadcast(sessionListState);
  }

  broadcastClosedSessions(sessionListState: SessionListState) {
    this.closedSessionMessageSender.broadcast(sessionListState);
  }

  broadcastPreferencesUpdated() {
    this.preferencesMessageSender.broadcast();
  }

  broadcastWebpageTitleCache(webpageTitleCache: WebpageTitleCache) {
    this.webpageTitleCacheMessageSender.broadcast(webpageTitleCache);
  }

  broadcastDriveLoginStatus(driveLoginStatus: DriveLoginStatus) {
    this.driveLoginStatusSender.broadcast(driveLoginStatus);
  }

  requestInsertChromeWindow(sessionState: SessionState, index: number) {
    const message: InsertWindowMessageData = { sessionState, index };
    this.insertChromeWindowRequestSender.broadcast(message);
  }

  requestInstanceId(): Promise<string> {
    return this.instanceIdRequestSender.sendRequest();
  }

  requestUpdateDriveSavedSessions(sessionListState: SessionListState): Promise<any> {
    return this.updateDriveSavedSessionsRequestSender.sendRequest(sessionListState);
  }

  requestLoadDriveFileData(): Promise<void> {
    return this.loadDriveFileDataRequestSender.sendRequest();
  }
}

export interface InsertWindowMessageData {
  sessionState: SessionState;
  index: number;
}
