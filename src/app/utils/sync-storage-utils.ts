import {SessionListUtils} from './session-list-utils';
import {SessionListLayoutState, SessionStateMap} from '../types/session';
import {ChromeAPISession} from '../types/chrome-api-session';
import {SessionState} from '../types/session-state';

export class SyncStorageUtils {

  static readonly SESSION_KEY_LENGTH = 36;

  static getSortedSessionStates(storageData: SessionStateMap, listLayoutState: SessionListLayoutState) {
    const sessionStates = listLayoutState.sessionLayoutStates.map(layoutState => {
      const sessionState: SessionState = storageData[layoutState.sessionId];
      delete storageData[layoutState.sessionId];
      return sessionState;
    });
    this.filterSessionStatesFromStorageData(storageData).forEach(sessionState => sessionStates.push(sessionState));
    return sessionStates;
  }

  static filterSessionStatesFromStorageData(data: SessionStateMap): SessionState[] {
    return Object.entries(data)
      .filter(entry => entry[0].length === this.SESSION_KEY_LENGTH)
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
}
