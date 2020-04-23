import {SessionListState} from '../../app/types/session/session-list-state';
import {MessageReceiverService} from '../../app/services/messaging/message-receiver.service';
import {GoogleApiService} from '../../app/services/drive-api/google-api.service';
import {DriveStorageService} from '../../app/services/drive-api/drive-storage.service';
import {DriveAccountService} from '../../app/services/drive-api/drive-account.service';
import {fetchesSynchronizedData} from '../../app/decorators/fetches-synchronized-data';
import {patchesSynchronizedData} from '../../app/decorators/patches-synchronized-data';

export class DriveFileDataManager {

  private readonly SAVED_SESSIONS_FILE_NAME = 'saved-session-list-state-d9cb74be.json';

  private savedSessionsFileId;
  private requestsInFlight = 0;

  constructor(private googleApiService: GoogleApiService,
              private driveStorageService: DriveStorageService,
              private driveAccountService: DriveAccountService,
              private messageReceiverService: MessageReceiverService) {
    this.driveStorageService.getLoginStatus().then(loginStatus => {
      if (loginStatus.isLoggedIn) {
        this.loadFileData();
      }
    });
    this.messageReceiverService.onLoadDriveFileDataRequest$.subscribe(request => {
      request.sendResponse(this.loadFileData());
    });
    this.messageReceiverService.onUpdateDriveSavedSessionsRequest$.subscribe(request => {
      request.sendResponse(this.patchSessionListStateFile(request.messageData));
    });
  }

  @fetchesSynchronizedData()
  private loadFileData(): Promise<SessionListState> {
    return this.requestSavedSessionsFileId().then(fileId => {
      this.savedSessionsFileId = fileId;
      return this.googleApiService.requestJSONFileContent(this.savedSessionsFileId);
    });
  }

  @patchesSynchronizedData()
  private patchSessionListStateFile(sessionListState: SessionListState): Promise<any> {
    return this.requestSavedSessionsFileId().then(fileId => {
      return this.googleApiService.patchJSONFileContent(fileId, sessionListState);
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
}
