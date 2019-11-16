import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-a-p-i-window-state';

export enum TabGroupCategory {
  Active,
  Saved,
}

export class TabListComponentData {
  windowId: number;
  tabs: ChromeAPITabState[];
  category: TabGroupCategory;
  componentRef: any;
}
