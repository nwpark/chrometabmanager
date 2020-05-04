import {BasicDialogData} from '../types/errors/basic-dialog-data';
import {getFormattedVersionHistoryHTML} from '../../versioning/released-versions';

export class DialogDataFactory {

  static resetApplicationStateWarning(callback: () => void): BasicDialogData {
    return {
      title: 'Warning...',
      titleIcon: 'warning',
      contentEmphasisedHTML: 'This will reset the state of the application and your saved tabs will be permanently deleted.',
      actions: [
        {buttonText: 'Cancel', closeDialog: true},
        {buttonText: 'Proceed', callback}
      ]
    };
  }

  static createVersionHistoryDialog(callback: () => void): BasicDialogData {
    const version = chrome.runtime.getManifest().version;
    return {
      width: 550,
      title: `Welcome to Version ${version}-alpha!`,
      titleIcon: 'info_outlined',
      contentHTML: getFormattedVersionHistoryHTML(),
      actions: [
        {buttonText: 'Got it!', callback, closeDialog: true}
      ]
    };
  }
}
