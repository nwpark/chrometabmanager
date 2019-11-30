import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {ChromeWindowComponentProps, WindowCategory} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../../types/session-list-state';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {DragDropService} from '../../services/drag-drop.service';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css']
})
export class RecentlyClosedTabListComponent implements OnInit {

  sessionListState: SessionListState;
  actionButtons: ActionButton[];
  windowProps: ChromeWindowComponentProps;

  constructor(public recentlyClosedTabsService: RecentlyClosedTabsService,
              private chromeTabsService: ChromeTabsService,
              private dragDropService: DragDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.sessionListState = this.recentlyClosedTabsService.getSessionListState();
    this.windowProps = {
      category: WindowCategory.RecentlyClosed,
      tabsService: this.recentlyClosedTabsService,
      windowIsMutable: false
    };
    this.actionButtons = ActionButtonFactory
      .createRecentlyClosedWindowActionButtons(this.chromeTabsService, this.recentlyClosedTabsService);
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

  toggleDisplay() {
    this.recentlyClosedTabsService.toggleSessionListDisplay();
  }

  tabClicked(chromeTab: ChromeAPITabState, event: MouseEvent) {
    this.recentlyClosedTabsService.setTabActive(chromeTab, event.ctrlKey);
  }

  closeTab(tabId: any) {
    this.recentlyClosedTabsService.removeDetachedTab(tabId);
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }
}
