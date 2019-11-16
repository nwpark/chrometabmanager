export function modifiesState(): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      const result = originalMethod.apply(this, args);
      this.onStateUpdated();
      return result;
    };

    return descriptor;
  };
}
