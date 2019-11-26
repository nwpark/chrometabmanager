import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {WindowListState} from '../../types/window-list-state';
import {WindowCategory} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {SavedTabsService} from '../../services/saved-tabs.service';

@Component({
  selector: 'app-active-window-list',
  templateUrl: './active-window-list.component.html',
  styleUrls: ['./active-window-list.component.css']
})
export class ActiveWindowListComponent implements OnInit {

  windowListState: WindowListState;
  windowCategory = WindowCategory.Active;
  actionButtons: ActionButton[];

  constructor(public chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private dragDropService: DragDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.chromeTabsService.getWindowListState();
    this.initActionButtons();
    this.dragDropService.ignoreWhenDragging(this.chromeTabsService.windowStateUpdated$)
      .subscribe(windowListState => {
        this.windowListState = windowListState;
        this.changeDetectorRef.detectChanges();
      });
  }

  toggleDisplay() {
    this.chromeTabsService.toggleWindowListDisplay();
  }

  initActionButtons() {
    this.actionButtons = [
      ActionButtonFactory.createSaveButton(chromeWindow => {
        this.savedTabsService.saveWindow(chromeWindow);
      }),
      ActionButtonFactory.createMinimizeButton(chromeWindow => {
        this.chromeTabsService.toggleWindowDisplay(chromeWindow.id);
      }),
      ActionButtonFactory.createCloseButton(chromeWindow => {
        this.chromeTabsService.removeWindow(chromeWindow.id);
      })
    ];
  }
}
