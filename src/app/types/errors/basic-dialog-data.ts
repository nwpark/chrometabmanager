export class BasicDialogData {
  title: string;
  titleIcon?: string;
  contentEmphasisedHTML?: string;
  contentHTML?: string;
  actions?: BasicDialogAction[];
}

export interface BasicDialogAction {
  buttonText: string;
  callback?: () => void;
  closeDialog?: boolean;
}
