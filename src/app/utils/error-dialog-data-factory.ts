import {ActionableError} from '../types/errors/ActionableError';

export class ErrorDialogDataFactory {

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
}
