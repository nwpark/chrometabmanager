import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {RecentlyClosedSession, RecentlyClosedTab, SessionListState, SessionListUtils} from '../../types/session-list-state';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {DragDropService, WindowListId} from '../../services/drag-drop.service';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {
  collapseWindowAnimation,
  CollapseAnimationState,
  expandWindowAnimation,
  collapseListAnimation,
  expandListAnimation
} from '../../animations';
import {WindowLayoutState} from '../../types/window-list-state';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css'],
  animations: [
    trigger('close-window', [
      transition(`* => ${CollapseAnimationState.Collapsing}`, [
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
  collapseAnimationState = CollapseAnimationState.Complete;

  constructor(public recentlyClosedTabsService: RecentlyClosedTabsService,
              private chromeTabsService: ChromeTabsService,
              private dragDropService: DragDropService,
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

  isAnimationStateExpanding(): boolean {
    return this.collapseAnimationState === CollapseAnimationState.Expanding;
  }

  isWindowExpanding(layoutState: WindowLayoutState): boolean {
    return layoutState.status === CollapseAnimationState.Expanding;
  }

  toggleDisplay() {
    if (this.sessionListState.layoutState.hidden) {
      this.collapseAnimationState = CollapseAnimationState.Expanding;
    } else {
      this.collapseAnimationState = CollapseAnimationState.Collapsing;
    }
    this.changeDetectorRef.detectChanges();
  }

  completeToggleDisplayAnimation(event: AnimationEvent) {
    if (event.toState === CollapseAnimationState.Collapsing
      || event.toState === CollapseAnimationState.Expanding) {
      this.collapseAnimationState = CollapseAnimationState.Complete;
      this.windowProps.tabsService.toggleWindowListDisplay();
    }
  }

  closeTab(session: RecentlyClosedSession, tab: RecentlyClosedTab) {
    if (session.closedTabs.length === 1) {
      session.status = CollapseAnimationState.Collapsing;
    }
    tab.status = CollapseAnimationState.Collapsing;
    this.changeDetectorRef.detectChanges();
  }

  completeTabCloseAnimation(event: AnimationEvent, tabId: any) {
    if (event.toState === CollapseAnimationState.Collapsing) {
      this.recentlyClosedTabsService.removeDetachedTab(tabId);
    }
  }

  toggleWindowDisplay(layoutState: WindowLayoutState) {
    if (layoutState.hidden) {
      layoutState.status = CollapseAnimationState.Expanding;
    } else {
      layoutState.status = CollapseAnimationState.Collapsing;
    }
    this.changeDetectorRef.detectChanges();
  }

  completeToggleWindowDisplay(event: AnimationEvent, layoutState: WindowLayoutState) {
    if (event.toState === CollapseAnimationState.Collapsing
      || event.toState === CollapseAnimationState.Expanding) {
      layoutState.status = CollapseAnimationState.Complete;
      this.windowProps.tabsService.toggleWindowDisplay(layoutState.windowId);
    }
  }

  closeWindow(session: RecentlyClosedSession) {
    session.status = CollapseAnimationState.Collapsing;
    this.changeDetectorRef.detectChanges();
  }

  completeCloseWindow(event: AnimationEvent, session: RecentlyClosedSession) {
    if (event.toState === CollapseAnimationState.Collapsing) {
      this.recentlyClosedTabsService.removeWindow(session.closedWindow.chromeAPIWindow.id);
    }
    session.status = CollapseAnimationState.Complete;
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }
}
