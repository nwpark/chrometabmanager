import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../../types/session-list-state';
import {DragDropService, WindowListId} from '../../services/drag-drop.service';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {
  CollapseAnimationState,
  collapseListAnimation,
  collapseWindowAnimation,
  expandListAnimation,
  expandWindowAnimation
} from '../../animations';
import {PreferencesService} from '../../services/preferences.service';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css'],
  animations: [
    trigger('close-window', [
      transition(`* => ${CollapseAnimationState.Closing}`, [
        useAnimation(collapseWindowAnimation, {})
      ])
    ]),
    trigger('collapse-window', [
      transition(`* => ${CollapseAnimationState.Collapsing}`, [
        useAnimation(collapseWindowAnimation, {})
      ]),
      transition(`* => ${CollapseAnimationState.Expanding}`, [
        useAnimation(expandWindowAnimation, {})
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

  get layoutStates() {
    return this.sessionListState.layoutState.windowStates;
  }

  get animationStates() {
    return this.sessionListState.animationStates;
  }

  get sessions() {
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
    return this.sessionListState.animationState !== CollapseAnimationState.Complete;
  }

  isWindowAnimating(sessionIndex: number): boolean {
    return this.animationStates[sessionIndex] !== CollapseAnimationState.Complete;
  }

  toggleDisplay() {
    this.sessionListState.animationState = this.sessionListState.layoutState.hidden
      ? CollapseAnimationState.Expanding
      : CollapseAnimationState.Collapsing;
    this.windowProps.tabsService.toggleWindowListDisplay();
  }

  completeToggleDisplayAnimation(event: AnimationEvent) {
    if (event.toState === CollapseAnimationState.Collapsing
      || event.toState === CollapseAnimationState.Expanding) {
      this.sessionListState.animationState = CollapseAnimationState.Complete;
    }
  }

  closeTab(state: CollapseAnimationState, sessionIndex: number, tabIndex: number) {
    if (state === CollapseAnimationState.Closing && this.sessions[sessionIndex].closedTabs.length === 1) {
      this.animationStates[sessionIndex] = CollapseAnimationState.Closing;
      this.changeDetectorRef.detectChanges();
    } else if (state === CollapseAnimationState.Complete) {
      this.recentlyClosedTabsService.removeDetachedTab(sessionIndex, tabIndex);
    }
  }

  toggleWindowDisplay(sessionIndex: number) {
    const layoutState = this.layoutStates[sessionIndex];
    this.animationStates[sessionIndex] = layoutState.hidden
      ? CollapseAnimationState.Expanding
      : CollapseAnimationState.Collapsing;
    this.windowProps.tabsService.toggleWindowDisplay(layoutState.windowId);
  }

  completeToggleWindowDisplay(event: AnimationEvent, sessionIndex: number) {
    if (event.toState === CollapseAnimationState.Collapsing
          || event.toState === CollapseAnimationState.Expanding) {
      this.animationStates[sessionIndex] = CollapseAnimationState.Complete;
    }
  }

  closeWindow(sessionIndex: number) {
    this.animationStates[sessionIndex] = CollapseAnimationState.Closing;
    this.changeDetectorRef.detectChanges();
  }

  completeCloseWindow(event: AnimationEvent, sessionIndex: number) {
    if (event.toState === CollapseAnimationState.Closing) {
      const layoutState = this.layoutStates[sessionIndex];
      this.recentlyClosedTabsService.removeWindow(layoutState.windowId);
    }
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }
}
