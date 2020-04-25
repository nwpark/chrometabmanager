import {ErrorHandler, NgZone} from '@angular/core';
import {ErrorDialogService} from './services/error-dialog.service';
import {getErrorMessageFromCode} from './types/errors/error-code';
import {isRuntimeError, RuntimeError} from './types/errors/runtime-error';

export class RuntimeErrorHandler implements ErrorHandler {

  constructor(private errorDialogService: ErrorDialogService,
              private ngZone: NgZone) { }

  handleError(runtimeError: any): void {
    runtimeError = runtimeError.rejection || runtimeError;
    console.error(runtimeError);
    if (isRuntimeError(runtimeError)) {
      this.ngZone.run(() => {
        this.displayError(runtimeError);
      });
    }
  }

  displayError(runtimeError: RuntimeError) {
    const errorMessage = getErrorMessageFromCode(runtimeError.errorCode);
    this.errorDialogService.showRuntimeError({errorMessage, runtimeError});
  }
}
