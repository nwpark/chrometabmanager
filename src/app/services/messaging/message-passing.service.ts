import {Injectable} from '@angular/core';
import {SessionState} from '../../types/session/session-state';
import {SessionListState} from '../../types/session/session-list-state';
import {WebpageTitleCache} from '../../types/webpage-title-cache';
import {DebouncedMessageSender, RespondableMessageSender, SimpleMessageSender} from './message-sender';
import {DriveLoginStatus} from '../../types/drive-login-status';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {Preferences} from '../../types/preferences';
import {OAuth2TokenState} from '../../types/o-auth2-token-state';

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
  static readonly DEVICE_ID_REQUEST = 'deviceIdRequest_7f5604d5';
  static readonly UPDATE_DRIVE_SAVED_SESSIONS_REQUEST = 'updateDriveSavedSessionsRequest_46c18270';
  static readonly LOAD_DRIVE_FILE_DATA_REQUEST = 'loadDriveFileDataRequest_31e2491f';
  static readonly AUTH_STATUS_MESSAGE = 'authStatus_41f2fc2d';
  static readonly OAUTH2_TOKEN_STATE_MESSAGE = 'oAuth2TokenStateUpdated_5ee4ac97';
  static readonly MESSAGE_DEBOUNCE_TIME = 400;

  private preferencesMessageSender = new SimpleMessageSender<Preferences>(MessagePassingService.PREFERENCES_UPDATED);
  private webpageTitleCacheMessageSender = new SimpleMessageSender<WebpageTitleCache>(MessagePassingService.WEBPAGE_TITLE_CACHE_UPDATED);
  private driveLoginStatusSender = new SimpleMessageSender<DriveLoginStatus>(MessagePassingService.DRIVE_LOGIN_STATUS_UPDATED);
  private activeSessionMessageSender = new DebouncedMessageSender(MessagePassingService.ACTIVE_SESSION_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private savedSessionMessageSender = new DebouncedMessageSender(MessagePassingService.SAVED_SESSION_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private savedSessionSyncMessageSender = new DebouncedMessageSender(MessagePassingService.SAVED_SESSION_SYNC_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private closedSessionMessageSender = new DebouncedMessageSender(MessagePassingService.CLOSED_SESSION_MESSAGE, MessagePassingService.MESSAGE_DEBOUNCE_TIME);
  private deviceIdRequestSender = new RespondableMessageSender<void, string>(MessagePassingService.DEVICE_ID_REQUEST);
  private updateDriveSavedSessionsRequestSender = new RespondableMessageSender<PatchRequestData, any>(MessagePassingService.UPDATE_DRIVE_SAVED_SESSIONS_REQUEST);
  private loadDriveFileDataRequestSender = new RespondableMessageSender<void, SessionListState>(MessagePassingService.LOAD_DRIVE_FILE_DATA_REQUEST);
  private insertChromeWindowRequestSender = new SimpleMessageSender<InsertWindowMessageData>(MessagePassingService.INSERT_WINDOW_REQUEST);
  private authStatusMessageSender = new SimpleMessageSender<boolean>(MessagePassingService.AUTH_STATUS_MESSAGE);
  private oAuth2TokenStateMessageSender = new SimpleMessageSender<OAuth2TokenState>(MessagePassingService.OAUTH2_TOKEN_STATE_MESSAGE);

  constructor() {}

  broadcastActiveSessions(sessionListState: SessionListState) {
    this.activeSessionMessageSender.broadcast(sessionListState);
  }

  broadcastSavedSessions(sessionListState: SessionListState) {
    console.log(getCurrentTimeStringWithMillis(), '- updating local saved windows');
    this.savedSessionMessageSender.broadcast(sessionListState);
  }

  broadcastSavedSessionsSync(sessionListState: SessionListState) {
    console.log(getCurrentTimeStringWithMillis(), '- updating sync saved windows');
    this.savedSessionSyncMessageSender.broadcast(sessionListState);
  }

  broadcastClosedSessions(sessionListState: SessionListState) {
    this.closedSessionMessageSender.broadcast(sessionListState);
  }

  broadcastPreferencesUpdated(preferences: Preferences) {
    this.preferencesMessageSender.broadcast(preferences);
  }

  broadcastWebpageTitleCache(webpageTitleCache: WebpageTitleCache) {
    this.webpageTitleCacheMessageSender.broadcast(webpageTitleCache);
  }

  broadcastDriveLoginStatus(driveLoginStatus: DriveLoginStatus) {
    this.driveLoginStatusSender.broadcast(driveLoginStatus);
  }

  broadcastAuthStatus(authenticationStatus: boolean) {
    this.authStatusMessageSender.broadcast(authenticationStatus);
  }

  broadcastOAuth2TokenState(oAuth2TokenState: OAuth2TokenState) {
    this.oAuth2TokenStateMessageSender.broadcast(oAuth2TokenState);
  }

  requestInsertChromeWindow(sessionState: SessionState, index: number) {
    const message: InsertWindowMessageData = { sessionState, index };
    this.insertChromeWindowRequestSender.broadcast(message);
  }

  requestDeviceId(): Promise<string> {
    return this.deviceIdRequestSender.sendRequest();
  }

  requestUpdateDriveSavedSessions(requestData: PatchRequestData): Promise<any> {
    return this.updateDriveSavedSessionsRequestSender.sendRequest(requestData);
  }

  requestLoadDriveFileData(): Promise<SessionListState> {
    return this.loadDriveFileDataRequestSender.sendRequest().then(sessionListStateData => {
      return SessionListState.fromSessionListState(sessionListStateData);
    });
  }
}

export interface InsertWindowMessageData {
  sessionState: SessionState;
  index: number;
}

export interface PatchRequestData {
  sessionListState: SessionListState;
  previousValueChecksum: string;
}
