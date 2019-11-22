import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {WindowListState} from '../../types/window-list-state';
import {WindowCategory} from '../../types/chrome-window-component-data';

@Component({
  selector: 'app-active-window-list',
  templateUrl: './active-window-list.component.html',
  styleUrls: ['./active-window-list.component.css']
})
export class ActiveWindowListComponent implements OnInit {

  windowListState: WindowListState;
  windowCategory = WindowCategory.Active;

  constructor(public chromeTabsService: ChromeTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.chromeTabsService.getWindowListState();
    this.chromeTabsService.windowStateUpdated$.subscribe(windowListState => {
      this.windowListState = windowListState;
      this.changeDetectorRef.detectChanges();
    });
  }

  toggleDisplay() {
    this.chromeTabsService.toggleWindowListDisplay();
  }
}
