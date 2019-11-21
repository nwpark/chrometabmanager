import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeAPITabState, RecentlyClosedSession, RecentlyClosedTab, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {WindowCategory} from '../../types/tab-list-component-data';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css']
})
export class RecentlyClosedTabListComponent implements OnInit {

  recentlyClosedSessions: RecentlyClosedSession[];
  windowCategory = WindowCategory.Active;
  hidden = false;

  constructor(public recentlyClosedTabsService: RecentlyClosedTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.recentlyClosedSessions = this.recentlyClosedTabsService.getRecentlyClosedSessions() as RecentlyClosedSession[];
    this.recentlyClosedTabsService.sessionClosed$.subscribe(recentlyClosedSessions => {
      this.recentlyClosedSessions = recentlyClosedSessions as RecentlyClosedSession[];
      this.changeDetectorRef.detectChanges();
    });
  }

  toggleDisplay() {
    this.hidden = !this.hidden;
  }

  createFakeAPIWindow(tabs: RecentlyClosedTab[]) {
    console.log(tabs.map(tab => tab.tab));
    return {id: 0, type: 'normal', tabs: tabs.map(tab => tab.tab)};
  }

  getLayoutState(closedSession: RecentlyClosedSession): WindowLayoutState {
    // const date = new Date(closedSession.window.timestamp);
    const date = new Date();
    return {
      title: `${date.toTimeString().substring(0, 5)}`,
      windowId: 0,
      hidden: false
    };
  }
}
