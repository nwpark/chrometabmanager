import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {InsertWindowMessageData, MessagePassingService, PatchRequestData} from './message-passing.service';
import {WebpageTitleCache} from '../../types/webpage-title-cache';
import {MessageReceiver, RespondableMessageReceiver, SessionListMessageReceiver, SimpleMessageReceiver} from './message-receiver';
import {MessageData} from './message-sender';
import {DriveLoginStatus} from '../../types/drive-login-status';
import {Preferences} from '../../types/preferences';
import {OAuth2TokenState} from '../../types/o-auth2-token-state';

@Injectable({
  providedIn: 'root'
})
export class MessageReceiverService {

  private savedSessionStateUpdated = new SessionListMessageReceiver();
  private savedSessionStateSyncUpdated = new SessionListMessageReceiver();
  private activeSessionStateUpdated = new SessionListMessageReceiver();
  private closedSessionStateUpdated = new SessionListMessageReceiver();
  private preferencesUpdated = new SimpleMessageReceiver<Preferences>();
  private webpageTitleCacheUpdated = new SimpleMessageReceiver<WebpageTitleCache>();
  private driveLoginStatusUpdated = new SimpleMessageReceiver<DriveLoginStatus>();
  private onDeviceIdRequest = new RespondableMessageReceiver<void, string>();
  private onUpdateDriveSavedSessionsRequest = new RespondableMessageReceiver<PatchRequestData, any>();
  private onLoadDriveFileDataRequest = new RespondableMessageReceiver<void, SessionListState>();
  private onInsertChromeWindowRequest = new SimpleMessageReceiver<InsertWindowMessageData>();
  private authStatusUpdated = new SimpleMessageReceiver<boolean>();
  private oAuth2TokenStateUpdated = new SimpleMessageReceiver<OAuth2TokenState>();

  savedSessionStateUpdated$ = this.savedSessionStateUpdated.asObservable();
  savedSessionStateSyncUpdated$ = this.savedSessionStateSyncUpdated.asObservable();
  activeSessionStateUpdated$ = this.activeSessionStateUpdated.asObservable();
  closedSessionStateUpdated$ = this.closedSessionStateUpdated.asObservable();
  preferencesUpdated$ = this.preferencesUpdated.asObservable();
  webpageTitleCacheUpdated$ = this.webpageTitleCacheUpdated.asObservable();
  driveLoginStatusUpdated$ = this.driveLoginStatusUpdated.asObservable();
  onDeviceIdRequest$ = this.onDeviceIdRequest.asObservable();
  onUpdateDriveSavedSessionsRequest$ = this.onUpdateDriveSavedSessionsRequest.asObservable();
  onLoadDriveFileDataRequest$ = this.onLoadDriveFileDataRequest.asObservable();
  onInsertChromeWindowRequest$ = this.onInsertChromeWindowRequest.asObservable();
  authStatusUpdated$ = this.authStatusUpdated.asObservable();
  oAuth2TokenStateUpdated$ = this.oAuth2TokenStateUpdated.asObservable();

  constructor() {
    chrome.runtime.onMessage.addListener((message: MessageData<any>, sender, sendResponse) => {
      const messageReceiver = this.getMessageReceiver(message.messageId);
      if (messageReceiver) {
        messageReceiver.next(message.data, sendResponse);
        return messageReceiver.mightSendResponse;
      }
    });
  }

  private getMessageReceiver(messageId: string): MessageReceiver<any, any, any> {
    switch (messageId) {
      case MessagePassingService.ACTIVE_SESSION_MESSAGE:
        return this.activeSessionStateUpdated;
      case MessagePassingService.SAVED_SESSION_MESSAGE:
        return this.savedSessionStateUpdated;
      case MessagePassingService.SAVED_SESSION_SYNC_MESSAGE:
        return this.savedSessionStateSyncUpdated;
      case MessagePassingService.CLOSED_SESSION_MESSAGE:
        return this.closedSessionStateUpdated;
      case MessagePassingService.PREFERENCES_UPDATED:
        return this.preferencesUpdated;
      case MessagePassingService.WEBPAGE_TITLE_CACHE_UPDATED:
        return this.webpageTitleCacheUpdated;
      case MessagePassingService.DEVICE_ID_REQUEST:
        return this.onDeviceIdRequest;
      case MessagePassingService.UPDATE_DRIVE_SAVED_SESSIONS_REQUEST:
        return this.onUpdateDriveSavedSessionsRequest;
      case MessagePassingService.INSERT_WINDOW_REQUEST:
        return this.onInsertChromeWindowRequest;
      case MessagePassingService.DRIVE_LOGIN_STATUS_UPDATED:
        return this.driveLoginStatusUpdated;
      case MessagePassingService.LOAD_DRIVE_FILE_DATA_REQUEST:
        return this.onLoadDriveFileDataRequest;
      case MessagePassingService.AUTH_STATUS_MESSAGE:
        return this.authStatusUpdated;
      case MessagePassingService.OAUTH2_TOKEN_STATE_MESSAGE:
        return this.oAuth2TokenStateUpdated;
    }
  }
}

