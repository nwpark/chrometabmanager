import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {WindowListState} from '../../types/window-list-state';
import {ChromeWindowComponentProps, WindowCategory} from '../../types/chrome-window-component-data';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {DragDropService} from '../../services/drag-drop.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-saved-window-list',
  templateUrl: './saved-window-list.component.html',
  styleUrls: ['./saved-window-list.component.css']
})
export class SavedWindowListComponent implements OnInit {

  windowListState: WindowListState;
  actionButtons: ActionButton[];
  windowProps: ChromeWindowComponentProps;

  windowListId = DragDropService.SAVED_WINDOW_LIST_ID;
  connectedWindowListIds = DragDropService.CONNECTED_WINDOW_LIST_IDS;

  constructor(public savedTabsService: SavedTabsService,
              private chromeTabsService: ChromeTabsService,
              private dragDropService: DragDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.savedTabsService.getWindowListState();
    this.windowProps = {
      category: WindowCategory.Saved,
      tabsService: this.savedTabsService,
      windowIsMutable: true
    };
    this.actionButtons = ActionButtonFactory
      .createSavedWindowActionButtons(this.savedTabsService, this.chromeTabsService);
    this.dragDropService.ignoreWhenDragging(this.savedTabsService.windowStateUpdated$)
      .subscribe(windowListState => {
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

  beginDrag() {
    this.dragDropService.beginDrag();
  }

  windowDropped(event: CdkDragDrop<any>) {
    try {
      if (event.previousContainer === event.container) {
        this.savedTabsService.moveWindowInList(event.previousIndex, event.currentIndex);
      } else {
        this.chromeTabsService.removeWindow(event.item.data.id);
        this.savedTabsService.insertWindow(event.item.data, event.currentIndex);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }
}
