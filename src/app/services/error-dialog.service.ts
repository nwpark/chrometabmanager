import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ActionableError} from '../types/errors/ActionableError';
import {ActionableErrorDialogComponent} from '../components/dialogs/actionable-error-dialog/actionable-error-dialog.component';
import {RuntimeErrorDialogComponent} from '../components/dialogs/runtime-error-dialog/runtime-error-dialog.component';
import {ErrorDialogData} from '../types/errors/error-dialog-data';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  private actionableErrorDialogRef: MatDialogRef<ActionableErrorDialogComponent>;

  constructor(private matDialogService: MatDialog) { }

  showRuntimeError(dialogData: ErrorDialogData) {
    this.matDialogService.open(RuntimeErrorDialogComponent, {data: dialogData});
  }

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
}
