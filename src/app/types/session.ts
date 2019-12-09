import {ChromeAPISession} from './chrome-api-types';

export interface SessionMap {
  [sessionId: string]: ChromeAPISession;
}

export interface SessionListLayoutState {
  hidden: boolean;
  sessionStates: SessionLayoutState[];
}

export interface SessionLayoutState {
  title?: string;
  sessionId: any;
  hidden?: boolean;
  deleted?: boolean;
}
