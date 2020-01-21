import {Injectable} from '@angular/core';
import {ChromeTabsService} from './tabs/chrome-tabs.service';
import {SavedTabsService} from './tabs/saved-tabs.service';
import {RecentlyClosedTabsService} from './tabs/recently-closed-tabs.service';
import {SessionListId} from '../types/chrome-window-component-data';
import {SessionMenuItem} from '../types/action-bar/session-menu-item';
import {ListActionButton} from '../types/action-bar/list-action-button';
import {ListActionButtonFactory} from '../utils/action-bar/list-action-button-factory';
import {MenuItemFactory} from '../utils/action-bar/menu-item-factory';

@Injectable({
  providedIn: 'root'
})
export class ActionBarService {

  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService) { }

  createSessionMenuItems(sessionCategory: SessionListId): SessionMenuItem[] {
    switch (sessionCategory) {
      case SessionListId.Active: return this.createActiveSessionMenuItems();
      case SessionListId.Saved: return this.createSavedSessionMenuItems();
      case SessionListId.RecentlyClosed: return this.createClosedSessionMenuItems();
    }
  }

  createListActionButtons(sessionCategory: SessionListId): ListActionButton[] {
    switch (sessionCategory) {
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

  private createActiveSessionMenuItems(): SessionMenuItem[] {
    return [
      MenuItemFactory.createSaveButton(sessionIndex => {
        const sessionState = this.chromeTabsService.getSessionListState().getSessionState(sessionIndex);
        this.savedTabsService.insertWindow(sessionState, 0);
      }),
      MenuItemFactory.createSortButton(sessionIndex => {
        this.chromeTabsService.sortTabsInWindow(sessionIndex);
      }),
      MenuItemFactory.createSuspendTabsButton(sessionIndex => {
        this.chromeTabsService.suspendTabsInWindow(sessionIndex);
      })
    ];
  }

  private createSavedSessionMenuItems(): SessionMenuItem[] {
    return [
      MenuItemFactory.createOpenButton(sessionIndex => {
        const sessionState = this.savedTabsService.getSessionListState().getSessionState(sessionIndex);
        this.chromeTabsService.insertWindow(sessionState, 0);
      }),
      MenuItemFactory.createSortButton(sessionIndex => {
        this.savedTabsService.sortTabsInWindow(sessionIndex);
      })
    ];
  }

  private createClosedSessionMenuItems(): SessionMenuItem[] {
    return [
      MenuItemFactory.createOpenButton(sessionIndex => {
        const sessionState = this.recentlyClosedTabsService.getSessionListState().getSessionState(sessionIndex);
        this.chromeTabsService.insertWindow(sessionState, 0);
      })
    ];
  }
}
