import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';

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

  cancel(reason: any) {
    this.result.error(reason);
    this.result.complete();
  }

  toPromise(): Promise<T> {
    return this.result.pipe(take(1)).toPromise();
  }
}
