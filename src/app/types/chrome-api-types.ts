export type SessionId = number | string;

export interface ChromeAPISession {
  lastModified?: number;
  window?: ChromeAPIWindowState;
  tab?: ChromeAPITabState;
}

export interface ChromeAPIWindowState {
  id: SessionId;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPITabState {
  id: SessionId;
  windowId?: SessionId;
  url: string;
  title: string;
  favIconUrl: string;
  status: string;
  [others: string]: any; // Ignore unused API fields
}
