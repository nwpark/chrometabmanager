import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../app/types/chrome-api-types';
import {RecentlyClosedSession, SessionListUtils} from '../app/types/session-list-state';
import {StorageService} from '../app/services/storage.service';

const recentlyClosedSessions = StorageService.RECENTLY_CLOSED_SESSIONS;
const recentlyClosedSessionsLayoutState = StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE;

const maxClosedTabs = 50;

export function storeRecentlyClosedWindow(chromeWindow: ChromeAPIWindowState) {
  const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
  const closedSession = SessionListUtils.createClosedSessionFromWindow(savedWindow);
  const windowLayoutState = SessionListUtils.createBasicWindowLayoutState(closedSession.closedWindow.chromeAPIWindow.id);
  const storageKey = {
    [recentlyClosedSessions]: [],
    [recentlyClosedSessionsLayoutState]: {hidden: true, windowStates: []}
  };
  chrome.storage.local.get(storageKey, data => {
    data[recentlyClosedSessions].unshift(closedSession);
    data[recentlyClosedSessionsLayoutState].windowStates.unshift(windowLayoutState);
    data[recentlyClosedSessions] = removeExpiredSessions(data[recentlyClosedSessions]);
    chrome.storage.local.set(data);
  });
}

export function storeRecentlyClosedTab(chromeTab: ChromeAPITabState) {
  const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
  chrome.storage.local.get({[recentlyClosedSessions]: []}, data => {
    if (data[recentlyClosedSessions].length === 0 || data[recentlyClosedSessions][0].isWindow) {
      const closedSession = SessionListUtils.createClosedSessionFromTab(savedTab);
      data[recentlyClosedSessions].unshift(closedSession);
    } else {
      const closedTab = SessionListUtils.createClosedTab(savedTab);
      data[recentlyClosedSessions][0].closedTabs.unshift(closedTab);
    }
    data[recentlyClosedSessions] = removeExpiredSessions(data[recentlyClosedSessions]);
    chrome.storage.local.set(data);
  });
}

// todo: add fields to data structure to reduce work required here
export function removeExpiredSessions(closedSessions: RecentlyClosedSession[]) {
  let maxIndex;
  let tabsAtMax;
  closedSessions.reduce((acc, session, index) => {
    const totalTabs = acc + (session.isWindow
      ? session.closedWindow.chromeAPIWindow.tabs.length
      : session.closedTabs.length);
    if (acc < maxClosedTabs && totalTabs >= maxClosedTabs) {
      tabsAtMax = totalTabs;
      maxIndex = index;
    }
    return totalTabs;
  }, 0);
  if (maxIndex !== undefined) {
    console.log(maxIndex);
    console.log(tabsAtMax);
    closedSessions = closedSessions.slice(0, maxIndex + 1);
    if (!closedSessions[maxIndex].isWindow && tabsAtMax > maxClosedTabs) {
      closedSessions[maxIndex].closedTabs = closedSessions[maxIndex].closedTabs.slice(0, maxClosedTabs - tabsAtMax);
    }
  }
  return closedSessions;
}
