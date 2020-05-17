import {ErrorHandler, NgZone} from '@angular/core';
import {ErrorDialogService} from './services/error-dialog.service';
import {getErrorDetailsFromCode} from './types/errors/error-code';
import {isRuntimeError, RuntimeError} from './types/errors/runtime-error';

export class RuntimeErrorHandler implements ErrorHandler {

  constructor(private errorDialogService: ErrorDialogService,
              private ngZone: NgZone) { }

  handleError(error: any): void {
    error = error.rejection || error;
    console.error(error);
    if (isRuntimeError(error)) {
      this.ngZone.run(() => {
        this.handleRuntimeError(error);
      });
    }
  }

  handleRuntimeError(runtimeError: RuntimeError) {
    const errorDetails = getErrorDetailsFromCode(runtimeError.errorCode);
    if (errorDetails.shouldDisplayDialog) {
      this.errorDialogService.showRuntimeError({
        errorMessage: errorDetails.userFriendlyMessage,
        runtimeError
      });
    }
  }
}
