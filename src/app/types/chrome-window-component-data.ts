import {TabsService} from '../interfaces/tabs-service';

export enum WindowCategory {
  Active,
  Saved,
  RecentlyClosed
}

export class ChromeWindowComponentData {
  windowId: number | string;
  category: WindowCategory;
  tabsService: TabsService;
}
