export type MenuItemCallback = (sessionIndex: number) => void;

export interface SessionMenuItem {
  title: string;
  icon: string;
  tooltip: string;
  callback: MenuItemCallback;
}
