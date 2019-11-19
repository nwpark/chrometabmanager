import {ChromeAPITabState, ChromeAPIWindowState} from './chrome-a-p-i-window-state';
import {TabsService} from '../interfaces/tabs-service';

export enum TabGroupCategory {
  Active,
  Saved,
}

export class TabListComponentData {
  windowId: number;
  // category: TabGroupCategory;
  tabsService: TabsService;
}
