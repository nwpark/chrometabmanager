import {Injectable} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChromeEventHandlerService {

  static readonly ACTIVE_WINDOWS_UPDATED = 'activeWindowsUpdated';

  private enableUpdatesSource = new Subject();
  private blocked = false;

  constructor() {}

  blockUpdates() {
    console.log('block updates');
    this.blocked = true;
  }

  enableUpdates() {
    console.log('enable updates');
    this.blocked = false;
    this.enableUpdatesSource.next();
  }

  addActiveWindowsUpdatedListener(callback: () => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message[ChromeEventHandlerService.ACTIVE_WINDOWS_UPDATED]) {
        callback();
      }
    });
  }

  getFilteredObservable<T>(observable$: Observable<T>): Observable<T> {
    return merge(
      this.filterBlockedUpdates(observable$),
      this.bufferUpdatesWhenBlocked(observable$)
    );
  }

  filterBlockedUpdates<T>(observable$: Observable<T>): Observable<T> {
    return observable$.pipe(
      filter(() => !this.blocked),
    );
  }

  bufferUpdatesWhenBlocked<T>(observable$: Observable<T>): Observable<T> {
    return observable$.pipe(
      filter(() => this.blocked),
      buffer(this.enableUpdatesSource.asObservable()),
      filter(buff => buff.length > 0),
      map(buff => buff[buff.length - 1])
    );
  }
}
