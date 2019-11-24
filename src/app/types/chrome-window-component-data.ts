import {TabsService} from '../interfaces/tabs-service';

export enum WindowCategory {
  Active,
  Saved,
  RecentlyClosed
}

export class ChromeWindowComponentData {
  windowId: any;
  category: WindowCategory;
  tabsService: TabsService<any>;
}
