import {StorageWriteError} from '../types/errors/storage-write-error';
import {ErrorDialogData} from '../types/errors/error-dialog-data';
import {RuntimeErrorCode} from '../types/errors/runtime-error-code';
import {ActionableError} from '../types/errors/ActionableError';

export class ErrorDialogDataFactory {

  static couldNotStoreCopiedData(error: StorageWriteError): ErrorDialogData {
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
      return ErrorDialogDataFactory.unknownError(error);
    }
  }

  static couldNotStoreModifiedData(error: StorageWriteError): ErrorDialogData {
    switch (error.errorCode) {
      case RuntimeErrorCode.QuotaBytes:
        return {
          title: 'Too many tabs!',
          errorMessage: 'Storage quota exceeded.',
          descriptionHTML: `<p>You have exceeded the maximum storage quota for saved tabs. This is a limitation of sync storage.</p>
            <p>If you wish to save more tabs, then consider disabling sync to remove the limitations.</p>`,
          actions: [{
            buttonText: 'Disable Sync',
            callback: () => window.open('/options.html')
          }]
        };
      case RuntimeErrorCode.QuotaBytesPerItem:
        return {
          title: 'Too many tabs!',
          errorMessage: 'You cannot place any more tabs in this group.',
          descriptionHTML: `<p>A single window cannot contain more than ~30 tabs when sync is enabled. This is a limitation of sync storage.</p>
            <p>If you wish to save more tabs in a single group, then consider disabling sync to remove the limitations.</p>`,
          actions: [{
            buttonText: 'Disable Sync',
            callback: () => window.open('/options.html')
          }]
        };
      default:
        return ErrorDialogDataFactory.unknownError(error);
    }
  }

  static couldNotRetrieveSyncSavedSessions(error: Error, callback: () => Promise<any>): ActionableError {
    return {
      errorId: '5500',
      title: 'Error retrieving saved windows from sync storage',
      description: 'An error occurred while retrieving your saved windows from sync storage.',
      error,
      action: {
        callback,
        requiresReload: false,
        warningMessage: 'This will reset the state of the application and your saved tabs will be permanently deleted.'
      }
    };
  }

  static couldNotRetrieveLocalSavedSessions(error: Error, callback: () => Promise<any>): ActionableError {
    return {
      errorId: '3747',
      title: 'Error retrieving saved windows from local storage',
      description: 'An error occurred while retrieving your saved windows from local storage.',
      error,
      action: {
        callback,
        requiresReload: false,
        warningMessage: 'This will reset the state of the application and your saved tabs will be permanently deleted.'
      }
    };
  }

  static couldNotRetrieveSavedSessions(error: Error, callback: () => Promise<any>): ActionableError {
    return {
      errorId: '8416',
      title: 'Error retrieving saved windows',
      description: 'An error occurred while retrieving your saved windows from storage.',
      error,
      action: {
        callback,
        requiresReload: false,
        warningMessage: 'This will reset the state of the application and your saved tabs will be permanently deleted.'
      }
    };
  }

  static couldNotRetrieveActiveSessions(error: Error, callback: () => Promise<any>): ActionableError {
    return {
      errorId: '1434',
      title: 'Error retrieving active windows',
      description: 'An error occurred while retrieving active windows from storage.',
      error,
      action: {
        callback,
        requiresReload: false
      }
    };
  }

  static couldNotRetrieveClosedSessions(error: Error, callback: () => Promise<any>): ActionableError {
    return {
      errorId: '4209',
      title: 'Error retrieving recently closed tabs',
      description: 'An error occurred while retrieving recently closed tabs from storage.',
      error,
      action: {
        callback,
        requiresReload: false
      }
    };
  }

  static unknownError(error: Error): ErrorDialogData {
    return {errorMessage: error.message};
  }
}
