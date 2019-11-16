import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-a-p-i-window-state';
import {ChromeTabsService} from '../../services/chrome-tabs.service';

@Component({
  selector: 'app-draggable-chrome-tab',
  templateUrl: './draggable-chrome-tab.component.html',
  styleUrls: ['./draggable-chrome-tab.component.css']
})
export class DraggableChromeTabComponent implements OnInit {

  @Input() chromeTab: ChromeAPITabState;
  @Output() close = new EventEmitter<any>();

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

  closeTab() {
    this.close.emit(this.chromeTab.id);
  }

}
