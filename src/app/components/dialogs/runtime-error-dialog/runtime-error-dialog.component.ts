import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ErrorDialogData} from '../../../types/errors/error-dialog-data';

@Component({
  selector: 'app-runtime-error-dialog',
  templateUrl: './runtime-error-dialog.component.html',
  styleUrls: ['./runtime-error-dialog.component.css']
})
export class RuntimeErrorDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorDialogData) { }

  ngOnInit() {
  }

}
