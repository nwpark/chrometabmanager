import {SessionState} from './session-state';

type ActionButtonCallback = (sessionState: SessionState) => void;

export interface SessionActionButton {
  title: string;
  titleWhenHidden?: string;
  icon: string;
  iconWhenHidden?: string;
  callback: ActionButtonCallback;
}

export interface SessionMenuItem {
  title: string;
  icon: string;
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

  static createCloseButton(callback: ActionButtonCallback): SessionActionButton {
    return {
      title: 'Close window',
      icon: 'close',
      callback
    };
  }

  static createMinimizeButton(callback: ActionButtonCallback): SessionActionButton {
    return {
      title: 'Show window',
      titleWhenHidden: 'Minimize window',
      icon: 'arrow_drop_down',
      iconWhenHidden: 'arrow_right',
      callback
    };
  }

  static createOpenButton(callback: ActionButtonCallback): SessionMenuItem {
    return {
      title: 'Restore window',
      icon: 'open_in_new',
      callback
    };
  }

  static createSaveButton(callback: ActionButtonCallback): SessionMenuItem {
    return {
      title: 'Save window',
      icon: 'save_alt',
      callback
    };
  }
}
