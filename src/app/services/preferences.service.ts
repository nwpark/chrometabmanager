import {Injectable} from '@angular/core';
import {Preferences} from '../types/preferences';
import {ReplaySubject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {take} from 'rxjs/operators';
import {SyncStorageService} from './storage/sync-storage.service';
import {MessageReceiverService} from './messaging/message-receiver.service';
import {getCurrentTimeStringWithMillis} from '../utils/date-utils';
import {reloadWindow} from '../utils/common';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private preferences: Preferences;

  private preferencesUpdated = new ReplaySubject<Preferences>(1);
  preferences$ = this.preferencesUpdated.asObservable();

  constructor(private syncStorageService: SyncStorageService,
              private messageReceiverService: MessageReceiverService) {
    this.messageReceiverService.preferencesUpdated$.subscribe(() => {
      reloadWindow();
    });
    this.syncStorageService.getPreferences().then(preferences => {
      this.setPreferences(preferences);
    });
  }

  private setPreferences(preferences: Preferences) {
    this.preferences = preferences;
    this.preferencesUpdated.next(this.preferences);
  }

  getPreferences(): Promise<Preferences> {
    if (this.preferences) {
      return Promise.resolve(this.preferences);
    }
    return this.preferences$.pipe(take(1)).toPromise();
  }

  shouldCloseWindowOnSave(): Promise<boolean> {
    return this.getPreferences()
      .then(preferences => preferences.closeWindowOnSave);
  }

  isDebugModeEnabled(): Promise<boolean> {
    return this.getPreferences()
      .then(preferences => preferences.enableDebugging);
  }

  @modifiesState()
  setCloseWindowOnSave(closeWindowOnSave: boolean) {
    this.preferences.closeWindowOnSave = closeWindowOnSave;
  }

  @modifiesState()
  setEnableDebugging(enableDebugging: boolean) {
    this.preferences.enableDebugging = enableDebugging;
  }

  @modifiesState()
  setSyncSavedWindows(syncSavedWindows: boolean) {
    this.preferences.syncSavedWindows = syncSavedWindows;
  }

  @modifiesState()
  setDarkThemeEnabled(enableDarkTheme: boolean) {
    this.preferences.enableDarkTheme = enableDarkTheme;
  }

  @modifiesState()
  setShowReleaseNotesOnStartup(showReleaseNotesOnStartup: boolean) {
    this.preferences.showReleaseNotesOnStartup = showReleaseNotesOnStartup;
  }

  onStateModified() {
    console.log(getCurrentTimeStringWithMillis(), '- updating preferences');
    this.preferencesUpdated.next(this.preferences);
    this.syncStorageService.setPreferences(this.preferences);
  }
}
