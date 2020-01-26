import {BasicDialogData} from '../types/errors/basic-dialog-data';

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
}
