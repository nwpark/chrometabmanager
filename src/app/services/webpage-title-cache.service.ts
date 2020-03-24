import {Injectable} from '@angular/core';
import {LocalStorageService} from './storage/local-storage.service';
import {WebpageTitleCache} from '../types/webpage-title-cache';
import {ChromeAPITabState} from '../types/chrome-api/chrome-api-tab-state';
import {modifiesState} from '../decorators/modifies-state';
import {MessageReceiverService} from './messaging/message-receiver.service';

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
      this.setWebpageTitleCache(webpageTitleCache);
    });
    this.messageReceiverService.webpageTitleCacheUpdated$.subscribe(webpageTitleCache => {
      this.setWebpageTitleCache(webpageTitleCache);
    });
  }

  private setWebpageTitleCache(webpageTitleCache: WebpageTitleCache) {
    console.log(new Date().toTimeString().substring(0, 8), '- refreshing webpage title cache');
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
  }

  // private removeOverflowCacheEntries() {
  //   if (this.size() > this.MAX_CACHE_SIZE) {
  //     this.getOrderedCacheEntries()
  //       .splice(this.MAX_CACHE_SIZE)
  //       .forEach(([url, cacheEntry]) => delete this.urlCacheData[url]);
  //   }
  // }
  //
  // private size(): number {
  //   return Object.entries(this.urlCacheData).length;
  // }
  //
  // private getOrderedCacheEntries() {
  //   return Object.entries(this.urlCacheData)
  //     .sort((a, b) => b[1].lastModified - a[1].lastModified);
  // }

  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating webpage title cache');
    this.localStorageService.setWebpageTitleCacheData(this.webpageTitleCache);
  }
}
