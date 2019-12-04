import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {WindowLayoutState, WindowListState} from '../../types/window-list-state';
import {ListActionButton, ListActionButtonFactory} from '../../types/action-bar';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {AnimationState, collapseListAnimation, collapseWindowAnimation, expandListAnimation, expandWindowAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {ActionBarService} from '../../services/action-bar.service';

@Component({
  selector: 'app-window-list',
  templateUrl: './window-list.component.html',
  styleUrls: ['./window-list.component.css'],
  animations: [
    trigger('close-window', [
      transition(`* => ${AnimationState.Closing}`, [
        useAnimation(collapseWindowAnimation, {})
      ])
    ]),
    trigger('collapse-window', [
      transition(`* => ${AnimationState.Collapsing}`, [
        useAnimation(collapseWindowAnimation, {})
      ]),
      transition(`* => ${AnimationState.Expanding}`, [
        useAnimation(expandWindowAnimation, {})
      ])
    ]),
    trigger('collapse-list', [
      transition(`* => ${AnimationState.Collapsing}`, [
        useAnimation(collapseListAnimation, {})
      ]),
      transition(`* => ${AnimationState.Expanding}`, [
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
  animationState = AnimationState.Complete;
  windowAnimationStates = {};

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

  debug() {
    console.log(this);
  }

  debugModeEnabled(): boolean {
    return this.preferencesService.isDebugModeEnabled();
  }

  get layoutStates(): WindowLayoutState[] {
    return this.windowListState.layoutState.windowStates;
  }

  isWindowListAnimating(): boolean {
    return this.animationState !== AnimationState.Complete;
  }

  isWindowAnimating(windowIndex: number): boolean {
    return this.windowAnimationStates[windowIndex] === AnimationState.Expanding
      || this.windowAnimationStates[windowIndex] === AnimationState.Collapsing;
  }

  toggleDisplay() {
    this.animationState = this.windowListState.layoutState.hidden
      ? AnimationState.Expanding
      : AnimationState.Collapsing;
    this.windowProps.tabsService.toggleWindowListDisplay();
  }

  completeToggleDisplayAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Collapsing
      || event.toState === AnimationState.Expanding) {
      this.animationState = AnimationState.Complete;
    }
  }

  toggleWindowDisplay(windowIndex: number) {
    this.windowAnimationStates[windowIndex] = this.layoutStates[windowIndex].hidden
      ? AnimationState.Expanding
      : AnimationState.Collapsing;
    this.changeDetectorRef.detectChanges();
  }

  completeToggleWindowDisplay(event: AnimationEvent, windowIndex: number) {
    if (event.toState === AnimationState.Collapsing
      || event.toState === AnimationState.Expanding) {
      this.windowAnimationStates[windowIndex] = AnimationState.Complete;
      this.windowProps.tabsService.toggleWindowDisplay(this.layoutStates[windowIndex].windowId);
    }
  }

  closeWindow(windowIndex: number) {
    this.windowAnimationStates[windowIndex] = AnimationState.Closing;
    this.changeDetectorRef.detectChanges();
  }

  completeCloseWindow(event: AnimationEvent, windowIndex: number) {
    if (event.toState === AnimationState.Closing) {
      this.windowAnimationStates[windowIndex] = AnimationState.Complete;
      this.windowProps.tabsService.removeWindow(this.layoutStates[windowIndex].windowId);
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
