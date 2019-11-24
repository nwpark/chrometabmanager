import {TabsService} from '../interfaces/tabs-service';

export enum WindowCategory {
  Active,
  Saved,
  RecentlyClosed
}

export class ChromeWindowComponentData {
  windowId: number;
  category: WindowCategory;
  tabsService: TabsService;
}
