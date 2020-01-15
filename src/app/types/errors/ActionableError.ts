export interface ActionableError {
  errorId: string;
  title: string;
  description: string;
  error: Error;
  action?: ActionableErrorCallback;
}

export interface ActionableErrorCallback {
  callback: () => void;
  requiresReload: boolean;
  warningMessage?: string;
}
