import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SessionComponentProps, SessionListId} from '../../types/chrome-window-component-data';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {RecentlyClosedTabsService} from '../../services/recently-closed-tabs.service';
import {environment} from '../../../environments/environment';
import {PhotoMetadata} from '../../types/photo-metadata';

@Component({
  selector: 'app-new-tab-page',
  templateUrl: './new-tab-page.component.html',
  styleUrls: ['./new-tab-page.component.css'],
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

  activeSessionProps: SessionComponentProps;
  savedSessionProps: SessionComponentProps;
  recentlyClosedSessionProps: SessionComponentProps;

  backgroundPhotoMetadata: PhotoMetadata;

  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private recentlyClosedTabsService: RecentlyClosedTabsService) { }

  ngOnInit(): void {
    this.cols = this.getCols(window.innerWidth);
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
    this.backgroundPhotoMetadata = environment.backgroundPhotoMetadata;
  }

  onResize(event) {
    this.cols = this.getCols(event.target.innerWidth);
  }

  getCols(windowWidth: number) {
    return NewTabPageComponent.BREAKPOINTS.find(breakpoint => windowWidth > breakpoint.windowWidth).cols;
  }

}
