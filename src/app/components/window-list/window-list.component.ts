import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {PreferencesService} from '../../services/preferences.service';
import {
  AnimationState,
  collapseListAnimation,
  expandListAnimation,
  getAnimationForToggleDisplay,
  isToggleDisplayState
} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {ActionBarService} from '../../services/action-bar.service';
import {SessionListState} from '../../types/session-list-state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SessionState} from '../../types/session-state';
import {ListActionButton} from '../../types/action-bar/list-action-button';
import {ListActionButtonFactory} from '../../utils/action-bar/list-action-button-factory';

@Component({
  selector: 'app-window-list',
  templateUrl: './window-list.component.html',
  styleUrls: ['./window-list.component.css'],
  animations: [
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
export class WindowListComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  @Input() title: string;
  @Input() props: SessionComponentProps;

  sessionListState: SessionListState;
  connectedWindowListIds = DragDropService.CONNECTED_WINDOW_LIST_IDS;
  actionButtons: ListActionButton[];
  animationState = AnimationState.Complete;
  debugModeEnabled$: Promise<boolean>;

  constructor(private dragDropService: DragDropService,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.sessionListState = this.props.tabsService.getSessionListState();
    this.actionButtons = [
      ...this.actionBarService.createListActionButtons(this.props.sessionListId),
      ListActionButtonFactory.createMinimizeButton(() => this.toggleDisplay())
    ];
    this.props.tabsService.sessionStateUpdated$
      .pipe(
        this.dragDropService.ignoreWhenDragging(),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(sessionListState => {
        this.sessionListState = sessionListState;
        this.changeDetectorRef.detectChanges();
      });
    this.debugModeEnabled$ = this.preferencesService.isDebugModeEnabled();
  }

  getTitle(): string {
    const tabCount = this.sessionListState.size();
    if (tabCount > 0 && this.sessionListState.isHidden()) {
      return `${this.title} (${tabCount})`;
    }
    return this.title;
  }

  isComponentAnimating(): boolean {
    return isToggleDisplayState(this.animationState);
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
  }

  toggleDisplay() {
    const animationState = getAnimationForToggleDisplay(this.sessionListState.isHidden());
    this.setAnimationState(animationState);
    this.props.tabsService.toggleSessionListDisplay();
  }

  completeToggleDisplayAnimation(event: AnimationEvent) {
    if (isToggleDisplayState(event.toState)) {
      this.setAnimationState(AnimationState.Complete);
    }
  }

  beginDrag() {
    this.dragDropService.beginDrag();
  }

  windowDropped(event: CdkDragDrop<SessionComponentProps>) {
    try {
      const targetTabList: SessionComponentProps = event.container.data;
      const sourceTabList: SessionComponentProps = event.previousContainer.data;
      const sessionState: SessionState = event.item.data;

      if (event.previousContainer === event.container) {
        targetTabList.tabsService.moveWindowInList(event.previousIndex, event.currentIndex);
      } else {
        targetTabList.tabsService.insertWindow(sessionState, event.currentIndex);
        this.preferencesService.shouldCloseWindowOnSave().then(shouldCloseWindowsOnSave => {
          if (shouldCloseWindowsOnSave) {
            sourceTabList.tabsService.removeSession(event.previousIndex);
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

  debug() { console.log(this); }
}
