import {SessionListState} from '../types/session-list-state';
import {SessionListUtils} from './session-list-utils';
import {ChromeAPISession} from '../types/chrome-api-types';
import {SessionListLayoutState, SessionMap, SessionState, SessionStateMap} from '../types/session';
import {SessionUtils} from './session-utils';

export class SyncStorageUtils {

  static convertToSessionStateMap(sessionListState: SessionListState): SessionStateMap {
    const sessionStateMap: SessionStateMap = {};
    for (const sessionState of sessionListState) {
      sessionStateMap[sessionState.layoutState.sessionId] = {
        session: sessionState.session,
        layoutState: sessionState.layoutState
      };
    }
    return sessionStateMap;
  }

  static getSessionStatesFromStorageData(data: SessionStateMap): SessionState[] {
    return Object.entries(data)
      // todo: create static variable for 36
      .filter(entry => entry[0].length === 36)
      .map(entry => entry[1])
      // todo: this is only for compatibility with old versions.
      .map((sessionState: SessionState) => {
        if (sessionState.layoutState) {
          return sessionState;
        } else {
          const session = sessionState as ChromeAPISession;
          return {session, layoutState: SessionListUtils.createBasicWindowLayoutState(session.window.id)};
        }
      });
  }

  static mergeLayoutStates(layoutState: SessionListLayoutState, sessionStates: SessionState[]) {
    const sessionIds = layoutState.sessionStates
      .map(sessionState => sessionState.sessionId)
      .reduce((object, sessionId) => (object[sessionId] = true, object), {});
    sessionStates
      .map(syncStorageSession => syncStorageSession.layoutState)
      .forEach(sessionState => {
        if (!sessionIds[sessionState.sessionId]) {
          layoutState.sessionStates.push(sessionState);
        }
      });
  }

  static createSessionMap(sessionStates: SessionState[]): SessionMap {
    const sessionMap: SessionMap = {};
    sessionStates
      .map(syncSession => syncSession.session.window)
      .forEach(chromeWindow => {
        sessionMap[chromeWindow.id] = SessionUtils.createSessionFromWindow(chromeWindow);
      });
    return sessionMap;
  }
}
