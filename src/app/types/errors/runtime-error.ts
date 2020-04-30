import {ErrorCode, ErrorType} from './error-code';
import {HttpRequest} from '../../../background/types/http-request';
import {isNullOrUndefined} from 'util';

export interface RuntimeError {
  readonly errorCode: ErrorCode;
  readonly details?: any;
  readonly cause?: RuntimeError;
  readonly type?: ErrorType;
}

export function runtimeErrorFromXHR(errorCode: ErrorCode, httpRequest: HttpRequest): RuntimeError {
  return {
    errorCode,
    type: ErrorType.Http,
    details: {
      url: httpRequest.url,
      method: httpRequest.method,
      status: httpRequest.xmlHttpRequest.status,
      response: httpRequest.xmlHttpRequest.response,
      responseURL: httpRequest.xmlHttpRequest.responseURL
    }
  };
}

export function mapToRuntimeError(errorCode: ErrorCode, details?: any): (error: any) => Promise<any> {
  return (error: any) => {
    if (!isRuntimeError(error)) {
      error = {
        errorCode: ErrorCode.UnknownError,
        details: error.toString()
      };
    }
    return Promise.reject({
      errorCode,
      details,
      cause: error
    });
  };
}

export function isRuntimeError(runtimeError: any): runtimeError is RuntimeError {
  return !isNullOrUndefined(runtimeError)
    && runtimeError.errorCode
    && Object.values(ErrorCode).includes(runtimeError.errorCode);
}

export function causedByHttp401(runtimeError: RuntimeError): boolean {
  if (!isRuntimeError(runtimeError)) {
    return false;
  }
  if (runtimeError.type === ErrorType.Http
        && runtimeError.details.status === 401) {
    return true;
  }
  return causedByHttp401(runtimeError.cause);
}
