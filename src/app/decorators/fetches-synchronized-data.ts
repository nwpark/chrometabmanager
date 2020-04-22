export function fetchesSynchronizedData(): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      this.requestsInFlight++;
      return this.driveAccountService.setSyncInProgress(true).then(() => {
        return originalMethod.apply(this, args);
      }).finally(() => {
        this.requestsInFlight--;
        if (this.requestsInFlight === 0) {
          return this.driveAccountService.setSyncInProgress(false);
        }
      });
    };

    return descriptor;
  };
}
