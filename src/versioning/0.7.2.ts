import {ReleaseNotes} from './released-versions';

// tslint:disable-next-line:variable-name
export const releaseNotes_0_7_2: ReleaseNotes = {
  releaseDate: new Date(2020, 4, 17),
  changes: [{
    title: 'Extended sync support.',
    details: ['Sync storage is now supported in all browsers.']
  }]
};

export function versionUpdateScript_0_7_2(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.get('preferencesStorage_166b6914', res => {
      const preferences = res['preferencesStorage_166b6914'];
      preferences.showReleaseNotesOnStartup = true;
      chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
    });
  });
}
