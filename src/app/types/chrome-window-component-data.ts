import {TabsService} from '../interfaces/tabs-service';

export enum WindowListId {
  Saved = 'saved_window_list',
  Active = 'active_window_list',
  RecentlyClosed = 'recently_closed'
}

export class ChromeWindowComponentProps {
  windowListId: WindowListId;
  tabsService: TabsService;
  windowIsMutable: boolean;
}

export class ChromeWindowDragDropData {
  chromeWindowId: any;
  windowListId: WindowListId;
  tabsService: TabsService;
  windowIsMutable: boolean;
}
