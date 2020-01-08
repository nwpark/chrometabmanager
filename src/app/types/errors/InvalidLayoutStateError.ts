export class InvalidLayoutStateError extends TypeError {
  constructor(...params) {
    super(...params);
    this.name = 'InvalidLayoutStateError';
  }
}
