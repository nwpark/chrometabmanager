import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material';
import {delay} from 'rxjs/operators';
import {ContextMenuItem} from '../../types/action-bar/context-menu-item';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent implements OnInit, OnDestroy {

  private readonly CLOSING_ANIMATION_DURATION = 200;

  @ViewChild(MatMenuTrigger, {static: true}) contextMenuTrigger: MatMenuTrigger;
  @ViewChild('contextMenuContent', {static: true}) contextMenuContent: ElementRef;

  menuItems: ContextMenuItem[];
  contextMenuPositionX: string;
  contextMenuPositionY: string;
  contextMenuClosed = new Subject<void>();

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.contextMenuTrigger.openMenu();
    }, 0);
    this.contextMenuTrigger.menuClosed.pipe(
      delay(this.CLOSING_ANIMATION_DURATION),
    ).subscribe(this.contextMenuClosed);
  }

  ngOnDestroy() {
    this.contextMenuClosed.complete();
  }

  setPosition(x: number, y: number) {
    this.contextMenuPositionX = `${x}px`;
    this.contextMenuPositionY = `${y}px`;
  }

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:auxclick', ['$event'])
  _handleClick(event) {
    if (!this.contextMenuContent.nativeElement.contains(event.target)) {
      this.contextMenuTrigger.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  _handleEscapeKeydown() {
    this.contextMenuTrigger.closeMenu();
  }
}
