import {ChromeAPISession} from './chrome-api-types';

export interface SessionState {
  session: ChromeAPISession;
  layoutState: SessionLayoutState;
}

export interface SessionMap {
  [sessionId: string]: ChromeAPISession;
}

export interface SessionStateMap {
  [sessionId: string]: SessionState;
}

export interface SessionListLayoutState {
  hidden: boolean;
  // todo: rename
  sessionStates: SessionLayoutState[];
}

export interface SessionLayoutState {
  title?: string;
  sessionId: any;
  hidden?: boolean;
  deleted?: boolean;
}
