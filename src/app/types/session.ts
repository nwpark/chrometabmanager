import {ChromeAPISession} from './chrome-api-session';
import {SessionState} from './session-state';
import {SessionLayoutState} from './session-layout-state';

// todo: move to separate files
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
