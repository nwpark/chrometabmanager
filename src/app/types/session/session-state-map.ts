import {SessionState} from './session-state';

export interface SessionStateMap {
  [sessionId: string]: SessionState;
}
