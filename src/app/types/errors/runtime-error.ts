import {ErrorCode, ErrorType} from './error-code';
import {HttpRequest} from '../../../background/types/http-request';
import {isNullOrUndefined} from 'util';

export interface RuntimeError {
  readonly errorCode: ErrorCode;
  readonly details?: any;
  readonly cause?: RuntimeError;
  readonly type?: ErrorType;
  trace?: any[];
}

export function createRuntimeError(errorCode: ErrorCode, details?: string, cause?: any): RuntimeError {
  if (cause) {
    cause = convertToRuntimeError(cause);
  }
  return {errorCode, details, cause};
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

export function addErrorTrace(trace: any): (error: any) => Promise<any> {
  return (error: any) => {
    const runtimeError: RuntimeError = convertToRuntimeError(error);
    runtimeError.trace = runtimeError.trace || [];
    runtimeError.trace.unshift(trace);
    return Promise.reject(runtimeError);
  };
}

export function handleRuntimeError<T>(errorCode: ErrorCode, errorHandler: (error: RuntimeError) => T): (error) => Promise<T> {
  return (error: any) => {
    if (isRuntimeError(error) && error.errorCode === errorCode) {
      return Promise.resolve(errorHandler(error));
    }
    return Promise.reject(error);
  };
}

export function mapToRuntimeError(errorCode: ErrorCode, details?: any): (error: any) => Promise<any> {
  return (error: any) => {
    const runtimeError: RuntimeError = {errorCode, details, cause: convertToRuntimeError(error)};
    return Promise.reject(runtimeError);
  };
}

function convertToRuntimeError(error: any): RuntimeError {
  if (isRuntimeError(error)) {
    return error;
  }
  return {errorCode: ErrorCode.UnknownError, details: error.toString()};
}

export function isRuntimeError(error: any): error is RuntimeError {
  return !isNullOrUndefined(error)
    && error.errorCode
    && Object.values(ErrorCode).includes(error.errorCode);
}

export function causedByHttp401(error: RuntimeError): boolean {
  if (!isRuntimeError(error)) {
    return false;
  }
  if (error.type === ErrorType.Http
        && error.details.status === 401) {
    return true;
  }
  return causedByHttp401(error.cause);
}
