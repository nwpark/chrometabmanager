import {SessionListState} from '../../../app/types/session/session-list-state';
import {GoogleApiService} from '../../../app/services/drive-api/google-api.service';
import {DriveAccountService} from '../../../app/services/drive-api/drive-account.service';
import {DriveFilePatchRequestHandler} from './drive-file-patch-request-handler';
import {FileMutex} from '../../types/file-mutex';

export class DriveFileContentRequestHandler {
  private pendingRequest: Promise<SessionListState>;

  constructor(private googleApiService: GoogleApiService,
              private driveAccountService: DriveAccountService,
              private patchRequestHandler: DriveFilePatchRequestHandler,
              private fileMutex: FileMutex) { }

  request(fileId: string): Promise<SessionListState> {
    if (this.patchRequestHandler.hasPendingRequest()) {
      return this.patchRequestHandler.getLatestValue();
    }
    if (this.fileMutex.isReadLocked()) {
      return this.pendingRequest;
    }
    return this.requestFileContent(fileId);
  }

  private requestFileContent(fileId): Promise<SessionListState> {
    return this.fileMutex.runExclusiveRead(() => {
      return this.driveAccountService.setSyncInProgress(true).then(() => {
        this.pendingRequest = this.googleApiService.requestJSONFileContent(fileId);
        return this.pendingRequest;
      }).finally(() => this.driveAccountService.setSyncInProgress(false));
    });
  }
}
