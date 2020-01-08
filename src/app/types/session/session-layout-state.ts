import {SessionId} from '../chrome-api/chrome-api-window-state';
import {isNullOrUndefined} from 'util';
import {InvalidLayoutStateError} from '../errors/InvalidLayoutStateError';

export interface SessionLayoutState {
  title?: string;
  sessionId: SessionId;
  hidden?: boolean;
  deleted?: boolean;
}

export function sessionLayoutStateEquals(a: SessionLayoutState, b: SessionLayoutState): boolean {
  if (isNullOrUndefined(a) || isNullOrUndefined(b)) {
    return a === b;
  }
  return a.sessionId === b.sessionId
    && a.title === b.title
    && a.hidden === b.hidden
    && a.deleted === b.deleted;
}

export function validateSessionLayoutState(object: any) {
  if (isNullOrUndefined(object) || !('sessionId' in object)) {
    throw new InvalidLayoutStateError();
  }
}
