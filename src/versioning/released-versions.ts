import {VersionHistory, ReleaseNotes} from './version-history';
import {InstallationScripts} from './installation-scripts';
import {isNullOrUndefined} from 'util';

export const releasedVersions = ['0.6.2', '0.6.3'];

export const versionHistory: VersionHistory = {
  '0.6.3': {
    releaseDate: new Date(2020, 2, 30),
    changes: [{
      title: 'Introduction of dark theme.',
      description: 'Dark theme can be now enabled from the options page.'
    }, {
      title: 'Saved tabs will now be immediately suspended once opened.',
      description: 'This will save memory and CPU consumed by chrome and dramatically improve performance when opening windows with large numbers of tabs.'
    }, {
      title: 'The background image should now load faster.'
    }]
  }
};

export const versionUpdateScripts: InstallationScripts = {
  '0.6.3': () => {
    return new Promise<void>(resolve => {
      chrome.storage.sync.get('preferencesStorage_166b6914', res => {
        const preferences = res['preferencesStorage_166b6914'];
        preferences.enableDarkTheme = false;
        preferences.showReleaseNotesOnStartup = true;
        chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
      });
    });
  },
};

export function getFormattedVersionHistoryHTML(): string {
  const formattedChangelog = releasedVersions
    .filter(version => !isNullOrUndefined(versionHistory[version]))
    .reduce((acc, version) => acc + formatReleaseNotesHTML(version, versionHistory[version]), '');
  return `<h2>What\'s new?</h2>${formattedChangelog}`;
}

function formatReleaseNotesHTML(version: string, releaseNotes: ReleaseNotes): string {
  const releaseNotesHTML = releaseNotes.changes.reduce((acc, releaseNote) => {
    acc += `<li>${releaseNote.title}</li>`;
    if (releaseNote.description) {
      acc += `<ul class="secondary-text"><li>${releaseNote.description}</li></ul>`;
    }
    return acc;
  }, '');
  return `<h4>${version} - ${releaseNotes.releaseDate.toDateString()}</h4><ul>${releaseNotesHTML}</ul>`;
}
