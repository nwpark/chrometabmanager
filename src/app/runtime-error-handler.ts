import {ErrorHandler} from '@angular/core';

export class RuntimeErrorHandler implements ErrorHandler {

  handleError(error: any): void {
    console.error(error);
  }
}
