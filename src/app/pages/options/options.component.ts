import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PreferencesService} from '../../services/preferences.service';
import {Preferences} from '../../types/preferences';
import {MatDialog, MatSlideToggleChange} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {StorageService} from '../../services/storage/storage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ErrorDialogService} from '../../services/error-dialog.service';
import {LocalStorageService} from '../../services/storage/local-storage.service';
import {ImageData} from '../../types/image-data';
import {environment} from '../../../environments/environment';
import {BasicDialogComponent} from '../../components/dialogs/basic-dialog/basic-dialog.component';
import {BasicDialogData} from '../../types/errors/basic-dialog-data';
import {DialogDataFactory} from '../../utils/dialog-data-factory';
import {DriveLoginStatus} from '../../types/drive-login-status';
import {DriveAccountService} from '../../services/drive-api/drive-account.service';
import {DriveStorageService} from '../../services/drive-api/drive-storage.service';
import {DriveLoginDialogComponent} from '../../components/dialogs/drive-login-dialog/drive-login-dialog.component';
import {OAuth2Service} from '../../services/oauth2/o-auth-2.service';
import {DisableSyncDialogComponent} from '../../components/dialogs/disable-sync-dialog/disable-sync-dialog.component';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('fadeIn', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(200)
      ])
    ])
  ]
})
export class OptionsComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  preferences: Preferences;
  downloadJsonHref: Promise<SafeUrl>;
  backgroundPhoto: ImageData;
  applicationVersion: string;
  driveLoginStatus: DriveLoginStatus;
  authStatus: boolean;

  constructor(private preferencesService: PreferencesService,
              private storageService: StorageService,
              private localStorageService: LocalStorageService,
              private driveAccountService: DriveAccountService,
              private driveStorageService: DriveStorageService,
              private oAuth2Service: OAuth2Service,
              private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer,
              private errorDialogService: ErrorDialogService,
              private matDialogService: MatDialog) { }

  ngOnInit() {
    this.preferencesService.preferences$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(preferences => {
      this.preferences = preferences;
      this.changeDetectorRef.detectChanges();
    });
    this.driveAccountService.loginStatus$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(loginStatus => {
      this.driveLoginStatus = loginStatus;
      this.changeDetectorRef.detectChanges();
    });
    this.oAuth2Service.authStatus$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(authStatus => {
      this.authStatus = authStatus;
      this.changeDetectorRef.detectChanges();
    });
    this.downloadJsonHref = this.generateDownloadJsonUri();
    this.backgroundPhoto = environment.backgroundPhoto;
    this.applicationVersion = chrome.runtime.getManifest().version;
  }

  setCloseWindowOnSave(event: MatSlideToggleChange) {
    this.preferencesService.setCloseWindowOnSave(event.checked);
  }

  setEnableDebugging(event: MatSlideToggleChange) {
    this.preferencesService.setEnableDebugging(event.checked);
  }

  setDarkThemeEnabled(event: MatSlideToggleChange) {
    this.preferencesService.setDarkThemeEnabled(event.checked);
  }

  enableSync() {
    this.matDialogService.open(DriveLoginDialogComponent);
  }

  disableSync() {
    this.matDialogService.open(DisableSyncDialogComponent);
  }

  showVersionHistoryDialog() {
    const dialogData: BasicDialogData = DialogDataFactory.createVersionHistoryDialog(() => {});
    this.matDialogService.open(BasicDialogComponent, {data: dialogData});
  }

  reset() {
    const dialogData: BasicDialogData = DialogDataFactory.resetApplicationStateWarning(() =>
      this.storageService.clearStorage()
    );
    this.matDialogService.open(BasicDialogComponent, {data: dialogData});
  }

  generateDownloadJsonUri(): Promise<SafeUrl> {
    return new Promise<SafeUrl>(resolve => {
      chrome.storage.local.get(res => {
        resolve(this.domSanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(res))));
      });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
