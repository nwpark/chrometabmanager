import {Injectable} from '@angular/core';
import {Preferences} from '../types/preferences';
import {ReplaySubject} from 'rxjs';
import {take} from 'rxjs/operators';
import {SyncStorageService} from './storage/sync-storage.service';
import {MessageReceiverService} from './messaging/message-receiver.service';
import {getCurrentTimeStringWithMillis} from '../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private preferences = new ReplaySubject<Preferences>(1);
  preferences$ = this.preferences.asObservable();

  constructor(private syncStorageService: SyncStorageService,
              private messageReceiverService: MessageReceiverService) {
    this.messageReceiverService.preferencesUpdated$.subscribe(preferences => {
      this.setPreferences(preferences);
    });
    this.syncStorageService.getPreferences().then(preferences => {
      this.setPreferences(preferences);
    });
  }

  private setPreferences(preferences: Preferences) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing preferences');
    this.preferences.next(preferences);
  }

  getPreferences(): Promise<Preferences> {
    return this.preferences$.pipe(take(1)).toPromise();
  }

  shouldCloseWindowOnSave(): Promise<boolean> {
    return this.getPreferences()
      .then(preferences => preferences.closeWindowOnSave);
  }

  setCloseWindowOnSave(closeWindowOnSave: boolean): Promise<void> {
    return this.getPreferences().then(preferences => {
      preferences.closeWindowOnSave = closeWindowOnSave;
      return this.updatePreferences(preferences);
    });
  }

  setEnableDebugging(enableDebugging: boolean): Promise<void> {
    return this.getPreferences().then(preferences => {
      preferences.enableDebugging = enableDebugging;
      return this.updatePreferences(preferences);
    });
  }

  setSyncSavedWindows(syncSavedWindows: boolean): Promise<void> {
    return this.getPreferences().then(preferences => {
      preferences.syncSavedWindows = syncSavedWindows;
      return this.updatePreferences(preferences);
    });
  }

  setDarkThemeEnabled(enableDarkTheme: boolean): Promise<void> {
    return this.getPreferences().then(preferences => {
      preferences.enableDarkTheme = enableDarkTheme;
      return this.updatePreferences(preferences);
    });
  }

  setShowReleaseNotesOnStartup(showReleaseNotesOnStartup: boolean): Promise<void> {
    return this.getPreferences().then(preferences => {
      preferences.showReleaseNotesOnStartup = showReleaseNotesOnStartup;
      return this.updatePreferences(preferences);
    });
  }

  private updatePreferences(preferences: Preferences): Promise<void> {
    console.log(getCurrentTimeStringWithMillis(), '- updating preferences');
    this.preferences.next(preferences);
    return this.syncStorageService.setPreferences(preferences);
  }
}
