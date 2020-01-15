import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ActionableError} from '../types/errors/ActionableError';
import {ActionableErrorDialogComponent} from '../components/dialogs/actionable-error-dialog/actionable-error-dialog.component';
import {StorageQuotaExceededDialogComponent} from '../components/dialogs/storage-quota-exceeded-dialog/storage-quota-exceeded-dialog.component';
import {RuntimeErrorCode} from '../types/errors/runtime-error-code';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  private actionableErrorDialogRef: MatDialogRef<ActionableErrorDialogComponent>;

  constructor(private matDialogService: MatDialog) { }

  showActionableError(errorData: ActionableError) {
    this.openActionableErrorDialog();
    this.actionableErrorDialogRef.afterOpened().subscribe(() => {
      this.actionableErrorDialogRef.componentInstance.appendError(errorData);
    });
  }

  private openActionableErrorDialog() {
    if (!this.actionableErrorDialogIsOpen()) {
      this.actionableErrorDialogRef = this.matDialogService.open(ActionableErrorDialogComponent);
    }
  }

  private actionableErrorDialogIsOpen() {
    return this.actionableErrorDialogRef && this.actionableErrorDialogRef.componentInstance;
  }

  showStorageWriteError(errorCode: RuntimeErrorCode) {
    switch (errorCode) {
      case RuntimeErrorCode.QuotaBytes:
      case RuntimeErrorCode.QuotaBytesPerItem:
        this.matDialogService.open(StorageQuotaExceededDialogComponent, {data: errorCode});
        break;
      default:
        // todo
        break;
    }
  }
}
