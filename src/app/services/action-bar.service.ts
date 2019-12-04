import {Injectable} from '@angular/core';
import {ChromeTabsService} from './chrome-tabs.service';
import {SavedTabsService} from './saved-tabs.service';
import {ActionButton, ActionButtonFactory, ListActionButton, ListActionButtonFactory} from '../types/action-bar';
import {RecentlyClosedTabsService} from './recently-closed-tabs.service';
import {WindowListId} from './drag-drop.service';

@Injectable({
  providedIn: 'root'
})
export class ActionBarService {

  // todo: store all values on initialization
  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService) { }

  createWindowActionButtons(windowCategory: WindowListId): ActionButton[] {
    switch (windowCategory) {
      case WindowListId.Active: return this.createActiveWindowActionButtons();
      case WindowListId.Saved: return this.createSavedWindowActionButtons();
      case WindowListId.RecentlyClosed: return this.createRecentlyClosedWindowActionButtons();
    }
  }

  createWindowListActionButtons(windowCategory: WindowListId): ListActionButton[] {
    switch (windowCategory) {
      case WindowListId.Active: return [];
      case WindowListId.Saved: return this.createSavedWindowListActionButtons();
    }
  }

  private createSavedWindowListActionButtons(): ListActionButton[] {
    return [
      ListActionButtonFactory.createNewWindowButton(() => {
        this.savedTabsService.createNewWindow();
      })
    ];
  }

  private createActiveWindowActionButtons(): ActionButton[] {
    return [
      ActionButtonFactory.createSaveButton(chromeWindow => {
        this.savedTabsService.insertWindow(chromeWindow, 0);
      })
    ];
  }

  private createSavedWindowActionButtons(): ActionButton[] {
    return [
      ActionButtonFactory.createOpenButton(chromeWindow => {
        this.chromeTabsService.createWindow(chromeWindow);
      })
    ];
  }

  private createRecentlyClosedWindowActionButtons(): ActionButton[] {
    return [
      ActionButtonFactory.createOpenButton(chromeWindow => {
        this.chromeTabsService.createWindow(chromeWindow);
      })
    ];
  }
}
