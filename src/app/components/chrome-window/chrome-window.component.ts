import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {WindowLayoutState} from '../../types/window-list-state';
import {ChromeWindowComponentProps, ChromeWindowDragDropData} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {ChromeAPITabState, ChromeAPIWindowState} from '../../types/chrome-api-types';
import {DragDropService} from '../../services/drag-drop.service';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
})
export class ChromeWindowComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;
  @Input() props: ChromeWindowComponentProps;

  dragDropData: ChromeWindowDragDropData;
  connectedWindowIds: string[];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private dragDropService: DragDropService) { }

  ngOnInit() {
    this.dragDropData = {chromeWindowId: this.chromeAPIWindow.id, ...this.props};
    this.connectedWindowIds = this.dragDropService.connectedWindowIds;
    this.dragDropService.connectedWindowIdsUpdated$
      .pipe(this.dragDropService.ignoreWhenDragging())
      .subscribe(connectedWindowIds => this.connectedWindowIds = connectedWindowIds);
  }

  setTabActive(chromeTab: ChromeAPITabState) {
    this.props.tabsService.setTabActive(this.chromeAPIWindow.id, chromeTab);
  }

  closeTab(tabId: any) {
    this.props.tabsService.removeTab(this.chromeAPIWindow.id, tabId);
  }

  dropTargetIsMutable(drag: CdkDrag, drop: CdkDropList<ChromeWindowDragDropData>): boolean {
    return drop.data.windowIsMutable;
  }

  isDragEnabled(chromeTab: ChromeAPITabState) {
    return this.props.windowIsMutable
      && !this.dragDropService.isDragging()
      && chromeTab.id !== undefined;
  }

  beginDrag() {
    this.dragDropService.beginDrag();
  }

  tabDropped(event: CdkDragDrop<ChromeWindowDragDropData>) {
    try {
      const targetTabList: ChromeWindowDragDropData = event.container.data;
      const sourceTabList: ChromeWindowDragDropData = event.previousContainer.data;

      if (event.previousContainer === event.container) {
        targetTabList.tabsService.moveTabInWindow(targetTabList.chromeWindowId,
          event.previousIndex,
          event.currentIndex);
      } else if (sourceTabList.category === targetTabList.category) {
        targetTabList.tabsService.transferTab(sourceTabList.chromeWindowId,
          targetTabList.chromeWindowId,
          event.previousIndex,
          event.currentIndex);
      } else {
        sourceTabList.tabsService.removeTab(sourceTabList.chromeWindowId, event.item.data.id);
        targetTabList.tabsService.createTab(targetTabList.chromeWindowId, event.currentIndex, event.item.data);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }

}
