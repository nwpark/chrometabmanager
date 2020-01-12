import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ErrorDialogData} from '../types/errors/ErrorDialogData';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  constructor(private dialog: MatDialog) { }

  open(dialogData: ErrorDialogData) {
    this.dialog.open(ErrorDialogComponent, {
      data: dialogData,
      disableClose: true
    });
  }
}
