import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ErrorDialogData} from '../types/errors/ErrorDialogData';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  private dialogRef: MatDialogRef<ErrorDialogComponent>;

  constructor(private dialog: MatDialog) { }

  showError(errorData: ErrorDialogData) {
    this.openDialog();
    this.dialogRef.afterOpened().subscribe(() => {
      this.dialogRef.componentInstance.appendError(errorData);
    });
  }

  private openDialog() {
    if (!this.dialogIsOpen()) {
      this.dialogRef = this.dialog.open(ErrorDialogComponent);
    }
  }

  private dialogIsOpen() {
    return this.dialogRef && this.dialogRef.componentInstance;
  }
}
