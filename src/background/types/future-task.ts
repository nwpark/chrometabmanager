import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';
import {ErrorCode} from '../../app/types/errors/error-code';
import {runtimeError} from '../../app/types/errors/runtime-error';

export class FutureTask<T> {
  private result = new Subject<T>();

  constructor(private callback: () => Promise<T>) { }

  run(): Promise<T> {
    this.callback()
      .then(res => this.result.next(res))
      .catch(err => this.result.error(err))
      .finally(() => this.result.complete());
    return this.toPromise();
  }

  cancel(errorCode: ErrorCode) {
    this.result.error(runtimeError(errorCode));
    this.result.complete();
  }

  toPromise(): Promise<T> {
    return this.result.pipe(take(1)).toPromise();
  }
}
