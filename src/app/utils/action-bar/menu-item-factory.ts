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
}
