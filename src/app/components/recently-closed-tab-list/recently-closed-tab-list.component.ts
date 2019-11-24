import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {WindowCategory} from '../../types/chrome-window-component-data';
import {ActiveTabState, ChromeAPITabState, SavedTabState} from '../../types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../../types/closed-session-list-state';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css']
})
export class RecentlyClosedTabListComponent implements OnInit {

  sessionListState: SessionListState;
  windowCategory = WindowCategory.RecentlyClosed;

  constructor(public recentlyClosedTabsService: RecentlyClosedTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.sessionListState = this.recentlyClosedTabsService.getSessionListState();
    this.recentlyClosedTabsService.sessionStateUpdated$.subscribe(sessionListState => {
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

  setTabActive(chromeTab: ActiveTabState) {
    this.recentlyClosedTabsService.setTabActive(null, chromeTab);
  }

  closeTab(tabId: number) {
    this.recentlyClosedTabsService.removeDetachedTab(tabId);
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }
}
