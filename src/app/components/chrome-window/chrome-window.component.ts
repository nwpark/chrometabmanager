import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SessionComponentProps, ChromeWindowDragDropData} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {ChromeAPITabState, ChromeAPIWindowState} from '../../types/chrome-api-types';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {AnimationState} from '../../animations';
import {SessionLayoutState, SessionState} from '../../types/session';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
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

  tabClicked(chromeTab: ChromeAPITabState, event: MouseEvent) {
    this.props.tabsService.setTabActive(chromeTab, event.ctrlKey);
  }

  closeTab(state: AnimationState, tabId: any) {
    if (state === AnimationState.Complete) {
      this.props.tabsService.removeTab(this.index, tabId);
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
        if (this.preferencesService.shouldCloseWindowOnSave()) {
          sourceWindow.tabsService.removeTab(sourceWindow.index, event.item.data.id);
        }
        targetWindow.tabsService.createTab(targetWindow.index, event.currentIndex, event.item.data);
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
