export function performsSynchronization(): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      return this.driveAccountService.setSyncInProgress(true).then(() => {
        return originalMethod.apply(this, args).then(res => {
          return this.driveAccountService.setSyncInProgress(false).then(() => {
            return Promise.resolve(res);
          });
        }, reason => {
          return this.driveAccountService.setSyncInProgress(false).then(() => {
            return Promise.reject(reason);
          });
        });
      });
    };

    return descriptor;
  };
}
