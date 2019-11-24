export interface ChromeAPIWindowState {
  id: any;
  type: string;
  tabs: ChromeAPITabState[];
  [others: string]: any; // Ignore unused API fields
}

export interface ChromeAPITabState {
  id: any;
  index: number;
  windowId: number;
  url: string;
  title: string;
  favIconUrl: string;
  [others: string]: any; // Ignore unused API fields
}
