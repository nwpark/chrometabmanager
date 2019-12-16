import {ChromeAPISession, SessionId} from './chrome-api-types';

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
  sessionLayoutStates: SessionLayoutState[];
}

export interface SessionLayoutState {
  title?: string;
  sessionId: SessionId;
  hidden?: boolean;
  deleted?: boolean;
}
