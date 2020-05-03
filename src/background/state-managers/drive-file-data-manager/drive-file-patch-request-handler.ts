import {SessionListState} from '../../../app/types/session/session-list-state';
import {GoogleApiService} from '../../../app/services/drive-api/google-api.service';
import {SyncStorageService} from '../../../app/services/storage/sync-storage.service';
import {ErrorCode} from '../../../app/types/errors/error-code';
import {FileMutex} from '../../types/file-mutex';
import {FutureTask} from '../../types/future-task';

export class DriveFilePatchRequestHandler {
  private requestQueue: FutureTask<any>[] = [];
  private latestValue: SessionListState = undefined;

  constructor(private googleApiService: GoogleApiService,
              private syncStorageService: SyncStorageService,
              private fileMutex: FileMutex) {}

  patch(fileId: string, sessionListState: SessionListState): Promise<any> {
    if (this.fileMutex.isReadLocked()) {
      return Promise.reject(ErrorCode.AttemptedPatchDuringSync);
    }
    this.latestValue = sessionListState;
    const patchRequestTask = this.createPatchRequestTask(fileId, sessionListState);
    this.enqueuePatchRequest(patchRequestTask);
    return patchRequestTask.toPromise();
  }

  private createPatchRequestTask(fileId: string, sessionListState: SessionListState): FutureTask<any> {
    return new FutureTask<any>(() => {
      return this.googleApiService.patchJSONFileContent(fileId, sessionListState).finally(() => {
        this.syncStorageService.notifyOtherDevices();
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
        this.requestQueue.shift().cancel('Request is obsolete.');
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
