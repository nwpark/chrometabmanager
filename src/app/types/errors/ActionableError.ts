export interface ActionableError {
  errorId: string;
  title: string;
  description: string;
  error: Error;
  action?: ActionableErrorCallback;
}

export interface ActionableErrorCallback {
  callback: () => Promise<any>;
  requiresReload: boolean;
  warningMessage?: string;
}
