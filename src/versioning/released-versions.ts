import {isNullOrUndefined} from 'util';
import {releaseNotes_0_7_0, versionUpdateScript_0_7_0} from './0.7.0';
import {releaseNotes_0_6_3, versionUpdateScript_0_6_3} from './0.6.3';
import {releaseNotes_0_7_2, versionUpdateScript_0_7_2} from './0.7.2';
import {releaseNotes_0_8_0, versionUpdateScript_0_8_0} from './0.8.0';
import {releaseNotes_0_8_1, versionUpdateScript_0_8_1} from './0.8.1';

const releasedVersions = ['0.6.2', '0.6.3', '0.7.0', '0.7.1', '0.7.2', '0.8.0', '0.8.1'];

const versionHistory: VersionHistory = {
  '0.6.3': releaseNotes_0_6_3,
  '0.7.0': releaseNotes_0_7_0,
  '0.7.2': releaseNotes_0_7_2,
  '0.8.0': releaseNotes_0_8_0,
  '0.8.1': releaseNotes_0_8_1
};

const versionUpdateScripts: InstallationScripts = {
  '0.6.3': versionUpdateScript_0_6_3,
  '0.7.0': versionUpdateScript_0_7_0,
  '0.7.2': versionUpdateScript_0_7_2,
  '0.8.0': versionUpdateScript_0_8_0,
  '0.8.1': versionUpdateScript_0_8_1
};

export function getInstallationScripts(previousVersion: string): InstallationScript[] {
  const previousVersionIndex = releasedVersions.indexOf(previousVersion);
  const versionsToInstall = releasedVersions.slice(previousVersionIndex + 1);
  return versionsToInstall.map(versionNumber => versionUpdateScripts[versionNumber]);
}

export function getFormattedVersionHistoryHTML(): string {
  const formattedChangelog = releasedVersions
    .filter(version => !isNullOrUndefined(versionHistory[version]))
    .reduceRight((acc, version) => acc + formatReleaseNotesHTML(version, versionHistory[version]), '');
  return `<h2>What\'s new?</h2>${formattedChangelog}`;
}

function formatReleaseNotesHTML(version: string, releaseNotes: ReleaseNotes): string {
  const releaseNotesHTML = releaseNotes.changes.reduce((acc, changeNote) => {
    acc += `<li>${changeNote.title}</li>`;
    if (changeNote.details) {
      changeNote.details.forEach(detail => {
        acc += `<ul class="secondary-text"><li>${detail}</li></ul>`;
      });
    }
    return acc;
  }, '');
  return `<h4>${version} - ${releaseNotes.releaseDate.toDateString()}</h4><ul>${releaseNotesHTML}</ul>`;
}

interface VersionHistory {
  [version: string]: ReleaseNotes;
}

export interface ReleaseNotes {
  releaseDate: Date;
  changes: {
    title: string;
    details?: string[];
  }[];
}

interface InstallationScripts {
  [version: string]: InstallationScript;
}

export type InstallationScript = () => Promise<void>;
