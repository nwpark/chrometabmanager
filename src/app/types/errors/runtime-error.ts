import {ErrorCode} from './error-code';
import {HttpRequest} from '../../../background/types/http-request';

export interface RuntimeError {
  readonly errorCode: ErrorCode;
  readonly details?: any;
  readonly cause?: RuntimeError;
}

export function runtimeErrorFromXHR(errorCode: ErrorCode, httpRequest: HttpRequest): RuntimeError {
  return {
    errorCode,
    details: {
      url: httpRequest.url,
      method: httpRequest.method,
      status: httpRequest.xmlHttpRequest.status,
      response: httpRequest.xmlHttpRequest.response,
      responseURL: httpRequest.xmlHttpRequest.responseURL
    }
  };
}

export function mapToRuntimeError(errorCode: ErrorCode): (error: any) => Promise<any> {
  return (error: any) => {
    if (!isRuntimeError(error)) {
      error = {
        errorCode: ErrorCode.UnknownError,
        details: error.toString()
      };
    }
    return Promise.reject({
      errorCode,
      cause: error
    });
  };
}

export function isRuntimeError(runtimeError: any): runtimeError is RuntimeError {
  return runtimeError.errorCode && Object.values(ErrorCode).includes(runtimeError.errorCode);
}
