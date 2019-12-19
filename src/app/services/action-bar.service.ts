import {Injectable} from '@angular/core';
import {ChromeTabsService} from './chrome-tabs.service';
import {SavedTabsService} from './saved-tabs.service';
import {ActionButtonFactory, SessionMenuItem, ListActionButton, ListActionButtonFactory} from '../types/action-bar';
import {RecentlyClosedTabsService} from './recently-closed-tabs.service';
import {SessionListId} from '../types/chrome-window-component-data';

@Injectable({
  providedIn: 'root'
})
export class ActionBarService {

  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService) { }

  createSessionActionButtons(windowCategory: SessionListId): SessionMenuItem[] {
    switch (windowCategory) {
      case SessionListId.Active: return this.createActiveWindowActionButtons();
      case SessionListId.Saved: return this.createSavedWindowActionButtons();
      case SessionListId.RecentlyClosed: return this.createRecentlyClosedWindowActionButtons();
    }
  }

  createListActionButtons(windowCategory: SessionListId): ListActionButton[] {
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

  private createActiveWindowActionButtons(): SessionMenuItem[] {
    return [
      ActionButtonFactory.createSaveButton(sessionIndex => {
        const sessionState = this.chromeTabsService.getSessionListState().getSessionState(sessionIndex);
        this.savedTabsService.insertWindow(sessionState, 0);
      }),
      ActionButtonFactory.createSortButton(sessionIndex => {
        this.chromeTabsService.sortTabsInWindow(sessionIndex);
      })
    ];
  }

  private createSavedWindowActionButtons(): SessionMenuItem[] {
    return [
      ActionButtonFactory.createOpenButton(sessionIndex => {
        const sessionState = this.savedTabsService.getSessionListState().getSessionState(sessionIndex);
        this.chromeTabsService.insertWindow(sessionState, 0);
      }),
      ActionButtonFactory.createSortButton(sessionIndex => {
        this.savedTabsService.sortTabsInWindow(sessionIndex);
      })
    ];
  }

  private createRecentlyClosedWindowActionButtons(): SessionMenuItem[] {
    return [
      ActionButtonFactory.createOpenButton(sessionIndex => {
        const sessionState = this.recentlyClosedTabsService.getSessionListState().getSessionState(sessionIndex);
        this.chromeTabsService.insertWindow(sessionState, 0);
      })
    ];
  }
}
