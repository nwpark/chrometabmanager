import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {WindowListState} from '../../types/window-list-state';
import {ChromeWindowComponentProps, WindowCategory} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-active-window-list',
  templateUrl: './active-window-list.component.html',
  styleUrls: ['./active-window-list.component.css']
})
export class ActiveWindowListComponent implements OnInit {

  windowListState: WindowListState;
  actionButtons: ActionButton[];
  windowProps: ChromeWindowComponentProps;

  windowListId = DragDropService.ACTIVE_WINDOW_LIST_ID;
  connectedWindowListIds = DragDropService.CONNECTED_WINDOW_LIST_IDS;

  constructor(public chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private dragDropService: DragDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.chromeTabsService.getWindowListState();
    this.windowProps = {
      category: WindowCategory.Active,
      tabsService: this.chromeTabsService,
      windowIsMutable: true
    };
    this.actionButtons = ActionButtonFactory
      .createActiveWindowActionButtons(this.savedTabsService, this.chromeTabsService);
    this.dragDropService.ignoreWhenDragging(this.chromeTabsService.windowStateUpdated$)
      .subscribe(windowListState => {
        this.windowListState = windowListState;
        this.changeDetectorRef.detectChanges();
      });
  }

  toggleDisplay() {
    this.chromeTabsService.toggleWindowListDisplay();
  }

  beginDrag() {
    this.dragDropService.beginDrag();
  }

  windowDropped(event: CdkDragDrop<any>) {
    try {
      if (event.previousContainer === event.container) {
        this.chromeTabsService.moveWindowInList(event.previousIndex, event.currentIndex);
      } else {
        this.savedTabsService.removeWindow(event.item.data.id);
        this.chromeTabsService.insertWindow(event.item.data, event.currentIndex);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }
}
