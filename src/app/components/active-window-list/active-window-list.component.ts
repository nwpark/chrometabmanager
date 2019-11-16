import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {WindowListState} from '../../types/chrome-a-p-i-window-state';

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
    this.chromeTabsService.windowStateUpdated$.subscribe(windowListState => {
      this.windowListState = windowListState;
      this.changeDetectorRef.detectChanges();
    });
    this.chromeTabsService.refreshState();
  }

  toggleDisplay() {
    this.chromeTabsService.toggleDisplay();
  }

}
