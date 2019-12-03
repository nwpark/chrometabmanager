import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {WindowLayoutState, WindowListState} from '../../types/window-list-state';
import {ListActionButton, ListActionButtonFactory} from '../../types/action-bar';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {collapseAnimation, CollapseAnimationState, collapseListAnimation, expandListAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {ActionBarService} from '../../services/action-bar.service';

@Component({
  selector: 'app-window-list',
  templateUrl: './window-list.component.html',
  styleUrls: ['./window-list.component.css'],
  animations: [
    trigger('collapse-item', [
      transition(`* => ${CollapseAnimationState.Collapsing}`, [
        useAnimation(collapseAnimation, {})
      ])
    ]),
    trigger('collapse-list', [
      transition(`* => ${CollapseAnimationState.Collapsing}`, [
        useAnimation(collapseListAnimation, {})
      ]),
      transition(`* => ${CollapseAnimationState.Expanding}`, [
        useAnimation(expandListAnimation, {})
      ])
    ])
  ]
})
export class WindowListComponent implements OnInit {

  @Input() title: string;
  @Input() windowProps: ChromeWindowComponentProps;

  windowListState: WindowListState;
  connectedWindowListIds = DragDropService.CONNECTED_WINDOW_LIST_IDS;
  actionButtons: ListActionButton[];
  collapseAnimationState: string;

  constructor(private dragDropService: DragDropService,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.windowListState = this.windowProps.tabsService.getWindowListState();
    this.actionButtons = [
      ...this.actionBarService.createWindowListActionButtons(this.windowProps.windowListId),
      ListActionButtonFactory.createMinimizeButton(() => this.toggleDisplay())
    ];
    this.windowProps.tabsService.windowStateUpdated$
      .pipe(this.dragDropService.ignoreWhenDragging())
      .subscribe(windowListState => {
        this.windowListState = windowListState;
        this.changeDetectorRef.detectChanges();
      });
  }

  isAnimationStateExpanding(): boolean {
    return this.collapseAnimationState === CollapseAnimationState.Expanding;
  }

  toggleDisplay() {
    if (this.windowListState.layoutState.hidden) {
      this.collapseAnimationState = CollapseAnimationState.Expanding;
    } else {
      this.collapseAnimationState = CollapseAnimationState.Collapsing;
    }
  }

  completeCollapseAnimation(event: AnimationEvent) {
    if (event.toState === CollapseAnimationState.Collapsing
      || event.toState === CollapseAnimationState.Expanding) {
      this.windowProps.tabsService.toggleWindowListDisplay();
    }
  }

  closeWindow(layoutState: WindowLayoutState) {
    layoutState.status = CollapseAnimationState.Collapsing;
    this.changeDetectorRef.detectChanges();
  }

  completeCloseAnimation(event: AnimationEvent, windowId: any) {
    if (event.toState === CollapseAnimationState.Collapsing) {
      this.windowProps.tabsService.removeWindow(windowId);
    }
  }

  beginDrag() {
    this.dragDropService.beginDrag();
  }

  windowDropped(event: CdkDragDrop<ChromeWindowComponentProps>) {
    try {
      const targetTabList: ChromeWindowComponentProps = event.container.data;
      const sourceTabList: ChromeWindowComponentProps = event.previousContainer.data;

      if (event.previousContainer === event.container) {
        targetTabList.tabsService.moveWindowInList(event.previousIndex, event.currentIndex);
      } else {
        if (this.preferencesService.shouldCloseWindowOnSave()) {
          sourceTabList.tabsService.removeWindow(event.item.data.id);
        }
        targetTabList.tabsService.insertWindow(event.item.data, event.currentIndex);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }
}
