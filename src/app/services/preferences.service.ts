import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';
import {Preferences, PreferenceUtils} from '../types/preferences';
import {Subject} from 'rxjs';
import {modifiesState} from '../decorators/modifies-state';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  preferences: Preferences;

  preferencesUpdated = new Subject<Preferences>();
  preferencesUpdated$ = this.preferencesUpdated.asObservable();

  constructor() {
    this.preferences = PreferenceUtils.createDefaultPreferences();
    MessagePassingService.addPreferencesListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    StorageService.getPreferences().then(preferences => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing preferences');
      this.preferences = preferences;
      this.preferencesUpdated.next(this.preferences);
    });
  }

  getPreferences() {
    return this.preferences;
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

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating preferences');
    this.preferencesUpdated.next(this.preferences);
    StorageService.setPreferences(this.preferences);
  }
}
