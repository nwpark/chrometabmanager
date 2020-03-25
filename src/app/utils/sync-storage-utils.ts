import {SessionListUtils} from './session-list-utils';
import {ChromeAPISession} from '../types/chrome-api/chrome-api-session';
import {SessionState} from '../types/session/session-state';
import {SessionStateMap} from '../types/session/session-state-map';
import {SessionListLayoutState} from '../types/session/session-list-layout-state';

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
      .map(entry => entry[1]);
  }
}
