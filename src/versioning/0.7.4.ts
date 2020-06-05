import {ReleaseNotes} from './released-versions';

// tslint:disable-next-line:variable-name
export const releaseNotes_0_7_4: ReleaseNotes = {
  releaseDate: new Date(2020, 5, 5),
  changes: [{
    title: 'Customize names for saved tabs!',
    details: ['You can now right click on a saved tab to change its name.']
  }]
};

export function versionUpdateScript_0_7_4(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.get('preferencesStorage_166b6914', res => {
      const preferences = res['preferencesStorage_166b6914'];
      preferences.showReleaseNotesOnStartup = true;
      chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
    });
  });
}
