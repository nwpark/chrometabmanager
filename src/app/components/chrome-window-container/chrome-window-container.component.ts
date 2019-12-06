import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {SessionLayoutState} from '../../types/window-list-state';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {DragDropService} from '../../services/drag-drop.service';
import {
  AnimationState,
  closeWindowAnimation,
  collapseWindowAnimation,
  expandWindowAnimation,
  getAnimationForToggleDisplay,
  isToggleDisplayState
} from '../../animations';
import {ChromeAPIWindowState} from '../../types/chrome-api-types';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';

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
export class ChromeWindowContainerComponent {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: SessionLayoutState;
  @Input() props: ChromeWindowComponentProps;

  animationState = AnimationState.Complete;

  constructor(private dragDropService: DragDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

  isWindowAnimating(): boolean {
    return isToggleDisplayState(this.animationState);
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
  }

  toggleWindowDisplay(layoutState: SessionLayoutState) {
    const animationState = getAnimationForToggleDisplay(layoutState.hidden);
    this.setAnimationState(animationState);
    this.props.tabsService.toggleSessionDisplay(layoutState.sessionId);
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
      this.props.tabsService.removeSession(this.chromeAPIWindow.id);
    }
  }
}
