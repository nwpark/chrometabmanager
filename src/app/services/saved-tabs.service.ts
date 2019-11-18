import {Injectable} from '@angular/core';
import {MOCK_SAVED_WINDOWS} from './mock-windows';
import {ChromeAPITabState, ChromeAPIWindowState, WindowListState, WindowListUtils} from '../types/chrome-a-p-i-window-state';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {v4 as uuid} from 'uuid';
import {modifiesState} from '../decorators/modifies-state';

declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class SavedTabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor() {
    this.windowListState = WindowListState.createDefaultInstance();
    this.refreshState();
  }

  refreshState() {
    this.getStateFromStorage().then(windowListState => {
      this.setWindowListState(windowListState);
    });
  }

  private getStateFromStorage(): Promise<WindowListState> {
    if (!environment.production) {
      return Promise.resolve(new WindowListState(MOCK_SAVED_WINDOWS, WindowListUtils.getDefaultLayoutState()));
    }
    return new Promise<WindowListState>(resolve => {
      const storageKey = {
        savedWindows: WindowListUtils.getDefaultAPIWindows(),
        savedWindowsLayoutState: WindowListUtils.getDefaultLayoutState()
      };
      chrome.storage.sync.get(storageKey, data => {
        const windowList = new WindowListState(data.savedWindows, data.savedWindowsLayoutState);
        resolve(windowList);
      });
    });
  }

  getWindowListState(): WindowListState {
    return this.windowListState;
  }

  @modifiesState()
  setWindowListState(windowListState: WindowListState) {
    this.windowListState = windowListState;
  }

  @modifiesState()
  createNewWindow() {
    const newWindow = {id: uuid(), tabs: []} as ChromeAPIWindowState;
    const newWindowLayout = WindowListUtils.getDefaultWindowLayoutState(newWindow.id);
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
    // todo: modify the tab id first
    this.windowListState.insertTab(windowId, tabIndex, chromeTab);
  }

  @modifiesState()
  removeTab(windowId: any, tabIndex: number) {
    this.windowListState.removeTab(windowId, tabIndex);
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

  onStateUpdated() {
    console.log(this.windowListState);
    this.windowStateUpdatedSource.next(this.windowListState);
    if (environment.production) {
      chrome.storage.sync.set({
        savedWindows: this.windowListState.chromeAPIWindows,
        savedWindowsLayoutState: this.windowListState.layoutState
      });
    }
  }
}
