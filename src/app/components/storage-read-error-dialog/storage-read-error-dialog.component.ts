import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-storage-read-error-dialog',
  templateUrl: './storage-read-error-dialog.component.html',
  styleUrls: ['./storage-read-error-dialog.component.css']
})
export class StorageReadErrorDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit() {
  }

}
