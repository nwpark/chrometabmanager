import {noop} from 'rxjs';

export function ignoreChromeRuntimeErrors() {
  if (chrome.runtime.lastError) {
    // tslint:disable-next-line:no-unused-expression
    void(chrome.runtime.lastError.message);
  }
}

export function ignoreErrors<T>(promise: Promise<T>): Promise<T | void> {
  return promise.catch(noop);
}

export function promiseResolvedWithoutErrors(promise: Promise<any>): Promise<boolean> {
  return promise.then(() => true).catch(() => false);
}
