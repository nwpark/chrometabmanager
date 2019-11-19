import {ChangeDetectorRef, Input, OnInit} from '@angular/core';
import {ChromeAPIWindowState, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';
import {TabGroupCategory, TabListComponentData} from '../../types/tab-list-component-data';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {TabsService} from '../../interfaces/tabs-service';
import {MouseOver} from '../mouse-over';

export abstract class ChromeWindowComponent extends MouseOver {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;

  private tabsService: TabsService;

  protected constructor(tabsService: TabsService, changeDefectorRef: ChangeDetectorRef) {
    super(changeDefectorRef);
    this.tabsService = tabsService;
  }

  getTitle(): string {
    return this.layoutState.hidden ? `${this.layoutState.title} (${this.chromeAPIWindow.tabs.length} tabs)` : this.layoutState.title;
  }

  closeWindow() {
    this.tabsService.removeWindow(this.chromeAPIWindow.id);
  }

  closeTab(tabId: any) {
    const index = this.chromeAPIWindow.tabs.findIndex(tab => tab.id === tabId);
    this.tabsService.removeTab(this.chromeAPIWindow.id, index);
  }

  toggleDisplay() {
    this.tabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  tabDropped(event: CdkDragDrop<TabListComponentData>) {
    const targetTabList: TabListComponentData = event.container.data;
    const previousTabList: TabListComponentData = event.previousContainer.data;

    if (event.previousContainer === event.container) {
      this.tabsService.moveTabInWindow(targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else if (previousTabList.category === targetTabList.category) {
      this.tabsService.transferTab(previousTabList.windowId,
        targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else {
      previousTabList.componentRef.closeTab(event.item.data.id);
      this.tabsService.createTab(targetTabList.windowId, event.currentIndex, event.item.data);
    }
  }

}
