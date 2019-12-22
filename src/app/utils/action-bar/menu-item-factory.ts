import {MenuItemCallback, SessionMenuItem} from '../../types/action-bar/session-menu-item';

export class MenuItemFactory {
  static createOpenButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Restore window',
      icon: 'open_in_new',
      callback
    };
  }

  static createSaveButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Save window',
      icon: 'save_alt',
      callback
    };
  }

  static createSortButton(callback: MenuItemCallback): SessionMenuItem {
    return {
      title: 'Sort tabs',
      icon: 'sort',
      callback
    };
  }
}
