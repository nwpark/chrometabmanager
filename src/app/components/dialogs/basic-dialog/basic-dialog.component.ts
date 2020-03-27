import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BasicDialogAction, BasicDialogData} from '../../../types/errors/basic-dialog-data';

@Component({
  selector: 'app-basic-dialog',
  templateUrl: './basic-dialog.component.html',
  styleUrls: ['./basic-dialog.component.scss']
})
export class BasicDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: BasicDialogData,
              private dialogRef: MatDialogRef<BasicDialogComponent>) { }

  ngOnInit() {
  }

  performAction(action: BasicDialogAction) {
    if (action.callback) {
      action.callback();
    }
    if (action.closeDialog) {
      this.dialogRef.close();
    }
  }
}
