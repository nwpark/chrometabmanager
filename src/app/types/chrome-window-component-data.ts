import {TabsService} from '../interfaces/tabs-service';

export enum WindowCategory {
  Active,
  Saved,
  RecentlyClosed
}

export class ChromeWindowComponentProps {
  category: WindowCategory;
  tabsService: TabsService;
  windowIsMutable: boolean;
}

export class ChromeWindowDragDropData {
  chromeWindowId: any;
  category: WindowCategory;
  tabsService: TabsService;
  windowIsMutable: boolean;
}
