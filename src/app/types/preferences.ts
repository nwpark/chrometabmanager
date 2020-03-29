export interface Preferences {
  closeWindowOnSave: boolean;
  syncSavedWindows: boolean;
  enableDarkTheme: boolean;
  enableDebugging: boolean;
  showReleaseNotesOnStartup: boolean;
}

export class PreferenceUtils {
  static createDefaultPreferences(): Preferences {
    return {
      closeWindowOnSave: false,
      syncSavedWindows: false,
      enableDarkTheme: false,
      enableDebugging: false,
      showReleaseNotesOnStartup: false
    };
  }
}
