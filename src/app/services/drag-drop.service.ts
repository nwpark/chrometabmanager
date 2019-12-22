import {Injectable} from '@angular/core';
import {merge, MonoTypeOperatorFunction, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';
import {SavedTabsService} from './tabs/saved-tabs.service';
import {ChromeTabsService} from './tabs/chrome-tabs.service';
import {SessionListId} from '../types/chrome-window-component-data';
import {SessionUtils} from '../utils/session-utils';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  static CONNECTED_WINDOW_LIST_IDS = [SessionListId.Saved, SessionListId.Active];

  private dragStatusUpdated = new Subject<boolean>();
  private dragStatusUpdated$ = this.dragStatusUpdated.asObservable();

  private connectedWindowIdsUpdated = new Subject<string[]>();
  connectedWindowIdsUpdated$ = this.connectedWindowIdsUpdated.asObservable();

  connectedWindowIds: string[];

  private dragging = false;

  constructor(private savedTabsService: SavedTabsService,
              private chromeTabsService: ChromeTabsService) {
    this.refreshWindowIds();
    this.savedTabsService.sessionStateUpdated$
      .pipe(this.ignoreWhenDragging())
      .subscribe(() => this.refreshWindowIds());
    this.chromeTabsService.sessionStateUpdated$
      .pipe(this.ignoreWhenDragging())
      .subscribe(() => this.refreshWindowIds());
  }

  private refreshWindowIds() {
    const savedSessionIds = this.savedTabsService.getSessionListState().getSessionIds();
    const activeSessionIds = this.chromeTabsService.getSessionListState().getSessionIds();
    this.connectedWindowIds = [...savedSessionIds, ...activeSessionIds];
    this.connectedWindowIdsUpdated.next(this.connectedWindowIds);
  }

  beginDrag() {
    this.dragging = true;
    this.dragStatusUpdated.next(this.dragging);
  }

  endDrag() {
    this.dragging = false;
    this.dragStatusUpdated.next(this.dragging);
  }

  isDragging() {
    return this.dragging;
  }

  ignoreWhenDragging<T>(): MonoTypeOperatorFunction<T> {
    return (source$: Observable<T>) => merge(
      source$.pipe(this.filterWhenDragging()),
      source$.pipe(this.bufferWhenDragging())
    );
  }

  filterWhenDragging<T>(): MonoTypeOperatorFunction<T> {
    return (source$: Observable<T>) => source$.pipe(
      filter(() => !this.dragging),
    );
  }

  bufferWhenDragging<T>(): MonoTypeOperatorFunction<T> {
    return (source$: Observable<T>) => source$.pipe(
      filter(() => this.dragging),
      buffer(this.dragStatusUpdated$),
      filter(buff => buff.length > 0),
      map(buff => buff[buff.length - 1])
    );
  }
}
