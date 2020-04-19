import {Injectable} from '@angular/core';
import {LocalStorageService} from './storage/local-storage.service';
import {WebpageTitleCache} from '../types/webpage-title-cache';
import {ChromeAPITabState} from '../types/chrome-api/chrome-api-tab-state';
import {modifiesState} from '../decorators/modifies-state';
import {MessageReceiverService} from './messaging/message-receiver.service';
import {getCurrentTimeStringWithMillis} from '../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class WebpageTitleCacheService {

  private readonly MAX_CACHE_SIZE = 100;

  private webpageTitleCache: WebpageTitleCache;

  constructor(private localStorageService: LocalStorageService,
              private messageReceiverService: MessageReceiverService) {
    this.webpageTitleCache = WebpageTitleCache.empty();
    this.localStorageService.getWebpageTitleCacheData().then(webpageTitleCache => {
      this.setCacheData(webpageTitleCache);
    });
    this.messageReceiverService.webpageTitleCacheUpdated$.subscribe(webpageTitleCache => {
      this.setCacheData(webpageTitleCache);
    });
  }

  private setCacheData(webpageTitleCache: WebpageTitleCache) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing webpage title cache');
    this.webpageTitleCache = webpageTitleCache;
  }

  getTitleForUrl(url: string): string {
    if (this.webpageTitleCache[url]) {
      return this.webpageTitleCache[url].title;
    }
    return url;
  }

  @modifiesState()
  insertTabs(tabs: ChromeAPITabState[]) {
    tabs.forEach(tab => {
      this.webpageTitleCache[tab.url] = {
        title: tab.title,
        lastModified: Date.now()
      };
    });
    this.removeExpiredCacheEntries();
  }

  private removeExpiredCacheEntries() {
    if (this.size() > this.MAX_CACHE_SIZE) {
      this.getOrderedCacheEntries()
        .splice(this.MAX_CACHE_SIZE)
        .forEach(([url, cacheEntry]) => delete this.webpageTitleCache[url]);
    }
  }

  private size(): number {
    return Object.entries(this.webpageTitleCache).length;
  }

  private getOrderedCacheEntries() {
    return Object.entries(this.webpageTitleCache)
      .sort((a, b) => b[1].lastModified - a[1].lastModified);
  }

  onStateModified() {
    console.log(getCurrentTimeStringWithMillis(), '- updating webpage title cache');
    this.localStorageService.setWebpageTitleCacheData(this.webpageTitleCache);
  }
}
