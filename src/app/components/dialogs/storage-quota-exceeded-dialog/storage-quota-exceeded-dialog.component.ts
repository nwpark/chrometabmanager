import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {RuntimeErrorCode} from '../../../types/errors/runtime-error-code';

@Component({
  selector: 'app-storage-quota-exceeded-dialog',
  templateUrl: './storage-quota-exceeded-dialog.component.html',
  styleUrls: ['./storage-quota-exceeded-dialog.component.css']
})
export class StorageQuotaExceededDialogComponent implements OnInit {

  quotaBytesExceeded: boolean;
  quotaBytesPerItemExceeded: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) private errorCode: RuntimeErrorCode) { }

  ngOnInit() {
    this.quotaBytesExceeded = this.errorCode === RuntimeErrorCode.QuotaBytes;
    this.quotaBytesPerItemExceeded = this.errorCode === RuntimeErrorCode.QuotaBytesPerItem;
  }
}
