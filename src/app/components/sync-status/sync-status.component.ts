import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {DriveAccountService} from '../../services/drive-api/drive-account.service';
import {getSyncStatusDetails, SyncStatus, SyncStatusDetails} from '../../types/sync-status';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DriveLoginStatus} from '../../types/drive-login-status';
import {DriveLoginDialogComponent, DriveLoginDialogConfig} from '../dialogs/drive-login-dialog/drive-login-dialog.component';
import {MatDialog} from '@angular/material';
import {PreferencesService} from '../../services/preferences.service';
import {DisableSyncDialogComponent} from '../dialogs/disable-sync-dialog/disable-sync-dialog.component';

@Component({
  selector: 'app-sync-status',
  templateUrl: './sync-status.component.html',
  styleUrls: ['./sync-status.component.scss']
})
export class SyncStatusComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  SyncStatus = SyncStatus;
  syncStatus: SyncStatus;
  syncStatusDetails: SyncStatusDetails;
  driveLoginStatus: DriveLoginStatus;

  constructor(private driveAccountService: DriveAccountService,
              private preferencesService: PreferencesService,
              private matDialogService: MatDialog,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.driveAccountService.getSyncStatus$().pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(syncStatus => {
      this.syncStatus = syncStatus;
      this.syncStatusDetails = getSyncStatusDetails(syncStatus);
      this.changeDetectorRef.detectChanges();
    });
    this.driveAccountService.loginStatus$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(loginStatus => {
      this.driveLoginStatus = loginStatus;
      this.changeDetectorRef.detectChanges();
    });
  }

  signInToDrive() {
    this.matDialogService.open(DriveLoginDialogComponent, DriveLoginDialogConfig.SIGN_IN_ONLY);
  }

  enableSync() {
    this.matDialogService.open(DriveLoginDialogComponent, DriveLoginDialogConfig.DEFAULT);
  }

  disableSync() {
    this.matDialogService.open(DisableSyncDialogComponent);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
