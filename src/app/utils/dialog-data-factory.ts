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

  static createNewVersionDialog(version: string, callback: () => void): BasicDialogData {
    return {
      width: 500,
      title: `Welcome to version ${version}-alpha!`,
      titleIcon: 'info',
      contentHTML: getFormattedVersionHistoryHTML(),
      actions: [
        {buttonText: 'Got it!', callback, closeDialog: true}
      ]
    };
  }
}
