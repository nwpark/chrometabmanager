import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ActionableError} from '../../../types/errors/ActionableError';

@Component({
  selector: 'app-actionable-error-dialog',
  templateUrl: './actionable-error-dialog.component.html',
  styleUrls: ['./actionable-error-dialog.component.css']
})
export class ActionableErrorDialogComponent implements OnInit {

  private readonly errorReportEmail = environment.errorReportEmailAddress;
  private readonly errorReportSubject = 'Chrome Tab Manager Error Report';

  @ViewChild('warningDialog', {static: false})
  warningDialogTemplate: TemplateRef<any>;
  warningDialogRef: MatDialogRef<TemplateRef<any>>;

  errorList: ActionableError[] = [];

  constructor(private matDialogService: MatDialog,
              private dialogRef: MatDialogRef<ActionableErrorDialogComponent>) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
    this.dialogRef.beforeClosed().subscribe(() => {
      this.closeWarningDialog();
    });
  }

  appendError(errorData: ActionableError) {
    this.errorList.push(errorData);
  }

  repairErrors() {
    const requiresConfirmation = this.errorList.some(error => error.action.warningMessage);
    if (requiresConfirmation) {
      this.warningDialogRef = this.matDialogService.open(this.warningDialogTemplate);
    } else {
      this.invokeErrorCallbacks();
    }
  }

  invokeErrorCallbacks() {
    this.errorList.forEach(error => {
      if (error.action) {
        error.action.callback();
      }
    });
    this.reloadPage();
  }

  reloadPage() {
    const applicationReloadRequired = this.errorList.some(error =>
      error.action && error.action.requiresReload
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
