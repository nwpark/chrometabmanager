import {TabsService} from '../interfaces/tabs-service';
import {WindowListId} from '../services/drag-drop.service';

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
