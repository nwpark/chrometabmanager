import {MenuItemCallback, SessionMenuItem} from '../../types/action-bar/session-menu-item';

export class MenuItemFactory {
  static createOpenButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Restore window',
      icon: 'open_in_new',
      tooltip: 'Open tabs in a new window',
      callback
    };
  }

  static createSaveButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Save window',
      icon: 'save_alt',
      tooltip: 'Save window',
      callback
    };
  }

  static createSortButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Sort tabs',
      icon: 'sort',
      tooltip: 'Sort tabs by URL',
      callback
    };
  }

  static createSuspendTabsButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Suspend tabs',
      icon: 'pause_circle_filled',
      // tooltip: 'Suspend tabs to free up memory and CPU consumed by Chrome. Tabs will be reloaded when next activated',
      tooltip: 'Suspend tabs to free up memory and CPU consumed by Chrome. Suspended tabs will remain visible on the tab strip but will be reloaded when next activated.',
      callback
    };
  }

  static createRemoveDuplicateTabsButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Remove duplicate tabs',
      icon: 'delete_sweep',
      tooltip: 'Remove duplicate tabs',
      callback
    };
  }
}
