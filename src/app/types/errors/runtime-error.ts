import {ErrorCode} from './error-code';

export class RuntimeError extends Error {
  readonly errorCode: ErrorCode;
  readonly debugMessage: string;

  constructor(errorCode: ErrorCode, debugMessage: string, ...params) {
    super(...params);
    this.name = 'RuntimeError';
    this.errorCode = errorCode;
    this.debugMessage = debugMessage;
  }
}

export class XHRError extends RuntimeError {
  readonly httpStatus: number;

  constructor(errorCode: ErrorCode, xhr: XMLHttpRequest, ...params) {
    const debugMessage = `${xhr.responseURL} ${xhr.status}`;
    super(errorCode, debugMessage, ...params);
    this.name = 'XHRError';
    this.httpStatus = xhr.status;
  }
}
