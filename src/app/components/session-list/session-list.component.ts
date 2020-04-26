import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {SessionListState} from '../../types/session/session-list-state';
import {DragDropService} from '../../services/drag-drop.service';
import {
  AnimationState,
  collapseListAnimation,
  expandListAnimation,
  getAnimationForToggleDisplay, isTerminalAnimationState,
  isToggleDisplayState
} from '../../animations';
import {PreferencesService} from '../../services/preferences.service';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {SessionState} from '../../types/session/session-state';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss'],
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
export class SessionListComponent implements OnInit {

  @Input() props: SessionComponentProps;
  @Input() sessionListState: SessionListState;

  connectedWindowListIds = DragDropService.CONNECTED_WINDOW_LIST_IDS;
  animationState = AnimationState.Complete;
  isComponentAnimating = false;

  constructor(private dragDropService: DragDropService,
              private preferencesService: PreferencesService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() { }

  toggleDisplay() {
    const animationState = getAnimationForToggleDisplay(this.sessionListState.isHidden());
    this.setAnimationState(animationState);
    this.props.tabsService.toggleSessionListDisplay();
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.isComponentAnimating = !isTerminalAnimationState(this.animationState);
    this.changeDetectorRef.detectChanges();
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

  debug() {
    console.log(this);
  }
}
