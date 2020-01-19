import {ActionButtonCallback, SessionActionButton} from '../../types/action-bar/session-action-button';

export class ActionButtonFactory {
  static createCloseButton(callback: ActionButtonCallback): SessionActionButton {
    return {
      title: 'Close window',
      icon: 'close',
      callback
    };
  }

  static createMinimizeButton(callback: ActionButtonCallback): SessionActionButton {
    return {
      title: 'Minimize window',
      titleWhenHidden: 'Show window',
      icon: 'arrow_drop_down',
      iconWhenHidden: 'arrow_right',
      callback
    };
  }
}
