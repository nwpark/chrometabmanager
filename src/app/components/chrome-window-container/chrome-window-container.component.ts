import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {
  AnimationState,
  closeWindowAnimation,
  collapseWindowAnimation,
  expandWindowAnimation,
  getAnimationForToggleDisplay,
  isToggleDisplayState
} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {ChromeAPIWindowState} from '../../types/chrome-api-window-state';
import {SessionState} from '../../types/session-state';
import {SessionLayoutState} from '../../types/session-layout-state';

@Component({
  selector: 'app-chrome-window-container',
  templateUrl: './chrome-window-container.component.html',
  styleUrls: ['./chrome-window-container.component.css'],
  animations: [
    trigger('close-window', [
      transition(`* => ${AnimationState.Closing}`, [
        useAnimation(closeWindowAnimation, {})
      ])
    ]),
    trigger('collapse-window', [
      transition(`* => ${AnimationState.Collapsing}`, [
        useAnimation(collapseWindowAnimation, {})
      ]),
      transition(`* => ${AnimationState.Expanding}`, [
        useAnimation(expandWindowAnimation, {})
      ])
    ])
  ]
})
export class ChromeWindowContainerComponent implements OnInit {

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;
  @Input() index: number;

  chromeAPIWindow: ChromeAPIWindowState;
  layoutState: SessionLayoutState;
  animationState = AnimationState.Complete;

  constructor(private dragDropService: DragDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.chromeAPIWindow = this.sessionState.session.window;
    this.layoutState = this.sessionState.layoutState;
  }

  isWindowAnimating(): boolean {
    return isToggleDisplayState(this.animationState);
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
  }

  toggleWindowDisplay() {
    const animationState = getAnimationForToggleDisplay(this.layoutState.hidden);
    this.setAnimationState(animationState);
    this.props.tabsService.toggleSessionDisplay(this.index);
  }

  completeToggleWindowDisplay(event: AnimationEvent) {
    if (isToggleDisplayState(event.toState)) {
      this.setAnimationState(AnimationState.Complete);
    }
  }

  closeWindow() {
    this.setAnimationState(AnimationState.Closing);
  }

  completeCloseWindow(event: AnimationEvent) {
    if (event.toState === AnimationState.Closing) {
      this.setAnimationState(AnimationState.Complete);
      this.props.tabsService.removeSession(this.index);
    }
  }
}
