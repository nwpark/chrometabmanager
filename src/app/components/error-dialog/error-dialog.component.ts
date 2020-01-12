import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ErrorDialogData} from '../../types/errors/ErrorDialogData';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  errorReportSubject = 'Chrome Tab Manager Error Report';
  errorReportBody: string;
  errorReportEmail: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorDialogData) {}

  ngOnInit() {
    this.errorReportEmail = environment.errorReportEmail;
    const stackTrace = this.data.error.stack.replace(/\n/g, '%0A');
    const manifestVersion = chrome.runtime.getManifest().version;
    this.errorReportBody = `Application%20Version:%20${manifestVersion}%0A%0AError%20id:%20${this.data.errorId}%0A${stackTrace}`;
  }

  executeCallbacks() {
    this.data.callback.function();
  }
}
