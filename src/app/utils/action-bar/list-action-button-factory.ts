import {ListActionButton} from '../../types/action-bar/list-action-button';

export class ListActionButtonFactory {
  static createNewWindowButton(callback: () => void): ListActionButton {
    return {
      title: 'Create new window',
      icon: 'add',
      requiresMouseover: false,
      callback
    };
  }

  static createMinimizeButton(callback: () => void): ListActionButton {
    return {
      title: 'Collapse',
      titleWhenHidden: 'Expand',
      icon: 'arrow_drop_down',
      iconWhenHidden: 'arrow_right',
      requiresMouseover: false,
      callback
    };
  }

  static createClearButton(callback: () => void): ListActionButton {
    return {
      title: 'Clear',
      titleWhenHidden: 'Clear',
      icon: 'clear',
      requiresMouseover: true,
      callback
    };
  }
}
