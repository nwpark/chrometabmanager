import {StorageWriteError} from '../types/errors/storage-write-error';
import {ErrorDialogData} from '../types/errors/error-dialog-data';
import {RuntimeErrorCode} from '../types/errors/runtime-error-code';

export class ErrorDialogDataFactory {

  static couldNotCopySyncData(error: StorageWriteError): ErrorDialogData {
    if (error.errorCode === RuntimeErrorCode.QuotaBytes) {
      return {
        title: 'Could not enable sync...',
        errorMessage: 'Storage quota exceeded.',
        descriptionHTML: `<p>Sync storage has a maximum quota of 102,400 bytes (this is enough to store approximately 300 saved tabs).</p>
          <p>You currently have too many saved tabs to fit this quota. If you wish to enable sync, you will need to remove some of your saved tabs.</p>`
      };
    } else if (error.errorCode === RuntimeErrorCode.QuotaBytesPerItem) {
      return {
        title: 'Could not enable sync...',
        errorMessage: 'Too many tabs in a single group.',
        descriptionHTML: `<p>A single saved window cannot contain more than ~30 tabs when sync is enabled. This is a limitation of sync storage.</p>
          <p>You currently have one or more saved windows that exceed this constraint. If you wish to enable sync, you will need to split these windows into smaller groups.</p>`
      };
    } else {
      return {errorMessage: error.message};
    }
  }
}
