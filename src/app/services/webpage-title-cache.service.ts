import {Injectable} from '@angular/core';
import {LocalStorageService} from './storage/local-storage.service';
import {WebpageTitleCache} from '../types/webpage-title-cache';
import {ChromeAPITabState} from '../types/chrome-api/chrome-api-tab-state';
import {modifiesState} from '../decorators/modifies-state';

@Injectable({
  providedIn: 'root'
})
export class WebpageTitleCacheService {

  private readonly MAX_CACHE_SIZE = 100;

  private webpageTitleCache: WebpageTitleCache;

  constructor(private localStorageService: LocalStorageService) {
    this.webpageTitleCache = {};
    this.localStorageService.getWebpageTitleCacheData().then(tabMetadataCache => {
      this.webpageTitleCache = tabMetadataCache;
    });
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
