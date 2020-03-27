import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SessionComponentProps, SessionListId} from '../../types/chrome-window-component-data';
import {ChromeTabsService} from '../../services/tabs/chrome-tabs.service';
import {SavedTabsService} from '../../services/tabs/saved-tabs.service';
import {RecentlyClosedTabsService} from '../../services/tabs/recently-closed-tabs.service';
import {environment} from '../../../environments/environment';
import {ImageData} from '../../types/image-data';
import {SessionListState} from '../../types/session/session-list-state';
import {Observable} from 'rxjs';
import {DragDropService} from '../../services/drag-drop.service';

@Component({
  selector: 'app-new-tab-page',
  templateUrl: './new-tab-page.component.html',
  styleUrls: ['./new-tab-page.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('fadeIn', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(800)
      ])
    ])
  ]
})
export class NewTabPageComponent implements OnInit {

  static readonly BREAKPOINTS = [
    {windowWidth: 1400, cols: 3},
    {windowWidth: 900, cols: 2},
    {windowWidth: 0, cols: 1}
  ];

  cols: number;
  backgroundPhoto: ImageData;

  // todo: separate component for each
  activeSessionState$: Observable<SessionListState>;
  savedSessionState$: Observable<SessionListState>;
  closedSessionState$: Observable<SessionListState>;

  activeSessionProps: SessionComponentProps;
  savedSessionProps: SessionComponentProps;
  recentlyClosedSessionProps: SessionComponentProps;

  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService,
              private dragDropService: DragDropService) { }

  ngOnInit(): void {
    this.cols = this.getCols(window.innerWidth);
    this.backgroundPhoto = environment.backgroundPhoto;
    this.activeSessionProps = {
      sessionListId: SessionListId.Active,
      tabsService: this.chromeTabsService,
      isMutable: true
    };
    this.savedSessionProps = {
      sessionListId: SessionListId.Saved,
      tabsService: this.savedTabsService,
      isMutable: true
    };
    this.recentlyClosedSessionProps = {
      sessionListId: SessionListId.RecentlyClosed,
      tabsService: this.recentlyClosedTabsService,
      isMutable: false
    };
    this.activeSessionState$ = this.chromeTabsService.sessionStateUpdated$.pipe(
      // todo: create more abstract service to prevent updates
      this.dragDropService.ignoreWhenDragging()
    );
    this.savedSessionState$ = this.savedTabsService.sessionStateUpdated$.pipe(
      this.dragDropService.ignoreWhenDragging()
    );
    this.closedSessionState$ = this.recentlyClosedTabsService.sessionStateUpdated$.pipe(
      this.dragDropService.ignoreWhenDragging()
    );
  }

  onResize(event) {
    this.cols = this.getCols(event.target.innerWidth);
  }

  getCols(windowWidth: number) {
    return NewTabPageComponent.BREAKPOINTS.find(breakpoint => windowWidth > breakpoint.windowWidth).cols;
  }

}
