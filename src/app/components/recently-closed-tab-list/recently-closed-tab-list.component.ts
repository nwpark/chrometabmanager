import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {WindowCategory} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {SessionListState} from '../../types/closed-session-list-state';

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
    let title = 'Recently Closed';
    if (this.sessionListState.recentlyClosedSessions.length > 0
      && this.sessionListState.layoutState.hidden) {
      title += ` (${this.sessionListState.recentlyClosedSessions.length})`;
    }
    return title;
  }

  toggleDisplay() {
    this.recentlyClosedTabsService.toggleSessionListDisplay();
  }

  setTabActive(chromeTab: ChromeAPITabState) {
    this.recentlyClosedTabsService.setTabActive(null, chromeTab);
  }

  closeTab(tabId: any) {
    this.recentlyClosedTabsService.removeDetachedTab(tabId);
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }
}
