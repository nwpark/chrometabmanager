import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ChromeWindowComponentProps, WindowListId} from '../../types/chrome-window-component-data';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {SavedTabsService} from '../../services/saved-tabs.service';

@Component({
  selector: 'app-new-tab-page',
  templateUrl: './new-tab-page.component.html',
  styleUrls: ['./new-tab-page.component.css'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('fadeIn', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(200)
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

  activeWindowProps: ChromeWindowComponentProps;
  savedWindowProps: ChromeWindowComponentProps;

  constructor(private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService) { }

  ngOnInit(): void {
    this.cols = this.getCols(window.innerWidth);
    this.activeWindowProps = {
      windowListId: WindowListId.Active,
      tabsService: this.chromeTabsService,
      windowIsMutable: true
    };
    this.savedWindowProps = {
      windowListId: WindowListId.Saved,
      tabsService: this.savedTabsService,
      windowIsMutable: true
    };
  }

  onResize(event) {
    this.cols = this.getCols(event.target.innerWidth);
  }

  getCols(windowWidth: number) {
    return NewTabPageComponent.BREAKPOINTS.find(breakpoint => windowWidth > breakpoint.windowWidth).cols;
  }

}
