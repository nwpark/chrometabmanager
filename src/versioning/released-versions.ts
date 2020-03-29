import {VersionHistory, ReleaseNotes} from './version-history';

export const releasedVersions = ['0.6.3'];

export const versionHistory: VersionHistory = {
  '0.6.3': {
    releaseDate: new Date(2020, 2, 28),
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

export function getFormattedVersionHistoryHTML(): string {
  const formattedChangelog = releasedVersions.reduce((acc, version) => {
    return acc + formatReleaseNotesHTML(version, versionHistory[version]);
  }, '');
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
