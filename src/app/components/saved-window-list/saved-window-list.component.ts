import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {WindowListState} from '../../types/window-list-state';
import {WindowCategory} from '../../types/chrome-window-component-data';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {ChromeTabsService} from '../../services/chrome-tabs.service';

@Component({
  selector: 'app-saved-window-list',
  templateUrl: './saved-window-list.component.html',
  styleUrls: ['./saved-window-list.component.css']
})
export class SavedWindowListComponent implements OnInit {

  windowListState: WindowListState;
  windowCategory = WindowCategory.Saved;
  actionButtons: ActionButton[];

  constructor(public savedTabsService: SavedTabsService,
              private chromeTabsService: ChromeTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.savedTabsService.getWindowListState();
    this.initActionButtons();
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

  initActionButtons() {
    this.actionButtons = [
      ActionButtonFactory.createOpenButton(chromeWindow => {
        this.chromeTabsService.createWindow(chromeWindow);
      }),
      ActionButtonFactory.createMinimizeButton(chromeWindow => {
        this.savedTabsService.toggleWindowDisplay(chromeWindow.id);
      }),
      ActionButtonFactory.createCloseButton(chromeWindow => {
        this.savedTabsService.removeWindow(chromeWindow.id);
      })
    ];
  }
}
