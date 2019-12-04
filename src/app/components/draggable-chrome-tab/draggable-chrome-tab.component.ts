import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {collapseWindowAnimation, CollapseAnimationState} from '../../animations';

@Component({
  selector: 'app-draggable-chrome-tab',
  templateUrl: './draggable-chrome-tab.component.html',
  styleUrls: ['./draggable-chrome-tab.component.css'],
  animations: [
    trigger('collapse-item', [
      transition(`* => ${CollapseAnimationState.Collapsing}`, [
        useAnimation(collapseWindowAnimation, {})
      ])
    ])
  ]
})
export class DraggableChromeTabComponent implements OnInit {

  static readonly NEW_TAB_URL = 'chrome://newtab/';

  @Input() chromeTab: ChromeAPITabState;
  @Input() timestamp: number;
  @Output() draggableChromeTabClose = new EventEmitter();
  @Output() draggableChromeTabClick = new EventEmitter<MouseEvent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() { }

  get title() {
    return this.chromeTab.title.length > 0
      ? this.chromeTab.title
      : this.chromeTab.url;
  }

  getFaviconIconUrl(): string {
    if (!this.chromeTab.favIconUrl) {
      return 'assets/chrome-favicon.png';
    }
    return this.chromeTab.favIconUrl;
  }

  shouldShowFaviconIcon(): boolean {
    return !this.isLoading() && !this.isNewTab();
  }

  isNewTab(): boolean {
    return !this.isLoading() && this.chromeTab.url === DraggableChromeTabComponent.NEW_TAB_URL;
  }

  isLoading(): boolean {
    return this.chromeTab.status === 'loading';
  }

  get timestampString(): string {
    return new Date(this.timestamp).toTimeString().substring(0, 5);
  }

  closeTab() {
    this.chromeTab.status = CollapseAnimationState.Collapsing;
    this.changeDetectorRef.detectChanges();
  }

  completeCloseAnimation(event: AnimationEvent) {
    if (event.toState === CollapseAnimationState.Collapsing) {
      this.draggableChromeTabClose.emit();
    }
  }
}
