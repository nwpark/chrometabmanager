import {ChromeAPISession, validateChromeAPISession} from '../chrome-api/chrome-api-session';
import {isNullOrUndefined} from 'util';
import {UndefinedObjectError} from '../errors/UndefinedObjectError';

export interface SessionMap {
  [sessionId: string]: ChromeAPISession;
}

export function validateSessionMap(sessionMap: SessionMap) {
  if (isNullOrUndefined(sessionMap)) {
    throw new UndefinedObjectError();
  }
  Object.values(sessionMap).forEach(validateChromeAPISession);
}
