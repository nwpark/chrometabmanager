import {SessionId} from './chrome-api-window-state';
import {isNullOrUndefined} from 'util';

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
