import {Injectable} from '@angular/core';
import {WindowListState, WindowListUtils} from '../types/window-list-state';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {modifiesState} from '../decorators/modifies-state';
import {TabsService} from '../interfaces/tabs-service';
import {ChromeTabsService} from './chrome-tabs.service';
import {StorageService} from './storage.service';
import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService implements TabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor(private chromeTabsService: ChromeTabsService) {
    this.windowListState = WindowListState.empty();
    MessagePassingService.addSavedWindowStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    StorageService.getSavedWindowsState().then(windowListState => {
      console.log(new Date().toTimeString().substring(0, 8), '- refreshing saved windows');
      this.windowListState = windowListState;
      this.windowStateUpdatedSource.next(this.windowListState);
    });
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
  }

  @modifiesState()
  createNewWindow() {
    const newWindow: ChromeAPIWindowState = {id: uuid(), tabs: [], type: 'normal'};
    const newWindowLayout = WindowListUtils.createBasicWindowLayoutState(newWindow.id);
    this.windowListState.unshiftSession(newWindow, newWindowLayout);
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
    this.windowListState.insertTabInWindow(windowId, tabIndex, savedTab);
  }

  @modifiesState()
  removeTab(windowId: any, tabId: any) {
    this.windowListState.removeTabFromWindow(windowId, tabId);
  }

  @modifiesState()
  removeWindow(windowId: any) {
    this.windowListState.removeSession(windowId);
  }

  @modifiesState()
  toggleWindowListDisplay() {
    this.windowListState.toggleDisplay();
  }

  @modifiesState()
  toggleWindowDisplay(windowId: any) {
    this.windowListState.toggleSessionDisplay(windowId);
  }

  @modifiesState()
  setWindowTitle(windowId: any, title: string) {
    this.windowListState.setSessionTitle(windowId, title);
  }

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean) {
    if (openInNewTab) {
      this.chromeTabsService.openUrlInNewTab(chromeTab.url);
    } else {
      this.chromeTabsService.updateCurrentTabUrl(chromeTab.url);
    }
  }

  @modifiesState()
  insertWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const layoutState = WindowListUtils.createBasicWindowLayoutState(savedWindow.id);
    this.windowListState.insertSession(savedWindow, layoutState, index);
  }

  @modifiesState()
  moveWindowInList(sourceIndex: number, targetIndex: number) {
    this.windowListState.moveSessionInList(sourceIndex, targetIndex);
  }

  // Called by @modifiesState decorator
  onStateModified() {
    console.log(new Date().toTimeString().substring(0, 8), '- updating saved windows');
    this.windowStateUpdatedSource.next(this.windowListState);
    StorageService.setSavedWindowsState(this.windowListState);
  }
}
