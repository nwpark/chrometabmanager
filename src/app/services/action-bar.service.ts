import {Injectable} from '@angular/core';
import {ChromeTabsService} from './chrome-tabs.service';
import {SavedTabsService} from './saved-tabs.service';
import {ActionButtonFactory, ActionMenuItem, ListActionButton, ListActionButtonFactory} from '../types/action-bar';
import {RecentlyClosedTabsService} from './recently-closed-tabs.service';
import {SessionListId} from '../types/chrome-window-component-data';

@Injectable({
  providedIn: 'root'
})
export class ActionBarService {

  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService) { }

  createWindowActionButtons(windowCategory: SessionListId): ActionMenuItem[] {
    switch (windowCategory) {
      case SessionListId.Active: return this.createActiveWindowActionButtons();
      case SessionListId.Saved: return this.createSavedWindowActionButtons();
      case SessionListId.RecentlyClosed: return this.createRecentlyClosedWindowActionButtons();
    }
  }

  createWindowListActionButtons(windowCategory: SessionListId): ListActionButton[] {
    switch (windowCategory) {
      case SessionListId.Active: return [];
      case SessionListId.Saved: return this.createSavedWindowListActionButtons();
      case SessionListId.RecentlyClosed: return this.createRecentlyClosedListActionButtons();
    }
  }

  private createSavedWindowListActionButtons(): ListActionButton[] {
    return [
      ListActionButtonFactory.createNewWindowButton(() => {
        this.savedTabsService.createNewWindow();
      })
    ];
  }

  private createRecentlyClosedListActionButtons(): ListActionButton[] {
    return [
      ListActionButtonFactory.createClearButton(() => {
        this.recentlyClosedTabsService.clear();
      })
    ];
  }

  private createActiveWindowActionButtons(): ActionMenuItem[] {
    return [
      ActionButtonFactory.createSaveButton(sessionState => {
        this.savedTabsService.insertWindow(sessionState, 0);
      })
    ];
  }

  private createSavedWindowActionButtons(): ActionMenuItem[] {
    return [
      ActionButtonFactory.createOpenButton(sessionState => {
        this.chromeTabsService.insertWindow(sessionState, 0);
      })
    ];
  }

  private createRecentlyClosedWindowActionButtons(): ActionMenuItem[] {
    return [
      ActionButtonFactory.createOpenButton(sessionState => {
        this.chromeTabsService.insertWindow(sessionState, 0);
      })
    ];
  }
}
