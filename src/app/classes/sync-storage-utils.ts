import {SessionListState} from '../types/session-list-state';
import {SyncStorageSession, SyncStorageSessionMap} from '../services/sync-storage.service';
import {SessionListUtils} from './session-list-utils';
import {ChromeAPISession, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionListLayoutState, SessionMap} from '../types/session';
import {SessionUtils} from './session-utils';

export class SyncStorageUtils {

  static convertToSyncStorageSessionMap(sessionListState: SessionListState): SyncStorageSessionMap {
    const sessionMap: SyncStorageSessionMap = {};
    sessionListState.layoutState.sessionStates.forEach(layoutState => {
      sessionMap[layoutState.sessionId] = {
        session: sessionListState.chromeSessions[layoutState.sessionId],
        layoutState
      };
    });
    return sessionMap;
  }

  static getSyncStorageSessions(data: SyncStorageSessionMap): SyncStorageSession[] {
    return Object.entries(data)
      .filter(entry => entry[0].length === 36)
      .map(entry => entry[1])
      // todo: this is only for compatibility with old versions.
      .map((syncSession: SyncStorageSession) => {
        if (syncSession.layoutState) {
          return syncSession;
        } else {
          const session = syncSession as ChromeAPISession;
          return {session, layoutState: SessionListUtils.createBasicWindowLayoutState(session.window.id)};
        }
      });
  }

  static mergeLayoutStates(layoutState: SessionListLayoutState, syncStorageSessions: SyncStorageSession[]) {
    const sessionIds = layoutState.sessionStates
      .map(sessionState => sessionState.sessionId)
      .reduce((object, sessionId) => (object[sessionId] = true, object), {});
    syncStorageSessions
      .map(syncStorageSession => syncStorageSession.layoutState)
      .forEach(sessionState => {
        if (!sessionIds[sessionState.sessionId]) {
          layoutState.sessionStates.push(sessionState);
        }
      });
  }

  static createSessionMapFromSyncStorage(syncStorageSessions: SyncStorageSession[]): SessionMap {
    const sessionMap: SessionMap = {};
    syncStorageSessions
      .map(syncSession => syncSession.session.window)
      .forEach(chromeWindow => {
        sessionMap[chromeWindow.id] = SessionUtils.createSessionFromWindow(chromeWindow);
      });
    return sessionMap;
  }
}
