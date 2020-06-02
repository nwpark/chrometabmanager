import {GoogleApiService} from '../../../app/services/drive-api/google-api.service';
import {SyncStorageService} from '../../../app/services/storage/sync-storage.service';
import {DriveAccountService} from '../../../app/services/drive-api/drive-account.service';
import {PatchRequestData} from '../../../app/services/messaging/message-passing.service';
import {createRuntimeError, handleRuntimeError} from '../../../app/types/errors/runtime-error';
import {ErrorCode} from '../../../app/types/errors/error-code';
import {md5Checksum} from '../../../app/utils/hash-utils';
import {FutureTask} from '../../types/future-task';
import {ignoreErrors} from '../../../app/utils/error-utils';
import {FileMutex} from '../../types/file-mutex';

export class DriveFilePatchRequestDispatcher {
  private requestQueue: PatchRequestTask[] = [];

  constructor(private googleApiService: GoogleApiService,
              private syncStorageService: SyncStorageService,
              private driveAccountService: DriveAccountService,
              private fileMutex: FileMutex) {}

  enqueuePatchRequest(fileId: string, patchRequestTask: PatchRequestTask) {
    this.requestQueue.push(patchRequestTask);
    this.dispatchQueuedRequests(fileId);
  }

  private dispatchQueuedRequests(fileId: string) {
    this.fileMutex.runExclusiveWrite(() => {
      if (this.requestQueue.length === 0) {
        return;
      }
      return this.driveAccountService.performSyncUpdate(() => {
        return this.validateQueuedRequests(fileId).then(() => {
          this.cancelObsoleteRequests();
          return ignoreErrors(this.requestQueue.pop().run());
        }).catch(handleRuntimeError(ErrorCode.PatchRequestDataNotCoherent, () => {
          this.cancelAllQueuedRequests(ErrorCode.PatchRequestDataNotCoherent);
        })).finally(() => {
          this.syncStorageService.notifyOtherDevices();
        });
      });
    });
  }

  private validateQueuedRequests(fileId: string): Promise<void> {
    return this.googleApiService.requestJSONFileContent(fileId).then(prevSessionListState => {
      for (const patchRequestTask of this.requestQueue) {
        const requestData = patchRequestTask.getRequestData();
        if (requestData.previousValueChecksum !== md5Checksum(prevSessionListState)) {
          return Promise.reject(createRuntimeError(ErrorCode.PatchRequestDataNotCoherent));
        }
        prevSessionListState = requestData.sessionListState;
      }
    });
  }

  private cancelObsoleteRequests() {
    this.requestQueue.splice(0, this.requestQueue.length - 1).forEach(obsoleteRequest => {
      obsoleteRequest.cancel(ErrorCode.PatchRequestIsObsolete);
    });
  }

  private cancelAllQueuedRequests(errorCode: ErrorCode) {
    this.requestQueue.splice(0, this.requestQueue.length).forEach(patchRequestTask => {
      patchRequestTask.cancel(errorCode);
    });
  }
}

export class PatchRequestTask extends FutureTask<any> {
  constructor(private requestData: PatchRequestData, callback: () => Promise<any>) {
    super(callback);
  }

  getRequestData(): PatchRequestData {
    return this.requestData;
  }
}
