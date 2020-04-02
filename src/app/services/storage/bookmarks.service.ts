import { Injectable } from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {SessionListState} from '../../types/session/session-list-state';
import {SessionMap} from '../../types/session/session-map';
import {SessionStateUtils, SessionUtils} from '../../utils/session-utils';
import {SessionState} from '../../types/session/session-state';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {

  constructor() { }

  getSavedSessionMap(): Promise<SessionMap> {
    return new Promise<SessionMap>(resolve => {
      chrome.bookmarks.search('Chrome Tab Manager Saved Windows', bookmarkNodes => {
        chrome.bookmarks.getSubTree(bookmarkNodes[0].id, res => {
          const sessionMap = {};
          res[0].children.forEach(windowBookmark => {
            const tabs = windowBookmark.children.map(tabBookmark => {
              const url = new URL(tabBookmark.url);
              return JSON.parse(decodeURI(url.searchParams.get('ctm')));
            });
            sessionMap[windowBookmark.title] = SessionStateUtils.createWindowSession(windowBookmark.id, tabs);
          });
          resolve(sessionMap);
        });
      });
    });
  }

  setSavedSessionsState(sessionListState: SessionListState): Promise<any> {
    // const completed$ = [];
    return this.removeCTMBookmarkTree().then(() => {
      return this.createBookmarkFolder('2', 'Chrome Tab Manager Saved Windows').then(newRoot => {
        // sessionListState.getLayoutState().sessionLayoutStates.forEach(layoutState => {
        //   this.createBookmarkFolder(newRoot.id, layoutState.sessionId.toString()).then(folder => {
        //     sessionListState.getSessionMap()[layoutState.sessionId].window.tabs.forEach(chromeTab => {
        //       completed$.push(this.createEncodedChromeTabBookmark(folder.id, chromeTab));
        //     });
        //   });
        // });
        // Array.from(sessionListState).forEach(sessionState => {
        //   if (sessionState.session.window) {
        //     this.createBookmarkFolder(newRoot.id, sessionState.layoutState.sessionId.toString()).then(folder => {
        //       sessionState.session.window.tabs.forEach(chromeTab => {
        //         completed$.push(this.createEncodedChromeTabBookmark(folder.id, chromeTab));
        //       });
        //     });
        //   }
        // });
        return Promise.all(Array.from(sessionListState)
          .filter(sessionState => sessionState.session.window)
          .map(sessionState => {
            return this.createBookmarkFolder(newRoot.id, sessionState.layoutState.sessionId.toString()).then(folder => {
              return Promise.all(sessionState.session.window.tabs.map(chromeTab => {
                return this.createEncodedChromeTabBookmark(folder.id, chromeTab);
              }));
            });
          }));
      });
    });
    // return Promise.all(completed$);
  }

  private removeCTMBookmarkTree(): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.bookmarks.search('Chrome Tab Manager Saved Windows', bookmarkNodes => {
        if (bookmarkNodes.length > 0) {
          chrome.bookmarks.removeTree(bookmarkNodes[0].id, resolve);
        } else {
          resolve();
        }
      });
    });
  }

  private createEncodedChromeTabBookmark(parentId: string, chromeTab: ChromeAPITabState): Promise<void> {
    return new Promise<any>(resolve => {
      const url = new URL(chromeTab.url);
      const encodedChromeTab = encodeURI(JSON.stringify(chromeTab));
      url.searchParams.append('ctm', encodedChromeTab);
      chrome.bookmarks.create({
        parentId,
        title: chromeTab.title,
        url: url.href
      }, resolve);
    });
  }

  private createBookmarkFolder(parentId: string, title: string): Promise<BookmarkTreeNode> {
    return new Promise<BookmarkTreeNode>(resolve => {
      chrome.bookmarks.create({
        parentId, title
      }, resolve);
    });
  }
}
