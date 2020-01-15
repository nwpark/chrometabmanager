import {getRuntimeErrorCodeFromMessage, RuntimeErrorCode} from './runtime-error-code';

export class StorageWriteError extends Error {

  readonly errorCode: RuntimeErrorCode;

  constructor(message: string, ...params) {
    super(...params);
    this.name = 'StorageWriteError';
    this.message = message;
    this.errorCode = getRuntimeErrorCodeFromMessage(message);
  }
}
