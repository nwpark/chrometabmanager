import {DriveApiFileService} from '../services/drive-api-file-service';
import {DriveApiAccountService} from '../services/drive-api-account-service';
import {SessionListState} from '../../app/types/session/session-list-state';
import {MessageReceiverService} from '../../app/services/messaging/message-receiver.service';
import {DriveStorageCacheService} from '../../app/services/storage/drive-storage-cache.service';

export class SavedSessionStateManager {

  private readonly DRIVE_API_FILE_NAME = 'saved-session-list-state-d9cb74be.json';

  private fileId;

  constructor(private driveStorageCacheService: DriveStorageCacheService,
              private messageReceiverService: MessageReceiverService,
              private driveApiAccountService: DriveApiAccountService,
              private driveApiFileService: DriveApiFileService) {
    this.driveApiAccountService.initialLoginSuccess.then(loginSuccess => {
      if (loginSuccess) {
        this.initializeState();
      }
    });
    this.messageReceiverService.onUpdateDriveSavedSessionsRequest$.subscribe(request => {
      this.driveApiFileService.patchJSONFileContent(this.fileId, request.messageData).then(res => {
        request.sendResponse(res);
      });
    });
  }

  initializeState(): Promise<void> {
    return this.requestFileId().then(fileId => {
      this.fileId = fileId;
      return this.refreshSessionListStateFromDrive();
    });
  }

  private requestFileId(): Promise<string> {
    return this.driveApiFileService.searchAppDataFiles(this.DRIVE_API_FILE_NAME).then(fileMetadata => {
      if (fileMetadata) {
        return fileMetadata.id;
      } else {
        return this.postEmptySessionListFile();
      }
    });
  }

  private postEmptySessionListFile(): Promise<string> {
    const sessionListState = SessionListState.empty();
    return this.driveApiFileService.postJSONAppDataFile(this.DRIVE_API_FILE_NAME, sessionListState).then(fileMetadata => {
      return fileMetadata.id;
    });
  }

  private refreshSessionListStateFromDrive(): Promise<void> {
    return this.driveApiFileService.requestJSONFileContent(this.fileId).then(sessionListStateData => {
      const sessionListState = SessionListState.fromSessionListState(sessionListStateData);
      this.driveStorageCacheService.setSavedWindowsState(sessionListState);
    });
  }
}
