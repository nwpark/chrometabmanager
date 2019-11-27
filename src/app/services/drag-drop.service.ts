import { Injectable } from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';
import {SavedTabsService} from './saved-tabs.service';
import {ChromeTabsService} from './chrome-tabs.service';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  static SAVED_WINDOW_LIST_ID = 'saved_window_list';
  static ACTIVE_WINDOW_LIST_ID = 'active_window_list';
  static CONNECTED_WINDOW_LIST_IDS = ['saved_window_list', 'active_window_list'];

  private dragStatusUpdated = new Subject<boolean>();
  private dragStatusUpdated$ = this.dragStatusUpdated.asObservable();

  private connectedWindowIdsUpdated = new Subject<string[]>();
  connectedWindowIdsUpdated$ = this.connectedWindowIdsUpdated.asObservable();

  connectedWindowIds: string[];

  private dragging = false;

  constructor(private savedTabsService: SavedTabsService,
              private chromeTabsService: ChromeTabsService) {
    this.refreshWindowIds();
    this.ignoreWhenDragging(this.savedTabsService.windowStateUpdated$)
      .subscribe(() => this.refreshWindowIds());
    this.ignoreWhenDragging(this.chromeTabsService.windowStateUpdated$)
      .subscribe(() => this.refreshWindowIds());
  }

  private refreshWindowIds() {
    const savedWindowIds = this.savedTabsService.getWindowListState().chromeAPIWindows
      .map(chromeWindow => chromeWindow.id.toString());
    const activeWindowIds = this.chromeTabsService.getWindowListState().chromeAPIWindows
      .map(chromeWindow => chromeWindow.id.toString());
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

  ignoreWhenDragging<T>(observable$: Observable<T>): Observable<T> {
    return merge(
      this.filterWhenDragging(observable$),
      this.bufferWhenDragging(observable$)
    );
  }

  filterWhenDragging<T>(observable$: Observable<T>): Observable<T> {
    return observable$.pipe(
      filter(() => !this.dragging),
    );
  }

  // Buffer events when an item is being dragged.
  // Emit the latest event when the item is dropped.
  bufferWhenDragging<T>(observable$: Observable<T>): Observable<T> {
    return observable$.pipe(
      filter(() => this.dragging),
      buffer(this.dragStatusUpdated$),
      filter(buff => buff.length > 0),
      map(buff => buff[buff.length - 1])
    );
  }
}
