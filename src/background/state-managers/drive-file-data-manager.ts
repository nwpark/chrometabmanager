import {SessionListState} from '../../app/types/session/session-list-state';
import {MessageReceiverService} from '../../app/services/messaging/message-receiver.service';
import {GoogleApiService} from '../../app/services/drive-api/google-api.service';
import {DriveAccountService} from '../../app/services/drive-api/drive-account.service';
import {SyncStorageService} from '../../app/services/storage/sync-storage.service';
import {OAuth2Service} from '../../app/services/oauth2/o-auth-2.service';
import {DriveFileContentRequestHandler} from './drive-file-data-manager/drive-file-content-request-handler';
import {DriveFilePatchRequestHandler} from './drive-file-data-manager/drive-file-patch-request-handler';
import {FileMutex} from '../types/file-mutex';
import {PatchRequestData} from '../../app/services/messaging/message-passing.service';

export class DriveFileDataManager {

  private readonly SAVED_SESSIONS_FILE_NAME = 'saved-session-list-state-d9cb74be.json';

  private readonly filePatchRequestHandler: DriveFilePatchRequestHandler;
  private readonly fileContentRequestHandler: DriveFileContentRequestHandler;

  constructor(private googleApiService: GoogleApiService,
              private oAuth2Service: OAuth2Service,
              private driveAccountService: DriveAccountService,
              private messageReceiverService: MessageReceiverService,
              private syncStorageService: SyncStorageService) {
    const fileMutex = new FileMutex();
    this.filePatchRequestHandler = new DriveFilePatchRequestHandler(googleApiService, syncStorageService, driveAccountService, fileMutex);
    this.fileContentRequestHandler = new DriveFileContentRequestHandler(googleApiService, driveAccountService, this.filePatchRequestHandler, fileMutex);
    this.messageReceiverService.onLoadDriveFileDataRequest$.subscribe(request => {
      request.sendResponse(this.loadFileData());
    });
    this.messageReceiverService.onUpdateDriveSavedSessionsRequest$.subscribe(request => {
      request.sendResponse(this.patchSessionListStateFile(request.messageData));
    });
  }

  private loadFileData(): Promise<SessionListState> {
    return this.requestSavedSessionsFileId().then(fileId => {
      return this.fileContentRequestHandler.request(fileId);
    });
  }

  private patchSessionListStateFile(requestData: PatchRequestData): Promise<any> {
    return this.requestSavedSessionsFileId().then(fileId => {
      return this.filePatchRequestHandler.patch(fileId, requestData);
    });
  }

  private requestSavedSessionsFileId(): Promise<string> {
    return this.driveAccountService.getSavedSessionsFileId().then(cachedFileId => {
      if (cachedFileId) {
        return cachedFileId;
      }
      return this.requestSavedSessionsFileIdFallback().then(fileId => {
        this.driveAccountService.setSavedSessionsFileId(fileId);
        return fileId;
      });
    });
  }

  private requestSavedSessionsFileIdFallback(): Promise<string> {
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
