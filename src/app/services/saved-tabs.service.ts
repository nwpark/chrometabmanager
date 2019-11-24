import {Injectable} from '@angular/core';
import {WindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor(private chromeTabsService: ChromeTabsService,
              private storageService: StorageService) {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    this.storageService.getSavedWindowsState().then(windowListState => {
      this.setWindowListState(windowListState);
    });
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
  }

  @modifiesState()
  private setWindowListState(windowListState: WindowListState) {
    this.windowListState = windowListState;
  }

  @modifiesState()
  createNewWindow() {
    const newWindow = {id: uuid(), tabs: []} as ChromeAPIWindowState;
    const newWindowLayout = WindowListUtils.createBasicWindowLayoutState(newWindow.id);
    this.windowListState.unshiftWindow(newWindow, newWindowLayout);
    this.windowListState.setHidden(false);
  }

  @modifiesState()
  moveTabInWindow(windowId: any, sourceIndex: number, targetIndex: number) {
    this.windowListState.moveTabInWindow(windowId, sourceIndex, targetIndex);
  }

  @modifiesState()
  transferTab(sourceWindowId: any, targetWindowId: any, sourceIndex: number, targetIndex: number) {
    this.windowListState.transferTab(sourceWindowId, targetWindowId, sourceIndex, targetIndex);
  }

  @modifiesState()
  createTab(windowId: any, tabIndex: number, chromeTab: ChromeAPITabState) {
    const clonedTab = {...chromeTab};
    clonedTab.id = uuid();
    this.windowListState.insertTab(windowId, tabIndex, clonedTab);
  }

  @modifiesState()
  removeTab(windowId: any, tabId: any) {
    this.windowListState.removeTab(windowId, tabId);
  }

  @modifiesState()
  removeWindow(windowId: any) {
    this.windowListState.removeWindow(windowId);
  }

  @modifiesState()
  toggleWindowListDisplay() {
    this.windowListState.toggleDisplay();
  }

  @modifiesState()
  toggleWindowDisplay(windowId: any) {
    this.windowListState.toggleWindowDisplay(windowId);
  }

  @modifiesState()
  setWindowTitle(windowId: any, title: string) {
    this.windowListState.setWindowTitle(windowId, title);
  }

  setTabActive(windowId: any, chromeTab: ChromeAPITabState) {
    this.chromeTabsService.updateCurrentTabUrl(chromeTab);
  }

  @modifiesState()
  saveWindow(window: ChromeAPIWindowState) {
    const clonedWindow = {...window};
    clonedWindow.id = uuid();
    const layoutState = WindowListUtils.createBasicWindowLayoutState(clonedWindow.id);
    this.windowListState.addWindow(clonedWindow, layoutState);
  }

  onStateUpdated() {
    this.windowStateUpdatedSource.next(this.windowListState);
    this.storageService.setSavedWindowsState(this.windowListState);
  }
}
