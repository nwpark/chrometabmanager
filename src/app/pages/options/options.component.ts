import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PreferencesService} from '../../services/preferences.service';
import {Preferences} from '../../types/preferences';
import {MatDialog, MatSlideToggleChange} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {SyncStorageService} from '../../services/storage/sync-storage.service';
import {StorageService} from '../../services/storage/storage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ErrorDialogService} from '../../services/error-dialog.service';
import {ErrorDialogDataFactory} from '../../utils/error-dialog-data-factory';
import {SessionListState} from '../../types/session/session-list-state';
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

  constructor(private preferencesService: PreferencesService,
              private storageService: StorageService,
              private localStorageService: LocalStorageService,
              private driveAccountService: DriveAccountService,
              private driveStorageService: DriveStorageService,
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

  // todo: move method to sign in dialog
  setSyncSavedWindows(event: MatSlideToggleChange) {
    this.copySavedSessions(event.checked).then(() => {
      this.preferencesService.setSyncSavedWindows(event.checked);
    }).catch(() => {
      event.source.checked = !event.checked;
    });
  }

  enableSync() {
    this.matDialogService.open(DriveLoginDialogComponent);
  }

  disableSync() {
    // todo: open sign out dialog
    this.driveAccountService.disableSync();
  }

  private copySavedSessions(copyToSync: boolean) {
    return Promise.all([
      this.getSavedSessionStateSync(),
      this.getSavedSessionStateLocal()
    ]).then(res => {
      const sessionListState: SessionListState = res[0];
      sessionListState.addAll(res[1]);
      return this.storeCopiedSessionState(sessionListState, copyToSync);
    });
  }

  private getSavedSessionStateSync(): Promise<SessionListState> {
    return this.driveStorageService.getSavedWindowsState().catch(error => {
      const dialogData = ErrorDialogDataFactory.couldNotRetrieveSyncSavedSessions(error, () =>
        this.driveStorageService.setSavedWindowsState(SessionListState.empty())
      );
      this.errorDialogService.showActionableError(dialogData);
      throw error;
    });
  }

  private getSavedSessionStateLocal(): Promise<SessionListState> {
    return this.localStorageService.getSavedWindowsState().catch(error => {
      const dialogData = ErrorDialogDataFactory.couldNotRetrieveLocalSavedSessions(error, () =>
        this.localStorageService.setSavedWindowsState(SessionListState.empty())
      );
      this.errorDialogService.showActionableError(dialogData);
      throw error;
    });
  }

  private storeCopiedSessionState(sessionListState: SessionListState, copyToSync: boolean): Promise<void> {
    const storageService = copyToSync ? this.driveStorageService : this.localStorageService;
    return storageService.setSavedWindowsState(sessionListState).catch(error => {
      const dialogData = ErrorDialogDataFactory.couldNotStoreCopiedData(error);
      this.errorDialogService.showError(dialogData);
      throw error;
    });
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
