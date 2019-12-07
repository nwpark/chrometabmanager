import {Injectable} from '@angular/core';
import {merge, MonoTypeOperatorFunction, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';
import {SavedTabsService} from './saved-tabs.service';
import {ChromeTabsService} from './chrome-tabs.service';
import {WindowListId} from '../types/chrome-window-component-data';
import {SessionUtils} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  static CONNECTED_WINDOW_LIST_IDS = [WindowListId.Saved, WindowListId.Active];

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
    const savedWindowIds = Object.keys(this.savedTabsService.getSessionListState().chromeSessions)
      .map(sessionId => sessionId.toString());
    const activeWindowIds = Object.keys(this.chromeTabsService.getSessionListState().chromeSessions)
      .map(sessionId => sessionId.toString());
    this.connectedWindowIds = [...savedWindowIds, ...activeWindowIds];
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
