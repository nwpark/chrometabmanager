import {RuntimeError} from './runtime-error';

export interface ErrorDialogData {
  errorMessage: string;
  runtimeError: RuntimeError;
  actions?: ErrorDialogAction[];
}

export interface ErrorDialogAction {
  buttonText: string;
  callback: () => void;
}
