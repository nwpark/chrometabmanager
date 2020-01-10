export class UndefinedObjectError extends TypeError {
  constructor(...params) {
    super(...params);
    this.name = 'UndefinedObjectError';
  }
}
