import {Component, OnInit} from '@angular/core';
import {PreferencesService} from '../../../services/preferences.service';
import {StorageCopyDirection, StorageService} from '../../../services/storage/storage.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-disable-sync-dialog',
  templateUrl: './disable-sync-dialog.component.html',
  styleUrls: ['./disable-sync-dialog.component.scss']
})
export class DisableSyncDialogComponent implements OnInit {

  shouldCopySavedTabs = true;
  actionInProgress = false;

  constructor(private storageService: StorageService,
              private preferencesService: PreferencesService,
              private dialogRef: MatDialogRef<DisableSyncDialogComponent>) { }

  ngOnInit() { }

  disableSync() {
    this.actionInProgress = true;
    this.dialogRef.disableClose = true;
    this.copySavedTabsIfRequired().then(() => {
      return this.preferencesService.setSyncSavedWindows(false);
    }).finally(() => {
      this.dialogRef.close();
    });
  }

  private copySavedTabsIfRequired(): Promise<void> {
    if (this.shouldCopySavedTabs) {
      return this.storageService.copySavedSessions(StorageCopyDirection.FromSyncToLocal);
    }
    return Promise.resolve();
  }
}
