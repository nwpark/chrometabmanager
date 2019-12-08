import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PreferencesService} from '../../services/preferences.service';
import {Preferences} from '../../types/preferences';
import {MatSlideToggleChange} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ChromeStorageUtils} from '../../classes/chrome-storage-utils';
import {StorageService} from '../../services/storage.service';
import {SessionListState} from '../../types/session-list-state';

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
export class OptionsComponent implements OnInit {

  preferences: Preferences;
  syncBytesInUse: number;
  syncQuotaBytes = chrome.storage.sync.QUOTA_BYTES;
  localSavedSessionsBytesInUse: number;

  constructor(private preferencesService: PreferencesService,
              private storageService: StorageService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.preferencesService.preferencesUpdated$.subscribe(preferences => {
      this.preferences = preferences;
      this.changeDetectorRef.detectChanges();
    });
    this.storageService.syncBytesInUse$.subscribe(syncBytesInUse => {
      this.syncBytesInUse = syncBytesInUse;
      this.changeDetectorRef.detectChanges();
    });
    ChromeStorageUtils.getLocalSavedSessionsBytesInUse().then(bytesInUse => {
      this.localSavedSessionsBytesInUse = bytesInUse;
    });
  }

  getBytesInUsePercentage(): number {
    return Math.round((this.syncBytesInUse / this.syncQuotaBytes) * 100);
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
    Promise.all([
      ChromeStorageUtils.getSavedWindowsStateLocal(),
      ChromeStorageUtils.getSavedWindowsStateSync()
    ]).then(res => {
      const savedSessionsLocal: SessionListState = res[0];
      const savedSessionsSync: SessionListState = res[1];
      savedSessionsLocal.layoutState.sessionStates.forEach(layoutState => {
        if (!savedSessionsSync.chromeSessions[layoutState.sessionId]) {
          const savedSession = savedSessionsLocal.chromeSessions[layoutState.sessionId];
          savedSessionsSync.unshiftSession(savedSession, layoutState);
        }
      });
      ChromeStorageUtils.setSavedWindowsStateSync(savedSessionsSync);
    });
  }

  copySyncDataToLocal() {
    ChromeStorageUtils.getSavedWindowsStateSync().then(sessionListState => {
      ChromeStorageUtils.setSavedWindowsStateLocal(sessionListState);
    });
  }
}
