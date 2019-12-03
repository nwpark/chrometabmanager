import {ChromeAPIWindowState} from '../app/types/chrome-api-types';
import {StorageService} from '../app/services/storage.service';
import {WindowListLayoutState, WindowListState, WindowListUtils} from '../app/types/window-list-state';
import {MessagePassingService} from '../app/services/message-passing.service';
import {ChromeTabsService} from '../app/services/chrome-tabs.service';

export class ActiveWindowStateManager {

  windowListState: WindowListState;

  constructor() {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    MessagePassingService.addActiveWindowStateListener(() => {
      this.refreshLayoutState();
    });
    this.updateActiveWindowState();
  }

  private refreshLayoutState() {
    StorageService.getActiveWindowsLayoutState().then(layoutState => {
      this.windowListState.layoutState = layoutState;
    });
  }

  updateActiveWindowState() {
    Promise.all([
      ChromeTabsService.getChromeWindowsFromAPI(),
      StorageService.getActiveWindowsLayoutState()
    ]).then(res => {
      const activeWindows: ChromeAPIWindowState[] = res[0];
      const layoutState: WindowListLayoutState = res[1];
      WindowListUtils.cleanupLayoutState(layoutState, activeWindows);
      this.windowListState = new WindowListState(activeWindows, layoutState);
      StorageService.setActiveWindowsState(this.windowListState);
    });
  }

  getWindow(windowId: any) {
    return this.windowListState.getWindow(windowId);
  }

  getTab(windowId: any, tabId: any) {
    return this.windowListState.getTab(windowId, tabId);
  }
}
