import {ChromeAPISession} from '../chrome-api/chrome-api-session';

export interface SessionMap {
  [sessionId: string]: ChromeAPISession;
}
