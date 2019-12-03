import {TabsService} from '../interfaces/tabs-service';
import {ActionButton} from './action-bar';

export enum WindowCategory {
  Active,
  Saved,
  RecentlyClosed
}

export class ChromeWindowComponentProps {
  windowListId?: string;
  actionButtons?: ActionButton[];
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
