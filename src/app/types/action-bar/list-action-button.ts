export interface ListActionButton {
  title: string;
  titleWhenHidden?: string;
  icon: string;
  iconWhenHidden?: string;
  requiresMouseover: boolean;
  callback: () => void;
}
