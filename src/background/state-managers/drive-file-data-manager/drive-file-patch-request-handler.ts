import {SessionListState} from '../../../app/types/session/session-list-state';
import {GoogleApiService} from '../../../app/services/drive-api/google-api.service';
import {SyncStorageService} from '../../../app/services/storage/sync-storage.service';
import {ErrorCode} from '../../../app/types/errors/error-code';
import {ignoreErrors} from '../../../app/utils/error-utils';
import {FileMutex} from '../../types/file-mutex';

export class DriveFilePatchRequestHandler {
  private pendingRequest: Promise<any> = Promise.resolve();
  private latestValue: SessionListState = undefined;

  constructor(private googleApiService: GoogleApiService,
              private syncStorageService: SyncStorageService,
              private fileMutex: FileMutex) { }

  patch(fileId: string, sessionListState: SessionListState): Promise<any> {
    if (this.fileMutex.isReadLocked()) {
      return Promise.reject(ErrorCode.AttemptedPatchDuringSync);
    }
    this.latestValue = sessionListState;
    return this.enqueuePatchRequest(() => {
      return this.patchFileContent(fileId, sessionListState);
    });
  }

  private enqueuePatchRequest(sendPatchRequest: () => Promise<any>): Promise<any> {
    this.pendingRequest = ignoreErrors(this.pendingRequest).then(sendPatchRequest);
    return this.pendingRequest;
  }

  private patchFileContent(fileId: string, sessionListState: SessionListState): Promise<any> {
    return this.fileMutex.runExclusiveWrite(() => {
      return this.googleApiService.patchJSONFileContent(fileId, sessionListState);
    }).finally(() => {
      this.syncStorageService.notifyOtherDevices();
    });
  }

  hasPendingRequest(): boolean {
    return this.fileMutex.isWriteLocked();
  }

  getLatestValue(): Promise<SessionListState> {
    return Promise.resolve(this.latestValue);
  }
}
