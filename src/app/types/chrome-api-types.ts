export interface ChromeAPISession {
  lastModified?: number;
  window?: ChromeAPIWindowState;
  tab?: ChromeAPITabState;
}

export interface ChromeAPIWindowState {
  id: any;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPITabState {
  id: any;
  windowId?: any;
  url: string;
  title: string;
  favIconUrl: string;
  status: string;
  [others: string]: any; // Ignore unused API fields
}
