import {ChromeAPITabState, WindowListState} from '../types/chrome-a-p-i-window-state';

export interface TabsService {

  getWindowListState(): WindowListState;

  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number);

  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(windowId: any, tabIndex: number);

  removeWindow(windowId: any);

  toggleWindowListDisplay();

  toggleWindowDisplay(windowId: any);

}
