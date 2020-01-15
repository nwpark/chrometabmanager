export interface ErrorDialogData {
  title?: string;
  errorMessage: string;
  descriptionHTML?: string;
  actions?: ErrorDialogAction[];
}

export interface ErrorDialogAction {
  buttonText: string;
  callback: () => void;
}
