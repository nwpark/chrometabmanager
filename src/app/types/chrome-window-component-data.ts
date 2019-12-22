import {TabsService} from '../services/tabs/tabs-service';

export enum SessionListId {
  Saved = 'saved_window_list',
  Active = 'active_window_list',
  RecentlyClosed = 'recently_closed_list'
}

export interface SessionComponentProps {
  sessionListId: SessionListId;
  tabsService: TabsService;
  isMutable: boolean;
}

export interface ChromeWindowDragDropData {
  index: number;
  sessionListId: SessionListId;
  tabsService: TabsService;
  isMutable: boolean;
}
