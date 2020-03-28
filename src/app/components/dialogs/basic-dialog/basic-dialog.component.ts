import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BasicDialogAction, BasicDialogData} from '../../../types/errors/basic-dialog-data';

@Component({
  selector: 'app-basic-dialog',
  templateUrl: './basic-dialog.component.html',
  styleUrls: ['./basic-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BasicDialogComponent implements OnInit {

  private readonly DEFAULT_WIDTH = 380;
  width: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: BasicDialogData,
              private dialogRef: MatDialogRef<BasicDialogComponent>) { }

  ngOnInit() {
    const width = this.data.width || this.DEFAULT_WIDTH;
    this.width = `${width}px`;
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
