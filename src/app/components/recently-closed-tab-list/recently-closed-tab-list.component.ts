import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {RecentlyClosedSession, SessionListState, SessionListUtils} from '../../types/session-list-state';
import {DragDropService, WindowListId} from '../../services/drag-drop.service';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {
  AnimationState,
  closeWindowAnimation,
  collapseListAnimation,
  collapseWindowAnimation,
  expandListAnimation,
  expandWindowAnimation,
  getAnimationForToggleDisplay,
  isToggleDisplayState
} from '../../animations';
import {PreferencesService} from '../../services/preferences.service';
import {WindowLayoutState} from '../../types/window-list-state';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css'],
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
export class RecentlyClosedTabListComponent implements OnInit {

  sessionListState: SessionListState;
  windowProps: ChromeWindowComponentProps;
  animationState = AnimationState.Complete;
  sessionAnimationStates = {};

  constructor(public recentlyClosedTabsService: RecentlyClosedTabsService,
              private dragDropService: DragDropService,
              private preferencesService: PreferencesService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.sessionListState = this.recentlyClosedTabsService.getSessionListState();
    this.windowProps = {
      windowListId: WindowListId.RecentlyClosed,
      tabsService: this.recentlyClosedTabsService,
      windowIsMutable: false
    };
    this.recentlyClosedTabsService.sessionStateUpdated$
      .pipe(this.dragDropService.ignoreWhenDragging())
      .subscribe(sessionListState => {
        this.sessionListState = sessionListState;
        this.changeDetectorRef.detectChanges();
      });
  }

  get layoutStates(): WindowLayoutState[] {
    return this.sessionListState.layoutState.windowStates;
  }

  get sessions(): RecentlyClosedSession[] {
    return this.sessionListState.recentlyClosedSessions;
  }

  get title(): string {
    if (this.sessionListState.recentlyClosedSessions.length > 0
          && this.sessionListState.layoutState.hidden) {
      const tabCount = SessionListUtils.getTabCount(this.sessionListState);
      return `Recently Closed (${tabCount})`;
    }
    return 'Recently Closed';
  }

  tabClicked(chromeTab: ChromeAPITabState, event: MouseEvent) {
    this.recentlyClosedTabsService.setTabActive(chromeTab, event.ctrlKey);
  }

  isWindowListAnimating(): boolean {
    return isToggleDisplayState(this.animationState);
  }

  isWindowAnimating(layoutState: WindowLayoutState): boolean {
    return isToggleDisplayState(this.sessionAnimationStates[layoutState.windowId]);
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
  }

  private setSessionAnimationState(sessionId: any, animationState: AnimationState) {
    this.sessionAnimationStates[sessionId] = animationState;
    this.changeDetectorRef.detectChanges();
  }

  toggleDisplay() {
    const animationState = getAnimationForToggleDisplay(this.sessionListState.layoutState.hidden);
    this.setAnimationState(animationState);
    this.windowProps.tabsService.toggleWindowListDisplay();
  }

  completeToggleDisplayAnimation(event: AnimationEvent) {
    if (isToggleDisplayState(event.toState)) {
      this.setAnimationState(AnimationState.Complete);
    }
  }

  closeTab(state: AnimationState, sessionIndex: number, tabIndex: number) {
    const sessionId = this.layoutStates[sessionIndex].windowId;
    if (state === AnimationState.Closing && this.sessions[sessionIndex].closedTabs.length === 1) {
      this.setSessionAnimationState(sessionId, AnimationState.Closing);
    } else if (state === AnimationState.Complete) {
      this.setSessionAnimationState(sessionId, AnimationState.Complete);
      this.recentlyClosedTabsService.removeDetachedTab(sessionIndex, tabIndex);
    }
  }

  toggleWindowDisplay(layoutState: WindowLayoutState) {
    const animationState = getAnimationForToggleDisplay(layoutState.hidden);
    this.setSessionAnimationState(layoutState.windowId, animationState);
    this.windowProps.tabsService.toggleWindowDisplay(layoutState.windowId);
  }

  completeToggleWindowDisplay(event: AnimationEvent, layoutState: WindowLayoutState) {
    if (isToggleDisplayState(event.toState)) {
      this.setSessionAnimationState(layoutState.windowId, AnimationState.Complete);
    }
  }

  closeWindow(layoutState: WindowLayoutState) {
    this.setSessionAnimationState(layoutState.windowId, AnimationState.Closing);
  }

  completeCloseWindow(event: AnimationEvent, layoutState: WindowLayoutState) {
    if (event.toState === AnimationState.Closing) {
      this.setSessionAnimationState(layoutState.windowId, AnimationState.Complete);
      this.recentlyClosedTabsService.removeWindow(layoutState.windowId);
    }
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }

  debug() {
    console.log(this);
  }

  debugModeEnabled(): boolean {
    return this.preferencesService.isDebugModeEnabled();
  }
}
