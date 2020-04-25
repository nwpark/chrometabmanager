import {ErrorCode} from '../types/errors/error-code';

export function patchesSynchronizedData(): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      return this.driveAccountService.getLoginStatus().then(loginStatus => {
        if (loginStatus.syncInProgress) {
          return Promise.reject(ErrorCode.AttemptedPatchDuringSync);
        } else {
          return originalMethod.apply(this, args);
        }
      }).then(result => {
        this.syncStorageService.notifyOtherDevices();
        return result;
      });
    };

    return descriptor;
  };
}
