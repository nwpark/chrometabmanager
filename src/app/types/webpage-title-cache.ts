export class WebpageTitleCache {
  [url: string]: WebpageTitleCacheEntry;

  static empty(): WebpageTitleCache {
    return {};
  }
}

export interface WebpageTitleCacheEntry {
  title: string;
  lastModified: number;
}
