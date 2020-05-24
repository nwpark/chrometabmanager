import {SessionListState} from '../../../app/types/session/session-list-state';
import {GoogleApiService} from '../../../app/services/drive-api/google-api.service';
import {SyncStorageService} from '../../../app/services/storage/sync-storage.service';
import {ErrorCode} from '../../../app/types/errors/error-code';
import {FileMutex} from '../../types/file-mutex';
import {createRuntimeError, handleRuntimeError} from '../../../app/types/errors/runtime-error';
import {DriveAccountService} from '../../../app/services/drive-api/drive-account.service';
import {PatchRequestData} from '../../../app/services/messaging/message-passing.service';
import {DriveFilePatchRequestDispatcher, PatchRequestTask} from './drive-file-patch-request-dispatcher';
import {isNullOrUndefined} from 'util';

export class DriveFilePatchRequestHandler {
  private requestDispatcher: DriveFilePatchRequestDispatcher;
  private inFlightValue: SessionListState;

  constructor(private googleApiService: GoogleApiService,
              private syncStorageService: SyncStorageService,
              private driveAccountService: DriveAccountService,
              private fileMutex: FileMutex) {
    this.requestDispatcher = new DriveFilePatchRequestDispatcher(googleApiService, syncStorageService, driveAccountService, fileMutex);
  }

  patch(fileId: string, requestData: PatchRequestData): Promise<any> {
    if (this.fileMutex.isReadLocked()) {
      return Promise.reject(createRuntimeError(ErrorCode.AttemptedPatchDuringSync));
    }
    const patchRequestTask = this.createPatchRequestTask(fileId, requestData);
    this.requestDispatcher.enqueuePatchRequest(fileId, patchRequestTask);
    return patchRequestTask.toPromise()
      .catch(handleRuntimeError(ErrorCode.PatchRequestIsObsolete, () => 'Request was skipped.'));
  }

  private createPatchRequestTask(fileId: string, requestData: PatchRequestData) {
    return new PatchRequestTask(requestData, () => {
      this.inFlightValue = requestData.sessionListState;
      return this.googleApiService.patchJSONFileContent(fileId, requestData.sessionListState).finally(() => {
        this.inFlightValue = undefined;
      });
    });
  }

  hasPendingRequest(): boolean {
    return !isNullOrUndefined(this.inFlightValue);
  }

  getLatestValue(): Promise<SessionListState> {
    return Promise.resolve(this.inFlightValue);
  }
}
