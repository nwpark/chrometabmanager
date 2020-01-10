export class InvalidSessionError extends TypeError {
  constructor(...params) {
    super(...params);
    this.name = 'InvalidSessionError';
  }
}
