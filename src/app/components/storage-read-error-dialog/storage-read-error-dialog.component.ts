import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {StorageService} from '../../services/storage/storage.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-storage-read-error-dialog',
  templateUrl: './storage-read-error-dialog.component.html',
  styleUrls: ['./storage-read-error-dialog.component.css']
})
export class StorageReadErrorDialogComponent implements OnInit {

  private readonly errorId = '3b0a0c17';
  errorReportSubject = 'Chrome Tab Manager Error Report';
  errorReportBody: string;
  errorReportEmail: string;
  manifestVersion: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
              private storageService: StorageService) {}

  ngOnInit() {
    this.errorReportEmail = environment.errorReportEmail;
    const stackTrace = this.data.error.stack.replace(/\n/g, '%0A');
    this.errorReportBody = `Error id: ${this.errorId}%0A%0A${stackTrace}`;
    this.manifestVersion = chrome.runtime.getManifest().version;
  }

  clearStorage() {
    this.storageService.clearStorage();
  }
}
