import {ChromeAPIWindowState} from './chrome-api-types';

export interface ActionButton {
  title: string;
  titleWhenHidden: string;
  icon: string;
  iconWhenHidden: string;
  requiresMouseover: boolean;
  callback: (chromeWindow: ChromeAPIWindowState) => void;
}

export class ActionButtonFactory {
  static createCloseButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Close window',
      icon: 'close',
      requiresMouseover: false,
      callback
    } as ActionButton;
  }

  static createMinimizeButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Show window',
      titleWhenHidden: 'Minimize window',
      icon: 'arrow_drop_down',
      iconWhenHidden: 'arrow_right',
      requiresMouseover: false,
      callback
    } as ActionButton;
  }

  static createOpenButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Open window',
      icon: 'open_in_new',
      requiresMouseover: true,
      callback
    } as ActionButton;
  }

  static createSaveButton(callback: (chromeWindow: ChromeAPIWindowState) => void): ActionButton {
    return {
      title: 'Save window',
      icon: 'save_alt',
      requiresMouseover: true,
      callback
    } as ActionButton;
  }
}
