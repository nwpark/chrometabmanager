import {Component, Input, OnInit} from '@angular/core';
import {TabGroupCategory, TabListComponentData} from '../../types/tab-list-component-data';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {ChromeAPIWindowState, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';

@Component({
  selector: 'app-active-window',
  templateUrl: './active-window.component.html',
  styleUrls: ['./active-window.component.css']
})
export class ActiveWindowComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;

  componentData: TabListComponentData;

  constructor(private chromeTabsService: ChromeTabsService) { }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      tabs: this.chromeAPIWindow.tabs,
      category: TabGroupCategory.Saved,
      componentRef: this
    };
  }

  getTitle(): string {
    return this.layoutState.hidden ? `Window (${this.chromeAPIWindow.tabs.length} tabs)` : 'Window';
  }

  closeWindow() {
    this.chromeTabsService.removeWindow(this.chromeAPIWindow.id);
  }

  closeTab(tabId: any) {
    const index = this.chromeAPIWindow.tabs.findIndex(tab => tab.id === tabId);
    this.chromeTabsService.removeTab(this.chromeAPIWindow.id, index);
  }

  setTabActive(tabId: any) {
    this.chromeTabsService.setTabActive(this.chromeAPIWindow.id, tabId);
  }

  toggleDisplay() {
    this.chromeTabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  tabDropped(event: CdkDragDrop<TabListComponentData>) {
    const targetTabList: TabListComponentData = event.container.data;
    const previousTabList: TabListComponentData = event.previousContainer.data;

    if (event.previousContainer === event.container) {
      this.chromeTabsService.moveTabInWindow(targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else if (previousTabList.category === targetTabList.category) {
      this.chromeTabsService.transferTab(previousTabList.windowId,
        targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else {
      previousTabList.componentRef.closeTab(event.item.data.id);
      this.chromeTabsService.createTab(targetTabList.windowId, event.currentIndex, event.item.data);
    }
  }
}
