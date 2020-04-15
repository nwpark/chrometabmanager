import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DriveAccountService} from '../../../services/drive-api/drive-account.service';
import {PreferencesService} from '../../../services/preferences.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DriveLoginStatus} from '../../../types/drive-login-status';
import {ChromePermissionsService} from '../../../services/chrome-permissions.service';

@Component({
  selector: 'app-drive-login-dialog',
  templateUrl: './drive-login-dialog.component.html',
  styleUrls: ['./drive-login-dialog.component.scss']
})
export class DriveLoginDialogComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  stepperState: DriveLoginStepperState = DriveLoginStepperState.UNINITIALIZED;
  driveLoginStatus: DriveLoginStatus;
  errorMessage: string;

  constructor(private dialogRef: MatDialogRef<DriveLoginDialogComponent>,
              private driveAccountService: DriveAccountService,
              private preferencesService: PreferencesService,
              private chromePermissionsService: ChromePermissionsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.advanceStepperState();
    this.driveAccountService.loginStatus$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(loginStatus => {
      this.driveLoginStatus = loginStatus;
      this.changeDetectorRef.detectChanges();
    });
  }

  advanceStepperState() {
    this.getNextStepperState().then(nextStepperState => {
      this.setStepperState(nextStepperState);
    });
  }

  setStepperState(stepperState: DriveLoginStepperState) {
    this.stepperState = stepperState;
    switch (this.stepperState) {
      case DriveLoginStepperState.REQUEST_PERMISSIONS:
        this.dialogRef.disableClose = false;
        break;
      case DriveLoginStepperState.AWAITING_PERMISSIONS:
        this.dialogRef.disableClose = true;
        this.chromePermissionsService.requestDriveAPIPermissions().then(() => {
          this.advanceStepperState();
        });
        break;
      case DriveLoginStepperState.REQUEST_LOGIN:
        this.dialogRef.disableClose = false;
        break;
      case DriveLoginStepperState.AWAITING_LOGIN:
        this.dialogRef.disableClose = true;
        this.driveAccountService.performInteractiveLogin().then(() => {
          this.advanceStepperState();
        });
        break;
      case DriveLoginStepperState.PREPARING_DATA:
        this.dialogRef.disableClose = true;
        this.driveAccountService.loadDataFromDrive().then(() => {
          return this.preferencesService.setSyncSavedWindows(true);
        }).then(() => this.advanceStepperState());
        break;
      case DriveLoginStepperState.FINISHED:
        this.dialogRef.disableClose = false;
        break;
    }
  }

  getNextStepperState(): Promise<DriveLoginStepperState> {
    switch (this.stepperState) {
      case DriveLoginStepperState.UNINITIALIZED:
        return this.chromePermissionsService.hasDriveAPIPermissions().then(hasRequiredPermissions =>
          hasRequiredPermissions ? DriveLoginStepperState.REQUEST_LOGIN : DriveLoginStepperState.REQUEST_PERMISSIONS
        );
      case DriveLoginStepperState.REQUEST_PERMISSIONS:
        return Promise.resolve(DriveLoginStepperState.AWAITING_PERMISSIONS);
      case DriveLoginStepperState.AWAITING_PERMISSIONS:
        return Promise.resolve(DriveLoginStepperState.REQUEST_LOGIN);
      case DriveLoginStepperState.REQUEST_LOGIN:
        return Promise.resolve(DriveLoginStepperState.AWAITING_LOGIN);
      case DriveLoginStepperState.AWAITING_LOGIN:
        return Promise.resolve(DriveLoginStepperState.PREPARING_DATA);
      case DriveLoginStepperState.PREPARING_DATA:
      case DriveLoginStepperState.FINISHED:
        return Promise.resolve(DriveLoginStepperState.FINISHED);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

export enum DriveLoginStepperState {
  UNINITIALIZED = 'uninitialized',
  REQUEST_PERMISSIONS = 'requestPermissions',
  AWAITING_PERMISSIONS = 'awaitingPermissions',
  REQUEST_LOGIN = 'requestLogin',
  AWAITING_LOGIN = 'awaitingLogin',
  PREPARING_DATA = 'preparingData',
  FINISHED = 'complete',
  ERROR = 'error'
}
