import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SessionComponentProps, ChromeWindowDragDropData} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {ChromeAPITabState, ChromeAPIWindowState} from '../../types/chrome-api-types';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {AnimationState} from '../../animations';
import {SessionLayoutState} from '../../types/session';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SessionState} from '../../types/session-list-state';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
})
export class ChromeWindowComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;

  chromeAPIWindow: ChromeAPIWindowState;
  layoutState: SessionLayoutState;
  dragDropData: ChromeWindowDragDropData;
  connectedWindowIds: string[];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private dragDropService: DragDropService,
              private preferencesService: PreferencesService) { }

  ngOnInit() {
    this.chromeAPIWindow = this.sessionState.session.window;
    this.layoutState = this.sessionState.layoutState;
    this.dragDropData = {chromeWindow: this.chromeAPIWindow, ...this.props};
    this.connectedWindowIds = this.dragDropService.connectedWindowIds;
    this.dragDropService.connectedWindowIdsUpdated$
      .pipe(
        this.dragDropService.ignoreWhenDragging(),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(connectedWindowIds => {
        this.connectedWindowIds = connectedWindowIds;
      });
  }

  tabClicked(chromeTab: ChromeAPITabState, event: MouseEvent) {
    this.props.tabsService.setTabActive(chromeTab, event.ctrlKey);
  }

  closeTab(state: AnimationState, tabId: any) {
    if (state === AnimationState.Complete) {
      this.props.tabsService.removeTab(this.chromeAPIWindow, tabId);
    }
  }

  dropTargetIsMutable(drag: CdkDrag, drop: CdkDropList<ChromeWindowDragDropData>): boolean {
    return drop.data.isMutable;
  }

  isDragEnabled(chromeTab: ChromeAPITabState) {
    return this.props.isMutable
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
        targetTabList.tabsService.moveTabInWindow(targetTabList.chromeWindow,
          event.previousIndex,
          event.currentIndex);
      } else if (sourceTabList.sessionListId === targetTabList.sessionListId) {
        targetTabList.tabsService.transferTab(sourceTabList.chromeWindow,
          targetTabList.chromeWindow,
          event.previousIndex,
          event.currentIndex);
      } else {
        if (this.preferencesService.shouldCloseWindowOnSave()) {
          sourceTabList.tabsService.removeTab(sourceTabList.chromeWindow, event.item.data.id);
        }
        targetTabList.tabsService.createTab(targetTabList.chromeWindow, event.currentIndex, event.item.data);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
