import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ChromeWindowComponentProps, ChromeWindowDragDropData} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {ChromeAPITabState, ChromeAPIWindowState} from '../../types/chrome-api-types';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {AnimationState} from '../../animations';
import {SessionLayoutState} from '../../types/session-list-state';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
})
export class ChromeWindowComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: SessionLayoutState;
  @Input() props: ChromeWindowComponentProps;

  dragDropData: ChromeWindowDragDropData;
  connectedWindowIds: string[];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private dragDropService: DragDropService,
              private preferencesService: PreferencesService) { }

  ngOnInit() {
    this.dragDropData = {chromeWindowId: this.chromeAPIWindow.id, ...this.props};
    this.connectedWindowIds = this.dragDropService.connectedWindowIds;
    this.dragDropService.connectedWindowIdsUpdated$
      .pipe(this.dragDropService.ignoreWhenDragging())
      .subscribe(connectedWindowIds => this.connectedWindowIds = connectedWindowIds);
  }

  tabClicked(chromeTab: ChromeAPITabState, event: MouseEvent) {
    this.props.tabsService.setTabActive(chromeTab, event.ctrlKey);
  }

  closeTab(state: AnimationState, tabId: any) {
    if (state === AnimationState.Complete) {
      this.props.tabsService.removeTab(this.chromeAPIWindow.id, tabId);
    }
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
      } else if (sourceTabList.windowListId === targetTabList.windowListId) {
        targetTabList.tabsService.transferTab(sourceTabList.chromeWindowId,
          targetTabList.chromeWindowId,
          event.previousIndex,
          event.currentIndex);
      } else {
        if (this.preferencesService.shouldCloseWindowOnSave()) {
          sourceTabList.tabsService.removeTab(sourceTabList.chromeWindowId, event.item.data.id);
        }
        targetTabList.tabsService.createTab(targetTabList.chromeWindowId, event.currentIndex, event.item.data);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }

}
