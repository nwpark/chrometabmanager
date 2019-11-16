import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {TabGroupCategory, TabListComponentData} from '../../types/tab-list-component-data';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {ChromeAPIWindowState, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';

@Component({
  selector: 'app-saved-window',
  templateUrl: './saved-window.component.html',
  styleUrls: ['./saved-window.component.css']
})
export class SavedWindowComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;

  componentData: TabListComponentData;

  constructor(private savedTabsService: SavedTabsService) { }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      tabs: this.chromeAPIWindow.tabs,
      category: TabGroupCategory.Active,
      componentRef: this
    };
  }

  closeWindow() {
    this.savedTabsService.removeWindow(this.chromeAPIWindow.id);
  }

  closeTab(tabId: any) {
    const index = this.chromeAPIWindow.tabs.findIndex(tab => tab.id === tabId);
    this.savedTabsService.removeTab(this.chromeAPIWindow.id, index);
  }

  toggleDisplay() {
    this.savedTabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  tabDropped(event: CdkDragDrop<TabListComponentData>) {
    const targetTabList: TabListComponentData = event.container.data;
    const previousTabList: TabListComponentData = event.previousContainer.data;

    if (event.previousContainer === event.container) {
      this.savedTabsService.moveTabInWindow(targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else if (previousTabList.category === targetTabList.category) {
      this.savedTabsService.transferTab(previousTabList.windowId,
        targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else {
      previousTabList.componentRef.closeTab(event.item.data.id);
      this.savedTabsService.createTab(targetTabList.windowId, event.currentIndex, event.item.data);
    }
  }
}
