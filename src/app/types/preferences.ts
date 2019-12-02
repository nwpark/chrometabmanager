export interface Preferences {
  closeWindowOnSave: boolean;
  enableDebugging: boolean;
}

export class PreferenceUtils {

  static createDefaultPreferences(): Preferences {
    return {
      closeWindowOnSave: false,
      enableDebugging: false
    };
  }
}
