export interface StateModifierParams {
  storeResult?: boolean;
}

export function modifiesState(params?: StateModifierParams): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      const result = originalMethod.apply(this, args);
      this.onStateModified(params);
      return result;
    };

    return descriptor;
  };
}
