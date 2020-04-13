import {SessionListState} from '../../app/types/session/session-list-state';
import {MessageReceiverService} from '../../app/services/messaging/message-receiver.service';
import {OAuth2Service} from '../../app/services/drive-api/o-auth-2.service';
import {GoogleApiService} from '../../app/services/drive-api/google-api.service';
import {DriveStorageService} from '../../app/services/drive-api/drive-storage.service';

export class DriveFileDataManager {

  // todo: manage concurrent requests

  private readonly SAVED_SESSIONS_FILE_NAME = 'saved-session-list-state-d9cb74be.json';

  private savedSessionsFileId;

  constructor(private oAuth2Service: OAuth2Service,
              private googleApiService: GoogleApiService,
              private driveStorageService: DriveStorageService,
              private messageReceiverService: MessageReceiverService) {
    this.driveStorageService.getLoginStatus().then(loginStatus => {
      if (loginStatus.isLoggedIn) {
        this.loadFileData();
      }
    });
    this.messageReceiverService.onLoadDriveFileDataRequest$.subscribe(() => {
      return this.loadFileData();
    });
    this.messageReceiverService.onUpdateDriveSavedSessionsRequest$.subscribe(request => {
      this.googleApiService.patchJSONFileContent(this.savedSessionsFileId, request.messageData).then(res => {
        request.sendResponse(res);
      });
    });
  }

  loadFileData(): Promise<void> {
    return this.requestSavedSessionsFileId().then(fileId => {
      this.savedSessionsFileId = fileId;
      return this.loadSavedSessions();
    });
  }

  private requestSavedSessionsFileId(): Promise<string> {
    return this.googleApiService.searchAppDataFiles(this.SAVED_SESSIONS_FILE_NAME).then(fileMetadata => {
      if (fileMetadata) {
        return fileMetadata.id;
      } else {
        return this.postEmptySessionListFile();
      }
    });
  }

  private postEmptySessionListFile(): Promise<string> {
    const sessionListState = SessionListState.empty();
    return this.googleApiService.postJSONAppDataFile(this.SAVED_SESSIONS_FILE_NAME, sessionListState).then(fileMetadata => {
      return fileMetadata.id;
    });
  }

  private loadSavedSessions(): Promise<void> {
    return this.googleApiService.requestJSONFileContent(this.savedSessionsFileId).then(sessionListStateData => {
      const sessionListState = SessionListState.fromSessionListState(sessionListStateData);
      this.driveStorageService.setSavedWindowsState(sessionListState, {writeThrough: false});
    });
  }
}
