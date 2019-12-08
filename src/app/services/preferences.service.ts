import {Injectable} from '@angular/core';
import {Preferences, PreferenceUtils} from '../types/preferences';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {MessagePassingService} from './message-passing.service';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private preferences: Preferences;

  preferencesUpdated = new Subject<Preferences>();
  preferencesUpdated$ = this.preferencesUpdated.asObservable();

  constructor() {
    MessagePassingService.addPreferencesListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    ChromeStorageUtils.getPreferences().then(preferences => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing preferences');
      this.preferences = preferences;
      this.preferencesUpdated.next(this.preferences);
    });
  }

  getPreferences(): Promise<Preferences> {
    if (this.preferences) {
      return Promise.resolve(this.preferences);
    }
    return this.preferencesUpdated$.pipe(take(1)).toPromise();
  }

  shouldCloseWindowOnSave(): boolean {
    return this.preferences.closeWindowOnSave;
  }

  isDebugModeEnabled(): boolean {
    return this.preferences.enableDebugging;
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

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating preferences');
    this.preferencesUpdated.next(this.preferences);
    ChromeStorageUtils.setPreferences(this.preferences);
  }
}
