import {ReleaseNotes} from './released-versions';

// tslint:disable-next-line:variable-name
export const releaseNotes_0_8_2: ReleaseNotes = {
  releaseDate: new Date(2021, 3, 11),
  changes: [{
    title: 'Improved responsive layout.',
    details: ['The Saved, Active and Recently closed columns will now stack vertically when the width of the browser window is reduced.']
  }, {
    title: 'Improved dark mode.',
    details: ['The new tab page will no longer initialize with a white background when dark mode is enabled in the browser.']
  }]
};

export function versionUpdateScript_0_8_2(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.get('preferencesStorage_166b6914', res => {
      const preferences = res['preferencesStorage_166b6914'];
      preferences.showReleaseNotesOnStartup = true;
      chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
    });
  });
}
