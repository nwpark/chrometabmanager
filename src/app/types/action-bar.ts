import {SessionState} from './session-list-state';

type ActionButtonCallback = (sessionState: SessionState) => void;

export interface ActionButton {
  title: string;
  titleWhenHidden?: string;
  icon: string;
  iconWhenHidden?: string;
  requiresMouseover: boolean;
  callback: ActionButtonCallback;
}

export interface ListActionButton {
  title: string;
  titleWhenHidden?: string;
  icon: string;
  iconWhenHidden?: string;
  requiresMouseover: boolean;
  callback: () => void;
}

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

export class ActionButtonFactory {

  static createCloseButton(callback: ActionButtonCallback): ActionButton {
    return {
      title: 'Close window',
      icon: 'close',
      requiresMouseover: false,
      callback
    };
  }

  static createMinimizeButton(callback: ActionButtonCallback): ActionButton {
    return {
      title: 'Show window',
      titleWhenHidden: 'Minimize window',
      icon: 'arrow_drop_down',
      iconWhenHidden: 'arrow_right',
      requiresMouseover: false,
      callback
    };
  }

  static createOpenButton(callback: ActionButtonCallback): ActionButton {
    return {
      title: 'Restore window',
      icon: 'open_in_new',
      requiresMouseover: true,
      callback
    };
  }

  static createSaveButton(callback: ActionButtonCallback): ActionButton {
    return {
      title: 'Save window',
      icon: 'save_alt',
      requiresMouseover: true,
      callback
    };
  }
}
