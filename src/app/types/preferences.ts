export interface Preferences {
  closeWindowOnSave: boolean;
  syncSavedWindows: boolean;
  enableDebugging: boolean;
}

export class PreferenceUtils {

  static createDefaultPreferences(): Preferences {
    return {
      closeWindowOnSave: false,
      syncSavedWindows: false,
      enableDebugging: false
    };
  }
}
