import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {WindowCategory} from '../../types/chrome-window-component-data';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../../types/closed-session-list-state';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {ChromeTabsService} from '../../services/chrome-tabs.service';

@Component({
  selector: 'app-recently-closed-tab-list',
  templateUrl: './recently-closed-tab-list.component.html',
  styleUrls: ['./recently-closed-tab-list.component.css']
})
export class RecentlyClosedTabListComponent implements OnInit {

  sessionListState: SessionListState;
  windowCategory = WindowCategory.RecentlyClosed;
  actionButtons: ActionButton[];

  constructor(public recentlyClosedTabsService: RecentlyClosedTabsService,
              private chromeTabsService: ChromeTabsService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.sessionListState = this.recentlyClosedTabsService.getSessionListState();
    this.initActionButtons();
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

  setTabActive(chromeTab: ChromeAPITabState) {
    this.recentlyClosedTabsService.setTabActive(null, chromeTab);
  }

  closeTab(tabId: any) {
    this.recentlyClosedTabsService.removeDetachedTab(tabId);
  }

  clear() {
    this.recentlyClosedTabsService.clear();
  }

  initActionButtons() {
    this.actionButtons = [
      ActionButtonFactory.createOpenButton(chromeWindow => {
        this.chromeTabsService.createWindow(chromeWindow);
      }),
      ActionButtonFactory.createMinimizeButton(chromeWindow => {
        this.recentlyClosedTabsService.toggleWindowDisplay(chromeWindow.id);
      }),
      ActionButtonFactory.createCloseButton(chromeWindow => {
        this.recentlyClosedTabsService.removeWindow(chromeWindow.id);
      })
    ];
  }
}
