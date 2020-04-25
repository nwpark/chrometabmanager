import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ErrorDialogData} from '../../../types/errors/error-dialog-data';
import {environment} from '../../../../environments/environment';
import {PreferencesService} from '../../../services/preferences.service';
import {Preferences} from '../../../types/preferences';

@Component({
  selector: 'app-runtime-error-dialog',
  templateUrl: './runtime-error-dialog.component.html',
  styleUrls: ['./runtime-error-dialog.component.scss']
})
export class RuntimeErrorDialogComponent implements OnInit {

  private readonly errorReportEmail = environment.errorReportEmailAddress;
  private readonly errorReportSubject = 'Chrome Tab Manager Error Report';

  preferences: Preferences;
  showErrorDetails = false;
  runtimeErrorString: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorDialogData,
              private dialogRef: MatDialogRef<RuntimeErrorDialogComponent>,
              private preferencesService: PreferencesService) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.runtimeErrorString = JSON.stringify(this.data.runtimeError);
    this.preferencesService.getPreferences().then(preferences => {
      this.preferences = preferences;
    });
  }

  enableShowErrorDetails() {
    this.showErrorDetails = true;
  }

  reloadPage() {
    window.location.reload();
  }

  sendErrorReport() {
    const mailURL = `mailto:${this.errorReportEmail}?subject=${this.errorReportSubject}&body=${this.getErrorReportBody()}`;
    window.open(mailURL, '_blank');
  }

  private getErrorReportBody(): string {
    const errorReportBody = `Application Version: ${chrome.runtime.getManifest().version}\n\n${this.runtimeErrorString}`;
    return encodeURIComponent(errorReportBody);
  }
}
