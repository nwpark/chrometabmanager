export interface ErrorDialogData {
  errorId: string;
  title: string;
  description: string;
  error: Error;
  callback?: ErrorDialogCallback;
}

export interface ErrorDialogCallback {
  function: () => void;
  requiresReload: boolean;
  confirmationMessage?: string;
}
