import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ErrorDialogData} from '../../types/errors/ErrorDialogData';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  private readonly errorReportEmail = environment.errorReportEmailAddress;
  private readonly errorReportSubject = 'Chrome Tab Manager Error Report';

  @ViewChild('warningDialog', {static: false})
  warningDialogTemplate: TemplateRef<any>;
  warningDialogRef: MatDialogRef<TemplateRef<any>>;

  errorList: ErrorDialogData[] = [];

  constructor(private matDialogService: MatDialog,
              private dialogRef: MatDialogRef<ErrorDialogComponent>) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
    this.dialogRef.beforeClosed().subscribe(() => {
      this.closeWarningDialog();
    });
  }

  appendError(errorData: ErrorDialogData) {
    this.errorList.push(errorData);
  }

  repairErrors() {
    const requiresConfirmation = this.errorList.some(error => error.callback.warningMessage);
    if (requiresConfirmation) {
      this.warningDialogRef = this.matDialogService.open(this.warningDialogTemplate);
    } else {
      this.invokeErrorCallbacks();
    }
  }

  invokeErrorCallbacks() {
    this.errorList.forEach(error => {
      if (error.callback) {
        error.callback.function();
      }
    });
    this.reloadPage();
  }

  reloadPage() {
    const applicationReloadRequired = this.errorList.some(error =>
      error.callback && error.callback.requiresReload
    );
    if (applicationReloadRequired) {
      chrome.runtime.reload();
    } else {
      window.location.reload();
    }
  }

  closeWarningDialog() {
    if (this.warningDialogRef) {
      this.warningDialogRef.close();
    }
  }

  sendErrorReport() {
    const mailURL = `mailto:${this.errorReportEmail}?subject=${this.errorReportSubject}&body=${this.getErrorReportBody()}`;
    window.open(mailURL, '_blank');
  }

  private getErrorReportBody(): string {
    return this.errorList.reduce((errorReportBody, errorData) => {
      const stackTrace = errorData.error.stack.replace(/\n/g, '%0A');
      return errorReportBody + `%0A%0AError%20id:%20${errorData.errorId}%0A${stackTrace}`;
    }, `Application%20Version:%20${chrome.runtime.getManifest().version}`);
  }
}
