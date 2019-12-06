import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {ChromeWindowComponentProps, WindowListId} from '../../types/chrome-window-component-data';
import {ChromeAPISession, ChromeAPITabState} from '../../types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../../types/session-list-state';
import {DragDropService} from '../../services/drag-drop.service';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {
  AnimationState,
  closeWindowAnimation,
  collapseListAnimation,
  expandListAnimation,
  getAnimationForToggleDisplay,
  isToggleDisplayState
} from '../../animations';
import {PreferencesService} from '../../services/preferences.service';

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

  get sessions(): ChromeAPISession[] {
    return this.sessionListState.chromeSessions;
  }

  get title(): string {
    if (this.sessionListState.chromeSessions.length > 0
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

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
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

  closeTab(state: AnimationState, tabId: any) {
    if (state === AnimationState.Complete) {
      this.recentlyClosedTabsService.removeDetachedTab(tabId);
    }
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }

  debug() { console.log(this); }
  debugModeEnabled(): boolean { return this.preferencesService.isDebugModeEnabled(); }
}
