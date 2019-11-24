import {Injectable} from '@angular/core';
import {SavedWindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {
  ActiveWindowState,
  ChromeAPITabState,
  ChromeAPIWindowState,
  SavedTabState,
  SavedWindowState,
  WindowStateUtils
} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService<string> {

  private windowListState: SavedWindowListState;

  private windowStateUpdatedSource = new Subject<SavedWindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor(private chromeTabsService: ChromeTabsService,
              private storageService: StorageService) {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    this.storageService.getSavedWindowsState().then(windowListState => {
      this.setWindowListState(windowListState);
    });
  }

  getWindowListState(): SavedWindowListState {
    return this.windowListState;
  }

  @modifiesState()
  private setWindowListState(windowListState: SavedWindowListState) {
    this.windowListState = windowListState;
  }

  @modifiesState()
  createNewWindow() {
    const newWindow = {id: uuid(), tabs: []} as SavedWindowState;
    const newWindowLayout = WindowListUtils.createBasicWindowLayoutState(newWindow.id);
    this.windowListState.unshiftWindow(newWindow, newWindowLayout);
    this.windowListState.setHidden(false);
  }

  @modifiesState()
  moveTabInWindow(windowId: string, sourceIndex: number, targetIndex: number) {
    this.windowListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
  }

  @modifiesState()
  transferTab(sourceWindowId: string, targetWindowId: string, sourceIndex: number, targetIndex: number) {
    this.windowListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
  }

  @modifiesState()
  createTab(windowId: string, tabIndex: number, chromeTab: ChromeAPITabState<any>) {
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab, windowId);
    this.windowListState.insertTab(windowId, tabIndex, savedTab);
  }

  @modifiesState()
  removeTab(windowId: string, tabId: string) {
    this.windowListState.removeTab(windowId, tabId);
  }

  @modifiesState()
  removeWindow(windowId: string) {
    this.windowListState.removeWindow(windowId);
  }

  @modifiesState()
  toggleWindowListDisplay() {
    this.windowListState.toggleDisplay();
  }

  @modifiesState()
  toggleWindowDisplay(windowId: string) {
    this.windowListState.toggleWindowDisplay(windowId);
  }

  @modifiesState()
  setWindowTitle(windowId: string, title: string) {
    this.windowListState.setWindowTitle(windowId, title);
  }

  setTabActive(windowId: string, chromeTab: SavedTabState) {
    this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
  }

  @modifiesState()
  saveWindow(chromeWindow: ChromeAPIWindowState<any>) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const layoutState = WindowListUtils.createBasicWindowLayoutState(savedWindow.id);
    this.windowListState.addWindow(savedWindow, layoutState);
  }

  onStateUpdated() {
    this.windowStateUpdatedSource.next(this.windowListState);
    this.storageService.setSavedWindowsState(this.windowListState);
  }
}
