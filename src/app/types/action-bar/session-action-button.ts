export type ActionButtonCallback = () => void;

export interface SessionActionButton {
  title: string;
  titleWhenHidden?: string;
  icon: string;
  iconWhenHidden?: string;
  callback: ActionButtonCallback;
}
