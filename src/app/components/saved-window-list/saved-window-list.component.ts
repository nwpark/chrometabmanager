import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {WindowListState} from '../../types/window-list-state';
import {WindowCategory} from '../../types/chrome-window-component-data';

@Component({
  selector: 'app-saved-window-list',
  templateUrl: './saved-window-list.component.html',
  styleUrls: ['./saved-window-list.component.css']
})
export class SavedWindowListComponent implements OnInit {

  windowListState: WindowListState;
  windowCategory = WindowCategory.Saved;

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
