import {ReleaseNotes} from './released-versions';

// tslint:disable-next-line:variable-name
export const releaseNotes_0_6_3: ReleaseNotes = {
  releaseDate: new Date(2020, 2, 30),
  changes: [{
    title: 'Introduction of dark theme.',
    details: ['Dark theme can be now enabled from the options page.']
  }, {
    title: 'Saved tabs will now be immediately suspended once opened.',
    details: ['This will save memory and CPU consumed by chrome and dramatically improve performance when opening windows with large numbers of tabs.']
  }, {
    title: 'The background image should now load faster.'
  }]
};

export function versionUpdateScript_0_6_3(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.get('preferencesStorage_166b6914', res => {
      const preferences = res['preferencesStorage_166b6914'];
      preferences.enableDarkTheme = false;
      preferences.showReleaseNotesOnStartup = true;
      chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
    });
  });
}
