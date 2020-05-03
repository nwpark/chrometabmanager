import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ErrorDialogData} from '../../../types/errors/error-dialog-data';
import {environment} from '../../../../environments/environment';
import {PreferencesService} from '../../../services/preferences.service';
import {Preferences} from '../../../types/preferences';
import {reloadWindow} from '../../../utils/common';
import {ErrorDetails, getErrorDetailsFromCode} from '../../../types/errors/error-code';

@Component({
  selector: 'app-runtime-error-dialog',
  templateUrl: './runtime-error-dialog.component.html',
  styleUrls: ['./runtime-error-dialog.component.scss']
})
export class RuntimeErrorDialogComponent implements OnInit {

  private readonly errorReportEmail = environment.errorReportEmailAddress;
  private readonly errorReportSubject = 'Chrome Tab Manager Error Report';

  preferences: Preferences;
  errorDetails: ErrorDetails;
  debugInfo: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorDialogData,
              private dialogRef: MatDialogRef<RuntimeErrorDialogComponent>,
              private preferencesService: PreferencesService) { }

  ngOnInit() {
    this.errorDetails = getErrorDetailsFromCode(this.data.runtimeError.errorCode);
    this.dialogRef.disableClose = this.errorDetails.requiresReload;
    this.debugInfo = JSON.stringify(this.data.runtimeError);
    this.preferencesService.getPreferences().then(preferences => {
      this.preferences = preferences;
    });
  }

  reloadPage() {
    reloadWindow();
  }

  sendErrorReport() {
    const mailURL = `mailto:${this.errorReportEmail}?subject=${this.errorReportSubject}&body=${this.getErrorReportBody()}`;
    window.open(mailURL, '_blank');
  }

  private getErrorReportBody(): string {
    const errorReportBody = `Application Version: ${chrome.runtime.getManifest().version}\n\n${this.debugInfo}`;
    return encodeURIComponent(errorReportBody);
  }
}
