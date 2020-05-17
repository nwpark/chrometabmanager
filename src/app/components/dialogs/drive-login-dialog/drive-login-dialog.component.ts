import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';
import {DriveAccountService} from '../../../services/drive-api/drive-account.service';
import {PreferencesService} from '../../../services/preferences.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DriveLoginStatus} from '../../../types/drive-login-status';
import {ChromePermissionsService} from '../../../services/chrome-permissions.service';
import {OAuth2Service} from '../../../services/oauth2/o-auth-2.service';
import {StorageCopyDirection, StorageService} from '../../../services/storage/storage.service';

@Component({
  selector: 'app-drive-login-dialog',
  templateUrl: './drive-login-dialog.component.html',
  styleUrls: ['./drive-login-dialog.component.scss']
})
export class DriveLoginDialogComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();
  private stepperStateMap: StepperStateMap;

  StepperStateId = StepperStateId;
  currentStepperStateId: StepperStateId;
  driveLoginStatus: DriveLoginStatus;
  shouldCopySavedSessions = true;

  constructor(@Inject(MAT_DIALOG_DATA) private options: DriveLoginDialogConfig,
              private dialogRef: MatDialogRef<DriveLoginDialogComponent>,
              private driveAccountService: DriveAccountService,
              private preferencesService: PreferencesService,
              private chromePermissionsService: ChromePermissionsService,
              private oAuth2Service: OAuth2Service,
              private storageService: StorageService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.initStepperStateMap();
    this.getInitialStepperState().then(stepperState => {
      this.setStepperState(stepperState);
    });
    this.driveAccountService.loginStatus$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(loginStatus => {
      this.driveLoginStatus = loginStatus;
      this.changeDetectorRef.detectChanges();
    });
  }

  advanceStepperState() {
    const currentStepperState = this.stepperStateMap[this.currentStepperStateId];
    currentStepperState.getNextState().then(nextState => {
      this.setStepperState(nextState);
    });
  }

  private setStepperState(stepperStateId: StepperStateId) {
    this.currentStepperStateId = stepperStateId;
    const stepperState = this.stepperStateMap[stepperStateId];
    this.dialogRef.disableClose = stepperState.disableDialogClose;
    if (stepperState.onInitialize) {
      stepperState.onInitialize();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getInitialStepperState(): Promise<StepperStateId> {
    return this.options.skipConfirmationStep
      ? this.stepperStateMap[StepperStateId.CONFIRM_ENABLE_SYNC].getNextState()
      : Promise.resolve(StepperStateId.CONFIRM_ENABLE_SYNC);
  }

  private initStepperStateMap() {
    this.stepperStateMap = {
      [StepperStateId.CONFIRM_ENABLE_SYNC]: {
        disableDialogClose: false,
        getNextState: () => Promise.all([
          this.chromePermissionsService.hasDriveAPIPermissions(),
          this.oAuth2Service.hasValidAuthToken()
        ]).then(([hasRequiredPermissions, hasValidAuthToken]) => {
          if (!hasRequiredPermissions) {
            return StepperStateId.REQUIRES_CHROME_PERMISSIONS;
          } else if (!hasValidAuthToken) {
            return StepperStateId.REQUIRES_OAUTH_LOGIN;
          }
          return StepperStateId.PREPARING_DRIVE_DATA;
        })
      },
      [StepperStateId.REQUIRES_CHROME_PERMISSIONS]: {
        disableDialogClose: false,
        getNextState: () => Promise.resolve(StepperStateId.AWAITING_CHROME_PERMISSIONS)
      },
      [StepperStateId.AWAITING_CHROME_PERMISSIONS]: {
        disableDialogClose: true,
        onInitialize: () => this.chromePermissionsService.requestDriveAPIPermissions().then(() => {
          this.advanceStepperState();
        }),
        getNextState: () => {
          return Promise.resolve(StepperStateId.REQUIRES_OAUTH_LOGIN);
        }
      },
      [StepperStateId.REQUIRES_OAUTH_LOGIN]: {
        disableDialogClose: false,
        getNextState: () => Promise.resolve(StepperStateId.AWAITING_OAUTH_LOGIN)
      },
      [StepperStateId.AWAITING_OAUTH_LOGIN]: {
        disableDialogClose: true,
        onInitialize: () => this.oAuth2Service.performInteractiveLogin().then(() => {
          this.advanceStepperState();
        }),
        getNextState: () => Promise.resolve(StepperStateId.PREPARING_DRIVE_DATA)
      },
      [StepperStateId.PREPARING_DRIVE_DATA]: {
        disableDialogClose: true,
        onInitialize: () => {
          this.driveAccountService.clearLoginStatus().then(() => {
            return this.shouldCopySavedSessions
              ? this.storageService.copySavedSessions(StorageCopyDirection.FromLocalToSync)
              : this.storageService.reloadSavedSessionsSync();
          }).then(() => {
            return this.driveAccountService.enableSync();
          }).then(() => {
            this.advanceStepperState();
          });
        },
        getNextState: () => Promise.resolve(StepperStateId.FINISHED)
      },
      [StepperStateId.FINISHED]: {
        disableDialogClose: false,
        getNextState: () => Promise.resolve(StepperStateId.FINISHED)
      },
    };
  }
}

type StepperStateMap = {
  [stepperStateId in StepperStateId]: StepperState;
};

interface StepperState {
  disableDialogClose: boolean;
  onInitialize?: () => void;
  getNextState: () => Promise<StepperStateId>;
}

enum StepperStateId {
  REQUIRES_CHROME_PERMISSIONS,
  AWAITING_CHROME_PERMISSIONS,
  REQUIRES_OAUTH_LOGIN,
  AWAITING_OAUTH_LOGIN,
  CONFIRM_ENABLE_SYNC,
  PREPARING_DRIVE_DATA,
  FINISHED,
}

export class DriveLoginDialogConfig {
  public static readonly DEFAULT: MatDialogConfig<DriveLoginDialogConfig> = {
    data: { skipConfirmationStep: false }
  };
  public static readonly SIGN_IN_ONLY: MatDialogConfig<DriveLoginDialogConfig> = {
    data: { skipConfirmationStep: true }
  };
  skipConfirmationStep: boolean;
}
