import {ReleaseNotes} from './released-versions';

// tslint:disable-next-line:variable-name
export const releaseNotes_0_8_1: ReleaseNotes = {
  releaseDate: new Date(2020, 5, 18),
  changes: [{
    title: 'Remove duplicate tabs.',
    details: ['Added a menu item to remove duplicate tabs from an active window.']
  }]
};

export function versionUpdateScript_0_8_1(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.get('preferencesStorage_166b6914', res => {
      const preferences = res['preferencesStorage_166b6914'];
      preferences.showReleaseNotesOnStartup = true;
      chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
    });
  });
}
