import {SessionLayoutState, validateSessionLayoutState} from './session-layout-state';
import {InvalidLayoutStateError} from '../errors/InvalidLayoutStateError';
import {isNullOrUndefined} from 'util';
import {UndefinedObjectError} from '../errors/UndefinedObjectError';

export interface SessionListLayoutState {
  hidden: boolean;
  sessionLayoutStates: SessionLayoutState[];
}

export function validateSessionListLayoutState(object: any) {
  if (isNullOrUndefined(object)) {
    throw new UndefinedObjectError();
  } else if (!('hidden' in object) || !('sessionLayoutStates' in object)) {
    throw new InvalidLayoutStateError();
  }
  object.sessionLayoutStates.forEach(validateSessionLayoutState);
}
