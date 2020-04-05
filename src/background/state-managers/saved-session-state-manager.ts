import {DriveApiFileService} from '../services/drive-api-file-service';
import {LocalStorageService} from '../../app/services/storage/local-storage.service';
import {DriveApiAccountService} from '../services/drive-api-account-service';
import {SessionListState} from '../../app/types/session/session-list-state';

export class SavedSessionStateManager {

  private readonly DRIVE_API_FILE_NAME = 'saved-session-list-state-d9cb84be.json';

  private sessionListState: SessionListState;
  private fileId;

  constructor(private localStorageService: LocalStorageService,
              private driveApiAccountService: DriveApiAccountService,
              private driveApiFileService: DriveApiFileService) {
    this.driveApiAccountService.initialLoginSuccess.then(loginSuccess => {
      if (loginSuccess) {
        this.initializeState();
      }
    });
  }

  initializeState(): Promise<void> {
    return this.fetchFileId().then(fileId => {
      this.fileId = fileId;
      return this.refreshSessionListStateFromDrive();
    });
  }

  private fetchFileId(): Promise<string> {
    return this.driveApiFileService.searchAppDataFiles(this.DRIVE_API_FILE_NAME).then(fileMetadata => {
      if (fileMetadata) {
        return this.fileId = fileMetadata.id;
      } else {
        return this.createEmptyDriveFile();
      }
    });
  }

  private createEmptyDriveFile(): Promise<string> {
    return this.driveApiFileService.createJSONAppDataFile(this.DRIVE_API_FILE_NAME, SessionListState.empty()).then(fileMetadata => {
      return fileMetadata.id;
    });
  }

  private refreshSessionListStateFromDrive(): Promise<void> {
    return this.driveApiFileService.getJSONFileContent(this.fileId).then(sessionListState => {
      this.sessionListState = sessionListState;
    });
  }
}
