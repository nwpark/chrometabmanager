import {VersionHistory, VersionInformation} from './version-history';

export const releasedVersions = ['0.6.3'];

export const versionHistory: VersionHistory = {
  '0.6.3': {
    releaseDate: new Date(2020, 2, 28),
    changes: [{
      title: 'Introduction of dark theme.',
      description: 'Dark theme can be now enabled from the options page.'
    }, {
      // title: 'Tabs will now immediately be suspended after opening a set of saved tabs.',
      title: 'Saved tabs will now be immediately suspended once opened.',
      description: 'This will save memory and CPU consumed by chrome and dramatically improve performance when opening a window with a large number of tabs.'
    }, {
      title: 'The background image should now load faster.'
    }]
  }
};

export function getFormattedVersionHistoryHTML(): string {
  const formattedChangelog = releasedVersions.reduce((acc, version) => {
    return acc + formatVersionInformationHTML(version, versionHistory[version]);
  }, '');
  return `<h2>What\'s new?</h2>${formattedChangelog}`;
}

function formatVersionInformationHTML(version: string, versionInformation: VersionInformation): string {
  const formattedVersionInformation = versionInformation.changes.reduce((acc, versionChangeNote) => {
    acc += `<li>${versionChangeNote.title}</li>`;
    if (versionChangeNote.description) {
      acc += `<ul class="secondary-text"><li>${versionChangeNote.description}</li></ul>`;
    }
    return acc;
  }, '');
  return `<h4>${version} - ${versionInformation.releaseDate.toDateString()}</h4><ul>${formattedVersionInformation}</ul>`;
}
