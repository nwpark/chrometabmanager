import {TabsService} from '../interfaces/tabs-service';

export enum WindowCategory {
  Active,
  Saved,
}

export class TabListComponentData {
  windowId: number;
  // category: TabGroupCategory;
  tabsService: TabsService;
}
