import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ChromeWindowDragDropData, SessionComponentProps} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ChromeAPIWindowState} from '../../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../../types/session/session-state';
import {SessionLayoutState} from '../../types/session/session-layout-state';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.scss']
})
export class ChromeWindowComponent implements OnDestroy, OnInit, OnChanges {

  private ngUnsubscribe = new Subject();

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;
  @Input() index: number;

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
    this.dragDropData = {index: this.index, ...this.props};
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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dragDropData) {
      this.dragDropData.index = this.index;
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
      const targetWindow: ChromeWindowDragDropData = event.container.data;
      const sourceWindow: ChromeWindowDragDropData = event.previousContainer.data;

      if (event.previousContainer === event.container) {
        targetWindow.tabsService.moveTabInWindow(targetWindow.index,
          event.previousIndex,
          event.currentIndex);
      } else if (sourceWindow.sessionListId === targetWindow.sessionListId) {
        targetWindow.tabsService.transferTab(sourceWindow.index,
          targetWindow.index,
          event.previousIndex,
          event.currentIndex);
      } else {
        targetWindow.tabsService.createTab(targetWindow.index, event.currentIndex, event.item.data);
        this.preferencesService.shouldCloseWindowOnSave().then(shouldCloseWindowsOnSave => {
          if (shouldCloseWindowsOnSave) {
            sourceWindow.tabsService.removeTab(sourceWindow.index, event.item.data.id);
          }
        });
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
