import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {ContextMenuItem} from '../../types/action-bar/context-menu-item';
import {fromEvent, Subject} from 'rxjs';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent implements OnInit, OnDestroy {

  private readonly CLOSING_ANIMATION_DURATION = 200;

  @ViewChild(MatMenuTrigger, {static: true}) private _contextMenuTrigger: MatMenuTrigger;
  @ViewChild('contextMenuContent', {static: true}) private _contextMenuContent: ElementRef;

  private _ngUnsubscribe = new Subject<void>();
  private _contextMenuClosedSubject = new Subject<void>();

  contextMenuClosed$ = this._contextMenuClosedSubject.asObservable();
  menuItems: ContextMenuItem[];
  _contextMenuPositionX: string;
  _contextMenuPositionY: string;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this._contextMenuTrigger.openMenu();
    }, 0);
    /* Use fromEvent because HostListener does not support the `useCapture` option.
     * (see https://github.com/angular/angular/issues/11200) */
    fromEvent(document, 'mousedown', {capture: true}).pipe(
      takeUntil(this._ngUnsubscribe)
    ).subscribe(event => {
      if (!this._contextMenuContent.nativeElement.contains(event.target)) {
        this._contextMenuTrigger.closeMenu();
      }
    });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  setPosition(x: number, y: number) {
    this._contextMenuPositionX = `${x}px`;
    this._contextMenuPositionY = `${y}px`;
  }

  _contextMenuClosed() {
    setTimeout(() => {
      this._contextMenuClosedSubject.next();
    }, this.CLOSING_ANIMATION_DURATION);
  }
}
