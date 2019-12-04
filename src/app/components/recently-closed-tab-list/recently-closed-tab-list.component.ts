import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {RecentlyClosedSession, SessionListState, SessionListUtils} from '../../types/session-list-state';
import {DragDropService, WindowListId} from '../../services/drag-drop.service';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {
  AnimationState,
  collapseListAnimation,
  collapseWindowAnimation,
  expandListAnimation,
  expandWindowAnimation
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
export class RecentlyClosedTabListComponent implements OnInit {

  sessionListState: SessionListState;
  windowProps: ChromeWindowComponentProps;

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

  debug() {
    console.log(this);
  }

  debugModeEnabled(): boolean {
    return this.preferencesService.isDebugModeEnabled();
  }

  get layoutStates(): WindowLayoutState[] {
    return this.sessionListState.layoutState.windowStates;
  }

  get animationStates(): AnimationState[] {
    return this.sessionListState.animationStates;
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
    return this.sessionListState.animationState !== AnimationState.Complete;
  }

  isWindowAnimating(windowIndex: number): boolean {
    return this.animationStates[windowIndex] === AnimationState.Expanding
      || this.animationStates[windowIndex] === AnimationState.Collapsing;
  }

  toggleDisplay() {
    this.sessionListState.animationState = this.sessionListState.layoutState.hidden
      ? AnimationState.Expanding
      : AnimationState.Collapsing;
    this.windowProps.tabsService.toggleWindowListDisplay();
  }

  completeToggleDisplayAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Collapsing
      || event.toState === AnimationState.Expanding) {
      this.sessionListState.animationState = AnimationState.Complete;
    }
  }

  closeTab(state: AnimationState, sessionIndex: number, tabIndex: number) {
    if (state === AnimationState.Closing && this.sessions[sessionIndex].closedTabs.length === 1) {
      this.animationStates[sessionIndex] = AnimationState.Closing;
      this.changeDetectorRef.detectChanges();
    } else if (state === AnimationState.Complete) {
      this.recentlyClosedTabsService.removeDetachedTab(sessionIndex, tabIndex);
    }
  }

  toggleWindowDisplay(sessionIndex: number) {
    const layoutState = this.layoutStates[sessionIndex];
    this.animationStates[sessionIndex] = layoutState.hidden
      ? AnimationState.Expanding
      : AnimationState.Collapsing;
    this.windowProps.tabsService.toggleWindowDisplay(layoutState.windowId);
  }

  completeToggleWindowDisplay(event: AnimationEvent, sessionIndex: number) {
    if (event.toState === AnimationState.Collapsing
          || event.toState === AnimationState.Expanding) {
      this.animationStates[sessionIndex] = AnimationState.Complete;
    }
  }

  closeWindow(sessionIndex: number) {
    this.animationStates[sessionIndex] = AnimationState.Closing;
    this.changeDetectorRef.detectChanges();
  }

  completeCloseWindow(event: AnimationEvent, sessionIndex: number) {
    if (event.toState === AnimationState.Closing) {
      const layoutState = this.layoutStates[sessionIndex];
      this.recentlyClosedTabsService.removeWindow(layoutState.windowId);
    }
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }
}
