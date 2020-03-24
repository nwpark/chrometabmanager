export interface WebpageTitleCache {
  [url: string]: WebpageTitleCacheEntry;
}

export interface WebpageTitleCacheEntry {
  title: string;
  lastModified: number;
}
