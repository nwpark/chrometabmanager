import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-storage-quota-exceeded-dialog',
  templateUrl: './storage-quota-exceeded-dialog.component.html',
  styleUrls: ['./storage-quota-exceeded-dialog.component.css']
})
export class StorageQuotaExceededDialogComponent implements OnInit {

  syncQuotaBytesPerItem = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

  constructor() { }

  ngOnInit() {
  }

}
