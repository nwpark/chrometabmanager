import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';

@Component({
  selector: 'app-draggable-chrome-tab',
  templateUrl: './draggable-chrome-tab.component.html',
  styleUrls: ['./draggable-chrome-tab.component.css']
})
export class DraggableChromeTabComponent<T> implements OnInit {

  @Input() chromeTab: ChromeAPITabState<T>;
  @Input() timestamp: number;
  @Output() draggableChromeTabClose = new EventEmitter();
  @Output() draggableChromeTabClick = new EventEmitter();

  mouseOver: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  // todo: use mouseover directive
  @HostListener('mouseenter') onMouseEnter() {
    this.mouseOver = true;
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.mouseOver = false;
    this.changeDetectorRef.detectChanges();
  }

  get title() {
    return this.chromeTab.title.length > 0
      ? this.chromeTab.title
      : this.chromeTab.url;
  }

  get timestampString(): string {
    return new Date(this.timestamp).toTimeString().substring(0, 5);
  }
}
