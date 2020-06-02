import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {MessagePassingService} from '../messaging/message-passing.service';
import {StorageKeys} from './storage-keys';
import {SessionListLayoutState, validateSessionListLayoutState} from '../../types/session/session-list-layout-state';
import {validateSessionMap} from '../../types/session/session-map';
import {UndefinedObjectError} from '../../types/errors/UndefinedObjectError';
import {WebpageTitleCache} from '../../types/webpage-title-cache';
import {createDefaultOAuth2TokenState, OAuth2TokenState} from '../../types/o-auth2-token-state';
import {md5Checksum} from '../../utils/hash-utils';
import {createRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private messagePassingService: MessagePassingService) { }

  getActiveWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>((resolve, reject) => {
      chrome.storage.local.get([
        StorageKeys.ActiveWindows,
        StorageKeys.ActiveWindowsLayoutState
      ], data => {
        try {
          const sessionMap = data[StorageKeys.ActiveWindows];
          const layoutState = data[StorageKeys.ActiveWindowsLayoutState];
          validateSessionMap(sessionMap);
          validateSessionListLayoutState(layoutState);
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } catch (error) {
          if (error instanceof UndefinedObjectError) {
            resolve(SessionListState.empty());
          } else {
            reject(error);
          }
        }
      });
    });
  }

  setActiveWindowsState(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.ActiveWindows]: sessionListState.getSessionMap(),
        [StorageKeys.ActiveWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastActiveSessions(sessionListState);
        resolve();
      });
    });
  }

  getActiveWindowsLayoutState(): Promise<SessionListLayoutState> {
    return new Promise<SessionListLayoutState>((resolve, reject) => {
      chrome.storage.local.get(StorageKeys.ActiveWindowsLayoutState, data => {
        const layoutState = data[StorageKeys.ActiveWindowsLayoutState];
        try {
          validateSessionListLayoutState(layoutState);
          resolve(layoutState);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  getRecentlyClosedSessionsState(): Promise<SessionListState> {
    return new Promise<SessionListState>((resolve, reject) => {
      chrome.storage.local.get([
        StorageKeys.RecentlyClosedSessions,
        StorageKeys.RecentlyClosedSessionsLayoutState
      ], data => {
        try {
          const sessionMap = data[StorageKeys.RecentlyClosedSessions];
          const layoutState = data[StorageKeys.RecentlyClosedSessionsLayoutState];
          validateSessionMap(sessionMap);
          validateSessionListLayoutState(layoutState);
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } catch (error) {
          if (error instanceof UndefinedObjectError) {
            resolve(SessionListState.empty());
          } else {
            reject(error);
          }
        }
      });
    });
  }

  setRecentlyClosedSessionsState(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.RecentlyClosedSessions]: sessionListState.getSessionMap(),
        [StorageKeys.RecentlyClosedSessionsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastClosedSessions(sessionListState);
        resolve();
      });
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>((resolve, reject) => {
      chrome.storage.local.get([
        StorageKeys.SavedWindows,
        StorageKeys.SavedWindowsLayoutState
      ], data => {
        try {
          const sessionMap = data[StorageKeys.SavedWindows];
          const layoutState = data[StorageKeys.SavedWindowsLayoutState];
          validateSessionMap(sessionMap);
          validateSessionListLayoutState(layoutState);
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } catch (error) {
          if (error instanceof UndefinedObjectError) {
            resolve(SessionListState.empty());
          } else {
            reject(error);
          }
        }
      });
    });
  }

  setSavedWindowsState(sessionListState: SessionListState, previousValueChecksum: string): Promise<void> {
    return this.getSavedWindowsState().then(prevSessionListState => {
      if (previousValueChecksum !== md5Checksum(prevSessionListState)) {
        return Promise.reject(createRuntimeError(ErrorCode.StorageUpdateRequestNotCoherent));
      }
      return new Promise<void>(resolve => {
        chrome.storage.local.set({
          [StorageKeys.SavedWindows]: sessionListState.getSessionMap(),
          [StorageKeys.SavedWindowsLayoutState]: sessionListState.getLayoutState()
        }, () => {
          this.messagePassingService.broadcastSavedSessions(sessionListState);
          resolve();
        });
      });
    });
  }

  getWebpageTitleCacheData(): Promise<WebpageTitleCache> {
    return new Promise<WebpageTitleCache>(resolve => {
      chrome.storage.local.get(StorageKeys.WebpageTitleCache, data => {
        // todo: add data validation
        if (data[StorageKeys.WebpageTitleCache]) {
          resolve(data[StorageKeys.WebpageTitleCache]);
        } else {
          resolve(WebpageTitleCache.empty());
        }
      });
    });
  }

  setWebpageTitleCacheData(webpageTitleCache: WebpageTitleCache) {
    chrome.storage.local.set({
      [StorageKeys.WebpageTitleCache]: webpageTitleCache
    }, () => {
      this.messagePassingService.broadcastWebpageTitleCache(webpageTitleCache);
    });
  }

  getOAuth2TokenState(): Promise<OAuth2TokenState> {
    return new Promise<OAuth2TokenState>(resolve => {
      chrome.storage.local.get(StorageKeys.OAuth2TokenState, data => {
        if (data[StorageKeys.OAuth2TokenState]) {
          resolve(data[StorageKeys.OAuth2TokenState]);
        } else {
          resolve(createDefaultOAuth2TokenState());
        }
      });
    });
  }

  setOAuth2TokenState(oAuth2TokenState: OAuth2TokenState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.OAuth2TokenState]: oAuth2TokenState
      }, () => {
        this.messagePassingService.broadcastOAuth2TokenState(oAuth2TokenState);
        resolve();
      });
    });
  }
}
