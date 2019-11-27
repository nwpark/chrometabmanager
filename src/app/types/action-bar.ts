import {ChromeAPIWindowState} from './chrome-api-types';
import {SavedTabsService} from '../services/saved-tabs.service';
import {ChromeTabsService} from '../services/chrome-tabs.service';
import {RecentlyClosedTabsService} from '../services/recently-closed-tabs.service';

export interface ActionButton {
  title: string;
  titleWhenHidden?: string;
  icon: string;
  iconWhenHidden?: string;
  requiresMouseover: boolean;
  callback: (chromeWindow: ChromeAPIWindowState) => void;
}

export class ActionButtonFactory {
  static createActiveWindowActionButtons(
    savedTabsService: SavedTabsService,
    chromeTabsService: ChromeTabsService
  ): ActionButton[] {
    return [
      ActionButtonFactory.createSaveButton(chromeWindow => {
        savedTabsService.insertWindow(chromeWindow, 0);
      }),
      ActionButtonFactory.createMinimizeButton(chromeWindow => {
        chromeTabsService.toggleWindowDisplay(chromeWindow.id);
      }),
      ActionButtonFactory.createCloseButton(chromeWindow => {
        chromeTabsService.removeWindow(chromeWindow.id);
      })
    ];
  }

  static createSavedWindowActionButtons(
    savedTabsService: SavedTabsService,
    chromeTabsService: ChromeTabsService
  ): ActionButton[] {
    return [
      ActionButtonFactory.createOpenButton(chromeWindow => {
        chromeTabsService.createWindow(chromeWindow);
      }),
      ActionButtonFactory.createMinimizeButton(chromeWindow => {
        savedTabsService.toggleWindowDisplay(chromeWindow.id);
      }),
      ActionButtonFactory.createCloseButton(chromeWindow => {
        savedTabsService.removeWindow(chromeWindow.id);
      })
    ];
  }

  static createRecentlyClosedWindowActionButtons(
    chromeTabsService: ChromeTabsService,
    recentlyClosedTabsService: RecentlyClosedTabsService
  ): ActionButton[] {
    return [
      ActionButtonFactory.createOpenButton(chromeWindow => {
        chromeTabsService.createWindow(chromeWindow);
      }),
      ActionButtonFactory.createMinimizeButton(chromeWindow => {
        recentlyClosedTabsService.toggleWindowDisplay(chromeWindow.id);
      }),
      ActionButtonFactory.createCloseButton(chromeWindow => {
        recentlyClosedTabsService.removeWindow(chromeWindow.id);
      })
    ];
  }

  static createCloseButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Close window',
      icon: 'close',
      requiresMouseover: false,
      callback
    };
  }

  static createMinimizeButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Show window',
      titleWhenHidden: 'Minimize window',
      icon: 'arrow_drop_down',
      iconWhenHidden: 'arrow_right',
      requiresMouseover: false,
      callback
    };
  }

  static createOpenButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Restore window',
      icon: 'open_in_new',
      requiresMouseover: true,
      callback
    };
  }

  static createSaveButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Save window',
      icon: 'save_alt',
      requiresMouseover: true,
      callback
    };
  }
}
