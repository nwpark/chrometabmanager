import { Injectable } from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  private dragStatusUpdated = new Subject<boolean>();
  public dragStatusUpdated$ = this.dragStatusUpdated.asObservable();

  private dragging = false;

  constructor() { }

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

  // Buffer events when item is being dragged.
  // Emit latest event when item is dropped.
  bufferWhenDragging<T>(observable$: Observable<T>): Observable<T> {
    return observable$.pipe(
      filter(() => this.dragging),
      buffer(this.dragStatusUpdated$),
      filter(buff => buff.length > 0),
      map(buff => buff[buff.length - 1])
    );
  }
}
