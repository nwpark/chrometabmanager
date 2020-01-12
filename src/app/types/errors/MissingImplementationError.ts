export class MissingImplementationError extends TypeError {
  constructor(...params) {
    super(...params);
    this.name = 'MissingImplementationError';
  }
}
