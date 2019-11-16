import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {WindowListState} from '../../types/chrome-a-p-i-window-state';

@Component({
  selector: 'app-saved-window-list',
  templateUrl: './saved-window-list.component.html',
  styleUrls: ['./saved-window-list.component.css']
})
export class SavedWindowListComponent implements OnInit {

  windowListState: WindowListState;

  constructor(private savedTabsService: SavedTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.savedTabsService.windowStateUpdated$.subscribe(windowListState => {
      this.windowListState = windowListState;
      this.changeDetectorRef.detectChanges();
    });
    this.savedTabsService.refreshState();
  }

  addNewWindow() {
    this.savedTabsService.createNewWindow();
  }

  toggleDisplay() {
    this.savedTabsService.toggleDisplay();
  }

}
