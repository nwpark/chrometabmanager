import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';

@Component({
  selector: 'app-draggable-chrome-tab',
  templateUrl: './draggable-chrome-tab.component.html',
  styleUrls: ['./draggable-chrome-tab.component.css']
})
export class DraggableChromeTabComponent implements OnInit {

  @Input() chromeTab: ChromeAPITabState;
  @Output() draggableChromeTabClose = new EventEmitter<any>();
  @Output() draggableChromeTabClick = new EventEmitter<any>();

  mouseOver: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

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
}
