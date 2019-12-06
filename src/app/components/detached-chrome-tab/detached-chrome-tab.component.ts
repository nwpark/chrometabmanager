import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {AnimationState, closeTabAnimation, closeWindowAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';

@Component({
  selector: 'app-detached-chrome-tab',
  templateUrl: './detached-chrome-tab.component.html',
  styleUrls: ['./detached-chrome-tab.component.css'],
  animations: [
    trigger('close-tab', [
      transition(`* => ${AnimationState.Collapsing}`, [
        useAnimation(closeTabAnimation, {})
      ]),
      transition(`* => ${AnimationState.Closing}`, [
        useAnimation(closeWindowAnimation, {})
      ])
    ])
  ]
})
export class DetachedChromeTabComponent implements OnInit {

  static readonly NEW_TAB_URL = 'chrome://newtab/';

  @Input() chromeTab: ChromeAPITabState;
  @Input() isFirstChild: boolean;
  @Input() isLastChild: boolean;
  @Input() timestamp: number;
  @Output() draggableChromeTabClose = new EventEmitter<AnimationState>();
  @Output() draggableChromeTabClick = new EventEmitter<MouseEvent>();

  animationState = AnimationState.Complete;

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
    return !this.isLoading() && this.chromeTab.url === DetachedChromeTabComponent.NEW_TAB_URL;
  }

  isLoading(): boolean {
    return this.chromeTab.status === 'loading';
  }

  get timestampString(): string {
    return new Date(this.timestamp).toTimeString().substring(0, 5);
  }

  closeTab() {
    this.animationState = this.isFirstChild && this.isLastChild
      ? AnimationState.Closing : AnimationState.Collapsing;
    this.draggableChromeTabClose.emit(AnimationState.Closing);
    this.changeDetectorRef.detectChanges();
  }

  completeCloseAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Closing || event.toState === AnimationState.Collapsing) {
      this.draggableChromeTabClose.emit(AnimationState.Complete);
    }
  }

}
