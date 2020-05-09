import {SessionListState} from '../../../app/types/session/session-list-state';
import {GoogleApiService} from '../../../app/services/drive-api/google-api.service';
import {SyncStorageService} from '../../../app/services/storage/sync-storage.service';
import {ErrorCode} from '../../../app/types/errors/error-code';
import {FileMutex} from '../../types/file-mutex';
import {FutureTask} from '../../types/future-task';
import {isRuntimeError, createRuntimeError} from '../../../app/types/errors/runtime-error';
import {DriveAccountService} from '../../../app/services/drive-api/drive-account.service';

export class DriveFilePatchRequestHandler {
  private requestQueue: FutureTask<any>[] = [];
  private latestValue: SessionListState = undefined;

  constructor(private googleApiService: GoogleApiService,
              private syncStorageService: SyncStorageService,
              private driveAccountService: DriveAccountService,
              private fileMutex: FileMutex) {}

  patch(fileId: string, sessionListState: SessionListState): Promise<any> {
    if (this.fileMutex.isReadLocked()) {
      return Promise.reject(createRuntimeError(ErrorCode.AttemptedPatchDuringSync));
    }
    this.latestValue = sessionListState;
    const patchRequestTask = this.createPatchRequestTask(fileId, sessionListState);
    this.enqueuePatchRequest(patchRequestTask);
    return patchRequestTask.toPromise().catch(error => {
      if (isRuntimeError(error) && error.errorCode === ErrorCode.RequestIsObsolete) {
        return Promise.resolve('Request was skipped.');
      } else {
        return Promise.reject(error);
      }
    });
  }

  private createPatchRequestTask(fileId: string, sessionListState: SessionListState): FutureTask<any> {
    return new FutureTask<any>(() => {
      return this.driveAccountService.setSyncInProgress(true).then(() => {
        return this.googleApiService.patchJSONFileContent(fileId, sessionListState);
      }).finally(() => {
        this.syncStorageService.notifyOtherDevices();
        return this.driveAccountService.setSyncInProgress(false);
      });
    });
  }

  private enqueuePatchRequest(patchRequestTask: FutureTask<any>) {
    this.requestQueue.push(patchRequestTask);
    this.processQueuedRequests();
  }

  private processQueuedRequests() {
    this.fileMutex.runExclusiveWrite(() => {
      while (this.requestQueue.length > 1) {
        this.requestQueue.shift().cancel(ErrorCode.RequestIsObsolete);
      }
      if (this.requestQueue.length !== 0) {
        return this.requestQueue.shift().run();
      }
    });
  }

  hasPendingRequest(): boolean {
    return this.fileMutex.isWriteLocked();
  }

  getLatestValue(): Promise<SessionListState> {
    return Promise.resolve(this.latestValue);
  }
}
