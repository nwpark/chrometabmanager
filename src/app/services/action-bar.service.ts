import {Injectable} from '@angular/core';
import {ChromeTabsService} from './chrome-tabs.service';
import {SavedTabsService} from './saved-tabs.service';
import {ActionButton, ActionButtonFactory, ListActionButton, ListActionButtonFactory} from '../types/action-bar';
import {RecentlyClosedTabsService} from './recently-closed-tabs.service';
import {SessionListId} from '../types/chrome-window-component-data';

@Injectable({
  providedIn: 'root'
})
export class ActionBarService {

  // todo: store all values on initialization
  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService) { }

  createWindowActionButtons(windowCategory: SessionListId): ActionButton[] {
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

  private createActiveWindowActionButtons(): ActionButton[] {
    return [
      ActionButtonFactory.createSaveButton(sessionState => {
        this.savedTabsService.insertWindow(sessionState.session.window, sessionState.layoutState, 0);
      })
    ];
  }

  private createSavedWindowActionButtons(): ActionButton[] {
    return [
      ActionButtonFactory.createOpenButton(sessionState => {
        this.chromeTabsService.insertWindow(sessionState.session.window, sessionState.layoutState, 0);
      })
    ];
  }

  private createRecentlyClosedWindowActionButtons(): ActionButton[] {
    return [
      ActionButtonFactory.createOpenButton(sessionState => {
        this.chromeTabsService.insertWindow(sessionState.session.window, sessionState.layoutState, 0);
      })
    ];
  }
}
