import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PreferencesService} from '../../services/preferences.service';
import {Preferences} from '../../types/preferences';
import {MatSlideToggleChange} from '@angular/material';
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

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
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
  syncBytesInUse: number;
  syncBytesInUsePercentage: number;
  syncQuotaBytes = chrome.storage.sync.QUOTA_BYTES;
  downloadJsonHref: Promise<SafeUrl>;

  constructor(private preferencesService: PreferencesService,
              private storageService: StorageService,
              private syncStorageService: SyncStorageService,
              private localStorageService: LocalStorageService,
              private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer,
              private errorDialogService: ErrorDialogService) { }

  ngOnInit() {
    this.preferencesService.preferencesUpdated$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(preferences => {
      this.preferences = preferences;
      this.changeDetectorRef.detectChanges();
    });
    this.syncStorageService.onChanged$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(() => {
      this.refreshBytesInUse();
    });
    this.refreshBytesInUse();
    this.downloadJsonHref = this.generateDownloadJsonUri();
  }

  private refreshBytesInUse() {
    this.syncStorageService.getBytesInUse().then(bytesInUse => {
      this.syncBytesInUse = bytesInUse;
      this.syncBytesInUsePercentage = Math.round((bytesInUse / this.syncQuotaBytes) * 100);
      this.changeDetectorRef.detectChanges();
    });
  }

  setCloseWindowOnSave(event: MatSlideToggleChange) {
    this.preferencesService.setCloseWindowOnSave(event.checked);
  }

  setEnableDebugging(event: MatSlideToggleChange) {
    this.preferencesService.setEnableDebugging(event.checked);
  }

  setSyncSavedWindows(event: MatSlideToggleChange) {
    this.copySavedSessions(event.checked).then(() => {
      this.preferencesService.setSyncSavedWindows(event.checked);
    }).catch(() => {
      event.source.checked = !event.checked;
    });
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
    return this.syncStorageService.getSavedWindowsState().catch(error => {
      const dialogData = ErrorDialogDataFactory.couldNotRetrieveSyncSavedSessions(error, () =>
        this.syncStorageService.setSavedWindowsState(SessionListState.empty())
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
    const storageService = copyToSync ? this.syncStorageService : this.localStorageService;
    return storageService.setSavedWindowsState(sessionListState).catch(error => {
      const dialogData = ErrorDialogDataFactory.couldNotStoreCopiedData(error);
      this.errorDialogService.showError(dialogData);
      throw error;
    });
  }

  reset() {
    this.storageService.clearStorage();
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
