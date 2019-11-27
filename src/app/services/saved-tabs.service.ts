import {Injectable} from '@angular/core';
import {WindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../types/chrome-api-types';
import {ChromeEventHandlerService} from './chrome-event-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor(private chromeTabsService: ChromeTabsService,
              private storageService: StorageService,
              private chromeEventHandlerService: ChromeEventHandlerService) {
    this.windowListState = WindowListUtils.createEmptyWindowListState();
    this.chromeEventHandlerService.addSavedWindowsUpdatedListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    this.storageService.getSavedWindowsState().then(windowListState => {
      this.setWindowListState(windowListState);
    });
  }

  getIds() {
    return this.windowListState.chromeAPIWindows.map(chromeWindow => chromeWindow.id);
  }

  @modifiesState()
  private setWindowListState(windowListState: WindowListState) {
    this.windowListState = windowListState;
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
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
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
    this.windowListState.insertTab(windowId, tabIndex, savedTab);
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
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const layoutState = WindowListUtils.createBasicWindowLayoutState(savedWindow.id);
    this.windowListState.insertWindow(savedWindow, layoutState, index);
  }

  @modifiesState()
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.windowListState.moveWindowInList(sourceIndex, targetIndex);
  }

  // Called by all methods decorated with @modifiesState
  onStateUpdated() {
    this.windowStateUpdatedSource.next(this.windowListState);
    this.storageService.setSavedWindowsState(this.windowListState);
  }
}
