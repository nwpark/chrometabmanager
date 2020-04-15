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
    this.messageReceiverService.onLoadDriveFileDataRequest$.subscribe(request => {
      this.loadFileData()
        .then(request.sendResponse);
    });
    this.messageReceiverService.onUpdateDriveSavedSessionsRequest$.subscribe(request => {
      this.requestSavedSessionsFileId().then(fileId => {
        return this.googleApiService.patchJSONFileContent(fileId, request.messageData);
      }).then(request.sendResponse);
    });
  }

  loadFileData(): Promise<any> {
    return this.requestSavedSessionsFileId().then(fileId => {
      this.savedSessionsFileId = fileId;
      return this.loadSavedSessions();
    });
  }

  private requestSavedSessionsFileId(): Promise<string> {
    if (this.savedSessionsFileId) {
      return Promise.resolve(this.savedSessionsFileId);
    }
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

  private loadSavedSessions(): Promise<any> {
    return this.googleApiService.requestJSONFileContent(this.savedSessionsFileId).then(sessionListStateData => {
      const sessionListState = SessionListState.fromSessionListState(sessionListStateData);
      this.driveStorageService.setSavedWindowsState(sessionListState, {writeThrough: false});
    });
  }
}
