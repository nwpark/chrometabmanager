import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {ChromeAPIWindowState, WindowListState} from '../../types/chrome-a-p-i-window-state';

@Component({
  selector: 'app-active-window-list',
  templateUrl: './active-window-list.component.html',
  styleUrls: ['./active-window-list.component.css']
})
export class ActiveWindowListComponent implements OnInit {

  windowListState: WindowListState;

  constructor(private chromeTabsService: ChromeTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.chromeTabsService.getWindowListState();
    this.chromeTabsService.windowStateUpdated$.subscribe(windowListState => {
      this.windowListState = windowListState;
      this.triggerVirtualScrollViewportUpdate(windowListState.chromeAPIWindows);
      this.changeDetectorRef.detectChanges();
    });
  }

  toggleDisplay() {
    this.chromeTabsService.toggleWindowListDisplay();
  }

  triggerVirtualScrollViewportUpdate(chromeAPIWindows: ChromeAPIWindowState[]) {
    this.windowListState.chromeAPIWindows = [...chromeAPIWindows];
  }

}
