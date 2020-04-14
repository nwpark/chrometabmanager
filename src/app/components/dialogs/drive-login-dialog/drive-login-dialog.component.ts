import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DriveAccountService} from '../../../services/drive-api/drive-account.service';
import {PreferencesService} from '../../../services/preferences.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DriveLoginStatus} from '../../../types/drive-login-status';

@Component({
  selector: 'app-drive-login-dialog',
  templateUrl: './drive-login-dialog.component.html',
  styleUrls: ['./drive-login-dialog.component.scss']
})
export class DriveLoginDialogComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  state: DriveLoginDialogState;
  driveLoginStatus: DriveLoginStatus;

  constructor(private dialogRef: MatDialogRef<DriveLoginDialogComponent>,
              private driveAccountService: DriveAccountService,
              private preferencesService: PreferencesService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.state = DriveLoginDialogState.LOGIN_REQUIRED;
    this.driveAccountService.loginStatus$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(loginStatus => {
      this.driveLoginStatus = loginStatus;
      this.changeDetectorRef.detectChanges();
    });
  }

  performInteractiveLogin() {
    this.dialogRef.disableClose = true;
    this.state = DriveLoginDialogState.AWAITING_LOGIN;
    this.driveAccountService.performInteractiveLogin().then(() => {
      this.state = DriveLoginDialogState.PREPARING_DATA;
      return this.driveAccountService.loadDataFromDrive().then(res => console.log(res));
    }).then(() => {
      return this.preferencesService.setSyncSavedWindows(true);
    }).then(() => {
      this.state = DriveLoginDialogState.FINISHED;
      this.dialogRef.disableClose = false;
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

export enum DriveLoginDialogState {
  LOGIN_REQUIRED = 'loginRequired',
  AWAITING_LOGIN = 'awaitingLogin',
  PREPARING_DATA = 'preparingData',
  FINISHED = 'complete'
}
