import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {ChromeAPIWindowState, WindowListState} from '../../types/chrome-a-p-i-window-state';

@Component({
  selector: 'app-saved-window-list',
  templateUrl: './saved-window-list.component.html',
  styleUrls: ['./saved-window-list.component.css']
})
export class SavedWindowListComponent implements OnInit {

  windowListState: WindowListState;

  constructor(public savedTabsService: SavedTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.savedTabsService.getWindowListState();
    this.savedTabsService.windowStateUpdated$.subscribe(windowListState => {
      this.windowListState = windowListState;
      this.changeDetectorRef.detectChanges();
    });
  }

  addNewWindow() {
    this.savedTabsService.createNewWindow();
  }

  toggleDisplay() {
    this.savedTabsService.toggleWindowListDisplay();
  }
}
