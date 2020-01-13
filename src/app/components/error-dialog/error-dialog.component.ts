import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {ErrorDialogData} from '../../types/errors/ErrorDialogData';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent {

  private readonly errorReportEmail = environment.errorReportEmailAddress;
  private readonly errorReportSubject = 'Chrome Tab Manager Error Report';

  errorList: ErrorDialogData[] = [];

  constructor(private dialogRef: MatDialogRef<ErrorDialogComponent>) {}

  appendError(errorData: ErrorDialogData) {
    this.errorList.push(errorData);
  }

  sendErrorReport() {
    const errorReportBody = this.getErrorReportBody();
    const mailURL = `mailto:${this.errorReportEmail}?subject=${this.errorReportSubject}&body=${errorReportBody}`;
    window.open(mailURL, '_blank');
  }

  private getErrorReportBody(): string {
    let errorReportBody = `Application%20Version:%20${chrome.runtime.getManifest().version}`;
    this.errorList.forEach(errorData => {
      const stackTrace = errorData.error.stack.replace(/\n/g, '%0A');
      errorReportBody += `%0A%0AError%20id:%20${errorData.errorId}%0A${stackTrace}`;
    });
    return errorReportBody;
  }

  executeCallbacks() {
    let reloadRequired = false;
    this.errorList.forEach(error => {
      if (error.callback) {
        error.callback.function();
        reloadRequired = reloadRequired || error.callback.requiresReload;
      }
    });
    if (reloadRequired) {
      chrome.runtime.reload();
    }
    this.dialogRef.close();
  }
}
