import {SessionLayoutState, validateSessionLayoutState} from './session-layout-state';
import {InvalidLayoutStateError} from '../errors/InvalidLayoutStateError';
import {isNullOrUndefined} from 'util';

export interface SessionListLayoutState {
  hidden: boolean;
  sessionLayoutStates: SessionLayoutState[];
}

export function validateSessionListLayoutState(object: any) {
  if (isNullOrUndefined(object) || !('hidden' in object) || !('sessionLayoutStates' in object)) {
    throw new InvalidLayoutStateError();
  }
  object.sessionLayoutStates.forEach(validateSessionLayoutState);
}
