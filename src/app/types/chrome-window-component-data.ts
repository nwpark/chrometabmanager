import {TabsService} from '../interfaces/tabs-service';

export enum WindowListId {
  Saved = 'saved_window_list',
  Active = 'active_window_list',
  RecentlyClosed = 'recently_closed_list'
}

export interface SessionComponentProps {
  windowListId: WindowListId;
  tabsService: TabsService;
  isMutable: boolean;
}

export interface ChromeWindowDragDropData {
  chromeWindowId: any;
  windowListId: WindowListId;
  tabsService: TabsService;
  isMutable: boolean;
}
