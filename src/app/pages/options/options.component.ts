import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PreferencesService} from '../../services/preferences.service';
import {Preferences} from '../../types/preferences';
import {MatSlideToggleChange} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {SyncStorageService} from '../../services/sync-storage.service';
import {StorageService} from '../../services/storage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

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
              private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer) { }

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
    this.preferencesService.setSyncSavedWindows(event.checked);
    if (event.checked) {
      this.copyLocalDataToSync();
    } else {
      this.copySyncDataToLocal();
    }
  }

  copyLocalDataToSync() {
    this.storageService.copyLocalDataToSync();
  }

  copySyncDataToLocal() {
    this.storageService.copySyncDataToLocal();
  }

  reset() {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    chrome.runtime.reload();
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
